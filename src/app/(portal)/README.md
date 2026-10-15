# `/` – Grupo do portal e página inicial

Grupo das páginas do visitante e do cliente; não aparece na URL. O `layout.tsx` tem cabeçalho, navegação e rodapé; o `page.tsx` é a página inicial (`/`). Acesso: Público. A proteção da página fica em `src/proxy.ts`; quem decide o acesso aos dados é a API.

## Vai aqui

- `page.tsx`: componente de servidor que monta a tela com os componentes de `src/components/portal/layout/` e `src/components/portal/catalog/`; as partes com dados e interação são componentes de cliente
- `layout.tsx` desta área
- as pastas das páginas filhas
- `loading.tsx` e `error.tsx`, se a tela precisar de estados próprios de carregamento e erro

## Não vai aqui

- componentes (→ `src/components/portal/layout/` e `src/components/portal/catalog/`)
- chamadas ao Supabase ou imports de `src/server/`: os dados vêm da API, via `src/lib/api-client.ts`
- regras de negócio ou validação própria (os esquemas são os de `src/shared/validation/`)
- textos fixos fora do padrão: interface em português, valores e datas por `src/shared/format/`

## Referências

- `docs/catalogo/UC01-consultar-portal-publico.md`
- `docs/catalogo/rotas.md`
- `docs/padroes/frontend.md`
