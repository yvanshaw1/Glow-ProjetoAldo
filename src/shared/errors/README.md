# `src/shared/errors/` – Catálogo de erros

Os códigos de erro, o status HTTP e a mensagem ao usuário de cada um, e a classe `AppError` lançada pelos serviços. O backend usa para responder; o frontend, para exibir.

## Vai aqui

- o catálogo de códigos e mensagens da tabela de `docs/padroes/api.md`
- a classe `AppError`

## Não vai aqui

- mensagens técnicas ou do banco
- o tratamento das respostas (→ `src/server/http/handler.ts`)
- código novo sem atualizar a tabela de `docs/padroes/api.md` no mesmo PR

## Referências

- `docs/padroes/api.md` (Erros)
- `docs/padroes/backend.md` (Erros)
