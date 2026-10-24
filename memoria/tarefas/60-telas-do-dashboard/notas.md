# Notas: 60-telas-do-dashboard

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-23 – descoberta: dependências conferidas

A #56 (PR #69) e a documentação da #66 (PR #68) estão incorporadas na `origin/main` (94372c1, #79), sem PR aberto; RF089, RF090, UC27, RN038, RN039 e a decisão 0054 estão em `docs/`. As issues #51 e #66 (código) seguem abertas e sem código, então esta tarefa cria `src/shared/api/dashboard.ts` e `src/shared/constants/dashboard-indicators.ts`, que os planos delas supunham criados por elas (plano, "Em comum com outras tarefas").

## 2026-10-23 – descoberta: o wireframe e os documentos divergem

O wireframe de `staffPages/dashboard/` começa em "Hoje", tem "Avaliação média", "Alertas" e a variação "vs período anterior", e usa uma rosca para o status. RN035 e `rotas.md` pedem o mês atual como padrão e o período livre (UC09 FE02), o Glow não tem avaliação nem requisito de alerta, a rota não devolve o período anterior e sete status numa rosca dependem só de cor. O plano leva isso a L3, L5 e L6 e deixa o resto em "Fora do escopo".

## 2026-10-23 – descoberta: lacunas de regra que a tela exige

- `rotas.md` não define os campos da resposta de `GET /api/admin/dashboard` (L1).
- RN021 não diz o que a "quantidade de agendamentos" conta, e `calculos.md`, seção 5, deixa a data da taxa de cancelamento em aberto para a #51 (L2).
- RN035 diz "até 12 meses" sem dizer como contar (L4); proposta: 366 dias contando as duas datas.

## 2026-10-23 – descoberta: Recharts no npm

Conferido com `npm view` em 23/10/2026: `recharts` 3.10.1 (última da 3.x), licença MIT, `engines` Node 18 ou mais, `peerDependencies` de `react`, `react-dom` e `react-is` (`^16.8 || … || ^19`), cerca de 7,4 MB desempacotados e dependências como `react-redux`, `immer`, `reselect`, `es-toolkit` e `victory-vendor`. O `node_modules` tem `react-is` 16.13.1, trazido por `prop-types` (ESLint); a instalação do PR 3 confere `npm ls react-is`. `visao-geral.md` já lista "Gráficos | Recharts | 3.10"; `AGENTS.md` não o cita na linha da stack. O `react-is` 19 mais recente no npm é o 19.3.1.

## 2026-10-23 – decisão: a geração da análise não usa `useApiQuery`

O hook dispara no efeito, e o Strict Mode executa o efeito duas vezes em desenvolvimento: com a rota real da #66, uma análise (ação com custo) seria pedida duas vezes. O plano usa `apiRequest` no manipulador do clique, com `AbortController`. É a única chamada da tela fora do `useApiQuery`, e os critérios comuns da issue citam o hook para as leituras.

## 2026-10-23 – decisão: a primeira leitura vai sem período

O padrão é o mês atual do servidor (`rotas.md`): a tela não lê o relógio do aparelho para ele, evita a diferença entre o HTML pré-renderizado e a hidratação, e mostra nos campos o `from` e o `to` da resposta, por isso L1 os inclui.

## 2026-10-23 – dúvida: pontos à parte

P1 (divisão em quatro PRs, ou cinco ou três), P2 (ambiente de verificação) e P3 (conferência em contêiner: o agente não lê nem cria o `.env.local` e não digita a senha de um funcionário). Sem resposta do Yvan, a etapa 02 não começa.

## 2026-10-23 – descoberta: notas de passagem da #78

Lidas as notas de `side-session-notes/local_2af89669-…`: a regra de `componentes.md` (leitura que acompanha o formulário não desativa os campos), o `Button` com `focusableWhenDisabled`, `matches(":disabled")` no lugar de `.disabled` e os roteiros de verificação. Os roteiros não foram copiados nesta etapa; a etapa 02 os copia para o scratchpad e os adapta (`/admin` pede o admin local, não a conta de cliente).

## 2026-10-23 – decisão: plano aprovado

O Yvan gravou `status: aprovado` em 23/10/2026, com a opção 1 em L1 a L6, D1 e P1 a P3 (quatro PRs; ambiente de verificação como nas tarefas anteriores; conferência em contêiner sem sessão pelo agente, e o gráfico logado por ele). Conferido no arquivo antes da etapa 02; o `status` passou a `em_execucao`, sem tocar em `aprovado_por` nem em `aprovado_em`.

## 2026-10-23 – descoberta: PR 1, o que a verificação cobriu

A tela ainda é a provisória, então as duas respostas foram conferidas por testes temporários do Vitest em `tests/`, apagados antes do commit, e uma chamada pelo `apiRequest` às duas entradas de `routes.ts`:

- com a data do sistema fixada em 23/10/2026: o padrão é de 01/10 a 31/10, com 31 dias na receita por dia; a soma da receita por dia é a "Receita", a soma dos sete status é "Agendamentos", e o ticket médio e a taxa saem desses números; a agenda tem os seis itens, com as previsões de conclusão esperadas; duas leituras seguidas dão o mesmo resultado;
- em 29/02/2028 o mês é de 01/02 a 29/02; um período de um dia só (hoje) tem os seis agendamentos e a receita do único "Concluído"; um período sem dados (01/2025) tem tudo zerado, os 31 dias e os sete status com zero;
- 366 dias são aceitos, 367 e o período invertido dão 400 com as mensagens de L4; uma data inexistente (`2026-02-30`) vale como ausente;
- análise: o período anterior é 31/08 a 30/09 para outubro de 2026, 20/10 para 21/10, 30/01 a 29/02/2028 para março de 2028 e 01/12 a 31/12/2025 para janeiro de 2026; um período que começa 90 dias antes de hoje dá `hasComparison: false`; o resumo e as quatro observações respeitam RN039 (tamanhos, indicadores da lista, nenhum algarismo); sem `to`, 400 com "Preencha este campo.".

`npm run check` (414 testes), `npx next build` e `npm audit --omit=dev --audit-level=high` sem erros. Na saída do build, `/admin` aparece estática (`○`), o que confirma a escolha de ler o período padrão no servidor, e não no relógio do aparelho.

## 2026-10-23 – descoberta: `Date.parse` aceita dia inexistente

No V8, `Date.parse("2026-02-30T00:00:00Z")` não é `NaN`: move a data para 02/03. A demonstração confere o dia lendo-o de volta (`fromDayNumber(toDayNumber(valor)) === valor`) antes de aceitá-lo. A rota real da #51 e o esquema compartilhado precisam da mesma conferência.

## 2026-10-23 – descoberta: ids da agenda

Os ids dos seis agendamentos de hoje são o md5 de `glow-demo:dashboard-agenda:<n>` em formato de UUID; a mesma conta reproduz o id de `client-appointment:1` de `src/lib/demo/appointments.ts`, o que confere a derivação.

## 2026-10-23 – PR 1 incorporado; ramificação do PR 2

O PR #80 foi aprovado e incorporado em 23/10/2026 (9e12184). O PR 2 saiu da `origin/main` nessa ponta, na ramificação `feat/60-dashboard-screen`, sem vínculo com a `main`.

## 2026-10-23 – PR 2, o que a verificação cobriu

Ambiente: Docker Desktop aberto; `npx supabase start` e `db reset` (só o `seed.sql`); variáveis pelo `local-env.sh` do scratchpad, que só aceita `http://127.0.0.1:` e não as exibe; admin pelo `create-admin.mjs`, com o e-mail fictício e a senha gerados em `admin.json` do scratchpad, nunca exibidos; `npx next build` e `npx next start -p 3060`. Telas no Chrome sem interface, pelo `puppeteer-core` do cache do Lighthouse; os roteiros da #78 (`browser.mjs`, `patch-states.mjs`, `lh-snapshot.mjs`) serviram de base e foram adaptados.

- **As quatro combinações** (360 × 800 e 1440 × 900, claro e escuro): sem rolagem horizontal; o `h1` seguido do aviso de demonstração; quatro indicadores e seis itens na agenda; nada desativado no seletor; a ordem do Tab passa pelos atalhos. Os valores do mês de teste (23/10/2026): receita R$ 12.535,00, 74 agendamentos, ticket médio R$ 261,15 e taxa de 6,76%.
- **Atalhos e campos:** cada atalho dá o período esperado e fica marcado sozinho; o foco continua no atalho nas quatro leituras (50, 150, 400 e 900 ms); a área de resultados fica com `aria-busy` durante a leitura; a mudança de "De" pela digitação de "15/08/2026" dá uma leitura só (o ano passa por datas intermediárias) e o foco fica no campo. Nas viradas, com `Date` fixada no navegador (`evaluateOnNewDocument`): 23/10/2026, 02/03/2026, 29/02/2028 e 01/01/2027, todos os atalhos como no plano (13 conferências).
- **Estados:** período invertido e de 367 dias, com a mensagem junto ao campo (`aria-invalid` e `aria-describedby`) e o aviso da área de resultados; 366 dias aceitos; período sem dados (01/2025) zerado, com a mensagem e a agenda de hoje; falha da primeira leitura e de uma leitura depois de um atalho, com "Tentar novamente" (lê de novo) e o seletor intacto, com o atalho marcado e o foco nele; agenda vazia; primeira leitura lenta (sete lugares reservados, sem indicadores) e nova leitura lenta (conteúdo anterior com opacidade 0,7 e `pointer-events: none`). Os estados que a demonstração não produz vieram de `src/lib/demo/dashboard.ts` e `match.ts` alterados em `globalThis.__demo`, sem commit, desfeitos por `git checkout -- src/lib` e conferidos por `git status`; o build seguinte foi o limpo.
- **Lighthouse 13.5.0**, `/admin` com o cookie da sessão de teste por `--extra-headers` (arquivo apagado no fim): acessibilidade 100 no celular e no computador, claro e escuro, sem auditoria reprovada; desempenho no celular 95, LCP 3,0 s (simulado), FCP 0,8 s, CLS 0 e TBT de 50 e 60 ms; no computador, 100, LCP 0,6 s. Modo de captura, depois de cada estado (período invertido, sem dados e atalho marcado), nas quatro combinações: 100 nas 12 capturas.
- **Registro do `next start`:** 183 linhas, todas `info`; só `GET /api/auth/me`, `GET /api/public/company` e `POST /api/auth/login`; nenhuma requisição a `/api/admin/*` (a demonstração não usa a rede) e nenhuma linha com cookie, token, cabeçalho de autorização, senha ou e-mail de teste.

## 2026-10-23 – desvio: dois ajustes de layout achados na verificação

- A legenda "Período" ficava sobre a borda do `fieldset`, fora do cartão: o `FieldSet` passou para dentro de um `div` com a superfície.
- A primeira leitura reservava 1566 px contra 2687 px da página carregada, e a linha de status do período, vazia, não ocupava altura: ao responder, o conteúdo descia. Os lugares passaram a `h-36` (indicadores) e `h-44 md:h-28` (agenda), e a linha de status ganhou `min-h-[1.5em]`; no Lighthouse do celular, o CLS ficou em 0.

## 2026-10-23 – desvio: um arquivo fora da lista do plano e o tamanho

O README de `src/components/admin/dashboard/` ganhou uma linha, porque `dashboard-period.ts` (função pura, não componente) não estava coberto pelo "Vai aqui". O PR 2 tem 509 linhas em `src/`, como o plano estimou (cerca de 510) e o P1 aprovou.

## 2026-10-23 – descoberta: LCP do celular

O LCP simulado do celular (3,0 s) está acima dos 2,5 s de `frontend.md`, como nas telas anteriores (3,1 s na #58). O elemento do LCP em `/admin` é o texto do aviso de demonstração (conferido no relatório do Lighthouse), com 91 ms até o primeiro byte e 172 ms de atraso de renderização do elemento. As metas se medem na pré-visualização, pelo Yvan.

## 2026-10-23 – PR 3: dependência, desvio e verificação

- **PR 2 incorporado** (ec5442b); PR 3 em `feat/60-dashboard-charts`, da `origin/main`.
- **`react-is`:** o npm resolveu o par do `recharts` 3.10.1 com o 16.13.1 de `prop-types` (ESLint); entrou `react-is` 19.3.0 em versão exata, como previsto em "Riscos". `npm audit --omit=dev --audit-level=high`: 0 vulnerabilidades. A alta de `body-parser` (via `shadcn`, devDependency) já estava no lock da `main`.
- **`Cell` depreciado no Recharts 3:** a cor de cada barra de status vem do prop `shape`.
- **Desvio:** o `next/dynamic` ficou em `chart-card.tsx` (que já estava na lista), não dentro do `DashboardView`.
- **Verificação local (quatro combinações, 360 e 1440, claro e escuro):** sem rolagem horizontal; duas áreas de gráfico; soma da tabela da receita (12535) = "Receita"; soma da tabela de status (74) = "Agendamentos"; ticket = receita ÷ 48 pagos; taxa 6,76% = 5 ÷ 74; nomes e quantidades escritos; nenhum elemento focável nos `aria-hidden`; 40 Tab nunca entram num gráfico; contraste das marcas no mínimo 4,80:1 (claro) e 4,85:1 (escuro). "7 dias", período sem dados, volta ao mês e 366 dias conferidos. O `--primary` claro tem 1,89:1 (o plano dizia cerca de 1,8).
- **Sob demanda:** o HTML de `/admin` não referencia o chunk `1eym-152geozg.js` (360042 bytes, 102572 com gzip); no Lighthouse do celular (observado): carga 162 ms, LCP 233 ms, pedido do chunk aos 601 ms.
- **Lighthouse 13.5.0:** acessibilidade 100 nas quatro combinações; desempenho no celular 92 (LCP 3,0 s, CLS 0, TBT 180 ms) e 100 no computador.
- **Contêiner, parte do agente (sem `.env.local`, cujo `ls` a regra de `.env*` nega):** `docker compose build` sem erro (imagem de 420 MB); usuário 1000; chunk na imagem; contêiner novo sem variáveis serve `/`, `/services` e o chunk com 200. Sem as variáveis do Supabase o `proxy.ts` registra `page_protection_failed` e deixa `/admin` passar com 200 (observação fora desta tarefa).
- **Fica para o Yvan (P3, opção 1):** com o `.env.local` dele, na ramificação do PR, `docker compose up --build -d`, abrir `http://localhost:3000/admin` logado, conferir os dois gráficos e `docker compose down`.
- **Registro do `next start`:** 415 linhas, sem dado sensível e sem `error` ou `warn`.

## 2026-10-24 – PR 3 incorporado; ramificação do PR 4

O PR #82 foi aprovado e incorporado em 24/10/2026 (b2a95c0). O PR 4 saiu da `origin/main` nessa ponta, na ramificação `feat/60-dashboard-analysis`, sem vínculo com a `main`, e `npx -y npm@11.21.1 ci`. O resultado da tela logada no contêiner (parte do Yvan no P3) não chegou à sessão.

## 2026-10-24 – PR 4, o que a verificação cobriu

Ambiente como no PR 2 (banco local, admin de teste, `next build` e `next start -p 3060`, Chrome sem interface, Lighthouse 13.5.0 com o cookie por `--extra-headers`, arquivo apagado no fim). Os estados que a demonstração não produz (falha da análise, chamada lenta, contagem de chamadas) vieram de `src/lib/demo/dashboard.ts` e `match.ts` alterados em `globalThis.__demo`, sem commit, desfeitos por `git checkout -- src/lib` e conferidos por `git status`; os builds do Lighthouse de desempenho foram os limpos.

- **O fluxo, nas quatro combinações (360 e 1440, claro e escuro):** o cartão fica entre os indicadores e os gráficos; o estado inicial (botão "Gerar análise" habilitado, descrição de L6); ao clicar, "Gerando análise…" com `aria-disabled="true"` e sem `:disabled`, três linhas reservadas e o foco no botão nas leituras de 50, 150 e 300 ms; depois, o resumo e as quatro observações com os rótulos "Receita:", "Agendamentos:", "Ticket médio:" e "Taxa de cancelamento:" em negrito e nenhum algarismo (RN039), a nota "Gerado por inteligência artificial em 24/10/2026 às 00:06…" no fuso da empresa (dentro de 2 minutos do relógio de Maceió), o botão "Gerar novamente" com o foco, a região de status dizendo "Análise gerada." e os quatro indicadores intactos; sem rolagem horizontal.
- **Só a 1440 claro:** "Gerar novamente" esvazia o resultado e o anúncio enquanto espera e anuncia de novo; Enter e Space no botão pedem a análise; trocar para "7 dias" leva o cartão ao começo; um período no começo dos dados (de 90 a 82 dias antes de hoje) mostra "O período anterior não tem agendamentos: a análise não compara os períodos."; o período sem dados deixa o botão com `aria-disabled`, descrito por "Não há dados suficientes no período para gerar a análise.", o clique não chama nada (5 chamadas antes e depois) e o Tab o alcança.
- **Falha (360 claro e 1440 escuro):** um clique, uma chamada; o aviso "O serviço está temporariamente indisponível. Tente novamente em instantes." com "Tentar novamente", os quatro indicadores na tela e o botão de volta a "Gerar análise"; "Tentar novamente" leva o foco ao botão em "Gerando análise…" e a segunda tentativa dá a análise.
- **Chamada lenta** (2 s) cancelada por outro período ("Hoje"): o cartão volta ao começo e nada da análise cancelada aparece depois.
- **Lighthouse 13.5.0:** acessibilidade 100 nas 20 capturas dos estados (inicial, carregando, resultado, falha e sem dados, nas quatro combinações) e nas quatro execuções de `/admin`; desempenho no celular 92 (FCP 0,8 s, LCP 3,0 s, CLS 0, TBT 190 ms) e no computador 99 (LCP 0,9 s).
- **Registro do `next start`:** 607 linhas acumuladas, todas `info` ou sem nível de erro; sem cookie, token, cabeçalho de autorização, senha nem e-mail de teste.

## 2026-10-24 – desvios

- A conferência do roteiro tratava o botão habilitado como `aria-disabled` ausente; o Base UI põe `aria-disabled="false"`. O erro era do roteiro (8 falsos "FAIL"), corrigido para `!== "true"`; a tela estava certa.
- O lugar reservado do cartão passou a `h-47 md:h-37` (188 e 148 px), a altura do cartão em repouso medida a 360 e a 1440 px (189 e 147 px); o CLS do celular ficou em 0.
- Quando "Tentar novamente" é usado, o aviso some e o foco iria ao corpo da página: `generate()` leva o foco ao botão principal (já é onde ele está quando o botão principal foi o usado). Não estava no plano; fica no mesmo arquivo.
- O PR 4 tem 192 linhas em `src/` (184 do cartão e 8 da ligação), abaixo das 400 e perto das 170 estimadas.

## 2026-10-24 – tarefa concluída

Com o PR 4, os quatro PRs da #60 estão entregues (#80, #81, #82 e #83) e o plano passou a `concluido` (sem tocar em `aprovado_por` nem em `aprovado_em`). A decisão 0056 foi gravada no PR 3. Fica a ligação das rotas reais, nas #51 e #66, que tiram as entradas de `src/lib/demo/routes.ts`; e a parte do Yvan no contêiner.
