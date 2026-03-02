import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string" || identifier.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_identifier" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const trimmed = identifier.trim().toLowerCase();

    // Look up user by username or email in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, email, username")
      .or(`username.ilike.${trimmed},email.ilike.${trimmed}`)
      .limit(1)
      .single();

    if (!profile || !profile.email) {
      // Don't reveal whether user exists — always say "sent"
      return new Response(
        JSON.stringify({ success: true, message: "pin_sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalidate any existing unused PINs for this user
    await supabase
      .from("password_reset_pins")
      .update({ used: true })
      .eq("user_id", profile.user_id)
      .eq("used", false);

    // Generate and store PIN
    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase.from("password_reset_pins").insert({
      user_id: profile.user_id,
      user_identifier: trimmed,
      email: profile.email,
      pin,
      expires_at: expiresAt,
    });

    // TODO: Send email with PIN
    // For now, log it for testing
    console.log(`[forgot-password] PIN for ${profile.email}: ${pin}`);

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
