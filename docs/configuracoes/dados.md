---
titulo: Dados – Configurações
assunto: configuracoes
origem: Documentação de Arquitetura de Software, seção 5.2 (Quadros 25, 26, 27)
tabelas: [business_settings, business_hours, payment_fees]
---

# Dados: Configurações

Salvo indicação, as colunas são obrigatórias, os identificadores são `uuid` gerados pelo banco e toda tabela tem `created_at`. Convenções gerais (tipos, nomes de restrições, RLS, exclusão lógica, migrations): [../padroes/banco.md](../padroes/banco.md).

## Tabelas

### `business_settings`

Dados da empresa (linha única).

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `smallint` | PK; sempre 1 | Garante a existência de uma única linha. |
| `company_name` | `text` |  | Nome da empresa. |
| `cnpj` | `text` | Opcional | CNPJ. |
| `email` | `text` | Opcional | E-mail de contato. |
| `phone` | `text` | Opcional | Telefone de contato. |
| `address` | `text` | Opcional | Endereço exibido na seção de localização e no rodapé. |
| `instagram_url` | `text` | Opcional | Endereço do perfil no Instagram. |
| `facebook_url` | `text` | Opcional | Endereço da página no Facebook. |
| `whatsapp` | `text` | Opcional | Número do WhatsApp. |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `business_hours`

Disponibilidade por dia da semana.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `weekday` | `smallint` | PK; de 0 a 6 | Dia da semana, de domingo (0) a sábado (6). |
| `is_open` | `boolean` |  | Indica se a empresa funciona no dia. |
| `opens_at` | `time` | Conforme a situação do dia | Horário de abertura. |
| `closes_at` | `time` | Conforme a situação do dia | Horário de encerramento. |
| `break_starts_at` | `time` | Opcional | Início da pausa do dia, como o horário de almoço (RN013). |
| `break_ends_at` | `time` | Opcional | Fim da pausa. |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `payment_fees`

Ajuste por forma de pagamento.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `payment_method` | `payment_method` | PK | Forma de pagamento. |
| `percent` | `numeric(5,2)` | De −100 a 100; padrão: 0 | Ajuste da forma de pagamento: positivo para acréscimo, negativo para desconto e zero sem ajuste (RN012). |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

## Tipos enumerados

| Tipo | Valores | Uso |
|---|---|---|
| `payment_method` | `credit`, `debit`, `pix`, `cash` | Forma de pagamento (RN011). |

## Regras garantidas pelo banco

- em `business_hours`, a abertura e o encerramento são preenchidos se e somente se o dia estiver aberto, o encerramento é posterior à abertura, a pausa tem início e fim juntos e fica dentro do expediente, e todos os horários terminam em 00 ou 30 minutos;

## Observações

- Os dados iniciais (`supabase/seed.sql`) criam a linha única de `business_settings`, os sete dias de `business_hours` e as quatro formas de pagamento sem ajuste em `payment_fees`. Valores iniciais: de segunda a sexta, das 08:00 às 18:00, com pausa das 12:00 às 13:00; sábado, das 08:00 às 12:00, sem pausa; domingo fechado; nome da empresa "Glow – Estética Automotiva" e os demais dados vazios. Essas tabelas não ganham nem perdem linhas pelo painel: só são alteradas.
- Na interface, o funcionário escolhe "acréscimo" ou "desconto" e informa um percentual de 0 a 100; o banco guarda o valor com sinal (negativo para desconto) ([RN012](RN012-percentual-da-forma-de-pagamento.md)).
