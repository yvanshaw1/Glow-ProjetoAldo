---
id: RN021
titulo: Indicadores do dashboard
assunto: agendamento
tema: Indicadores
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20); issue #60, plano memoria/tarefas/60-telas-do-dashboard/01_plano.md (L2)
relacionados: [RF040, UC09, UC27, RN038]
---

# RN021 – Indicadores do dashboard

A receita corresponde à soma dos valores dos agendamentos pagos no período, ou seja, com o status “Concluído” ou “Reagendado”; o ticket médio, à receita dividida pela quantidade desses agendamentos; e a taxa de cancelamento, ao percentual de agendamentos cancelados em relação ao total de agendamentos do período. A quantidade de agendamentos é o total de agendamentos do período, de qualquer status, e a taxa de cancelamento é calculada sobre ele; o agendamento pertence ao período pela data marcada, e a receita, pela data de conclusão. Sem agendamentos pagos, o ticket médio é zero.

## Onde se aplica

- Requisitos: [RF040](requisitos.md)
- Casos de uso: [UC09](UC09-visualizar-dashboard.md), [UC27](UC27-gerar-analise-do-dashboard.md)
- Regras: [RN038](RN038-dados-da-analise-do-dashboard.md)
