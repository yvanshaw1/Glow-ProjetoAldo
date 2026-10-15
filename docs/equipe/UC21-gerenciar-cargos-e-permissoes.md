---
id: UC21
titulo: Gerenciar cargos e permissões
assunto: equipe
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 46)
requisitos: [RF077, RF078, RF082, RF083]
regras: [RN024, RN025, RN026, RN035]
---

# UC21 – Gerenciar cargos e permissões

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar funcionários.

## Pós-condições

- O cargo é criado, alterado ou desativado.
- As permissões do cargo passam a determinar as páginas acessíveis aos funcionários a ele vinculados (RN024).

## Fluxo principal

1. Na página de gerenciamento de funcionários e cargos, o funcionário alterna para a lista de cargos.
2. O sistema exibe os cargos ativos.
3. O funcionário seleciona a opção de novo cargo.
4. O sistema solicita o nome do cargo e, opcionalmente, a descrição.
5. O funcionário informa os dados e avança.
6. O sistema exibe as permissões disponíveis, uma para cada página do painel administrativo (RN025).
7. O funcionário seleciona as permissões do cargo e confirma.
8. O sistema valida os dados, grava o cargo e o exibe na listagem.

## Fluxos alternativos

### FA01 – Edição de cargo (passo 3)

1. O funcionário seleciona um cargo existente e altera seus dados ou suas permissões.
2. O sistema grava as alterações, que passam a valer para todos os funcionários do cargo (RS011).

### FA02 – Desativação de cargo (passo 3)

1. O funcionário seleciona a opção de desativar o cargo.
2. O sistema solicita a confirmação e, uma vez confirmada, desativa o cargo (RN026).

### FA03 – Exibição de inativos (passo 2)

1. O funcionário ativa a opção de exibir inativos e o sistema inclui os cargos inativos na listagem.

## Fluxos de exceção

### FE01 – Nome do cargo não informado (passo 5)

1. O sistema indica o campo pendente e não avança para a etapa de permissões.

### FE02 – Nome já utilizado (passo 5)

1. Já existe um cargo com o mesmo nome; o sistema solicita outro nome (RN035).

### FE03 – Nenhuma permissão selecionada (passo 7)

1. O sistema informa que o cargo deve conceder ao menos uma permissão e não grava o cargo (RN025).

## Relacionados

- Requisitos: [RF077](requisitos.md), [RF078](requisitos.md), [RF082](requisitos.md), [RF083](requisitos.md)
- Regras: [RN024](RN024-cargo-do-funcionario.md), [RN025](RN025-permissoes.md), [RN026](RN026-desativacao.md), [RN035](../plataforma/RN035-formatos-dos-dados.md)
- Segurança: [RS011](../plataforma/seguranca.md)
- Telas e API: [rotas.md](rotas.md)
