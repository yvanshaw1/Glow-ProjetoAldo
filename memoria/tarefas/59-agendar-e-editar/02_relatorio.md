---
issue: 59
pull_request: <número>
---

# Relatório: Telas do cliente com dados de demonstração: agendar serviço e editar o agendamento

Relatório parcial: PR 2 de 3. O PR #75, da base do assistente de agendamento (`Refs #59`, incorporado em aa60565), e o PR <número>, de `/booking` (`Refs #59`). O PR 3, da edição e do reagendamento em `/appointments` (`Closes #59`), vem depois da incorporação deste e completa este relatório.

## O que foi feito

- **Datas e horários do assistente** (UC06 passo 9, RN013, RN035, decisão 0053; PR #75): `formatCalendarDate` e `formatTime` leem o dia de calendário e o horário de um instante no fuso da empresa; `toCompanyInstant` escreve o instante de um dia e um horário escolhidos no formato da API (ISO 8601 com o deslocamento, lido do `Intl`); `formatMonth` e `formatLongDate` escrevem o mês e a data por extenso do calendário; `listStartTimes` lista os horários de início de um dia de funcionamento, de 30 em 30 minutos, fora da pausa; `WEEKDAY_SHORT_LABELS` traz o cabeçalho do calendário.
- **Corpo na demonstração** (decisão 0055, L6; PR #75): a resposta de demonstração recebe o corpo da chamada, e o `useApiQuery` lê um `POST` que não grava, como a prévia, com o corpo na chave da leitura.
- **Serviços para agendar e prévia** (UC06, RF020 a RF022, RF024, RF026, RN006, RN008, RN009, RN010, RN012, RN014, RN031, RN034; L1; PR #75): os tipos `BookableService`, `BookableAdditional` e `AppointmentPreview`; os 11 serviços principais e complementares ativos do `seed-demo.sql`, com os valores por porte ou fixos e os adicionais vinculados; a prévia de demonstração, calculada sobre esses dados, o percentual zero do `seed.sql` e os horários de funcionamento dele, com o serviço que não pode ser agendado fora dos itens.
- **Lista de demonstração** (PR #75): as leituras `GET /api/me/bookable-services` e `POST /api/me/appointments/preview`, e as gravações `POST /api/me/appointments`, `PATCH /api/me/appointments/:id` e `POST /api/me/appointments/:id/reschedule`, que respondem `NOT_IMPLEMENTED`.
- **Página `/booking`** ("Agendar serviço", UC06; PR <número>): o aviso de demonstração logo abaixo do título, o assistente em quatro etapas ("Veículo", "Serviços", "Data e horário" e "Pagamento e resumo", L2) num único formulário (RNF002) e, ao lado a partir de 1024 px ou abaixo no celular, o "Resumo do pedido". "Próximo" confere a escolha da etapa (L5), e a mensagem some assim que ela é feita.
- **Veículo** (UC06 passos 2 e 3, FE01, RF019, RN003, RN004): os veículos da conta como botões de opção, em páginas de 10, com o cadastro pela placa da área do cliente (UC05) acima da lista e, sem veículos, no estado vazio.
- **Serviços** (UC06 passos 4 a 6, FA01 a FA03, FE02, RF020 a RF022, RN005, RN006, RN009): os serviços para agendar com o valor do porte do veículo, como caixas de seleção, em páginas de 12; o principal marcado oferece os adicionais vinculados; desmarcá-lo tira os adicionais que nenhum outro principal marcado vincula (L8); trocar o veículo mantém os serviços e mostra os valores do novo porte.
- **Data e horário** (UC06 passos 9 e 10, RF025, RN013, RN015, RN016, L4): um calendário do mês, com o dia sem horário livre desativado, e os horários de início do dia escolhido, de 30 em 30 minutos, fora da pausa e sem os que já passaram, pelos horários de `GET /api/public/company`.
- **Pagamento e resumo** (UC06 passos 7, 8, 11 e 12, RF023, RF024, RF026, RN011): o veículo, a data, a previsão de conclusão, as quatro formas de pagamento e o total, logo acima de "Confirmar agendamento", que envia `POST /api/me/appointments` e, na demonstração, mostra o aviso de `NOT_IMPLEMENTED`.
- **Resumo do pedido** (RF021, RF024, RF026): o veículo, os serviços com o valor, o subtotal, o acréscimo ou desconto da forma de pagamento, o total, a duração estimada e a previsão de conclusão, todos da prévia.
- **Confirmação** (UC06 passo 13): "Agendamento confirmado", com o link para "Meus agendamentos", depois do 201 da rota (fase 3).
- **Formulário em etapas** (RNF002; PR <número>): no `StepForm`, a etapa atual ocupa a largura do seu título, que encolhe com reticências quando não cabe, sem transbordar a 360 px.

## Arquivos alterados

PR #75:

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

PR <número>:

- `src/app/(portal)/booking/page.tsx`: criado.
- `src/components/portal/appointments/booking-wizard.tsx`, `booking-vehicle-step.tsx`, `booking-services-step.tsx`, `booking-schedule-step.tsx`, `booking-payment-step.tsx` e `booking-summary.tsx`: criados.
- `src/components/shared/step-form.tsx`: a indicação das etapas.
- `docs/agendamento/agendar-servico.md`: criado.
- `docs/agendamento/CONTEXT.md` e `docs/padroes/componentes.md`.

Nos dois: `memoria/tarefas/59-agendar-e-editar/`, com o plano, as notas e este relatório.

## Testes executados

- `npm run check`: aprovado, com 411 testes. Os 16 novos (11 de `date.test.ts`, 5 de `business-hours.test.ts` e o do corpo em `api-client.test.ts`, PR #75) foram escritos antes do código e falharam antes dele (commit 5277c42); os de formatação passam também com o fuso do processo em Asia/Tokyo, UTC e America/Los_Angeles. Os componentes do PR <número> foram conferidos à mão (decisão 0052).
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, com `/booking` estática.
- **Prévia de demonstração** (PR #75), conferida à mão por um teste temporário, sem commit, com os valores calculados à mão pelos horários do `seed.sql`:
  - Toyota SW4, "Polimento comercial", quarta às 09:00 → R$ 390,00, 4 h, previsão às 14:00 (atravessa a pausa);
  - Fiat Toro, "Higienização interna completa" e "Oxi-sanitização", quarta às 14:00 → R$ 550,00, 5 h 40 min, previsão na quinta às 09:40 (atravessa a noite);
  - Toyota SW4, "Lavagem técnica", sábado às 10:00 → R$ 220,00, 3 h, previsão na segunda às 09:00 (atravessa o domingo);
  - Fiat Toro, "Lavagem completa" e "Pretinho nos pneus", segunda às 16:00 → R$ 130,00, 1 h 40 min, previsão às 17:40;
  - 2 h às 16:00 → 18:00 (o encerramento); 40 min às 11:30 → 13:10 (a pausa);
  - sem a data, sem previsão; sem a forma de pagamento, sem percentual; um id que não é de serviço ativo fica de fora; o veículo de outra conta dá `NOT_FOUND`.
- Local, no PR <número>, com o Supabase local, uma conta de teste de cliente só nele e o `next start`, no Chrome sem interface, a 360 × 800 e a 1440 × 900, claro e escuro, sem transbordar:
  - **Fluxo principal:** as mensagens de RF019 e de RN005 com o foco na primeira opção; "Lavagem completa" oferece os quatro adicionais; com o Toyota SW4, "Lavagem completa" e "Hidratação de couro" na quarta 28/10 às 14:00 e Pix, o resumo dá R$ 190,00, 2 h 10 min e previsão às 16:10. **RNF002:** de volta aos serviços, com "Oxi-sanitização" no lugar da hidratação, a data, o horário e o Pix continuam escolhidos, e o resumo passa a R$ 200,00. "Confirmar agendamento" passa a "Agendando…" e mostra o aviso de `NOT_IMPLEMENTED` no topo, com o foco.
  - **FA03 e L8:** a troca do SW4 pelo Fiat Toro mantém os serviços e muda a lavagem de R$ 100,00 para R$ 120,00; a "Cera de carnaúba" das duas lavagens fica com uma delas e sai com as duas.
  - **Janela de cadastro de veículo** dentro do assistente: a consulta da placa e o envio não mudam a etapa nem mostram mensagem; Esc devolve o foco ao botão.
  - **Teclado:** as setas nas opções e no calendário, pulando os dias desativados; "Próximo" leva o foco ao título da etapa; "Mês anterior" desativado no mês de hoje; o contorno de foco em todos os controles.
  - **Fuso e relógio:** com o Chrome no fuso de Tóquio, o calendário e os horários seguem Maceió; às 15:10, hoje oferece só de 15:30 a 17:30; às 18:00, hoje fica desativado.
  - **Estados** (alteração temporária dos dados de demonstração, sem commit): a falha dos veículos, dos serviços, da prévia e dos horários com "Tentar novamente"; os estados vazios de veículos e de serviços; a paginação de 12 veículos e de 14 serviços, com a escolha mantida; "Acréscimo de 5,00%" (R$ 105,00) e "Desconto de 2,50%" (R$ 97,50).
  - **Rede:** nenhuma chamada a `/api/me/*`.
  - **Lighthouse 13.5.0, acessibilidade:** 100 em `/booking` pela navegação e nas 24 capturas das etapas e da janela, no celular e no computador, claro e escuro.
  - **LCP no celular** (meta de 2,5 s, RNF006): 3,0 s com o estrangulamento simulado (desempenho 95); no computador, 0,7 s. **CLS:** 0,007 no celular e 0,021 no computador.
  - **Registro do `next start`**, acumulado nas cinco execuções: sem cookie, token, cabeçalho de autorização, senha, chave nem e-mail.
- **Pré-visualização:** passo do desenvolvedor (veja o PR).

## Documentação atualizada

- **Módulos:**
  - `docs/agendamento/rotas.md`: os campos de `GET /api/me/bookable-services` e de `POST /api/me/appointments/preview` (PR #75);
  - `docs/agendamento/agendar-servico.md`, novo: as etapas, os campos e os textos de `/booking` (PR <número>);
  - `docs/agendamento/CONTEXT.md`: o módulo novo;
  - `docs/padroes/componentes.md`: a resposta de demonstração que depende do corpo e a conferência das etapas sem o esquema (PR #75); o título da etapa atual com reticências e a primeira etapa sem "Cancelar" numa página (PR <número>);
  - `docs/padroes/testes.md`: os casos novos do cliente da API e da formatação.
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (campos dos serviços para agendar e da prévia) → `agendamento/rotas.md`;
  - L2 (ordem das etapas), L4 (escolha da data e do horário), L7 (textos do assistente) e L8 (adicional vinculado a mais de um principal) → `agendar-servico.md`; o "Cancelar" de L7 → `componentes.md`;
  - L5 (conferência das etapas sem o esquema) → `componentes.md`;
  - L6 (prévia de demonstração que segue as escolhas) → `componentes.md` e o README de `src/lib/demo/`;
  - L3 e a parte da edição e do reagendamento de L7 entram no PR 3.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar** (pela #67), até aqui:
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A:** a resposta de `GET /api/me/bookable-services` (paginada, com `id`, `name`, `description`, `type`, `category`, `price`, `durationMinutes` e `additionals`, dos serviços ativos de categorias ativas) e a de `POST /api/me/appointments/preview` (`services`, `subtotal`, `feePercent`, `total`, `estimatedDurationMinutes` e `estimatedEndAt`, com o serviço inativo fora dos itens);
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes de formatação cobrem o dia de calendário, o horário, o instante de um dia e um horário, o mês, a data por extenso e os horários de início de um dia; os do cliente da API, o corpo das leituras por `POST` na demonstração.

## Pendências

- **PR 3 (edição e reagendamento):** "Editar" e "Reagendar" no detalhe de `/appointments`, com o assistente numa janela, e a frase de UC26 FE01; L3 e as ações por status em `meus-agendamentos.md`; a parte da edição e do reagendamento em `agendar-servico.md`.
- **Pré-visualização**, passo do Yvan: `/booking` no celular e no computador, com o Lighthouse e o LCP no PR.
