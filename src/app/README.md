# `src/app/` – Rotas (App Router)

Cada pasta é um segmento de URL. Os grupos `(portal)` e `(admin)` organizam os layouts e não aparecem no endereço; `api/` é o backend HTTP.

## Vai aqui

- arquivos de rota do Next.js: `layout.tsx` (raiz), `globals.css` (Tailwind e o tema com `@theme`), `not-found.tsx` e `error.tsx` globais
- as pastas `(portal)/`, `(admin)/` e `api/`

## Não vai aqui

- `page.tsx` direto em `src/app/`: a página inicial é `(portal)/page.tsx`
- componentes reutilizáveis (→ `src/components/`)
- lógica de negócio ou acesso a dados (→ `src/server/`)
- cores e fontes soltas: tudo vem das variáveis do tema em `globals.css`

## Referências

- `docs/padroes/frontend.md`
- `docs/plataforma/estrutura-de-pastas.md`
