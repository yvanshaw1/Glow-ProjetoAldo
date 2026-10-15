# `supabase/` – Banco de dados

Tudo o que cria ou alimenta o banco: `config.toml` (gerado por `npx supabase init`), `migrations/`, `seed.sql` (formas de pagamento, dias da semana e a linha da empresa), `seed-demo.sql` (dados fictícios, opcional) e `scripts/`.

`migrations/` não tem README porque a CLI do Supabase lê todos os arquivos dela. Regras das migrations: um arquivo por mudança, criado com `npx supabase migration new <nome_em_ingles>`; só acrescentar, nunca remover ou renomear o que o código publicado usa; migration aplicada nunca é editada; toda tabela nova com RLS ativada e sem políticas; aplicação só pelo integrante designado.

## Vai aqui

- migrations, dados iniciais e scripts de operação do banco

## Não vai aqui

- código da aplicação (→ `src/`)
- dados pessoais reais ou cópias do banco
- senhas e chaves: vêm das variáveis de ambiente

## Referências

- `workflows/procedimentos/migration.md`
- `docs/padroes/banco.md`
- `docs/plataforma/infraestrutura.md` (Preparação do banco)
