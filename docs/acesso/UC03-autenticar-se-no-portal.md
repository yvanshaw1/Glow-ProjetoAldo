---
id: UC03
titulo: Autenticar-se no portal
assunto: acesso
ator: Cliente
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 28)
requisitos: [RF008, RF009, RF010, RF011]
regras: [RN001, RN023, RN029]
---

# UC03 – Autenticar-se no portal

**Ator principal:** Cliente. **Ator secundário:** Visitante (fluxos alternativos FA01 e FA02)

## Pré-condições

- O cliente possui conta cadastrada.

## Pós-condições

- A sessão do cliente é iniciada e as páginas restritas ao cliente ficam acessíveis.

## Fluxo principal

1. O cliente acessa a página de login.
2. O sistema exibe o formulário de autenticação, com a opção de cadastro para quem ainda não possui conta.
3. O cliente informa e-mail e senha e confirma.
4. O sistema valida as credenciais.
5. O sistema inicia a sessão, identifica o perfil da conta e exibe a área restrita ao cliente (RS007, RN029).

## Fluxos alternativos

### FA01 – Visitante sem conta (passo 2)

1. O visitante, por ainda não possuir conta, seleciona a opção de cadastro oferecida na página de login.
2. O fluxo prossegue conforme o UC02.

### FA02 – Tentativa de acesso a página restrita sem autenticação (passo 1)

1. O sistema direciona o visitante para a página de login (RN001).
2. Após a autenticação, o sistema exibe a página originalmente solicitada.

### FA03 – Primeiro acesso de conta criada pelo painel administrativo (passo 4)

1. O sistema identifica que a senha inicial, definida pelo funcionário no cadastro, ainda não foi trocada e solicita ao cliente uma nova senha (RN023, RS004).
2. O cliente informa a nova senha e confirma.
3. O sistema valida e grava a nova senha (RS003, RS002), e o fluxo prossegue no passo 5.

### FA04 – Conta de funcionário (passo 5)

1. A conta autenticada é de funcionário; o sistema direciona o usuário ao painel administrativo, conforme o UC08.

### FA05 – Encerramento da sessão

1. O cliente autenticado seleciona a opção de sair.
2. O sistema encerra a sessão e exibe a página inicial.

## Fluxos de exceção

### FE01 – Credenciais inválidas (passo 4)

1. O sistema informa que o e-mail ou a senha estão incorretos, sem indicar qual deles (RS005), e mantém visível a opção de cadastro para quem ainda não possui conta.
2. O fluxo retorna ao passo 3.

### FE02 – Excesso de tentativas malsucedidas (passo 4)

1. O sistema bloqueia temporariamente novas tentativas de login e informa o usuário (RS006).

### FE03 – Nova senha inválida (FA03)

1. A nova senha não atende ao tamanho mínimo ou é igual à senha inicial; o sistema recusa a troca e solicita outra senha.

## Relacionados

- Requisitos: [RF008](requisitos.md), [RF009](requisitos.md), [RF010](requisitos.md), [RF011](requisitos.md)
- Regras: [RN001](RN001-acesso-do-visitante.md), [RN023](RN023-senha-inicial.md), [RN029](RN029-login-unico.md)
- Segurança: [RS002](../plataforma/seguranca.md), [RS003](../plataforma/seguranca.md), [RS004](../plataforma/seguranca.md), [RS005](../plataforma/seguranca.md), [RS006](../plataforma/seguranca.md), [RS007](../plataforma/seguranca.md)
- Outros casos de uso: [UC02](UC02-cadastrar-se-como-cliente.md), [UC08](UC08-autenticar-se-no-painel-administrativo.md)
- Telas e API: [rotas.md](rotas.md)
