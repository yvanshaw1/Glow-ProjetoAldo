---
id: UC02
titulo: Cadastrar-se como cliente
assunto: acesso
ator: Visitante
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 27)
requisitos: [RF007]
regras: [RN022]
---

# UC02 – Cadastrar-se como cliente

**Ator principal:** Visitante. **Ator secundário:** Não se aplica.

## Pré-condições

- O visitante não está autenticado.

## Pós-condições

- A conta de cliente é criada e pode ser utilizada para autenticação no portal.

## Fluxo principal

1. O visitante acessa a página de cadastro pelo atalho da página inicial ou pela barra de navegação.
2. O sistema exibe o formulário de cadastro.
3. O visitante informa nome, sobrenome, e-mail, telefone e senha e confirma.
4. O sistema valida os dados informados (RN022, RS003).
5. O sistema cria a conta de cliente (RS002).
6. O sistema informa o sucesso do cadastro e direciona o usuário para a autenticação.

## Fluxos alternativos

### FA01 – Visitante já possui conta (passo 2)

1. O visitante seleciona a opção de login.
2. O fluxo prossegue conforme o UC03.

## Fluxos de exceção

### FE01 – Dados inválidos ou incompletos (passo 4)

1. O sistema indica os campos com problema, preservando os dados já preenchidos.
2. O fluxo retorna ao passo 3.

### FE02 – E-mail já cadastrado (passo 4)

1. O sistema informa que o e-mail já está em uso e sugere a autenticação.

## Relacionados

- Requisitos: [RF007](requisitos.md)
- Regras: [RN022](RN022-e-mail-unico.md)
- Segurança: [RS002](../plataforma/seguranca.md), [RS003](../plataforma/seguranca.md)
- Outros casos de uso: [UC03](UC03-autenticar-se-no-portal.md)
- Telas e API: [rotas.md](rotas.md)
