# `src/lib/demo/` – Dados das telas de demonstração

Enquanto a rota de uma tela não existe, o `apiRequest` responde no lugar dela com os dados desta pasta, depois de 400 ms e sem chamar a rede (decisão 0055). `routes.ts` tem a lista das rotas de demonstração; `match.ts` acha a entrada pelo método e pelo caminho e faz a espera; `list.ts` pagina, busca e filtra uma lista fixa (`demoPage`).

## Vai aqui

- `routes.ts`, `match.ts` e `list.ts`
- um `<módulo>.ts` de dados por módulo do backend (`clients.ts`, `appointments.ts`), com os tipos de `src/shared/api/` e só os dados fictícios do `supabase/seed-demo.sql`

## Não vai aqui

- dado real ou pessoal
- esquema de validação (→ `src/shared/validation/`, com a rota)
- tipo de resposta (→ `src/shared/api/`)
- componente ou aviso de tela (→ `src/components/`)

## Acrescentar uma rota

- Uma entrada em `DEMO_ROUTES` com o método e o caminho de `rotas.md`, com `:nome` para o parâmetro, como `/api/admin/clients/:id`.
- A leitura, inclusive o `POST` que não grava, leva `load`, que importa o módulo de dados (`import("./clients")`) e devolve a resposta: uma função que recebe os parâmetros do caminho e a consulta. A listagem usa `demoPage`; o filtro que não é igualdade e a ordenação ficam na resposta, antes dele.
- A gravação que a tela usa entra sem `load` e é recusada com `NOT_IMPLEMENTED`. Outro método no mesmo caminho, fora da lista, vai à rede.

## Tirar uma rota

A tarefa que constrói a rota tira a entrada dela e, se ninguém mais os usa, os dados do módulo, junto com o aviso da tela, no mesmo PR. A que tirar a última remove esta pasta, o código `NOT_IMPLEMENTED` e o `DemoNotice`.

## Referências

- `docs/padroes/componentes.md` (Telas de demonstração)
- decisão 0055 (`docs/decisoes/`)
