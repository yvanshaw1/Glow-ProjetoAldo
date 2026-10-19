# `tests/` – Testes automatizados (Vitest)

Os testes espelham o código: `rules/` testa `src/server/rules/`, `validation/` testa `src/shared/validation/`, `http/` testa `src/server/http/` e `lib/` testa `src/lib/`. Rápidos, independentes e sem banco, rede ou espera.

## Vai aqui

- arquivos `<nome>.test.ts` em `rules/`, `validation/`, `http/` e `lib/`

## Não vai aqui

- testes que acessam banco, rede ou a API
- dados pessoais reais
- fluxos de tela: são testados à mão na pré-visualização (decisão 0050)

## Referências

- `docs/padroes/testes.md`
- `workflows/procedimentos/testes.md`
