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
    const { reset_token, new_password } = await req.json();

    if (!reset_token || !new_password || new_password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_input" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();

    const { data: record, error: lookupError } = await supabase
      .from("password_reset_pins")
      .select("id, user_id, expires_at, used, verified")
      .eq("reset_token", reset_token)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("[reset-password] Lookup error:", lookupError);
      throw lookupError;
    }

    if (!record) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_token" }),
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
        JSON.stringify({ success: false, error: "expired_token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (record.used || !record.verified) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      record.user_id,
      { password: new_password }
    );

    if (updateError) {
      console.error("[reset-password] Update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "update_failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const { error: invalidateError } = await supabase
      .from("password_reset_pins")
      .update({ used: true })
      .eq("user_id", record.user_id)
      .eq("used", false);

    if (invalidateError) {
      console.error("[reset-password] Invalidate error:", invalidateError);
      throw invalidateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[reset-password] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "server_error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
