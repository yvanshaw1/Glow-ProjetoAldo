---
titulo: Telas e rotas – Agendamento
assunto: agendamento
origem: Documentação de Arquitetura de Software, seção 3.2 (Quadros 3 e 4) e Apêndice A
---

# Telas e rotas: Agendamento

Valem para todas as rotas, sem repetição abaixo ([../padroes/api.md](../padroes/api.md)): erros comuns 400, 401, 403 e 404 no formato Problem Details; parâmetros `page` e `pageSize` em toda listagem; `updatedAt` obrigatório em `PATCH` e `PUT`, com 409 `VERSION_CONFLICT`. Campos com `*` são obrigatórios.

## Telas

| Rota | Tela | Acesso | Casos de uso |
|---|---|---|---|
| `/booking` | Agendar serviço | Cliente | UC06 |
| `/appointments` | Agendamentos atuais e histórico, com edição, cancelamento e reagendamento | Cliente | UC07, UC25, UC26 |
| `/admin` | Dashboard, com a análise do período por IA | permissão `dashboard` | UC09, UC27 |
| `/admin/appointments` | Gerenciamento de agendamentos | permissão `appointments` | UC10, UC11, UC12, UC25, UC26 |

Proteção das páginas: [../acesso/autenticacao.md](../acesso/autenticacao.md).

## API

### Rotas do cliente: agendamentos

Acesso: Perfil `client`; opera só sobre os dados do cliente da sessão (RS009).

#### `GET /api/me/bookable-services`

Serviços disponíveis para o veículo, com valores e adicionais vinculados.

- Entrada: `vehicleId*`
- Resposta: **200** serviços com o valor aplicável ao porte e os adicionais de cada serviço principal.

#### `POST /api/me/appointments/preview`

Calcula os valores do carrinho ou da edição de um agendamento, sem gravar.

- Entrada: `vehicleId*, serviceIds*, paymentMethod, scheduledAt`; `appointmentId`, na edição.
- Resposta: **200** itens, subtotal, percentual da forma de pagamento, total, duração estimada e, com `scheduledAt`, previsão de conclusão.

#### `POST /api/me/appointments`

Registra o agendamento (UC06).

- Entrada: `vehicleId*, serviceIds*, paymentMethod*, scheduledAt*`
- Resposta: **201** agendamento com o status `scheduled`; 400 data ou horário fora do funcionamento ou no passado; adicional sem o serviço principal.

#### `GET /api/me/appointments`

Lista os agendamentos (UC07).

- Entrada: `scope`: `current` ou `history`.
- Resposta: **200** lista com data, previsão de conclusão, veículo, serviços, total e status.

#### `GET /api/me/appointments/:id`

Detalha um agendamento do cliente.

- Entrada: Nenhuma.
- Resposta: **200** agendamento completo.

#### `PATCH /api/me/appointments/:id`

Edita um agendamento com o status `scheduled` (UC26).

- Entrada: `vehicleId, serviceIds, paymentMethod, scheduledAt`
- Resposta: **200** agendamento atualizado, com os valores e a previsão de conclusão recalculados; 400 data, horário ou serviços inválidos, ou nova data anterior à marcada; 409 `INVALID_STATUS` se não estiver agendado.

#### `POST /api/me/appointments/:id/cancel`

Cancela um agendamento.

- Entrada: Nenhuma.
- Resposta: **200** agendamento cancelado; 409 `INVALID_STATUS` se não estiver agendado.

#### `POST /api/me/appointments/:id/reschedule`

Reagenda um serviço concluído (UC25).

- Entrada: `paymentMethod*, scheduledAt*`
- Resposta: **201** novo agendamento, com valores e duração calculados pelo catálogo atual; o original passa a `rescheduled`; 409 `INVALID_STATUS` se não estiver concluído.

### Rotas do painel: dashboard

Acesso: Perfis `staff` ou `admin` com a permissão `dashboard`.

#### `GET /api/admin/dashboard`

Indicadores e agenda do dia (UC09).

- Entrada: `from, to` (datas; padrão: mês atual).
- Resposta: **200** receita, quantidade de agendamentos, ticket médio, taxa de cancelamento, receita por dia, agendamentos por status e agenda do dia; 400 período inválido ou maior que 12 meses.

#### `POST /api/admin/dashboard/analysis`

Gera a análise do período por inteligência artificial (UC27); nada é gravado.

- Entrada: `from*, to*` (datas do período exibido; até 12 meses).
- Resposta: **200** `from`, `to`, `previousFrom`, `previousTo`, `hasComparison`, `summary`, `highlights` (até quatro, cada um com `indicator` e `comment`) e `generatedAt`; 400 período inválido ou maior que 12 meses; 409 `INSUFFICIENT_DATA`, período sem agendamentos, sem chamar a IA; 503 `AI_UNAVAILABLE`, serviço de IA sem configuração, sem resposta em 15 segundos, com o limite atingido ou com resposta fora de RN039 (`docs/plataforma/servico-de-ia.md`).

### Rotas do painel: agendamentos

Acesso: Perfis `staff` ou `admin` com a permissão `appointments`.

#### `GET /api/admin/appointments`

Lista os agendamentos (UC10).

- Entrada: `view*`: `today`, `future` ou `history`; `status, search, sort, page, pageSize`.
- Resposta: **200** lista paginada com cliente, veículo, serviços, total, status e previsão de conclusão.

#### `GET /api/admin/appointments/:id`

Detalha um agendamento.

- Entrada: Nenhuma.
- Resposta: **200** agendamento completo; no status `awaiting_payment`, inclui o total para cada forma de pagamento, usado no resumo de conclusão.

#### `POST /api/admin/appointments/preview`

Calcula os valores de um novo agendamento ou da edição de um agendamento, sem gravar.

- Entrada: `vehicleId*, serviceIds*, paymentMethod, scheduledAt`; `appointmentId`, na edição.
- Resposta: **200** itens, subtotal, percentual, total, duração estimada e, com `scheduledAt`, previsão de conclusão.

#### `POST /api/admin/appointments`

Registra um agendamento para um cliente (UC11).

- Entrada: `clientId*, vehicleId*, serviceIds*, paymentMethod*, scheduledAt*`
- Resposta: **201** agendamento com o status `scheduled`; 400 data ou horário inválido.

#### `PATCH /api/admin/appointments/:id`

Edita um agendamento em qualquer status (UC26).

- Entrada: `vehicleId, serviceIds, paymentMethod, scheduledAt`
- Resposta: **200** agendamento atualizado, com os valores e a previsão de conclusão recalculados; 400 data, horário ou serviços incompatíveis com a disponibilidade ou com o status.

#### `POST /api/admin/appointments/:id/advance`

Avança para o próximo status, até `awaiting_payment` (UC12).

- Entrada: Nenhuma.
- Resposta: **200** agendamento com o novo status; 409 `INVALID_STATUS`.

#### `POST /api/admin/appointments/:id/complete`

Conclui o atendimento e registra a forma de pagamento utilizada (UC12).

- Entrada: `paymentMethod*`
- Resposta: **200** agendamento `completed`, com o total recalculado se a forma de pagamento mudou; 409 `INVALID_STATUS` se não estiver em `awaiting_payment`.

#### `POST /api/admin/appointments/:id/cancel`

Cancela um agendamento agendado ou em espera.

- Entrada: Nenhuma.
- Resposta: **200** agendamento cancelado; 409 `INVALID_STATUS`.

#### `POST /api/admin/appointments/:id/reschedule`

Reagenda um serviço concluído (UC25).

- Entrada: `paymentMethod*, scheduledAt*`
- Resposta: **201** novo agendamento, com valores e duração calculados pelo catálogo atual; 409 `INVALID_STATUS`.

#### `GET /api/admin/appointments/lookup/clients`

Busca clientes para o formulário de novo agendamento.

- Entrada: `search*`
- Resposta: **200** lista resumida de clientes.

#### `GET /api/admin/appointments/lookup/vehicles`

Lista os veículos do cliente escolhido.

- Entrada: `clientId*`
- Resposta: **200** lista de veículos.

#### `GET /api/admin/appointments/lookup/services`

Lista os serviços com os valores aplicáveis ao veículo.

- Entrada: `vehicleId*`
- Resposta: **200** serviços, valores e adicionais.
