

# Página de Cadastro de Usuário — Wizard Multi-Idioma

## Visão Geral
Formulário de cadastro dividido em etapas (wizard), com tradução completa da interface para Português, Inglês e Espanhol.

---

## 🌐 Seleção de Idioma
- Seletor de idioma no topo da página (PT / EN / ES)
- Toda a interface traduz automaticamente: labels, placeholders, botões, mensagens de erro
- Sistema de internacionalização (i18n) simples com arquivos de tradução

---

## 📝 Etapas do Wizard

### Etapa 1 — Dados Pessoais
- Nome completo
- Data de nascimento
- CPF / Documento
- Gênero

### Etapa 2 — Contato
- E-mail
- Telefone

### Etapa 3 — Endereço
- CEP
- Rua / Logradouro
- Número
- Complemento
- Bairro
- Cidade
- Estado
- País

### Etapa 4 — Login e Senha
- Nome de usuário (login)
- Senha
- Confirmar senha
- Indicador visual de força da senha

---

## 🎨 Experiência do Usuário
- Barra de progresso mostrando a etapa atual
- Botões "Voltar" e "Próximo" em cada etapa
- Validação dos campos antes de avançar
- Tela de confirmação/sucesso ao finalizar

---

## 🗄️ Backend (Supabase)
- Tabela `profiles` para armazenar dados pessoais, contato, endereço e idioma preferido
- Autenticação via Supabase Auth (email + senha)
- Trigger para criar perfil automaticamente no signup
- Políticas de segurança (RLS) para proteger os dados

