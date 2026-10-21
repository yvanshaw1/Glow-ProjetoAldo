---
issue: 57
titulo: "Telas do portal público com dados de demonstração: página inicial e catálogo"
areas: [frontend, testes]
tipo: funcionalidade
requisitos: [UC01, RF001, RF002, RF004, RF005, RF006, RN008, RN028, RN031, RNF001, RNF005, RNF006]
status: concluido
aprovado_por: yvan
aprovado_em: 21/10/2026
---

# Plano: Telas do portal público com dados de demonstração: página inicial e catálogo

## Objetivo

Dar à página inicial e ao catálogo o conteúdo final do UC01 (T1 da `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, decisão 0055):

- `/`: seção de destaque com a imagem, seção institucional, localização com os dados reais de `GET /api/public/company` (RN028, RF004) e os atalhos para criar conta e entrar (RF001, RF002);
- `/services`: cartões com nome, descrição e imagem dos serviços principais e complementares ativos, o filtro por categoria e as mensagens de nenhum serviço e de falha (RF006, UC01 FE01 e FE02), com os dados de demonstração de `GET /api/public/services` até a #48.

Só o catálogo usa dados de demonstração, então só `/services` mostra o `DemoNotice`; a página inicial usa a rota real da #37. Nenhuma rota construída, migration, esquema de validação ou dependência nova, e nenhum import de `src/server/`.

## Base da construção

- Ramificação `feat/57-portal-screens`, criada da `origin/main` (d6d28b8, com a #56), sem vínculo com a `main`, e `npx -y npm@11.21.1 ci`. Com a divisão em dois PRs (Riscos), o segundo sai de `feat/57-services-catalog`, criada da `origin/main` depois da incorporação do primeiro.
- Contratos usados sem mudança:
  - `DEMO_ROUTES`, `DemoAnswer` e `demoPage` (`src/lib/demo/`); `useApiQuery` e `usePaginatedList` (`src/hooks/`); `withQuery` (`src/lib/api-client.ts`);
  - `PublicCompany` e `BusinessDay` (`src/shared/api/settings.ts`); `Page<T>` (`src/shared/api/pagination.ts`); `CATALOG_PAGE_SIZE` (12, `src/shared/constants/pagination.ts`);
  - `formatDuration` (`src/shared/format/duration.ts`);
  - `DemoNotice`, `EmptyState` e `ListPagination` (`src/components/shared/`); `Alert`, `Button`, `buttonVariants` e `Skeleton` (`src/components/ui/`, decisão 0049);
  - o `next/image` do Next.js 16.4.1 (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`), em que `priority` foi substituída por `preload` (L6).

## Como funciona

### Página inicial (`/`)

`src/app/(portal)/page.tsx` continua componente de servidor e só compõe as três seções de `src/components/portal/catalog/`, na ordem do UC01 (passo 2). O esqueleto vem do wireframe `publicPages/homepage/` (destaque, institucional com destaques em cartões, localização em cartão); o estilo, de `design.md`.

| Seção | Componente | Conteúdo |
|---|---|---|
| Destaque | `hero-section.tsx`, de servidor | sobretítulo, título (`h1`), parágrafo e os atalhos "Criar conta" (`/register`, botão principal) e "Entrar" (`/login`, secundário), como links com a aparência de botão (`buttonVariants`); a imagem pelo `next/image` com `preload` e `sizes`, na forma de L4 |
| Institucional | `about-section.tsx`, de servidor | título (`h2`), parágrafo e três destaques (ícone de 26 px, `h3` e texto), de uma lista fixa (`codigo.md`, tabela de consulta), com os textos de L2 |
| Localização | `location-section.tsx`, de servidor, com `company-location.tsx`, de cliente | título (`h2`) e, de `GET /api/public/company`: o endereço e o link "Como chegar" (L3) e o horário de funcionamento dos sete dias |

- **Localização (`company-location.tsx`).** `useApiQuery<PublicCompany>("/api/public/company")`, a mesma chamada do rodapé (`company-footer-info.tsx`), porque cada componente busca o que exibe (`frontend.md`). Na carga, o lugar reservado (`Skeleton`), sem deslocar a página (RNF006). Na falha, o aviso com a mensagem e "Tentar novamente" (UC01 FE02), como o rodapé. Endereço vazio (`null`): sem a linha do endereço nem o link, como o dado vazio do rodapé (`layouts.md`); o horário aparece sempre, porque os sete dias existem desde o `seed.sql`.
- **Horário de funcionamento.** Uma lista de definição (`dl`), de segunda a domingo, com o nome do dia (`WEEKDAY_LABELS`) e o horário do dia formatado por `formatBusinessHours` (TDD, abaixo).
- **Link "Como chegar".** `formatDirectionsLink(address)` (TDD, abaixo), com a aparência de botão secundário e o ícone `RouteIcon` (16 px, `aria-hidden`), na mesma aba, como os links do rodapé (`layouts.md`).
- **Atalhos para quem já entrou.** UC01 FA01 diz que o cliente autenticado vê as páginas públicas "da mesma forma", só com o cabeçalho diferente: os atalhos não mudam, e o `proxy.ts` leva quem já entrou e abre `/login` ou `/register` à página inicial da área (`docs/acesso/protecao-das-paginas.md`). A seção de destaque fica toda de servidor, sem esperar a sessão.

### Catálogo (`/services`)

`src/app/(portal)/services/page.tsx`, de servidor, com o `metadata` "Serviços – Glow": o título (`h1`) "Serviços", o `DemoNotice` logo abaixo dele (`componentes.md`, Telas de demonstração), o parágrafo de L2 e o `ServiceCatalog`. O esqueleto vem do wireframe `publicPages/catalog/` (filtro em pílulas acima da grade de cartões); o wireframe também agrupa por tipo, busca por texto e mostra os adicionais de cada serviço, mas a rota não tem o tipo nem a busca na resposta ou na entrada (`rotas.md`), e o UC01 não pede os adicionais: ficam de fora (`wireframes/README.md`, "Deixar de fora").

- **`service-catalog.tsx`, de cliente.** `usePaginatedList<PublicService, { categoryId: string | undefined }>` com `/api/public/services`, `CATALOG_PAGE_SIZE` (12) e o filtro `categoryId`; a busca do hook não é usada, e o `withQuery` não manda o parâmetro vazio. Os estados de `componentes.md` (Listagem), com a forma da grade: na primeira carga, três cartões reservados (`Skeleton` com a proporção do cartão); numa nova carga, os cartões anteriores no estado "Carregando"; na falha, o aviso com "Tentar novamente" (UC01 FE02); sem serviços, o `EmptyState` com "Não há serviços disponíveis no momento." (UC01 FE01). Depois, o `ListPagination`. Grade de uma coluna, duas a partir de 768 px e três a partir de 1024 px (`design.md`).
- **`category-filter.tsx`, de cliente.** `useApiQuery<PublicCategory[]>("/api/public/categories")` (L1). Um grupo de botões de opção nativos (`fieldset` com a `legend` "Categoria", que o leitor de tela anuncia, e `input type="radio"` visualmente ocultos com o `label` em pílula): "Todas" e uma opção por categoria. As setas do teclado trocam a opção, como em todo grupo de opções do navegador. A aparência é a das abas de `design.md`: a lista rebaixada, a opção marcada em relevo com o texto em `--link` e o contorno de foco no `label` (`peer-focus-visible`). Trocar a opção chama `setFilter("categoryId", id)`, que volta à primeira página. Na carga, as pílulas reservadas; na falha, o aviso com "Tentar novamente" no lugar do filtro, e os serviços continuam aparecendo.
- **`service-card.tsx`, de servidor**, usado pelo `ServiceCatalog`: superfície `rounded-xl` com `shadow-neu-md`; no topo, a imagem na proporção φ:1, com `object-fit: cover` e o raio do contêiner (`design-midia.md`), pelo `next/image` sem `preload` (só a da seção de destaque carrega com prioridade); sem imagem, o lugar dela com o ícone de L5. Abaixo, a categoria como sobretítulo (12 px, peso 600, caixa alta, 0,08em), o nome (`h2`), a descrição e "Duração média: 1 h 30 min" (`formatDuration`), com o ícone `ClockIcon` (16 px, `aria-hidden`). A rota devolve a categoria e a duração média (`rotas.md`), por isso o cartão as mostra.

### Dados de demonstração (decisão 0055)

| Arquivo | Conteúdo |
|---|---|
| `src/shared/api/catalog.ts` | `PublicCategory` (`id`, `name`) e `PublicService` (`id`, `name`, `description`, `imageUrl`, `category` com `id` e `name`, `avgDurationMinutes`), com os campos de L1 |
| `src/lib/demo/catalog.ts` | as três categorias ativas com serviço ativo, em ordem alfabética (Higienização, Lavagem, Polimento e proteção), e os 11 serviços que o catálogo público mostra do `seed-demo.sql`, na ordem do arquivo: os principais e complementares ativos de categorias ativas, sem a "Lavagem a seco" (inativa e excluída), a "Cristalização de vidros" (inativa) e a "Película nos vidros" (categoria inativa), RN008 e RN031. Os ids são os do `seed-demo.sql` (`md5('glow-demo:<chave>')` como UUID), para a #48 devolver os mesmos. `imageUrl` é `null` em todos (L5). `answerPublicCategories()` devolve a lista; `answerPublicServices({ query })` devolve `demoPage(services, query, { pageSize: CATALOG_PAGE_SIZE, filters: { categoryId: (service) => service.category.id } })` |
| `src/lib/demo/routes.ts` | duas entradas de leitura, com `load`: `GET /api/public/categories` e `GET /api/public/services` |

O catálogo público não grava nada, então não há entrada de gravação.

### Formatação (`src/shared/format/`) e constante dos dias

- `business-hours.ts`: `formatBusinessHours(day: BusinessDay)` → "08:00 às 12:00 e 13:00 às 18:00" (com pausa), "08:00 às 12:00" (sem pausa) ou "Fechado" (L3). Os horários já vêm em `HH:MM`, no fuso da empresa (`api.md`, decisão 0053), e aparecem como estão.
- `address.ts`: `formatDirectionsLink(address)` → `https://www.google.com/maps/dir/?api=1&destination=` e o endereço com `encodeURIComponent` (L3; formato dos Maps URLs do Google, sem chave).
- `src/shared/constants/weekdays.ts`: `WEEKDAY_LABELS`, de "Domingo" (0) a "Sábado" (6), como o `weekday` da API.

### Arquivos novos e alterados de `src/` e `public/`

| Arquivo | Conteúdo |
|---|---|
| `app/(portal)/page.tsx` | as três seções |
| `app/(portal)/services/page.tsx` | novo |
| `components/portal/catalog/hero-section.tsx`, `about-section.tsx`, `location-section.tsx`, `company-location.tsx` | novos (página inicial) |
| `components/portal/catalog/service-catalog.tsx`, `category-filter.tsx`, `service-card.tsx` | novos (catálogo) |
| `shared/api/catalog.ts` | novo |
| `shared/format/business-hours.ts`, `address.ts` | novos |
| `shared/constants/weekdays.ts` | novo |
| `lib/demo/catalog.ts` | novo |
| `lib/demo/routes.ts` | as duas entradas |
| `public/images/home-hero.webp` | a imagem de L4, depois do seu aval para o arquivo; o `public/.gitkeep` sai, porque a pasta passa a ter arquivo (`estrutura-de-pastas.md`) |

## Ordem da construção

Em dois PRs, para cada um ficar perto das ~400 linhas de `workflows/procedimentos/pull-request.md` (Riscos):

**PR 1, página inicial** (`feat/57-portal-screens`, "Refs #57"):

1. Criar a ramificação da `origin/main`, desfazer o vínculo com a `main` e rodar `npx -y npm@11.21.1 ci`.
2. Testes de `tests/format/business-hours.test.ts` e `address.test.ts`, conferidos em vermelho, num commit próprio (decisões 0035 e 0052).
3. `formatBusinessHours`, `formatDirectionsLink` e `WEEKDAY_LABELS`, até os testes passarem.
4. Download da imagem de L4, só depois do seu aval para o arquivo (nome, fonte, tamanho e licença), conferindo a licença na página da imagem no dia.
5. As três seções e a página inicial.
6. Documentação de L2, L3, L4 e L6, e os README.
7. Verificação local de `/` (seção seguinte); etapa 03 do PR 1 (PR e relatório parcial em `notas.md`).

**PR 2, catálogo** (`feat/57-services-catalog`, "Closes #57"), depois da incorporação do PR 1:

8. Tipos, dados de demonstração e as duas entradas da lista.
9. Filtro, cartão, catálogo e a página `/services`.
10. Documentação de L1 e L5.
11. Verificação local de `/services` e de novo de `/`.
12. Etapa 03: PR, `02_relatorio.md` da tarefa inteira e o plano em `concluido`.

Se você preferir um PR só, os passos são os mesmos, sem o 7 e o 8 separados, e o PR leva "Closes #57".

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um visitante, quando abre `/`, então vê o destaque, a institucional, a localização com o endereço gravado e os atalhos para criar conta e entrar (UC01, RN028) | Local, com o banco local: o admin grava um endereço na aba "Empresa" de `/admin/settings`; numa sessão de visitante, `/` mostra as três seções, o endereço gravado, o link "Como chegar" com o endereço e o horário do `seed.sql` (segunda a sexta "08:00 às 12:00 e 13:00 às 18:00", sábado "08:00 às 12:00", domingo "Fechado"), e "Criar conta" e "Entrar" levam a `/register` e `/login`. Sem endereço gravado (antes de gravar), sem a linha do endereço nem o link. Falha de `GET /api/public/company` (requisição interrompida pelo Chrome de teste): o aviso com "Tentar novamente" na localização e no rodapé (UC01 FE02). Testes "formats a day with a break", "formats a day without a break", "formats a closed day" e "builds the directions link of an address" |
| Dado uma categoria no filtro, quando a aplico, então só os serviços dela aparecem | Local: "Higienização" → só Higienização interna completa, Higienização do ar-condicionado e Oxi-sanitização; "Todas" → os 11; a chamada leva `categoryId` (lista de requisições vazia: a demonstração não vai à rede). A busca por igualdade do `demoPage` já tem teste (#56) |
| Dado o Lighthouse no celular em `/` e `/services`, então a acessibilidade não reprova, e o LCP fica registrado no PR (meta de 2,5 s, RNF006) | Local: `npx -y lighthouse@13.5.0 <endereço> --only-categories=accessibility,performance`, no modo celular, com o LCP de cada página no PR; acessibilidade também no computador e no tema escuro. Pré-visualização: o mesmo, pelo Lighthouse das ferramentas do navegador, passo seu |

Critérios comuns às telas de demonstração (issue):

| Critério | Verificação |
|---|---|
| Esqueleto pelo wireframe, conteúdo pelo UC01, estilo por `design.md` (decisão 0041) | Revisão: o que fica de fora do wireframe está em "Como funciona" e em "Fora do escopo" |
| `useApiQuery` ou `usePaginatedList` com o endereço de `rotas.md`; tipos em `src/shared/api/catalog.ts`; dados em `src/lib/demo/catalog.ts`, com os nomes do `seed-demo.sql` | Revisão do diff |
| Carregamento, vazio e falha com "Tentar novamente" | Local: o carregamento nos 400 ms da demonstração; o vazio e a falha do catálogo por uma alteração temporária de `src/lib/demo/catalog.ts`, sem commit (a resposta vazia e a resposta que lança erro), desfeita e conferida pelo `git diff` antes do commit seguinte; a falha da localização como no primeiro critério |
| O aviso de demonstração; nenhum formulário grava | `/services` com o `DemoNotice` logo abaixo do título; `/` sem ele, porque não tem dado de demonstração. As duas telas não têm formulário |
| 360 × 800 primeiro e 1440 × 900, claro e escuro, pelo teclado, sem transbordar, Lighthouse de acessibilidade sem auditoria reprovada | Local, no Chrome sem interface (abaixo): as duas páginas nas duas larguras e nos dois temas, sem rolagem horizontal; pelo teclado, a ordem "Pular para o conteúdo", cabeçalho, "Criar conta", "Entrar", "Como chegar" e rodapé em `/`, e o filtro (as setas trocam a categoria) e a paginação em `/services`, com o foco visível |
| Nenhuma rota, migration ou esquema de validação novo, e nenhum import de `src/server/` | `git diff --stat` sem `src/app/api/`, `supabase/` nem `src/shared/validation/`; `grep` por `@/server` nos arquivos novos |

### Como a verificação local é feita

Como na #56 (`memoria/tarefas/56-base-da-demonstracao/notas.md`):

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`, só com o `seed.sql`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Conta de teste.** O admin, criado no banco local pelo `create-admin.mjs`, com a senha gerada por um roteiro do scratchpad, guardada num arquivo dele e nunca exibida; só para gravar o endereço em `/admin/settings`. O endereço é o fictício do `seed-demo.sql` ("Rua Exemplo, 100 – Ponta Verde, Maceió – AL").
- **Aplicação.** `npx next build` e `npx next start -p 3057`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório.
- **Telas**, num Chrome sem interface controlado pelo `puppeteer-core` que vem com o Lighthouse 13.5.0 (o painel do navegador do app oculto trava o foco do Base UI): `/` e `/services` a 360 × 800 primeiro e a 1440 × 900, nos dois temas, o teclado, a lista de requisições e a falha de `GET /api/public/company` por interrupção da requisição.
- **Lighthouse.** Como no terceiro critério; as páginas são públicas, então não há cookie nos relatórios.
- **Verificações automáticas.** `npm run check` sem erros nem avisos, `npx next build` (sem o aviso de `priority`) e `npm audit --omit=dev --audit-level=high`.
- **Encerramento.** `next start` encerrado por PID, `npx supabase stop` e a alteração temporária desfeita (`git status` só com os arquivos do plano).
- **Pré-visualização**, passo seu: `/` e `/services` no celular e no computador, com o Lighthouse de acessibilidade e o LCP no PR.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/app/(portal)/page.tsx` | alterar |
| `src/app/(portal)/services/page.tsx` | criar |
| `src/components/portal/catalog/hero-section.tsx`, `about-section.tsx`, `location-section.tsx`, `company-location.tsx` | criar |
| `src/components/portal/catalog/service-catalog.tsx`, `category-filter.tsx`, `service-card.tsx` | criar |
| `src/shared/api/catalog.ts` | criar |
| `src/shared/format/business-hours.ts`, `address.ts` | criar |
| `src/shared/format/README.md` | alterar: o horário de funcionamento e o link de rota |
| `src/shared/constants/weekdays.ts` | criar |
| `src/shared/constants/README.md` | alterar: os nomes dos dias da semana |
| `src/lib/demo/catalog.ts` | criar |
| `src/lib/demo/routes.ts` | alterar |
| `public/images/home-hero.webp` | criar (L4) |
| `public/.gitkeep` | apagar |
| `tests/format/business-hours.test.ts`, `address.test.ts` | criar |
| `tests/format/README.md` | alterar: os dois arquivos novos |
| `docs/catalogo/paginas-publicas.md` | criar (L2 a L5) |
| `docs/catalogo/CONTEXT.md` | alterar: a linha do módulo novo |
| `docs/catalogo/rotas.md` | alterar (L1) |
| `docs/padroes/api.md` | alterar (L1) |
| `docs/padroes/design-midia.md` | alterar (L4, L6) |
| `docs/padroes/testes.md` | alterar: a linha "Formatação" |
| `memoria/tarefas/57-telas-do-portal/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |
| `src/components/ui/button.tsx`, `src/components/shared/submit-button.tsx`, `src/components/shared/confirm-dialog.tsx` | alterar, com a opção 1 do ajuste da etapa 02 |
| `src/components/shared/list-pagination.tsx` | alterar, com a opção 2 do ajuste da etapa 02 |

O README de `src/components/portal/catalog/` já lista "Seções da página inicial (destaque, institucional, localização) e cartão de serviço do catálogo público" e não muda; os de `src/app/(portal)/` e `services/` também não. `public/` não tem README (`estrutura-de-pastas.md`).

### Em comum com outras tarefas

- Nenhum PR aberto; a `main` está em d6d28b8.
- **#58 a #65** (telas em paralelo): uma linha por rota em `src/lib/demo/routes.ts` (conflito simples).
- **#63** (telas de serviços e categorias do painel): o mesmo módulo `catalog`, em `src/shared/api/catalog.ts` e `src/lib/demo/catalog.ts`; quem chegar depois acrescenta os seus tipos e dados ao arquivo.
- **#65** (disponibilidade): precisa dos nomes dos dias; se esta tarefa chegar antes, usa `WEEKDAY_LABELS`, e vice-versa.
- **#48** (página inicial e catálogo, lógica): constrói `GET /api/public/services` e, com a opção 1 de L1, `GET /api/public/categories`, tira as duas entradas da lista e o `DemoNotice` de `/services`. O corpo da issue ganha a rota de categorias, com o seu OK (Riscos).
- **#47** (imagem dos serviços): libera o domínio do Storage em `next.config.ts`; a partir daí, o cartão mostra a imagem real.
- **#67** (documentos formais): recebe a lista do relatório desta tarefa.

## Testes previstos

TDD nas duas funções de formatação, com os valores esperados escritos à mão a partir de L3 e do `seed.sql` (decisões 0035 e 0052):

`tests/format/business-hours.test.ts`:

- formats a day with a break: `{ isOpen: true, opensAt: "08:00", closesAt: "18:00", breakStartsAt: "12:00", breakEndsAt: "13:00" }` → "08:00 às 12:00 e 13:00 às 18:00"
- formats a day without a break: `08:00` a `12:00`, pausa `null` → "08:00 às 12:00"
- formats a closed day: `isOpen: false`, horários `null` → "Fechado"

`tests/format/address.test.ts`:

- builds the directions link of an address: "Rua Exemplo, 100 – Ponta Verde, Maceió – AL" → `https://www.google.com/maps/dir/?api=1&destination=Rua%20Exemplo%2C%20100%20%E2%80%93%20Ponta%20Verde%2C%20Macei%C3%B3%20%E2%80%93%20AL`

Os componentes, o filtro e os dados de demonstração são conferidos à mão (decisão 0052); a página e o filtro do `demoPage` já têm testes da #56.

## Documentação

- `docs/catalogo/paginas-publicas.md`, novo, "Conteúdo das páginas públicas" (cabeçalho `titulo`, `assunto: catalogo`, `origem: issue #57`, `relacionados: [UC01, RF001, RF002, RF004, RF006, RN008, RN028, RN031]`): as seções de `/` e de `/services`, os textos de L2, a localização de L3, a seção de destaque de L4 e o cartão de L5.
- `docs/catalogo/CONTEXT.md`, tabela: "| paginas-publicas.md | Conteúdo da página inicial e do catálogo público |".
- `docs/catalogo/rotas.md` e `docs/padroes/api.md`: L1.
- `docs/padroes/design-midia.md`: a linha de crédito (L4) e o `preload` (L6).
- `docs/padroes/testes.md`, tabela de casos, linha "Formatação": acrescentar "horário de funcionamento de um dia, com e sem pausa, e fechado; link de rota para o endereço".
- README:
  - `src/shared/format/`: "o ano do aviso de direitos e os links de telefone (`tel:`) e de WhatsApp" passa a "o ano do aviso de direitos, o horário de funcionamento de um dia e os links de telefone (`tel:`), de WhatsApp e de rota para o endereço";
  - `src/shared/constants/`: "(status, permissões, formas de pagamento, tipos de veículo e de serviço, portes)" passa a "(status, permissões, formas de pagamento, tipos de veículo e de serviço, portes, dias da semana)";
  - `tests/format/`: a lista de arquivos ganha `business-hours.test.ts` e `address.test.ts`.
- Documentos formais a atualizar no relatório, pela #67: Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A (`GET /api/public/categories` e os campos de `GET /api/public/services`), e seção 6 (a lista sem paginação, L1); Documentação de Desenvolvimento com IA, seção 8 (os casos novos de formatação).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. De onde vêm as categorias do filtro do catálogo

**Problema.** A issue pede o filtro por categoria, e `GET /api/public/services` aceita `categoryId` (`docs/catalogo/rotas.md`), mas nenhuma rota pública lista as categorias: a única é `GET /api/admin/categories`, com a permissão `services`. A rota de serviços é paginada, com 12 por página (`api.md`), então a tela não acha todas as categorias lendo uma página. A resposta também é descrita só por alto ("lista com nome, descrição, imagem, categoria e duração média"), e os tipos de `src/shared/api/catalog.ts` precisam dos nomes dos campos.

**Opções:**

- [x] **1. Rota pública de categorias, sem paginação (recomendada).** `GET /api/public/categories` devolve as categorias ativas com ao menos um serviço principal ou complementar ativo, só com `id` e `name`, em ordem alfabética. O filtro lê essa rota (da demonstração, até a #48), e a escolha manda `categoryId` à rota de serviços, que pagina como hoje. Entra uma rota no contrato, que a #48 constrói junto com a de serviços (o corpo da #48 ganha um item), e uma exceção à paginação em `api.md`, porque o filtro precisa da lista inteira.
- [ ] **2. Categorias tiradas da própria lista de serviços.** A tela pede `GET /api/public/services` com `pageSize` 50 (o máximo) e monta o filtro com as categorias dos serviços que vierem. Nenhuma rota nova, mas o filtro fica incompleto se o catálogo passar de 50 serviços, e a primeira carga traz todos os serviços.
- [ ] **3. Categorias junto da resposta de serviços.** A rota de serviços devolve, além da página, a lista de categorias. Uma chamada só, mas a resposta foge do formato de paginação de `api.md` (`{ data, page, pageSize, total }`), usado pelo `usePaginatedList`.

**Texto proposto (opção 1):**

- `docs/catalogo/rotas.md`, "Rotas públicas":
  - `GET /api/public/services`, "Resposta: **200** lista com nome, descrição, imagem, categoria e duração média." passa a "Resposta: **200** lista paginada de `id`, `name`, `description`, `imageUrl` (endereço público da imagem, ou `null`), `category` (`id` e `name`) e `avgDurationMinutes`.";
  - nova, antes dela: "#### `GET /api/public/categories`" / "Categorias do filtro do catálogo (UC01): as ativas com ao menos um serviço principal ou complementar ativo (RN008, RN031)." / "- Entrada: Nenhuma." / "- Resposta: **200** lista de `id` e `name`, em ordem alfabética, sem paginação."
- `docs/padroes/api.md`, Paginação: "Não paginam só as listas de tamanho fixo: sete dias da semana, quatro formas de pagamento e serviços de um agendamento." passa a "Não paginam só as listas de tamanho fixo (sete dias da semana, quatro formas de pagamento e serviços de um agendamento) e as categorias do filtro do catálogo público, que o filtro precisa inteiras."

### L2. Textos da página inicial e do catálogo

**Problema.** O UC01 e o RF001 dizem quais seções a página inicial tem, mas nenhum módulo define o texto da seção de destaque, da institucional nem da introdução do catálogo. O RF004 e a RN028 dizem que as informações institucionais da página inicial vêm das configurações da empresa, mas `GET /api/public/company` só tem nome, contato, endereço, redes sociais e horários: não há campo "sobre a empresa" (`docs/configuracoes/`).

**Opções:**

- [x] **1. Textos fixos sem dado da empresa, num módulo novo (recomendada).** Os textos abaixo ficam no código e em `docs/catalogo/paginas-publicas.md`. Eles descrevem o que o sistema oferece (agendar, acompanhar, cadastrar veículos) e não citam o nome, o endereço nem o contato da empresa: todo dado da empresa na página vem de `GET /api/public/company` (RN028). A seção de destaque fica toda de servidor, sem esperar a API (RNF006).
- [ ] **2. Campo "Sobre a empresa" nas configurações.** Um texto editável na aba "Empresa", mostrado na seção institucional: atende o RF004 ao pé da letra, mas pede migration, mudança no UC22, na rota e na aba, fora do escopo das telas (decisão 0055); vira uma issue nova, e até lá a seção mostra o texto fixo da opção 1.

**Texto proposto (opção 1):** `docs/catalogo/paginas-publicas.md`, seções "Página inicial" e "Catálogo", com uma frase de abertura: "Os textos fixos não citam dado da empresa; o nome, o endereço, o contato e os horários vêm de `GET /api/public/company` (RN028)." E os textos:

- Seção de destaque:
  - sobretítulo: "Estética automotiva";
  - título: "Cuidado completo para o seu carro";
  - parágrafo: "Escolha o serviço, o dia e o horário pelo site e acompanhe cada etapa até a conclusão.";
  - atalhos: "Criar conta" e "Entrar".
- Seção institucional:
  - título: "Sobre nós";
  - parágrafo: "Somos uma empresa de estética automotiva dedicada a deixar cada veículo limpo, protegido e bem cuidado, com atendimento por hora marcada.";
  - destaque "Agendamento pelo site" (ícone `CalendarCheck`): "Escolha o serviço, o veículo, o dia e o horário disponível, sem precisar ligar." (UC06);
  - destaque "Acompanhamento" (ícone `ListChecks`): "Veja em Meus agendamentos a situação de cada serviço, do agendamento à conclusão." (UC07, RN017);
  - destaque "Seus veículos" (ícone `CarFront`): "Cadastre os seus veículos uma vez e use-os em todos os agendamentos." (UC05).
- Localização: título "Onde estamos"; link "Como chegar"; subtítulo "Horário de funcionamento".
- Catálogo:
  - título: "Serviços";
  - parágrafo, depois do aviso de demonstração: "Conheça os serviços disponíveis e filtre por categoria.";
  - filtro: legenda "Categoria" e a primeira opção "Todas";
  - nenhum serviço (UC01 FE01): "Não há serviços disponíveis no momento.";
  - cartão: "Duração média: <duração>".

### L3. Forma da localização e horário de funcionamento

**Problema.** A issue deixa para o plano a forma de mostrar a localização: "endereço com link para o mapa ou mapa incorporado". O endereço gravado é um texto só (`address`), sem coordenadas. `GET /api/public/company` também devolve o horário dos sete dias, e o plano da #37 prevê "a página inicial, com a seção de localização e os horários" (`memoria/tarefas/37-dados-da-empresa/01_plano.md`), mas nenhum módulo diz como o horário aparece.

**Opções:**

- [x] **1. Endereço com o link "Como chegar" e o horário dos sete dias (recomendada).** O endereço gravado, com o ícone `MapPin`, e o link "Como chegar", que abre a rota até o endereço no Google Maps (no celular, no aplicativo de mapas), na mesma aba. Abaixo, "Horário de funcionamento", de segunda a domingo, um dia por linha. Nenhum script, cookie nem quadro de outro site, nada a mais no carregamento, e funciona com qualquer endereço gravado no painel. O contato continua só no rodapé.
- [ ] **2. Mapa incorporado (`iframe`) e o horário.** O mapa aparece na página, mas um quadro do Google Maps sem chave usa um endereço não documentado, carrega scripts e cookies de outro site (aviso de privacidade, LGPD) e pesa no celular (RNF006); o do OpenStreetMap precisa de coordenadas, que as configurações não têm.
- [ ] **3. Só o endereço, sem link e sem horário.** O mínimo do UC01, mas a pessoa copia o endereço à mão, e o horário, que a rota já devolve, não aparece em lugar nenhum do portal.

**Texto proposto (opção 1):** `docs/catalogo/paginas-publicas.md`, seção "Página inicial", "Localização":

- "O endereço gravado, com o link 'Como chegar', que abre a rota até ele no Google Maps (`https://www.google.com/maps/dir/?api=1&destination=` e o endereço codificado), na mesma aba. Sem endereço gravado, a linha e o link não aparecem."
- "O horário de funcionamento, de segunda a domingo, um dia por linha: o nome do dia e '08:00 às 12:00 e 13:00 às 18:00' (com pausa), '08:00 às 12:00' (sem pausa) ou 'Fechado'."
- "Enquanto os dados carregam, o lugar fica reservado; na falha, o aviso com a mensagem e 'Tentar novamente' (UC01 FE02)."

### L4. Imagem e forma da seção de destaque

**Problema.** A issue pede a imagem de um banco de licença livre, com o crédito em `design-midia.md` e o seu aval antes do download, e `design-midia.md` exige: sem marca, placa legível nem pessoa identificável; WebP; proporção 1:1, φ:1 ou 16:9; texto sobre imagem só sobre um degradê escuro com 4,5:1. Nenhum módulo diz se o texto da seção fica sobre a imagem, como no wireframe, ou ao lado dela.

**Opções (forma):**

- [x] **1. Texto e imagem lado a lado (recomendada).** A partir de 1024 px, o texto à esquerda e a imagem à direita; abaixo disso, o texto primeiro e a imagem embaixo. A imagem fica num cartão de destaque (`rounded-3xl`, `shadow-neu-md`, `design.md`), na proporção φ:1, com `preload` (L6) e `sizes` para cada largura. Sem texto sobre a imagem, o contraste não depende da foto, e a seção segue o neomorfismo claro e escuro do resto do portal.
- [ ] **2. Imagem de fundo em toda a largura, com o texto sobre um degradê escuro, como o wireframe.** Mais impacto, mas o texto fica claro sobre escuro nos dois temas, fora do estilo do resto do portal, e o contraste de 4,5:1 precisa ser conferido sobre a foto escolhida em cada largura.

**Imagem (marque uma).** As duas são da Unsplash, com "Uso gratuito sob a Licença da Unsplash" na página em 21/10/2026, horizontais, sem marca, placa nem rosto (só mão e braço). O arquivo sai do servidor de imagens da Unsplash já recortado em φ:1 e em WebP (`w=1600&h=989&fit=crop&fm=webp&q=75`); o tamanho foi lido no cabeçalho da resposta, sem baixar. O Next.js entrega no celular uma versão menor, gerada desse arquivo.

- [x] **A. Limpeza do painel de um carro clássico (recomendada).** Mão de luva preta passando um pincel de cerdas laranja no painel. O laranja do pincel combina com a cor principal do tema, e o arquivo é o menor. `public/images/home-hero.webp`, 1600 × 989, 128.964 bytes (126 KB). Autor: Luay Barani (@luaybarani). Página: https://unsplash.com/photos/5SmPnmCjwcU (publicada em 19/02/2026). Texto alternativo: "Mão de luva preta limpando com um pincel o painel de um carro clássico".
- [ ] **B. Lavagem com esponja.** Mão lavando com esponja a porta de um carro escuro coberto de espuma: a imagem mais óbvia de lavagem, mas o arquivo é três vezes maior. `public/images/home-hero.webp`, 1600 × 989, 384.820 bytes (376 KB). Autor: Nik (@helloimnik). Página: https://unsplash.com/photos/phP5Qa0CauQ (publicada em 14/09/2023). Texto alternativo: "Mão lavando com esponja a porta de um carro coberto de espuma".

Descartadas na busca: fotos com o emblema da BMW ou da Mercedes-Benz, com texto ou nome na roupa, ou verticais.

**Texto proposto (opção 1, imagem A):**

- `docs/padroes/design-midia.md`, tabela "Créditos das imagens", linha nova: "| `public/images/home-hero.webp` | Luay Barani (@luaybarani) | Unsplash | Licença da Unsplash | https://unsplash.com/photos/5SmPnmCjwcU | <data do download> |".
- `docs/catalogo/paginas-publicas.md`, seção "Página inicial", "Destaque": "Texto e imagem lado a lado a partir de 1024 px; abaixo disso, o texto primeiro e a imagem embaixo, num cartão de destaque na proporção φ:1, sem texto sobre ela. A imagem é a única da página com `preload`."

### L5. Cartão de serviço sem imagem

**Problema.** O RF006 pede o cartão com imagem, mas a imagem é opcional no cadastro (`image_path`, `docs/catalogo/dados.md`), e as dos serviços entram pelo painel no Storage, inclusive as da demonstração, nunca em `public/` (`design-midia.md`, `estrutura-de-pastas.md`). Até a #47 não há envio, então os 11 serviços da demonstração ficam sem imagem. Nenhum módulo diz o que o cartão mostra sem ela.

**Opções:**

- [x] **1. O lugar da imagem com um ícone (recomendada).** Sem imagem, o cartão mantém a área na proporção φ:1, rebaixada (`inset-shadow-neu-sm`), com o ícone `CarFront` de 42 px em `--muted-foreground`, decorativo (`aria-hidden`). Todos os cartões ficam do mesmo tamanho, e a grade não muda quando a #47 trouxer as imagens. Na demonstração, todos os cartões mostram o ícone.
- [ ] **2. Cartão sem a área da imagem.** O cartão encolhe sem imagem; numa grade com e sem imagens, os cartões ficam desalinhados.
- [ ] **3. Imagens de demonstração em `public/`.** O professor vê fotos nos cartões, mas contraria `design-midia.md` e `estrutura-de-pastas.md` ("nunca imagens de serviços"), pede o aval de 11 arquivos e o caso sem imagem continua sem definição.

**Texto proposto (opção 1):** `docs/catalogo/paginas-publicas.md`, seção "Catálogo", "Cartão": "A imagem do serviço no topo, na proporção φ:1; sem imagem, o mesmo lugar rebaixado, com o ícone `CarFront` de 42 px. Abaixo, a categoria como sobretítulo, o nome, a descrição e 'Duração média: <duração>'."

### L6. `priority` do `next/image` substituída no Next.js 16

**Problema.** `design-midia.md` diz "Só a imagem da seção de destaque carrega com prioridade (`priority`)", mas no Next.js 16 a propriedade `priority` foi substituída por `preload` (documentação do Next.js instalado, `image.md`).

**Opções:**

- [x] **1. `preload` (recomendada).** A propriedade nova, com o mesmo efeito: a imagem é pedida já no `<head>`. O texto do módulo passa a citar `preload`.
- [ ] **2. `loading="eager"` e `fetchPriority="high"`.** A documentação diz que servem "na maioria dos casos", sem o pedido no `<head>`; para a imagem da seção de destaque, que é a candidata a LCP, o `preload` a pede mais cedo.
- [ ] **3. Manter `priority`.** Funciona por enquanto, mas é uma propriedade substituída, que pode sair numa próxima versão.

**Texto proposto (opção 1):** `docs/padroes/design-midia.md`, Imagens: "Só a imagem da seção de destaque carrega com prioridade (`priority`); as outras esperam até aparecer na tela (RNF006)." passa a "Só a imagem da seção de destaque carrega com prioridade (`preload`, que substitui o `priority` no Next.js 16); as outras esperam até aparecer na tela (RNF006)."

## Decisões técnicas

Nenhuma nova.

- Seguidas:
  - 0017: código em inglês, textos em português;
  - 0035 e 0052: testes antes do código nas funções de formatação; os componentes, à mão;
  - 0036: o `public/.gitkeep` sai com o primeiro arquivo, e `public/` não ganha README;
  - 0041: esqueleto pelo wireframe, conteúdo pelo UC01, estilo por `design.md`;
  - 0049: componentes do shadcn/ui sobre Base UI;
  - 0051: `/` e `/services` continuam públicas no `proxy.ts`;
  - 0053: o horário do dia aparece como a API o devolve, no fuso da empresa;
  - 0055: `/services` com os dados de demonstração e o aviso; `/` sem eles.

Escolhas locais, sem registro:

- O filtro como grupo de botões de opção nativos, sem componente novo do shadcn.
- A localização numa chamada própria a `GET /api/public/company`, separada da do rodapé.
- O título da seção de destaque em `text-h2 md:text-h1`, sem o tamanho `text-display`: ao lado da imagem, o título de 110 px quebraria em muitas linhas.
- Os ids da demonstração iguais aos do `seed-demo.sql`.

## Riscos e dúvidas

- **Tamanho do PR.** Estimativa de 270 linhas em `src/` na página inicial (seções 210, formatação e constante 60) e 400 no catálogo (dados de demonstração 110, catálogo, filtro e cartão 240, tipos, lista e página 50), mais cerca de 40 de testes e 120 de documentação: cerca de 670 linhas, acima das ~400 de `pull-request.md`. Por isso, dois PRs em sequência (Ordem da construção): o PR 1 com "Refs #57", o PR 2 com "Closes #57". O PR 2 depende do módulo `paginas-publicas.md` criado no PR 1.
- **Duas chamadas iguais na página inicial.** A localização e o rodapé chamam `GET /api/public/company` cada um; a resposta é pequena e sem cache (`api.md`). Compartilhar a chamada pediria um contexto ou um cache, além do escopo.
- **Atalhos para quem já entrou.** Pelo UC01 FA01, o cliente autenticado vê "Criar conta" e "Entrar" na seção de destaque, e o `proxy.ts` o leva à página inicial da área se clicar. Se você quiser trocar os atalhos pela sessão (por exemplo, "Agendar" para o cliente), é mudança no UC01, fora deste plano.
- **Catálogo com uma página só.** A demonstração tem 11 serviços, menos que os 12 por página; a paginação aparece com "1–11 de 11". A troca de página do `demoPage` já tem teste (#56).
- **Tipos provisórios.** Com a opção 1 de L1, os nomes dos campos ficam em `rotas.md`, e a #48 os segue; a ordem dos serviços na resposta fica para a #48 (a demonstração usa a do `seed-demo.sql`).
- **Pontos para a sua aprovação**, além das lacunas:
  - o download da imagem escolhida em L4, com o arquivo, a fonte, o tamanho e a licença acima;
  - os dois PRs, ou um só;
  - com a opção 1 de L1, acrescentar ao corpo da #48 o item "`GET /api/public/categories`: as categorias ativas com serviço ativo, para o filtro (UC01)", com o seu OK na conversa;
  - como na #56: as chaves do banco local no `next start`, a conta de admin só no banco local e a alteração temporária de `src/lib/demo/catalog.ts`, sem commit.

## Fora do escopo

- `GET /api/public/services`, `GET /api/public/categories` e a ligação das telas (#48); a imagem dos serviços no Storage e o domínio dele em `next.config.ts` (#47).
- Seções do wireframe sem requisito: "Serviços em destaque", "Como funciona", a chamada final para agendar e, no catálogo, o agrupamento por tipo, a busca e os adicionais de cada serviço.
- O aviso de que é preciso entrar para agendar (`LoginRegisterRequirementModal`): o UC01 não o tem, e o `proxy.ts` já leva o visitante de `/booking` ao login (RN001).
- Agendamento a partir do catálogo (fase 3).
- Mudança no `seed-demo.sql`, nas configurações da empresa ou no rodapé.
- Testes automatizados de componentes (decisão 0052).
- Os documentos formais (#67).

## Ajuste pedido na etapa 02 (21/10/2026)

**Pedido.** Na verificação local do PR 2, as setas desativadas da paginação apareceram sem o estado "Desativado" de `design.md` (opacidade 0,5, cursor `not-allowed`, `shadow-neu-sm`). O Yvan pediu na conversa para corrigir isso dentro da #57, no PR 2.

**Causa.** O `ListPagination` usa `disabled` com `focusableWhenDisabled`, para a seta continuar recebendo o foco. Nesse modo, o Base UI não grava o atributo `disabled` no botão, só `aria-disabled="true"` e `data-disabled`, e as classes `disabled:` do `buttonVariants` não se aplicam (medido no Chrome: opacidade 1, cursor normal). A mesma causa atinge o estado "Carregando" de `design.md` (opacidade 0,7, sem cliques) no `SubmitButton`, usado no login, no cadastro, na troca de senha, nas configurações da empresa e no formulário em etapas, e no botão de confirmação do `ConfirmDialog`, que ainda não está em nenhuma tela: os dois usam `disabled:cursor-progress disabled:opacity-70` com `focusableWhenDisabled`.

**Opções (marque uma):**

- [x] **1. Estado desativado também por `aria-disabled` (recomendada).** No `buttonVariants`, o botão com `aria-disabled="true"` recebe o mesmo tratamento do desativado (opacidade 0,5, cursor `not-allowed`, `shadow-neu-sm`), sem o efeito de pressionado ao clicar; o `SubmitButton` e o `ConfirmDialog` trocam `disabled:` por `aria-disabled:` no estado "Carregando". Corrige as setas e o carregamento dos dois botões, em três arquivos. O foco, o anúncio do leitor de tela e o bloqueio do clique, que o Base UI já faz, não mudam.
- [ ] **2. Só as setas da paginação.** As classes do desativado no `PageButton` do `ListPagination`, um arquivo. O carregamento do `SubmitButton` e do `ConfirmDialog` continua sem a opacidade e o cursor de espera, para outra tarefa.

**Verificação.** Local, no Chrome sem interface, como o restante do PR 2. Com a alteração temporária de `src/lib/demo/catalog.ts` (33 serviços, sem commit): as setas desativadas com opacidade 0,5, cursor `not-allowed` e o contorno de foco, sem o efeito de pressionado ao clicar, e as ativas sem mudança, a 360 e a 1440 px, claro e escuro. Com a opção 1, também o botão "Entrar" de `/login` durante a chamada (requisição retida pelo Chrome de teste), com opacidade 0,7, cursor de espera e o foco. `npm run check` sem erros nem avisos. Componentes conferidos à mão (decisão 0052); a documentação não muda, porque `design.md` já define os dois estados.

## Estado da construção

PR 1 (página inicial) feito dentro do plano aprovado, na ramificação `feat/57-portal-screens` (commits 327b58b a ea52d83): testes em vermelho, formatação e nomes dos dias, as três seções com a imagem A e a documentação de L2 (página inicial), L3, L4 e L6. Nenhum arquivo fora da lista do plano. `npm run check` aprovado, com 387 testes; verificação local aprovada, com o resultado em `notas.md`. Na etapa 03, o `02_relatorio.md` parcial e o PR #70, incorporado em 818895a.

PR 2 (catálogo) feito dentro do plano aprovado, na ramificação `feat/57-services-catalog` (commits 7130a45 a 86f024e): tipos, dados de demonstração e as duas entradas da lista; filtro, cartão, catálogo e `/services`; a documentação de L1, L5 e da parte do catálogo de L2; e o ajuste da etapa 02, com a opção 1 (estado desativado dos botões que mantêm o foco). Nenhum arquivo fora da lista do plano. `npm run check` aprovado, com 387 testes; verificação local de `/services`, de novo de `/` e do ajuste aprovada, com o resultado em `notas.md`. Na etapa 03, o `02_relatorio.md` completo, o PR com "Closes #57" e o item da rota de categorias no corpo da #48. Falta a etapa 04.
