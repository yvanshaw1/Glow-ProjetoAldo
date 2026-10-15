---
titulo: Autenticação, perfis e autorização
assunto: acesso
origem: Documentação de Arquitetura de Software, seções 3.2 (Quadro 5), 4.3 (Quadros 9 e 10) e 5.2 (Quadro 28)
relacionados: [RN022, RN023, RN024, RN025, RN026, RN027, RN029, RS001, RS004, RS005, RS006, RS007, RS008, RS009, RS010, RS011]
---

# Autenticação, perfis e autorização

## Sessão

- Supabase Auth com e-mail e senha. O navegador nunca fala com o Supabase: o login é `POST /api/auth/login`, que valida no Supabase Auth e grava a sessão em cookies com `@supabase/ssr`.
- Token de acesso de 1 hora mais token de renovação; o servidor renova sozinho. Cookies `HttpOnly`, `Secure`, `SameSite=Lax`. Logout encerra a sessão no Supabase Auth e apaga os cookies (RS007).
- Login único para clientes e funcionários (RN029): depois de validar, o backend procura o id da conta em `clients` e em `staff`; a resposta traz o perfil, e a interface manda o cliente ao portal e o funcionário ou o admin ao painel.
- Conta desativada (`staff.is_active` falso) ou excluída (`clients.deleted_at`) não inicia sessão (RN026, RN030).
- Falha sempre responde 401 `INVALID_CREDENTIALS`, sem dizer se o e-mail existe (RS005).
- Bloqueio: 5 falhas seguidas para o mesmo e-mail bloqueiam por 15 minutos; resposta 429 `ACCOUNT_LOCKED` com `Retry-After` em segundos; login certo zera o contador (RS006).

### Tabela `login_attempts`

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `email` | `text` | PK | E-mail informado na tentativa. |
| `failed_count` | `integer` | Padrão: 0 | Falhas consecutivas; zerado no login bem-sucedido. |
| `locked_until` | `timestamptz` | Opcional | Fim do bloqueio temporário. |
| `updated_at` | `timestamptz` |  | Data da última tentativa. |

## Perfis e contas

Cada pessoa tem uma conta no Supabase Auth; os dados do perfil ficam em tabela própria, com o mesmo id. O Supabase Auth não aceita e-mail repetido, então o e-mail não se repete entre clientes e funcionários (RN022).

| Perfil | Tabela | Como a conta nasce | Acesso |
|---|---|---|---|
| `client` | `clients` | cadastro no portal (UC02) ou pelo painel (UC16) | páginas do cliente e `/api/me` |
| `staff` | `staff` | pelo painel, com a permissão `staff` (UC19) | páginas e rotas permitidas pelo cargo |
| `admin` | `staff` com `is_admin` | script de dados iniciais | tudo; oculto nas listagens (RN027) |

Senha inicial: contas criadas pelo painel ficam com `must_change_password`. Enquanto a marca existir, toda rota, exceto a de troca de senha, responde 403 `PASSWORD_CHANGE_REQUIRED`, e a interface leva a `/set-password`. A nova senha precisa ser diferente da inicial; a troca remove a marca (RN023, RS004).

## Autorização

Guards em `src/server/auth/guards.ts`, chamados na camada de rota em toda requisição:

- `requireUser`: sessão válida (RS001);
- `requireClient`: perfil `client`; nas rotas `/api/me`, o id do cliente vem sempre da sessão, e registro de outro cliente responde 404 (RS009);
- `requirePermission(key)`: perfil `staff` ou `admin` com a permissão da página; cliente recebe 403 (RS008, RS010).

Perfil, situação, cargo e permissões são lidos do banco a cada requisição, nunca do token: desativação e mudança de cargo valem na requisição seguinte (RS011). A barra do painel é montada com as permissões de `GET /api/auth/me`; o admin recebe todas.

| Permissão | Página | Rotas liberadas |
|---|---|---|
| `dashboard` | `/admin` | `/api/admin/dashboard` |
| `appointments` | `/admin/appointments` | `/api/admin/appointments` e consultas de apoio do formulário |
| `services` | `/admin/services` | `/api/admin/services` e `/api/admin/categories` |
| `clients` | `/admin/clients` | `/api/admin/clients` e `/api/admin/vehicles` |
| `staff` | `/admin/staff` | `/api/admin/staff` e `/api/admin/roles` |
| `settings` | `/admin/settings` | `/api/admin/settings` |

## Proteção das páginas (`src/proxy.ts`)

No Next.js 16 o arquivo é `src/proxy.ts` (decisão 0032). Ele valida a sessão, renova os cookies quando preciso e consulta o perfil. Organiza a navegação; quem decide o acesso aos dados é sempre a API.

| Situação | Comportamento |
|---|---|
| Visitante em `/profile`, `/booking`, `/appointments` ou `/admin*` | vai a `/login` e, autenticado, volta à página pedida se o perfil puder (RF010) |
| Login em `/login` | cliente vai ao portal; funcionário e admin, à primeira página permitida do painel |
| Cliente em `/admin*` | vai à página inicial do portal (RS010) |
| Funcionário em página exclusiva de cliente | vai ao painel |
| Funcionário sem a permissão da página | vai à primeira página permitida (RN025) |
| Troca de senha pendente em qualquer página restrita | vai a `/set-password` (RS004) |
| Usuário autenticado em `/login` ou `/register` | vai à página inicial da sua área |
