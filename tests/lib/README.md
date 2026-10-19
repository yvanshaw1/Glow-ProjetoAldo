# `tests/lib/` – Testes do cliente da API

Testes do cliente HTTP único das páginas (`src/lib/api-client.ts`): JSON, Problem Details, redirecionamentos do 401 e do 403 de troca de senha, e nenhuma chamada repetida. Simulam o `fetch` e o `location` com `vi.stubGlobal`, sem servidor, navegador ou rede (decisão 0050).

## Vai aqui

- um arquivo de teste para cada arquivo de `src/lib/` com comportamento próprio (`api-client.test.ts`)

## Não vai aqui

- componentes, hooks e o contexto da sessão: são conferidos à mão
- testes que chamam a API de verdade

## Referências

- `docs/padroes/frontend.md` (Comunicação com a API)
- `docs/padroes/testes.md`
