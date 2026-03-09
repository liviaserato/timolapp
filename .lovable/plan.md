

## Tela Financeiro — Plano de Implementação

A tela será criada em `src/pages/app/Financeiro.tsx` com rota dedicada no `App.tsx`, usando os mesmos componentes visuais (`DashboardCard`, `Dialog`, `Badge`, `Tabs`, `Table`) e padrões de interação já presentes no projeto.

### Estrutura de Arquivos

```text
src/pages/app/Financeiro.tsx          ← Página principal (rota /app/financeiro)
src/components/app/financeiro/
  ├── BonusSummaryCard.tsx            ← Container "Saldo de Bônus"
  ├── BancoTimolCard.tsx              ← Container "Banco Timol" + ações
  ├── AddBalanceDialog.tsx            ← Popup "Adicionar Saldo" (PIX/Cartão)
  ├── WithdrawDialog.tsx              ← Popup "Resgatar Saldo" (valor + taxa + PIN)
  ├── BonusExtractTable.tsx           ← Tabela extrato Bônus e Pontos + filtros
  ├── BancoTimolExtractTable.tsx      ← Tabela extrato Banco Timol
  ├── PrizesSection.tsx               ← Seção Prêmios (qualificação + vitrine)
  └── PrizeRedeemDialog.tsx           ← Popup resgate de prêmio + PIN
```

### Layout da Página

1. **Header**: "Financeiro" + subtítulo, mesmo padrão do Cadastro e Dashboard
2. **Containers de resumo** (grid 2 colunas no desktop):
   - **Saldo de Bônus**: "Previsto para próxima sexta" + "Aguardando liberação" + nota sobre pagamento às sextas (14 dias)
   - **Banco Timol**: "Saldo Disponível" + "Resgate Solicitado" (condicional) + botões "Resgatar saldo" e "Adicionar saldo"
3. **Extratos** (abas via `Tabs`): "Bônus e Pontos" | "Banco Timol"
4. **Prêmios**: qualificação atual, pontos, aviso de expiração, vitrine de cards

### Detalhes dos Componentes

**BonusSummaryCard**: Dois valores em mini-cards internos (mesmo estilo do Dashboard "Resumo Financeiro") + texto discreto explicativo.

**BancoTimolCard**: Saldo em destaque, resgate solicitado em amarelo/warning quando existir, dois botões de ação (`Button` outline).

**AddBalanceDialog**: 
- Input de valor
- Seleção PIX/Cartão (condicional: PIX só se `isBrazilian && currency === BRL`)
- Reutiliza o mesmo padrão visual de pagamento do `PaymentScreen` (QR Code para PIX, form de cartão)
- Popup de confirmação "Saldo Adicionado" ao final

**WithdrawDialog**:
- Input de valor + exibição automática do valor líquido (após taxas)
- Botão confirmar → fluxo PIN 6 dígitos (input-otp, mesmo padrão existente)
- Popup "Resgate Confirmado" com previsão de depósito (próxima sexta)

**BonusExtractTable** (usando componente `Table`):
- Colunas: Data | ID | Qualificação (badge) | Tipo Movimentação | Pontos | Valor
- Filtros acima: DateRange (dois inputs date), botões toggle por tipo (Unilevel, Binário, Fixo, Depósito, Pedido, Resgate), campo busca por ID
- Qualificações com badges coloridos: Consultor, Distribuidor, Líder, Rubi, Esmeralda, Diamante
- Valores negativos em vermelho

**BancoTimolExtractTable**: 
- Colunas: Data | Descrição | Valor
- Valores negativos em vermelho

**PrizesSection**:
- Qualificação atual + total de pontos no topo
- Aviso de expiração de pontos (condicional, em amarelo)
- Grid de cards de prêmios com: nome, pontos necessários, descrição curta, botão "Quero esse"

**PrizeRedeemDialog**:
- Descrição detalhada do prêmio
- Confirmação → PIN por e-mail (mesmo fluxo do WithdrawDialog)
- Popup "Resgate Confirmado" com mensagem de contato da equipe

### Moeda Dinâmica

Todos os valores usarão helper de formatação baseado na franquia (mesmo padrão do `PaymentScreen`): `BRL → R$`, `EUR → €`, `USD → US$`. PIX condicional: só aparece se `currency === BRL && country === BR`.

### Rota

Registrar `Financeiro` no `App.tsx` como rota dedicada `/app/financeiro` (substituindo o `SectionPlaceholder` atual que já captura essa rota via `:section`).

### Dados

Tudo com dados mock por enquanto (arrays estáticos de extratos, prêmios, saldos). A estrutura ficará pronta para substituição por chamadas reais à API.

### Tarefas

1. Criar componentes de resumo (BonusSummaryCard + BancoTimolCard)
2. Criar dialogs de ação (AddBalanceDialog + WithdrawDialog com PIN)
3. Criar tabelas de extrato com filtros (BonusExtractTable + BancoTimolExtractTable)
4. Criar seção de Prêmios (PrizesSection + PrizeRedeemDialog)
5. Montar página Financeiro.tsx e registrar rota no App.tsx

