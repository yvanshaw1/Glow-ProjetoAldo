# `src/server/services/` – Serviços

Um arquivo por módulo do backend: `auth.ts`, `catalog.ts`, `clients.ts`, `vehicles.ts`, `appointments.ts`, `dashboard.ts`, `staff.ts`, `roles.ts` e `settings.ts`. O serviço aplica as regras da análise: busca os dados nos repositórios, chama as funções de `rules/`, decide e grava.

## Vai aqui

- orquestração das regras de cada módulo e lançamento de `AppError` com códigos do catálogo

## Não vai aqui

- `Request`, `Response` ou status HTTP (→ rota)
- nomes de tabelas, colunas ou consultas (→ `repositories/`)
- cálculos puros (→ `rules/`)

## Referências

- `docs/padroes/backend.md` (Camadas e Módulos)
- os casos de uso e as regras do assunto em `docs/`
