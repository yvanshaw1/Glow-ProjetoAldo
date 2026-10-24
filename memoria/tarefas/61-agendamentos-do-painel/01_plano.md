---
issue: 61
titulo: "Telas de agendamentos do painel com dados de demonstração: consulta, detalhe e status"
areas: [frontend]
tipo: funcionalidade
requisitos: [UC10, UC12, UC25, RF044, RF045, RF046, RF047, RF048, RF049, RF052, RF053, RF054, RF055, RF056, RN010, RN011, RN012, RN013, RN015, RN017, RN018, RN019, RN020, RN034, RN037, RNF001, RNF003, RNF004, RNF005, RNF008, RNF016]
status: concluido
aprovado_por: yvan
aprovado_em: 24/10/2026 - 10:48
---

# Plano: Telas de agendamentos do painel com dados de demonstração: consulta, detalhe e status

## Objetivo

Construir a página `/admin/appointments` (T5 de `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, decisão 0055), com os dados de demonstração de `GET /api/admin/appointments` e `GET /api/admin/appointments/:id`:

- a listagem nas visões Hoje, Futuros e Histórico, com filtro por status, busca por cliente ou veículo, ordenação, "Limpar filtros" e "Atualizar" (UC10, RF044 a RF049, RNF008);
- o detalhe do agendamento, com o total de cada forma de pagamento no "Finalizado" (UC12, RF053, RN037);
- as ações de status, cada uma só nos status em que vale: avançar (RF052, RN017), concluir com o resumo e a forma de pagamento (RF053, RN018), cancelar com confirmação (RF054, RN019) e reagendar (UC25 FA01, RF056, RN020).

Nenhuma rota, migration ou esquema de validação e nenhum import de `src/server/`. Nenhuma dependência nova.

## Base conferida

- Issue #61 aberta. Dependência cumprida: a #56 (PR #69, incorporado em 21/10/2026). `origin/main` em cf093c6 (#83), sem PR aberto; a ramificação desta sessão (`claude/heuristic-solomon-ad77fa`) está no mesmo commit, com a árvore limpa. As #46 e #50 (as rotas) estão abertas e sem código: `src/app/api/admin/appointments/` só tem READMEs. A #62 (novo agendamento e edição) depende desta e está aberta.
- Já existem, usados sem mudança: `DEMO_ROUTES`, `DemoRequest`, `demoPage` e `waitForDemo` (`src/lib/demo/`); `useApiQuery`, `usePaginatedList`, `PaginatedList` (`src/components/shared/`, ainda sem uso em tela), `ListPagination`, `ConfirmDialog`, `StatusBadge`, `DemoNotice`, `EmptyState`, `FormAlert`; `Tabs`, `Dialog`, `Alert`, `Button` (com `focusableWhenDisabled`), `Skeleton` e `Select` (`src/components/ui/`, o `Select` sem uso até aqui); `ADMIN_LIST_PAGE_SIZE` (20), `APPOINTMENT_STATUS_LABELS`, `PAYMENT_METHOD_LABELS`, `PERMISSION_LABELS`; `formatCurrency`, `formatDateTime`, `formatTime`, `formatCalendarDate`, `formatDuration`, `formatPercent` e `formatPlate`.
- O que o painel herda da #58 e da #59: o cartão, a janela de detalhe, o cancelamento e o reagendamento de `/appointments` (`src/components/portal/appointments/`) são o modelo; as etapas "Data e horário" e "Pagamento e resumo" do reagendamento estão em `booking-schedule-step.tsx`, `booking-payment-step.tsx` e `booking-summary.tsx`, e a #59 deixou escrito que elas vão para `src/components/shared/` "no segundo uso" (P2).
- Herdado da #60 e da #78 (notas de passagem em `side-session-notes/local_dcd0b9ea-…`, dados de outra sessão): o `DemoNotice` logo abaixo do `h1`; a leitura que acompanha o formulário não desativa os campos nem o foco (vale para a busca, os filtros e "Atualizar"); o `Button` com `focusableWhenDisabled` fica `aria-disabled` e focável; `matches(":disabled")` e não `.disabled` diz se um botão está desativado; toda resposta de demonstração espera 400 ms; os dados relativos a hoje no fuso da empresa, sem `Math.random`; os roteiros de verificação (`60-scripts-de-verificacao/`) servem de base.
- Wireframes `staffPages/appointmentManagment/` (`AppointmentManagmentMobile.pdf` e `Desktop.pdf`), usados só para o esqueleto: a faixa de visões (Hoje, Futuros, Histórico), a linha de ordenação, filtro de status, busca, "Limpar" e "Atualizar", os cartões em uma coluna no celular e em três no computador, com o horário, a data, a etiqueta de status, o cliente e o veículo. Sem requisito no wireframe, ficam de fora: o "Box", os avisos "Aguardando faturamento/finalização", "Tempo de execução excedido" e "Atrasado para iniciar o serviço", a marca "Multi-dia", "Ver mais" e "Ver serviços" (o cartão já mostra os serviços), os botões de ação no cartão (L3), "Editar" e "Novo agendamento" (#62) e o texto "Exibindo: Hoje + Agendamentos anteriores não finalizados" como rótulo próprio (a descrição da visão, em L5, o substitui). Os PDFs de `NewAppointmentStep1` a `Step5` são da #62.
- `rotas.md` descreve a listagem e o detalhe por alto ("lista paginada com cliente, veículo, serviços, total, status e previsão de conclusão"; "agendamento completo"), sem dizer o que cada visão traz, os valores de `sort`, os campos nem o nome do total de cada forma de pagamento (L1 e L2). O wireframe tem uma visão "Hoje" que inclui os dias anteriores ainda em aberto, que UC10 e RF044 não mencionam (L1).

## Como funciona

`/admin/appointments` é um componente de servidor que só compõe o título e os componentes de cliente; cada um busca o que exibe (`frontend.md`). Mobile first: a 360 × 800 primeiro, depois 1440 × 900, claro e escuro. O conteúdo vem de UC10, UC12 e UC25, o esqueleto do wireframe e o estilo de `design.md`. Os textos estão em L5.

### Página e visões

`src/app/(admin)/admin/appointments/page.tsx`, com o `metadata` "Agendamentos – Glow": o título (`h1`, `PERMISSION_LABELS.appointments`), o `DemoNotice` logo abaixo dele (a tela inteira é de demonstração) e o `AppointmentViews`.

`appointment-views.tsx` (cliente): abas "Hoje", "Futuros" e "Histórico" (`Tabs`), como `appointment-tabs.tsx` do cliente: cada aba monta a sua listagem quando escolhida, então lê a rota de novo, e o painel não toma parada de foco própria. Cada aba tem uma linha de descrição (L5). A busca, o filtro e a ordenação de uma visão começam do zero quando ela é escolhida de novo.

### Listagem

`appointment-list.tsx` (cliente): `usePaginatedList<AdminAppointmentSummary, { view, status, sort }>` com `GET /api/admin/appointments`, `pageSize` 20 (`ADMIN_LIST_PAGE_SIZE`) e `initialFilters` `{ view, status: "", sort: "time" }`, dentro do `PaginatedList` compartilhado:

- busca "Buscar por cliente ou veículo" (300 ms, até 100 caracteres, do componente); dois `Select`: "Filtrar por status" ("Todos os status" e os status da visão, L1) e "Ordenar por" ("Horário" e "Status"); "Limpar filtros" (do componente: tira a busca, o status e a ordem, e leva o foco à busca); "Atualizar" (`actions`), que lê a rota de novo (RF049);
- nada é desativado durante a leitura, e o foco fica onde está; a primeira leitura mostra lugares reservados; as seguintes, os itens anteriores em "Carregando" (`componentes.md`);
- sem itens: o estado vazio com a mensagem de L5, uma para quando há busca ou filtro (UC10 FE01) e uma por visão para quando não há;
- falha: o aviso com a mensagem da API e "Tentar novamente".

`appointment-card.tsx`: o cartão de `design.md` (`shadow-neu-md`), com a etiqueta de status (`StatusBadge`), o nome do cliente (`h2`), "<marca> <modelo> · <placa>", "Data", "Previsão de conclusão", "Serviços", "Total" e o botão "Ver detalhes". Uma coluna no celular, duas a partir de 768 px e três a partir de 1280 px (a barra do painel ocupa 256 px a partir de 1024 px).

### Detalhe e ações

`appointment-details-dialog.tsx` (cliente): a janela "Detalhes do agendamento", montada com a janela para ler `GET /api/admin/appointments/:id` a cada abertura, como a do cliente: a etiqueta, "Cliente", "Data e horário", "Previsão de conclusão", "Duração estimada", "Veículo" (marca e modelo, placa, cor, ano, tipo e porte), "Serviços" com o valor, "Forma de pagamento", "Subtotal", "Acréscimo de <percentual>" ou "Desconto de <percentual>" só quando há percentual, e "Total". No "Finalizado", a lista "Total por forma de pagamento", com as quatro formas e o total de cada uma, como a rota as devolve (L2); nunca somada pela tela. Enquanto carrega, o lugar reservado; na falha, o aviso com "Tentar novamente".

As ações ficam só no rodapé do detalhe (L3), conforme o status:

| Status | Ações deste plano |
|---|---|
| Agendado | "Avançar para Em espera", "Cancelar agendamento" |
| Em espera | "Avançar para Em execução", "Cancelar agendamento" |
| Em execução | "Avançar para Finalizado" |
| Finalizado | "Concluir" |
| Concluído | "Reagendar" |
| Cancelado, Reagendado | nenhuma |

A tela só orienta; quem decide é a API (RS008). "Editar" (UC10 FA07, qualquer status) entra com a #62.

- **Avançar** (`advance-button.tsx`): `POST /api/admin/appointments/:id/advance`, sem confirmação (UC12 passo 2); "Avançando…" com `aria-disabled` e o foco no botão; a falha, como o `NOT_IMPLEMENTED` da demonstração, aparece no topo da janela, com o foco.
- **Cancelar** (`ConfirmDialog`): título "Cancelar este agendamento?", texto "O agendamento passa a Cancelado e vai para o histórico. Esta ação não pode ser desfeita.", botões "Voltar" e "Cancelar agendamento" ("Cancelando…"), na cor de erro; a falha aparece dentro da confirmação (UC12 FA02).
- **Concluir** (`complete-appointment-dialog.tsx`): janela sobre o detalhe, que lê o agendamento ao abrir e mostra o resumo do atendimento (cliente, veículo, serviços com os valores, subtotal) e as quatro formas de pagamento como opções, cada uma com o seu total, com a escolhida no agendamento marcada; o "Total" mostrado é o da opção marcada, vindo da rota (UC12 FA01, RF053, RN018). "Cancelar" e "Confirmar conclusão" ("Concluindo…"); o envio é `POST /api/admin/appointments/:id/complete` com `paymentMethod`, e a falha aparece no topo da janela (L4).
- **Reagendar** (UC25 FA01, P2): janela sobre o detalhe, com só "Data e horário" e "Pagamento e resumo" vazias, o veículo e os serviços do original fixos e os valores da prévia `POST /api/admin/appointments/preview` (RN020); "Confirmar reagendamento" ("Reagendando…") envia `POST /api/admin/appointments/:id/reschedule` com `paymentMethod` e `scheduledAt`. Valem as regras da #59 e da #78: o foco inicial em "Cancelar", Esc e "Cancelar" voltam ao detalhe, a janela não fecha durante o envio, e a confirmação espera a prévia (UC25 FE02 e RN005 pela resposta dela).
- **409 `INVALID_STATUS`** (UC12 FE01): o aviso aparece, e o detalhe lê o agendamento de novo, então a etiqueta e as ações passam a ser as do status atual. Sucesso: as janelas fecham e a listagem é lida de novo.

### Dados de demonstração (decisão 0055)

`src/lib/demo/admin-appointments.ts` (módulo novo; `appointments.ts` já tem 709 linhas e a #62 acrescenta ali as buscas do assistente) responde as três leituras. As quatro gravações da tela (`advance`, `complete`, `cancel` e `reschedule`) entram em `routes.ts` sem `load` e respondem `NOT_IMPLEMENTED`.

- **50 agendamentos fixos**, relativos a hoje no fuso da empresa (dia de calendário, sem `Math.random`), com os 12 clientes, os 14 veículos, os serviços e os preços por porte do `seed-demo.sql`; as taxas do `seed.sql` são todas zero (P3), então o total é o subtotal. A previsão de conclusão pelo funcionamento do `seed.sql` (RN034), com `calculateDemoEnd` de `appointments.ts`, que passa a ser exportado, como os serviços e os preços por porte.
- **Hoje (6):** os quatro em aberto da agenda do dashboard (Bruno Lima "Finalizado"; Carla Mendes "Em execução"; Diego Ferreira "Em espera"; Eduarda Santos "Agendado", mesmos ids, veículos, serviços e totais) e dois de dias anteriores ainda em aberto (Gabriela Rocha "Agendado", no dia útil anterior; Isabela Melo "Em espera", dois dias úteis antes). Os de hoje ficam no dia da consulta, mesmo num domingo.
- **Futuros (8):** "Agendado", nos dias úteis dos 14 dias seguintes, nos horários do `seed.sql`.
- **Histórico (36):** 26 "Concluído", 7 "Cancelado" e 3 "Reagendado", dos últimos 60 dias, com os dois de hoje da agenda do dashboard (Ana Souza "Concluído" e Felipe Araújo "Cancelado"). A primeira página tem 20 e a segunda, 16, para a paginação aparecer.
- **Listagem:** `GET /api/admin/appointments` filtra pela visão (L1), aplica `status`, `sort` (L2) e `search` (cliente, placa, marca e modelo) e entrega a página por `demoPage`; `view` ausente ou inválido responde `ApiError` 400 `VALIDATION_ERROR`. **Detalhe:** o agendamento pelo `id`, com `paymentOptions` no "Finalizado" e `null` nos outros; `id` desconhecido, 404 `NOT_FOUND`. **Prévia:** `POST /api/admin/appointments/preview`, calculada sobre os mesmos dados (preço pelo porte do veículo, taxas do `seed.sql`, duração e previsão), como a do cliente; a #62 a amplia.
- **Entradas em `routes.ts`:** `GET /api/admin/appointments`, `GET /api/admin/appointments/:id`, `POST /api/admin/appointments/preview` (com `load`) e `POST /api/admin/appointments/:id/advance`, `/complete`, `/cancel` e `/reschedule` (sem `load`).

### Tipos e constantes

- `src/shared/api/appointments.ts`: `AdminAppointmentSummary` (os campos de L2, os mesmos da agenda do dashboard), `PaymentOption`, `AdminAppointment` e os tipos da visão e da ordem. `DashboardAgendaItem` não muda (a #51 pode unificá-los).
- `src/shared/constants/appointment-views.ts`: `APPOINTMENT_VIEWS` (`today`, `future`, `history`) e os rótulos "Hoje", "Futuros" e "Histórico"; os status de cada visão (L1); `APPOINTMENT_SORTS` (`time`, `status`) e os rótulos "Horário" e "Status".

## Ordem da construção

Em quatro PRs, um por parte da tela, cada um com a verificação local e a etapa 03 próprias (P1):

**PR 1, base** (`feat/61-appointments-demo`, "Refs #61"):

1. Ramificação da `origin/main`, sem vínculo, e `npx -y npm@11.21.1 ci`.
2. Tipos, constantes, `src/lib/demo/admin-appointments.ts`, as exportações de `appointments.ts` e as sete entradas de `routes.ts`.
3. Documentação: L1 e L2 em `rotas.md`.
4. Verificação local das respostas (a página ainda não existe), por uma chamada de `apiRequest` num teste temporário do Vitest, apagado antes do commit; etapa 03 do PR 1 (`02_relatorio.md` parcial).

**PR 2, listagem** (`feat/61-appointments-list`, "Refs #61"), depois do PR 1:

5. Página, `AppointmentViews`, `AppointmentList` e `AppointmentCard`, com os estados de carregamento, vazio e falha.
6. Documentação: o módulo novo `docs/agendamento/agendamentos-do-painel.md` (visões, filtros, cartão e estados de L5) e a linha em `agendamento/CONTEXT.md`.
7. Verificação local; etapa 03 do PR 2.

**PR 3, detalhe e ações** (`feat/61-appointment-actions`, "Refs #61"), depois do PR 2:

8. `AppointmentDetailsDialog`, `AdvanceButton`, o cancelamento e `CompleteAppointmentDialog`.
9. Documentação: o detalhe, as ações por status, a conclusão e o cancelamento no módulo da tela.
10. Verificação local; etapa 03 do PR 3.

**PR 4, reagendamento** (`feat/61-appointment-reschedule`, "Closes #61"), depois do PR 3:

11. As três etapas de data, pagamento e resumo vão para `src/components/shared/` (`git mv`, com o tipo dos valores do formulário), o assistente do cliente passa a importá-las de lá, e o `RescheduleAppointmentDialog` do painel as usa (P2).
12. Documentação: o reagendamento no módulo da tela e as descrições dos READMEs de `shared/` e `portal/appointments/`.
13. Verificação local, inclusive `/appointments` e `/booking` do cliente, que mudam de importação; etapa 03: `02_relatorio.md` completo e o plano em `concluido`.

## Critérios de aceitação e verificação

Os passos de tela são manuais (decisão 0052). Os dados são relativos a hoje, então a verificação confere os números fixos da demonstração (6, 8 e 36 itens e as quantidades por status abaixo), que não dependem da data, e a coerência entre as partes da tela.

Quantidades da demonstração: Hoje 6 (Agendado 2, Em espera 2, Em execução 1, Finalizado 1); Futuros 8 (Agendado 8); Histórico 36 (Concluído 26, Cancelado 7, Reagendado 3).

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado a visão "Histórico" e o filtro "Cancelado", quando os aplico, então só os cancelados aparecem; "Limpar filtros" volta à visão completa (UC10 FA02 e FA04, RF046, RF048) | Local, com o admin local: em "Histórico", "1–20 de 36"; o filtro "Cancelado" mostra "1–7 de 7", todos com a etiqueta "Cancelado"; "Limpar filtros" volta a "1–20 de 36", o botão some e o foco vai à busca. Repetir com a busca preenchida: "Limpar filtros" tira a busca e o filtro numa ação só |
| Dado um agendamento "Finalizado", quando abro "Concluir", então vejo o resumo e o total de cada forma de pagamento (RF053) | Local: em "Hoje", "Ver detalhes" do de Bruno Lima mostra "Total por forma de pagamento" com as quatro formas; "Concluir" abre a janela com o resumo (cliente, veículo, serviços, subtotal) e as quatro opções com o total de cada uma, a do agendamento marcada. Com a alteração temporária das taxas (P3), os totais diferem, o "Total" acompanha a opção marcada e aparece "Acréscimo de …" ou "Desconto de …" |
| Dado as três visões, quando alterno entre elas, então cada uma traz os agendamentos de L1 (UC10 passos 2 a 4, RF044) | Local: Hoje 6, Futuros 8, Histórico 36; "Concluído", "Cancelado" e "Reagendado" só no Histórico; os de dias anteriores em aberto (Gabriela Rocha e Isabela Melo) em Hoje, com a data deles no cartão; a soma por status de cada visão é o total dela; cada aba lê a rota de novo ao ser escolhida |
| Dado a ordenação por horário ou por status, quando a escolho, então a listagem se reordena (UC10 FA01, RF045) | Local: "Horário" no padrão, do mais próximo ao mais distante em Hoje e Futuros e do mais recente ao mais antigo no Histórico; "Status" agrupa pela ordem de RN017 e, dentro do grupo, por horário; a página volta à primeira |
| Dado um nome de cliente ou de veículo, quando busco, então só os agendamentos dele aparecem; sem resultado, a mensagem (UC10 FA03 e FE01, RF047) | Local: "Souza" (Ana Souza), "GLW2B02" (placa de Bruno Lima), "Hilux" e "polo" (sem distinção de maiúsculas) dão só os dele, a partir da página 1; "zzz" mostra "Nenhum agendamento encontrado" com a descrição de L5; a busca vale 300 ms depois da última tecla |
| Dado "Atualizar", quando o aciono, então a listagem lê a rota de novo (UC10 FA05, RF049) | Local: o clique repete a leitura (os 400 ms, `aria-busy`, itens anteriores em "Carregando"), o botão e o foco continuam, nada fica desativado (`matches(":disabled")` falso em todos os controles) |
| Dado mais de 20 agendamentos na visão, quando abro a página 2, então vejo os que sobram (RNF008) | Local: "21–36 de 36" na página 2 do Histórico, com os botões de `ListPagination`; busca e filtro voltam à página 1 |
| Dado cada status, quando abro o detalhe, então só as ações do status aparecem (RF052 a RF056, RN017 a RN020) | Local, um agendamento de cada um dos sete status: as ações da tabela de "Detalhe e ações", e nenhuma além dela; "Total por forma de pagamento" só no "Finalizado" |
| Dado "Avançar", quando o aciono, então a demonstração recusa e nada muda (RF052, decisão 0055) | Local: "Avançando…" com `aria-disabled` e o foco no botão; no topo da janela, com o foco, "Esta ação ainda não está disponível nesta versão de demonstração."; a etiqueta e a listagem iguais; nenhuma chamada a `/api/admin/*` na lista de requisições |
| Dado "Cancelar agendamento", quando o aciono, então a confirmação pede a decisão e a recusa aparece dentro dela (UC12 FA02, RF054, RN019) | Local: só no "Agendado" e no "Em espera"; título, texto e botões de L5; o foco começa em "Voltar" e volta ao botão que abriu; a confirmação mostra o `NOT_IMPLEMENTED` dentro dela e não fecha |
| Dado "Reagendar" num "Concluído" do histórico, quando o confirmo, então a demonstração recusa (UC25 FA01, RF056, RN020) | Local: só no "Concluído"; as duas etapas, com o calendário e a grade de horários, a forma de pagamento e o resumo com os valores da prévia; "Confirmar reagendamento" espera a prévia, e o `NOT_IMPLEMENTED` aparece no topo do formulário, com a janela aberta; Esc e "Cancelar" voltam ao detalhe com o foco em "Reagendar" |
| Dado o 409 `INVALID_STATUS` ou o sucesso de uma ação, quando acontece, então o detalhe segue o status atual ou as janelas fecham e a lista é lida de novo (UC12 FE01) | Local, com alteração temporária de `src/lib/demo/routes.ts`, sem commit, desfeita e conferida por `git diff`: uma gravação que responde 409 mantém o aviso e atualiza a etiqueta e as ações; outra que responde 200 fecha as janelas e relê a lista |
| Dado a etiqueta de status, quando aparece no cartão e no detalhe, então o nome está escrito, com contraste de 4,5:1 nos dois temas (RN017, RNF005) | Local: os sete nomes escritos; o Lighthouse de acessibilidade sem auditoria reprovada |
| Dado o carregamento, a lista vazia e a falha, quando ocorrem, então a tela mostra o lugar reservado, a mensagem de L5 ou o aviso com "Tentar novamente" (RNF004) | Local: os 400 ms da demonstração; vazio pela busca sem resultado e, por alteração temporária de `admin-appointments.ts`, pela visão sem itens; a falha da lista e a do detalhe pela mesma alteração, "Tentar novamente" lê de novo e nenhuma leitura se repete sozinha |

Critérios comuns às telas de demonstração (issue):

| Critério | Verificação |
|---|---|
| Esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md` (decisão 0041) | Revisão: o que fica de fora do wireframe está em "Base conferida" e em "Fora do escopo" |
| `usePaginatedList` e `useApiQuery` com o endereço de `rotas.md`; tipos em `src/shared/api/appointments.ts`; dados em `src/lib/demo/`, com os nomes do `seed-demo.sql` | Revisão do diff; as gravações são as únicas chamadas fora dos dois hooks (ações do clique, nunca repetidas, `api.md`) |
| O aviso de demonstração na tela; o envio de qualquer formulário mostra o `NOT_IMPLEMENTED`, e nada é gravado | O aviso abaixo do `h1`, antes de qualquer dado; "Avançar", "Cancelar agendamento", "Concluir" e "Reagendar" mostram o aviso da API, e a lista de requisições não tem chamada a `/api/admin/*` |
| A 360 × 800 primeiro e a 1440 × 900, claro e escuro, pelo teclado, sem transbordar, Lighthouse de acessibilidade sem auditoria reprovada | Local, no Chrome sem interface: a página, o detalhe e cada janela nas duas larguras e nos dois temas, `scrollWidth` igual a `innerWidth`; pelo teclado, as abas, a busca, os dois `Select`, "Limpar filtros", "Atualizar", o cartão, as janelas (o foco fica nelas e volta ao botão que as abriu); Lighthouse 13.5.0 de acessibilidade com o cookie da sessão de teste, celular e computador, claro e escuro |
| Nenhuma rota, migration ou esquema de validação novo, e nenhum import de `src/server/` | `git diff --stat` sem `src/app/api/`, `supabase/` nem `src/shared/validation/`; `grep` por `@/server` nos arquivos novos |

### Como a verificação local é feita

Como na #56 a #60 e na #78 (notas das tarefas e da passagem), em cada PR:

- **Banco local.** Docker Desktop aberto, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`; `npx supabase start` no primeiro plano (com `timeout`) e `npx supabase db reset`, só com o `seed.sql`. Nunca `--linked` nem `--db-url` (decisão 0043). A saída de `supabase start` imprime chaves locais: mascarada antes de ler.
- **Conta de teste.** Um admin local criado por `supabase/scripts/create-admin.mjs`, com e-mail fictício `@example.com` e a senha gerada por um roteiro do scratchpad, guardadas num arquivo dele e nunca exibidas; só existe no banco local.
- **Aplicação.** `npx next build` e `npx next start -p 3060`, por `run_in_background`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las; encerrado pelo PID de `netstat -ano`, com `taskkill //PID <pid> //F //T`.
- **Telas**, num Chrome sem interface controlado pelo `puppeteer-core` do cache do Lighthouse 13.5.0 (o painel do app oculto trava o foco do Base UI; o tema padrão da máquina é o escuro, e o claro vem da emulação de `prefers-color-scheme`): login pela página, as duas larguras, os dois temas, o teclado, o foco (`describeFocus`, `readFocus`) e a lista de requisições. Os roteiros de `60-scripts-de-verificacao/` são copiados para o scratchpad e adaptados (`browser.mjs`, `verify-screen.mjs`, `verify-states.mjs`, `patch-*.mjs`, `make-cookie.mjs`, `lh-*.mjs`).
- **Alterações temporárias**, sem commit, por `globalThis.__demo` e por trechos de `src/lib/demo/admin-appointments.ts` e de `routes.ts` (falha da lista e do detalhe, visão vazia, taxas diferentes de zero, uma gravação que responde 409 e outra que responde 200), desfeitas com `git checkout -- src/lib` e conferidas com `git status`.
- **Lighthouse.** `npx -y lighthouse@13.5.0` com `--only-categories=accessibility,performance`, no celular e no computador, claro e escuro (`--blink-settings=preferredColorScheme=1` dá o claro), com o cookie da sessão de teste por `--extra-headers` num arquivo do scratchpad apagado no fim; as janelas e os estados, no modo `snapshot`. O LCP e o CLS do celular ficam no PR.
- **Registro.** A saída do `next start` acumulada (`>>`) e conferida sem cookie, token, chave nem e-mail de teste.
- **Verificações automáticas.** `npm run check` sem erros nem avisos e `npx next build` em cada PR.
- **Encerramento.** `next start` encerrado, `npx supabase stop`, alteração temporária desfeita (`git status` só com os arquivos do plano).
- Sem dependência nova, não há conferência em contêiner nesta tarefa.

## Arquivos

| Arquivo | Ação | PR |
|---|---|---|
| `src/shared/api/appointments.ts` | alterar: `AdminAppointmentSummary`, `PaymentOption`, `AdminAppointment`, `AdminAppointmentView`, `AdminAppointmentSort` | 1 |
| `src/shared/constants/appointment-views.ts` | criar | 1 |
| `src/lib/demo/admin-appointments.ts` | criar | 1 |
| `src/lib/demo/appointments.ts` | alterar: exportar o que o módulo do painel reaproveita | 1 |
| `src/lib/demo/routes.ts` | alterar: as sete entradas | 1 |
| `docs/agendamento/rotas.md` | alterar (L1, L2) | 1 |
| `src/app/(admin)/admin/appointments/page.tsx` | criar | 2 |
| `src/components/admin/appointments/appointment-views.tsx`, `appointment-list.tsx`, `appointment-card.tsx` | criar | 2 |
| `docs/agendamento/agendamentos-do-painel.md` | criar (L1, L3, L4, L5) e acrescentar nos PRs 3 e 4 | 2, 3, 4 |
| `docs/agendamento/CONTEXT.md` | alterar: a linha do módulo novo | 2 |
| `src/components/admin/appointments/appointment-details-dialog.tsx`, `advance-button.tsx`, `complete-appointment-dialog.tsx` | criar | 3 |
| `src/components/shared/booking-schedule-step.tsx`, `booking-payment-step.tsx`, `booking-summary.tsx`, `booking-form-values.ts` | mover de `portal/appointments/` e criar o tipo | 4 |
| `src/components/portal/appointments/booking-wizard.tsx`, `booking-vehicle-step.tsx`, `booking-services-step.tsx` | alterar: as importações e o tipo | 4 |
| `src/components/admin/appointments/reschedule-appointment-dialog.tsx` | criar | 4 |
| `src/components/shared/README.md`, `src/components/portal/appointments/README.md` | alterar: o que passa a morar em cada pasta | 4 |
| `memoria/tarefas/61-agendamentos-do-painel/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` | todos |

Os README de `src/components/admin/appointments/`, de `src/app/(admin)/admin/appointments/`, de `src/shared/api/`, de `src/shared/constants/` e de `src/lib/demo/` já descrevem o que entra e não mudam (confirmar na construção; o de `src/lib/demo/` cita `clients.ts` e `appointments.ts` só como exemplos).

Estimativa em `src/`, sem testes nem README: PR 1 cerca de 430 linhas (55 de tipos, 25 de constantes, 290 de dados, 40 de entradas e 20 de exportações); PR 2 cerca de 330 (30 de página, 80 de abas, 150 de listagem, 70 de cartão); PR 3 cerca de 440 (200 do detalhe, 90 de "Avançar" e do cancelamento, 150 da conclusão); PR 4 cerca de 200 linhas novas ou alteradas, mais a mudança de lugar de três arquivos (cerca de 690 linhas, `git mv`). Os PRs 1 e 3 ficam um pouco acima das ~400 de `pull-request.md`, como o PR 2 da #58 (484).

### Em comum com outras tarefas

- **#62** (novo agendamento e edição no painel): usa os mesmos `src/shared/api/appointments.ts`, `src/lib/demo/appointments.ts` e `src/lib/demo/admin-appointments.ts`; acrescenta os seus tipos, as buscas do assistente e as gravações `POST` e `PATCH`, amplia a prévia criada aqui e põe "Editar" ao lado das ações do detalhe. As etapas de data, pagamento e resumo que passam a `src/components/shared/` no PR 4 servem a ela.
- **#46** (consulta no painel): tira as entradas das duas leituras de `routes.ts` e cria o esquema dos parâmetros; segue L1 e L2 de `rotas.md`.
- **#50** (status e edição): tira as quatro gravações e a prévia de `routes.ts`; `calculos.md` seção 2 já tem as transições.
- **#51** (dashboard): `DashboardAgendaItem` e `AdminAppointmentSummary` têm os mesmos campos; a unificação fica para quando a rota existir.
- **#58 e #59** (cliente): o PR 4 só troca as importações do assistente do cliente; o `/appointments` e o `/booking` voltam a ser conferidos.
- **#62 a #65**: uma linha por rota em `src/lib/demo/routes.ts` (conflito simples).
- **#67** (documentos formais): recebe a lista do relatório desta tarefa (Arquitetura de Software, Apêndice A: os campos da listagem e do detalhe).

## Testes previstos

Nenhuma função pura com regra de negócio entra em `src/shared/` nesta tarefa: `appointment-views.ts` só tem tabelas de constantes, a demonstração e os componentes são conferidos à mão, com os valores esperados da tabela acima (decisão 0052), e a regra que escolhe os agendamentos de cada visão é da #46, com os testes dela. `npm run check` (formatação, tipos, lint e os testes existentes) deve passar em cada PR.

## Documentação

- `docs/agendamento/agendamentos-do-painel.md`, novo, "Conteúdo da página de agendamentos do painel" (`titulo`, `assunto: agendamento`, `origem: issue #61`, `relacionados: [UC10, UC12, UC25, RF044 a RF049, RF052 a RF056, RN017, RN018, RN019, RN020, RN037]`): a página, as visões (L1), os filtros, o cartão, o detalhe, as ações por status (L3), a conclusão (L4), o cancelamento, o reagendamento e os textos (L5).
- `docs/agendamento/CONTEXT.md`: a linha do módulo novo. `docs/agendamento/rotas.md`: L1 e L2.
- Documentos formais a atualizar no relatório, pela #67: Arquitetura de Software, Apêndice A (os campos de `GET /api/admin/appointments` e de `/:id`). Nenhuma `RN` muda, então a Análise do Sistema não precisa de ajuste.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. O que cada visão mostra

**Problema.** RF044 e UC10 dizem "agendamentos do dia", "agendamentos futuros" e "histórico", e `rotas.md` só traz `view*`: `today`, `future` ou `history`. Nenhum módulo diz por qual critério um agendamento é de uma visão. O que existe: UC10 FA06 e UC25 FA01 põem o "Concluído" "no histórico"; a #58 define as abas do cliente por status ("Atuais": Agendado, Em espera, Em execução e Finalizado; "Histórico": Concluído, Cancelado e Reagendado); a agenda do dashboard (RF043) traz todos os status marcados para hoje; o wireframe mostra "Hoje + agendamentos anteriores não finalizados". Sem regra, um agendamento em aberto de ontem, que ninguém avançou, não aparece em nenhuma visão e não pode mais ser avançado nem cancelado.

**Opções:**

- [x] **1. Pelo status, como as abas do cliente, e o "Hoje" inclui os dias anteriores em aberto (recomendada).** Hoje: Agendado, Em espera, Em execução e Finalizado marcados para hoje ou para dias anteriores; Futuros: os mesmos status, marcados para depois de hoje; Histórico: Concluído, Cancelado e Reagendado, de qualquer data. Cada agendamento está em uma visão só, nenhum fica sem lugar, e o "Concluído" fica no histórico, como UC10 FA06 e UC25 FA01 dizem. Em troca, o "Concluído" de hoje sai de "Hoje" para o "Histórico", diferente da agenda do dashboard, que é uma leitura do dia.
- [ ] **2. Pela data, só do dia.** Hoje: tudo o que foi marcado para hoje, de qualquer status; Futuros: depois de hoje; Histórico: antes de hoje. Fiel à letra de RF044 e igual à agenda do dashboard, mas o agendamento em aberto de ontem vai para o "Histórico" com o status "Agendado", e o "Concluído" de hoje não está "no histórico".

**Texto proposto (opção 1):**

- `docs/agendamento/rotas.md`, `GET /api/admin/appointments`, "Entrada": "`view*`: `today`, `future` ou `history`; `status, search, sort, page, pageSize`." passa a "`view*`: `today` (Agendado, Em espera, Em execução e Finalizado, marcados para o dia corrente, no fuso da empresa, ou para dias anteriores), `future` (os mesmos status, marcados para depois do dia corrente) ou `history` (Concluído, Cancelado e Reagendado, de qualquer data); `status` (um dos status da visão); `search`; `sort`; `page`, `pageSize`."
- `docs/agendamento/agendamentos-do-painel.md`, seção "Visões": as três, com as descrições "Agendamentos de hoje e de dias anteriores que ainda não foram concluídos nem cancelados.", "Agendamentos marcados para os próximos dias." e "Agendamentos concluídos, cancelados e reagendados.", e a frase "A agenda do dashboard (RF043) traz todos os status marcados para hoje; a visão 'Hoje' é a fila de trabalho".

### L2. Campos, busca e ordenação da listagem e do detalhe

**Problema.** `rotas.md` descreve a resposta da listagem como "cliente, veículo, serviços, total, status e previsão de conclusão" e a do detalhe como "agendamento completo", sem os nomes dos campos (`src/shared/api/appointments.ts` precisa deles), sem dizer em que campos a busca procura, quais são os valores de `sort` (RF045: "horário" e "status") nem como a rota devolve "o total para cada forma de pagamento" do "Finalizado" (UC12 FA01, RF053). As respostas das quatro gravações também não têm formato.

**Opções:**

- [x] **1. Os campos do cliente e da agenda do dashboard, mais `clientName` e `paymentOptions` (recomendada).** A listagem repete a agenda do dashboard (`clientName`, `vehicle` com `plate`, `brand` e `model`, `services` com `id` e `name`, `total`, `status`, `scheduledAt`, `estimatedEndAt`); o detalhe repete o do cliente (`GET /api/me/appointments/:id`), com `clientName` e, só no "Finalizado", `paymentOptions`, a lista das quatro formas com `paymentMethod`, `feePercent` e `total`, na ordem de RN011; as gravações devolvem o formato do detalhe. A busca procura no nome do cliente, na placa, na marca e no modelo (RF047); `sort` é `time` ou `status`. A #46 e a #50 constroem as rotas por esse texto, e a tela não calcula nenhum total.
- [ ] **2. Só o que o texto atual diz, e os campos ficam no código.** Menos edição em `rotas.md`, mas a #46 e a #50 podem escolher outros nomes e desfazer a tela.

**Texto proposto (opção 1):** `docs/agendamento/rotas.md`:

- `GET /api/admin/appointments`: "`search`" e "`sort`" definidos na linha de "Entrada" (junto com L1): "`search` (parte do nome do cliente, da placa, da marca ou do modelo do veículo, sem distinção de maiúsculas); `sort`: `time` (padrão: pela data marcada, da mais próxima à mais distante e, no `history`, da mais recente à mais antiga) ou `status` (na ordem de RN017 e, dentro de cada status, por `time`)". "Resposta: **200** lista paginada com cliente, veículo, serviços, total, status e previsão de conclusão." passa a "Resposta: **200** lista paginada de `id`, `status`, `scheduledAt`, `estimatedEndAt`, `clientName`, `vehicle` (`plate`, `brand` e `model`), `services` (`id` e `name`) e `total`, com os dados copiados no agendamento (RN037)."
- `GET /api/admin/appointments/:id`: "Resposta: **200** agendamento completo; no status `awaiting_payment`, inclui o total para cada forma de pagamento, usado no resumo de conclusão." passa a "Resposta: **200** `id`, `status`, `scheduledAt`, `estimatedEndAt`, `estimatedDurationMinutes`, `clientName`, `paymentMethod`, `subtotal`, `feePercent`, `total`, `vehicle` (`id`, `plate`, `type`, `size`, `brand`, `model`, `color` e `year`), `services` (`id`, `name`, `type`, `price` e `durationMinutes`) e `updatedAt`, com os dados copiados no agendamento (RN037); no status `awaiting_payment`, também `paymentOptions`: `paymentMethod`, `feePercent` e `total` de cada uma das quatro formas, na ordem de RN011, usado no resumo de conclusão; nos outros status, `paymentOptions` é `null`."
- `advance`, `complete`, `cancel` e `reschedule`: "agendamento com o novo status" (e, no reagendamento, "novo agendamento") passa a "no formato do detalhe".

### L3. Onde ficam as ações de status e como se chamam

**Problema.** UC12 diz "o funcionário aciona a mudança para o próximo status" e UC10 FA06 e FA07 falam em "acionar a opção", sem dizer onde fica o botão nem como ele se chama. O wireframe tem botões no cartão ("Iniciar serviço", "Serviço concluído", "Revisar e concluir", "Editar", "Cancelar"), com nomes de outro sistema (Glow não tem box nem "serviço concluído" como status). `meus-agendamentos.md` pôs as ações do cliente só no detalhe, e a #58 deixou "o 'Cancelar' no próprio cartão" fora da tela.

**Opções:**

- [x] **1. Só no detalhe, com o nome do status que a ação alcança (recomendada).** O cartão tem só "Ver detalhes", como o do cliente; as ações são as da tabela de "Detalhe e ações", e "Avançar para Em espera", "Avançar para Em execução" e "Avançar para Finalizado" repetem os nomes de RN017, sem criar um vocabulário novo. Um clique a mais para avançar, e o cartão fica enxuto a 360 px.
- [ ] **2. A ação principal no cartão e todas no detalhe, como o wireframe.** "Avançar para …", "Concluir" ou "Reagendar" no cartão, "Cancelar agendamento" só no detalhe. Menos um clique no dia a dia, mas cada cartão leva uma janela de ação a mais, o cartão a 360 px fica com dois botões, e as ações passam a ter dois lugares para verificar.

**Texto proposto (opção 1):** `docs/agendamento/agendamentos-do-painel.md`, seção "Ações por status": a tabela de "Detalhe e ações" deste plano, a frase "Só no detalhe. A tela só orienta; quem decide é a API (RS008)." e, em "Fora da tela, sem requisito", "o 'Box', os avisos de atraso, a marca 'Multi-dia', 'Ver mais' e 'Ver serviços', os botões de ação no cartão e 'Editar' e 'Novo agendamento' (UC11 e UC26, #62)".

### L4. A janela "Concluir"

**Problema.** UC12 FA01 define o fluxo (resumo, confirmar ou trocar a forma de pagamento, receber presencialmente e confirmar) e RF053 diz "resumo do atendimento realizado" e "recálculo do valor total", mas não há tela nem texto: como se escolhe a forma, onde aparece o total de cada uma, o que a pessoa confirma. O recálculo é da API (RN010 e RN012), e a tela só pode mostrar o que a rota devolve.

**Opções:**

- [x] **1. As quatro formas como opções, cada uma com o seu total, vindo da rota (recomendada).** Título "Concluir agendamento", o resumo, as opções "Crédito", "Débito", "Pix" e "Dinheiro" (as mesmas do assistente de agendamento), cada uma com o total de `paymentOptions`; o "Total" é o da opção marcada, com "Acréscimo de …" ou "Desconto de …" quando há percentual. Mostra o total de cada forma, como a issue pede, antes de confirmar, e não calcula nada.
- [ ] **2. Uma lista de seleção e, abaixo, o total da forma escolhida.** Menos largura, mas o total de cada forma só aparece uma de cada vez, e a issue pede "o total de cada forma de pagamento".

**Texto proposto (opção 1):** `docs/agendamento/agendamentos-do-painel.md`, seção "Concluir (UC12 FA01, RF053)": "Janela sobre o detalhe de um agendamento 'Finalizado'. Título 'Concluir agendamento' e o texto 'Confira o resumo do atendimento e a forma de pagamento usada pelo cliente. Receba o pagamento na empresa antes de confirmar.' O resumo traz o cliente, o veículo, os serviços com o valor de cada um e o subtotal. A 'Forma de pagamento' mostra 'Crédito', 'Débito', 'Pix' e 'Dinheiro', cada uma com o total que a rota devolve para ela, e começa na forma escolhida no agendamento; o 'Total' abaixo é o da forma marcada, com 'Acréscimo de <percentual>' ou 'Desconto de <percentual>' quando ela tem percentual (RN012). Botões 'Cancelar' e 'Confirmar conclusão' ('Concluindo…'). Fechada a janela por sucesso, o detalhe fecha e a listagem é lida de novo; a falha, como o 409 `INVALID_STATUS`, aparece no topo da janela."

### L5. Conteúdo e textos da página

**Problema.** UC10, UC12 e UC25 dizem o que a tela faz, mas nenhum módulo define o título, as descrições das visões, os rótulos dos filtros, o cartão, o detalhe, as mensagens de vazio e as de falha. Os textos do cliente estão em `meus-agendamentos.md`, e os do painel não têm módulo.

**Opções:**

- [x] **1. Os textos abaixo, no módulo novo `agendamentos-do-painel.md` (recomendada).** Os do cancelamento e do detalhe repetem os do cliente; os demais, propostos aqui.
- [ ] **2. Só o que UC10, UC12 e UC25 dizem; os textos novos ficam só no código.** Menos documento, mas a próxima sessão e a #46 e a #50 não os acham.

**Texto proposto (opção 1):** `docs/agendamento/agendamentos-do-painel.md`, com a frase de abertura "A página usa os dados de demonstração de `src/lib/demo/admin-appointments.ts` até as rotas existirem (decisão 0055) e mostra o aviso de `DemoNotice` abaixo do título" e:

- Página: título "Agendamentos"; abas "Hoje", "Futuros" e "Histórico", com a descrição da visão logo abaixo (L1); a busca, os filtros e a ordenação começam do zero quando a visão é escolhida de novo.
- Controles: busca com o rótulo "Buscar por cliente ou veículo"; "Filtrar por status" (opção "Todos os status" e os status da visão); "Ordenar por" ("Horário" e "Status"); "Limpar filtros" (aparece quando há busca, filtro ou outra ordem); "Atualizar", com o ícone `RefreshCw`. Nada fica desativado durante a leitura, e o foco não sai do controle usado (`componentes.md`).
- Cartão: a etiqueta de status; o nome do cliente; "<marca> <modelo> · <placa>"; "Data: <data e hora>"; "Previsão de conclusão: <data e hora>"; "Serviços: <nomes>"; "Total: <valor>"; botão "Ver detalhes" (com a data para o leitor de tela). A data inclui o dia, porque "Hoje" traz dias anteriores.
- Nenhum agendamento (UC10 FE01): com busca ou filtro, "Nenhum agendamento encontrado" e "Não há agendamentos para os critérios selecionados."; sem eles, em "Hoje", "Nenhum agendamento para hoje" e "Os agendamentos de hoje e os de dias anteriores ainda em aberto aparecem aqui."; em "Futuros", "Nenhum agendamento futuro" e "Os agendamentos marcados para os próximos dias aparecem aqui."; em "Histórico", "Nenhum agendamento no histórico" e "Os agendamentos concluídos, cancelados e reagendados aparecem aqui.".
- Detalhe: janela "Detalhes do agendamento", como a do cliente, com "Cliente" e, no "Finalizado", "Total por forma de pagamento".
- Cancelamento: o texto do cliente (`meus-agendamentos.md`, "Cancelamento").
- Reagendamento: janela "Reagendar serviço", botão "Confirmar reagendamento" ("Reagendando…"), os textos de `agendar-servico.md`; o foco volta ao detalhe.
- Falha da listagem ou do detalhe: o aviso com a mensagem da API e "Tentar novamente". 409 `INVALID_STATUS` (UC12 FE01): o aviso aparece e o detalhe passa a mostrar o status atual.
- Fora da tela, sem requisito: o que está em "Fora do escopo" deste plano.

## Decisões técnicas

- Seguidas:
  - 0017: código em inglês, textos em português;
  - 0035 e 0052: nenhuma função pura nova com regra; a tela, a demonstração e os componentes, à mão;
  - 0036: o que serve às duas interfaces mora em `src/components/shared/` (P2);
  - 0041: esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md`;
  - 0049: `Tabs`, `Dialog`, `Select` e `Alert` do shadcn/ui sobre Base UI;
  - 0053: datas e horários no fuso da empresa;
  - 0055: a tela com os dados de demonstração e o aviso, sem rota nem esquema.
- Nenhuma nova: não há dependência nem escolha entre alternativas fora das já decididas.

Escolhas locais, sem registro:

- Um módulo de demonstração próprio do painel (`admin-appointments.ts`), porque `appointments.ts` já é o do cliente e a #62 também o amplia.
- Uma listagem por aba, montada quando a aba é escolhida, como `/appointments`, em vez de uma listagem com a visão como filtro: cada visão lê a rota de novo e não carrega filtros de outra.
- As gravações pelo clique, com `apiRequest`, nunca repetidas, e a janela de conclusão como `Dialog` próprio, porque o `ConfirmDialog` só tem texto no corpo.
- A previsão e os preços da demonstração calculados sobre os dados fixos, como a prévia do cliente, até a rota existir.

## Pontos à parte

Decisões do Yvan que não são lacunas da documentação. Marque `x`.

### P1. Divisão em PRs

Estimativa em "Arquivos": PR 1 cerca de 430 linhas, PR 2 cerca de 330, PR 3 cerca de 440 e PR 4 cerca de 200 (mais três arquivos que mudam de pasta).

- [x] **1. Quatro PRs (recomendada).** Base, listagem, detalhe e ações, reagendamento; o último fecha a issue.
- [ ] **2. Cinco PRs:** a conclusão sai do PR 3 e vira um PR próprio (PR 3 com cerca de 290 e PR 4 com cerca de 150).
- [ ] **3. Três PRs:** a base entra na listagem (cerca de 760) e o reagendamento fica no PR do detalhe (cerca de 640); os dois passam muito de ~400.

### P2. Como o painel reagenda (UC25 FA01)

O reagendamento do cliente é o modo `reschedule` do `BookingWizard`, que importa de `portal/` o cadastro de veículo e usa as rotas `/api/me`. As etapas "Data e horário", "Pagamento e resumo" e o "Resumo do pedido" não dependem da API (recebem a prévia por propriedade), mas os README de `src/components/admin/appointments/` e de `src/components/portal/appointments/` mandam o componente usado pela outra interface para `src/components/shared/`.

- [x] **1. Mover as três etapas para `shared/` e fazer um formulário de reagendamento só do painel (recomendada).** O assistente do cliente muda só as importações; o do painel tem cerca de 120 linhas próprias (prévia, envio, UC25 FE02), com alguma repetição. Risco pequeno para `/appointments` e `/booking` (conferidos de novo no PR 4), e a #62 reaproveita as etapas.
- [ ] **2. Extrair o reagendamento do `BookingWizard` num formulário compartilhado, com os endereços por propriedade.** Sem repetição e com o assistente do cliente mais simples, mas mexe na lógica verificada na #59 e na #78, perto da AV3, e o PR 4 passa de ~400.
- [ ] **3. Passar o reagendamento para a #62.** Esta tarefa entrega avançar, concluir e cancelar, e a #62, que constrói o assistente do painel, entrega também o reagendamento e a edição. Exige editar o corpo das issues #61 e #62 (o escopo da #61 cita "reagendar"), com o seu OK na conversa, como a #58 fez com o reagendamento do cliente.

### P3. Percentuais das formas de pagamento na demonstração

As taxas do `seed.sql` são todas zero (RN012), então, com a regra de `componentes.md` ("as configurações do `seed.sql`"), o total de cada forma é igual ao subtotal, e a tela não mostra "Acréscimo" nem "Desconto".

- [x] **1. Como o `seed.sql`, zero (recomendada).** Nada inventado; o caminho com percentual é conferido por alteração temporária, sem commit. O professor vê quatro totais iguais.
- [ ] **2. Percentuais de demonstração só nesta tela** (por exemplo, acréscimo no crédito e desconto no dinheiro), em `admin-appointments.ts`. Mostra o recálculo, mas inventa valores e diverge da aba "Formas de pagamento" da #65 e do `seed.sql`.

### P4. Ambiente de verificação

O roteiro usa o Docker Desktop (que precisa estar aberto), `npx supabase start`, o admin local criado por `supabase/scripts/create-admin.mjs`, o cookie da sessão de teste no Lighthouse e alterações temporárias, sem commit, em `src/lib/demo/admin-appointments.ts` e `routes.ts`, desfeitas com `git checkout` antes do commit. É o mesmo acordo das #56 a #60 e da #78.

- [x] **1. Aprovado, como nas tarefas anteriores (recomendada).**
- [ ] **2. Ajustar:** <o que muda>

## Riscos e dúvidas

- **Visões e a rota real.** Com L1, a opção 1, `view=today` inclui dias anteriores em aberto, e a agenda do dashboard (qualquer status de hoje) é outra leitura. A #46 precisa seguir `rotas.md`; a diferença fica escrita nos dois módulos.
- **Primeiro uso de `PaginatedList` e de `Select`.** Nenhum dos dois tem uso em tela. O `Select` do Base UI abre uma lista flutuante e já deu problema de foco em janelas (#78); se o foco, o rótulo ou o Lighthouse reprovarem, a alternativa é o campo `select` nativo estilizado, e a troca volta ao Yvan como dúvida.
- **Janela sobre janela.** "Concluir" e "Reagendar" abrem sobre o detalhe, como a #59: o foco inicial em "Cancelar", o retorno ao botão que abriu e o `Esc` seguem a #78, e são conferidos pelo teclado.
- **O caminho de sucesso não roda na demonstração.** Todas as gravações são recusadas, então "as janelas fecham e a lista é lida de novo" e o 409 só se conferem por alteração temporária de `routes.ts`, sem commit; o foco depois do sucesso (o cartão pode ter saído da visão) é definido e conferido nessa verificação.
- **Datas relativas a hoje.** As quantidades por visão e por status são fixas, mas as datas mudam a cada dia; os de hoje ficam no dia da consulta, mesmo num domingo, e o aviso de demonstração cobre isso. A busca da demonstração distingue acentos ("araujo" não acha "Araújo"); a da rota é decidida na #46.
- **LCP no celular.** Nas telas anteriores o LCP simulado ficou em 3,1 s, com o aviso de demonstração como elemento (nota da #58), acima dos 2,5 s de `frontend.md`, que se medem na pré-visualização. `/admin/appointments` pode repetir; a medida e a causa vão ao PR.
- **Tipos provisórios.** Com a opção 1 de L2, os nomes ficam em `rotas.md`; se a #46 ou a #50 mudar um nome, o tipo e os dados de demonstração acompanham.
- **Lacunas de regra.** L1 define a visão sem mexer em RF044 nem em UC10; nenhuma `RN` muda, então os `.docx` só mudam no Apêndice A (#67).
- **Pontos para a sua aprovação**, além das lacunas: P1 a P4, a conta de admin no banco local e as alterações temporárias da demonstração, sem commit.

## Fora do escopo

- O novo agendamento e a edição (#62), inclusive o botão "Novo agendamento", o botão "Editar" e as buscas do assistente; as rotas (#46 e #50), os esquemas de validação e qualquer gravação.
- Partes do wireframe sem requisito: o "Box", os avisos de atraso e de aguardando faturamento, a marca "Multi-dia", "Ver mais" e "Ver serviços", e os botões de ação no cartão (L3).
- Período no endereço, atualização automática dos dados, exportação da lista e motivo do cancelamento.
- A mudança de `DashboardAgendaItem` e de `src/lib/demo/dashboard.ts`.
- Mudança em `seed.sql`, `seed-demo.sql`, `Dockerfile`, `compose.yaml` ou `next.config.ts`.
- Testes automatizados de componentes (decisão 0052).
- Os documentos formais (#67).
