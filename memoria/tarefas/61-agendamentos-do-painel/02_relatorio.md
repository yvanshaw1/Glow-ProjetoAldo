---
issue: 61
pull_request: 84
---

# Relatório: Telas de agendamentos do painel com dados de demonstração: consulta, detalhe e status

Em quatro PRs: o da base (`Refs #61`, este), o da listagem, o do detalhe e das ações e o do reagendamento (`Closes #61`). Este relatório é parcial, com o PR 1; os outros PRs o completam, e o plano passa a `concluido` no PR 4. Até lá, o plano fica em `em_execucao`.

## O que foi feito

PR 1, base:

- **Tipos e constantes** (UC10, UC12, RF044, RF045): `AdminAppointmentSummary`, `PaymentOption` e `AdminAppointment`, com os campos de L2; `APPOINTMENT_VIEWS` (`today`, `future`, `history`), os status de cada visão (L1), `APPOINTMENT_SORTS` (`time`, `status`) e os rótulos "Hoje", "Futuros", "Histórico", "Horário" e "Status".
- **Dados de demonstração** (decisão 0055) de `GET /api/admin/appointments`, `GET /api/admin/appointments/:id` e `POST /api/admin/appointments/preview`: 50 agendamentos, relativos a hoje no fuso da empresa, dos 12 clientes e 14 veículos do `seed-demo.sql`, com os serviços e os preços por porte do seed e as taxas do `seed.sql` (zero); 6 em "Hoje" (os quatro em aberto da agenda do dashboard e dois de dias anteriores ainda em aberto), 8 em "Futuros" e 36 no "Histórico" (26 Concluído, 7 Cancelado e 3 Reagendado).
- **Listagem:** a visão (L1), o filtro por status, a busca por cliente, placa, marca e modelo, a ordenação por horário ou por status (L2) e a página de 20; `view` ausente ou inválida responde 400 `VALIDATION_ERROR` com a mensagem do campo.
- **Detalhe:** o agendamento com o nome do cliente, o veículo e os serviços copiados (RN037) e, só no "Finalizado", `paymentOptions` com o total de cada forma de pagamento (RF053); `id` desconhecido responde 404.
- **Prévia:** calculada como a do cliente (preço pelo porte, taxas do seed, duração e previsão pelo funcionamento do seed), para o reagendamento do PR 4.
- **Gravações:** `advance`, `complete`, `cancel` e `reschedule` entram em `routes.ts` sem `load` e respondem `NOT_IMPLEMENTED`.
- **Documentação das lacunas L1 e L2** em `rotas.md`.

## Arquivos alterados

PR 1:

- `src/shared/api/appointments.ts`: os três tipos novos.
- `src/shared/constants/appointment-views.ts`: criado.
- `src/lib/demo/admin-appointments.ts`: criado.
- `src/lib/demo/routes.ts`: as sete entradas.
- `src/lib/demo/appointments.ts`: exporta `CATALOG`, `PreviewBody` e `notFound`, e `previewOrder`, o cálculo que a prévia do cliente fazia, agora também usado pelo painel (a resposta da prévia do cliente não muda).
- `src/lib/demo/vehicles.ts`: exporta `SEED_VEHICLES` e `SeedVehicle`.
- `docs/agendamento/rotas.md`: L1 e L2.
- `memoria/tarefas/61-agendamentos-do-painel/`: `01_plano.md`, `notas.md` e este relatório.

## Testes executados

PR 1 (o roteiro e os resultados completos estão em `notas.md`):

- `npm run check`: formatação, tipos, lint e 414 testes, sem erros nem avisos (nenhum teste novo: não há função pura com regra de negócio; decisão 0052).
- `npx next build`: sem erros.
- Manual, sem tela (a página ainda não existe): as respostas e as entradas de `routes.ts` conferidas por um teste temporário do Vitest, com 45 casos e a data do sistema fixada em seis dias (sexta, sábado à noite, domingo, segunda, 29/02/2028 e 01/01/2027), apagado antes do commit: contagens por visão e por status, página 2 do Histórico com 16, cada agendamento numa visão só, dias úteis (e sábado só de manhã), ordenação, busca, `view` inválida e `id` desconhecido, coerência com a agenda do dashboard, `paymentOptions` só no "Finalizado" e a prévia.
- Nenhum import de `src/server/` e nada em `src/app/api/`, `supabase/` nem `src/shared/validation/`.

## Documentação atualizada

- Módulos: `docs/agendamento/rotas.md`.
- Lacunas resolvidas: L1 (o que cada visão mostra) e L2 (campos, busca e ordenação) → `rotas.md`. L3 a L5 entram com os PRs 2 a 4, no módulo novo `docs/agendamento/agendamentos-do-painel.md`.
- Decisões: nenhuma.
- Documentos formais a atualizar (#67): Arquitetura de Software, Apêndice A: os campos de `GET /api/admin/appointments` e de `GET /api/admin/appointments/:id` (L1 e L2). Nenhuma `RN` muda.

## Pendências

- Os PRs 2 a 4 da #61: a listagem e o cartão, o detalhe e as ações, e o reagendamento.
- Ligar as rotas reais e tirar a demonstração: a consulta na #46 e as ações de status na #50; cada uma tira as suas entradas de `src/lib/demo/routes.ts`, e a que tirar a última remove `src/lib/demo/admin-appointments.ts` e o aviso da tela.
- O PR 1 passa das ~400 linhas de `pull-request.md`: 538 em `src/`, cerca de 90 delas de dados fixos.
