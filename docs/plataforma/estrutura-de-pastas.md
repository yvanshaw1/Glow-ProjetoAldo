---
titulo: Estrutura de pastas do repositório
assunto: plataforma
origem: Documentação de Arquitetura de Software, seções 3.1 e 4.1, refinadas na decisão 0036
relacionados: [RNF013, RS008, RS016]
---

# Estrutura de pastas

Uma única aplicação Next.js com um único `package.json` (decisões 0001 e 0002): páginas, API e código compartilhado em `src/`; banco em `supabase/`; testes em `tests/`; orientação da IA nas pastas da ICM. Nomes de pastas e arquivos de código em inglês, `kebab-case`.

```
App/
├── AGENTS.md · CLAUDE.md · README.md
├── guia/ · workflows/ · docs/ · memoria/ · setup/ · tools/ · _templates/   orientação da IA (ICM)
├── .claude/settings.json            permissões do agente
├── .github/                         workflows/ci.yml, modelos de PR e de issue, CODEOWNERS
├── public/                          estáticos: logo, favicon, imagem da página inicial
├── src/
│   ├── app/                         rotas do Next.js; a pasta segue a URL
│   │   ├── (portal)/                page.tsx (/), services/, register/, login/, set-password/,
│   │   │                            profile/, booking/, appointments/; layout.tsx do portal
│   │   ├── (admin)/admin/           page.tsx (dashboard), appointments/, services/, clients/,
│   │   │                            staff/, settings/; layout.tsx com a navegação por permissões
│   │   ├── api/                     auth/, public/, me/, admin/; cada endpoint é um route.ts
│   │   ├── layout.tsx · globals.css (tema com @theme) · not-found.tsx · error.tsx
│   ├── components/
│   │   ├── ui/                      gerados pelo shadcn/ui
│   │   ├── shared/                  usados pelo portal e pelo painel
│   │   ├── portal/<módulo>/         ex.: portal/appointments/booking-wizard.tsx
│   │   └── admin/<módulo>/          ex.: admin/dashboard/revenue-chart.tsx
│   ├── hooks/                       hooks de cliente reutilizáveis
│   ├── lib/                         api-client.ts · utils.ts (cn() do shadcn)
│   ├── shared/                      roda no navegador e no servidor
│   │   ├── validation/              esquemas Zod por módulo (normalizam e validam)
│   │   ├── format/                  exibição de moeda, telefone, placa, CNPJ e datas (Intl)
│   │   ├── errors/                  catálogo de códigos e mensagens
│   │   ├── constants/               enums como listas `as const`, rótulos em português, limites
│   │   └── api/                     tipos das respostas e da paginação
│   ├── server/                      só servidor: todo arquivo começa com import 'server-only'
│   │   ├── auth/                    session.ts · guards.ts · login-attempts.ts
│   │   ├── http/                    handler.ts · logger.ts · respond.ts
│   │   ├── rules/                   funções puras: pricing, status-transitions, scheduling, editing
│   │   ├── services/                um arquivo por módulo: busca, chama as regras, grava
│   │   ├── repositories/            um arquivo por tabela ou grupo de tabelas
│   │   └── supabase/                clientes (chave de serviço e sessão) e envio ao Storage
│   └── proxy.ts                     proteção das páginas (Next.js 16)
├── supabase/
│   ├── config.toml                  criado pelo supabase init
│   ├── migrations/
│   ├── seed.sql                     dados obrigatórios
│   ├── seed-demo.sql                dados fictícios de demonstração (opcional)
│   └── scripts/create-admin.mjs     conta de administrador, com SEED_ADMIN_* do ambiente
├── tests/
│   ├── rules/                       espelha src/server/rules
│   └── validation/                  espelha src/shared/validation
└── raiz: package.json (engines: Node 24) · package-lock.json · next.config.ts · tsconfig.json ·
    eslint.config.mjs · prettier.config.mjs · .prettierignore · vitest.config.ts ·
    components.json · .env.example · .gitignore · .gitattributes (eol=lf) ·
    Dockerfile · compose.yaml · .dockerignore (execução em contêiner)
```

## Esqueleto

As pastas acima já existem no repositório, e cada pasta de `src/`, `supabase/` e `tests/` tem um `README.md` com a função dela, o que vai ali e o que não vai. Antes de criar um arquivo, ler o README da pasta de destino; se ele não cobrir o arquivo, é lacuna, tratada como em `guia/regras.md`.

- Em `src/app/api/`, há uma pasta para cada endpoint de `docs/*/rotas.md`, com `:id` virando `[id]`: o `route.ts` de `GET /api/me/vehicles/:id` vai em `src/app/api/me/vehicles/[id]/`. O README de cada uma lista os métodos, o guard e o serviço. Rota nova: pasta nova com README e `rotas.md` atualizado no mesmo PR.
- O README fica quando a pasta ganha código e é atualizado no mesmo PR que mudar a função da pasta. Pasta nova sempre leva README.
- `public/` e `supabase/migrations/` não têm README: tudo em `public/` é publicado no site, e a CLI do Supabase lê todos os arquivos de `migrations/`. Essas duas guardam um `.gitkeep` até o primeiro arquivo, e as orientações delas estão neste arquivo e no README de `supabase/`. Em `public/` vão só arquivos estáticos referenciados pelo código (logo, favicon, imagem da página inicial), nunca imagens de serviços (vão para o Storage) nem nada privado.
- Não criar pasta fora desta árvore sem atualizar este arquivo no mesmo PR; mudança estrutural também passa por `workflows/procedimentos/decisao.md`.

## Regras de dependência

```
components, hooks → lib/api-client → (HTTP) → app/api/**/route.ts
route.ts → server/auth, server/http, services
services → rules (puras) + repositories → server/supabase → PostgreSQL
shared ← usado por todos; não importa nada de server/ nem do Supabase
```

- `src/server/` nunca chega ao navegador: o `import 'server-only'` quebra o build se um componente de cliente o importar, protegendo a chave de serviço (RS016) e as regras (RS008).
- `src/server/rules/` não importa repositório, Supabase, relógio nem ambiente; recebe tudo por parâmetro (`docs/agendamento/calculos.md`).
- Páginas não acessam Supabase nem banco, nem pelo servidor: os dados passam pela API (RNF013).
- Sem pasta genérica de utilitários: cada função mora no módulo que a usa; o único `utils.ts` é o `cn()` do shadcn.
- Nomes de tabelas e colunas só existem em `src/server/repositories/`: cada repositório declara o tipo das linhas que lê e as converte para os tipos do código.
- Componentes de `ui/` são gerados pelo shadcn; ajustes de aparência vão no tema, e componentes de negócio nunca ficam ali.
- Teste espelha o código: `tests/rules/pricing.test.ts` testa `src/server/rules/pricing.ts`.

## Equivalência com a estrutura clássica front, back e banco

| Estrutura clássica | Neste projeto | Motivo |
|---|---|---|
| `frontend/` e `backend/` com `package.json` próprios | uma aplicação: `src/app` com páginas e API | decisões 0001 e 0002 |
| `controllers/` | `src/app/api/**/route.ts` | o route handler é o controller |
| `services/` com a lógica | `src/server/services/` (orquestração) e `src/server/rules/` (regras puras) | regras testáveis sem banco (decisão 0035) |
| `repositories/` | `src/server/repositories/` | igual |
| `models/` | migrations (esquema), tipos das linhas nos repositórios, esquemas Zod e tipos de `src/shared` | sem ORM (decisão 0006) |
| `providers/` | `src/server/supabase/` | único provedor externo; sem e-mail (decisão 0015) |
| `shared/` do back (erros, middlewares) | `src/server/http/`, `src/server/auth/`, `src/proxy.ts` | |
| `services/` do front (HTTP) | `src/lib/api-client.ts` | |
| `features/` do front | `components/portal/<módulo>` e `components/admin/<módulo>` | as páginas já se agrupam por rota; módulo igual ao do backend |
| `shared/` na raiz (types, utils, constants) | `src/shared/` (api, format, constants, validation, errors) | |
| `app.ts` | `next.config.ts` (cabeçalhos de segurança, imagens) e `src/proxy.ts` | não há servidor para configurar |
| `database/migrations` e `seeds` | `supabase/migrations`, `seed.sql`, `seed-demo.sql` | Supabase CLI |
| `docker-compose.yml` e `Dockerfile` | `compose.yaml` e `Dockerfile` na raiz, só para executar a aplicação compilada em contêiner | a hospedagem continua na Vercel e o banco no Supabase (decisões 0030 e 0038) |
| `infrastructure/.github` | `.github/` na raiz | |
