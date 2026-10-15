# `src/components/admin/vehicles/` – Painel: vehicles

Formulário de veículo do cliente no painel, com consulta da placa e edição de veículo compartilhado.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `vehicle-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/clientes/UC18-manter-veiculos-do-cliente.md`
- `docs/clientes/rotas.md`
- `docs/padroes/frontend.md`
