# `/api/admin/clients`

Guard: `requirePermission('clients')`. Serviço: `src/server/services/clients.ts`. Subpastas: `[id]/`.

| Método | Finalidade |
|---|---|
| `GET` | Lista e busca clientes (UC17). |
| `POST` | Cadastra um cliente (UC16). |

Entrada, resposta e erros de cada método: `docs/clientes/rotas.md`.

## Vai aqui

- `route.ts`, exportando só `GET`, `POST`
- em cada método: guard, validação com o esquema de `src/shared/validation/`, chamada ao serviço e resposta pelo `src/server/http/`

## Não vai aqui

- regra de negócio, cálculo ou consulta ao Supabase
- esquemas, tipos ou funções auxiliares (→ `src/shared/` ou `src/server/`)
- método não documentado: mudar o contrato exige atualizar o `rotas.md` no mesmo PR
- tratamento de erro próprio: o `handler.ts` responde todos os erros

## Referências

- `docs/clientes/rotas.md`
- `docs/padroes/api.md`
- `docs/padroes/backend.md`
