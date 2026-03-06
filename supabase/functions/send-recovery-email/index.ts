import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { PendingRegistrationEmail } from "../_shared/email-templates/pending-registration.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://cadastro-nova-franquia-timol.lovable.app";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: reg, error: regError } = await supabase
      .from("registration_status")
      .select("*")
      .eq("id", registrationId)
      .single();

    if (regError || !reg) {
      return new Response(
        JSON.stringify({ error: "Registration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Don't send if already sent or registration is complete
    if (reg.recovery_email_sent || (reg.franchise_selected && reg.payment_completed)) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Already sent or registration complete" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const continueUrl = `${SITE_URL}/continue/${reg.continue_token}`;

    const html = await renderAsync(
      React.createElement(PendingRegistrationEmail, {
        fullName: reg.full_name || "Usuário",
        franchiseId: reg.franchise_id || "—",
        sponsorName: reg.sponsor_name || "—",
        sponsorId: reg.sponsor_id || "—",
        continueUrl,
      })
    );

    const subject = "Falta pouco para ativar sua franquia Timol";

    console.log(`[RECOVERY EMAIL] Would send to: ${reg.email}`);
    console.log(`[RECOVERY EMAIL] Subject: ${subject}`);
    console.log(`[RECOVERY EMAIL] Continue URL: ${continueUrl}`);

    // Mark as sent
    await supabase
      .from("registration_status")
      .update({
        recovery_email_sent: true,
        recovery_email_sent_at: new Date().toISOString(),
      })
      .eq("id", registrationId);

    return new Response(
      JSON.stringify({ success: true, email: reg.email }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-recovery-email error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
