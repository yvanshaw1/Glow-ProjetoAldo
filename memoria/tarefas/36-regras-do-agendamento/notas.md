# Notas: 36-regras-do-agendamento

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-20 – descoberta

Conferências do planejamento, sem alterar o código do projeto:

- **Worktree.** O desta sessão é `36-regras-do-agendamento-05611e`, na ramificação `claude/36-regras-do-agendamento-05611e`, em 8e8480e, igual à `origin/main` (#21 a #26 e #35). O plano e as notas ficam sem commit, como nas etapas 01 anteriores. A etapa 02 cria `feat/36-scheduling-rules` a partir da `origin/main`.
- **Outras tarefas.** Nenhum PR aberto. Issues abertas: #36 a #51. A #49 e a #50 dependem desta; a #41 deixa para a #36 e a #49 o uso da disponibilidade e dos percentuais. A pasta de notas compartilhadas da sessão que iniciou esta estava vazia.
- **Código atual.**
  - `src/server/rules/` e `tests/rules/` só têm o README.
  - `src/shared/constants/` tem `pagination.ts`, `permissions.ts`, `profiles.ts` e `time-zone.ts` (`COMPANY_TIME_ZONE`); nenhuma lista de status, tipo de serviço, precificação, porte, forma de pagamento ou tipo de veículo existe ainda. O README da pasta já prevê essas listas, os rótulos e o intervalo de 30 minutos.
  - O `vitest.config.ts` troca `server-only` pelo módulo vazio, e os testes de `src/server/` já o usam.
  - Dinheiro: `moneySchema` e `formatCurrency` usam reais; `api.md` manda calcular em centavos inteiros no servidor e enviar número com duas casas.
  - `percentSchema` aceita até duas casas; `payment_fees.percent` é `numeric(5,2)`, de −100 a 100.
  - `PUT /api/admin/settings/business-hours` recebe `weekday, isOpen, opensAt, closesAt, breakStartsAt, breakEndsAt`.
- **Node 24.11.1 (ICU 77.1, tz 2025b).** `Intl.DateTimeFormat("en-US", { timeZone: "America/Maceio", weekday: "short", hourCycle: "h23", ... }).formatToParts` dá o dia e o horário locais: `2026-11-23T16:00:00-03:00` é "Mon" 16:00; `2026-11-23T02:30:00Z` é "Sun" 22/11 23:30. O deslocamento de Maceió é −03:00 em janeiro e julho de 2026 e em 2019. `globalThis.Temporal` é `undefined`.
- **Datas dos testes.** 23/11/2026 é segunda; 28/11, sábado; 29/11, domingo; 20/11 é sexta e feriado nacional, por isso a semana de 23/11.
- **Arredondamento** (conta em centavos inteiros, conferida no Node): 150,10 com 5% é 157,605 exato, e o cálculo ingênuo em ponto flutuante (`Math.round(150.1 * 1.05 * 100) / 100`) dá 157,60, errado para qualquer regra que suba o meio centavo; em centavos, 15.010 × 10.500 / 10.000 = 15.760,5. Com −5%: 142,595 exato. 99,90 com 2,75% é 102,64725; com −3%, 96,903. 0,1 + 0,2 em ponto flutuante dá 0,30000000000000004; em centavos, 0,30.
- **Pendência do Yvan para o PR desta tarefa** (`side-session-notes/local_9c2986b7-.../pendencia-data-plano-21.md`): o `.env.example` sem a linha `APP_URL=` (plano aprovado da #22, L3) e `aprovado_em: 00:04 19/10/2026` no plano da #21, hoje com 2024. As duas estão como alterações locais sem commit na cópia principal do Yvan (pasta `App`). Na etapa 03, antes do PR: pedir ao Yvan que as aplique no worktree desta tarefa e faça os dois commits (mensagens sugeridas: `chore(env): remove APP_URL from the example environment` e `docs(tasks): fix the approval year of the #21 plan`); conferir o `.env.example` só por hash do Git, sem abrir o arquivo (igual ao da `main` sem a linha, mantendo a falta de quebra de linha no fim); listar os dois em "Alterado" no PR e no relatório. Depois da incorporação, o Yvan descarta as duas da cópia principal com `git restore` e faz o `git pull`.

## 2026-10-20 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas:

- L1, desempate do arredondamento: recomendado só o total, uma vez, com o meio centavo para cima (igual ao `round` do PostgreSQL para total não negativo);
- L2, edição que mantém a data: recomendado conferir a data só quando ela muda, com a previsão contada a partir do próximo período se a data marcada ficou fora do funcionamento;
- L3, data na edição de um "Cancelado": recomendado só a disponibilidade;
- L4, limites do expediente e da pausa: recomendado início incluído e fim excluído, com a previsão no próprio limite (16h + 2 h → 18h).

Nenhuma decisão técnica nova; escolhas locais listadas no plano (reais na fronteira e centavos por dentro, recusas como códigos, `Intl` sem biblioteca, listas de enum com rótulos em `src/shared/constants/`, `TIME_SLOT_MINUTES`). Nada foi construído; não há migration nem dependência nova.

## 2026-10-20 – decisão

Plano aprovado por yvan (20/10/2026), com a opção 1 em L1 a L4. Status em `em_execucao`. Ramificação `feat/36-scheduling-rules` criada da `origin/main` (8e8480e), sem vínculo com a `main`, e `npx -y npm@11.21.1 ci`; os 250 testes anteriores passavam.

Durante a construção, o Yvan pediu para reorganizar a pasta `tests/` contra mistura e redundância de testes e, em seguida, desistiu do pedido ("ignore isto de reorganizar a pasta de testes"). Nada da pasta foi reorganizado; só as redundâncias dos testes desta tarefa foram tiradas (abaixo).

## 2026-10-20 – desvio

Etapa 02, construção. Commits, nesta ordem:

- 93b220c: testes dos quatro arquivos, em vermelho (os quatro sem módulo);
- 0d598c5: listas de `src/shared/constants/` e `TIME_SLOT_MINUTES`;
- dca8b21: `pricing.ts` (23 testes verdes);
- b2f6cdf: `status-transitions.ts` (16);
- f2e2cea: `scheduling.ts` (25);
- adf1415: `editing.ts` (31; 95 nas regras);
- 8e5db82: `calculos.md`, RN033 e `testes.md` (L1 a L4).

Desvios pequenos, sem mudar regra nem escopo:

- **Redundâncias tiradas dos testes**, a partir do pedido do Yvan: "does not reschedule twice" entrou em "allows nothing from rescheduled" (o mesmo caso aparecia nos dois), e "recalculates the total from the stored subtotal..." ficou só com a troca para o crédito, sem repetir o total sem ajuste.
- **Teste a mais:** "checks the hours without the current instant", de `findAvailabilityError`, que a edição usa sem o `now`.
- **Nomes dos contratos:** `PricedService` (`id` e a precificação), `CompositionService` com `linkedMainServiceIds`, `BusinessDay`, `AppointmentAction`, `AppointmentActor`, `AvailabilityError`, `StartError` e `ScheduleChangeError`.
- **Edição:** o limite de data do funcionário por status é a tabela `STAFF_DATE_LIMITS` (`codigo.md`: comportamento por valor fixo em tabela de consulta), com `cancelled` sem limite (L3).
- **Fuso:** a conversão do horário local em instante toma o deslocamento duas vezes, na hora local e na primeira estimativa. Conferido num teste temporário, apagado antes do commit: as trocas de horário de verão de `America/New_York` (8/3 e 1/11/2026) e a virada do ano em Maceió.
- **Tamanho:** 581 linhas em `src/` (cerca de 200 de comentários e quebras do Prettier), acima da estimativa de 350 a 450 e do limite de ~400 do procedimento de PR; testes com 890 linhas. Na etapa 03, perguntar ao Yvan se divide em dois PRs (preço e transições; datas e edição) ou mantém um só.

## 2026-10-20 – descoberta

Verificação: `npm run check` sem erros nem avisos, com 345 testes (16 arquivos); `npx next build` concluído; `npm audit --omit=dev --audit-level=high` com 0 vulnerabilidades. Sem banco local, navegador ou pré-visualização: nada visível mudou. O `tsc --noEmit` sem o `next typegen` acusa `LayoutProps` e `PageProps`, o que é esperado; o `npm run check` roda o `typegen` antes.

## 2026-10-20 – decisão

O Yvan decidiu manter a #36 num PR só, apesar das 581 linhas em `src/`. Etapa 03: a `origin/main` continua em 8e8480e, então não houve merge; relatório gravado e plano em `concluido`. Antes do PR, falta o Yvan aplicar no worktree desta tarefa os dois commits da pendência (`.env.example` sem `APP_URL=` e o ano de `aprovado_em` no plano da #21).
