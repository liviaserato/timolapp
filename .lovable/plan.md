

## Layout do checkbox "Não sou brasileiro(a)"

### Situação atual
O checkbox fica na linha do label "Documento/CPF", e o campo "País emissor" aparece **abaixo** do documento quando marcado.

### Nova estrutura

**Quando desmarcado (brasileiro):**
```text
┌─────────────────────────────────────────┐
│ CPF                    ☐ Não sou brasileiro │
│ [_________________________]                 │
└─────────────────────────────────────────┘
```

**Quando marcado (estrangeiro):**
```text
┌─────────────────────────────────────────┐
│ País emissor           ☑ Não sou brasileiro │
│ [_________________________]                 │
│                                             │
│ Documento                                   │
│ [_________________________]                 │
│ (hint amarelo)                              │
└─────────────────────────────────────────┘
```

### Alterações em `StepPersonal.tsx`
1. Reorganizar o JSX para que, quando `isForeigner`:
   - O checkbox fique na linha do label "País emissor do documento" (primeiro campo)
   - O campo "País emissor" + dropdown venha primeiro
   - O campo "Documento" venha abaixo, sem o checkbox na sua linha
2. Quando não é estrangeiro:
   - O checkbox fica na linha do label "CPF" (comportamento atual)
   - País emissor não aparece

O checkbox visualmente nunca muda de posição — sempre à direita do primeiro campo.

