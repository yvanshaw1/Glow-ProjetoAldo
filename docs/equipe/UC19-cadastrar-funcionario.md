---
id: UC19
titulo: Cadastrar funcionário
assunto: equipe
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 44)
requisitos: [RF079]
regras: [RN022, RN023, RN024]
---

# UC19 – Cadastrar funcionário

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar funcionários.
- Existe ao menos um cargo ativo cadastrado.

## Pós-condições

- O funcionário é cadastrado com o cargo atribuído e pode autenticar-se no painel administrativo com o e-mail e a senha inicial informados, devendo trocá-la no primeiro acesso (RN023).

## Fluxo principal

1. Na página de gerenciamento de funcionários e cargos, o funcionário seleciona a opção de cadastrar funcionário.
2. O sistema exibe a primeira etapa do formulário.
3. O funcionário informa nome, sobrenome, e-mail, senha e, opcionalmente, a descrição do cargo, e avança (RN023).
4. O sistema exibe os cargos ativos do sistema.
5. O funcionário seleciona o cargo a ser atribuído e confirma (RN024).
6. O sistema valida os dados e grava o cadastro (RN022, RS003, RS002).
7. O sistema exibe o novo funcionário na listagem.

## Fluxos alternativos

Não há.

## Fluxos de exceção

### FE01 – Dados inválidos ou incompletos (passo 3)

1. O sistema indica os campos com problema e não avança para a etapa de atribuição do cargo.

### FE02 – E-mail já utilizado por outro funcionário (passo 6)

1. O sistema informa o conflito e o fluxo retorna ao passo 3.

## Relacionados

- Requisitos: [RF079](requisitos.md)
- Regras: [RN022](../acesso/RN022-e-mail-unico.md), [RN023](../acesso/RN023-senha-inicial.md), [RN024](RN024-cargo-do-funcionario.md)
- Segurança: [RS002](../plataforma/seguranca.md), [RS003](../plataforma/seguranca.md)
- Telas e API: [rotas.md](rotas.md)
