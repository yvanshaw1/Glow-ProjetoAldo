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
| Regras | `src/server/rules/` | funções puras de preço, status, datas e edição | banco, relógio, ambiente |
| Repositório | `src/server/repositories/` | lê e grava com `supabase-js`; converte nomes do banco para os do código | regra de negócio |
| Apoio | `src/server/auth/`, `src/server/http/`, `src/shared/` | sessão e permissões, tratamento único, esquemas e mensagens | – |

```
src/server/                    todo arquivo começa com import 'server-only'
├── auth/          session.ts (sessão e perfil), guards.ts (requireUser, requireClient, requirePermission), login-attempts.ts
├── http/          handler.ts (tratamento único e requestId), logger.ts (registro com níveis), respond.ts (JSON e paginação)
├── rules/         pricing.ts, status-transitions.ts, scheduling.ts, editing.ts
├── services/      um arquivo por módulo: auth.ts, catalog.ts, clients.ts, vehicles.ts, appointments.ts, dashboard.ts, staff.ts, roles.ts, settings.ts
├── repositories/  um arquivo por tabela ou grupo de tabelas
└── supabase/      clientes do Supabase (chave de serviço para dados; @supabase/ssr para a sessão) e envio ao Storage
```

Endpoints em `src/app/api/`, com a pasta seguindo a URL: `POST /api/me/appointments/:id/cancel` é `src/app/api/me/appointments/[id]/cancel/route.ts`, que exporta a função `POST`.

Fluxo: a rota identifica o usuário e verifica perfil e permissão → valida parâmetros e corpo → chama o serviço com os dados validados e o usuário → o serviço busca os dados nos repositórios, aplica as funções puras e grava → a rota responde em JSON ou o tratamento único converte o erro. Árvore completa e regras de dependência: `docs/plataforma/estrutura-de-pastas.md`.

## Módulos

| Módulo | Assunto em `docs/` | Casos de uso |
|---|---|---|
| `auth` | `acesso` | UC02, UC03, UC08 |
| `catalog` | `catalogo` | UC01, UC13, UC14, UC15 |
| `clients`, `vehicles` | `clientes` | UC04, UC05, UC16, UC17, UC18 |
| `appointments`, `dashboard` | `agendamento` | UC06, UC07, UC09, UC10, UC11, UC12, UC25, UC26 |
| `staff`, `roles` | `equipe` | UC19, UC20, UC21 |
| `settings` | `configuracoes` | UC22, UC23, UC24 |

As regras de preço, status, datas e edição são funções puras em `src/server/rules/`: `docs/agendamento/calculos.md`.

## Gravações e consultas

- Gravação em mais de uma tabela é feita por função SQL, chamada pelo repositório via `rpc`, numa transação (RNF010): `create_appointment`, `update_appointment`, `reschedule_appointment`, `save_service`, `save_role`, `link_vehicle`.
- Cadastro de conta: cria no Supabase Auth e depois o perfil; se o perfil falhar, remove a conta recém-criada.
- Dados relacionados na mesma consulta (seleção aninhada do `supabase-js`) ou em lote (`in`); nunca uma consulta por item de lista (N+1).
- Registros com exclusão lógica (`deleted_at`) ficam fora de toda listagem e seleção.

## Erros

- Erro previsto: `throw new AppError(code)`, com código do catálogo de `src/shared/errors`; só o tratamento único (`src/server/http/handler.ts`) o converte em resposta.
- Nenhum `catch` vazio; capturar só para tratar ou para acrescentar contexto e relançar.
- O `supabase-js` devolve o erro no resultado em vez de lançar: conferir `error` em toda chamada; o repositório converte em falha da aplicação (violação de `uq_vehicles_plate` vira `PLATE_IN_USE`), e o detalhe técnico vai só para o registro.
- Qualquer outra falha vira 500 genérico com `requestId` (RS017).

## Registro (`src/server/http/logger.ts`)

Uma linha JSON por evento na saída padrão, lida nos registros da Vercel, com nível, `requestId`, rota, status, usuário e duração. O `requestId` é gerado no início da requisição e incluído em todas as linhas dela via `AsyncLocalStorage` do Node.js.

| Nível | Quando |
|---|---|
| `error` | falha inesperada que vira 500, com o rastro de execução |
| `warn` | anomalia tratada: bloqueio de login, conflito de versão, origem recusada |
| `info` | evento de negócio: login, agendamento criado, editado, cancelado ou concluído, alteração de cargo |
| `debug` | detalhe de investigação, só em desenvolvimento |

Nunca registrar senha, token, cookie, cabeçalho de autorização nem o corpo das rotas de autenticação (RS018).
