# `src/server/repositories/` – Acesso a dados

Um arquivo por tabela ou grupo de tabelas. É a única camada que conhece tabelas e colunas: declara o tipo das linhas (`snake_case`) e as converte para os tipos do código (`camelCase`).

## Vai aqui

- consultas com `supabase-js`, com dados relacionados na mesma consulta ou em lote (nunca N+1)
- chamadas às funções SQL via `rpc` para gravações em várias tabelas
- conferência do `error` de toda chamada e conversão de violações de restrição (`uq_vehicles_plate` → `PLATE_IN_USE`)
- filtro de registros com `deleted_at` em toda listagem e seleção

## Não vai aqui

- regras de negócio (→ `services/` e `rules/`)
- SQL montado por concatenação
- criação de tabelas ou colunas (→ migration em `supabase/`)

## Referências

- `docs/padroes/banco.md`
- o `dados.md` de cada assunto em `docs/`
