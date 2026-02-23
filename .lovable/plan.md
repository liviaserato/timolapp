

## Ajuste do cabecalho da tela inicial

### O que muda

1. **Remover o favicon (icone pequeno) ao lado do titulo** -- a imagem `timol-logo.svg` de 12x12 que aparece ao lado do texto sera removida do cabecalho.

2. **Alterar o titulo para "Cadastro de Franquia"** -- atualizar a chave `sponsor.title` nos 3 idiomas (pt, en, es).

3. **Inserir a nova logo da Timol centralizada abaixo do titulo** -- copiar o arquivo `logo-timol-azul-claro.svg` enviado para `src/assets/` e renderizar como imagem centralizada entre o titulo e o texto descritivo.

4. **Alterar o texto descritivo abaixo da logo** -- atualizar a chave `sponsor.subtitle` para: "Para fazer parte da Timol, voce precisa de um convite. Quem te convidou sera seu patrocinador." (nos 3 idiomas com traducoes equivalentes).

---

### Detalhes tecnicos

**Arquivo: `src/components/screens/SponsorScreen.tsx`** (linhas 222-232)

- Remover o `<img src={timolLogo}>` e o container `flex` que agrupa icone + titulo.
- Estrutura do cabecalho passara a ser:
  1. `<h1>` com o titulo "Cadastro de Franquia", centralizado
  2. `<img>` com a nova logo `logo-timol-azul-claro.svg`, centralizada, largura adequada (~180px)
  3. `<p>` com o texto descritivo
  4. `<LanguageSelector />`

**Arquivo: `src/i18n/translations.ts`**

- `sponsor.title`: "Cadastro de Franquia" (pt), "Franchise Registration" (en), "Registro de Franquicia" (es)
- `sponsor.subtitle`: "Para fazer parte da Timol, voce precisa de um convite. Quem te convidou sera seu patrocinador." (pt), com traducoes equivalentes em en/es

**Novo asset:** Copiar `user-uploads://logo-timol-azul-claro.svg` para `src/assets/logo-timol-azul-claro.svg` e importar no componente.

