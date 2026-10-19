---
issue: 23
pull_request: <a preencher ao abrir>
---

# Relatório: Sessão e login único: login, logout, me, bloqueio de tentativas e guards

## O que foi feito

- `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me` (UC03, UC08, RN029).
- Sessão em cookies do `@supabase/ssr`, conferida no Supabase Auth a cada requisição (RS007, decisão 0046).
- Guards `requireUser` (com `allowPasswordChange`), `requireClient` e `requirePermission`, com perfil, situação, cargo e permissões lidos do banco a cada requisição (RN026, RN027, RS001, RS004, RS008 a RS011).
- Bloqueio de 15 minutos após 5 tentativas por e-mail, por duas funções SQL novas (RS005, RS006, decisão 0047).
- Repositórios de `staff`, `clients` e `login_attempts`.
- `Cache-Control: no-store` em toda resposta da API, usuário em toda linha do registro e `SERVICE_UNAVAILABLE` como `warn`.
- `PERMISSIONS`, `PERMISSION_LABELS`, `PROFILES`, `loginSchema`, `signInPasswordSchema` e `SessionUser` em `src/shared`.
- `docs/plataforma/openapi.yaml`, a primeira especificação OpenAPI, com as três rotas.

## Arquivos alterados

- `src/app/api/auth/{login,logout,me}/route.ts`: criados.
- `src/server/auth/session.ts`, `guards.ts` e `login-attempts.ts`: criados.
- `src/server/services/auth.ts`: criado.
- `src/server/repositories/staff.ts`, `clients.ts` e `login-attempts.ts`: criados.
- `src/server/http/logger.ts`: `userId` em toda linha e `setRequestUser`.
- `src/server/http/handler.ts`: `Cache-Control: no-store` e `SERVICE_UNAVAILABLE` como `warn`.
- `src/server/supabase/clients.ts`: sai o `TODO(#23)`.
- `src/shared/constants/permissions.ts`, `profiles.ts`, `src/shared/validation/auth.ts` e `src/shared/api/auth.ts`: criados.
- `src/shared/validation/formats.ts`: `signInPasswordSchema`.
- `supabase/migrations/20261019163437_login_attempt_functions.sql`: `reserve_login_attempt` e `release_login_attempt`.
- `tests/validation/auth.test.ts`: criado; `tests/validation/formats.test.ts`, `tests/http/handler.test.ts` e `tests/http/logger.test.ts`: casos novos.
- README de `src/app/api/auth/`, `logout/` e `me/`.

## Testes executados

- `npm run check`: aprovado, com 153 testes (18 novos e 2 ajustados). Os testes ficaram no commit dafc75c, anterior ao código, e falharam antes dele (vermelho).
- `npx -y @redocly/cli@2.57.0 lint docs/plataforma/openapi.yaml`: válido, com 1 aviso (`info` sem `license`, que o projeto não tem).
- Banco local (`npx supabase db reset` e `npx supabase db lint`): a migration é aplicada sem erro, e o lint não acusa nada. O roteiro de SQL passou nos 8 casos: primeira tentativa, quinta tentativa com início do bloqueio, tentativa durante o bloqueio (900 segundos, sem contar), fim do bloqueio, devolução sem bloqueio, devolução da quinta tentativa, devolução sem linha e e-mail em maiúsculas recusado. `execute` só para `postgres` e `service_role`; `anon`, `authenticated` e `public` sem.
- Local, com o `next dev` ligado ao Supabase local e contas de teste criadas por roteiro no scratchpad: 54 conferências, todas aprovadas.
  - Login: corpos de cliente, funcionário, cargo inativo e admin; cookies com `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`; 401 igual para e-mail inexistente e senha errada; 400 sem contagem para e-mail malformado; 403 sem `Origin`.
  - Conta: funcionário desativado com 403 e cookie apagado na mesma resposta; conta sem perfil e cliente excluído com 401.
  - Logout: 204, cookies com `Max-Age=0`, `me` com os cookies antigos com 401 e logout sem sessão com 204.
  - Guards, com rotas temporárias apagadas antes do commit: senha pendente, cliente, funcionário com e sem a permissão, admin, mudança de cargo e desativação depois do login.
  - Bloqueio: 4 falhas e a senha certa zeram; a quinta falha bloqueia, e a senha certa recebe 429 com `Retry-After: 900`.
  - 20 tentativas simultâneas: 5 respostas 401 e 15 respostas 429.
  - Supabase Auth parado: 503, tentativa devolvida e linha `warn` só com o status.
  - Registro: nenhuma senha, e-mail, cookie ou token; nenhuma linha `error`; `userId` nas linhas com sessão.
- Pré-visualização: passo do desenvolvedor, depois de aplicar a migration (veja o PR).

## Documentação atualizada

- Módulos: `docs/acesso/dados.md` (novo), `autenticacao.md`, `rotas.md`, `CONTEXT.md`; `docs/plataforma/RN035-formatos-dos-dados.md`, `seguranca.md`, `openapi.yaml` (novo); `docs/padroes/api.md`, `backend.md`, `testes.md`.
- Lacunas resolvidas (opção 1 em todas):
  - L1 → `autenticacao.md`, `rotas.md` e README;
  - L2 → `autenticacao.md` e `backend.md`;
  - L3 → `dados.md`, `autenticacao.md` e `seguranca.md`;
  - L4 → `rotas.md` e RN035;
  - L5 → `rotas.md` e `openapi.yaml`;
  - L6 → `api.md`, `backend.md` e `dados.md`;
  - L7 → `api.md`, `backend.md` e `testes.md`;
  - L8 → `autenticacao.md` e `seguranca.md`.
- Decisões: 0046 e 0047 criadas.
- Documentos formais a atualizar:
  - **Documentação de Arquitetura de Software, seção 9 (Quadro 38):** decisões 0046 (sessão conferida no Supabase Auth a cada requisição) e 0047 (tentativa de login reservada por função SQL).
  - **Documentação de Arquitetura de Software, seções 3.2 e 5.2 (Quadros 5 e 28):** validade da sessão (até o logout; cookies de 400 dias); logout sem sessão e só do navegador; conta desativada, excluída ou sem perfil; senha pendente aceita no `me` e no logout; regras do bloqueio; funções `reserve_login_attempt` e `release_login_attempt`.
  - **Documentação de Arquitetura de Software, Apêndice A:** entrada e corpos de resposta do login e do `me`; logout público.
  - **Documentação de Arquitetura de Software, seção 6:** `Cache-Control: no-store` em toda resposta da API e uso do 503 `SERVICE_UNAVAILABLE`.
  - **Documentação de Arquitetura de Software, seções 4 e 6.4:** funções SQL do login, usuário em toda linha do registro e os novos casos de nível `warn`.
  - **Documentação de Arquitetura de Software, seção 7 (Quadro 35):** implementação de RS006 e RS007.
  - **Documentação de Análise do Sistema, seção 9.1 (Quadro 20), RN035:** a senha no login só é obrigatória e limitada a 72 bytes.
  - **Documentação de Desenvolvimento com IA, seção 8:** casos novos do tratamento único (resposta fora de cache e usuário no registro).

## Pendências

- **Migration no projeto real.** O Yvan aplica a migration (`npx supabase db push`) depois da revisão do PR e antes de testar a pré-visualização e de incorporar. Sem ela, todo login na pré-visualização responde 500.
- **Tamanho do PR.** São cerca de 715 linhas de código, mais 328 do OpenAPI e cerca de 115 de outros documentos, acima das ~400 do procedimento. O escopo da issue (três rotas, três guards, três repositórios, migration e a primeira especificação OpenAPI) não se divide sem deixar rotas sem guard ou guards sem rota; cerca de um terço do código são comentários e tipos.
- **Para a #26:** o funcionário de cargo inativo entra com `permissions` vazio, sem "primeira página permitida"; os cabeçalhos anticache do `@supabase/ssr` nas páginas.
- **Cookie `Secure` no Safari** em `http://localhost`: não conferido.
- **Linhas de `login_attempts`:** as dos e-mails tentados ficam até um login certo; não há limpeza.
- **Modelo e procedimento do PR:** o modelo (`.github/pull_request_template.md`) e o procedimento (`workflows/procedimentos/pull-request.md`) ainda pedem "o que mudou e por quê". O Yvan pediu só a lista do que foi feito; mudar os dois arquivos fica para outra tarefa.
