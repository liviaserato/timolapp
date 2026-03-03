

# Plano: Criar documentação `docs/api-contract.md`

## Objetivo
Criar um arquivo de documentação completo especificando o contrato da API `/api/people/register` com base no fluxo atual do frontend (WizardData, telas de registro, franquia e pagamento).

## Conteúdo do arquivo

O documento cobrirá:

1. **Visão Geral** — fluxo em 2 estágios (pending → completed)
2. **Autenticação** — JWT do franqueado (não admin), fluxo de obtenção do token
3. **Endpoint** — `POST /api/people/register` e `PUT /api/people/register/{franchiseId}`
4. **Estágio 1 (Criação — status `pending`)** — todos os campos extraídos do wizard:
   - Patrocinador: `sponsorId`, `sponsorName`, `sponsorSource`
   - Pessoal: `fullName`, `birthDate` (DD-MM-AAAA), `document`, `foreignerNoCpf`, `documentCountry`, `documentCountryIso2`, `gender`
   - Contato: `email`, `phone`
   - Endereço: `country`, `countryIso2`, `zipCode`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`
   - Login: `username`, `password`
   - Retorno: `franchiseId` (6 dígitos), `authUserId` (UUID)

5. **Estágio 2 (Atualização — status `completed`)** — campos de checkout:
   - Franquia: `franchise` (bronze/silver/gold/platinum), `franchisePrice`
   - Pagamento: `paymentMethod` (pix/credit), `cardLast4`, `cardInstallments`, `cardHolderName`
   - Acordos: `agreeRules`, `agreeCommunications`
   - Cupom: `couponCode`, `couponDiscount`

6. **DTOs sugeridos (.NET)** — `RegisterPersonRequest`, `RegisterPaymentRequest`, `RegisterResponse`
7. **Códigos de resposta HTTP** — 201, 200, 400, 401, 404, 409
8. **Validações** — idade mínima 18, CPF válido, username único, etc.

## Detalhes técnicos
- Arquivo: `docs/api-contract.md`
- Formato: Markdown com tabelas de campos, tipos, obrigatoriedade e exemplos
- Baseado 100% nos dados já presentes em `WizardData` e nos componentes do frontend

