# API Contract — `/api/people/register`

> Especificação do contrato entre o frontend Timol e a API .NET Core para cadastro de novos franqueados.

---

## 1. Visão Geral

O cadastro ocorre em **dois estágios**:

| Estágio | Método | Endpoint | Quando | Status resultante |
|---------|--------|----------|--------|-------------------|
| 1 — Criação | `POST` | `/api/people/register` | Após definição de senha (Step 4 do wizard) | `pending` |
| 2 — Checkout | `PUT` | `/api/people/register/{franchiseId}` | Após seleção de franquia + pagamento | `completed` |

O **Estágio 1** retorna um `franchiseId` (ID público de 6 dígitos) que é usado como identificador em todas as operações subsequentes.

---

## 2. Autenticação

- **Tipo:** Bearer Token (JWT)
- **Emissor:** O próprio backend .NET Core
- **Escopo:** Token do **franqueado** (não do administrador)
- **Header:** `Authorization: Bearer <token>`

### Fluxo de obtenção do token

1. O frontend envia as credenciais no Estágio 1 (`username` + `password`)
2. O backend cria o usuário e retorna o JWT no corpo da resposta
3. O frontend armazena o token e o envia no header do Estágio 2

> **Nota:** O token JWT do Supabase (usado internamente pelo frontend) é independente do token da API externa. O frontend deve gerenciar ambos.

---

## 3. Estágio 1 — Criação (`POST /api/people/register`)

### Request

**Content-Type:** `application/json`

```json
{
  "sponsor": {
    "sponsorId": "123456",
    "sponsorName": "João Silva",
    "sponsorSource": "search"
  },
  "personal": {
    "fullName": "Maria Oliveira",
    "birthDate": "15-03-1990",
    "document": "123.456.789-09",
    "foreignerNoCpf": false,
    "documentCountry": null,
    "documentCountryIso2": null,
    "gender": "female"
  },
  "contact": {
    "email": "maria@email.com",
    "phone": "+55 11 99999-8888"
  },
  "address": {
    "country": "Brasil",
    "countryIso2": "BR",
    "zipCode": "01001-000",
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP"
  },
  "credentials": {
    "username": "maria_oliveira",
    "password": "Senh@Segura123"
  }
}
```

### Campos detalhados

#### `sponsor`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `sponsorId` | `string` | Sim | ID de 6 dígitos do patrocinador |
| `sponsorName` | `string` | Não | Nome do patrocinador (informativo) |
| `sponsorSource` | `string` | Não | Como encontrou: `"search"` ou `"suggestion"` |

#### `personal`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `fullName` | `string` | Sim | Nome completo |
| `birthDate` | `string` | Sim | Data de nascimento no formato **DD-MM-AAAA** |
| `document` | `string` | Sim | CPF (brasileiro) ou documento estrangeiro |
| `foreignerNoCpf` | `boolean` | Sim | `true` se estrangeiro sem CPF |
| `documentCountry` | `string` | Condicional | País do documento (obrigatório se `foreignerNoCpf=true`) |
| `documentCountryIso2` | `string` | Condicional | Código ISO 3166-1 alpha-2 do país do documento |
| `gender` | `string` | Sim | `"male"`, `"female"` ou `"other"` |

#### `contact`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `email` | `string` | Sim | E-mail válido (formato RFC 5322) |
| `phone` | `string` | Sim | Telefone com código do país (mín. 7 dígitos) |

#### `address`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `country` | `string` | Sim | Nome do país |
| `countryIso2` | `string` | Sim | Código ISO 3166-1 alpha-2 |
| `zipCode` | `string` | Sim | CEP / código postal |
| `street` | `string` | Sim | Logradouro |
| `number` | `string` | Sim | Número |
| `complement` | `string` | Não | Complemento (apto, bloco, etc.) |
| `neighborhood` | `string` | Não | Bairro |
| `city` | `string` | Sim | Cidade |
| `state` | `string` | Sim | Estado / província |

#### `credentials`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `username` | `string` | Sim | Alfanumérico + underscore, máx. 20 caracteres |
| `password` | `string` | Sim | Mínimo 6 caracteres |

### Response — `201 Created`

```json
{
  "franchiseId": "847291",
  "authUserId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `franchiseId` | `string` | ID público de 6 dígitos da franquia |
| `authUserId` | `string` (UUID) | Identificador interno do usuário |
| `token` | `string` | JWT para autenticação nas requisições seguintes |

---

## 4. Estágio 2 — Checkout (`PUT /api/people/register/{franchiseId}`)

### Request

**Content-Type:** `application/json`  
**Authorization:** `Bearer <token>` (obtido no Estágio 1)

```json
{
  "franchise": {
    "franchise": "gold",
    "franchisePrice": 299.90
  },
  "payment": {
    "paymentMethod": "credit",
    "cardLast4": "4321",
    "cardInstallments": 3,
    "cardHolderName": "MARIA OLIVEIRA"
  },
  "agreements": {
    "agreeRules": true,
    "agreeCommunications": true
  },
  "coupon": {
    "couponCode": "PROMO2024",
    "couponDiscount": 10.00
  }
}
```

### Campos detalhados

#### `franchise`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `franchise` | `string` | Sim | Nível: `"bronze"`, `"silver"`, `"gold"` ou `"platinum"` |
| `franchisePrice` | `number` | Sim | Valor em BRL (com 2 casas decimais) |

#### `payment`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `paymentMethod` | `string` | Sim | `"pix"` ou `"credit"` |
| `cardLast4` | `string` | Condicional | Últimos 4 dígitos (obrigatório se `credit`) |
| `cardInstallments` | `number` | Condicional | Nº de parcelas (obrigatório se `credit`) |
| `cardHolderName` | `string` | Condicional | Nome no cartão (obrigatório se `credit`) |

#### `agreements`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `agreeRules` | `boolean` | Sim | Aceite do regulamento |
| `agreeCommunications` | `boolean` | Sim | Aceite de comunicações |

#### `coupon` (opcional)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `couponCode` | `string` | Não | Código do cupom de desconto |
| `couponDiscount` | `number` | Não | Valor do desconto aplicado |

### Response — `200 OK`

```json
{
  "franchiseId": "847291",
  "status": "completed",
  "message": "Cadastro finalizado com sucesso."
}
```

---

## 5. Códigos de Resposta HTTP

| Código | Significado | Quando |
|--------|-------------|--------|
| `201` | Created | Estágio 1 — cadastro criado com sucesso |
| `200` | OK | Estágio 2 — checkout concluído |
| `400` | Bad Request | Validação falhou (campos obrigatórios, formatos inválidos) |
| `401` | Unauthorized | Token JWT ausente ou inválido |
| `404` | Not Found | `franchiseId` não encontrado no PUT |
| `409` | Conflict | Documento ou username já cadastrado |

### Formato de erro padrão

```json
{
  "error": {
    "code": "DOCUMENT_ALREADY_EXISTS",
    "message": "O documento informado já está cadastrado.",
    "field": "personal.document"
  }
}
```

Códigos de erro conhecidos:

| Código | Descrição |
|--------|-----------|
| `DOCUMENT_ALREADY_EXISTS` | CPF/documento já registrado |
| `USERNAME_TAKEN` | Username indisponível |
| `INVALID_CPF` | CPF com dígitos verificadores inválidos |
| `AGE_BELOW_MINIMUM` | Idade inferior a 18 anos |
| `SPONSOR_NOT_FOUND` | ID do patrocinador não existe |
| `INVALID_FRANCHISE` | Nível de franquia inválido |
| `PAYMENT_FAILED` | Falha no processamento do pagamento |

---

## 6. Validações

| Regra | Campo | Descrição |
|-------|-------|-----------|
| Idade mínima | `birthDate` | ≥ 18 anos na data do cadastro |
| CPF válido | `document` | Algoritmo de verificação de CPF (quando `foreignerNoCpf=false`) |
| Username único | `username` | Não pode estar em uso |
| Documento único | `document` | Não pode estar em uso |
| E-mail válido | `email` | Formato RFC 5322 |
| Telefone mínimo | `phone` | ≥ 7 dígitos numéricos |
| Senha mínima | `password` | ≥ 6 caracteres |
| Username formato | `username` | Apenas `[a-zA-Z0-9_]`, máx. 20 caracteres |
| Campos cartão | `cardLast4`, `cardInstallments`, `cardHolderName` | Obrigatórios quando `paymentMethod="credit"` |

---

## 7. DTOs Sugeridos (.NET Core)

```csharp
// ── Estágio 1 ──

public record RegisterPersonRequest(
    SponsorDto Sponsor,
    PersonalDto Personal,
    ContactDto Contact,
    AddressDto Address,
    CredentialsDto Credentials
);

public record SponsorDto(
    string SponsorId,
    string? SponsorName,
    string? SponsorSource  // "search" | "suggestion"
);

public record PersonalDto(
    string FullName,
    string BirthDate,           // DD-MM-AAAA
    string Document,
    bool ForeignerNoCpf,
    string? DocumentCountry,
    string? DocumentCountryIso2,
    string Gender               // "male" | "female" | "other"
);

public record ContactDto(
    string Email,
    string Phone
);

public record AddressDto(
    string Country,
    string CountryIso2,
    string ZipCode,
    string Street,
    string Number,
    string? Complement,
    string? Neighborhood,
    string City,
    string State
);

public record CredentialsDto(
    string Username,
    string Password
);

// ── Estágio 2 ──

public record RegisterCheckoutRequest(
    FranchiseDto Franchise,
    PaymentDto Payment,
    AgreementsDto Agreements,
    CouponDto? Coupon
);

public record FranchiseDto(
    string Franchise,           // "bronze" | "silver" | "gold" | "platinum"
    decimal FranchisePrice
);

public record PaymentDto(
    string PaymentMethod,       // "pix" | "credit"
    string? CardLast4,
    int? CardInstallments,
    string? CardHolderName
);

public record AgreementsDto(
    bool AgreeRules,
    bool AgreeCommunications
);

public record CouponDto(
    string? CouponCode,
    decimal? CouponDiscount
);

// ── Response ──

public record RegisterResponse(
    string FranchiseId,         // 6 dígitos
    string AuthUserId,          // UUID
    string? Token               // JWT (apenas no Estágio 1)
);
```

---

## 8. Mapeamento Frontend → API

| Campo no Frontend (`WizardData`) | Campo na API |
|----------------------------------|-------------|
| `sponsorId` | `sponsor.sponsorId` |
| `sponsorName` | `sponsor.sponsorName` |
| `sponsorSource` | `sponsor.sponsorSource` |
| `fullName` | `personal.fullName` |
| `birthDate` | `personal.birthDate` (converter para DD-MM-AAAA) |
| `document` | `personal.document` |
| `foreignerNoCpf` | `personal.foreignerNoCpf` (converter `"true"`→`true`) |
| `documentCountry` | `personal.documentCountry` |
| `documentCountryIso2` | `personal.documentCountryIso2` |
| `gender` | `personal.gender` |
| `email` | `contact.email` |
| `phone` | `contact.phone` |
| `country` | `address.country` |
| `countryIso2` | `address.countryIso2` |
| `zipCode` | `address.zipCode` |
| `street` | `address.street` |
| `number` | `address.number` |
| `complement` | `address.complement` |
| `neighborhood` | `address.neighborhood` |
| `city` | `address.city` |
| `state` | `address.state` |
| `username` | `credentials.username` |
| `password` | `credentials.password` |
| `franchise` | `franchise.franchise` |
| `franchisePrice` | `franchise.franchisePrice` |
| `paymentMethod` | `payment.paymentMethod` |
| `cardLast4` | `payment.cardLast4` |
| `cardInstallments` | `payment.cardInstallments` |
| `cardHolderName` | `payment.cardHolderName` |
| `agreeRules` | `agreements.agreeRules` |
| `agreeCommunications` | `agreements.agreeCommunications` |
