

## Plano: Armazenar o Webhook Secret do Stripe

O Webhook Signing Secret (`whsec_...`) será armazenado como secret seguro no backend, permitindo que a Edge Function `stripe-webhook` valide a assinatura dos eventos recebidos do Stripe.

### O que será feito

1. **Armazenar `STRIPE_WEBHOOK_SECRET`** como secret no backend usando a ferramenta de secrets
2. A Edge Function `stripe-webhook` já está preparada para usar esse secret — nenhuma alteração de código necessária

### Resultado

Com esse secret configurado, o webhook passará a validar a assinatura de cada evento, garantindo que apenas notificações legítimas do Stripe sejam processadas.

