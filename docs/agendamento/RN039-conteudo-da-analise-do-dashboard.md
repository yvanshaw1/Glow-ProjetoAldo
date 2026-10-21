---
id: RN039
titulo: Conteúdo da análise do dashboard
assunto: agendamento
tema: Indicadores
origem: issue #66, plano memoria/tarefas/66-analise-por-ia/01_plano.md (L3)
relacionados: [RF089, RF090, UC27, RN038, RS020]
---

# RN039 – Conteúdo da análise do dashboard

A análise só interpreta os valores recebidos: não calcula nem apresenta números, que são sempre os exibidos pelo sistema nos indicadores, e nenhuma ação é executada a partir dela. Ela tem um resumo de até 600 caracteres e até quatro observações de até 240 caracteres, cada uma ligada a um indicador, em português do Brasil e sem algarismos. A resposta fora desse formato é descartada, e a análise é tratada como não gerada.

## Onde se aplica

- Requisitos: [RF089](requisitos.md), [RF090](requisitos.md)
- Casos de uso: [UC27](UC27-gerar-analise-do-dashboard.md)
- Conferência da resposta: [calculos.md](calculos.md), seção 6
