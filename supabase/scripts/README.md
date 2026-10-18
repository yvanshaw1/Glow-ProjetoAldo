# `supabase/scripts/` – Scripts de operação do banco

`create-admin.mjs` cria a conta de administrador no Supabase Auth e o registro em `staff` com `is_admin`. Executar com `node --env-file=.env.local supabase/scripts/create-admin.mjs`.

O script confere os formatos do e-mail e da senha (RN035, RS003). Se o administrador já existe, termina sem alterar nada. Se a gravação em `staff` falha, remove a conta criada no Auth. Nunca exibe o e-mail, a senha nem a chave.

## Vai aqui

- scripts executados por pessoas que usam o Supabase com a chave de serviço

## Não vai aqui

- scripts de verificação sem banco (→ `tools/`)
- credenciais escritas no arquivo: `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` vêm do ambiente
- execução pelo agente: quem roda é o integrante designado

## Referências

- `docs/plataforma/infraestrutura.md`
