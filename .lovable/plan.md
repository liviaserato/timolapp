

## Plano: Padronizar e-mails transacionais + remover preview page

### Resumo

Converter os 4 e-mails transacionais (cadastro pendente, cadastro concluído, PIN de recuperação, senha alterada) para o mesmo padrão React Email usado nos templates do Cloud (`supabase/functions/_shared/email-templates/`), remover botões/blocos WhatsApp de todos, e deletar a página `/emails`.

### O que muda

**1. Criar novos templates React Email em `_shared/email-templates/`**

- **`pending-registration.tsx`** — Cadastro pendente. Remove bloco de vídeo e WhatsApp. Mantém: logo, saudação, dados resumidos (ID, nome, patrocinador), CTA "Continuar Cadastro", fechamento com Equipe Timol.

- **`completed-registration.tsx`** — Cadastro concluído. Remove WhatsApp. Mantém: logo, parabéns, resumo de dados, pagamento, contrato em anexo, primeiro acesso, alerta de segurança, fechamento.

- **`password-changed.tsx`** — Senha alterada. Clean: logo, título, confirmação, mensagem discreta tipo "Se não foi você, sua conta pode estar comprometida. [Clique aqui](link) para reportar." — link abre chamado (pode ser mailto ou URL de suporte). Sem botão WhatsApp.

**2. Atualizar `reauthentication.tsx` (PIN)**

- Usar este template como padrão para o PIN de recuperação de senha também (já é o mesmo conceito).
- Adicionar texto de segurança: "Ninguém da Timol vai solicitar esse código. Não repasse a terceiros."
- Adicionar validade: "Este código expira em 5 minutos."

**3. Registrar novos templates no `auth-email-hook/index.ts`**

- Os templates de pending/completed/password-changed não são auth emails (não passam pelo hook de auth). Eles são enviados por edge functions específicas (`send-recovery-email`, `forgot-password`).
- Portanto: atualizar as edge functions `forgot-password` e `send-recovery-email` para usar os novos templates React Email em vez do HTML inline.

**4. Atualizar edge functions que enviam esses e-mails**

- **`forgot-password/index.ts`**: substituir o HTML inline do PIN pelo import do template `reauthentication.tsx` (renderizado via `renderAsync`).
- **`send-recovery-email/index.ts`**: substituir o HTML inline do cadastro pendente pelo import do template `pending-registration.tsx`.

**5. Remover a página de preview**

- Deletar `src/pages/EmailPreviews.tsx`
- Remover rota `/emails` de `src/App.tsx`
- O arquivo `src/lib/emailTemplates.ts` será mantido por enquanto pois pode ter dependências em edge functions, mas as funções de build dos 4 emails serão marcadas como deprecated ou removidas se não houver mais uso.

**6. Limpar `src/lib/emailTemplates.ts`**

- Remover `buildPasswordResetPinEmailHtml`, `buildPasswordChangedEmailHtml`, `buildPendingEmailHtml` — as edge functions passarão a usar os templates React Email diretamente.
- Manter `buildCompletedEmailHtml` temporariamente se ainda for usado em alguma edge function.

### Padrão visual dos novos templates

Todos seguem o mesmo estilo dos templates Cloud:
- Fundo branco `#ffffff`
- Logo Timol do bucket `email-assets`
- Cor primária `#003885` para botões e destaques
- Tipografia `'Segoe UI', Roboto, Arial, sans-serif`
- Footer discreto `#94a3b8`
- Sem emojis nos títulos
- Sem botões WhatsApp

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `supabase/functions/_shared/email-templates/reauthentication.tsx` | Editar (add segurança + validade) |
| `supabase/functions/_shared/email-templates/pending-registration.tsx` | Criar |
| `supabase/functions/_shared/email-templates/completed-registration.tsx` | Criar |
| `supabase/functions/_shared/email-templates/password-changed.tsx` | Criar |
| `supabase/functions/forgot-password/index.ts` | Editar (usar template React Email) |
| `supabase/functions/send-recovery-email/index.ts` | Editar (usar template React Email) |
| `src/pages/EmailPreviews.tsx` | Deletar |
| `src/App.tsx` | Editar (remover rota /emails) |
| `src/lib/emailTemplates.ts` | Limpar funções não usadas |

