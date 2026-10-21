# Notas: 57-telas-do-portal

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-21 – descoberta

Conferências do planejamento, sem alterar o código do projeto:

- **Origem.** Sessão iniciada pela sessão principal para conduzir a #57 (T1 da `proposta-das-issues.md` da #66), a primeira tela depois da #56 (PR #69, d6d28b8). A nota de passagem da #56 e as notas dela foram lidas; a pasta de notas compartilhadas desta sessão estava vazia.
- **Worktree.** `36-regras-do-agendamento-05611e` (nome herdado, não renomeável), na ramificação `claude/57-telas-do-portal-b7f81a`, em d6d28b8, igual à `origin/main` depois do `git fetch`. Plano e notas sem commit, como nas etapas 01 anteriores. A etapa 02 cria `feat/57-portal-screens` a partir da `origin/main`.
- **GitHub.** Nenhum PR aberto. A #48 ficou com `GET /api/public/services` e a ligação das telas; a #47, com a imagem dos serviços no Storage.
- **Rotas.** `GET /api/public/services` aceita `categoryId` e pagina com 12 (`api.md`), mas nenhuma rota pública lista as categorias, e a resposta é descrita por alto (L1). `GET /api/public/company` (#37) devolve também `businessHours`; o plano da #37 previa "a página inicial, com a seção de localização e os horários" (L3).
- **Textos.** Nenhum módulo tem o texto da seção de destaque, da institucional ou da introdução do catálogo; o RF004 e a RN028 pedem as informações institucionais das configurações, que não têm campo "sobre a empresa" (L2).
- **Demonstração.** No `seed-demo.sql`, o catálogo público mostra 11 serviços (8 principais e complementares de Lavagem e Polimento e proteção, 3 de Higienização); ficam fora a "Lavagem a seco" (inativa e excluída), a "Cristalização de vidros" (inativa) e a "Película nos vidros" (categoria inativa). Os ids do seed são `md5('glow-demo:<chave>')` como UUID (por exemplo, `category:Lavagem` → `4e31423b-fe30-cf42-7e5a-eebc618ac6e6`).
- **Imagens dos serviços.** `design-midia.md` e `estrutura-de-pastas.md` mandam as imagens dos serviços para o Storage, "inclusive as da demonstração", nunca para `public/`; até a #47, os cartões ficam sem imagem (L5).
- **Next.js 16.4.1.** `priority` do `next/image` foi substituída por `preload` (documentação em `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`); `design-midia.md` ainda cita `priority` (L6). O `Content-Security-Policy` de `next.config.ts` não restringe quadros de outros sites, mas a opção recomendada de L3 não usa quadro.
- **Imagens candidatas** (Unsplash, conferidas no painel do navegador em 21/10/2026, "Uso gratuito sob a Licença da Unsplash"): descartadas as com emblema da BMW (jVm9stv6UpE) ou da Mercedes-Benz (bCQSrcYghJI, dlJelFmdpOc), com nome na roupa (iXpjQNP__EQ) ou verticais (UBR0xeCoviE, Q1VMecH0QEE). Ficaram 5SmPnmCjwcU (Luay Barani, painel com pincel laranja) e phP5Qa0CauQ (Nik, lavagem com esponja). Tamanhos lidos por `curl -I` em `images.unsplash.com/<foto>?w=1600&h=989&fit=crop&fm=webp&q=75`, sem baixar: 128.964 e 384.820 bytes. Nada foi baixado.
- **Wireframes.** A página inicial do wireframe tem "Serviços em destaque", "Como funciona" e uma chamada final, e o catálogo agrupa por tipo, busca e mostra os adicionais: sem requisito, ficam de fora (`wireframes/README.md`).
- **Proteção das páginas.** Quem já entrou e abre `/login` ou `/register` vai à página inicial da área (`protecao-das-paginas.md`); com o UC01 FA01 ("da mesma forma"), os atalhos da página inicial não mudam com a sessão.
- **Tamanho.** Cerca de 670 linhas em `src/`, acima das ~400 de `pull-request.md`: o plano propõe dois PRs (página inicial, depois catálogo).
- **Formatos.** `encodeURIComponent("Rua Exemplo, 100 – Ponta Verde, Maceió – AL")` conferido para o valor do teste do link de rota.

## 2026-10-21 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas:

- L1, categorias do filtro: recomendado `GET /api/public/categories`, sem paginação, e os campos da resposta de serviços em `rotas.md`;
- L2, textos: recomendado textos fixos sem dado da empresa, no módulo novo `docs/catalogo/paginas-publicas.md`;
- L3, localização: recomendado endereço com o link "Como chegar" (Google Maps, na mesma aba) e o horário dos sete dias;
- L4, seção de destaque: recomendado texto e imagem lado a lado, com a imagem A (5SmPnmCjwcU, 126 KB);
- L5, cartão sem imagem: recomendado o lugar da imagem com o ícone `CarFront`;
- L6, `priority` → `preload`.

Pontos de aprovação: o download da imagem, os dois PRs, a edição do corpo da #48 (com a opção 1 de L1) e, como na #56, as chaves do banco local, o admin local e a alteração temporária sem commit. Nada foi construído.

## 2026-10-21 – decisão

Plano aprovado por yvan (21/10/2026), gravado no arquivo, com a opção recomendada em todas as lacunas, marcadas a pedido dele na conversa: L1 opção 1 (`GET /api/public/categories`), L2 opção 1 (textos fixos em `paginas-publicas.md`), L3 opção 1 ("Como chegar" e horário), L4 opção 1 com a imagem A (5SmPnmCjwcU), L5 opção 1 (ícone `CarFront`) e L6 opção 1 (`preload`). Com o plano, ficam aprovados os pontos dele: o download da imagem A, os dois PRs, a edição do corpo da #48 e, como na #56, as chaves do banco local, o admin local e a alteração temporária sem commit. Status em `em_execucao`. Etapa 02 começa pelo PR 1 (página inicial).

## 2026-10-21 – desvio

Etapa 02, PR 1 (página inicial), na ramificação `feat/57-portal-screens`, criada da `origin/main` (d6d28b8), sem vínculo, com `npx -y npm@11.21.1 ci`. Commits, nesta ordem:

- 327b58b: testes em vermelho (`business-hours.test.ts` e `address.test.ts` falhavam na importação, sem as funções);
- 9201c18: `formatBusinessHours`, `formatDirectionsLink` e `WEEKDAY_LABELS` (37 testes de formatação verdes);
- 9cda592: as três seções, a página inicial e `public/images/home-hero.webp`, com o `public/.gitkeep` removido;
- ea52d83: `paginas-publicas.md` (só a parte da página inicial; o catálogo entra no PR 2), `catalogo/CONTEXT.md`, `design-midia.md` (crédito e `preload`), `testes.md` e os README.

Desvios pequenos, sem mudar regra nem escopo:

- **Imagem.** Baixada em 21/10/2026 do endereço do plano: WebP, 1600 × 989, 128.964 bytes, igual ao lido antes pelo `curl -I`. Licença conferida na página no mesmo dia. No recorte não aparecem marca, placa nem rosto.
- **Cartões da localização.** O endereço e o horário ficam em dois cartões, lado a lado a partir de 768 px. Sem endereço, só o do horário.

## 2026-10-21 – descoberta

Verificação local do PR 1, aprovada:

- **Ambiente.** Docker Desktop aberto; `npx supabase start` e `db reset` (só o `seed.sql`); variáveis pelo `local/local-env.sh` do scratchpad, que só aceita `http://127.0.0.1:` e não as exibe; admin pelo `create-admin.mjs`, com o e-mail fictício e a senha gerada em `local/admin.json` do scratchpad, nunca exibidos; `npx next build` (`/` estática, sem avisos) e `npx next start -p 3057`.
- **Sem endereço** (antes de gravar): `/` com as três seções, sem a linha do endereço nem o "Como chegar", e o horário de segunda a domingo ("08:00 às 12:00 e 13:00 às 18:00" de segunda a sexta, "08:00 às 12:00" no sábado, "Fechado" no domingo).
- **Com endereço**, gravado pelo admin na aba "Empresa" ("Dados da empresa salvos."): o endereço aparece, e o link vai a `https://www.google.com/maps/dir/?api=1&destination=Rua%20Exemplo%2C%20100%20%E2%80%93%20Ponta%20Verde%2C%20Macei%C3%B3%20%E2%80%93%20AL`. "Criar conta" leva a `/register`, e "Entrar" a `/login`. Sem `DemoNotice` na página.
- **Larguras e temas.** A 360 × 800 e a 1440 × 900, claro e escuro, nada transborda. A imagem tem 312 × 193 no celular (variante de 384 px) e 572 × 354 no computador (variante de 640 px), com o `<link rel="preload">` no `<head>`. Capturas em `local/shots/` do scratchpad.
- **Teclado.** Ordem: "Pular para o conteúdo", marca, navegação (ou "Abrir menu" a 360 px), ações do cabeçalho, "Criar conta", "Entrar", "Como chegar" e rodapé, com o contorno de foco em todos.
- **Falha** de `GET /api/public/company`, com a requisição interrompida pelo Chrome de teste: dois avisos com a mensagem de `SERVICE_UNAVAILABLE` e "Tentar novamente", na localização e no rodapé, sem transbordar.
- **Lighthouse 13.5.0, acessibilidade:** 100 em `/` no celular e no computador, claro e escuro, sem auditoria reprovada.
- **LCP no celular.** No modo padrão do Lighthouse (estrangulamento simulado), 3,0 s em duas execuções (desempenho 95, CLS 0). O LCP é a imagem, mas no `localhost` os scripts do Next.js (~210 KB) rodam antes da primeira pintura, e a simulação os soma ao LCP. `/login`, já na `main`, dá 3,2 s no mesmo modo. Com o estrangulamento aplicado pelo DevTools (`--throttling-method=devtools`), `/` dá 1,8 s em duas execuções (igual ao FCP, CLS 0, desempenho 98), e `/login`, 4,0 s. Uma variante temporária com `loading="eager"` e `fetchPriority="high"` no lugar do `preload` (opção 2 de L6), sem commit e desfeita, deu os mesmos números (3,0 a 3,1 s simulado, 1,8 s aplicado). A forma aprovada continua. O número que vale para RNF006 é o da pré-visualização.
- **Registro.** O `next start` foi reiniciado para a variante, e o registro guardou só a última execução: 12 linhas, nenhuma com cookie, token, cabeçalho de autorização, senha ou o e-mail de teste, e nenhuma de erro. As execuções anteriores, com o login do admin, não foram conferidas. No PR 2, o registro é acumulado.
- **Encerramento.** `next start` encerrado por PID e `npx supabase stop`, com o backup do banco local, que guarda o endereço para o PR 2. `git status` só com a pasta da tarefa. `npm run check` sem erros nem avisos, com 387 testes; `npm audit --omit=dev --audit-level=high` com 0. Nenhum import de `src/server/`, e nada em `src/app/api/`, `supabase/` ou `src/shared/validation/`.

## 2026-10-21 – desvio

Etapa 03 do PR 1, a pedido do Yvan: PR #70, aberto como rascunho para pôr o número no relatório e depois marcado como pronto. O plano previa o relatório parcial em `notas.md`; ele foi para `02_relatorio.md`, marcado como parcial, como no PR 1 da #66 (`Refs #66`), porque o contrato da etapa 03 pede o arquivo. O plano continua em `em_execucao` até o PR 2. A `origin/main` continuava em d6d28b8, sem nada a incorporar.

## 2026-10-21 – descoberta

Retomada do PR 2 (catálogo), numa sessão nova, depois da incorporação do PR 1 (#70, 818895a):

- **Plano.** Conferido no arquivo: aprovado por yvan em 21/10/2026, `em_execucao`, opção 1 em L1 a L6 e imagem A em L4.
- **Ramificação.** Worktree `56-base-da-demonstracao-e6d9a4` (nome herdado), passado para `feat/57-services-catalog`, só local e sem vínculo, com o commit 7130a45 sobre 818895a (igual à `origin/main`). `npx -y npm@11.21.1 ci` concluído.
- **Commit 7130a45 reaproveitado.** Feito antes de um retrocesso da conversa e não registrado antes; o Yvan pediu para reaproveitá-lo. Conferido contra o plano (passo 8): `PublicCategory` e `PublicService` com os campos de L1; as três categorias em ordem alfabética; os 11 serviços na ordem do `seed-demo.sql`, com nome, descrição, duração e categoria iguais aos do arquivo, sem a "Lavagem a seco", a "Cristalização de vidros" e a "Película nos vidros"; `imageUrl` `null` em todos; os 14 ids iguais a `md5('glow-demo:<chave>')` calculado de novo; `demoPage` com `CATALOG_PAGE_SIZE` e o filtro `categoryId`; as duas entradas de `DEMO_ROUTES`, com `load`. `npm run check` aprovado, com 387 testes.

## 2026-10-21 – desvio

Etapa 02 do PR 2, passos 9 e 10, na mesma ramificação. Commits:

- 20be3b8: `category-filter.tsx`, `service-card.tsx`, `service-catalog.tsx` e `src/app/(portal)/services/page.tsx`;
- a4c319e: L1 em `rotas.md` e `api.md`; a parte do catálogo de L2 e L5 em `paginas-publicas.md`.

Escolhas pequenas, sem mudar regra nem escopo:

- **Catálogo sem o `PaginatedList`.** O componente compartilhado tem a busca embutida, que o catálogo não usa; o `ServiceCatalog` chama o `usePaginatedList` e desenha os mesmos estados de `componentes.md` na forma da grade, com o `ListPagination`.
- **Título.** `text-h3 md:text-h2`, como os títulos das outras páginas.
- **Filtro.** A legenda "Categoria" fica visualmente oculta, lida pelo leitor de tela; o lugar reservado tem quatro pílulas, que quebram em duas linhas a 360 px como as reais.
- **Imagem do cartão.** Com imagem (depois da #47), `alt=""`, porque o nome do serviço logo abaixo diz o que ela mostra; `sizes` pela largura do cartão em cada grade.
- **`paginas-publicas.md`.** Além dos textos de L2 e L5, uma frase de abertura do catálogo (serviços ativos de categorias ativas, de `GET /api/public/services`, em páginas de 12) e a linha de carregamento e falha (UC01 FE02), como na localização. O parágrafo fica "abaixo do título e do aviso de demonstração enquanto a tela usar os dados de demonstração", para o texto continuar certo quando a #48 tirar o aviso.

## 2026-10-21 – descoberta

Verificação local do PR 2, aprovada:

- **Ambiente.** `npx supabase start` a partir do backup do PR 1 (com o endereço gravado), sem `db reset`; variáveis pelo `local-env.sh` do scratchpad, que não as exibe; `npx next build` (`/services` estática, sem avisos) e `npx next start -p 3057`. Chrome sem interface pelo `puppeteer-core` do cache do Lighthouse 13.5.0.
- **Conteúdo.** `/services` com o título "Serviços", o `DemoNotice` logo abaixo dele, o parágrafo de L2, o filtro ("Todas", Higienização, Lavagem, Polimento e proteção) e os 11 cartões, cada um com o ícone `CarFront` no lugar da imagem (φ:1: 272 × 168 a 360 px e 331 × 204 a 1440 px), a categoria, o nome, a descrição e a duração ("Duração média: 1 h 30 min"), e "1–11 de 11". Uma coluna a 360 px e três a 1440 px.
- **Larguras e temas.** 360 × 800 e 1440 × 900, claro e escuro, nada transborda. Capturas em `local/shots/` do scratchpad.
- **Filtro.** "Higienização" → só Higienização interna completa, Higienização do ar-condicionado e Oxi-sanitização ("1–3 de 3"); "Todas" → os 11. Lavagem e Polimento e proteção, 4 cada. A pílula marcada continua em `--link` sob o cursor. Lista de requisições sem `/api/public/services` nem `/api/public/categories` (a demonstração não vai à rede); só `/api/public/company` (rodapé) e `/api/auth/me`.
- **Teclado.** "Pular para o conteúdo", marca, navegação (ou "Abrir menu" a 360 px), ações do cabeçalho e a opção marcada do filtro; as setas trocam a categoria (3, 4, 4 e 11 serviços), com o contorno de foco na pílula; depois, o rodapé.
- **Carregamento.** Na primeira carga, o filtro com quatro pílulas reservadas e três cartões reservados na forma do cartão.
- **Falha e paginação**, por alteração temporária de `src/lib/demo/catalog.ts` (a primeira chamada de cada rota lança erro, e as seguintes devolvem 33 serviços): os dois avisos com "Tentar novamente", no lugar do filtro e dos cartões; tentar de novo os serviços traz "1–12 de 33" com o aviso do filtro ainda na tela, e tentar de novo o filtro traz as pílulas. Pelo teclado, da opção do filtro para os sete botões da paginação, com o contorno; "Próxima página" com Enter leva a "13–24 de 33" e a "25–33 de 33", com o foco no botão. Nos dois tamanhos, nada transborda.
- **Vazio**, pela mesma alteração temporária (nenhuma categoria e nenhum serviço): só "Todas" no filtro e "Não há serviços disponíveis no momento.", como status, sem paginação.
- **Lighthouse 13.5.0, acessibilidade:** 100 em `/services` no celular e no computador, claro e escuro, e 100 em `/` no celular, claro e escuro, sem auditoria reprovada.
- **LCP no celular.** `/services`: 3,0 s em duas execuções no modo padrão (simulado; desempenho 94, CLS 0) e 1,9 s com o estrangulamento do DevTools (igual ao FCP, CLS 0, desempenho 96); o LCP é o texto do aviso de demonstração, de servidor. `/`: 3,0 s simulado (desempenho 95) e 1,9 s pelo DevTools (desempenho 97), CLS 0, com a imagem, como no PR 1.
- **Registro.** Acumulado (`>>`) nas três execuções do `next start` (a normal e as duas variantes): 91 linhas, nenhuma com cookie, token, cabeçalho de autorização, senha, chave ou e-mail de teste, e nenhuma de erro ou aviso no registro da aplicação. As requisições registradas são só `GET /api/public/company` (200) e `GET /api/auth/me` (401, visitante). O próprio Next.js avisa, em cada início, que `next start` não combina com `output: standalone`, como no PR 1.
- **Encerramento.** `next start` encerrado por PID; a alteração temporária desfeita (`git diff` vazio) e a aplicação compilada de novo sem ela; `npx supabase stop`, com o backup. `npm run check` sem erros nem avisos, com 387 testes; `npm audit --omit=dev --audit-level=high` com 0. Nenhum import de `src/server/` nos arquivos novos, e nada em `src/app/api/`, `supabase/` ou `src/shared/validation/` (`git diff --stat origin/main...HEAD`: 10 arquivos, todos da lista do plano).

## 2026-10-21 – descoberta

Fora do escopo, visto na paginação da variante temporária: as setas desativadas do `ListPagination` (#56) usam `focusableWhenDisabled`, então ficam com `aria-disabled` e `data-disabled`, sem o atributo `disabled`; o `buttonVariants` só estiliza `disabled:`, e as setas aparecem com opacidade 1 e o cursor normal, contra a linha "Desativado" de `design.md` (opacidade 0,5, cursor `not-allowed`). O leitor de tela anuncia o estado. Nenhum arquivo alterado; fica como tarefa à parte.
