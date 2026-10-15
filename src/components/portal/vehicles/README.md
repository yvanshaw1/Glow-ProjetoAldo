# `src/components/portal/vehicles/` – Portal: vehicles

Lista de veículos da conta e formulário de veículo, que começa pela consulta da placa.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `vehicle-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/clientes/UC05-manter-veiculos.md`
- `docs/clientes/rotas.md`
- `docs/padroes/frontend.md`
