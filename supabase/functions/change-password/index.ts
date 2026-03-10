import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ReauthenticationEmail } from "../_shared/email-templates/reauthentication.tsx";
import { PasswordChangedEmail } from "../_shared/email-templates/password-changed.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PIN_EXPIRY_MINUTES = 5;

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action as string; // "send-pin" | "change"
    const userId = body.userId as string;

    if (!userId) {
      return json({ success: false, error: "user_id_required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch profile for email and name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email, full_name, username")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("[change-password] Profile lookup error:", profileError);
      return json({ success: false, error: "profile_not_found" }, 404);
    }

    if (!profile.email) {
      return json({ success: false, error: "email_unavailable" }, 409);
    }

    // ─── SEND PIN ────────────────────────────────────────────────
    if (action === "send-pin") {
      // Invalidate existing unused PINs
      await supabase
        .from("password_reset_pins")
        .update({ used: true })
        .eq("user_id", userId)
        .eq("used", false);

      const pin = generatePin();
      const expiresAt = new Date(
        Date.now() + PIN_EXPIRY_MINUTES * 60 * 1000
      ).toISOString();

      const { error: insertError } = await supabase
        .from("password_reset_pins")
        .insert({
          user_id: userId,
          user_identifier: profile.username || profile.email,
          email: profile.email,
          pin,
          expires_at: expiresAt,
        });

      if (insertError) {
        console.error("[change-password] PIN insert error:", insertError);
        throw insertError;
      }

      // Render PIN email
      const html = await renderAsync(
        React.createElement(ReauthenticationEmail, { token: pin })
      );

      const subject = `${pin} | Código para alterar sua senha Timol`;

      console.log(
        `[change-password] PIN email ready: ${profile.email}; subject: ${subject}; PIN: ${pin}; expires: ${expiresAt}; html_size: ${html.length}`
      );

      return json({ success: true, message: "pin_sent" });
    }

    // ─── CHANGE PASSWORD ─────────────────────────────────────────
    if (action === "change") {
      const pin = body.pin as string;
      const newPassword = body.newPassword as string;

      if (!pin || !newPassword) {
        return json({ success: false, error: "pin_and_password_required" }, 400);
      }

      if (newPassword.length < 6) {
        return json({ success: false, error: "password_too_short" }, 400);
      }

      // Verify PIN
      const { data: pinRecord, error: pinError } = await supabase
        .from("password_reset_pins")
        .select("*")
        .eq("user_id", userId)
        .eq("pin", pin)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pinError || !pinRecord) {
        return json({ success: false, error: "invalid_or_expired_pin" }, 400);
      }

      // Mark PIN as used
      await supabase
        .from("password_reset_pins")
        .update({ used: true })
        .eq("id", pinRecord.id);

      // Update password via Supabase Auth Admin
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (updateError) {
        console.error("[change-password] Password update error:", updateError);
        return json({ success: false, error: "update_failed" }, 500);
      }

      // Send password-changed notification email
      const fullName = profile.full_name || "Usuário";
      const notificationHtml = await renderAsync(
        React.createElement(PasswordChangedEmail, { fullName })
      );

      const notificationSubject = "Sua senha foi alterada com sucesso";

      console.log(
        `[change-password] Notification email ready: ${profile.email}; subject: ${notificationSubject}; html_size: ${notificationHtml.length}`
      );

      return json({ success: true, message: "password_changed" });
    }

    return json({ success: false, error: "invalid_action" }, 400);
  } catch (err) {
    console.error("[change-password] Error:", err);
    return json({ success: false, error: "server_error" }, 500);
  }
});
