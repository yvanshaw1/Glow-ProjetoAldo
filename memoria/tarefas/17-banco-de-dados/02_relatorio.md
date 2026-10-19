---
issue: 17
pull_request: 18
---

# Relatório: Banco de dados: esquema completo, dados iniciais e conta de administrador

## O que foi feito

Agora existe o banco do Glow que `docs/plataforma/infraestrutura.md` descreve em "Preparação do banco", e nada precisa ser configurado à mão no painel do Supabase (decisão 0044):

- **Migration inicial:** os 7 tipos e as 16 tabelas dos `dados.md` e de `autenticacao.md`, com as restrições nomeadas. O porte é gerado pelo tipo (RN002). Os gatilhos garantem as regras entre linhas (tipo imutável, adicional só com principal e os quatro preços por porte no fim da transação; RN006 e RN009) e o `updated_at` (RNF011). Há os índices dos `dados.md`, a RLS sem políticas, nenhum privilégio para as chaves públicas (decisão 0042) e o bucket `service-images`.
- **`seed.sql`:** as formas de pagamento sem ajuste, a disponibilidade inicial (L2) e a linha da empresa.
- **`seed-demo.sql`:** opcional, com catálogo, clientes, veículos e cerca de 250 agendamentos fictícios em torno do dia da carga, para o UC01 e o UC09.
- **`create-admin.mjs`:** cria a conta de administrador no Auth, já confirmada, e o `staff` com `is_admin` (RN027).

As seis funções de gravação em várias tabelas ficaram para a tarefa de cada área (L1). A CLI do Supabase passou a ser dependência fixa, e toda migration é conferida num banco local antes do `db push` (decisão 0043). Nenhuma tela, rota ou código de `src/` mudou.

## Arquivos alterados

- `package.json`, `package-lock.json`: `@supabase/supabase-js` 2.117.3 em `dependencies` e `supabase` 2.120.0 em `devDependencies`, com versão exata.
- `supabase/config.toml`, `supabase/.gitignore`: gerados pelo `npx supabase init`. No `config.toml`: `project_id = "glow"`, PostgreSQL 17 e `realtime`, `edge_runtime` e `analytics` desligados.
- `supabase/migrations/20261018232812_initial_schema.sql`: criado. O `.gitkeep` da pasta saiu.
- `supabase/seed.sql`, `supabase/seed-demo.sql`, `supabase/scripts/create-admin.mjs`: criados.
- `supabase/README.md`, `supabase/scripts/README.md`: o banco local e o comportamento do script.
- `docs/padroes/banco.md`: privilégios (D1), funções de gravação por área (L1), nomes de gatilhos e funções (L7) e formatos que o banco confere (L5).
- `docs/padroes/backend.md`: cadastro de conta com `auth.admin.createUser` (D3).
- `docs/plataforma/infraestrutura.md`: "Preparação do banco" com três passos, carga dos seeds e nenhum passo no painel (L1, L6, D3).
- `docs/plataforma/seguranca.md`: implementação do RS003 (D3).
- `docs/plataforma/visao-geral.md`, `AGENTS.md`: a CLI do Supabase na stack e o comando do banco local (D2).
- `docs/acesso/autenticacao.md`: contas criadas pelo servidor (D3) e e-mail em minúsculas em `login_attempts` (L5).
- `docs/catalogo/dados.md`, `docs/clientes/dados.md`, `docs/configuracoes/dados.md`, `docs/equipe/dados.md`: regras garantidas pelo banco e valores iniciais (L2 a L5, D3).
- `workflows/procedimentos/migration.md`: privilégios, conferência local e carga dos seeds (D1, D2, L6).
- `guia/regras.md`, `.claude/settings.json`: o agente não vincula o projeto real nem usa `--linked` ou `--db-url` (D2).
- `setup/questionario.md`: o projeto do Supabase não precisa de configuração no painel (D3).
- `docs/decisoes/0042-banco-sem-privilegios-publicos.md`, `0043-cli-e-banco-local-do-supabase.md`, `0044-preparacao-sem-painel.md` e `docs/decisoes/CONTEXT.md`: criados e alterado.
- `memoria/tarefas/17-banco-de-dados/`: plano, notas e este relatório.

`docs/agendamento/dados.md` estava na lista do plano, mas nenhum texto aprovado o alterava, e ficou igual.

## Testes executados

- `npm run check`: aprovado (formatação, tipos, lint e testes). O ESLint lê o `create-admin.mjs`. Não há teste automatizado novo (decisões 0024 e 0035).
- **Banco local** (Supabase CLI 2.120, Docker Desktop, PostgreSQL 17.11): três `npx supabase db reset` sem erro e `npx supabase db lint` sem erros.
- **Roteiro de 112 casos**, em transação desfeita no fim: **112 OK, 0 falhas**. Cobre os critérios 1 a 8 e as demais regras dos `dados.md`, com o nome da restrição esperada em cada recusa:
  - tipos, tabelas, RLS, políticas, seed e bucket;
  - privilégios, inclusive a `anon` recusada com a RLS desligada;
  - porte gerado; placa;
  - serviços: campos por tipo, preço, duração, tipo imutável, quatro preços, adicionais e nomes sem diferenciar maiúsculas;
  - agendamentos: status e datas, valores, previsão, vínculo cliente–veículo, reagendamento único e exclusões bloqueadas;
  - disponibilidade; `staff`, clientes, cargos, `login_attempts`, formas de pagamento e empresa;
  - `updated_at` nas 11 tabelas editáveis;
  - gravação pelo `service_role` passando pelos gatilhos.
- **API REST local (critério 2):** a chave pública, antiga e `sb_publishable_`, recebe `permission denied` (42501) em `GET`, `POST` e `PATCH`. A `service_role` e a `sb_secret_` leem.
- **`seed-demo.sql` (critério 9):** carga sem erro e as 16 regras de coerência em 0:
  - horário dentro da disponibilidade e fora da pausa;
  - previsão pela RN034, com quatro exemplos conferidos à mão;
  - subtotal, duração e total iguais aos itens e ao catálogo;
  - cópias do RN037 iguais aos cadastros;
  - RN005 e RN006;
  - reagendamentos ligados aos originais (RN020);
  - serviço excluído só em agendamentos antigos;
  - datas em ordem.

  O catálogo público tem 7 principais, 4 complementares e 4 adicionais; ficam ocultos um serviço inativo, um excluído e um de categoria inativa. A receita, o ticket médio e a taxa de cancelamento por mês saem pelas fórmulas da RN021. A segunda carga e a recarga do `seed.sql` não mudam nenhuma contagem.
- **`create-admin.mjs` (critério 10), contra o Supabase local:**
  - recusa variável faltando, e-mail inválido, senha sem número e senha de 7 caracteres;
  - cria a conta com o e-mail normalizado e confirmado, e o login com a senha dá 200;
  - na segunda execução, não altera nada;
  - recusa e-mail que já tem conta no Auth;
  - remove a conta do Auth quando a gravação em `staff` falha;
  - funciona com a chave antiga e com a `sb_secret_`.
- **Pendente (Yvan), no projeto real:**
  - `npx supabase link` e `npx supabase db push --include-seed`, na pasta `App/` e na ramificação do PR, depois da aprovação;
  - depois, `node --env-file=.env.local supabase/scripts/create-admin.mjs` e a conta conferida em Authentication;
  - o `seed-demo.sql` pelo SQL Editor, se quiser.
- **Critério 11:** o check `check` do PR.

## Documentação atualizada

- **Módulos:** os listados em "Arquivos alterados".
- **Lacunas resolvidas, todas com a opção 1:**
  - L1, funções de gravação por área → `infraestrutura.md` e `banco.md`;
  - L2, valores iniciais → `configuracoes/dados.md`;
  - L3, nome fixo e um único administrador → `equipe/dados.md` e `supabase/scripts/README.md`;
  - L4, quatro preços garantidos no fim da transação → `catalogo/dados.md`;
  - L5, só os formatos de que a unicidade depende → `banco.md`, `clientes/dados.md`, `equipe/dados.md`, `catalogo/dados.md` e `autenticacao.md`;
  - L6, `seed.sql` pela CLI e `seed-demo.sql` pelo SQL Editor → `infraestrutura.md` e `migration.md`;
  - L7, nomes de gatilhos e funções → `banco.md`.
- **Decisões:** 0042, 0043 e 0044 criadas. O PR #16, ainda aberto, cria a 0041. Se esta tarefa for incorporada antes dele, as três passam a 0041, 0042 e 0043, junto com as citações em `banco.md`, `migration.md`, `infraestrutura.md`, `seguranca.md`, `autenticacao.md`, `setup/questionario.md` e a migration.
- **Documentos formais a atualizar:**
  - **Documentação de Arquitetura de Software, seção 5:**
    - o banco garante também a forma normalizada de placa e e-mail, nomes únicos sem diferenciar maiúsculas, um único administrador e os quatro preços por porte;
    - gatilhos com `trg_`, funções com `search_path` vazio e erro com o nome `ck_` da regra;
    - nenhum privilégio para `anon` e `authenticated`;
    - as funções de gravação entram com cada funcionalidade.
  - **Documentação de Arquitetura de Software, seção 5.2 (quadros de `business_hours`, `business_settings`, `staff`, `login_attempts` e `services`):** valores iniciais e as restrições novas de L3 a L5.
  - **Documentação de Arquitetura de Software, seção 7 (Quadro 35), RS003:** o mínimo de 8 não é mais configurado no Supabase Auth.
  - **Documentação de Arquitetura de Software, seção 8:**
    - "Preparação do banco" com três passos e sem nenhum passo no painel;
    - o bucket criado pela migration;
    - `db push --include-seed`;
    - o `seed-demo.sql` pelo SQL Editor;
    - a conferência local das migrations com a CLI fixada.
  - **Documentação de Arquitetura de Software, seção 9 (Quadro 38):** decisões 0042, 0043 e 0044.
  - **Documentação de Arquitetura de Software, stack:** CLI do Supabase 2.120.
  - **Documentação de Desenvolvimento com IA, regras da IA e `deny` do `.claude/settings.json`:** o agente não vincula o projeto do Supabase nem usa `--linked` ou `--db-url`.

## Pendências

- Aplicar a migration e os seeds e criar o administrador no projeto real: só o Yvan, antes da incorporação (`workflows/procedimentos/migration.md`). Hoje o projeto real não está vinculado em nenhuma pasta: o `supabase/.temp/` da pasta acima de `App/` não tem `project-ref`. O `npx supabase link` precisa ser feito em `App/`, onde estão o `config.toml` e as migrations.
- As seis funções de gravação: nas tarefas de UC21 (`save_role`), UC05 e UC18 (`link_vehicle`), UC13 e UC14 (`save_service`), UC06 e UC11 (`create_appointment`), UC26 (`update_appointment`) e UC25 (`reschedule_appointment`).
- As tarefas de cadastro (UC02, UC16 e UC19) precisam criar as contas com `auth.admin.createUser` e o e-mail confirmado (decisão 0044).
- Os clientes de demonstração não têm conta no Auth. As tarefas que mexem na conta do cliente, como a exclusão com remoção das credenciais (UC17), precisam tratar a conta ausente.
- A taxa de cancelamento do dashboard ainda depende da data que define o período (`scheduled_at` ou `created_at`), que `docs/agendamento/calculos.md` deixa para a tarefa do dashboard. A conferência local usou `scheduled_at`.
