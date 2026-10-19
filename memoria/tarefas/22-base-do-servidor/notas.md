# Notas: 22-base-do-servidor

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-19 – descoberta

Conferências do planejamento, sem instalar nada no projeto:

- O worktree desta sessão é `musing-chatterjee-85cb7d`, na ramificação `claude/musing-chatterjee-85cb7d`, e não pode ser renomeado. Ele estava em dac9081 e foi avançado para a `origin/main` (33b8f31, com a #21), sem merge. O plano e as notas ficam sem commit, como na #21; a etapa 02 cria `feat/22-server-base` a partir da `origin/main`, e os arquivos não versionados acompanham a troca.
- `@supabase/ssr`: a última versão é a 0.12.7, de 08/09/2026. Ela pede `@supabase/supabase-js` ^2.114.0 (o projeto usa a 2.117.3) e depende de `cookie` ^1.0.2. O pacote foi baixado com `npm pack` para o scratchpad da sessão, só para ler o código.
- Padrões dos cookies do `@supabase/ssr` 0.12.7 (`dist/main/utils/constants.js`): `path` "/", `sameSite` "lax", `httpOnly` falso, sem `secure` e `maxAge` de 400 dias. O `cookieOptions` sobrepõe os padrões, exceto o `maxAge`, que a biblioteca fixa em 400 dias ao gravar (`dist/main/cookies.js`). Para a #23 (RS007): a validade da sessão depende do Supabase Auth e do logout, não do cookie.
- O `setAll` do `@supabase/ssr` recebe, junto com os cookies, cabeçalhos para a resposta não ir para cache (`Cache-Control: private, no-cache, no-store, must-revalidate, max-age=0`, `Expires: 0` e `Pragma: no-cache`). Numa rota, o `cookies()` de `next/headers` grava os cookies, mas não acrescenta cabeçalhos à resposta. A #23 (login) e a #26 (`proxy.ts`) precisam decidir como aplicá-los.
- O comentário da Vercel no PR #27 leva ao endereço da ramificação, `glow-projetoaldo-git-feat-21-shared-736e68-yvanshaw1s-projects.vercel.app` (`VERCEL_BRANCH_URL`). A implantação registrada no GitHub usa o endereço único, `glow-projetoaldo-hfxg0qilr-yvanshaw1s-projects.vercel.app` (`VERCEL_URL`). Conferir o `Origin` só contra `VERCEL_URL` recusaria as gravações feitas pelo link do PR (L3).
- O Next.js 16.4 confere o `Origin` das Server Actions contra o `X-Forwarded-Host` ou o `Host` (`node_modules/next/dist/server/app-render/action-handler.js`), base da opção recomendada em L3.
- A decisão 0043 descartou testes em pgTAP por contrariarem a 0024. Por isso, testar o tratamento único exige uma decisão que substitua a 0024 (L1).
- O guia de CSP do Next.js instalado diz que a política com nonce exige renderizar toda página na hora (L6).
- `seguranca.md` tem 8,7 KB, acima de cerca de 2 mil tokens. Os valores dos cabeçalhos iriam para `backend.md` (5,2 KB) (L6).
- O commit 97f6d99 (Kayke como colaborador em `setup/questionario.md`, tarefa trivial aprovada na conversa em 19/10/2026) continua fora da `main`, na ramificação local `docs/kayke-collaborator`, e só muda essa linha. Entra no PR desta tarefa pelo merge da ramificação (passo 1 da construção). Depois da incorporação, apagar a ramificação.
- Nenhum PR aberto no repositório.

## 2026-10-19 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas L1 a L6 e a decisão nova 0045 (substitui a 0024), que depende de L1. Nada foi construído.

## 2026-10-19 – descoberta

Etapa 02:

- A ramificação `feat/22-server-base` saiu da `origin/main` (33b8f31), e o vínculo com a `main` foi desfeito, como na #21. A `docs/kayke-collaborator` entrou por merge (a0848e7). O `--amend` para acrescentar a coautoria à mensagem do merge foi negado pela permissão da sessão, e o merge ficou com a mensagem padrão do Git; o squash na incorporação a substitui.
- `npx -y npm@11.21.1 install --save-exact @supabase/ssr@0.12.7`: o lock ganhou 26 linhas (`@supabase/ssr` e `cookie`), e as entradas `@emnapi/*` continuam. O `npm audit --omit=dev --audit-level=high`, o mesmo do CI, não acusa nada. As 5 vulnerabilidades altas que o `npm install` mostrou são de dependências de desenvolvimento e já existiam. O aviso `install-scripts` sobre o `unrs-resolver` também já existia.
- Os testes do plano viraram 42 casos: alguns nomes são `it.each` (com e sem `Content-Length`, `PUT`, `PATCH` e `DELETE`, os três cenários do RS018), o teste de `warn` foi separado entre os códigos e a origem recusada, e entrou "logs other expected errors as info", que confere que um `FORBIDDEN` de permissão não sai como `warn`. Tudo dentro do escopo.
- Dois ajustes de tipo depois do vermelho: `Record<string, string>` nos cabeçalhos montados por condição, no `handler.ts` e num teste. Foram no commit do código.
- O `PostgrestError` do `@supabase/postgrest-js` estende `Error`, então um erro do banco relançado pelo repositório chega à linha `error` com o rastro.
- Rota temporária (`src/app/api/dev-check/[id]/route.ts`, apagada antes de qualquer commit): o `next typegen` a confere em `.next/types/validator.ts` e aceita o `handleRoute`; com `{ id: number }` no lugar de `{ id: string }`, o `tsc` acusa o erro, então a conferência funciona. No `next dev`, `Host` e `X-Forwarded-Host` chegaram iguais (`localhost:3022`). Com `curl`: JSON da mesma origem 200; `text/plain` 415; 150 KB 413, com e sem `Content-Length` (`Transfer-Encoding: chunked`); outra origem e sem `Origin` 403, com linha `warn` e `refusedOrigin`; `DELETE` sem corpo 204; JSON inválido 400, e nenhuma linha do registro trouxe a senha do corpo.
- Os cinco cabeçalhos de segurança vieram em `/`, numa rota da API e num 404 de `/api`, no `next dev`. O navegador abriu a página inicial sem erro no console.
- O Docker Desktop estava fechado; o agente o abriu para conferir a imagem.
- Contêiner, sem `.env.local` no worktree: `docker build -t glow-app-22 .` concluiu sem nenhuma variável, e `docker run -p 3022:3000` respondeu 200 em `/`, com "Glow – Estética Automotiva", e 404 em `/api/nao-existe`, os dois com os cinco cabeçalhos de segurança. Depois, o contêiner e a imagem `glow-app-22` foram removidos.
- Falta, para a etapa 03: conferir os cabeçalhos na pré-visualização da Vercel, `02_relatorio.md` (com a variável `APP_URL` e a decisão 0045 em "Documentos formais a atualizar") e o PR. O desenvolvedor tira `APP_URL=` do `.env.example` (L3).
