---
id: UC15
titulo: Manter categorias
assunto: catalogo
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 40)
requisitos: [RF057, RF067, RF068]
regras: [RN031, RN035]
---

# UC15 – Manter categorias

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar serviços.

## Pós-condições

- A categoria é cadastrada ou atualizada.
- Os serviços de categorias inativas deixam de ser exibidos no portal e no agendamento pelo cliente, mas continuam disponíveis no painel (RN031).

## Fluxo principal

1. Na página de gerenciamento de serviços, o funcionário alterna para a listagem de categorias.
2. O sistema exibe as categorias cadastradas.
3. O funcionário seleciona a opção de nova categoria.
4. O sistema solicita nome e descrição.
5. O funcionário informa os dados e confirma.
6. O sistema valida os dados, grava a categoria e a exibe na listagem.

## Fluxos alternativos

### FA01 – Edição de categoria (passo 3)

1. O funcionário seleciona uma categoria e aciona a opção de editar.
2. O sistema exibe o nome e a descrição para alteração.
3. O funcionário altera os dados e confirma; o sistema valida e grava as alterações.

### FA02 – Desativação ou reativação de categoria (passo 3)

1. O funcionário seleciona uma categoria e aciona a opção de desativar ou de reativar.
2. O sistema solicita a confirmação e, uma vez confirmada, altera a situação da categoria (RN031).

### FA03 – Exibição das categorias inativas (passo 2)

1. O funcionário aciona a opção de exibir as categorias inativas, e o sistema passa a incluí-las na listagem.

## Fluxos de exceção

### FE01 – Dados obrigatórios não informados (passo 6 ou FA01)

1. O sistema indica os campos pendentes e mantém os dados já informados para correção.

### FE02 – Nome já utilizado (passo 6 ou FA01)

1. Já existe uma categoria com o mesmo nome; o sistema solicita outro nome (RN035).

## Relacionados

- Requisitos: [RF057](requisitos.md), [RF067](requisitos.md), [RF068](requisitos.md)
- Regras: [RN031](RN031-categoria-inativa.md), [RN035](../plataforma/RN035-formatos-dos-dados.md)
- Telas e API: [rotas.md](rotas.md)
