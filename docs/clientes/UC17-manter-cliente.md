---
id: UC17
titulo: Manter cliente
assunto: clientes
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 42)
requisitos: [RF069, RF070, RF072, RF073, RF074]
regras: [RN030]
---

# UC17 – Manter cliente

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar clientes.

## Pós-condições

- Os dados do cliente são consultados, atualizados ou excluídos, conforme a ação realizada.

## Fluxo principal

1. O funcionário acessa a página de gerenciamento de clientes.
2. O sistema lista os clientes cadastrados.
3. O funcionário busca o cliente por nome, e-mail ou outro dado cadastral.
4. O funcionário seleciona a opção de ver detalhes.
5. O sistema exibe as informações da conta e os veículos do cliente.
6. O funcionário edita as informações e confirma.
7. O sistema valida e grava as alterações.

## Fluxos alternativos

### FA01 – Exclusão da conta (passo 5)

1. O funcionário seleciona a opção de excluir a conta.
2. O sistema solicita a confirmação e, uma vez confirmada, exclui a conta do cliente, que deixa de ser exibida e perde o acesso; seus veículos e agendamentos são preservados (RN030).

### FA02 – Cadastro ou edição de veículo (passo 5)

1. O funcionário seleciona a opção de cadastrar ou de editar um veículo e o fluxo prossegue conforme o UC18.

## Fluxos de exceção

### FE01 – Nenhum cliente encontrado (passo 3)

1. O sistema informa que não há clientes para o critério informado.

### FE02 – Dados inválidos (passo 7)

1. O sistema indica os campos com problema e o fluxo retorna ao passo 6.

## Relacionados

- Requisitos: [RF069](requisitos.md), [RF070](requisitos.md), [RF072](requisitos.md), [RF073](requisitos.md), [RF074](requisitos.md)
- Regras: [RN030](../plataforma/RN030-exclusao-logica.md)
- Outros casos de uso: [UC18](UC18-manter-veiculos-do-cliente.md)
- Telas e API: [rotas.md](rotas.md)
