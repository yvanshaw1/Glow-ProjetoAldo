---
id: 0042
titulo: Banco sem privilégios para as chaves públicas
status: aceita
data: 2026-10-18
origem: issue #17, memoria/tarefas/17-banco-de-dados/01_plano.md (D1)
relacionados: [RS008, RS016, 0005]
---

# 0042 – Banco sem privilégios para as chaves públicas

## Decisão

Além da RLS ativada sem políticas, os papéis `anon` e `authenticated` do Supabase não têm nenhum privilégio nas tabelas e funções do esquema `public`, e os privilégios padrão desse esquema também são revogados para eles, para que as tabelas e funções futuras nasçam fechadas. O `service_role` recebe explicitamente `select`, `insert`, `update` e `delete` nas tabelas. Toda função nova revoga `execute` de `public`, `anon` e `authenticated`.

## Alternativa descartada

Só a RLS sem políticas, com os privilégios padrão do Supabase.

## Justificativa

É uma segunda barreira para a decisão 0005: se alguém desativar a RLS ou criar uma política por engano no painel, a chave pública continua sem acesso. A concessão explícita ao `service_role` não depende da configuração padrão do projeto, que pode expor ou não as tabelas novas à API. Consequência aceita: toda migration que cria uma função precisa da revogação, como dizem `docs/padroes/banco.md` e `workflows/procedimentos/migration.md`. Os gatilhos continuam funcionando para o `service_role`, porque a função de um gatilho não exige `execute` de quem grava.
