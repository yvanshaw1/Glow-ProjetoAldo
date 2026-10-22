# `tests/lib/` – Testes do cliente da API

Testes do cliente HTTP único das páginas (`src/lib/api-client.ts`): JSON, Problem Details, redirecionamentos do 401 e do 403 de troca de senha, nenhuma chamada repetida, a montagem dos parâmetros de consulta (`withQuery`) e as respostas da lista de demonstração (`src/lib/demo/`), com o corpo das leituras por `POST`. Simulam o `fetch` e o `location` com `vi.stubGlobal`, a lista de demonstração com `vi.mock` e o relógio com `vi.useFakeTimers`, sem servidor, navegador, rede ou espera (decisões 0052 e 0055).

## Vai aqui

- um arquivo de teste para cada arquivo de `src/lib/` com comportamento próprio (`api-client.test.ts`)
- os casos de `src/lib/demo/`, pelo `apiRequest`, em `api-client.test.ts`

## Não vai aqui

- componentes, hooks e o contexto da sessão: são conferidos à mão
- testes que chamam a API de verdade

## Referências

- `docs/padroes/frontend.md` (Comunicação com a API)
- `docs/padroes/testes.md`
