---
titulo: Telas e rotas – Acesso
assunto: acesso
origem: Documentação de Arquitetura de Software, seção 3.2 (Quadros 3 e 4) e Apêndice A
---

# Telas e rotas: Acesso

Valem para todas as rotas, sem repetição abaixo ([../padroes/api.md](../padroes/api.md)): erros comuns 400, 401, 403 e 404 no formato Problem Details; parâmetros `page` e `pageSize` em toda listagem; `updatedAt` obrigatório em `PATCH` e `PUT`, com 409 `VERSION_CONFLICT`. Campos com `*` são obrigatórios.

## Telas

| Rota | Tela | Acesso | Casos de uso |
|---|---|---|---|
| `/register` | Cadastro de cliente | Visitante | UC02 |
| `/login` | Login único, de clientes e de funcionários | Visitante | UC03, UC08 |
| `/set-password` | Troca de senha no primeiro acesso | Cliente ou funcionário com senha inicial | UC03, UC08 |

Proteção das páginas: [../acesso/autenticacao.md](../acesso/autenticacao.md).

## API

### Rotas de autenticação

Acesso: Cadastro e login são públicos; as demais exigem sessão válida.

#### `POST /api/auth/register`

Cria a conta de cliente (UC02).

- Entrada: `firstName*, lastName*, email*, phone*, password*`
- Resposta: **201** conta criada; 409 `EMAIL_IN_USE`.

#### `POST /api/auth/login`

Inicia a sessão de cliente ou de funcionário (UC03, UC08).

- Entrada: `email*, password*`
- Resposta: **200** dados do usuário, com o perfil em `profile`, `mustChangePassword` e permissões; 401 `INVALID_CREDENTIALS`; 403 `ACCOUNT_INACTIVE`; 429 `ACCOUNT_LOCKED`.

#### `POST /api/auth/logout`

Encerra a sessão.

- Entrada: Nenhuma.
- Resposta: **204** sem conteúdo.

#### `GET /api/auth/me`

Devolve o usuário da sessão e suas permissões.

- Entrada: Nenhuma.
- Resposta: **200** perfil, nome, `mustChangePassword` e lista de permissões.

#### `POST /api/auth/change-password`

Troca a senha, inclusive no primeiro acesso.

- Entrada: `currentPassword*, newPassword*`
- Resposta: **204** senha alterada; 400 senha nova igual à atual ou fora do tamanho mínimo; 401 senha atual incorreta.
