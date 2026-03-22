

# Integrar Frontend com Backend do Manus

## Situação atual

O projeto já possui uma camada de API bem estruturada em `src/lib/api/` com:
- **`client.ts`**: HTTP client com gestão de token (rememberMe, localStorage/sessionStorage), tratamento de 401, redirecionamento automático
- **`auth.ts`**: Login, logout, recuperação de senha (4 etapas), recuperação de username
- **`index.ts`**: Re-exporta tudo para imports centralizados
- **8 arquivos** importam de `@/lib/api` (AuthGate, AppSidebar, AppHeader, Login, ForgotPassword, ForgotUsername, Continue, login.ts)

**Problema com a proposta do Manus**: substituir `client.ts` e `auth.ts` integralmente quebraria toda a funcionalidade existente (logout, recuperação de senha, rememberMe, tratamento de erros tipados, etc.).

## Plano — Integração preservando a arquitetura existente

### 1. Apontar a URL da API para o backend do Manus
- O `client.ts` **já usa** `import.meta.env.VITE_API_BASE_URL` como base URL
- Basta adicionar a variável `VITE_API_BASE_URL` apontando para o backend do Manus
- Não precisa criar `.env.local` — usaremos o mecanismo de secrets do projeto

### 2. Ajustar `client.ts` minimamente
- Renomear a env var de `VITE_API_BASE_URL` para `VITE_API_URL` (ou vice-versa) para alinhar com o Manus — **ou manter o nome existente** e avisar o Manus
- Adicionar `console.log` de debug (`[API] METHOD url`) para facilitar testes
- **Preservar**: toda a lógica de token, rememberMe, tratamento de 401, `ApiRequestError`

### 3. Ajustar `auth.ts` minimamente
- A resposta do login do Manus retorna `{ token, user }` — o campo atual espera `{ accessToken }`
- Ajustar para aceitar ambos: `data.accessToken || data.token`
- Adicionar função `getMe()` que chama `GET /api/auth/me` (novo endpoint do Manus)
- **Preservar**: todas as funções de recovery, forgot username, tipos exportados

### 4. Login — ajuste mínimo
- O `Login.tsx` já chama `loginWithUsername()` que delega para `apiLogin()`
- Só precisa garantir que o `systemId` correto seja enviado (`timol-app` ou `timol-system` conforme o role)
- Não precisa reescrever o componente

### 5. Testar com credenciais do Manus
- Username: `admin` / Password: `admin123` / SystemId: `timol-system`

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/lib/api/client.ts` | Adicionar console.log de debug, garantir env var correta |
| `src/lib/api/auth.ts` | Aceitar `token` além de `accessToken`, adicionar `getMe()` |
| `src/lib/api/index.ts` | Exportar `getMe` |

## O que NÃO será alterado
- Estrutura de pastas e imports existentes
- Lógica de rememberMe / sessionStorage
- Tratamento de erros tipados (`ApiRequestError`)
- Funções de recovery/forgot (continuam apontando para os mesmos endpoints)
- `AuthGate`, `AppSidebar`, `AppHeader` — zero mudanças
- Nenhum `.env.local` criado manualmente (a env var será configurada como secret)

## Mensagem para o Manus
Após a integração, será necessário alinhar com o Manus que:
- O frontend envia `{ username, password, rememberMe, systemId }` no login
- O endpoint deve retornar `{ accessToken, expiresAt }` (ou o frontend aceita `{ token }` como alias)
- O `GET /api/auth/me` deve retornar `{ role, fullName, franchiseId }`

