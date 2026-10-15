# `/api/admin`

Rotas do painel: perfis `staff` e `admin`, com `requirePermission(<permissão da página>)`; cliente recebe 403 (RS010). Subpastas: `dashboard/`, `appointments/`, `services/`, `categories/`, `clients/`, `vehicles/`, `settings/`, `staff/`, `roles/`.

## Vai aqui

- só as subpastas dos endpoints documentados

## Não vai aqui

- `route.ts` aqui: não há endpoint documentado neste caminho
- código compartilhado entre as rotas (→ `src/server/`)

## Referências

- `docs/agendamento/rotas.md`
- `docs/catalogo/rotas.md`
- `docs/clientes/rotas.md`
- `docs/configuracoes/rotas.md`
- `docs/equipe/rotas.md`
- `docs/padroes/api.md`
- `docs/padroes/backend.md`
