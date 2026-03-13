

## Auditoria Completa: Login e Cadastro — Regras de Negócio vs Implementação

Analisei o documento de regras contra todo o código do fluxo de Login e Cadastro. Abaixo está o diagnóstico completo, separado em **o que está correto**, **o que precisa ser corrigido** e **o que precisa ser criado**.

---

### Já implementado e correto

| Regra | Status |
|-------|--------|
| 1.1 Login: campos username/password/rememberMe, validação, mensagem genérica | OK |
| 1.3 Recuperação senha: PIN 6 dígitos, 5 min validade, cooldown 60s reenvio | OK |
| 2.1 Busca patrocinador por ID (numérico, API sponsor-lookup) | OK |
| 2.2 Sugestão por localidade (sponsor-suggest, card selecionável) | OK |
| 3.1 Validação documento: CPF checksum, duplicidade via API, país emissor | OK |
| 3.2 Validação idade 18+ com mensagem | OK |
| 4.1 Email: regex validação formato | OK |
| 4.2 Username: regex `[a-zA-Z0-9_]`, max 20, debounce 600ms, duplicidade API | OK |
| 5.1 Franquias bronze/prata/ouro/platina com preços por moeda | OK |
| 6.1 PIX apenas para brasileiros | OK |
| 6.2 Cartão via Stripe para todos | OK |
| Fluxo WhatsApp sem patrocinador | OK |
| DEV_BYPASS para login e registro | OK |
| i18n pt/en/es | OK |

---

### Correções necessárias (11 itens)

**1. Login: campo `systemId` ausente**
- Doc regra 1.1: API `/api/auth/login` requer `systemId`
- `src/lib/api/auth.ts` não envia `systemId`
- Ação: Adicionar `systemId: "timol-app"` (constante) ao body do login

**2. Login: mensagem de permissão de sistema**
- Doc regra 1.2: Se não possuir acesso ao systemId → "Você não tem permissão para acessar este sistema"
- `src/lib/login.ts` não trata esse código de erro
- Ação: Adicionar tratamento para erro `system_access_denied` ou similar

**3. Login: trim de username/password**
- Doc regra 1.1: "Remover espaços antes/depois dos campos"
- `Login.tsx` não faz `.trim()` no username antes de enviar (o `auth.ts` faz trim no username mas não na password — password não deve ter trim)
- Ação: username já tem trim no auth.ts — OK. Confirmar que está correto.

**4. Recuperação senha: limite 5 solicitações em 30 min + bloqueio 30 min**
- Doc regra 1.3: "limite 5 solicitações em 30 minutos; bloqueio por 30 minutos após limite"
- Frontend não controla/exibe esse estado (rate limit)
- Ação: Tratar erro `rate_limited`/`too_many_requests` no `ForgotPasswordPopup` com mensagem de bloqueio

**5. Cadastro Step 2: email sem duplicidade via API**
- Doc regra 4.1: "Validar regex e duplicidade"
- `StepContact.tsx` valida formato mas **não verifica duplicidade** via `checkEmail()`
- Ação: Adicionar validação de duplicidade de email com debounce (similar ao username)

**6. Cadastro: username permite ponto (`.`)**
- Doc regra 4.2: "Permitido letras minúsculas, números, ponto e underline"
- `StepLogin.tsx` regex é `[a-zA-Z0-9_]` — **não inclui ponto**
- Ação: Alterar regex para `/^[a-zA-Z0-9._]*$/`

**7. Cadastro: trim em todos os campos antes do envio**
- Doc regra geral: "Remover espaços antes/depois dos campos"
- `RegistrationWizard.tsx` faz trim em alguns campos no submit, mas **não em todos os campos de entrada** (ex: email, document ao digitar)
- Ação: Aplicar `.trim()` no `onComplete` para todos os campos string

**8. Franquias: preços devem vir da API**
- Doc regra 5.1: "Carregar preços via API" (`/api/franchise/prices`)
- `FranchiseScreen.tsx` tem preços hardcoded no frontend
- Ação: Para agora, manter hardcoded (API não pronta), mas preparar estrutura para futura integração. Adicionar nota/TODO.

**9. Cupom: validação via API real**
- Doc regra 5.2: "Cupom deve ser validado antes do pagamento" via `/api/coupon/validate`
- `SummaryScreen.tsx` usa validação **mock** (hardcoded "TIMOL10", "TESTE")
- Ação: Substituir mock pela chamada real `validateCoupon()` de `src/lib/api/coupons.ts`. Enviar `sponsorId`, `franchiseType`, `currencyCode`.

**10. Registro completo (7.1): API `/api/register/complete` após pagamento**
- Doc regra 7.1: Após pagamento aprovado, enviar dados do contrato
- `PaymentScreen.tsx` confirma pagamento mas **não chama** `registerComplete()`
- Ação: Após pagamento Stripe bem-sucedido, chamar `registerComplete()` com `franchiseType`, `couponId`, `agreeContract`, `agreeCommunications`, `contractVersion`, `acceptedAt`, `ipAddress`, `userAgent`

**11. Username: converter para lowercase antes de enviar**
- Doc regra 4.2: "letras minúsculas" — implica armazenamento em minúsculo
- `StepLogin.tsx` aceita maiúsculas mas não converte
- Ação: Converter para lowercase no `onChange` ou antes do envio

---

### Itens para criar (2 itens)

**1. Validação de email com duplicidade (debounce)**
- Similar à validação de username em `StepLogin.tsx`
- Adicionar em `StepContact.tsx`: debounce 600ms, ícone de status (checking/available/taken)

**2. Chamada `registerComplete` no fluxo de pagamento**
- Criar integração no `PaymentScreen.tsx` ou no `Index.tsx` após confirmação de pagamento

---

### Varredura de segurança e bugs

| Item | Risco | Ação |
|------|-------|------|
| `dangerouslySetInnerHTML` em `FranchiseScreen.tsx` (benefícios) | Médio — conteúdo é hardcoded, não user-input | OK por agora, mas a função `styleEmTags` já sanitiza |
| PIX_CODE hardcoded em `PaymentScreen.tsx` | Baixo — placeholder, mas deve vir do backend | Adicionar TODO |
| Stripe publishable key hardcoded | OK — chave pública, é o padrão |
| `console.warn("[DEV BYPASS]")` em produção | Baixo — remover antes do release | Manter com flag |
| `AuthGate` `DEV_BYPASS = true` | Crítico em produção — desabilitar antes do release | Flag está marcado como temporário |
| Coupon mock aceita qualquer código hardcoded | Médio — substituir pela API real | Incluído nas correções |
| `crypto.randomUUID()` para fake authUid | OK — é dev bypass |
| Sem rate limiting no frontend para buscas de patrocinador | Baixo — backend tem proteção | OK |
| Email do login não é sanitizado/validado antes de envio | Baixo — username não é email | OK |

---

### Plano de implementação (ordem de prioridade)

1. **Username regex**: incluir ponto `.` e converter para lowercase
2. **Email duplicidade**: adicionar validação com debounce em `StepContact`
3. **Login systemId**: adicionar campo ao body da API de login
4. **Cupom via API real**: substituir mock por `validateCoupon()`
5. **Trim geral**: garantir trim em todos os campos antes do submit
6. **Rate limit na recuperação de senha**: tratar erro de bloqueio
7. **registerComplete**: integrar chamada após pagamento aprovado
8. **Mensagem system_access_denied**: tratar no login
9. **Username lowercase**: normalizar no onChange

### Notas para o backend (futuro)

- `systemId` precisa ser validado no backend (regra 1.2)
- `/api/franchise/prices` precisa ser criado para carregar preços dinamicamente
- `/api/coupon/validate` precisa receber `sponsorId` e `franchiseType`
- `/api/register/complete` precisa registrar dados do contrato (versão, IP, userAgent, aceite)
- PIX deve gerar código dinâmico via backend

