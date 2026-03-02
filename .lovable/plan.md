
## Ajuste de espaçamento no card de login

Alterações no arquivo `src/pages/Login.tsx`, no bloco "Logo + title" (linhas 85-93):

1. **Aumentar espaço entre logo e titulo**: Trocar `space-y-4` por layout manual -- adicionar `mb-6` na logo para afastá-la do título
2. **Diminuir espaço entre titulo e texto descritivo**: Adicionar `mt-1` no parágrafo de subtítulo para mantê-lo próximo ao título

### Detalhe técnico

Substituir o container atual:
```tsx
<div className="text-center space-y-4">
  <img ... className="h-10 mx-auto" />
  <h1 ...>{t("login.title")}</h1>
  <p ...>{t("login.subtitle")}</p>
</div>
```

Por:
```tsx
<div className="text-center">
  <img ... className="h-10 mx-auto mb-6" />
  <h1 ...>{t("login.title")}</h1>
  <p className="text-xs text-muted-foreground mt-1">
    {t("login.subtitle")}
  </p>
</div>
```

- `mb-6` na logo cria mais distância antes do título (era `space-y-4` = 1rem, agora 1.5rem)
- `mt-1` no subtítulo mantém apenas 0.25rem de distância do título (antes era 1rem)
