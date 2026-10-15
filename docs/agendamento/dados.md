---
titulo: Dados – Agendamento
assunto: agendamento
origem: Documentação de Arquitetura de Software, seção 5.2 (Quadros 23, 24)
tabelas: [appointments, appointment_services]
---

# Dados: Agendamento

Salvo indicação, as colunas são obrigatórias, os identificadores são `uuid` gerados pelo banco e toda tabela tem `created_at`. Convenções gerais (tipos, nomes de restrições, RLS, exclusão lógica, migrations): [../padroes/banco.md](../padroes/banco.md).

## Tabelas

### `appointments`

Agendamentos.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK | Identificador do agendamento. |
| `client_id` | `uuid` | FK composta para `client_vehicles` | Cliente do agendamento (RN003). |
| `vehicle_id` | `uuid` | FK composta para `client_vehicles` | Veículo vinculado à conta do cliente. |
| `created_by_staff_id` | `uuid` | FK para `staff`; opcional | Funcionário que registrou o agendamento; vazio quando o próprio cliente agendou. |
| `rescheduled_from_id` | `uuid` | FK para `appointments`; única; opcional | Agendamento concluído que deu origem a este; cada agendamento origina no máximo um reagendamento (RN020). |
| `scheduled_at` | `timestamptz` |  | Data e horário marcados. |
| `status` | `appointment_status` | Padrão: `scheduled` | Status atual. |
| `payment_method` | `payment_method` |  | Forma de pagamento escolhida. |
| `subtotal` | `numeric(10,2)` | Maior que zero | Soma dos valores dos serviços. |
| `fee_percent` | `numeric(5,2)` | De −100 a 100 | Percentual aplicado: positivo para acréscimo, negativo para desconto. |
| `total` | `numeric(10,2)` | Maior ou igual a zero | Valor total do agendamento (RN010). |
| `estimated_duration_minutes` | `integer` | Maior que zero | Duração estimada, informativa (RN014). |
| `estimated_end_at` | `timestamptz` | Igual ou posterior a `scheduled_at` | Previsão de conclusão (RN034). |
| `client_name` | `text` |  | Cópia do nome completo do cliente (RN037). |
| `vehicle_plate` | `text` |  | Cópia da placa do veículo. |
| `vehicle_type` | `vehicle_type` |  | Cópia do tipo do veículo. |
| `vehicle_size` | `vehicle_size` |  | Cópia do porte usado na precificação. |
| `vehicle_brand` | `text` |  | Cópia da marca do veículo. |
| `vehicle_model` | `text` |  | Cópia do modelo do veículo. |
| `vehicle_color` | `text` |  | Cópia da cor do veículo. |
| `vehicle_year` | `smallint` |  | Cópia do ano do veículo. |
| `completed_at` | `timestamptz` | Conforme o status | Momento do recebimento do pagamento; base da receita por dia. |
| `cancelled_at` | `timestamptz` | Conforme o status | Momento do cancelamento. |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `appointment_services`

Serviços de cada agendamento.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `appointment_id` | `uuid` | PK; FK para `appointments` | Agendamento. |
| `service_id` | `uuid` | PK; FK para `services` | Serviço contratado. |
| `service_name` | `text` |  | Cópia do nome do serviço (RN037). |
| `service_type` | `service_type` |  | Cópia do tipo do serviço. |
| `price` | `numeric(10,2)` | Maior que zero | Valor do serviço no registro ou na última edição do agendamento. |
| `duration_minutes` | `integer` | Maior que zero | Duração média do serviço no mesmo momento. |

## Tipos enumerados

| Tipo | Valores | Uso |
|---|---|---|
| `payment_method` | `credit`, `debit`, `pix`, `cash` | Forma de pagamento (RN011). |
| `appointment_status` | `scheduled`, `checked_in`, `in_progress`, `awaiting_payment`, `completed`, `cancelled`, `rescheduled` | Status do agendamento. |

## Regras garantidas pelo banco

- em `appointments`, `completed_at` é preenchido se e somente se o status for `completed` ou `rescheduled`, e `cancelled_at`, se e somente se for `cancelled`;
- os valores de serviço e de agendamento são maiores que zero, exceto o total, que pode ser zero quando houver desconto de 100%.

## Gravações em várias tabelas

Feitas por função SQL, em uma única transação, chamada pelo repositório (RNF010):

- `create_appointment`, `update_appointment` e `reschedule_appointment`: agendamento, cópia dos dados e serviços;

## Índices adicionais

| Tabela | Colunas | Consulta atendida |
|---|---|---|
| `appointments` | `scheduled_at` | Agenda do dia e visões de agendamentos do dia, futuros e histórico. |
| `appointments` | `client_id`, `scheduled_at` | Agendamentos do cliente, em ordem de data. |
| `appointments` | `vehicle_id` | Busca de agendamentos por veículo. |
| `appointments` | `completed_at`, apenas quando preenchido | Receita por dia e indicadores do dashboard. |

## Relacionamentos

| Relacionamento | Cardinalidade | Chave estrangeira | Exclusão física |
|---|---|---|---|
| Vínculo entre cliente e veículo possui agendamentos | 1 para N | `client_id` e `vehicle_id` em `appointments` | Bloqueada; vínculos e agendamentos são histórico. |
| Funcionário registra agendamentos | 1 para N | `created_by_staff_id` em `appointments` | Bloqueada; funcionários são desativados. |
| Agendamento origina reagendamento | 1 para 1 | `rescheduled_from_id` em `appointments` | Bloqueada; agendamentos não são excluídos. |
| Agendamento contém serviços | 1 para N | `appointment_id` em `appointment_services` | Bloqueada; os itens só são substituídos na edição do próprio agendamento. |
| Serviço consta em agendamentos | 1 para N | `service_id` em `appointment_services` | Bloqueada; serviços têm exclusão lógica. |

## Observações

- O agendamento funciona como uma ordem de serviço: no registro e em cada edição, ele grava uma cópia do nome do cliente, dos dados do veículo e do nome, do tipo, do valor e da duração de cada serviço (RN037). Alterações posteriores nos cadastros não modificam agendamentos já registrados; a cópia só é refeita quando o próprio agendamento é editado (RN033), e o reagendamento cria um novo agendamento, calculado pelo catálogo atual (RN020).
- Correspondência entre status e valores no banco: [RN017](RN017-sequencia-de-status.md). Funções puras de cálculo: [calculos.md](calculos.md).
