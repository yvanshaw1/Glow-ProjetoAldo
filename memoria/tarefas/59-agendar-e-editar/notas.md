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
