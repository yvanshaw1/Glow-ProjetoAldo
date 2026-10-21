---
titulo: Telas e rotas – Configurações
assunto: configuracoes
origem: Documentação de Arquitetura de Software, seção 3.2 (Quadros 3 e 4) e Apêndice A
---

# Telas e rotas: Configurações

Valem para todas as rotas, sem repetição abaixo ([../padroes/api.md](../padroes/api.md)): erros comuns 400, 401, 403 e 404 no formato Problem Details; parâmetros `page` e `pageSize` em toda listagem; `updatedAt` obrigatório em `PATCH` e `PUT`, com 409 `VERSION_CONFLICT`. Campos com `*` são obrigatórios.

## Telas

| Rota | Tela | Acesso | Casos de uso |
|---|---|---|---|
| `/admin/settings` | Configurações, em abas: Empresa, Disponibilidade e Formas de pagamento | permissão `settings` | UC22, UC23, UC24 |

A aba escolhida fica na página, sem mudar o endereço, e começa em Empresa. Trocar de aba mantém o que foi digitado nas outras; cada aba grava só a sua seção.

Proteção das páginas: [../acesso/autenticacao.md](../acesso/autenticacao.md).

## API

### Rotas públicas

Acesso: Público, sem autenticação.

#### `GET /api/public/company`

Dados institucionais e horários de funcionamento (RN028).

- Entrada: Nenhuma.
- Resposta: **200** `companyName`, `email`, `phone`, `whatsapp`, `address`, `instagramUrl`, `facebookUrl` e `businessHours`, com os sete dias de domingo (0) a sábado (6): `weekday`, `isOpen`, `opensAt`, `closesAt`, `breakStartsAt` e `breakEndsAt`. Dado opcional vazio é `null`; o CNPJ não é público.

### Rotas do painel: configurações

Acesso: Perfis `staff` ou `admin` com a permissão `settings`.

#### `GET /api/admin/settings/company`

Dados da empresa (UC22).

- Entrada: Nenhuma.
- Resposta: **200** `companyName`, `cnpj`, `email`, `phone`, `address`, `instagramUrl`, `facebookUrl`, `whatsapp` e `updatedAt`.

#### `PUT /api/admin/settings/company`

Grava os dados da empresa.

- Entrada: `companyName*, cnpj, email, phone, address, instagramUrl, facebookUrl, whatsapp, updatedAt*`; o opcional ausente, `null` ou vazio apaga o valor gravado.
- Resposta: **200** o corpo do `GET`, com o `updatedAt` novo; 400 campo fora de RN035; 409 `VERSION_CONFLICT`.

#### `GET /api/admin/settings/business-hours`

Disponibilidade (UC23).

- Entrada: Nenhuma.
- Resposta: **200** os sete dias da semana, com situação, horários e pausa.

#### `PUT /api/admin/settings/business-hours`

Grava a disponibilidade.

- Entrada: Lista com `weekday*, isOpen*, opensAt, closesAt, breakStartsAt, breakEndsAt`.
- Resposta: **200** disponibilidade atualizada; 400 horário fora de hora cheia ou meia hora, encerramento anterior ou igual à abertura, ou pausa fora do expediente.

#### `GET /api/admin/settings/payment-fees`

Percentuais das formas de pagamento (UC24).

- Entrada: Nenhuma.
- Resposta: **200** as quatro formas, com o percentual de cada uma.

#### `PUT /api/admin/settings/payment-fees`

Grava os percentuais.

- Entrada: Lista com `paymentMethod*, percent*`; percentual negativo para desconto.
- Resposta: **200** percentuais atualizados; 400 percentual fora do intervalo de −100 a 100.
