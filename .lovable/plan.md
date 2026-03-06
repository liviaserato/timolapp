

## Plano: Bypass temporário de login para desenvolvimento

### O que será feito

Adicionar um **modo de desenvolvimento** no `AuthGate` que simula autenticação, permitindo acesso direto ao `/app` sem login real.

### Implementação

1. **`src/components/auth/AuthGate.tsx`** — Adicionar flag `DEV_BYPASS`:
   - Quando `DEV_BYPASS = true` e `mode === "protected"`, renderizar os children diretamente sem verificar token
   - Quando `DEV_BYPASS = true` e `mode === "guest"`, não redirecionar para `/app`

2. **`src/pages/Login.tsx`** — Adicionar botão temporário "Entrar como Dev" que:
   - Seta um token fake no localStorage (`setAccessToken("dev-bypass", true)`)
   - Navega para `/app`

### Resultado

Você poderá acessar e visualizar todas as telas do `/app` sem depender da API de autenticação. Quando a API estiver pronta, basta remover o bypass (mudar flag para `false`).

