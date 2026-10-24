---
issue: 61
pull_request: 86
---

# Relatório: Telas de agendamentos do painel com dados de demonstração: consulta, detalhe e status

Em quatro PRs: o PR #84, da base (`Refs #61`, incorporado em ead3ea4); o PR #85, da listagem (`Refs #61`, incorporado em 93a24ae); o PR #86, do detalhe e das ações (`Refs #61`, este); e o do reagendamento (`Closes #61`). Este relatório é parcial, com os PRs 1 a 3; o PR 4 o completa, e o plano passa a `concluido` nele. Até lá, o plano fica em `em_execucao`.

## O que foi feito

PR #84, base:

- **Tipos e constantes** (UC10, UC12, RF044, RF045): `AdminAppointmentSummary`, `PaymentOption` e `AdminAppointment`, com os campos de L2; `APPOINTMENT_VIEWS` (`today`, `future`, `history`), os status de cada visão (L1), `APPOINTMENT_SORTS` (`time`, `status`) e os rótulos "Hoje", "Futuros", "Histórico", "Horário" e "Status".
- **Dados de demonstração** (decisão 0055) de `GET /api/admin/appointments`, `GET /api/admin/appointments/:id` e `POST /api/admin/appointments/preview`: 50 agendamentos, relativos a hoje no fuso da empresa, dos 12 clientes e 14 veículos do `seed-demo.sql`, com os serviços e os preços por porte do seed e as taxas do `seed.sql` (zero); 6 em "Hoje" (os quatro em aberto da agenda do dashboard e dois de dias anteriores ainda em aberto), 8 em "Futuros" e 36 no "Histórico" (26 Concluído, 7 Cancelado e 3 Reagendado).
- **Listagem:** a visão (L1), o filtro por status, a busca por cliente, placa, marca e modelo, a ordenação por horário ou por status (L2) e a página de 20; `view` ausente ou inválida responde 400 `VALIDATION_ERROR` com a mensagem do campo.
- **Detalhe:** o agendamento com o nome do cliente, o veículo e os serviços copiados (RN037) e, só no "Finalizado", `paymentOptions` com o total de cada forma de pagamento (RF053); `id` desconhecido responde 404.
- **Prévia:** calculada como a do cliente (preço pelo porte, taxas do seed, duração e previsão pelo funcionamento do seed), para o reagendamento do PR 4.
- **Gravações:** `advance`, `complete`, `cancel` e `reschedule` entram em `routes.ts` sem `load` e respondem `NOT_IMPLEMENTED`.
- **Documentação das lacunas L1 e L2** em `rotas.md`.

PR 2, listagem:

- **Página `/admin/appointments`** (UC10): o título "Agendamentos", o aviso de demonstração logo abaixo dele e as abas "Hoje", "Futuros" e "Histórico" (RF044), cada uma com a descrição da visão e a sua listagem, que lê a rota de novo quando a aba é escolhida.
- **Controles** (RF045 a RF049): a busca "Buscar por cliente ou veículo" (300 ms), o filtro "Filtrar por status" com os status da visão, a ordenação por horário ou por status, "Limpar filtros", que tira a busca, o status e a ordem numa ação só e leva o foco à busca, e "Atualizar". Nada fica desativado na leitura, e o foco não sai do controle usado.
- **Cartão** (RN017, RN037): a etiqueta de status, o cliente, o veículo e a placa, a data, a previsão de conclusão, os serviços e o total; uma coluna no celular, duas a partir de 768 px e três a partir de 1280 px.
- **Estados** (RNF004, UC10 FE01): na primeira leitura, o lugar reservado; numa nova leitura, os cartões anteriores em "Carregando"; sem agendamentos, a mensagem de cada visão ou a de busca sem resultado; na falha, o aviso com "Tentar novamente". Paginação de 20 (RNF008).
- **Documentação:** o módulo `agendamentos-do-painel.md` (visões, controles, cartão e estados).

PR 3, detalhe e ações:

- **Detalhe** (UC10 FA06 e FA07, RN037): o botão "Ver detalhes" no cartão abre a janela "Detalhes do agendamento", que lê o agendamento: cliente, datas, duração, veículo, serviços, forma de pagamento, subtotal, acréscimo ou desconto e total; no "Finalizado", "Total por forma de pagamento", como a rota devolve (RF053).
- **Ações por status** (RN017, RN018, RN019): "Avançar para <próximo status>" no "Agendado", no "Em espera" e no "Em execução", sem confirmação (UC12); "Cancelar agendamento", com confirmação, no "Agendado" e no "Em espera" (FA02); "Concluir" no "Finalizado". Nos outros status, nenhuma. A falha, como o `NOT_IMPLEMENTED` da demonstração, aparece no topo da janela, com o foco; no 409 `INVALID_STATUS`, o detalhe lê o agendamento de novo (FE01).
- **Conclusão** (UC12 FA01, RF053, RN010, RN012): janela com o resumo, as quatro formas de pagamento com o total de cada uma e a marca de escolhida, e o "Total" da forma marcada; "Confirmar conclusão" envia `paymentMethod`.
- **Documentação:** o detalhe, as ações, o cancelamento e a conclusão em `agendamentos-do-painel.md`.

## Arquivos alterados

PR #84:

- `src/shared/api/appointments.ts`: os três tipos novos.
- `src/shared/constants/appointment-views.ts`: criado.
- `src/lib/demo/admin-appointments.ts`: criado.
- `src/lib/demo/routes.ts`: as sete entradas.
- `src/lib/demo/appointments.ts`: exporta `CATALOG`, `PreviewBody` e `notFound`, e `previewOrder`, o cálculo que a prévia do cliente fazia, agora também usado pelo painel (a resposta da prévia do cliente não muda).
- `src/lib/demo/vehicles.ts`: exporta `SEED_VEHICLES` e `SeedVehicle`.
- `docs/agendamento/rotas.md`: L1 e L2.

PR 2:

- `src/app/(admin)/admin/appointments/page.tsx`: criado.
- `src/components/admin/appointments/appointment-views.tsx`, `appointment-list.tsx` e `appointment-card.tsx`: criados.
- `docs/agendamento/agendamentos-do-painel.md`: criado; `docs/agendamento/CONTEXT.md`: a linha do módulo novo.

PR 3:

- `src/components/admin/appointments/appointment-details-dialog.tsx`, `advance-button.tsx` e `complete-appointment-dialog.tsx`: criados.
- `src/components/admin/appointments/appointment-card.tsx` e `appointment-list.tsx`: o botão "Ver detalhes" e a releitura da listagem.
- `docs/agendamento/agendamentos-do-painel.md` e `docs/agendamento/CONTEXT.md`.

Nos três: `memoria/tarefas/61-agendamentos-do-painel/`, com o plano, as notas e este relatório.

## Testes executados

PR #84 (o roteiro e os resultados completos estão em `notas.md`):

- `npm run check`: formatação, tipos, lint e 414 testes, sem erros nem avisos (nenhum teste novo: não há função pura com regra de negócio; decisão 0052).
- `npx next build`: sem erros.
- Manual, sem tela (a página ainda não existia): as respostas e as entradas de `routes.ts` conferidas por um teste temporário do Vitest, com 45 casos e a data do sistema fixada em seis dias (sexta, sábado à noite, domingo, segunda, 29/02/2028 e 01/01/2027), apagado antes do commit: contagens por visão e por status, página 2 do Histórico com 16, cada agendamento numa visão só, dias úteis (e sábado só de manhã), ordenação, busca, `view` inválida e `id` desconhecido, coerência com a agenda do dashboard, `paymentOptions` só no "Finalizado" e a prévia.
- Nenhum import de `src/server/` e nada em `src/app/api/`, `supabase/` nem `src/shared/validation/`.

PR 2 (o roteiro e os resultados completos estão em `notas.md`):

- `npm run check` (414 testes, sem mudança: a tela é conferida à mão, decisão 0052) e `npx next build`, sem erros nem avisos.
- Local, com o banco local, o admin de teste e o `next start` num Chrome sem interface: a página a 360 × 800 e 1440 × 900, claro e escuro, sem transbordar; Hoje com 6 cartões, Futuros com 8 e Histórico com "1–20 de 36" e "21–36 de 36" na página 2; em "Histórico", o filtro "Cancelado" mostra "1–7 de 7" e "Limpar filtros" volta a "1–20 de 36", com o foco na busca; a ordem por status; a busca por cliente, placa e modelo e sem resultado; "Atualizar" com a listagem em "Carregando", o foco no botão e nada desativado.
- Falha da leitura com "Tentar novamente" (uma leitura só, sem repetir sozinha, e a nova leitura pelo teclado), as três visões vazias e a leitura lenta, por alteração temporária de `src/lib/demo`, desfeita por `git checkout -- src/lib` e conferida por `git status`.
- Pelo teclado: Tab percorre a busca, os dois seletores e "Atualizar"; Enter abre a lista, as setas e Enter escolhem, Esc fecha, e o foco fica no seletor.
- Lighthouse 13.5.0 em `/admin/appointments`, com o cookie da sessão de teste: acessibilidade 100 no celular e no computador, claro e escuro, e 100 nas 20 capturas de estado; desempenho no celular 94 (LCP 3,1 s simulado, CLS 0, TBT 50 ms) e no computador 100.
- Registro do `next start`: 249 linhas, sem cookie, token, cabeçalho de autorização, senha nem e-mail de teste, e sem linha de erro ou aviso; nenhuma requisição a `/api/admin/*`.

PR 3 (o roteiro e os resultados completos estão em `notas.md`):

- `npm run check` (414 testes) e `npx next build`, sem erros nem avisos.
- Local, com o banco local, o admin de teste e o `next start` num Chrome sem interface, a 360 × 800 e 1440 × 900, claro e escuro, sem transbordar e com a janela dentro da tela: as ações de cada um dos sete status; "Total por forma de pagamento" só no "Finalizado"; "Avançar" com "Avançando…" e a recusa no topo, com o foco; a confirmação do cancelamento (foco em "Voltar", recusa dentro dela); a conclusão (foco em "Cancelar", escolha de "Pix" pelo teclado, "Concluindo…", recusa no topo, Esc fecha só ela).
- Por alteração temporária de `src/lib`, desfeita por `git checkout -- src` e conferida por `git status`: taxas diferentes de zero (totais e "Acréscimo" ou "Desconto" de cada forma e do total), falha da leitura do detalhe e da conclusão, gravação com sucesso (as janelas fecham e a listagem é lida de novo) e 409 `INVALID_STATUS` (aviso, e o detalhe passa ao status atual).
- Lighthouse 13.5.0 em `/admin/appointments`: acessibilidade 100 no celular e no computador, claro e escuro, e 100 nas 24 capturas de estado; desempenho no celular 93 (LCP 3,2 s simulado, CLS 0) e no computador 100.
- Registro do `next start`: sem cookie, token, senha nem e-mail de teste, e nenhuma requisição a `/api/admin/*`.

## Documentação atualizada

- Módulos: `docs/agendamento/rotas.md` (PR #84), `docs/agendamento/agendamentos-do-painel.md` (novo no PR #85, com o detalhe e as ações no PR 3) e `docs/agendamento/CONTEXT.md`.
- Lacunas resolvidas: L1 (o que cada visão mostra) e L2 (campos, busca e ordenação) → `rotas.md`; L1 e a parte da listagem de L5 → `agendamentos-do-painel.md`; L3 (ações no detalhe, `Avançar para <status>`), L4 (conclusão) e o restante de L5 → o mesmo módulo, no PR 3. O reagendamento entra com o PR 4.
- Decisões: nenhuma.
- Documentos formais a atualizar (#67): Arquitetura de Software, Apêndice A: os campos de `GET /api/admin/appointments` e de `GET /api/admin/appointments/:id` (L1 e L2). Nenhuma `RN` muda.

## Pendências

- O PR 4 da #61: o reagendamento.
- Foco depois de uma ação real: se o agendamento sai da visão (cancelado, por exemplo), o botão que abriu a janela some e o foco cai no `body`; a #46 e a #50, com a escrita real, decidem para onde ele vai.
- O `DetailItem` está repetido no detalhe do painel e no do cliente (`portal/appointments/`); unificar fica para depois.
- O LCP do celular fica em 3,1 s no Lighthouse simulado, como nas telas anteriores (o aviso de demonstração é o elemento); a medida na pré-visualização é do Yvan.
- Ligar as rotas reais e tirar a demonstração: a consulta na #46 e as ações de status na #50; cada uma tira as suas entradas de `src/lib/demo/routes.ts`, e a que tirar a última remove `src/lib/demo/admin-appointments.ts` e o aviso da tela.
- Os PRs #84 (538 linhas em `src/`, cerca de 90 de dados fixos) e 3 (792, a conclusão com 354 e o detalhe com 364) passaram das ~400 de `pull-request.md`.
