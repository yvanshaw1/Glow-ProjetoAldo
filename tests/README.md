# `tests/` – Testes automatizados (Vitest)

Os testes espelham o código: `rules/` testa `src/server/rules/`, `validation/` testa `src/shared/validation/` e `http/` testa `src/server/http/`. Rápidos, independentes e sem banco, rede ou espera.

## Vai aqui

- arquivos `<nome>.test.ts` em `rules/`, `validation/` e `http/`

## Não vai aqui

- testes que acessam banco, rede ou a API
- dados pessoais reais
- fluxos de tela: são testados à mão na pré-visualização (decisão 0045)

## Referências

- `docs/padroes/testes.md`
- `workflows/procedimentos/testes.md`
