# `src/components/portal/clients/` – Portal: clients

Dados da conta do cliente e alteração de senha.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `client-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/clientes/UC04-atualizar-dados-da-conta.md`
- `docs/clientes/rotas.md`
- `docs/padroes/frontend.md`
