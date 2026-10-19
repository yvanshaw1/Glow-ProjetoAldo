# Notas: 24-cadastro-e-senha

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-19 – descoberta

Conferências do planejamento, sem instalar nada no projeto:

- **Worktree.** O desta sessão é `24-cadastro-e-senha-e77823`, na ramificação `claude/24-cadastro-e-senha-e77823`, em 2151e5b, igual à `origin/main` (#21, #22, #23 e o PR #31). O plano e as notas ficam sem commit, como nas etapas 01 anteriores. A etapa 02 cria `feat/24-register-and-change-password` a partir da `origin/main`. O worktree não tem `node_modules`; a leitura do código instalado foi feita no `node_modules` do checkout principal (`App/`), com o `auth-js` 2.117.3.
- **`auth-js` 2.117.3:**
  - `UserAttributes` tem `current_password`, que só vale com `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` ligado no servidor do Supabase Auth;
  - o `signInWithPassword` com erro devolve o resultado sem apagar a sessão guardada; só a senha certa grava a nova sessão e dispara `SIGNED_IN`;
  - o `updateUser` usa a sessão guardada (`PUT /user` com o token dela) e dispara `USER_UPDATED`, que faz o `@supabase/ssr` regravar os cookies;
  - os códigos de erro incluem `email_exists`, `user_already_exists`, `same_password`, `weak_password` e `reauthentication_needed`.
- **Supabase Auth, código-fonte (`supabase/auth`, `master`, lido pela web):**
  - `internal/api/user.go`, `UserUpdate`: confere a força da senha; com `UpdatePasswordRequireReauthentication` ("secure password change"), exige sessão de menos de 24 horas ou um código; com `UpdatePasswordRequireCurrentPassword`, exige `current_password` (`current_password_required`, `current_password_mismatch`); recusa a senha igual à atual com `same_password` (422); grava com `UpdatePassword(tx, sessionID)`;
  - `internal/models/user.go`, `UpdatePassword`: sem sessão, encerra todas as sessões da conta; com sessão, chama `LogoutAllExceptMe`, que encerra todas as outras;
  - `internal/api/admin.go`, `adminUserUpdate`: confere a força da senha e chama `UpdatePassword(tx, nil)`, que encerra todas as sessões.
- **`supabase/config.toml`:** `secure_password_change = false`; `minimum_password_length = 6`; `sign_in_sign_ups = 30`. Não há opção para a exigência de senha atual; uma busca na web não achou essa opção na documentação do Supabase.
- **Banco:** `clients` não tem chave estrangeira para `auth.users`, e `uq_clients_email` é índice parcial (`where deleted_at is null`). `staff` tem `email` com `uq_staff_email` e `fk_staff_id` para `auth.users`. As duas tabelas têm `email` em minúsculas (`ck_*_email`) e gatilho de `updated_at`. Nada nesta tarefa exige migration.
- **Documentação:**
  - o UC04 (FA01 e FE02, RF014) também troca a senha com a senha atual, e `docs/clientes/rotas.md` não tem rota própria para isso, então a rota da troca serve aos dois;
  - o UC02, passo 6, leva ao login depois do cadastro;
  - `GET /api/me/profile` devolve nome, sobrenome, e-mail e telefone; o `PATCH` não muda o e-mail;
  - o README de `change-password/` ainda diz "Guard: `requireUser`", sem a senha pendente, que a #23 só ajustou no `me` e no logout.
- **`create-admin.mjs`** já trata `email_exists` e `user_already_exists` como e-mail em uso e remove a conta quando a linha de `staff` falha: o mesmo desenho do cadastro.
- **Outras tarefas.** Nenhum PR aberto e nenhuma ramificação da #25. A pasta de notas compartilhadas desta família de sessões estava vazia.

## 2026-10-19 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas L1 a L6 e a decisão nova 0048 (senha atual conferida por nova entrada no Supabase Auth, pelo cliente de sessão, com a troca gravada por essa sessão). Nada foi construído, e não há migration.

Dois pontos explícitos para a aprovação: as chaves do banco local passadas ao `npm run dev`, como na #23; e o cliente de teste que o cadastro na pré-visualização cria na base de produção.

## 2026-10-19 – decisão

Plano aprovado por yvan (19/10/2026 - 14:32), com a opção 1 em L1 a L6. Status em `em_execucao`. Os dois pontos para aprovação (chaves do banco local no `npm run dev` e o cliente de teste na pré-visualização) foram aprovados com o plano.

## 2026-10-19 – descoberta

Etapa 02:

- Ramificação `feat/24-register-and-change-password` criada da `origin/main` (2151e5b), sem vínculo com a `main`. `npm ci` no worktree; o lock não mudou.
- Commits: 036b789 (OpenAPI, validado com `@redocly/cli@2.57.0`, 1 aviso antigo de `license`), a86005b (testes em vermelho: 15 falhas), 97ea501 (`src/shared`, 168 testes verdes), 2bc1730 (refatoração: `checkPassword` extraída do login, sem mudar comportamento), 92bb043 (servidor e rotas) e 7ce1473 (documentação e decisão 0048).
- Desvio pequeno: `mensagens-de-validacao.md` dizia que todas as mensagens vêm de `formats.ts`; a da nova senha igual à atual fica em `auth.ts`, e a frase foi ajustada.
- O Zod 4.6.7 não roda o `refine` do objeto quando um campo já falhou, então a senha inválida e igual à atual recebe só a mensagem do RS003, como o teste pede.
- Um comando com `docker inspect` foi negado pela permissão; as regras do projeto proíbem o comando. A rede do banco local veio de `docker network ls` (`supabase_network_glow`).
- Verificação local: `npx supabase start` e `db reset`; variáveis por `local/local-env.sh` no scratchpad, só com `http://127.0.0.1:`; `next dev -p 3024`; contas por `local/accounts.mjs`; conferências por `local/check-register.mjs`, `check-change.mjs`, `check-lock.mjs` e `check-unavailable.mjs`. Resultado no "Estado da construção" do plano.
- O e-mail do cliente excluído voltou a ser aceito (201). A sessão de outro aparelho e a cópia dos cookies antigos responderam 401 depois da troca, e os cookies da resposta da troca continuaram valendo.
- Com o Supabase Auth parado, a troca de senha responde 503 já no guard (`getUser`), antes da reserva da tentativa; a devolução da tentativa na troca não pôde ser provocada à parte. O caminho é o mesmo `checkPassword` do login, conferido na #23.

## 2026-10-19 – dúvida

Achado na verificação (L7 do plano): a linha `error` da falha 500 do cadastro trouxe o `details` do erro do PostgREST, com o nome, o e-mail e o celular da linha recusada, contra o RS018. A causa é o `describeError` do tratamento único, que registra com `inspect` o erro que não é `Error`. Corrigir exige alterar `src/server/http/handler.ts` e `tests/http/handler.test.ts`, fora do plano. Recomendação: opção 1 do L7, a correção no tratamento único. Plano devolvido a `aguardando_aprovacao`; o PR não foi aberto.

## 2026-10-19 – decisão

L7 aprovado com a opção 1 (o `aprovado_em` continua com o horário da primeira aprovação). Commits 0a865da (2 testes em vermelho), 182f6e5 (`describeError` com só o código e a mensagem) e 20366f5 (`backend.md`). `npm run check` com 170 testes.

## 2026-10-19 – descoberta

- Na nova conferência do L7, o `next dev` antigo continuava na porta 3024 (o `TaskStop` não encerrou o processo filho) e já tinha recarregado a correção: a linha `error` ficou só com `code` e `message`. Os dois processos do `next dev` iniciados pela sessão foram encerrados por PID.
- No `next dev`, a página `/` respondeu 500: o Turbopack não conseguiu criar o processo Node do PostCSS (`globals.css`, código 0xc0000142 do Windows, registro em `%TEMP%\next-panic-*.log`). O `next build` compila a página sem erro, e a ramificação não mexe em páginas, CSS nem configuração. Fica anotado como problema do ambiente.
- Etapa 03: a `main` não tinha commits novos; relatório gravado e plano em `concluido`.
