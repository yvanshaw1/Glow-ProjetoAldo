---
issue: 60
pull_request: 80
---

# Relatório: Tela do dashboard com dados de demonstração, gráficos e análise do período

Em quatro PRs: o PR #80, da base (`Refs #60`); a tela sem gráficos e sem análise (`Refs #60`); os gráficos (`Refs #60`); e o cartão da análise (`Closes #60`). Este relatório é parcial e cresce em cada PR; o plano segue em `em_execucao` até o quarto.

## O que foi feito

PR #80, base:

- **Tipos e constantes** (UC09, UC27): `Dashboard`, `DashboardAgendaItem`, `DashboardAnalysis` e os tipos dos itens, com os campos de L1; `DASHBOARD_INDICATORS` e `DASHBOARD_INDICATOR_LABELS`, os indicadores das observações da análise (RN039).
- **Formatação** (RNF016): `formatDayMonth`, o dia de calendário como "05/10", para o eixo do gráfico.
- **Dados de demonstração** (decisão 0055), de `GET /api/admin/dashboard` e `POST /api/admin/dashboard/analysis`: os agendamentos de 90 dias antes a 14 dias depois de hoje, nos dias abertos do `seed.sql`, com os indicadores de RN021 calculados sobre eles (L2); a agenda de hoje com seis agendamentos de clientes, veículos e serviços do `seed-demo.sql`; o período recusado fora das regras de RN035 (L4), com `VALIDATION_ERROR` e a mensagem de cada campo; a análise fixa, sem algarismos, com `hasComparison` e o período anterior de RN038.
- **Documentação das lacunas L1, L2 e L4.**

## Arquivos alterados

- `src/shared/api/dashboard.ts` e `src/shared/constants/dashboard-indicators.ts`: criados.
- `src/shared/format/date.ts`: `formatDayMonth`; `src/shared/format/README.md`.
- `src/lib/demo/dashboard.ts`: criado; `src/lib/demo/routes.ts`: as duas entradas.
- `tests/format/date.test.ts`: os três casos de `formatDayMonth`.
- `docs/agendamento/rotas.md` (L1), `docs/agendamento/RN021-indicadores-do-dashboard.md` e `docs/agendamento/calculos.md` (L2), `docs/plataforma/RN035-formatos-dos-dados.md` (L4) e `docs/padroes/testes.md`.
- `memoria/tarefas/60-telas-do-dashboard/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: formatação, tipos, lint e 414 testes, sem erros nem avisos; os três casos novos de `formatDayMonth` foram escritos antes e falharam antes da função.
- `npx next build` e `npm audit --omit=dev --audit-level=high`: sem erros e sem vulnerabilidades.
- Manual, sem tela (a página ainda é a provisória): as duas respostas e as duas entradas de `routes.ts` conferidas por testes temporários do Vitest, apagados antes do commit; o roteiro e os resultados estão em `notas.md`.

## Documentação atualizada

- Módulos: `docs/agendamento/rotas.md`, `docs/agendamento/RN021-indicadores-do-dashboard.md`, `docs/agendamento/calculos.md`, `docs/plataforma/RN035-formatos-dos-dados.md`, `docs/padroes/testes.md`.
- Lacunas resolvidas: L1 (campos da resposta de `GET /api/admin/dashboard`) → `rotas.md`; L2 (o que os indicadores e a agenda contam) → `RN021` e `calculos.md`, seção 5; L4 (12 meses são 366 dias) → `RN035`.
- Decisões: nenhuma neste PR; a 0056 (Recharts) entra na etapa 03 do PR dos gráficos.
- Documentos formais a atualizar (#67): Análise do Sistema, seção 9.1 (Quadro 20): RN021 e RN035, com os textos acima; Arquitetura de Software, Apêndice A: os campos de `GET /api/admin/dashboard`.

## Pendências

- Tela sem gráficos e sem análise, gráficos e cartão da análise, nos PRs seguintes da #60.
- L3, L5 e L6 e a decisão 0056 entram com os PRs que os usam.
