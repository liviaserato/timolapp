

## Pagina de Cadastros Pendentes

### 1. Migracao de banco de dados

Adicionar colunas estruturais a tabela `registration_status`:

```text
city            (text, nullable)
state           (text, nullable)
country         (text, nullable)
status          (text, NOT NULL, default 'pending')
user_display_id (text, nullable)
```

### 2. Edge function `get-pending-registrations`

Criar funcao que usa service role key para consultar `registration_status WHERE status = 'pending'`, retornando todos os campos necessarios para a listagem. Sem verificacao de JWT (endpoint interno/admin).

### 3. Pagina `/pendentes`

Criar `src/pages/PendingRegistrations.tsx` com tabela exibindo:
- Nome, CPF, Cidade, Estado, Pais, ID, Patrocinador, E-mail, Telefone, Data Cadastro, Status
- Indicadores check (verde) / X (vermelho) para "E-mail enviado" e "WhatsApp enviado"
- Layout simples com componentes Table e Card existentes

### 4. Roteamento

Adicionar rota `/pendentes` no `App.tsx`.

### 5. Atualizar `track-registration`

Aceitar campos `city`, `state`, `country`, `user_display_id` no modo insert para que novos cadastros preencham essas colunas.

Registrar `get-pending-registrations` no `supabase/config.toml`.

### Secao tecnica

**Arquivos a criar:**
- `supabase/functions/get-pending-registrations/index.ts`
- `src/pages/PendingRegistrations.tsx`

**Arquivos a editar:**
- `src/App.tsx` (nova rota)
- `supabase/functions/track-registration/index.ts` (novos campos no insert)
- `supabase/config.toml` (registrar nova funcao)

**Migracao SQL:**
```sql
ALTER TABLE public.registration_status
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS user_display_id text;
```

**Nota:** O registro existente da Samara recebera automaticamente `status = 'pending'` (valor default) e aparecera na listagem. Campos city, state, country e user_display_id ficarao vazios ate serem preenchidos por cadastros futuros.

