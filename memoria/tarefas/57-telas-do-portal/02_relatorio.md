---
issue: 57
pull_request: PR_NUMBER
---

# Relatório: Telas do portal público com dados de demonstração: página inicial e catálogo

Relatório parcial: PR 1 de 2, da página inicial (`Refs #57`). O PR 2, do catálogo (`Closes #57`), vem depois da incorporação deste e completa este relatório.

## O que foi feito

- **Página inicial** (`/`, UC01, RF001, RF002): a seção de destaque, com o sobretítulo, o título, o parágrafo, os atalhos "Criar conta" e "Entrar" e a imagem; a seção institucional "Sobre nós", com três destaques; e a localização "Onde estamos". Os textos são os de L2 e não citam dado da empresa.
- **Localização** (RN028, RF004, UC01 FE02): o endereço gravado no painel, com o link "Como chegar" para a rota no Google Maps, e o horário de funcionamento de segunda a domingo, de `GET /api/public/company`. Sem endereço, a linha e o link não aparecem. Enquanto carrega, o lugar fica reservado; na falha, aparece o aviso com "Tentar novamente".
- **Imagem** (RNF006): `public/images/home-hero.webp`, da Unsplash (Luay Barani), em WebP, φ:1 e 126 KB, carregada com `preload`, com o crédito em `design-midia.md`.
- **Formatação:** `formatBusinessHours`, `formatDirectionsLink` e os nomes dos dias (`WEEKDAY_LABELS`).

## Arquivos alterados

- `src/app/(portal)/page.tsx`: as três seções.
- `src/components/portal/catalog/hero-section.tsx`, `about-section.tsx`, `location-section.tsx` e `company-location.tsx`: criados.
- `src/shared/format/business-hours.ts` e `address.ts`: criados.
- `src/shared/constants/weekdays.ts`: criado.
- `public/images/home-hero.webp`: criado; `public/.gitkeep`: removido.
- `tests/format/business-hours.test.ts` e `address.test.ts`: criados.
- `docs/catalogo/paginas-publicas.md`: criado, com a parte da página inicial.
- `docs/catalogo/CONTEXT.md`, `docs/padroes/design-midia.md` e `docs/padroes/testes.md`.
- README de `src/shared/format/`, `src/shared/constants/` e `tests/format/`.

## Testes executados

- `npm run check`: aprovado, com 387 testes (4 novos). Os testes ficaram no commit 327b58b, anterior ao código, e falhavam antes dele.
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, com `/` estática e sem avisos.
- Local, com o Supabase local, o admin só nele e o `next start`:
  - **Sem endereço gravado:** as três seções, sem a linha do endereço nem o "Como chegar", e o horário do `seed.sql`.
  - **Com o endereço** gravado pelo admin na aba "Empresa": o endereço e o link de rota com ele codificado; "Criar conta" e "Entrar" levam a `/register` e `/login`.
  - **Larguras e temas:** 360 × 800 e 1440 × 900, claro e escuro, sem transbordar.
  - **Teclado:** do "Pular para o conteúdo" ao rodapé, passando por "Criar conta", "Entrar" e "Como chegar", com o foco visível.
  - **Falha de `GET /api/public/company`:** o aviso com "Tentar novamente" na localização e no rodapé.
  - **Lighthouse 13.5.0, acessibilidade:** 100 em `/`, no celular e no computador, nos temas claro e escuro.
  - **LCP no celular** (meta de 2,5 s, RNF006): 3,0 s com o estrangulamento simulado, o padrão do Lighthouse; nesse modo, `/login`, já na `main`, dá 3,2 s. Com o estrangulamento aplicado pelo DevTools, 1,8 s (CLS 0); `/login`, 4,0 s. O LCP é a imagem.
- **Pré-visualização:** passo do desenvolvedor (veja o PR).

## Documentação atualizada

- **Módulos:**
  - `docs/catalogo/paginas-publicas.md`, novo: seções e textos da página inicial;
  - `docs/catalogo/CONTEXT.md`: o módulo novo;
  - `docs/padroes/design-midia.md`: `preload` no lugar de `priority` e o crédito da imagem;
  - `docs/padroes/testes.md`: casos de formatação.
- **Lacunas resolvidas** (opção 1 em todas, imagem A em L4):
  - L2 (textos) → `paginas-publicas.md`, a parte da página inicial;
  - L3 (localização e horário) → `paginas-publicas.md`;
  - L4 (imagem e forma da seção de destaque) → `paginas-publicas.md` e `design-midia.md`;
  - L6 (`preload`) → `design-midia.md`;
  - L1 e L5, e a parte de L2 do catálogo, entram no PR 2.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar** (pela #67), até aqui:
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes de formatação cobrem o horário de funcionamento de um dia, com e sem pausa, e fechado, e o link de rota para o endereço.

## Pendências

- **PR 2 (catálogo):** `/services`, os tipos e os dados de demonstração, `GET /api/public/categories` e os campos de `GET /api/public/services` em `rotas.md` (L1), a exceção à paginação em `api.md`, o cartão sem imagem (L5), a parte do catálogo em `paginas-publicas.md` e o item da rota de categorias no corpo da #48.
- **Pré-visualização**, passo do Yvan: `/` no celular e no computador, com o Lighthouse e o LCP no PR.
