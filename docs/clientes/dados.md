---
titulo: Dados – Clientes e veículos
assunto: clientes
origem: Documentação de Arquitetura de Software, seção 5.2 (Quadros 13, 17, 18)
tabelas: [clients, vehicles, client_vehicles]
---

# Dados: Clientes e veículos

Salvo indicação, as colunas são obrigatórias, os identificadores são `uuid` gerados pelo banco e toda tabela tem `created_at`. Convenções gerais (tipos, nomes de restrições, RLS, exclusão lógica, migrations): [../padroes/banco.md](../padroes/banco.md).

## Tabelas

### `clients`

Clientes.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK | Mesmo identificador da conta no Supabase Auth, sem chave estrangeira (ver Observações). |
| `first_name` | `text` |  | Nome. |
| `last_name` | `text` |  | Sobrenome. |
| `email` | `text` | Único entre clientes não excluídos | E-mail de acesso, copiado para listagem e busca (RN022). |
| `phone` | `text` |  | Telefone. |
| `must_change_password` | `boolean` | Padrão: falso | Indica troca de senha pendente no primeiro acesso (RS004). |
| `deleted_at` | `timestamptz` | Opcional | Data da exclusão lógica da conta (RN030). |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `vehicles`

Veículos.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK | Identificador do veículo. |
| `type` | `vehicle_type` |  | Tipo informado no cadastro. |
| `size` | `vehicle_size` | Gerada a partir de `type` | Porte calculado pelo próprio banco a partir do tipo (RN002); não é gravado pela aplicação. |
| `plate` | `text` | Única | Placa, gravada em maiúsculas e sem hífen; identifica o veículo (RN036). |
| `brand` | `text` |  | Marca. |
| `model` | `text` |  | Modelo. |
| `color` | `text` |  | Cor. |
| `year` | `smallint` | A partir de 1886 | Ano. |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `client_vehicles`

Vínculo entre clientes e veículos.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `client_id` | `uuid` | PK; FK para `clients` | Cliente. |
| `vehicle_id` | `uuid` | PK; FK para `vehicles` | Veículo vinculado à conta do cliente (RN036). |

## Tipos enumerados

| Tipo | Valores | Uso |
|---|---|---|
| `vehicle_type` | `hatch`, `sedan`, `suv`, `pickup` | Tipo do veículo. |
| `vehicle_size` | `small`, `medium`, `large`, `extra_large` | Porte do veículo, exibido na interface como P, M, G e GG (RN002). |

## Regras garantidas pelo banco

- a placa é gravada em maiúsculas e sem hífen, no padrão Mercosul ou no antigo (`ck_vehicles_plate`), e o e-mail do cliente, em minúsculas e sem espaços (`ck_clients_email`).

## Gravações em várias tabelas

Feitas por função SQL, em uma única transação, chamada pelo repositório (RNF010):

- `link_vehicle`: veículo, quando a placa ainda não existe, e vínculo com a conta do cliente.

## Índices adicionais

| Tabela | Colunas | Consulta atendida |
|---|---|---|
| `client_vehicles` | `vehicle_id` | Contas vinculadas a um veículo, usada na verificação de veículo compartilhado. |

## Relacionamentos

| Relacionamento | Cardinalidade | Chave estrangeira | Exclusão física |
|---|---|---|---|
| Cliente possui veículos | N para N | Tabela `client_vehicles` | Bloqueada; clientes têm exclusão lógica, e veículos não são excluídos. |

## Observações

- Na exclusão de um cliente, além da marcação em `deleted_at`, as credenciais são removidas do Supabase Auth, o que impede novos acessos e libera o e-mail para um novo cadastro. Por esse motivo, a tabela `clients` não possui chave estrangeira para as contas do Supabase Auth, ao contrário da tabela `staff`, cujos registros são apenas desativados, e a unicidade do e-mail em `clients` vale apenas entre os clientes não excluídos.
- O porte (`size`) é coluna gerada pelo banco a partir de `type` ([RN002](RN002-porte-definido-pelo-tipo.md)); a aplicação nunca o grava. A placa é única no sistema e o vínculo com o cliente fica em `client_vehicles` ([RN036](RN036-placa-unica.md)).
