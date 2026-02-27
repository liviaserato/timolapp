import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Placeholder — replace with actual WhatsApp API integration later
const WHATSAPP_API_URL = "https://api.placeholder.whatsapp.com/v1/messages";
const WHATSAPP_FROM_NUMBER = "PLACEHOLDER_NUMBER";

const SITE_URL = "https://cadastro-nova-franquia-timol.lovable.app";

interface MessageTemplates {
  [lang: string]: (name: string, continueUrl: string) => string;
}

const templates: MessageTemplates = {
  pt: (name: string, continueUrl: string) =>
    `Olá, ${name}! 👋\n\nVimos que você iniciou seu cadastro na Timol, mas ainda não concluiu. Falta pouco para ativar sua franquia!\n\nClique aqui para continuar de onde parou:\n${continueUrl}\n\nSe precisar de ajuda, estamos por aqui! 💬\n\nEquipe Timol`,

  en: (name: string, continueUrl: string) =>
    `Hi, ${name}! 👋\n\nWe noticed you started your registration with Timol but haven't finished yet. You're almost there!\n\nClick here to continue where you left off:\n${continueUrl}\n\nIf you need help, we're here for you! 💬\n\nTimol Team`,

  es: (name: string, continueUrl: string) =>
    `¡Hola, ${name}! 👋\n\nNotamos que iniciaste tu registro en Timol, pero aún no lo completaste. ¡Falta muy poco para activar tu franquicia!\n\nHaz clic aquí para continuar desde donde lo dejaste:\n${continueUrl}\n\nSi necesitas ayuda, ¡estamos aquí! 💬\n\nEquipo Timol`,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch registration data
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

    // Don't send if already sent, payment complete, or no phone
    if (reg.whatsapp_recovery_sent) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Already sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (reg.payment_completed) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Payment already completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reg.phone) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "No phone number" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build message in the user's preferred language
    const lang = reg.preferred_language || "pt";
    const templateFn = templates[lang] || templates.pt;
    const continueUrl = `${SITE_URL}/continue/${reg.continue_token}`;
    const name = reg.full_name || "Usuário";
    const message = templateFn(name, continueUrl);

    // Clean phone number (digits only)
    const phone = reg.phone.replace(/\D/g, "");

    // =====================================================
    // 📱 WHATSAPP SENDING PLACEHOLDER
    // When WhatsApp Business API is configured, uncomment below:
    //
    // const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY")!;
    // const waRes = await fetch(WHATSAPP_API_URL, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${WHATSAPP_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     messaging_product: "whatsapp",
    //     to: phone,
    //     type: "text",
    //     text: { body: message },
    //   }),
    // });
    //
    // if (!waRes.ok) {
    //   const errBody = await waRes.text();
    //   throw new Error(`WhatsApp API error: ${errBody}`);
    // }
    // =====================================================

    console.log(`[WHATSAPP RECOVERY] Would send to: ${phone}`);
    console.log(`[WHATSAPP RECOVERY] Language: ${lang}`);
    console.log(`[WHATSAPP RECOVERY] Message: ${message}`);

    // Mark as sent
    await supabase
      .from("registration_status")
      .update({
        whatsapp_recovery_sent: true,
        whatsapp_recovery_sent_at: new Date().toISOString(),
      })
      .eq("id", registrationId);

    return new Response(
      JSON.stringify({ success: true, phone }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-whatsapp-recovery error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
