---
id: 0044
titulo: Preparação do Supabase sem configuração manual no painel
status: aceita
data: 2026-10-18
origem: issue #17, memoria/tarefas/17-banco-de-dados/01_plano.md (Acréscimo de escopo, D3)
relacionados: [RS002, RS003, RS015, 0005, 0015]
---

# 0044 – Preparação do Supabase sem configuração manual no painel

## Decisão

Nada é configurado à mão no painel do Supabase. A senha é exigida só pelo esquema Zod de `src/shared/validation`, aplicado no servidor antes de toda chamada que define senha (RS003). Toda conta é criada pelo servidor com `auth.admin.createUser` e o e-mail já confirmado, nunca com o cadastro público (`signUp`). O bucket `service-images` é criado pela migration inicial, com leitura pública, limite de 2 MB e os tipos JPEG, PNG e WebP.

## Alternativa descartada

Configurar no painel a confirmação de e-mail, a senha mínima de 8 caracteres e o bucket, como dizia a preparação do banco em `docs/plataforma/infraestrutura.md`.

## Justificativa

Pedido do desenvolvedor para simplificar a preparação. Tudo o que o sistema precisa fica versionado e é aplicado pelo `db push`, igual no banco local. O cadastro só pelo servidor já é o fluxo do projeto, em que o navegador nunca fala com o Supabase, e a decisão 0015 já dispensa e-mails. Consequências aceitas: o Supabase Auth fica com o padrão dele (senha mínima de 6 caracteres) e aceitaria uma senha mais curta se alguém o chamasse direto com as chaves, que só existem no servidor; as tarefas de cadastro (UC02, UC16 e UC19) precisam usar `auth.admin.createUser`.
