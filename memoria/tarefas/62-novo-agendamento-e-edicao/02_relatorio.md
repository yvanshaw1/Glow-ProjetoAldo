---
issue: 62
pull_request: 92
---

# Relatório: Telas de agendamentos do painel com dados de demonstração: novo agendamento e edição

Em quatro PRs: o #88, das buscas e dos dados (`Refs #62`, incorporado em 70c3349); o #89, das etapas (`Refs #62`, incorporado em 5314841); o #91, do novo agendamento (`Refs #62`, incorporado em 76b7b24); e o #92, da edição (`Closes #62`, este). Este relatório está completo, e o plano passou a `concluido` neste PR.

## O que foi feito

PR #88, buscas e dados:

- **Rotas de demonstração** (decisão 0055): `GET /api/admin/appointments/lookup/clients`, `lookup/vehicles` e `lookup/services` respondidas por `src/lib/demo/admin-appointments.ts` (clientes em ordem alfabética com busca por nome ou e-mail, veículos do cliente, serviços pelo porte do veículo); `POST /api/admin/appointments` e `PATCH /api/admin/appointments/:id` em `routes.ts` sem `load`, recusadas com `NOT_IMPLEMENTED`.
- **Tipos:** `clientId` em `AdminAppointment` e `AdminClientOption`.
- **Dados:** 13º cliente, Natália Pires, sem veículo, em `supabase/seed-demo.sql` e nos dados de demonstração (UC11 FE02); `listBookableServices` exportada de `appointments.ts`.
- **Documentação de L1 e L2** em `rotas.md`.

PR #89, etapas:

- **Etapas de veículo e de serviços** (UC06, UC11) movidas para `src/components/shared/`, com a rota, os filtros, a legenda, o texto do estado vazio e a ação de veículo por propriedade; o assistente do cliente passa as suas, e o cadastro de veículo da área do cliente ficou em `booking-add-vehicle.tsx`.
- **Etapa "Cliente"** (UC11 passo 2, FE01): busca (300 ms, até 100 caracteres), opções em botões de opção em páginas de 10, sem leitura antes de haver texto, Enter sem avançar, o vazio com "Cadastrar cliente"; trocar o cliente tira o veículo, os serviços e os adicionais (RN003, RN004).

PR #91, novo agendamento:

- **Assistente** (UC11, RF050, RF051): botão "Novo agendamento" ao lado das abas e janela com cinco etapas ("Cliente", "Veículo", "Serviços", "Data e horário", "Pagamento e resumo") e o "Resumo do pedido" com a linha "Cliente" e os valores da prévia (RN010, RN034). Voltar a uma etapa mantém as outras (RNF002). "Confirmar agendamento" mostra o `NOT_IMPLEMENTED` no topo, com a janela aberta; com sucesso, a janela fecha e as listas são lidas de novo. Cliente sem veículo: o caminho para os detalhes do cliente (FE02).
- **`AppointmentFormDialog`:** janela que não fecha durante o envio, com o foco em "Cancelar" e de volta ao botão.
- **Indicador de etapas** (`step-form.tsx`): com mais de quatro etapas, as linhas só aparecem a partir de 448 px, para o título da etapa atual caber a 360 px (desvio aprovado, ver notas).

PR #92, edição:

- **Editar** (UC26 FA01, RF055, RN032): botão no rodapé do detalhe, em qualquer status, que abre "Editar agendamento" em quatro etapas preenchidas pelo agendamento, sem a etapa do cliente; a prévia leva `appointmentId`, e o envio é o `PATCH` com `updatedAt`, mantendo o instante original se data e hora não mudaram (RN033).
- **Conflito** (RNF011): `VERSION_CONFLICT` mantém o aviso no topo, lê o agendamento e o detalhe de novo e, se a releitura falhar, oferece "Tentar novamente" com o envio bloqueado.
- **Data e horário por status** (RN033): `limit` na etapa compartilhada; "Agendado" de agora em diante, do "Em espera" ao "Reagendado" só até agora, com o calendário voltando a meses passados, e "Cancelado" todo o funcionamento. A tabela `STAFF_DATE_LIMITS` foi para `src/shared/constants/appointment-date-limits.ts`, e `editing.ts` a importa.
- **Documentação de L3, L4 e L5** em `agendamentos-do-painel.md`.

## Arquivos alterados

- `src/shared/api/appointments.ts` — `clientId`, `AdminClientOption`.
- `src/lib/demo/admin-appointments.ts`, `appointments.ts`, `routes.ts` — as buscas, os clientes, as duas gravações.
- `supabase/seed-demo.sql` — o cliente sem veículo.
- `src/components/shared/booking-vehicle-step.tsx`, `booking-services-step.tsx` (movidos), `booking-summary.tsx`, `booking-schedule-step.tsx`, `step-form.tsx`.
- `src/components/portal/appointments/booking-wizard.tsx`, `booking-add-vehicle.tsx` (novo).
- `src/components/admin/appointments/appointment-wizard.tsx`, `appointment-form-dialog.tsx`, `appointment-form-values.ts`, `booking-client-step.tsx` (novos); `appointment-views.tsx`, `appointment-details-dialog.tsx`.
- `src/shared/constants/appointment-date-limits.ts` (novo) e `src/server/rules/editing.ts`.
- READMEs de `shared/`, `portal/appointments/` e `admin/appointments/`.

## Testes executados

- `npm run check`: sem erros nem avisos em cada PR (414 testes, incluindo os 31 de `tests/rules/editing.test.ts` depois que a tabela mudou de lugar) e `npx next build`.
- Nenhuma função pura nova com regra de negócio entrou, então não há teste novo (decisão 0052).
- Verificação local no navegador, com o banco local, o admin local e `next start`, a 360 × 800 e 1440 × 900, claro e escuro, sem rolagem horizontal:
  - PR #88: teste temporário do Vitest com `apiRequest` (apagado): busca "SOUZA" (Ana Souza), 13 clientes, Natália sem veículo, Ana Souza com Polo e Argo, Lavagem simples R$ 40,00 e Cera R$ 35,00 no porte pequeno, `clientId` no detalhe, as duas gravações recusadas.
  - PR #91: o novo agendamento do começo ao fim (erros de cada etapa, "zzz" sem resultado, "SOUZA", Enter, veículos, serviços e adicionais, total de R$ 75,00, volta e troca de serviço mantendo data, horário e Pix, falha de demonstração com a janela aberta, Esc com o foco de volta ao botão); `/booking` e `/appointments` do cliente (veículos, "Cadastrar veículo", serviços, data e horário, "Editar agendamento" sem o cadastro); Lighthouse de acessibilidade (snapshot) 1,0 em 36 estados.
  - PR #92: "Editar" nos sete status; edição de um "Agendado" em quatro etapas preenchidas, falha de demonstração e foco de volta em "Editar"; limites de data por status ("Agendado" de 26 a 31/10, "Concluído" e "Em espera" até 24/10 com "Mês anterior" habilitado, "Cancelado" de 1 a 31/10); Lighthouse 1,0 em 24 estados. Com alteração temporária de `src/lib/demo` e `api-client.ts`, desfeita: gravação 200 fecha as janelas e lê a lista de novo (foco em "Ver detalhes" do cartão); 409 mantém o aviso e lê o agendamento e o detalhe de novo; releitura que falha mostra "Tentar novamente", bloqueia o envio e libera o formulário ao funcionar.
- Conferido depois da abertura do #92, no mesmo ambiente local (a pedido do Yvan, porque o plano exigia):
  - **Teclado, a 360 px:** Tab chega a "Novo agendamento" em 5 toques e Enter abre a janela, com o foco em "Cancelar"; o foco fica preso na janela (14 Tab seguidos, sempre dentro: "Cancelar", "Próximo", "Fechar", a busca); na busca, Tab leva à primeira opção, e ArrowDown e ArrowUp trocam o cliente marcado; Espaço marca o veículo, o serviço, o dia e o horário; ArrowRight muda o dia (26 para 27/10), o horário (08:00 para 08:30) e a forma de pagamento (Crédito para Débito); o foco vai ao título de cada etapa ("Etapa 2 de 5: Veículo" etc.); Enter em "Confirmar agendamento" leva o foco ao aviso de demonstração; Esc devolve o foco a "Novo agendamento"; na edição, Esc volta a "Editar" e, no detalhe, ao "Ver detalhes" do cartão.
  - **Desempenho de `/admin/appointments` (Lighthouse, navegação, `next start` local):** celular claro e escuro, LCP 3,3 s, CLS 0, TBT 120 ms e 70 ms, desempenho 0,91 e 0,92; computador, LCP 0,7 s, CLS 0, desempenho 1,0; acessibilidade 1,0 nos quatro. O LCP do celular fica acima dos 2,5 s de `frontend.md`, como nas telas anteriores (3,1 s na #58, medido com a simulação de rede do Lighthouse); a janela só existe depois do clique, então a página medida é a mesma da #61, e o limite se confere na pré-visualização da Vercel.
  - **`seed-demo.sql`:** carregado no banco local por `db reset` com o arquivo acrescentado à lista de `sql_paths` da `config.toml` (alteração temporária, desfeita): 13 clientes, 14 veículos, 1 cliente sem veículo (Natália Pires), 258 agendamentos, e os 13 ids de cliente do banco são os mesmos escritos nos dados de demonstração.
  - **`updatedAt` novo na releitura (alteração temporária, desfeita):** depois do 409, o aviso continua no topo, o formulário volta à primeira etapa ("Veículo") e fica habilitado.
- **Não verificado:** o LCP e o CLS na pré-visualização da Vercel, que é onde o limite de `frontend.md` vale; a janela foi medida só por acessibilidade (snapshot).

## Documentação atualizada

- Módulos: `docs/agendamento/rotas.md` (campos e paginação das três buscas, `clientId` no detalhe); `docs/agendamento/agendamentos-do-painel.md` (seções "Novo agendamento" e "Editar", "Editar" na tabela de ações, "Fora da tela"); `docs/padroes/componentes.md` (indicador com mais de quatro etapas).
- Lacunas resolvidas: L1 → opção 1 → `rotas.md`; L2 → opção 1 → `rotas.md`; L3 → opção 1 → `agendamentos-do-painel.md`; L4 → opção 1 → `agendamentos-do-painel.md`; L5 → opção 1 → `agendamentos-do-painel.md`.
- Decisões: nenhuma.
- Documentos formais a atualizar (pela #67): Arquitetura de Software, Apêndice A, com os campos das três buscas de `rotas.md` e o `clientId` do detalhe; nenhuma `RN` mudou, então a Análise do Sistema não precisa de ajuste.

## Pendências

- As rotas reais (#46, #49 e #50): cada uma tira a sua entrada de `src/lib/demo/routes.ts` e o aviso da tela; a #49 e a #50 seguem L1 e L2 de `rotas.md`.
- O reagendamento do painel continua com formulário próprio, repetindo a lógica do modo `reschedule` do assistente do cliente (P4, opção 1); a unificação fica para quando as rotas existirem.
- O foco depois de uma gravação com sucesso, quando o cartão sai da visão, segue para a #46 e a #50 (lacuna herdada da #61); aqui ele cai no cartão ou no botão que abriu a janela.
- O cliente sem veículo (`natalia.pires@example.com`) pode ser reaproveitado pela tela de clientes (#64).
- LCP do celular de `/admin/appointments` em 3,3 s no Lighthouse local (limite de 2,5 s em `frontend.md`): medir na pré-visualização da Vercel.
