# `src/components/portal/layout/` – Portal: layout

Cabeçalho com a barra de navegação (opções do cliente quando autenticado) e rodapé com contato, acesso rápido e redes sociais, vindos dos dados da empresa (RN028).

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `site-header-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/catalogo/UC01-consultar-portal-publico.md`
- `docs/configuracoes/rotas.md`
- `docs/padroes/frontend.md`
