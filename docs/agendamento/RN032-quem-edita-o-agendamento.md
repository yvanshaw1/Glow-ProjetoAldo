---
id: RN032
titulo: Quem edita o agendamento
assunto: agendamento
tema: Agendamento
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [RF031, RF055, UC26]
---

# RN032 – Quem edita o agendamento

O cliente pode editar um agendamento somente enquanto ele estiver com o status “Agendado”. Depois que o veículo chega à empresa, a partir de “Em espera”, apenas o funcionário pode editá-lo, e o funcionário pode editar o agendamento em qualquer status. A edição permite alterar o veículo, os serviços, a forma de pagamento, a data e o horário, mas não o status, que muda somente pelas transições de RN017.

## Onde se aplica

- Requisitos: [RF031](requisitos.md), [RF055](requisitos.md)
- Casos de uso: [UC26](UC26-editar-agendamento.md)
