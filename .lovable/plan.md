

# Visualizacao dos E-mails de Recuperacao e Boas-Vindas

## Objetivo
Criar uma pagina de preview (`/emails`) com duas abas para visualizar os dois modelos de e-mail com dados ficticios, sem integrar envio real.

## O que sera feito

### 1. Criar pagina `src/pages/EmailPreviews.tsx`
- Pagina com duas abas (Tabs): **Cadastro Pendente** e **Cadastro Concluido**
- Cada aba renderiza o HTML do respectivo e-mail dentro de um iframe (via `srcdoc`), simulando exatamente como o destinatario veria no cliente de e-mail
- Container com `max-width: 700px` centralizado, com borda sutil ao redor do iframe para simular uma "caixa de e-mail"
- Dados ficticios pre-preenchidos:
  - Nome: Maria Silva
  - ID: 1587
  - CPF: 123.456.789-00
  - Patrocinador: João Santos (ID 842)
  - E-mail: maria@exemplo.com
  - Franquia: Ouro
  - Pagamento: Cartao final 4521, 3x R$ 333,00

### 2. E-mail 1 - Cadastro Pendente (ja existe)
- Reutilizar o HTML que ja esta em `supabase/functions/send-recovery-email/index.ts` (funcao `buildEmailHtml`)
- Recriar a mesma funcao no frontend apenas para preview, preenchendo com os dados ficticios
- Conteudo: saudacao, resumo de dados, botao "CONTINUAR CADASTRO", secao de video, botao WhatsApp, fechamento

### 3. E-mail 2 - Cadastro Concluido (novo)
- Criar o HTML do e-mail de boas-vindas seguindo o mesmo estilo visual (inline CSS, max-width 600px, mesma paleta de cores)
- Conteudo:
  - Logo Timol
  - Saudacao: "Parabens, [Nome]! Sua franquia [Nome Franquia] foi ativada com sucesso!"
  - Resumo: ID, CPF, Franquia escolhida, Patrocinador
  - Resumo do pagamento (metodo, ultimos 4 digitos, parcelas)
  - Secao "Primeiro Acesso" com instrucoes para acessar o TimolSystem
  - Alerta de seguranca sobre sigilo da senha
  - Botao WhatsApp para suporte
  - Fechamento com assinatura Equipe Timol

### 4. Registrar rota em `src/App.tsx`
- Adicionar rota `/emails` apontando para a nova pagina

## Detalhes tecnicos
- Os HTMLs dos e-mails serao funcoes TypeScript puras que retornam strings, mantidas dentro do proprio arquivo da pagina (ou em um arquivo auxiliar `src/lib/emailTemplates.ts` para organizacao)
- O iframe usara `srcdoc` para renderizar o HTML, isolando os estilos inline do e-mail do restante da aplicacao
- Nenhuma alteracao no backend ou banco de dados
