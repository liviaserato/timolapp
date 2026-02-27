

## Problema

O INSERT na tabela `registration_status` retorna erro 401 porque:
1. O signup do usuario requer confirmacao de email
2. Sem email confirmado, o usuario nao tem sessao autenticada
3. A RLS policy exige `auth.uid() = user_id`, que falha pois `auth.uid()` e null

## Solucao

Mover o INSERT de `registration_status` do frontend para uma **backend function** que usa service role key (bypassa RLS).

### Etapas

1. **Criar edge function `track-registration`** que recebe os dados e insere/atualiza `registration_status` usando service role key
   - Recebe: user_id, full_name, email, document, sponsor_name, sponsor_id
   - Tambem aceita updates parciais (franchise_selected, payment_completed)

2. **Atualizar `RegistrationWizard.tsx`** para chamar `supabase.functions.invoke("track-registration")` em vez de `supabase.from("registration_status").insert()`

3. **Atualizar `Index.tsx`** para usar a mesma edge function nos updates de status (franchise_selected, payment_completed)

4. **Registrar a funcao no `supabase/config.toml`** com `verify_jwt = false`

### Detalhes Tecnicos

A edge function tera dois modos:
- **insert**: cria o registro inicial (chamado no submit do wizard)
- **update**: atualiza campos como `franchise_selected` e `payment_completed` (chamado nas telas seguintes)

Isso resolve o problema de RLS sem precisar alterar as policies existentes, mantendo a seguranca da tabela.

