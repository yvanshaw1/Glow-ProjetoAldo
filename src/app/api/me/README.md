# `/api/me`

Rotas do perfil `client` (`requireClient`). O id do cliente vem sempre da sessão, nunca de um parâmetro; registro de outro cliente responde 404 (RS009). Subpastas: `bookable-services/`, `appointments/`, `profile/`, `vehicles/`.

## Vai aqui

- só as subpastas dos endpoints documentados

## Não vai aqui

- `route.ts` aqui: não há endpoint documentado neste caminho
- código compartilhado entre as rotas (→ `src/server/`)

## Referências

- `docs/agendamento/rotas.md`
- `docs/clientes/rotas.md`
- `docs/padroes/api.md`
- `docs/padroes/backend.md`
