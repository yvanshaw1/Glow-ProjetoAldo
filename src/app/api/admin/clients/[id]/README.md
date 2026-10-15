# `/api/admin/clients/:id`

Guard: `requirePermission('clients')`. Serviço: `src/server/services/clients.ts`. Subpastas: `vehicles/`.

| Método | Finalidade |
|---|---|
| `GET` | Detalha um cliente. |
| `PATCH` | Edita os dados do cliente. |
| `DELETE` | Exclui a conta do cliente por exclusão lógica; veículos e agendamentos são preservados (RN030). |

Entrada, resposta e erros de cada método: `docs/clientes/rotas.md`.

## Vai aqui

- `route.ts`, exportando só `GET`, `PATCH`, `DELETE`
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
