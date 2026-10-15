# `supabase/scripts/` – Scripts de operação do banco

`create-admin.mjs` cria a conta de administrador no Supabase Auth e o registro em `staff` com `is_admin`. Executar com `node --env-file=.env.local supabase/scripts/create-admin.mjs`.

## Vai aqui

- scripts executados por pessoas que usam o Supabase com a chave de serviço

## Não vai aqui

- scripts de verificação sem banco (→ `tools/`)
- credenciais escritas no arquivo: `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` vêm do ambiente
- execução pelo agente: quem roda é o integrante designado

## Referências

- `docs/plataforma/infraestrutura.md`
