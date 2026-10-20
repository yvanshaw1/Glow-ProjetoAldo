# `tests/http/` – Testes do tratamento único

Testes do tratamento único das requisições (`src/server/http/`): Problem Details, recusa por formato, tamanho e origem, e registro sem dados sensíveis. Montam a requisição e a rota no próprio teste, sem servidor, banco ou rede (decisão 0052).

## Vai aqui

- um arquivo de teste para cada arquivo de `src/server/http/` (`handler.test.ts`, `logger.test.ts`, `respond.test.ts`)

## Não vai aqui

- rotas de `src/app/api/`, que dependem do banco e da sessão
- testes de componentes de tela

## Referências

- `docs/padroes/api.md`
- `docs/padroes/backend.md`
- `docs/padroes/testes.md`
