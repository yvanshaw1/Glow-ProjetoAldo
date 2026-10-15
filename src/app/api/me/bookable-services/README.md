# `/api/me/bookable-services`

Guard: `requireClient` (o id do cliente vem sempre da sessão). Serviço: `src/server/services/appointments.ts`.

| Método | Finalidade |
|---|---|
| `GET` | Serviços disponíveis para o veículo, com valores e adicionais vinculados. |

Entrada, resposta e erros de cada método: `docs/agendamento/rotas.md`.

## Vai aqui

- `route.ts`, exportando só `GET`
- em cada método: guard, validação com o esquema de `src/shared/validation/`, chamada ao serviço e resposta pelo `src/server/http/`

## Não vai aqui

- regra de negócio, cálculo ou consulta ao Supabase
- esquemas, tipos ou funções auxiliares (→ `src/shared/` ou `src/server/`)
- método não documentado: mudar o contrato exige atualizar o `rotas.md` no mesmo PR
- tratamento de erro próprio: o `handler.ts` responde todos os erros

## Referências

- `docs/agendamento/rotas.md`
- `docs/padroes/api.md`
- `docs/padroes/backend.md`
