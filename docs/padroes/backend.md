---
titulo: Padrões de backend
origem: Documentação de Arquitetura de Software, seções 4 e 6.4
relacionados: [RNF010, RNF013, RS008, RS017, RS018]
---

# Padrões de backend

A API roda nas rotas do próprio Next.js e é a única parte que acessa banco, autenticação e arquivos. Contrato e convenções HTTP: `docs/padroes/api.md`. Sessão e guards: `docs/acesso/autenticacao.md`.

## Camadas

Cada camada só conhece a de baixo.

| Camada | Onde | Faz | Não faz |
|---|---|---|---|
| Rota | `src/app/api/**/route.ts` | identifica o usuário, aplica o guard, valida com Zod, chama o serviço, responde | regra de negócio |
| Serviço | `src/server/services/` | aplica as regras da análise: busca os dados, chama as funções puras, grava | HTTP ou SQL |
| Regras | `src/server/rules/` | funções puras de preço, status, datas, edição e da análise do dashboard | banco, relógio, ambiente |
| Repositório | `src/server/repositories/` | lê e grava com `supabase-js`; converte nomes do banco para os do código | regra de negócio |
| Apoio | `src/server/auth/`, `src/server/http/`, `src/server/ai/`, `src/shared/` | sessão e permissões, tratamento único, adaptador do serviço de IA, esquemas e mensagens | – |

```
src/server/                    todo arquivo começa com import 'server-only'
├── auth/          session.ts (sessão e perfil), guards.ts (requireUser, requireClient, requirePermission), login-attempts.ts, accounts.ts (criação e remoção de contas no Supabase Auth)
├── http/          handler.ts (tratamento único e requestId), logger.ts (registro com níveis), respond.ts (JSON e paginação)
├── rules/         pricing.ts, status-transitions.ts, scheduling.ts, editing.ts, dashboard-analysis.ts
├── services/      um arquivo por módulo: auth.ts, catalog.ts, clients.ts, vehicles.ts, appointments.ts, dashboard.ts, staff.ts, roles.ts, settings.ts
├── repositories/  um arquivo por tabela ou grupo de tabelas
├── supabase/      clientes do Supabase (chave de serviço para dados; @supabase/ssr para a sessão) e envio ao Storage
└── ai/            adaptador do serviço de IA, com fetch e sem SDK (docs/plataforma/servico-de-ia.md)
```

Endpoints em `src/app/api/`, com a pasta seguindo a URL: `POST /api/me/appointments/:id/cancel` é `src/app/api/me/appointments/[id]/cancel/route.ts`, que exporta a função `POST`.

Fluxo: a rota identifica o usuário e verifica perfil e permissão → valida parâmetros e corpo → chama o serviço com os dados validados e o usuário → o serviço busca os dados nos repositórios, aplica as funções puras e grava → a rota responde em JSON ou o tratamento único converte o erro. Árvore completa e regras de dependência: `docs/plataforma/estrutura-de-pastas.md`.

## Módulos

| Módulo | Assunto em `docs/` | Casos de uso |
|---|---|---|
| `auth` | `acesso` | UC02, UC03, UC08 |
| `catalog` | `catalogo` | UC01, UC13, UC14, UC15 |
| `clients`, `vehicles` | `clientes` | UC04, UC05, UC16, UC17, UC18 |
| `appointments`, `dashboard` | `agendamento` | UC06, UC07, UC09, UC10, UC11, UC12, UC25, UC26, UC27 |
| `staff`, `roles` | `equipe` | UC19, UC20, UC21 |
| `settings` | `configuracoes` | UC22, UC23, UC24 |

As regras de preço, status, datas, edição e da análise do dashboard são funções puras em `src/server/rules/`: `docs/agendamento/calculos.md`.

## Gravações e consultas

- Gravação em mais de uma tabela é feita por função SQL, chamada pelo repositório via `rpc`, numa transação (RNF010): `create_appointment`, `update_appointment`, `reschedule_appointment`, `save_service`, `save_role`, `link_vehicle`.
- O controle de tentativas de login também usa funções SQL (`reserve_login_attempt` e `release_login_attempt`), para contar sem corrida entre requisições simultâneas (decisão 0047).
- Cadastro de conta: cria no Supabase Auth com `auth.admin.createUser` e o e-mail confirmado, nunca com `signUp`, e depois o perfil; se o perfil falhar, remove a conta recém-criada. A violação de `uq_clients_email` na gravação do perfil vira `EMAIL_IN_USE`, depois de removida a conta; se a remoção falhar, o id da conta vai ao registro numa linha `error`.
- Dados relacionados na mesma consulta (seleção aninhada do `supabase-js`) ou em lote (`in`); nunca uma consulta por item de lista (N+1).
- Registros com exclusão lógica (`deleted_at`) ficam fora de toda listagem e seleção.

## Erros

- Toda rota exporta os métodos por `handleRoute`, de `src/server/http/handler.ts`: `export const POST = handleRoute(async ({ request, params, body }) => ...)`. Nas gravações, ele confere origem, tamanho e formato antes da rota (`api.md`, Validação) e entrega o corpo já convertido; em toda resposta, envia `Cache-Control: no-store` (`api.md`); a rota o valida com `schema.parse`, e o `ZodError` vira 400 `VALIDATION_ERROR`. O sucesso responde por `src/server/http/respond.ts`: `respondOk`, `respondCreated`, `respondNoContent` e `respondPage`. As rotas ficam no ambiente Node.js, o padrão, porque o registro usa `AsyncLocalStorage`.
- Erro previsto: `throw new AppError(code)`, com código do catálogo de `src/shared/errors`; só o tratamento único (`src/server/http/handler.ts`) o converte em resposta.
- Nenhum `catch` vazio; capturar só para tratar ou para acrescentar contexto e relançar.
- O `supabase-js` devolve o erro no resultado em vez de lançar: conferir `error` em toda chamada; o repositório converte em falha da aplicação (violação de `uq_vehicles_plate` vira `PLATE_IN_USE`), e o detalhe técnico vai só para o registro.
- Falha do serviço de IA vira 503 `AI_UNAVAILABLE`, com o motivo só no registro (`docs/plataforma/servico-de-ia.md`).
- Qualquer outra falha vira 500 genérico com `requestId` (RS017).

## Registro (`src/server/http/logger.ts`)

Uma linha JSON por evento na saída padrão, lida nos registros da Vercel. O tratamento único grava uma linha ao fim de cada requisição da API, com nível, `requestId`, método, caminho sem a query string, status, código do erro, usuário e duração; os serviços gravam linhas próprias para os eventos de negócio. O `requestId` é gerado no início da requisição e incluído em todas as linhas dela via `AsyncLocalStorage` do Node.js, assim como o id do usuário (`userId`), depois que o guard identifica a sessão.

| Nível | Quando |
|---|---|
| `error` | falha inesperada que vira 500, com o rastro de execução |
| `warn` | anomalia tratada: bloqueio de login, conflito de versão, origem recusada, conta do Supabase Auth sem perfil, Supabase Auth indisponível, falha do serviço de IA |
| `info` | requisição concluída sem falha nem anomalia; evento de negócio: login, agendamento criado, editado, cancelado ou concluído, alteração de cargo, análise do dashboard gerada |
| `debug` | detalhe de investigação, só em desenvolvimento |

Nunca registrar senha, token, cookie, cabeçalho de autorização nem o corpo das rotas de autenticação (RS018). Do erro do banco, que não é `Error`, o registro guarda só o código e a mensagem: o detalhe pode citar a linha recusada, com dados do corpo.

## Cabeçalhos de segurança (`next.config.ts`)

Enviados em todas as respostas, das páginas, da API e dos arquivos estáticos:

| Cabeçalho | Valor |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000` (dois anos) |
| `Content-Security-Policy` | `frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'` |

A política de conteúdo não restringe os scripts, o que exigiria um nonce a cada requisição e páginas sempre dinâmicas; contra XSS, vale o escape do React (RS014).
