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

    if (!identifier || !pin || pin.length !== 6) {
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

    // Find matching PIN
    const { data: record } = await supabase
      .from("password_reset_pins")
      .select("*")
      .eq("user_identifier", trimmed)
      .eq("pin", pin)
      .eq("used", false)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!record) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_pin" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Mark as verified
    await supabase
      .from("password_reset_pins")
      .update({ verified: true })
      .eq("id", record.id);

    return new Response(
      JSON.stringify({ success: true, reset_token: record.reset_token }),
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
