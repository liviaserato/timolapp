import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://cadastro-nova-franquia-timol.lovable.app";
const WHATSAPP_NUMBER = "5534991258000";
const VIDEO_URL = "https://www.youtube.com/watch?v=PLACEHOLDER";
const VIDEO_THUMB = `https://img.youtube.com/vi/PLACEHOLDER/hqdefault.jpg`;
const FROM_EMAIL = "Timol <contato@timol.com.br>";

type Lang = "pt" | "en" | "es";

/* ─── Minimal i18n for edge function ─── */
const i18n: Record<string, Record<Lang, string>> = {
  pendingSubject: {
    pt: "🚀 Falta pouco... finalize aqui seu cadastro Timol.",
    en: "🚀 Almost there... finish your Timol registration here.",
    es: "🚀 Casi listo... finaliza aquí tu registro Timol.",
  },
  pendingGreeting: { pt: "Olá, {{name}}!", en: "Hello, {{name}}!", es: "¡Hola, {{name}}!" },
  pendingIntro: {
    pt: "Vimos que você já iniciou seu cadastro na Timol e seu ID foi gerado com sucesso.",
    en: "We noticed you already started your Timol registration and your ID was generated successfully.",
    es: "Vimos que ya iniciaste tu registro en Timol y tu ID fue generado con éxito.",
  },
  pendingDataTitle: {
    pt: "Aqui estão seus dados para continuar de onde parou:",
    en: "Here is your data to continue where you left off:",
    es: "Aquí están tus datos para continuar donde lo dejaste:",
  },
  labelId: { pt: "ID:", en: "ID:", es: "ID:" },
  labelName: { pt: "Nome:", en: "Name:", es: "Nombre:" },
  labelDocBr: { pt: "CPF:", en: "CPF:", es: "CPF:" },
  labelDocForeign: { pt: "Documento:", en: "Document:", es: "Documento:" },
  labelSponsor: { pt: "Patrocinador:", en: "Sponsor:", es: "Patrocinador:" },
  pendingAlmost: {
    pt: "Falta só mais um passo para ativar sua franquia e começar sua jornada com a Timol.",
    en: "Just one more step to activate your franchise and start your journey with Timol.",
    es: "Solo falta un paso más para activar tu franquicia y comenzar tu camino con Timol.",
  },
  pendingResume: {
    pt: "Se você ainda não escolheu sua franquia ou não concluiu o pagamento, pode retomar exatamente de onde parou clicando no botão abaixo:",
    en: "If you haven't chosen your franchise or completed payment yet, you can pick up exactly where you left off by clicking the button below:",
    es: "Si aún no elegiste tu franquicia o no completaste el pago, puedes retomar exactamente donde lo dejaste haciendo clic en el botón de abajo:",
  },
  pendingCta: { pt: "CONTINUAR CADASTRO →", en: "CONTINUE REGISTRATION →", es: "CONTINUAR REGISTRO →" },
  videoTitle: { pt: "🎥 Veja como a Timol funciona na prática", en: "🎥 See how Timol works in practice", es: "🎥 Mira cómo funciona Timol en la práctica" },
  videoDesc: {
    pt: "Depoimentos reais de franqueados que já vivem essa experiência:",
    en: "Real testimonials from franchisees already living this experience:",
    es: "Testimonios reales de franquiciados que ya viven esta experiencia:",
  },
  videoBtn: { pt: "▶ Assistir vídeo", en: "▶ Watch video", es: "▶ Ver video" },
  whatsappHelp: {
    pt: "Se tiver qualquer dúvida, estamos por aqui para te ajudar.<br/> Fale diretamente com nossa equipe pelo WhatsApp:",
    en: "If you have any questions, we're here to help.<br/> Talk directly to our team on WhatsApp:",
    es: "Si tienes alguna duda, estamos aquí para ayudarte.<br/> Habla directamente con nuestro equipo por WhatsApp:",
  },
  whatsappBtn: { pt: "💬 Falar no WhatsApp", en: "💬 Chat on WhatsApp", es: "💬 Hablar por WhatsApp" },
  closingHappy: {
    pt: "Estamos felizes por você ter começado essa jornada. Conte com a gente!",
    en: "We're happy you started this journey. Count on us!",
    es: "Estamos felices de que hayas comenzado este camino. ¡Cuenta con nosotros!",
  },
  closingSign: { pt: "Abraços,", en: "Best regards,", es: "Abrazos," },
  team: { pt: "Equipe Timol", en: "Timol Team", es: "Equipo Timol" },
};

function txt(lang: Lang, key: string): string {
  return i18n[key]?.[lang] ?? i18n[key]?.pt ?? key;
}

function countryFlag(code?: string): string {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(...upper.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function dataRow(label: string, value: string): string {
  return `<tr><td style="padding:4px 0;padding-right:10px;font-size:14px;color:#64748b;width:120px;vertical-align:top;">${label}</td><td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;vertical-align:top;">${value}</td></tr>`;
}

function buildEmailHtml(data: {
  fullName: string;
  userId: string;
  document: string;
  sponsorName: string;
  sponsorId: string;
  continueToken: string;
  language: Lang;
  isForeigner?: boolean;
  countryCode?: string;
  countryName?: string;
}): string {
  const lang = data.language;
  const logoUrl = `${SITE_URL}/favicon-timol-azul-escuro.svg`;
  const continueUrl = `${SITE_URL}/continue/${data.continueToken}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá, meu nome é ${data.fullName}, meu ID é ${data.userId}. Preciso de ajuda para concluir meu cadastro.`
  )}`;

  const docLbl = data.isForeigner ? txt(lang, "labelDocForeign") : txt(lang, "labelDocBr");
  let docVal = data.document;
  if (data.isForeigner && data.countryCode) {
    const flag = countryFlag(data.countryCode);
    const aria = data.countryName ? ` aria-label="${data.countryName}"` : "";
    if (flag) docVal = `${data.document} <span${aria} style="font-size:16px;vertical-align:middle;">${flag}</span>`;
  }

  const htmlLang = lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en";

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${txt(lang, "pendingSubject")}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#1e293b;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:left;margin-bottom:32px;">
      <img src="${logoUrl}" alt="Timol" style="height:48px;" />
    </div>

    <h1 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 16px;">
      ${txt(lang, "pendingGreeting").replace("{{name}}", data.fullName)}
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:#334155;">${txt(lang, "pendingIntro")}</p>
    <p style="margin:0 0 8px;font-size:15px;color:#334155;font-weight:600;">${txt(lang, "pendingDataTitle")}</p>

    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:16px 0 24px;">
      <table style="width:100%;border-collapse:collapse;">
        ${dataRow(txt(lang, "labelId"), data.userId)}
        ${dataRow(txt(lang, "labelName"), data.fullName)}
        ${dataRow(docLbl, docVal)}
        ${dataRow(txt(lang, "labelSponsor"), `${data.sponsorName} (ID ${data.sponsorId})`)}
      </table>
    </div>

    <p style="margin:0 0 8px;font-size:15px;color:#334155;">${txt(lang, "pendingAlmost")}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#334155;">${txt(lang, "pendingResume")}</p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${continueUrl}" style="display:inline-block;background-color:#0f2b4a;color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.5px;">
        ${txt(lang, "pendingCta")}
      </a>
    </div>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:24px;margin:32px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:16px;color:#1e293b;font-weight:600;">${txt(lang, "videoTitle")}</p>
      <p style="margin:0 0 16px;font-size:14px;color:#64748b;">${txt(lang, "videoDesc")}</p>
      <div style="display:inline-block;overflow:hidden;border-radius:8px;max-width:480px;width:100%;">
        <a href="${VIDEO_URL}" target="_blank" style="display:block;text-decoration:none;">
          <img src="${VIDEO_THUMB}" alt="${txt(lang, "videoBtn")}" style="width:100%;display:block;border-radius:8px 8px 0 0;" />
        </a>
        <a href="${VIDEO_URL}" target="_blank" style="display:block;background-color:#dc2626;color:#ffffff;padding:12px 32px;text-decoration:none;font-weight:700;font-size:14px;text-align:center;border-radius:0 0 8px 8px;">
          ${txt(lang, "videoBtn")}
        </a>
      </div>
    </div>

    <div style="text-align:center;margin:32px 0;">
      <p style="margin:0 0 12px;font-size:14px;color:#64748b;">${txt(lang, "whatsappHelp")}</p>
      <a href="${whatsappUrl}" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        ${txt(lang, "whatsappBtn")}
      </a>
    </div>

    <div style="border-top:1px solid #e2e8f0;padding-top:24px;margin-top:32px;">
      <p style="margin:0 0 16px;font-size:15px;color:#334155;">${txt(lang, "closingHappy")}</p>
      <p style="margin:0;font-size:15px;color:#334155;">
        ${txt(lang, "closingSign")}<br/><strong>${txt(lang, "team")}</strong>
      </p>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;">
        <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;font-weight:600;">Timol Produtos Magnéticos</p>
        <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
          📍 <a href="https://maps.app.goo.gl/fUbcB57rcLuZG69f9" target="_blank" style="color:#94a3b8;text-decoration:none;">Uberlândia – MG, Brasil</a>
        </p>
        <p style="margin:0;font-size:12px;color:#94a3b8;">
          ✉️ <a href="mailto:contato@timol.com.br" style="color:#94a3b8;text-decoration:none;">contato@timol.com.br</a>
        </p>
      </div>
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

    const lang = (reg.preferred_language as Lang) || "pt";

    // Detect foreigner: country exists and is not Brazil
    const isForeigner = !!reg.country && !["BR", "BRA", "Brasil", "Brazil"].includes(reg.country);

    const html = buildEmailHtml({
      fullName: reg.full_name || "Usuário",
      userId: reg.user_display_id || "—",
      document: reg.document || "—",
      sponsorName: reg.sponsor_name || "—",
      sponsorId: reg.sponsor_id || "—",
      continueToken: reg.continue_token,
      language: lang,
      isForeigner,
      countryCode: isForeigner ? reg.country : undefined,
      countryName: isForeigner ? reg.country : undefined,
    });

    const subject = txt(lang, "pendingSubject");

    // =====================================================
    // 📧 EMAIL SENDING — Resend
    // Uncomment when Resend API key + domain are configured:
    //
    // const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    // const emailRes = await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${RESEND_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     from: FROM_EMAIL,
    //     to: [reg.email],
    //     subject,
    //     html,
    //   }),
    // });
    //
    // if (!emailRes.ok) {
    //   const errBody = await emailRes.text();
    //   throw new Error(`Resend error: ${errBody}`);
    // }
    // =====================================================

    console.log(`[RECOVERY EMAIL] Would send to: ${reg.email}`);
    console.log(`[RECOVERY EMAIL] Subject: ${subject}`);
    console.log(`[RECOVERY EMAIL] Language: ${lang}`);
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
