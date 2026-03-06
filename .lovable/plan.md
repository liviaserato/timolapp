

## Plano: Integração Stripe para pagamentos de franquia

### Pré-requisito

A ferramenta de ativação do Stripe está com instabilidade temporária. Assim que estiver disponível, vou ativá-la e ela vai solicitar sua **Secret Key** de forma segura. A chave ficará armazenada como secret no backend, nunca exposta no código.

### Arquitetura

```text
┌──────────────┐     ┌────────────────────────┐     ┌─────────┐
│ PaymentScreen│────▶│ EF: create-checkout     │────▶│ Stripe  │
│ (frontend)   │     │ (cria Payment Intent)   │     │   API   │
└──────────────┘     └────────────────────────┘     └─────────┘
                              │
                     ┌────────▼───────────────┐
                     │ EF: stripe-webhook      │
                     │ (confirma pagamento)     │
                     └─────────────────────────┘
```

### O que será feito

**1. Armazenar a Stripe Secret Key**
- Adicionar `STRIPE_SECRET_KEY` como secret seguro no backend

**2. Criar Edge Function `create-checkout`**
- Recebe: `franchiseTypeCode`, `price`, `currency`, `customerEmail`, `franchiseId`, `installments` (para BRL)
- Cria um Payment Intent no Stripe com os dados da franquia
- Retorna `clientSecret` para o frontend

**3. Criar Edge Function `stripe-webhook`**
- Recebe eventos do Stripe (`payment_intent.succeeded`, `payment_intent.payment_failed`)
- Atualiza o status do registro no banco (registration_status → `payment_completed`)
- Valida a assinatura do webhook com `STRIPE_WEBHOOK_SECRET`

**4. Atualizar `PaymentScreen.tsx`**
- Ao confirmar cartão de crédito: chamar `create-checkout` para obter o `clientSecret`
- Usar Stripe.js (`@stripe/stripe-js`) para confirmar o pagamento no frontend
- Remover a lógica mock atual (random approval, test name "LIVIA")
- PIX continua como está (sem Stripe por enquanto)

**5. Atualizar `Index.tsx`**
- O fluxo pós-pagamento será determinado pelo resultado real do Stripe:
  - Sucesso → `paymentConfirmation`
  - Falha/pendente → `paymentPending`

**6. Configurar `config.toml`**
- Adicionar `create-checkout` e `stripe-webhook` com `verify_jwt = false`

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `supabase/functions/create-checkout/index.ts` | Criar |
| `supabase/functions/stripe-webhook/index.ts` | Criar |
| `supabase/config.toml` | Editar (add funções) |
| `src/components/screens/PaymentScreen.tsx` | Editar (integrar Stripe.js) |
| `src/pages/Index.tsx` | Editar (ajustar fluxo pós-pagamento) |
| `package.json` | Adicionar `@stripe/stripe-js` |

### Próximo passo imediato

Preciso ativar a integração Stripe para armazenar sua Secret Key. Vou tentar novamente na próxima mensagem.

