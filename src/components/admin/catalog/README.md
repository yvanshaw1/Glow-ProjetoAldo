# `src/components/admin/catalog/` – Painel: catalog

Listagens e formulários de serviço (em etapas, conforme o tipo) e de categoria, com exibição de inativos.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `catalog-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/catalogo/UC13-cadastrar-servico.md`
- `docs/catalogo/UC14-manter-servicos.md`
- `docs/catalogo/UC15-manter-categorias.md`
- `docs/catalogo/rotas.md`
- `docs/padroes/frontend.md`
