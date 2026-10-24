# `src/components/portal/appointments/` – Portal: appointments

Assistente de agendamento (as etapas de veículo e de serviços, e a ligação com as de data e horário, forma de pagamento e resumo, que ficam em `src/components/shared/`), reaproveitado na edição; cartão de agendamento; listas de atuais e histórico, com cancelar e reagendar.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `appointment-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/agendamento/UC06-agendar-servico.md`
- `docs/agendamento/UC07-acompanhar-agendamentos.md`
- `docs/agendamento/UC25-reagendar-servico-concluido.md`
- `docs/agendamento/UC26-editar-agendamento.md`
- `docs/agendamento/rotas.md`
- `docs/padroes/frontend.md`
