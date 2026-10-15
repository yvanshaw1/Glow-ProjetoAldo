# `/admin/services` – Serviços e categorias

Acesso: Permissão `services`. A proteção da página fica em `src/proxy.ts`; quem decide o acesso aos dados é a API.

## Vai aqui

- `page.tsx`: componente de servidor que monta a tela com os componentes de `src/components/admin/catalog/`; as partes com dados e interação são componentes de cliente
- `loading.tsx` e `error.tsx`, se a tela precisar de estados próprios de carregamento e erro

## Não vai aqui

- componentes (→ `src/components/admin/catalog/`)
- chamadas ao Supabase ou imports de `src/server/`: os dados vêm da API, via `src/lib/api-client.ts`
- regras de negócio ou validação própria (os esquemas são os de `src/shared/validation/`)
- textos fixos fora do padrão: interface em português, valores e datas por `src/shared/format/`

## Referências

- `docs/catalogo/UC13-cadastrar-servico.md`
- `docs/catalogo/UC14-manter-servicos.md`
- `docs/catalogo/UC15-manter-categorias.md`
- `docs/catalogo/rotas.md`
- `docs/padroes/frontend.md`
