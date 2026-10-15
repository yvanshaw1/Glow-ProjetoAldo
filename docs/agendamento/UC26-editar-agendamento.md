---
id: UC26
titulo: Editar agendamento
assunto: agendamento
ator: Cliente
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 51)
requisitos: [RF031, RF055]
regras: [RN005, RN006, RN010, RN013, RN014, RN015, RN032, RN033, RN034]
---

# UC26 – Editar agendamento

**Ator principal:** Cliente. **Ator secundário:** Funcionário (fluxo alternativo FA01)

## Pré-condições

- O cliente está autenticado no portal.
- O agendamento pertence ao cliente e está com o status “Agendado” (RN032).

## Pós-condições

- O agendamento é atualizado, com os valores, a duração estimada e a previsão de conclusão recalculados pelo sistema.
- O status do agendamento não é alterado.

## Fluxo principal

1. O cliente acessa a página de agendamentos (UC07).
2. O cliente seleciona um agendamento com o status “Agendado” e aciona a opção de editar.
3. O sistema exibe os dados do agendamento: veículo, serviços, forma de pagamento, data e horário.
4. O cliente altera os dados desejados. Ao trocar o veículo ou os serviços, o sistema recalcula os valores pelo catálogo atual; ao trocar a forma de pagamento, aplica o percentual correspondente; a data e o horário só podem ser postergados (RN033).
5. O sistema exibe o resumo com o valor total, a duração estimada e a previsão de conclusão recalculados (RN010, RN014, RN034).
6. O cliente confirma.
7. O sistema valida a data, o horário e os serviços e grava as alterações (RN013, RN015).

## Fluxos alternativos

### FA01 – Edição pelo funcionário (passo 1)

1. O funcionário, com permissão de gerenciar agendamentos, localiza o agendamento na página de gerenciamento de agendamentos (UC10), em qualquer status, e aciona a opção de editar (RN032).
2. O fluxo prossegue a partir do passo 3, com o funcionário no lugar do cliente.
3. O funcionário pode adiantar ou postergar a data e o horário, dentro da disponibilidade da empresa; se o veículo já tiver chegado à empresa, a nova data e o novo horário não podem ser posteriores ao momento da alteração (RN033).

## Fluxos de exceção

### FE01 – Edição não permitida ao cliente (passo 2)

1. O agendamento não está mais com o status “Agendado”; a opção de editar não é oferecida ao cliente, e o sistema informa que alterações devem ser solicitadas à empresa.

### FE02 – Data ou horário inválido (passo 7)

1. A data e o horário estão fora do funcionamento da empresa, são anteriores aos marcados, no caso do cliente, ou são incompatíveis com o status do agendamento; o sistema recusa a alteração e o fluxo retorna ao passo 4 (RN033).

### FE03 – Composição inválida (passo 7)

1. O agendamento ficaria sem serviço principal ou complementar, ou com serviço adicional sem o principal correspondente; o sistema recusa a alteração e o fluxo retorna ao passo 4 (RN005, RN006).

## Relacionados

- Requisitos: [RF031](requisitos.md), [RF055](requisitos.md)
- Regras: [RN005](RN005-servico-obrigatorio-no-agendamento.md), [RN006](../catalogo/RN006-tipos-de-servico.md), [RN010](RN010-valor-total.md), [RN013](RN013-disponibilidade.md), [RN014](RN014-duracao-estimada.md), [RN015](RN015-sem-data-no-passado.md), [RN032](RN032-quem-edita-o-agendamento.md), [RN033](RN033-coerencia-da-edicao.md), [RN034](RN034-previsao-de-conclusao.md)
- Outros casos de uso: [UC07](UC07-acompanhar-agendamentos.md), [UC10](UC10-consultar-agendamentos.md)
- Telas e API: [rotas.md](rotas.md)
