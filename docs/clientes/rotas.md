---
titulo: Telas e rotas – Clientes e veículos
assunto: clientes
origem: Documentação de Arquitetura de Software, seção 3.2 (Quadros 3 e 4) e Apêndice A
---

# Telas e rotas: Clientes e veículos

Valem para todas as rotas, sem repetição abaixo ([../padroes/api.md](../padroes/api.md)): erros comuns 400, 401, 403 e 404 no formato Problem Details; parâmetros `page` e `pageSize` em toda listagem; `updatedAt` obrigatório em `PATCH` e `PUT`, com 409 `VERSION_CONFLICT`. Campos com `*` são obrigatórios.

## Telas

| Rota | Tela | Acesso | Casos de uso |
|---|---|---|---|
| `/profile` | Área do cliente: dados da conta e veículos | Cliente | UC04, UC05 |
| `/admin/clients` | Clientes e veículos | permissão `clients` | UC16, UC17, UC18 |

Proteção das páginas: [../acesso/autenticacao.md](../acesso/autenticacao.md).

## API

### Rotas do cliente: conta e veículos

Acesso: Perfil `client`; opera só sobre os dados do cliente da sessão (RS009).

#### `GET /api/me/profile`

Dados da conta (UC04).

- Entrada: Nenhuma.
- Resposta: **200** nome, sobrenome, e-mail e telefone.

#### `PATCH /api/me/profile`

Altera os dados da conta.

- Entrada: `firstName, lastName, phone`
- Resposta: **200** dados atualizados.

#### `GET /api/me/vehicles`

Lista os veículos vinculados à conta do cliente.

- Entrada: Nenhuma.
- Resposta: **200** lista paginada de veículos, com tipo e porte.

#### `GET /api/me/vehicles/lookup`

Consulta uma placa antes do cadastro (UC05).

- Entrada: `plate*`
- Resposta: **200** tipo, marca, modelo, cor e ano do veículo, se a placa já estiver cadastrada, ou resposta vazia; nunca devolve dados de clientes.

#### `POST /api/me/vehicles`

Cadastra um veículo ou vincula à conta o veículo de uma placa já cadastrada (UC05).

- Entrada: `plate*`; Placa nova: `type*, brand*, model*, color*, year*`.
- Resposta: **201** veículo criado ou vinculado, com o porte definido; 409 `VEHICLE_ALREADY_LINKED`.

#### `PATCH /api/me/vehicles/:id`

Edita um veículo do cliente (UC05).

- Entrada: `type, plate, brand, model, color, year`
- Resposta: **200** veículo atualizado, com o porte redefinido se o tipo mudar; 409 `VEHICLE_SHARED` se o veículo estiver vinculado a outra conta; `PLATE_IN_USE`.

### Rotas do painel: clientes e veículos

Acesso: Perfis `staff` ou `admin` com a permissão `clients`.

#### `GET /api/admin/clients`

Lista e busca clientes (UC17).

- Entrada: `search, page, pageSize`
- Resposta: **200** lista paginada de clientes.

#### `GET /api/admin/clients/:id`

Detalha um cliente.

- Entrada: Nenhuma.
- Resposta: **200** dados da conta.

#### `GET /api/admin/clients/:id/vehicles`

Lista os veículos do cliente.

- Entrada: Nenhuma.
- Resposta: **200** lista paginada de veículos, com tipo e porte.

#### `POST /api/admin/clients`

Cadastra um cliente (UC16).

- Entrada: `email*, firstName*, lastName*, phone*, password*`
- Resposta: **201** cliente criado, com troca de senha pendente; 409 `EMAIL_IN_USE`.

#### `PATCH /api/admin/clients/:id`

Edita os dados do cliente.

- Entrada: `firstName, lastName, phone`
- Resposta: **200** cliente atualizado.

#### `DELETE /api/admin/clients/:id`

Exclui a conta do cliente por exclusão lógica; veículos e agendamentos são preservados (RN030).

- Entrada: Nenhuma.
- Resposta: **204** conta excluída.

#### `GET /api/admin/vehicles/lookup`

Consulta uma placa antes do cadastro (UC18).

- Entrada: `plate*`
- Resposta: **200** tipo, marca, modelo, cor e ano do veículo, se a placa já estiver cadastrada, ou resposta vazia.

#### `POST /api/admin/clients/:id/vehicles`

Cadastra um veículo para o cliente ou vincula o veículo de uma placa já cadastrada (UC18).

- Entrada: `plate*`; Placa nova: `type*, brand*, model*, color*, year*`.
- Resposta: **201** veículo criado ou vinculado, com o porte definido; 409 `VEHICLE_ALREADY_LINKED`.

#### `PATCH /api/admin/vehicles/:id`

Edita um veículo, inclusive o vinculado a mais de uma conta (UC18).

- Entrada: `type, plate, brand, model, color, year`
- Resposta: **200** veículo atualizado, com o porte redefinido se o tipo mudar; 409 `PLATE_IN_USE`.
