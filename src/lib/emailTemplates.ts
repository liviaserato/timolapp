const SITE_URL = "https://cadastro-nova-franquia-timol.lovable.app";
const LOGO_URL = `${SITE_URL}/favicon.svg`;
const WHATSAPP_NUMBER = "5534991258000";
const VIDEO_URL = "https://www.youtube.com/watch?v=PLACEHOLDER";

interface PendingEmailData {
  fullName: string;
  userId: string;
  document: string;
  sponsorName: string;
  sponsorId: string;
  continueToken: string;
}

interface CompletedEmailData {
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
}

export function buildPendingEmailHtml(data: PendingEmailData): string {
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

export function buildCompletedEmailHtml(data: CompletedEmailData): string {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá, meu nome é ${data.fullName}, meu ID é ${data.userId}. Preciso de ajuda com meu acesso.`
  )}`;

  const paymentSummary =
    data.paymentMethod === "credit"
      ? `Cartão de crédito final ${data.cardLast4} — ${data.cardInstallments}x de ${data.installmentValue}`
      : "PIX (pagamento confirmado)";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo à Timol! Sua franquia foi ativada 🎉</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#1e293b;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${LOGO_URL}" alt="Timol" style="height:48px;" />
    </div>

    <!-- Greeting -->
    <h1 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 16px;">
      Parabéns, ${data.fullName}! 🎉
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#334155;">
      Sua franquia <strong>${data.franchiseName}</strong> foi ativada com sucesso! Você agora faz parte da família Timol.
    </p>

    <!-- Data Summary Card -->
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:16px 0 24px;">
      <p style="margin:0 0 12px;font-size:15px;color:#1e293b;font-weight:600;">Resumo do seu cadastro:</p>
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
          <td style="padding:4px 0;font-size:14px;color:#64748b;">Franquia:</td>
          <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;">${data.franchiseName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#64748b;">Patrocinador:</td>
          <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;">${data.sponsorName} (ID ${data.sponsorId})</td>
        </tr>
      </table>
    </div>

    <!-- Payment Summary -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:15px;color:#1e293b;font-weight:600;">💳 Pagamento:</p>
      <p style="margin:0;font-size:14px;color:#334155;">${paymentSummary}</p>
    </div>

    <!-- First Access Section -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:0 0 24px;">
      <p style="margin:0 0 12px;font-size:16px;color:#1e293b;font-weight:700;">
        🚀 Primeiro Acesso ao TimolSystem
      </p>
      <p style="margin:0 0 8px;font-size:14px;color:#334155;">
        Para acessar o sistema, utilize os dados abaixo:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#64748b;width:120px;">Login:</td>
          <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;">${data.username}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#64748b;">Senha:</td>
          <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;">A que você definiu no cadastro</td>
        </tr>
      </table>
      <div style="text-align:center;margin-top:16px;">
        <a href="https://timolsystem.com" style="display:inline-block;background-color:#0f2b4a;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.5px;">
          ACESSAR TIMOLSYSTEM →
        </a>
      </div>
    </div>

    <!-- Security Alert -->
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:15px;color:#991b1b;font-weight:700;">
        🔒 Alerta de Segurança
      </p>
      <p style="margin:0;font-size:14px;color:#7f1d1d;">
        Sua senha é pessoal e intransferível. <strong>Nunca compartilhe sua senha</strong> com terceiros, nem mesmo com a equipe Timol. Nós jamais solicitaremos sua senha por e-mail, WhatsApp ou qualquer outro canal.
      </p>
    </div>

    <!-- Help / WhatsApp -->
    <div style="text-align:center;margin:32px 0;">
      <p style="margin:0 0 12px;font-size:14px;color:#64748b;">
        Se tiver qualquer dúvida sobre seu acesso ou sobre a Timol, estamos aqui para ajudar:
      </p>
      <a href="${whatsappUrl}" style="display:inline-block;background-color:#25D366;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        💬 Falar no WhatsApp
      </a>
    </div>

    <!-- Closing -->
    <div style="border-top:1px solid #e2e8f0;padding-top:24px;margin-top:32px;">
      <p style="margin:0 0 4px;font-size:15px;color:#334155;">
        Estamos muito felizes em ter você conosco!
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;">Sua jornada começa agora. Conte com a gente!</p>
      <p style="margin:0;font-size:15px;color:#334155;">
        Abraços,<br/>
        <strong>Equipe Timol</strong>
      </p>
    </div>

  </div>
</body>
</html>`;
}
