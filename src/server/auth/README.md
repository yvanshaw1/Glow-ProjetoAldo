# `src/server/auth/` – Sessão e autorização

`session.ts` lê a sessão dos cookies, carrega perfil, situação, cargo e permissões do banco a cada requisição e grava a nova senha pela sessão; `guards.ts` tem `requireUser`, `requireClient` e `requirePermission`; `login-attempts.ts` faz o bloqueio de 15 minutos após 5 falhas; `accounts.ts` cria e remove contas no Supabase Auth, com a chave de serviço; `page-access.ts` decide, sem ir ao banco, para onde o `proxy.ts` leva cada pessoa.

## Vai aqui

- sessão, guards e controle de tentativas de login
- criação e remoção de contas no Supabase Auth
- decisão de acesso às páginas, usada pelo `proxy.ts`

## Não vai aqui

- telas e formulários de login (→ `src/components/portal/auth/`)
- permissões guardadas no token: são lidas do banco a cada requisição (RS011)
- regras de negócio de outros módulos
- gravação dos perfis em `clients` e `staff` (→ `src/server/repositories/`)

## Referências

- `docs/acesso/autenticacao.md`
- `docs/plataforma/seguranca.md`
