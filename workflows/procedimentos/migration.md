# Procedimento: migration

Convenções do banco em `docs/padroes/banco.md`. Todos os ambientes usam o mesmo projeto do Supabase, então uma migration aplicada vale na hora para a produção.

## Escrever (agente ou desenvolvedor)

1. Criar o arquivo em `supabase/migrations/` com `npx supabase migration new <nome_em_ingles>`.
2. Só acrescentar: tabelas, colunas, restrições, índices ou funções. Nada que remova ou renomeie o que o código publicado ainda usa.
3. Remoção necessária: em uma migration posterior, depois que o código que deixou de usar o item estiver em produção.
4. Toda tabela nova: RLS ativada, sem políticas; `created_at` (e `updated_at` com o gatilho, se editável); nomes de restrições com `fk_`, `uq_`, `ck_`, `idx_`.
5. Uma migration já aplicada nunca é editada: correção é uma migration nova.
6. Atualizar o `dados.md` do assunto no mesmo pull request.

## Aplicar (só o integrante designado em `setup/questionario.md`)

1. Depois da aprovação do pull request e antes da incorporação.
2. `npx supabase db push`, com o projeto vinculado na máquina do integrante. O agente não executa este comando, e o CI não acessa o banco.
3. Comentar no pull request que a migration foi aplicada; então incorporar.

## Dados iniciais

`supabase/seed.sql`: quatro formas de pagamento sem ajuste, os sete dias da semana e a linha de dados da empresa. Dados de demonstração, opcionais: `supabase/seed-demo.sql`. A conta de administrador é criada por `supabase/scripts/create-admin.mjs`, com `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` das variáveis de ambiente, nunca escritas em arquivo versionado.
