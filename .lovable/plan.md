

## Padronização de nomenclatura de IDs

### Situação atual

| Onde | Campo | Significado |
|------|-------|-------------|
| Frontend (`WizardData`) | `authUserId` | UUID interno do Supabase Auth |
| Frontend (`WizardData`) | `franchiseId` | ID público da franquia (6 dígitos) |
| Banco de dados (`registration_status`) | `user_id` | UUID interno (ref auth) |
| Banco de dados (`registration_status`) | `user_display_id` | ID público (6 dígitos) |
| Banco de dados (`profiles`) | `user_id` | UUID interno (ref auth) |

### Recomendação

- **`authUserId`** → manter. É o UUID do sistema de autenticação, não tem relação com franquia. Nome claro e padrão.
- **`user_display_id`** → **renomear para `franchise_id`** no banco e em todas as Edge Functions que o referenciam. Esse campo representa o ID da franquia, não do usuário.
- **`user_id`** nas tabelas → manter. É a referência ao auth.users, convenção padrão do backend.

### Resumo das mudanças

1. **Migração SQL**: renomear coluna `user_display_id` → `franchise_id` na tabela `registration_status`
2. **Edge Functions** que leem/escrevem `user_display_id`: atualizar para `franchise_id` (~6 funções: `track-registration`, `get-pending-registrations`, `continue-registration`, `send-recovery-email`, `check-incomplete-registrations`, `resume-registration`)
3. **Frontend**: onde o código referencia `user_display_id` (ex: `PendingRegistrations.tsx`), trocar para `franchise_id`
4. **Atualizar memória** `registration-api-contract` para refletir o novo nome

### Resultado final padronizado

| Campo | Significado |
|-------|-------------|
| `user_id` (DB) / `authUserId` (frontend) | UUID interno de autenticação |
| `franchise_id` (DB) / `franchiseId` (frontend) | ID público da franquia |

