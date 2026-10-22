---
issue: 59
pull_request: 75
---

# Relatório: Telas do cliente com dados de demonstração: agendar serviço e editar o agendamento

Relatório parcial: PR 1 de 3, o PR #75, da base do assistente de agendamento (`Refs #59`), sem tela. O PR 2, de `/booking` (`Refs #59`), e o PR 3, da edição e do reagendamento em `/appointments` (`Closes #59`), vêm depois da incorporação deste e completam este relatório.

## O que foi feito

- **Datas e horários do assistente** (UC06 passo 9, RN013, RN035, decisão 0053): `formatCalendarDate` e `formatTime` leem o dia de calendário e o horário de um instante no fuso da empresa; `toCompanyInstant` escreve o instante de um dia e um horário escolhidos no formato da API (ISO 8601 com o deslocamento, lido do `Intl`); `formatMonth` e `formatLongDate` escrevem o mês e a data por extenso do calendário; `listStartTimes` lista os horários de início de um dia de funcionamento, de 30 em 30 minutos, fora da pausa; `WEEKDAY_SHORT_LABELS` traz o cabeçalho do calendário.
- **Corpo na demonstração** (decisão 0055, L6): a resposta de demonstração recebe o corpo da chamada, e o `useApiQuery` lê um `POST` que não grava, como a prévia, com o corpo na chave da leitura.
- **Serviços para agendar e prévia** (UC06, RF020 a RF022, RF024, RF026, RN006, RN008, RN009, RN010, RN012, RN014, RN031, RN034; L1): os tipos `BookableService`, `BookableAdditional` e `AppointmentPreview`; os 11 serviços principais e complementares ativos do `seed-demo.sql`, com os valores por porte ou fixos e os adicionais vinculados; a prévia de demonstração, calculada sobre esses dados, o percentual zero do `seed.sql` e os horários de funcionamento dele, com o serviço que não pode ser agendado fora dos itens.
- **Lista de demonstração:** as leituras `GET /api/me/bookable-services` e `POST /api/me/appointments/preview`, e as gravações `POST /api/me/appointments`, `PATCH /api/me/appointments/:id` e `POST /api/me/appointments/:id/reschedule`, que respondem `NOT_IMPLEMENTED`.

## Arquivos alterados

- `src/shared/format/date.ts`: as cinco funções de data.
- `src/shared/format/business-hours.ts`: `listStartTimes`.
- `src/shared/constants/weekdays.ts`: `WEEKDAY_SHORT_LABELS`.
- `src/lib/demo/routes.ts`: `DemoRequest` com o corpo e as cinco entradas.
- `src/lib/demo/match.ts` e `src/lib/api-client.ts`: o corpo até a resposta de demonstração.
- `src/hooks/use-api-query.ts`: o corpo opcional e o `POST`.
- `src/shared/api/appointments.ts`: `BookableService`, `BookableAdditional` e `AppointmentPreview`.
- `src/lib/demo/appointments.ts`: `answerBookableServices` e `answerAppointmentPreview`, com os serviços e os adicionais do seed.
- `tests/format/date.test.ts`, `tests/format/business-hours.test.ts` e `tests/lib/api-client.test.ts`: os casos novos.
- `docs/agendamento/rotas.md`, `docs/padroes/componentes.md`, `docs/padroes/testes.md` e os README de `src/shared/format/`, `src/lib/demo/` e `tests/lib/`.
- `memoria/tarefas/59-agendar-e-editar/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: aprovado, com 411 testes. Os 16 novos (11 de `date.test.ts`, 5 de `business-hours.test.ts` e o do corpo em `api-client.test.ts`) foram escritos antes do código e falharam antes dele (commit 5277c42); os de formatação passam também com o fuso do processo em Asia/Tokyo, UTC e America/Los_Angeles.
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, sem página nova.
- **Prévia de demonstração**, conferida à mão por um teste temporário, sem commit (decisão 0052), com os valores calculados à mão pelos horários do `seed.sql`:
  - Toyota SW4, "Polimento comercial", quarta às 09:00 → R$ 390,00, 4 h, previsão às 14:00 (atravessa a pausa);
  - Fiat Toro, "Higienização interna completa" e "Oxi-sanitização", quarta às 14:00 → R$ 550,00, 5 h 40 min, previsão na quinta às 09:40 (atravessa a noite);
  - Toyota SW4, "Lavagem técnica", sábado às 10:00 → R$ 220,00, 3 h, previsão na segunda às 09:00 (atravessa o domingo);
  - Fiat Toro, "Lavagem completa" e "Pretinho nos pneus", segunda às 16:00 → R$ 130,00, 1 h 40 min, previsão às 17:40;
  - 2 h às 16:00 → 18:00 (o encerramento); 40 min às 11:30 → 13:10 (a pausa);
  - sem a data, sem previsão; sem a forma de pagamento, sem percentual; um id que não é de serviço ativo fica de fora; o veículo de outra conta dá `NOT_FOUND`;
  - os 11 serviços com os valores do porte G (SW4) e GG (Toro) e os adicionais de cada principal.
- **Escopo:** nada em `src/app/api/`, `supabase/` ou `src/shared/validation/`, e nenhum import de `src/server/`.
- O PR 1 não tem tela; as telas são conferidas no Chrome a partir do PR 2.

## Documentação atualizada

- **Módulos:**
  - `docs/agendamento/rotas.md`: os campos de `GET /api/me/bookable-services` e de `POST /api/me/appointments/preview`;
  - `docs/padroes/componentes.md`: a resposta de demonstração que depende do corpo e a conferência das etapas sem o esquema;
  - `docs/padroes/testes.md`: os casos novos do cliente da API e da formatação.
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (campos dos serviços para agendar e da prévia) → `agendamento/rotas.md`;
  - L5 (conferência das etapas sem o esquema) → `componentes.md`;
  - L6 (prévia de demonstração que segue as escolhas) → `componentes.md` e o README de `src/lib/demo/`;
  - L2, L4, L7 e L8 entram no PR 2; L3, no PR 3.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar** (pela #67), até aqui:
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A:** a resposta de `GET /api/me/bookable-services` (paginada, com `id`, `name`, `description`, `type`, `category`, `price`, `durationMinutes` e `additionals`, dos serviços ativos de categorias ativas) e a de `POST /api/me/appointments/preview` (`services`, `subtotal`, `feePercent`, `total`, `estimatedDurationMinutes` e `estimatedEndAt`, com o serviço inativo fora dos itens);
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes de formatação cobrem o dia de calendário, o horário, o instante de um dia e um horário, o mês, a data por extenso e os horários de início de um dia; os do cliente da API, o corpo das leituras por `POST` na demonstração.

## Pendências

- **PR 2 (`/booking`):** a página e o assistente, com as etapas "Veículo", "Serviços", "Data e horário" e "Pagamento e resumo" e o "Resumo do pedido"; `docs/agendamento/agendar-servico.md` (L2, L4, L7, L8) e o "Cancelar" da primeira etapa numa página em `componentes.md`.
- **PR 3 (edição e reagendamento):** "Editar" e "Reagendar" no detalhe de `/appointments`, com o assistente numa janela, e a frase de UC26 FE01; L3 e as ações por status em `meus-agendamentos.md`.
