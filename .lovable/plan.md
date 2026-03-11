

## Plano: Bypass da validação de username para testes

Alterar `src/components/registration/StepLogin.tsx` para que, em vez de chamar a API `username-check`, sempre retorne `available` após o debounce.

**Mudança única** no `handleUsernameChange` — substituir o bloco do `fetch` por um simples `setUsernameStatus("available")`:

```typescript
const timer = setTimeout(() => {
  setUsernameStatus("available");
  onUsernameStatusChange?.("available");
}, 600);
```

Isso remove temporariamente a chamada à API externa e permite criar qualquer username.

