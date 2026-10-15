---
id: RN020
titulo: Reagendamento
assunto: agendamento
tema: Status
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [RF032, RF056, UC25]
---

# RN020 – Reagendamento

Somente o agendamento com o status “Concluído” pode ser reagendado, a partir do histórico, pelo cliente ou pelo funcionário. O reagendamento é um atalho para repetir um atendimento: cria uma nova ordem de serviço, com o status “Agendado”, para o mesmo veículo e com os mesmos serviços, em nova data e novo horário, com os valores e a duração estimada recalculados pelo catálogo atual, e não uma cópia do agendamento original. O agendamento original passa ao status “Reagendado” e não pode ser reagendado de novo; para repetir mais uma vez o atendimento, reagenda-se o novo agendamento, depois de concluído.

## Onde se aplica

- Requisitos: [RF032](requisitos.md), [RF056](requisitos.md)
- Casos de uso: [UC25](UC25-reagendar-servico-concluido.md)
