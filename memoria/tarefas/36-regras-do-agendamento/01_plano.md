---
issue: 36
titulo: "Regras puras do agendamento: preço, datas e previsão, transições de status e edição"
areas: [backend, testes]
tipo: funcionalidade
requisitos: [RN005, RN006, RN009, RN010, RN012, RN013, RN014, RN015, RN016, RN017, RN018, RN019, RN020, RN032, RN033, RN034]
status: concluido
aprovado_por: yvan
aprovado_em: 20/10/2026
---

# Plano: Regras puras do agendamento: preço, datas e previsão, transições de status e edição

## Objetivo

Escrever com TDD, em `src/server/rules/`, as funções puras do módulo `appointments` descritas em `docs/agendamento/calculos.md`:

- preço e composição dos serviços (RN005, RN006, RN009, RN010, RN012);
- transições de status, com quem pode fazer cada uma (RN017 a RN020);
- duração estimada, início válido e previsão de conclusão (RN013 a RN016, RN034);
- o que o cliente e o funcionário podem mudar na edição (RN032, RN033).

O serviço `appointments` do painel (#49, #50) e, na fase 3, o do portal vão usá-las. Nenhuma rota, tela, tabela ou função SQL muda; não há migration nem dependência nova.

## Base da construção

- Ramificação `feat/36-scheduling-rules`, criada da `origin/main` (8e8480e, com a #21 à #26 e a #35), sem vínculo com a `main`, e `npm ci`.
- Contratos usados sem mudança:
  - `COMPANY_TIME_ZONE` (`src/shared/constants/time-zone.ts`, decisão 0053): os testes o passam às funções, como o serviço da #49 vai passar;
  - o apelido de `server-only` no `vitest.config.ts`, que deixa os testes importarem `src/server/`.
- Conferido no Node 24.11.1 (ICU 77.1): `Intl.DateTimeFormat` com `timeZone: "America/Maceio"` e `formatToParts` dá o dia da semana e o horário locais (`2026-11-23T12:00:00Z` é segunda, 09:00); o fuso fica em −03:00 o ano todo; o `Temporal` não existe nesta versão.

## Como funciona

Vale para os quatro arquivos:

- Todo arquivo começa com `import "server-only"` (`estrutura-de-pastas.md`) e não importa repositório, Supabase nem `process.env`, nem lê o relógio: o instante atual (`now`), o fuso e a disponibilidade chegam por parâmetro (`calculos.md`). Mais de três parâmetros: um objeto com campos nomeados (`codigo.md`).
- **Recusa como valor.** As conferências devolvem um código em inglês (`"DURING_BREAK"`), ou `null` quando está tudo certo, e não lançam erro. O serviço da #49 e da #50 converte cada código no erro da API: `VALIDATION_ERROR`, com a mensagem do campo, ou 409 `INVALID_STATUS`. Assim, cada teste confere o motivo da recusa, e não só que houve recusa.
- Os enums vêm de listas novas em `src/shared/constants/` (abaixo).

### Enums e intervalo (`src/shared/constants/`)

Valores e rótulos do glossário (`guia/mapa.md`), como listas `as const`, com o tipo derivado e os rótulos em português, no molde de `permissions.ts`. Só as listas que as regras usam:

| Arquivo | Constante | Valores | Rótulos |
|---|---|---|---|
| `appointment-statuses.ts` | `APPOINTMENT_STATUSES` | `scheduled`, `checked_in`, `in_progress`, `awaiting_payment`, `completed`, `cancelled`, `rescheduled` | Agendado, Em espera, Em execução, Finalizado, Concluído, Cancelado, Reagendado (RN017) |
| `service-types.ts` | `SERVICE_TYPES` | `main`, `additional`, `complementary` | Principal, Adicional, Complementar (RN006) |
| `pricing-modes.ts` | `PRICING_MODES` | `fixed`, `by_size` | Valor fixo, Por porte (RN009) |
| `vehicle-sizes.ts` | `VEHICLE_SIZES` | `small`, `medium`, `large`, `extra_large` | P, M, G, GG (RN002) |
| `time-slot.ts` | `TIME_SLOT_MINUTES` = 30 | – | intervalo dos horários do agendamento e da disponibilidade (RN035) |

As formas de pagamento e os tipos de veículo ficam para a primeira tarefa que os usa (#41 e #45): as regras recebem o percentual e o porte, não a forma nem o tipo.

### `pricing.ts`: preço e composição (RN005, RN006, RN009, RN010, RN012)

Valores em reais na entrada e na saída, como no banco (`numeric(10,2)`), na API e nas telas (`moneySchema`, `formatCurrency`); por dentro, em centavos inteiros (`api.md`): cada valor vira centavos com `Math.round(valor × 100)`, e o percentual, que tem até duas casas (RN035), vira centésimos de ponto. Assim, 0,10 + 0,20 dá 0,30, e não 0,30000000000000004.

| Função | Entrada | Saída |
|---|---|---|
| `calculateServicePrice` | o serviço (`pricingMode` com `fixedPrice` ou com os quatro `pricesBySize`) e o porte do veículo | `by_size`: o valor do porte; `fixed`: o valor fixo. O adicional é sempre `fixed` (garantido pelo banco) |
| `calculateTotal` | `subtotal` e `feePercent` (−100 a 100) | subtotal × (100 + percentual) / 100, arredondado ao centavo como em L1 |
| `priceServices` | os serviços, o porte e o percentual | o valor de cada item, o subtotal (soma, sem arredondamento) e o total |
| `findCompositionError` | os serviços, com o tipo e, nos adicionais, os principais a que estão vinculados | `"NO_MAIN_OR_COMPLEMENTARY"` sem nenhum principal ou complementar (RN005); `"ADDITIONAL_WITHOUT_MAIN"` com um adicional sem nenhum dos seus principais entre os escolhidos (RN006); senão `null` |

- `priceServices` serve ao novo agendamento, à prévia, à edição e ao reagendamento, sempre com o catálogo atual (RN020). `calculateTotal` serve à conclusão com troca da forma de pagamento (RN018) e ao total de cada forma no detalhe do agendamento `awaiting_payment` (`rotas.md`), a partir do subtotal gravado.
- O total é calculado só com inteiros: centavos × (10.000 + centésimos de ponto), arredondado a 10.000 avos. O maior subtotal (R$ 99.999.999,99, `numeric(10,2)`) dá 2 × 10¹⁴, abaixo do maior inteiro exato do JavaScript (9 × 10¹⁵).

### `status-transitions.ts`: transições (RN017 a RN020)

Tabela de consulta (`codigo.md`), com as linhas de `calculos.md`, seção 2:

| Ação | De | Para | Quem |
|---|---|---|---|
| `advance` | `scheduled` | `checked_in` | `staff` |
| `advance` | `checked_in` | `in_progress` | `staff` |
| `advance` | `in_progress` | `awaiting_payment` | `staff` |
| `complete` | `awaiting_payment` | `completed` | `staff` |
| `cancel` | `scheduled` | `cancelled` | `client`, `staff` |
| `cancel` | `checked_in` | `cancelled` | `staff` |
| `reschedule` | `completed` | `rescheduled` | `client`, `staff` |

- `findNextStatus({ action, status, actor })` devolve o status de destino, ou `null` quando a linha não existe (o serviço responde 409 `INVALID_STATUS`). As ações são as rotas de `rotas.md`. Quem faz: `client` ou `staff`; o admin conta como `staff`, porque a rota já conferiu a permissão `appointments`.
- `cancelled` e `rescheduled` não têm linha de saída: são finais, e o reagendado não é reagendado de novo (RN020). O novo agendamento `scheduled` do reagendamento é criado pelo serviço e pela função SQL (#50), não por esta tabela.
- A conclusão não depende da forma de pagamento; a troca só recalcula o total, por `calculateTotal`.

### `scheduling.ts`: duração, início e previsão (RN013 a RN016, RN034)

A disponibilidade chega como a lista de `business_hours`, com os campos de `PUT /api/admin/settings/business-hours`: `weekday` (0 = domingo a 6 = sábado), `isOpen`, `opensAt`, `closesAt`, `breakStartsAt` e `breakEndsAt`, os horários como `"HH:MM"` ou `null`. O repositório (#41, #49) tira os segundos do `time` do banco. Dia ausente da lista conta como fechado.

| Função | Saída |
|---|---|
| `calculateEstimatedDuration` | a soma das durações médias dos serviços, em minutos (RN014) |
| `findAvailabilityError({ startsAt, businessHours, timeZone })` | `"CLOSED_DAY"`; `"OUTSIDE_BUSINESS_HOURS"`, antes da abertura ou a partir do encerramento; `"DURING_BREAK"`; `"OFF_TIME_SLOT"`, fora de :00 e :30 ou com segundos; ou `null` (RN013, L4) |
| `findStartError({ startsAt, businessHours, timeZone, now })` | o erro acima; `"IN_THE_PAST"`, se `startsAt` for anterior a `now` (RN015); ou `null`. Serve ao novo agendamento e ao reagendamento |
| `calculateEstimatedEnd({ startsAt, durationMinutes, businessHours, timeZone })` | o instante da previsão (RN034), ou `null` se nenhum dia da semana estiver aberto |

- O dia da semana e o horário vêm do fuso recebido, por `Intl.DateTimeFormat(...).formatToParts`, sem biblioteca de datas.
- **Previsão.** A partir do início, percorre os períodos de trabalho de cada dia (da abertura à pausa e do fim da pausa ao encerramento, ou da abertura ao encerramento, sem pausa), consumindo a duração e pulando pausa, noite e dias fechados. O trabalho que acaba exatamente num limite termina nele (L4). Se o início estiver fora de um período, o que acontece com a data mantida na edição (L2), a contagem começa no próximo período. O dia de calendário avança sem fuso; só o início e o fim são convertidos entre instante e horário local.
- Nada aqui consulta outros agendamentos: sem capacidade nem conflito de horários (RN016, decisão 0014). O momento do registro também não é conferido: a disponibilidade restringe só o horário marcado (`calculos.md`).

### `editing.ts`: edição (RN032, RN033)

| Função | Saída |
|---|---|
| `canEditAppointment({ actor, status })` | `client`: só em `scheduled`; `staff`: em qualquer status (RN032). Com `false`, o serviço responde 409 `INVALID_STATUS` (`rotas.md`) |
| `findScheduleChangeError({ actor, status, scheduledAt, newScheduledAt, now, businessHours, timeZone })` | `null` se a data e o horário não mudam (L2). Senão, nesta ordem: o erro de `findAvailabilityError` (RN033, RN013); o cliente, `"NOT_AFTER_SCHEDULED"` se a nova data e o novo horário não forem posteriores aos marcados, e `"IN_THE_PAST"` se forem anteriores a `now`; o funcionário, em `scheduled`, `"IN_THE_PAST"`; em `checked_in`, `in_progress`, `awaiting_payment`, `completed` e `rescheduled`, `"AFTER_NOW"` se posteriores a `now`; em `cancelled`, só a disponibilidade (L3) |

- A comparação é do instante, data e horário juntos, como em `calculos.md`: de quarta às 10h para quinta às 9h é postergar.
- A edição nunca muda o status: estas funções não devolvem status, e a mudança de status só existe em `findNextStatus`.
- Os valores, a duração e a previsão da edição são recalculados por `priceServices`, `calculateEstimatedDuration` e `calculateEstimatedEnd` (RN033, decisão 0021); a cópia dos dados (RN037) é do serviço e da função SQL (#50).

## Ordem da construção

1. Criar a ramificação `feat/36-scheduling-rules` da `origin/main`, desfazer o vínculo com a `main` e rodar `npm ci`.
2. Escrever os testes dos quatro arquivos em `tests/rules/` (lista abaixo) e conferir que falham (vermelho). Eles vão num commit próprio, antes do código (decisões 0035 e 0052).
3. Listas de `src/shared/constants/`.
4. `pricing.ts`, `status-transitions.ts`, `scheduling.ts` e `editing.ts`, um commit por arquivo, cada um até os seus testes passarem (verde), com a refatoração depois, os testes passando.
5. Documentação: textos das lacunas e seção "Documentação".
6. Verificação: `npm run check` sem erros nem avisos, `npx next build` e `npm audit --omit=dev --audit-level=high` (o passo do CI). Sem banco local, navegador ou pré-visualização: nada visível muda, e o build da Vercel confere a compilação.
7. Etapa 03: as duas alterações do Yvan (seção "Riscos e dúvidas"), o PR e `02_relatorio.md`. Não há migration.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um serviço por porte de R$ 120,00 no porte G e um veículo SUV, quando o preço é calculado, então o item vale R$ 120,00 (RN009, RN002) | `tests/rules/pricing.test.ts`: "prices a by-size service with the price of the vehicle size", com o porte `large`. O porte G do SUV é a coluna gerada pelo banco (RN002, decisão 0013), já na migration; a regra recebe o porte |
| Dado o subtotal de R$ 200,00 e o crédito com acréscimo de 5%, quando o total é calculado, então vale R$ 210,00; com desconto de 100%, vale R$ 0,00 (RN010, RN012) | `pricing.test.ts`: "adds the surcharge of the payment method" e "gives a zero total with a full discount" |
| Dado só um serviço adicional, ou um adicional sem o seu principal, quando a composição é conferida, então é recusada (RN005, RN006) | `pricing.test.ts`: "rejects an additional service alone", "rejects an additional whose main service is not selected" e "rejects an additional with a main service it is not linked to" |
| Dado dois serviços de 60 e 90 minutos, quando a duração é calculada, então vale 150 minutos (RN014) | `tests/rules/scheduling.test.ts`: "sums the average durations" |
| Dado um agendamento "Agendado", quando o funcionário avança, então vai a "Em espera"; de "Finalizado", só a conclusão leva a "Concluído"; uma transição fora da tabela é recusada (RN017, RN018) | `tests/rules/status-transitions.test.ts`: "advances a scheduled appointment to checked in", "does not advance an awaiting-payment appointment", "completes an awaiting-payment appointment" e "rejects a transition outside the table" |
| Dado um agendamento "Agendado", quando o cliente ou o funcionário cancela, então ele vai a "Cancelado"; em "Em espera", só o funcionário cancela; em "Em execução", o cancelamento é recusado (RN019) | `status-transitions.test.ts`: "lets the client and the staff cancel a scheduled appointment", "lets only the staff cancel a checked-in appointment" e "does not cancel from in progress on" |
| Dado um agendamento "Concluído", quando reagendado, então o original vai a "Reagendado", que é final (RN020) | `status-transitions.test.ts`: "reschedules a completed appointment", "does not reschedule twice" e "allows nothing from cancelled or rescheduled" |
| Dado o expediente das 8h às 18h com pausa das 12h às 13h, quando o início é às 16h com 4 horas de serviço, então a previsão é às 10h do próximo dia aberto (RN034) | `scheduling.test.ts`: "crosses the night" (segunda 16:00 + 240 min → terça 10:00) e "skips a closed day" |
| Dado um início às 12h30, às 18h, às 9h15, num dia fechado ou antes do instante atual, quando conferido, então é recusado (RN013, RN015) | `scheduling.test.ts`: "rejects a start during the break", "rejects a start at closing time", "rejects a start off the 30-minute slots", "rejects a start on a closed day" e "rejects a start before now", cada um com o código esperado |
| Dado um agendamento "Agendado", quando o cliente tenta adiantar a data, então é recusado; o funcionário pode adiantar, mas não para o passado; de "Em espera" em diante, nunca para depois do momento da alteração (RN032, RN033) | `tests/rules/editing.test.ts`: "rejects an earlier date from the client, even in the future", "lets the staff bring a scheduled appointment forward", "rejects a past date from the staff in a scheduled appointment" e "rejects a date after the moment of the change from checked in on" |

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/server/rules/pricing.ts`, `status-transitions.ts`, `scheduling.ts`, `editing.ts` | criar |
| `src/shared/constants/appointment-statuses.ts`, `service-types.ts`, `pricing-modes.ts`, `vehicle-sizes.ts`, `time-slot.ts` | criar |
| `tests/rules/pricing.test.ts`, `status-transitions.test.ts`, `scheduling.test.ts`, `editing.test.ts` | criar |
| `docs/agendamento/calculos.md` | alterar (L1 a L4) |
| `docs/agendamento/RN033-coerencia-da-edicao.md` | alterar (L2, L3) |
| `docs/padroes/testes.md` | alterar: tabela de casos e `relacionados` |
| `memoria/tarefas/36-regras-do-agendamento/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |
| `.env.example` | **passo do Yvan**, na etapa 03: sem a linha `APP_URL=` |
| `memoria/tarefas/21-formatos-e-erros/01_plano.md` | **passo do Yvan**, na etapa 03: `aprovado_em` com o ano 2026 |

Os README de `src/server/rules/`, `tests/rules/` e `src/shared/constants/` já cobrem estes arquivos (as listas de enum, os rótulos e o intervalo de 30 minutos) e não mudam; `docs/plataforma/estrutura-de-pastas.md` também não.

### Em comum com outras tarefas em andamento

- Nenhum PR aberto (20/10/2026).
- **#37** (dados da empresa) e **#38** (documentos formais), da mesma onda, não tocam estes arquivos. O relatório desta tarefa lista os documentos formais a atualizar (L1 a L4).
- **#41, #44, #45, #46, #49 e #50** usam as listas de `src/shared/constants/` criadas aqui. Se começarem antes da incorporação desta, vão criar as mesmas listas; o melhor é começarem da `main` com a #36. A #49 e a #50 dependem desta (issues).

## Testes previstos

Valores esperados tirados das RN, de `calculos.md` e da opção recomendada de L1 a L4. Sem banco, rede ou relógio: o `now` é passado por cada teste (`testes.md`).

**Dados comuns.** A disponibilidade do `seed.sql` (`docs/configuracoes/dados.md`): segunda a sexta, das 08:00 às 18:00, com pausa das 12:00 às 13:00; sábado, das 08:00 às 12:00, sem pausa; domingo fechado. A semana vai da segunda, 23/11/2026, à segunda, 30/11/2026. Os instantes são escritos com o fuso, como a API os envia (`2026-11-23T16:00:00-03:00`), e o fuso é `COMPANY_TIME_ZONE`.

`tests/rules/pricing.test.ts`:

- prices a by-size service with the price of the vehicle size: P 80, M 100, G 120 e GG 150, porte `large` → 120 (critério; RN009)
- prices a fixed service with the same value for any size: 50, nos portes `small` e `extra_large` → 50 (RN009)
- prices an additional service with its fixed price: 30 → 30 (RN009)
- sums the items into the subtotal: 120 + 80 → 200 (RN010)
- sums cents without floating-point error: 0,10 + 0,20 → 0,30
- adds the surcharge of the payment method: itens de 120 e 80 com 5% → total 210 (critério; RN010, RN012)
- subtracts the discount of the payment method: com −3% → 194 (RN012)
- keeps the subtotal without adjustment: com 0% → 200 (RN012)
- gives a zero total with a full discount: com −100% → 0 (critério; RN012)
- applies a percent with two decimals: 99,90 com 2,75% → 102,65 (exato: 102,64725; RN035)
- rounds to the nearest cent: 99,90 com −3% → 96,90 (exato: 96,903)
- rounds half a cent up: 150,10 com 5% → 157,61 (exato: 157,605; L1)
- rounds half a cent up with a discount: 150,10 com −5% → 142,60 (exato: 142,595; L1)
- recalculates the total from the stored subtotal with another payment method: subtotal 200, do Pix sem ajuste para o crédito com 5% → 210 (RN018)
- prices the selection item by item: principal por porte (G, 120) e adicional (30) com −5% → itens 120 e 30, subtotal 150, total 142,50 (RN009, RN010)
- accepts a main service alone (RN005)
- accepts a complementary service alone (RN005)
- accepts an additional with the main service it is linked to (RN006)
- accepts an additional linked to one of the selected main services (RN006)
- rejects an empty selection → `NO_MAIN_OR_COMPLEMENTARY` (RN005)
- rejects an additional service alone → `NO_MAIN_OR_COMPLEMENTARY` (critério; RN005)
- rejects an additional whose main service is not selected: complementar e adicional vinculado a um principal ausente → `ADDITIONAL_WITHOUT_MAIN` (critério; RN006)
- rejects an additional with a main service it is not linked to: principal A e adicional vinculado só a B → `ADDITIONAL_WITHOUT_MAIN` (RN006)

`tests/rules/status-transitions.test.ts`:

- advances a scheduled appointment to checked in, by the staff (critério; RN017)
- advances a checked-in appointment to in progress (RN017)
- advances an in-progress appointment to awaiting payment (RN017)
- does not advance an awaiting-payment appointment: só a conclusão leva a `completed` (critério; RN017, RN018)
- completes an awaiting-payment appointment, by the staff (critério; RN018)
- does not complete before awaiting payment: `in_progress` → `null` (RN018)
- lets only the staff advance and complete: o cliente → `null` (RN017)
- lets the client and the staff cancel a scheduled appointment (critério; RN019)
- lets only the staff cancel a checked-in appointment: o cliente → `null` (critério; RN019)
- does not cancel from in progress on: `in_progress`, `awaiting_payment` e `completed`, pelos dois → `null` (critério; RN019)
- reschedules a completed appointment, by the client or the staff (critério; RN020)
- does not reschedule twice: `rescheduled` → `null` (RN020)
- allows nothing from cancelled or rescheduled: as quatro ações, pelos dois → `null` (critério; RN017)
- rejects a transition outside the table: `advance` de `completed` e `reschedule` de `scheduled` → `null` (critério; RN017)

`tests/rules/scheduling.test.ts`, com o `now` na segunda, 23/11, às 07:00, salvo indicação:

- sums the average durations: 60 + 90 → 150 (critério; RN014)
- accepts the first time of the day: segunda 08:00 (RN013)
- accepts the last slot before closing: segunda 17:30 (RN013)
- accepts a start at the end of the break: segunda 13:00 (L4)
- rejects a start at closing time: segunda 18:00 → `OUTSIDE_BUSINESS_HOURS` (critério; L4)
- rejects a start before opening: segunda 07:30 → `OUTSIDE_BUSINESS_HOURS` (RN013)
- rejects a start during the break: segunda 12:00 e 12:30 → `DURING_BREAK` (critério; RN013)
- rejects a start off the 30-minute slots: segunda 09:15 e 09:00:30 → `OFF_TIME_SLOT` (critério; RN035)
- rejects a start on a closed day: domingo 29/11 10:00 → `CLOSED_DAY` (critério; RN013)
- uses the hours of each weekday: sábado 28/11 11:30 aceito; 12:00 → `OUTSIDE_BUSINESS_HOURS` (RN013)
- treats a weekday missing from the list as closed → `CLOSED_DAY`
- reads the day and the time in the company's time zone: `2026-11-23T12:00:00Z` (segunda, 09:00 em Maceió) aceito; `2026-11-23T15:30:00Z` (12:30) → `DURING_BREAK` (decisão 0053)
- rejects a start before now: `now` segunda 10:10, início 10:00 → `IN_THE_PAST` (critério; RN015)
- accepts a start at the current instant: `now` e início na segunda, 10:00 (RN015)
- accepts a booking made while the company is closed: `now` domingo 29/11 22:00, início segunda 30/11 08:00 (`calculos.md`)
- ends on the same day: segunda 09:00 + 120 min → segunda 11:00 (RN034)
- crosses the break: segunda 11:00 + 120 min → segunda 14:00 (RN034)
- crosses the night: segunda 16:00 + 240 min → terça 10:00 (critério; RN034)
- skips a closed day: sábado 11:00 + 120 min → segunda 30/11 09:00 (sábado das 11h às 12h, domingo fechado, segunda das 8h às 9h; RN034)
- ends at closing time on the same day: segunda 16:00 + 120 min → segunda 18:00 (L4)
- ends at the start of the break: segunda 11:00 + 60 min → segunda 12:00 (L4)
- spans several days: segunda 08:00 + 2.400 min (40 h, a maior duração de um serviço, RN035) → sexta 27/11 12:00 (9 h por dia de segunda a quinta e 4 h na sexta)
- starts counting at the next period from a start outside the hours: domingo 10:00 + 60 min → segunda 30/11 09:00 (L2)
- gives no forecast without an open day: os sete dias fechados → `null`

`tests/rules/editing.test.ts`, com o agendamento marcado para quarta, 25/11, às 10:00, e o `now` na terça, 24/11, às 10:00, salvo indicação:

- lets the client edit a scheduled appointment (RN032)
- does not let the client edit from checked in on: os outros seis status → `false` (RN032; UC26 FE01)
- lets the staff edit in any status: os sete → `true` (RN032)
- accepts a later day at an earlier time from the client: quinta 26/11 09:00 (RN033)
- rejects an earlier date from the client, even in the future: quarta 09:00 → `NOT_AFTER_SCHEDULED` (critério; RN033)
- rejects a past date from the client for an overdue appointment: marcado segunda 23/11 10:00, nova terça 09:00 → `IN_THE_PAST` (RN015, RN033)
- checks the availability of the new date: quinta 12:30 → `DURING_BREAK`; domingo 29/11 10:00 → `CLOSED_DAY` (RN033, RN013)
- lets the staff bring a scheduled appointment forward: terça 14:00 (critério; RN033)
- rejects a past date from the staff in a scheduled appointment: terça 09:00 → `IN_THE_PAST` (critério; RN033)
- accepts a date up to the moment of the change after the vehicle arrives: `checked_in` marcado terça 09:00, nova 08:30 e nova 10:00, igual ao `now` (RN033)
- rejects a date after the moment of the change from checked in on: `checked_in`, `in_progress`, `awaiting_payment`, `completed` e `rescheduled`, marcados terça 09:00, nova terça 10:30 → `AFTER_NOW` (critério; RN033, L3)
- keeps checking the availability after the vehicle arrives: `in_progress` marcado terça 09:00, nova terça 07:30 → `OUTSIDE_BUSINESS_HOURS` (RN033)
- applies only the availability to a cancelled appointment: nova quinta 09:00 e nova segunda 23/11 09:00 → `null`; domingo 29/11 10:00 → `CLOSED_DAY` (L3)
- accepts an unchanged date: o cliente, em `scheduled`, com a mesma data → `null` (L2)
- accepts an unchanged overdue date from the staff: `scheduled` marcado segunda 23/11 10:00, mesma data → `null` (L2)
- accepts an unchanged date outside the current availability: quarta fechada na disponibilidade, mesma data → `null` (L2)

## Documentação

Além dos textos das lacunas, `docs/padroes/testes.md`, tabela de casos:

- "Cálculo de preço": "valor por porte e fixo, soma dos itens, acréscimo, desconto, desconto de 100%, arredondamento ao centavo (RN009, RN010, RN012)" passa a "valor por porte e fixo, soma dos itens, acréscimo, desconto, desconto de 100%, arredondamento ao centavo, inclusive o meio centavo; composição dos serviços (RN005, RN006, RN009, RN010, RN012)".
- "Datas e previsão": "fora do expediente, na pausa, em dia fechado, no passado; previsão atravessando a pausa, a noite e dias fechados (RN013, RN034)" passa a "duração estimada; fora do expediente, na pausa, em dia fechado, fora dos intervalos de 30 minutos, no passado; previsão atravessando a pausa, a noite e dias fechados e terminando no encerramento (RN013, RN014, RN015, RN034)".
- "Regras de edição": "cliente só posterga; funcionário adianta ou posterga; data incompatível com o status é recusada (RN032, RN033)" passa a "quem edita em cada status; cliente só posterga; funcionário adianta ou posterga; data incompatível com o status é recusada; data mantida (RN032, RN033)".
- `relacionados` ganha RN005, RN006, RN014 e RN015.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Desempate do arredondamento ao centavo

**Problema.** `calculos.md`, seção 1: "Cálculo em centavos inteiros, arredondado ao centavo mais próximo. A regra de desempate (meio centavo) não está definida: decidir no plano e cobrir com teste." O percentual tem até duas casas (RN035), então o total pode cair no meio centavo: R$ 150,10 com 5% dá R$ 157,605, e com desconto de 5%, R$ 142,595. Também não está dito se o arredondamento é do total ou do acréscimo ou desconto, o que muda o resultado no desconto. O banco guarda o subtotal, o percentual e o total, sem o valor do ajuste (`dados.md`).

**Opções:**

- [X] **1. Só o total, uma vez, com o meio centavo para cima (recomendada).** R$ 157,605 → R$ 157,61; R$ 142,595 → R$ 142,60. Como o total nunca é negativo, é o mesmo resultado do `round` do PostgreSQL (meio para longe do zero): uma consulta ou uma conferência em SQL chega ao mesmo valor. É o arredondamento que se faz à mão.
- [ ] **2. Só o total, com o meio centavo para o par (bancário, da ABNT NBR 5891).** R$ 157,605 → R$ 157,60; R$ 142,595 → R$ 142,60. Evita o viés de sempre subir numa soma de muitos valores, o que não acontece aqui (um total por agendamento), e difere do `round` do PostgreSQL.
- [ ] **3. O acréscimo ou o desconto, com o meio centavo para longe do zero, e o total como subtotal mais o ajuste.** Acréscimo de R$ 7,505 → R$ 7,51, total R$ 157,61; desconto de R$ 7,505 → R$ 7,51, total R$ 142,59. O cliente ganha o meio centavo no desconto, mas o valor do ajuste não é gravado, e o total deixa de ser o arredondamento do valor exato.

**Texto proposto (opção 1):**

- `docs/agendamento/calculos.md`, seção 1, terceiro item: "Cálculo em centavos inteiros, arredondado ao centavo mais próximo. A regra de desempate (meio centavo) não está definida: decidir no plano e cobrir com teste." passa a "Cálculo em centavos inteiros: as funções recebem e devolvem reais, como o banco, a API e as telas, e convertem para centavos por dentro. Só o total é arredondado, uma vez, ao centavo mais próximo, e o meio centavo sobe: R$ 150,10 com acréscimo de 5% (R$ 157,605) dá R$ 157,61, e com desconto de 5% (R$ 142,595), R$ 142,60. Como o total nunca é negativo, é o mesmo resultado do `round` do PostgreSQL."
- Documento formal a atualizar no relatório: Documentação de Arquitetura de Software, seção 4.2.

### L2. Edição que mantém a data marcada

**Problema.** RN033 diz que "a data e o horário devem respeitar a disponibilidade" e só depois trata de "se alterados pelo cliente" e "se alterados pelo funcionário". Não está dito se a edição que só troca veículo, serviços ou forma de pagamento confere de novo a data marcada. Conferida como uma data nova, ela seria recusada em casos comuns: o cliente que troca um serviço sem mudar a data não "posterga" (a data não é posterior à marcada); o funcionário não acrescenta um serviço a um agendamento "Agendado" cujo horário já passou; e uma mudança posterior da disponibilidade (#41) trava a edição dos agendamentos já marcados naquele horário. RN034 manda recalcular a previsão em toda edição, e `calculos.md` não diz de onde contar se a data marcada ficou fora do funcionamento.

**Opções:**

- [X] **1. As conferências de data valem só quando a data ou o horário mudam (recomendada).** A edição que mantém a data marcada não a confere de novo, mesmo que ela já tenha passado ou que a disponibilidade tenha mudado. A previsão é recalculada a partir dela; se ela ficou fora do funcionamento, a contagem começa no próximo período. Quem quiser mudar a data passa por todas as conferências.
- [ ] **2. A disponibilidade e o passado valem sempre; "só postergar" vale só quando a data muda.** O cliente edita serviços mantendo a data futura, mas o agendamento "Agendado" com o horário vencido só é editado mudando a data para o futuro, e a mudança da disponibilidade obriga a remarcar antes de editar qualquer outra coisa.

**Texto proposto (opção 1):**

- `docs/agendamento/RN033-coerencia-da-edicao.md`, depois de "A data e o horário devem respeitar a disponibilidade da empresa (RN013).": "A data e o horário só são conferidos quando alterados: a edição que mantém a data e o horário marcados não os confere de novo, mesmo que já tenham passado ou que a disponibilidade tenha mudado."
- `docs/agendamento/calculos.md`, seção 4, novo item depois de "Funcionário: ...": "As conferências de data só valem quando a data ou o horário mudam. A previsão é recalculada a partir da data marcada; se ela ficou fora do funcionamento, a contagem começa no próximo período."
- Documento formal a atualizar no relatório: Documentação de Análise do Sistema, seção 9.1 (Quadro 20, RN033).

### L3. Data na edição de um agendamento "Cancelado"

**Problema.** RN032 deixa o funcionário editar em qualquer status. RN033 só limita a data "enquanto o agendamento estiver Agendado" (nunca no passado) e "depois que o veículo chegou à empresa" (nunca depois do momento da alteração); `calculos.md` resume o segundo caso como "de `checked_in` em diante". O "Cancelado" fica fora da sequência de RN017 e pode vir de "Agendado", sem o veículo ter chegado, ou de "Em espera", com o veículo no local; o banco não guarda o status anterior. "Concluído" e "Reagendado" vêm depois da chegada.

**Opções:**

- [x] **1. No "Cancelado", só a disponibilidade (recomendada).** É a leitura literal de RN033: nenhuma das duas condições é conhecida. O agendamento cancelado não será atendido, e a data fica só como registro; o funcionário pode corrigi-la para qualquer data e horário de funcionamento.
- [ ] **2. A mesma regra dos status depois da chegada: nunca depois do momento da alteração.** Lê "de `checked_in` em diante" na ordem da tabela de RN017, em que "Cancelado" vem depois de "Concluído". O cancelado com data futura só pode ter a data movida para o passado.
- [ ] **3. A data do "Cancelado" não muda; os outros campos, sim.** Uma recusa nova, que RN032 e RN033 não preveem.

**Texto proposto (opção 1):**

- `docs/agendamento/RN033-coerencia-da-edicao.md`: "sem ser posteriores ao momento da alteração depois que o veículo chegou à empresa." passa a "sem ser posteriores ao momento da alteração depois que o veículo chegou à empresa (“Em espera”, “Em execução”, “Finalizado”, “Concluído” e “Reagendado”). No agendamento “Cancelado”, vale só a disponibilidade."
- `docs/agendamento/calculos.md`, seção 4: "Funcionário: qualquer status; em `scheduled`, nunca no passado; de `checked_in` em diante, nunca depois do momento da alteração." passa a "Funcionário: qualquer status; em `scheduled`, nunca no passado; em `checked_in`, `in_progress`, `awaiting_payment`, `completed` e `rescheduled`, nunca depois do momento da alteração; em `cancelled`, só a disponibilidade."
- Documento formal a atualizar no relatório: Documentação de Análise do Sistema, seção 9.1 (Quadro 20, RN033).

### L4. Limites do expediente e da pausa

**Problema.** `calculos.md` diz "entre `opens_at` (inclusive) e `closes_at`, fora da pausa" e dá o exemplo da previsão (16h + 4 h → 10h do dia seguinte), mas não diz se o início no fim da pausa (13h) é aceito, nem onde fica a previsão do trabalho que termina exatamente no encerramento ou no início da pausa: às 18h do mesmo dia ou no começo do período seguinte. O critério da issue só recusa 12h30 e 18h.

**Opções:**

- [X] **1. Início incluído e fim excluído, e a previsão no próprio limite (recomendada).** O expediente vai da abertura (inclusive) ao encerramento (exclusive), e a pausa, do início (inclusive) ao fim (exclusive): com pausa das 12h às 13h, 12h e 12h30 são recusados e 13h é aceito; 18h é recusado. O trabalho que termina no encerramento ou no início da pausa tem a previsão nesse horário: 16h + 2 h → 18h do mesmo dia; 11h + 1 h → 12h.
- [ ] **2. Previsão no começo do período seguinte.** Os limites do início são os mesmos, mas 16h + 2 h dá 8h do dia seguinte: a previsão mostra uma conclusão mais tarde que a soma das horas trabalhadas de RN034.

**Texto proposto (opção 1):**

- `docs/agendamento/calculos.md`, seção 3, primeiro item: "Início válido: dia aberto, entre `opens_at` (inclusive) e `closes_at`, fora da pausa, em múltiplo de 30 minutos e não anterior a `now`." passa a "Início válido: dia aberto, de `opens_at` (inclusive) a `closes_at` (exclusive), fora da pausa, de `break_starts_at` (inclusive) a `break_ends_at` (exclusive), em múltiplo de 30 minutos e não anterior a `now`. Com expediente das 8h às 18h e pausa das 12h às 13h, 8h, 13h e 17h30 são aceitos, e 12h, 12h30 e 18h, recusados."
- `docs/agendamento/calculos.md`, seção 3, segundo item, no fim: "O trabalho que termina exatamente no encerramento ou no início da pausa tem a previsão nesse horário: início às 16h com 2 horas → 18h do mesmo dia."
- Documento formal a atualizar no relatório: Documentação de Arquitetura de Software, seção 4.2.

## Decisões técnicas

Nenhuma nova.

- Seguidas:
  - 0035: testes antes do código, conferidos em vermelho;
  - 0052, que substituiu a 0050, a 0045 e a 0024 citada na issue: o Vitest testa as regras puras em `tests/rules/`;
  - 0053: o fuso chega às funções por parâmetro, e o serviço passa `COMPANY_TIME_ZONE`;
  - 0013: o porte vem do banco, e as regras recebem o porte, não o tipo do veículo;
  - 0014: sem capacidade nem conflito de horários;
  - 0021: valores sempre calculados pelo sistema na edição;
  - 0017, 0023 e 0036: código em inglês, TypeScript 6 e Node 24, pastas.

Escolhas locais, sem registro:

- Valores em reais na entrada e na saída, com centavos só por dentro: o banco, a API (`moneySchema`) e as telas já usam reais, e só o total é arredondado. Centavos na fronteira obrigariam o serviço e o repositório a converter nos dois sentidos.
- Recusas devolvidas como códigos, e não como `AppError`: o serviço escolhe o erro da API e a mensagem, e o teste confere o motivo.
- Fuso pelo `Intl.DateTimeFormat`, sem biblioteca de datas nem `Temporal`, ausente no Node 24.11.1.
- Horários da disponibilidade em `"HH:MM"`, os campos da rota de `business-hours`.
- Quem faz a ação como `client` ou `staff`, com o admin como `staff`.
- Listas de enum com os rótulos do glossário já nesta tarefa, embora só as telas os usem: #44, #45 e #46 vão precisar deles e podem andar em paralelo; vindo daqui, nenhuma cria a mesma lista.
- `TIME_SLOT_MINUTES` em `src/shared/constants/`, e não em `scheduling.ts`, porque a disponibilidade (#41) e a escolha de horário (#49) usam o mesmo intervalo (README da pasta).

## Riscos e dúvidas

- **Contrato com a #41, a #49 e a #50.** Os nomes das funções e dos campos podem ser ajustados na construção, com registro em `notas.md`. Os códigos de recusa são novos e não vão à API como estão: as mensagens de cada um e o campo de `fields` são da #49, que os documenta em `rotas.md`.
- **Fuso com horário de verão.** A conversão do horário local em instante usa o deslocamento do fuso no próprio dia. `America/Maceio` fica em −03:00 o ano todo; num fuso com horário de verão, a previsão poderia deslocar uma hora no dia da troca. Aceito pela decisão 0053.
- **Saída do `Intl`.** Os testes dependem só do dia da semana e do horário em números (`formatToParts`, `hourCycle: "h23"`), que não mudam entre versões do ICU.
- **Rótulos sem uso** até a primeira tela que os mostra (#44, #45, #46).
- **Tamanho do PR.** Estimativa de 350 a 450 linhas de código (regras e listas), cerca de 600 de testes e 40 de documentação: perto do limite de ~400 sem contar testes. Testes, listas e cada arquivo de regra vão em commits separados.
- **Pendência do Yvan para o PR desta tarefa** (pedida por ele na sessão da #35; detalhes em `notas.md`): dois commits dele, que o agente não pode fazer (`guia/regras.md`): o `.env.example` sem a linha `APP_URL=` (plano aprovado da #22, L3) e `aprovado_em: 00:04 19/10/2026` no plano da #21, no lugar do ano 2024. Na etapa 03, antes do PR, peço que ele os aplique no worktree desta tarefa; confiro o `.env.example` só por hash do Git (`git hash-object`), sem abrir o arquivo; os dois entram na descrição do PR ("Alterado") e no relatório.

## Fora do escopo

- Rotas, serviço `appointments`, repositórios, esquemas Zod da entrada e funções SQL (`create_appointment`, `update_appointment` e `reschedule_appointment`): #49 e #50. Lá ficam:
  - buscar o catálogo atual, o porte, o percentual da forma e a disponibilidade, e passar `COMPANY_TIME_ZONE` e o instante atual;
  - converter cada código de recusa em `VALIDATION_ERROR` ou 409 `INVALID_STATUS`, com as mensagens;
  - recusar serviço repetido ou inativo (RN008) e a cópia dos dados (RN037);
  - as ações oferecidas na tela, que não pode importar `src/server/` (RS008).
- Indicadores do dashboard (#51), que não ficam em `rules/` (`calculos.md`).
- Agendamento, edição, cancelamento e reagendamento pelo cliente (fase 3), que usarão as mesmas funções.
- Formas de pagamento e tipos de veículo em `src/shared/constants/` (#41, #45); o porte pelo tipo, calculado pelo banco (decisão 0013).
- Feriados: o sistema só conhece os dias da semana de `business_hours`.

## Estado da construção

Feito dentro do plano aprovado, na ramificação `feat/36-scheduling-rules` (commits 93b220c a 8e5db82): testes em vermelho, listas de `src/shared/constants/`, as quatro regras e a documentação de L1 a L4. `npm run check` aprovado, com 345 testes. Os desvios pequenos (redundâncias tiradas dos testes, um teste a mais e o tamanho de 581 linhas, mantido num PR só pelo Yvan) estão em `notas.md`. Relatório em `02_relatorio.md`.
