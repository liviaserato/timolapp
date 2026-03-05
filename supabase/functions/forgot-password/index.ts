import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const timolHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (compatible; TimolApp/1.0)",
  Origin: "https://timolsystem.com.br",
  Referer: "https://timolsystem.com.br/",
};

type ForgotPasswordAction = "validate-username" | "validate-email" | "send-pin";

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visiblePart = localPart.slice(0, 2);
  const hiddenLength = Math.max(localPart.length - visiblePart.length, 4);

  return `${visiblePart}${"*".repeat(hiddenLength)}@${domain}`;
}

function parseExistsValue(payload: unknown): boolean | null {
  if (!payload || typeof payload !== "object") return null;

  const exists = (payload as { exists?: unknown }).exists;
  if (typeof exists === "boolean") return exists;
  if (typeof exists === "string") return exists.toLowerCase() === "true";

  const person = (payload as { person?: unknown }).person;
  if (Array.isArray(person)) return person.length > 0;

  return null;
}

async function checkExternalUsernameExists(username: string): Promise<boolean> {
  const url = new URL("https://www.timolweb.com.br/api/people/username-check");
  url.searchParams.set("username", username);

  const response = await fetch(url.toString(), {
    headers: timolHeaders,
  });

  if (!response.ok) {
    throw new Error(`upstream_${response.status}`);
  }

  const payload = await response.json();
  const exists = parseExistsValue(payload);

  if (exists === null) {
    throw new Error("unexpected_response");
  }

  return exists;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const username =
      typeof body.username === "string"
        ? normalizeValue(body.username)
        : typeof body.identifier === "string"
          ? normalizeValue(body.identifier)
          : "";
    const email = typeof body.email === "string" ? normalizeValue(body.email) : "";
    const action =
      typeof body.action === "string"
        ? (body.action as ForgotPasswordAction)
        : email
          ? "send-pin"
          : "validate-username";

    if (!username || username.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_identifier" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email, username")
      .ilike("username", username)
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error("[forgot-password] Profile lookup error:", profileError);
      throw profileError;
    }

    let exists = false;

    try {
      exists = await checkExternalUsernameExists(username);
    } catch (validationError) {
      console.warn("[forgot-password] External validation fallback:", validationError);
      exists = Boolean(profile?.user_id);
    }

    if (!exists || !profile?.user_id || !profile.username) {
      return new Response(
        JSON.stringify({ success: false, error: "not_found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const normalizedProfileEmail = profile.email ? normalizeValue(profile.email) : "";

    if (!normalizedProfileEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "email_unavailable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }

    if (action === "validate-username") {
      return new Response(
        JSON.stringify({
          success: true,
          masked_email: maskEmail(normalizedProfileEmail),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "email_required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (email !== normalizedProfileEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "email_mismatch" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (action === "validate-email") {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action !== "send-pin") {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_action" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { error: invalidateError } = await supabase
      .from("password_reset_pins")
      .update({ used: true })
      .eq("user_id", profile.user_id)
      .eq("used", false);

    if (invalidateError) {
      console.error("[forgot-password] PIN invalidation error:", invalidateError);
      throw invalidateError;
    }

    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("password_reset_pins").insert({
      user_id: profile.user_id,
      user_identifier: username,
      email: normalizedProfileEmail,
      pin,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("[forgot-password] PIN insert error:", insertError);
      throw insertError;
    }

    console.log(
      `[forgot-password] Email sending stub ready for noreply@timol.com.br -> ${normalizedProfileEmail}; PIN: ${pin}; expires_at: ${expiresAt}`
    );

    return new Response(
      JSON.stringify({ success: true, message: "pin_sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[forgot-password] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "server_error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
