import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Published app URL — update when domain changes
const SITE_URL = "https://cadastro-nova-franquia-timol.lovable.app";
const LOGO_URL = `${SITE_URL}/favicon.svg`;
const WHATSAPP_NUMBER = "5534991258000";

// Placeholder YouTube video URL — replace with real video later
const VIDEO_URL = "https://www.youtube.com/watch?v=PLACEHOLDER";

function buildEmailHtml(data: {
  fullName: string;
  userId: string;
  document: string;
  sponsorName: string;
  sponsorId: string;
  continueToken: string;
}): string {
  const continueUrl = `${SITE_URL}/continue/${data.continueToken}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá, meu nome é ${data.fullName}, meu ID é ${data.userId}. Preciso de ajuda para concluir meu cadastro.`
  )}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu cadastro na Timol já está quase pronto 🚀</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#1e293b;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${LOGO_URL}" alt="Timol" style="height:48px;" />
    </div>

    <!-- Greeting -->
    <h1 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 16px;">
      Olá, ${data.fullName}!
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#334155;">
      Vimos que você já iniciou seu cadastro na Timol e seu ID foi gerado com sucesso. 🎉
    </p>

    <p style="margin:0 0 8px;font-size:15px;color:#334155;font-weight:600;">
      Aqui estão seus dados para continuar de onde parou:
    </p>

    <!-- Data Summary Card -->
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:16px 0 24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#64748b;width:120px;">ID:</td>
          <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;">${data.userId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#64748b;">CPF:</td>
          <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;">${data.document}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#64748b;">Patrocinador:</td>
          <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;">${data.sponsorName} (ID ${data.sponsorId})</td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 8px;font-size:15px;color:#334155;">
      Falta só mais um passo para ativar sua franquia e começar sua jornada com a Timol.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#334155;">
      Se você ainda não escolheu sua franquia ou não concluiu o pagamento, pode retomar exatamente de onde parou clicando no botão abaixo:
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0;">
      <a href="${continueUrl}" style="display:inline-block;background-color:#0f2b4a;color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;">
        CONTINUAR CADASTRO →
      </a>
    </div>

    <!-- Video Section -->
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:24px;margin:32px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:16px;color:#1e293b;font-weight:600;">
        🎥 Quer entender melhor como funciona a Timol na prática?
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#64748b;">
        Assista ao vídeo abaixo com depoimentos reais de franqueados que já estão vivendo essa experiência:
      </p>
      <!-- VIDEO PLACEHOLDER — replace URL when final video is ready -->
      <a href="${VIDEO_URL}" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        ▶ Assistir vídeo
      </a>
    </div>

    <!-- Help / WhatsApp -->
    <div style="text-align:center;margin:32px 0;">
      <p style="margin:0 0 12px;font-size:14px;color:#64748b;">
        Se tiver qualquer dúvida, estamos por aqui para te ajudar.<br/>
        Se preferir, fale diretamente com nossa equipe pelo WhatsApp:
      </p>
      <a href="${whatsappUrl}" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        💬 Falar no WhatsApp
      </a>
    </div>

    <!-- Closing -->
    <div style="border-top:1px solid #e2e8f0;padding-top:24px;margin-top:32px;">
      <p style="margin:0 0 4px;font-size:15px;color:#334155;">
        Estamos felizes por você ter começado essa jornada.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;">Conte com a gente!</p>
      <p style="margin:0;font-size:15px;color:#334155;">
        Abraços,<br/>
        <strong>Equipe Timol</strong>
      </p>
    </div>

  </div>
</body>
</html>`;
}

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

    // Don't send if already sent or registration is complete
    if (reg.recovery_email_sent || (reg.franchise_selected && reg.payment_completed)) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Already sent or registration complete" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build HTML
    const html = buildEmailHtml({
      fullName: reg.full_name || "Usuário",
      userId: reg.sponsor_id ? reg.sponsor_id : "—",
      document: reg.document || "—",
      sponsorName: reg.sponsor_name || "—",
      sponsorId: reg.sponsor_id || "—",
      continueToken: reg.continue_token,
    });

    // =====================================================
    // 📧 EMAIL SENDING PLACEHOLDER
    // When Resend API key is configured, uncomment below:
    //
    // const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    // const emailRes = await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${RESEND_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     from: "Timol <noreply@yourdomain.com>",
    //     to: [reg.email],
    //     subject: "Seu cadastro na Timol já está quase pronto 🚀",
    //     html: html,
    //   }),
    // });
    //
    // if (!emailRes.ok) {
    //   const errBody = await emailRes.text();
    //   throw new Error(`Resend error: ${errBody}`);
    // }
    // =====================================================

    console.log(`[RECOVERY EMAIL] Would send to: ${reg.email}`);
    console.log(`[RECOVERY EMAIL] Subject: Seu cadastro na Timol já está quase pronto 🚀`);
    console.log(`[RECOVERY EMAIL] Continue URL: ${SITE_URL}/continue/${reg.continue_token}`);

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
