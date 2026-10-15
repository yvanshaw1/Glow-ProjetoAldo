# `src/components/admin/dashboard/` – Painel: dashboard

Indicadores, gráfico de receita por dia (Recharts, carregado sob demanda), agendamentos por status e agenda do dia, com seleção de período.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `dashboard-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/agendamento/UC09-visualizar-dashboard.md`
- `docs/agendamento/rotas.md`
- `docs/padroes/frontend.md`
