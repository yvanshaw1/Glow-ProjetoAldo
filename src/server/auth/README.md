# `src/server/auth/` – Sessão e autorização

`session.ts` lê a sessão dos cookies e carrega perfil, situação, cargo e permissões do banco a cada requisição; `guards.ts` tem `requireUser`, `requireClient` e `requirePermission`; `login-attempts.ts` faz o bloqueio de 15 minutos após 5 falhas.

## Vai aqui

- sessão, guards e controle de tentativas de login

## Não vai aqui

- telas e formulários de login (→ `src/components/portal/auth/`)
- permissões guardadas no token: são lidas do banco a cada requisição (RS011)
- regras de negócio de outros módulos

## Referências

- `docs/acesso/autenticacao.md`
- `docs/plataforma/seguranca.md`
