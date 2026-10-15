---
titulo: Funções puras do agendamento
assunto: agendamento
origem: Documentação de Arquitetura de Software, seção 4.2; Documentação de Análise do Sistema, seção 9
relacionados: [RN005, RN006, RN009, RN010, RN012, RN013, RN015, RN016, RN017, RN018, RN019, RN020, RN021, RN032, RN033, RN034, RN037]
---

# Funções puras do agendamento

Quatro conjuntos de regras do módulo `appointments` são funções puras, sem banco, desenvolvidas com TDD (`docs/padroes/testes.md`). Recebem por parâmetro tudo de que precisam: itens do catálogo vigente, porte do veículo, percentual da forma de pagamento, disponibilidade (`business_hours`), fuso da empresa (`APP_TIMEZONE`, `America/Maceio`) e o instante atual (`now`). Nunca leem relógio, banco ou variáveis de ambiente. O serviço `appointments` busca esses dados, chama as funções e grava o resultado.

| Seção | Arquivo | Teste |
|---|---|---|
| 1. Preço | `src/server/rules/pricing.ts` | `tests/rules/pricing.test.ts` |
| 2. Transições de status | `src/server/rules/status-transitions.ts` | `tests/rules/status-transitions.test.ts` |
| 3. Datas e horários | `src/server/rules/scheduling.ts` | `tests/rules/scheduling.test.ts` |
| 4. Edição | `src/server/rules/editing.ts` | `tests/rules/editing.test.ts` |

Os indicadores (seção 5) não ficam em `rules/`: são agregações por período, e onde calculá-las (no banco ou no serviço `dashboard`) é decidido no plano da tarefa do dashboard.

## 1. Preço (RN009, RN010, RN012)

- Valor do item: `by_size` usa o preço do porte do veículo; `fixed` usa `fixed_price`; adicional é sempre fixo.
- Subtotal: soma dos itens. Total: subtotal ajustado pelo percentual da forma (positivo acréscimo, negativo desconto). Desconto de 100% dá total zero.
- Cálculo em centavos inteiros, arredondado ao centavo mais próximo. A regra de desempate (meio centavo) não está definida: decidir no plano e cobrir com teste.
- Composição: ao menos um serviço principal ou complementar (RN005); adicional só com o principal a que está vinculado (RN006).
- A mesma função serve ao novo agendamento, à edição, ao reagendamento (sempre pelo catálogo atual, RN020) e à conclusão com troca da forma de pagamento (RN018).

## 2. Transições de status (RN017 a RN020)

| De | Para | Quem | Rota |
|---|---|---|---|
| `scheduled` | `checked_in` | funcionário | `advance` |
| `checked_in` | `in_progress` | funcionário | `advance` |
| `in_progress` | `awaiting_payment` | funcionário | `advance` |
| `awaiting_payment` | `completed` | funcionário, confirmando ou trocando a forma | `complete` (grava `completed_at`) |
| `scheduled` | `cancelled` | cliente ou funcionário | `cancel` (grava `cancelled_at`) |
| `checked_in` | `cancelled` | funcionário | `cancel` |
| `completed` | `rescheduled` | cliente ou funcionário | `reschedule` (cria um novo `scheduled`) |

`cancelled` e `rescheduled` são finais. Um agendamento origina no máximo um reagendamento; o novo pode ser reagendado depois de concluído. Transição inválida: 409 `INVALID_STATUS`.

## 3. Datas e horários (RN013, RN015, RN016, RN034)

- Início válido: dia aberto, entre `opens_at` (inclusive) e `closes_at`, fora da pausa, em múltiplo de 30 minutos e não anterior a `now`.
- Previsão de conclusão: distribuir a duração estimada pelos períodos de funcionamento a partir do início, pulando pausa, horário fora do expediente e dias fechados. Exemplo: dia das 8h às 18h com pausa das 12h às 13h, início às 16h e 4 horas de serviço → 2 horas no dia, 2 horas no próximo dia aberto → previsão às 10h desse dia.
- Sem controle de capacidade nem de conflito entre agendamentos (RN016). O cliente pode registrar a qualquer momento (RNF012); a disponibilidade restringe o horário marcado, não o momento do registro.

## 4. Edição (RN032, RN033)

- Cliente: só em `scheduled`, e só posterga: a nova data e o novo horário são posteriores aos marcados e no futuro.
- Funcionário: qualquer status; em `scheduled`, nunca no passado; de `checked_in` em diante, nunca depois do momento da alteração.
- A edição nunca muda o status.
- Troca de veículo ou serviços recalcula todos os itens pelo catálogo atual; troca da forma aplica o percentual vigente; subtotal, total, duração e previsão são sempre recalculados, e a cópia dos dados é refeita (RN037).

## 5. Indicadores do dashboard (RN021)

- Receita: soma de `total` dos agendamentos `completed` ou `rescheduled` com `completed_at` no período; receita por dia agrupada por `completed_at`.
- Ticket médio: receita dividida pela quantidade desses agendamentos.
- Taxa de cancelamento: cancelados sobre o total de agendamentos do período. A data que define o período para essa taxa (`scheduled_at` ou `created_at`) não está definida: perguntar no plano.
- Período padrão: mês atual; no máximo 12 meses (RN035).

## Persistência

`create_appointment`, `update_appointment` e `reschedule_appointment` são funções SQL que gravam, em uma transação, o agendamento, a cópia dos dados e os serviços; o reagendamento também muda o original para `rescheduled` (`dados.md`).
