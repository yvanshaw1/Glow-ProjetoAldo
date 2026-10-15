# `src/components/admin/layout/` – Painel: layout

Cabeçalho do painel e barra de navegação montada com as permissões de `GET /api/auth/me` (RF036).

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `admin-nav-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/acesso/UC08-autenticar-se-no-painel-administrativo.md`
- `docs/acesso/rotas.md`
- `docs/padroes/frontend.md`
