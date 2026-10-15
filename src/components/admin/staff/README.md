# `src/components/admin/staff/` – Painel: staff

Listagem e formulário de funcionário em duas etapas, com desativação.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `staff-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/equipe/UC19-cadastrar-funcionario.md`
- `docs/equipe/UC20-manter-funcionarios.md`
- `docs/equipe/rotas.md`
- `docs/padroes/frontend.md`
