---
id: UC08
titulo: Autenticar-se no painel administrativo
assunto: acesso
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 33)
requisitos: [RF033, RF034, RF035, RF036, RF037, RF038, RF039]
regras: [RN023, RN024, RN026, RN027, RN029]
---

# UC08 – Autenticar-se no painel administrativo

**Ator principal:** Funcionário. **Ator secundário:** Administrador (fluxo alternativo FA02)

## Pré-condições

- O funcionário está cadastrado e ativo.
- O funcionário possui um cargo atribuído (RN024).

## Pós-condições

- A sessão do funcionário é iniciada.
- O painel exibe apenas as páginas permitidas pelo cargo do funcionário.

## Fluxo principal

1. O funcionário acessa a página de login, a mesma utilizada pelos clientes (RN029).
2. O sistema exibe o formulário de autenticação.
3. O funcionário informa e-mail e senha e confirma.
4. O sistema valida as credenciais e a situação do funcionário.
5. O sistema inicia a sessão, identifica o perfil de funcionário e exibe o painel administrativo com as opções permitidas pelo cargo (RS007).

## Fluxos alternativos

### FA01 – Primeiro acesso do funcionário (passo 4)

1. O sistema identifica que a senha inicial, definida no cadastro, ainda não foi trocada e solicita ao funcionário uma nova senha (RN023, RS004).
2. O funcionário informa a senha inicial e a nova senha e confirma.
3. O sistema valida e grava a nova senha (RS003, RS002), e o fluxo prossegue no passo 5.

### FA02 – Autenticação do administrador (passo 5)

1. O sistema exibe o painel com todas as páginas e ações liberadas, independentemente de cargo (RN027).

### FA03 – Encerramento da sessão

1. O funcionário seleciona a opção de sair.
2. O sistema encerra a sessão e exibe a página de login.

## Fluxos de exceção

### FE01 – Credenciais inválidas (passo 4)

1. O sistema informa que o e-mail ou a senha estão incorretos, sem indicar qual deles (RS005), e o fluxo retorna ao passo 3.

### FE02 – Funcionário desativado (passo 4)

1. O sistema nega o acesso (RN026).

### FE03 – Acesso a página sem permissão

1. O funcionário tenta acessar uma página não permitida pelo seu cargo; o sistema nega o acesso e informa a restrição (RS008).

### FE04 – Nova senha inválida (FA01)

1. A nova senha não atende ao tamanho mínimo ou é igual à senha inicial; o sistema recusa a troca e solicita outra senha.

## Relacionados

- Requisitos: [RF033](requisitos.md), [RF034](requisitos.md), [RF035](requisitos.md), [RF036](requisitos.md), [RF037](requisitos.md), [RF038](requisitos.md), [RF039](requisitos.md)
- Regras: [RN023](RN023-senha-inicial.md), [RN024](../equipe/RN024-cargo-do-funcionario.md), [RN026](../equipe/RN026-desativacao.md), [RN027](../equipe/RN027-administrador.md), [RN029](RN029-login-unico.md)
- Segurança: [RS002](../plataforma/seguranca.md), [RS003](../plataforma/seguranca.md), [RS004](../plataforma/seguranca.md), [RS005](../plataforma/seguranca.md), [RS007](../plataforma/seguranca.md), [RS008](../plataforma/seguranca.md)
- Telas e API: [rotas.md](rotas.md)
