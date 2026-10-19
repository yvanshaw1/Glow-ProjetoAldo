# `/api/auth/change-password`

Guard: `requireUser`, aceitando a senha inicial pendente. Serviço: `src/server/services/auth.ts`.

| Método | Finalidade |
|---|---|
| `POST` | Troca a senha, inclusive no primeiro acesso. |

Entrada, resposta e erros de cada método: `docs/acesso/rotas.md`.

## Vai aqui

- `route.ts`, exportando só `POST`
- em cada método: guard, validação com o esquema de `src/shared/validation/`, chamada ao serviço e resposta pelo `src/server/http/`

## Não vai aqui

- regra de negócio, cálculo ou consulta ao Supabase
- esquemas, tipos ou funções auxiliares (→ `src/shared/` ou `src/server/`)
- método não documentado: mudar o contrato exige atualizar o `rotas.md` no mesmo PR
- tratamento de erro próprio: o `handler.ts` responde todos os erros

## Referências

- `docs/acesso/rotas.md`
- `docs/padroes/api.md`
- `docs/padroes/backend.md`
