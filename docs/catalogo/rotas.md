---
titulo: Telas e rotas – Catálogo
assunto: catalogo
origem: Documentação de Arquitetura de Software, seção 3.2 (Quadros 3 e 4) e Apêndice A
---

# Telas e rotas: Catálogo

Valem para todas as rotas, sem repetição abaixo ([../padroes/api.md](../padroes/api.md)): erros comuns 400, 401, 403 e 404 no formato Problem Details; parâmetros `page` e `pageSize` em toda listagem; `updatedAt` obrigatório em `PATCH` e `PUT`, com 409 `VERSION_CONFLICT`. Campos com `*` são obrigatórios.

## Telas

| Rota | Tela | Acesso | Casos de uso |
|---|---|---|---|
| `/` | Página inicial | Público | UC01 |
| `/services` | Catálogo de serviços | Público | UC01 |
| `/admin/services` | Serviços e categorias | permissão `services` | UC13, UC14, UC15 |

Proteção das páginas: [../acesso/autenticacao.md](../acesso/autenticacao.md).

## API

### Rotas públicas

Acesso: Público, sem autenticação.

#### `GET /api/public/categories`

Categorias do filtro do catálogo (UC01): as ativas com ao menos um serviço principal ou complementar ativo (RN008, RN031).

- Entrada: Nenhuma.
- Resposta: **200** lista de `id` e `name`, em ordem alfabética, sem paginação.

#### `GET /api/public/services`

Catálogo de serviços principais e complementares ativos (UC01).

- Entrada: `categoryId` (opcional).
- Resposta: **200** lista paginada de `id`, `name`, `description`, `imageUrl` (endereço público da imagem, ou `null`), `category` (`id` e `name`) e `avgDurationMinutes`.

### Rotas do painel: serviços e categorias

Acesso: Perfis `staff` ou `admin` com a permissão `services`.

#### `GET /api/admin/services`

Lista os serviços (UC14).

- Entrada: `type, includeInactive, search`
- Resposta: **200** lista paginada, em ordem alfabética, de `id`, `type`, `name`, `description` (ou `null`), `category` (`id` e `name`, ou `null`), `avgDurationMinutes`, `pricingMode` (ou `null`), `fixedPrice` (ou `null`), `startingPrice` (o menor valor por porte, ou `null`), `isActive`, `isCategoryActive` (ou `null`) e `updatedAt`. O serviço de categoria inativa consta na lista (RN031).

#### `GET /api/admin/services/:id`

Detalha um serviço, com valores e vínculos.

- Entrada: Nenhuma.
- Resposta: **200** os campos da lista e `imageUrl` (ou `null`), `prices` (um valor por porte, com as chaves `small`, `medium`, `large` e `extra_large`, ou `null`), `additionalIds` (principal) e `mainServiceIds` (adicional), vazios no tipo que não os tem.

#### `POST /api/admin/services`

Cadastra um serviço (UC13).

- Entrada: `type*, name*, avgDurationMinutes*`; Principal e complementar: `categoryId*, description*, pricingMode*`, `fixedPrice*` ou os quatro `prices*`, conforme a precificação, e `imagePath`; Principal: `additionalIds`; Adicional: `fixedPrice*, mainServiceIds`.
- Resposta: **201** serviço criado e ativo; 409 `NAME_IN_USE`.

#### `PATCH /api/admin/services/:id`

Edita, desativa ou reativa um serviço.

- Entrada: Os campos do cadastro e `isActive`.
- Resposta: **200** serviço atualizado; 409 `NAME_IN_USE`.

#### `DELETE /api/admin/services/:id`

Exclui um serviço por exclusão lógica (RN030).

- Entrada: Nenhuma.
- Resposta: **204** serviço excluído.

#### `POST /api/admin/services/image`

Envia a imagem de um serviço.

- Entrada: Arquivo em `multipart/form-data`.
- Resposta: **201** caminho e endereço da imagem; 400 formato ou tamanho inválido.

#### `GET /api/admin/categories`

Lista as categorias.

- Entrada: `includeInactive`
- Resposta: **200** lista paginada, em ordem alfabética, de `id`, `name`, `description`, `isActive` e `updatedAt`.

#### `POST /api/admin/categories`

Cadastra uma categoria (UC15).

- Entrada: `name*, description*`
- Resposta: **201** categoria criada e ativa; 409 `NAME_IN_USE`.

#### `PATCH /api/admin/categories/:id`

Edita, desativa ou reativa uma categoria (UC15).

- Entrada: `name, description, isActive`
- Resposta: **200** categoria atualizada; 409 `NAME_IN_USE`.
