# `tests/validation/` – Testes dos esquemas

Um arquivo por esquema de `src/shared/validation/` (`clients.test.ts`, `vehicles.test.ts`...): normalização e validação de cada formato.

## Vai aqui

- casos de RN035: nomes com partículas, e-mail, celular, placa nos dois padrões, ano, CNPJ, senha, valores, descarte de campos não previstos

## Não vai aqui

- testes que dependem do banco, como unicidade
- testes de componentes de tela

## Referências

- `docs/plataforma/RN035-formatos-dos-dados.md`
- `docs/padroes/testes.md`
