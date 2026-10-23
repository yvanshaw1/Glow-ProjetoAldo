---
issue: 60
titulo: "Tela do dashboard com dados de demonstração, gráficos e análise do período"
areas: [frontend, testes]
tipo: funcionalidade
requisitos: [UC09, UC27, RF040, RF041, RF042, RF043, RF089, RF090, RN021, RN035, RN038, RN039, RNF001, RNF003, RNF004, RNF005, RNF006, RNF016, RNF017]
status: em_execucao
aprovado_por: yvan
aprovado_em: 23/10/2026
---

# Plano: Tela do dashboard com dados de demonstração, gráficos e análise do período

## Objetivo

Trocar o dashboard provisório de `/admin` pela tela final (T4 de `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, decisão 0055), com os dados de demonstração de `GET /api/admin/dashboard` e de `POST /api/admin/dashboard/analysis`:

- o seletor de período, os quatro indicadores, a receita por dia, a distribuição dos agendamentos por status e a agenda do dia (UC09, RF040 a RF043, RN021);
- o cartão "Análise do período", com o andamento, a análise de demonstração e a identificação de conteúdo gerado por IA (UC27, RF089, RF090, RN038, RN039);
- o Recharts, dependência nova, carregado sob demanda com `next/dynamic` (RNF006), com o registro de decisão e a conferência em contêiner.

Nenhuma rota, migration, esquema de validação ou import de `src/server/`. A dependência nova só entra com este plano aprovado, e a decisão só é gravada depois, na etapa 03.

## Base conferida

- Issue #60 aberta. Dependências cumpridas: a #56 (PR #69, incorporado em 21/10/2026) e a documentação da #66 (PR #68, incorporado em 21/10/2026): RF089, RF090, UC27, RN038, RN039 e a decisão 0054 estão em `docs/` e na `origin/main`.
- `origin/main` em 94372c1 (#79), sem PR aberto; a ramificação desta sessão (`claude/60-telas-do-dashboard-956140`) está no mesmo commit, com a árvore limpa. As issues #51 (rota do dashboard) e #66 (código da análise) estão abertas e sem código: `src/shared/api/dashboard.ts` e `src/shared/constants/dashboard-indicators.ts` não existem, e esta tarefa os cria (Em comum com outras tarefas).
- Wireframes `staffPages/dashboard/` (mobile e desktop), usados só para o esqueleto: o seletor de período no topo, os cartões de indicadores, os dois gráficos e a agenda. Sem requisito no wireframe, ficam de fora: a saudação, o cartão "Avaliação média", o painel "Alertas", a variação "vs período anterior" dos cartões (a rota não devolve o período anterior), o seletor "Hoje | 7 dias | 30 dias" como único modo de escolher o período e a rosca de status (L3 e L5).
- Contratos usados sem mudança:
  - `DEMO_ROUTES`, `DemoRequest` e `findDemoRoute` (`src/lib/demo/`); `useApiQuery` (`src/hooks/`); `apiRequest`, `ApiError` e `withQuery` (`src/lib/api-client.ts`);
  - `APPOINTMENT_STATUSES` e `APPOINTMENT_STATUS_LABELS` (`src/shared/constants/appointment-statuses.ts`); `PERMISSION_LABELS`; `COMPANY_TIME_ZONE`;
  - `formatCurrency`, `formatPercent`, `formatDate`, `formatTime`, `formatDateTime`, `formatLongDate` e `formatCalendarDate` (`src/shared/format/`); `formatPlate`;
  - `DemoNotice`, `StatusBadge` e `EmptyState` (`src/components/shared/`); `Alert`, `Button` (com `focusableWhenDisabled`), `Input`, `Field` e `Skeleton` (`src/components/ui/`, decisão 0049).
- Herdado da #78 (notas de passagem em `side-session-notes/local_2af89669-…`, dados de outra sessão): a regra de `componentes.md` de que a leitura que acompanha o formulário não desativa os campos nem o foco (vale para o seletor de período e para "Gerar análise"); o `Button` com `focusableWhenDisabled` fica `aria-disabled` e focável; `matches(":disabled")` e não `.disabled` diz se um botão está desativado de fato; toda resposta de demonstração espera 400 ms; os roteiros de verificação (`browser.mjs`, `lh-snapshot.mjs`, `patch-states.mjs`) servem de base.

## Como funciona

`/admin` é um componente de servidor que só compõe o título e os componentes de cliente; cada um busca o que exibe (`frontend.md`). Mobile first: a 360 × 800 primeiro, depois 1440 × 900, claro e escuro. O conteúdo vem de UC09 e UC27, o esqueleto do wireframe e o estilo de `design.md`. Os textos estão em L6.

### Página

`src/app/(admin)/admin/page.tsx`, com o `metadata` "Dashboard – Glow": o título (`h1`, `PERMISSION_LABELS.dashboard`), o `DemoNotice` logo abaixo dele (a tela inteira é de demonstração, `componentes.md`) e o `DashboardView`. Ordem das seções, numa coluna, com 32 px entre elas: seletor de período, indicadores, "Análise do período" (na largura toda, como no plano da #66), os dois gráficos e a agenda do dia. Os indicadores ficam em 1 coluna, 2 a partir de 768 px e 4 a partir de 1280 px (a barra do painel ocupa 256 px a partir de 1024 px); os gráficos, empilhados, e lado a lado a partir de 1280 px (receita em 2/3 e status em 1/3).

### `DashboardView` e o período

`dashboard-view.tsx` (cliente): guarda o período pedido e lê `GET /api/admin/dashboard` com `useApiQuery<Dashboard>` e `withQuery`. A primeira leitura vai sem `from` nem `to`: o padrão é o mês atual do servidor (`rotas.md`), então a tela não usa o relógio do aparelho para o padrão (nada de hidratação diferente), e os campos passam a mostrar o `from` e o `to` da resposta (L1). Cada leitura nova mantém os dados anteriores, com `aria-busy` e a aparência de "Carregando" de `design.md`; só a primeira mostra lugares reservados (`Skeleton`) com a altura final, para o CLS ficar até 0,1.

### Seletor de período (`period-selector.tsx`)

Conforme L3: um grupo "Período" com os atalhos "Este mês", "Hoje", "7 dias" e "30 dias" (botões com `aria-pressed`, marcado o que coincide com o período mostrado) e os campos "De" e "Até" (`input type="date"`, `Field` do shadcn). Os atalhos aplicam na hora; a mudança de um campo vale 300 ms depois da última alteração, como a busca das listagens, porque o campo de data do Chrome entrega valores intermediários enquanto o ano é digitado. Nada é desativado durante a leitura, e o foco fica onde está (`componentes.md`, #78). A resposta 400 (UC09 FE02) mostra a mensagem de cada campo, vinculada a ele, e a área de resultados mostra "Informe um período válido para ver o dashboard." Uma linha `role="status"` diz "Período exibido: 01/10/2026 a 31/10/2026." quando a resposta chega. Os atalhos calculam datas de calendário (`aaaa-mm-dd`) no fuso da empresa em `dashboard-period.ts`: Hoje, os 7 e os 30 últimos dias com o de hoje, e o mês inteiro; é um clique, então não há relógio na hidratação.

### Indicadores (`indicator-cards.tsx`)

Quatro superfícies em lista de descrição (`dl`): "Receita" (`formatCurrency`), "Agendamentos" (inteiro), "Ticket médio" (`formatCurrency`) e "Taxa de cancelamento" (`formatPercent`), cada uma com uma linha de apoio de L6, sem variação em relação ao período anterior. Período sem agendamentos (UC09 FE01): os valores zerados e o texto "Não há dados a apresentar neste período." Os números são os da resposta: a tela não calcula nada de RN021.

### Gráficos (`chart-card.tsx` e `dashboard-charts.tsx`)

Conforme L5. O `chart-card.tsx` (título `h2`, texto de vazio e uma tabela com os mesmos dados, visualmente oculta, para o leitor de tela) não usa o Recharts e vem com a página. O `dashboard-charts.tsx` (só o SVG, em `aria-hidden`, sem a camada de acessibilidade do Recharts, para não haver elemento focável escondido) é carregado por `dynamic(() => import(...), { ssr: false, loading })` dentro do `DashboardView`, e só é pedido quando a primeira resposta chega: o código dos gráficos não está no JavaScript inicial (RNF006). Enquanto ele carrega, o lugar reservado mantém a altura do gráfico.

- **Receita por dia:** barras, uma por dia do período, em `--link`; eixo X com `formatDayMonth` e poucos rótulos (`interval="preserveStartEnd"`), eixo Y com `formatCurrency`, e a dica com a data (`formatDate`) e o valor. Sem receita no período: "Nenhuma receita no período."
- **Agendamentos por status:** barras horizontais, uma por status, na ordem de RN017, com o nome do status à esquerda e a quantidade escrita na ponta de cada barra; as cores seguem os tons da etiqueta de status (`componentes.md`).

### Agenda do dia (`today-schedule.tsx`)

`h2` "Agenda do dia", com a data de hoje por extenso (`formatLongDate`), e uma lista ordenada por horário: horário de início e previsão de conclusão (`formatTime`), cliente, veículo ("Volkswagen Polo · GLW1A01"), serviços, total e a etiqueta de status (`StatusBadge`, RN017, RN037). Uma coluna no celular; a linha em colunas a partir de 768 px. Sem itens, o `EmptyState` de L6.

### Análise do período (`dashboard-analysis-card.tsx`)

Como no plano da #66 ("Tela"), com três ajustes e os textos de L6:

- **Estados:** inicial, gerando, resultado, sem comparação (`hasComparison: false`), sem dados (botão indisponível, UC27 FE01) e falha com "Tentar novamente" (UC27 FE02, RNF017: os indicadores continuam). Uma região `role="status"` sempre presente recebe "Análise gerada."; o texto aparece como texto, nunca como HTML (RS020).
- **Botão indisponível sem perder o foco:** "Gerando análise…" e "Sem dados" usam `aria-disabled` com o foco mantido (`Button` com `focusableWhenDisabled`), não o atributo `disabled`; o plano da #66 dizia só "desativado" (L2 da #78).
- **Chamada pelo clique, não pelo efeito:** a geração é uma ação com custo, então usa `apiRequest` num manipulador de clique, com `AbortController`, e não `useApiQuery`, que dispara no efeito (o Strict Mode o executa duas vezes em desenvolvimento, e a rota real da #66 chamaria a IA duas vezes). Trocar o período remonta o cartão e cancela a chamada (UC27 FA02).
- **Data e hora:** "às" de RN035 (`formatDateTime`, fuso da empresa, decisão 0053), no lugar da vírgula do plano da #66.

### Dados de demonstração (decisão 0055)

`src/lib/demo/dashboard.ts` responde as duas rotas, a segunda como `POST` que não grava:

- **Série gerada:** agendamentos de 90 dias antes a 14 dias depois de hoje (dia no fuso da empresa), como o `seed-demo.sql`, nos dias abertos do `seed.sql` (segunda a sexta, de 08:00 às 18:00, e sábado, de 08:00 às 12:00): de 2 a 4 por dia (1 ou 2 no sábado), com o número do dia calculado de forma determinística, sem `Math.random`, para o gráfico não mudar a cada leitura. O total de cada um é um dos seis totais de combinações do seed já usados em `src/lib/demo/appointments.ts` (R$ 105,00, 130,00, 190,00, 220,00, 390,00 e 550,00). Status como no seed: dias futuros "Agendado" (5% "Cancelado"); passados "Concluído" (10% "Cancelado" e 5% "Reagendado").
- **Hoje:** seis agendamentos fixos, com os clientes e veículos do seed (Ana Souza, Polo `GLW1A01`; Bruno Lima, Corolla `GLW2B02`; Carla Mendes, Compass `GLW3C03`; Diego Ferreira, Hilux `GLW4D04`; Eduarda Santos, HB20 `GLW5E05`; Felipe Araújo, City `GLW6F06`), nos status Concluído, Finalizado, Em execução, Em espera, Agendado e Cancelado, sempre no dia da consulta, mesmo num domingo, como o "Em execução" da #58.
- **Indicadores:** calculados sobre a lista, como L2 (opção 1): a quantidade e a taxa de cancelamento pela data marcada, a receita e o ticket médio pela data de conclusão. A resposta recusa o período fora de L3 e de L4 com `ApiError` 400 `VALIDATION_ERROR` e a mensagem de cada campo.
- **Análise:** o período anterior (RN038: mesma quantidade de dias, terminado no dia anterior) só serve a `hasComparison`: `false` quando a série não tem nenhum agendamento nele (por exemplo, um período que começa no primeiro dia dos dados). O resumo e as quatro observações são fixos, sem algarismos, sem afirmar alta nem queda e com o resumo dizendo que é uma análise de demonstração escrita à mão (RN039: resumo até 600 e observações até 240 caracteres, indicadores da lista); `generatedAt` é o instante da resposta.
- **Entradas em `routes.ts`:** `GET /api/admin/dashboard` e `POST /api/admin/dashboard/analysis`, ambas com `load`. Nenhuma gravação nesta tela.

### Tipos, constantes e formatação

- `src/shared/api/dashboard.ts`: `Dashboard`, `DashboardAgendaItem` e `DashboardAnalysis`, com os campos de L1 e do contrato de `rotas.md`.
- `src/shared/constants/dashboard-indicators.ts`: `DASHBOARD_INDICATORS` (`revenue`, `appointmentCount`, `averageTicket`, `cancellationRate`, `revenueByDay`, `appointmentsByStatus`) e `DASHBOARD_INDICATOR_LABELS` ("Receita", "Agendamentos", "Ticket médio", "Taxa de cancelamento", "Receita por dia", "Agendamentos por status"), os nomes do plano da #66.
- `src/shared/format/date.ts` (TDD): `formatDayMonth(date)`, o dia de calendário como "05/10", para o eixo do gráfico.

## Ordem da construção

Em quatro PRs, um por parte da tela, cada um com a verificação local e a etapa 03 próprias (ponto P1):

**PR 1, base** (`feat/60-dashboard-base`, "Refs #60"):

1. Ramificação da `origin/main`, sem vínculo, e `npx -y npm@11.21.1 ci`.
2. Testes de `formatDayMonth` em `tests/format/date.test.ts`, em vermelho, num commit próprio (decisões 0035 e 0052); depois a função, até passarem.
3. Tipos, constantes, `src/lib/demo/dashboard.ts` e as duas entradas de `routes.ts`.
4. Documentação: L1 e L2 em `rotas.md`, `RN021` e `calculos.md`; L4 em `RN035`.
5. Verificação local das duas respostas (a tela ainda é a provisória); etapa 03 do PR 1 (`02_relatorio.md` parcial).

**PR 2, tela sem gráficos e sem análise** (`feat/60-dashboard-screen`, "Refs #60"), depois da incorporação do PR 1:

6. Página, `DashboardView`, `dashboard-period.ts`, seletor, indicadores e agenda do dia, com os estados de carregamento, vazio, período inválido e falha.
7. Documentação: o módulo novo `docs/agendamento/dashboard-do-painel.md` (período, indicadores, agenda e estados de L6) e a linha em `agendamento/CONTEXT.md`.
8. Verificação local; etapa 03 do PR 2.

**PR 3, gráficos** (`feat/60-dashboard-charts`, "Refs #60"), depois do PR 2:

9. `npx -y npm@11.21.1 install --save-exact recharts@3.10.1` (e o par `react-is`, se o npm o pedir; `npm ls react-is` confere); `chart-card.tsx` e `dashboard-charts.tsx`, ligados ao `DashboardView` por `next/dynamic`.
10. Documentação: "Gráficos" em `design.md` (L5), os gráficos no módulo da tela, o Recharts na linha da stack de `AGENTS.md`.
11. Verificação local, o Lighthouse do celular e a conferência em contêiner (P3); etapa 03: o registro da decisão 0056 (número livre na hora) e a linha em `docs/decisoes/CONTEXT.md`.

**PR 4, análise** (`feat/60-dashboard-analysis`, "Closes #60"), depois do PR 3:

12. `dashboard-analysis-card.tsx` ligado ao `DashboardView`, com a chamada pelo clique.
13. Documentação: o cartão e os textos no módulo da tela.
14. Verificação local; etapa 03: `02_relatorio.md` completo e o plano em `concluido`.

## Critérios de aceitação e verificação

Os passos de tela são manuais (decisão 0052); a única função pura de `src/shared/` é a de formatação, com teste. Os valores esperados dependem do dia da consulta (os dados são relativos a hoje), então a verificação confere a coerência entre as partes da própria tela, que não depende da data.

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado o período padrão, quando abro `/admin`, então vejo os quatro indicadores, os dois gráficos e a agenda do dia (UC09, RF040 a RF043, RN021) | Local, com o admin local: o aviso de demonstração abaixo do `h1`; os campos mostram o mês atual inteiro (do dia 1 ao último); os quatro indicadores; os dois gráficos; seis itens na agenda, em ordem de horário, com a etiqueta de cada status. Coerência: a soma da tabela da receita por dia é a "Receita"; a soma da tabela de status é "Agendamentos"; cancelados ÷ total × 100 é a taxa; receita ÷ (Concluído + Reagendado) é o ticket médio. A lista de requisições não tem chamada a `/api/admin/*` |
| Dado outro período, quando escolho um atalho ou digito as datas, então os números mudam, a tela continua usável e a análise some (UC09, UC27 FA02) | Local: "Hoje", "7 dias", "30 dias" e "Este mês"; datas digitadas. O foco não sai do controle usado; nada fica desativado na leitura (`matches(":disabled")` falso em todos); `aria-busy` na área de resultados; a linha de status anuncia o período. Atalhos nas viradas, com `Date` fixada no Chrome sem interface (o resultado esperado, à mão): em 23/10/2026, Hoje 23/10 a 23/10, 7 dias 17/10 a 23/10, 30 dias 24/09 a 23/10, Este mês 01/10 a 31/10; em 02/03/2026, 7 dias 24/02 a 02/03, 30 dias 01/02 a 02/03; em 29/02/2028, 7 dias 23/02 a 29/02, 30 dias 31/01 a 29/02, Este mês 01/02 a 29/02; em 01/01/2027, 7 dias 26/12/2026 a 01/01/2027, 30 dias 03/12/2026 a 01/01/2027, Este mês 01/01 a 31/01 |
| Dado um período sem agendamentos, quando o escolho, então vejo os indicadores zerados e a mensagem, e "Gerar análise" fica indisponível (UC09 FE01, UC27 FE01) | Local: um período anterior aos dados (de 01/01/2025 a 31/01/2025): R$ 0,00, 0, R$ 0,00 e 0,00%; "Não há dados a apresentar neste período."; "Nenhuma receita no período."; agenda ainda com os de hoje; botão com `aria-disabled` e a mensagem ligada por `aria-describedby` |
| Dado um período inválido, quando o escolho, então vejo a mensagem junto ao campo e peço outro (UC09 FE02, UC27 FE03) | Local: "Até" anterior a "De"; intervalo de 367 dias; 366 dias aceito (L4). A mensagem ligada ao campo (`aria-invalid`, `aria-describedby`) e o aviso da área de resultados |
| Dado a falha da leitura, quando abro ou atualizo, então vejo a mensagem com "Tentar novamente" e o seletor continua (UC09 FE03, RNF004) | Local, com alteração temporária de `src/lib/demo/dashboard.ts` (falha na leitura), sem commit, desfeita e conferida por `git diff`; "Tentar novamente" lê de novo; a lista de requisições sem chamada repetida sozinha |
| Dado "Gerar análise", quando o aciono, então o cartão mostra o andamento e depois a análise de demonstração, com o aviso de demonstração da tela (UC27, RF089, RF090) | Local: "Gerando análise…" com o botão `aria-disabled` e o foco nele; depois o resumo, as observações com o rótulo do indicador, a nota com `Sparkles`, "Gerado por inteligência artificial em 23/10/2026 às 14:32" (fuso da empresa) e "Gerar novamente"; o `role="status"` diz "Análise gerada."; o texto não tem algarismo (RN039). Outro período: o cartão volta ao início. Período cujo anterior não tem dados: o aviso de "sem comparação" (UC27 FA03). Falha da geração (alteração temporária): o aviso com "Tentar novamente", e os indicadores continuam (UC27 FE02, RNF017) |
| Dado o Lighthouse no celular, quando audito `/admin`, então o código dos gráficos só carrega depois da página (RNF006) | Local, `next build` e `next start`: o chunk do Recharts (achado por busca de texto em `.next/static/chunks`) não está nos `<script>` do HTML de `/admin`; no Chrome sem interface, o pedido dele começa depois do evento `load` e depois da primeira resposta; o Lighthouse de desempenho no celular, com o cookie da sessão de teste, lista o chunk depois do LCP, e o CLS fica até 0,1. Pré-visualização, pelo Yvan: o Lighthouse e o LCP no PR |
| Dado cada gráfico, quando o leio sem ver as cores ou sem o mouse, então tenho os mesmos dados (RNF005, `design.md`) | Local: a tabela oculta de cada gráfico tem os valores; o nome e a quantidade de cada status estão escritos na barra; o Lighthouse de acessibilidade sem `aria-hidden-focus`; contraste das marcas de `design.md` (L5) |
| Dado o eixo da receita por dia, quando ele mostra um dia, então o dia aparece como "dia/mês" (RNF016) | Teste `tests/format/date.test.ts`; local, o eixo X do gráfico |

Critérios comuns às telas de demonstração (issue):

| Critério | Verificação |
|---|---|
| Esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md` (decisão 0041) | Revisão: o que fica de fora do wireframe está em "Fora do escopo" e em L6 |
| `useApiQuery` com o endereço de `rotas.md`; tipos em `src/shared/api/dashboard.ts`; dados em `src/lib/demo/dashboard.ts`, com os nomes do `seed-demo.sql` | Revisão do diff; a geração da análise é a única chamada fora do `useApiQuery` (ação com custo, ver "Análise do período") |
| Carregamento, vazio e falha com "Tentar novamente" | Local: o carregamento nos 400 ms da demonstração; vazio, falha e falha da análise por alteração temporária, sem commit |
| O aviso de demonstração na tela; o envio de qualquer formulário mostra o `NOT_IMPLEMENTED`, e nada é gravado | O aviso abaixo do `h1`, antes de qualquer dado. A tela não tem formulário de gravação nem chamada de gravação |
| A 360 × 800 primeiro e a 1440 × 900, claro e escuro, pelo teclado, sem transbordar, Lighthouse de acessibilidade sem auditoria reprovada | Local, no Chrome sem interface: `/admin` e cada estado nas duas larguras e nos dois temas, `scrollWidth` igual a `innerWidth`; pelo teclado, os atalhos, os campos de data, "Gerar análise" e a tabela da agenda, com o contorno de foco; Lighthouse 13.5.0 de acessibilidade com o cookie da sessão de teste, celular e computador, claro e escuro |
| Nenhuma rota, migration ou esquema de validação novo, e nenhum import de `src/server/` | `git diff --stat` sem `src/app/api/`, `supabase/` nem `src/shared/validation/`; `grep` por `@/server` nos arquivos novos |

### Como a verificação local é feita

Como na #56 a #59 e na #78 (notas das tarefas e da passagem), em cada PR:

- **Banco local.** Docker Desktop aberto, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`; `npx supabase start` no primeiro plano (com `timeout`) e `npx supabase db reset`, só com o `seed.sql`. Nunca `--linked` nem `--db-url` (decisão 0043). A saída de `supabase start` imprime chaves locais: mascarada antes de ler.
- **Conta de teste.** Um admin local criado por `supabase/scripts/create-admin.mjs`, com e-mail fictício `@example.com` e a senha gerada por um roteiro do scratchpad, guardadas num arquivo dele e nunca exibidas; só existe no banco local.
- **Aplicação.** `npx next build` e `npx next start -p 3060`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las; encerrado por PID.
- **Telas**, num Chrome sem interface controlado pelo `puppeteer-core` do cache do Lighthouse 13.5.0 (o painel do app oculto trava o foco do Base UI; o tema padrão da máquina é o escuro, e o claro vem da emulação de `prefers-color-scheme`): login pela página, as duas larguras, os dois temas, o teclado, o foco (`describeFocus`, `readFocus`) e a lista de requisições. A falha e o vazio por alteração temporária de `src/lib/demo/dashboard.ts` (`patch-states.mjs`), desfeita com `git checkout -- src/lib`.
- **Lighthouse.** `npx -y lighthouse@13.5.0` com `--only-categories=accessibility,performance`, no celular e no computador, claro e escuro, com o cookie da sessão de teste por `--extra-headers` num arquivo do scratchpad apagado no fim; as janelas e os estados, no modo `snapshot`. O LCP e o CLS do celular ficam no PR.
- **Registro.** A saída do `next start` acumulada (`>>`) e conferida sem cookie, token, chave nem e-mail de teste.
- **Verificações automáticas.** `npm run check` sem erros nem avisos, `npx next build` e `npm audit --omit=dev --audit-level=high` (no PR 3, com a dependência nova).
- **Contêiner** (PR 3, ponto P3): `docker compose up --build -d`, `docker compose logs app`, `docker compose down`; nunca `docker inspect`, `docker exec` nem `docker compose config`.
- **Encerramento.** `next start` encerrado, `npx supabase stop`, alteração temporária desfeita (`git status` só com os arquivos do plano).

## Arquivos

| Arquivo | Ação | PR |
|---|---|---|
| `src/shared/api/dashboard.ts` | criar: `Dashboard`, `DashboardAgendaItem`, `DashboardAnalysis` | 1 |
| `src/shared/constants/dashboard-indicators.ts` | criar | 1 |
| `src/shared/format/date.ts` | alterar: `formatDayMonth` | 1 |
| `tests/format/date.test.ts` | alterar | 1 |
| `src/lib/demo/dashboard.ts` | criar | 1 |
| `src/lib/demo/routes.ts` | alterar: as duas entradas | 1 |
| `src/app/(admin)/admin/page.tsx` | alterar: troca o provisório | 2 |
| `src/components/admin/dashboard/dashboard-view.tsx` | criar (2); acrescentar os gráficos (3) e o cartão (4) | 2, 3, 4 |
| `src/components/admin/dashboard/dashboard-period.ts`, `period-selector.tsx`, `indicator-cards.tsx`, `today-schedule.tsx` | criar | 2 |
| `src/components/admin/dashboard/chart-card.tsx`, `dashboard-charts.tsx` | criar | 3 |
| `package.json`, `package-lock.json` | alterar: `recharts` (e `react-is`, se pedido) | 3 |
| `src/components/admin/dashboard/dashboard-analysis-card.tsx` | criar | 4 |
| `src/shared/format/README.md` | alterar: o dia e o mês | 1 |
| `docs/agendamento/rotas.md` | alterar (L1) | 1 |
| `docs/agendamento/RN021-indicadores-do-dashboard.md`, `docs/agendamento/calculos.md` | alterar (L2, seção 5) | 1 |
| `docs/plataforma/RN035-formatos-dos-dados.md` | alterar (L4) | 1 |
| `docs/agendamento/dashboard-do-painel.md` | criar (L3, L6) e acrescentar nos PRs 3 e 4 | 2, 3, 4 |
| `docs/agendamento/CONTEXT.md` | alterar: a linha do módulo novo | 2 |
| `docs/padroes/design.md` | alterar: a seção "Gráficos" (L5) | 3 |
| `docs/padroes/testes.md` | alterar: a linha "Formatação" (dia e mês) | 1 |
| `AGENTS.md` | alterar: o Recharts na linha da stack | 3 |
| `docs/decisoes/0056-recharts-nos-graficos-do-dashboard.md`, `docs/decisoes/CONTEXT.md` | criar e alterar (etapa 03 do PR 3, com o número livre na hora) | 3 |
| `memoria/tarefas/60-telas-do-dashboard/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` | todos |

Os README de `src/components/admin/dashboard/`, de `src/app/(admin)/admin/`, de `src/shared/api/`, de `src/shared/constants/` e de `src/lib/demo/` já descrevem o que entra e não mudam (confirmar na construção).

### Em comum com outras tarefas

- **#51** (rota do dashboard): usa `src/shared/api/dashboard.ts` criado aqui e acrescenta `src/shared/validation/dashboard.ts`; a decisão da data da taxa de cancelamento sai aqui, com L2 (opção 1), em vez de na #51. Quando a rota existe, a #51 tira a entrada de `GET /api/admin/dashboard` de `src/lib/demo/routes.ts`.
- **#66** (código da análise): o plano dela diz que cria `shared/constants/dashboard-indicators.ts` e altera os tipos da #51; passa a só alterar os dois, criados aqui. Quando a rota da análise existe, ela tira a entrada de `routes.ts`; se for a última entrada de demonstração do dashboard, o `src/lib/demo/dashboard.ts` sai junto, com o aviso da tela.
- **#61 a #65** (outras telas do painel): uma linha por rota em `src/lib/demo/routes.ts` (conflito simples).
- **#67** (documentos formais): recebe a lista do relatório desta tarefa (decisão 0056, RN021 e RN035).

## Testes previstos

TDD só na função de formatação, com os valores esperados escritos à mão a partir de RN035 e de RNF016 (decisões 0035 e 0052):

`tests/format/date.test.ts`:

- formats a calendar day as day and month: "2026-10-05" → "05/10"
- keeps the calendar day whatever the time zone: "2026-10-01" → "01/10" (como instante, 2026-10-01 ainda seria 30/09 em Maceió, `date.ts`)
- formats the last day of the year and a leap day: "2026-12-31" → "31/12", "2028-02-29" → "29/02"

Os componentes, os atalhos do período e os dados de demonstração são conferidos à mão (decisão 0052), com os valores esperados da tabela acima.

## Documentação

- `docs/agendamento/dashboard-do-painel.md`, novo, "Conteúdo da tela do dashboard" (`titulo`, `assunto: agendamento`, `origem: issue #60`, `relacionados: [UC09, UC27, RF040 a RF043, RF089, RF090, RN021, RN035, RN038, RN039]`): o período (L3), os indicadores e a agenda (L2), os gráficos (L5), o cartão da análise e os textos (L6).
- `docs/agendamento/CONTEXT.md`: a linha do módulo novo. `docs/agendamento/rotas.md` e `calculos.md`: L1 e L2. `docs/plataforma/RN035-formatos-dos-dados.md`: L4. `docs/padroes/design.md`: L5.
- `docs/padroes/testes.md`, tabela de casos, linha "Formatação": acrescentar "dia e mês de um dia de calendário".
- `AGENTS.md`: o Recharts na linha da stack (`visao-geral.md` e `frontend.md` já o citam).
- Documentos formais a atualizar no relatório, pela #67: Arquitetura de Software, seção 9 (Quadro 38: a decisão 0056) e, se L1 entrar, o Apêndice A (campos de `GET /api/admin/dashboard`); Análise do Sistema, seção 9.1 (Quadro 20: RN021 e RN035, se L2 e L4 entrarem).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Campos da resposta de `GET /api/admin/dashboard`

**Problema.** Os tipos de `src/shared/api/dashboard.ts` precisam dos nomes dos campos, mas `rotas.md` descreve a resposta por alto: "receita, quantidade de agendamentos, ticket médio, taxa de cancelamento, receita por dia, agendamentos por status e agenda do dia". Não diz o período aplicado (o padrão, o mês atual, é do servidor, e a tela precisa mostrá-lo), o formato da receita por dia (todos os dias ou só os com receita), os status (todos ou só os com agendamentos) nem o que a agenda traz de cada agendamento.

**Opções:**

- [x] **1. Os campos em `rotas.md`, com o período aplicado, um item por dia, os sete status e a agenda como a lista de agendamentos do painel (recomendada).** Os tipos seguem o texto abaixo, e a #51 constrói a rota por ele. O dia sem receita vai com 0, então o gráfico é contínuo sem a tela preencher datas; os sete status vão sempre, na ordem de RN017, e as linhas do gráfico ficam estáveis; a agenda repete o que `GET /api/admin/appointments` lista (cliente, veículo, serviços, total, status e previsão).
- [ ] **2. Só os dias com receita e só os status com agendamentos.** Resposta menor, mas a tela teria de preencher os dias e os status que faltam, o que é cálculo na tela.

**Texto proposto (opção 1):** `docs/agendamento/rotas.md`:

- `GET /api/admin/dashboard`, "Entrada: `from, to` (datas; padrão: mês atual)" passa a "Entrada: `from, to` (datas `aaaa-mm-dd`; padrão: o mês atual inteiro, no fuso da empresa)".
- "Resposta: **200** receita, quantidade de agendamentos, ticket médio, taxa de cancelamento, receita por dia, agendamentos por status e agenda do dia; 400 período inválido ou maior que 12 meses." passa a "Resposta: **200** `from` e `to` (o período aplicado), `revenue`, `appointmentCount`, `averageTicket`, `cancellationRate` (percentual, de 0 a 100, com duas casas), `revenueByDay` (`date` e `revenue` de cada dia do período, com 0 nos dias sem receita), `appointmentsByStatus` (`status` e `count` dos sete status, na ordem de RN017) e `agenda` (os agendamentos do dia corrente, por horário: `id`, `status`, `scheduledAt`, `estimatedEndAt`, `clientName`, `vehicle` com `plate`, `brand` e `model`, `services` com `id` e `name`, e `total`, com os dados copiados no agendamento, RN037); 400 período inválido ou maior que 12 meses."

### L2. O que os indicadores e a agenda contam

**Problema.** RN021 define a receita (agendamentos "Concluído" e "Reagendado") e o ticket médio, e diz que a taxa de cancelamento é a dos cancelados "em relação ao total de agendamentos do período", mas não diz o que a "quantidade de agendamentos" (RF040) conta, nem por qual data um agendamento é do período. `calculos.md`, seção 5, define a data da receita (`completed_at`) e deixa a da taxa em aberto ("`scheduled_at` ou `created_at` ... perguntar no plano"), que o plano da #66 pede à #51 decidir. A tela e a demonstração precisam de uma resposta agora: o cartão "Agendamentos", a taxa e a agenda do dia (RF043, "previstos para a data corrente").

**Opções:**

- [x] **1. Decidir já, nos documentos (recomendada).** "Agendamentos" é o total do período, de qualquer status, o mesmo total da taxa; o agendamento é do período pela data marcada (`scheduled_at`), na quantidade e na taxa; a receita e o ticket médio ficam com a data de conclusão; sem agendamentos pagos, o ticket médio é zero (UC09 FE01 diz "indicadores zerados"); a agenda do dia traz todos os status marcados para o dia corrente no fuso da empresa, o cancelado com a etiqueta. Fecha a lacuna que a #51 teria de decidir.
- [ ] **2. Só a demonstração assume isso, e os documentos continuam em aberto para a #51.** Nada muda em `RN021` nem em `calculos.md`, mas o cartão "Agendamentos" fica sem definição escrita, e a #51 pode decidir outra coisa e desfazer a tela.

**Texto proposto (opção 1):**

- `docs/agendamento/RN021-indicadores-do-dashboard.md`: acrescentar "A quantidade de agendamentos é o total de agendamentos do período, de qualquer status, e a taxa de cancelamento é calculada sobre ele; o agendamento pertence ao período pela data marcada, e a receita, pela data de conclusão. Sem agendamentos pagos, o ticket médio é zero."
- `docs/agendamento/calculos.md`, seção 5: "A data que define o período para essa taxa (`scheduled_at` ou `created_at`) não está definida: perguntar no plano." passa a "Quantidade de agendamentos e taxa de cancelamento: o período é o da data marcada (`scheduled_at`), e a quantidade conta todos os status. Sem agendamentos pagos, o ticket médio é zero. A agenda do dia (RF043) traz os agendamentos de qualquer status marcados para o dia corrente no fuso da empresa."

### L3. Seletor de período

**Problema.** RN035 e UC09 FE02 definem o período (data inicial igual ou anterior à final, até 12 meses, padrão o mês atual), mas nenhum módulo diz como a pessoa o escolhe. O wireframe tem só "Hoje", "7 dias" e "30 dias" e começa em "Hoje", o que não permite um período livre, nem o erro de UC09 FE02, e contraria o padrão de RN035.

**Opções:**

- [x] **1. Atalhos e dois campos de data (recomendada).** "Este mês" (padrão), "Hoje", "7 dias" e "30 dias" preenchem os campos "De" e "Até", que também se editam à mão; cobre o período livre de UC09 FE02 e o atalho do caso comum. Custa um pouco mais de tela e de estado do que as outras opções.
- [ ] **2. Só os atalhos do wireframe.** Igual ao desenho, mas não há período livre nem FE02, e o padrão do wireframe ("Hoje") contraria RN035.
- [ ] **3. Só os dois campos de data.** Cobre o UC09, mas o caso comum (o mês, os últimos dias) exige digitar as duas datas.

**Texto proposto (opção 1):** `docs/agendamento/dashboard-do-painel.md`, seção "Período": "O período é escolhido por atalhos e por dois campos de data (UC09, RN035). Atalhos: 'Este mês' (do primeiro ao último dia do mês atual, o padrão), 'Hoje', '7 dias' e '30 dias' (os últimos dias, contando o de hoje); cada um preenche 'De' e 'Até'. A mudança de um campo vale 300 ms depois da última alteração. Durante a leitura, nada fica desativado. Período recusado (UC09 FE02): a mensagem aparece junto ao campo, e a área de resultados diz 'Informe um período válido para ver o dashboard.' A linha 'Período exibido: 01/10/2026 a 31/10/2026.' acompanha a resposta."

### L4. O que são "12 meses"

**Problema.** RN035 diz "intervalo de até 12 meses", sem dizer se de 01/10/2025 a 01/10/2026 conta como 12 meses, nem como contar no dia 29 de fevereiro. A tela mostra o erro, a demonstração o recusa e o esquema da #51 o conferirá com a mesma regra.

**Opções:**

- [x] **1. Até 366 dias, contando as duas datas (recomendada).** Sem aritmética de meses e sem caso especial de fevereiro; o ano inteiro, bissexto ou não, sempre cabe. De 01/10/2025 a 01/10/2026 (366 dias) é aceito; a 02/10/2026, recusado.
- [ ] **2. Do dia inicial ao mesmo dia, 12 meses depois, menos um dia.** Fiel ao texto, mas 29/02 e o dia 31 pedem uma regra para o mês que não os tem.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "Período do dashboard": "Data inicial igual ou anterior à final, com intervalo de até 12 meses. Sem informação, vale o mês atual." passa a "Data inicial igual ou anterior à final, com intervalo de até 12 meses, ou seja, até 366 dias contando as duas datas. Sem informação, vale o mês atual."
- Mensagens da tela e da demonstração: "A data final não pode ser anterior à inicial." e "O período não pode passar de 12 meses."

### L5. Gráficos: forma, cores e acesso sem a cor

**Problema.** UC09 diz "a receita por dia e a distribuição dos agendamentos por status", sem a forma dos gráficos, e `design.md` não tem regra para gráficos. O wireframe põe uma rosca para o status, mas são sete status, e a rosca os distingue por cor, o que contraria "nenhuma informação só por cor" (`frontend.md`); o `--primary` (cerca de 1,8:1 sobre o fundo) não serve de marca (WCAG 1.4.11, 3:1). Uma marca só pode usar uma cor do tema com o contraste já calculado em `design.md`: `--link` (4,8 / 6,5), `--foreground` (12,5 / 11,8), `--muted-foreground` (4,9 / 4,9) e `--destructive` (5,9 / 6,8), todos acima de 3:1 sobre `--background`.

**Opções:**

- [x] **1. Barras para a receita e barras horizontais para os status, com tabela para o leitor de tela (recomendada).** Cada status tem o nome e a quantidade escritos; as cores seguem os tons da etiqueta de status; nenhuma cor nova. Cada gráfico tem uma tabela com os mesmos dados, visualmente oculta, e o SVG fica em `aria-hidden`, sem elemento focável.
- [ ] **2. Barras para a receita e rosca para os status, como no wireframe, com legenda.** Fiel ao desenho, mas sete fatias pedem sete cores com contraste entre si e com o fundo, e o tema só tem quatro com 3:1; exigiria cores novas na tabela de `design.md`.

**Texto proposto (opção 1):** `docs/padroes/design.md`, nova seção "Gráficos", depois de "Movimento":

- "Gráficos (Recharts, carregados sob demanda) usam só as cores da tabela de cores, nas marcas e nos eixos: `--link` na receita; no status, `--link` nas fases em aberto, `--foreground` no Concluído, `--destructive` no Cancelado e `--muted-foreground` no Reagendado, os tons de `StatusBadge`; o texto dos eixos, `--muted-foreground`. Toda marca tem 3:1 sobre `--background` (WCAG 1.4.11)."
- "A informação nunca está só na cor: o nome e a quantidade ficam escritos, e cada gráfico tem uma tabela com os mesmos dados para o leitor de tela, visualmente oculta; o desenho é `aria-hidden` e não tem elemento focável. A dica ao passar o mouse só repete a tabela."
- `docs/agendamento/dashboard-do-painel.md`, seção "Gráficos": a forma de cada um e os textos de vazio de L6.

### L6. Conteúdo e textos da tela

**Problema.** UC09 e UC27 dizem o que a tela mostra, mas nenhum módulo define os títulos, as linhas de apoio dos indicadores, os vazios, a agenda e o cartão da análise. Os textos do cartão estão no plano da #66 (aprovado), que não os levou para `docs/`. O wireframe tem saudação, "Avaliação média" e "Alertas", sem requisito (o Glow não tem avaliação, e nenhum RF fala de alertas).

**Opções:**

- [x] **1. Os textos abaixo, no módulo novo `dashboard-do-painel.md` (recomendada).** Os do cartão são os do plano da #66, com os três ajustes de "Análise do período"; os demais, propostos aqui.
- [ ] **2. Só o que UC09, UC27 e o plano da #66 dizem; os textos novos ficam só no código.** Menos documento, mas a próxima sessão não os acha, e a #51 e a #66 não os conferem.

**Texto proposto (opção 1):** `docs/agendamento/dashboard-do-painel.md`, com a frase de abertura "A tela usa os dados de demonstração de `src/lib/demo/dashboard.ts` até as rotas existirem (decisão 0055) e mostra o aviso de `DemoNotice` abaixo do título" e:

- Página: título "Dashboard"; seções "Período", indicadores, "Análise do período", "Receita por dia", "Agendamentos por status" e "Agenda do dia".
- Indicadores, com a linha de apoio: "Receita" ("Agendamentos Concluído e Reagendado"); "Agendamentos" ("Todos os status do período"); "Ticket médio" ("Receita por agendamento pago"); "Taxa de cancelamento" ("Cancelados sobre o total do período"). Período sem agendamentos (UC09 FE01): os valores zerados e "Não há dados a apresentar neste período."
- Gráficos: "Nenhuma receita no período." e "Nenhum agendamento no período."; a tabela oculta tem as colunas "Dia" e "Receita", e "Status" e "Agendamentos".
- Agenda do dia: título "Agenda do dia", com a data por extenso; cada item, "<início> às <previsão>", "<cliente>", "<marca> <modelo> · <placa>", "<serviços>", "<total>" e a etiqueta; vazio, "Nenhum agendamento para hoje." e "Os agendamentos marcados para hoje aparecem aqui."
- Falha da leitura (UC09 FE03): o aviso com a mensagem da API e "Tentar novamente".
- Análise do período (UC27): título "Análise do período", com o ícone `Sparkles`, e "Um resumo em texto dos indicadores deste período, escrito por inteligência artificial a partir dos números do sistema."; botão "Gerar análise" ("Gerando análise…"); resultado com o resumo, as observações com o rótulo do indicador em negrito, "Gerado por inteligência artificial em 23/10/2026 às 14:32. Pode conter imprecisões: os números oficiais são os dos indicadores." e "Gerar novamente"; sem comparação, "O período anterior não tem agendamentos: a análise não compara os períodos."; sem dados, "Não há dados suficientes no período para gerar a análise."; falha, o aviso com a mensagem da API e "Tentar novamente"; a região de status recebe "Análise gerada.".
- Fora da tela, sem requisito: a saudação, "Avaliação média", "Alertas" e a variação em relação ao período anterior nos cartões (a rota não devolve o período anterior).

## Decisões técnicas

- Seguidas:
  - 0017: código em inglês, textos em português;
  - 0035 e 0052: TDD na função de formatação; a tela, os atalhos e os dados de demonstração, à mão;
  - 0038: a dependência nova é conferida no contêiner;
  - 0041: esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md`;
  - 0049: componentes do shadcn/ui sobre Base UI;
  - 0053: datas e horários no fuso da empresa, o dia de calendário como está;
  - 0054: o cartão segue RS020 (o texto da IA aparece como texto, nunca como HTML) e RNF017 (a falha não derruba a tela);
  - 0055: a tela com os dados de demonstração e o aviso, sem rota nem esquema.

### D1. Recharts nos gráficos, carregado sob demanda

**Problema.** A tela precisa de dois gráficos, e a dependência nova afeta o peso de `/admin` (RNF006). O Recharts já está na stack de `visao-geral.md` ("Gráficos | Recharts | 3.10") e na regra de Desempenho de `frontend.md`, mas sem registro de decisão.

**Opções:**

- [x] **1. Recharts 3.10.1, direto, carregado por `next/dynamic` (recomendada).** Componentes React que desenham SVG, que as variáveis do tema pintam nos dois temas; licença MIT, par com o React 19 (conferido no npm em 23/10/2026: `peerDependencies` de `react`, `react-dom` e `react-is`). Consequências: muitas dependências indiretas (`react-redux`, `immer`, `victory-vendor`), cerca de 7,4 MB desempacotados em `node_modules` e um chunk só de `/admin`, cujo peso e momento de carga a tarefa mede; o gráfico não vem no HTML (`ssr: false`); o acesso sem cor e sem mouse fica por conta da tabela própria (L5).
- [ ] **2. Gráficos em SVG escrito à mão, sem dependência.** Sem peso nem dependência nova, mas cerca de 150 linhas de eixos, escalas e dicas a manter, e contraria a stack já documentada.
- [ ] **3. O componente `chart` do shadcn/ui, sobre o Recharts.** Mesma dependência, com uma camada de configuração de cores a mais e a CLI do shadcn, que trava na pergunta de sobrescrita e sobrescreve ajustes.

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| 0056: os gráficos do dashboard usam o Recharts 3.10, em versão exata, num componente de cliente carregado por `next/dynamic` com `ssr: false`, sem o componente `chart` do shadcn/ui; as cores são as variáveis do tema, e cada gráfico tem uma tabela equivalente para o leitor de tela | Gráficos em SVG à mão; componente `chart` do shadcn/ui; Chart.js (canvas, sem SVG para o tema e para a tabela), ECharts, Nivo e Victory (mais pesados ou com mais API) | Já está na stack documentada e na regra de Desempenho; o SVG segue o tema e é conferível; só `/admin` paga o peso, depois da página (RNF006). Aceito: dependências indiretas e o peso de um chunk, medidos no PR; o gráfico não aparece sem JavaScript | nova |

Escolhas locais, sem registro:

- A geração da análise por `apiRequest` no clique, e não por `useApiQuery` (ação com custo; o efeito roda duas vezes no Strict Mode).
- O período em estado do componente, não no endereço, como as listagens (`componentes.md`); a primeira leitura sem `from` nem `to`, para o padrão ser o do servidor.
- Os atalhos de período e os dados de demonstração conferidos à mão, em `dashboard-period.ts` e `src/lib/demo/`, no módulo que os usa (`src/lib/README.md`).
- Quatro colunas de indicadores só a partir de 1280 px, pela largura que a barra do painel deixa.

## Pontos à parte

Decisões do Yvan que não são lacunas da documentação. Marque `x`.

### P1. Divisão em PRs

Estimativa em `src/`, sem testes nem README: PR 1 cerca de 350 linhas (60 de tipos, 25 de constantes, 15 de formatação, 230 de dados de demonstração e as entradas); PR 2 cerca de 510 (25 de página, 110 de visão, 60 de período, 140 de seletor, 90 de indicadores, 90 de agenda); PR 3 cerca de 250; PR 4 cerca de 170. O PR 2 passa das ~400 de `pull-request.md`, como o PR 2 da #57 (492).

- [x] **1. Quatro PRs (recomendada).** A dependência nova fica no PR 3, o único que a usa, e a análise fecha a issue.
- [ ] **2. Cinco PRs:** a agenda do dia sai do PR 2 e vira um PR próprio (PR 2 com cerca de 420).
- [ ] **3. Três PRs:** os gráficos e a análise juntos (cerca de 420), sem a agenda à parte.

### P2. Ambiente de verificação

O roteiro usa o Docker Desktop (que precisa estar aberto), `npx supabase start`, o admin local criado por `supabase/scripts/create-admin.mjs`, o cookie da sessão de teste no Lighthouse e alterações temporárias, sem commit, em `src/lib/demo/dashboard.ts` (falha da leitura, falha da análise, agenda vazia), desfeitas com `git checkout` antes do commit. É o mesmo acordo das #56 a #59 e da #78.

- [x] **1. Aprovado, como nas tarefas anteriores (recomendada).**
- [ ] **2. Ajustar:** <o que muda>

### P3. Conferência do Recharts no contêiner

A tarefa muda as dependências, então o contêiner confere o `npm ci` do `Dockerfile` com o `package-lock.json` novo, o build e a aplicação (`testes.md`, "Contêiner"). O contêiner lê o `.env.local`, que o agente não lê nem cria; e `/admin` pede o login de um funcionário, cuja senha o agente nunca digita. Sem sessão, o agente confere o que dá: `docker compose up --build -d` sem erro, `/` com 200, `/admin` sem sessão com 307 para `/login`, o chunk do Recharts presente na imagem (`docker run --rm --entrypoint sh glow-app -c "…"`, sem o `.env.local`) e servido com 200.

- [x] **1. Conferência sem sessão pelo agente e o gráfico logado por você (recomendada).** Você abre `http://localhost:3000/admin` com o contêiner no ar, entra e confirma a tela, e eu registro o resultado em `notas.md`. Pede o `.env.local` já criado por você.
- [ ] **2. Você aponta o `.env.local` ao banco local** (o endereço do Supabase local, alcançável do contêiner) enquanto a conferência durar, e eu percorro a tela inteira com o admin local, como no `next start`. Mais completo, mas troca temporariamente o seu `.env.local`.
- [ ] **3. Sem a parte logada no contêiner:** fica só a conferência sem sessão, e a tela é conferida no `next start`.

## Riscos e dúvidas

- **Recharts e o React 19.** O par `react-is` pede a versão 19, e o `node_modules` tem a 16.13.1 por `prop-types` (do ESLint). A instalação confere `npm ls react-is` e o build do Turbopack; se o npm não resolver, entra `react-is` 19 como dependência. Tudo medido no PR 3.
- **Peso dos gráficos.** O Recharts pesa 7,4 MB desempacotado; o chunk e a carga dele só se conhecem na construção. Se o código dos gráficos passar a bloquear o LCP ou o CLS passar de 0,1 no celular, a correção é o lugar reservado ou carregar menos (por exemplo, só as marcas usadas); se não bastar, volta a você como dúvida.
- **LCP no celular.** Nas telas anteriores o LCP simulado do celular ficou em 3,1 s, com o aviso de demonstração como elemento (nota da #58), acima dos 2,5 s de `frontend.md`, que se medem na pré-visualização. `/admin` pode repetir; a medida e a causa vão ao PR.
- **Acesso do gráfico.** O SVG em `aria-hidden` com a tabela oculta é a escolha de L5; o Lighthouse e a leitura da árvore de acessibilidade confirmam na construção que não há `aria-hidden-focus` nem informação só no desenho.
- **Datas da demonstração.** Relativas a hoje: os indicadores mudam de um dia para o outro, e nos primeiros dias do mês o padrão mostra pouco. Em dezembro (a AV3), o mês corrente tem só os dias até hoje; o atalho "30 dias" mostra mais. A agenda de hoje sempre tem os seis itens, mesmo num domingo, e o aviso de demonstração cobre isso.
- **Tipos provisórios.** Com a opção 1 de L1, os nomes ficam em `rotas.md` e a #51 e a #66 os seguem; se uma delas mudar um nome, o tipo e os dados de demonstração acompanham.
- **Lacunas de regra.** L2 e L4 mexem em `RN021` e `RN035`, que vêm da Análise do Sistema: a #67 leva a mudança aos `.docx`.
- **Pontos para a sua aprovação**, além das lacunas e de D1: P1 a P3; a dependência nova (`recharts` 3.10.1, versão exata) e o registro da decisão 0056 na etapa 03 do PR 3; a conta de admin no banco local; e as alterações temporárias da demonstração, sem commit.

## Fora do escopo

- `GET /api/admin/dashboard` (#51), a análise real e o provedor de IA (#66), e as rotas, migrations e esquemas de validação de qualquer parte.
- Partes do wireframe sem requisito: a saudação, o cartão "Avaliação média", o painel "Alertas", a variação "vs período anterior", a rosca de status e o seletor com só três atalhos.
- Período no endereço, atualização automática dos dados, exportação do dashboard ou da análise, e qualquer gravação.
- A validação do período por esquema compartilhado, que entra com a rota da #51.
- Mudança em `seed.sql`, `seed-demo.sql`, `Dockerfile`, `compose.yaml` ou `next.config.ts`.
- Testes automatizados de componentes (decisão 0052).
- Os documentos formais (#67).
