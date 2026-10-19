# Notas: 23-sessao-e-login

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-19 – descoberta

Conferências do planejamento, sem instalar nada no projeto:

- **Worktree.** O desta sessão é `angry-cray-d35991`, na ramificação `claude/angry-cray-d35991`, que não pode ser renomeada. Ela está em 1dce121, igual à `origin/main`, com a #22. O plano e as notas ficam sem commit, como na #21 e na #22. A etapa 02 cria `feat/23-session-and-login` a partir da `origin/main`, e os arquivos não versionados acompanham a troca.
- **`node_modules`.** O worktree não tem `node_modules`. A leitura do código instalado foi feita no `node_modules` do checkout principal (`App/`): Next.js 16.4.1, `@supabase/supabase-js` e `@supabase/auth-js` 2.117.3. Ele não tem o `@supabase/ssr`, que entrou na #22. O pacote 0.12.7 foi baixado com `npm pack` para o scratchpad da sessão, só para leitura.
- **Next.js 16.4.1 e cookies:**
  - as rotas começam na fase `action` (`server/async-storage/request-store.js`), então o `cookies()` devolve os cookies mutáveis, e o `getAll` já enxerga o que foi gravado na mesma requisição (`spec-extension/adapters/request-cookies.js`);
  - o `finalizeResponse` de `server/route-modules/app-route/module.js` junta esses cookies a qualquer `Response` devolvida pela rota, inclusive a de erro do `handleRoute`;
  - as rotas não vão para cache por padrão (`dist/docs/01-app/01-getting-started/15-route-handlers.md`).
- **`@supabase/ssr` 0.12.7:**
  - o `createServerClient` só grava os cookies nos eventos `SIGNED_IN`, `TOKEN_REFRESHED`, `USER_UPDATED`, `PASSWORD_RECOVERY`, `SIGNED_OUT` e `MFA_CHALLENGE_VERIFIED`;
  - o `applyServerStorage` apaga só os cookies que o `getAll` devolve, com `maxAge: 0`, e grava os novos sempre com `maxAge` de 400 dias;
  - o segundo argumento do `setAll` traz `Cache-Control: private, no-cache, no-store, must-revalidate, max-age=0`, `Expires: 0` e `Pragma: no-cache`.
- **`auth-js` 2.117.3:**
  - o `signOut` tem `scope` padrão `global`. Ele ignora os erros 401, 403 e 404 do Supabase Auth e, nos outros erros, também remove a sessão local antes de devolver o erro;
  - o `_removeSession` dispara `SIGNED_OUT`, que faz o `@supabase/ssr` apagar os cookies;
  - a senha errada vem com o código `invalid_credentials`.
- **`supabase/config.toml`:** `jwt_expiry = 3600`; `sign_in_sign_ups = 30` a cada 5 minutos por IP; `token_refresh = 150`; `[auth.sessions]` comentado.
- **Supabase, pela web:**
  - a sessão não tem fim por padrão;
  - limites de duração e de inatividade aparecem como recurso "Pro" numa fonte secundária, e a página oficial não foi lida por inteiro;
  - o limite de entradas conta por IP, e as chamadas feitas do servidor dividem o mesmo limite (inferência);
  - um PR do Supabase Auth de dezembro de 2025 acrescenta `Sb-Forwarded-For` para contar pelo IP de origem, e não foi conferido se já está disponível.
- **Privilégios das funções.** A migration inicial revoga o privilégio padrão das funções novas só de `anon` e `authenticated`. O `public` mantém o `execute` padrão do PostgreSQL nas funções novas, então a migration da 0047 revoga também de `public`. A #17 registrou que os gatilhos funcionam para o `service_role` sem `execute` concedido; para `rpc`, a migration concede o `execute` explicitamente.
- **Contas para testar.** Os clientes do `seed-demo.sql` não têm conta no Supabase Auth, então não servem para testar o login. A verificação local cria contas próprias por um roteiro no scratchpad.
- **`@redocly/cli`.** A última versão é a 2.65.0, de 19/10/2026. O plano usa a 2.57.0, de 30/09/2026, a mais recente com mais de duas semanas.
- **Outras tarefas.** Nenhum PR aberto e nenhuma ramificação da #24 ou da #25.
- **`.env.example`.** Um comando composto que incluía `cat .env.example` foi negado pela permissão da sessão. Os nomes das variáveis vieram de `src/server/supabase/clients.ts`.

## 2026-10-19 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas L1 a L8 e as decisões novas 0046 (sessão conferida com `getUser()`) e 0047 (tentativa reservada por função SQL, com migration nova). Nada foi construído.

Há um ponto explícito para a aprovação, na verificação local: as chaves do banco local, que a CLI gera, passam ao `npm run dev` pelo ambiente, a partir de `npx supabase status -o env`, sem exibição, como o roteiro do `create-admin.mjs` usou na #17.

## 2026-10-19 – decisão

Plano aprovado por yvan (19/10/2026 - 10:03), com a opção 1 em L1 a L8. Status em `em_execucao`. O Yvan também pediu que a descrição do PR e o corpo dos commits só listem o que foi feito e o que é novo, sem o porquê e sem as lacunas decididas (memória `pr-lista-empirica` do agente). O modelo `.github/pull_request_template.md` e `workflows/procedimentos/pull-request.md` ainda falam em "o que mudou e por quê"; mudá-los fica para uma tarefa à parte, se ele quiser.

## 2026-10-19 – descoberta

Etapa 02, interrompida pelo limite de uso da sessão:

- Ramificação `feat/23-session-and-login` criada da `origin/main` (1dce121), sem vínculo com a `main`. `npm ci` feito no worktree (407 pacotes; o lock não mudou).
- Commit d730f0f: `docs/plataforma/openapi.yaml`, validado com `npx -y @redocly/cli@2.57.0 lint` (válido; 1 aviso: `info` sem `license`, que o projeto não tem). Prettier aprovado.
- Próximo passo: passo 3 da "Ordem da construção" (testes em vermelho). Nos testes do registro, a linha passa a ter `userId` depois de `requestId`, e o `runWithRequestContext({ requestId }, ...)` mantém a assinatura (o `userId: null` é criado dentro do `logger.ts`); o teste exato "writes one JSON line..." e o do handler "logs one info line..." precisam de `userId: null`.

## 2026-10-19 – descoberta

Etapa 02, retomada:

- Commits, nesta ordem: d730f0f (OpenAPI), dafc75c (testes em vermelho: 16 falhas e o arquivo novo sem módulo), cd4c588 (`src/shared`, registro e handler), 83b655c (migration), b6f3616 (rotas, sessão, guards, serviço e repositórios) e e2af755 (documentação e decisões 0046 e 0047). Corpo dos commits só com a lista do que mudou, como o Yvan pediu.
- A CLI criou a migration como `20261019163437_login_attempt_functions.sql`. O `supabase start` aproveitou o volume do banco local da #17 ("Starting database from backup") e baixou a imagem do `studio`.
- No primeiro roteiro de SQL, a coluna de `public` usava `proacl::text like '%=X/%'`, que também casa com `service_role=X/postgres`. Com `aclexplode` (grantee 0), `public` não tem `execute`. A lista de privilégios é `{postgres=X/postgres,service_role=X/postgres}`.
- Verificação local: as variáveis do Supabase local vieram de `npx supabase status -o env` para o processo, sem exibição, por um arquivo do scratchpad (`local/local-env.sh`), que só aceita `http://127.0.0.1:`. As contas foram criadas por `local/accounts.mjs`, com o admin pelo `create-admin.mjs`, e as senhas ficaram em `local/accounts.json`, no scratchpad. As chamadas foram feitas por `local/check-auth.mjs`, com `fetch` do Node e os valores dos cookies ocultos.
- O cookie da sessão local se chama `sb-127-auth-token` e coube num pedaço só. Ele saiu com `Max-Age=34560000` (400 dias), `Secure`, `HttpOnly` e `SameSite=lax`.
- Com o Supabase Auth parado (`docker stop supabase_auth_glow`), o Kong respondeu 503, e o login respondeu 503 `SERVICE_UNAVAILABLE`, com a tentativa devolvida. O contêiner foi religado logo depois.
- O limite local de 30 entradas a cada 5 minutos não foi atingido: cerca de 31 entradas em grupos espaçados.
- Rotas temporárias `src/app/api/dev-check/{user,client,permission}` apagadas antes do commit do backend.
- O PR tem cerca de 715 linhas de código, acima das ~400. A justificativa está no relatório.
