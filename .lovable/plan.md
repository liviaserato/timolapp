

# Colocar URL do Manus direto no client.ts

## Mudança

Atualizar o fallback em `getBaseUrl()` no `src/lib/api/client.ts` para apontar diretamente para o backend do Manus, permitindo testes imediatos sem configurar Build Secrets.

### Arquivo: `src/lib/api/client.ts`

Linha ~11, trocar o fallback:

```typescript
// De:
return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "https://www.timolweb.com.br";

// Para:
return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "https://3001-islx8717rpj8ilx2h03mq-b2e90ed3.us2.manus.computer";
```

Nenhum outro arquivo precisa ser alterado.

