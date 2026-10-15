# `src/shared/validation/` – Esquemas Zod

Um arquivo por módulo (`clients.ts`, `vehicles.ts`, `appointments.ts`...). Cada esquema primeiro normaliza (espaços, caixa, máscaras) e depois valida tipo, formato e tamanho. Os mesmos esquemas servem aos formulários e às rotas.

## Vai aqui

- esquemas Zod e os tipos de entrada derivados deles (`z.infer`)
- regras de formato de RN035: nomes, e-mail, celular, placa, ano, CNPJ, senha, valores, horários

## Não vai aqui

- verificação que depende do banco, como unicidade de e-mail ou de placa (→ serviço no servidor)
- cálculos de negócio (→ `src/server/rules/`)
- aceitação de valores que o sistema calcula (preço, total, porte, status, previsão)

## Referências

- `docs/plataforma/RN035-formatos-dos-dados.md`
- `docs/padroes/api.md` (Validação)
