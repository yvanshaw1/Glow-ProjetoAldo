---
id: 0043
titulo: CLI do Supabase fixada no projeto e banco local para conferir as migrations
status: aceita
data: 2026-10-18
origem: issue #17, memoria/tarefas/17-banco-de-dados/01_plano.md (D2)
relacionados: [RNF010, RNF011, 0006, 0024, 0038]
---

# 0043 – CLI do Supabase fixada no projeto e banco local para conferir as migrations

## Decisão

A CLI do Supabase entra nas `devDependencies` com versão fixa (`supabase` 2.120.0), e `npx supabase` usa essa versão em todas as máquinas. Antes do `db push`, toda migration é conferida num banco local descartável, com `npx supabase start` (Docker Desktop aberto) e `npx supabase db reset`, que recria o banco local com as migrations e o `seed.sql`. O agente nunca vincula o projeto real (`supabase link`) nem usa `--linked` ou `--db-url`: o único banco que ele acessa é o local.

## Alternativa descartada

`npx supabase@<versão>` sob demanda, sem dependência, com a versão repetida em cada comando da documentação. Testes versionados em pgTAP (`supabase test db`), que contrariam a decisão 0024. Conferir só no projeto real, depois do `db push`.

## Justificativa

Migration aplicada não se edita, e todos os ambientes usam o mesmo projeto: um erro vai direto para a produção e só se corrige com outra migration. O banco local mostra o erro antes, sem tocar no projeto real, e a versão fixa evita que cada integrante gere `config.toml` e migrations com uma CLI diferente. Consequências aceitas: o `npm ci` baixa um binário de cerca de 150 MB (descompactado) por plataforma, também no CI e no estágio de dependências da imagem Docker, que não o leva para a imagem final; o primeiro `supabase start` baixa as imagens do banco, do Auth, da API REST, do Storage e do gateway, uma vez. O Docker continua sem hospedar nada (decisão 0038): o banco local é só para conferência.
