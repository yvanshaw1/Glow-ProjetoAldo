# `src/components/portal/catalog/` – Portal: catalog

Seções da página inicial (destaque, institucional, localização) e cartão de serviço do catálogo público.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `catalog-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/catalogo/UC01-consultar-portal-publico.md`
- `docs/catalogo/rotas.md`
- `docs/padroes/frontend.md`
