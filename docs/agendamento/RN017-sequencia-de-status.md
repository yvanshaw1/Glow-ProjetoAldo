---
id: RN017
titulo: Sequência de status
assunto: agendamento
tema: Status
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [RF052, UC12]
---

# RN017 – Sequência de status

A alteração de status segue a sequência “Agendado”, “Em espera”, “Em execução”, “Finalizado” e “Concluído”, conforme a tabela abaixo, e é feita por funcionário com permissão de gerenciar agendamentos.

| Status | Valor no banco | Significado | Próximos status |
|---|---|---|---|
| Agendado | `scheduled` | Agendamento criado, aguardando a data e o horário marcados. | Em espera; Cancelado |
| Em espera | `checked_in` | Veículo já no local, com o serviço ainda não iniciado. | Em execução; Cancelado |
| Em execução | `in_progress` | Serviço iniciado. | Finalizado |
| Finalizado | `awaiting_payment` | Serviço finalizado, aguardando o pagamento. | Concluído |
| Concluído | `completed` | Serviço finalizado e pago. | Reagendado |
| Cancelado | `cancelled` | Agendamento cancelado. | Nenhum (status final) |
| Reagendado | `rescheduled` | Agendamento concluído cujo serviço foi reagendado a partir do histórico, dando origem a um novo agendamento. | Nenhum (status final) |

## Onde se aplica

- Requisitos: [RF052](requisitos.md)
- Casos de uso: [UC12](UC12-atualizar-status-do-agendamento.md)
