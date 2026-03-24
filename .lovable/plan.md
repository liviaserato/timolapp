

## Plano: Botão Dev Bypass na tela de Login

### O que será feito
Adicionar um botão discreto "Entrar como Admin (Dev)" na tela de login que simula um login com role `admin`, gravando um token fake e a role no storage, e redirecionando para `/internal`.

### Detalhes técnicos

**Arquivo: `src/pages/Login.tsx`**
- Adicionar uma função `handleDevBypass` que:
  - Chama `setAccessToken("dev-bypass-token", true)` e `setUserRole("admin", true)` do `client.ts`
  - Navega para `/internal`
- Renderizar um botão pequeno e discreto (texto cinza, sem destaque) abaixo do formulário de login, visível apenas em desenvolvimento (`import.meta.env.DEV`)

**Arquivo: `src/components/auth/AuthGate.tsx`**
- Nenhuma alteração necessária — o `isAuthenticated()` já verifica a existência do token no storage, então o token fake será aceito

### Segurança
- O botão só aparece em ambiente de desenvolvimento (`import.meta.env.DEV`), nunca em produção

