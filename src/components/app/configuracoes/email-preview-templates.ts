const LOGO_URL =
  'https://sinflvoxbphblalcsaba.supabase.co/storage/v1/object/public/email-assets/logo-timol-azul-escuro.svg';

const wrap = (preview: string, body: string) => `
<!DOCTYPE html>
<html lang="pt-BR" dir="ltr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="background-color:#ffffff;font-family:'Segoe UI',Roboto,Arial,sans-serif;margin:0;padding:0">
<div style="padding:40px 24px;max-width:600px;margin:0 auto">
<img src="${LOGO_URL}" alt="Timol" height="44" style="margin-bottom:28px" />
${body}
</div>
</body>
</html>`;

const h1 = 'font-size:22px;font-weight:bold;color:#020817;margin:0 0 20px';
const text = 'font-size:15px;color:#64748b;line-height:1.6;margin:0 0 16px';
const btn = 'display:inline-block;background-color:#003885;color:#ffffff;font-size:15px;font-weight:700;border-radius:8px;padding:14px 32px;text-decoration:none;letter-spacing:0.5px';
const footer = 'font-size:12px;color:#94a3b8;margin:32px 0 0';
const hr = 'border:none;border-top:1px solid #e2e8f0;margin:24px 0';
const hrLight = 'border:none;border-top:1px solid #f1f5f9;margin:28px 0 16px';
const footerCompany = 'font-size:12px;color:#94a3b8;font-weight:600;margin:0 0 4px';
const footerTxt = 'font-size:12px;color:#94a3b8;margin:0';
const card = 'background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:0 0 16px';
const labelCol = 'font-size:14px;color:#64748b;width:120px;padding:4px 0;vertical-align:top';
const valueCol = 'font-size:14px;color:#1e293b;font-weight:600;padding:4px 0;vertical-align:top';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'auth' | 'transacional';
  html: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'signup',
    name: 'Confirmação de E-mail',
    description: 'Enviado ao usuário após criar conta para verificar o e-mail.',
    category: 'auth',
    html: wrap('Confirme seu e-mail para ativar sua conta Timol', `
      <h1 style="${h1}">Confirme seu e-mail</h1>
      <p style="${text}">Obrigado por se cadastrar na <a href="#" style="color:#003885;text-decoration:underline"><strong>Timol</strong></a>!</p>
      <p style="${text}">Para ativar sua conta, confirme seu endereço de e-mail (<a href="#" style="color:#003885;text-decoration:underline">joao@email.com</a>) clicando no botão abaixo:</p>
      <a href="#" style="${btn}">CONFIRMAR E-MAIL →</a>
      <p style="${footer}">Se você não criou uma conta na Timol, ignore este e-mail com segurança.</p>
    `),
  },
  {
    id: 'recovery',
    name: 'Recuperação de Senha',
    description: 'Enviado quando o usuário solicita redefinição de senha.',
    category: 'auth',
    html: wrap('Redefinição de senha — Timol', `
      <h1 style="${h1}">Redefinir senha</h1>
      <p style="${text}">Recebemos uma solicitação para redefinir sua senha na Timol. Clique no botão abaixo para escolher uma nova senha.</p>
      <a href="#" style="${btn}">REDEFINIR SENHA →</a>
      <p style="${footer}">Se você não solicitou a redefinição, ignore este e-mail com segurança. Sua senha não será alterada.</p>
    `),
  },
  {
    id: 'magic-link',
    name: 'Magic Link',
    description: 'Link de acesso rápido enviado ao usuário.',
    category: 'auth',
    html: wrap('Seu link de acesso — Timol', `
      <h1 style="${h1}">Seu link de acesso</h1>
      <p style="${text}">Clique no botão abaixo para acessar sua conta na Timol. Este link expira em breve.</p>
      <a href="#" style="${btn}">ACESSAR MINHA CONTA →</a>
      <p style="${footer}">Se você não solicitou este link, ignore este e-mail com segurança.</p>
    `),
  },
  {
    id: 'invite',
    name: 'Convite',
    description: 'Enviado quando um usuário é convidado para a plataforma.',
    category: 'auth',
    html: wrap('Você foi convidado para a Timol', `
      <h1 style="${h1}">Você foi convidado!</h1>
      <p style="${text}">Você recebeu um convite para participar da <a href="#" style="color:#003885;text-decoration:underline"><strong>Timol</strong></a>. Clique no botão abaixo para aceitar o convite e criar sua conta.</p>
      <a href="#" style="${btn}">ACEITAR CONVITE →</a>
      <p style="${footer}">Se você não esperava este convite, ignore este e-mail com segurança.</p>
    `),
  },
  {
    id: 'email-change',
    name: 'Alteração de E-mail',
    description: 'Confirmação de alteração de endereço de e-mail.',
    category: 'auth',
    html: wrap('Confirme a alteração do seu e-mail — Timol', `
      <h1 style="${h1}">Confirme a alteração de e-mail</h1>
      <p style="${text}">Você solicitou a alteração do seu e-mail na Timol de <a href="#" style="color:#003885;text-decoration:underline">antigo@email.com</a> para <a href="#" style="color:#003885;text-decoration:underline">novo@email.com</a>.</p>
      <p style="${text}">Clique no botão abaixo para confirmar essa alteração:</p>
      <a href="#" style="${btn}">CONFIRMAR ALTERAÇÃO →</a>
      <p style="${footer}">Se você não solicitou essa alteração, proteja sua conta imediatamente.</p>
    `),
  },
  {
    id: 'reauthentication',
    name: 'Reautenticação (PIN)',
    description: 'Código PIN de verificação de segurança.',
    category: 'auth',
    html: wrap('Seu código de verificação — Timol', `
      <h1 style="${h1}">Código de verificação</h1>
      <p style="${text}">Use o código abaixo para confirmar sua identidade:</p>
      <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:24px;text-align:center;margin:0 0 20px">
        <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;margin:0 0 8px">PIN DE SEGURANÇA</p>
        <p style="font-family:Courier,monospace;font-size:32px;font-weight:bold;color:#003885;letter-spacing:0.35em;margin:0">847291</p>
      </div>
      <p style="font-size:14px;color:#475569;margin:0 0 20px">Este código expira em 5 minutos.</p>
      <div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:18px 20px;margin:0 0 20px">
        <p style="font-size:14px;color:#854d0e;margin:0"><strong>Ninguém da Timol vai solicitar esse código.</strong> Não repasse a terceiros.</p>
      </div>
      <p style="${footer}">Se você não solicitou este código, ignore este e-mail com segurança.</p>
    `),
  },
  {
    id: 'pending-registration',
    name: 'Cadastro Pendente',
    description: 'Enviado para quem iniciou o cadastro mas não concluiu o pagamento.',
    category: 'transacional',
    html: wrap('Falta pouco para ativar sua franquia Timol', `
      <h1 style="${h1}">Olá, João Silva!</h1>
      <p style="${text}">Vimos que você já iniciou seu cadastro na Timol e seu ID foi gerado com sucesso.</p>
      <p style="font-size:15px;color:#334155;line-height:1.6;font-weight:600;margin:0 0 8px">Seus dados para continuar de onde parou:</p>
      <div style="background-color:#f1f5f9;border-radius:12px;padding:20px;margin:0 0 24px">
        <table style="width:100%">
          <tr><td style="${labelCol}">ID:</td><td style="${valueCol}">TML-001234</td></tr>
          <tr><td style="${labelCol}">Nome:</td><td style="${valueCol}">João Silva</td></tr>
          <tr><td style="${labelCol}">Patrocinador:</td><td style="${valueCol}">Maria Santos (ID TML-000001)</td></tr>
        </table>
      </div>
      <p style="${text}">Falta só mais um passo para ativar sua franquia e começar sua jornada com a Timol.</p>
      <p style="${text}">Se você ainda não escolheu sua franquia ou não concluiu o pagamento, pode retomar exatamente de onde parou clicando no botão abaixo:</p>
      <div style="text-align:center;margin:32px 0"><a href="#" style="${btn};padding:16px 48px">CONTINUAR CADASTRO →</a></div>
      <hr style="${hr}" />
      <p style="${text}">Estamos felizes por você ter começado essa jornada. Conte com a gente!</p>
      <p style="${text}">Abraços,<br /><strong>Equipe Timol</strong></p>
      <hr style="${hrLight}" />
      <p style="${footerCompany}">Timol Produtos Magnéticos</p>
      <p style="${footerTxt}">contato@timol.com.br</p>
    `),
  },
  {
    id: 'completed-registration',
    name: 'Cadastro Concluído',
    description: 'Enviado após ativação bem-sucedida da franquia, com contrato em anexo.',
    category: 'transacional',
    html: wrap('Sua franquia Timol foi ativada com sucesso!', `
      <h1 style="${h1}">Parabéns, João Silva!</h1>
      <p style="${text}">Sua franquia <strong>Ouro</strong> foi ativada com sucesso! Você agora faz parte da família Timol.</p>
      <div style="${card}">
        <p style="font-size:15px;color:#1e293b;font-weight:600;margin:0 0 12px">Resumo do seu cadastro:</p>
        <table style="width:100%">
          <tr><td style="${labelCol}">ID:</td><td style="${valueCol}">TML-001234</td></tr>
          <tr><td style="${labelCol}">Nome:</td><td style="${valueCol}">João Silva</td></tr>
          <tr><td style="${labelCol}">Franquia:</td><td style="${valueCol}">Ouro</td></tr>
          <tr><td style="${labelCol}">Patrocinador:</td><td style="${valueCol}">Maria Santos (ID TML-000001)</td></tr>
        </table>
      </div>
      <div style="${card}">
        <p style="font-size:15px;color:#1e293b;font-weight:600;margin:0 0 12px">Pagamento:</p>
        <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 8px">Cartão de crédito •••• 4242 — R$ 497,00</p>
      </div>
      <div style="${card}">
        <p style="font-size:15px;color:#1e293b;font-weight:700;margin:0 0 8px">Contrato em anexo</p>
        <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 8px">Segue em anexo o seu contrato de franquia. Recomendamos não deletar este e-mail para manter esse documento e seus dados de ativação sempre à mão.</p>
      </div>
      <div style="${card}">
        <p style="font-size:15px;color:#1e293b;font-weight:700;margin:0 0 8px">Primeiro Acesso ao TimolSystem</p>
        <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 8px">Para acessar o sistema, utilize os dados abaixo:</p>
        <table style="width:100%">
          <tr><td style="${labelCol}">Login:</td><td style="${valueCol}">joaosilva</td></tr>
          <tr><td style="${labelCol}">Senha:</td><td style="${valueCol}">A que você definiu no cadastro</td></tr>
        </table>
        <div style="text-align:left;margin:16px 0 0"><a href="#" style="${btn};padding:14px 40px">ACESSAR ESCRITÓRIO DIGITAL →</a></div>
      </div>
      <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:0 0 24px">
        <p style="font-size:15px;color:#991b1b;font-weight:700;margin:0 0 8px">Alerta de Segurança</p>
        <p style="font-size:14px;color:#7f1d1d;line-height:1.6;margin:0">Sua senha é pessoal e intransferível. <strong>Nunca compartilhe sua senha</strong> com terceiros, nem mesmo com a equipe Timol. Nós jamais solicitaremos sua senha por e-mail, WhatsApp ou qualquer outro canal.</p>
      </div>
      <hr style="${hr}" />
      <p style="${text}">Estamos muito felizes em ter você conosco! Sua jornada começa agora. Conte com a gente!</p>
      <p style="${text}">Abraços,<br /><strong>Equipe Timol</strong></p>
      <hr style="${hrLight}" />
      <p style="${footerCompany}">Timol Produtos Magnéticos</p>
      <p style="${footerTxt}">contato@timol.com.br</p>
    `),
  },
  {
    id: 'password-changed',
    name: 'Senha Alterada',
    description: 'Notificação de que a senha foi alterada com sucesso.',
    category: 'transacional',
    html: wrap('Sua senha foi alterada com sucesso — Timol', `
      <h1 style="${h1}">Senha alterada com sucesso</h1>
      <p style="${text}">Olá, João.</p>
      <p style="${text}">Sua senha de acesso ao Escritório Digital Timol foi alterada com sucesso.</p>
      <p style="${text}">Se foi você quem fez essa alteração, nenhuma ação é necessária.</p>
      <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0 0 16px">Se você não solicitou essa alteração, sua conta pode estar comprometida. <a href="#" style="color:#003885;text-decoration:underline">Clique aqui</a> para reportar ou pedir ajuda.</p>
      <hr style="${hr}" />
      <p style="${text}">Conte com a gente para manter sua conta protegida.</p>
      <p style="${text}">Abraços,<br /><strong>Equipe Timol</strong></p>
      <hr style="${hrLight}" />
      <p style="${footerCompany}">Timol Produtos Magnéticos</p>
      <p style="${footerTxt}">contato@timol.com.br</p>
    `),
  },
  {
    id: 'ticket-closed',
    name: 'Chamado Concluído',
    description: 'Enviado quando um chamado de suporte é concluído, com pesquisa de satisfação.',
    category: 'transacional',
    html: wrap('Chamado SUP-0042 concluído — Como foi o atendimento?', `
      <h1 style="${h1}">Chamado Concluído</h1>
      <p style="${text}">Olá, João.</p>
      <p style="${text}">Seu chamado <strong>SUP-0042</strong> — <em>"Problema com ativação da franquia"</em> — foi concluído pela nossa equipe.</p>
      <p style="${text}">Gostaríamos de saber: <strong>você ficou satisfeito com o atendimento?</strong></p>
      <div style="text-align:center">
        <a href="#" style="display:inline-block;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;text-align:center;width:100%;max-width:320px;background-color:#16a34a;color:#ffffff">👍 Sim, fiquei satisfeito</a>
      </div>
      <div style="text-align:center;margin-top:12px">
        <a href="#" style="display:inline-block;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;text-align:center;width:100%;max-width:320px;background-color:#f1f5f9;color:#475569;border:1px solid #e2e8f0">👎 Não, preciso de mais ajuda</a>
      </div>
      <hr style="${hr}" />
      <p style="${text}">Sua opinião é muito importante para melhorarmos nosso atendimento.</p>
      <p style="${text}">Abraços,<br /><strong>Equipe Timol</strong></p>
      <hr style="${hrLight}" />
      <p style="${footerCompany}">Timol Produtos Magnéticos</p>
      <p style="${footerTxt}">contato@timol.com.br</p>
    `),
  },
];
