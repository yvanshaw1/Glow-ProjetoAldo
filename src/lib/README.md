# `src/lib/` – Infraestrutura do cliente

`api-client.ts`, o único cliente HTTP das páginas (JSON, cookie de sessão, Problem Details, 401, 403 de troca de senha e 409 de conflito) e a montagem dos parâmetros de consulta (`withQuery`), e `utils.ts`, com o `cn()` do shadcn.

## Vai aqui

- `api-client.ts` e `utils.ts`

## Não vai aqui

- formatação de valores (→ `src/shared/format/`)
- código de servidor (→ `src/server/`)
- novos "utils" genéricos: cada função mora no módulo que a usa

## Referências

- `docs/padroes/frontend.md` (Comunicação com a API)
