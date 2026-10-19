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

Acesso: Cadastro, login e logout são públicos; `me` e troca de senha exigem sessão válida e aceitam a senha inicial pendente.

#### `POST /api/auth/register`

Cria a conta de cliente (UC02).

- Entrada: `firstName*, lastName*, email*, phone*, password*`
- Resposta: **201** conta criada; 409 `EMAIL_IN_USE`.

#### `POST /api/auth/login`

Inicia a sessão de cliente ou de funcionário (UC03, UC08).

- Entrada: `email*` (formato de RN035), `password*` (só obrigatória e com até 72 bytes, como digitada, sem as regras de composição do RS003)
- Resposta: **200** usuário da sessão: `profile` (`client`, `staff` ou `admin`), `firstName`, `lastName`, `mustChangePassword` e `permissions` (na ordem de RN025; todas para o admin, nenhuma para o cliente); 401 `INVALID_CREDENTIALS`; 403 `ACCOUNT_INACTIVE`; 429 `ACCOUNT_LOCKED`.

#### `POST /api/auth/logout`

Encerra a sessão.

- Entrada: Nenhuma.
- Resposta: **204** sem conteúdo, também sem sessão.

#### `GET /api/auth/me`

Devolve o usuário da sessão e suas permissões.

- Entrada: Nenhuma.
- Resposta: **200** o mesmo corpo do login, lido do banco nesta requisição; 401 `UNAUTHENTICATED`; 403 `ACCOUNT_INACTIVE`.

#### `POST /api/auth/change-password`

Troca a senha, inclusive no primeiro acesso.

- Entrada: `currentPassword*, newPassword*`
- Resposta: **204** senha alterada; 400 senha nova igual à atual ou fora do tamanho mínimo; 401 senha atual incorreta.
