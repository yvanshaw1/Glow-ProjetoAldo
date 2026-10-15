# `/api/admin/settings/company`

Guard: `requirePermission('settings')`. Serviço: `src/server/services/settings.ts`.

| Método | Finalidade |
|---|---|
| `GET` | Dados da empresa (UC22). |
| `PUT` | Grava os dados da empresa. |

Entrada, resposta e erros de cada método: `docs/configuracoes/rotas.md`.

## Vai aqui

- `route.ts`, exportando só `GET`, `PUT`
- em cada método: guard, validação com o esquema de `src/shared/validation/`, chamada ao serviço e resposta pelo `src/server/http/`

## Não vai aqui

- regra de negócio, cálculo ou consulta ao Supabase
- esquemas, tipos ou funções auxiliares (→ `src/shared/` ou `src/server/`)
- método não documentado: mudar o contrato exige atualizar o `rotas.md` no mesmo PR
- tratamento de erro próprio: o `handler.ts` responde todos os erros

## Referências

- `docs/configuracoes/rotas.md`
- `docs/padroes/api.md`
- `docs/padroes/backend.md`
