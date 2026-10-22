# Notas: 58-telas-do-cliente

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-21 – descoberta

Conferências do planejamento, sem alterar o código do projeto:

- **Origem.** Sessão iniciada pela sessão principal para conduzir a #58 (T2 da `proposta-das-issues.md` da #66), depois da #57 (PRs #70 e #71, 61b4cb3). As notas de passagem da #56 e da #57 foram lidas; a pasta de notas compartilhadas desta sessão estava vazia.
- **Worktree.** `36-regras-do-agendamento-05611e` (nome herdado, não renomeável), na ramificação `claude/58-telas-do-cliente-b6423c`, em 61b4cb3, igual à `origin/main` depois do `git fetch`. Plano e notas sem commit, como nas etapas 01 anteriores. A etapa 02 cria uma ramificação `feat/58-…` por PR a partir da `origin/main`.
- **GitHub.** Nenhum PR aberto. A #59 (agendar e editar) depende desta e diz que "a edição abre o mesmo assistente a partir do detalhe da #58".
- **Rotas.** `rotas.md` descreve as respostas do cliente por alto: o perfil sem `updatedAt` (exigido no `PATCH` por `api.md`), os veículos sem a marca de veículo compartilhado (o UC05 FE03 manda não oferecer a edição), a consulta da placa com "resposta vazia", o `scope` sem os status nem a ordem e o detalhe como "agendamento completo" (L1).
- **Reagendamento.** `POST /api/me/appointments/:id/reschedule` exige `paymentMethod` e `scheduledAt`, e o UC25 (passos 4 a 6) pede o total pela forma escolhida e os horários de funcionamento: são as etapas do assistente da #59, desenhadas com calendário e grade de horários (`clientPages/appointment/AppointmentPageStep3*` e `Step4*`). Os requisitos da #58 não têm RN013, RN015 nem RN034 (L4).
- **Constantes que faltam.** `src/shared/constants/` não tem tipos de veículo nem formas de pagamento, embora o README as cite; `src/shared/format/` não tem placa (o README cita) nem percentual.
- **Esquemas.** `changePasswordFormSchema` já existe (#24, com a confirmação); `/set-password` o usa com `POST /api/auth/change-password`. Os erros `INVALID_CURRENT_PASSWORD`, `VEHICLE_ALREADY_LINKED`, `VEHICLE_SHARED`, `PLATE_IN_USE` e `INVALID_STATUS` já estão no catálogo; a frase do veículo compartilhado reaproveita a mensagem de `VEHICLE_SHARED`.
- **Componentes.** `StepForm`, `ConfirmDialog` e `PaginatedList` ainda não têm uso nas telas. O `StepForm` não consulta nada entre as etapas (L6). O `ConfirmDialog` tem "Cancelar" fixo, que colide com "Cancelar agendamento" (L5). O cabeçalho do portal não mostra o nome de quem entrou.
- **Dados do seed.** Henrique Costa tem o Fiat Toro `GLW8H08` (picape, GG) e o Toyota SW4 `GLW5L15` (SUV, G), este também na conta de Isabela Melo (RN036). Ids: `md5('glow-demo:vehicle:GLW8H08')` → `a229a2b8-eb46-90df-1285-bcd05a9570a0`, `GLW5L15` → `c27d6551-0c94-5624-d779-0cad75a490a3`. As taxas do `seed.sql` são todas zero; o funcionamento é de segunda a sexta das 08:00 às 18:00 com pausa das 12:00 às 13:00, sábado das 08:00 às 12:00, domingo fechado. Os agendamentos do `seed-demo.sql` são sorteados por dia, relativos ao dia da carga; a demonstração define os seus, com os preços e durações do seed e a previsão calculada à mão por RN034.
- **Wireframes.** O perfil tem foto, "Cliente desde", "Sair" e a "Zona de perigo" (exclusão da conta, só do funcionário no Glow, RF074); o cadastro de veículo pede o tipo antes da placa, ao contrário do UC05; os agendamentos agrupam os atuais em "Em andamento" e "Próximos", põem "Cancelar" no cartão e pedem o motivo do cancelamento, que a rota não recebe.
- **Tamanho.** Cerca de 1.650 linhas em `src/`, sem testes nem README: o plano propõe três PRs (conta, veículos, agendamentos), com o 2 e o 3 acima de ~400.

## 2026-10-21 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas:

- L1, campos das respostas: recomendado os campos em `rotas.md`, com `isShared` nos veículos e os status e a ordem de cada `scope`;
- L2, `/profile`: recomendado duas abas, a troca de senha numa seção "Senha" sem o aviso de demonstração e numa janela, e os textos no módulo novo `docs/clientes/area-do-cliente.md`;
- L3, `/appointments`: recomendado abas "Atuais" e "Histórico", cartão com "Ver detalhes" e as ações só na janela de detalhe, e os textos no módulo novo `docs/agendamento/meus-agendamentos.md`;
- L4, reagendamento: recomendado passar o reagendamento inteiro à #59, no mesmo assistente da edição, com a edição dos corpos da #58 e da #59;
- L5, "Voltar" no lugar de "Cancelar" quando a ação do `ConfirmDialog` é cancelar;
- L6, cadastro de veículo: recomendado uma janela que começa pela placa e mostra o resto depois da consulta, sem o `StepForm`.

Pontos de aprovação: os três PRs (ou cinco), a edição das issues (com a opção 1 de L4), a conta de teste de cliente no banco local com a troca de senha real e, como na #56 e na #57, as chaves do banco local, o cookie no Lighthouse e as alterações temporárias sem commit. Nada foi construído.

## 2026-10-21 – decisão

Plano aprovado por yvan (21/10/2026), conferido no arquivo: opção 1 em L1 a L6 (caixas `[X]`). A divisão ficou a do plano, em três PRs. Status em `em_execucao`. A edição dos corpos da #58 e da #59 (L4, opção 1) ainda espera o OK do Yvan na conversa.

## 2026-10-21 – desvio

Etapa 02, PR 1 (conta), na ramificação `feat/58-client-account`, criada da `origin/main` (61b4cb3) com `git switch --no-track -c`, sem vínculo, e `npx -y npm@11.21.1 ci`. Commits:

- 4694cea: `ClientProfile`, `src/lib/demo/clients.ts` (Henrique Costa) e `GET`/`PATCH /api/me/profile` em `DEMO_ROUTES`;
- 9ae86c4: `/profile` com a aba "Dados pessoais", `account-form.tsx` (seção "Dados da conta") e `password-section.tsx` (seção "Senha" com a janela);
- c11e91d: `area-do-cliente.md` (só a parte da conta; os veículos entram no PR 2), `clientes/CONTEXT.md` e o perfil em `clientes/rotas.md` (L1).

Escolhas pequenas, sem mudar regra nem escopo:

- **Largura.** A página usa `max-w-3xl`, centralizada, como a coluna do wireframe; cada seção é uma superfície com `shadow-neu-md`.
- **Títulos das seções.** `h2` com peso 600 no tamanho do texto, como o título do cartão do catálogo, para não igualar o `h1` a 360 px.
- **E-mail.** No formulário, só para leitura e com o texto em `--muted-foreground`; o envio leva só `firstName`, `lastName`, `phone` e `updatedAt`.
- **Celular.** Enviado com a máscara, como digitado: sem o esquema (decisão 0055), a normalização entra com a rota.
- **Janela de senha.** Os campos são limpos ao abrir e ao fechar; durante a chamada, ela não fecha (`componentes.md`). O "Cancelar" do rodapé fecha a janela pelo `DialogClose`.
- **PR 1 com uma aba só**, como `/admin/settings` com "Empresa"; a de veículos entra no PR 2.

## 2026-10-21 – descoberta

Verificação local do PR 1, aprovada:

- **Ambiente.** Docker Desktop aberto; `npx supabase start` e `db reset` (só o `seed.sql`); variáveis pelo `local/local-env.sh` do scratchpad, que só aceita `http://127.0.0.1:` e não as exibe; `npx next build` (`/profile` estática) e `npx next start -p 3058`, esperado por `wait.mjs`.
- **Conta de teste.** Cliente "Cliente Teste" criado por `POST /api/auth/register` no banco local (`make-client.mjs`), com e-mail `@example.com` e senhas geradas em `local/client.json` do scratchpad, nunca exibidos; o arquivo é atualizado a cada troca.
- **Conteúdo.** Título "Minha conta – Glow"; `h1` "Minha conta"; a aba "Dados pessoais" selecionada; "Dados da conta" com o aviso logo abaixo do título (`role="note"`), "Henrique", "Costa", o e-mail só para leitura com a descrição e "(82) 90000-0008"; "Senha" sem o aviso. Na carga, o lugar reservado (`aria-busy`).
- **Larguras e temas.** 360 × 800 e 1440 × 900, claro e escuro, sem rolagem horizontal; uma coluna a 360 px e duas a 1440 px. Capturas em `local/shots/` do scratchpad.
- **Envio de demonstração.** O celular mascarado na digitação ("(82) 98888-7777"); "Salvar alterações" passa a "Salvando…" com `aria-disabled` e mostra "Esta ação ainda não está disponível nesta versão de demonstração." no topo do formulário, com o foco, a 360 px no claro e a 1440 px no escuro.
- **Teclado.** "Pular para o conteúdo", marca, navegação (ou "Abrir menu"), a aba, os quatro campos (o e-mail recebe o foco, só para leitura), "Salvar alterações", "Alterar senha" e o rodapé, com o contorno em todos.
- **Troca de senha real**, a 360 px no claro e a 1440 px no escuro: "Alterar senha" com Enter abre a janela com o foco em "Senha atual"; o Tab percorre os campos, os botões "Mostrar senha", "Cancelar", "Salvar nova senha" e "Fechar", e volta ao primeiro; Esc fecha e devolve o foco ao botão. A senha atual errada mostra "A senha atual está incorreta." no topo da janela, com o foco, e ela continua aberta; a certa fecha a janela, a seção mostra "Senha alterada. As sessões abertas em outros aparelhos foram encerradas." e o foco volta a "Alterar senha", em `/profile`. Depois de "Sair", a senha antiga dá "E-mail ou senha incorretos." em `/login`, e a nova entra. Requisições: `change-password` 401 e 204, `logout` 204, `login` 401 e 200.
- **Falha**, por alteração temporária de `src/lib/demo/clients.ts` (a primeira leitura lança erro), sem commit: o aviso "Não foi possível concluir a operação. Tente novamente em instantes." com "Tentar novamente" no lugar dos campos, a seção "Senha" intacta; "Tentar novamente" pelo teclado traz os dados. Desfeita (`git checkout`, `git status` só com a pasta da tarefa) e a aplicação compilada de novo.
- **Rede.** Nenhuma chamada a `/api/me/*`: só `GET /api/auth/me` e `GET /api/public/company`, e as de `/api/auth/` da troca de senha.
- **Lighthouse 13.5.0** em `/profile`, com o cookie da sessão de teste por `--extra-headers` (arquivo apagado com os JSON): acessibilidade 100 no celular e no computador, claro e escuro, sem auditoria reprovada. LCP no celular: 3,1 e 3,2 s no modo padrão (simulado; desempenho 93 e 94) e 1,9 s com o estrangulamento do DevTools (igual ao FCP); o LCP é o texto do aviso de demonstração. CLS de 0,007 no celular e 0,017 no computador: a seção "Senha" desce quando o formulário, mais alto que os quatro lugares reservados, aparece, como na aba "Empresa".
- **Registro.** Acumulado (`>>`) nas três execuções do `next start` (normal, variante da falha e final): 135 linhas, só `requestId`, `userId`, método, caminho, status e código; nenhuma com cookie, token, cabeçalho de autorização, senha, chave ou e-mail, e nenhuma de erro ou aviso. As palavras "password" que aparecem são o caminho `/api/auth/change-password` e o código `INVALID_CURRENT_PASSWORD`.
- **Encerramento.** `next start` encerrado por PID e `npx supabase stop`, com o backup (a conta de teste fica para os PRs 2 e 3). `npm run check` sem erros nem avisos, com 387 testes; `npm audit --omit=dev --audit-level=high` com 0. Nenhum import de `src/server/`, e nada em `src/app/api/`, `supabase/` ou `src/shared/validation/` (`git diff --stat origin/main...HEAD`: 10 arquivos, todos da lista do plano; 484 linhas em `src/`).

## 2026-10-21 – desvio

Etapa 03 do PR 1, a pedido do Yvan: PR #72, aberto como rascunho para pôr o número no relatório e depois marcado como pronto, com a revisão pedida a LFaustin0 e Kaykebr144, como no #70. Como na #57, o `02_relatorio.md` é parcial, e o plano continua em `em_execucao` até o PR 3. A `origin/main` continuava em 61b4cb3, sem nada a incorporar. O PR tem 484 linhas em `src/`, acima da estimativa de ~400.

## 2026-10-21 – descoberta

Etapa 04 do PR 1 (registrada pela sessão que iniciou a do PR 2): a publicação da Vercel do 701e995 e o CI do commit com `success`. Em produção (https://glow-projetoaldo.vercel.app), `/`, `/services`, `/login` e `GET /api/public/company` com 200, e `/profile` sem sessão com 307 para `/login?next=%2Fprofile`. O fluxo com sessão em produção é passo do Yvan, porque o agente não cria conta em produção. Worktree `36-regras-do-agendamento-05611e` destacado na `origin/main` (701e995), sem alteração local. A #58 continua aberta; a cópia principal `App/` precisa de `git pull` (passo do Yvan).

## 2026-10-21 – desvio

Etapa 02, PR 2 (veículos), na ramificação `feat/58-client-vehicles`, criada da `origin/main` (701e995, com o PR 1) com `git switch --no-track -c`, sem vínculo, e `npx -y npm@11.21.1 ci`, num worktree novo (`56-base-da-demonstracao-e6d9a4`, nome herdado). Commits:

- fae62cf: `tests/format/plate.test.ts` em vermelho (o arquivo sem módulo);
- da75c5c: `formatPlate` e `VEHICLE_TYPES` com `VEHICLE_TYPE_LABELS` (os 5 testes verdes);
- d600c48: `ClientVehicle`, `VehicleLookup`, `src/lib/demo/vehicles.ts` e as quatro entradas de `DEMO_ROUTES`;
- b99d7ce: a aba "Meus veículos" (`vehicle-list.tsx`, `vehicle-card.tsx`, `vehicle-fields.tsx`, `add-vehicle-dialog.tsx` e `edit-vehicle-dialog.tsx`) em `ProfileTabs`;
- 1fb09f5: os veículos em `area-do-cliente.md` (L2 e L6), L1 dos veículos em `clientes/rotas.md`, `testes.md` e o README de `tests/format/`.

Escolhas pequenas, sem mudar regra nem escopo:

- **Um botão "Cadastrar veículo" por vez.** Ele fica acima da lista enquanto ela carrega, falha ou tem veículos; sem veículos, só o do estado vazio, como leitura de "o mesmo botão" do plano, para a tela não ter dois botões principais iguais lado a lado. Escrito em `area-do-cliente.md`.
- **Placa depois da consulta.** Continua visível, só para leitura, como o e-mail da conta; "Voltar" a deixa editável. Escrito em `area-do-cliente.md`, com a falha no topo da janela e o 409 `VERSION_CONFLICT` da edição, que já estavam no plano.
- **Foco entre as partes da janela.** Depois de "Continuar", o foco vai ao aviso da placa cadastrada (que o pega ao aparecer, como o `FormAlert`) ou ao primeiro botão de opção do tipo, porque o botão que tinha o foco sai da tela; "Voltar" leva à placa.
- **Campos.** `vehicle-fields.tsx` exporta `PlateField`, `VehicleTypeField` e `VehicleDetailFields`, para a edição ter a ordem de L2 (tipo, placa, depois os dados) e o cadastro, a placa primeiro. Sem o esquema (decisão 0055), o tipo começa em `null` e o ano vai como digitado, como o celular no PR 1.
- **Tipo.** `fieldset` com `legend`, com o visual das abas e a borda de 3:1 de campo; o erro fica no `fieldset` (`aria-describedby`), sem `aria-invalid` nos botões de opção, que o ESLint (`jsx-a11y`) recusa.
- **Cartão.** Título em `h2` (o painel não tem título próprio); o "Editar" leva o nome do veículo em texto só para o leitor de tela ("Editar Fiat Toro"); a frase do veículo compartilhado vem de `ERROR_CATALOG.VEHICLE_SHARED.message`.
- **Dados.** Os 14 veículos do seed em tuplas, no formato do `insert` do `seed-demo.sql` (uma linha por veículo).
- **Tamanho.** 942 linhas em `src/` (88 de dados fixos), acima da estimativa de ~600 do plano; as duas janelas e os campos somam 580.

## 2026-10-21 – descoberta

Verificação local do PR 2, aprovada:

- **Ambiente.** Docker Desktop aberto; `npx supabase start` (do backup) e `db reset` (só o `seed.sql`), o que apagou a conta de teste do PR 1. Roteiros novos no scratchpad desta sessão (os da anterior não são legíveis): `local-env.sh` (só aceita `http://127.0.0.1:`, não exibe valores), `wait.mjs`, `make-client.mjs`, `browser.mjs`, `verify-vehicles.mjs`, `verify-account.mjs`, `verify-states.mjs`, `lh-snapshots.mjs`, `make-cookie.mjs` e `lh-summary.mjs`. `npx next build` (`/profile` estática) e `npx next start -p 3058`.
- **Conta de teste.** Nova conta de cliente criada por `POST /api/auth/register` (201) no banco local, com e-mail `@example.com` e senhas geradas em `local/client.json` do scratchpad, nunca exibidos.
- **Conteúdo**, a 360 × 800 e 1440 × 900, claro e escuro: o aviso de demonstração no topo do painel; Fiat Toro ("Placa GLW8H08 · Azul · 2021", "Picape · Porte GG", "Editar") e Toyota SW4 ("Placa GLW5L15 · Prata · 2019", "SUV · Porte G", a frase do veículo compartilhado, sem "Editar"); "1–2 de 2"; uma coluna a 360 px e duas a 1440 px; sem rolagem horizontal na lista nem nas janelas. Na carga, os dois cartões reservados (`aria-busy`). Capturas em `local/shots/` do scratchpad.
- **Cadastro (L6).** A janela abre com o foco em "Placa"; "glw2b02" vira "GLW2B02"; "Continuar" passa a "Consultando…" e mostra "Esta placa já está cadastrada. Confira os dados do veículo.", com o foco, e Sedan, Toyota, Corolla, Preto e 2022, a placa só para leitura; "Adicionar à minha conta" passa a "Salvando…" e mostra a mensagem de `NOT_IMPLEMENTED` no topo, com o foco. "Voltar" leva o foco à placa, editável; "ABC1D23" pede os dados, com o foco em "Hatch"; as setas mudam o tipo; os campos levam "Fiat", "Uno", "Branco" e "2015" (o "x" passa do limite de quatro); "Voltar" e "Continuar" de novo mantêm tudo; "Cadastrar veículo" mostra o `NOT_IMPLEMENTED`. Esc fecha e devolve o foco ao botão; reaberta, a janela começa vazia; "glw1010" vira "GLW-1010" e mostra o Volkswagen Virtus.
- **Edição.** "Editar Fiat Toro" abre "Editar veículo" com o foco em "Picape" (marcado) e os campos preenchidos; o Tab percorre tipo, placa, marca, modelo, cor, ano, "Cancelar", "Salvar alterações" e "Fechar" e volta ao tipo; o envio passa a "Salvando…" e mostra o `NOT_IMPLEMENTED` com o foco; Esc devolve o foco a "Editar Fiat Toro"; reaberta, a cor volta a "Azul".
- **Teclado.** As setas trocam as abas; do painel, o Tab vai a "Cadastrar veículo", "Editar Fiat Toro" e ao rodapé, com o contorno em todos; o contorno do tipo aparece no rótulo do botão de opção.
- **Falha, paginação e vazio**, por alteração temporária de `src/lib/demo/vehicles.ts`, sem commit, a 360 px no claro e a 1440 px no escuro: a primeira leitura lança erro, e o aviso "Não foi possível concluir a operação. Tente novamente em instantes." aparece com "Tentar novamente" (o botão de cadastro continua acima); depois, 30 veículos: "1–10 de 30", "Próxima página" mostra os itens anteriores com `aria-busy` e depois "11–20 de 30", "Última página" "21–30 de 30", com o foco mantido no botão. Com a lista vazia: "Nenhum veículo cadastrado" e "Cadastre um veículo para agendar serviços.", só com o botão do estado vazio, que abre a janela e recebe o foco de volta. Desfeitas com `git checkout` (`git status` limpo) e a aplicação compilada de novo para a passagem final.
- **Conta, de novo**, a 360 px no claro e a 1440 px no escuro: "Minha conta – Glow", "Dados pessoais" selecionada, o aviso logo abaixo de "Dados da conta" e nenhum em "Senha", Henrique, Costa, o e-mail só para leitura e "(82) 90000-0008"; "Salvar alterações" mostra o `NOT_IMPLEMENTED` com o foco. Troca de senha real a 360 px: a senha atual errada mostra "A senha atual está incorreta." com o foco, e a janela continua aberta; a certa fecha a janela e devolve o foco a "Alterar senha" (`change-password` 401 e 204). Depois de `logout` (204), a senha antiga dá "E-mail ou senha incorretos." e a nova entra (`login` 401 e 200).
- **Rede.** Nenhuma chamada a `/api/me/*`: só `/api/auth/me`, `/api/public/company` e as de `/api/auth/` do login e da troca de senha.
- **Lighthouse 13.5.0, acessibilidade.** A aba e as janelas não abrem pelo endereço, então foram auditadas no modo de captura (`snapshot` do Lighthouse do cache, com o `puppeteer-core` dele), depois dos cliques: a aba, o cadastro com placa cadastrada, com placa nova e com a falha, e a edição, no celular e no computador, claro e escuro: 100 nas 20 capturas, sem auditoria reprovada. `/profile` pela navegação, com o cookie da sessão de teste por `--extra-headers` (arquivo apagado com os JSON): 100 nos quatro modos.
- **LCP no celular** de `/profile`: 3,1 s no modo padrão (simulado; desempenho 94, claro e escuro) e 1,8 s com o estrangulamento do DevTools; o LCP continua o texto do aviso de demonstração. No computador, 0,6 s. CLS de 0,007 no celular e 0,017 no computador, como no PR 1.
- **Registro.** Acumulado (`>>`) nas quatro execuções do `next start` (normal, falha e paginação, vazio e final): 228 linhas, todas `info`, só com `requestId`, `userId`, `profile`, evento, método, caminho, status, código e duração; nenhuma com cookie, token, cabeçalho de autorização, chave ou o e-mail de teste. As palavras "password" são o caminho `/api/auth/change-password` e o código `INVALID_CURRENT_PASSWORD`.
- **Encerramento.** `next start` encerrado por PID e `npx supabase stop`, com o backup (a conta de teste fica para o PR 3). `npm run check` sem erros nem avisos, com 392 testes; `npm audit --omit=dev --audit-level=high` com 0. Nenhum import de `src/server/` e nada em `src/app/api/`, `supabase/` ou `src/shared/validation/` (`git diff --stat origin/main...HEAD`: 16 arquivos, todos da lista do plano).

## 2026-10-21 – descoberta

Etapa 03 e etapa 04 do PR 2: PR #73, aberto como rascunho para pôr o número no relatório e depois marcado como pronto, com a revisão pedida a LFaustin0 e Kaykebr144; aprovado por joaomanoel999 e incorporado por yvanshaw1 em 0fbcf60 (00:30 UTC de 22/10). A publicação da Vercel do 0fbcf60 e o CI do commit (`check`) com `success`; em produção (https://glow-projetoaldo.vercel.app), `/`, `/services`, `/login` e `GET /api/public/company` com 200, e `/profile` sem sessão com 307 para `/login?next=%2Fprofile`. O fluxo com sessão em produção é passo do Yvan. Ramificação remota removida pelo GitHub; a local, apagada depois de conferida igual à `main`.

## 2026-10-21 – decisão

L4, opção 1: com o OK do Yvan na conversa ("pode editar os corpos"), os corpos da #58 e da #59 foram editados pelo texto proposto no plano e conferidos no GitHub. Na #58, saíram RF032 e RN020 dos requisitos, o "reagendar, só no 'Concluído'" do escopo e o "Reagendar" do terceiro critério, que passou a "nos outros status, não (RN019)", e o reagendamento entrou no "Fora do escopo". Na #59, entraram UC25, RF032 e RN020, o item de escopo do reagendamento pelo mesmo assistente e o critério do "Reagendar" no "Concluído". O UC25 continua também nos requisitos da #58, porque o texto aprovado só tirava RF032 e RN020.

## 2026-10-21 – desvio

Etapa 02, PR 3 (agendamentos), na ramificação `feat/58-client-appointments`, criada da `origin/main` (0fbcf60, com o PR 2) com `git switch --no-track -c`, sem vínculo, e `npx -y npm@11.21.1 ci`. Commits:

- 7db9171: `tests/format/percent.test.ts` em vermelho (o arquivo sem módulo);
- 691e0a7: `formatPercent` e `PAYMENT_METHODS` com `PAYMENT_METHOD_LABELS` (os 3 testes verdes);
- 55e481e: `ClientAppointmentSummary`, `ClientAppointment`, `src/lib/demo/appointments.ts` e as três entradas de `DEMO_ROUTES`;
- 324957f: `cancelLabel` no `ConfirmDialog` (L5);
- c7c04fe: `/appointments`, com `appointment-tabs.tsx`, `appointment-list.tsx`, `appointment-card.tsx` e `appointment-details-dialog.tsx`, e `AppointmentScope`;
- ee1c48c: `meus-agendamentos.md` (L3), `agendamento/CONTEXT.md`, L1 dos agendamentos em `agendamento/rotas.md`, L5 em `componentes.md`, `testes.md` e os README de `src/shared/format/` e `tests/format/`;
- 0d38c43: quatro cartões reservados na carga, em vez de dois (correção da verificação, abaixo).

Escolhas pequenas, sem mudar regra nem escopo:

- **Página.** `max-w-3xl`, como `/profile`; o título e o aviso juntos, como em `/services`.
- **Abas.** Ativação manual, como as outras do sistema (Base UI): as setas movem o foco, e Enter ou Espaço escolhe a aba. Sem `keepMounted`, para cada aba ler a rota de novo; o painel sem parada de foco própria, como em `/profile`.
- **Cartão.** A etiqueta primeiro, depois "<marca> <modelo>" em `h2`; os rótulos "Data", "Previsão de conclusão" e "Serviços" em `--muted-foreground`; os serviços separados por vírgula. "Ver detalhes" leva a data em texto só para o leitor de tela ("Ver detalhes do agendamento de 28/10/2026 às 09:00").
- **Detalhe.** Os dados em `dl`; os serviços com o valor de cada um; o "Acréscimo de <percentual>" ou "Desconto de <percentual>" sem o valor em reais, porque a resposta não o traz e a tela não calcula regra; as ações numa tabela de consulta por status (`STATUS_ACTIONS`). A confirmação abre sobre a janela de detalhe.
- **Dados.** Ids dos agendamentos por `md5('glow-demo:client-appointment:<n>')`, porque os do seed são sorteados; o deslocamento `-03:00` do fuso da empresa nos instantes (Maceió não tem horário de verão); o detalhe de um id desconhecido responde o `ApiError` `NOT_FOUND`.
- **Tamanho.** 1.010 linhas em `src/` (332 de dados fixos), acima da estimativa de ~650 do plano.

## 2026-10-21 – descoberta

Verificação local do PR 3, aprovada:

- **Ambiente.** `npx supabase start` (do backup) e `db reset` (só o `seed.sql`); nova conta de teste de cliente por `POST /api/auth/register` (201), com e-mail e senha em `local/client.json` do scratchpad, nunca exibidos. `npx next build` (`/appointments` estática) e `npx next start -p 3058`. Roteiros novos: `verify-appointments.mjs`, `verify-appointment-states.mjs` e `lh-snapshots-appointments.mjs`.
- **Conteúdo**, a 360 × 800 e 1440 × 900, claro e escuro: "Meus agendamentos – Glow", o aviso logo abaixo do `h1`; "Atuais" com três cartões na ordem de data (Em execução hoje às 08:00, Agendado em +9 dias às 09:00 com a previsão às 14:00, Agendado em +16 dias às 14:00 com a previsão no dia seguinte às 09:40) e "1–3 de 3"; "Histórico" com Concluído, Cancelado, Concluído e Reagendado, do mais recente ao mais antigo, e "1–4 de 4"; uma coluna a 360 px e duas a 1440 px; sem rolagem horizontal na página nem nas janelas. Na carga, os cartões reservados (`aria-busy`). Capturas em `local/shots/` do scratchpad.
- **Detalhe.** Os sete detalhes com a etiqueta, data e horário, previsão, duração ("1 h 40 min", "4 h", "5 h 40 min"…), veículo (marca e modelo, placa, cor, ano, tipo e porte), serviços com os valores, forma de pagamento, subtotal e total; o lugar reservado na carga. "Cancelar agendamento" só nos dois "Agendado"; nem no "Em execução" nem nos quatro do histórico.
- **Cancelamento.** A confirmação "Cancelar este agendamento?" abre com o foco em "Voltar", com o texto de L3; o Tab fica entre "Voltar" e "Cancelar agendamento"; Esc fecha só a confirmação e devolve o foco ao botão do detalhe; "Cancelar agendamento" passa a "Cancelando…" e mostra a mensagem de `NOT_IMPLEMENTED` dentro da confirmação, com o foco; "Voltar" devolve o foco ao botão, com o detalhe aberto; Esc no detalhe devolve o foco a "Ver detalhes".
- **Teclado.** As setas e Enter nas abas; o Tab pelos "Ver detalhes" e pelo rodapé, com o contorno em todos. Voltar a "Atuais" monta a lista de novo, com os lugares reservados.
- **Estados**, por alterações temporárias de `src/lib/demo/appointments.ts`, sem commit, a 360 px no claro e a 1440 px no escuro: a primeira leitura da lista lança erro, e o aviso com "Tentar novamente" traz a lista; com 23 itens, "1–10 de 23", a próxima página com os itens anteriores em `aria-busy` e depois "11–20 de 23", e a última "21–23 de 23", com o foco mantido; a primeira leitura do detalhe lança erro, com "Tentar novamente" dentro da janela; com percentuais temporários, "Desconto de 2,50%" no Pix e "Acréscimo de 5,00%" no crédito. Com as listas vazias, "Nenhum agendamento atual" e "Nenhum agendamento no histórico", com os textos de L3. Desfeitas com `git checkout` (`git status` limpo) e a aplicação compilada de novo para a passagem final, que conferiu também a aba "Meus veículos".
- **Rede.** Nenhuma chamada a `/api/me/*`: só `/api/auth/me`, `/api/public/company`, `/api/auth/login` e o cadastro da conta de teste.
- **Lighthouse 13.5.0, acessibilidade.** No modo de captura, depois dos cliques: "Atuais", o detalhe de um "Agendado", a confirmação com a falha, "Histórico" e o detalhe do "Reagendado", no celular e no computador, claro e escuro: 100 nas 20 capturas, sem auditoria reprovada. `/appointments` pela navegação, com o cookie da sessão de teste por `--extra-headers` (arquivo apagado com os JSON): 100 nos quatro modos.
- **CLS corrigido.** A primeira medição no computador deu CLS de 0,106, acima da meta de 0,1 (RNF006): os dois cartões reservados ocupavam uma linha, e os três ou quatro que chegam, duas. Com quatro lugares (0d38c43), 0,002 no computador e 0 no celular.
- **LCP no celular** de `/appointments`: 3,0 s no modo padrão (simulado; desempenho 94 e 95) e 1,8 s com o estrangulamento do DevTools; o LCP é o texto do aviso de demonstração. No computador, 0,6 e 0,7 s.
- **Registro.** Acumulado (`>>`) nas cinco execuções do `next start` (normal, com a correção, falha e paginação, vazio e final): 207 linhas, todas `info`; nenhuma com cookie, token, cabeçalho de autorização, chave ou o e-mail de teste.
- **Encerramento.** `next start` encerrado por PID e `npx supabase stop`, com o backup. `npm run check` sem erros nem avisos, com 395 testes; `npm audit --omit=dev --audit-level=high` com 0. Nenhum import de `src/server/` e nada em `src/app/api/`, `supabase/` ou `src/shared/validation/` (`git diff --stat origin/main...HEAD`: 19 arquivos, todos da lista do plano).

## 2026-10-21 – desvio

Etapa 03 do PR 3, a pedido do Yvan: PR #74 (`Closes #58`), aberto como rascunho para pôr o número no relatório e depois marcado como pronto, com a revisão pedida a LFaustin0 e Kaykebr144, como no #72 e no #73. A `origin/main` continuava em 0fbcf60, sem nada a incorporar. `02_relatorio.md` completo, com os três PRs, e o plano em `concluido`. O PR tem 1.010 linhas em `src/`, acima da estimativa de ~650.
