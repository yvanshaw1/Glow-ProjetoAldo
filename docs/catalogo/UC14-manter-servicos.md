---
id: UC14
titulo: Manter serviços
assunto: catalogo
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 39)
requisitos: [RF058, RF059, RF064, RF065, RF066]
regras: [RN008, RN030]
---

# UC14 – Manter serviços

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar serviços.

## Pós-condições

- As alterações são gravadas e refletidas no catálogo público e no agendamento do cliente.

## Fluxo principal

1. O funcionário acessa a página de gerenciamento de serviços.
2. O sistema exibe o catálogo com os serviços ativos.
3. O funcionário localiza o serviço, podendo filtrar por tipo.
4. O funcionário seleciona a opção de editar.
5. O sistema exibe os dados do serviço.
6. O funcionário altera os dados e confirma.
7. O sistema valida e grava as alterações.

## Fluxos alternativos

### FA01 – Exibição de inativos (passo 2)

1. O funcionário ativa a opção de exibir inativos e o sistema inclui os serviços inativos na listagem.

### FA02 – Desativação de serviço (passo 4)

1. O funcionário desativa o serviço.
2. O sistema deixa de exibi-lo no catálogo público e no agendamento do cliente (RN008).

### FA03 – Reativação de serviço (passo 4)

1. O funcionário reativa um serviço inativo e o sistema volta a exibi-lo ao cliente.

### FA04 – Exclusão de serviço (passo 4)

1. O funcionário seleciona a opção de excluir.
2. O sistema solicita a confirmação e, uma vez confirmada, exclui o serviço, que deixa de ser exibido; os agendamentos em que ele consta são preservados (RN030).

## Fluxos de exceção

### FE01 – Dados inválidos (passo 7)

1. O sistema indica os campos com problema e o fluxo retorna ao passo 6.

## Relacionados

- Requisitos: [RF058](requisitos.md), [RF059](requisitos.md), [RF064](requisitos.md), [RF065](requisitos.md), [RF066](requisitos.md)
- Regras: [RN008](RN008-servico-inativo.md), [RN030](../plataforma/RN030-exclusao-logica.md)
- Telas e API: [rotas.md](rotas.md)
