# `/api/admin/services/image`

Guard: `requirePermission('services')`. Serviço: `src/server/services/catalog.ts`.

| Método | Finalidade |
|---|---|
| `POST` | Envia a imagem de um serviço. |

Entrada, resposta e erros de cada método: `docs/catalogo/rotas.md`.

## Vai aqui

- `route.ts`, exportando só `POST`
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
