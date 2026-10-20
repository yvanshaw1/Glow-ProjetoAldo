# `/admin` – Painel: layout e dashboard

Prefixo `/admin`. O `layout.tsx` monta a navegação com as permissões do funcionário; o `page.tsx` é o dashboard. Acesso: Permissão `dashboard`. A proteção da página fica em `src/proxy.ts`; quem decide o acesso aos dados é a API.

## Vai aqui

- `layout.tsx`: componente de servidor com a barra de navegação fixa (a partir de 1024 px) e a barra do celular, com o menu lateral, de `src/components/admin/layout/`
- `page.tsx`: componente de servidor que monta a tela com os componentes de `src/components/admin/layout/` e `src/components/admin/dashboard/`; as partes com dados e interação são componentes de cliente
- `loading.tsx` e `error.tsx`, se a tela precisar de estados próprios de carregamento e erro

## Não vai aqui

- componentes (→ `src/components/admin/layout/` e `src/components/admin/dashboard/`)
- chamadas ao Supabase ou imports de `src/server/`: os dados vêm da API, via `src/lib/api-client.ts`
- regras de negócio ou validação própria (os esquemas são os de `src/shared/validation/`)
- textos fixos fora do padrão: interface em português, valores e datas por `src/shared/format/`

## Referências

- `docs/agendamento/UC09-visualizar-dashboard.md`
- `docs/agendamento/rotas.md`
- `docs/padroes/frontend.md`
