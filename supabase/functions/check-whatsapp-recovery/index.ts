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

    // Find registrations older than 2 days that:
    // - haven't had whatsapp sent
    // - payment not completed
    // - have a phone number
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const { data: eligibleRegs, error } = await supabase
      .from("registration_status")
      .select("id, phone, full_name, preferred_language")
      .eq("whatsapp_recovery_sent", false)
      .eq("payment_completed", false)
      .not("phone", "is", null)
      .lt("created_at", twoDaysAgo);

    if (error) {
      throw new Error(`Query error: ${error.message}`);
    }

    if (!eligibleRegs || eligibleRegs.length === 0) {
      console.log("[CRON-WA] No eligible registrations found.");
      return new Response(
        JSON.stringify({ processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[CRON-WA] Found ${eligibleRegs.length} registrations to send WhatsApp.`);

    let sent = 0;
    let skipped = 0;

    for (const reg of eligibleRegs) {
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/send-whatsapp-recovery`,
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
          console.log(`[CRON-WA] Sent WhatsApp to ${reg.phone}`);
        } else if (result.skipped) {
          skipped++;
          console.log(`[CRON-WA] Skipped ${reg.phone}: ${result.reason}`);
        } else {
          console.error(`[CRON-WA] Failed for ${reg.phone}:`, result.error);
        }
      } catch (err) {
        console.error(`[CRON-WA] Error processing ${reg.phone}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ processed: eligibleRegs.length, sent, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-whatsapp-recovery error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
