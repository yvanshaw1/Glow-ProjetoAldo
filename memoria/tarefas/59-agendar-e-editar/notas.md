# Notas: 59-agendar-e-editar

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-21 – descoberta

Conferências do planejamento, sem alterar o código do projeto:

- **Origem.** Sessão iniciada pela sessão principal para conduzir a #59 (T3 da `proposta-das-issues.md` da #66), depois da #58 (PRs #72, #73 e #74, 58959f8). Lidos o plano, as notas e o relatório da #58 e a nota de passagem da sessão do PR 2 da #58 (técnicas de verificação); a pasta de notas compartilhadas desta sessão estava vazia.
- **Worktree.** `36-regras-do-agendamento-05611e` (nome herdado, não renomeável), na ramificação `claude/59-agendar-e-editar-9ec600`, em 58959f8, igual à `origin/main` depois do `git fetch`. Plano e notas sem commit, como na #58. A etapa 02 cria uma ramificação `feat/59-…` por PR a partir da `origin/main`. A cópia principal `App/` está em 0fbcf60 e precisa de `git pull` (passo do Yvan).
- **GitHub.** Nenhum PR aberto. O corpo da #59 já tem o reagendamento (UC25, RF032, RN020), pela L4 da #58, com o critério "o assistente começa na data e no horário".
- **Rotas.** `rotas.md` descreve por alto `GET /api/me/bookable-services` (sem campos nem paginação, embora `api.md` dê 12 por página aos "serviços para agendar" e `CATALOG_PAGE_SIZE` já diga isso) e `POST /api/me/appointments/preview` (sem campos nem o que vem sem a forma de pagamento). O `PATCH` exige `updatedAt` pela regra geral do topo de `rotas.md` (L1).
- **Ordem das etapas.** UC06 e UC25 escolhem a forma de pagamento antes da data; o wireframe e o corpo da issue põem a data antes e o pagamento junto do resumo (L2).
- **Demonstração.** `DemoRequest` só tem `params` e `query`: a prévia de demonstração não vê o corpo, e o teste da #56 confere uma prévia fixa ("answers a listed POST that does not write with the fixed data"). `useApiQuery` só faz `GET` (L6).
- **Regras no servidor.** `src/server/rules/scheduling.ts` (`server-only`) tem `findAvailabilityError`, `findStartError` e `calculateEstimatedEnd`; a tela não pode importá-los. Os horários da empresa vêm da rota real `GET /api/public/company` (`businessHours`); o `seed.sql` tem segunda a sexta das 08:00 às 18:00 com pausa das 12:00 às 13:00, sábado das 08:00 às 12:00 e domingo fechado. O README de `portal/appointments/` proíbe calcular preço, previsão e transição na tela.
- **StepForm.** Sem etapa inicial nem consulta entre etapas; "Cancelar" só com `onCancel`. O reagendamento cabe passando só as duas etapas finais, sem mudar o componente. Sem esquema, "Próximo" avança sempre (L5).
- **Calendário.** O calendário do shadcn traz `react-day-picker`, dependência nova; a escolha da data fica com botões de opção nativos, como o tipo do veículo da #58 (L4).
- **Dados do seed.** 11 serviços principais e complementares ativos de categorias ativas ("Película nos vidros" é de categoria inativa; "Cristalização de vidros" inativa; "Lavagem a seco" excluída) e 4 adicionais com 11 vínculos; "Cera de carnaúba", "Pretinho nos pneus", "Hidratação de couro" e "Repelente de chuva nos vidros" são vinculados a mais de um principal (L8). Os ids dos serviços já estão em `src/lib/demo/appointments.ts` e `catalog.ts`.
- **Wireframes.** Quatro etapas ("Selecionar veículo", "Ajustar serviços", "Escolher horário", "Resumo e pagamento") e o "Resumo do pedido" ao lado; filtro por categoria, "Serviços sob orçamento", código promocional, "Limpar" e a previsão em cada horário, sem requisito; a janela "Nenhum veículo cadastrado" abre sozinha (L7).
- **UC26 FE01.** Fora do "Agendado", o detalhe deve informar que alterações são pedidas à empresa: a frase entra no detalhe de "Em espera", "Em execução" e "Finalizado" (L7).
- **Tamanho.** Cerca de 2.000 linhas em `src/`, sem testes nem README: o plano propõe três PRs (base, `/booking`, edição e reagendamento), com o 1 e o 2 acima de ~400.

## 2026-10-21 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas:

- L1, campos de `bookable-services` (paginada, com `additionals`) e da prévia (`feePercent` e `estimatedEndAt` nulos sem a forma ou a data; o serviço inativo fora dos itens, para o UC25 FE02);
- L2, ordem das etapas: recomendado a do wireframe e da issue ("Veículo", "Serviços", "Data e horário", "Pagamento e resumo");
- L3, edição e reagendamento numa janela sobre o detalhe, em `/appointments`;
- L4, calendário do mês e horários como botões de opção nativos, sem limite de meses e sem previsão por horário;
- L5, "Próximo" confere só a presença das escolhas, pelas `rules` do React Hook Form;
- L6, `DemoRequest` com o corpo, e a prévia de demonstração calculada sobre os dados fixos e os horários do `seed.sql`;
- L7, textos do assistente, o estado sem veículo dentro da etapa, `/booking` sem "Cancelar" e a frase de UC26 FE01;
- L8, ao desmarcar um principal, sai só o adicional que fica sem nenhum principal marcado.

Pontos de aprovação: os três PRs (ou o 1 e o 2 juntos), a conta de teste de cliente no banco local e, como na #58, as chaves do banco local, o cookie no Lighthouse, o relógio e o fuso emulados no Chrome e as alterações temporárias sem commit. Nada foi construído.

## 2026-10-21 – decisão

Plano aprovado por yvan (cabeçalho gravado por ele: `status: aprovado`, `aprovado_em: 22:39 - 21/10/2026`). As caixas das lacunas estavam todas vazias; a pedido dele na conversa ("marque as recomendadas"), o agente marcou a opção 1 de L1 a L8. A divisão ficou a do plano, em três PRs. Status em `em_execucao`.

## 2026-10-21 – desvio

Etapa 02, PR 1 (base), na ramificação `feat/59-booking-base`, criada da `origin/main` (58959f8) com `git switch --no-track -c`, sem vínculo, e `npx -y npm@11.21.1 ci`. Commits:

- 5277c42: os testes em vermelho (16 falhando pelo motivo certo: as funções inexistentes e o corpo `undefined` na resposta de demonstração; os 42 antigos dos três arquivos passando);
- 2c4aeb7: `formatCalendarDate`, `formatTime`, `toCompanyInstant`, `formatMonth`, `formatLongDate`, `listStartTimes` e `WEEKDAY_SHORT_LABELS` (os testes de formatação verdes, também com `TZ` em Asia/Tokyo, UTC e America/Los_Angeles);
- d0ab3fe: `DemoRequest` com o `body`, e `findDemoRoute` recebendo o corpo do `apiRequest` (o teste do corpo verde);
- d84e74c: `useApiQuery` com o corpo opcional;
- 77c1164: `BookableService`, `BookableAdditional`, `AppointmentPreview`, `answerBookableServices`, `answerAppointmentPreview` e as cinco entradas de `DEMO_ROUTES`;
- f9f44a5: L1 em `agendamento/rotas.md`, L5 e L6 em `componentes.md`, `testes.md` e os README de `src/shared/format/`, `src/lib/demo/` e `tests/lib/`.

Escolhas pequenas, sem mudar regra nem escopo:

- **Deslocamento.** `toCompanyInstant` lê o deslocamento do `Intl` (`timeZoneName: "longOffset"`) no próprio horário lido como UTC; sem horário de verão no Brasil (decisão 0053), é o deslocamento daquele horário. Um fuso em UTC escreve "+00:00".
- **Datas de calendário.** `formatMonth` e `formatLongDate` recebem o dia de calendário (`aaaa-mm-dd`) e o escrevem em UTC, para o dia não mudar com o fuso.
- **`findDemoRoute`.** Recebe o corpo como terceiro parâmetro, e toda resposta de demonstração recebe `body`, que só a prévia lê.
- **`useApiQuery`.** O corpo vira texto (`JSON.stringify`) na chave da leitura, então um corpo igual montado de novo a cada renderização não chama de novo.
- **Dados.** As descrições e as categorias dos 11 serviços repetem as de `src/lib/demo/catalog.ts`, para não mexer nele (fora da lista do plano); o id de "Repelente de chuva nos vidros" foi calculado pelo md5 do seed (`4c854969-1a3a-ae32-c28a-e18ad83e465c`) e conferido com os ids já conhecidos. Os percentuais ficam numa tabela (`PAYMENT_FEES`, todos zero, do `seed.sql`), para a alteração temporária da verificação. A prévia de demonstração recusa o veículo de outra conta com `NOT_FOUND`, como o detalhe de um agendamento desconhecido, e deixa de fora o id que não é de serviço ativo.
- **Conferência da prévia.** Por um teste temporário em `tests/lib/` (o `vitest.config.ts` só inclui `tests/**`, então não deu para deixá-lo no scratchpad), apagado depois (`git status` sem ele): os 11 serviços nos dois portes, com os adicionais; e os casos do plano: SW4 com "Polimento comercial" na quarta 28/10 às 09:00 → R$ 390,00, 240 min, 14:00; Toro com "Higienização interna completa" e "Oxi-sanitização" às 14:00 → R$ 550,00, 340 min, quinta 09:40; SW4 com "Lavagem técnica" no sábado 31/10 às 10:00 → R$ 220,00, segunda 02/11 às 09:00; Toro com "Lavagem completa" e "Pretinho nos pneus" na segunda 26/10 às 16:00 → R$ 130,00, 17:40; SW4 com "Lavagem completa" e "Oxi-sanitização" às 14:00 → R$ 200,00, 16:10; 120 min às 16:00 → 18:00 (encerramento); 40 min às 11:30 → 13:10 (pausa); sem a data, `estimatedEndAt` nulo; sem a forma, `feePercent` nulo; um id desconhecido fica de fora.
- **Tamanho.** Cerca de 600 linhas em `src/` (cerca de 230 de dados fixos), perto da estimativa de ~550.

## 2026-10-21 – descoberta

Verificação do PR 1, aprovada: `npm run check` sem erros nem avisos, com 411 testes (16 novos); `npx next build` concluído, sem página nova; `npm audit --omit=dev --audit-level=high` com 0. Nenhum import de `src/server/` e nada em `src/app/api/`, `supabase/` ou `src/shared/validation/` (`git diff --stat origin/main...HEAD`: 18 arquivos, todos da lista do plano). O PR 1 não tem tela; o assistente e as telas são conferidos no Chrome a partir do PR 2. Sem banco local nem `next start` neste PR.

## 2026-10-21 – desvio

Etapa 03 do PR 1, a pedido do Yvan. Na revisão do diff, os comentários de `listStartTimes` e dos testes de data citavam `docs/agendamento/agendar-servico.md`, que só nasce no PR 2; passaram a citar o UC06 (2b66843). `02_relatorio.md` parcial, como na #58, e o plano continua em `em_execucao` até o PR 3. A `origin/main` continuava em 58959f8, sem nada a incorporar. PR #75 aberto como rascunho para pôr o número no relatório e depois marcado como pronto, com a revisão pedida a LFaustin0 e Kaykebr144.

## 2026-10-22 – descoberta

Etapa 04 do PR 1: PR #75 aprovado por joaomanoel999 e incorporado por yvanshaw1 em aa60565 (11:24 UTC de 22/10). A publicação da Vercel do aa60565 e o CI do commit (`check`) com `success`; em produção (https://glow-projetoaldo.vercel.app), `/`, `/services`, `/login` e `GET /api/public/company` com 200 (os sete dias, segunda das 08:00 às 18:00 com pausa das 12:00 às 13:00, como no `seed.sql`), e `/profile` e `/appointments` sem sessão com 307 para `/login?next=…`. O PR 1 não tem tela. Ramificação remota removida pelo GitHub; a local, apagada depois de conferida igual à `main` (`git diff` vazio). Worktree `36-regras-do-agendamento-05611e` destacado na `origin/main` (aa60565). A #59 continua aberta (`Refs #59`); faltam o PR 2 (`/booking`) e o PR 3 (edição e reagendamento, `Closes #59`). Esta entrada entra no commit do PR 2. A cópia principal `App/` precisa de `git pull` (passo do Yvan).

## 2026-10-22 – desvio

Etapa 02, PR 2 (`/booking`), na ramificação `feat/59-booking-page`, criada da `origin/main` (aa60565, com o PR 1) com `git switch --no-track -c`, sem vínculo, e `npx -y npm@11.21.1 ci`. Commits:

- ae34dc8: a indicação de etapas do `StepForm` sem transbordar;
- c8cde9b: `/booking`, `booking-wizard.tsx`, as quatro etapas e `booking-summary.tsx`;
- bf38f8a: `agendar-servico.md` (L2, L4, L7, L8), `agendamento/CONTEXT.md` e o formulário em etapas em `componentes.md`.

**`StepForm`, fora do plano.** A 360 px, a indicação dividia a linha em partes iguais (73 px), e o título da etapa atual ("Serviços"; "Pagamento e resumo") invadia o número seguinte. Com o OK do Yvan na conversa (22/10/2026, "Corrigir o StepForm"), a etapa atual passou a ocupar a largura do título, que encolhe com reticências ("Data e …"), e as outras guardam o número e a linha (52 px, 28 px a última). O plano ganhou o arquivo, e `componentes.md`, a frase das reticências.

Escolhas pequenas, sem mudar regra nem escopo:

- **Formulário.** Um `useForm` com `vehicle` (id, placa, marca, modelo e cor, para o resumo), `serviceIds` (principais e complementares, RN005), `additionalIds` (RN006), `date`, `time` e `paymentMethod`, no `FormProvider`; cada etapa usa `useController`. `mode: "onChange"`: a mensagem de L5 sumia só no próximo "Próximo", porque o React Hook Form só confere de novo na mudança depois de um envio. Trocar o dia tira o horário por `setValue`, sem mostrar "Escolha o horário." antes de a pessoa escolher.
- **Prévia.** Lida uma vez no assistente (`useApiQuery` com o corpo) e passada ao resumo e à etapa de pagamento; sem veículo ou sem serviço, nenhuma chamada.
- **Opções.** Botões de opção e caixas de seleção nativos (`sr-only`), com a marca desenhada ao lado: a caixa de seleção do Base UI (`ui/checkbox.tsx`) é um `span` com `role="checkbox"`, e a ligação com o rótulo precisaria de outra verificação. Os cartões de veículo e de serviço ficam rebaixados quando escolhidos, com o nome em `--link` e a marca preenchida; o contorno de foco vai no cartão (`has-focus-visible`). Os dias, os horários e as formas de pagamento têm o visual do tipo do veículo.
- **Janela de cadastro dentro do formulário.** O `AddVehicleDialog` tem o seu próprio formulário, num portal; o React leva o `submit` dele até o formulário das etapas, então um `div` em volta para a propagação.
- **Título.** O `h3` de cada etapa do `StepForm` vinha logo depois do `h1` (auditoria `heading-order`); um `h2` "Etapas do agendamento", só para o leitor de tela, ficou antes das etapas, escrito em `agendar-servico.md`.
- **Resumo.** As linhas de valores em parágrafos, como no detalhe da #58, porque a do acréscimo não tem valor próprio.
- **Tamanho.** Cerca de 1.490 linhas em `src/` (7 no `StepForm`), acima da estimativa de ~1.100.

## 2026-10-22 – descoberta

Verificação local do PR 2, aprovada:

- **Ambiente.** Docker Desktop aberto pelo agente; `npx supabase start` (do backup) e `db reset` (só o `seed.sql`); conta de teste de cliente nova por `POST /api/auth/register` (201), com e-mail e senha em `local/client.json` do scratchpad, nunca exibidos. `npx next build` (`/booking` estática) e `npx next start -p 3059` com `local/start.sh`. Roteiros novos: `browser.mjs`, `verify-booking.mjs`, `verify-extra.mjs`, `verify-calendar.mjs`, `verify-states.mjs`, `patch-states.mjs`, `lh-snapshots.mjs`, `make-cookie.mjs` e `lh-summary.mjs`.
- **Fluxo principal**, a 360 × 800 e 1440 × 900, claro e escuro, sem rolagem horizontal: "Agendar serviço – Glow", o aviso abaixo do `h1`, as quatro etapas; "Próximo" sem veículo mostra "Escolha o veículo." com o foco no primeiro veículo; com o Toyota SW4, o foco vai a "Etapa 2 de 4: Serviços"; sem serviço, a mensagem de RN005; "Lavagem completa" oferece os quatro adicionais com os valores; com "Hidratação de couro", o resumo dá R$ 190,00 e 2 h 10 min; quarta 28/10 às 14:00, previsão às 16:10; Pix. RNF002: de volta aos serviços, "Oxi-sanitização" no lugar da hidratação, e a data, o horário e o Pix continuam marcados, com R$ 200,00 e a mesma previsão. "Confirmar agendamento" passa a "Agendando…" e mostra a mensagem de `NOT_IMPLEMENTED` no topo, com o foco.
- **FA03 e L8.** Com "Lavagem simples" e "Lavagem completa", a "Cera de carnaúba" aparece marcada sob as duas; sem a simples, ela fica (R$ 135,00); sem a completa, sai. Trocar o SW4 pelo Fiat Toro mantém os serviços e muda a lavagem de R$ 100,00 para R$ 120,00 (R$ 290,00 para R$ 310,00).
- **Janela de cadastro.** Aberta da etapa 1, a placa `GLW2B02` com Enter e "Adicionar à minha conta" mostram a placa cadastrada e o `NOT_IMPLEMENTED`, sem mexer no assistente (sem mensagem e na etapa 1); Esc devolve o foco a "Cadastrar veículo".
- **Teclado.** Setas entre os veículos; Tab até "Próximo"; Enter leva o foco ao título da etapa; Espaço marca o serviço; na etapa 3, o Tab pula "Mês anterior" (desativado), entra no primeiro dia livre e segue a "Voltar" e "Próximo"; as setas no calendário vão de 22 a 23, 24 e 26, pulando o domingo; "Próximo mês" mostra novembro, e "Mês anterior" volta a funcionar.
- **Fuso e relógio.** Com o Chrome em Asia/Tokyo e o relógio da página às 15:10 de Maceió, hoje continua ativo, só com 15:30 a 17:30; às 18:00, hoje fica desativado.
- **Estados**, por alteração temporária de `src/lib/demo/vehicles.ts` e `appointments.ts` controlada por `globalThis.__demo` no roteiro (`patch-states.mjs`), sem commit, a 360 px no claro e a 1440 px no escuro: a falha da lista de veículos, da de serviços e da prévia com "Tentar novamente", que traz os dados; sem veículos, "Nenhum veículo cadastrado" com um só "Cadastrar veículo", que abre a janela e recebe o foco de volta; 12 veículos ("1–10 de 12", um veículo da página 2 escolhido e a etapa 2 aberta); sem serviços, "Nenhum serviço disponível"; 14 serviços ("1–12 de 14", a escolha mantida no resumo ao trocar de página); a prévia nova com `aria-busy`; a falha de `GET /api/public/company` (`request.abort`) com a mensagem de `SERVICE_UNAVAILABLE` e "Tentar novamente"; com 5% no crédito e −2,5% no Pix, "Acréscimo de 5,00%" (R$ 105,00) e "Desconto de 2,50%" (R$ 97,50), o total também na etapa 4. Desfeita com `git checkout` (`git status` só com os arquivos do plano) e a aplicação compilada de novo para a passagem final, nos quatro modos.
- **Rede.** Nenhuma chamada a `/api/me/*`: só `/api/auth/login`, `/api/auth/me`, `/api/public/company` e o cadastro da conta de teste.
- **Lighthouse 13.5.0, acessibilidade.** No modo de captura, as quatro etapas (a 1 com a mensagem), a janela de cadastro e a etapa 4 com o `NOT_IMPLEMENTED`, no celular e no computador, claro e escuro: 100 nas 24 capturas, depois do `h2` das etapas (antes, 98 por `heading-order`). `/booking` pela navegação, com o cookie da sessão de teste por `--extra-headers` (arquivo apagado com os JSON): 100 nos quatro modos.
- **Desempenho.** No celular, 95, LCP de 3,0 s no modo padrão (simulado), CLS de 0,007; no computador, 100, LCP de 0,7 s, CLS de 0,021. A auditoria `bf-cache` reprova por causa do `Cache-Control: no-store` das respostas, que já existia.
- **Registro.** Acumulado (`>>`) nas cinco execuções do `next start`: 431 linhas `info`, só com caminhos e status; nenhuma com cookie, token, cabeçalho de autorização, senha, chave ou o e-mail de teste, e nenhuma de aviso ou erro da aplicação.
- **Encerramento.** `next start` encerrado por PID e `npx supabase stop`, com o backup. `npm run check` sem erros nem avisos, com 411 testes. Nenhum import de `src/server/` e nada em `src/app/api/`, `supabase/` ou `src/shared/validation/`.

## 2026-10-22 – desvio

Etapa 03 do PR 2 (PR #76), a pedido do Yvan. Na revisão do diff, três comentários do assistente citavam lacunas do plano ("L2/L4/L8 of the plan"); passaram a citar `agendar-servico.md` (46ecf16). `02_relatorio.md` parcial, com os dois PRs; o plano continua em `em_execucao` até o PR 3. PR aberto como rascunho para pôr o número no relatório e depois marcado como pronto, com a revisão pedida a LFaustin0 e Kaykebr144.

## 2026-10-22 – descoberta: etapa 01 do PR 3 com Codex

A pedido de Yvan, retomada a etapa 01 para o terceiro PR depois da incorporação de #75 e #76. Plano complementar e notas em `../59-editar-e-reagendar/`, com o recorte atualizado, a análise da ICM e a preferência de modelos informada pelo usuário. O plano geral e sua aprovação permanecem intactos. O complemento está em `aguardando_aprovacao` e inclui L9, sobre a experiência de reagendamento quando não sobra serviço principal ou complementar. Ramificação `feat/59-edit-and-reschedule`, a partir de `9e8a4a9`; nenhuma implementação nesta etapa. Ao retomar o PR 3, ler o complemento; na etapa 03, completar o relatório cumulativo desta pasta.
