

# Criar Documento de Responsabilidades — Lovable vs Manus (em PT-BR)

## O que será criado

Um arquivo `docs/responsabilidades-lovable-manus.md` com todo o conteúdo em português, contendo:

### Estrutura do documento

1. **Visão Geral do Ecossistema Timol** — lista dos sistemas (Timol App, Timol System, Timol Flix, Timol Estoque, Timol Money, Timol FAT) e como se conectam

2. **Divisão de Responsabilidades**
   - **Lovable (Frontend)**: UI/UX, componentes React/Tailwind/shadcn, i18n (PT/EN/ES por sistema), consumo de APIs (`src/lib/api/`), validações client-side, estado local, carrinho, fluxos visuais
   - **Manus (Backend)**: APIs REST (.NET Core), autenticação/JWT, banco de dados, regras de negócio (bônus, rede, qualificação), processamento de pagamentos, envio de emails/notificações/WhatsApp, CRON jobs, integrações externas

3. **Protocolo de Comunicação** — fluxo "UI-first": Lovable cria o componente com mock → define o contrato esperado → Manus implementa o endpoint → Lovable conecta

4. **O que o Lovable NÃO faz** (para colar no Manus):
   - Não define regras de negócio
   - Não envia emails/notificações
   - Não gerencia banco diretamente (apenas leitura via API)
   - Não processa pagamentos

5. **O que o Manus NÃO faz** (para colar no Lovable):
   - Não define layout, cores, responsividade
   - Não gerencia traduções
   - Não cria componentes visuais

6. **Estado Atual do Timol App** — resumo do que já existe:
   - Módulos: Dashboard, Cadastro, Financeiro, Rede (Binário/Unilevel/Líder), Pedidos/Loja, Treinamentos, Suporte, Clientes, Configurações
   - APIs já consumidas: login, registro (2 estágios), sponsor lookup/suggest, document check, cupons, pagamentos, recuperação de senha, tickets
   - Edge Functions existentes (28 funções)
   - i18n: ~600+ chaves em PT/EN/ES
   - Auth: JWT via API externa com `AuthGate` e `DEV_BYPASS`

7. **Texto pronto para colar no Manus** — bloco formatado explicando o papel do Lovable, o que ele já construiu, e o que espera do backend

### Detalhes técnicos
- Arquivo: `docs/responsabilidades-lovable-manus.md`
- Idioma: Português BR
- Inclui o Timol System na lista de sistemas
- Menciona que i18n é controle 100% do frontend e cada sistema decide se precisa

