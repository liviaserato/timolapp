import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Cancel registrations older than 30 days
    const { data: cancelled, error: cancelError } = await supabaseAdmin
      .from("registration_status")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .select("id");

    if (cancelError) {
      console.error("Cancel error:", cancelError);
    } else {
      console.log(`Cancelled ${cancelled?.length ?? 0} registrations older than 30 days.`);
    }

    // 2. Complete registrations with payment confirmed
    const { data: completed, error: completeError } = await supabaseAdmin
      .from("registration_status")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("status", "pending")
      .eq("payment_completed", true)
      .select("id");

    if (completeError) {
      console.error("Complete error:", completeError);
    } else {
      console.log(`Completed ${completed?.length ?? 0} registrations with payment confirmed.`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        cancelled: cancelled?.length ?? 0,
        completed: completed?.length ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
