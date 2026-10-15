# `src/server/http/` – Tratamento das requisições

`handler.ts` envolve toda rota: gera o `requestId`, converte `AppError` e erros de validação em Problem Details e qualquer outra falha em 500 genérico; `logger.ts` grava linhas JSON com nível e `requestId` (via `AsyncLocalStorage`); `respond.ts` padroniza respostas de sucesso e paginação.

## Vai aqui

- tratamento único, registro e respostas padronizadas

## Não vai aqui

- regras de negócio
- mensagens ao usuário (→ `src/shared/errors/`)
- registro de senhas, tokens, cookies ou corpos de autenticação (RS018)

## Referências

- `docs/padroes/backend.md` (Erros e Registro)
- `docs/padroes/api.md` (Erros)
