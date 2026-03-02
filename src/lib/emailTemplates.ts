const SITE_URL = "https://cadastro-nova-franquia-timol.lovable.app";
const LOGO_URL = `${SITE_URL}/timol-logo.svg`;
const WHATSAPP_NUMBER = "5534991258000";
const VIDEO_URL = "https://www.youtube.com/watch?v=PLACEHOLDER";
const VIDEO_THUMB = `https://img.youtube.com/vi/PLACEHOLDER/hqdefault.jpg`;

type Lang = "pt" | "en" | "es";

/* ─── i18n helpers ─── */
const t = (lang: Lang, key: string): string => {
  const map: Record<string, Record<Lang, string>> = {
    /* ── Pending email ── */
    pendingSubject: {
      pt: "🚀 Falta pouco... finalize aqui seu cadastro Timol.",
      en: "🚀 Almost there... finish your Timol registration here.",
      es: "🚀 Casi listo... finaliza aquí tu registro Timol.",
    },
    pendingGreeting: {
      pt: "Olá, {{name}}!",
      en: "Hello, {{name}}!",
      es: "¡Hola, {{name}}!",
    },
    pendingIntro: {
      pt: "Vimos que você já iniciou seu cadastro na Timol e seu ID foi gerado com sucesso. 🎉",
      en: "We noticed you already started your Timol registration and your ID was generated successfully. 🎉",
      es: "Vimos que ya iniciaste tu registro en Timol y tu ID fue generado con éxito. 🎉",
    },
    pendingDataTitle: {
      pt: "Aqui estão seus dados para continuar de onde parou:",
      en: "Here is your data to continue where you left off:",
      es: "Aquí están tus datos para continuar donde lo dejaste:",
    },
    labelId: { pt: "ID:", en: "ID:", es: "ID:" },
    labelName: { pt: "Nome:", en: "Name:", es: "Nombre:" },
    labelDoc: { pt: "CPF:", en: "Document:", es: "Documento:" },
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
    pendingCta: {
      pt: "CONTINUAR CADASTRO →",
      en: "CONTINUE REGISTRATION →",
      es: "CONTINUAR REGISTRO →",
    },
    videoTitle: {
      pt: "🎥 Veja como a Timol funciona na prática",
      en: "🎥 See how Timol works in practice",
      es: "🎥 Mira cómo funciona Timol en la práctica",
    },
    videoDesc: {
      pt: "Depoimentos reais de franqueados que já vivem essa experiência:",
      en: "Real testimonials from franchisees already living this experience:",
      es: "Testimonios reales de franquiciados que ya viven esta experiencia:",
    },
    videoBtn: {
      pt: "▶ Assistir vídeo",
      en: "▶ Watch video",
      es: "▶ Ver video",
    },
    whatsappHelp: {
      pt: "Se tiver qualquer dúvida, estamos por aqui para te ajudar. Fale diretamente com nossa equipe pelo WhatsApp:",
      en: "If you have any questions, we're here to help. Talk directly to our team on WhatsApp:",
      es: "Si tienes alguna duda, estamos aquí para ayudarte. Habla directamente con nuestro equipo por WhatsApp:",
    },
    whatsappBtn: {
      pt: "💬 Falar no WhatsApp",
      en: "💬 Chat on WhatsApp",
      es: "💬 Hablar por WhatsApp",
    },
    closingHappy: {
      pt: "Estamos felizes por você ter começado essa jornada. Conte com a gente!",
      en: "We're happy you started this journey. Count on us!",
      es: "Estamos felices de que hayas comenzado este camino. ¡Cuenta con nosotros!",
    },
    closingSign: {
      pt: "Abraços,",
      en: "Best regards,",
      es: "Abrazos,",
    },
    team: { pt: "Equipe Timol", en: "Timol Team", es: "Equipo Timol" },

    /* ── Completed email ── */
    completedSubject: {
      pt: "🎉 Bem-vindo à Timol! Sua franquia foi ativada.",
      en: "🎉 Welcome to Timol! Your franchise is active.",
      es: "🎉 ¡Bienvenido a Timol! Tu franquicia fue activada.",
    },
    completedGreeting: {
      pt: "Parabéns, {{name}}! 🎉",
      en: "Congratulations, {{name}}! 🎉",
      es: "¡Felicidades, {{name}}! 🎉",
    },
    completedIntro: {
      pt: "Sua franquia <strong>{{franchise}}</strong> foi ativada com sucesso! Você agora faz parte da família Timol.",
      en: "Your <strong>{{franchise}}</strong> franchise has been activated! You are now part of the Timol family.",
      es: "¡Tu franquicia <strong>{{franchise}}</strong> fue activada con éxito! Ahora eres parte de la familia Timol.",
    },
    completedSummaryTitle: {
      pt: "Resumo do seu cadastro:",
      en: "Your registration summary:",
      es: "Resumen de tu registro:",
    },
    labelFranchise: { pt: "Franquia:", en: "Franchise:", es: "Franquicia:" },
    labelPayment: { pt: "💳 Pagamento:", en: "💳 Payment:", es: "💳 Pago:" },
    paymentPix: {
      pt: "PIX (pagamento confirmado)",
      en: "PIX (payment confirmed)",
      es: "PIX (pago confirmado)",
    },
    firstAccessTitle: {
      pt: "🚀 Primeiro Acesso ao TimolSystem",
      en: "🚀 First Access to TimolSystem",
      es: "🚀 Primer Acceso a TimolSystem",
    },
    firstAccessDesc: {
      pt: "Para acessar o sistema, utilize os dados abaixo:",
      en: "To access the system, use the data below:",
      es: "Para acceder al sistema, utiliza los datos a continuación:",
    },
    labelLogin: { pt: "Login:", en: "Login:", es: "Login:" },
    labelPassword: { pt: "Senha:", en: "Password:", es: "Contraseña:" },
    passwordHint: {
      pt: "A que você definiu no cadastro",
      en: "The one you set during registration",
      es: "La que definiste en el registro",
    },
    accessCta: {
      pt: "ACESSAR TIMOLSYSTEM →",
      en: "ACCESS TIMOLSYSTEM →",
      es: "ACCEDER A TIMOLSYSTEM →",
    },
    securityTitle: {
      pt: "🔒 Alerta de Segurança",
      en: "🔒 Security Alert",
      es: "🔒 Alerta de Seguridad",
    },
    securityDesc: {
      pt: "Sua senha é pessoal e intransferível. <strong>Nunca compartilhe sua senha</strong> com terceiros, nem mesmo com a equipe Timol. Nós jamais solicitaremos sua senha por e-mail, WhatsApp ou qualquer outro canal.",
      en: "Your password is personal and non-transferable. <strong>Never share your password</strong> with anyone, not even with the Timol team. We will never ask for your password via email, WhatsApp, or any other channel.",
      es: "Tu contraseña es personal e intransferible. <strong>Nunca compartas tu contraseña</strong> con terceros, ni siquiera con el equipo Timol. Jamás solicitaremos tu contraseña por correo, WhatsApp o cualquier otro canal.",
    },
    completedWhatsapp: {
      pt: "Se tiver qualquer dúvida sobre seu acesso ou sobre a Timol, estamos aqui para ajudar:",
      en: "If you have any questions about your access or Timol, we're here to help:",
      es: "Si tienes alguna duda sobre tu acceso o sobre Timol, estamos aquí para ayudarte:",
    },
    completedClosing: {
      pt: "Estamos muito felizes em ter você conosco! Sua jornada começa agora. Conte com a gente!",
      en: "We're so happy to have you with us! Your journey starts now. Count on us!",
      es: "¡Estamos muy felices de tenerte con nosotros! Tu camino comienza ahora. ¡Cuenta con nosotros!",
    },
  };
  return map[key]?.[lang] ?? map[key]?.pt ?? key;
};

/* ─── Shared email wrapper ─── */
function emailShell(lang: Lang, title: string, body: string): string {
  const htmlLang = lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en";
  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 480px) {
      .closing-text br.mobile-hide { display: none; }
      .cta-btn { font-size: 14px !important; padding: 14px 32px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#1e293b;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Logo — left-aligned -->
    <div style="text-align:left;margin-bottom:32px;">
      <img src="${LOGO_URL}" alt="Timol" style="height:48px;" />
    </div>

    ${body}

  </div>
</body>
</html>`;
}

/* ─── Data row helper with vertical-align:top ─── */
function dataRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:4px 0;font-size:14px;color:#64748b;width:120px;vertical-align:top;">${label}</td>
  <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;vertical-align:top;">${value}</td>
</tr>`;
}

/* ─── Video block (thumbnail + fallback button) ─── */
function videoBlock(lang: Lang): string {
  return `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:24px;margin:32px 0;text-align:center;">
  <p style="margin:0 0 8px;font-size:16px;color:#1e293b;font-weight:600;">
    ${t(lang, "videoTitle")}
  </p>
  <p style="margin:0 0 16px;font-size:14px;color:#64748b;">
    ${t(lang, "videoDesc")}
  </p>
  <!-- Thumbnail with play overlay — links to YouTube -->
  <a href="${VIDEO_URL}" target="_blank" style="display:inline-block;text-decoration:none;">
    <img src="${VIDEO_THUMB}" alt="${t(lang, "videoBtn")}" style="width:100%;max-width:480px;border-radius:8px;display:block;margin:0 auto 12px;" />
  </a>
  <a href="${VIDEO_URL}" target="_blank" class="cta-btn" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
    ${t(lang, "videoBtn")}
  </a>
</div>`;
}

/* ─── WhatsApp block ─── */
function whatsappBlock(lang: Lang, text: string, waUrl: string): string {
  return `<div style="text-align:center;margin:32px 0;">
  <p style="margin:0 0 12px;font-size:14px;color:#64748b;">
    ${text}
  </p>
  <a href="${waUrl}" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
    ${t(lang, "whatsappBtn")}
  </a>
</div>`;
}

/* ─── Closing block ─── */
function closingBlock(lang: Lang, closingText: string): string {
  return `<div style="border-top:1px solid #e2e8f0;padding-top:24px;margin-top:32px;" class="closing-text">
  <p style="margin:0 0 16px;font-size:15px;color:#334155;">
    ${closingText}
  </p>
  <p style="margin:0;font-size:15px;color:#334155;">
    ${t(lang, "closingSign")}<br/>
    <strong>${t(lang, "team")}</strong>
  </p>
</div>`;
}

/* ================================================================
   PENDING REGISTRATION EMAIL
   ================================================================ */

export interface PendingEmailData {
  fullName: string;
  userId: string;
  document: string;
  sponsorName: string;
  sponsorId: string;
  continueToken: string;
  language?: Lang;
}

export function getPendingSubject(lang: Lang = "pt"): string {
  return t(lang, "pendingSubject");
}

export function buildPendingEmailHtml(data: PendingEmailData): string {
  const lang = data.language || "pt";
  const continueUrl = `${SITE_URL}/continue/${data.continueToken}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá, meu nome é ${data.fullName}, meu ID é ${data.userId}. Preciso de ajuda para concluir meu cadastro.`
  )}`;

  const body = `
    <!-- Greeting -->
    <h1 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 16px;">
      ${t(lang, "pendingGreeting").replace("{{name}}", data.fullName)}
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#334155;">
      ${t(lang, "pendingIntro")}
    </p>

    <p style="margin:0 0 8px;font-size:15px;color:#334155;font-weight:600;">
      ${t(lang, "pendingDataTitle")}
    </p>

    <!-- Data Summary Card -->
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:16px 0 24px;">
      <table style="width:100%;border-collapse:collapse;">
        ${dataRow(t(lang, "labelId"), data.userId)}
        ${dataRow(t(lang, "labelName"), data.fullName)}
        ${dataRow(t(lang, "labelDoc"), data.document)}
        ${dataRow(t(lang, "labelSponsor"), `${data.sponsorName} (ID ${data.sponsorId})`)}
      </table>
    </div>

    <p style="margin:0 0 8px;font-size:15px;color:#334155;">
      ${t(lang, "pendingAlmost")}
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#334155;">
      ${t(lang, "pendingResume")}
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0;">
      <a href="${continueUrl}" class="cta-btn" style="display:inline-block;background-color:#0f2b4a;color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.5px;">
        ${t(lang, "pendingCta")}
      </a>
    </div>

    ${videoBlock(lang)}

    ${whatsappBlock(lang, t(lang, "whatsappHelp"), whatsappUrl)}

    ${closingBlock(lang, t(lang, "closingHappy"))}
  `;

  return emailShell(lang, t(lang, "pendingSubject"), body);
}

/* ================================================================
   COMPLETED REGISTRATION EMAIL
   ================================================================ */

export interface CompletedEmailData {
  fullName: string;
  userId: string;
  document: string;
  sponsorName: string;
  sponsorId: string;
  franchiseName: string;
  paymentMethod: "pix" | "credit";
  cardLast4?: string;
  cardInstallments?: number;
  installmentValue?: string;
  email: string;
  username: string;
  language?: Lang;
}

export function getCompletedSubject(lang: Lang = "pt"): string {
  return t(lang, "completedSubject");
}

export function buildCompletedEmailHtml(data: CompletedEmailData): string {
  const lang = data.language || "pt";
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá, meu nome é ${data.fullName}, meu ID é ${data.userId}. Preciso de ajuda com meu acesso.`
  )}`;

  const paymentSummary =
    data.paymentMethod === "credit"
      ? `Cartão de crédito final ${data.cardLast4} — ${data.cardInstallments}x de ${data.installmentValue}`
      : t(lang, "paymentPix");

  const body = `
    <!-- Greeting -->
    <h1 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 16px;">
      ${t(lang, "completedGreeting").replace("{{name}}", data.fullName)}
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#334155;">
      ${t(lang, "completedIntro").replace("{{franchise}}", data.franchiseName)}
    </p>

    <!-- Data Summary Card -->
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:16px 0 24px;">
      <p style="margin:0 0 12px;font-size:15px;color:#1e293b;font-weight:600;">${t(lang, "completedSummaryTitle")}</p>
      <table style="width:100%;border-collapse:collapse;">
        ${dataRow(t(lang, "labelId"), data.userId)}
        ${dataRow(t(lang, "labelName"), data.fullName)}
        ${dataRow(t(lang, "labelDoc"), data.document)}
        ${dataRow(t(lang, "labelFranchise"), data.franchiseName)}
        ${dataRow(t(lang, "labelSponsor"), `${data.sponsorName} (ID ${data.sponsorId})`)}
      </table>
    </div>

    <!-- Payment Summary -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:15px;color:#1e293b;font-weight:600;">${t(lang, "labelPayment")}</p>
      <p style="margin:0;font-size:14px;color:#334155;">${paymentSummary}</p>
    </div>

    <!-- First Access Section -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:0 0 24px;">
      <p style="margin:0 0 12px;font-size:16px;color:#1e293b;font-weight:700;">
        ${t(lang, "firstAccessTitle")}
      </p>
      <p style="margin:0 0 8px;font-size:14px;color:#334155;">
        ${t(lang, "firstAccessDesc")}
      </p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        ${dataRow(t(lang, "labelLogin"), data.username)}
        ${dataRow(t(lang, "labelPassword"), t(lang, "passwordHint"))}
      </table>
      <div style="text-align:center;margin-top:16px;">
        <a href="https://timolsystem.com" class="cta-btn" style="display:inline-block;background-color:#0f2b4a;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.5px;">
          ${t(lang, "accessCta")}
        </a>
      </div>
    </div>

    <!-- Security Alert -->
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:15px;color:#991b1b;font-weight:700;">
        ${t(lang, "securityTitle")}
      </p>
      <p style="margin:0;font-size:14px;color:#7f1d1d;">
        ${t(lang, "securityDesc")}
      </p>
    </div>

    ${whatsappBlock(lang, t(lang, "completedWhatsapp"), whatsappUrl)}

    ${closingBlock(lang, t(lang, "completedClosing"))}
  `;

  return emailShell(lang, t(lang, "completedSubject"), body);
}
