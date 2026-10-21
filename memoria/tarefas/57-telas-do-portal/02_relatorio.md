---
issue: 57
pull_request: 70
---

# Relatório: Telas do portal público com dados de demonstração: página inicial e catálogo

Em dois PRs: o PR #70, da página inicial (`Refs #57`, incorporado em 818895a), e o PR 2, do catálogo (`Closes #57`).

## O que foi feito

- **Página inicial** (`/`, UC01, RF001, RF002; PR #70): a seção de destaque, com o sobretítulo, o título, o parágrafo, os atalhos "Criar conta" e "Entrar" e a imagem; a seção institucional "Sobre nós", com três destaques; e a localização "Onde estamos". Os textos são os de L2 e não citam dado da empresa.
- **Localização** (RN028, RF004, UC01 FE02; PR #70): o endereço gravado no painel, com o link "Como chegar" para a rota no Google Maps, e o horário de funcionamento de segunda a domingo, de `GET /api/public/company`. Sem endereço, a linha e o link não aparecem. Enquanto carrega, o lugar fica reservado; na falha, aparece o aviso com "Tentar novamente".
- **Imagem** (RNF006; PR #70): `public/images/home-hero.webp`, da Unsplash (Luay Barani), em WebP, φ:1 e 126 KB, carregada com `preload`, com o crédito em `design-midia.md`.
- **Formatação** (PR #70): `formatBusinessHours`, `formatDirectionsLink` e os nomes dos dias (`WEEKDAY_LABELS`).
- **Catálogo** (`/services`, UC01 passos 3 e 4, RF006, RN008, RN031; PR 2): o título "Serviços", o aviso de demonstração logo abaixo dele, o parágrafo de L2, o filtro por categoria ("Todas" e uma opção por categoria, trocada também pelas setas do teclado) e os cartões, com o lugar da imagem (o ícone `CarFront` enquanto o serviço não tem imagem, L5), a categoria, o nome, a descrição e a duração média, em páginas de 12. Na primeira carga, o filtro e três cartões reservados; sem serviços, "Não há serviços disponíveis no momento." (UC01 FE01); na falha, o aviso com "Tentar novamente", no filtro e nos cartões (UC01 FE02).
- **Dados de demonstração** (decisão 0055; PR 2): `GET /api/public/categories` e `GET /api/public/services` respondidos por `src/lib/demo/catalog.ts` até a #48, com as três categorias e os 11 serviços que o catálogo público mostra do `seed-demo.sql`, com os mesmos ids.
- **Botões desativados que mantêm o foco** (ajuste da etapa 02; PR 2): as setas desativadas da paginação com o estado "Desativado" de `design.md` (opacidade 0,5, cursor `not-allowed`, sem o efeito de pressionado), e o estado "Carregando" do `SubmitButton` (login, cadastro, troca de senha, configurações da empresa, formulário em etapas) e do `ConfirmDialog` com opacidade 0,7 e cursor de espera.

## Arquivos alterados

PR #70:

- `src/app/(portal)/page.tsx`: as três seções.
- `src/components/portal/catalog/hero-section.tsx`, `about-section.tsx`, `location-section.tsx` e `company-location.tsx`: criados.
- `src/shared/format/business-hours.ts` e `address.ts`: criados.
- `src/shared/constants/weekdays.ts`: criado.
- `public/images/home-hero.webp`: criado; `public/.gitkeep`: removido.
- `tests/format/business-hours.test.ts` e `address.test.ts`: criados.
- `docs/catalogo/paginas-publicas.md`: criado, com a parte da página inicial.
- `docs/catalogo/CONTEXT.md`, `docs/padroes/design-midia.md` e `docs/padroes/testes.md`.
- README de `src/shared/format/`, `src/shared/constants/` e `tests/format/`.

PR 2:

- `src/app/(portal)/services/page.tsx`: criado.
- `src/components/portal/catalog/category-filter.tsx`, `service-card.tsx` e `service-catalog.tsx`: criados.
- `src/shared/api/catalog.ts` e `src/lib/demo/catalog.ts`: criados.
- `src/lib/demo/routes.ts`: as duas entradas do catálogo.
- `src/components/ui/button.tsx`, `src/components/shared/submit-button.tsx` e `confirm-dialog.tsx`: o estado desativado e o de carregamento por `aria-disabled`.
- `docs/catalogo/paginas-publicas.md`: a parte do catálogo.
- `docs/catalogo/rotas.md` e `docs/padroes/api.md`.
- `memoria/tarefas/57-telas-do-portal/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: aprovado, com 387 testes. Os 4 novos são do PR #70, no commit 327b58b, anterior ao código, e falhavam antes dele. O PR 2 não tem teste automatizado: os componentes e os dados de demonstração foram conferidos à mão (decisão 0052).
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, com `/` e `/services` estáticas e sem avisos.
- Local, com o Supabase local e o `next start`, no Chrome sem interface, a 360 × 800 e a 1440 × 900, claro e escuro, sem transbordar:
  - **Página inicial:** sem endereço gravado e com ele (gravado pelo admin, só no banco local), o link de rota com o endereço codificado, os atalhos para `/register` e `/login`, o teclado do "Pular para o conteúdo" ao rodapé e a falha de `GET /api/public/company`, com o aviso na localização e no rodapé. Conferida de novo no PR 2, sem mudança.
  - **Catálogo:** os 11 serviços com o ícone no lugar da imagem, "1–11 de 11" e nenhuma chamada do catálogo à rede (a demonstração responde sem ela). "Higienização" mostra só Higienização interna completa, Higienização do ar-condicionado e Oxi-sanitização; "Todas", os 11. Pelo teclado, as setas trocam a categoria, com o contorno de foco na opção.
  - **Estados do catálogo**, por alterações temporárias de `src/lib/demo/catalog.ts`, sem commit: na falha, os dois avisos com "Tentar novamente", e cada um traz de volta a sua parte; com 33 serviços, a paginação pelo teclado ("13–24 de 33", "25–33 de 33"); sem serviços, a mensagem de UC01 FE01, só com "Todas" no filtro.
  - **Botões desativados:** as setas desativadas com opacidade 0,5, cursor `not-allowed` e sem o efeito de pressionado, e as ativas sem mudança; o "Entrar" de `/login` durante a chamada com opacidade 0,7 e cursor de espera (antes da correção, 1 e o cursor normal), com o foco nos dois.
  - **Lighthouse 13.5.0, acessibilidade:** 100 em `/` e em `/services`, no celular e no computador, claro e escuro.
  - **LCP no celular** (meta de 2,5 s, RNF006): 3,0 s em `/` e em `/services` com o estrangulamento simulado, o padrão do Lighthouse (nesse modo, `/login`, já na `main`, dá 3,2 s); 1,9 s nas duas com o estrangulamento aplicado pelo DevTools; CLS 0. O LCP é a imagem em `/` e o texto do aviso de demonstração em `/services`.
- **Pré-visualização:** passo do desenvolvedor (veja os PRs).

## Documentação atualizada

- **Módulos:**
  - `docs/catalogo/paginas-publicas.md`, novo: seções e textos da página inicial e do catálogo, e o cartão de serviço;
  - `docs/catalogo/CONTEXT.md`: o módulo novo;
  - `docs/catalogo/rotas.md`: `GET /api/public/categories` e os campos da resposta de `GET /api/public/services`;
  - `docs/padroes/api.md`: as categorias do filtro do catálogo não paginam;
  - `docs/padroes/design-midia.md`: `preload` no lugar de `priority` e o crédito da imagem;
  - `docs/padroes/testes.md`: casos de formatação.
- **Lacunas resolvidas** (opção 1 em todas, imagem A em L4):
  - L1 (categorias do filtro) → `rotas.md` e `api.md`;
  - L2 (textos) → `paginas-publicas.md`;
  - L3 (localização e horário) → `paginas-publicas.md`;
  - L4 (imagem e forma da seção de destaque) → `paginas-publicas.md` e `design-midia.md`;
  - L5 (cartão sem imagem) → `paginas-publicas.md`;
  - L6 (`preload`) → `design-midia.md`.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar** (pela #67):
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A:** a rota `GET /api/public/categories` (as categorias ativas com ao menos um serviço principal ou complementar ativo, só `id` e `name`, em ordem alfabética, sem paginação) e os campos da resposta de `GET /api/public/services` (`id`, `name`, `description`, `imageUrl`, `category` e `avgDurationMinutes`, paginada);
  - **Documentação de Arquitetura de Software, seção 6:** as categorias do filtro do catálogo público entram nas listas que não paginam;
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes de formatação cobrem o horário de funcionamento de um dia, com e sem pausa, e fechado, e o link de rota para o endereço.

## Pendências

- **Pré-visualização**, passo do Yvan: `/` e `/services` no celular e no computador, com o Lighthouse e o LCP no PR.
- **#48:** constrói `GET /api/public/categories` e `GET /api/public/services` com a especificação OpenAPI, tira as duas entradas de `src/lib/demo/routes.ts` e, se ninguém mais os usar, os dados de `src/lib/demo/catalog.ts`, e tira o `DemoNotice` de `/services`. O corpo da #48 ganhou o item da rota de categorias.
- **#47:** libera o domínio do Storage em `next.config.ts`; a partir daí, o cartão mostra a imagem do serviço.
- **#63:** acrescenta os tipos e os dados do painel a `src/shared/api/catalog.ts` e `src/lib/demo/catalog.ts`.
- **#67:** a lista acima, de documentos formais.
