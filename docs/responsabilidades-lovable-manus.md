# Divisão de Responsabilidades — Lovable (Frontend) vs Manus (Backend)

> Documento de referência para o ecossistema Timol. Última atualização: Março 2026.

---

## 1. Visão Geral do Ecossistema Timol

| Sistema | Descrição | Público-alvo | i18n |
|---------|-----------|--------------|------|
| **Timol App** | Escritório virtual do franqueado | Franqueados | PT / EN / ES |
| **Timol System** | Painel administrativo interno | Equipe Timol | Apenas PT |
| **Timol Flix** | Hub de material de apoio ao franqueado | Franqueados | A definir |
| **Timol Estoque** | Gestão de estoque e logística | Equipe Timol | Apenas PT |
| **Timol Money** | Gestão financeira e pagamentos | Equipe Timol | Apenas PT |
| **Timol FAT** | Plataforma de treinamentos | Franqueados + Equipe | A definir |

### Conexão entre sistemas

- Todos compartilham o **mesmo banco de dados** e **dados de autenticação**
- **Login único** (SSO) — o usuário se autentica uma vez e pode acessar os sistemas que seu perfil permite
- Cada sistema é um **projeto separado no Lovable**, com layout e traduções independentes
- O Lovable consegue acessar outros projetos para copiar padrões de layout via `cross_project`

---

## 2. Divisão de Responsabilidades

### 🎨 Lovable (Frontend)

| Área | Detalhes |
|------|----------|
| **UI/UX** | Componentes React, Tailwind CSS, shadcn/ui, design system |
| **Layout e responsividade** | Sidebar, header, cards, tabelas, modais, mobile-first |
| **Internacionalização (i18n)** | Gerencia traduções por sistema (PT/EN/ES). Controle 100% do frontend — cada sistema decide se precisa de tradução |
| **Consumo de APIs** | Todas as chamadas HTTP via `src/lib/api/` com tipagem TypeScript |
| **Validações client-side** | Máscaras de input, formatos, campos obrigatórios antes de enviar ao backend |
| **Estado local** | Carrinho, filtros, abas, dados de sessão, contextos React |
| **Fluxos visuais** | Wizards de cadastro, fluxos de pagamento (UI), onboarding |
| **Dados mock** | Dados fictícios para montar e testar telas antes da API estar pronta |

### ⚙️ Manus (Backend)

| Área | Detalhes |
|------|----------|
| **APIs REST** | Endpoints .NET Core que o frontend consome |
| **Autenticação / JWT** | Login, geração e validação de tokens, refresh, permissões por role |
| **Banco de dados** | Modelagem, migrations, queries, índices, integridade |
| **Regras de negócio** | Cálculo de bônus, qualificação de rede, comissões, pontuação, graduações |
| **Pagamentos** | Processamento Stripe/Pix, webhooks, conciliação |
| **Comunicações** | Envio de emails transacionais, notificações push, mensagens WhatsApp |
| **CRON jobs** | Tarefas agendadas (verificar cadastros incompletos, expirar tokens, etc.) |
| **Integrações externas** | Gateways de pagamento, APIs de terceiros, serviços de envio |
| **Segurança** | Rate limiting, bloqueio de login, proteção contra brute force |

---

## 3. Protocolo de Comunicação (Fluxo "UI-First")

```
┌─────────────────────────────────────────────────────────────┐
│  1. LOVABLE cria o componente com dados mock                │
│     → Define o layout, comportamento e estados              │
│                                                             │
│  2. LOVABLE documenta o contrato esperado                   │
│     → "O frontend vai chamar GET /api/x"                    │
│     → "Espera receber { campo1, campo2, campo3 }"           │
│     → Registra em docs/api-contract.md                      │
│                                                             │
│  3. MANUS implementa o endpoint                             │
│     → Segue o contrato definido                             │
│     → Retorna os dados no formato esperado                  │
│                                                             │
│  4. LOVABLE conecta a API real                              │
│     → Substitui mock pela chamada real em src/lib/api/      │
│     → Testa e ajusta                                        │
└─────────────────────────────────────────────────────────────┘
```

### Referência compartilhada

Ambos os lados consultam o arquivo `docs/api-contract.md` como fonte da verdade para contratos de API.

---

## 4. O que o Lovable NÃO faz

> ⚠️ Se alguém pedir isso ao Lovable, ele deve avisar que é responsabilidade do backend.

- ❌ Não define regras de negócio (cálculos de bônus, qualificação, graduação)
- ❌ Não envia emails, notificações ou mensagens WhatsApp
- ❌ Não gerencia banco de dados diretamente (apenas lê/grava via API)
- ❌ Não processa pagamentos (apenas exibe a UI de pagamento)
- ❌ Não implementa autenticação server-side (apenas consome tokens JWT)
- ❌ Não faz rate limiting ou bloqueio de login (apenas exibe mensagens do backend)
- ❌ Não cria endpoints de API (apenas os consome)

---

## 5. O que o Manus NÃO faz

> ⚠️ Se alguém pedir isso ao Manus, ele deve avisar que é responsabilidade do frontend.

- ❌ Não define layout, cores, espaçamento ou responsividade
- ❌ Não gerencia traduções (i18n é 100% frontend)
- ❌ Não cria componentes visuais (React/shadcn)
- ❌ Não decide a UX de formulários, modais ou fluxos de navegação
- ❌ Não aplica máscaras de input ou validações visuais
- ❌ Não gerencia estado do carrinho, filtros ou abas

---

## 6. Estado Atual do Timol App

### Módulos implementados (UI)

| Módulo | Rota | Status |
|--------|------|--------|
| Dashboard / Painel Inicial | `/app` | ✅ Completo |
| Cadastro (dados pessoais, endereço, financeiro, documentos, franquias) | `/app/cadastro` | ✅ Completo |
| Atualização Cadastral | `/app/atualizacao-cadastral` | ✅ Completo |
| Financeiro (carteira, bônus, pontos, extrato) | `/app/financeiro` | ✅ Completo |
| Rede — Binário | `/app/rede` (aba Binário) | ✅ Completo |
| Rede — Unilevel | `/app/rede` (aba Unilevel) | ✅ Completo |
| Rede — Líder de Fechamento | `/app/rede` (aba Líder) | ✅ Completo |
| Pedidos (histórico) | `/app/pedidos` | ✅ Completo |
| Realizar Pedido (loja + carrinho) | `/app/realizar-pedido` | ✅ Completo |
| Checkout + Pagamento | `/app/checkout` | ✅ Completo |
| Clientes (vendas, loja virtual, material de apoio) | `/app/clientes` | ✅ Completo |
| Treinamentos (agenda, ao vivo) | `/app/treinamentos` | ✅ Completo |
| Suporte (tickets, FAQ, mapa) | `/app/suporte` | ✅ Completo |
| Configurações | `/app/configuracoes` | ✅ Completo |
| Login + Recuperação de senha | `/` | ✅ Completo |
| Cadastro novo franqueado (wizard 4 etapas) | `/cadastro/:sponsorId` | ✅ Completo |

### APIs já consumidas pelo frontend

```
POST /api/auth/login              → login com username/senha
POST /api/auth/forgot-password    → solicitar PIN de recuperação
POST /api/auth/verify-pin         → verificar PIN
POST /api/auth/reset-password     → redefinir senha
POST /api/auth/forgot-username    → recuperar username por email/documento
POST /api/auth/change-password    → alterar senha (autenticado)

GET  /api/sponsors/:id            → buscar patrocinador
GET  /api/sponsors/suggest        → sugerir patrocinadores

POST /api/people/document-check   → verificar documento (CPF/CNPJ)
POST /api/people/email-check      → verificar email disponível
POST /api/people/username-check   → verificar username disponível
POST /api/people/register-pending → registro etapa 1
POST /api/people/register-complete→ registro etapa 2

POST /api/payments/create-checkout→ criar sessão de pagamento Stripe
POST /api/payments/manual-approve → aprovar pagamento manual

POST /api/coupons/validate        → validar cupom de desconto

GET  /api/registrations/pending   → listar cadastros pendentes (admin)
POST /api/registrations/notes     → adicionar nota a cadastro

POST /api/support/tickets         → tickets de suporte
POST /api/support/ticket-feedback → feedback de ticket fechado
```

### Infraestrutura

- **Edge Functions**: 28 funções implantadas (auth, checkout, documentos, email, suporte, etc.)
- **i18n**: ~600+ chaves de tradução em 3 idiomas (PT/EN/ES)
- **Auth**: JWT via API externa com `AuthGate` no frontend (`DEV_BYPASS = true` enquanto API não está pronta)
- **Design System**: shadcn/ui + Tailwind CSS + tema customizado Timol (azul escuro, gradientes no header/sidebar)
- **Responsividade**: Mobile-first, sidebar colapsável, header adaptativo

---

## 7. Texto para Colar no Manus

> Copie o bloco abaixo e cole como instrução/contexto no Manus.

---

```markdown
# Contexto: Ecossistema Timol — Papel do Backend (Manus)

## Sua função
Você é responsável pelo backend de todos os sistemas Timol. Isso inclui:
- APIs REST (.NET Core)
- Autenticação (JWT, login, permissões, roles, SSO entre sistemas)
- Banco de dados (modelagem, migrations, queries)
- Regras de negócio (bônus, qualificação de rede, comissões, graduações)
- Processamento de pagamentos (Stripe, Pix, webhooks)
- Envio de comunicações (emails transacionais, notificações, WhatsApp)
- Tarefas agendadas (CRON jobs)
- Segurança (rate limiting, bloqueio de login por tentativas, proteção contra brute force)

## O que você NÃO faz
- Não cria componentes visuais (React, HTML, CSS) — isso é feito pelo Lovable
- Não gerencia traduções (i18n) — controle 100% do frontend
- Não decide layout, cores ou UX — apenas fornece dados via API
- Não aplica máscaras de input ou validações visuais

## Sistemas do ecossistema
| Sistema | Descrição | Público |
|---------|-----------|---------|
| Timol App | Escritório virtual do franqueado | Franqueados |
| Timol System | Painel administrativo interno | Equipe Timol |
| Timol Flix | Hub de material de apoio | Franqueados |
| Timol Estoque | Gestão de estoque/logística | Equipe Timol |
| Timol Money | Gestão financeira | Equipe Timol |
| Timol FAT | Plataforma de treinamentos | Franqueados + Equipe |

Todos compartilham o mesmo banco de dados e sistema de autenticação (login único/SSO).

## Fluxo de trabalho com o Frontend (Lovable)
1. O Lovable cria a tela com dados mock e define o contrato da API
2. Você implementa o endpoint seguindo o contrato
3. O Lovable conecta a API real
4. Referência compartilhada: docs/api-contract.md

## Estado atual do Timol App (frontend já construído)
O Timol App já possui todas as telas implementadas no frontend:
- Login, cadastro de franqueado (wizard 4 etapas), recuperação de senha
- Dashboard, Cadastro (dados pessoais/endereço/financeiro/documentos/franquias)
- Financeiro (carteira, bônus, pontos, extrato com filtros)
- Rede (Binário com árvore visual, Unilevel com organograma, Líder de Fechamento)
- Pedidos (histórico + loja com carrinho + checkout com Stripe)
- Clientes (vendas, loja virtual, material de apoio)
- Treinamentos (agenda, transmissão ao vivo)
- Suporte (tickets, FAQ, mapa do escritório)
- Configurações (preferências, idioma, email previews)

### APIs que o frontend já consome (e que você precisa implementar):
- POST /api/auth/login, forgot-password, verify-pin, reset-password, forgot-username, change-password
- GET /api/sponsors/:id, GET /api/sponsors/suggest
- POST /api/people/document-check, email-check, username-check, register-pending, register-complete
- POST /api/payments/create-checkout, manual-approve
- POST /api/coupons/validate
- GET /api/registrations/pending, POST /api/registrations/notes
- POST /api/support/tickets, POST /api/support/ticket-feedback

O contrato detalhado de cada endpoint está em docs/api-contract.md.

## Regra importante
Se eu te pedir algo que é responsabilidade do frontend (layout, tradução, componente visual),
me avise: "Isso é responsabilidade do Lovable (frontend). Posso ajudar com a parte de dados/API."
```

---

*Este documento é mantido pelo Lovable e deve ser atualizado sempre que novos módulos ou APIs forem adicionados.*
