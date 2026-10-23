---
titulo: Funções puras do agendamento
assunto: agendamento
origem: Documentação de Arquitetura de Software, seção 4.2; Documentação de Análise do Sistema, seção 9
relacionados: [RN005, RN006, RN009, RN010, RN012, RN013, RN015, RN016, RN017, RN018, RN019, RN020, RN021, RN032, RN033, RN034, RN037, RN038, RN039]
---

# Funções puras do agendamento

Quatro conjuntos de regras do módulo `appointments` e as regras da análise do módulo `dashboard` são funções puras, sem banco, desenvolvidas com TDD (`docs/padroes/testes.md`). Recebem por parâmetro tudo de que precisam: itens do catálogo vigente, porte do veículo, percentual da forma de pagamento, disponibilidade (`business_hours`), fuso da empresa (`COMPANY_TIME_ZONE`, `America/Maceio`) e o instante atual (`now`). Nunca leem relógio, banco ou variáveis de ambiente. O serviço `appointments` busca esses dados, chama as funções e grava o resultado.

| Seção | Arquivo | Teste |
|---|---|---|
| 1. Preço | `src/server/rules/pricing.ts` | `tests/rules/pricing.test.ts` |
| 2. Transições de status | `src/server/rules/status-transitions.ts` | `tests/rules/status-transitions.test.ts` |
| 3. Datas e horários | `src/server/rules/scheduling.ts` | `tests/rules/scheduling.test.ts` |
| 4. Edição | `src/server/rules/editing.ts` | `tests/rules/editing.test.ts` |
| 6. Análise do dashboard | `src/server/rules/dashboard-analysis.ts` | `tests/rules/dashboard-analysis.test.ts` |

Os indicadores (seção 5) não ficam em `rules/`: são agregações por período, e onde calculá-las (no banco ou no serviço `dashboard`) é decidido no plano da tarefa do dashboard.

## 1. Preço (RN009, RN010, RN012)

- Valor do item: `by_size` usa o preço do porte do veículo; `fixed` usa `fixed_price`; adicional é sempre fixo.
- Subtotal: soma dos itens. Total: subtotal ajustado pelo percentual da forma (positivo acréscimo, negativo desconto). Desconto de 100% dá total zero.
- Cálculo em centavos inteiros: as funções recebem e devolvem reais, como o banco, a API e as telas, e convertem para centavos por dentro. Só o total é arredondado, uma vez, ao centavo mais próximo, e o meio centavo sobe: R$ 150,10 com acréscimo de 5% (R$ 157,605) dá R$ 157,61, e com desconto de 5% (R$ 142,595), R$ 142,60. Como o total nunca é negativo, é o mesmo resultado do `round` do PostgreSQL.
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

- Início válido: dia aberto, de `opens_at` (inclusive) a `closes_at` (exclusive), fora da pausa, de `break_starts_at` (inclusive) a `break_ends_at` (exclusive), em múltiplo de 30 minutos e não anterior a `now`. Com expediente das 8h às 18h e pausa das 12h às 13h, 8h, 13h e 17h30 são aceitos, e 12h, 12h30 e 18h, recusados.
- Previsão de conclusão: distribuir a duração estimada pelos períodos de funcionamento a partir do início, pulando pausa, horário fora do expediente e dias fechados. Exemplo: dia das 8h às 18h com pausa das 12h às 13h, início às 16h e 4 horas de serviço → 2 horas no dia, 2 horas no próximo dia aberto → previsão às 10h desse dia. O trabalho que termina exatamente no encerramento ou no início da pausa tem a previsão nesse horário: início às 16h com 2 horas → 18h do mesmo dia.
- Sem controle de capacidade nem de conflito entre agendamentos (RN016). O cliente pode registrar a qualquer momento (RNF012); a disponibilidade restringe o horário marcado, não o momento do registro.

## 4. Edição (RN032, RN033)

- Cliente: só em `scheduled`, e só posterga: a nova data e o novo horário são posteriores aos marcados e no futuro.
- Funcionário: qualquer status; em `scheduled`, nunca no passado; em `checked_in`, `in_progress`, `awaiting_payment`, `completed` e `rescheduled`, nunca depois do momento da alteração; em `cancelled`, só a disponibilidade.
- As conferências de data só valem quando a data ou o horário mudam. A previsão é recalculada a partir da data marcada; se ela ficou fora do funcionamento, a contagem começa no próximo período.
- A edição nunca muda o status.
- Troca de veículo ou serviços recalcula todos os itens pelo catálogo atual; troca da forma aplica o percentual vigente; subtotal, total, duração e previsão são sempre recalculados, e a cópia dos dados é refeita (RN037).

## 5. Indicadores do dashboard (RN021)

- Receita: soma de `total` dos agendamentos `completed` ou `rescheduled` com `completed_at` no período; receita por dia agrupada por `completed_at`.
- Ticket médio: receita dividida pela quantidade desses agendamentos.
- Taxa de cancelamento: cancelados sobre o total de agendamentos do período.
- Quantidade de agendamentos e taxa de cancelamento: o período é o da data marcada (`scheduled_at`), e a quantidade conta todos os status. Sem agendamentos pagos, o ticket médio é zero.
- Agenda do dia (RF043): os agendamentos de qualquer status marcados para o dia corrente no fuso da empresa.
- Período padrão: mês atual; no máximo 12 meses (RN035).

## 6. Análise do dashboard (RN038, RN039)

- Período anterior: a mesma quantidade de dias, terminando no dia anterior à data inicial. 01/10/2026 a 31/10/2026 dá 31/08/2026 a 30/09/2026; 21/10/2026 dá 20/10/2026; 01/03/2028 a 31/03/2028 dá 30/01/2028 a 29/02/2028.
- Variação: percentual sobre o valor anterior, com uma casa decimal (R$ 10.000,00 para R$ 12.500,00 dá 25,0); na taxa de cancelamento, a diferença em pontos percentuais (10,0% para 15,0% dá 5,0). Sem variação quando o valor anterior é zero.
- Entrada do modelo: os indicadores do período e do anterior, as variações, a receita por dia e a quantidade de agendamentos por status, com os rótulos de RN017. Nada da agenda do dia nem texto livre. Sem agendamentos no período anterior, a entrada marca a comparação como indisponível.
- Mensagens: uma de sistema, fixa no código e em português, e uma com a entrada em JSON.
- Resposta: JSON com `summary`, de 1 a 600 caracteres, e até quatro `highlights`, cada um com um indicador da lista (`revenue`, `appointmentCount`, `averageTicket`, `cancellationRate`, `revenueByDay`, `appointmentsByStatus`) e um `comment` de 1 a 240 caracteres, com os textos normalizados como os de RN035. A resposta fora desse formato é recusada (`INVALID_RESPONSE`), como a que tem algarismo no resumo ou numa observação (`NUMBERS_IN_TEXT`); campos não previstos são descartados.
- As funções recebem os indicadores já calculados pelo serviço `dashboard` e devolvem a recusa como valor, sem lançar erro.

## Persistência

`create_appointment`, `update_appointment` e `reschedule_appointment` são funções SQL que gravam, em uma transação, o agendamento, a cópia dos dados e os serviços; o reagendamento também muda o original para `rescheduled` (`dados.md`).
