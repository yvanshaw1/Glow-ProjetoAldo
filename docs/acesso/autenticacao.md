---
titulo: Autenticação, perfis e autorização
assunto: acesso
origem: Documentação de Arquitetura de Software, seções 3.2 (Quadro 5), 4.3 (Quadros 9 e 10) e 5.2 (Quadro 28)
relacionados: [RN022, RN023, RN024, RN025, RN026, RN027, RN029, RS001, RS004, RS005, RS006, RS007, RS008, RS009, RS010, RS011, 0046, 0047, 0048]
---

# Autenticação, perfis e autorização

## Sessão

- Supabase Auth com e-mail e senha. O navegador nunca fala com o Supabase: o login é `POST /api/auth/login`, que valida no Supabase Auth e grava a sessão em cookies com `@supabase/ssr`.
- Token de acesso de 1 hora mais token de renovação; o servidor renova sozinho. A sessão vale até o logout ou a revogação no Supabase Auth, sem limite de duração (o limite do Supabase Auth exigiria configuração no painel, decisão 0044); os cookies valem 400 dias, valor fixo do `@supabase/ssr`. Cookies `HttpOnly`, `Secure`, `SameSite=Lax`.
- O logout encerra no Supabase Auth a sessão deste navegador, sem afetar as de outros aparelhos, e apaga os cookies (RS007). Ele não exige sessão: sem ela, sem perfil, com a conta desativada ou com a senha inicial pendente, responde 204 do mesmo jeito.
- A troca de senha mantém a sessão deste navegador, renovada nos cookies, e encerra as dos outros aparelhos da conta (decisão 0048).
- Login único para clientes e funcionários (RN029): depois de validar, o backend procura o id da conta em `clients` e em `staff`; a resposta traz o perfil, e a interface manda o cliente ao portal e o funcionário ou o admin ao painel.
- Conta desativada (`staff.is_active` falso) ou excluída (`clients.deleted_at`) não inicia sessão (RN026, RN030). Com a senha certa, a desativada recebe 403 `ACCOUNT_INACTIVE`, e a excluída, ou a conta do Supabase Auth sem perfil, recebe o mesmo 401 `INVALID_CREDENTIALS` do e-mail inexistente (RS005). Nos dois casos, a sessão aberta pela validação da senha é encerrada. A conta sem perfil gera uma linha `warn` no registro.
- Falha sempre responde 401 `INVALID_CREDENTIALS`, sem dizer se o e-mail existe (RS005).
- Bloqueio: 5 falhas seguidas para o mesmo e-mail, no login ou na senha atual da troca de senha, bloqueiam as duas rotas por 15 minutos, com 429 `ACCOUNT_LOCKED` e `Retry-After` em segundos; a senha certa zera o contador (RS006). Regras e funções: [dados.md](dados.md).

## Perfis e contas

Cada pessoa tem uma conta no Supabase Auth; os dados do perfil ficam em tabela própria, com o mesmo id. Toda conta é criada pelo servidor com a chave de serviço (`auth.admin.createUser`), já com o e-mail confirmado; a aplicação não usa o cadastro público do Supabase Auth, então nenhum e-mail é enviado (decisão 0015) e não há confirmação de e-mail (decisão 0044). O Supabase Auth não aceita e-mail repetido, então o e-mail não se repete entre clientes e funcionários (RN022).

O cadastro pelo portal não inicia sessão nem altera a que existir. Se a gravação do perfil falhar, a conta recém-criada no Supabase Auth é removida.

| Perfil | Tabela | Como a conta nasce | Acesso |
|---|---|---|---|
| `client` | `clients` | cadastro no portal (UC02) ou pelo painel (UC16) | páginas do cliente e `/api/me` |
| `staff` | `staff` | pelo painel, com a permissão `staff` (UC19) | páginas e rotas permitidas pelo cargo |
| `admin` | `staff` com `is_admin` | script de dados iniciais | tudo; oculto nas listagens (RN027) |

Senha inicial: contas criadas pelo painel ficam com `must_change_password`. Enquanto a marca existir, toda rota com sessão responde 403 `PASSWORD_CHANGE_REQUIRED`, exceto a troca de senha, `GET /api/auth/me` e o logout, e a interface leva a `/set-password`. A nova senha precisa ser diferente da inicial; a troca remove a marca (RN023, RS004).

## Autorização

Guards em `src/server/auth/guards.ts`, chamados na camada de rota em toda requisição:

- `requireUser`: sessão válida, conferida no Supabase Auth a cada requisição (decisão 0046), e conta ativa, sem troca de senha pendente (RS001, RS004, RN026); só o `me` e a troca de senha aceitam a senha pendente;
- `requireClient`: perfil `client`; nas rotas `/api/me`, o id do cliente vem sempre da sessão, e registro de outro cliente responde 404 (RS009);
- `requirePermission(key)`: perfil `staff` ou `admin` com a permissão da página; cliente recebe 403 (RS008, RS010).

Perfil, situação, cargo e permissões são lidos do banco a cada requisição, nunca do token: desativação e mudança de cargo valem na requisição seguinte (RS011). A barra do painel é montada com as permissões de `GET /api/auth/me`; o admin recebe todas.

Desativada depois do login, a conta recebe 403 `ACCOUNT_INACTIVE` em toda rota com sessão, até o logout; excluída ou sem perfil, recebe 401 `UNAUTHENTICATED`.

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
| Visitante em `/profile`, `/booking`, `/appointments` ou `/admin*` | vai a `/login?next=<página pedida>` e, autenticado, volta a ela se o perfil puder (RF010); o `next` só vale com caminho interno |
| Login em `/login` | cliente vai ao portal; funcionário e admin, à primeira página permitida do painel |
| Cliente em `/admin*` | vai à página inicial do portal (RS010) |
| Funcionário em página exclusiva de cliente | vai ao painel |
| Funcionário sem a permissão da página | vai à primeira página permitida (RN025) |
| Troca de senha pendente em qualquer página restrita | vai a `/set-password` (RS004) |
| Usuário autenticado em `/login` ou `/register` | vai à página inicial da sua área |
