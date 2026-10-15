---
issue: 1
titulo: "Base do projeto: Next.js, ferramentas de qualidade e CI"
area: cicd
tipo: configuracao
requisitos: [RNF014, RNF015, RS016]
status: concluido
aprovado_por: yvan
aprovado_em: 12:24 - 15/10/2026
---

# Plano: Base do projeto: Next.js, ferramentas de qualidade e CI

## Objetivo

Criar a aplicação Next.js 16.4 na raiz do repositório (`App/`), sem nenhuma funcionalidade, com as ferramentas de qualidade (Prettier, TypeScript, ESLint e Vitest), os scripts `dev`, `check`, `test` e `format`, o `.env.example` e o CI de `docs/plataforma/infraestrutura.md`. Atende RNF014 (código versionado e verificado pelos padrões), RNF015 (parâmetros de ambiente fora do código) e RS016 (nenhum segredo no repositório). O job do CI nasce nesta tarefa e passa a ser check obrigatório da `main` (fase 2 da proteção).

## Check do CI para a proteção da main

| Item                    | Valor                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Arquivo                 | `.github/workflows/ci.yml`, fluxo `name: CI`                                                                           |
| Job                     | id `check`, sem `name:` próprio, então o check se chama **`check`**                                                    |
| Como aparece no PR      | `CI / check (push)` e `CI / check (pull_request)`; os dois publicam o check `check`                                    |
| Check da Vercel         | `Vercel` (status de commit, já presente na `main`)                                                                     |
| Quando entra no ruleset | depois da primeira execução no PR desta tarefa e antes da incorporação, pelo desenvolvedor, com a fonte GitHub Actions |

Renomear o job depois obriga a trocar o check no ruleset ao mesmo tempo; por isso o nome também fica registrado em `infraestrutura.md`.

## Como o scaffold entra

1. Gerar em pasta temporária fora do repositório:

   ```
   npx create-next-app@16.4.1 <pasta-temporária> --ts --tailwind --eslint --app --src-dir --use-npm --disable-git --import-alias "@/*" --no-react-compiler --no-cache-components --no-agents-md --no-agent-feedback --skip-install --yes
   ```

   React Compiler e Cache Components ficam desligados porque não estão na stack documentada. `--skip-install` porque as versões são ajustadas antes da instalação, e o `package-lock.json` é gerado uma vez só, em `App/`.

2. Copiar para `App/` só o que a tabela abaixo aproveita; nenhum arquivo existente é sobrescrito.
3. Ajustar o `package.json` (seção seguinte) e executar `npm install` em `App/`, com a pasta `node_modules/` inexistente (o `.claude/settings.json` pede confirmação).

Conferido com o create-next-app 16.4.1 em pasta temporária, em 15/10/2026: ele não gera `CLAUDE.md` nem `.gitattributes`; gera `AGENTS.md` (sem `--no-agents-md`), `README.md` e `.gitignore`.

| Arquivo do scaffold                             | Destino                                                                                                                                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                  | aproveitado, com os ajustes de "Dependências e scripts"                                                                                                    |
| `tsconfig.json`                                 | aproveitado; `.claude/worktrees` entra em `exclude`                                                                                                        |
| `next.config.ts`                                | aproveitado, com a regra do `@tailwindcss/turbopack` (L4); ganha `agentRules: false` (L5)                                                                  |
| `eslint.config.mjs`                             | aproveitado; ganha `eslint-config-prettier` e ignora `.claude/worktrees/**`                                                                                |
| `src/app/layout.tsx`                            | aproveitado e reduzido: `lang="pt-BR"` (RNF016), título "Glow – Estética Automotiva", sem as fontes Geist (fontes e tema ficam para a tarefa do shadcn/ui) |
| `src/app/globals.css`                           | reduzido a `@import "tailwindcss";`; o tema com `@theme` vem com o shadcn/ui                                                                               |
| `src/app/page.tsx`                              | descartado: a página inicial é `src/app/(portal)/page.tsx`                                                                                                 |
| `src/app/favicon.ico` e os cinco `public/*.svg` | descartados: são logos do Next.js e da Vercel, sem referência no código; `public/.gitkeep` continua                                                        |
| `next-env.d.ts`                                 | não versionado: é gerado pelo Next.js, que recomenda ignorá-lo                                                                                             |
| `.gitignore`                                    | mesclado ao atual (seção "Configuração")                                                                                                                   |
| `README.md`                                     | descartado: o `README.md` do repositório já tem a seção "Executar"                                                                                         |
| `AGENTS.md`                                     | não gerado (`--no-agents-md`); ver L5                                                                                                                      |

## Dependências e scripts

`package.json`: `"name": "glow"`, `"private": true`, `"type": "module"` (acrescentado na etapa 02, ver `notas.md`), `"engines": { "node": "24.x" }` (decisão 0023; a Vercel usa esse campo para escolher a versão do Node.js).

| Pacote                                   | Versão          | Tipo                       | Motivo                                                                                                |
| ---------------------------------------- | --------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `next` e `eslint-config-next`            | `16.4.1`        | produção / desenvolvimento | scaffold                                                                                              |
| `react` e `react-dom`                    | `19.3.0`        | produção                   | scaffold                                                                                              |
| `server-only`                            | `^0.0.1`        | produção                   | `import 'server-only'` em todo arquivo de `src/server/` (decisão 0036)                                |
| `typescript`                             | `~6.0.3`        | desenvolvimento            | decisão 0023; o scaffold instala `^5`, e a versão `latest` do npm já é a 7.0                          |
| `@types/node`                            | `^24`           | desenvolvimento            | Node.js 24; o scaffold instala `^20`                                                                  |
| `@types/react` e `@types/react-dom`      | `^19`           | desenvolvimento            | scaffold                                                                                              |
| `tailwindcss` e `@tailwindcss/turbopack` | `^4.3.3`        | desenvolvimento            | scaffold                                                                                              |
| `eslint`                                 | `^9.39.5`       | desenvolvimento            | L1 e decisão proposta 0037; é a versão que o scaffold instala                                         |
| `eslint-config-prettier`                 | `^10.1.8`       | desenvolvimento            | desliga as regras do ESLint que conflitam com o Prettier, como recomenda a documentação do Next.js 16 |
| `prettier`                               | `3.9.10`, exata | desenvolvimento            | decisão 0028; versão exata porque a saída do Prettier muda entre versões, como ele recomenda          |
| `vitest`                                 | `^5.0.4`        | desenvolvimento            | testes das regras e dos esquemas                                                                      |
| `vite`                                   | `^8.3.4`        | desenvolvimento            | dependência par obrigatória do Vitest 5, declarada em vez de instalada implicitamente pelo npm        |

| Script            | Comando                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `dev`             | `next dev`                                                              |
| `build` e `start` | `next build` e `next start` (scaffold; a Vercel usa o `build`)          |
| `format`          | `prettier --write .`                                                    |
| `format:check`    | `prettier --check .`                                                    |
| `typecheck`       | `next typegen && tsc --noEmit`                                          |
| `lint`            | `eslint --max-warnings=0`                                               |
| `test`            | `vitest run`                                                            |
| `check`           | `npm run format:check && npm run typecheck && npm run lint && npm test` |

- `next typegen` antes do `tsc`: o `next-env.d.ts` e os tipos das rotas (como o `LayoutProps` do layout) são gerados, não versionados; num clone limpo o `tsc --noEmit` sozinho falha. É o comando que a documentação do Next.js 16 indica para a checagem de tipos no CI.
- `--max-warnings=0`: o critério pede "sem erros nem avisos", e o ESLint termina com sucesso quando só há avisos.
- O `check` executa as etapas 1 a 4 do CI, na ordem (`setup/questionario.md`, seção 3). A etapa 5, `npm audit`, roda só no CI, porque depende da rede e da base de vulnerabilidades do dia.

## Configuração

- `.gitignore`: mantém as linhas atuais e acrescenta, do scaffold, `/coverage`, `/out/`, `/build`, `.DS_Store`, `*.pem`, `npm-debug.log*`, `.vercel`, `*.tsbuildinfo` e `next-env.d.ts`; acrescenta também `.claude/worktrees/`, onde o Claude Code cria worktrees dentro do repositório. As linhas de Yarn e pnpm do scaffold ficam de fora, porque o projeto usa npm.
- `.env.example` (L2): só os nomes, sem valores, na ordem de `infraestrutura.md`: `SUPABASE_URL=`, `SUPABASE_ANON_KEY=`, `SUPABASE_SERVICE_ROLE_KEY=`, `APP_URL=`, `APP_TIMEZONE=`, `SEED_ADMIN_EMAIL=` e `SEED_ADMIN_PASSWORD=`, uma por linha.
- `prettier.config.mjs`: configuração padrão do Prettier, sem opções próprias; o arquivo existe para os editores o encontrarem e porque está na árvore de `estrutura-de-pastas.md`.
- `.prettierignore` (L3): `*.md`.
- `vitest.config.ts`: `include: ['tests/**/*.test.ts']`; ambiente `node`; alias `@/` para `src/`, igual ao do `tsconfig.json`; alias de `server-only` para o `empty.js` do próprio pacote, porque ele lança erro fora de componente de servidor e todo arquivo de `src/server/rules/` o importa (decisão 0036); `passWithNoTests: true` (ver "Riscos e dúvidas").
- `eslint.config.mjs`: o do scaffold (`core-web-vitals` e `typescript` do `eslint-config-next`), mais `eslint-config-prettier` por último e `.claude/worktrees/**` entre os ignorados.
- `tsconfig.json`: o do scaffold, com `"exclude": ["node_modules", ".claude/worktrees"]`.
- `next.config.ts`: o do scaffold, mais `agentRules: false` (L5).
- `.github/workflows/ci.yml`:
  - dispara a cada `push` em qualquer ramificação (`branches: ['**']`) e a cada `pull_request` para a `main`;
  - `permissions: contents: read`, sem segredos e sem acesso ao banco;
  - job `check` em `ubuntu-latest`: `actions/checkout@v7`; `actions/setup-node@v7` com `node-version: 24` e `cache: npm`; `npm ci`; depois um passo com nome para cada etapa, na ordem: `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm test` e `npm audit --omit=dev --audit-level=high`;
  - nenhum passo com `continue-on-error` ou `if: always()`: o GitHub Actions interrompe o job no primeiro passo que falha.
- `src/app/(portal)/page.tsx`: componente de servidor com `<main>` e `<h1>Glow – Estética Automotiva</h1>`, sem estilo nem dados.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então)                                                                                                                | Verificação                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dado um clone limpo, quando rodo `npm ci` e `npm run check`, então tudo passa sem erros nem avisos                                            | etapa 02: clonar a ramificação numa pasta temporária, rodar `npm ci` e `npm run check` e conferir a saída sem `warn`, exceto os dois aceitos na etapa 02 (`notas.md`: descontinuação do ESLint 9 e resumo do audit de desenvolvimento); no PR, o job `check` aprovado                                                                                                                |
| Dado `npm run dev`, quando abro `http://localhost:3000`, então vejo a página inicial provisória                                               | manual: `npm run dev` e a página com "Glow – Estética Automotiva" no navegador; de novo na pré-visualização da Vercel do PR                                                                                                                                        |
| Dado um `.env.local` na pasta, quando rodo `git status`, então ele não aparece; o `.env.example` é versionado e tem só os nomes das variáveis | `git check-ignore -v .env.local` aponta a regra do `.gitignore` sem criar o arquivo (o agente não cria `.env*`); `git ls-files .env.example` o lista; o conteúdo é conferido na revisão; passo manual do desenvolvedor: criar um `.env.local` e rodar `git status` |
| Dado um PR para a `main`, quando o CI roda, então executa as etapas de `infraestrutura.md` na ordem e para na primeira que falhar             | log do job `check` no PR com os cinco passos na ordem; leitura do `ci.yml`, sem `continue-on-error`; localmente, uma alteração temporária mal formatada, nunca commitada, faz o `npm run check` parar no Prettier                                                  |
| Dado o esqueleto de pastas, quando a tarefa termina, então as pastas e os `README.md` continuam lá                                            | `git diff --name-status origin/main...HEAD` sem `D` em `README.md` ou `.gitkeep`; `git ls-files '*README.md'` continua listando 112 arquivos                                                                                                                       |

Verificações além dos critérios: o build da Vercel (`Vercel`) conclui no PR, e o `npm run dev` executado pelo agente não altera o `AGENTS.md` (L5).

## Arquivos

| Arquivo                                                       | Ação                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `package.json` e `package-lock.json`                          | criar                                                                 |
| `tsconfig.json`, `next.config.ts` e `eslint.config.mjs`       | criar, a partir do scaffold                                           |
| `prettier.config.mjs`, `.prettierignore` e `vitest.config.ts` | criar                                                                 |
| `.env.example`                                                | criar (L2)                                                            |
| `.gitignore`                                                  | alterar                                                               |
| `.github/workflows/ci.yml`                                    | criar                                                                 |
| `src/app/layout.tsx` e `src/app/globals.css`                  | criar, a partir do scaffold                                           |
| `src/app/(portal)/page.tsx`                                   | criar                                                                 |
| `AGENTS.md`                                                   | alterar (L1 e L2)                                                     |
| `guia/regras.md`                                              | alterar (L1, L2 e L5)                                                 |
| `docs/padroes/codigo.md`                                      | alterar (L3)                                                          |
| `docs/plataforma/estrutura-de-pastas.md`                      | alterar (L3 e L4)                                                     |
| `docs/plataforma/visao-geral.md`                              | alterar (L1)                                                          |
| `docs/plataforma/infraestrutura.md`                           | alterar: nome do job `check` e `next typegen` antes do `tsc --noEmit` |
| `docs/decisoes/0037-eslint-9.md` e `docs/decisoes/CONTEXT.md` | criar e alterar, se a decisão 0037 for aprovada                       |
| `memoria/tarefas/1-base-do-projeto/`                          | `01_plano.md` e `notas.md` nesta etapa; `02_relatorio.md` na etapa 03 |

Não mudam: `CLAUDE.md`, `README.md`, `.gitattributes`, `.claude/settings.json`, `.github/CODEOWNERS`, `setup/questionario.md` e os `README.md` do esqueleto.

## Testes previstos

Nenhum teste automatizado: a tarefa não cria regra de negócio nem esquema de validação, os únicos testados pelo Vitest (decisões 0024 e 0035). O Vitest fica configurado e roda com `passWithNoTests`.

Verificação temporária na etapa 02, não versionada: um teste que importa um módulo com `import 'server-only'` passa com o alias do `vitest.config.ts`. O resultado vai para `notas.md`.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Versão do ESLint: a documentação diz 10, o Next.js 16.4 só aceita até o 9

**Problema.** `AGENTS.md`, `guia/regras.md` e `docs/plataforma/visao-geral.md` fixam o ESLint 10. A configuração de ESLint do Next.js (`eslint-config-next@16.4.1`) depende de três plugins (`eslint-plugin-react`, `eslint-plugin-import` e `eslint-plugin-jsx-a11y`) que só aceitam ESLint até o 9; por isso o create-next-app 16.4.1 instala o ESLint 9. Testado em pasta temporária com o ESLint 10.12: o `npm ci` emite avisos "Conflicting peer dependency", o que descumpre o primeiro critério ("sem erros nem avisos").

**Opções:**

- [x] **1. ESLint 9.39 (recomendada).** Última versão 9.x, com a mesma configuração flat. Volta ao 10 quando o `eslint-config-next` aceitar. Vira a decisão 0037.
- [ ] **2. ESLint 10 com os avisos.** O `npm ci` passa com avisos, descumprindo o primeiro critério, e regras dos plugins sem suporte podem falhar em código futuro.
- [ ] **3. ESLint 10 sem o `eslint-config-next`.** Sem avisos, mas perde as regras do Next.js que `docs/padroes/codigo.md` exige ("análise pelo ESLint do Next.js").

**Texto proposto (opção 1):**

- `AGENTS.md`, linha da stack: "ESLint 10" passa a "ESLint 9".
- `guia/regras.md`, último item de "Como programar": "Zod 4 e ESLint 10" passa a "Zod 4 e ESLint 9".
- `docs/plataforma/visao-geral.md`, linha "Qualidade": "5.0, 10 e 3.9" passa a "5.0, 9 e 3.9".
- `docs/decisoes/0037-eslint-9.md`, novo, com a linha no índice `docs/decisoes/CONTEXT.md` (seção "Decisões técnicas").

### L2. `.env.example`: a regra da IA proíbe o agente de criá-lo

**Problema.** A issue e `infraestrutura.md` pedem o `.env.example` versionado, só com os nomes das variáveis. Mas `AGENTS.md` ("Nunca ler arquivos `.env*`") e `guia/regras.md` ("lê, cria, copia ou exibe `.env*`") proíbem o agente de criá-lo e de lê-lo, porque o padrão `.env*` também cobre o `.env.example`. O `.claude/settings.json` já bloqueia só os arquivos com valores (`.env`, `.env.local` e semelhantes), não o `.env.example`.

**Opções:**

- [x] **1. Exceção explícita para o `.env.example` (recomendada).** O agente cria e mantém o arquivo, que nunca tem valores.
- [ ] **2. Regra como está.** O desenvolvedor cria o `.env.example` à mão, com o conteúdo da seção "Configuração", nesta tarefa e nas próximas que acrescentarem variáveis; o agente nunca o lê.

**Texto proposto (opção 1):**

- `AGENTS.md`, "Regras inegociáveis": "Nunca ler arquivos `.env*`, exceto o `.env.example`, que tem só os nomes das variáveis, nem escrever segredos em código, testes, documentos ou registros."
- `guia/regras.md`, "Limites": "lê, cria, copia ou exibe `.env*` (exceto o `.env.example`, que tem só os nomes das variáveis), chaves, tokens ou senhas, nem escreve segredos em código, testes, documentos ou registros;"

### L3. Prettier nos arquivos `.md`

**Problema.** A decisão 0028 e `docs/padroes/codigo.md` não dizem quais arquivos o Prettier formata. Com o Prettier 3.9.10, `prettier --check .` acusa 101 dos 279 `.md` do repositório e nenhum outro arquivo: ele alinha as colunas das tabelas com espaços, como nas tabelas deste plano.

**Opções:**

- [x] **1. Prettier só em código e configuração (recomendada).** `*.md` no `.prettierignore`. A documentação fica como está, e editar uma linha de tabela não reescreve a tabela inteira no diff.
- [ ] **2. Prettier em tudo, inclusive `.md`.** Este PR reformata os 101 arquivos, e cada edição futura de tabela realinha a tabela toda no diff.

**Texto proposto (opção 1):**

- `docs/padroes/codigo.md`, último item de "Comentários e formatação": "Formatação pelo Prettier, com a configuração padrão, nos arquivos de código e de configuração; os `.md` ficam fora (`.prettierignore`), porque o alinhamento das tabelas reescreveria a documentação a cada edição. Análise pelo ESLint do Next.js; a revisão discute conteúdo, não estilo."
- `docs/plataforma/estrutura-de-pastas.md`, linha da raiz: acrescentar `.prettierignore`.

### L4. Tailwind CSS sem `postcss.config.mjs`

**Problema.** `docs/plataforma/estrutura-de-pastas.md` lista `postcss.config.mjs` na raiz. O create-next-app 16.4.1 integra o Tailwind CSS 4 de outro jeito: pelo carregador `@tailwindcss/turbopack`, configurado no `next.config.ts`, sem PostCSS.

**Opções:**

- [x] **1. Seguir o scaffold (recomendada).** Mantém o carregador no `next.config.ts` e tira o `postcss.config.mjs` da árvore: modelo oficial, um arquivo a menos.
- [ ] **2. Seguir o documento.** Troca pelo `@tailwindcss/postcss` com `postcss.config.mjs`, afastando-se do modelo oficial e somando uma dependência.

**Texto proposto (opção 1):**

- `docs/plataforma/estrutura-de-pastas.md`, linha da raiz: "... eslint.config.mjs · prettier.config.mjs · .prettierignore · vitest.config.ts · components.json · .env.example ...", sem o `postcss.config.mjs`.

### L5. O `next dev` reescreve o `AGENTS.md`

**Problema.** Desde o Next.js 16.3, o `next dev`, quando detecta um assistente de IA (o Claude Code é detectado), acrescenta ao `AGENTS.md` um bloco em inglês que manda ler a documentação em `node_modules/next/dist/docs/`. É a opção `agentRules`, ligada por padrão. Sem decisão, cada `npm run dev` feito pelo agente deixa o `AGENTS.md` alterado.

**Opções:**

- [x] **1. Desligar e indicar a documentação em `guia/regras.md` (recomendada).** `agentRules: false` no `next.config.ts`; o `AGENTS.md` continua curado pela equipe, em português (decisão 0031).
- [ ] **2. Versionar o bloco do Next.js no `AGENTS.md`.** Fica em inglês e é reescrito pelo `next dev` a cada atualização do Next.js.

**Texto proposto (opção 1):**

- `guia/regras.md`, último item de "Como programar": "as versões da stack são recentes: confira a documentação oficial da versão em uso antes de presumir uma API (a do Next.js instalado está em `node_modules/next/dist/docs/`; Next.js 16 usa `src/proxy.ts`, ...)".

## Decisões técnicas

- Seguidas: 0001 (uma aplicação), 0007 (Tailwind CSS; o shadcn/ui fica para outra tarefa), 0023 (TypeScript `~6.0.3` e Node.js 24), 0024 e 0035 (Vitest só para regras e esquemas), 0028 (Prettier), 0030 (planos gratuitos), 0031 (estrutura ICM preservada), 0032 (sem `middleware.ts`), 0033 e 0034 (fluxo Git), 0036 (`server-only` e árvore de pastas).

| Decisão proposta                                                                                                  | Alternativas descartadas                                                     | Justificativa                                                                                                                                                                                                               | Nova ou substitui |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 0037 – ESLint 9 com a configuração do Next.js (`eslint-config-next`), até ela aceitar o ESLint 10 (depende de L1) | ESLint 10 com avisos de dependência; ESLint 10 sem a configuração do Next.js | Os plugins do `eslint-config-next@16.4.1` só aceitam ESLint até o 9; é o mesmo motivo da decisão 0023, ferramenta da stack sem suporte à versão nova. Consequência aceita: revisar a escolha a cada atualização do Next.js. | nova              |

Escolhas locais, sem registro: o nome do job `check`; os scripts intermediários (`format:check`, `typecheck` e `lint`); `next typegen` antes do `tsc` e o `eslint-config-prettier`, ambos indicados pela documentação do Next.js 16; o Prettier em versão exata; o `passWithNoTests` provisório; as actions fixadas pela versão principal (`@v7`).

## Riscos e dúvidas

- `passWithNoTests`: sem a opção, `vitest run` falha porque ainda não há testes; este plano é a justificativa que `guia/regras.md` exige para afrouxar uma verificação. Risco: mais tarde, um `include` errado passaria rodando zero testes. A primeira tarefa que criar um teste remove a opção; a pendência vai para o `02_relatorio.md`.
- `package-lock.json` gerado no Windows: com uma `node_modules/` já existente, o npm pode deixar de registrar as dependências opcionais nativas de outras plataformas (Tailwind CSS, Lightning CSS, SWC). A instalação parte de pasta limpa, e o CI e a Vercel, em Linux, confirmam.
- `next typegen` carrega o `next.config.ts` na fase de build; hoje ele não lê variáveis de ambiente, então o CI não precisa de nenhuma.
- `npm audit` pode falhar por vulnerabilidade publicada depois, sem mudança no código: é o comportamento que `infraestrutura.md` pede. Em 15/10/2026, zero vulnerabilidades nas dependências de produção.
- Worktrees em `.claude/worktrees/`: sem as exclusões no `.gitignore`, no `tsconfig.json` e no `eslint.config.mjs`, o `npm run check` da cópia principal analisaria também o código e o `.next/` delas.
- RN028: a página inicial e o título fixam o nome "Glow – Estética Automotiva", como a issue pede; a tarefa do UC01 troca pelos dados institucionais vindos da API.
- Fase 2 da proteção: o check `check` só pode ser marcado como obrigatório depois de rodar uma vez; até lá o PR desta tarefa não é bloqueado por ele.
- O responsável por CI/CD, que revisa e aprova o PR, ainda está pendente na seção 2 de `setup/questionario.md` (registrado em `notas.md`).
- Ramificação `chore/1-project-base`, criada na etapa 02 a partir da `main` atualizada (`procedimentos/git.md`); título do PR em Conventional Commits, como `chore: set up Next.js app, quality tools and CI`.

## Fora do escopo

- shadcn/ui (`components.json` e `src/lib/utils.ts`), tema com `@theme`, fontes, favicon e logo.
- Supabase: clientes, `supabase/config.toml`, migration e variáveis na Vercel.
- Layouts do portal e do painel, `not-found.tsx`, `error.tsx`, `src/proxy.ts` e telas.
- Scripts de `tools/`, atualizações automáticas de versão pelo Dependabot (`.github/dependabot.yml`) e o `CODEOWNERS`, que aguarda a seção 2 do questionário.
- Alterar o ruleset da `main`: o desenvolvedor faz, com o nome do check acima.
