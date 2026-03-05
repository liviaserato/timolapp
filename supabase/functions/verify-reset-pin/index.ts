import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, pin } = await req.json();

    if (!identifier || !pin || typeof pin !== "string" || pin.length !== 6) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_input" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const trimmed = identifier.trim().toLowerCase();
    const now = new Date().toISOString();

    const { data: record, error: lookupError } = await supabase
      .from("password_reset_pins")
      .select("id, reset_token, expires_at, used, verified")
      .eq("user_identifier", trimmed)
      .eq("pin", pin)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("[verify-reset-pin] Lookup error:", lookupError);
      throw lookupError;
    }

    if (!record) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_pin" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (record.expires_at < now) {
      await supabase
        .from("password_reset_pins")
        .update({ used: true })
        .eq("id", record.id)
        .eq("used", false);

      return new Response(
        JSON.stringify({ success: false, error: "pin_expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (record.used && !record.verified) {
      return new Response(
        JSON.stringify({ success: false, error: "replaced_pin" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (record.used || record.verified) {
      return new Response(
        JSON.stringify({ success: false, error: "pin_used" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { data: verifiedRecord, error: verifyError } = await supabase
      .from("password_reset_pins")
      .update({ verified: true })
      .eq("id", record.id)
      .eq("used", false)
      .eq("verified", false)
      .select("reset_token")
      .maybeSingle();

    if (verifyError || !verifiedRecord?.reset_token) {
      console.error("[verify-reset-pin] Verify error:", verifyError);
      return new Response(
        JSON.stringify({ success: false, error: "invalid_pin" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, reset_token: verifiedRecord.reset_token }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[verify-reset-pin] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "server_error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
