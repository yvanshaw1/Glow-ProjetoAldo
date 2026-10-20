# `tests/auth/` – Testes da proteção das páginas

Testes das funções puras de `src/server/auth/`: hoje, `page-access.ts`, que decide para onde o `src/proxy.ts` leva cada pessoa conforme o endereço pedido, o perfil, as permissões e a troca de senha pendente, inclusive o parâmetro `next`. Montam as contas no próprio teste, sem servidor, banco ou rede (decisão 0052).

## Vai aqui

- um arquivo de teste para cada arquivo de funções puras de `src/server/auth/` (`page-access.test.ts`)

## Não vai aqui

- sessão, guards, contas e tentativas de login: dependem do Supabase e são conferidos à mão
- o `src/proxy.ts` inteiro

## Referências

- `docs/acesso/protecao-das-paginas.md`
- `docs/padroes/testes.md`
