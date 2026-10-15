# `src/app/api/` – Backend HTTP

Um `route.ts` por endpoint, e a pasta segue a URL (`:id` vira `[id]`). Grupos: `auth/` (cadastro, login, sessão), `public/` (qualquer pessoa), `me/` (perfil `client`) e `admin/` (perfis `staff` e `admin`, por permissão).

## Vai aqui

- as pastas dos grupos e dos endpoints documentados em `docs/*/rotas.md`
- em cada pasta de endpoint, só o `route.ts` e o README

## Não vai aqui

- regra de negócio (→ `src/server/services/` e `src/server/rules/`)
- acesso ao Supabase (→ `src/server/repositories/`)
- esquemas Zod (→ `src/shared/validation/`) e tipos de resposta (→ `src/shared/api/`)
- tratamento de erro próprio: todo erro passa por `src/server/http/handler.ts`
- endpoint que não está em `rotas.md`: rota nova exige atualizar o `rotas.md` do assunto no mesmo PR

## Referências

- `docs/padroes/api.md`
- `docs/padroes/backend.md`
