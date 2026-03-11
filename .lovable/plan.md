

## Página Administrativa — Preview de E-mails Transacionais

### Objetivo
Criar uma página dentro do app (`/app/configuracoes/emails`) que renderiza preview de todos os 10 templates de e-mail transacionais com dados fictícios, permitindo ao admin visualizar como cada e-mail ficará.

### Abordagem
Como os templates originais usam imports Deno (`npm:react`, `npm:@react-email/components`), não é possível importá-los diretamente no frontend Vite. A solução é **recriar versões "espelho" dos templates** usando React Email com imports normais do npm (já que `@react-email/components` pode ser instalado como dependência do projeto), ou — mais simples e sem dependência extra — renderizar os templates como **HTML estático em iframes** gerados inline.

A abordagem mais prática: criar componentes React puros que replicam a estrutura visual dos templates usando os mesmos inline styles, sem precisar de `@react-email/components`. Isso evita instalar pacotes extras e mantém fidelidade visual.

### Estrutura

1. **Nova página**: `src/pages/app/EmailPreviews.tsx`
   - Lista dos 10 templates em cards/tabs
   - Cada template renderiza um preview com dados mock em um iframe (via `srcdoc`)
   - Templates: Confirmação de E-mail, Recuperação de Senha, Magic Link, Convite, Alteração de E-mail, Reautenticação (PIN), Cadastro Pendente, Cadastro Concluído, Senha Alterada, Chamado Concluído

2. **Arquivo de templates HTML**: `src/components/app/configuracoes/email-preview-templates.ts`
   - Funções que retornam HTML string para cada template, usando os mesmos inline styles dos originais
   - Dados mock pré-preenchidos (nomes, IDs, URLs fictícias)

3. **Rota**: Adicionar em `App.tsx` como rota filha de `/app`
   - `<Route path="configuracoes/emails" element={<EmailPreviews />} />`

### Layout da Página
- Título "Templates de E-mail" no topo
- Select ou tabs para escolher o template
- Preview renderizado em iframe com largura fixa de 600px (largura padrão de e-mail), centralizado
- Nome e descrição do template acima do preview

### Dados Mock por Template
- **Signup**: João Silva, joao@email.com
- **Recovery/Magic Link**: URLs fictícias
- **Invite**: Timol, URL fictícia
- **Email Change**: antigo@email.com → novo@email.com
- **Reauthentication**: PIN 847291
- **Cadastro Pendente**: ID TML-001234, Patrocinador Maria Santos
- **Cadastro Concluído**: Franquia Ouro, username joaosilva
- **Senha Alterada**: João Silva
- **Chamado Concluído**: Chamado #SUP-0042, feedback URLs

