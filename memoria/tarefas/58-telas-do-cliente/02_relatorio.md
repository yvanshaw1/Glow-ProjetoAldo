---
issue: 58
pull_request: 73
---

# Relatório: Telas do cliente com dados de demonstração: conta, veículos e agendamentos

Relatório parcial: PR 2 de 3. O PR #72, da aba "Dados pessoais" de `/profile` (`Refs #58`), foi incorporado em 701e995; o PR #73 traz a aba "Meus veículos" (`Refs #58`). O PR 3, dos agendamentos (`Closes #58`), vem depois da incorporação deste e completa este relatório.

## O que foi feito

- **Página `/profile`** ("Minha conta", UC04, UC05): as abas "Dados pessoais" (PR #72) e "Meus veículos" (PR #73).
- **Dados da conta** (UC04, RF012, RF013; PR #72): os dados de demonstração de Henrique Costa, do `seed-demo.sql`, com o aviso de demonstração logo abaixo do título da seção; "Nome", "Sobrenome", "E-mail" (só leitura) e "Celular" (com a máscara); "Salvar alterações" envia `PATCH /api/me/profile`, que na demonstração mostra o aviso de `NOT_IMPLEMENTED`. Na carga, o lugar dos campos fica reservado; na falha, aparece o aviso com "Tentar novamente"; no 409 `VERSION_CONFLICT`, o formulário recarrega os dados (RNF011).
- **Senha** (UC04 FA01 e FE02, RF014; PR #72): sem o aviso de demonstração, porque grava de verdade. "Alterar senha" abre a janela com "Senha atual", "Nova senha" e "Confirmar nova senha", validada pelo `changePasswordFormSchema` e enviada a `POST /api/auth/change-password` (#24). A senha atual errada mostra a mensagem no topo da janela, que continua aberta; o sucesso fecha a janela e mostra "Senha alterada. As sessões abertas em outros aparelhos foram encerradas." (decisão 0048).
- **Meus veículos** (UC05, RF015 a RF018; PR #73): o aviso de demonstração no topo do painel e os veículos da conta em cartões, com marca e modelo, placa, cor, ano, tipo e porte (RN002), em páginas de 10. Cada cartão tem "Editar"; o veículo também vinculado a outra conta mostra, no lugar dele, que só a empresa altera os dados (UC05 FE03, RN036). Na carga, dois cartões reservados; na falha, o aviso com "Tentar novamente"; sem veículos, "Nenhum veículo cadastrado", com o botão de cadastro.
- **Cadastro pela placa** (UC05 passos 1 a 6 e FA01, RN036; PR #73): a janela "Cadastrar veículo" começa pela placa, com a máscara, e "Continuar" consulta `GET /api/me/vehicles/lookup`. Placa já cadastrada: os dados do veículo, sem edição, e "Adicionar à minha conta", que envia só a placa. Placa nova: o tipo (Hatch, Sedan, SUV ou Picape), a marca, o modelo, a cor e o ano. "Voltar" retorna à placa sem perder o que foi digitado. O envio vai a `POST /api/me/vehicles` e, na demonstração, mostra o aviso de `NOT_IMPLEMENTED` no topo da janela.
- **Edição** (UC05 FA02, RNF011; PR #73): a janela "Editar veículo", com tipo, placa, marca, modelo, cor e ano preenchidos, e `PATCH /api/me/vehicles/:id` com `updatedAt`; no 409 `VERSION_CONFLICT`, a lista é lida de novo e os campos passam aos dados atuais.
- **Formatação e constantes** (RN035, RN002; PR #73): `formatPlate`, a exibição da placa nos dois padrões, também usada como máscara na digitação; `VEHICLE_TYPES` e `VEHICLE_TYPE_LABELS`.
- **Dados de demonstração** (decisão 0055): `ClientProfile`, `answerProfile` e as entradas `GET` e `PATCH /api/me/profile` (PR #72); `ClientVehicle`, `VehicleLookup`, `answerVehicles` (os dois veículos de Henrique Costa, um deles compartilhado) e `answerVehicleLookup` (a placa entre os 14 veículos do seed), e as entradas `GET /api/me/vehicles`, `GET /api/me/vehicles/lookup`, `POST /api/me/vehicles` e `PATCH /api/me/vehicles/:id` (PR #73).

## Arquivos alterados

PR #72:

- `src/app/(portal)/profile/page.tsx`: criado.
- `src/components/portal/clients/profile-tabs.tsx`, `account-form.tsx` e `password-section.tsx`: criados.
- `src/shared/api/clients.ts`: criado.
- `src/lib/demo/clients.ts`: criado.
- `src/lib/demo/routes.ts`: as duas entradas do perfil.
- `docs/clientes/area-do-cliente.md`: criado, com a parte da conta.
- `docs/clientes/rotas.md` e `docs/clientes/CONTEXT.md`.
- `memoria/tarefas/58-telas-do-cliente/`: plano, notas e este relatório.

PR #73:

- `src/components/portal/vehicles/vehicle-list.tsx`, `vehicle-card.tsx`, `vehicle-fields.tsx`, `add-vehicle-dialog.tsx` e `edit-vehicle-dialog.tsx`: criados.
- `src/components/portal/clients/profile-tabs.tsx`: a aba "Meus veículos".
- `src/shared/format/plate.ts`, `src/shared/constants/vehicle-types.ts` e `src/shared/api/vehicles.ts`: criados.
- `src/lib/demo/vehicles.ts`: criado.
- `src/lib/demo/routes.ts`: as quatro entradas dos veículos.
- `tests/format/plate.test.ts`: criado.
- `docs/clientes/area-do-cliente.md`: a parte dos veículos.
- `docs/clientes/rotas.md`, `docs/padroes/testes.md` e o README de `tests/format/`.
- `memoria/tarefas/58-telas-do-cliente/`: notas e este relatório.

## Testes executados

- `npm run check`: aprovado, com 392 testes. Os 5 novos (`tests/format/plate.test.ts`) são do PR #73, no commit fae62cf, anterior ao código, e falhavam antes dele. O PR #72 não tem teste automatizado; os componentes dos dois PRs foram conferidos à mão (decisão 0052).
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, com `/profile` estática.
- Local, com o Supabase local, uma conta de teste de cliente só nele e o `next start`, no Chrome sem interface, a 360 × 800 e a 1440 × 900, claro e escuro, sem transbordar:
  - **Dados pessoais** (PR #72): "Dados da conta" com o aviso logo abaixo do título e os dados de Henrique Costa, e "Senha" sem o aviso; o celular mascarado na digitação e o aviso de `NOT_IMPLEMENTED` no topo do formulário, com o foco; do "Pular para o conteúdo" ao rodapé pelo teclado, com o foco visível; a falha da leitura com "Tentar novamente". No PR #73, conferidos de novo o conteúdo e o envio de demonstração.
  - **Troca de senha real** (nos dois PRs): a senha atual errada mostra "A senha atual está incorreta." e a janela continua aberta; a certa fecha a janela e devolve o foco a "Alterar senha"; depois de sair, a senha antiga é recusada em `/login` e a nova entra.
  - **Meus veículos** (PR #73): o Fiat Toro com "Picape · Porte GG" e "Editar", e o Toyota SW4 com "SUV · Porte G" e a frase do veículo compartilhado, sem "Editar"; uma coluna a 360 px e duas a 1440 px; os cartões reservados na carga.
  - **Cadastro e edição** (PR #73): "glw2b02" vira "GLW2B02" e mostra o Toyota Corolla sem edição; "ABC1D23" pede os dados, e "Voltar" mantém o que foi digitado; "glw1010" vira "GLW-1010"; a edição abre preenchida; todo envio mostra o aviso de `NOT_IMPLEMENTED` no topo da janela, com o foco. Pelo teclado: as setas nas abas e no tipo, o foco preso na janela, Esc fecha e devolve o foco ao botão que a abriu.
  - **Estados da lista** (PR #73), por alterações temporárias dos dados de demonstração, sem commit: a falha com "Tentar novamente", que traz a lista; a paginação pelo teclado, com 30 veículos ("11–20 de 30", "21–30 de 30"); sem veículos, a mensagem do estado vazio com o botão de cadastro.
  - **Rede:** nenhuma chamada a `/api/me/*` nos dois PRs.
  - **Lighthouse 13.5.0, acessibilidade:** 100 em `/profile`, no celular e no computador, nos temas claro e escuro; no PR #73, também 100 na aba "Meus veículos" e nas janelas de cadastro (placa cadastrada, placa nova e falha) e de edição, no modo de captura do Lighthouse, nos mesmos quatro modos.
  - **LCP no celular** de `/profile`: 3,1 s com o estrangulamento simulado nos dois PRs; 1,9 s (PR #72) e 1,8 s (PR #73) com o estrangulamento do DevTools; o LCP é o texto do aviso de demonstração. CLS de 0,007 no celular e 0,017 no computador.
  - **Registro do `next start`**, acumulado em cada PR: sem cookie, token, cabeçalho de autorização, senha, chave nem e-mail.
- **Pré-visualização:** passo do desenvolvedor (veja os PRs).

## Documentação atualizada

- **Módulos:**
  - `docs/clientes/area-do-cliente.md`, novo: abas, seções e textos da aba "Dados pessoais" (PR #72) e da aba "Meus veículos", com o cadastro pela placa e a edição (PR #73);
  - `docs/clientes/rotas.md`: os campos de `GET /api/me/profile` (PR #72) e de `GET /api/me/vehicles` e `GET /api/me/vehicles/lookup` (PR #73);
  - `docs/clientes/CONTEXT.md`: o módulo novo (PR #72);
  - `docs/padroes/testes.md`: a placa nos casos de formatação (PR #73).
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (campos das respostas) → `clientes/rotas.md`, o perfil (PR #72) e os veículos (PR #73);
  - L2 (conteúdo de `/profile`) → `area-do-cliente.md`, a conta (PR #72) e os veículos (PR #73);
  - L6 (cadastro pela placa) → `area-do-cliente.md` (PR #73);
  - L1 dos agendamentos, L3, L4 e L5 entram no PR 3.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar** (pela #67), até aqui:
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A:** a resposta de `GET /api/me/profile` com `firstName`, `lastName`, `email`, `phone` e `updatedAt`; a de `GET /api/me/vehicles`, paginada, com `id`, `plate`, `type`, `size`, `brand`, `model`, `color`, `year`, `isShared` e `updatedAt`, na ordem em que os veículos foram vinculados à conta; e a de `GET /api/me/vehicles/lookup`, com `type`, `brand`, `model`, `color` e `year`, ou `null`;
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes de formatação cobrem a placa nos dois padrões, também durante a digitação.

## Pendências

- **PR 3 (agendamentos):** `/appointments`, com as abas, o cartão, o detalhe e o cancelamento; `formatPercent` com testes; L1 dos agendamentos, L3 e L5; e, com o OK do Yvan na conversa, a edição dos corpos da #58 e da #59 (L4).
- **Pré-visualização**, passo do Yvan: as duas abas de `/profile` no celular e no computador, com o Lighthouse e o LCP nos PRs.
- **Fase 3:** as rotas de `/api/me/profile` e `/api/me/vehicles` saem de `src/lib/demo/routes.ts`, com o aviso de demonstração das duas partes.
- **#59:** reaproveita `AddVehicleDialog` no assistente de agendamento, quando o cliente ainda não tem veículo.
- **#64:** pode reaproveitar `formatPlate`, `VEHICLE_TYPE_LABELS`, `src/shared/api/vehicles.ts` e `vehicle-fields.tsx` (este, movido para `src/components/shared/` no segundo uso).
- **#67:** a lista acima, de documentos formais.
