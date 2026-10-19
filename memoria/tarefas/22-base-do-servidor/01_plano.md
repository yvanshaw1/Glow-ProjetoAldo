---
issue: 22
titulo: "Base do servidor: clientes do Supabase, tratamento único das requisições e registro"
areas: [backend, testes]
tipo: funcionalidade
requisitos: [RS007, RS014, RS016, RS017, RS018, RNF008]
status: concluido
aprovado_por: yvan
aprovado_em: 08:58 - 19/10/2026
---

# Plano: Base do servidor: clientes do Supabase, tratamento único das requisições e registro

## Objetivo

Criar em `src/server` o que toda rota da API vai usar:

- os clientes do Supabase: com a chave de serviço, para dados e contas, e com `@supabase/ssr`, para a sessão em cookies `HttpOnly`, `Secure` e `SameSite=Lax` (RS007, RS016, decisões 0004, 0006 e 0042);
- o tratamento único, que gera o `requestId`, barra a gravação de outra origem, fora de JSON ou acima de 100 KB (RS014) e converte todo erro em Problem Details (RS017, decisão 0025);
- o registro em JSON com níveis, sem nada sensível (RS018, decisão 0029), e as respostas padronizadas de sucesso e de paginação (RNF008);
- os cabeçalhos de segurança de `seguranca.md` (Complementos) em `next.config.ts`.

Nenhuma rota de negócio é criada. A primeira rota que usa esta base vem na #23. A tarefa instala `@supabase/ssr`, dependência prevista na issue.

## Como fica `src/server`

| Arquivo | Conteúdo |
|---|---|
| `supabase/clients.ts` | `getServiceClient()`: cliente com `SUPABASE_SERVICE_ROLE_KEY`, criado na primeira chamada e reaproveitado, sem sessão guardada nem renovação automática. `createSessionClient()`: cliente do `@supabase/ssr` com `SUPABASE_ANON_KEY`, um por requisição, com os cookies de `next/headers` e os atributos `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`. Ele só fala com o Supabase Auth, porque a chave pública não tem privilégio nas tabelas (decisão 0042). As variáveis são lidas dentro das funções, na requisição; a que faltar vira erro com o nome dela, nunca com o valor. |
| `http/logger.ts` | contexto da requisição em `AsyncLocalStorage` (o `requestId`) e `logger.debug`, `info`, `warn` e `error(event, campos)`: uma linha JSON na saída padrão com `time`, `level`, `requestId`, `event` e os campos informados. `debug` só sai com `NODE_ENV` igual a `development`. |
| `http/handler.ts` | `handleRoute(route)`: envolve a função da rota, na sequência abaixo |
| `http/respond.ts` | `respondOk(data)` (200), `respondCreated(data)` (201), `respondNoContent()` (204) e `respondPage(data, pagination, total)`, que monta o `Page<T>` de `src/shared/api` |

Sequência do `handleRoute`:

1. Gera o `requestId` e abre o contexto do registro.
2. Nas gravações (`POST`, `PUT`, `PATCH` e `DELETE`), nesta ordem: confere o `Origin` (L3), senão 403 (L2); lê o corpo até 100 KB, senão 413; havendo corpo, exige `application/json`, senão 415, e um JSON válido, senão 400 (L4).
3. Chama a rota com a requisição, os parâmetros do caminho já resolvidos e o corpo convertido (`unknown`). A rota valida o corpo e a query string com os esquemas de `src/shared/validation`.
4. Converte o erro: `AppError` vira Problem Details com o status e a mensagem do catálogo, `fields` e `Retry-After`; `ZodError` vira 400 `VALIDATION_ERROR` com a mensagem de cada campo (L4); qualquer outro vira 500 `INTERNAL_ERROR`, sem detalhe interno.
5. Grava a linha da requisição (L5).

Uso numa rota (exemplo ilustrativo; as rotas reais vêm da #23 em diante):

```ts
export const POST = handleRoute(async ({ body }) => {
  const input = registerSchema.parse(body); // ZodError → 400 VALIDATION_ERROR
  const client = await registerClient(input); // AppError → status do catálogo
  return respondCreated(client);
});
```

O handler usa só `Request` e `Response` padrão, sem nada de `next/*`. Isso permite testá-lo sem servidor (L1).

## Ordem da construção

1. Criar a ramificação `feat/22-server-base` a partir da `origin/main` e desfazer o vínculo com a `main`, como na #21. Trazer a ramificação `docs/kayke-collaborator` (commit 97f6d99, tarefa trivial aprovada na conversa em 19/10/2026, que ficou para o próximo PR) com `git merge` (decisão 0033).
2. Instalar `@supabase/ssr` 0.12.7 com versão exata, como as outras dependências de execução: `npx -y npm@11.21.1 install --save-exact @supabase/ssr@0.12.7`. O npm 11.6.2 desta máquina poda as entradas `@emnapi/*` do `package-lock.json`, e o `npm ci` do CI falharia. Conferir que elas continuam no arquivo.
3. Escrever os testes de `tests/http/` (L1) e conferir que falham (vermelho). Eles vão num commit próprio, antes do código, para o revisor conferir os testes primeiro.
4. Escrever `logger.ts`, `handler.ts` e `respond.ts` até os testes passarem (verde) e depois melhorar o código com os testes passando.
5. Escrever `supabase/clients.ts`.
6. Acrescentar os cabeçalhos de segurança ao `next.config.ts` (L6).
7. Documentação das lacunas decididas, a decisão 0045 (L1) e o uso do `handleRoute` em `backend.md`.
8. Verificação: `npm run check`, a rota temporária, o contêiner e a pré-visualização (seção seguinte).

## Critérios de aceitação e verificação

A "rota" dos testes é uma função montada no próprio teste e envolvida pelo `handleRoute`, sem arquivo em `src/app/api`. Nos critérios de recusa, ela é uma função espiã que não pode ser chamada.

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um serviço que lança `AppError('NOT_FOUND')`, quando a rota responde, então vem 404 com `Content-Type: application/problem+json`, `code`, o `detail` do catálogo, `instance` e `requestId` (RS017) | `handler.test.ts`, "Erros" |
| Dado um corpo que falha no esquema, quando a rota valida, então vem 400 `VALIDATION_ERROR` com a mensagem de cada campo em `fields` | `handler.test.ts`, "Erros" |
| Dado um erro inesperado, do banco ou do código, quando a rota responde, então vem 500 `INTERNAL_ERROR` sem detalhe interno, e a linha `error` do registro traz o rastro e o mesmo `requestId` (RS017) | `handler.test.ts`, "Erros" e "Registro" |
| Dado um `POST` com `text/plain`, com corpo acima de 100 KB ou com `Origin` de outro site, quando chega à rota, então é recusado (415, 413 ou 403) sem chegar ao serviço (RS014) | `handler.test.ts`, "Proteções de entrada". Passo manual: os três casos com `curl` na rota temporária, no `npm run dev` |
| Dado uma requisição a uma rota de autenticação, quando é registrada, então nenhuma linha traz senha, token, cookie, cabeçalho de autorização ou o corpo (RS018) | `handler.test.ts`, "Registro" |
| Dado qualquer resposta, quando confiro os cabeçalhos, então vêm `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` e `Content-Security-Policy` | passo manual: `curl -sI` em `/` e num caminho inexistente de `/api` no contêiner, com os valores de L6; na pré-visualização, pela aba Rede do navegador, porque a Vercel pode pedir login nas pré-visualizações |
| Dado `docker compose up --build`, quando a imagem é construída sem as variáveis, então o build conclui (`infraestrutura.md`) | passo manual: o worktree não tem `.env.local`, então, como na #21, `docker build` e `docker run` sem variáveis numa porta livre; o build conclui e a página inicial responde 200. Depois, o contêiner e a imagem são removidos |

Verificações complementares:

- **Rota temporária.** Na etapa 02, uma rota em `src/app/api/dev-check/route.ts`, só no worktree e nunca no commit, confere que o `next typegen` e o `tsc` aceitam a função devolvida pelo `handleRoute` e que, no `npm run dev`, os cabeçalhos `Host` e `X-Forwarded-Host` chegam como os testes supõem (L3). Ela é apagada antes do commit, conferido no `git status`.
- **`npm run check`** sem erros nem avisos, local e no CI.

## Arquivos

| Arquivo | Ação |
|---|---|
| `package.json`, `package-lock.json` | alterar: `@supabase/ssr` 0.12.7 |
| `src/server/supabase/clients.ts` | criar |
| `src/server/http/logger.ts` | criar |
| `src/server/http/handler.ts` | criar |
| `src/server/http/respond.ts` | criar |
| `next.config.ts` | alterar: `headers()` com os cabeçalhos de segurança (L6) |
| `tests/http/handler.test.ts` | criar (L1) |
| `tests/http/logger.test.ts` | criar (L1) |
| `tests/http/respond.test.ts` | criar (L1) |
| `tests/http/README.md` | criar (L1) |
| `tests/README.md` | alterar (L1) |
| `docs/padroes/testes.md` | alterar (L1) |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: `tests/http/` na árvore (L1) |
| `docs/decisoes/0045-testes-do-tratamento-unico.md` | criar (L1) |
| `docs/decisoes/0024-testes-das-regras-de-negocio.md` | alterar só a linha `status:` (L1) |
| `docs/decisoes/CONTEXT.md` | alterar: linha da 0045 e "(substituída por 0045)" na 0024 (L1) |
| `docs/padroes/api.md` | alterar: Validação e Erros (L2, L3 e L4) |
| `docs/padroes/backend.md` | alterar: Registro (L5), cabeçalhos de segurança (L6) e como a rota usa o `handleRoute` e o `respond.ts` |
| `docs/plataforma/seguranca.md` | alterar: Complementos (L6) |
| `docs/plataforma/infraestrutura.md` | alterar: sai a linha `APP_URL` (L3) |
| `setup/questionario.md` | alterar: linha do Kayke, pelo merge de `docs/kayke-collaborator` (commit 97f6d99) |
| `memoria/tarefas/22-base-do-servidor/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |
| `.env.example` | pelo desenvolvedor, não pelo agente: sai `APP_URL=` (L3) |

Os README de `src/server/`, `src/server/http/` e `src/server/supabase/` já descrevem estes arquivos e não mudam.

### Em comum com outras tarefas em andamento

- Nenhum PR aberto. O PR #20 e o #27 já foram incorporados.
- #23 a #26: ainda não começaram. A #23 depende desta: usa o `handleRoute`, o `respond.ts`, os dois clientes e o contexto do registro.

## Testes previstos

Valores esperados tirados de `api.md` (tabela de erros e paginação), de `backend.md` (Registro), de `mensagens-de-validacao.md` e da opção recomendada de cada lacuna.

`tests/http/handler.test.ts`, "Erros" (RS017)

- responds 404 Problem Details when the route throws AppError NOT_FOUND: `application/problem+json`, `type` "about:blank", `title` "Not Found", `detail` "Não encontramos o que você procura.", `instance` igual ao caminho, `code` e `requestId`
- sends Retry-After when the AppError has retryAfterSeconds: `ACCOUNT_LOCKED` com 900 segundos → 429 e `Retry-After: 900`
- responds 400 VALIDATION_ERROR with the message of each field when the body fails the schema: `{ email: "maria@email", name: "M" }` → as mensagens de e-mail e de nome de `mensagens-de-validacao.md`
- names a nested field by its dotted path: `{ vehicle: { plate: "AB12345" } }` → `fields["vehicle.plate"]` "Informe uma placa válida." (L4)
- responds 400 VALIDATION_ERROR when a query parameter fails the schema: `page=0` → `fields.page`
- responds 500 INTERNAL_ERROR with the catalog message and no internal detail: um `Error` com nome de tabela na mensagem não aparece no corpo
- responds 500 when the route throws a value that is not an Error, como o objeto de erro do `supabase-js`

`tests/http/handler.test.ts`, "Proteções de entrada" (RS014)

- refuses a POST with text/plain with 415 without calling the route
- refuses a body above 100 KB with 413 without calling the route: 102.401 bytes, com e sem `Content-Length` (L4)
- accepts a body of exactly 100 KB: 102.400 bytes (L4)
- refuses a POST from another site's Origin with 403 FORBIDDEN without calling the route (L2, L3)
- refuses a write without Origin or with Origin "null" (L3)
- accepts a write whose Origin has the host of the request, by Host and by X-Forwarded-Host (L3)
- applies the same checks to PUT, PATCH and DELETE
- does not check Origin or the format on GET
- accepts a write without body and without Content-Type (L4)
- accepts application/json with a charset parameter
- responds 400 VALIDATION_ERROR without fields for a body that is not valid JSON (L4)
- gives the route the parsed body and the resolved path params

`tests/http/handler.test.ts`, "Registro" (RS017, RS018)

- logs one info line per request with requestId, method, path without query string, status and duration (L5)
- logs one error line with the stack and the same requestId of the 500 response
- logs a warn line for ACCOUNT_LOCKED, VERSION_CONFLICT and a refused origin (L5)
- keeps the requestId of the response in the lines written by the route
- gives each request its own requestId, with 8 hexadecimal characters, também em duas requisições simultâneas
- never logs the password, token, cookie, authorization header or body of an auth route: `POST /api/auth/login` com senha no corpo, `Cookie` e `Authorization`, inclusive quando a rota falha com 500 e quando o corpo é JSON inválido

`tests/http/logger.test.ts`

- writes one JSON line with time, level, requestId and the given fields
- writes a null requestId outside a request
- writes debug lines only in development

`tests/http/respond.test.ts`

- responds 200 with the data as JSON
- responds 201 with the created record
- responds 204 without body
- responds a page with data, page, pageSize and total (RNF008)

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Como verificar o tratamento único sem nenhuma rota

**Problema.** Os critérios de aceitação falam em "quando a rota responde", mas a issue não cria rota: a primeira vem na #23. A decisão 0024 limita os testes automatizados às regras de negócio, e `testes.md` e `tests/README.md` os estendem só aos esquemas. A decisão 0043 descartou testes em pgTAP justamente por contrariarem a 0024, então a equipe lê a 0024 ao pé da letra. Sem decisão nova, os critérios só podem ser conferidos à mão, e uma regressão no tratamento único, que todas as rotas usam, só apareceria nas tarefas seguintes.

**Opções:**

- [X] **1. Testes automatizados do tratamento único em `tests/http/`, com uma decisão nova que substitui a 0024 (recomendada).** O handler recebe e devolve `Request` e `Response` padrão, então o teste monta a requisição e uma rota falsa, sem servidor, banco ou rede, e roda em milissegundos, como os das regras. Cinco dos sete critérios viram teste; cabeçalhos e contêiner continuam manuais, e os fluxos de tela também.
- [ ] **2. Verificação manual, com uma rota temporária que não vai para o repositório.** Mantém a 0024. A rota é chamada com `curl` em cada critério, e o resultado vai ao relatório. O revisor não consegue repetir a conferência, e nada barra uma regressão futura.
- [ ] **3. Adiar a verificação para a #23, com as primeiras rotas reais.** A #22 seria incorporada sem os critérios conferidos, contra os critérios de pronto de `testes.md`.

**Texto proposto (opção 1):**

- `docs/decisoes/0045-testes-do-tratamento-unico.md`, novo, do molde: `titulo` "Testes automatizados das regras, dos esquemas e do tratamento único das requisições", `substitui: 0024`, `relacionados: [RS014, RS017, RS018, 0024, 0035]`, `origem` "issue #22, memoria/tarefas/22-base-do-servidor/01_plano.md (L1)".
  - Decisão: "O Vitest testa as funções puras das regras de negócio, os esquemas de `src/shared/validation` e o tratamento único das requisições (`src/server/http`), este com `Request` e `Response` padrão, sem servidor, banco ou rede. Os fluxos de tela continuam testados à mão na pré-visualização."
  - Alternativa descartada: "Testes só das regras e dos esquemas, com o tratamento único conferido à mão; testes de interface de ponta a ponta; testes com o banco."
  - Justificativa: "O tratamento único é usado por todas as rotas e concentra RS014, RS017 e RS018: uma regressão nele aparece em todas as rotas ao mesmo tempo, e conferir à mão a cada mudança a recusa por formato, tamanho e origem e o registro sem dados sensíveis não é viável. Como não depende de servidor, banco ou rede, os testes são rápidos e independentes como os das regras. Os testes de ponta a ponta continuam fora pelo motivo da 0024: os fluxos de tela são verificados à mão."
- `docs/decisoes/0024-testes-das-regras-de-negocio.md`: só a linha `status:` passa a `substituída por 0045`.
- `docs/decisoes/CONTEXT.md`: nova linha "| [0045](0045-testes-do-tratamento-unico.md) | Testes automatizados das regras, dos esquemas e do tratamento único das requisições |", e o título da 0024 ganha "(substituída por 0045)".
- `docs/padroes/testes.md`, "O que é testado automaticamente": "O Vitest testa as funções puras das regras de negócio (`docs/agendamento/calculos.md`) e os esquemas de `src/shared/validation`. Fluxos de tela são testados à mão na pré-visualização (decisão 0024). Os testes espelham o código: `tests/rules/<arquivo>.test.ts` para `src/server/rules/` e `tests/validation/<módulo>.test.ts` para `src/shared/validation/`." passa a "O Vitest testa as funções puras das regras de negócio (`docs/agendamento/calculos.md`), os esquemas de `src/shared/validation` e o tratamento único das requisições (`src/server/http`), este com `Request` e `Response` padrão, sem servidor. Fluxos de tela são testados à mão na pré-visualização (decisão 0045). Os testes espelham o código: `tests/rules/<arquivo>.test.ts` para `src/server/rules/`, `tests/validation/<módulo>.test.ts` para `src/shared/validation/` e `tests/http/<arquivo>.test.ts` para `src/server/http/`."
- Mesmo arquivo, tabela de casos: nova linha "| Tratamento único | Problem Details de `AppError`, de erro de validação e de erro inesperado; recusa por formato, tamanho e origem sem chegar à rota; registro sem senha, token, cookie, cabeçalho de autorização nem corpo (RS014, RS017, RS018) |".
- `tests/README.md`: "`rules/` testa `src/server/rules/` e `validation/` testa `src/shared/validation/`" passa a "`rules/` testa `src/server/rules/`, `validation/` testa `src/shared/validation/` e `http/` testa `src/server/http/`"; "arquivos `<nome>.test.ts` em `rules/` e `validation/`" passa a "arquivos `<nome>.test.ts` em `rules/`, `validation/` e `http/`"; "(decisão 0024)" passa a "(decisão 0045)".
- `tests/http/README.md`, novo: "Testes do tratamento único (`src/server/http/`): Problem Details, recusa por formato, tamanho e origem, e registro sem dados sensíveis. Montam a requisição e a rota no próprio teste, sem servidor, banco ou rede." Vai aqui: um arquivo de teste para cada arquivo de `src/server/http/`. Não vai aqui: rotas de `src/app/api`, que dependem do banco e da sessão. Referências: `docs/padroes/api.md`, `docs/padroes/backend.md` e `docs/padroes/testes.md`.
- `docs/plataforma/estrutura-de-pastas.md`, árvore, em `tests/`: nova linha "├── http/ espelha src/server/http", antes de `rules/`.

### L2. Código da recusa pelo cabeçalho `Origin`

**Problema.** A issue manda responder 403 à gravação com `Origin` de outro site, e `backend.md` prevê a linha `warn` "origem recusada". A tabela de erros de `api.md` não diz qual `code` acompanha esse 403. Os 403 do catálogo são `FORBIDDEN`, para falta de permissão, e dois de conta, `ACCOUNT_INACTIVE` e `PASSWORD_CHANGE_REQUIRED`.

**Opções:**

- [X] **1. `FORBIDDEN`, com a mensagem do catálogo (recomendada).** Sem código novo. Quem usa o sistema nunca vê essa resposta, porque a página sempre manda a própria origem: ela só aparece para um site de terceiros ou para uma chamada forjada, e a linha `warn` do registro diz que o motivo foi a origem.
- [ ] **2. Código novo, `INVALID_ORIGIN` (403), com mensagem própria.** Exige uma linha nova na tabela de `api.md` e no catálogo, e um texto de interface para um caso que nenhum usuário legítimo deve ver. A mensagem também teria de ser definida.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Validação, item da proteção contra CSRF: acrescentar ao fim "A origem recusada responde 403 `FORBIDDEN` e gera uma linha `warn` no registro."

### L3. Quais origens são aceitas

**Problema.** `api.md` e `infraestrutura.md` mandam conferir o `Origin` contra `APP_URL`, "endereço de produção", ou contra `VERCEL_URL` na pré-visualização. Três casos ficam de fora:

- `VERCEL_URL` é o endereço único de cada implantação (`glow-projetoaldo-hfxg0qilr-yvanshaw1s-projects.vercel.app`). O comentário da Vercel no PR #27 leva ao endereço da ramificação (`glow-projetoaldo-git-feat-21-shared-736e68-yvanshaw1s-projects.vercel.app`), que é outra variável, `VERCEL_BRANCH_URL`. Quem testasse a pré-visualização pelo link do PR teria toda gravação recusada.
- No `npm run dev` e no contêiner, a origem é `http://localhost:3000`. Com `APP_URL` igual ao endereço de produção, toda gravação local seria recusada.
- Não está dito o que fazer com a gravação sem `Origin` ou com `Origin: null`.

**Opções:**

- [X] **1. O `Origin` precisa ter o mesmo host da requisição; sem ele, recusa (recomendada).** O host da requisição vem do `X-Forwarded-Host`, que a Vercel preenche, ou do `Host`. É como o Next.js 16 confere a origem das Server Actions (`next/dist/server/app-render/action-handler.js`). Funciona no localhost, no contêiner, em qualquer endereço da pré-visualização e na produção, sem configuração. Um site de terceiros não consegue mudar o `Host` nem o `Origin` que o navegador envia. Os navegadores atuais mandam `Origin` em todo `POST`, `PUT`, `PATCH` e `DELETE`, então a exigência só recusa chamadas de fora do navegador sem o cabeçalho, como um `curl` que não o informe. `APP_URL` perde o único uso e sai da documentação. O desenvolvedor tira a linha do `.env.example`, já que o agente não edita `.env*`, e, se quiser, também do `.env.local` e da Vercel.
- [ ] **2. Lista de origens: `APP_URL`, `VERCEL_URL` e `VERCEL_BRANCH_URL`; sem `Origin`, recusa.** `APP_URL` passa a ser o endereço da aplicação em cada ambiente: `http://localhost:3000` no `.env.local` e o de produção na Vercel. Cada integrante precisa ajustar o próprio `.env.local`, e um valor errado recusa toda gravação local com 403.
- [ ] **3. Como está: `APP_URL` ou `VERCEL_URL`.** A pré-visualização aberta pelo link do PR e o localhost recusam toda gravação.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Validação, item da proteção contra CSRF: "conferência do cabeçalho `Origin` contra `APP_URL` (ou `VERCEL_URL` na pré-visualização) (RS014)." passa a "conferência do cabeçalho `Origin` em toda gravação (`POST`, `PUT`, `PATCH` e `DELETE`): o host do `Origin` precisa ser o da própria requisição (`X-Forwarded-Host`, na Vercel, ou `Host`), como o Next.js confere nas Server Actions, e a gravação sem `Origin` é recusada (RS014)."
- `docs/plataforma/infraestrutura.md`, Variáveis de ambiente: sai a linha `APP_URL`.
- `.env.example`, pelo desenvolvedor: sai `APP_URL=`.
- O relatório lista, em "Documentos formais a atualizar", a variável `APP_URL` na Arquitetura de Software (seção 8).

### L4. Gravação sem corpo, JSON inválido e campos aninhados no 400

**Problema.** `api.md` diz "Gravação só com `application/json` (exceto envio de imagem); outro formato → 415" e "Corpo JSON até 100 KB". Falta dizer:

- o que acontece com a gravação sem corpo: `DELETE` e ações como o `POST /api/auth/logout` podem não ter corpo nem `Content-Type`;
- se 100 KB são 100.000 ou 102.400 bytes;
- que resposta recebe o corpo que não é JSON válido;
- como `fields` nomeia um campo dentro de um objeto ou de uma lista, já que o exemplo só tem `plate`.

**Opções:**

- [X] **1. O formato só é exigido quando há corpo (recomendada).** A gravação sem corpo segue para a rota sem conferir o `Content-Type`, mas passa pela conferência do `Origin` (L3), que é o que barra a requisição forjada por outro site. O `api-client` da #25 não precisa mandar `Content-Type` numa ação sem dados.
- [ ] **2. `POST`, `PUT` e `PATCH` sempre com `application/json`, mesmo sem corpo; `DELETE` dispensado.** A regra é mais simples de conferir, mas toda ação sem dados precisa do cabeçalho, inclusive o logout.

Nas duas opções:

- 100 KB são 102.400 bytes, conferidos pelo `Content-Length` e também durante a leitura, porque o cabeçalho pode faltar.
- O corpo que não é JSON válido responde 400 `VALIDATION_ERROR` sem `fields`. A mensagem do erro de leitura não vai ao registro, porque traz um trecho do corpo, que pode ter uma senha (RS018).
- Em `fields`, cada campo aparece uma vez, com a primeira mensagem, e o campo aninhado usa o caminho com pontos (`vehicle.plate`, `services.0.serviceId`). Um erro do corpo inteiro, como um corpo que não é objeto, também responde sem `fields`.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Validação: "Gravação só com `application/json` (exceto envio de imagem); outro formato → 415. Corpo JSON até 100 KB e imagem até 2 MB; acima → 413." passa a "Gravação com corpo só com `application/json` (exceto envio de imagem); outro formato → 415. A gravação sem corpo, como o `DELETE` e o logout, dispensa o formato. Corpo JSON até 100 KB (102.400 bytes) e imagem até 2 MB; acima → 413. Corpo que não é JSON válido → 400 `VALIDATION_ERROR`, sem `fields`."
- `docs/padroes/api.md`, Erros, depois do exemplo: novo parágrafo "Em `fields`, cada campo aparece uma vez, com a primeira mensagem; o campo dentro de objeto ou lista usa o caminho com pontos (`vehicle.plate`, `services.0.serviceId`)."

### L5. Linha de registro de cada requisição

**Problema.** `backend.md` pede "uma linha JSON por evento [...] com nível, `requestId`, rota, status, usuário e duração", mas a tabela de níveis só prevê `info` para os eventos de negócio (login, agendamento criado e outros). Não está dito se cada requisição gera uma linha, nem com que nível sai a requisição comum.

**Opções:**

- [X] **1. Uma linha por requisição da API, com o nível pelo resultado (recomendada).** O tratamento único grava a linha ao fim: `error` no 500, com o rastro; `warn` na origem recusada e nos códigos `ACCOUNT_LOCKED` e `VERSION_CONFLICT`; `info` nas demais. Os serviços gravam à parte, em `info`, os eventos de negócio. Toda resposta, inclusive a de erro previsto, fica localizável pelo `requestId`, com status e duração.
- [ ] **2. Só falhas, anomalias e eventos de negócio.** Menos linhas, mas um 404 ou um 409 de que o usuário reclame não aparece no registro, e o `requestId` que ele vê na mensagem de erro não leva a nada.

**Texto proposto (opção 1):**

- `docs/padroes/backend.md`, Registro, primeiro parágrafo: "Uma linha JSON por evento na saída padrão, lida nos registros da Vercel, com nível, `requestId`, rota, status, usuário e duração." passa a "Uma linha JSON por evento na saída padrão, lida nos registros da Vercel. O tratamento único grava uma linha ao fim de cada requisição da API, com nível, `requestId`, método, caminho sem a query string, status, código do erro, usuário e duração; os serviços gravam linhas próprias para os eventos de negócio."
- Mesmo arquivo, tabela de níveis, linha `info`: "evento de negócio: login, [...]" passa a "requisição concluída sem falha nem anomalia; evento de negócio: login, [...]".

### L6. Valores dos cabeçalhos de segurança

**Problema.** `seguranca.md` (Complementos) lista os cinco cabeçalhos e diz que a CSP impede "a exibição das páginas dentro de outros sites e o carregamento de objetos incorporados", mas não dá os valores. Uma CSP que restrinja os scripts exige um nonce a cada requisição, e então o Next.js renderiza toda página na hora, sem páginas estáticas (guia de CSP em `node_modules/next/dist/docs/`). O `seguranca.md` já passa de 2 mil tokens, então os valores iriam para `backend.md`.

**Opções:**

- [X] **1. CSP sem restringir os scripts, com os valores abaixo (recomendada).** Cobre o que `seguranca.md` pede e ainda impede que um `<base>` ou um formulário injetados desviem links e envios para outro site. As páginas continuam estáticas; contra XSS, vale o escape do React (RS014).
- [ ] **2. CSP completa, com nonce nos scripts.** Exige gerar o nonce no `src/proxy.ts` (#26) e torna todas as páginas dinâmicas, mais lentas e com mais uso de funções na Vercel.
- [ ] **3. Só as duas diretivas citadas, `frame-ancestors 'none'; object-src 'none'`.** Igual à 1, sem `base-uri` e `form-action`.

**Texto proposto (opção 1):**

`docs/padroes/backend.md`, nova seção "Cabeçalhos de segurança (`next.config.ts`)", com a frase "Enviados em todas as respostas, das páginas, da API e dos arquivos estáticos:", a tabela abaixo e, depois dela, "A política de conteúdo não restringe os scripts, o que exigiria um nonce a cada requisição e páginas sempre dinâmicas; contra XSS, vale o escape do React (RS014)."

| Cabeçalho | Valor |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000` (dois anos) |
| `Content-Security-Policy` | `frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'` |

`docs/plataforma/seguranca.md`, Complementos: ", esta impedindo a exibição das páginas dentro de outros sites e o carregamento de objetos incorporados, em todas as respostas, configurados em `next.config.ts`," passa a ", esta impedindo a exibição das páginas dentro de outros sites, o carregamento de objetos incorporados e o desvio de links e formulários, em todas as respostas, configurados em `next.config.ts` com os valores de `docs/padroes/backend.md`,".

## Decisões técnicas

- Seguidas: 0004 e 0006 (Supabase pelo `supabase-js`, sem conexão direta), 0005 e 0042 (dados só pela chave de serviço; o cliente de sessão só fala com o Supabase Auth), 0017 (código em inglês), 0025 (Problem Details), 0029 (registro na saída padrão), 0033 (merge, sem rebase), 0035 (testes antes do código) e 0036 (`import 'server-only'` em todo arquivo de `src/server`).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| Testes automatizados também do tratamento único (`src/server/http`), com `Request` e `Response` padrão, sem servidor, banco ou rede (L1) | conferir o tratamento único só à mão; testes de ponta a ponta; testes com o banco | o tratamento único concentra RS014, RS017 e RS018 e é usado por todas as rotas; os testes são tão rápidos e independentes quanto os das regras | substitui 0024 (como 0045) |

Escolhas locais, sem registro:

- `@supabase/ssr` 0.12.7, a última 0.12.x (08/09/2026), com versão exata. Ela pede `@supabase/supabase-js` ^2.114.0, e o projeto usa a 2.117.3.
- O `requestId` tem 8 algarismos hexadecimais aleatórios, como o exemplo de `api.md` (`7f3c9a1e`).
- No Problem Details, `title` é a frase padrão do status HTTP (`STATUS_CODES` do `node:http`), e `instance` é o caminho sem a query string.
- O cliente com a chave de serviço é criado uma vez por processo, porque não guarda sessão. O de sessão é criado a cada requisição, como a biblioteca exige.
- O handler lê o corpo e o entrega convertido à rota, porque o limite de 100 KB precisa valer antes do serviço também quando falta o `Content-Length`. A rota valida com `schema.parse`, e o `ZodError` vai ao tratamento único.
- Todas as linhas do registro saem pela saída padrão, com o nível no JSON, como diz `backend.md`. O registro nunca recebe cabeçalhos, query string nem corpo; só os campos nomeados de cada evento.
- A variável que faltar vira um `Error` com o nome dela, e o tratamento único responde 500, com o nome no registro.

## Riscos e dúvidas

- `package-lock.json`: gerado com o npm 11.6.2 desta máquina, perde as entradas `@emnapi/*`, e o `npm ci` do CI falha. Mitigação: `npx -y npm@11.21.1`, como no passo 2 da construção.
- O `@supabase/ssr` grava os cookies com validade de 400 dias e não deixa mudar esse valor: o `cookieOptions` vale para os outros atributos, mas `maxAge` é fixado pela biblioteca (conferido em `dist/main/cookies.js`). O fim da sessão depende do Supabase Auth e do logout. Isso pesa no RS007 e fica anotado para a #23.
- O cookie `Secure` em `http://localhost` é aceito pelos navegadores baseados no Chromium e pelo Firefox. O Safari não foi conferido. A #23 testa o login no `npm run dev` com um deles.
- A biblioteca passa ao `setAll` cabeçalhos para a resposta que grava cookies não ir para cache (`Cache-Control: private, no-cache, no-store`). Numa rota, os cookies são gravados por `next/headers`, que não tem como acrescentar cabeçalho à resposta. Esta tarefa não grava cookies; a #23 (login) e a #26 (`proxy.ts`) decidem como aplicá-los.
- O `AsyncLocalStorage` só existe no ambiente Node.js das rotas, que é o padrão. Uma rota com `export const runtime = 'edge'` quebraria o registro, e nenhuma rota do projeto prevê isso.
- O `next typegen` só confere a assinatura do `handleRoute` contra o tipo das rotas quando há uma rota. A rota temporária da verificação cobre isso antes da #23.
- Os clientes e o `respond.ts` ficam sem uso até a #23, como a issue prevê. O ESLint não acusa exportação sem uso.
- Com 8 algarismos hexadecimais, um `requestId` pode se repetir em algum momento. A hora de cada linha desfaz a dúvida dentro da janela de registros da Vercel.

## Fora do escopo

- Sessão, guards e rotas (#23). O usuário entra na linha do registro com o guard da #23 (`TODO(#23)` no `logger.ts`).
- `docs/plataforma/openapi.yaml`, criado na primeira tarefa de API (#23).
- Repositórios e a conversão de violações de restrição em códigos de erro: cada repositório, com a sua tarefa.
- Envio de imagens ao Storage e o limite de 2 MB (UC13). O handler só conhece JSON, e a rota de imagem acrescenta o próprio formato.
- `src/proxy.ts` (#26), inclusive os cabeçalhos anticache do `@supabase/ssr` nas páginas.
- CSP com nonce nos scripts (L6).
- `.env.example`: a mudança de L3 é feita pelo desenvolvedor.
