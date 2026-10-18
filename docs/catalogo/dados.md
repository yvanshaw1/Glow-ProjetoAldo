---
titulo: Dados – Catálogo
assunto: catalogo
origem: Documentação de Arquitetura de Software, seção 5.2 (Quadros 19, 20, 21, 22)
tabelas: [categories, services, service_prices, service_additionals]
---

# Dados: Catálogo

Salvo indicação, as colunas são obrigatórias, os identificadores são `uuid` gerados pelo banco e toda tabela tem `created_at`. Convenções gerais (tipos, nomes de restrições, RLS, exclusão lógica, migrations): [../padroes/banco.md](../padroes/banco.md).

## Tabelas

### `categories`

Categorias de serviço.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK | Identificador da categoria. |
| `name` | `text` | Único | Nome da categoria. |
| `description` | `text` |  | Descrição da categoria. |
| `is_active` | `boolean` | Padrão: verdadeiro | Categoria inativa oculta os seus serviços do catálogo público e do agendamento pelo cliente (RN031). |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `services`

Serviços.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK | Identificador do serviço. |
| `type` | `service_type` | Não pode ser alterado | Tipo do serviço. |
| `category_id` | `uuid` | FK para `categories`; conforme o tipo | Categoria do serviço (RN007). |
| `name` | `text` | Único entre serviços não excluídos | Nome do serviço. |
| `description` | `text` | Conforme o tipo | Descrição exibida no catálogo. |
| `image_path` | `text` | Opcional; conforme o tipo | Caminho da imagem no Supabase Storage. |
| `avg_duration_minutes` | `integer` | De 5 a 2.400 | Duração média, em minutos. |
| `pricing_mode` | `pricing_mode` | Conforme o tipo | Forma de precificação. |
| `fixed_price` | `numeric(10,2)` | Maior que zero; conforme a precificação | Valor fixo do serviço (RN009). |
| `is_active` | `boolean` | Padrão: verdadeiro | Serviço inativo não aparece para o cliente (RN008). |
| `deleted_at` | `timestamptz` | Opcional | Data da exclusão lógica do serviço (RN030). |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `service_prices`

Valores por porte.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `service_id` | `uuid` | PK; FK para `services` | Serviço com precificação por porte. |
| `size` | `vehicle_size` | PK | Porte do veículo. |
| `price` | `numeric(10,2)` | Maior que zero | Valor do serviço para o porte; um serviço por porte tem exatamente os quatro valores (RN009). |

### `service_additionals`

Vínculo entre serviço principal e adicional.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `main_service_id` | `uuid` | PK; FK para `services`, do tipo `main` | Serviço principal. |
| `additional_service_id` | `uuid` | PK; FK para `services`, do tipo `additional` | Serviço adicional oferecido junto com o principal (RN006). |

## Tipos enumerados

| Tipo | Valores | Uso |
|---|---|---|
| `service_type` | `main`, `additional`, `complementary` | Tipo de serviço: principal, adicional ou complementar (RN006). |
| `pricing_mode` | `fixed`, `by_size` | Forma de precificação (RN009). |

## Regras garantidas pelo banco

- em `services`, os tipos principal e complementar exigem categoria e descrição; o tipo adicional não tem categoria, descrição nem imagem e é sempre de valor fixo; o valor fixo é preenchido se e somente se a precificação for `fixed`; e o tipo não pode ser alterado depois do cadastro;
- em `service_additionals`, o primeiro serviço deve ser do tipo principal e o segundo, do tipo adicional;
- um serviço por porte tem exatamente os quatro valores em `service_prices`, e um serviço de valor fixo não tem nenhum; a conferência é feita no fim da transação, por isso o serviço e os valores são gravados juntos, pela `save_service`;
- os nomes de categoria e de serviço não excluído não se repetem, sem diferenciar maiúsculas;
- os valores de serviço e de agendamento são maiores que zero, exceto o total, que pode ser zero quando houver desconto de 100%.

## Gravações em várias tabelas

Feitas por função SQL, em uma única transação, chamada pelo repositório (RNF010):

- `save_service`: serviço, valores por porte e vínculos de adicionais;

## Relacionamentos

| Relacionamento | Cardinalidade | Chave estrangeira | Exclusão física |
|---|---|---|---|
| Categoria agrupa serviços | 1 para N | `category_id` em `services` | Bloqueada; categorias são desativadas. |
| Serviço possui valores por porte | 1 para N | `service_id` em `service_prices` | Em cascata; os valores são configuração do serviço. |
| Serviço principal oferece adicionais | N para N | Tabela `service_additionals` | Em cascata; os vínculos são configuração do serviço. |

## Observações

- As imagens ficam no bucket `service-images` do Supabase Storage, com leitura pública e gravação apenas pelo backend, criado pela migration inicial com limite de 2 MB e os tipos JPEG, PNG e WebP; a tabela guarda só o caminho (`image_path`). Envio: JPEG, PNG ou WebP até 2 MB (RS015).
- Serviço e categoria inativos ficam ocultos para o cliente, mas disponíveis no painel ([RN008](RN008-servico-inativo.md), [RN031](RN031-categoria-inativa.md)); serviço excluído recebe `deleted_at` ([RN030](../plataforma/RN030-exclusao-logica.md)).
