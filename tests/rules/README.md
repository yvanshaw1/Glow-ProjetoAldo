# `tests/rules/` – Testes das regras puras

Um arquivo por arquivo de `src/server/rules/`: `pricing.test.ts`, `status-transitions.test.ts`, `scheduling.test.ts` e `editing.test.ts`, escritos antes do código (TDD).

## Vai aqui

- casos da tabela de `docs/padroes/testes.md`, com valores esperados tirados das RN
- nomes de teste em inglês que descrevem o comportamento (`rejects a past date for clients`)
- o instante atual passado pelo teste, nunca lido do relógio

## Não vai aqui

- acesso a banco, rede ou variáveis de ambiente
- valor esperado copiado da execução do próprio código

## Referências

- `docs/agendamento/calculos.md`
- `docs/padroes/testes.md`
