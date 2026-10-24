# Notas: 61-agendamentos-do-painel

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-24 – descoberta: dependências conferidas

A #61 é a T5 de `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, que depende só da T0 (#56). A #56 (PR #69) está incorporada desde 21/10/2026. `origin/main` em cf093c6 (#83), sem PR aberto; a ramificação da sessão (`claude/heuristic-solomon-ad77fa`, worktree `56-base-da-demonstracao-e6d9a4`, nome herdado e não renomeável) está no mesmo commit, com a árvore limpa. Plano e notas sem commit, como nas etapas 01 anteriores. As #46 e #50 (rotas) e a #62 estão abertas; `src/app/api/admin/appointments/` só tem READMEs, e `/admin/appointments` ainda não tem `page.tsx`.

## 2026-10-24 – descoberta: notas de passagem da #60

Lidas as notas de `side-session-notes/local_dcd0b9ea-…` (dados de outra sessão): `DemoNotice` logo abaixo do `h1`, a regra de que a leitura que acompanha o formulário não desativa os campos nem o foco, o `Button` com `focusableWhenDisabled` (`aria-disabled="false"` quando habilitado, `matches(":disabled")` para saber se está desativado), os dados relativos a hoje sem `Math.random`, e as armadilhas da verificação (`/favicon.ico` e a pré-busca dos links do painel dão 404 no console; `/api/auth/me` dá 401 no visitante). Os roteiros de `60-scripts-de-verificacao/` não foram copiados nesta etapa; a etapa 02 os copia para o scratchpad e os adapta (`start.sh` e `local-env.sh` têm os caminhos de outro worktree; `admin.json` precisa ser gerado de novo).

## 2026-10-24 – descoberta: o wireframe e os documentos divergem

O wireframe de `staffPages/appointmentManagment/` põe botões de ação no cartão ("Iniciar serviço", "Serviço concluído", "Revisar e concluir", "Editar", "Cancelar"), "Ver mais" e "Ver serviços", o "Box", os avisos "Tempo de execução excedido" e "Atrasado para iniciar o serviço", a marca "Multi-dia" e o texto "Exibindo: Hoje + Agendamentos anteriores não finalizados". Nada disso tem requisito no Glow; o plano deixa de fora o que não tem e leva a visão "Hoje" com os dias anteriores em aberto e a posição das ações a L1 e L3.

## 2026-10-24 – descoberta: lacunas de regra que a tela exige

- RF044 e UC10 nomeiam as três visões sem dizer o que cada uma traz; sem regra, o agendamento em aberto de um dia anterior não aparece em nenhuma (L1).
- `rotas.md` não dá os campos da listagem e do detalhe, os valores de `sort`, os campos da busca nem o formato do total de cada forma de pagamento no "Finalizado" (L2).
- UC12 e UC10 não dizem onde ficam as ações nem como se chamam (L3); UC12 FA01 e RF053 não têm tela nem texto da conclusão (L4); os textos da página não têm módulo (L5).

## 2026-10-24 – descoberta: o reagendamento do painel pede as etapas do assistente do cliente

`POST /api/admin/appointments/:id/reschedule` exige `paymentMethod` e `scheduledAt`, e UC25 FA01 manda seguir do passo 3 com o funcionário no lugar do cliente: são as etapas "Data e horário" e "Pagamento e resumo" do `BookingWizard`, que está em `src/components/portal/appointments/` e usa as rotas `/api/me`. A #59 deixou escrito que as etapas vão para `src/components/shared/` "no segundo uso". As três etapas (`booking-schedule-step.tsx`, `booking-payment-step.tsx`, `booking-summary.tsx`) não dependem da API, mas importam de `booking-wizard.tsx` o tipo dos valores do formulário. A escolha entre mover as etapas, extrair o reagendamento do assistente ou passar o reagendamento para a #62 é o P2.

## 2026-10-24 – descoberta: dados do seed para a demonstração

- 12 clientes e 14 veículos no `seed-demo.sql` (Henrique Costa tem dois, e o SW4 `GLW5L15` também está na conta de Isabela Melo, RN036). As taxas do `seed.sql` são todas zero, então o total de cada forma de pagamento é igual ao subtotal (P3).
- Os seis de hoje da agenda do dashboard (`src/lib/demo/dashboard.ts`) têm ids, clientes, veículos, serviços e totais já definidos; o plano os repete em `admin-appointments.ts`, com os quatro em aberto em "Hoje" e os dois finais ("Concluído" e "Cancelado") no "Histórico".
- Preços conferidos nos totais do dashboard: Lavagem simples por porte 40, 50, 60 e 70 (Polo pequeno, Diego Ferreira com picape extra grande: 70 + 35 de cera = 105); Lavagem completa 85 no porte médio (Corolla); Polimento comercial 280 no pequeno (HB20); Lavagem técnica 220 no grande (Compass).
- `Select` do shadcn existe em `src/components/ui/` e `PaginatedList` em `src/components/shared/`, mas nenhum tem uso em tela: esta é a primeira.

## 2026-10-24 – decisão: plano gravado em aguardando_aprovacao

`01_plano.md` com as lacunas L1 a L5 (recomendada a opção 1 em todas) e os pontos P1 a P4 (P1: quatro PRs; P2: mover as três etapas para `shared/` e fazer um formulário de reagendamento só do painel; P3: taxas como o `seed.sql`; P4: ambiente de verificação como nas tarefas anteriores). Nada foi construído, e nenhuma dependência nova é proposta. A etapa 02 só começa quando o Yvan gravar `aprovado` no arquivo e eu conferir o status e as caixas.

## 2026-10-24 – decisão: plano aprovado

O Yvan gravou `status: aprovado` em 24/10/2026 (10:48), com a opção 1 em L1 a L5 e em P1 a P4 (caixas `[x]`). Conferido no arquivo antes da etapa 02; o `status` passou a `em_execucao`, sem tocar em `aprovado_por` nem em `aprovado_em`. Quatro PRs, reagendamento com as três etapas movidas para `shared/` e um formulário só do painel, taxas como o `seed.sql`.

## 2026-10-24 – desvio: PR 1, tamanho e nomes

Etapa 02, PR 1 (`feat/61-appointments-demo`, criada da `origin/main` em cf093c6 com `git switch --no-track -c`, e `npx -y npm@11.21.1 ci`). Diferenças em relação ao plano, sem mudar regra nem escopo:

- **Tamanho.** Cerca de 530 linhas em `src/` (409 do módulo de dados, 70 de tipos e constantes, 30 de entradas de `routes.ts`, 20 de ajustes em `appointments.ts` e `vehicles.ts`), acima das ~430 estimadas: a tabela de 50 agendamentos tem uma linha por item (cerca de 60) e o Prettier não deixa o resto menor. Passa das ~400 de `pull-request.md`, como o PR 1 da #58 (484); a descrição do PR diz isso.
- **Tipos da visão e da ordem.** `AppointmentView` e `AppointmentSort` ficam em `src/shared/constants/appointment-views.ts`, como `AppointmentStatus` está em `appointment-statuses.ts`, e não em `src/shared/api/appointments.ts`; os rótulos estão no mesmo arquivo.
- **Histórico.** Os 36 itens vão de 3 a 41 dias antes da segunda-feira da semana (cerca de seis semanas), e não 60 dias; 26 "Concluído", 7 "Cancelado" e 3 "Reagendado", como no plano.
- **Exportações de `appointments.ts`.** Saem `CATALOG`, `PreviewBody`, `notFound` e a função nova `previewOrder` (o cálculo que `answerAppointmentPreview` fazia, agora também usado pelo painel); `vehicles.ts` exporta `SEED_VEHICLES`. O comportamento da demonstração do cliente não mudou.
- **Dados.** Os ids dos agendamentos fora da agenda do dashboard são números no formato de UUID (`00000000-0000-4000-8000-0000000000NN`), porque os do seed são sorteados; os dos veículos são os do seed (md5). Os de hoje têm o fim calculado na segunda-feira da semana e movido para hoje, então a previsão fica no mesmo dia mesmo num domingo ou num sábado à tarde, como a agenda do dashboard.

## 2026-10-24 – descoberta: PR 1, o que a verificação cobriu

A página ainda não existe, então as respostas foram conferidas por um teste temporário do Vitest (45 casos, guardado no scratchpad e não commitado), com a data do sistema fixada em seis dias (sexta 23/10/2026, domingo 25/10, segunda 26/10, sábado 24/10 à noite, 29/02/2028 e 01/01/2027):

- as visões têm 6, 8 e 36 itens; por status, Hoje tem Agendado 2, Em espera 2, Em execução 1 e Finalizado 1, Futuros 8 "Agendado", Histórico 26, 7 e 3; a página 1 do Histórico tem 20 e a 2, 16; cada agendamento aparece numa visão só (50 ids distintos), com o dia de hoje ou anterior em Hoje, posterior em Futuros e só status finais no Histórico;
- nenhum agendamento cai num domingo (fora os de hoje) nem num sábado depois das 12:00; a previsão é posterior ao início e, nos de hoje, do mesmo dia;
- horário: do mais próximo ao mais distante em Hoje e Futuros e do mais recente ao mais antigo no Histórico; status: Agendado, Agendado, Em espera, Em espera, Em execução, Finalizado;
- busca por "souza", placa, modelo (sem distinção de maiúsculas), marca e sem resultado; `view` ausente ou inválida dá 400 `VALIDATION_ERROR` com a mensagem do campo; `id` desconhecido dá 404;
- os seis de hoje repetem a agenda do dashboard (id, status, cliente, placa, serviços, total, início e previsão); o "Finalizado" (Bruno Lima, Lavagem completa, R$ 85,00, porte M) tem as quatro formas com R$ 85,00 e `feePercent` 0, e os outros status têm `paymentOptions` nulo; o total de cada um é a soma dos serviços;
- a prévia de `POST /api/admin/appointments/preview` dá R$ 85,00, 90 minutos e previsão às 10:30 para a Lavagem completa de um sedan às 09:00; veículo desconhecido dá 404;
- `routes.ts`: as três leituras têm `load`, as quatro gravações não e uma delas, pelo `apiRequest`, responde `NOT_IMPLEMENTED`; `POST /api/admin/appointments` e `PATCH /api/admin/appointments/:id` continuam fora da lista (#62).

`npm run check` (414 testes) e `npx next build` sem erros nem avisos; nenhum import de `src/server/` e nada em `src/app/api/`, `supabase/` nem `src/shared/validation/`.

## 2026-10-24 – desvio: etapa 03 do PR 1

A pedido do Yvan: ramificação `feat/61-appointments-demo` enviada com cinco commits (três de código e documentação, dois da pasta da tarefa) e o PR #84 aberto como rascunho (`Refs #61`), sem pedido de revisão, como no #80. `02_relatorio.md` parcial, com `pull_request: 84`; o plano continua em `em_execucao` até o PR 4. A `origin/main` continuava em cf093c6, sem nada a incorporar. O PR tem 538 linhas em `src/`, cerca de 90 delas de dados fixos. Os PRs 2 a 4 esperam a incorporação do #84.

## 2026-10-24 – decisão: PR 1 incorporado, PR 2 começado

O PR #84 foi incorporado em ead3ea4 (24/10/2026, 14:04 UTC), com a aprovação de yvantoledo1 e o CI passando. Etapa 02 do PR 2 (listagem), na ramificação `feat/61-appointments-list`, criada da `origin/main` com `git switch --no-track -c`; a local `feat/61-appointments-demo` foi apagada depois de conferir que a árvore era igual à da `origin/main`.

## 2026-10-24 – desvio: PR 2, o que mudou em relação ao plano

- **"Ver detalhes" fica para o PR 3.** O cartão do PR 2 não tem o botão, porque o detalhe só existe no PR 3; um botão sem efeito não entra. O PR 3 acrescenta o botão e a janela.
- **Nome do `Select`.** Um `combobox` não tira o nome do texto dele (o Lighthouse reprovou `button-name` no seletor de ordem): os dois seletores levam `aria-label`, o do status com "Filtrar por status: <status mostrado>" e o da ordem com o próprio texto visível ("Ordenar por horário"), para o nome conter o que se vê (WCAG 2.5.3). Corrigido no mesmo commit.
- **Texto de ajuda da busca.** "Cliente, placa, marca ou modelo", no módulo da tela; L5 só fixava o rótulo "Buscar por cliente ou veículo".
- **Lugar reservado.** A primeira leitura usa os três lugares do `PaginatedList` compartilhado (altura de 80 px, em coluna), e não a forma do cartão; o CLS medido é 0.

## 2026-10-24 – descoberta: PR 2, o que a verificação cobriu

Banco local (`npx supabase start`, `db reset` só com o `seed.sql`), admin de teste criado por `supabase/scripts/create-admin.mjs` (credenciais no scratchpad, nunca exibidas), `npx next build` e `next start -p 3060`, num Chrome sem interface (`puppeteer-core`), com os roteiros da #60 adaptados (`verify-list.mjs`, `verify-list-states.mjs`, `lh-snapshots-list.mjs`):

- **Página** nas quatro combinações (360 × 800 e 1440 × 900, claro e escuro), sem rolagem horizontal: título "Agendamentos – Glow", `h1`, o aviso de demonstração logo abaixo do `h1`, as três abas, a descrição da visão; Hoje com 6 cartões ("1–6 de 6"; Agendado 2, Em espera 2, Finalizado 1, Em execução 1), Futuros com 8, Histórico com 20 ("1–20 de 36") e 16 na página 2 ("21–36 de 36").
- **Critério da issue:** em "Histórico", o filtro "Cancelado" mostra "1–7 de 7", todos "Cancelado"; "Limpar filtros" volta a "1–20 de 36", o botão some e o foco vai à busca. O filtro "Em espera" em "Hoje" mostra os 2, com o nome "Filtrar por status: Em espera"; só a ordem alterada já mostra "Limpar filtros".
- **Opções do filtro:** "Todos os status" e os quatro em aberto em Hoje; "Todos os status", "Concluído", "Cancelado" e "Reagendado" no Histórico.
- **Ordem:** por status, Agendado, Agendado, Em espera, Em espera, Em execução, Finalizado. **Busca:** "souza", a placa, "HILUX" (sem distinção de maiúsculas) e "zzz" (a mensagem de nenhum agendamento encontrado), voltando à primeira página.
- **Atualizar:** a listagem fica `aria-busy` (anteriores em "Carregando"), o foco continua no botão e nada fica desativado (`:disabled` zero).
- **Estados**, por alteração temporária de `src/lib/demo` (`patch-appointments.mjs`, sem commit, desfeita por `git checkout -- src/lib` e conferida por `git status`): a falha traz "Não foi possível concluir a operação. Tente novamente em instantes." com "Tentar novamente", as abas e a busca continuam, uma leitura só (nada se repete sozinho) e a nova leitura, pelo teclado, traz os 6; as três visões vazias com os textos de L5 e a busca sem resultado; a leitura lenta (2,5 s) mostra os três lugares reservados na primeira vez e os cartões anteriores em "Carregando" depois, com o foco no seletor e na busca.
- **Teclado:** Tab percorre busca, status, ordem e "Atualizar"; Enter abre a lista do seletor com 5 opções, setas e Enter escolhem, Esc fecha, e o foco fica no seletor.
- **Lighthouse 13.5.0** em `/admin/appointments`, com o cookie da sessão de teste (arquivo apagado no fim): acessibilidade 100 no celular e no computador, claro e escuro, e 100 nas 20 capturas de estado (lista do status aberta, lista da ordem aberta, Histórico com "Cancelado", página 2 e busca sem resultado). Desempenho: celular 94 (LCP 3,1 s simulado, CLS 0, TBT de 40 a 50 ms) e computador 100 (LCP 0,7 s). O LCP do celular repete as telas anteriores (o aviso de demonstração); a medida na pré-visualização é do Yvan.
- **Registro do `next start`:** 249 linhas acumuladas, só `requestId`, `userId`, método, caminho, status e código; nenhuma de erro ou aviso, e nenhuma com cookie, token, cabeçalho de autorização, senha nem e-mail de teste. As requisições da tela: `GET /api/auth/me` e `GET /api/public/company`; nenhuma a `/api/admin/*`.
