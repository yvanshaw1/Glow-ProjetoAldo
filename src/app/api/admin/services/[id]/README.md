# `/api/admin/services/:id`

Guard: `requirePermission('services')`. Serviço: `src/server/services/catalog.ts`.

| Método | Finalidade |
|---|---|
| `GET` | Detalha um serviço, com valores e vínculos. |
| `PATCH` | Edita, desativa ou reativa um serviço. |
| `DELETE` | Exclui um serviço por exclusão lógica (RN030). |

Entrada, resposta e erros de cada método: `docs/catalogo/rotas.md`.

## Vai aqui

- `route.ts`, exportando só `GET`, `PATCH`, `DELETE`
- em cada método: guard, validação com o esquema de `src/shared/validation/`, chamada ao serviço e resposta pelo `src/server/http/`

## Não vai aqui

- regra de negócio, cálculo ou consulta ao Supabase
- esquemas, tipos ou funções auxiliares (→ `src/shared/` ou `src/server/`)
- método não documentado: mudar o contrato exige atualizar o `rotas.md` no mesmo PR
- tratamento de erro próprio: o `handler.ts` responde todos os erros

## Referências

- `docs/catalogo/rotas.md`
- `docs/padroes/api.md`
- `docs/padroes/backend.md`
