---
issue: 60
pull_request: 82
---

# Relatório: Tela do dashboard com dados de demonstração, gráficos e análise do período

Em quatro PRs: o PR #80, da base (`Refs #60`, incorporado em 9e12184); o PR #81, da tela sem gráficos e sem análise (`Refs #60`, incorporado em ec5442b); o PR #82, dos gráficos (`Refs #60`); e o cartão da análise (`Closes #60`). Este relatório é parcial e cresce em cada PR; o plano segue em `em_execucao` até o quarto.

## O que foi feito

PR #80, base:

- **Tipos e constantes** (UC09, UC27): `Dashboard`, `DashboardAgendaItem`, `DashboardAnalysis` e os tipos dos itens, com os campos de L1; `DASHBOARD_INDICATORS` e `DASHBOARD_INDICATOR_LABELS`, os indicadores das observações da análise (RN039).
- **Formatação** (RNF016): `formatDayMonth`, o dia de calendário como "05/10", para o eixo do gráfico.
- **Dados de demonstração** (decisão 0055), de `GET /api/admin/dashboard` e `POST /api/admin/dashboard/analysis`: os agendamentos de 90 dias antes a 14 dias depois de hoje, nos dias abertos do `seed.sql`, com os indicadores de RN021 calculados sobre eles (L2); a agenda de hoje com seis agendamentos de clientes, veículos e serviços do `seed-demo.sql`; o período recusado fora das regras de RN035 (L4), com `VALIDATION_ERROR` e a mensagem de cada campo; a análise fixa, sem algarismos, com `hasComparison` e o período anterior de RN038.
- **Documentação das lacunas L1, L2 e L4.**

PR #81, tela:

- **Página `/admin`** (UC09): troca o título provisório pelo título "Dashboard", o aviso de demonstração logo abaixo dele e o `DashboardView`.
- **Seletor de período** (UC09 FE02, RN035, L3): os atalhos "Este mês", "Hoje", "7 dias" e "30 dias" e os campos "De" e "Até"; os atalhos valem na hora, e a mudança de um campo, 300 ms depois da última alteração. A primeira leitura vai sem período (o padrão é o mês atual do servidor) e os campos mostram o período da resposta; fica marcado o atalho que coincide com o período mostrado. Nada é desativado na leitura e o foco não sai do controle usado. O período recusado mostra a mensagem junto ao campo e "Informe um período válido para ver o dashboard."; a linha de status anuncia "Período exibido: …".
- **Indicadores** (UC09, RF040, RN021): "Receita", "Agendamentos", "Ticket médio" e "Taxa de cancelamento", com os valores da resposta e uma linha de apoio em cada um; período sem agendamentos (UC09 FE01): valores zerados e "Não há dados a apresentar neste período."
- **Agenda do dia** (RF043): os agendamentos de hoje por horário, com cliente, veículo, serviços, total e a etiqueta de status; sem itens, "Nenhum agendamento para hoje".
- **Estados** (RNF004): na primeira leitura, o lugar reservado; numa nova leitura, o conteúdo anterior em "Carregando"; na falha (UC09 FE03), o aviso com "Tentar novamente", e o seletor continua.
- **Documentação:** o módulo `dashboard-do-painel.md` (L3 e as partes de L2 e L6 desta tela).

PR #82, gráficos:

- **Recharts** (RNF006): `recharts` 3.10.1 e `react-is` 19.3.0, em versão exata, em `package.json` e `package-lock.json`.
- **Receita por dia** (UC09 passo 3, RF041, L5): barras, uma por dia do período, em `--link`; eixo horizontal com o dia e o mês (`formatDayMonth`) e poucos rótulos, eixo vertical em reais, dica com a data e o valor. Sem receita: "Nenhuma receita no período."
- **Agendamentos por status** (RF042, RN017, L5): barras horizontais, uma por status, com o nome e a quantidade escritos; as cores seguem os tons de `StatusBadge`. Sem agendamentos: "Nenhum agendamento no período."
- **Acesso sem a cor e sem o mouse** (RNF005): cada gráfico tem uma tabela com os mesmos dados, visualmente oculta; o desenho é `aria-hidden`, sem a camada de acessibilidade do Recharts e sem elemento focável.
- **Sob demanda** (RNF006): o Recharts só é importado por `dashboard-charts.tsx`, carregado por `next/dynamic` com `ssr: false` quando a primeira resposta chega, com o lugar do gráfico reservado.
- **Documentação:** a seção "Gráficos" de `design.md` (L5), os gráficos no módulo da tela, o Recharts na linha da stack de `AGENTS.md` e a decisão 0056.

## Arquivos alterados

PR #80:

- `src/shared/api/dashboard.ts` e `src/shared/constants/dashboard-indicators.ts`: criados.
- `src/shared/format/date.ts`: `formatDayMonth`; `src/shared/format/README.md`.
- `src/lib/demo/dashboard.ts`: criado; `src/lib/demo/routes.ts`: as duas entradas.
- `tests/format/date.test.ts`: os três casos de `formatDayMonth`.
- `docs/agendamento/rotas.md` (L1), `docs/agendamento/RN021-indicadores-do-dashboard.md` e `docs/agendamento/calculos.md` (L2), `docs/plataforma/RN035-formatos-dos-dados.md` (L4) e `docs/padroes/testes.md`.

PR #81:

- `src/app/(admin)/admin/page.tsx`: o dashboard no lugar do título provisório.
- `src/components/admin/dashboard/dashboard-view.tsx`, `dashboard-period.ts`, `period-selector.tsx`, `indicator-cards.tsx` e `today-schedule.tsx`: criados.
- `src/components/admin/dashboard/README.md`: as funções puras da tela.
- `docs/agendamento/dashboard-do-painel.md`: criado; `docs/agendamento/CONTEXT.md`: a linha do módulo novo.

PR #82:

- `src/components/admin/dashboard/dashboard-charts.tsx` e `chart-card.tsx`: criados; `dashboard-view.tsx`: os dois cartões dos gráficos e os lugares reservados.
- `package.json` e `package-lock.json`: `recharts` e `react-is`.
- `docs/padroes/design.md` (seção "Gráficos"), `docs/agendamento/dashboard-do-painel.md`, `AGENTS.md`.
- `docs/decisoes/0056-recharts-nos-graficos-do-dashboard.md`: criado; `docs/decisoes/CONTEXT.md`: a linha.

Nos três: `memoria/tarefas/60-telas-do-dashboard/`, com o plano, as notas e este relatório.

## Testes executados

PR #80:

- `npm run check`: formatação, tipos, lint e 414 testes, sem erros nem avisos; os três casos novos de `formatDayMonth` foram escritos antes e falharam antes da função.
- `npx next build` e `npm audit --omit=dev --audit-level=high`: sem erros e sem vulnerabilidades.
- Manual, sem tela (a página ainda era a provisória): as duas respostas e as duas entradas de `routes.ts` conferidas por testes temporários do Vitest, apagados antes do commit; o roteiro e os resultados estão em `notas.md`.

PR #81 (o roteiro e os resultados completos estão em `notas.md`):

- `npm run check` (414 testes, sem mudança: a tela é conferida à mão, decisão 0052), `npx next build` e `npm audit --omit=dev --audit-level=high`, sem erros.
- Local, com o banco local, o admin de teste e o `next start` num Chrome sem interface: 360 × 800 e 1440 × 900, claro e escuro, sem transbordar; os quatro atalhos e os dois campos (valores, atalho marcado, foco e `aria-busy`); os atalhos nas viradas, com a data do aparelho fixada em 02/03/2026, 29/02/2028 e 01/01/2027; o período invertido, de 367 e de 366 dias e sem dados; a falha da leitura, a agenda vazia, a leitura lenta e a digitação de uma data (uma leitura só), por alteração temporária de `src/lib/demo`, desfeita por `git checkout`.
- Lighthouse 13.5.0 em `/admin`, com o cookie da sessão de teste: acessibilidade 100 no celular e no computador, claro e escuro; e 100 nas 12 capturas dos estados (período invertido, sem dados e atalho marcado). Desempenho no celular: 95, LCP 3,0 s (simulado), CLS 0 e TBT de 50 a 60 ms; no computador, 100.
- Registro do `next start`: sem cookie, token, cabeçalho de autorização, senha nem e-mail de teste, e sem nenhuma linha de erro.

PR #82 (o roteiro e os resultados completos estão em `notas.md`):

- `npm run check` (414 testes), `npx next build` e `npm audit --omit=dev --audit-level=high` (0 vulnerabilidades), sem erros.
- Local, no Chrome sem interface, com o banco local e o `next start`: os dois gráficos a 360 × 800 e 1440 × 900, claro e escuro; a soma da tabela da receita é a "Receita", a da tabela de status é "Agendamentos", e o ticket médio e a taxa saem delas; contraste das marcas sobre o cartão de 4,8:1 no mínimo; nenhum elemento focável no desenho e 40 Tab nunca entram em um gráfico; atalho "7 dias", período sem dados, volta ao mês e 366 dias.
- Código sob demanda: o HTML de `/admin` não referencia o chunk dos gráficos (360 KB, 102.572 bytes com gzip), que é pedido depois do evento de carga; no Lighthouse do celular, o pedido ficou aos 601 ms, depois da carga (162 ms) e do LCP (233 ms), sem a limitação de rede.
- Lighthouse 13.5.0 em `/admin`, com o cookie da sessão de teste: acessibilidade 100 no celular e no computador, claro e escuro; desempenho no celular 92 (TBT 180 ms, LCP 3,0 s, CLS 0) e no computador 100.
- Contêiner (P3, parte do agente, sem o `.env.local`): `docker compose build` com `npm ci` e `npm run build` sem erro (imagem de 420 MB); a imagem roda como o usuário 1000 e tem o chunk dos gráficos; um contêiner novo, sem variáveis, serve `/` e `/services` com 200 e o chunk com 200 (`application/javascript`, 360042 bytes). A tela logada no contêiner (`docker compose up --build` com o `.env.local`) é a parte do Yvan.
- Registro do `next start`: sem cookie, token, cabeçalho de autorização, senha nem e-mail de teste, e sem linha `error` ou `warn`.

## Documentação atualizada

- Módulos: `docs/agendamento/rotas.md`, `docs/agendamento/RN021-indicadores-do-dashboard.md`, `docs/agendamento/calculos.md`, `docs/plataforma/RN035-formatos-dos-dados.md`, `docs/padroes/testes.md`, `docs/agendamento/dashboard-do-painel.md` (novo), `docs/agendamento/CONTEXT.md`, `docs/padroes/design.md` (seção "Gráficos"), `docs/decisoes/CONTEXT.md` e `AGENTS.md` (stack).
- Lacunas resolvidas: L1 (campos da resposta de `GET /api/admin/dashboard`) → `rotas.md`; L2 (o que os indicadores e a agenda contam) → `RN021` e `calculos.md`, seção 5, e `dashboard-do-painel.md`; L3 (seletor de período) → `dashboard-do-painel.md`; L5 (gráficos) → `design.md`, seção "Gráficos", e `dashboard-do-painel.md`; L4 (12 meses são 366 dias) → `RN035`; L6 (textos), a parte desta tela → `dashboard-do-painel.md`.
- Decisões: 0056 criada (Recharts nos gráficos do dashboard, carregado sob demanda).
- Documentos formais a atualizar (#67): Análise do Sistema, seção 9.1 (Quadro 20): RN021 e RN035, com os textos acima; Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A: os campos de `GET /api/admin/dashboard`; seção 9 (Quadro 38): a decisão 0056.

## Pendências

- O cartão da análise, no PR seguinte da #60 (`Closes #60`), com o resto de L6.
- A tela logada no contêiner, pelo Yvan (P3).
