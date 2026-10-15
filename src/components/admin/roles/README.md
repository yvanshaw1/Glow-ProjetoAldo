# `src/components/admin/roles/` – Painel: roles

Listagem e formulário de cargo com as permissões por página.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `role-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/equipe/UC21-gerenciar-cargos-e-permissoes.md`
- `docs/equipe/rotas.md`
- `docs/padroes/frontend.md`
