---
titulo: Infraestrutura, ambientes e CI
assunto: plataforma
origem: Documentação de Arquitetura de Software, seção 8 (Quadros 36 e 37)
relacionados: [RNF014, RNF015, RNF017, RS016, RS019, 0030, 0038, 0054]
---

# Infraestrutura, ambientes e CI

Quatro serviços em plano gratuito: GitHub (código e CI), Vercel (aplicação), Supabase (banco, autenticação e arquivos) e Groq (modelo de linguagem da análise do dashboard, [servico-de-ia.md](servico-de-ia.md)). Sem servidor próprio nem domínio, e a aplicação não é hospedada em contêineres: o Docker serve só para executá-la da mesma forma em qualquer máquina (Execução em contêiner).

## Ambientes

| Ambiente | Onde | Para quê |
|---|---|---|
| Desenvolvimento | `npm run dev` em `http://localhost:3000`, ou em contêiner com `docker compose up --build`, no mesmo endereço | codificar e testar localmente; o contêiner executa a aplicação compilada da mesma forma em qualquer máquina |
| Pré-visualização | Vercel, um endereço por pull request em `vercel.app` | conferir a alteração antes da revisão |
| Produção | Vercel, a partir da `main`, em `vercel.app` | demonstração e avaliação |

Todos usam o mesmo projeto do Supabase: toda migration precisa ser compatível com a versão em produção (`workflows/procedimentos/migration.md`).

## Variáveis de ambiente

Nenhuma usa o prefixo `NEXT_PUBLIC_`, então nenhuma chega ao navegador. O repositório tem só `.env.example`, com os nomes e sem valores; os valores ficam em `.env.local` (ignorado pelo Git e fora da imagem do contêiner) e na Vercel (RNF015, RS016). O código as lê na execução, durante a requisição, nunca na construção: a Vercel as fornece também no `next build`, mas a imagem do contêiner é construída sem elas, e um módulo ou página que dependa delas no build quebra o `docker compose up --build`.

| Variável | Sigilosa | Uso |
|---|---|---|
| `SUPABASE_URL` | não | endereço do projeto |
| `SUPABASE_ANON_KEY` | não | chave pública, usada pelo servidor no login e na validação da sessão |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | chave de serviço: leitura e gravação dos dados e criação de contas, só em `src/server` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | sim | conta de administrador, só para o script de dados iniciais |
| `AI_BASE_URL` | não | endereço do serviço de IA, no formato Chat Completions |
| `AI_MODEL` | não | modelo da análise do dashboard |
| `AI_API_KEY` | sim | chave do serviço de IA, só em `src/server/ai/` |

Sem as variáveis `AI_*`, a análise do dashboard responde indisponível, e o resto funciona (RNF017); valores e limites em [servico-de-ia.md](servico-de-ia.md).

O fuso da empresa não é variável de ambiente: é a constante `COMPANY_TIME_ZONE` (`America/Maceio`), em `src/shared/constants/time-zone.ts`, usada pelo navegador e pelo servidor (decisão 0053).

## Preparação do banco (uma vez)

1. Aplicar as migrations. A inicial cria os tipos, as tabelas, as restrições, os gatilhos, os índices, a RLS e o bucket `service-images` do Storage (leitura pública, gravação só pelo backend, até 2 MB, JPEG, PNG e WebP); cada função de gravação em várias tabelas entra depois, em migration própria, com a funcionalidade que a chama.
2. Carregar o `supabase/seed.sql` junto com a migration, com `npx supabase db push --include-seed`: quatro formas de pagamento sem ajuste, sete dias da semana e a linha de dados da empresa.
3. Rodar `node --env-file=.env.local supabase/scripts/create-admin.mjs`, que cria a conta de administrador no Supabase Auth e o registro em `staff` com `is_admin`, lendo `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` do ambiente.

Nada é configurado à mão no painel do Supabase (decisão 0044): a senha é exigida pelo esquema de `src/shared/validation`, as contas são criadas pelo servidor já com o e-mail confirmado, e o bucket vem da migration.

O arquivo opcional `supabase/seed-demo.sql` cadastra dados fictícios de demonstração para o catálogo e o dashboard. É carregado à parte, colando o arquivo no SQL Editor do painel; carregar de novo não duplica nada e só acrescenta os dias ainda sem agendamentos.

## Publicação

- Repositório ligado à Vercel: pré-visualização a cada pull request; produção a cada incorporação na `main`. Se o build falhar, a versão anterior continua no ar.
- Proteção da `main` no GitHub: só pull request; exige CI e build da Vercel aprovados, ramificação atualizada, todas as conversas resolvidas e aprovação de outro integrante, que cai com commits novos; incorporação só por squash.
- Lotes pequenos, um PR por tarefa; reversão pela republicação da versão anterior na Vercel (`workflows/procedimentos/deploy.md`).

## Integração contínua (`.github/workflows/ci.yml`)

A cada envio a uma ramificação e a cada pull request para a `main`, com Node.js 24, `npm ci` e cache do npm, em sequência (se uma etapa falha, as seguintes não rodam):

1. `prettier --check`;
2. `tsc --noEmit`, depois do `next typegen`, que gera os tipos das rotas e o `next-env.d.ts` (não versionados);
3. ESLint;
4. Vitest;
5. `npm audit` nas dependências de produção, falhando em vulnerabilidade alta ou crítica.

As etapas 1 a 4 são as do `npm run check`; a 5 roda só no CI. Tudo fica num único job, `check`, que é o nome do check obrigatório na proteção da `main`: renomear o job exige trocar o check no ruleset ao mesmo tempo.

O fluxo tem só permissão de leitura do repositório (`permissions: contents: read`), não usa chaves e não acessa o banco. O build completo é feito pela Vercel, e o resultado dele também bloqueia a incorporação.

## Execução em contêiner

Por exigência da disciplina, a aplicação também roda num contêiner Docker, com o mesmo comportamento em qualquer máquina, independentemente do sistema operacional e do Node.js instalado (decisão 0038). O contêiner não substitui a Vercel, que continua publicando a pré-visualização e a produção, nem o Supabase, que continua sendo o único banco: executa localmente a aplicação compilada, ligada ao projeto do Supabase pelas variáveis do `.env.local`.

| Arquivo | Função |
|---|---|
| `Dockerfile` | três estágios a partir da imagem oficial do Node.js 24: `npm ci`; `next build` com a saída standalone (`output: "standalone"` no `next.config.ts`); imagem final só com o servidor compilado, `public/` e `.next/static/`, executada pelo usuário `node`, sem privilégios de administrador |
| `.dockerignore` | deixa fora da imagem os `.env*` de qualquer pasta, `node_modules`, `.next`, `.git`, `.claude`, onde ficam os worktrees do Claude Code, `documentos-formais` e `wireframes` (RS016) |
| `compose.yaml` | serviço `app` em `http://localhost:3000`, com as variáveis lidas do `.env.local` na execução |

Para usar:

1. Instalar o Docker Desktop (Docker 29 e Compose 5) e deixá-lo aberto.
2. Ter na pasta o `.env.local`, copiado do `.env.example` e preenchido (seção "Variáveis de ambiente"); sem ele, o Compose para com "env file ... not found".
3. Rodar `docker compose up --build`: constrói a imagem com o código atual e sobe a aplicação em `http://localhost:3000`. Sem o `--build`, o Compose reaproveita a imagem anterior.
4. Encerrar com `Ctrl+C` ou, se a aplicação subiu em segundo plano (`-d`), com `docker compose down`.

A porta 3000 é a mesma do `npm run dev`: rode um de cada vez. O dia a dia continua com `npm run dev`, que recarrega as páginas a cada alteração. A imagem não é publicada em registro, e o CI não a constrói: um erro no `Dockerfile` só aparece quando alguém executa o comando. Na Vercel, a saída standalone só acrescenta a pasta `.next/standalone/` ao build.
