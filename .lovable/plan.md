

## Tooltip com nome do pais nas bandeiras

### Objetivo
Adicionar tooltip com o nome do pais (no idioma selecionado) em todos os lugares onde a bandeira (emoji) de um pais aparece na interface.

### Locais identificados

1. **SponsorScreen** (linha ~601) -- Bandeira do pais do patrocinador exibida ao lado da cidade/estado no card de confirmacao
2. **StepPersonal** (linha ~234) -- Bandeiras na lista dropdown de selecao de pais do documento (estrangeiro)
3. **StepPersonal** (linha ~198) -- Bandeira exibida no campo readonly apos selecao do pais do documento

### Abordagem

Usar o atributo nativo `title` do HTML para exibir o nome do pais ao passar o mouse. Essa abordagem e simples, acessivel (leitores de tela reconhecem `title`) e nao requer componentes extras como Tooltip do Radix.

### Alteracoes por arquivo

**1. `src/components/screens/SponsorScreen.tsx`**
- Na linha 601, onde renderiza `foundSponsor.countryFlag`, envolver o emoji em um `<span title={countryName}>` 
- Sera necessario armazenar o nome do pais (alem do flag) no estado `foundSponsor` -- adicionar campo `countryName` ao objeto
- Preencher `countryName` usando `getCountryName(countryDataResult, language)` nos dois pontos onde `foundSponsor` e criado (linhas ~134 e ~184)

**2. `src/components/registration/StepPersonal.tsx`**
- Na lista dropdown (linha ~234), adicionar `title={getCountryName(c, language)}` ao `<span>` que renderiza `c.flag`
- No campo readonly (linha ~198), o nome do pais ja aparece ao lado da bandeira no texto, entao nao precisa de tooltip adicional

### Tecnico

- Importar `getCountryName` onde ainda nao estiver importado
- Adicionar campo `countryName: string` na interface do estado `foundSponsor` em SponsorScreen
- Nenhuma dependencia nova necessaria
- Nas proximas telas que forem criadas, seguir o mesmo padrao: sempre que exibir `c.flag` ou emoji de bandeira, incluir `title` com o nome traduzido

