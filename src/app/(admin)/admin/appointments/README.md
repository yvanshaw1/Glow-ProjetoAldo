# `/admin/appointments` – Gerenciamento de agendamentos

Acesso: Permissão `appointments`. A proteção da página fica em `src/proxy.ts`; quem decide o acesso aos dados é a API.

## Vai aqui

- `page.tsx`: componente de servidor que monta a tela com os componentes de `src/components/admin/appointments/`; as partes com dados e interação são componentes de cliente
- `loading.tsx` e `error.tsx`, se a tela precisar de estados próprios de carregamento e erro

## Não vai aqui

- componentes (→ `src/components/admin/appointments/`)
- chamadas ao Supabase ou imports de `src/server/`: os dados vêm da API, via `src/lib/api-client.ts`
- regras de negócio ou validação própria (os esquemas são os de `src/shared/validation/`)
- textos fixos fora do padrão: interface em português, valores e datas por `src/shared/format/`

## Referências

- `docs/agendamento/UC10-consultar-agendamentos.md`
- `docs/agendamento/UC11-registrar-agendamento-para-cliente.md`
- `docs/agendamento/UC12-atualizar-status-do-agendamento.md`
- `docs/agendamento/UC25-reagendar-servico-concluido.md`
- `docs/agendamento/UC26-editar-agendamento.md`
- `docs/agendamento/rotas.md`
- `docs/padroes/frontend.md`
