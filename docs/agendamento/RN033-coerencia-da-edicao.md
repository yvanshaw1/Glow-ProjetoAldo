---
id: RN033
titulo: Coerência da edição
assunto: agendamento
tema: Agendamento
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [RF031, RF055, RN005, RN006, RN013, RN034, UC26]
---

# RN033 – Coerência da edição

A edição não pode deixar o agendamento incoerente. A data e o horário devem respeitar a disponibilidade da empresa (RN013). Se alterados pelo cliente, só podem ser postergados, isto é, passar para uma data e um horário futuros e posteriores aos marcados. Se alterados pelo funcionário, podem ser adiantados ou postergados, sem ficar no passado enquanto o agendamento estiver “Agendado” e sem ser posteriores ao momento da alteração depois que o veículo chegou à empresa. Os valores são sempre calculados pelo sistema, sem informação manual: a troca do veículo ou dos serviços recalcula o valor de todos os serviços pelo catálogo atual, a troca da forma de pagamento aplica o percentual vigente, e o subtotal, o total, a duração estimada e a previsão de conclusão são recalculados (RN034). As regras de composição do agendamento continuam valendo (RN005, RN006).

## Onde se aplica

- Requisitos: [RF031](requisitos.md), [RF055](requisitos.md)
- Casos de uso: [UC26](UC26-editar-agendamento.md)
- Regras ligadas: [RN005](RN005-servico-obrigatorio-no-agendamento.md), [RN006](../catalogo/RN006-tipos-de-servico.md), [RN013](RN013-disponibilidade.md), [RN034](RN034-previsao-de-conclusao.md)
