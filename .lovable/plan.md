

## Automacao de Cancelamento D+30 e Conclusao por Pagamento

### Objetivo
- Cadastros pendentes ha mais de 30 dias devem ter o status alterado automaticamente para "cancelled"
- Cadastros com pagamento concluido devem ter o status alterado para "completed"
- Cadastros cancelados nao aparecem mais na tela /pendentes

### Alteracoes

#### 1. Edge Function: `auto-update-registration-status`
Criar uma nova Edge Function que sera executada periodicamente (via cron) e fara duas operacoes:

**a) Cancelar cadastros com mais de 30 dias:**
```sql
UPDATE registration_status
SET status = 'cancelled', updated_at = now()
WHERE status = 'pending'
AND created_at < now() - interval '30 days'
```

**b) Concluir cadastros com pagamento confirmado:**
```sql
UPDATE registration_status
SET status = 'completed', updated_at = now()
WHERE status = 'pending'
AND payment_completed = true
```

#### 2. Cron Job
Agendar a Edge Function para rodar a cada hora (ou a cada 15 minutos, aproveitando o mesmo intervalo do cron existente).

#### 3. Atualizar `track-registration` (update mode)
Adicionar `status` na lista de campos permitidos para update, para que quando o pagamento for confirmado no frontend, o status tambem seja atualizado imediatamente para "completed" (sem esperar o cron).

No `Index.tsx`, ao confirmar pagamento, enviar tambem `status: "completed"` junto com `payment_completed: true`.

#### 4. Registrar a Edge Function no `config.toml`
Adicionar a configuracao `verify_jwt = false` para a nova funcao.

### Resumo dos Arquivos

| Arquivo | Acao |
|---|---|
| `supabase/functions/auto-update-registration-status/index.ts` | Criar - logica de cancelamento D+30 e conclusao por pagamento |
| `supabase/config.toml` | Adicionar entrada para nova funcao (automatico) |
| `supabase/functions/track-registration/index.ts` | Adicionar "status" aos allowedFields |
| `src/pages/Index.tsx` | Enviar `status: "completed"` ao confirmar pagamento |
| Cron Job (SQL) | Agendar execucao periodica da nova funcao |

### Comportamento Esperado
- A tela /pendentes ja filtra por `status = 'pending'`, entao cadastros com status "cancelled" ou "completed" desaparecem automaticamente
- Pagamentos confirmados mudam o status imediatamente (via frontend) e tambem sao cobertos pelo cron como fallback
- Cadastros abandonados por 30+ dias sao cancelados automaticamente pelo cron

