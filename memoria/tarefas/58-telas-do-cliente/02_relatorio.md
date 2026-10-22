---
issue: 58
pull_request: 74
---

# Relatório: Telas do cliente com dados de demonstração: conta, veículos e agendamentos

Em três PRs: o PR #72, da aba "Dados pessoais" de `/profile` (`Refs #58`, incorporado em 701e995); o PR #73, da aba "Meus veículos" (`Refs #58`, incorporado em 0fbcf60); e o PR #74, de `/appointments` (`Closes #58`).

## O que foi feito

- **Página `/profile`** ("Minha conta", UC04, UC05): as abas "Dados pessoais" (PR #72) e "Meus veículos" (PR #73).
- **Dados da conta** (UC04, RF012, RF013; PR #72): os dados de demonstração de Henrique Costa, do `seed-demo.sql`, com o aviso de demonstração logo abaixo do título da seção; "Nome", "Sobrenome", "E-mail" (só leitura) e "Celular" (com a máscara); "Salvar alterações" envia `PATCH /api/me/profile`, que na demonstração mostra o aviso de `NOT_IMPLEMENTED`. Na carga, o lugar dos campos fica reservado; na falha, aparece o aviso com "Tentar novamente"; no 409 `VERSION_CONFLICT`, o formulário recarrega os dados (RNF011).
- **Senha** (UC04 FA01 e FE02, RF014; PR #72): sem o aviso de demonstração, porque grava de verdade. "Alterar senha" abre a janela com "Senha atual", "Nova senha" e "Confirmar nova senha", validada pelo `changePasswordFormSchema` e enviada a `POST /api/auth/change-password` (#24). A senha atual errada mostra a mensagem no topo da janela, que continua aberta; o sucesso fecha a janela e mostra "Senha alterada. As sessões abertas em outros aparelhos foram encerradas." (decisão 0048).
- **Meus veículos** (UC05, RF015 a RF018; PR #73): o aviso de demonstração no topo do painel e os veículos da conta em cartões, com marca e modelo, placa, cor, ano, tipo e porte (RN002), em páginas de 10. Cada cartão tem "Editar"; o veículo também vinculado a outra conta mostra, no lugar dele, que só a empresa altera os dados (UC05 FE03, RN036). Na carga, os cartões reservados; na falha, o aviso com "Tentar novamente"; sem veículos, "Nenhum veículo cadastrado", com o botão de cadastro.
- **Cadastro pela placa** (UC05 passos 1 a 6 e FA01, RN036; PR #73): a janela "Cadastrar veículo" começa pela placa, com a máscara, e "Continuar" consulta `GET /api/me/vehicles/lookup`. Placa já cadastrada: os dados do veículo, sem edição, e "Adicionar à minha conta", que envia só a placa. Placa nova: o tipo, a marca, o modelo, a cor e o ano. "Voltar" retorna à placa sem perder o que foi digitado. O envio vai a `POST /api/me/vehicles` e, na demonstração, mostra o aviso de `NOT_IMPLEMENTED` no topo da janela.
- **Edição do veículo** (UC05 FA02, RNF011; PR #73): a janela "Editar veículo", com os dados preenchidos e `PATCH /api/me/vehicles/:id` com `updatedAt`; no 409 `VERSION_CONFLICT`, a lista é lida de novo e os campos passam aos dados atuais.
- **Página `/appointments`** ("Meus agendamentos", UC07, RF028, RF029; PR #74): o aviso de demonstração logo abaixo do título e as abas "Atuais" (Agendado, Em espera, Em execução e Finalizado, da data mais próxima) e "Histórico" (Concluído, Cancelado e Reagendado, da mais recente), cada uma lendo a lista ao ser escolhida. Os cartões, em páginas de 10, mostram a etiqueta de status (RN017), o veículo, a placa, a data, a previsão de conclusão, os serviços e o total. Na carga, os cartões reservados; na falha, o aviso com "Tentar novamente"; sem agendamentos, a mensagem de cada aba (UC07 FE01).
- **Detalhe e cancelamento** (UC07 FA01 e FE02, RF030, RN019; PR #74): "Ver detalhes" abre a janela "Detalhes do agendamento", que lê `GET /api/me/appointments/:id` ao abrir: a etiqueta, a data e o horário, a previsão, a duração estimada, o veículo, os serviços com os valores, a forma de pagamento, o subtotal, o acréscimo ou desconto da forma de pagamento (só quando há percentual) e o total. Só o "Agendado" oferece "Cancelar agendamento", que pede a confirmação com "Voltar" e envia `POST /api/me/appointments/:id/cancel`; na demonstração, a confirmação mostra o aviso de `NOT_IMPLEMENTED`.
- **Formatação e constantes** (RN035, RN002, RN011): `formatPlate` e `VEHICLE_TYPES` (PR #73); `formatPercent` e `PAYMENT_METHODS` (PR #74).
- **Diálogo de confirmação** (L5; PR #74): o `ConfirmDialog` aceita o rótulo do botão que fecha, "Cancelar" por padrão e "Voltar" no cancelamento do agendamento.
- **Dados de demonstração** (decisão 0055), dos nomes, placas e serviços do `seed-demo.sql`: o perfil (PR #72); os dois veículos de Henrique Costa, um deles compartilhado, e a consulta entre os 14 veículos do seed (PR #73); sete agendamentos de Henrique Costa, em datas relativas à semana atual (PR #74). As leituras respondem os dados fixos, e as gravações, `NOT_IMPLEMENTED`.
- **Reagendamento:** passou à #59 (L4, opção 1), com a edição dos corpos da #58 e da #59.

## Arquivos alterados

PR #72:

- `src/app/(portal)/profile/page.tsx`: criado.
- `src/components/portal/clients/profile-tabs.tsx`, `account-form.tsx` e `password-section.tsx`: criados.
- `src/shared/api/clients.ts` e `src/lib/demo/clients.ts`: criados.
- `src/lib/demo/routes.ts`: as duas entradas do perfil.
- `docs/clientes/area-do-cliente.md`: criado, com a parte da conta.
- `docs/clientes/rotas.md` e `docs/clientes/CONTEXT.md`.

PR #73:

- `src/components/portal/vehicles/vehicle-list.tsx`, `vehicle-card.tsx`, `vehicle-fields.tsx`, `add-vehicle-dialog.tsx` e `edit-vehicle-dialog.tsx`: criados.
- `src/components/portal/clients/profile-tabs.tsx`: a aba "Meus veículos".
- `src/shared/format/plate.ts`, `src/shared/constants/vehicle-types.ts`, `src/shared/api/vehicles.ts` e `src/lib/demo/vehicles.ts`: criados.
- `src/lib/demo/routes.ts`: as quatro entradas dos veículos.
- `tests/format/plate.test.ts`: criado.
- `docs/clientes/area-do-cliente.md`: a parte dos veículos.
- `docs/clientes/rotas.md`, `docs/padroes/testes.md` e o README de `tests/format/`.

PR #74:

- `src/app/(portal)/appointments/page.tsx`: criado.
- `src/components/portal/appointments/appointment-tabs.tsx`, `appointment-list.tsx`, `appointment-card.tsx` e `appointment-details-dialog.tsx`: criados.
- `src/components/shared/confirm-dialog.tsx`: `cancelLabel`.
- `src/shared/format/percent.ts`, `src/shared/constants/payment-methods.ts`, `src/shared/api/appointments.ts` e `src/lib/demo/appointments.ts`: criados.
- `src/lib/demo/routes.ts`: as três entradas dos agendamentos.
- `tests/format/percent.test.ts`: criado.
- `docs/agendamento/meus-agendamentos.md`: criado.
- `docs/agendamento/rotas.md`, `docs/agendamento/CONTEXT.md`, `docs/padroes/componentes.md`, `docs/padroes/testes.md` e os README de `src/shared/format/` e `tests/format/`.

Nos três: `memoria/tarefas/58-telas-do-cliente/`, com o plano, as notas e este relatório.

## Testes executados

- `npm run check`: aprovado, com 395 testes. Os 8 novos são `tests/format/plate.test.ts` (PR #73, commit fae62cf) e `tests/format/percent.test.ts` (PR #74, commit 7db9171), anteriores ao código e falhando antes dele. Os componentes e os dados de demonstração dos três PRs foram conferidos à mão (decisão 0052).
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, com `/profile` e `/appointments` estáticas.
- Local, em cada PR, com o Supabase local, uma conta de teste de cliente só nele e o `next start`, no Chrome sem interface, a 360 × 800 e a 1440 × 900, claro e escuro, sem transbordar:
  - **Dados pessoais** (PR #72): os dados de Henrique Costa, o aviso só em "Dados da conta", a máscara do celular, o aviso de `NOT_IMPLEMENTED` no topo do formulário, com o foco, e a falha da leitura com "Tentar novamente". No PR #73, conferidos de novo o conteúdo e o envio de demonstração.
  - **Troca de senha real** (PRs #72 e #73): a senha atual errada mostra "A senha atual está incorreta." e a janela continua aberta; a certa fecha a janela e devolve o foco a "Alterar senha"; depois de sair, a senha antiga é recusada em `/login` e a nova entra.
  - **Meus veículos** (PR #73): o Fiat Toro com "Picape · Porte GG" e "Editar", e o Toyota SW4 com "SUV · Porte G" e a frase do veículo compartilhado; o cadastro com placa já cadastrada ("GLW2B02") e nova ("ABC1D23"), "Voltar" sem perder o que foi digitado, a máscara da placa antiga ("GLW-1010") e a edição preenchida, cada envio com o aviso de `NOT_IMPLEMENTED`.
  - **Agendamentos** (PR #74): os três atuais na ordem de data e os quatro do histórico do mais recente; o detalhe dos sete; "Cancelar agendamento" só nos dois "Agendado"; a confirmação com o foco em "Voltar", o foco preso nela e o aviso de `NOT_IMPLEMENTED` dentro dela; Esc em cada janela devolve o foco ao botão que a abriu.
  - **Teclado:** as setas e Enter nas abas, as setas no tipo do veículo, o foco preso nas janelas e o contorno de foco em todos os controles.
  - **Estados**, por alterações temporárias dos dados de demonstração, sem commit: a falha com "Tentar novamente" em cada lista e no detalhe do agendamento; a paginação pelo teclado (30 veículos; 23 agendamentos); o estado vazio de cada lista; o "Acréscimo de 5,00%" e o "Desconto de 2,50%" no detalhe.
  - **Rede:** nenhuma chamada a `/api/me/*` nos três PRs.
  - **Lighthouse 13.5.0, acessibilidade:** 100 em `/profile` e `/appointments` pela navegação, e no modo de captura do Lighthouse, depois dos cliques, na aba "Meus veículos", nas janelas de veículo, nas duas abas de agendamentos, no detalhe e na confirmação, no celular e no computador, claro e escuro.
  - **LCP no celular** (meta de 2,5 s, RNF006): 3,1 s em `/profile` e 3,0 s em `/appointments` com o estrangulamento simulado; 1,8 a 1,9 s com o estrangulamento do DevTools; o LCP é o texto do aviso de demonstração. **CLS:** em `/profile`, 0,007 no celular e 0,017 no computador; em `/appointments`, 0 no celular e 0,002 no computador, depois de reservar duas linhas de cartões na carga (o primeiro resultado no computador foi 0,106).
  - **Registro do `next start`**, acumulado em cada PR: sem cookie, token, cabeçalho de autorização, senha, chave nem e-mail.
- **Pré-visualização:** passo do desenvolvedor (veja os PRs).

## Documentação atualizada

- **Módulos:**
  - `docs/clientes/area-do-cliente.md`, novo: abas, seções e textos de `/profile`, com o cadastro pela placa e a edição do veículo;
  - `docs/agendamento/meus-agendamentos.md`, novo: abas, cartão, detalhe, ações por status, cancelamento e textos de `/appointments`;
  - `docs/clientes/CONTEXT.md` e `docs/agendamento/CONTEXT.md`: os módulos novos;
  - `docs/clientes/rotas.md`: os campos de `GET /api/me/profile`, `GET /api/me/vehicles` e `GET /api/me/vehicles/lookup`;
  - `docs/agendamento/rotas.md`: o `scope` e os campos de `GET /api/me/appointments` e de `GET /api/me/appointments/:id`;
  - `docs/padroes/componentes.md`: "Voltar" no diálogo de confirmação de um cancelamento;
  - `docs/padroes/testes.md`: a placa e o percentual nos casos de formatação.
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (campos das respostas) → `clientes/rotas.md` e `agendamento/rotas.md`;
  - L2 (conteúdo de `/profile`) → `area-do-cliente.md`;
  - L3 (conteúdo de `/appointments`) → `meus-agendamentos.md`;
  - L4 (reagendamento) → passou à #59, com os corpos da #58 e da #59 editados pelo texto do plano; `meus-agendamentos.md` diz que os outros status não têm ação nesta tela, além das da #59;
  - L5 (rótulo do botão que fecha) → `componentes.md`;
  - L6 (cadastro pela placa) → `area-do-cliente.md`.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar** (pela #67):
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A:** as respostas de `GET /api/me/profile` (`firstName`, `lastName`, `email`, `phone` e `updatedAt`); de `GET /api/me/vehicles` (paginada, com `id`, `plate`, `type`, `size`, `brand`, `model`, `color`, `year`, `isShared` e `updatedAt`, na ordem em que os veículos foram vinculados à conta); de `GET /api/me/vehicles/lookup` (`type`, `brand`, `model`, `color` e `year`, ou `null`); de `GET /api/me/appointments`, com o `scope` obrigatório (`current` com Agendado, Em espera, Em execução e Finalizado, da data mais próxima; `history` com Concluído, Cancelado e Reagendado, da mais recente) e a lista paginada de `id`, `status`, `scheduledAt`, `estimatedEndAt`, `vehicle`, `services` e `total`; e de `GET /api/me/appointments/:id`, com `estimatedDurationMinutes`, `paymentMethod`, `subtotal`, `feePercent`, `updatedAt`, o veículo e os serviços completos, copiados no agendamento (RN037);
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes de formatação cobrem a placa nos dois padrões, também durante a digitação, e o percentual.

## Pendências

- **Pré-visualização**, passo do Yvan: `/profile` e `/appointments` no celular e no computador, com o Lighthouse e o LCP nos PRs; o fluxo com sessão em produção, porque o agente não cria conta em produção.
- **#59:** o "Editar" do "Agendado" e o "Reagendar" do "Concluído" na janela de detalhe (`STATUS_ACTIONS` em `appointment-details-dialog.tsx`), o assistente de agendamento e o reaproveitamento de `AddVehicleDialog`; o módulo `meus-agendamentos.md` ganha as duas ações.
- **Fase 3:** as rotas `/api/me/profile`, `/api/me/vehicles` e `/api/me/appointments` saem de `src/lib/demo/routes.ts`, com os avisos de demonstração das telas.
- **#61, #62 e #65:** podem reaproveitar `src/shared/api/appointments.ts`, `PAYMENT_METHOD_LABELS` e `formatPercent`; **#64**, `formatPlate`, `VEHICLE_TYPE_LABELS`, `src/shared/api/vehicles.ts` e `vehicle-fields.tsx` (este, movido para `src/components/shared/` no segundo uso).
- **#67:** a lista acima, de documentos formais.
