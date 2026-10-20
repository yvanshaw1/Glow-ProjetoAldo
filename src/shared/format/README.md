# `src/shared/format/` – Formatação para exibição

Funções que transformam valores gravados em texto para a tela, com a API `Intl`: moeda (`R$ 1.250,00`), telefone, placa, CNPJ, data `dd/mm/aaaa`, horário e duração; datas e horários no fuso da empresa (`COMPANY_TIME_ZONE`).

## Vai aqui

- funções puras de exibição, sem dependências externas; os campos também as usam como máscara na digitação, e o campo monetário lê os algarismos digitados como centavos (`readCurrencyInput`)

## Não vai aqui

- normalização de entrada (→ `src/shared/validation/`)
- bibliotecas de datas
- textos de mensagens (→ `src/shared/errors/` ou `constants/`)

## Referências

- `docs/plataforma/RN035-formatos-dos-dados.md` (coluna Exibição)
- `docs/plataforma/requisitos.md` (RNF016)
