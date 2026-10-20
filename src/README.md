# `src/` – Código da aplicação

Toda a aplicação Next.js: páginas, API, componentes e código compartilhado. Uma pasta por responsabilidade; antes de criar arquivo em qualquer subpasta, leia o README dela.

## Vai aqui

- `app/` (rotas: páginas e API), `components/`, `hooks/`, `lib/`, `shared/` (navegador e servidor), `server/` (só servidor)
- `proxy.ts`: proteção das páginas no Next.js 16 (valida a sessão, renova os cookies e redireciona conforme o perfil)

## Não vai aqui

- testes (→ `tests/`)
- migrations, SQL e scripts do banco (→ `supabase/`)
- arquivos estáticos (→ `public/`)
- configuração (→ raiz: `package.json`, `next.config.ts`, `tsconfig.json`...)
- `middleware.ts`: no Next.js 16 a convenção é `proxy.ts` (decisão 0032)
- pastas novas fora da árvore de `docs/plataforma/estrutura-de-pastas.md`

## Referências

- `docs/plataforma/estrutura-de-pastas.md`
- `docs/acesso/protecao-das-paginas.md` (regras do `proxy.ts`)
