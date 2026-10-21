---
issue: 58
titulo: "Telas do cliente com dados de demonstração: conta, veículos e agendamentos"
areas: [frontend, testes]
tipo: funcionalidade
requisitos: [UC04, UC05, UC07, UC25, RF012, RF013, RF014, RF015, RF016, RF017, RF018, RF028, RF029, RF030, RF032, RN002, RN017, RN019, RN020, RN036, RNF001, RNF003, RNF004, RNF005, RNF008, RNF011, RNF016]
status: em_execucao
aprovado_por: yvan
aprovado_em: 21/10/2026
---

# Plano: Telas do cliente com dados de demonstração: conta, veículos e agendamentos

## Objetivo

Construir as duas telas do portal do cliente (T2 da `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, decisão 0055):

- `/profile` ("Minha conta"): os dados da conta, com edição (UC04, RF012, RF013), a troca de senha pela rota real `POST /api/auth/change-password` da #24 (UC04 FA01, RF014), e os veículos com tipo e porte, o cadastro pela placa e a edição (UC05, RF015 a RF018, RN002, RN036);
- `/appointments` ("Meus agendamentos"): os agendamentos atuais e o histórico, com o status escrito (UC07, RF028, RF029, RN017), o detalhe e o cancelamento com confirmação, só no "Agendado" (UC07 FA01, RF030, RN019).

O reagendamento (UC25, RF032, RN020) depende da escolha de L4. A troca de senha é a única gravação real das duas telas; o resto usa os dados de demonstração, e toda gravação mostra o aviso de `NOT_IMPLEMENTED`. Nenhuma rota construída, migration, esquema de validação ou dependência nova, e nenhum import de `src/server/`.

## Base da construção

- Uma ramificação por PR (Ordem da construção), cada uma criada da `origin/main` (hoje 61b4cb3, com a #57) depois da incorporação do PR anterior, sem vínculo com a `main`, e `npx -y npm@11.21.1 ci`.
- Contratos usados sem mudança:
  - `DEMO_ROUTES`, `DemoRequest` e `demoPage` (`src/lib/demo/`); `useApiQuery`, `usePaginatedList` e `useFormFailure` (`src/hooks/`); `apiRequest`, `ApiError` e `withQuery` (`src/lib/api-client.ts`);
  - `Page<T>` (`src/shared/api/pagination.ts`); `SHORT_LIST_PAGE_SIZE` (10, "Client's vehicles and appointments", `src/shared/constants/pagination.ts`); `APPOINTMENT_STATUS_LABELS` e `VEHICLE_SIZE_LABELS` (`src/shared/constants/`); `COMPANY_TIME_ZONE`;
  - `formatPhone`, `formatCurrency`, `formatDateTime` e `formatDuration` (`src/shared/format/`);
  - `changePasswordFormSchema` (`src/shared/validation/auth.ts`), o único esquema usado, porque a troca de senha já tem rota (#24);
  - `DemoNotice`, `StatusBadge`, `EmptyState`, `ListPagination`, `FormField`, `FormAlert`, `PasswordInput`, `SubmitButton` e `ConfirmDialog` (`src/components/shared/`; o `ConfirmDialog` muda com L5); `Tabs`, `Dialog`, `Alert`, `Button`, `Input`, `Field` e `Skeleton` (`src/components/ui/`, decisão 0049);
  - o estado desativado por `aria-disabled` do `buttonVariants` (#57): o botão que mostra o carregamento e mantém o foco usa `aria-disabled:` nas classes.

## Como funciona

As duas páginas são componentes de servidor que só compõem o título e os componentes de cliente; cada componente de cliente busca o que exibe (`frontend.md`). O esqueleto vem dos wireframes `clientPages/profile/`, `clientPages/clientAppointments/` e, no cadastro de veículo, `clientPages/appointment/RegisterVehicleClient*`; o conteúdo, dos casos de uso; o estilo, de `design.md`. Os textos estão em L2 e L3.

### `/profile` – Minha conta

`src/app/(portal)/profile/page.tsx`, com o `metadata` "Minha conta – Glow": o título (`h1`) e o `ProfileTabs`, com as abas "Dados pessoais" e "Meus veículos" (a escolhida fica no componente, como em `/admin/settings`; as duas ficam montadas, para a troca de aba não perder o que foi digitado).

**Aba "Dados pessoais"** (`src/components/portal/clients/`), com duas seções:

- **Dados da conta** (`account-form.tsx`), com o `DemoNotice` logo abaixo do título da seção (`componentes.md`): `useApiQuery<ClientProfile>("/api/me/profile")`; os campos "Nome", "Sobrenome", "E-mail" (só leitura: a rota de alteração não o recebe) e "Celular", com a máscara de `formatPhone`; "Salvar alterações" envia `PATCH /api/me/profile` com `firstName`, `lastName`, `phone` e `updatedAt`. Sem esquema de validação (decisão 0055). Como o formulário da aba "Empresa": na carga, o lugar dos campos reservado; na falha da leitura, o aviso com "Tentar novamente"; o sucesso no topo, como status; a falha do envio (na demonstração, o `NOT_IMPLEMENTED`) no aviso do formulário; no 409 `VERSION_CONFLICT`, o aviso e a releitura (RNF011).
- **Senha** (`password-section.tsx`), sem o aviso de demonstração, porque grava de verdade: um parágrafo e o botão "Alterar senha", que abre a janela "Alterar senha" com "Senha atual", "Nova senha" e "Confirmar nova senha" (`PasswordInput`, `autocomplete` de `frontend.md`), validados pelo `changePasswordFormSchema`, como em `/set-password`. O envio vai a `POST /api/auth/change-password` só com `currentPassword` e `newPassword`. No 204, a janela fecha, o foco volta ao botão e a seção mostra o sucesso de L2 como status; no 401 `INVALID_CURRENT_PASSWORD`, no 400 e no 429 `ACCOUNT_LOCKED`, a mensagem fica no topo da janela, que continua aberta (UC04 FE02). Os campos são limpos a cada abertura.

**Aba "Meus veículos"** (`src/components/portal/vehicles/`), com o `DemoNotice` no topo do painel:

- **`vehicle-list.tsx`**: `usePaginatedList<ClientVehicle>` com `/api/me/vehicles` e `SHORT_LIST_PAGE_SIZE`, sem busca nem filtro; o botão "Cadastrar veículo" acima da lista; os estados de `componentes.md` (Listagem); sem veículos, o `EmptyState` com o ícone `CarFront`, o texto de L2 e o mesmo botão; depois, o `ListPagination`.
- **`vehicle-card.tsx`**: marca e modelo como título, a placa (`formatPlate`), a cor e o ano, o tipo e o porte ("Picape · Porte GG", RN002). Se o veículo também está vinculado a outra conta (`isShared`, L1), o cartão não oferece a edição e mostra a frase de L2 (UC05 FE03, RN036); senão, o botão "Editar".
- **Cadastro** (`add-vehicle-dialog.tsx`), na forma de L6: a janela "Cadastrar veículo" começa pela placa; "Continuar" lê `GET /api/me/vehicles/lookup?plate=<placa>`. Placa já cadastrada (UC05 FA01): os dados do veículo aparecem preenchidos e sem edição, e o envio leva só a placa. Placa nova: os campos "Tipo" (Hatch, Sedan, SUV, Picape), "Marca", "Modelo", "Cor" e "Ano". "Voltar" retorna à placa sem perder o que foi digitado. O envio vai a `POST /api/me/vehicles`; a falha (na demonstração, o `NOT_IMPLEMENTED`) aparece no topo da janela. A #59 reaproveita esta janela no assistente, quando o cliente não tem veículo.
- **Edição** (`edit-vehicle-dialog.tsx`): a janela "Editar veículo", com tipo, placa, marca, modelo, cor e ano preenchidos, e `PATCH /api/me/vehicles/:id` com `updatedAt`.
- **`vehicle-fields.tsx`**: os campos de tipo, marca, modelo, cor e ano, usados pelas duas janelas. O tipo é um grupo de botões de opção nativos (`fieldset` com `legend`), como o filtro do catálogo; o ano, um campo de texto com teclado numérico e quatro algarismos; a placa, com a máscara de `formatPlate`.

### `/appointments` – Meus agendamentos

`src/app/(portal)/appointments/page.tsx`, com o `metadata` "Meus agendamentos – Glow": o título (`h1`), o `DemoNotice` logo abaixo dele (a tela inteira é de demonstração) e o `AppointmentTabs` (`src/components/portal/appointments/`), com as abas "Atuais" e "Histórico" (UC07, passos 2 a 4). Cada aba monta a sua lista ao ser escolhida, então volta a ler a rota, e um cancelamento aparece no histórico na próxima troca de aba.

- **`appointment-list.tsx`**: `usePaginatedList<ClientAppointmentSummary>` com `/api/me/appointments`, `SHORT_LIST_PAGE_SIZE` e o `scope` fixo da aba (`current` ou `history`, L1); os estados de `componentes.md`; sem itens, o `EmptyState` com o ícone `CalendarX2` e o texto de L3 (UC07 FE01); depois, o `ListPagination`. Uma coluna, duas a partir de 1024 px.
- **`appointment-card.tsx`**: a etiqueta de status (`StatusBadge`, RN017), marca e modelo como título, a placa e a cor, "Data: 23/10/2026 às 09:00" e "Previsão de conclusão: …" (`formatDateTime`), os nomes dos serviços, o total (`formatCurrency`) e o botão "Ver detalhes".
- **`appointment-details-dialog.tsx`**: a janela "Detalhes do agendamento", que lê `GET /api/me/appointments/:id` ao abrir (lugar reservado na carga, aviso com "Tentar novamente" na falha). Mostra a etiqueta, a data e o horário, a previsão de conclusão, a duração estimada (`formatDuration`), o veículo (marca, modelo, placa, cor, ano, tipo e porte), os serviços com o valor de cada um, a forma de pagamento (`PAYMENT_METHOD_LABELS`), o subtotal e o acréscimo ou desconto da forma de pagamento (`formatPercent`), só quando o percentual não é zero, e o total.
- **Ações por status**, numa tabela de consulta (`codigo.md`), que só orienta, porque quem decide é a API (RS008): no "Agendado", "Cancelar agendamento" (RN019), que abre o `ConfirmDialog` com os textos de L3 e L5 e envia `POST /api/me/appointments/:id/cancel`; a falha (na demonstração, o `NOT_IMPLEMENTED`; com a rota, o 409 `INVALID_STATUS` de UC07 FE02) aparece dentro dele. Confirmado o cancelamento, as duas janelas fecham e a lista é lida de novo. Nos outros status, nenhuma ação nesta tarefa: o "Editar" do "Agendado" é da #59, e o "Reagendar" do "Concluído" segue L4.

### Dados de demonstração (decisão 0055)

O cliente da demonstração é **Henrique Costa** (`henrique.costa@example.com`, (82) 90000-0008) do `seed-demo.sql`, porque os dois veículos dele têm tipos diferentes e um deles, o Toyota SW4, também está na conta de Isabela Melo, o que mostra o veículo compartilhado (RN036). Os ids são os do `seed-demo.sql` (`md5('glow-demo:<chave>')` como UUID), onde existem.

| Arquivo | Conteúdo |
|---|---|
| `src/shared/api/clients.ts` | `ClientProfile` (L1) |
| `src/shared/api/vehicles.ts` | `ClientVehicle` e `VehicleLookup` (L1) |
| `src/shared/api/appointments.ts` | `ClientAppointmentSummary` e `ClientAppointment` (L1) |
| `src/lib/demo/clients.ts` | `answerProfile()`: os dados de Henrique Costa |
| `src/lib/demo/vehicles.ts` | os dois veículos da conta, na ordem do seed: Fiat Toro, `GLW8H08`, Azul, 2021, picape (GG); Toyota SW4, `GLW5L15`, Prata, 2019, SUV (G), `isShared: true`. `answerVehicles({ query })` com `demoPage`; `answerVehicleLookup({ query })` procura a placa digitada, em maiúsculas e sem hífen, entre os 14 veículos do seed e devolve tipo, marca, modelo, cor e ano, ou `null` (então `GLW2B02`, de outra conta do seed, mostra o Toyota Corolla sem nenhum dado do cliente, e `ABC1D23` pede os dados) |
| `src/lib/demo/appointments.ts` | sete agendamentos de Henrique Costa, com os serviços, os preços por porte e as durações do seed e as taxas do `seed.sql` (todas zero, então o total é o subtotal). As datas são relativas à segunda-feira da semana atual no fuso da empresa, para continuarem atuais até a AV3, sempre em dias e horários de funcionamento do `seed.sql`, com a previsão de conclusão calculada à mão por RN034 (tabela abaixo). `answerAppointments({ query })` separa por `scope` e ordena (L1) antes do `demoPage`; `answerAppointment({ params })` devolve o detalhe |
| `src/lib/demo/routes.ts` | as entradas de leitura `GET /api/me/profile`, `GET /api/me/vehicles`, `GET /api/me/vehicles/lookup`, `GET /api/me/appointments` e `GET /api/me/appointments/:id`, com `load`; as de gravação `PATCH /api/me/profile`, `POST /api/me/vehicles`, `PATCH /api/me/vehicles/:id` e `POST /api/me/appointments/:id/cancel`, sem `load` |

Agendamentos (dia em relação à segunda-feira da semana atual; "hoje" é o dia da consulta):

| Status | Dia e horário | Veículo | Serviços | Forma | Total | Previsão de conclusão |
|---|---|---|---|---|---|---|
| Em execução | hoje, 08:00 | Fiat Toro | Lavagem completa, Pretinho nos pneus | Pix | R$ 130,00 | hoje, 09:40 |
| Agendado | +9 (quarta), 09:00 | Toyota SW4 | Polimento comercial | Crédito | R$ 390,00 | +9, 14:00 (atravessa a pausa) |
| Agendado | +16 (quarta), 14:00 | Fiat Toro | Higienização interna completa, Oxi-sanitização | Débito | R$ 550,00 | +17, 09:40 (atravessa a noite) |
| Concluído | −3 (sexta), 08:30 | Fiat Toro | Lavagem simples, Cera de carnaúba | Pix | R$ 105,00 | −3, 09:30 |
| Cancelado | −12 (quarta), 10:00 | Toyota SW4 | Lavagem técnica | Dinheiro | R$ 220,00 | −12, 14:00 |
| Concluído | −19 (quarta), 08:00 | Toyota SW4 | Lavagem completa, Hidratação de couro | Crédito | R$ 190,00 | −19, 10:10 |
| Reagendado | −47 (quarta), 08:00 | Toyota SW4 | Lavagem completa, Hidratação de couro | Crédito | R$ 190,00 | −47, 10:10 |

O "Reagendado" deu origem ao "Concluído" de −19, quatro semanas depois, como no seed (RN020).

### Constantes e formatação

- `src/shared/constants/vehicle-types.ts`: `VEHICLE_TYPES` (`hatch`, `sedan`, `suv`, `pickup`) e `VEHICLE_TYPE_LABELS` ("Hatch", "Sedan", "SUV", "Picape", RN002).
- `src/shared/constants/payment-methods.ts`: `PAYMENT_METHODS` (`credit`, `debit`, `pix`, `cash`) e `PAYMENT_METHOD_LABELS` ("Crédito", "Débito", "Pix", "Dinheiro", RN011 e glossário).
- `src/shared/format/plate.ts` (TDD): `formatPlate(text)`, a exibição de RN035 ("GLW1A01" no padrão Mercosul, "GLW-1010" no antigo), usada também como máscara durante a digitação: maiúsculas, só letras e algarismos, até sete, e o hífen quando os três primeiros são letras e os dois seguintes, algarismos.
- `src/shared/format/percent.ts` (TDD): `formatPercent(value)`, a exibição de RN035 ("5,00%"); a tela passa o valor absoluto e escreve "Acréscimo" ou "Desconto" pelo sinal.

## Ordem da construção

Em três PRs, um por parte da tela, cada um com a verificação local e a etapa 03 próprias (Riscos, tamanho):

**PR 1, conta** (`feat/58-client-account`, "Refs #58"):

1. Ramificação da `origin/main`, sem vínculo, e `npx -y npm@11.21.1 ci`.
2. Tipo, dados de demonstração e as duas entradas do perfil.
3. `ProfileTabs` só com a aba "Dados pessoais", `account-form.tsx`, `password-section.tsx` e a página.
4. Documentação: `area-do-cliente.md` (parte da conta de L2), `clientes/CONTEXT.md` e o perfil em `clientes/rotas.md` (L1).
5. Verificação local de `/profile` e da troca de senha real; etapa 03 do PR 1 (`02_relatorio.md` parcial, como na #57).

**PR 2, veículos** (`feat/58-client-vehicles`, "Refs #58"), depois da incorporação do PR 1:

6. Testes de `tests/format/plate.test.ts`, conferidos em vermelho, num commit próprio (decisões 0035 e 0052).
7. `formatPlate` e `VEHICLE_TYPES`, até os testes passarem.
8. Tipos, dados de demonstração e as quatro entradas dos veículos.
9. A aba "Meus veículos": lista, cartão, campos e as duas janelas.
10. Documentação: a parte dos veículos de L2 e de L6, os veículos em `clientes/rotas.md` (L1), `testes.md` e os README.
11. Verificação local da aba e de novo da conta; etapa 03 do PR 2.

**PR 3, agendamentos** (`feat/58-client-appointments`, "Closes #58" com a opção 1 de L4), depois da incorporação do PR 2:

12. Testes de `tests/format/percent.test.ts`, em vermelho, num commit próprio.
13. `formatPercent` e `PAYMENT_METHODS`, até os testes passarem.
14. Tipos, dados de demonstração e as três entradas dos agendamentos.
15. `ConfirmDialog` com o rótulo de L5.
16. Abas, lista, cartão, janela de detalhe e cancelamento, e a página `/appointments`.
17. Documentação: `meus-agendamentos.md` (L3), `agendamento/CONTEXT.md`, os agendamentos em `agendamento/rotas.md` (L1), L5 em `componentes.md`, `testes.md` e os README.
18. Verificação local de `/appointments`; etapa 03: `02_relatorio.md` completo e o plano em `concluido`.

Com a opção 2 de L4, um quarto PR entra depois do 3, com o reagendamento, e o "Closes #58" passa a ele.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um cliente, quando abre `/profile`, então vê os dados da conta e os veículos, com o tipo e o porte (UC04, UC05) | Local, com a conta de teste de cliente: "Dados pessoais" com os dados de Henrique Costa, o e-mail só para leitura e o celular "(82) 90000-0008"; "Meus veículos" com o Fiat Toro ("Picape · Porte GG", "Editar") e o Toyota SW4 ("SUV · Porte G", sem "Editar", com a frase do veículo compartilhado). Os envios de "Salvar alterações", do cadastro (placa `GLW2B02`, já cadastrada, e `ABC1D23`, nova) e da edição mostram a mensagem de `NOT_IMPLEMENTED`. Testes de `formatPlate` |
| Dado a troca de senha com a senha atual certa, quando confirmo, então a senha muda de verdade (a única gravação real da tela) | Local, com o banco local: na janela, a senha atual errada mostra "A senha atual está incorreta." e a janela continua aberta; com a certa, a janela fecha e a seção mostra o sucesso; a lista de requisições tem `POST /api/auth/change-password` com 204. Depois, "Sair"; a senha antiga é recusada em `/login` ("E-mail ou senha incorretos.") e a nova entra |
| Dado um agendamento "Agendado", quando abro o detalhe, então vejo "Cancelar"; num "Concluído" do histórico, "Reagendar" (RN019, RN020) | Local: o detalhe dos dois "Agendado" mostra "Cancelar agendamento"; o do "Em execução" e os do histórico, não. A confirmação abre com o foco em "Voltar"; "Cancelar agendamento" mostra a mensagem de `NOT_IMPLEMENTED` dentro dela; "Voltar" fecha e devolve o foco. O "Reagendar" segue L4: com a opção 1, a parte do critério passa à #59; com a 2, o detalhe dos "Concluído" mostra "Reagendar" e o envio mostra o `NOT_IMPLEMENTED` |

Critérios comuns às telas de demonstração (issue):

| Critério | Verificação |
|---|---|
| Esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md` (decisão 0041) | Revisão: o que fica de fora do wireframe está em "Fora do escopo" |
| `useApiQuery` ou `usePaginatedList` com o endereço de `rotas.md`; tipos em `src/shared/api/<módulo>.ts`; dados em `src/lib/demo/<módulo>.ts`, com os nomes do `seed-demo.sql` | Revisão do diff; a lista de requisições sem nenhuma chamada a `/api/me/*`, só `/api/auth/me`, `/api/public/company` e, na troca de senha, `/api/auth/change-password` |
| Carregamento, vazio e falha com "Tentar novamente" | Local: o carregamento nos 400 ms da demonstração; o vazio, a falha e a paginação de cada lista por alteração temporária dos dados de demonstração, sem commit, desfeita e conferida pelo `git diff` |
| O aviso de demonstração na tela, aba ou seção; o envio de qualquer formulário mostra o `NOT_IMPLEMENTED`, e nada é gravado | O aviso abaixo do título de "Dados da conta", no topo de "Meus veículos" e abaixo do título de `/appointments`; a seção "Senha" sem ele. Cada envio de demonstração como nos critérios acima |
| 360 × 800 primeiro e 1440 × 900, claro e escuro, pelo teclado, sem transbordar, Lighthouse de acessibilidade sem auditoria reprovada | Local, no Chrome sem interface: as duas páginas, as janelas e os estados nas duas larguras e nos dois temas, sem rolagem horizontal; pelo teclado, as abas (setas), os campos, as opções do tipo (setas), as janelas (foco preso, Esc fecha, o foco volta ao botão) e a paginação, com o contorno de foco; Lighthouse 13.5.0 com o cookie da conta de teste |
| Nenhuma rota, migration ou esquema de validação novo, e nenhum import de `src/server/` | `git diff --stat` sem `src/app/api/`, `supabase/` nem `src/shared/validation/`; `grep` por `@/server` nos arquivos novos |

### Como a verificação local é feita

Como na #56 e na #57 (notas das duas tarefas), em cada PR:

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`, só com o `seed.sql`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Conta de teste de cliente.** Criada em `/register` no banco local, com e-mail fictício `@example.com` e a senha gerada por um roteiro do scratchpad, guardadas num arquivo dele e nunca exibidas; a nova senha da troca também. Ela só existe no banco local.
- **Aplicação.** `npx next build` e `npx next start -p 3058`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório; o `next start` só recebe requisições depois de responder.
- **Telas**, num Chrome sem interface controlado pelo `puppeteer-core` do cache do Lighthouse 13.5.0 (abre no tema escuro nesta máquina; o claro pela emulação de `prefers-color-scheme`): as páginas a 360 × 800 primeiro e a 1440 × 900, nos dois temas, o teclado e a lista de requisições. A falha de uma rota real é feita com `request.abort` ou `request.respond`, nunca deixando a requisição sem resposta, que o Chrome libera ao servidor quando a página fecha.
- **Lighthouse.** `npx -y lighthouse@13.5.0` com `--only-categories=accessibility,performance`, no celular e no computador, claro (`--chrome-flags="--headless=new --blink-settings=preferredColorScheme=1"`) e escuro, com o cookie da sessão de teste por `--extra-headers`, num arquivo do scratchpad apagado no fim; o LCP no celular fica no PR.
- **Registro.** A saída do `next start` acumulada (`>>`) em todas as execuções do PR e conferida sem cookie, token, cabeçalho de autorização, senha, chave nem o e-mail de teste.
- **Verificações automáticas.** `npm run check` sem erros nem avisos, `npx next build` e `npm audit --omit=dev --audit-level=high`.
- **Encerramento.** `next start` encerrado por PID, `npx supabase stop`, a alteração temporária desfeita (`git status` só com os arquivos do plano).
- **Pré-visualização**, passo seu: as telas no celular e no computador, com o Lighthouse de acessibilidade e o LCP no PR.

## Arquivos

| Arquivo | Ação | PR |
|---|---|---|
| `src/app/(portal)/profile/page.tsx` | criar | 1 |
| `src/components/portal/clients/profile-tabs.tsx` | criar (1); a aba dos veículos (2) | 1, 2 |
| `src/components/portal/clients/account-form.tsx`, `password-section.tsx` | criar | 1 |
| `src/shared/api/clients.ts` | criar | 1 |
| `src/lib/demo/clients.ts` | criar | 1 |
| `src/lib/demo/routes.ts` | alterar: as entradas de cada PR | 1, 2, 3 |
| `src/components/portal/vehicles/vehicle-list.tsx`, `vehicle-card.tsx`, `vehicle-fields.tsx`, `add-vehicle-dialog.tsx`, `edit-vehicle-dialog.tsx` | criar | 2 |
| `src/shared/api/vehicles.ts` | criar | 2 |
| `src/shared/constants/vehicle-types.ts` | criar | 2 |
| `src/shared/format/plate.ts` | criar | 2 |
| `src/lib/demo/vehicles.ts` | criar | 2 |
| `tests/format/plate.test.ts` | criar | 2 |
| `src/app/(portal)/appointments/page.tsx` | criar | 3 |
| `src/components/portal/appointments/appointment-tabs.tsx`, `appointment-list.tsx`, `appointment-card.tsx`, `appointment-details-dialog.tsx` | criar | 3 |
| `src/components/shared/confirm-dialog.tsx` | alterar (L5) | 3 |
| `src/shared/api/appointments.ts` | criar | 3 |
| `src/shared/constants/payment-methods.ts` | criar | 3 |
| `src/shared/format/percent.ts` | criar | 3 |
| `src/lib/demo/appointments.ts` | criar | 3 |
| `tests/format/percent.test.ts` | criar | 3 |
| `src/shared/format/README.md` | alterar: o percentual | 3 |
| `tests/format/README.md` | alterar: os dois arquivos novos | 2, 3 |
| `docs/clientes/area-do-cliente.md` | criar (L2, L6) | 1, 2 |
| `docs/clientes/CONTEXT.md` | alterar: a linha do módulo novo | 1 |
| `docs/clientes/rotas.md` | alterar (L1) | 1, 2 |
| `docs/agendamento/meus-agendamentos.md` | criar (L3) | 3 |
| `docs/agendamento/CONTEXT.md` | alterar: a linha do módulo novo | 3 |
| `docs/agendamento/rotas.md` | alterar (L1) | 3 |
| `docs/padroes/componentes.md` | alterar (L5) | 3 |
| `docs/padroes/testes.md` | alterar: a linha "Formatação" | 2, 3 |
| `memoria/tarefas/58-telas-do-cliente/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` | todos |

Os README de `src/components/portal/clients/`, `vehicles/` e `appointments/`, de `src/app/(portal)/profile/` e `appointments/`, de `src/shared/api/`, `src/shared/constants/` e `src/lib/demo/` já descrevem o que entra e não mudam; o de `src/shared/format/` já cita a placa.

### Em comum com outras tarefas

- Nenhum PR aberto; a `main` está em 61b4cb3.
- **#59** (agendar e editar): reaproveita a janela de cadastro de veículo, `ClientVehicle` e a janela de detalhe, onde põe o "Editar" e, com a opção 1 de L4, o "Reagendar"; depende desta tarefa.
- **#61 e #62** (agendamentos do painel): o mesmo `src/shared/api/appointments.ts`, `PAYMENT_METHOD_LABELS` e `formatPercent`; quem chegar depois acrescenta os seus tipos.
- **#64** (clientes e veículos do painel): o mesmo `src/shared/api/vehicles.ts`, `VEHICLE_TYPE_LABELS` e `formatPlate`; pode reaproveitar `vehicle-fields.tsx` se for para `shared/` no segundo uso.
- **#65** (formas de pagamento): `PAYMENT_METHOD_LABELS` e `formatPercent`.
- **#58 a #65:** uma linha por rota em `src/lib/demo/routes.ts` (conflito simples).
- **#67** (documentos formais): recebe a lista do relatório desta tarefa.

## Testes previstos

TDD nas duas funções de formatação, com os valores esperados escritos à mão a partir de RN035 e das placas do `seed-demo.sql` (decisões 0035 e 0052):

`tests/format/plate.test.ts`:

- keeps a Mercosul plate as stored: "GLW1A01" → "GLW1A01"
- adds the hyphen to an old plate: "GLW1010" → "GLW-1010"
- removes the hyphen typed in a Mercosul plate: "glw-1a01" → "GLW1A01"
- masks a plate while it is typed: "glw" → "GLW", "glw1" → "GLW1", "glw10" → "GLW-10", "glw1a" → "GLW1A"
- ignores other characters and stops at seven: "glw 1a01x" → "GLW1A01"

`tests/format/percent.test.ts`:

- formats a percent with two decimals: 5 → "5,00%"
- formats a fractional percent: 2.75 → "2,75%"
- formats the whole: 100 → "100,00%"

Os componentes, as janelas e os dados de demonstração são conferidos à mão (decisão 0052); a página e o filtro do `demoPage` já têm testes da #56, e o `changePasswordFormSchema`, da #24.

## Documentação

- `docs/clientes/area-do-cliente.md`, novo, "Conteúdo da área do cliente" (cabeçalho `titulo`, `assunto: clientes`, `origem: issue #58`, `relacionados: [UC04, UC05, RF012 a RF018, RN002, RN036]`): as abas, as seções, os textos de L2 e a forma do cadastro de L6.
- `docs/agendamento/meus-agendamentos.md`, novo, "Conteúdo da página de agendamentos do cliente" (`relacionados: [UC07, UC25, RF028 a RF030, RF032, RN017, RN019, RN020]`): as abas, o cartão, o detalhe, as ações por status e os textos de L3.
- `docs/clientes/CONTEXT.md` e `docs/agendamento/CONTEXT.md`: a linha do módulo novo.
- `docs/clientes/rotas.md` e `docs/agendamento/rotas.md`: L1.
- `docs/padroes/componentes.md`: L5.
- `docs/padroes/testes.md`, tabela de casos, linha "Formatação": acrescentar "placa nos dois padrões, também durante a digitação; percentual".
- README: `src/shared/format/` (o percentual) e `tests/format/` (os dois arquivos novos).
- Documentos formais a atualizar no relatório, pela #67: Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A (os campos das rotas do cliente, L1); Documentação de Desenvolvimento com IA, seção 8 (os casos novos de formatação).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Campos das respostas das rotas do cliente

**Problema.** Os tipos de `src/shared/api/` precisam dos nomes dos campos, mas `rotas.md` descreve as respostas por alto: o perfil devolve "nome, sobrenome, e-mail e telefone", sem o `updatedAt` que o `PATCH` exige (`api.md`); os veículos vêm "com tipo e porte", sem dizer se o veículo também está em outra conta, e o UC05 FE03 manda não oferecer a edição nesse caso; a consulta da placa devolve "resposta vazia" sem dizer o formato; os agendamentos têm `scope` `current` ou `history` sem dizer quais status cada um tem nem a ordem; o detalhe é "agendamento completo".

**Opções:**

- [X] **1. Os campos em `rotas.md`, com a marca do veículo compartilhado e a ordem das listas (recomendada).** Os tipos seguem o texto abaixo, e a fase 3 constrói as rotas por ele. A marca `isShared` diz só que outra conta também tem o veículo, sem nenhum dado dela (RN036), e permite esconder a edição antes do envio, como pede o FE03. Atuais em ordem de data, do mais próximo; histórico do mais recente.
- [ ] **2. Os campos em `rotas.md`, sem a marca do veículo compartilhado.** A edição aparece em todo veículo, e o compartilhado recebe o 409 `VEHICLE_SHARED` ao salvar: contraria o FE03 ("a edição não é oferecida") e faz o cliente digitar à toa.

**Texto proposto (opção 1):**

- `docs/clientes/rotas.md`:
  - `GET /api/me/profile`, "Resposta: **200** nome, sobrenome, e-mail e telefone." passa a "Resposta: **200** `firstName`, `lastName`, `email`, `phone` (os 11 algarismos) e `updatedAt`.";
  - `GET /api/me/vehicles`, "Resposta: **200** lista paginada de veículos, com tipo e porte." passa a "Resposta: **200** lista paginada de `id`, `plate`, `type`, `size`, `brand`, `model`, `color`, `year`, `isShared` (o veículo também está vinculado a outra conta e só a empresa altera os dados dele, RN036, UC05 FE03) e `updatedAt`, na ordem em que foram vinculados à conta.";
  - `GET /api/me/vehicles/lookup`, "Resposta: **200** tipo, marca, modelo, cor e ano do veículo, se a placa já estiver cadastrada, ou resposta vazia; nunca devolve dados de clientes." passa a "Resposta: **200** `type`, `brand`, `model`, `color` e `year` do veículo, se a placa já estiver cadastrada, ou `null`; nunca devolve dados de clientes."
- `docs/agendamento/rotas.md`:
  - `GET /api/me/appointments`, "Entrada: `scope`: `current` ou `history`." passa a "Entrada: `scope*`: `current` (Agendado, Em espera, Em execução e Finalizado, da data mais próxima à mais distante) ou `history` (Concluído, Cancelado e Reagendado, da data mais recente à mais antiga)."; "Resposta: **200** lista com data, previsão de conclusão, veículo, serviços, total e status." passa a "Resposta: **200** lista paginada de `id`, `status`, `scheduledAt`, `estimatedEndAt`, `vehicle` (`plate`, `brand`, `model` e `color`), `services` (`id` e `name`) e `total`, com os dados copiados no agendamento (RN037).";
  - `GET /api/me/appointments/:id`, "Resposta: **200** agendamento completo." passa a "Resposta: **200** `id`, `status`, `scheduledAt`, `estimatedEndAt`, `estimatedDurationMinutes`, `paymentMethod`, `subtotal`, `feePercent`, `total`, `vehicle` (`id`, `plate`, `type`, `size`, `brand`, `model`, `color` e `year`), `services` (`id`, `name`, `type`, `price` e `durationMinutes`) e `updatedAt`, com os dados copiados no agendamento (RN037)."

### L2. Conteúdo e textos de `/profile`

**Problema.** O UC04 e o UC05 dizem o que a área do cliente faz, mas nenhum módulo define as abas, as seções e os textos: títulos, rótulos, a descrição do e-mail que não muda, o sucesso dos dois formulários, o vazio dos veículos e a frase do veículo compartilhado. A tela mistura uma parte de demonstração (dados da conta e veículos) com uma real (a troca de senha), e o aviso de demonstração diz que "nada do que você fizer nela é gravado": ele não pode cobrir a troca de senha. O wireframe tem foto de perfil, "Cliente desde", "Sair" e a exclusão da conta, sem requisito (no Glow, só o funcionário exclui a conta, RF074).

**Opções:**

- [X] **1. Duas abas; a troca de senha numa seção própria, sem o aviso, e numa janela (recomendada).** "Dados pessoais" tem as seções "Dados da conta", com o aviso abaixo do título, e "Senha", sem ele; "Meus veículos" tem o aviso no topo do painel. A troca de senha abre uma janela, como as edições (`componentes.md`, Diálogos), e o sucesso aparece na seção depois que ela fecha. Os textos abaixo ficam no código e no módulo novo `docs/clientes/area-do-cliente.md`.
- [ ] **2. Três abas: "Dados pessoais", "Senha" e "Meus veículos".** A parte real fica separada por aba e o formulário de senha fica na tela, sem janela; mas o cliente procura a senha numa aba a mais, e o wireframe a põe junto dos dados pessoais.

**Texto proposto (opção 1):** `docs/clientes/area-do-cliente.md`, com a frase de abertura "A troca de senha grava de verdade (`POST /api/auth/change-password`); enquanto os dados da conta e os veículos usarem os dados de demonstração, o aviso fica só nessas partes ([../padroes/componentes.md](../padroes/componentes.md))." e:

- Página: título "Minha conta"; abas "Dados pessoais" e "Meus veículos".
- Dados da conta (UC04): título "Dados da conta"; campos "Nome", "Sobrenome", "E-mail", só para leitura, com a descrição "O e-mail de acesso não pode ser alterado.", e "Celular", com a descrição "Com DDD, como (82) 99999-8888."; botão "Salvar alterações" ("Salvando…"); sucesso "Dados da conta salvos.".
- Senha (UC04 FA01): título "Senha"; parágrafo "Para alterar a senha, informe a senha atual."; botão "Alterar senha"; janela "Alterar senha" com "Senha atual", "Nova senha" (descrição "De 8 a 72 caracteres, com letra maiúscula, número e caractere especial.") e "Confirmar nova senha", e os botões "Cancelar" e "Salvar nova senha" ("Salvando…"); sucesso, na seção, "Senha alterada. As sessões abertas em outros aparelhos foram encerradas." (decisão 0048).
- Meus veículos (UC05): botão "Cadastrar veículo"; cartão com "<marca> <modelo>", "Placa <placa> · <cor> · <ano>" e "<tipo> · Porte <porte>", e o botão "Editar"; veículo compartilhado (FE03), no lugar do botão, "Este veículo também está vinculado a outra conta. Para alterar os dados, procure a empresa." (a mensagem de `VEHICLE_SHARED`); sem veículos, "Nenhum veículo cadastrado" e "Cadastre um veículo para agendar serviços.", com o botão "Cadastrar veículo".
- Janela "Cadastrar veículo": campo "Placa" (descrição "Como ABC1D23 ou ABC-1234."), botões "Cancelar" e "Continuar" ("Consultando…"); placa já cadastrada (FA01): "Esta placa já está cadastrada. Confira os dados do veículo.", os dados em lista, e "Adicionar à minha conta" ("Salvando…"); placa nova: "Tipo" (descrição "O porte é definido pelo tipo."), "Marca", "Modelo", "Cor" e "Ano", e "Cadastrar veículo" ("Salvando…"); nos dois, "Voltar" para a placa.
- Janela "Editar veículo": "Tipo", "Placa", "Marca", "Modelo", "Cor" e "Ano"; botões "Cancelar" e "Salvar alterações" ("Salvando…").
- Fora da tela, sem requisito: foto de perfil, "Cliente desde", "Sair" (já no cabeçalho, `layouts.md`) e a exclusão da conta.

### L3. Conteúdo e textos de `/appointments`

**Problema.** O UC07 diz o que a página mostra (data, horário, veículo, serviços e status; atuais e histórico; cancelamento com confirmação), mas nenhum módulo define as abas, o cartão, o detalhe, as ações por status nem os textos, inclusive o de "nenhum agendamento" (FE01) e o da confirmação. O wireframe agrupa os atuais em "Em andamento" e "Próximos", põe o "Cancelar" no próprio cartão e pede o motivo do cancelamento, que a rota não recebe.

**Opções:**

- [X] **1. Duas abas e um cartão por agendamento; o detalhe e as ações numa janela (recomendada).** O cartão traz o resumo do UC07 e "Ver detalhes"; a janela traz o agendamento completo e as ações do status, como o critério da issue ("quando abro o detalhe, então vejo 'Cancelar'"), e é onde a #59 põe o "Editar". Uma lista só por aba, em ordem de data, sem os grupos do wireframe, porque os grupos não combinam com a paginação. Sem o motivo do cancelamento. Os textos ficam no módulo novo `docs/agendamento/meus-agendamentos.md`.
- [ ] **2. Ações no cartão e no detalhe.** O "Cancelar" aparece também no cartão, como no wireframe: um clique a menos, mas mais botões por tela e dois lugares para cada ação, inclusive as da #59.

**Texto proposto (opção 1):** `docs/agendamento/meus-agendamentos.md`:

- Página: título "Meus agendamentos"; abas "Atuais" (Agendado, Em espera, Em execução e Finalizado) e "Histórico" (Concluído, Cancelado e Reagendado), em ordem de data (`rotas.md`).
- Cartão: a etiqueta de status (RN017), "<marca> <modelo>", "Placa <placa> · <cor>", "Data: <data e hora>", "Previsão de conclusão: <data e hora>", "Serviços: <nomes>", "Total: <valor>" e o botão "Ver detalhes".
- Nenhum agendamento (UC07 FE01): em "Atuais", "Nenhum agendamento atual" e "Os seus próximos agendamentos aparecem aqui."; em "Histórico", "Nenhum agendamento no histórico" e "Os agendamentos concluídos, cancelados e reagendados aparecem aqui.".
- Janela "Detalhes do agendamento": a etiqueta; "Data e horário", "Previsão de conclusão" e "Duração estimada"; "Veículo" (marca e modelo, placa, cor, ano, tipo e porte); "Serviços", com o valor de cada um; "Forma de pagamento"; "Subtotal" e "Acréscimo de <percentual>" ou "Desconto de <percentual>", só quando a forma de pagamento tem percentual; "Total".
- Ações por status, só no detalhe: "Agendado", "Cancelar agendamento" (RN019); os outros, nenhuma nesta tela, além das da #59.
- Confirmação do cancelamento (UC07 FA01): título "Cancelar este agendamento?", texto "O agendamento passa a Cancelado e vai para o histórico. Esta ação não pode ser desfeita.", botões "Voltar" (L5) e "Cancelar agendamento" ("Cancelando…"), na cor de erro.

### L4. Reagendamento a partir do histórico

**Problema.** A issue pede o "Reagendar" no "Concluído" (UC25, RF032, RN020), mas o reagendamento não é só um botão: a rota `POST /api/me/appointments/:id/reschedule` exige a forma de pagamento e a data e o horário, e o UC25 manda mostrar o total pela forma escolhida (passo 4) e as datas e os horários de funcionamento (passo 5, RN013 e RN015). São as etapas "data e horário", "forma de pagamento" e "resumo" do assistente da #59, que o wireframe desenha com calendário e grade de horários. Os requisitos da #58 não incluem RN013, RN015 nem RN034, que essas etapas usam, e a regra de "a tela nasce na forma final" (decisão 0055) não deixa um botão sem destino.

**Opções:**

- [X] **1. O reagendamento inteiro na #59, no mesmo assistente da edição (recomendada).** A #59 abre o assistente a partir do detalhe do "Concluído", com o veículo e os serviços do original fixos, nas etapas de data e horário e de forma de pagamento e resumo, e envia a rota de reagendamento; o "Editar" e o "Reagendar" entram juntos na janela de detalhe. A #58 fica sem o "Reagendar" e sem RN020 e RF032; o corpo das duas issues muda, com o seu OK na conversa (Riscos). Nada é construído duas vezes.
- [ ] **2. O reagendamento na #58, com as etapas construídas aqui e reaproveitadas pela #59.** O "Reagendar" abre uma janela em etapas (data e horário pelos horários de `GET /api/public/company`; forma de pagamento; resumo da prévia de demonstração de `POST /api/me/appointments/preview`). A #58 ganha um quarto PR (cerca de 450 linhas, com a listagem dos horários de RN013 e RN015 escrita com TDD), e a #59 depende dessas etapas.

**Texto proposto (opção 1):**

- Corpo da #58: em "Requisitos", sai "RF032" e "RN020"; em "Escopo", "/appointments: atuais e histórico, com o status escrito (etiqueta da #56); detalhe; cancelar com confirmação, só no 'Agendado'; reagendar, só no 'Concluído'." passa a "... cancelar com confirmação, só no 'Agendado'."; o terceiro critério passa a "Dado um agendamento 'Agendado', quando abro o detalhe, então vejo 'Cancelar'; nos outros status, não (RN019)."; em "Fora do escopo", "A edição e o reagendamento do agendamento (#59)".
- Corpo da #59: em "Requisitos", entram UC25, RF032 e RN020; em "Escopo", "- O reagendamento abre o mesmo assistente a partir do detalhe de um 'Concluído' da #58, com o veículo e os serviços do original fixos, nas etapas de data e horário e de forma de pagamento e resumo (UC25)."; critério novo: "Dado um agendamento 'Concluído' do histórico, quando abro o detalhe, então vejo 'Reagendar', e o assistente começa na data e no horário, com o veículo e os serviços do original (RN020)."
- `docs/agendamento/meus-agendamentos.md` (L3), ações por status: "'Concluído', 'Reagendar' (RN020), que abre o assistente de agendamento a partir da data e do horário (#59)." entra com a #59; nesta tarefa, o módulo diz só "os outros, nenhuma nesta tela, além das da #59".

### L5. Rótulo de "Cancelar" no diálogo que cancela

**Problema.** `componentes.md` (Diálogos) diz que o `ConfirmDialog` tem "'Cancelar' e a ação nomeada pelo verbo". No cancelamento do agendamento, a ação é "Cancelar agendamento", e o botão que fecha sem fazer nada também seria "Cancelar": dois botões com o mesmo verbo e efeitos opostos, lado a lado. O wireframe usa "Voltar".

**Opções:**

- [X] **1. "Voltar" no lugar de "Cancelar" quando a ação é cancelar (recomendada).** O `ConfirmDialog` ganha a propriedade opcional do rótulo do botão que fecha, com "Cancelar" como padrão; só o cancelamento do agendamento usa "Voltar". O foco continua começando nele.
- [ ] **2. Manter "Cancelar" e chamar a ação de "Confirmar cancelamento".** Nenhuma mudança no componente, mas os dois botões continuam com o mesmo verbo, e a ação deixa de ser nomeada pelo que faz.

**Texto proposto (opção 1):** `docs/padroes/componentes.md`, Diálogos: "Ação irreversível ou de efeito relevante (excluir, desativar, cancelar) pede o diálogo de confirmação (`ConfirmDialog`), com 'Cancelar' e a ação nomeada pelo verbo, como 'Excluir'." passa a "Ação irreversível ou de efeito relevante (excluir, desativar, cancelar) pede o diálogo de confirmação (`ConfirmDialog`), com 'Cancelar' e a ação nomeada pelo verbo, como 'Excluir'; quando a ação é cancelar, o botão que fecha é 'Voltar', para os dois botões não terem o mesmo verbo." E "O foco começa em 'Cancelar'" passa a "O foco começa em 'Cancelar' (ou 'Voltar')".

### L6. Forma do cadastro de veículo

**Problema.** O UC05 manda pedir a placa primeiro e só depois, se ela não estiver cadastrada, o tipo, a marca, o modelo, a cor e o ano (RN036). O wireframe faz o contrário (tipo, depois os dados com a placa). `componentes.md` diz que o formulário em etapas usa o `StepForm`, cujo "Próximo" só confere os campos da etapa: ele não tem como consultar a placa antes de mostrar a etapa seguinte, nem como mudar a etapa pelo resultado.

**Opções:**

- [X] **1. Uma janela que começa pela placa e mostra o resto depois da consulta (recomendada).** Um único formulário: a placa e "Continuar"; depois da consulta, os dados preenchidos e sem edição (placa cadastrada) ou os campos vazios (placa nova), com "Voltar" para a placa. Não é um formulário extenso (RNF002): são seis campos, sem a indicação de etapas e sem mudar o `StepForm`. A #59 reaproveita a mesma janela.
- [ ] **2. Duas etapas no `StepForm`, com uma consulta antes da segunda.** O `StepForm` ganha uma função opcional chamada no "Próximo", e a indicação mostra "Placa" e "Dados". Segue a forma do wireframe, mas muda um componente compartilhado ainda sem uso nas telas, para um formulário de seis campos.

**Texto proposto (opção 1):** `docs/clientes/area-do-cliente.md`, seção "Meus veículos": "O cadastro começa pela placa (UC05, RN036). 'Continuar' consulta a placa: se ela já está cadastrada, a janela mostra o tipo, a marca, o modelo, a cor e o ano, sem edição, e o envio vincula o veículo à conta (FA01); se não, pede esses dados. 'Voltar' retorna à placa sem perder o que foi digitado. É uma janela só, sem indicação de etapas, porque o formulário não é extenso (RNF002)."

## Decisões técnicas

Nenhuma nova.

- Seguidas:
  - 0013: o porte vem da API, nunca calculado pela tela;
  - 0017: código em inglês, textos em português;
  - 0018: a placa identifica o veículo; a consulta antes do cadastro;
  - 0035 e 0052: testes antes do código nas funções de formatação; os componentes, à mão;
  - 0041: esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md`;
  - 0048: a troca de senha mantém a sessão deste navegador e encerra as outras;
  - 0049: componentes do shadcn/ui sobre Base UI;
  - 0051: `/profile` e `/appointments` continuam restritas ao cliente no `proxy.ts`;
  - 0053: datas e horários no fuso da empresa;
  - 0055: as duas telas com os dados de demonstração e o aviso, menos a troca de senha.

Escolhas locais, sem registro:

- O cliente da demonstração é Henrique Costa, e as datas dos agendamentos são relativas à semana atual.
- As abas de `/profile` ficam montadas (como em `/admin/settings`); as de `/appointments` montam a lista ao serem escolhidas, para ler de novo depois de um cancelamento.
- O tipo do veículo como grupo de botões de opção nativos, como o filtro do catálogo, sem componente novo do shadcn.
- A visibilidade das ações por status numa tabela de consulta da tela, que só orienta (RS008).

## Riscos e dúvidas

- **Tamanho dos PRs.** Estimativa em `src/`, sem testes nem README: PR 1 (conta) cerca de 400 linhas; PR 2 (veículos) cerca de 600, das quais 70 de dados fixos; PR 3 (agendamentos) cerca de 650, das quais 150 de dados fixos. Mais cerca de 60 de testes e 250 de documentação no total. Os PRs 2 e 3 passam das ~400 de `pull-request.md`, como o PR 2 da #57 (492, com 133 de dados). Se preferir, cada um se divide em dois (a lista primeiro, as janelas depois), em cinco PRs ao todo.
- **Conta exibida e conta da sessão.** A aba "Dados pessoais" mostra os dados de Henrique Costa, mas a troca de senha vale para a conta que entrou. O aviso de demonstração logo abaixo de "Dados da conta" diz que aqueles dados não estão ligados ao sistema; a seção "Senha" fica sem ele.
- **Senha atual errada na verificação.** Cada tentativa conta para o bloqueio de RS006 (cinco falhas seguidas, 15 minutos) e gasta uma das 30 entradas a cada 5 minutos do Supabase Auth local (decisão 0048); a verificação usa uma tentativa errada só.
- **Datas da demonstração.** Relativas à segunda-feira da semana atual: os "Agendado" ficam sempre no futuro e o histórico, no passado. O "Em execução" fica no dia da consulta, às 08:00, mesmo num domingo, quando a empresa não abre; o aviso de demonstração cobre isso.
- **Tipos provisórios.** Com a opção 1 de L1, os nomes ficam em `rotas.md`, e a fase 3 os segue; `isShared` é campo novo do contrato.
- **Pontos para a sua aprovação**, além das lacunas:
  - os três PRs, ou cinco;
  - com a opção 1 de L4, a edição do corpo da #58 e da #59 pelo texto proposto, com o seu OK na conversa;
  - a conta de teste de cliente no banco local, criada em `/register`, e a troca de senha real nela;
  - como na #56 e na #57: as chaves do banco local no `next start`, o cookie da sessão de teste no Lighthouse e as alterações temporárias dos dados de demonstração, sem commit.

## Fora do escopo

- As rotas `/api/me/*` (fase 3); a edição do agendamento e, com a opção 1 de L4, o reagendamento (#59).
- Partes do wireframe sem requisito: foto de perfil, "Cliente desde", "Sair" na página, a exclusão da conta pelo cliente, os grupos "Em andamento" e "Próximos", o "Agendar" no topo de `/appointments` (o cabeçalho já tem), o motivo do cancelamento e o "Box".
- A validação dos formulários de demonstração (decisão 0055, LT3), que entra com as rotas.
- Mudança no `seed-demo.sql`, no `seed.sql`, na troca de senha da #24 ou no cabeçalho.
- Testes automatizados de componentes (decisão 0052).
- Os documentos formais (#67).
