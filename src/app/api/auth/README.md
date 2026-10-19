# `/api/auth`

Cadastro, login e logout são públicos; `me` e troca de senha exigem sessão (`requireUser`, aceitando a senha inicial pendente). Módulo do backend: `auth`. Subpastas: `register/`, `login/`, `logout/`, `me/`, `change-password/`.

## Vai aqui

- só as subpastas dos endpoints documentados

## Não vai aqui

- `route.ts` aqui: não há endpoint documentado neste caminho
- código compartilhado entre as rotas (→ `src/server/`)

## Referências

- `docs/acesso/rotas.md`
- `docs/padroes/api.md`
- `docs/padroes/backend.md`
