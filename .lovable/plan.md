
Objetivo

Implementar o fluxo real de “Recuperar Senha” com:
- validação do usuário/e-mail em uma API externa via GET com `exists`
- hint vermelha quando não encontrar cadastro
- geração/envio de PIN de 6 dígitos aleatório com validade de 15 minutos
- invalidação automática do PIN vencido
- cancelamento do PIN anterior ao reenviar
- validação do PIN e troca de senha no mesmo fluxo já existente

O que já existe hoje

- A UI do popup já está pronta em `src/components/login/ForgotPasswordPopup.tsx`, mas ainda usa mock (`MOCK_USER` / `MOCK_PIN`).
- Já existem backend functions para o fluxo:
  - `supabase/functions/forgot-password/index.ts`
  - `supabase/functions/verify-reset-pin/index.ts`
  - `supabase/functions/reset-password/index.ts`
- Já existe a tabela `password_reset_pins` com os campos certos para esse caso:
  - `pin`
  - `expires_at`
  - `used`
  - `verified`
  - `reset_token`
  - `user_id`
  - `email`

Resposta curta à sua pergunta

Não é necessário criar uma nova tabela de PIN.
A tabela `password_reset_pins` já existe e já suporta exatamente esse fluxo.

Plano de implementação

1. Validar existência do usuário/e-mail no backend
- Ajustar `forgot-password` para consultar a API externa via GET.
- Entrada: `identifier`.
- Saída esperada do adaptador: `exists`, e se existir, os dados mínimos necessários para continuar (ou complementar a busca com o banco local, se a API só devolver boolean).
- Se `exists = false`, a function retorna `404` / `not_found`.
- Se `exists = true`, segue para criação do novo PIN.

2. Cancelar PIN anterior e gerar um novo
- Antes de inserir o novo PIN, marcar todos os PINs ativos do usuário como `used = true`.
- Gerar novo código aleatório de 6 dígitos.
- Definir `expires_at = now + 15 minutos`.
- Inserir novo registro em `password_reset_pins`.

3. Preparar o envio do e-mail do PIN
- Como você escolheu “implementar e ativar depois”, eu deixaria o envio real encapsulado em um ponto único dentro de `forgot-password`.
- O fluxo já fica pronto para usar remetente `noreply@timol.com.br` quando a configuração do envio for ativada.
- Enquanto isso, o sistema pode:
  - manter log seguro para teste, ou
  - usar um “stub” isolado para não quebrar o fluxo.

4. Validar PIN corretamente
- Manter `verify-reset-pin` como etapa separada.
- Validar:
  - PIN com 6 dígitos
  - `used = false`
  - `verified = false`
  - `expires_at >= now`
- Se válido:
  - marcar `verified = true`
  - devolver `reset_token`
- Se expirado ou inválido:
  - devolver erro controlado para UI mostrar mensagem vermelha.

5. Trocar a senha com token validado
- `reset-password` já está quase pronto.
- Confirmar a regra:
  - só aceita `reset_token` de registro `verified = true`, `used = false`, não expirado
- Após alterar a senha:
  - marcar o registro como `used = true`
  - opcionalmente disparar o e-mail de confirmação de senha alterada depois

6. Ligar a UI do popup ao backend real
- Substituir todos os `setTimeout` e mocks em `ForgotPasswordPopup`.
- Fluxo final da UI:
  - Etapa 1: usuário digita usuário/e-mail
  - chama `forgot-password`
  - se `not_found`, mostra hint vermelha
  - se sucesso, vai para etapa PIN
  - Etapa 2: digita PIN
  - chama `verify-reset-pin`
  - se sucesso, vai para nova senha
  - Etapa 3: define nova senha
  - chama `reset-password`
  - se sucesso, mostra tela final

7. Reenviar PIN
- Ao clicar em “Reenviar PIN”:
  - chamar de novo `forgot-password`
  - invalidar o PIN anterior
  - criar novo PIN
  - manter cooldown visual de 60s no frontend
- Resultado: só o PIN mais recente continua válido.

Ajustes de UI que eu faria

- Na etapa inicial, trocar o comportamento atual “sempre segue” por:
  - erro vermelho: “Usuário ou e-mail não encontrado.”
- Na etapa do PIN, manter:
  - mensagem de 15 minutos
  - botão de reenviar
  - erro vermelho quando PIN estiver inválido/expirado
- Preservar o foco automático e o submit automático ao completar 6 dígitos, porque isso já combina com o fluxo atual.

Detalhes técnicos

Arquivos principais
- `src/components/login/ForgotPasswordPopup.tsx`
- `supabase/functions/forgot-password/index.ts`
- `supabase/functions/verify-reset-pin/index.ts`
- `supabase/functions/reset-password/index.ts`
- `src/i18n/translations.ts`

Mudanças esperadas por arquivo

1. `forgot-password/index.ts`
- trocar a busca puramente local por:
  - chamada GET na API externa com `identifier`
  - interpretação do retorno `exists`
- retornar `not_found` quando não existir
- invalidar PINs anteriores
- gerar novo PIN aleatório
- salvar com expiração de 15 min
- deixar o envio do e-mail pronto para ativação posterior

2. `verify-reset-pin/index.ts`
- manter a regra de expiração já existente
- garantir respostas mais claras para:
  - PIN inválido
  - PIN expirado
  - PIN já substituído / cancelado

3. `reset-password/index.ts`
- manter atualização de senha com token validado
- marcar PIN como usado no final

4. `ForgotPasswordPopup.tsx`
- integrar com backend real
- tratar `404 not_found`
- mostrar hint vermelha
- manter cooldown e reenvio
- guardar `reset_token` retornado pela verificação

5. `translations.ts`
- adicionar chaves específicas como:
  - usuário/e-mail não encontrado
  - PIN reenviado
  - PIN expirado
  - erro temporário de validação

Ponto importante de segurança

Você pediu para avisar em vermelho quando não encontrar usuário/e-mail. Isso é possível, mas muda o comportamento atual de “não revelar se existe”.
Na prática, isso facilita enumeração de contas.
Se quiser seguir exatamente como pediu, eu implemento assim; só estou sinalizando o trade-off.

Sobre a API externa

Como você confirmou:
- a API já existe
- ela é GET
- ela responde com `exists`

Então eu estruturaria a integração de forma desacoplada, para depois só ajustar:
- URL exata
- nome do parâmetro (`identifier`, `username`, `email`, etc.)
- shape exato da resposta

Banco de dados

- Não preciso criar nova tabela.
- A estrutura atual já atende.
- No máximo, eu avaliaria depois uma melhoria opcional:
  - índice por `user_identifier`, `pin`, `created_at`
- Mas para a funcionalidade em si, não é obrigatório.

Resultado final esperado

Quando a implementação for feita:
1. Usuário informa usuário ou e-mail
2. Sistema valida na API externa
3. Se não existir: mensagem vermelha imediata
4. Se existir: gera PIN novo de 6 dígitos
5. PIN vale por 15 minutos
6. Reenviar cancela o anterior e cria outro
7. PIN válido libera troca de senha
8. Senha é alterada com segurança
9. Fluxo atual do popup continua igual visualmente, mas deixa de ser mock

Dependência que vai faltar para ativar o envio real

Para o e-mail sair de fato de `noreply@timol.com.br`, depois só vai faltar ligar o provedor de envio/infra do remetente.
Como você pediu “implementar e ativar depois”, eu deixaria tudo pronto para essa última conexão sem refazer o fluxo.

