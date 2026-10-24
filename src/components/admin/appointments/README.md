# `src/components/admin/appointments/` – Painel: appointments

Listagem com as visões do dia, futuros e histórico, filtros e busca; formulário de novo agendamento em etapas (a etapa do cliente é daqui, as outras são de `src/components/shared/`); ações de status; resumo de conclusão com a forma de pagamento.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `appointment-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/agendamento/UC10-consultar-agendamentos.md`
- `docs/agendamento/UC11-registrar-agendamento-para-cliente.md`
- `docs/agendamento/UC12-atualizar-status-do-agendamento.md`
- `docs/agendamento/UC25-reagendar-servico-concluido.md`
- `docs/agendamento/UC26-editar-agendamento.md`
- `docs/agendamento/rotas.md`
- `docs/padroes/frontend.md`
