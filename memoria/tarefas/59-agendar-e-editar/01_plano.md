---
issue: 59
titulo: "Telas do cliente com dados de demonstração: agendar serviço e editar o agendamento"
areas: [frontend, testes]
tipo: funcionalidade
requisitos: [UC05, UC06, UC25, UC26, RF019, RF020, RF021, RF022, RF023, RF024, RF025, RF026, RF027, RF031, RF032, RN003, RN004, RN005, RN006, RN008, RN009, RN010, RN011, RN012, RN013, RN014, RN015, RN016, RN020, RN032, RN033, RN034, RN035, RNF002]
status: em_execucao
aprovado_por: yvan
aprovado_em: 22:39 - 21/10/2026
---

# Plano: Telas do cliente com dados de demonstração: agendar serviço e editar o agendamento

## Objetivo

Construir o assistente de agendamento (T3 da `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, decisão 0055), com os dados de demonstração:

- `/booking` ("Agendar serviço", UC06, RF019 a RF027): o veículo, com o cadastro pela placa da #58 quando o cliente não tem nenhum (UC05, FE01); os serviços com o valor do porte, os adicionais vinculados e a soma (RN004 a RN006, RN009); a data e o horário pelos horários de funcionamento (RN013, RN015, RN016); a forma de pagamento (RN011); e o resumo com o total, a duração estimada e a previsão de conclusão da prévia `POST /api/me/appointments/preview` (RN010, RN012, RN014, RN034);
- a edição de um "Agendado" (UC26, RF031, RN032, RN033) e o reagendamento de um "Concluído" (UC25, RF032, RN020), com o mesmo assistente, a partir da janela de detalhe de `/appointments` da #58.

Toda gravação mostra o aviso de `NOT_IMPLEMENTED`. Nenhuma rota construída, migration, esquema de validação ou dependência nova, e nenhum import de `src/server/`.

## Base da construção

- Uma ramificação por PR (Ordem da construção), cada uma criada da `origin/main` (hoje 58959f8, com a #58) depois da incorporação do PR anterior, com `git switch --no-track -c`, sem vínculo com a `main`, e `npx -y npm@11.21.1 ci`.
- Contratos usados sem mudança:
  - `DEMO_ROUTES`, `demoPage` e `waitForDemo` (`src/lib/demo/`); `usePaginatedList` e `useFormFailure` (`src/hooks/`); `apiRequest`, `ApiError` e `withQuery` (`src/lib/api-client.ts`);
  - `GET /api/public/company` (rota real da #57), com `businessHours`; `BusinessDay` e `PublicCompany` (`src/shared/api/settings.ts`);
  - `ClientVehicle` (`src/shared/api/vehicles.ts`); `ClientAppointment`, `AppointmentVehicle` e `AppointmentService` (`src/shared/api/appointments.ts`);
  - `PAYMENT_METHODS` e `PAYMENT_METHOD_LABELS`, `VEHICLE_TYPE_LABELS`, `VEHICLE_SIZE_LABELS`, `TIME_SLOT_MINUTES`, `COMPANY_TIME_ZONE`, `CATALOG_PAGE_SIZE` (12, "serviços para agendar") e `SHORT_LIST_PAGE_SIZE` (10, veículos) (`src/shared/constants/`);
  - `formatCurrency`, `formatDateTime`, `formatDuration`, `formatPercent` e `formatPlate` (`src/shared/format/`);
  - `StepForm`, `DemoNotice`, `EmptyState`, `ListPagination`, `FormAlert` e `SubmitButton` (`src/components/shared/`), e `AddVehicleDialog` (`src/components/portal/vehicles/`, da #58), sem mudança; `Dialog`, `Alert`, `Button`, `Field` e `Skeleton` (`src/components/ui/`, decisão 0049);
  - o grupo de botões de opção nativos de `VehicleTypeField` (`fieldset` com `legend`, `input type="radio"` com `sr-only` e o rótulo como superfície) como modelo dos grupos de escolha do assistente.

## Como funciona

A página é um componente de servidor que só compõe o título, o aviso e o assistente; cada componente de cliente busca o que exibe (`frontend.md`). O esqueleto vem dos wireframes `clientPages/appointment/` (`AppointmentPageStep1` a `Step4`, `NoVehicleRegisteredModal`); o conteúdo, dos casos de uso; o estilo, de `design.md`. Os textos estão em L7.

### `/booking` – Agendar serviço

`src/app/(portal)/booking/page.tsx`, com o `metadata` "Agendar serviço – Glow": o título (`h1`), o `DemoNotice` logo abaixo dele (a tela inteira é de demonstração) e o `BookingWizard`. A página já é só do cliente (`proxy.ts`, decisão 0051).

**`booking-wizard.tsx`** (`src/components/portal/appointments/`): um único `useForm` com `vehicleId`, `serviceIds`, `date` (`aaaa-mm-dd`), `time` (`HH:MM`) e `paymentMethod`, no `StepForm`, com as etapas de L2: "Veículo", "Serviços", "Data e horário" e "Pagamento e resumo". "Próximo" confere só a escolha da etapa (L5). Ao lado, a partir de 1024 px, ou abaixo, no celular, o painel "Resumo do pedido". O modo (novo, edição ou reagendamento, L3) fica numa tabela de consulta (`codigo.md`) com as etapas, o rótulo do envio e a chamada:

| Modo | Etapas | Envio |
|---|---|---|
| Novo | as quatro | `POST /api/me/appointments` com `vehicleId`, `serviceIds`, `paymentMethod` e `scheduledAt` |
| Edição | as quatro, preenchidas com o agendamento | `PATCH /api/me/appointments/:id` com os mesmos campos e `updatedAt` |
| Reagendamento | "Data e horário" e "Pagamento e resumo" | `POST /api/me/appointments/:id/reschedule` com `paymentMethod` e `scheduledAt` |

O `scheduledAt` é o instante ISO 8601 com o deslocamento do fuso da empresa (`api.md`), montado da data e do horário escolhidos (`toCompanyInstant`). Na demonstração, as três respondem `NOT_IMPLEMENTED`, que aparece no topo do formulário (`useFormFailure`), e nada é gravado.

**Etapas:**

- **Veículo** (`booking-vehicle-step.tsx`, RF019, RN003, RN004): `usePaginatedList<ClientVehicle>` com `/api/me/vehicles` e `SHORT_LIST_PAGE_SIZE`; cada veículo é um botão de opção com "<marca> <modelo>", a placa e a cor, o tipo e o porte; os estados de `componentes.md` (Listagem). Em `/booking`, o `AddVehicleDialog` da #58 fica acima da lista e, sem veículos, no estado vazio (UC06 FE01, UC05), como na aba "Meus veículos"; cadastrado, a lista é lida de novo.
- **Serviços** (`booking-services-step.tsx`, RF020 a RF022, RN005, RN006, RN009): `usePaginatedList<BookableService>` com `/api/me/bookable-services`, o `vehicleId` como filtro e `CATALOG_PAGE_SIZE`; cada principal ou complementar é uma caixa de seleção com o nome, a categoria, a descrição, o valor do porte e a duração média. Marcado um principal com adicionais (FA01), eles aparecem logo abaixo dele, cada um com o valor fixo. Desmarcar um principal tira os adicionais dele que não são de outro principal marcado (FA02, L8). Trocar o veículo mantém os serviços marcados e lê os valores do novo porte (FA03).
- **Data e horário** (`booking-schedule-step.tsx`, RF025, RN013, RN015, RN016, L4): `useApiQuery<PublicCompany>("/api/public/company")`, a rota real. Um calendário do mês, com os dias como botões de opção num `fieldset` e "Mês anterior" e "Próximo mês"; o dia sem horário livre (fechado, passado, ou com todos os horários já passados) fica desativado. Escolhido o dia, os horários dele (`listStartTimes`), de 30 em 30 minutos, fora da pausa, sem os que já passaram, também como botões de opção. Todos os horários de funcionamento aparecem, sem controle de capacidade (RN016). A previsão do horário escolhido aparece no "Resumo do pedido".
- **Pagamento e resumo** (`booking-payment-step.tsx`, RF023, RF026, RN011): o veículo, a data e o horário escolhidos; as quatro formas de pagamento como botões de opção, com a frase de que o pagamento é presencial (RN011); o total e a previsão de conclusão da prévia, logo acima dos botões, para quem está no celular não confirmar sem vê-los; o envio do modo.

**"Resumo do pedido"** (`booking-summary.tsx`, `aside` com `h2`, RF021, RF024, RF026): a prévia `POST /api/me/appointments/preview` com o veículo e os serviços escolhidos e, quando houver, a forma de pagamento, o `scheduledAt` e, na edição, o `appointmentId`; nenhuma chamada sem veículo ou sem serviço. Mostra o veículo, os serviços com o valor de cada um, o subtotal, o "Acréscimo de <percentual>" ou "Desconto de <percentual>" só quando o percentual não é zero, o total, a duração estimada e, com a data e o horário, a previsão de conclusão. Os valores vêm da prévia, nunca de conta da tela (README de `portal/appointments/`). Numa nova leitura, os valores anteriores ficam com `aria-busy`; na falha, o aviso com "Tentar novamente". No reagendamento, o serviço do original que não voltou na prévia aparece na frase de UC25 FE02 (RN008, L1).

**Confirmação** (só com a rota, fase 3): no modo novo, o assistente dá lugar à confirmação (UC06 passo 13), com o foco no título; na edição e no reagendamento, as janelas fecham e a lista é lida de novo, como no cancelamento da #58. No 409 `VERSION_CONFLICT` da edição, o aviso fica no topo, e o agendamento é lido de novo e substitui o que foi escolhido (`componentes.md`, RNF011); no 409 `INVALID_STATUS` (UC26 FE01, UC25 FE01), o aviso fica no topo.

### Edição e reagendamento em `/appointments`

Na janela de detalhe da #58 (`appointment-details-dialog.tsx`), a tabela `STATUS_ACTIONS` ganha `edit` no "Agendado" (RN032) e `reschedule` no "Concluído" (RN020); a tela só orienta, e quem decide é a API (RS008). "Editar" e "Reagendar" abrem a janela do assistente sobre o detalhe (`appointment-change-dialog.tsx`, L3), como a confirmação do cancelamento:

- **Editar** (UC26): a janela "Editar agendamento", com o assistente preenchido com o veículo, os serviços, a forma de pagamento, a data e o horário do agendamento aberto. A data e o horário só são postergados (RN033): os dias e os horários anteriores ao marcado ficam desativados, e o marcado continua escolhido, porque manter a data é permitido.
- **Reagendar** (UC25): a janela "Reagendar serviço", com o assistente nas etapas "Data e horário" e "Pagamento e resumo"; o "Resumo do pedido" mostra o veículo e os serviços do original, com os valores do catálogo atual, pela prévia (RN020). A forma de pagamento começa vazia.
- Em "Em espera", "Em execução" e "Finalizado", o detalhe mostra a frase de UC26 FE01 no lugar das ações (L7).

### Dados de demonstração (decisão 0055)

O cliente continua Henrique Costa, com o Fiat Toro (`GLW8H08`, picape, GG) e o Toyota SW4 (`GLW5L15`, SUV, G) da #58. Os ids são os do `seed-demo.sql`.

| Arquivo | Conteúdo |
|---|---|
| `src/shared/api/appointments.ts` | `BookableService`, `BookableAdditional` e `AppointmentPreview` (L1) |
| `src/lib/demo/routes.ts` | `DemoRequest` com o `body` (L6); as entradas `GET /api/me/bookable-services` e `POST /api/me/appointments/preview`, com `load`; e `POST /api/me/appointments`, `PATCH /api/me/appointments/:id` e `POST /api/me/appointments/:id/reschedule`, sem `load` |
| `src/lib/demo/match.ts` e `src/lib/api-client.ts` | o corpo da chamada chega à resposta de demonstração (L6) |
| `src/lib/demo/appointments.ts` | os 11 serviços principais e complementares ativos de categorias ativas do seed (sem "Película nos vidros", de categoria inativa, nem "Cristalização de vidros" e "Lavagem a seco"), na ordem do seed, com os valores por porte ou fixos, as durações e os 11 vínculos com os 4 adicionais; `answerBookableServices({ query })` com o valor do porte do veículo e o `demoPage`; `answerAppointmentPreview({ body })` com os itens, o subtotal, o percentual zero do `seed.sql` (o total é o subtotal), a duração e a previsão de conclusão pelos horários do `seed.sql` (L6) |

Valores dos serviços nos dois veículos (do `seed-demo.sql`):

| Serviço | Tipo | Duração | SW4 (G) | Toro (GG) | Adicionais |
|---|---|---|---|---|---|
| Lavagem simples | principal | 40 min | R$ 60,00 | R$ 70,00 | Cera de carnaúba, Pretinho nos pneus |
| Lavagem completa | principal | 1 h 30 min | R$ 100,00 | R$ 120,00 | Cera de carnaúba, Pretinho nos pneus, Hidratação de couro, Repelente de chuva nos vidros |
| Lavagem técnica | principal | 3 h | R$ 220,00 | R$ 260,00 | Pretinho nos pneus, Hidratação de couro, Repelente de chuva nos vidros |
| Polimento comercial | principal | 4 h | R$ 390,00 | R$ 450,00 | Repelente de chuva nos vidros |
| Polimento técnico | principal | 8 h | R$ 750,00 | R$ 850,00 | nenhum |
| Vitrificação de pintura | principal | 15 h | R$ 1.500,00 | R$ 1.700,00 | nenhum |
| Higienização interna completa | principal | 5 h | R$ 380,00 | R$ 450,00 | Hidratação de couro |
| Higienização do ar-condicionado | complementar | 1 h | R$ 120,00 | R$ 120,00 | — |
| Lavagem de motor | complementar | 40 min | R$ 80,00 | R$ 80,00 | — |
| Revitalização de faróis | complementar | 1 h | R$ 150,00 | R$ 150,00 | — |
| Oxi-sanitização | complementar | 40 min | R$ 100,00 | R$ 100,00 | — |

Adicionais, de valor fixo: Cera de carnaúba (20 min, R$ 35,00), Pretinho nos pneus (10 min, R$ 10,00), Hidratação de couro (40 min, R$ 90,00) e Repelente de chuva nos vidros (20 min, R$ 50,00).

### Formatação e constantes (TDD)

- `src/shared/format/date.ts`: `formatCalendarDate(instant)`, o dia de calendário de um instante no fuso da empresa ("2026-10-21"); `formatTime(instant)`, o horário ("09:30"); `toCompanyInstant(date, time)`, o instante ISO 8601 com o deslocamento do fuso da empresa ("2026-10-28T09:00:00-03:00"), lido do `Intl` (decisão 0053), sem deslocamento fixo no código; `formatMonth(date)` ("outubro de 2026"); e `formatLongDate(date)` ("quarta-feira, 28 de outubro de 2026"), o nome de cada dia do calendário para o leitor de tela.
- `src/shared/format/business-hours.ts`: `listStartTimes(day)`, os horários de início de um dia de funcionamento, de 30 em 30 minutos (`TIME_SLOT_MINUTES`), da abertura (inclusive) ao encerramento (exclusive), fora da pausa (RN013, RN035); lista vazia no dia fechado. A tela tira os que já passaram (RN015) e, na edição, os que não postergam (RN033), comparando os instantes. Só orienta: quem confere é a API (`findStartError` de `src/server/rules/scheduling.ts`, UC06 FE03).
- `src/shared/constants/weekdays.ts`: `WEEKDAY_SHORT_LABELS` ("dom", "seg", "ter", "qua", "qui", "sex", "sáb"), o cabeçalho do calendário.

### Leitura da prévia

`useApiQuery` (`src/hooks/use-api-query.ts`) aceita o corpo: com ele, a chamada é `POST`, e o corpo entra na chave da leitura, então mudar a escolha cancela a leitura anterior e faz outra. Continua só para leituras: a prévia não grava (`rotas.md`), e nenhuma gravação passa por ele.

## Ordem da construção

Em três PRs, cada um com a verificação local e a etapa 03 próprias (Riscos, tamanho):

**PR 1, base do assistente** (`feat/59-booking-base`, "Refs #59"):

1. Ramificação da `origin/main`, sem vínculo, e `npx -y npm@11.21.1 ci`.
2. Testes de `tests/format/date.test.ts`, `tests/format/business-hours.test.ts` e o caso novo de `tests/lib/api-client.test.ts`, conferidos em vermelho, num commit próprio (decisões 0035 e 0052).
3. As cinco funções de data, `listStartTimes`, `WEEKDAY_SHORT_LABELS` e o corpo da chamada na demonstração, até os testes passarem.
4. `useApiQuery` com o corpo.
5. Tipos, dados de demonstração e as cinco entradas de `DEMO_ROUTES`.
6. Documentação: L1 em `agendamento/rotas.md`, L5 e L6 em `componentes.md`, `testes.md` e os README.
7. Verificação: `npm run check`, `npx next build` e `npm audit`; as respostas de demonstração dos serviços e da prévia nos casos de "Testes previstos", por um teste temporário do Vitest no scratchpad, sem commit (o PR 1 não tem tela; o PR 2 as confere de novo pela tela); etapa 03 do PR 1 (`02_relatorio.md` parcial, como na #58).

**PR 2, `/booking`** (`feat/59-booking-page`, "Refs #59"), depois da incorporação do PR 1:

8. `booking-wizard.tsx` no modo novo, as quatro etapas, `booking-summary.tsx` e a página.
9. Documentação: `docs/agendamento/agendar-servico.md` (L2, L4, L7, L8, parte de `/booking`), `agendamento/CONTEXT.md` e o "Cancelar" de L7 em `componentes.md`.
10. Verificação local de `/booking`; etapa 03 do PR 2.

**PR 3, edição e reagendamento** (`feat/59-edit-and-reschedule`, "Closes #59"), depois da incorporação do PR 2:

11. Os modos de edição e de reagendamento em `booking-wizard.tsx`, `appointment-change-dialog.tsx` e as ações e a frase de UC26 FE01 em `appointment-details-dialog.tsx`.
12. Documentação: L3 e as ações por status em `meus-agendamentos.md`, a parte da edição e do reagendamento em `agendar-servico.md`.
13. Verificação local de `/appointments` e de novo de `/booking`; etapa 03: `02_relatorio.md` completo e o plano em `concluido`.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado o resumo, quando volto à etapa dos serviços e troco um, então as outras etapas continuam preenchidas (RNF002) | Local, em `/booking`: Toyota SW4, "Lavagem completa" com "Hidratação de couro" (total R$ 190,00), quarta-feira da próxima semana às 14:00, Pix; em "Pagamento e resumo", "Voltar" até "Serviços", desmarcar "Hidratação de couro" e marcar "Oxi-sanitização"; "Próximo" até o fim: o veículo, a data, o horário e o Pix continuam escolhidos, e o "Resumo do pedido" passa a "Lavagem completa" R$ 100,00 e "Oxi-sanitização" R$ 100,00, total R$ 200,00, duração "2 h 10 min" e previsão no mesmo dia às 16:10 (RN034). O mesmo com a troca do veículo para o Fiat Toro (FA03): os serviços continuam marcados, com R$ 120,00 e R$ 100,00 |
| Dado um principal com adicionais vinculados, quando o escolho, então o assistente oferece os adicionais (RN006) | Local: marcar "Lavagem completa" mostra "Cera de carnaúba", "Pretinho nos pneus", "Hidratação de couro" e "Repelente de chuva nos vidros", com os valores; "Polimento técnico" e os complementares não mostram nenhum. Com "Lavagem simples" e "Lavagem completa" marcadas e "Cera de carnaúba" escolhida, desmarcar "Lavagem simples" mantém a cera, e desmarcar também "Lavagem completa" a tira (FA02, L8). "Próximo" sem nenhum serviço mostra a mensagem de L5 (FE02, RN005); sem veículo, a de L5 (RF019) |
| Dado a confirmação, quando a envio, então vejo o aviso de `NOT_IMPLEMENTED`, e nada é gravado | Local: "Confirmar agendamento" passa a "Agendando…" e mostra "Esta ação ainda não está disponível nesta versão de demonstração." no topo do formulário, com o foco; o mesmo em "Salvar alterações" (edição) e "Confirmar reagendamento". A lista de requisições sem nenhuma chamada a `/api/me/*` |
| Dado um agendamento "Concluído" do histórico, quando abro o detalhe, então vejo "Reagendar", e o assistente começa na data e no horário, com o veículo e os serviços do original (RN020) | Local: o detalhe dos dois "Concluído" mostra "Reagendar"; o do "Cancelado" e o do "Reagendado", não. A janela "Reagendar serviço" abre na etapa "Data e horário", com duas etapas na indicação, e o "Resumo do pedido" mostra o Fiat Toro com "Lavagem simples" R$ 70,00 e "Cera de carnaúba" R$ 35,00 (total R$ 105,00), ou o Toyota SW4 com "Lavagem completa" R$ 100,00 e "Hidratação de couro" R$ 90,00 (R$ 190,00). Por alteração temporária da prévia, um serviço fora da resposta mostra a frase de UC25 FE02 |
| Edição de um "Agendado" (UC26, RF031, RN032, RN033), do escopo da issue | Local: os dois "Agendado" mostram "Editar" e "Cancelar agendamento"; "Em execução" mostra a frase de UC26 FE01 e nenhuma ação. "Editar" abre "Editar agendamento" com o veículo, os serviços, a forma de pagamento, a data e o horário marcados; os dias e os horários anteriores ao marcado ficam desativados, e o marcado continua escolhido; "Salvar alterações" mostra o `NOT_IMPLEMENTED` |

Critérios comuns às telas de demonstração (issue):

| Critério | Verificação |
|---|---|
| Esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md` (decisão 0041) | Revisão: o que fica de fora do wireframe está em "Fora do escopo" |
| `useApiQuery` ou `usePaginatedList` com o endereço de `rotas.md`; tipos em `src/shared/api/<módulo>.ts`; dados em `src/lib/demo/<módulo>.ts`, com os nomes do `seed-demo.sql` | Revisão do diff; a lista de requisições só com `/api/auth/me` e `/api/public/company` |
| Carregamento, vazio e falha com "Tentar novamente" | Local: o carregamento nos 400 ms da demonstração; por alteração temporária dos dados de demonstração, sem commit, desfeita e conferida pelo `git diff`: sem veículos (FE01, com "Cadastrar veículo"), 12 veículos (paginação), sem serviços, 14 serviços (paginação), a falha da lista de veículos, da de serviços, da prévia e dos horários (`request.abort` em `/api/public/company`), e percentuais diferentes de zero ("Acréscimo de 5,00%" no crédito, "Desconto de 2,50%" no Pix) |
| O aviso de demonstração na tela; o envio mostra o `NOT_IMPLEMENTED`, e nada é gravado | O aviso logo abaixo do título de `/booking`; nas janelas de `/appointments`, o da página (L3). Cada envio como acima |
| 360 × 800 primeiro e 1440 × 900, claro e escuro, pelo teclado, sem transbordar, Lighthouse de acessibilidade sem auditoria reprovada | Local, no Chrome sem interface: as quatro etapas, as duas janelas e os estados nas duas larguras e nos dois temas, sem rolagem horizontal; pelo teclado, as opções (setas), os dias do calendário (setas, os desativados pulados), "Mês anterior" e "Próximo mês", os horários, "Próximo" e "Voltar" (o foco vai ao título da etapa), e as janelas (foco preso, Esc fecha, o foco volta ao botão); Lighthouse 13.5.0 pela navegação em `/booking` e no modo de captura (`snapshot`) em cada etapa e nas janelas |
| Nenhuma rota, migration ou esquema de validação novo, e nenhum import de `src/server/` | `git diff --stat` sem `src/app/api/`, `supabase/` nem `src/shared/validation/`; `grep` por `@/server` nos arquivos novos |

### Como a verificação local é feita

Como na #58 (notas da tarefa), em cada PR, com roteiros novos no scratchpad desta sessão (os da #58 não são legíveis por outra):

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`, só com o `seed.sql`, de onde vêm os horários de funcionamento de `GET /api/public/company`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Conta de teste de cliente.** Criada por `POST /api/auth/register` no banco local, com e-mail fictício `@example.com` e a senha gerada por um roteiro do scratchpad, guardadas num arquivo dele e nunca exibidas. Ela só existe no banco local.
- **Aplicação.** `npx next build` e `npx next start -p 3059`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório.
- **Telas**, num Chrome sem interface controlado pelo `puppeteer-core` do cache do Lighthouse 13.5.0 (abre no tema escuro nesta máquina; o claro pela emulação de `prefers-color-scheme`): a 360 × 800 primeiro e a 1440 × 900, nos dois temas, o teclado e a lista de requisições. O fuso do navegador é trocado (`emulateTimezone`, como "Asia/Tokyo") para conferir que o calendário e os horários seguem o fuso da empresa; o relógio da página é adiantado por roteiro (`evaluateOnNewDocument`) para conferir os horários já passados de hoje e o dia sem horário livre. A falha de uma rota real é feita com `request.abort` ou `request.respond`, nunca deixando a requisição sem resposta.
- **Lighthouse.** `npx -y lighthouse@13.5.0` com `--only-categories=accessibility,performance` em `/booking`, no celular e no computador, claro e escuro, com o cookie da sessão de teste por `--extra-headers`, num arquivo do scratchpad apagado no fim; as etapas e as janelas, que não abrem pelo endereço, no modo de captura (`snapshot`) do Lighthouse do cache, com o `puppeteer-core` dele; o LCP no celular fica no PR.
- **Registro.** A saída do `next start` acumulada (`>>`) em todas as execuções do PR e conferida sem cookie, token, cabeçalho de autorização, senha, chave nem o e-mail de teste.
- **Verificações automáticas.** `npm run check` sem erros nem avisos, `npx next build` e `npm audit --omit=dev --audit-level=high`.
- **Encerramento.** `next start` encerrado por PID, `npx supabase stop`, as alterações temporárias desfeitas (`git status` só com os arquivos do plano).
- **Pré-visualização**, passo seu: as telas no celular e no computador, com o Lighthouse de acessibilidade e o LCP no PR.

## Arquivos

| Arquivo | Ação | PR |
|---|---|---|
| `tests/format/date.test.ts`, `tests/format/business-hours.test.ts` | alterar: os casos novos | 1 |
| `tests/lib/api-client.test.ts` | alterar: o corpo na resposta de demonstração | 1 |
| `src/shared/format/date.ts` | alterar: as cinco funções | 1 |
| `src/shared/format/business-hours.ts` | alterar: `listStartTimes` | 1 |
| `src/shared/constants/weekdays.ts` | alterar: `WEEKDAY_SHORT_LABELS` | 1 |
| `src/lib/demo/routes.ts` | alterar: `DemoRequest` com o corpo e as cinco entradas | 1 |
| `src/lib/demo/match.ts`, `src/lib/api-client.ts` | alterar: o corpo até a resposta | 1 |
| `src/hooks/use-api-query.ts` | alterar: o corpo e o `POST` | 1 |
| `src/shared/api/appointments.ts` | alterar: os tipos de L1 | 1 |
| `src/lib/demo/appointments.ts` | alterar: os serviços para agendar e a prévia | 1 |
| `src/app/(portal)/booking/page.tsx` | criar | 2 |
| `src/components/portal/appointments/booking-wizard.tsx` | criar (2); os modos de edição e reagendamento (3) | 2, 3 |
| `src/components/portal/appointments/booking-vehicle-step.tsx`, `booking-services-step.tsx`, `booking-schedule-step.tsx`, `booking-payment-step.tsx`, `booking-summary.tsx` | criar | 2 |
| `src/components/portal/appointments/appointment-change-dialog.tsx` | criar | 3 |
| `src/components/portal/appointments/appointment-details-dialog.tsx` | alterar: as ações e a frase de UC26 FE01 | 3 |
| `src/components/portal/appointments/appointment-list.tsx` | alterar, se preciso: a lista lida de novo depois da edição e do reagendamento | 3 |
| `src/shared/format/README.md`, `tests/format/README.md`, `tests/lib/README.md`, `src/lib/demo/README.md` | alterar: as funções novas e o corpo | 1 |
| `docs/agendamento/rotas.md` | alterar (L1) | 1 |
| `docs/padroes/componentes.md` | alterar (L5, L6; o "Cancelar" de L7) | 1, 2 |
| `docs/padroes/testes.md` | alterar: as linhas "Cliente da API" e "Formatação" | 1 |
| `docs/agendamento/agendar-servico.md` | criar (L2, L4, L7, L8) | 2, 3 |
| `docs/agendamento/CONTEXT.md` | alterar: a linha do módulo novo | 2 |
| `docs/agendamento/meus-agendamentos.md` | alterar (L3, L7) | 3 |
| `memoria/tarefas/59-agendar-e-editar/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` | todos |

Os README de `src/components/portal/appointments/` (assistente, edição e reagendamento), de `src/app/(portal)/booking/`, de `src/shared/api/`, `src/shared/constants/` e `src/hooks/` já descrevem o que entra e não mudam.

### Em comum com outras tarefas

- Nenhum PR aberto; a `main` está em 58959f8.
- **#62** (novo agendamento e edição no painel): o mesmo formulário em etapas, com `POST /api/admin/appointments/preview`; pode reaproveitar as etapas e o "Resumo do pedido" (para `src/components/shared/` no segundo uso), `listStartTimes`, as funções de data e o `useApiQuery` com o corpo.
- **#61 e #62:** o mesmo `src/shared/api/appointments.ts` e `src/lib/demo/appointments.ts`; quem chegar depois acrescenta os seus tipos e dados.
- **#58 a #65:** uma linha por rota em `src/lib/demo/routes.ts` (conflito simples).
- **#67** (documentos formais): recebe a lista do relatório desta tarefa.

## Testes previstos

TDD nas funções de formatação e no corpo da demonstração, com os valores esperados escritos à mão a partir de RN013, RN035, do `seed.sql` e da decisão 0053 (decisões 0035 e 0052):

`tests/format/date.test.ts`:

- writes the calendar day of an instant in the company's time zone: "2026-10-22T02:30:00Z" → "2026-10-21"; "2026-10-22T03:00:00Z" → "2026-10-22"
- writes the time of an instant in the company's time zone: "2026-10-22T12:00:00Z" → "09:00"; "2026-10-22T02:30:00Z" → "23:30"
- builds the instant of a day and a time in the company's time zone: ("2026-10-28", "09:00") → "2026-10-28T09:00:00-03:00", the same instant as "2026-10-28T12:00:00Z"; ("2026-12-31", "17:30") → "2026-12-31T17:30:00-03:00"
- writes the month of a calendar day: "2026-10-01" → "outubro de 2026"
- writes the long date of a calendar day: "2026-10-28" → "quarta-feira, 28 de outubro de 2026"

`tests/format/business-hours.test.ts`:

- lists the start times every 30 minutes, out of the break: segunda-feira do `seed.sql` (08:00 a 18:00, pausa das 12:00 às 13:00) → "08:00" a "11:30" e "13:00" a "17:30" (18 horários)
- lists the start times of a day without a break: sábado do `seed.sql` (08:00 a 12:00) → "08:00" a "11:30" (8 horários)
- returns no time on a closed day: domingo → []
- starts at the opening and stops before the closing: 08:30 a 10:00 → "08:30", "09:00", "09:30"
- skips a break that ends on the half hour: pausa das 12:00 às 13:30 → sem "12:00", "12:30" e "13:00"

`tests/lib/api-client.test.ts`:

- gives the body of a listed POST to its answer: a prévia simulada devolve a quantidade de `serviceIds` do corpo

A prévia de demonstração (L6) é conferida à mão pelo `next start` (decisão 0052), com casos calculados à mão pelos horários do `seed.sql`, os mesmos de `calculos.md` e da #58: Toyota SW4 com "Polimento comercial" numa quarta às 09:00 → R$ 390,00, "4 h", previsão às 14:00 (atravessa a pausa); Fiat Toro com "Higienização interna completa" e "Oxi-sanitização" numa quarta às 14:00 → R$ 550,00, "5 h 40 min", previsão na quinta às 09:40 (atravessa a noite); Toyota SW4 com "Lavagem técnica" num sábado às 10:00 → R$ 220,00, "3 h", previsão na segunda às 09:00 (atravessa o domingo); Fiat Toro com "Lavagem completa" e "Pretinho nos pneus" numa segunda às 16:00 → R$ 130,00, "1 h 40 min", previsão às 17:40. Os componentes são conferidos à mão.

## Documentação

- `docs/agendamento/agendar-servico.md`, novo, "Conteúdo do assistente de agendamento" (cabeçalho `titulo`, `assunto: agendamento`, `origem: issue #59`, `relacionados: [UC05, UC06, UC25, UC26, RF019 a RF027, RF031, RF032, RN004 a RN006, RN008, RN011, RN013, RN015, RN016, RN020, RN033, RNF002]`): as etapas e a ordem (L2), a escolha da data e do horário (L4), os textos (L7), os adicionais (L8), a edição e o reagendamento (L3).
- `docs/agendamento/meus-agendamentos.md`: as ações "Editar" e "Reagendar" e a frase de UC26 FE01 (L3, L7); `relacionados` com UC26 e RF031.
- `docs/agendamento/CONTEXT.md`: a linha do módulo novo.
- `docs/agendamento/rotas.md`: L1.
- `docs/padroes/componentes.md`: L5, L6 e o "Cancelar" da primeira etapa numa página (L7).
- `docs/padroes/testes.md`, tabela de casos: na linha "Cliente da API", "respostas das rotas de demonstração, sem chamada de rede, e a recusa das gravações" passa a "respostas das rotas de demonstração, sem chamada de rede, com o corpo das leituras por `POST`, e a recusa das gravações"; na linha "Formatação", acrescentar "dia de calendário e horário de um instante no fuso da empresa, e o instante de um dia e um horário; mês e data por extenso; horários de início de um dia de funcionamento, com e sem pausa, e fechado".
- README: `src/shared/format/` (as funções novas), `tests/format/` (sem arquivo novo; os casos novos), `tests/lib/` e `src/lib/demo/` (o corpo).
- Documentos formais a atualizar no relatório, pela #67: Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A (os campos de `GET /api/me/bookable-services` e de `POST /api/me/appointments/preview`, L1); Documentação de Desenvolvimento com IA, seção 8 (os casos novos de formatação e do cliente da API).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Campos dos serviços para agendar e da prévia

**Problema.** Os tipos de `src/shared/api/` precisam dos nomes dos campos, mas `docs/agendamento/rotas.md` descreve as duas respostas por alto: `GET /api/me/bookable-services` devolve "serviços com o valor aplicável ao porte e os adicionais de cada serviço principal", sem os campos, sem dizer que é paginada (a tabela de `api.md` tem "serviços para agendar" com 12 por página) nem quais serviços entram (RN008, RN031); `POST /api/me/appointments/preview` devolve "itens, subtotal, percentual da forma de pagamento, total, duração estimada e, com `scheduledAt`, previsão de conclusão", sem os nomes nem o que vem sem a forma de pagamento. No reagendamento, o UC25 FE02 manda informar quais serviços do original não estão mais ativos (RN008) e manter os outros; a tela só fica sabendo disso pela prévia.

**Opções:**

- [x] **1. Os campos em `rotas.md`, com o serviço inativo fora dos itens da prévia (recomendada).** Os tipos seguem o texto abaixo, e a fase 3 constrói as rotas por ele. A prévia leva só os serviços que podem ser agendados; no reagendamento, o serviço do original que não voltou aparece na frase de FE02, e o envio de `reschedule` já mantém os outros (UC25).
- [ ] **2. Os campos em `rotas.md`, com o serviço inativo recusado pela prévia (400).** A tela do reagendamento precisaria procurar cada serviço do original na lista paginada de `bookable-services` para achar os inativos antes da prévia: mais chamadas e mais código para o caso FE02.

**Texto proposto (opção 1):** `docs/agendamento/rotas.md`:

- `GET /api/me/bookable-services`, "Resposta: **200** serviços com o valor aplicável ao porte e os adicionais de cada serviço principal." passa a "Resposta: **200** lista paginada dos serviços principais e complementares ativos de categorias ativas (RN008, RN031), na ordem do catálogo público, com `id`, `name`, `description`, `type`, `category` (`id` e `name`), `price` (o do porte do veículo ou o valor fixo, RN009), `durationMinutes` e `additionals`: `id`, `name`, `price` e `durationMinutes` dos adicionais ativos vinculados ao principal (RN006); lista vazia no complementar."
- `POST /api/me/appointments/preview`, "Resposta: **200** itens, subtotal, percentual da forma de pagamento, total, duração estimada e, com `scheduledAt`, previsão de conclusão." passa a "Resposta: **200** `services` (`id`, `name`, `type`, `price` e `durationMinutes` de cada serviço pedido que pode ser agendado, pelo catálogo atual; o serviço inativo ou de categoria inativa fica de fora, RN008, RN031), `subtotal`, `feePercent` (o percentual da forma de pagamento, RN012, ou `null` sem `paymentMethod`), `total` (RN010; sem `paymentMethod`, igual ao subtotal), `estimatedDurationMinutes` (RN014) e `estimatedEndAt` (RN034, ou `null` sem `scheduledAt`)."

### L2. Ordem das etapas

**Problema.** O UC06 escolhe a forma de pagamento (passos 7 e 8) antes da data e do horário (passos 9 e 10), e o UC25 também (passos 4 e 5). O wireframe (`AppointmentPageStep1` a `Step4`) põe a data e o horário na etapa 3 e a forma de pagamento junto do resumo, na 4, e o corpo da #59, aprovado na L4 da #58, segue o wireframe: "nas etapas de data e horário e de forma de pagamento e resumo" e "o assistente começa na data e no horário".

**Opções:**

- [x] **1. A ordem do wireframe e da issue: "Veículo", "Serviços", "Data e horário" e "Pagamento e resumo" (recomendada).** A forma de pagamento fica ao lado do total, que muda com ela; o reagendamento começa na data e no horário, como pede o critério da issue. Cada passo dos casos de uso continua acontecendo, só a ordem de apresentação muda, registrada no módulo novo; os casos de uso não mudam.
- [ ] **2. A ordem dos casos de uso, em cinco etapas: "Veículo", "Serviços", "Forma de pagamento", "Data e horário" e "Resumo".** Segue o UC06 ao pé da letra, mas o reagendamento começaria na forma de pagamento, contra o critério da issue, que teria de ser editado; e uma etapa só com quatro opções.

**Texto proposto (opção 1):** `docs/agendamento/agendar-servico.md`, seção "Etapas": "Quatro etapas no formulário em etapas ([../padroes/componentes.md](../padroes/componentes.md)): 'Veículo', 'Serviços', 'Data e horário' e 'Pagamento e resumo', como no wireframe. A forma de pagamento fica na última etapa, junto do total que ela muda: os passos 7 e 8 do [UC06](UC06-agendar-servico.md) acontecem depois dos passos 9 e 10, e o passo 4 do [UC25](UC25-reagendar-servico-concluido.md), depois do 5, sem mudar o que o sistema faz em cada um."

### L3. Onde a edição e o reagendamento abrem

**Problema.** A issue diz que a edição e o reagendamento abrem "o mesmo assistente a partir do detalhe" da #58, sem dizer se numa janela ou na página `/booking`. `rotas.md` põe a edição e o reagendamento na tela `/appointments` (UC25, UC26) e só o UC06 em `/booking`; `componentes.md` (Diálogos) diz que a edição fica numa janela; o detalhe da #58 já é uma janela, e o cancelamento abre a confirmação sobre ela.

**Opções:**

- [x] **1. Uma janela sobre o detalhe, em `/appointments` (recomendada).** "Editar" e "Reagendar" abrem "Editar agendamento" ou "Reagendar serviço" sobre o detalhe, com o assistente; Esc ou "Cancelar" voltam ao detalhe; concluído, as janelas fecham e a lista é lida de novo, como no cancelamento. Segue `rotas.md` e `componentes.md`. No celular, a janela ancorada embaixo rola por dentro (`max-h-[90dvh]`). A edição não oferece o cadastro de veículo, para não abrir uma terceira janela. O aviso de demonstração é o da página, como no detalhe e na confirmação da #58.
- [ ] **2. A página `/booking` com o agendamento no endereço (`/booking?edit=<id>` ou `?reschedule=<id>`).** Mais espaço no celular, mas muda a tabela de telas de `rotas.md`, tira a pessoa de `/appointments` e faz a página ler o endereço (`useSearchParams`, com `Suspense`).

**Texto proposto (opção 1):**

- `docs/agendamento/meus-agendamentos.md`, "Ações por status": os dois itens atuais ("'Agendado': 'Cancelar agendamento' (RN019)" e "Os outros: nenhuma nesta tela, além das da #59") passam a:
  - "'Agendado': 'Editar' ([UC26](UC26-editar-agendamento.md), [RN032](RN032-quem-edita-o-agendamento.md)) e 'Cancelar agendamento' ([RN019](RN019-cancelamento.md))."
  - "'Concluído': 'Reagendar' ([UC25](UC25-reagendar-servico-concluido.md), [RN020](RN020-reagendamento.md))."
  - "'Em espera', 'Em execução' e 'Finalizado': nenhuma ação, e a frase de UC26 FE01."
  - "'Cancelado' e 'Reagendado': nenhuma."
  - e o parágrafo novo: "'Editar' e 'Reagendar' abrem, sobre o detalhe, a janela do assistente de agendamento ([agendar-servico.md](agendar-servico.md)). Concluída a edição ou o reagendamento, as janelas fecham e a lista é lida de novo."
- `docs/agendamento/agendar-servico.md`, seção "Edição e reagendamento": o que está em "Como funciona" deste plano (as etapas de cada modo, o que vem preenchido, o "só postergar" de RN033 nos dias e horários, a forma de pagamento vazia no reagendamento e a frase de FE02).

### L4. Escolha da data e do horário

**Problema.** O UC06 (passo 9) e o UC25 (passo 5) mandam exibir "as datas e os horários de funcionamento" (RN013, RN015), e o wireframe desenha um calendário do mês e uma grade de horários, cada um com "até 10:00" (a previsão de cada horário). Nada diz como é a escolha, até quando se pode agendar, nem se cada horário mostra a previsão. O `shadcn/ui` tem um calendário, mas ele traz a dependência `react-day-picker`, e a issue não admite dependência nova. A previsão de cada horário seria uma chamada à prévia por horário, ou a tela calculando RN034, que é da API.

**Opções:**

- [x] **1. Calendário do mês e horários como botões de opção nativos, sem previsão por horário (recomendada).** Um `fieldset` "Data" com os dias do mês numa grade de sete colunas, sob o cabeçalho "dom" a "sáb", e os botões "Mês anterior" e "Próximo mês"; um `fieldset` "Horário" com os horários do dia escolhido. O teclado é o dos botões de opção (setas, pulando os desativados), sem código de navegação próprio. Começa no mês de hoje (ou, na edição, no do agendamento), sem limite de meses à frente, porque nenhuma regra limita a antecedência. A previsão do horário escolhido aparece no "Resumo do pedido", pela prévia.
- [ ] **2. Campo de data nativo (`input type="date"`) e a lista de horários.** Menos código, mas o formato do campo segue o idioma do navegador (pode aparecer mm/dd/aaaa, contra RNF016) e não marca os dias fechados, que só aparecem como "sem horário" depois da escolha.
- [ ] **3. Lista dos próximos dias de funcionamento (por exemplo, 14) como botões de opção.** Simples e só com dias abertos, mas cria um limite de antecedência que a documentação não tem.

**Texto proposto (opção 1):** `docs/agendamento/agendar-servico.md`, seção "Data e horário": "A data é escolhida num calendário do mês, com os dias como botões de opção, 'Mês anterior' e 'Próximo mês'; começa no mês de hoje, ou no do agendamento, na edição, sem limite de meses à frente. O dia sem horário livre (fechado, passado ou com todos os horários já passados) fica desativado. Escolhido o dia, aparecem os horários de início dele, de 30 em 30 minutos, da abertura ao último antes do encerramento, fora da pausa e sem os que já passaram ([RN013](RN013-disponibilidade.md), [RN015](RN015-sem-data-no-passado.md)), todos, sem controle de capacidade ([RN016](RN016-sem-controle-de-capacidade.md)). Os horários vêm de `GET /api/public/company`. A tela só orienta: quem confere a data e o horário é a API (UC06 FE03). A previsão de conclusão do horário escolhido aparece no resumo do pedido, sem previsão em cada horário."

### L5. Conferência das etapas sem o esquema de validação

**Problema.** A issue e a decisão 0055 (`componentes.md`, Telas de demonstração) deixam os formulários sem o esquema de validação até a rota existir. Mas o `StepForm` só passa de etapa se os campos dela forem válidos, e sem nenhuma conferência "Próximo" avança sempre: o assistente chegaria aos serviços sem veículo, contra RF019 ("exigir a seleção de um veículo antes de exibir os serviços"), e ao horário sem serviço, contra UC06 FE02 (RN005).

**Opções:**

- [x] **1. Só a presença das escolhas de cada etapa, pelas regras do React Hook Form (recomendada).** `rules` com `required` (e, nos serviços, ao menos um principal ou complementar) nos campos de cada etapa, com as mensagens de L7, junto de cada grupo (RNF003). Nada de formato nem de regra da API; o esquema as substitui com a rota.
- [ ] **2. Nenhuma conferência.** Segue a 0055 ao pé da letra, mas "Próximo" leva a uma etapa sem o que ela precisa, contra RF019 e FE02.
- [ ] **3. O esquema Zod agora (`src/shared/validation/appointments.ts`).** Contraria a issue ("nenhum esquema de validação novo") e a 0055; o esquema entra com a rota.

**Texto proposto (opção 1):** `docs/padroes/componentes.md`, Telas de demonstração: "Na demonstração, a listagem pagina, busca e filtra sobre a lista fixa. O formulário tem os campos, as etapas, as máscaras e os diálogos, sem o esquema de validação, que entra com a rota; o envio mostra o aviso de `NOT_IMPLEMENTED`." passa a "Na demonstração, a listagem pagina, busca e filtra sobre a lista fixa. O formulário tem os campos, as etapas, as máscaras e os diálogos, sem o esquema de validação, que entra com a rota; o envio mostra o aviso de `NOT_IMPLEMENTED`. No formulário em etapas, 'Próximo' confere só se as escolhas obrigatórias da etapa foram feitas (`rules` do React Hook Form), para a etapa seguinte ter do que depender, como o veículo antes dos serviços (RF019); o esquema as substitui com a rota."

### L6. Prévia de demonstração que segue as escolhas

**Problema.** A resposta de demonstração recebe só os parâmetros do caminho e a consulta (`DemoRequest`), e `componentes.md` diz que os `POST` que não gravam, "como a prévia de valores", devolvem os dados fixos; o teste da #56 confere uma prévia sempre igual. Uma prévia fixa mostraria no "Resumo do pedido" um total que não é o dos serviços escolhidos. A prévia depende do corpo (veículo, serviços, forma de pagamento e data), e a previsão de conclusão segue RN034, que é da API (`src/server/rules/scheduling.ts`, `server-only`).

**Opções:**

- [x] **1. A resposta de demonstração recebe o corpo, e a prévia é calculada sobre os dados fixos (recomendada).** `DemoRequest` ganha o `body`; a prévia de demonstração procura o porte do veículo e os valores dos serviços nos dados fixos do módulo, usa o percentual zero do `seed.sql` (o total é o subtotal), soma as durações e distribui a duração pelos horários do `seed.sql` para a previsão. É código de demonstração, que sai com a rota na fase 3; não importa de `src/server/`, e a regra continua sendo a da API. Conferida à mão com os casos de "Testes previstos".
- [ ] **2. Prévia fixa, como hoje.** Nenhuma mudança na demonstração, mas o resumo mostra valores, duração e previsão que não são os escolhidos, e o critério de RNF002 (os valores mudam ao trocar um serviço) não aparece na tela.

**Texto proposto (opção 1):**

- `docs/padroes/componentes.md`, Telas de demonstração: "As leituras, inclusive os `POST` que não gravam, como a prévia de valores e a análise do dashboard, devolvem os dados fixos; as gravações respondem `NOT_IMPLEMENTED`, que a tela mostra como qualquer falha." passa a "As leituras, inclusive os `POST` que não gravam, como a prévia de valores e a análise do dashboard, devolvem os dados fixos; a resposta que depende do corpo, como a prévia, é calculada sobre os dados fixos do módulo e as configurações do `seed.sql`, até a rota existir. As gravações respondem `NOT_IMPLEMENTED`, que a tela mostra como qualquer falha."
- `src/lib/demo/README.md`, "Acrescentar uma rota": "devolve a resposta: uma função que recebe os parâmetros do caminho e a consulta." passa a "devolve a resposta: uma função que recebe os parâmetros do caminho, a consulta e o corpo."

### L7. Conteúdo e textos do assistente

**Problema.** O UC06, o UC25 e o UC26 dizem o que o assistente faz, mas nenhum módulo define os títulos, os rótulos, as mensagens de cada etapa, o "Resumo do pedido", o estado sem veículo (UC06 FE01), a confirmação (passo 13), a frase de UC26 FE01 ("o sistema informa que alterações devem ser solicitadas à empresa") nem a de UC25 FE02. O wireframe abre uma janela "Nenhum veículo cadastrado" com "Fazer isso depois". `componentes.md` diz que, "na primeira etapa, 'Cancelar' fica no lugar de 'Voltar'", mas em `/booking` o assistente é a página, e não há para onde o "Cancelar" voltar.

**Opções:**

- [x] **1. Os textos abaixo, o estado sem veículo dentro da etapa e a página sem "Cancelar" (recomendada).** Sem veículo, a etapa mostra o estado vazio com "Cadastrar veículo", como a aba "Meus veículos", sem uma janela que se abre sozinha. Em `/booking`, a primeira etapa não tem "Cancelar" (sair é pelo menu); nas janelas, "Cancelar" fecha. Os textos ficam no código e no módulo novo `docs/agendamento/agendar-servico.md`.
- [ ] **2. A janela do wireframe sem veículo e "Cancelar" levando à página inicial.** A janela "Nenhum veículo cadastrado" abre ao carregar, com "Cadastrar meu veículo" e "Fazer isso depois"; mais uma janela no fluxo e o foco tirado da página sem a pessoa pedir.

**Texto proposto (opção 1):** `docs/agendamento/agendar-servico.md`, além das seções de L2, L3, L4 e L8:

- Página: título "Agendar serviço"; o aviso de demonstração logo abaixo dele; o assistente e, ao lado (a partir de 1024 px) ou abaixo (no celular), o "Resumo do pedido". A primeira etapa não tem "Cancelar": sair é pelo menu.
- Veículo (RF019, UC06 FE01): legenda "Qual veículo será atendido?"; cada opção com "<marca> <modelo>", "Placa <placa> · <cor>" e "<tipo> · Porte <porte>"; o botão "Cadastrar veículo" acima da lista (a janela da área do cliente, [../clientes/area-do-cliente.md](../clientes/area-do-cliente.md)); sem veículos, "Nenhum veículo cadastrado" e "Para agendar um serviço, cadastre um veículo na sua conta.", com o botão "Cadastrar veículo"; sem escolha, "Escolha o veículo.".
- Serviços (RF020 a RF022): legenda "Quais serviços você quer?"; cada opção com o nome, a categoria, a descrição, o valor e a duração média; os adicionais de um principal marcado, logo abaixo dele, sob "Adicionais de <serviço>", cada um com "+ <valor>"; sem serviços, "Nenhum serviço disponível" e "No momento, não há serviços para agendar."; sem escolha, "Escolha ao menos um serviço principal ou complementar." ([RN005](RN005-servico-obrigatorio-no-agendamento.md)).
- Data e horário: legendas "Data" e "Horário"; "Mês anterior" e "Próximo mês"; antes da data, "Escolha uma data para ver os horários."; sem escolha, "Escolha a data." e "Escolha o horário.".
- Pagamento e resumo: "Veículo", "Data e horário" e "Previsão de conclusão"; legenda "Forma de pagamento", com "Crédito", "Débito", "Pix" e "Dinheiro", e a descrição "O pagamento é feito na empresa, no dia do atendimento." ([RN011](RN011-formas-de-pagamento.md)); "Total"; sem escolha, "Escolha a forma de pagamento."; botão "Confirmar agendamento" ("Agendando…"), "Salvar alterações" ("Salvando…") na edição e "Confirmar reagendamento" ("Reagendando…") no reagendamento.
- Resumo do pedido: título "Resumo do pedido"; o veículo; os serviços com o valor; "Subtotal"; "Acréscimo de <percentual>" ou "Desconto de <percentual>", só quando a forma de pagamento tem percentual; "Total"; "Duração estimada"; "Previsão de conclusão", depois da data e do horário; sem serviço, "Nenhum serviço escolhido."; no reagendamento, o serviço do original que não pode mais ser agendado: "Não estão mais disponíveis e ficaram de fora: <nomes>." (UC25 FE02).
- Confirmação (UC06 passo 13): título "Agendamento confirmado", texto "O seu agendamento para <data> às <hora> foi registrado e já aparece em Meus agendamentos.", com o link "Ver meus agendamentos".
- Janelas: "Editar agendamento" e "Reagendar serviço", com "Cancelar" na primeira etapa.
- `docs/agendamento/meus-agendamentos.md`, frase de UC26 FE01 no detalhe de "Em espera", "Em execução" e "Finalizado": "Este agendamento não pode mais ser alterado por aqui. Para mudar algo, fale com a empresa."
- `docs/padroes/componentes.md`, Formulário em etapas: "Na primeira etapa, 'Cancelar' fica no lugar de 'Voltar'." passa a "Na primeira etapa, 'Cancelar' fica no lugar de 'Voltar' quando o formulário está numa janela; numa página, como `/booking`, a primeira etapa não tem esse botão."
- Fora da tela, sem requisito: a janela que se abre sem veículo, o filtro por categoria, os "Serviços sob orçamento", o código promocional, o "Limpar" do resumo e a previsão em cada horário.

### L8. Adicional vinculado a mais de um principal

**Problema.** O UC06 FA02 diz que, ao remover um principal, "os adicionais a ele vinculados também são removidos". RN006 permite que um adicional esteja vinculado a vários principais, e o seed faz isso ("Cera de carnaúba" na "Lavagem simples" e na "Lavagem completa"). Com os dois principais marcados e a cera escolhida, tirar a "Lavagem simples" removeria a cera ao pé da letra, embora ela continue com um principal a que está vinculada.

**Opções:**

- [x] **1. Sai o adicional que não tem mais nenhum principal marcado a que esteja vinculado (recomendada).** Mantém o que RN006 permite e só tira o que ficaria sem principal; o adicional compartilhado aparece sob cada principal marcado a que está vinculado, com a mesma marcação.
- [ ] **2. Sai todo adicional vinculado ao principal tirado, como no texto do FA02.** Segue a letra do caso de uso, mas obriga a pessoa a escolher de novo um adicional que continuava válido.

**Texto proposto (opção 1):** `docs/agendamento/agendar-servico.md`, seção "Serviços": "Ao marcar um principal, os adicionais vinculados a ele aparecem logo abaixo ([RN006](../catalogo/RN006-tipos-de-servico.md), UC06 FA01). Ao desmarcar um principal, saem os adicionais que não estão vinculados a nenhum outro principal marcado (FA02); o adicional vinculado a mais de um principal aparece sob cada um deles, com a mesma marcação."

## Decisões técnicas

Nenhuma nova.

- Seguidas:
  - 0013: o porte vem da API, e o valor do porte também;
  - 0017: código em inglês, textos em português;
  - 0035 e 0052: testes antes do código nas funções de formatação e no cliente da API; os componentes e os dados de demonstração, à mão;
  - 0041: esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md`;
  - 0049: componentes do shadcn/ui sobre Base UI, sem o calendário do shadcn (L4);
  - 0051: `/booking` e `/appointments` continuam restritas ao cliente no `proxy.ts`;
  - 0053: datas, horários e o deslocamento do `scheduledAt` no fuso da empresa, lidos do `Intl`;
  - 0055: a tela com os dados de demonstração e o aviso, com o corpo nas leituras por `POST` (L6).

Escolhas locais, sem registro:

- `listStartTimes` em `src/shared/format/business-hours.ts`, junto de `formatBusinessHours`: transforma um dia de funcionamento na lista de horários da tela, com os testes em `tests/format/`. As funções de data novas em `src/shared/format/date.ts`, inclusive `toCompanyInstant`, que escreve o instante no formato da API.
- `useApiQuery` com o corpo opcional, para a prévia, em vez de um hook próprio, porque a #62 tem a mesma prévia no painel.
- O modo do assistente numa tabela de consulta (`codigo.md`), com as etapas, os rótulos e a chamada.
- Os grupos de escolha (veículo, data, horário e forma de pagamento) como botões de opção nativos, como o tipo do veículo da #58, e os serviços como caixas de seleção nativas, sem componente novo do shadcn.
- O "Resumo do pedido" lê a prévia a cada mudança da escolha (a anterior é cancelada), sem esperar a digitação parar, porque não há texto digitado.

## Riscos e dúvidas

- **Tamanho dos PRs.** Estimativa em `src/`, sem testes nem README, já pela proporção real da #58 (que passou das estimativas em 20 a 60%): PR 1 (base) cerca de 550 linhas, das quais 250 de dados fixos; PR 2 (`/booking`) cerca de 1.100; PR 3 (edição e reagendamento) cerca de 350. Mais cerca de 120 de testes e 300 de documentação no total. Os PRs 1 e 2 passam das ~400 de `pull-request.md`, como os PRs 2 e 3 da #58 (942 e 1.010). O PR 2 não se divide sem deixar a página fora da forma final (decisão 0055): o assistente precisa das quatro etapas para enviar.
- **Regra na demonstração (L6).** A prévia de demonstração distribui a duração pelos horários do `seed.sql`, como RN034, no código do navegador. É temporária, sai com a rota, e a regra que vale é a de `src/server/rules/scheduling.ts`. Se os horários da empresa forem mudados no banco, a prévia de demonstração continua pelos do `seed.sql`, enquanto a lista de horários segue `GET /api/public/company`; o aviso de demonstração cobre isso.
- **Horários na tela e na API.** `listStartTimes` repete, para orientar, a parte de RN013 que a API confere (`findAvailabilityError`); uma mudança de regra precisa mudar as duas, e a da API é a que vale (UC06 FE03).
- **Relógio e fuso.** "Hoje" e os horários já passados vêm do relógio do aparelho, lido no fuso da empresa; com o relógio errado, a tela pode oferecer um horário que a API recusa (RN015), e a falha aparece no topo do formulário.
- **Mais de 50 veículos ou serviços.** As listas do assistente são paginadas (10 veículos e 12 serviços por página, `api.md`); a escolha fica no formulário, então trocar de página não a perde.
- **Pontos para a sua aprovação**, além das lacunas:
  - os três PRs, ou PR 1 e PR 2 juntos (cerca de 1.650 linhas);
  - a conta de teste de cliente no banco local, criada por `POST /api/auth/register`;
  - como na #58: as chaves do banco local no `next start`, o cookie da sessão de teste no Lighthouse, o relógio e o fuso emulados no Chrome da verificação e as alterações temporárias dos dados de demonstração, sem commit.

## Fora do escopo

- As rotas `/api/me/bookable-services` e `/api/me/appointments` (fase 3) e a especificação OpenAPI delas, que muda com a rota.
- Partes do wireframe sem requisito: a janela que se abre sem veículo, o filtro por categoria nos serviços, os "Serviços sob orçamento", o código promocional, o "Limpar" do resumo, a previsão em cada horário e o seletor de horário em rolagem do celular.
- O esquema de validação do agendamento (decisão 0055), que entra com as rotas.
- O agendamento pelo funcionário e a edição e o reagendamento no painel (#62).
- Mudança no `seed-demo.sql`, no `seed.sql`, nas regras de `src/server/rules/` ou no `StepForm`.
- Testes automatizados de componentes (decisão 0052).
- Os documentos formais (#67).
