

## Plano: Aumentar data e mostrar em todas as abas

Duas mudanças simples no `ScheduleEventRow` em `src/pages/app/Treinamentos.tsx`:

1. **Aumentar tamanho da data**: Trocar `text-[10px]` por `text-xs` na label da data (linha 385), tornando-a um pouco maior mas ainda secundária ao horário.

2. **Mostrar data nas abas de dias específicos**: Na renderização dos dias individuais (linha 292), passar `showDate` como `true` — atualmente só é passado na aba "Todos". A data sempre será calculada com base no `dayIndex` do evento.

### Alterações

**`src/pages/app/Treinamentos.tsx`**
- Linha 292: adicionar `showDate` ao `ScheduleEventRow` dos dias individuais
- Linha 385: trocar `text-[10px]` por `text-xs` na span da data

