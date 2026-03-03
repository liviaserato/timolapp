

# Plano: Criar o Timol App (Escritório Digital do Franqueado)

## Visão Geral

Criar a área logada do franqueado baseada nos HTMLs de referência. O botão "Entrar" na tela de login redireciona para `/app` sem validação real. A estrutura segue o layout: **Header + Sidebar (desktop) + Footer mobile + conteúdo por página**.

## Estrutura de Arquivos

```text
src/
├── pages/
│   └── App.tsx                    # Layout principal (header, sidebar, footer, outlet)
│   └── app/
│       └── Dashboard.tsx          # Painel Inicial (boas-vindas, financeiro, metas, agenda, news)
├── components/
│   └── app/
│       ├── AppHeader.tsx          # Header azul com logo, título, user info, avatar menu
│       ├── AppSidebar.tsx         # Sidebar desktop (12 itens de nav)
│       ├── AppFooter.tsx          # Footer mobile (5 ícones: Pedidos, Financeiro, Clientes, Rede, FAT)
│       └── DashboardCard.tsx      # Card reutilizável para seções do painel
```

## Componentes Principais

### 1. Layout (`/app`) — `App.tsx`
- CSS Grid: header em cima, sidebar à esquerda (desktop), conteúdo central, footer embaixo (mobile)
- Usa `<Outlet>` do react-router para renderizar sub-páginas
- Sidebar visível apenas em `≥992px`, footer apenas em `<992px`
- Cores: header com gradiente azul `#003885 → #002d6b`, sidebar `#0047A9`

### 2. Header — `AppHeader.tsx`
- Logo Timol branco à esquerda
- Título "Escritório Digital" centralizado (desktop only)
- Direita: nome do usuário, ID switch dropdown, avatar com badge e estrelas, menu dropdown (Meus Dados, Minha Franquia, Fale Conosco, Configurações)
- Hamburger menu (mobile) para abrir sidebar como overlay

### 3. Sidebar — `AppSidebar.tsx`
- 12 itens de navegação com ícones Lucide (substituindo os SVGs originais):
  Painel Inicial, Cadastro, Franquia, Rede, Clientes, Treinamentos, Produtos, Pedidos, Financeiro, Comercial, Relatórios, Suporte
- Links apontam para sub-rotas `/app/*` (por enquanto, só Dashboard funciona; outros mostram placeholder)

### 4. Footer Mobile — `AppFooter.tsx`
- 5 ícones: Pedidos, Financeiro, Clientes, Rede, FAT
- Sticky no bottom, mesmo estilo gradiente azul

### 5. Dashboard — `Dashboard.tsx`
- Seção "Boas Vindas" com nome do usuário e frase motivacional
- Seção "Resumo Financeiro" (placeholder)
- Seção "Metas e Desafios" com checkboxes
- Seção "Agenda Semanal de Treinamentos" (placeholder)
- Seção "Timol News" com carrossel usando `embla-carousel-react`

## Rotas (App.tsx principal)

```text
/app          → Layout com Outlet
/app          → Dashboard (index route)
/app/:section → Placeholder genérico para outras seções
```

## Integração com Login

- O botão "Entrar" no Login.tsx fará `navigate("/app")` diretamente (sem validar credenciais)
- Sem proteção de rota por enquanto

## Design

- Usando Tailwind CSS (padrão do projeto), não os CSS originais
- Cores mapeadas das variáveis CSS de referência para classes Tailwind/CSS variables
- Ícones via Lucide React
- Componentes UI existentes (Card, Button, Checkbox, etc.)
- Fundo das páginas: `#f7f7f7` (bg-gray-50)
- Cards brancos com borda e sombra leve

