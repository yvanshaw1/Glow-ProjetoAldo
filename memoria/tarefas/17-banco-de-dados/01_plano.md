---
issue: 17
titulo: "Banco de dados: esquema completo, dados iniciais e conta de administrador"
areas: [banco, cicd]
tipo: funcionalidade
requisitos: [RN002, RN006, RN007, RN009, RN010, RN012, RN013, RN017, RN021, RN022, RN024, RN027, RN030, RN035, RN036, RN037, RNF011, RS003, RS006, RS016, UC01, UC09]
status: concluido
aprovado_por: yvan
aprovado_em: 20:21 18/10/2026
---

# Plano: Banco de dados: esquema completo, dados iniciais e conta de administrador

## Objetivo

Criar o banco do Glow descrito em `docs/plataforma/infraestrutura.md` ("Preparação do banco"):

- a migration inicial, com o esquema completo das 16 tabelas e dos 7 tipos dos `dados.md` e de `docs/acesso/autenticacao.md`;
- o `supabase/seed.sql`, com os dados obrigatórios;
- o `supabase/seed-demo.sql`, com dados fictícios e realistas para o catálogo e o dashboard (UC01, UC09, RN021);
- o `supabase/scripts/create-admin.mjs`, que cria a conta de administrador (RN027).

O banco garante as regras de preenchimento e as regras entre linhas que os `dados.md` atribuem a ele (RN002, RN006, RN007, RN009, RN010, RN013, RN017, RN036 e RNF011). A RLS fica ativada sem políticas (decisão 0005). Nenhuma tela, rota ou código de `src/` muda.

Decidido na conversa de 18/10/2026: as seis funções de gravação em várias tabelas (`create_appointment`, `update_appointment`, `reschedule_appointment`, `save_service`, `save_role`, `link_vehicle`) ficam para a tarefa de cada área (L1). Elas são funções SQL chamadas pelo `supabase-js` via `rpc`. Não são Edge Functions do Supabase, que o projeto não usa: a API roda nas rotas do Next.js (decisão 0002). Os valores de demonstração são propostos aqui, na seção "Dados de demonstração", para conferência.

## Como o esquema entra

Tudo por `npx supabase`, com a CLI fixada no projeto (D2). O agente nunca usa o projeto real: aplica e confere só num banco local descartável.

1. `npx supabase init`, que cria `supabase/config.toml` e `supabase/.gitignore` (este ignora `.temp/`, onde a CLI guarda o vínculo com o projeto). No `config.toml`:
   - `project_id = "glow"`, no lugar do nome da pasta do worktree;
   - `[db] major_version` igual à do projeto (dúvida Q1);
   - `[db.seed] sql_paths = ["./seed.sql"]`;
   - `[auth] minimum_password_length = 8` e `[auth.email] enable_confirmations = false`, como o painel do projeto real (passo 4 da Preparação);
   - `realtime`, `edge_runtime` e `analytics` desligados: o projeto não usa esses serviços (decisão 0004).
2. `npx supabase migration new initial_schema` cria `supabase/migrations/<AAAAMMDDHHMMSS>_initial_schema.sql`. O `.gitkeep` da pasta sai. O arquivo tem um bloco comentado por etapa, na ordem das dependências:
   1. tipos enumerados: `permission_key`, `vehicle_type`, `vehicle_size`, `service_type`, `pricing_mode`, `payment_method` e `appointment_status`, com os valores dos `dados.md`;
   2. função `set_updated_at()`;
   3. tabelas por assunto: equipe (`roles`, `role_permissions`, `staff`), clientes (`clients`, `vehicles`, `client_vehicles`), catálogo (`categories`, `services`, `service_prices`, `service_additionals`), configurações (`business_settings`, `business_hours`, `payment_fees`), acesso (`login_attempts`) e agendamento (`appointments`, `appointment_services`);
   4. gatilhos; índices adicionais; RLS e privilégios (D1).
3. Convenções aplicadas a todas as tabelas (`docs/padroes/banco.md`):
   - `id uuid default gen_random_uuid()`, exceto nas chaves dos `dados.md`: `business_settings.id` (1), `business_hours.weekday`, `payment_fees.payment_method`, `login_attempts.email` e as chaves compostas;
   - `created_at timestamptz not null default now()` em todas;
   - `updated_at` nas 11 editáveis, com o gatilho `trg_<tabela>_updated_at`;
   - `not null` em toda coluna que o `dados.md` não marca como "Opcional" ou "Conforme";
   - dinheiro em `numeric(10,2)`, percentual em `numeric(5,2)` e horário em `time`.
4. `vehicles.size` é coluna gerada pelo tipo (`generated always as (...) stored`): `hatch` dá `small`, `sedan` dá `medium`, `suv` dá `large` e `pickup` dá `extra_large` (RN002, decisão 0013).
5. Chaves estrangeiras: bloqueiam a exclusão (`restrict`) e só usam cascata em `role_permissions`, `service_prices` e `service_additionals`. Duas são diferentes das outras:
   - `staff.id` referencia `auth.users`; `clients.id` não tem chave estrangeira;
   - `appointments` referencia `client_vehicles` por chave composta (`client_id`, `vehicle_id`).

### Restrições e gatilhos por tabela

Nomes conforme `banco.md`. Os marcados com (L3), (L4) ou (L5) dependem da opção recomendada da lacuna. A coluna "Regra" resume os `dados.md`.

| Tabela | Restrições, índices e gatilhos | Regra |
|---|---|---|
| `roles` | `uq_roles_name` (L5) | nome único |
| `role_permissions` | `fk_role_permissions_role_id` (cascata) | – |
| `staff` | `fk_staff_id` (`auth.users`), `fk_staff_role_id`, `uq_staff_email`, `ck_staff_email` (L5), `ck_staff_role_id`, `uq_staff_is_admin` (L3) | cargo obrigatório fora do administrador; o administrador fica sem cargo (RN024, RN027) |
| `clients` | `uq_clients_email` (parcial, `deleted_at is null`), `ck_clients_email` (L5) | e-mail único entre os não excluídos (RN022, RN030) |
| `vehicles` | `uq_vehicles_plate`, `ck_vehicles_plate` (L5), `ck_vehicles_year` (≥ 1886) | placa única (RN036) |
| `client_vehicles` | `fk_client_vehicles_client_id`, `fk_client_vehicles_vehicle_id`, `idx_client_vehicles_vehicle_id` | – |
| `categories` | `uq_categories_name` (L5) | – |
| `services` | `fk_services_category_id`, `uq_services_name` (parcial, L5), `ck_services_avg_duration_minutes` (5 a 2.400), `ck_services_fixed_price` (> 0), `ck_services_pricing` (valor fixo se e somente se `fixed`), `ck_services_type_fields`, `trg_services_type_unchanged` | principal e complementar com categoria e descrição; adicional sem categoria, descrição nem imagem e sempre `fixed`; tipo imutável (RN006, RN007, RN009) |
| `service_prices` | `fk_service_prices_service_id` (cascata), `ck_service_prices_price` (> 0), `trg_service_prices_complete` (L4) | exatamente quatro valores no serviço por porte (RN009) |
| `service_additionals` | `fk_service_additionals_main_service_id` e `fk_service_additionals_additional_service_id` (cascata), `trg_service_additionals_types` | principal do tipo `main` e adicional do tipo `additional` (RN006) |
| `business_settings` | `ck_business_settings_id` (= 1) | linha única |
| `business_hours` | `ck_business_hours_weekday` (0 a 6), `ck_business_hours_open`, `ck_business_hours_closes_at`, `ck_business_hours_break`, `ck_business_hours_half_hour` | horários se e somente se aberto, encerramento depois da abertura, pausa com início e fim juntos dentro do expediente e horários em 00 ou 30 minutos (RN013) |
| `payment_fees` | `ck_payment_fees_percent` (−100 a 100) | RN012 |
| `login_attempts` | `ck_login_attempts_failed_count` (≥ 0), `ck_login_attempts_email` (L5) | RS006 |
| `appointments` | `fk_appointments_client_id_vehicle_id`, `fk_appointments_created_by_staff_id`, `fk_appointments_rescheduled_from_id`, `uq_appointments_rescheduled_from_id`, `ck_appointments_subtotal` (> 0), `ck_appointments_fee_percent` (−100 a 100), `ck_appointments_total` (≥ 0), `ck_appointments_estimated_duration_minutes` (> 0), `ck_appointments_estimated_end_at` (≥ `scheduled_at`), `ck_appointments_completed_at`, `ck_appointments_cancelled_at`; índices `idx_appointments_scheduled_at`, `idx_appointments_client_id_scheduled_at`, `idx_appointments_vehicle_id` e `idx_appointments_completed_at` (parcial) | `completed_at` só em `completed` ou `rescheduled` e `cancelled_at` só em `cancelled` (RN017); total zero só com desconto de 100% (RN010) |
| `appointment_services` | `fk_appointment_services_appointment_id`, `fk_appointment_services_service_id`, `ck_appointment_services_price` (> 0), `ck_appointment_services_duration_minutes` (> 0) | cópias do RN037 |

Fora do banco, como hoje na documentação: o limite superior do ano do veículo (ano corrente), a sequência de status (RN017), o cargo inativo (RN026), a composição do agendamento (RN005) e a coerência entre itens, subtotal e total (RN010). Essas regras ficam em `src/server/rules/` e nas funções de gravação de cada área.

## Dados iniciais (`supabase/seed.sql`)

Idempotente: cada `insert` usa `on conflict do nothing`, então carregar de novo não duplica nem sobrescreve o que o painel alterou.

- `payment_fees`: `credit`, `debit`, `pix` e `cash`, com `percent` 0.
- `business_hours`: os sete dias, com os horários da L2.
- `business_settings`: a linha 1, com o nome da empresa da L2 e os demais campos vazios.

## Dados de demonstração (`supabase/seed-demo.sql`)

Só dados fictícios (`guia/regras.md`, "Dados"), com valores de mercado de Maceió em 2026. O arquivo é um único bloco SQL, numa transação só. Carregar de novo não duplica nada, porque cada id é derivado de uma chave fixa (`md5(...)::uuid`, com `on conflict do nothing`):

- cadastros: o nome do item;
- agendamentos: a data e o horário.

Uma nova carga, perto da apresentação, só acrescenta os dias que ainda não têm agendamentos. O arquivo não altera disponibilidade, formas de pagamento nem cargos.

**Categorias:**

- Lavagem
- Polimento e proteção
- Higienização
- Película e envelopamento, **inativa** (RN031)

**Serviços principais, por porte (P / M / G / GG):**

| Serviço | Categoria | Valores (R$) | Duração |
|---|---|---|---|
| Lavagem simples | Lavagem | 40 / 50 / 60 / 70 | 40 min |
| Lavagem completa | Lavagem | 70 / 85 / 100 / 120 | 1 h 30 |
| Lavagem técnica | Lavagem | 160 / 190 / 220 / 260 | 3 h |
| Polimento comercial | Polimento e proteção | 280 / 330 / 390 / 450 | 4 h |
| Polimento técnico | Polimento e proteção | 550 / 650 / 750 / 850 | 8 h (passa para o dia seguinte, RN034) |
| Vitrificação de pintura | Polimento e proteção | 1.100 / 1.300 / 1.500 / 1.700 | 15 h |
| Higienização interna completa | Higienização | 280 / 330 / 380 / 450 | 5 h |
| Película nos vidros | Película e envelopamento (inativa) | 300 / 350 / 400 / 450 | 3 h |
| Lavagem a seco, **excluída** (`deleted_at`) e presente em agendamentos antigos (RN030, RN037) | Lavagem | 45 / 55 / 65 / 75 | 30 min |

**Serviços complementares, com valor fixo:**

| Serviço | Categoria | Valor (R$) | Duração |
|---|---|---|---|
| Higienização do ar-condicionado | Higienização | 120 | 1 h |
| Lavagem de motor | Lavagem | 80 | 40 min |
| Revitalização de faróis | Polimento e proteção | 150 | 1 h |
| Oxi-sanitização | Higienização | 100 | 40 min |
| Cristalização de vidros, **inativo** (RN008) | Polimento e proteção | 90 | 40 min |

**Serviços adicionais, com valor fixo:**

| Serviço | Valor (R$) | Duração | Vinculado a |
|---|---|---|---|
| Cera de carnaúba | 35 | 20 min | Lavagem simples e completa |
| Pretinho nos pneus | 10 | 10 min | Lavagem simples, completa e técnica |
| Hidratação de couro | 90 | 40 min | Lavagem completa, técnica e Higienização interna completa |
| Repelente de chuva nos vidros | 50 | 20 min | Lavagem completa, técnica e Polimento comercial |

Cada serviço tem uma descrição de uma frase, escrita na etapa 02. As imagens ficam vazias.

**Clientes e veículos:**

- 12 clientes com nomes fictícios comuns em Alagoas, e-mails `@example.com` (domínio reservado, RFC 2606) e celulares `(82) 90000-00NN`.
- 14 veículos de modelos comuns no Brasil, dos quatro tipos (como Polo, HB20, Corolla, City, Compass, Creta, Hilux e Toro), com cores e anos de 2015 a 2025 e placas fictícias iniciadas por `GLW`, nos dois padrões. Um veículo fica vinculado a duas contas (RN036).
- Nenhum cliente tem conta no Supabase Auth: eles aparecem no painel e no dashboard, mas não entram no portal.

**Agendamentos:**

- Cerca de 150 a 200, nos dias abertos dos 90 dias anteriores à carga e dos 14 seguintes, com 2 a 4 por dia útil e 1 ou 2 aos sábados. Os horários ficam dentro da disponibilidade da L2.
- Combinações realistas, como Lavagem simples com Pretinho, Lavagem completa com Cera, Polimento comercial, Higienização interna completa e Ar-condicionado avulso. Uma Vitrificação aparece de vez em quando.
- Os valores seguem o catálogo e o porte, e o total é igual ao subtotal, porque o `seed.sql` deixa as formas de pagamento sem ajuste.
- A duração é a soma dos serviços. A previsão de conclusão segue a RN034 e pula a pausa, a noite e o domingo.
- As cópias do RN037 vêm dos cadastros.
- Status:
  - nos dias passados, cerca de 85% `completed`, 10% `cancelled` e alguns `rescheduled`, cada um com o reagendamento que originou (RN020);
  - no dia da carga, `checked_in`, `in_progress` e `awaiting_payment`;
  - nos dias seguintes, `scheduled`.
- Formas de pagamento: Pix em cerca de 45%, crédito em 30%, débito em 15% e dinheiro em 10%. `created_by_staff_id` fica vazio.
- `business_settings` ganha o e-mail `contato@glow.example` e um endereço fictício em Maceió, só se esses campos estiverem vazios. Telefone, WhatsApp e redes sociais ficam vazios, porque qualquer número ou perfil pode existir de verdade.

## Conta de administrador (`supabase/scripts/create-admin.mjs`)

Executado por `node --env-file=.env.local supabase/scripts/create-admin.mjs`. O script:

1. Lê `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` do ambiente. Se faltar alguma, diz o nome dela (nunca o valor) e sai com código 1.
2. Normaliza o e-mail (sem espaços, em minúsculas) e confere os formatos do RN035. A senha precisa ter de 8 a 72 caracteres, com maiúscula, número e caractere especial (RS003).
3. Cria o cliente com `createClient(url, key)`, sem sessão persistida, e passa a chave como ela vem. O script não supõe formato JWT: funciona com a chave `sb_secret_...` e com a antiga `service_role`.
4. Se já existe um `staff` com `is_admin`, avisa que a conta já existe e termina com sucesso, sem alterar nada.
5. Cria a conta no Supabase Auth com o e-mail já confirmado (`auth.admin.createUser`). Se o e-mail já tiver conta no Auth (de um cliente, por exemplo), para com erro e não reaproveita a conta (RN022).
6. Grava o `staff` com o mesmo id, `is_admin` verdadeiro, sem cargo e com o nome da L3. Se essa gravação falhar, apaga a conta recém-criada no Auth (`docs/padroes/backend.md`, "Cadastro de conta").
7. Nunca exibe o e-mail, a senha nem a chave. O e-mail também é sigiloso, conforme a tabela de variáveis de `infraestrutura.md`.

O script usa `@supabase/supabase-js` 2.117.3, a versão da stack (`docs/plataforma/visao-geral.md`). Ele é a primeira dependência do Supabase no projeto, e o `src/server` vai usar a mesma depois. O ESLint confere o script (`.mjs`), e o TypeScript não.

## Critérios de aceitação e verificação

O agente confere tudo num banco local descartável do Supabase, no Docker Desktop desta máquina (D2), e nunca no projeto real. O procedimento:

1. Sobe o banco com `npx supabase start`, deixando de fora `studio`, `storage-api`, `imgproxy`, `mailpit`, `postgres-meta`, `supavisor` e `vector`. Ficam o banco, o Auth, a API REST e o gateway.
2. Recria o banco com `npx supabase db reset`, que aplica a migration e o `seed.sql`.
3. Roda as consultas com o `psql` da própria imagem do banco, num contêiner novo (`docker run --rm`). Nunca usa `docker exec`.

O roteiro de conferência fica no scratchpad, fora do repositório, porque `memoria/` não guarda código. Cada caso, com o resultado, vai para o `notas.md` e o `02_relatorio.md`.

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| 1. Dado um banco vazio, quando a migration e o `seed.sql` são aplicados, então existem os 7 tipos e as 16 tabelas, todas com RLS ativada e sem políticas, mais 4 formas de pagamento com 0%, 7 dias da semana e 1 linha de dados da empresa | **agente, local**: `db reset` sem erro; contagem em `pg_type`, `pg_tables` (`rowsecurity`) e `pg_policies` (vazia); contagem das linhas do seed; `db reset` de novo dá o mesmo resultado |
| 2. Dado a chave pública, quando ela consulta ou grava qualquer tabela, então nada é lido nem gravado (decisão 0005) | **agente, local**: `GET` e `POST` na API REST local (`/rest/v1/payment_fees` e outras) com a chave pública local, lida pelo `supabase status` sem ser exibida, dão erro de permissão; `set role anon` e `set role authenticated` no `psql` dão erro em `select` e `insert`; `set role service_role` lê e grava |
| 3. Dado um veículo `suv` gravado sem porte, então o porte é `large`; mudado para `pickup`, passa a `extra_large` (RN002) | **agente, local**: `insert` e `update` em `vehicles`, conferindo `size`; gravar `size` direto dá erro |
| 4. Dado um veículo com a placa ABC1D23, quando outro é gravado com a mesma placa, então o banco recusa por `uq_vehicles_plate` (RN036) | **agente, local**: segundo `insert` recusado com o nome da restrição na mensagem; com a L5, `ABC-1D23` e `abc1d23` também são recusadas (`ck_vehicles_plate`) |
| 5. Dado um serviço adicional, quando é gravado com categoria, descrição, imagem ou precificação por porte, ou quando o tipo de um serviço é alterado, então o banco recusa (RN006, RN007, RN009) | **agente, local**: um `insert` por combinação inválida e um `update` de `type`, cada um recusado com o nome da regra; vínculo adicional-adicional recusado; com a L4, serviço por porte com três valores recusado no fim da transação |
| 6. Dado um agendamento, quando o status não corresponde a `completed_at` e `cancelled_at`, ou o total é negativo, então o banco recusa (RN017, RN010) | **agente, local**: um `insert` por combinação de status e datas (`completed` sem `completed_at`, `scheduled` com `cancelled_at`, `rescheduled` sem `completed_at`), total −0,01 e previsão anterior ao início, todos recusados; total zero com `fee_percent` −100 aceito |
| 7. Dado um dia aberto sem horários, com encerramento antes da abertura, pausa fora do expediente ou horário 08:15, quando é gravado em `business_hours`, então o banco recusa (RN013, RN035) | **agente, local**: um `update` por caso, cada um recusado; dia fechado com horários também recusado |
| 8. Dado um registro editável, quando é alterado, então `updated_at` muda sozinho (RNF011) | **agente, local**: `update` em cada uma das 11 tabelas editáveis, com `updated_at` maior que o anterior |
| 9. Dado o banco com a migration e o `seed.sql`, quando o `seed-demo.sql` é carregado, então há serviços ativos de cada tipo em categorias ativas (UC01) e agendamentos que dão receita, ticket médio e cancelamentos ao mês atual e aos anteriores (RN021); carregado de novo, nada é duplicado | **agente, local**: carga sem erro (o que também confere as restrições, inclusive a L4); consulta dos serviços visíveis ao cliente (ativos, não excluídos, em categoria ativa); receita, ticket médio e taxa de cancelamento por mês, pelas fórmulas da RN021; segunda carga com as mesmas contagens; agendamentos em dias abertos e dentro do expediente |
| 10. Dado `SEED_ADMIN_*` no ambiente, quando o integrante designado roda o `create-admin.mjs`, então a conta existe no Auth e em `staff`, com `is_admin` e sem cargo; rodar de novo não cria uma segunda conta (RN027) | **agente, local**: o script roda contra o Supabase local, com variáveis passadas só ao processo, e-mail `admin@example.com` e senha de teste gerada; o agente confere `auth.users` e `staff`; a segunda execução diz que já existe; sem `SUPABASE_URL`, o script diz qual variável falta; com uma senha sem número, recusa; com a gravação em `staff` impedida de propósito (privilégio revogado só no banco local), a conta do Auth é removida; a execução se repete com a chave antiga e com a `sb_secret_`, se o `supabase status` der as duas. **Manual (Yvan)**, depois do `db push`: `node --env-file=.env.local supabase/scripts/create-admin.mjs` no projeto real e login no painel do Supabase (Authentication) para ver a conta |
| 11. Dado o PR, quando o CI roda, então o `npm run check` passa e nenhuma etapa acessa o banco | `npm run check` local e o check `check` do PR; o `ci.yml` não muda |

Além dos critérios:

- **Yvan, depois da aprovação do PR**: `npx supabase db push --include-seed` (L6) no projeto real, comentário no PR e então a incorporação (`migration.md`). O `seed-demo.sql` é opcional.
- **Agente**: `npx supabase db lint` no banco local, sem erros nas funções.

## Arquivos

| Arquivo | Ação |
|---|---|
| `package.json`, `package-lock.json` | alterar: `@supabase/supabase-js` 2.117.3 em `dependencies` e `supabase` 2.120.0 em `devDependencies` (D2), com `npm install` (aprovação pedida na hora) |
| `supabase/config.toml`, `supabase/.gitignore` | criar com `npx supabase init`, ajustando o `config.toml` |
| `supabase/migrations/<AAAAMMDDHHMMSS>_initial_schema.sql` | criar com `npx supabase migration new initial_schema` |
| `supabase/migrations/.gitkeep` | remover (a pasta passa a ter a migration, `estrutura-de-pastas.md`) |
| `supabase/seed.sql`, `supabase/seed-demo.sql` | criar |
| `supabase/scripts/create-admin.mjs` | criar |
| `supabase/README.md`, `supabase/scripts/README.md` | alterar: `config.toml`, banco local, carga dos seeds e comportamento do script |
| `docs/agendamento/dados.md`, `docs/catalogo/dados.md`, `docs/clientes/dados.md`, `docs/configuracoes/dados.md`, `docs/equipe/dados.md` | alterar: textos das lacunas |
| `docs/acesso/autenticacao.md` | alterar: tabela `login_attempts` (L5) |
| `docs/padroes/banco.md` | alterar: L1, L5, L7, D1 |
| `docs/plataforma/infraestrutura.md` | alterar: "Preparação do banco" (L1, L6) |
| `docs/plataforma/visao-geral.md`, `AGENTS.md` | alterar: CLI do Supabase na stack e o comando do banco local (D2) |
| `workflows/procedimentos/migration.md` | alterar: conferência local, funções novas e carga dos seeds (D1, D2, L6) |
| `guia/regras.md`, `.claude/settings.json` | alterar: o agente não vincula o projeto real (D2) |
| `docs/decisoes/0042-*.md`, `docs/decisoes/0043-*.md`, `docs/decisoes/CONTEXT.md` | criar e alterar na etapa 03 (D1, D2) |
| `memoria/tarefas/17-banco-de-dados/` | `01_plano.md` e `notas.md` nesta etapa; `02_relatorio.md` na etapa 03 |

Não mudam:

- `.env.example`, que já tem as sete variáveis;
- `.github/workflows/ci.yml`, porque o CI não acessa o banco;
- `Dockerfile`, `.dockerignore` e `compose.yaml`, porque o `supabase/` não leva segredos e a imagem final só tem a saída standalone;
- `src/` e `tests/`;
- a decisão 0006: a "uma migration em SQL" dela se opõe ao mapeamento objeto-relacional e não ao número de arquivos, que o `migration.md` já prevê ("um arquivo por mudança").

### Em comum com outras tarefas em andamento

| Arquivo | Outra tarefa | Conflito no merge |
|---|---|---|
| `AGENTS.md` | PR #16 (#15): linha `wireframes/` no mapa | não: a #17 muda a linha da stack e os comandos |
| `docs/plataforma/infraestrutura.md` | PR #16: linha do `.dockerignore` | não: a #17 muda "Preparação do banco" |
| `docs/decisoes/CONTEXT.md` | PR #16: linha da 0041 | **sim**, mecânico: manter as linhas em ordem de número |
| número das decisões | PR #16 usa a 0041 | **sim**: esta tarefa usa 0042 e 0043; se a #17 for incorporada antes, passam a 0041 e 0042 na etapa 03 |

## Testes previstos

Nenhum teste automatizado novo. A tarefa não cria regra de negócio em `src/server/rules/` nem esquema em `src/shared/validation/`, os únicos que o Vitest testa (decisões 0024 e 0035). O banco é conferido localmente pelos passos de "Critérios de aceitação e verificação", com o valor esperado de cada caso tirado dos `dados.md` e das RN citadas. As validações do `create-admin.mjs` repetem o RS003 e o RN035 só porque o script roda fora da aplicação. O esquema Zod da senha continua sendo a referência, e o teste dele vem com a tarefa de validação.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. As funções de gravação entram com cada área (decidida na conversa)

**Problema.** `infraestrutura.md`, "Preparação do banco", item 1, diz "Aplicar a migration: tipos, tabelas, funções e RLS". Os `dados.md` e o `backend.md` listam seis funções de gravação em várias tabelas, mas nenhum módulo define os parâmetros delas, que dependem do serviço que as chama. Na conversa de 18/10/2026, você decidiu que elas ficam para a tarefa de cada área. Falta só ajustar o texto.

**Opções:**

- [X] **1. Ajustar o texto à decisão da conversa (recomendada).** Cada função entra em migration própria, na tarefa que a usa: `save_role` (UC21), `link_vehicle` (UC05 e UC18), `save_service` (UC13 e UC14), `create_appointment` (UC06 e UC11), `update_appointment` (UC26) e `reschedule_appointment` (UC25).
- [ ] **2. Incluir as seis funções nesta tarefa.** Os parâmetros seriam inventados agora e trocados depois por migrations novas.

**Texto proposto (opção 1):**

- `docs/plataforma/infraestrutura.md`, "Preparação do banco", item 1: "Aplicar a migration: tipos, tabelas, funções e RLS." passa a "Aplicar as migrations. A inicial cria os tipos, as tabelas, as restrições, os gatilhos, os índices e a RLS; cada função de gravação em várias tabelas entra depois, em migration própria, com a funcionalidade que a chama."
- `docs/padroes/banco.md`, "Transações", item novo depois do primeiro: "Cada função de gravação entra em migration própria, na tarefa da funcionalidade que a chama; os parâmetros são definidos pelo serviço dessa tarefa."

### L2. Valores iniciais da disponibilidade e dos dados da empresa

**Problema.** `migration.md` e `configuracoes/dados.md` dizem que o `seed.sql` cria "os sete dias da semana" e "a linha de dados da empresa", sem dizer com que valores. `company_name` é obrigatório. Num dia aberto, os horários também são obrigatórios. Sem nenhum dia aberto, nenhum agendamento pode ser marcado até alguém configurar a disponibilidade (UC23).

**Opções:**

- [X] **1. Horário comercial típico e o nome do projeto (recomendada).** Segunda a sexta das 08:00 às 18:00, com pausa das 12:00 às 13:00; sábado das 08:00 às 12:00, sem pausa; domingo fechado. `company_name` = "Glow – Estética Automotiva", o mesmo da página inicial, e os demais campos vazios. O sistema funciona logo após a preparação, e a empresa ajusta tudo pelo painel.
- [ ] **2. Todos os dias fechados.** Nenhum valor inventado no seed obrigatório, mas ninguém agenda até alguém configurar. O `seed-demo.sql` teria de abrir os dias e sobrescreveria a disponibilidade.
- [ ] **3. Outros horários.** Diga quais.

**Texto proposto (opção 1):**

- `docs/configuracoes/dados.md`, "Observações", primeiro item, depois de "...sem ajuste em `payment_fees`.": "Valores iniciais: de segunda a sexta, das 08:00 às 18:00, com pausa das 12:00 às 13:00; sábado, das 08:00 às 12:00, sem pausa; domingo fechado; nome da empresa "Glow – Estética Automotiva" e os demais dados vazios."

### L3. Nome da conta de administrador e conta única

**Problema.** `staff.first_name` e `staff.last_name` são obrigatórios, mas o script só recebe `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`. A RN027 fala de "a conta de administrador", no singular, mas nada no banco impede uma segunda.

**Opções:**

- [X] **1. Nome fixo no script e no máximo um administrador no banco (recomendada).** Nome "Administrador" e sobrenome "Glow", que só aparecem no próprio painel, porque o administrador não entra nas listagens. Índice único parcial `uq_staff_is_admin`. O `.env.example` não muda.
- [ ] **2. Nome fixo, sem a garantia no banco.** Uma segunda conta só seria evitada pelo próprio script.
- [ ] **3. Variáveis novas `SEED_ADMIN_FIRST_NAME` e `SEED_ADMIN_LAST_NAME`.** Muda o `.env.example`, o `.env.local` e a tabela de variáveis.

**Texto proposto (opção 1):**

- `docs/equipe/dados.md`, "Regras garantidas pelo banco", item novo: "há no máximo uma conta de administrador (`uq_staff_is_admin`);".
- `docs/equipe/dados.md`, "Observações", primeiro item, depois de "...criada pelo script de dados iniciais": ", com o nome "Administrador" e o sobrenome "Glow"".
- `supabase/scripts/README.md`, parágrafo novo: "O script confere os formatos do e-mail e da senha (RN035, RS003). Se o administrador já existe, termina sem alterar nada. Se a gravação em `staff` falha, remove a conta criada no Auth. Nunca exibe o e-mail, a senha nem a chave."

### L4. Quatro valores no serviço por porte: regra do banco ou do serviço?

**Problema.** `catalogo/dados.md` diz, na descrição de `service_prices.price`, que "um serviço por porte tem exatamente os quatro valores (RN009)". A regra não está em "Regras garantidas pelo banco". `banco.md` pede que "nenhuma combinação inválida" seja gravada, mesmo se a aplicação falhar. A regra envolve várias linhas, então só um gatilho conferido no fim da transação (`constraint trigger ... deferrable initially deferred`) a garante.

**Opções:**

- [X] **1. Garantir no banco, no fim da transação (recomendada).** Um serviço `by_size` tem os quatro portes em `service_prices`, e um `fixed` não tem nenhum. Serviço e valores precisam ser gravados juntos, como a `save_service` fará. Um `insert` avulso de serviço por porte é recusado.
- [ ] **2. Só na aplicação.** Fica na `save_service` e no esquema Zod. Um erro da aplicação pode gravar um serviço sem preço para algum porte.

**Texto proposto (opção 1):**

- `docs/catalogo/dados.md`, "Regras garantidas pelo banco", item novo: "um serviço por porte tem exatamente os quatro valores em `service_prices`, e um serviço de valor fixo não tem nenhum; a conferência é feita no fim da transação, por isso o serviço e os valores são gravados juntos, pela `save_service`;".

### L5. Formatos do RN035 que o banco também confere

**Problema.** Os formatos do RN035 ficam nos esquemas Zod (`docs/padroes/api.md`). Nenhum módulo diz se o banco também os confere. As colunas únicas dependem da normalização: se a aplicação falhar, "ABC-1234" e "ABC1234", ou "Maria@x.com" e "maria@x.com", viram dois registros. Isso também abre um desvio no limite de tentativas de login (RS006), que conta por e-mail. A unicidade dos nomes de serviço, categoria e cargo também não diz se "Lavagem completa" e "lavagem completa" são o mesmo nome.

**Opções:**

- [X] **1. Só o que a unicidade exige (recomendada).**
  - Placa em maiúsculas, sem hífen, no padrão Mercosul ou no antigo (`ck_vehicles_plate`).
  - E-mail em minúsculas e sem espaços em `clients`, `staff` e `login_attempts`.
  - Nomes únicos comparados sem diferenciar maiúsculas (`lower(name)`) em `roles`, `categories` e `services`.

  Os demais formatos ficam só no Zod.
- [ ] **2. Todos os formatos do RN035 também no banco.** Inclui tamanhos, padrões de nome, telefone, CNPJ, valor máximo e horário em meia hora. A regra fica duplicada em dois lugares, e mudar um formato passa a exigir migration.
- [ ] **3. Nenhum formato no banco.** Fica só o que os `dados.md` já listam. A unicidade depende de a aplicação normalizar sempre.

**Texto proposto (opção 1):**

- `docs/padroes/banco.md`, "Estrutura", item novo depois de "Regras de preenchimento...": "Os formatos do RN035 são conferidos pelos esquemas Zod. O banco confere só a forma normalizada das colunas únicas: placa em maiúsculas e sem hífen, e-mail em minúsculas e sem espaços. Os nomes únicos são comparados sem diferenciar maiúsculas (`lower(name)`)."
- `docs/clientes/dados.md`, seção nova "Regras garantidas pelo banco", antes de "Gravações em várias tabelas": "- a placa é gravada em maiúsculas e sem hífen, no padrão Mercosul ou no antigo (`ck_vehicles_plate`), e o e-mail do cliente, em minúsculas e sem espaços (`ck_clients_email`)."
- `docs/equipe/dados.md`, "Regras garantidas pelo banco", item novo: "o e-mail do funcionário é gravado em minúsculas e sem espaços (`ck_staff_email`), e o nome do cargo não se repete, sem diferenciar maiúsculas;".
- `docs/catalogo/dados.md`, "Regras garantidas pelo banco", item novo: "os nomes de categoria e de serviço não excluído não se repetem, sem diferenciar maiúsculas;".
- `docs/acesso/autenticacao.md`, tabela `login_attempts`, coluna `email`, Restrições: "PK" passa a "PK; em minúsculas".

### L6. Como carregar os seeds no projeto real

**Problema.** `infraestrutura.md` manda "carregar `supabase/seed.sql`" e cita o `seed-demo.sql`, mas não diz como. O `migration.md` só prevê o `npx supabase db push`, que não carrega seeds sem opção.

**Opções:**

- [X] **1. `seed.sql` pela CLI, junto com a migration; `seed-demo.sql` pelo SQL Editor (recomendada).** `npx supabase db push --include-seed` carrega o que está em `[db.seed]` do `config.toml`, só o `seed.sql`. O `seed-demo.sql` continua opcional: o integrante cola o arquivo no SQL Editor do painel, quando quiser. Os dois são idempotentes. A opção `--include-seed` é conferida na etapa 02 com `npx supabase db push --help`; se não existir na 2.120, o `seed.sql` também vai pelo SQL Editor.
- [ ] **2. Os dois pelo SQL Editor.** Nada depende da CLI, mas o passo é manual.
- [ ] **3. Os dois em `[db.seed]`.** Uma única execução carrega tudo, e o `seed-demo.sql` deixa de ser opcional no projeto real.

**Texto proposto (opção 1):**

- `docs/plataforma/infraestrutura.md`, "Preparação do banco", item 2: "Carregar `supabase/seed.sql`: ..." passa a "Carregar o `supabase/seed.sql` junto com a migration, com `npx supabase db push --include-seed`: quatro formas de pagamento sem ajuste, sete dias da semana e a linha de dados da empresa."
- `docs/plataforma/infraestrutura.md`, parágrafo depois da lista: "O arquivo opcional `supabase/seed-demo.sql` ... dashboard." ganha no fim: "É carregado à parte, colando o arquivo no SQL Editor do painel; carregar de novo não duplica nada e só acrescenta os dias ainda sem agendamentos."
- `workflows/procedimentos/migration.md`, "Dados iniciais", fim: "Os dois arquivos são idempotentes (`on conflict do nothing`). O `seed.sql` vai ao projeto real com `npx supabase db push --include-seed`; o `seed-demo.sql`, pelo SQL Editor do painel."

### L7. Nomes de gatilhos e de funções

**Problema.** `banco.md` define os prefixos `fk_`, `uq_`, `ck_` e `idx_`, mas não fala de gatilhos e funções. Também não diz como um gatilho que recusa uma gravação identifica a regra para o repositório, que converte a violação pelo nome (`PLATE_IN_USE`).

**Opções:**

- [X] **1. `trg_` para gatilhos e erro com o nome `ck_` da regra (recomendada).** Gatilho `trg_` + tabela + regra (`trg_services_type_unchanged`). Função em `snake_case`, com verbo (`set_updated_at`), `set search_path = ''` e nomes qualificados. O gatilho que recusa levanta a violação de `check` com o nome `ck_` da regra (`ck_services_type_unchanged`), e o repositório a trata como as demais restrições.
- [ ] **2. Sem convenção.** Cada tarefa escolhe os nomes.

**Texto proposto (opção 1):**

- `docs/padroes/banco.md`, "Estrutura", depois do item "Nomes explícitos de restrições e índices...": "Gatilhos com `trg_` + tabela + regra (`trg_services_type_unchanged`), funções em `snake_case` com verbo (`set_updated_at`), sempre com `set search_path = ''` e nomes qualificados. O gatilho que recusa uma gravação levanta a violação com o nome `ck_` da regra (`ck_services_type_unchanged`), e o repositório a converte como as demais restrições."

## Decisões técnicas

- Seguidas:
  - 0004 (Supabase);
  - 0005 (banco fechado ao navegador);
  - 0006 (SQL e `supabase-js`, sem mapeamento objeto-relacional);
  - 0009 (`updated_at`);
  - 0011 e 0021 (cópias e valores no agendamento);
  - 0012 (permissões em enum);
  - 0013 (porte gerado);
  - 0014 (sem conflito de horários: nenhuma restrição entre agendamentos);
  - 0018 (placa única e `client_vehicles`);
  - 0020 (`clients` e `staff` separadas);
  - 0022 (exclusão lógica);
  - 0024 e 0035 (sem teste automatizado de banco);
  - 0030 (plano gratuito: nada além do banco, do Auth e do Storage);
  - 0038 (o Docker continua sem hospedar nada).

### D1. Banco sem privilégios para as chaves públicas (nova, 0042)

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| Além da RLS ativada sem políticas, revogar dos papéis `anon` e `authenticated` todos os privilégios nas tabelas e funções de `public`. Os privilégios padrão do esquema também são revogados, para as tabelas e funções futuras. O `service_role` recebe explicitamente `select`, `insert`, `update` e `delete`. Toda função nova revoga `execute` de `public`, `anon` e `authenticated`. | Só a RLS sem políticas, com os privilégios padrão do Supabase | Uma segunda barreira para a decisão 0005: se alguém desativar a RLS ou criar uma política por engano no painel, a chave pública continua sem acesso. A concessão explícita ao `service_role` não depende da configuração padrão do projeto. Consequência aceita: toda migration que cria uma função precisa da revogação, e `banco.md` e `migration.md` passam a dizer isso. | nova, relacionada à 0005 |

**Texto proposto:** registro `0042-banco-sem-privilegios-publicos.md`.

- `docs/padroes/banco.md`, "Acesso", item novo depois do primeiro: "Além da RLS, os papéis `anon` e `authenticated` do Supabase não têm privilégio nas tabelas e funções de `public`; só o `service_role` tem. Toda função nova revoga `execute` de `public`, `anon` e `authenticated` (decisão 0042)."
- `workflows/procedimentos/migration.md`, "Escrever", item 4: "Toda tabela nova: RLS ativada, sem políticas;" passa a "Toda tabela nova: RLS ativada, sem políticas e sem privilégio para `anon` e `authenticated`; toda função nova revoga `execute` desses papéis e de `public`;".

### D2. CLI do Supabase fixada no projeto e banco local para conferir as migrations (nova, 0043)

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| A CLI do Supabase entra nas `devDependencies` com versão fixa (`supabase` 2.120.0, de 06/10/2026), e `npx supabase` usa essa versão em todas as máquinas. Antes do `db push`, toda migration é conferida num banco local descartável, com `npx supabase start` (Docker Desktop aberto) e `npx supabase db reset`. O agente nunca vincula o projeto real (`supabase link`) nem usa `--linked` ou `--db-url`. | (a) `npx supabase@<versão>` sob demanda, sem dependência, deixando a versão em cada comando da documentação. (b) Testes versionados em pgTAP (`supabase test db`), que contrariam a 0024. (c) Conferir só no projeto real, depois do `db push`. | Migration aplicada não se edita, e todos os ambientes usam o mesmo projeto: um erro vai direto para a produção e só se corrige com outra migration. O banco local mostra o erro antes, sem tocar no projeto real. A versão fixa evita que cada integrante gere `config.toml` e migrations com uma CLI diferente. Consequências aceitas: o `npm ci` baixa um binário de cerca de 150 MB (descompactado) por plataforma, também no CI e no estágio de dependências da imagem Docker, que não o leva para a imagem final; o primeiro `supabase start` baixa as imagens do banco, do Auth, da API REST e do gateway (cerca de 1 a 2 GB, uma vez). | nova, relacionada à 0006 e à 0038 |

**Texto proposto:** registro `0043-cli-e-banco-local-do-supabase.md`.

- `workflows/procedimentos/migration.md`, "Escrever", item novo depois do 4: "Conferir num banco local descartável: com o Docker Desktop aberto, `npx supabase start` e `npx supabase db reset`, que recria o banco local com as migrations e o `seed.sql`. Nunca com `--linked` ou `--db-url`, que apontam para o projeto real."
- `guia/regras.md`, "Limites", item do envio à `main`: "..., incorpora pull request, aplica migration ou publica;" passa a "..., incorpora pull request, aplica migration, vincula o projeto do Supabase (`supabase link`), usa `--linked` ou `--db-url` na CLI do Supabase ou publica; o único banco que o agente acessa é o local, descartável;".
- `.claude/settings.json`, `deny`, novos: `Bash(npx supabase link:*)`, `Bash(supabase link:*)`, `Bash(npx supabase db reset --linked:*)`, `Bash(npx supabase db reset --db-url:*)`.
- `AGENTS.md`, stack: "via supabase-js 2.117 e @supabase/ssr 0.12" passa a "via supabase-js 2.117 e @supabase/ssr 0.12, com a CLI do Supabase 2.120 para as migrations"; comandos, linha nova: "npx supabase db reset      recria o banco local (Docker) com as migrations e o seed.sql".
- `docs/plataforma/visao-geral.md`, linha "Dados" da stack: "... via `supabase-js` e `@supabase/ssr` | gerenciado; 2.117 e 0.12" passa a "... via `supabase-js` e `@supabase/ssr`; CLI do Supabase para as migrations | gerenciado; 2.117, 0.12 e 2.120".
- `supabase/README.md`, parágrafo novo: "`config.toml` configura o banco local, usado para conferir as migrations antes do `db push` (`workflows/procedimentos/migration.md`); `.temp/`, onde a CLI guarda o vínculo com o projeto, é ignorado pelo Git."

## Riscos e dúvidas

- **Q1 (responder na aprovação):** qual a versão do PostgreSQL do projeto? Ela aparece no painel, em Project Settings → Infrastructure. O `[db] major_version` do `config.toml` precisa ser a mesma, para o banco local se comportar como o real. Sem resposta, uso 17, o padrão dos projetos novos.
- Migration aplicada não se edita, e o `db push` vale na hora para a produção. A conferência local (D2) reduz o risco, mas não substitui a revisão do PR.
- O caminho do worktree tem espaços e acentos. Se a CLI ou o Docker falharem por isso, a conferência local roda num clone de caminho curto, apagado no fim, como na #6.
- A primeira execução local baixa as imagens do Supabase (D2). Elas ficam no Docker Desktop e podem ser apagadas depois, com `npx supabase stop --no-backup` e a remoção das imagens.
- O `seed-demo.sql` vai para o único projeto, que é a produção da demonstração. Os dados fictícios aparecem no catálogo público e no dashboard e não saem sem SQL manual, porque agendamentos são permanentes (RN030). Carregá-lo é escolha do integrante.
- Os clientes de demonstração não têm conta no Auth. As tarefas que mexem na conta do cliente (UC17, exclusão com remoção das credenciais; UC04) precisam tratar a conta ausente. Isso vai para o `02_relatorio.md` como pendência dessas tarefas.
- O gatilho da L4 recusa serviço por porte gravado sem os quatro valores na mesma transação. A `save_service` (UC13) precisa gravar tudo junto, e o `seed-demo.sql` também grava assim.
- Se a opção `--include-seed` não existir na CLI 2.120, vale o caminho alternativo da L6.

## Fora do escopo

- As seis funções de gravação em várias tabelas (L1).
- Aplicar a migration, carregar os seeds e rodar o script no projeto real: só o Yvan (`setup/questionario.md`).
- Passos no painel do Supabase: confirmação de e-mail, senha mínima e bucket `service-images`.
- Clientes do Supabase em `src/server`, repositórios, rotas, esquemas Zod e telas.
- Contas de acesso de demonstração no Auth e imagens dos serviços no Storage.
- Testes automatizados de banco (decisão 0024) e banco local no CI.

## Acréscimo de escopo (pedido do desenvolvedor, 18/10/2026)

Pedido durante a etapa 02: "como é um projeto de faculdade acho que podemos simplificar e fazer essa exigência e verificação com zod ao invés de configurar no supabase", sobre os três passos do painel (item 4 da "Preparação do banco").

Os três passos saem do painel, mas só a senha fica com o Zod. A confirmação de e-mail e o bucket não são validação de entrada e precisam de outro caminho:

| Passo do painel | Como fica | Por quê |
|---|---|---|
| Senha mínima de 8 caracteres | só o esquema Zod de senha (RS003), no servidor, antes de toda chamada que define senha; o script `create-admin.mjs` confere o mesmo formato. O Supabase Auth fica com o padrão dele (6), abaixo do esquema | o esquema já exige de 8 a 72 caracteres, com maiúscula, número e caractere especial; a configuração do painel era só uma segunda barreira |
| Desativar a confirmação de e-mail | toda conta é criada pelo servidor com a chave de serviço, por `auth.admin.createUser` e com o e-mail já confirmado (UC02, UC16, UC19 e o script). A aplicação nunca usa o cadastro público do Auth (`signUp`) | o Zod não muda o comportamento do Auth. Pela API de administração, a conta nasce confirmada, nenhum e-mail é enviado (decisão 0015) e a configuração do painel deixa de importar |
| Criar o bucket `service-images` | a migration inicial cria o bucket (`insert into storage.buckets ... on conflict do nothing`), com leitura pública, limite de 2 MB e os tipos JPEG, PNG e WebP. Sem políticas em `storage.objects`, só a chave de serviço grava | o Zod valida o arquivo antes do envio (RS015), mas não cria o bucket. Pela migration, o bucket vai junto no `db push` e também existe no banco local |

Com isso, a "Preparação do banco" fica com três passos, sem nenhuma configuração manual no painel.

### Mudanças no plano

- **Migration inicial:** bloco novo, depois da RLS, criando o bucket `service-images` (`public = true`, `file_size_limit = 2097152`, `allowed_mime_types = {image/jpeg, image/png, image/webp}`).
- **`supabase/config.toml`:** não define mais `minimum_password_length` nem `enable_confirmations`. O banco local fica com os padrões do Supabase, como o projeto real.
- **Critério 1 (verificação):** depois do `db reset`, `storage.buckets` tem o `service-images` com essas três propriedades. O envio e a leitura de arquivos são conferidos na tarefa do cadastro de serviço (UC13), que cria a rota de envio.
- **"Fora do escopo":** o item "Passos no painel do Supabase..." deixa de valer.
- **Decisão nova D3**, abaixo.

### D3. Preparação do Supabase sem configuração manual no painel (nova, 0044)

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| Nada é configurado à mão no painel do Supabase. A senha é exigida só pelo esquema Zod no servidor (RS003). Toda conta é criada pelo servidor com `auth.admin.createUser` e o e-mail já confirmado. O bucket `service-images` é criado pela migration. | Configurar no painel a confirmação de e-mail, a senha mínima e o bucket (como dizia `infraestrutura.md`) | Pedido do desenvolvedor para simplificar a preparação. Tudo o que o sistema precisa fica versionado e é aplicado pelo `db push`, igual no banco local. O cadastro só pelo servidor já é o fluxo do projeto (o navegador nunca fala com o Supabase), e a decisão 0015 já dispensa e-mails. Consequências aceitas: o Auth aceitaria senhas de 6 caracteres se alguém o chamasse direto com as chaves, que só existem no servidor; e as tarefas de cadastro (UC02, UC16 e UC19) precisam usar `auth.admin.createUser`, nunca `signUp`. | nova, relacionada à 0005 e à 0015 |

### Textos propostos

- `docs/plataforma/infraestrutura.md`, "Preparação do banco":
  - item 1: no texto aprovado na L1, "...os índices e a RLS;" passa a "...os índices, a RLS e o bucket `service-images` do Storage (leitura pública, gravação só pelo backend, até 2 MB, JPEG, PNG e WebP);";
  - item 4: sai. No lugar, um parágrafo depois da lista: "Nada é configurado à mão no painel do Supabase (decisão 0044): a senha é exigida pelo esquema de `src/shared/validation`, as contas são criadas pelo servidor já com o e-mail confirmado, e o bucket vem da migration."
- `docs/plataforma/seguranca.md`, RS003, implementação: "O mínimo de 8 também é configurado no Supabase Auth." passa a "O Supabase Auth fica com a configuração padrão; o esquema é aplicado no servidor antes de toda chamada que define senha, inclusive no script da conta de administrador (decisão 0044)."
- `docs/acesso/autenticacao.md`, "Perfis e contas", depois da primeira frase: "Toda conta é criada pelo servidor com a chave de serviço (`auth.admin.createUser`), já com o e-mail confirmado; a aplicação não usa o cadastro público do Supabase Auth, então nenhum e-mail é enviado (decisão 0015) e não há confirmação de e-mail (decisão 0044)."
- `docs/padroes/backend.md`, "Gravações e consultas": "Cadastro de conta: cria no Supabase Auth e depois o perfil;" passa a "Cadastro de conta: cria no Supabase Auth com `auth.admin.createUser` e o e-mail confirmado, nunca com `signUp`, e depois o perfil;".
- `docs/catalogo/dados.md`, "Observações", item das imagens: "...com leitura pública e gravação apenas pelo backend;" passa a "...com leitura pública e gravação apenas pelo backend, criado pela migration inicial com limite de 2 MB e os tipos JPEG, PNG e WebP;".
- `setup/questionario.md`, seção 6, item do Supabase: "criado, ainda sem configuração; faltam desativar a confirmação de e-mail, definir a senha mínima de 8 caracteres e criar o bucket `service-images`." passa a "criado; não precisa de configuração no painel (decisão 0044): o bucket `service-images` vem da migration da #17."
- Registro `docs/decisoes/0044-preparacao-sem-painel.md` e linha no índice, na etapa 03. Se a #17 for incorporada antes da #16, passa a 0043.

### Arquivos a mais

| Arquivo | Ação |
|---|---|
| `docs/plataforma/seguranca.md` | alterar: RS003 |
| `docs/padroes/backend.md` | alterar: cadastro de conta |
| `setup/questionario.md` | alterar: seção 6, item do Supabase |
| `docs/decisoes/0044-preparacao-sem-painel.md` | criar na etapa 03 |

`docs/plataforma/infraestrutura.md`, `docs/acesso/autenticacao.md`, `docs/catalogo/dados.md` e `docs/decisoes/CONTEXT.md` já estavam na lista. Nenhum arquivo do PR #16 muda além dos já previstos: a #16 altera a tabela do contêiner em `infraestrutura.md`, longe da "Preparação do banco".

### Estado da construção

Feito antes do acréscimo, dentro do plano aprovado:

- ramificação `feat/17-database-schema`, criada a partir da `origin/main` (a8328e5);
- `@supabase/supabase-js` 2.117.3 e `supabase` 2.120.0 instalados com versão exata;
- `npm audit --omit=dev`: nenhuma vulnerabilidade. Os 5 alertas altos do `npm audit` completo são antigos e vêm do `eslint-config-next`, só de desenvolvimento.

Nada mais é construído até a nova aprovação.
