---
issue: 56
titulo: "Base das telas de demonstração: dados no cliente da API, aviso e etiqueta de status"
areas: [frontend, testes]
tipo: funcionalidade
requisitos: [RN017, RNF004, RNF005, RNF008]
status: concluido
aprovado_por: yvan
aprovado_em: 21/10/2026 - 10:28
---

# Plano: Base das telas de demonstração: dados no cliente da API, aviso e etiqueta de status

## Objetivo

Permitir construir as telas antes das rotas, como aprovado na proposta de 21/10/2026 (`memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, opção 1 de LT1 a LT4, decisão 0055 nova):

- o `apiRequest` procura o método e o caminho numa lista de `src/lib/demo/` antes do `fetch` e, se os acha, responde depois de 400 ms, sem nenhuma requisição de rede: com os dados fixos do módulo, numa leitura, e com `NOT_IMPLEMENTED` (501), numa gravação (LT1);
- a página, a busca e os filtros sobre a lista fixa (LT3, RNF008);
- o aviso `DemoNotice` (LT2) e a etiqueta `StatusBadge`, com o nome do status escrito e um tom por fase (RN017, RNF005), que sai do escopo da #46;
- a documentação de LT1 a LT4 e das lacunas deste plano, e a decisão 0055.

A lista começa vazia: cada tela, da #57 à #65, acrescenta as suas rotas e o seu módulo de dados. Não há rota, migration, esquema de validação nem dependência nova.

## Base da construção

- Ramificação `feat/56-demo-data`, criada da `origin/main` (dd70f96, com a #21 à #26, a #35 à #38 e o PR 1 da #66), sem vínculo com a `main`, e `npx -y npm@11.21.1 ci`.
- Contratos usados sem mudança:
  - `ApiError`, `toApiError` e `withQuery` (`src/lib/api-client.ts`); `useApiQuery` e `usePaginatedList` (`src/hooks/`), que já mandam `page`, `pageSize`, `search` e os filtros pelo `withQuery` e cancelam a chamada pelo `AbortSignal`;
  - `Page<T>` (`src/shared/api/pagination.ts`) e `paginationSchema` (`src/shared/validation/params.ts`), o mesmo que as rotas vão usar: página a partir de 1 e no máximo 50 itens por página (RNF008);
  - `APPOINTMENT_STATUSES` e `APPOINTMENT_STATUS_LABELS` (`src/shared/constants/appointment-statuses.ts`);
  - `Alert` e `Badge` de `src/components/ui/` (decisão 0049) e o ícone `FlaskConical` do `lucide-react` 1.59, já instalado.

## Como funciona

### Lista de demonstração (`src/lib/demo/`, LT1)

| Arquivo | Conteúdo |
|---|---|
| `routes.ts` | os tipos e a lista `DEMO_ROUTES`, vazia. Cada entrada tem o `method`, o `path` como em `rotas.md` (`/api/admin/clients/:id`) e, na leitura, `load`: a carga do módulo de dados por `import()`, que devolve a resposta da rota |
| `match.ts` | `findDemoRoute(method, path)`: tira a consulta do caminho, compara segmento a segmento, com `:nome` valendo qualquer segmento, e devolve a entrada, os parâmetros do caminho e a consulta (`URLSearchParams`), ou `null`. `waitForDemo(signal)`: a espera de 400 ms (`DEMO_DELAY_MS`), interrompida pelo cancelamento |
| `list.ts` | `demoPage(items, query, options)` (LT3), abaixo |
| `README.md` | o que vai na pasta, como acrescentar uma rota e como tirá-la (LT4) |

- A resposta de uma leitura é uma função que recebe `{ params, query }` e devolve o corpo, no tipo de `src/shared/api/`: o detalhe acha o item pelo `:id`, e a listagem pagina conforme a consulta. Os dados ficam em `src/lib/demo/<módulo>.ts`, com os nomes, as placas e os serviços do `supabase/seed-demo.sql`, e só são baixados quando a tela chama a rota, num pedaço separado do código (o `import()` da entrada).
- A entrada de gravação não tem `load`, só o método e o caminho. Assim, o `POST` que não grava, como a prévia de valores e a análise do dashboard, tem `load` e devolve os dados fixos; o que grava não tem e é recusado.
- A lista compara o método e o caminho juntos: outro método no mesmo caminho, fora da lista, vai à rede, como a rota real. Cada tela lista também as gravações que usa.

### `apiRequest` (`src/lib/api-client.ts`)

Antes do `send`, `findDemoRoute(method, path)`. Achada a entrada:

1. espera 400 ms (`waitForDemo`), para o carregamento aparecer, também na gravação ("Salvando…"); cancelada pela tela nesse meio-tempo, a chamada é rejeitada com o mesmo `AbortError` do `fetch`, que o `useApiQuery` já ignora;
2. sem `load`, lança o `ApiError` `NOT_IMPLEMENTED` do catálogo (501, "Esta ação ainda não está disponível nesta versão de demonstração."), sem `fields` nem `requestId`, como a falha de rede; a tela o mostra como qualquer falha (`useFormFailure`, `FormAlert`), e nada é gravado;
3. com `load`, carrega o módulo e devolve a resposta da função.

Sem entrada, a chamada segue como hoje. A demonstração nunca leva a `/login` nem a `/set-password`, porque não responde 401 nem 403. Vale em todos os ambientes, inclusive na produção da Vercel, onde o professor vê as telas.

### Página, busca e filtros (`demoPage`, LT3)

`demoPage(items, query, { pageSize, searchIn, filters })` devolve `{ data, page, pageSize, total }` (`Page<T>`):

- `page` e `pageSize` da consulta, pelo `paginationSchema(pageSize)`: o tamanho da listagem em `api.md` é o padrão (`ADMIN_LIST_PAGE_SIZE` e as outras constantes de `src/shared/constants/pagination.ts`), e acima de 50 vale 50;
- `search`: o termo contido em algum dos textos que `searchIn(item)` devolve, sem distinção de maiúsculas (`toLocaleLowerCase("pt-BR")`); sem busca, todos os itens;
- `filters`: um leitor por parâmetro, como `{ type: (service) => service.type }`. Parâmetro presente na consulta: só os itens com o valor igual, comparado como texto, como o `withQuery` o escreve, inclusive `true` e `false`. Parâmetro ausente ou desconhecido não filtra, como a API descarta o que não está previsto;
- a ordem é a da lista fixa, que o módulo grava na ordem da rota.

Filtro que não é igualdade, como a visão do dia de `/admin/appointments` ou a opção de inativos, e a ordenação ficam na resposta do módulo, antes de chamar `demoPage` (README da pasta).

### `NOT_IMPLEMENTED` (`src/shared/errors/catalog.ts`)

Código novo, depois de `INTERNAL_ERROR`: `{ status: 501, message: "Esta ação ainda não está disponível nesta versão de demonstração." }`, com a linha em `api.md` (LT1). Só o cliente da API o produz; o tratamento único do servidor o aceitaria como qualquer código do catálogo, mas nenhum serviço o lança. Não entra na especificação OpenAPI, porque nenhuma rota o responde.

### `DemoNotice` (`src/components/shared/demo-notice.tsx`, LT2 e L3)

- Componente sem estado (sem `"use client"`), usado por telas de servidor e de cliente, sem propriedades: o texto é o mesmo em toda tela.
- O `Alert` da variante padrão (superfície com `shadow-neu-md`), com o ícone `FlaskConical` (16 px, `aria-hidden`) e o texto "Dados de demonstração: esta parte ainda não está ligada ao sistema, e nada do que você fizer nela é gravado.", com "Dados de demonstração:" em peso 600 e `--foreground`, e o resto em `--muted-foreground` (4,9:1 nos dois temas).
- `role="note"` no lugar do `role="alert"` do `Alert`: o aviso está na página desde a carga e não é uma mudança a anunciar; o leitor de tela o lê na ordem da página.
- Sem botão de fechar. A posição na tela é a de L3.

### `StatusBadge` (`src/components/shared/status-badge.tsx`, L1)

- `<StatusBadge status="scheduled" />`: o `Badge` (`rounded-lg`, 12 px, peso 600, `design.md`) com o nome de `APPOINTMENT_STATUS_LABELS` e o tom da fase, numa tabela de consulta de status para classes (`codigo.md`), sem `if` por status.
- Sem estado. O nome é o próprio texto da etiqueta: o leitor de tela o lê sem `aria-label`.
- Os tons são os da opção recomendada de L1, só com as cores do tema; o contraste do texto, calculado pela fórmula da WCAG sobre `--background`, que é a cor das superfícies, vai de 4,8:1 a 12,5:1.

### Arquivos novos e alterados de `src/`

| Arquivo | Conteúdo |
|---|---|
| `lib/api-client.ts` | consulta à lista antes do `send`, espera e `NOT_IMPLEMENTED`; o tipo `HttpMethod` passa a ser exportado, para a lista |
| `lib/demo/routes.ts`, `match.ts`, `list.ts`, `README.md` | novos |
| `lib/README.md` | a pasta `demo/` |
| `shared/errors/catalog.ts` | `NOT_IMPLEMENTED` |
| `components/shared/demo-notice.tsx`, `status-badge.tsx` | novos |
| `components/shared/README.md` | o aviso de demonstração |

## Ordem da construção

1. Criar a ramificação `feat/56-demo-data` da `origin/main`, desfazer o vínculo com a `main` e rodar `npx -y npm@11.21.1 ci`.
2. Testes de `tests/lib/api-client.test.ts` (seção "Testes previstos"), conferidos em vermelho, num commit próprio (decisões 0035 e 0052).
3. `NOT_IMPLEMENTED` no catálogo, `src/lib/demo/` e a mudança do `apiRequest`, até os testes passarem.
4. `DemoNotice` e `StatusBadge`.
5. Documentação de LT1 a LT4 e das lacunas, e os README.
6. Verificação local (seção seguinte).
7. Etapa 03: decisão 0055 (ou o próximo número livre), PR e `02_relatorio.md`.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado uma rota na lista, quando a tela a lê, então recebe os dados fixos sem nenhuma requisição de rede | Testes "answers a listed read with the fixed data...", "answers a listed POST that does not write...", "waits 400 ms..." e "loads only the data of the requested route": o `fetch` simulado nunca é chamado |
| Dado 25 itens fixos, quando peço a página 2 com 20 por página, então recebo 5 itens e o total 25; com uma busca, só os itens com o termo, a partir da página 1 | Testes "pages the fixed list" e "searches the term in the fields of the screen, ignoring case" |
| Dado uma gravação numa rota da lista, quando a tela envia, então recebe `NOT_IMPLEMENTED` com a mensagem do catálogo, sem requisição de rede | Teste "refuses a listed write with NOT_IMPLEMENTED..." |
| Dado uma rota fora da lista, então a chamada vai à API como hoje: as telas de acesso e a aba "Empresa" de `/admin/settings` continuam iguais | Testes "sends a route out of the list to the API" e "sends another method of a listed path to the API", e os testes atuais do arquivo, sem mudança. Local, com o banco local: `/login` entra com o admin; em `/admin/settings`, a aba "Empresa" carrega (`GET /api/admin/settings/company` na lista de requisições) e grava (`PUT`, 200, "Dados da empresa salvos."); o rodapé do portal chama `GET /api/public/company`. Pré-visualização: o mesmo, pelo desenvolvedor |
| Dado cada um dos sete status, quando a etiqueta aparece, então o nome está escrito, com contraste de 4,5:1 nos dois temas (RN017, RNF005) | Contraste calculado (L1). Local, numa página temporária sem commit (abaixo): as sete etiquetas com o nome escrito, a 360 × 800 e a 1440 × 900, nos temas claro e escuro, e o Lighthouse de acessibilidade sem auditoria reprovada, inclusive a de contraste |

Também, pela seção "Interface" de `workflows/procedimentos/testes.md`, o `DemoNotice` na mesma página temporária: o texto inteiro, o ícone, sem botão de fechar, sem transbordar a 360 px, nos dois temas, e o Lighthouse sem auditoria reprovada.

### Como a verificação local é feita

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`, só com o `seed.sql`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Conta de teste.** O admin, criado no banco local pelo `create-admin.mjs`, com a senha gerada por um roteiro do scratchpad, guardada num arquivo dele e nunca exibida.
- **Aplicação.** `npx next build` e `npx next start -p 3056`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório.
- **Página temporária.** `src/app/demo-check/page.tsx`, só no worktree, nunca em commit e apagada no fim da verificação: o `DemoNotice` e as sete `StatusBadge` dentro de um cartão. Fora dos grupos `(portal)` e `(admin)`, ela só tem o layout raiz, e o `proxy.ts` a trata como pública (`classifyPage`, de `src/server/auth/page-access.ts`, classifica o caminho desconhecido como `public`). Antes do commit seguinte, `git status` confirma que ela saiu.
- **Telas**, num Chrome sem interface controlado pelo `puppeteer-core` que vem com o Lighthouse 13.5.0, porque o painel do navegador do app oculto trava o foco do Base UI (memória do projeto): a página temporária, `/login` e `/admin/settings`, a 360 × 800 primeiro e a 1440 × 900, nos dois temas, e a lista de requisições de `/admin/settings`.
- **Lighthouse.** `npx -y lighthouse@13.5.0`, acessibilidade, em `/demo-check`, `/login` e `/admin/settings`, celular e computador, claro e escuro (`--force-dark-mode`). O cookie do painel vai por `--extra-headers`, num arquivo do scratchpad apagado no fim, com os JSON, que guardam o cabeçalho.
- **Verificações automáticas.** `npm run check` sem erros nem avisos, `npx next build` e `npm audit --omit=dev --audit-level=high`.
- **Encerramento.** `next start` encerrado por PID, `npx supabase stop` e a página temporária apagada.
- **Pré-visualização**, passo seu: `/login`, `/admin/settings` e o rodapé, como antes. O aviso e as etiquetas só aparecem na pré-visualização a partir da primeira tela (#57 a #65), porque nenhuma tela os usa nesta tarefa.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/lib/api-client.ts` | alterar |
| `src/lib/demo/routes.ts`, `match.ts`, `list.ts` | criar |
| `src/lib/demo/README.md` | criar |
| `src/lib/README.md` | alterar: a pasta `demo/` |
| `src/shared/errors/catalog.ts` | alterar: `NOT_IMPLEMENTED` |
| `src/components/shared/demo-notice.tsx`, `status-badge.tsx` | criar |
| `src/components/shared/README.md` | alterar: o aviso de demonstração |
| `tests/lib/api-client.test.ts` | alterar |
| `tests/lib/README.md` | alterar: a lista de demonstração simulada |
| `docs/padroes/componentes.md` | alterar (LT1 a LT4, L1, L3) |
| `docs/padroes/design.md` | alterar (L1) |
| `docs/padroes/frontend.md` | alterar (LT1) |
| `docs/padroes/api.md` | alterar (LT1) |
| `docs/padroes/testes.md` | alterar (LT1) |
| `docs/plataforma/estrutura-de-pastas.md` | alterar (LT1) |
| `workflows/procedimentos/pull-request.md` | alterar (LT4, L2) |
| `.github/pull_request_template.md` | alterar (L2) |
| `docs/decisoes/0055-telas-de-demonstracao.md` | criar, na etapa 03, com o número livre na hora |
| `docs/decisoes/CONTEXT.md` | alterar, na etapa 03 |
| `memoria/tarefas/56-base-da-demonstracao/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |

O README de `src/shared/errors/` já exige a linha em `api.md` no mesmo PR e não muda.

### Em comum com outras tarefas

- Nenhum PR aberto; a `main` está em dd70f96.
- **#57 a #65** (telas) dependem desta: acrescentam linhas em `src/lib/demo/routes.ts` (uma por rota, conflito simples), criam os módulos de dados e os tipos de `src/shared/api/`, e usam o `DemoNotice` e a `StatusBadge` (#58, #60 e #61).
- **#46** (consulta de agendamentos) usa a `StatusBadge` daqui.
- **PR 2 da #66**: acrescenta `INSUFFICIENT_DATA` e `AI_UNAVAILABLE` a `catalog.ts` (já estão em `api.md`), perto do `NOT_IMPLEMENTED`; conflito simples, e ele só vem depois da #51 e da #60.
- **#67** (documentos formais): recebe a lista do relatório desta tarefa.

## Testes previstos

Em `tests/lib/api-client.test.ts`, um bloco novo, `describe("apiRequest with demo data")`, com a lista de demonstração simulada por `vi.mock("@/lib/demo/routes")` e o relógio simulado (`vi.useFakeTimers`) só nesse bloco: sem espera real e sem rede (`testes.md`). A lista do teste tem:

- `GET /api/admin/services`: 25 serviços fictícios, com os nomes do `seed-demo.sql`, 20 por página, busca no nome e filtro `type`;
- `GET /api/admin/services/:id`: o serviço do `:id`;
- `POST /api/admin/appointments/preview`: uma prévia fixa (leitura que é `POST`);
- `POST /api/admin/services`: gravação, sem `load`.

Os caminhos não coincidem com os dos testes atuais (`/api/auth/*`, `/api/admin/clients`, `/api/admin/staff` e `/api/me/profile`), que continuam indo ao `fetch` simulado. Os valores esperados vêm de LT1 e LT3, de `api.md` e da própria lista do teste, escrita à mão:

- answers a listed read with the fixed data, without a network request: `GET /api/admin/services/<id do 7º>` → o 7º serviço; nenhuma chamada ao `fetch`
- waits 400 ms before answering a listed route: pendente aos 399 ms; resolvida aos 400 ms
- answers a listed POST that does not write with the fixed data: a prévia fixa, sem `fetch`
- loads only the data of the requested route: só o `load` da listagem é chamado
- pages the fixed list: `page=2&pageSize=20` → 5 itens (do 21º ao 25º), `page` 2, `pageSize` 20 e `total` 25 (critério da issue)
- caps the page size of the fixed list at 50: `pageSize=100` → `pageSize` 50 e os 25 itens (RNF008)
- searches the term in the fields of the screen, ignoring case: `search=LAVAGEM&page=1` → só os serviços com "Lavagem" no nome, `page` 1 e o `total` igual ao número deles na lista do teste (critério da issue)
- filters the fixed list by equality: `type=additional` → só os adicionais
- refuses a listed write with NOT_IMPLEMENTED, without a network request: `POST /api/admin/services` → `ApiError` com status 501, `NOT_IMPLEMENTED`, "Esta ação ainda não está disponível nesta versão de demonstração.", `fields` e `requestId` nulos; nenhuma chamada ao `fetch` (critério da issue)
- sends a route out of the list to the API: `GET /api/admin/settings/company` → uma chamada ao `fetch`, com a resposta dele (critério da issue)
- sends another method of a listed path to the API: `PATCH /api/admin/services/<id>` → uma chamada ao `fetch`
- rejects an aborted demo request as aborted: cancelada durante a espera → `AbortError`, e não `ApiError`; o `load` não é chamado

O `DemoNotice` e a `StatusBadge` são conferidos à mão, como os outros componentes (decisão 0052).

## Documentação

Os textos aprovados na proposta entram como estão, com o ajuste de L3 no texto de LT2:

- `docs/padroes/componentes.md`, nova seção "Telas de demonstração (decisão 0055)", depois de "Formulários":
  - "Enquanto a rota de uma tela não existe, `src/lib/demo/` responde no lugar dela. O `apiRequest` procura o método e o caminho na lista de demonstração antes de chamar a rede e, se os acha, devolve os dados fixos do módulo, tipados por `src/shared/api/`, depois de 400 ms, para os estados de carregamento aparecerem. Os dados de cada módulo só são carregados quando a tela os pede."
  - "As leituras, inclusive os `POST` que não gravam, como a prévia de valores e a análise do dashboard, devolvem os dados fixos; as gravações respondem `NOT_IMPLEMENTED`, que a tela mostra como qualquer falha."
  - "Os dados fixos usam os nomes, as placas e os serviços fictícios do `supabase/seed-demo.sql` (`guia/regras.md`, Dados)."
  - o texto de LT2, com a posição de L3 (texto proposto em L3);
  - "Na demonstração, a listagem pagina, busca e filtra sobre a lista fixa. O formulário tem os campos, as etapas, as máscaras e os diálogos, sem o esquema de validação, que entra com a rota; o envio mostra o aviso de `NOT_IMPLEMENTED`."
  - "A tarefa que constrói rotas tira as entradas delas da lista e o aviso da tela no mesmo PR; a que tirar a última remove `src/lib/demo/`, o código `NOT_IMPLEMENTED` e o `DemoNotice`."
- `docs/padroes/componentes.md`, nova seção "Etiqueta de status (RN017)": o texto de L1.
- `docs/padroes/design.md`, tabela Componentes, linha "Etiqueta": o texto de L1.
- `docs/padroes/frontend.md`:
  - Comunicação com a API, item novo: "Rota ainda não construída: os dados de demonstração de `src/lib/demo/` (`componentes.md`, decisão 0055).";
  - Estrutura, linha de `src/lib/`: "api-client.ts (cliente HTTP único), utils.ts (cn do shadcn)" passa a "api-client.ts (cliente HTTP único), utils.ts (cn do shadcn), demo/ (dados das telas de demonstração)".
- `docs/padroes/api.md`, Erros:
  - linha nova, depois de `INTERNAL_ERROR`: "| 501 | `NOT_IMPLEMENTED` | Esta ação ainda não está disponível nesta versão de demonstração. |";
  - depois do parágrafo dos 503: "Só o cliente da API produz o `NOT_IMPLEMENTED`, nas telas de demonstração; ele sai do catálogo com a última rota de demonstração."
- `docs/plataforma/estrutura-de-pastas.md`, linha de `lib/`: "api-client.ts · utils.ts (cn() do shadcn)" passa a "api-client.ts · utils.ts (cn() do shadcn) · demo/ (dados das telas de demonstração, decisão 0055)".
- `docs/padroes/testes.md`, tabela de casos, linha "Cliente da API": acrescentar "respostas das rotas de demonstração, sem chamada de rede, e a recusa das gravações".
- `workflows/procedimentos/pull-request.md` e `.github/pull_request_template.md`: o item de LT4, onde L2 decidir.
- README:
  - `src/lib/`: a primeira frase ganha "e `demo/`, os dados das telas de demonstração, que o `apiRequest` responde no lugar das rotas ainda não construídas (decisão 0055)"; "Vai aqui" passa a "`api-client.ts`, `utils.ts` e `demo/`";
  - `src/lib/demo/`, novo: a função da pasta; vai aqui `routes.ts`, `match.ts`, `list.ts` e um `<módulo>.ts` de dados por módulo do backend (`clients.ts`, `appointments.ts`), só com os dados fictícios do `seed-demo.sql`; não vai aqui dado real ou pessoal, esquema de validação, tipo de resposta (→ `src/shared/api/`) nem componente; como acrescentar uma rota (o método e o caminho de `rotas.md`, `load` só na leitura, e o filtro que não é igualdade e a ordenação na resposta do módulo); como tirá-la (LT4); referências `componentes.md` e a decisão 0055;
  - `src/components/shared/`: depois de "estado vazio", acrescentar "aviso de demonstração";
  - `tests/lib/`: acrescentar "e as respostas da lista de demonstração, com a lista simulada por `vi.mock` e o relógio simulado".
- `docs/decisoes/0055-telas-de-demonstracao.md` e a linha em `docs/decisoes/CONTEXT.md`, na etapa 03 (seção "Decisões técnicas").
- Documentos formais a atualizar no relatório, pela #67: Documentação de Arquitetura de Software, seção 3.4 (Comunicação com a API), seção 6.4, Quadro 33 (`NOT_IMPLEMENTED`) e seção 9, Quadro 38 (decisão 0055), como lista a proposta.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Aparência da etiqueta de status

**Problema.** A issue pede a etiqueta "com o nome do status escrito e a cor de `design.md`", mas `design.md` não define cor por status: a tabela de componentes só diz "Etiqueta: `rounded-lg`, 12 px, peso 600; o significado sempre escrito, nunca só pela cor". Sem uma definição, cada tela que mostra status (#58, #60 e #61) escolheria a sua. Conferido pela fórmula da WCAG: o texto em `--link` sobre o próprio `--link` a 10% dá 4,2:1 no tema claro, abaixo de 4,5:1, então o fundo tingido de laranja não serve. `design.md` tem 7,8 mil caracteres, no limite de cerca de 2 mil tokens de `docs/CONTEXT.md`, por isso a tabela vai para `componentes.md`.

**Opções:**

- [X] **1. Quatro tons por fase, só com as cores do tema (recomendada).** Os quatro status em aberto (Agendado, Em espera, Em execução e Finalizado) ficam em relevo, com o texto em `--link`; o Concluído, rebaixado, com o texto em `--foreground`; o Cancelado, com o fundo e o texto em `--destructive`, como a variante `destructive` do `Badge`; o Reagendado, só com a borda, com o texto em `--muted-foreground`. Na lista, a cor e o relevo separam o que está em aberto do que terminou, e o nome diz o status exato. Nenhuma cor nova, e todos os textos passam de 4,5:1.
- [ ] **2. Uma cor por status.** Sete pares de cores novas no tema (claro e escuro), como azul, violeta, âmbar e verde. Mais fácil de distinguir numa lista longa, mas são 14 cores contra "poucas cores fortes" (`design.md`), cada uma com o contraste calculado e escurecida até 4,5:1 sobre o fundo tingido.
- [ ] **3. Um tom só.** Todas em relevo, com o texto em `--foreground`. Nada a escolher, mas a etiqueta não ajuda a varrer a lista: só o nome distingue os status.

**Texto proposto (opção 1):**

- `docs/padroes/componentes.md`, nova seção "Etiqueta de status (RN017)", depois de "Telas de demonstração":
  - "O status do agendamento aparece na etiqueta `StatusBadge`, de `src/components/shared/`, sempre com o nome de RN017 escrito. O tom indica a fase, só com as cores do tema; o contraste do texto é calculado pela fórmula da WCAG sobre `--background`, a cor das superfícies."
  - a tabela:

    | Status | Etiqueta | Texto (claro / escuro) |
    |---|---|---|
    | Agendado, Em espera, Em execução e Finalizado | em relevo (`shadow-neu-sm`), texto em `--link` | 4,8 / 6,5 |
    | Concluído | rebaixada (`inset-shadow-neu-sm`), texto em `--foreground` | 12,5 / 11,8 |
    | Cancelado | fundo `--destructive` a 10%, texto em `--destructive` | 5,0 / 5,5 |
    | Reagendado | sem fundo, borda de 1 px em `--input`, texto em `--muted-foreground` | 4,9 / 4,9 |

- `docs/padroes/design.md`, tabela Componentes, linha "Etiqueta": "`rounded-lg`, 12 px, peso 600; o significado sempre escrito, nunca só pela cor" passa a "`rounded-lg`, 12 px, peso 600; o significado sempre escrito, nunca só pela cor; a de status do agendamento tem um tom por fase ([componentes.md](componentes.md), Etiqueta de status)".

### L2. Onde fica o item do checklist de LT4

**Problema.** A proposta aprovada põe o item "A rota nova saiu da lista de `src/lib/demo/`, e a tela ligada a ela não mostra mais o aviso de demonstração." no "checklist" de `workflows/procedimentos/pull-request.md`. O único checklist ali é o de segurança (OWASP Top 10), espelhado no modelo `.github/pull_request_template.md`. O item não é de segurança, e quem abre o PR marca as caixas do modelo, não as do procedimento.

**Opções:**

- [X] **1. Seção própria no procedimento e caixa em "Critérios de pronto" do modelo (recomendada).** O checklist de segurança continua só com o OWASP; o autor vê o item no PR, e o procedimento diz quando ele vale. A tarefa que remover `src/lib/demo/` (LT4) tira os dois.
- [ ] **2. No checklist de segurança, como diz a proposta.** Um lugar só, mas fora do assunto da lista, e o modelo de PR não o mostra se só o procedimento mudar.
- [ ] **3. Só no procedimento, numa seção própria.** O modelo não muda, e o item depende de quem revisa se lembrar dele.

**Texto proposto (opção 1):**

- `workflows/procedimentos/pull-request.md`, nova seção depois de "Checklist de segurança":
  - título "Telas de demonstração (decisão 0055)";
  - "Enquanto `src/lib/demo/` existir, o PR que constrói uma rota confere:";
  - "- [ ] A rota nova saiu da lista de `src/lib/demo/`, e a tela ligada a ela não mostra mais o aviso de demonstração."
- `.github/pull_request_template.md`, "Critérios de pronto", último item: "- [ ] Rota nova: saiu da lista de `src/lib/demo/`, e a tela ligada a ela não mostra mais o aviso de demonstração (decisão 0055)."

### L3. Posição do aviso de demonstração

**Problema.** LT2 diz "no topo da tela, aba ou seção", sem dizer se o aviso fica acima ou abaixo do título. As nove telas (#57 a #65) vão pô-lo em paralelo, e cada uma poderia escolher um lado.

**Opções:**

- [X] **1. Logo abaixo do título (recomendada).** Na página, entre o título (`h1`) e o conteúdo; na aba, no topo do painel da aba; na seção, logo abaixo do título da seção. O título continua o primeiro item lido, inclusive pelo leitor de tela, e o aviso, o primeiro conteúdo, antes de qualquer dado ou formulário.
- [ ] **2. Acima do título, no topo da área principal.** Mais visível, mas o leitor de tela encontra o aviso antes do `h1`, e o título da página fica fora do lugar das outras páginas.

**Texto proposto (opção 1):** `docs/padroes/componentes.md`, seção "Telas de demonstração", o texto de LT2 passa a "Toda tela, aba ou seção com dados de demonstração mostra o aviso 'Dados de demonstração: esta parte ainda não está ligada ao sistema, e nada do que você fizer nela é gravado.', com o ícone `FlaskConical`, sem botão de fechar (`DemoNotice`, em `src/components/shared/`). Ele fica logo abaixo do título da página, ou no topo do painel da aba, ou logo abaixo do título da seção, antes de qualquer dado ou formulário."

## Decisões técnicas

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| 0055: as telas são construídas antes das rotas, na forma final, com dados de demonstração respondidos pelo cliente da API (`src/lib/demo/`), um aviso na tela e as gravações recusadas com `NOT_IMPLEMENTED` | rotas com dados fixos no servidor; dados no componente; telas vazias (LT1); Mock Service Worker (dependência nova e um service worker em `public/`) | O professor vê todas as telas cedo; a tarefa de lógica não reescreve a tela; a onda de telas não toca backend, banco nem OpenAPI. Aceito: código temporário no cliente da API, testado e removido rota a rota | nova |

Aprovada na proposta; gravada na etapa 03, com o número livre na hora (`workflows/procedimentos/decisao.md`). Hoje, o 0055 está livre: a última é a 0054.

- Seguidas:
  - 0008: a paginação da demonstração pelo `paginationSchema` de `src/shared/validation`, o mesmo das rotas;
  - 0017: código em inglês, textos em português;
  - 0025: o `NOT_IMPLEMENTED` no catálogo e no `ApiError`, como os outros códigos;
  - 0035 e 0052: testes antes do código no cliente da API; os componentes, à mão;
  - 0036: pasta nova com README e a árvore de `estrutura-de-pastas.md` no mesmo PR;
  - 0049: `Alert` e `Badge` do shadcn/ui sobre Base UI;
  - 0051: as páginas continuam protegidas pelo `proxy.ts`.

Escolhas locais, sem registro:

- A entrada da lista pelo método e o caminho juntos, e a gravação como a entrada sem `load`.
- A espera de 400 ms também na recusa; o cancelamento durante a espera como o do `fetch`.
- A resposta de leitura como função de `{ params, query }`, sem o corpo enviado, porque a proposta pede dados fixos.
- `vi.mock` da lista e o relógio simulado só no bloco da demonstração: o primeiro uso no projeto, sem dependência nova.
- `role="note"` no aviso.
- O tipo `HttpMethod` exportado pelo `api-client.ts`, para a lista.

## Riscos e dúvidas

- **Lista vazia até a primeira tela.** Nesta tarefa, o mecanismo só é conferido pelos testes, com a lista simulada; o primeiro uso real vem na #57 a #65. A forma da entrada e da resposta pode precisar de ajuste na primeira tela, por exemplo se uma prévia precisar do corpo enviado.
- **Demonstração na produção.** Até as tarefas de lógica, a produção da Vercel mostra os dados fixos, com o aviso (LT4). Os dados são fictícios e ficam no código do navegador; nenhuma rota real muda, e a decisão de acesso das rotas reais continua no servidor (RS008).
- **Arquivo comum.** `src/lib/demo/routes.ts` recebe linhas das nove telas em paralelo; conflito simples, uma linha por rota.
- **`vi.mock` no arquivo inteiro.** O `vi.mock` vale para todos os testes de `api-client.test.ts`: os caminhos da lista do teste não podem coincidir com os dos testes atuais, conferido na seção "Testes previstos".
- **Tamanho do PR.** Estimativa de 220 linhas em `src/` (lista, busca e página 110, `apiRequest` 30, etiqueta 40, aviso 25, catálogo 5), mais cerca de 250 de testes e 120 de documentação, dentro das ~400 de `workflows/procedimentos/pull-request.md`: um PR só, com commits separados.
- **Pontos para a sua aprovação**, como nas tarefas anteriores: a página temporária `src/app/demo-check/page.tsx`, sem commit; as chaves do banco local no `next start`; a conta de admin no banco local; o cookie de teste no Lighthouse.

## Fora do escopo

- As telas (#57 a #65), os módulos de dados de `src/lib/demo/` e os tipos de `src/shared/api/` de cada uma.
- Rotas, especificação OpenAPI, migrations e esquemas de validação.
- A remoção da demonstração, rota a rota, nas tarefas de lógica (LT4).
- Mudança no `seed-demo.sql`.
- Testes automatizados de componentes (decisão 0052).
- Os documentos formais (#67).

## Estado da construção

Feito dentro do plano aprovado, na ramificação `feat/56-demo-data` (commits 49251e8 a 9f6a4a6): testes em vermelho, cliente da API com a lista de demonstração e o `NOT_IMPLEMENTED`, `DemoNotice` e `StatusBadge`, documentação de LT1 a LT4 e de L1 a L3, e os README. Nenhum arquivo fora da lista do plano; a página temporária não entrou em commit. `npm run check` aprovado, com 383 testes; verificação local aprovada, com o resultado em `notas.md`. Na etapa 03, a decisão 0055 (a17b24d), o `02_relatorio.md` e o PR #69. Falta a etapa 04, depois da incorporação.
