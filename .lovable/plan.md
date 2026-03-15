

## Problema

O card de acúmulo de pontos/bônus é renderizado condicionalmente em `OrderDetailDialog.tsx` (linha 260):

```tsx
{(order.pointsUnilevel || order.pointsBinary) && ( ... )}
```

Não há filtro por status. O pedido confirmado #4985 (id "3") simplesmente não possui `pointsUnilevel` nem `pointsBinary` nos dados mock, então o card não aparece.

## Solução

Adicionar os campos `pointsUnilevel` e `pointsBinary` aos pedidos mock que ainda não os possuem (ids "3", "6", "9") em `src/pages/app/Pedidos.tsx`, para que o card apareça em todos os pedidos.

Pedidos cancelados (ids "5", "10") podem continuar sem pontos, já que faz sentido não acumular pontos em pedidos cancelados.

