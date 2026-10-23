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
