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

Etapa 03 do PR 1, a pedido do Yvan. O plano previa o relatório parcial em `notas.md`; ele foi para `02_relatorio.md`, marcado como parcial, como no PR 1 da #66 (`Refs #66`), porque o contrato da etapa 03 pede o arquivo. O plano continua em `em_execucao` até o PR 2. A `origin/main` continuava em d6d28b8, sem nada a incorporar.
