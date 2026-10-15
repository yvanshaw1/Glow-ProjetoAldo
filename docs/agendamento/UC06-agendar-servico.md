---
id: UC06
titulo: Agendar serviço
assunto: agendamento
ator: Cliente
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 31)
requisitos: [RF019, RF020, RF021, RF022, RF023, RF024, RF025, RF026, RF027]
regras: [RN003, RN004, RN005, RN006, RN009, RN010, RN011, RN013, RN014, RN015, RN034]
---

# UC06 – Agendar serviço

**Ator principal:** Cliente. **Ator secundário:** Não se aplica.

## Pré-condições

- O cliente está autenticado no portal.
- O cliente possui ao menos um veículo cadastrado.
- A empresa possui serviços ativos e disponibilidade configurada.

## Pós-condições

- O agendamento é registrado com o status “Agendado”, vinculado ao cliente e ao veículo (RN003).
- O agendamento passa a constar na página de agendamentos do cliente e no painel administrativo.

## Fluxo principal

1. O cliente acessa a página de agendar serviço.
2. O sistema exibe os veículos cadastrados na conta.
3. O cliente seleciona o veículo (RN004).
4. O sistema exibe os serviços disponíveis para agendamento, com o valor aplicável ao porte do veículo ou o valor fixo (RN009).
5. O cliente adiciona ao carrinho os serviços desejados.
6. O sistema atualiza o carrinho com os serviços selecionados e a soma dos valores.
7. O cliente seleciona a forma de pagamento: crédito, débito, Pix ou dinheiro (RN011).
8. O sistema calcula o valor total, aplicando o percentual de acréscimo ou de desconto da forma de pagamento selecionada (RN010).
9. O sistema exibe, para seleção, as datas e os horários de funcionamento da empresa (RN013, RN015).
10. O cliente seleciona a data e o horário.
11. O sistema exibe o resumo do agendamento, com os serviços, o valor total, a duração estimada e a previsão de conclusão (RN014, RN034).
12. O cliente confere o resumo e confirma o agendamento.
13. O sistema valida os dados, registra o agendamento com o status “Agendado” e exibe a confirmação.

## Fluxos alternativos

### FA01 – Inclusão de serviços adicionais (passo 5)

1. Ao incluir um serviço principal que possua serviços adicionais vinculados, o sistema os oferece ao cliente (RN006).
2. O cliente inclui no carrinho os adicionais desejados e o fluxo prossegue no passo 6.

### FA02 – Remoção de serviço do carrinho (passo 6)

1. O cliente remove um serviço do carrinho.
2. O sistema recalcula a soma dos valores; se o serviço removido for um principal, os adicionais a ele vinculados também são removidos.

### FA03 – Troca de veículo (após o passo 4)

1. O cliente seleciona outro veículo.
2. O sistema reapresenta os serviços com os valores aplicáveis ao porte do novo veículo.

## Fluxos de exceção

### FE01 – Cliente sem veículo cadastrado (passo 2)

1. O sistema informa que é necessário cadastrar um veículo e oferece acesso ao cadastro (UC05).

### FE02 – Carrinho vazio (passo 7)

1. O sistema não permite prosseguir sem ao menos um serviço principal ou complementar selecionado (RN005).

### FE03 – Data ou horário inválido (passo 13)

1. A data e o horário escolhidos estão fora do funcionamento da empresa ou já passaram; o sistema recusa o agendamento e o fluxo retorna ao passo 9 (RN013, RN015).

## Relacionados

- Requisitos: [RF019](requisitos.md), [RF020](requisitos.md), [RF021](requisitos.md), [RF022](requisitos.md), [RF023](requisitos.md), [RF024](requisitos.md), [RF025](requisitos.md), [RF026](requisitos.md), [RF027](requisitos.md)
- Regras: [RN003](RN003-cliente-e-veiculo-do-agendamento.md), [RN004](RN004-veiculo-antes-dos-servicos.md), [RN005](RN005-servico-obrigatorio-no-agendamento.md), [RN006](../catalogo/RN006-tipos-de-servico.md), [RN009](../catalogo/RN009-precificacao.md), [RN010](RN010-valor-total.md), [RN011](RN011-formas-de-pagamento.md), [RN013](RN013-disponibilidade.md), [RN014](RN014-duracao-estimada.md), [RN015](RN015-sem-data-no-passado.md), [RN034](RN034-previsao-de-conclusao.md)
- Outros casos de uso: [UC05](../clientes/UC05-manter-veiculos.md)
- Telas e API: [rotas.md](rotas.md)
