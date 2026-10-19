---
issue: 23
titulo: "Sessão e login único: login, logout, me, bloqueio de tentativas e guards"
areas: [backend, banco, testes]
tipo: funcionalidade
requisitos: [UC03, UC08, RN023, RN026, RN027, RN029, RS001, RS004, RS005, RS006, RS007, RS008, RS009, RS010, RS011]
status: concluido
aprovado_por: yvan
aprovado_em: 19/10/2026 - 10:03
---

# Plano: Sessão e login único: login, logout, me, bloqueio de tentativas e guards

## Objetivo

Iniciar e encerrar pela API a sessão de clientes e de funcionários, com um só login (UC03, UC08, RN029, decisão 0019): `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me`. A sessão fica nos cookies do `@supabase/ssr` (RS007), a falha responde sempre a mesma mensagem (RS005) e 5 falhas seguidas bloqueiam o e-mail por 15 minutos (RS006, decisão 0016).

A tarefa também entrega os guards `requireUser`, `requireClient` e `requirePermission`. Eles leem do banco, a cada requisição, perfil, situação, cargo e permissões (RN026, RN027, RS001, RS004, RS008 a RS011), e as rotas das próximas tarefas vão usá-los. Por fim, cria a especificação OpenAPI com as três rotas, por ser esta a primeira tarefa de API.

## Como funciona

### Login (`POST /api/auth/login`)

1. A rota valida o corpo com `loginSchema` (L4). Corpo inválido responde 400 antes de qualquer contagem.
2. `reserveLoginAttempt(email)` chama a função SQL `reserve_login_attempt` (decisão 0047). Se o e-mail estiver bloqueado, responde 429 `ACCOUNT_LOCKED` com `Retry-After` nos segundos que faltam. Senão, a tentativa já fica contada (L3).
3. `signInWithPassword` no cliente de sessão (`createSessionClient`), que grava os cookies. `invalid_credentials` responde 401 `INVALID_CREDENTIALS`, e a tentativa continua contada. Outra falha do Supabase Auth devolve a tentativa e responde 503 (L6).
4. Senha certa: a linha do e-mail em `login_attempts` é apagada, o que zera o contador (L3).
5. Carrega a conta pelo id (`loadAccount`, abaixo). Sem perfil: encerra a sessão e responde 401 `INVALID_CREDENTIALS`, com uma linha `warn`. Funcionário desativado: encerra a sessão e responde 403 `ACCOUNT_INACTIVE` (L2). Qualquer erro depois do passo 3 também encerra a sessão antes de ser relançado, para nenhuma resposta de erro levar cookie de sessão.
6. Põe o usuário no contexto do registro, grava o evento `login` (`info`, com o perfil) e responde 200 com o corpo de L5, inclusive com `mustChangePassword` verdadeiro (FA03 do UC03, FA01 do UC08).

Para encerrar a sessão, o código chama `signOut({ scope: "local" })`: o Supabase Auth revoga a sessão recém-criada, e o `@supabase/ssr` apaga os cookies gravados no passo 3. Isso foi conferido no código instalado:

- no Next.js 16.4.1, as rotas estão na fase `action`, então o `getAll` do `cookies()` já enxerga os cookies gravados na mesma requisição, e o `applyServerStorage` do `@supabase/ssr` os apaga;
- o `finalizeResponse` do `app-route` junta os cookies a qualquer `Response` devolvida pela rota, inclusive a de erro montada pelo `handleRoute`.

### Logout (`POST /api/auth/logout`)

Sem guard (L1). Chama `signOut({ scope: "local" })` no cliente de sessão: o Supabase Auth revoga a sessão deste navegador, e os cookies são apagados. Responde sempre 204, mesmo sem sessão, com a senha inicial pendente ou com a conta desativada. Se o Supabase Auth falhar, responde 503 (L6), e os cookies são apagados do mesmo jeito: o `auth-js` remove a sessão local também nesse caso. O `Origin` continua conferido pelo `handleRoute`, então outro site não consegue derrubar a sessão.

### `me` (`GET /api/auth/me`)

`requireUser({ allowPasswordChange: true })` e 200 com o mesmo corpo do login (L5), lido do banco nesta requisição (RS011).

### Guards (`src/server/auth/guards.ts`)

`requireUser(options)` faz, nesta ordem:

1. **Sessão.** Confere com `getUser()` no Supabase Auth (decisão 0046), que também renova o token vencido. Sem sessão, ou com a sessão expirada ou revogada, responde 401 `UNAUTHENTICATED`. Se o Supabase Auth falhar, responde 503 (L6).
2. **Conta.** `loadAccount(userId)` lê do banco perfil, situação, cargo e permissões (RS011). Sem perfil, responde 401 `UNAUTHENTICATED`, com uma linha `warn` (L2).
3. **Registro.** Põe o id do usuário no contexto, e ele sai em todas as linhas seguintes da requisição.
4. **Situação.** Funcionário desativado recebe 403 `ACCOUNT_INACTIVE` (RN026, L2).
5. **Senha inicial.** Com `mustChangePassword`, responde 403 `PASSWORD_CHANGE_REQUIRED` (RS004), exceto com `allowPasswordChange`, que só o `me` e, na #24, a troca de senha usam (L1).

Os outros dois guards partem dele:

- `requireClient()` exige o perfil `client`; os outros perfis recebem 403 `FORBIDDEN`. Nas rotas `/api/me`, o id do cliente vem da conta devolvida (RS009).
- `requirePermission(permission)` exige o perfil `staff` ou `admin`. O cliente recebe 403 `FORBIDDEN` (RS010), assim como o funcionário sem a permissão (RS008); o admin passa sempre (RN027).

Cada guard devolve a conta (`Account`), que a rota repassa ao serviço.

### Conta (`loadAccount`, em `src/server/auth/session.ts`)

Busca em paralelo a linha de `staff`, com o cargo e as permissões na mesma consulta, e a de `clients` sem `deleted_at` (RN030):

| Linha encontrada | `profile` | Situação | `permissions` |
|---|---|---|---|
| `staff` com `is_admin` | `admin` | `staff.is_active` | todas (RN027) |
| `staff` com cargo ativo | `staff` | `staff.is_active` | as do cargo |
| `staff` com cargo inativo | `staff` | `staff.is_active` | nenhuma ("Cargo inativo não concede permissões", `docs/equipe/dados.md`) |
| `clients` | `client` | ativa | nenhuma |
| nenhuma | conta ausente (`null`) | – | – |

As permissões saem sempre na ordem de RN025, a da lista `PERMISSIONS`, para a #26 achar "a primeira página permitida".

### Arquivos novos de `src/`

| Arquivo | Conteúdo |
|---|---|
| `shared/constants/permissions.ts` | `PERMISSIONS` (`as const`, na ordem de RN025 e do enum `permission_key`), o tipo `Permission` e `PERMISSION_LABELS`, com os nomes de RN025: Dashboard, Agendamentos, Serviços, Clientes, Funcionários e Configurações |
| `shared/constants/profiles.ts` | `PROFILES` (`client`, `staff`, `admin`, do glossário de `guia/mapa.md`) e o tipo `Profile` |
| `shared/validation/auth.ts` | `loginSchema` e o tipo `LoginInput` (L4) |
| `shared/api/auth.ts` | tipo `SessionUser`, o corpo do login e do `me` (L5) |
| `server/repositories/staff.ts` | `findStaffAccount(id)`: funcionário com `is_admin`, `is_active`, `must_change_password`, a situação do cargo e as permissões, numa consulta |
| `server/repositories/clients.ts` | `findClientAccount(id)`: cliente sem `deleted_at` |
| `server/repositories/login-attempts.ts` | chamadas às duas funções SQL por `rpc` e a exclusão da linha do e-mail |
| `server/auth/login-attempts.ts` | `MAX_LOGIN_ATTEMPTS` (5) e `LOGIN_LOCK_MINUTES` (15) (RS006); reserva, que lança `ACCOUNT_LOCKED` com `retryAfterSeconds`; devolução; limpeza |
| `server/auth/session.ts` | `signIn` (id ou `null` na credencial errada), `signOut`, `getSessionUserId` (`getUser`), `loadAccount` e o tipo `Account` |
| `server/auth/guards.ts` | `requireUser`, `requireClient` e `requirePermission` |
| `server/services/auth.ts` | `login(input)`, `logout()` e `toSessionUser(account)` |
| `app/api/auth/{login,logout,me}/route.ts` | as três rotas pelo `handleRoute` |

Alterações nos arquivos da #22:

| Arquivo | Mudança |
|---|---|
| `server/http/logger.ts` | o contexto da requisição ganha `userId` (`null` até o guard) e `setRequestUser(id)`, e toda linha passa a trazer `userId`; sai o `TODO(#23)` |
| `server/http/handler.ts` | `Cache-Control: no-store` em toda resposta (L7); `SERVICE_UNAVAILABLE` entre os códigos de nível `warn` (L6); contexto aberto com `userId: null` |
| `server/supabase/clients.ts` | sai o `TODO(#23)`: o `setAll` deixa de lado os cabeçalhos anticache, porque o tratamento único já marca toda resposta da API (L7). O comentário aponta que o `proxy.ts` (#26) precisa aplicá-los nas páginas |

## Ordem da construção

1. Criar a ramificação `feat/23-session-and-login` a partir da `origin/main` e desfazer o vínculo com a `main`, como na #21 e na #22.
2. Escrever o contrato em `docs/plataforma/openapi.yaml`, antes da implementação (`api.md`).
3. Escrever os testes de `tests/validation/` e `tests/http/` e conferir que falham (vermelho). Eles vão num commit próprio, antes do código.
4. Escrever as constantes, os esquemas e os tipos de `src/shared`, depois `logger.ts` e `handler.ts`, até os testes passarem (verde).
5. Criar a migration com `npx supabase migration new login_attempt_functions` e conferi-la no banco local, com `npx supabase start`, `npx supabase db reset`, o roteiro de SQL da verificação e `npx supabase db lint`.
6. Escrever os repositórios, `src/server/auth/`, o serviço e as três rotas.
7. Documentação das lacunas, as decisões 0046 e 0047 e os README.
8. Verificação local, com o `npm run check`, as contas de teste e as rotas temporárias (seção seguinte).
9. Etapa 03: PR e `02_relatorio.md`. O Yvan aplica a migration no projeto real antes de testar a pré-visualização e antes da incorporação. A migration só acrescenta funções, que o código publicado não chama, então aplicá-la antes é seguro.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um cliente, quando entra com e-mail e senha certos, então a sessão fica em cookies `HttpOnly`, `Secure` e `SameSite=Lax` e a resposta traz `profile` `client` (RN029, RS007) | Local: login do cliente de teste responde 200 com `profile` "client" e `permissions` vazio. Cada `Set-Cookie`, inclusive os pedaços `.0` e `.1`, traz `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`, com o valor oculto. O `me` com os cookies responde 200 com o mesmo corpo |
| Dado um funcionário com cargo, quando entra, então a resposta traz `profile` `staff` e as permissões do cargo; o admin recebe todas (RN027) | Local: o funcionário de teste recebe `["dashboard", "appointments"]`, e o de cargo inativo, `[]`. O admin recebe `profile` "admin" com as 6 permissões, na ordem de RN025. Pré-visualização: o desenvolvedor entra com o admin |
| Dado um e-mail inexistente ou uma senha errada, quando tenta entrar, então recebe 401 `INVALID_CREDENTIALS` com a mesma mensagem (RS005) | Local: os dois casos têm corpos iguais, exceto o `requestId`. Pré-visualização: e-mail inexistente |
| Dado 5 falhas seguidas para o mesmo e-mail, quando tenta de novo nos 15 minutos seguintes, então recebe 429 `ACCOUNT_LOCKED` com `Retry-After`, mesmo com a senha certa; um login certo antes da quinta falha zera o contador (RS006) | Local: 4 falhas e a senha certa respondem 200; mais 4 falhas continuam 401, porque a contagem recomeçou. Com 5 falhas, a sexta tentativa, com a senha certa, recebe 429 e `Retry-After` próximo de 900. 20 tentativas simultâneas com senha errada num e-mail novo dão exatamente 5 respostas 401 e 15 respostas 429 (decisão 0047). O roteiro de SQL confere o fim do bloqueio, com `locked_until` no passado: a contagem recomeça (L3). Também confere a devolução da tentativa (L6) |
| Dado um funcionário desativado, quando entra com a senha certa, então recebe 403 `ACCOUNT_INACTIVE` e não há sessão (RN026) | Local: responde 403, e nenhum `Set-Cookie` tem valor (no máximo os de `Max-Age=0`); o `me` com o arquivo de cookies responde 401. A senha errada no mesmo e-mail responde 401, porque a situação da conta só aparece com a senha certa |
| Dado uma sessão, quando chama o logout, então recebe 204, a sessão é encerrada no Supabase Auth e os cookies são apagados (RS007) | Local: copiar os cookies antes do logout. O logout responde 204, com `Set-Cookie` `Max-Age=0` para cada cookie da sessão. O `me` com a cópia dos cookies antigos responde 401, porque a sessão foi revogada e o `getUser` (decisão 0046) recusa o token. Sem cookies, o logout também responde 204 (L1). Pré-visualização: logout do admin e `me` em seguida (401) |
| Dado um funcionário desativado ou com o cargo alterado depois do login, quando faz a requisição seguinte, então vale a situação e as permissões atuais do banco (RS011) | Local: com a sessão aberta, tirar `appointments` do cargo pelo SQL. O `me` passa a trazer só `["dashboard"]`, e `dev-check/permission` passa de 200 a 403. Com `staff.is_active` falso, o `me` e as rotas temporárias respondem 403 `ACCOUNT_INACTIVE`, e o logout continua 204 |
| Dado uma conta com `must_change_password`, quando chama uma rota protegida que não seja a de troca de senha, então recebe 403 `PASSWORD_CHANGE_REQUIRED` (RS004) | Local: cliente de teste com a marca. O login responde 200 com `mustChangePassword: true`. `dev-check/user` e `dev-check/client` respondem 403 `PASSWORD_CHANGE_REQUIRED`; o `me` responde 200 e o logout, 204 (L1) |
| Dado um cliente, quando chama uma rota com `requirePermission`, então recebe 403 (RS010) | Local: `dev-check/permission` responde 403 `FORBIDDEN` para o cliente e para o funcionário sem a permissão, e 200 para o admin. `dev-check/client` responde 403 para o funcionário |

### Como a verificação local é feita

- **Banco local.** Docker Desktop, `npx supabase start` e `npx supabase db reset`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Contas de teste.** Um roteiro no scratchpad da sessão, fora do repositório, cria pelo `auth.admin.createUser` as contas e as linhas de `clients`, `staff`, `roles` e `role_permissions`. São elas: um cliente; um cliente com `must_change_password`; um funcionário com um cargo de permissões `dashboard` e `appointments`; um funcionário desativado; um funcionário com cargo inativo; e o administrador, pelo `create-admin.mjs`. As senhas são geradas pelo roteiro e nunca exibidas. Os clientes do `seed-demo.sql` não servem, porque não têm conta no Supabase Auth.
- **Aplicação.** `npm run dev`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las em arquivo. O worktree não tem `.env.local`, e o agente não cria `.env*`. **Ponto para a sua aprovação:** são as chaves que a CLI gera para o banco local e descartável, como o roteiro do `create-admin.mjs` usou na #17; nenhuma chave do projeto real é tocada.
- **Chamadas.** `curl`, com os cookies num arquivo do scratchpad. Na saída, o valor de cada cookie é trocado por `<oculto>`, e só o nome e os atributos aparecem. Para os atributos no navegador, o navegador do app em `http://localhost:3000`.
- **Rotas temporárias.** `src/app/api/dev-check/{user,client,permission}/route.ts`, com `requireUser()`, `requireClient()` e `requirePermission("appointments")`, só no worktree. Elas são apagadas antes de qualquer commit, conferido no `git status`, como na #22.
- **SQL.** O roteiro roda pelo `psql` da imagem do banco, num contêiner novo ligado à rede do `supabase_db_glow`, sem `docker exec`, como na #17. Casos: primeira tentativa, quinta tentativa com início do bloqueio, tentativa durante o bloqueio (não conta), fim do bloqueio (recomeça), devolução, e os privilégios: `anon` e `authenticated` sem `execute`, `service_role` com.
- **Cache e registro.** `curl -I` no login, no `me` e num erro mostra `Cache-Control: no-store` (L7). Na saída do `npm run dev`, nenhuma linha traz a senha de teste, o e-mail, o token ou os cookies (RS018). As linhas de `me` trazem o `userId`.
- **Especificação.** `npx -y @redocly/cli@2.57.0 lint docs/plataforma/openapi.yaml`, sem instalar no projeto. A versão 2.57.0, de 30/09/2026, é a mais recente com mais de duas semanas. O `npm run format:check` já confere a formatação do YAML pelo Prettier.
- **`npm run check`** sem erros nem avisos, local e no CI.
- **Pré-visualização**, passo do desenvolvedor, depois da migration aplicada: as linhas marcadas como "Pré-visualização" na tabela acima.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/shared/constants/permissions.ts` | criar |
| `src/shared/constants/profiles.ts` | criar |
| `src/shared/validation/formats.ts` | alterar: `signInPasswordSchema`, a senha do login (L4) |
| `src/shared/validation/auth.ts` | criar: `loginSchema` (L4) |
| `src/shared/api/auth.ts` | criar: `SessionUser` (L5) |
| `src/server/http/logger.ts` | alterar: usuário no contexto e em toda linha |
| `src/server/http/handler.ts` | alterar: `Cache-Control` (L7), nível de `SERVICE_UNAVAILABLE` (L6), `userId` no contexto |
| `src/server/supabase/clients.ts` | alterar: sai o `TODO(#23)` (L7) |
| `src/server/repositories/clients.ts` | criar |
| `src/server/repositories/staff.ts` | criar |
| `src/server/repositories/login-attempts.ts` | criar |
| `src/server/auth/session.ts` | criar |
| `src/server/auth/guards.ts` | criar |
| `src/server/auth/login-attempts.ts` | criar |
| `src/server/services/auth.ts` | criar |
| `src/app/api/auth/login/route.ts` | criar |
| `src/app/api/auth/logout/route.ts` | criar |
| `src/app/api/auth/me/route.ts` | criar |
| `src/app/api/auth/README.md`, `logout/README.md`, `me/README.md` | alterar (L1) |
| `supabase/migrations/<data>_login_attempt_functions.sql` | criar (decisão 0047) |
| `tests/validation/auth.test.ts` | criar |
| `tests/validation/formats.test.ts` | alterar: senha do login (L4) |
| `tests/http/handler.test.ts` | alterar (L6, L7, usuário) |
| `tests/http/logger.test.ts` | alterar (usuário) |
| `docs/plataforma/openapi.yaml` | criar |
| `docs/acesso/dados.md` | criar: tabela `login_attempts`, que sai de `autenticacao.md`, e as duas funções (0047, L3) |
| `docs/acesso/autenticacao.md` | alterar (L1, L2, L3, L6, L8) |
| `docs/acesso/rotas.md` | alterar (L1, L4, L5) |
| `docs/acesso/CONTEXT.md` | alterar: linha de `dados.md` e descrição de `autenticacao.md` |
| `docs/plataforma/RN035-formatos-dos-dados.md` | alterar: senha no login (L4) |
| `docs/plataforma/seguranca.md` | alterar: implementação de RS006 e RS007 (L3, L8) |
| `docs/padroes/api.md` | alterar (L6, L7) |
| `docs/padroes/backend.md` | alterar: níveis do registro (L2, L6), funções do login (0047), `Cache-Control` (L7) e usuário em toda linha |
| `docs/padroes/testes.md` | alterar: casos do tratamento único (L7 e usuário) |
| `docs/decisoes/0046-sessao-conferida-no-supabase-auth.md` | criar |
| `docs/decisoes/0047-tentativa-de-login-reservada.md` | criar |
| `docs/decisoes/CONTEXT.md` | alterar: linhas da 0046 e da 0047 |
| `memoria/tarefas/23-sessao-e-login/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |

Os README de `src/server/auth/`, `repositories/`, `services/`, `src/shared/constants/`, `api/` e `validation/` já descrevem estes arquivos e não mudam. O de `login/` também não: o guard continua "nenhum".

### Em comum com outras tarefas em andamento

- Nenhum PR aberto.
- #24 (cadastro e troca de senha) e #25 (base do frontend) dependem desta. A #24 vai mexer em `src/shared/validation/auth.ts`, `services/auth.ts`, `repositories/clients.ts`, `rotas.md`, `autenticacao.md` e `openapi.yaml`, e usar o `allowPasswordChange`. A #25 vai usar `SessionUser`, `PERMISSIONS` e `PERMISSION_LABELS`.

## Testes previstos

Valores esperados tirados de `mensagens-de-validacao.md`, de RN035, do catálogo de `api.md`, de RS003 e da opção recomendada de cada lacuna.

`tests/validation/auth.test.ts` (`loginSchema`, L4)

- normalizes the e-mail: "  Maria@Email.COM " → "maria@email.com"
- rejects an e-mail outside the RN035 format: "maria@email" → "Informe um e-mail válido, como maria@email.com."
- requires the e-mail and the password: ausentes ou vazios → "Preencha este campo." em `email` e em `password`
- discards fields not in the schema: `{ email, password, profile: "admin" }` → sem `profile` (RS013)

`tests/validation/formats.test.ts` (`signInPasswordSchema`, L4)

- keeps the sign-in password as typed: " Senha forte 1! ", com espaços → igual
- accepts a sign-in password outside the RS003 rules: "abc" → "abc", porque o 401 vem do serviço (RS005)
- accepts a sign-in password of exactly 72 bytes: 36 "é"
- rejects a sign-in password above 72 bytes in UTF-8 with the RS003 message: 37 "é" (74 bytes) → "A senha deve ter de 8 a 72 caracteres, com letra maiúscula, número e caractere especial."
- requires the sign-in password: "" → "Preencha este campo."

`tests/http/handler.test.ts`

- marks every response as not cacheable: `Cache-Control: no-store` no 200 da rota, no Problem Details de um `AppError`, no 500 e na origem recusada (L7)
- logs a warn line for ACCOUNT_LOCKED, VERSION_CONFLICT, SERVICE_UNAVAILABLE and a refused origin: o teste existente ganha o `SERVICE_UNAVAILABLE` (L6)
- logs the user set by the route in the request line, e `userId` nulo quando a rota não o define

`tests/http/logger.test.ts`

- writes the user set during the request in every later line, also after an await
- writes a null userId before the user is known and outside a request
- keeps the users of two simultaneous requests apart

Os guards, a sessão e o serviço dependem do Supabase e ficam fora dos testes automatizados (decisão 0045). Eles são conferidos à mão, como descrito acima.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. `me` e logout com a senha inicial pendente, sem sessão ou com a conta desativada

**Problema.** Há quatro pontos sem resposta ou em conflito:

- `autenticacao.md` diz: "Enquanto a marca existir, toda rota, exceto a de troca de senha, responde 403 `PASSWORD_CHANGE_REQUIRED`". Mas `rotas.md` faz o `me` devolver `mustChangePassword`, campo que não serviria se o `me` respondesse 403 sempre que ele é verdadeiro. A #25 e a #26 precisam do `me` para levar a pessoa a `/set-password`.
- Pela mesma regra, a pessoa com a senha pendente não conseguiria sair.
- `rotas.md` diz que o logout exige sessão válida. Como a conta desativada recebe 403 em toda rota com sessão (L2), um funcionário desativado com cookies ainda válidos não conseguiria encerrar a sessão.
- Não está dito se o logout encerra só a sessão do navegador ou as de todos os aparelhos. O padrão do `supabase-js` é todas.

**Opções:**

- [X] **1. O `me` aceita a senha pendente; o logout não tem guard, encerra só a sessão deste navegador e responde sempre 204 (recomendada).** O `me` continua recusando a conta desativada (403) e a requisição sem sessão (401). Sem sessão, o logout não muda nada e responde 204, então a interface consegue sair em qualquer estado. Outros aparelhos da mesma conta continuam conectados.
- [ ] **2. Igual à 1, mas o logout encerra as sessões de todos os aparelhos da conta (`scope: "global"`).** Sair num computador da empresa também desconecta o celular do funcionário.
- [ ] **3. Como está: o `me` e o logout respondem 403 enquanto a marca existir, e o logout responde 401 sem sessão.** A interface não tem como saber que a senha está pendente, e a pessoa não consegue sair.

**Texto proposto (opção 1):**

- `docs/acesso/autenticacao.md`, Perfis e contas: "Enquanto a marca existir, toda rota, exceto a de troca de senha, responde 403 `PASSWORD_CHANGE_REQUIRED`, e a interface leva a `/set-password`." passa a "Enquanto a marca existir, toda rota com sessão responde 403 `PASSWORD_CHANGE_REQUIRED`, exceto a troca de senha, `GET /api/auth/me` e o logout, e a interface leva a `/set-password`."
- Mesmo arquivo, Sessão: "Logout encerra a sessão no Supabase Auth e apaga os cookies (RS007)." passa a "O logout encerra no Supabase Auth a sessão deste navegador, sem afetar as de outros aparelhos, e apaga os cookies (RS007). Ele não exige sessão: sem ela, sem perfil, com a conta desativada ou com a senha inicial pendente, responde 204 do mesmo jeito."
- Mesmo arquivo, Autorização: "`requireUser`: sessão válida (RS001);" passa a "`requireUser`: sessão válida e conta ativa, sem troca de senha pendente (RS001, RS004, RN026); só o `me` e a troca de senha aceitam a senha pendente;".
- `docs/acesso/rotas.md`, Rotas de autenticação: "Acesso: Cadastro e login são públicos; as demais exigem sessão válida." passa a "Acesso: Cadastro, login e logout são públicos; `me` e troca de senha exigem sessão válida e aceitam a senha inicial pendente."
- Mesmo arquivo, logout: "Resposta: **204** sem conteúdo." passa a "Resposta: **204** sem conteúdo, também sem sessão."
- `src/app/api/auth/README.md`: "Cadastro e login são públicos; logout, `me` e troca de senha exigem sessão (`requireUser`)." passa a "Cadastro, login e logout são públicos; `me` e troca de senha exigem sessão (`requireUser`, aceitando a senha inicial pendente)."
- `src/app/api/auth/logout/README.md`: "Guard: `requireUser`." passa a "Guard: nenhum (encerra a sessão, se houver)."
- `src/app/api/auth/me/README.md`: "Guard: `requireUser`." passa a "Guard: `requireUser`, aceitando a senha inicial pendente."

### L2. Conta desativada, excluída ou sem perfil

**Problema.** `autenticacao.md` diz que "Conta desativada (`staff.is_active` falso) ou excluída (`clients.deleted_at`) não inicia sessão (RN026, RN030)", e `rotas.md` dá 403 `ACCOUNT_INACTIVE` ao login. Faltam duas respostas:

- **Cliente excluído no login.** A exclusão remove a conta do Supabase Auth (`banco.md`), então o login normalmente já falha na senha. Mas a senha pode conferir sem haver perfil, se a conta do Auth sobrar por uma falha na exclusão ou se faltar a linha do perfil por uma falha no cadastro.
- **Conta desativada ou excluída depois do login (RS011).** A resposta dos guards nesse caso não está definida.

**Opções:**

- [X] **1. Desativada recebe 403 `ACCOUNT_INACTIVE`; sem perfil, o mesmo 401 do e-mail inexistente (recomendada).** No login, o funcionário desativado recebe 403 `ACCOUNT_INACTIVE`. Sem perfil (cliente excluído ou conta sem linha), recebe 401 `INVALID_CREDENTIALS`, como um e-mail inexistente (RS005), e gera uma linha `warn` `account_without_profile`, só com o id. Nos dois casos, a sessão recém-criada é encerrada. Nas requisições seguintes, a conta desativada recebe 403 `ACCOUNT_INACTIVE`, sem mexer na sessão (sair é o logout, L1), e a conta sem perfil recebe 401 `UNAUTHENTICATED`, com a mesma linha `warn`. O cliente excluído é tratado como inexistente, e nenhum `GET` altera estado (`api.md`).
- [ ] **2. Sem perfil também recebe 403 `ACCOUNT_INACTIVE`, no login e nos guards.** A mensagem "Esta conta está desativada" diria, a quem tenta o e-mail de um cliente excluído, que ele já teve conta, contra o RS005.
- [ ] **3. Nos guards, conta desativada ou sem perfil recebe 401 `UNAUTHENTICATED`, e a sessão é encerrada ali mesmo.** A interface só veria "Sua sessão expirou", sem saber que a conta foi desativada, e um `GET` passaria a alterar estado, contra `api.md`.

**Texto proposto (opção 1):**

- `docs/acesso/autenticacao.md`, Sessão: "Conta desativada (`staff.is_active` falso) ou excluída (`clients.deleted_at`) não inicia sessão (RN026, RN030)." passa a "Conta desativada (`staff.is_active` falso) ou excluída (`clients.deleted_at`) não inicia sessão (RN026, RN030). Com a senha certa, a desativada recebe 403 `ACCOUNT_INACTIVE`, e a excluída, ou a conta do Supabase Auth sem perfil, recebe o mesmo 401 `INVALID_CREDENTIALS` do e-mail inexistente (RS005). Nos dois casos, a sessão aberta pela validação da senha é encerrada. A conta sem perfil gera uma linha `warn` no registro."
- Mesmo arquivo, Autorização, depois do parágrafo do RS011: "Desativada depois do login, a conta recebe 403 `ACCOUNT_INACTIVE` em toda rota com sessão, até o logout; excluída ou sem perfil, recebe 401 `UNAUTHENTICATED`."
- `docs/padroes/backend.md`, tabela de níveis, linha `warn`: "anomalia tratada: bloqueio de login, conflito de versão, origem recusada" passa a "anomalia tratada: bloqueio de login, conflito de versão, origem recusada, conta do Supabase Auth sem perfil" (L6 acrescenta mais um item).

### L3. O bloqueio durante e depois dos 15 minutos

**Problema.** RS006 e `autenticacao.md` dizem que 5 falhas seguidas bloqueiam por 15 minutos e que o login certo zera o contador. O critério da issue acrescenta que a senha certa durante o bloqueio recebe 429. Ficam sem resposta três pontos:

- se as tentativas durante o bloqueio contam ou prolongam o bloqueio;
- o que acontece com o contador quando o bloqueio acaba;
- se a senha certa de uma conta que não pode entrar (desativada ou sem perfil, L2) zera o contador.

**Opções:**

- [X] **1. Durante o bloqueio, nada conta; depois dele, a contagem recomeça (recomendada).** A tentativa durante o bloqueio recebe 429 sem conferir a senha, não conta e não prolonga o bloqueio. Quando ele acaba, a contagem recomeça do zero, com mais 5 tentativas. A senha certa zera o contador mesmo quando a conta não pode entrar, porque não é tentativa de adivinhar. O contador é pelo e-mail informado, exista a conta ou não (RS005). Quem tenta adivinhar confere no máximo 5 senhas a cada 15 minutos, e ninguém mantém outra pessoa bloqueada sem continuar errando.
- [ ] **2. Depois do bloqueio, o contador fica em 5, e cada nova falha bloqueia de novo.** É mais rígida: depois do primeiro bloqueio, 1 senha a cada 15 minutos, até um login certo.
- [ ] **3. Tentativas durante o bloqueio prolongam o bloqueio por mais 15 minutos.** Basta alguém repetir tentativas com o e-mail de outra pessoa para impedi-la de entrar por tempo indefinido.

**Texto proposto (opção 1):**

- `docs/acesso/dados.md`, novo (decisão 0047), seção "Bloqueio": "5 falhas seguidas para o mesmo e-mail, exista a conta ou não, bloqueiam o login por 15 minutos, contados da quinta tentativa (RS006). Durante o bloqueio, a resposta é 429 `ACCOUNT_LOCKED`, com `Retry-After` nos segundos que faltam, sem conferir a senha; essas tentativas não contam nem prolongam o bloqueio. Quando ele acaba, a contagem recomeça do zero. A senha certa zera o contador, mesmo quando a conta não pode entrar (desativada ou sem perfil)."
- `docs/acesso/autenticacao.md`, Sessão: "Bloqueio: 5 falhas seguidas para o mesmo e-mail bloqueiam por 15 minutos; resposta 429 `ACCOUNT_LOCKED` com `Retry-After` em segundos; login certo zera o contador (RS006)." passa a "Bloqueio: 5 falhas seguidas para o mesmo e-mail bloqueiam o login por 15 minutos, com 429 `ACCOUNT_LOCKED` e `Retry-After` em segundos; a senha certa zera o contador (RS006). Regras e funções: [dados.md](dados.md)."
- `docs/plataforma/seguranca.md`, RS006, Implementação: "A tabela `login_attempts` conta as falhas consecutivas por e-mail e bloqueia o login por quinze minutos após a quinta falha." passa a "A tabela `login_attempts` conta as falhas consecutivas por e-mail, por uma função SQL que reserva cada tentativa antes de conferir a senha, e bloqueia o login por quinze minutos após a quinta falha (`docs/acesso/dados.md`)."

### L4. Validação do corpo do login

**Problema.** `rotas.md` só diz `email*, password*`. Três requisitos puxam em direções diferentes, e nenhum módulo diz qual validação o login aplica:

- RS013 manda validar tipo, formato e tamanho de toda entrada;
- RS005 proíbe indicar qual credencial está errada;
- RS003 e RN035 definem a senha para quem a cria.

**Opções:**

- [X] **1. E-mail com o formato de RN035; senha só obrigatória e com até 72 bytes (recomendada).** O e-mail passa pelo `emailSchema`: minúsculas, sem espaços e com a mensagem de formato. A senha é obrigatória, tem até 72 bytes em UTF-8, fica como digitada e não passa pelas regras de composição do RS003. Senha fora dessas regras recebe o mesmo 401 da senha errada (RS005). E-mail malformado recebe 400 com a mensagem do formato, como no cadastro, sem revelar conta, porque nenhum e-mail malformado tem conta; essa tentativa não conta para o bloqueio. Acima de 72 bytes, a senha recebe a mensagem do RS003, já que nenhuma senha gravada passa disso.
- [ ] **2. E-mail e senha só obrigatórios, sem formato.** Tudo o mais recebe 401 `INVALID_CREDENTIALS`. É mais estrita com o RS005, mas um e-mail sem @ só aparece como "E-mail ou senha incorretos" e conta como tentativa. Foge do RS013, que pede formato.
- [ ] **3. Senha com o `passwordSchema` completo do RS003.** A senha fora das regras recebe a mensagem das regras, o que indica que a senha é a credencial errada, contra o RS005.

**Texto proposto (opção 1):**

- `docs/acesso/rotas.md`, login: "Entrada: `email*, password*`" passa a "Entrada: `email*` (formato de RN035), `password*` (só obrigatória e com até 72 bytes, como digitada, sem as regras de composição do RS003)".
- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "Senha", ao fim da regra: acrescentar "No login, a senha só é obrigatória e limitada a 72 bytes; as regras de composição valem onde a senha é definida, para a senha fora delas receber a mesma resposta da senha errada (RS005)."

### L5. Corpo das respostas do login e do `me`

**Problema.** `rotas.md` diz que o login devolve "dados do usuário, com o perfil em `profile`, `mustChangePassword` e permissões" e que o `me` devolve "perfil, nome, `mustChangePassword` e lista de permissões". Não define os campos, não diz se os dois corpos são iguais, e "nome" pode ser um campo só ou nome e sobrenome. O contrato entra no `openapi.yaml` antes da implementação (`api.md`).

**Opções:**

- [X] **1. O mesmo corpo nas duas rotas, com nome e sobrenome separados e sem id nem e-mail (recomendada).** Exemplo: `{ "profile": "staff", "firstName": "Ana", "lastName": "Souza", "mustChangePassword": false, "permissions": ["dashboard", "appointments"] }`. `profile` vale `client`, `staff` ou `admin`; `permissions` vem na ordem de RN025, com todas para o admin e lista vazia para o cliente. Fica sem id, porque o id vem sempre da sessão (RS009), e sem e-mail, que é dado pessoal e que a tela de perfil busca na rota própria. O tipo `SessionUser` serve à #25 e à #26.
- [ ] **2. Igual à 1, com `id` e `email`.** A interface teria o e-mail para o cabeçalho sem outra chamada, mas o corpo leva dados que nenhuma tela da fundação usa.
- [ ] **3. `name`, com nome e sobrenome juntos.** Cada tela que quiser só o primeiro nome ("Olá, Ana") teria de quebrar o texto.

**Texto proposto (opção 1):**

- `docs/acesso/rotas.md`, login: "Resposta: **200** dados do usuário, com o perfil em `profile`, `mustChangePassword` e permissões;" passa a "Resposta: **200** usuário da sessão: `profile` (`client`, `staff` ou `admin`), `firstName`, `lastName`, `mustChangePassword` e `permissions` (na ordem de RN025; todas para o admin, nenhuma para o cliente);".
- Mesmo arquivo, `me`: "Resposta: **200** perfil, nome, `mustChangePassword` e lista de permissões." passa a "Resposta: **200** o mesmo corpo do login, lido do banco nesta requisição; 401 `UNAUTHENTICATED`; 403 `ACCOUNT_INACTIVE`."
- `docs/plataforma/openapi.yaml`: esquema `SessionUser` com esses campos.

### L6. Falha do Supabase Auth

**Problema.** O login, o logout e a conferência da sessão dependem do Supabase Auth, que pode falhar por rede, por indisponibilidade ou pelo limite de entradas. Esse limite é, no padrão, 30 a cada 5 minutos por IP (`sign_in_sign_ups` no `config.toml`), e todas as entradas chegam do servidor da Vercel, não do navegador. O catálogo tem o 503 `SERVICE_UNAVAILABLE`, mas nenhum módulo diz quando usá-lo. E, como a tentativa é reservada antes de conferir a senha (decisão 0047), uma falha do Supabase contaria como tentativa.

**Opções:**

- [X] **1. 503 `SERVICE_UNAVAILABLE`, com a tentativa devolvida (recomendada).** A falha gera uma linha `warn` `auth_unavailable`, com o código e o status HTTP do erro do Supabase, nunca o e-mail. No login, a tentativa reservada é devolvida, porque a senha não foi conferida. No logout, os cookies são apagados mesmo assim. Quem tenta entrar enquanto o Supabase recusa não fica bloqueado, e a pessoa vê "O serviço está temporariamente indisponível".
- [ ] **2. 500 `INTERNAL_ERROR`, como qualquer falha inesperada, e a tentativa continua contada.** Não dá uso ao 503, mas 5 tentativas durante uma falha do Supabase bloqueiam a pessoa por 15 minutos sem nenhuma senha errada. A linha `error` também mistura falha externa com defeito do código.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Erros, depois da tabela: novo parágrafo "O 503 `SERVICE_UNAVAILABLE` responde quando o Supabase Auth não atende (rede, indisponibilidade ou limite de requisições), no login, no logout e na conferência da sessão; o detalhe vai só ao registro, numa linha `warn`."
- `docs/padroes/backend.md`, tabela de níveis, linha `warn`: acrescentar "Supabase Auth indisponível" à lista de L2.
- `docs/acesso/dados.md`, Bloqueio: acrescentar "Se o Supabase Auth não atende, a tentativa é devolvida (`release_login_attempt`) e a resposta é 503 `SERVICE_UNAVAILABLE`."

### L7. Respostas da API fora de cache

**Problema.** O `@supabase/ssr` entrega ao `setAll`, junto com os cookies, cabeçalhos para a resposta não ir para cache: `Cache-Control: private, no-cache, no-store, must-revalidate, max-age=0`, `Expires: 0` e `Pragma: no-cache`. O objetivo é que um cache entre o navegador e o servidor não guarde a resposta que grava a sessão e a entregue a outra pessoa (`TODO(#23)` em `clients.ts`).

Numa rota, o `cookies()` de `next/headers` grava os cookies, mas não tem como acrescentar cabeçalhos. A renovação do token pode gravar cookies em qualquer rota com sessão, não só no login. A documentação não fala de cache nas respostas da API.

**Opções:**

- [X] **1. O tratamento único envia `Cache-Control: no-store` em toda resposta da API (recomendada).** Vale para as respostas de sucesso e de erro. É uma linha no handler, que não depende de saber se houve cookie, e ela é testada em `tests/http`. As respostas da API são da sessão ou baratas, e nenhuma rota prevê cache. O `setAll` do `clients.ts` deixa os cabeçalhos de lado, com um comentário. As páginas ficam para o `proxy.ts` (#26).
- [ ] **2. Só as respostas que gravam cookies recebem os cabeçalhos da biblioteca.** O `setAll` os guarda no contexto da requisição, e o handler os aplica. É mais preciso, mas acrescenta estado mutável ao contexto e caminhos que só os testes manuais cobrem. As demais respostas da API poderiam ir para o cache de um proxy.
- [ ] **3. Nada.** As rotas do Next.js não vão para cache por padrão, e a Vercel só guarda resposta de função com `s-maxage`. Um proxy no caminho, como o de uma rede corporativa, ainda poderia guardar.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Desenho, novo item depois de "Sucesso: 200, 201 (criado) e 204 (sem corpo).": "Nenhuma resposta da API vai para cache: o tratamento único envia `Cache-Control: no-store` em todas, de sucesso e de erro, porque qualquer uma pode renovar os cookies da sessão."
- `docs/padroes/backend.md`, Erros, primeiro item: depois de "e entrega o corpo já convertido;", acrescentar "em toda resposta, envia `Cache-Control: no-store` (`api.md`);".
- `docs/padroes/testes.md`, linha "Tratamento único": acrescentar "resposta fora de cache; usuário em toda linha do registro".

### L8. Validade da sessão (RS007)

**Problema.** O RS007 pede que a sessão expire após um período de validade. A implementação documentada é o token de acesso de 1 hora (`jwt_expiry = 3600`), renovado pelo servidor com o token de renovação. Três fatos estendem essa sessão:

- o `@supabase/ssr` 0.12.7 grava os cookies com validade fixa de 400 dias, sem opção para mudar (`dist/main/cookies.js`, conferido);
- no Supabase Auth, a sessão não tem fim por padrão;
- o limite de duração e de inatividade (`[auth.sessions]`) é configurado no painel, contra a decisão 0044, e, pelas fontes consultadas, é recurso de plano pago, contra a 0030.

Na prática, a sessão dura até o logout: até 400 dias sem uso, ou sem limite com uso.

**Opções:**

- [X] **1. Manter o que o RS007 documenta e deixar o resto explícito (recomendada).** O token de acesso vale 1 hora e é renovado pelo servidor; a sessão vale até o logout ou a revogação no Supabase Auth; os cookies valem 400 dias, valor fixo do `@supabase/ssr`. Não há código a mais. O logout e a desativação (L2) continuam cortando o acesso na requisição seguinte, e o token copiado deixa de valer no logout (decisão 0046). Quem não sai continua conectado no mesmo navegador; num computador compartilhado, é preciso sair.
- [ ] **2. Cookie de sessão do navegador.** O `setAll` tira a validade dos cookies (exceto na exclusão), e a sessão acaba quando o navegador fecha. Isso se desvia do padrão da biblioteca, e os navegadores que restauram a sessão anterior, como o Chrome com "Continuar de onde parou", mantêm os cookies.
- [ ] **3. Validade máxima própria, conferida pelo `requireUser` a partir do início da sessão.** O início viria de `auth.sessions.created_at`, lido por uma função SQL nova. Exige definir o valor, que não está em nenhum requisito, e mais uma função no banco.

**Texto proposto (opção 1):**

- `docs/acesso/autenticacao.md`, Sessão: "Token de acesso de 1 hora mais token de renovação; o servidor renova sozinho." passa a "Token de acesso de 1 hora mais token de renovação; o servidor renova sozinho. A sessão vale até o logout ou a revogação no Supabase Auth, sem limite de duração (o limite do Supabase Auth exigiria configuração no painel, decisão 0044); os cookies valem 400 dias, valor fixo do `@supabase/ssr`."
- `docs/plataforma/seguranca.md`, RS007, Implementação: depois de "o logout encerra a sessão no Supabase Auth", acrescentar ", e toda requisição confere a sessão no Supabase Auth (decisão 0046), então o token de uma sessão encerrada deixa de valer na requisição seguinte".

## Decisões técnicas

- Seguidas: 0003 (rota, serviço e repositório), 0004 e 0006 (Supabase pelo `supabase-js`), 0005 e 0042 (autorização na API; dados só pela chave de serviço, e o cliente de sessão só fala com o Supabase Auth), 0010 e 0012 (permissões fixas como enum), 0015 e 0044 (sem e-mail e sem painel), 0016 (tentativas no banco), 0017 (código em inglês), 0019 (login único), 0020 (tabelas separadas, com o login no Supabase Auth), 0022 (cliente excluído fora das seleções), 0025 (Problem Details), 0026 (API sem versão), 0029 (registro na saída padrão), 0033 (merge), 0035 (testes antes do código), 0036 (`import 'server-only'`), 0043 (banco local para conferir a migration) e 0045 (testes do tratamento único).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| O `requireUser` confere a sessão com `getUser()`, que consulta o Supabase Auth a cada requisição | `getClaims()`, que confere só a assinatura e a validade do token, sem consultar o Supabase Auth; `getSession()`, que só lê o cookie, sem conferir nada | O RS007 pede a sessão invalidada no logout. Com `getUser()`, o token de uma sessão encerrada (logout, revogação, conta removida) deixa de valer na requisição seguinte; com `getClaims()`, valeria até expirar, por até 1 hora. O custo é uma chamada ao Supabase Auth por requisição, somada às duas consultas do perfil que o RS011 já exige, aceitável no tráfego do MVP. O `proxy.ts` (#26) só organiza a navegação e pode usar outro método, porque quem decide o acesso é a API | nova (0046) |
| Cada tentativa de login é reservada antes de conferir a senha, pela função SQL `reserve_login_attempt`, que confere o bloqueio e conta a tentativa com a linha do e-mail travada. A senha certa apaga a linha, e a falha do Supabase Auth devolve a tentativa (`release_login_attempt`). O limite e a duração chegam como parâmetros, das constantes do servidor | Ler e gravar o contador pelo `supabase-js`: duas requisições simultâneas leem o mesmo valor, e uma falha se perde. Contar só depois da falha, numa função SQL: não perde contagem, mas uma rajada de requisições simultâneas passa pela conferência antes de qualquer falha ser contada e confere mais de 5 senhas | Com a reserva, a sexta tentativa simultânea já encontra o bloqueio, e nunca são conferidas mais de 5 senhas por bloqueio, como o RS006 pede (0016). Exige uma migration nova, que só acrescenta duas funções, aplicada pelo Yvan antes da incorporação. As funções seguem `banco.md`: `search_path` vazio, nomes qualificados, `execute` revogado de `public`, `anon` e `authenticated` (0042) e concedido ao `service_role`. Os valores 5 e 15 ficam em constantes do servidor (`codigo.md`), não no SQL | nova (0047) |

Esboço da migration (0047), para a revisão do plano:

```sql
-- RS006 (decision 0047): reserves one login attempt for the e-mail. Returns the
-- seconds left in the lock, without counting the attempt, or null when the
-- password may be checked; the attempt that reaches the limit starts the lock.
create function public.reserve_login_attempt(
  p_email text, p_max_attempts integer, p_lock_seconds integer
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_attempt public.login_attempts;
  v_count integer;
begin
  insert into public.login_attempts (email) values (p_email)
    on conflict (email) do nothing;
  select * into v_attempt from public.login_attempts
    where email = p_email for update;
  if v_attempt.locked_until > now() then
    return ceil(extract(epoch from v_attempt.locked_until - now()))::integer;
  end if;
  -- After a lock, the count starts again (L3).
  v_count := case when v_attempt.locked_until is null
    then v_attempt.failed_count else 0 end + 1;
  update public.login_attempts
    set failed_count = v_count,
        locked_until = case when v_count >= p_max_attempts
          then now() + make_interval(secs => p_lock_seconds) end
    where email = p_email;
  return null;
end;
$$;

-- Gives back an attempt whose password was not checked (L6).
create function public.release_login_attempt(p_email text)
returns void
language sql
set search_path = ''
as $$
  update public.login_attempts
    set failed_count = greatest(failed_count - 1, 0), locked_until = null
    where email = p_email;
$$;

revoke all on function public.reserve_login_attempt(text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.release_login_attempt(text)
  from public, anon, authenticated;
grant execute on function public.reserve_login_attempt(text, integer, integer)
  to service_role;
grant execute on function public.release_login_attempt(text) to service_role;
```

Como as reservas do mesmo e-mail passam uma de cada vez pela linha travada, o contador nunca passa do limite. Por isso a devolução pode limpar o bloqueio: se havia bloqueio, foi a própria tentativa devolvida que o começou.

O `revoke ... from public` é explícito porque a migration inicial revogou o privilégio padrão das funções novas só de `anon` e `authenticated`. Sem ele, `public` manteria o `execute` padrão do PostgreSQL.

Texto das decisões (gravadas na etapa 03):

- `docs/decisoes/0046-sessao-conferida-no-supabase-auth.md`: `titulo` "Sessão conferida no Supabase Auth a cada requisição", `relacionados: [RS001, RS007, RS011, 0005]`, com a decisão, as alternativas e a justificativa da tabela.
- `docs/decisoes/0047-tentativa-de-login-reservada.md`: `titulo` "Tentativa de login reservada por função SQL antes de conferir a senha", `relacionados: [RS005, RS006, 0016, 0042]`, idem.
- `docs/decisoes/CONTEXT.md`: as duas linhas novas.
- `docs/acesso/dados.md`, novo, do molde dos outros `dados.md` (`tabelas: [login_attempts]`): a tabela `login_attempts`, que sai de `autenticacao.md`. Na tabela, `failed_count` passa a "Tentativas seguidas sem login certo, contadas ao começar cada tentativa; a linha é apagada no login certo." Acrescenta a seção "Bloqueio" (L3 e L6) e a seção "Funções" com `reserve_login_attempt` e `release_login_attempt`. Com as lacunas, `autenticacao.md` passaria de cerca de 2 mil tokens, e "Onde registrar conhecimento novo" põe função SQL no `dados.md` do assunto.
- `docs/acesso/CONTEXT.md`: nova linha "| dados.md | Tabela `login_attempts`, bloqueio por tentativas e funções do login |"; a descrição de `autenticacao.md` perde "e tabela `login_attempts`".
- `docs/padroes/backend.md`, Gravações e consultas, depois do item das funções de gravação: "O controle de tentativas de login também usa funções SQL (`reserve_login_attempt` e `release_login_attempt`), para contar sem corrida entre requisições simultâneas (decisão 0047)."
- `docs/padroes/backend.md`, Registro: "O `requestId` é gerado no início da requisição e incluído em todas as linhas dela via `AsyncLocalStorage` do Node.js." passa a "O `requestId` é gerado no início da requisição e incluído em todas as linhas dela via `AsyncLocalStorage` do Node.js, assim como o id do usuário (`userId`), depois que o guard identifica a sessão."

Escolhas locais, sem registro:

- O logout e o encerramento da sessão no login recusado usam `signOut({ scope: "local" })` (L1).
- O contexto do registro é um objeto criado por requisição, e o guard grava nele o `userId` (`setRequestUser`). É a única mutação, porque a linha final da requisição, gravada pelo handler fora da rota, precisa enxergar o usuário. Um comentário explica o motivo.
- `loadAccount` busca `staff` e `clients` em paralelo. Uma conta nas duas tabelas é impossível, porque o id vem do Supabase Auth e o e-mail não se repete (RN022); se acontecesse, valeria `staff`.
- A senha do login usa `signInPasswordSchema`, em `formats.ts`, ao lado do `passwordSchema`, para reaproveitar a contagem de bytes e a mensagem do RS003.
- `PERMISSION_LABELS` já entra nesta tarefa, porque a barra do painel (#25) e o formulário de cargos usam os nomes de RN025. `PROFILES` entra sem rótulos, porque nenhuma tela exibe o perfil.
- `info.version` do `openapi.yaml` é a do `package.json` (0.1.0), só porque o campo é obrigatório; a API não tem versão no caminho (0026). O cookie de sessão é descrito como `securitySchemes` do tipo `apiKey` em cookie.

## Riscos e dúvidas

- **Migration no projeto real.** A pré-visualização usa o mesmo projeto do Supabase da produção. Sem a migration aplicada, todo login na pré-visualização responde 500. O Yvan aplica a migration depois da revisão do PR e antes do teste na pré-visualização e da incorporação. Como ela só acrescenta funções, a produção não muda.
- **Limite de entradas do Supabase Auth.** O padrão é 30 a cada 5 minutos por IP, e as entradas chegam do servidor, então várias pessoas entrando ao mesmo tempo, como numa apresentação, podem esgotar o limite de todas. A resposta é 503 (L6). Mudar o limite exigiria o painel, contra a 0044. Há uma mudança em andamento no Supabase (`Sb-Forwarded-For`) para contar pelo IP de origem; não foi conferido se já está disponível. No banco local, o mesmo limite vale para os testes manuais, que são espaçados; se ele for atingido, o caso de L6 fica conferido de graça.
- **Tempo de resposta.** O Supabase Auth responde mais rápido ao e-mail inexistente, porque não confere a senha, e isso pode indicar se o e-mail tem conta. O RS005 trata só das mensagens; isso fica aceito no MVP.
- **Crescimento de `login_attempts`.** Cada e-mail diferente tentado deixa uma linha, apagada só pelo login certo daquele e-mail. Não há limpeza nesta tarefa; se for preciso, vira uma issue.
- **Guards sem teste automatizado.** A decisão 0045 não cobre código que depende do Supabase. Os guards são conferidos à mão nesta tarefa, e uma regressão neles só apareceria nos testes manuais das próximas. Testá-los com o Supabase simulado exigiria uma decisão que substitua a 0045.
- **Funcionário sem nenhuma permissão.** Um funcionário com cargo inativo entra com `permissions` vazio. A #26 precisa decidir para onde levá-lo, porque não há "primeira página permitida".
- **Cookie `Secure` em `http://localhost`.** Os navegadores baseados no Chromium e o Firefox o aceitam; o Safari não foi conferido. A verificação local usa o navegador do app (Chromium). O comportamento no Safari fica anotado para quem usar macOS.
- **Latência.** Cada requisição com sessão faz uma chamada ao Supabase Auth (0046) e duas consultas em paralelo.

## Fora do escopo

- Cadastro e troca de senha (#24). O `allowPasswordChange` fica pronto para a troca de senha.
- Telas, `api-client` e `src/proxy.ts` (#25 e #26), inclusive os cabeçalhos anticache nas páginas e o funcionário sem permissão.
- Rotas `/api/me` e `/api/admin`, que usam os guards nas próximas tarefas.
- Limpeza das linhas antigas de `login_attempts`.
- Limite de duração da sessão (L8) e testes automatizados dos guards.
