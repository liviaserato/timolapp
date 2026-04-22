---
name: features/rede/sorting-logic
description: Sort control pattern in network screens (Binary/Unilevel) — generic field + direction button
type: feature
---

Nas telas de Binário e Unilevel (modo franqueado, /app/rede), a classificação utiliza o componente compartilhado `SortControl` (src/components/app/rede/SortControl.tsx), que segue o padrão da tela /internal/produtos:

- Botão de direção (asc/desc/neutral) à esquerda + dropdown de campo à direita, agrupados visualmente (rounded-r-none / rounded-l-none).
- Ciclo do botão: neutral → desc → asc → desc...
- Ícones: `ArrowUpDown` (neutral), `ArrowUp` (asc), `ArrowDown` (desc).
- Tooltip do botão muda conforme o campo: Pontuação/Qualificação ("Maior → Menor"), Data ("Mais recentes → Mais antigos"), Nome ("Z → A"), Status ("Ativos primeiro" / "Inativos primeiro").

**Campos genéricos do dropdown** (substituem os antigos rótulos compostos como "Maior pontuação", "Ativos primeiro"):
- Status
- Pontuação
- Qualificação
- Data de cadastro
- Nome

**Compatibilidade interna:** o helper `toLegacySortMode(field, dir)` mapeia o par (field, dir) para o `LegacySortMode` consumido por `sortMembers` (BinaryTab/UnilevelTab) e por `UnilevelOrgChart`. Modos legacy: `points`, `points_asc`, `date_newest`, `date_oldest`, `qualification`, `qualification_asc`, `name_asc`, `name_desc`, `status`, `status_inactive_first`, `default`.

Ao selecionar um campo com direção neutra, a direção é automaticamente definida como `desc` para refletir a ordenação mais comum.
