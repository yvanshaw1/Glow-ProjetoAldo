# Notas: 17-banco-de-dados

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-18 – decisão

Issue #17 criada com o OK do desenvolvedor, que respondeu à proposta de divisão em #17 (esquema, `seed.sql` e administrador) e #18 (`seed-demo.sql`). A resposta:

- "faça o esquema completo de todas as entidades e relacionamentos";
- "as edge functions fica para quando formos desenvolver cada area especifica";
- "os valores demo da seed demo voce mesmo pode criar, sendo condizente com a realidade".

Interpretação:

- "edge functions" são as seis funções SQL de gravação em várias tabelas (L1 do plano); o projeto não usa Edge Functions do Supabase;
- o `seed-demo.sql` voltou para a #17, porque o único motivo dado para separá-lo era o conteúdo, que agora o agente propõe;
- não há issue #18.

O número saiu 17, igual à ramificação `claude/17-banco-de-dados-35bcf3`. A pasta do worktree se chama `vibrant-ramanujan-5502b2` e não pode ser renomeada.

## 2026-10-18 – descoberta

Conferências do planejamento, sem instalar nada no projeto:

- No npm, `supabase` 2.120.0 é de 06/10/2026 e a 2.121.0, de 14/10. `@supabase/supabase-js` 2.117.3 é de 07/10; a 2.118.0 saiu em 15/10.
- A CLI 2.120 vem como binário por plataforma em `optionalDependencies` (`@supabase/cli-<so>-<arq>`, cerca de 150 MB descompactados), sem script de instalação. Isso importa porque o npm 11.19 da imagem `node:24-slim` tem `allow-scripts` vazio e não roda scripts de instalação de dependências; a CLI não depende deles.
- Nesta máquina: Node 24.11.1, npm 11.6.2 e Docker 29.8.2, com o daemon ativo.
- Ao conferir a configuração do npm, `docker run node:24-slim` baixou de novo a imagem oficial (cerca de 80 MB), que tinha sido apagada depois da #6. Ela é a base do `Dockerfile` e pode ficar.
- O repositório é público: os seeds e a migration não podem ter segredo nem dado real.

## 2026-10-18 – descoberta

O PR #16 (#15, wireframes, aberto) também altera `AGENTS.md`, `docs/plataforma/infraestrutura.md`, `docs/plataforma/estrutura-de-pastas.md`, `README.md`, `.dockerignore`, `.gitattributes` e `docs/decisoes/CONTEXT.md`, e cria a decisão 0041. Por isso:

- as decisões desta tarefa ficam como 0042 e 0043 no plano;
- se a #17 for incorporada antes da #16, elas passam a 0041 e 0042 na etapa 03;
- a única colisão de texto prevista é a linha nova no fim de `docs/decisoes/CONTEXT.md`.

## 2026-10-18 – decisão

Plano aprovado por yvan às 20:21, com a opção 1 em L1 a L7. A Q1 (versão do PostgreSQL do projeto) ficou sem resposta no arquivo, então vale o que o plano previa: `major_version = 17`. Status em `em_execucao`. Ramificação `feat/17-database-schema` criada a partir da `origin/main` (a8328e5), sem rastreamento. `npm install --save-exact`:

- `@supabase/supabase-js` 2.117.3 em `dependencies`;
- `supabase` 2.120.0 em `devDependencies`, que no Windows traz `@supabase/cli-windows-x64` com `supabase.exe` (112 MB) e `supabase-go.exe` (42 MB).

`npm audit --omit=dev`: 0 vulnerabilidades. O `npm audit` completo mostra 5 altas antigas, todas da cadeia do `eslint-config-next` (`@next/eslint-plugin-next`, `fast-glob`, `micromatch`, `braces`), só de desenvolvimento. `npx supabase --version` dá 2.120.0.

## 2026-10-18 – descoberta

O `deny` de `.claude/settings.json` bloqueia `npx supabase db push --help`, porque o padrão casa com o começo do comando. A opção foi conferida no binário instalado, sem rodar o comando: a 2.120 tem `--include-seed` ("Include seed data from your config."), além de `--dry-run`. A L6 segue como aprovada.

## 2026-10-18 – desvio

O desenvolvedor pediu, durante a etapa 02, para tirar os passos do painel do Supabase e usar o Zod. Isso é mudança de escopo: o plano ganhou a seção "Acréscimo de escopo", com a decisão D3 (0044), e voltou a `aguardando_aprovacao`.

Só a senha fica com o Zod. A confirmação de e-mail deixa de importar porque as contas passam a ser criadas por `auth.admin.createUser`, com o e-mail confirmado. O bucket vem da migration.

A construção parou depois da instalação das dependências: nada do `supabase/` foi criado ainda.

## 2026-10-18 – decisão

O acréscimo de escopo foi aprovado por yvan, e o status voltou a `em_execucao`. Na construção:

- O `npx supabase init` gerou o `config.toml` com `project_id` igual ao nome da pasta do worktree; ficou `glow`.
- `realtime`, `edge_runtime` e `analytics` foram desligados no `config.toml`. Senha e confirmação de e-mail ficaram no padrão do Supabase, como no acréscimo.
- O `config.toml` traz uma opção nova, `[api] auto_expose_new_tables`: o padrão de privilégios dos projetos pode variar. A concessão explícita ao `service_role` na migration (D1) não depende dela.
- O `.gitkeep` de `supabase/migrations/` foi removido.

## 2026-10-18 – descoberta

Conferência local, com o Supabase CLI 2.120 e o Docker Desktop. As imagens ficaram no Docker Desktop:

- `postgres:17.11.0.004`, `gotrue v2.197.0`, `postgrest v16.4`, `kong 2.8.1` e `storage-api v1.79.36`;
- não foram baixados `studio`, `imgproxy`, `mailpit`, `postgres-meta`, `supavisor`, `vector`, `logflare`, `realtime` nem `edge-runtime`.

As consultas rodaram pelo `psql` da imagem do banco, num contêiner novo ligado à rede do `supabase_db_glow`. Não houve `docker exec`. Os roteiros ficaram no scratchpad da sessão, fora do repositório.

Resultados:

- **Esquema (critérios 1 a 8 e as demais regras dos `dados.md`):** 112 casos, 0 falhas, depois de três `db reset`. A primeira versão do roteiro gravava os resultados dos casos aceitos dentro do bloco desfeito, e eles sumiam; corrigido antes da contagem final. Os gatilhos funcionam para o `service_role`, embora as funções não tenham `execute` concedido.
- **API REST local (critério 2):** a chave pública, antiga e `sb_publishable_`, recebe 42501 em `GET`, `POST` e `PATCH`. A `sb_secret_` e a `service_role` com `Authorization: Bearer` leem. Sem o `Bearer`, a chave antiga age como `anon`; o `supabase-js` sempre envia o `Bearer`.
- **`seed.sql` e `seed-demo.sql`:** idempotentes. A segunda carga não muda nenhuma contagem nem o `updated_at` da empresa.
- **Demonstração (critério 9):** 4 categorias, 18 serviços, 36 preços, 11 vínculos de adicionais, 12 clientes, 14 veículos, 15 vínculos e 258 agendamentos com 400 itens. As 16 regras de coerência deram 0. Os quatro exemplos de RN034 foram conferidos à mão. Formas de pagamento: Pix 50%, crédito 27%, débito 13% e dinheiro 10%.
- **`create-admin.mjs` (critério 10):** todos os caminhos se comportaram como previsto, inclusive com a chave antiga e a `sb_secret_`. A gravação em `staff` foi impedida revogando o privilégio só no banco local, e o privilégio foi devolvido.
- **`npx supabase db lint`:** sem erros.
- **`npm run check`:** aprovado. O ESLint lê o `supabase/scripts/create-admin.mjs`.

## 2026-10-18 – desvio

- A estimativa de "cerca de 150 a 200 agendamentos" do plano não combinava com a regra "2 a 4 por dia útil" em 105 dias. Valeu a regra, que dá cerca de 250 por carga.
- A carga foi num domingo à noite, então não há agendamentos "do dia" (`checked_in`, `awaiting_payment`). Há 2 `in_progress`, de serviços longos que começaram no sábado e terminam na segunda. Uma carga em dia aberto, durante o expediente, gera esses status.
- `ck_appointments_total` é `total >= 0`, como diz a coluna do `dados.md`. A restrição não exige o desconto de 100% para o total zero, porque um total arredondado a zero com outro desconto quase total seria recusado sem ser inválido.
- `docs/agendamento/dados.md` estava na lista de arquivos, mas nenhum texto aprovado o altera; ficou igual.

## 2026-10-19 – desvio

O primeiro CI do PR #18 falhou no `npm ci` ("Missing: @emnapi/runtime@1.11.3, @emnapi/core@1.11.3 from lock file"). O `npm install` da etapa 02 rodou com o npm 11.6.2 desta máquina (Node 24.11.1), que tirou do `package-lock.json` as dependências opcionais `@emnapi/*` que a `main` tinha. O CI usa o npm 11.19 (Node 24.21), que as exige.

Correção:

- O lock foi refeito a partir do lock da `main`, com o `package.json` da ramificação, por `npm install --package-lock-only` no npm 11.19.1 de um contêiner `node:24-slim`.
- Em relação à `main`, só entram pacotes: o Supabase e suas dependências, mais as cópias internas de `@emnapi` do `@tailwindcss/oxide-wasm32-wasi`. Nenhuma versão muda e nada sai.
- `npm ci --dry-run` no npm 11.19.1, `npm run check` e `npm audit --omit=dev` aprovados.

Cuidado para as próximas tarefas: um `npm install` com npm anterior ao 11.19 volta a podar essas entradas. Quem instalar dependências deve atualizar o Node 24 local (o npm vem junto) ou gerar o lock como acima.
