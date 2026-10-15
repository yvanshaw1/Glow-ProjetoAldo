---
titulo: Infraestrutura, ambientes e CI
assunto: plataforma
origem: Documentação de Arquitetura de Software, seção 8 (Quadros 36 e 37)
relacionados: [RNF014, RNF015, RS016]
---

# Infraestrutura, ambientes e CI

Três serviços em plano gratuito: GitHub (código e CI), Vercel (aplicação) e Supabase (banco, autenticação e arquivos). Sem servidor próprio, domínio ou contêineres.

## Ambientes

| Ambiente | Onde | Para quê |
|---|---|---|
| Desenvolvimento | `npm run dev` em `http://localhost:3000` | codificar e testar localmente |
| Pré-visualização | Vercel, um endereço por pull request em `vercel.app` | conferir a alteração antes da revisão |
| Produção | Vercel, a partir da `main`, em `vercel.app` | demonstração e avaliação |

Todos usam o mesmo projeto do Supabase: toda migration precisa ser compatível com a versão em produção (`workflows/procedimentos/migration.md`).

## Variáveis de ambiente

Nenhuma usa o prefixo `NEXT_PUBLIC_`, então nenhuma chega ao navegador. O repositório tem só `.env.example`, com os nomes e sem valores; os valores ficam em `.env.local` (ignorado pelo Git) e na Vercel (RNF015, RS016).

| Variável | Sigilosa | Uso |
|---|---|---|
| `SUPABASE_URL` | não | endereço do projeto |
| `SUPABASE_ANON_KEY` | não | chave pública, usada pelo servidor no login e na validação da sessão |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | chave de serviço: leitura e gravação dos dados e criação de contas, só em `src/server` |
| `APP_URL` | não | endereço de produção, usado na conferência da origem das requisições; nas pré-visualizações vale `VERCEL_URL` |
| `APP_TIMEZONE` | não | fuso da empresa, `America/Maceio` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | sim | conta de administrador, só para o script de dados iniciais |

## Preparação do banco (uma vez)

1. Aplicar a migration: tipos, tabelas, funções e RLS.
2. Carregar `supabase/seed.sql`: quatro formas de pagamento sem ajuste, sete dias da semana e a linha de dados da empresa.
3. Rodar `node --env-file=.env.local supabase/scripts/create-admin.mjs`, que cria a conta de administrador no Supabase Auth e o registro em `staff` com `is_admin`, lendo `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` do ambiente.
4. No painel do Supabase: desativar a confirmação de e-mail, definir senha mínima de 8 caracteres e criar o bucket `service-images` (leitura pública, gravação só pelo backend).

O arquivo opcional `supabase/seed-demo.sql` cadastra dados fictícios de demonstração para o catálogo e o dashboard.

## Publicação

- Repositório ligado à Vercel: pré-visualização a cada pull request; produção a cada incorporação na `main`. Se o build falhar, a versão anterior continua no ar.
- Proteção da `main` no GitHub: só pull request; exige CI e build da Vercel aprovados, ramificação atualizada, todas as conversas resolvidas e aprovação de outro integrante, que cai com commits novos; incorporação só por squash.
- Lotes pequenos, um PR por tarefa; reversão pela republicação da versão anterior na Vercel (`workflows/procedimentos/deploy.md`).

## Integração contínua (`.github/workflows/ci.yml`)

A cada envio a uma ramificação e a cada pull request para a `main`, com Node.js 24, `npm ci` e cache do npm, em sequência (se uma etapa falha, as seguintes não rodam):

1. `prettier --check`;
2. `tsc --noEmit`;
3. ESLint;
4. Vitest;
5. `npm audit` nas dependências de produção, falhando em vulnerabilidade alta ou crítica.

O fluxo tem só permissão de leitura do repositório (`permissions: contents: read`), não usa chaves e não acessa o banco. O build completo é feito pela Vercel, e o resultado dele também bloqueia a incorporação.
