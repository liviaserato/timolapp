

## Plano

### 1. Trocar icone de Busca: Search por SearchCheck
No arquivo `src/pages/PendingRegistrations.tsx`, substituir o import e uso do icone `Search` (lupa) pelo `SearchCheck` (lupa com check) no componente `SponsorTypeBadge`.

### 2. Corrigir dados de teste no banco
Atualizar os registros da Livia e Samara para terem `sponsor_source = 'search'`, pois atualmente estao como NULL e por isso nenhum icone aparece.

### Detalhes tecnicos

**Arquivo:** `src/pages/PendingRegistrations.tsx`
- Trocar `Search` por `SearchCheck` no import do lucide-react
- Trocar `<Search ...` por `<SearchCheck ...` no componente `SponsorTypeBadge`

**Banco de dados (SQL):**
```sql
UPDATE registration_status 
SET sponsor_source = 'search' 
WHERE id IN ('f316b5a5-0988-4506-985d-94f5dff3d7e5', '7b4735f6-bd9f-4b4a-92de-2cdd6cac9852');
```

