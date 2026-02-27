import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find incomplete registrations older than 1 hour that haven't been emailed
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: incompleteRegs, error } = await supabase
      .from("registration_status")
      .select("id, email, full_name")
      .eq("recovery_email_sent", false)
      .lt("created_at", oneHourAgo)
      .or("franchise_selected.eq.false,payment_completed.eq.false");

    if (error) {
      throw new Error(`Query error: ${error.message}`);
    }

    if (!incompleteRegs || incompleteRegs.length === 0) {
      console.log("[CRON] No incomplete registrations found.");
      return new Response(
        JSON.stringify({ processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[CRON] Found ${incompleteRegs.length} incomplete registrations to process.`);

    let sent = 0;
    let skipped = 0;

    for (const reg of incompleteRegs) {
      try {
        // Call the send-recovery-email function
        const res = await fetch(
          `${supabaseUrl}/functions/v1/send-recovery-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({ registrationId: reg.id }),
          }
        );

        const result = await res.json();

        if (result.success) {
          sent++;
          console.log(`[CRON] Sent recovery email to ${reg.email}`);
        } else if (result.skipped) {
          skipped++;
          console.log(`[CRON] Skipped ${reg.email}: ${result.reason}`);
        } else {
          console.error(`[CRON] Failed for ${reg.email}:`, result.error);
        }
      } catch (err) {
        console.error(`[CRON] Error processing ${reg.email}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ processed: incompleteRegs.length, sent, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-incomplete-registrations error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
