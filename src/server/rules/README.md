# `src/server/rules/` – Regras puras

Funções puras das regras de negócio, desenvolvidas com TDD: `pricing.ts`, `status-transitions.ts`, `scheduling.ts` e `editing.ts`. Recebem tudo por parâmetro, inclusive o instante atual e a disponibilidade, e devolvem resultados; não gravam nada.

## Vai aqui

- funções puras de preço, transições de status, datas e previsão de conclusão, e edição
- um arquivo por conjunto de regras, testado em `tests/rules/` com o mesmo nome

## Não vai aqui

- imports de `repositories/`, do Supabase, de `process.env` ou leitura do relógio (`new Date()` sem parâmetro)
- indicadores do dashboard: são agregações por período, calculadas no banco ou no serviço `dashboard`, como o plano da tarefa decidir (`docs/agendamento/calculos.md`)
- código HTTP

## Referências

- `docs/agendamento/calculos.md`
- `docs/padroes/testes.md`
- `docs/decisoes/0035-tdd-nas-regras.md`
