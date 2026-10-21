# `tests/format/` – Testes da formatação

Testes das funções de exibição de `src/shared/format/`, que também servem de máscara nos campos (RN035, coluna Exibição). Sem servidor, navegador ou rede (decisão 0052).

## Vai aqui

- um arquivo de teste para cada arquivo de `src/shared/format/` (`phone.test.ts`, `cnpj.test.ts`, `currency.test.ts`, `date.test.ts`, `duration.test.ts`, `business-hours.test.ts`, `address.test.ts`)

## Não vai aqui

- normalização de entrada: é dos esquemas, testados em `tests/validation/`
- componentes e campos de formulário: são conferidos à mão

## Referências

- `docs/plataforma/RN035-formatos-dos-dados.md`
- `docs/padroes/testes.md`
