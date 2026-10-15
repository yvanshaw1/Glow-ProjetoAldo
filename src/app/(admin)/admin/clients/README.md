# `/admin/clients` – Clientes e veículos

Acesso: Permissão `clients`. A proteção da página fica em `src/proxy.ts`; quem decide o acesso aos dados é a API.

## Vai aqui

- `page.tsx`: componente de servidor que monta a tela com os componentes de `src/components/admin/clients/` e `src/components/admin/vehicles/`; as partes com dados e interação são componentes de cliente
- `loading.tsx` e `error.tsx`, se a tela precisar de estados próprios de carregamento e erro

## Não vai aqui

- componentes (→ `src/components/admin/clients/` e `src/components/admin/vehicles/`)
- chamadas ao Supabase ou imports de `src/server/`: os dados vêm da API, via `src/lib/api-client.ts`
- regras de negócio ou validação própria (os esquemas são os de `src/shared/validation/`)
- textos fixos fora do padrão: interface em português, valores e datas por `src/shared/format/`

## Referências

- `docs/clientes/UC16-cadastrar-cliente.md`
- `docs/clientes/UC17-manter-cliente.md`
- `docs/clientes/UC18-manter-veiculos-do-cliente.md`
- `docs/clientes/rotas.md`
- `docs/padroes/frontend.md`
