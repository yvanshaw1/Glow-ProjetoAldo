---
issue: 6
titulo: "Executar a aplicação em contêiner Docker"
area: cicd
tipo: configuracao
requisitos: [RNF014, RNF015, RS016]
status: concluido
aprovado_por: yvan  
aprovado_em: 15/10/2026 - 15:51
---

# Plano: Executar a aplicação em contêiner Docker

## Objetivo

Executar a aplicação compilada num contêiner Docker, da mesma forma em qualquer máquina com o Docker (exigência da disciplina), sem mudar a publicação (Vercel), o banco (Supabase), o CI nem o desenvolvimento com `npm run dev`. Entram o `Dockerfile`, o `.dockerignore`, o `compose.yaml`, a saída standalone do Next.js, um registro de decisão novo e os módulos do ICM alinhados à Documentação de Arquitetura de Software (seções 2.2, 3.1, 7, 8, 8.6 e 9) e à de Desenvolvimento com IA (seções 3, 6.1 e 9), atualizadas em 15/10/2026. Atende RNF015 (as variáveis chegam ao contêiner só na execução), RS016 (nenhum segredo na imagem) e RNF014.

## Efeito do `output: "standalone"` na Vercel e no CI

Conferido na documentação e no código do Next.js 16.4.1 instalado (`node_modules/next/dist/`):

| Onde | Efeito | Fonte |
|---|---|---|
| `next build` | gera tudo como hoje; no fim, uma etapa a mais copia para `.next/standalone/` um `server.js` mínimo e só os arquivos de `node_modules` que o servidor usa. `public/` e `.next/static/` não são copiados | `docs/01-app/03-api-reference/05-config/01-next-config-js/output.md`; `build/index.js` (`writeStandaloneDirectory`) |
| Vercel | a Vercel é um adaptador verificado do Next.js (`docs/01-app/01-getting-started/17-deploying.md`) e publica a partir dos artefatos normais do build, que não mudam; a etapa standalone roda depois do aviso de build concluído aos adaptadores e só acrescenta alguns segundos. Único efeito colateral: com standalone, o Next.js desliga `supportsImmutableAssets`, uma otimização de cache dos estáticos entre publicações que só vale quando o adaptador a liga; páginas, rotas e estáticos continuam iguais | `server/config.js`; `supportsImmutableAssets.md` |
| CI | nenhum: o CI não roda `next build`; o `next typegen` lê o `next.config.ts`, mas a saída só age no build, e `output` é campo tipado de `NextConfig` | `.github/workflows/ci.yml` |
| `next dev` | nenhum | `output.md` |
| `next start` | passa a imprimir `"next start" does not work with "output: standalone" configuration` (L3) | `server/next.js` |
| arquivos `.env` | a etapa standalone copia `.env` e `.env.production` para `.next/standalone/` quando eles existem no build (o `.env.local`, nunca). No build da imagem eles não existem, por causa do `.dockerignore` (L1) | `build/index.js` |
| Windows | gerar a standalone na máquina pode usar junction em vez de link simbólico; não afeta o contêiner | `output.md` |

Confirmação final: os checks `check` e `Vercel` do PR (critério 3).

## Como o Docker entra

Segue a seção 8.6 e o exemplo oficial `with-docker`, que a documentação instalada indica para a saída standalone.

- `next.config.ts`: `output: "standalone"`, com comentário dizendo que serve à imagem do `Dockerfile` e não muda a publicação na Vercel.
- `Dockerfile`, três estágios, todos a partir de `node:24-slim`:
  1. `dependencies`: copia `package.json` e `package-lock.json` e roda `npm ci`;
  2. `builder`: copia o `node_modules` do estágio anterior e o código, define `NODE_ENV=production` e roda `npm run build`, sem variáveis de ambiente (L2);
  3. `runner`: `NODE_ENV=production`, `PORT=3000` e `HOSTNAME=0.0.0.0` (o Docker preenche `HOSTNAME` com o id do contêiner, e o `server.js` o usaria como endereço); copia `public/`, `.next/standalone/` e `.next/static/`, com a pasta `.next` do usuário `node` para o cache que o servidor grava; `USER node`; `EXPOSE 3000`; `CMD ["node", "server.js"]`.
- Usuário `node`: já existe na imagem oficial (uid 1000) e não tem privilégios de administrador; nenhum usuário novo é criado.
- Sem `init` no contêiner: o servidor do Next.js trata `SIGINT` e `SIGTERM` (`server/lib/start-server.js`, comentário "e.g. from Docker"), então `Ctrl+C` e `docker compose down` encerram sem esperar o tempo limite.
- `.dockerignore` (L1): `**/.env*`, `**/node_modules`, `**/.next`, `.git` e `.claude`, cada grupo com um comentário do motivo.
- `compose.yaml`: `name: glow`, para que o projeto, a imagem e o contêiner tenham o mesmo nome em qualquer pasta ou máquina; serviço `app` com `build: .`, `ports: ["3000:3000"]` e `env_file: .env.local`. O Compose lê o `.env.local` na execução e para com erro claro se ele não existir. O agente não lê nem cria esse arquivo.
- `package.json`: sem o script `start` (L3).

Binários nativos: o `package-lock.json` registra as variantes Linux `gnu` e `musl`, x64 e arm64, do SWC, do Tailwind CSS, do Lightning CSS e do sharp; o `npm ci` na imagem funciona em máquinas Intel e Apple Silicon.

## Critérios de aceitação e verificação

Esta máquina não tem o Docker. Os critérios 1 e 2 viram passos manuais de um integrante com o Docker Desktop (Docker 29 e Compose 5), na ramificação do PR, com o resultado registrado num comentário do PR. O agente cobre, sem o Docker, o que o estágio final faz.

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| 1. Dado uma máquina com o Docker e o `.env.local` preenchido, quando rodo `docker compose up --build`, então a aplicação responde em `http://localhost:3000` com a página inicial | **manual** (integrante com o Docker Desktop): copiar o `.env.example` para `.env.local` (a aplicação ainda não usa os valores), rodar `docker compose up --build`, abrir `http://localhost:3000` e ver "Glow – Estética Automotiva"; `Ctrl+C` encerra em poucos segundos. **Agente, etapa 02**: num clone limpo em pasta temporária de caminho curto, `npm ci` e `npm run build`; copiar `public/` e `.next/static/` para `.next/standalone/`, como o `Dockerfile` faz, e rodar `node server.js` lá dentro numa porta livre: status 200 e o `<h1>` |
| 2. Dado a imagem construída, quando inspeciono o contêiner, então não há nenhum arquivo `.env` nem a pasta `.git`, e o processo da aplicação não roda como root | **manual**, com o contêiner no ar: `docker compose exec app find / -xdev \( -name ".env*" -o -name .git \)` sem resultado; `docker compose top` mostra o processo `node server.js` com o usuário `node` (uid 1000). **Agente, etapa 02**: no mesmo clone, `.next/standalone/` sem `.env*` nem `.git`; no `Dockerfile`, `USER node` antes do `CMD` e nenhuma cópia fora de `public/`, `.next/standalone/` e `.next/static/` no estágio final |
| 3. Dado o PR aberto, quando o CI e a Vercel rodam, então o check e o build da Vercel passam com a saída standalone | checks `check` e `Vercel` aprovados no PR; a pré-visualização abre a página inicial com os estilos |
| 4. Dado `npm run dev`, quando abro `http://localhost:3000`, então o desenvolvimento continua funcionando como antes | **agente, etapa 02**: `npm run dev`, status 200 e o `<h1>`; o `AGENTS.md` mantém o mesmo hash (o `agentRules: false` continua valendo) |
| 5. Dado os módulos do ICM, quando procuro "Docker" e "contêiner", então eles dizem o mesmo que a seção 8.6 e o Quadro 38 da Documentação de Arquitetura de Software | `git grep -n -i -E "docker|contêiner|conteiner"` fora de `memoria/tarefas/` e conferência de cada resultado com a seção 8.6 e os Quadros 1, 35 (RS016), 36 e 38, listada no `02_relatorio.md`. A 0030 continua dizendo "contêineres" na alternativa descartada, porque o registro não muda; a decisão nova explica que ali se trata da hospedagem, como diz o Quadro 38 |

Verificação além dos critérios: `npm run check` aprovado. O Prettier formata o `compose.yaml`; o `Dockerfile` e o `.dockerignore` não têm formatador nem análise no CI.

## Arquivos

| Arquivo | Ação |
|---|---|
| `Dockerfile` | criar |
| `.dockerignore` | criar (L1) |
| `compose.yaml` | criar |
| `next.config.ts` | alterar: `output: "standalone"` |
| `package.json` | alterar: sem o script `start` (L3) |
| `AGENTS.md` | alterar: stack e comandos |
| `README.md` | alterar: stack e "Executar" |
| `setup/questionario.md` | alterar: seção 3 |
| `docs/plataforma/visao-geral.md` | alterar: stack |
| `docs/plataforma/infraestrutura.md` | alterar: cabeçalho, introdução, ambientes, variáveis (L2) e seção nova "Execução em contêiner" |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: raiz da árvore e linha `docker-compose.yml` da equivalência |
| `docs/plataforma/seguranca.md` | alterar: implementação do RS016 |
| `docs/plataforma/CONTEXT.md` | alterar: conteúdo de `infraestrutura.md` (fora da lista da issue; é o índice do assunto) |
| `docs/decisoes/NNNN-execucao-em-conteiner.md` | criar na etapa 03 |
| `docs/decisoes/CONTEXT.md` | alterar: linha da NNNN |
| `guia/regras.md` e `.claude/settings.json` | alterar (L4; fora da lista da issue) |
| `workflows/procedimentos/testes.md` e `guia/como-pedir.md` | alterar (acréscimo de escopo, no fim do plano) |
| `memoria/tarefas/6-execucao-em-conteiner/` | `01_plano.md` e `notas.md` nesta etapa; `02_relatorio.md` na etapa 03 |

Não mudam: `.github/workflows/ci.yml` (o CI não constrói a imagem), `.gitignore`, `.env.example`, `tsconfig.json`, `eslint.config.mjs`, `src/`, `workflows/procedimentos/deploy.md` (a publicação não muda) e a decisão 0030 (registro imutável).

### Em comum com outras tarefas em andamento

| Arquivo | Outra tarefa | Conflito no merge |
|---|---|---|
| `AGENTS.md` | #2: seção Áreas | não: a #6 muda a linha da stack e o bloco de comandos |
| `setup/questionario.md` | #2: seções 1, 2, 5 e 6 | não: a #6 muda só a seção 3 |
| `docs/plataforma/estrutura-de-pastas.md` | #2: linha do `.github/` na árvore | não: a #6 muda o fim da árvore e a tabela de equivalência |
| `guia/regras.md` (se L4 for 1 ou 2) | #2: abertura de "Como programar" | não: a #6 muda o item do `.env*` em "Limites" |
| `docs/decisoes/CONTEXT.md` | #2: linha da 0038 no fim da tabela | **sim**, mecânico: manter as duas linhas, em ordem de número |
| número da decisão | #2 propõe a 0038 | **sim**: ver "Decisões técnicas" |

A #3 altera só `_templates/plano.md`; nada em comum.

## Testes previstos

Nenhum teste automatizado: a tarefa não cria regra de negócio nem esquema de validação, os únicos testados pelo Vitest (decisões 0024 e 0035). As verificações estão em "Critérios de aceitação e verificação".

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. `.dockerignore`: os padrões da documentação valem só na raiz

**Problema.** A seção 8.6 diz que o `.dockerignore` exclui `.env*`, `node_modules`, `.next` e `.git`. No `.dockerignore`, um padrão sem `**/` vale só na raiz do contexto do build. A cópia principal (`App/`) guarda os worktrees do Claude Code em `.claude/worktrees/`, cada um com `node_modules`, `.next` e, possivelmente, um `.env.local`; quem rodar `docker compose up --build` na cópia principal enviaria tudo isso ao Docker, e o estágio `builder` copiaria os `.env.local` dos worktrees (não chegam à imagem final, que só leva `public/`, `.next/standalone/` e `.next/static/`).

**Opções:**

- [X] **1. Padrões em qualquer pasta e `.claude` fora (recomendada).** `**/.env*`, `**/node_modules`, `**/.next`, `.git` e `.claude`. Nenhum `.env` entra em nenhum estágio, e o build não depende de onde está a cópia.
- [ ] **2. Só os quatro padrões da documentação, na raiz.** Igual ao texto formal; o build na cópia principal fica lento e leva os `.env.local` dos worktrees ao estágio `builder`.

**Texto proposto (opção 1):**

- `docs/plataforma/infraestrutura.md`, seção nova "Execução em contêiner", linha do `.dockerignore`: ver "Textos propostos".
- `.dockerignore`, comentário: o `.claude` guarda os worktrees do Claude Code, cada um com cópias próprias de `node_modules`, `.next` e `.env*`.

### L2. A imagem é construída sem variáveis de ambiente

**Problema.** A seção 8.6 diz que o contêiner recebe as variáveis do `.env.local` na execução, e o `.dockerignore` as deixa fora do build. A Vercel, ao contrário, fornece as variáveis também durante o `next build`. Hoje nenhum código lê variáveis, mas a tarefa dos clientes do Supabase vai ler: se um módulo ou uma página estática depender delas durante o build, o código passa na Vercel e quebra o `docker compose up --build`. Nenhum módulo diz quando as variáveis podem ser lidas.

**Opções:**

- [X] **1. Registrar que as variáveis são lidas só na execução (recomendada).** Uma frase em `infraestrutura.md`, seção "Variáveis de ambiente", que o README de `src/server/supabase/` já cita. É o que a documentação do Next.js recomenda para uma imagem usada em vários ambientes (`self-hosting.md`).
- [ ] **2. Passar as variáveis não sigilosas como argumentos do build.** Mais configuração no `compose.yaml` e no `Dockerfile`, e ainda não resolve as sigilosas, que nunca podem entrar na imagem.
- [ ] **3. Não registrar agora.** A tarefa do Supabase descobre o problema quando ele aparecer.

**Texto proposto (opção 1):**

- `docs/plataforma/infraestrutura.md`, "Variáveis de ambiente", fim do primeiro parágrafo: "O código as lê na execução, durante a requisição, nunca na construção: a Vercel as fornece também no `next build`, mas a imagem do contêiner é construída sem elas, e um módulo ou página que dependa delas no build quebra o `docker compose up --build`."

### L3. O script `start` passa a avisar que não funciona

**Problema.** Com a saída standalone, o `next start` (script `start`, que veio do scaffold na #1) imprime `"next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.` Ele ainda sobe o servidor, mas o aviso confunde. Nenhum módulo cita o `npm start`: a Vercel usa só o `build`, o contêiner usa o `server.js`, e a seção 3 do questionário não o lista.

**Opções:**

- [X] **1. Remover o script `start` (recomendada).** A aplicação compilada roda pelo contêiner; `npm start` passa a dizer que o script não existe, sem aviso enganoso. Nenhum módulo muda.
- [ ] **2. Manter como está.** Continua funcionando para quem não tem o Docker, com o aviso a cada execução.
- [ ] **3. Trocar por `node .next/standalone/server.js`.** Sem copiar `public/` e `.next/static/`, as páginas abrem sem estilos nem scripts; copiar exigiria um script a mais, multiplataforma.

**Texto proposto (opção 1):** nenhum; só o `package.json` muda.

### L4. Comandos do Docker podem mostrar as variáveis do `.env.local` ao agente

**Problema.** O agente nunca lê `.env*` (`AGENTS.md` e `guia/regras.md`), e o `.claude/settings.json` bloqueia a leitura desses arquivos. Mas, numa máquina com o Docker, comandos como `docker compose config`, `docker inspect` e `env` dentro do contêiner (`docker compose exec`) mostram os valores lidos do `.env.local`, inclusive a chave de serviço, sem tocar no arquivo. A regra não cobre esse caminho. (Nesta máquina não há Docker; vale para os integrantes que o têm.)

**Opções:**

- [X] **1. Regra explícita e bloqueio dos comandos (recomendada).** O item do `.env*` em `guia/regras.md` passa a citar o Docker, e o `.claude/settings.json` nega `docker compose config`, `docker inspect`, `docker container inspect`, `docker exec` e `docker compose exec`. O agente ainda pode construir e subir o contêiner; as inspeções do critério 2 ficam com o integrante.
- [ ] **2. Só a regra em `guia/regras.md`.** Sem bloqueio automático; depende de o agente seguir a regra.
- [ ] **3. Fora desta tarefa.** Abrir uma issue `tipo:configuracao` para tratar depois.

**Texto proposto (opção 1):**

- `guia/regras.md`, "Limites", item do `.env*`: "lê, cria, copia ou exibe `.env*` (exceto o `.env.example`, que tem só os nomes das variáveis), chaves, tokens ou senhas, inclusive pelo Docker (`docker compose config`, `docker inspect` e `env` dentro do contêiner mostram as variáveis do `.env.local`), nem escreve segredos em código, testes, documentos ou registros;"
- `.claude/settings.json`, `deny`: `Bash(docker compose config:*)`, `Bash(docker inspect:*)`, `Bash(docker container inspect:*)`, `Bash(docker exec:*)` e `Bash(docker compose exec:*)`.

## Textos propostos

Trechos que a issue pede, com L1 e L2 na opção recomendada.

- `AGENTS.md`, linha da stack: "..., Prettier 3.9, Node.js 24 LTS e Vercel." passa a "..., Prettier 3.9, Node.js 24 LTS e Vercel; Docker 29 e Docker Compose 5 para executar a aplicação em contêiner."
- `AGENTS.md`, "Comandos": colunas realinhadas e linha nova `docker compose up --build   executa a aplicação compilada em contêiner, no mesmo endereço`.
- `README.md`, linha da stack: "..., Vitest, publicação na Vercel." passa a "..., Vitest, publicação na Vercel e execução em contêiner com Docker."
- `README.md`, fim de "Executar": "Em contêiner, com o Docker instalado e o `.env.local` preenchido: `docker compose up --build` constrói a imagem e executa a aplicação compilada em `http://localhost:3000`, da mesma forma em qualquer máquina. O dia a dia continua com `npm run dev`, e a publicação, na Vercel."
- `setup/questionario.md`, seção 3: "Criados na tarefa de base do projeto, no `package.json`:" passa a "Criados nas tarefas #1 (`package.json`) e #6 (`compose.yaml`):", com a linha nova `| docker compose up --build | constrói a imagem e executa a aplicação compilada em contêiner, em http://localhost:3000 |`.
- `docs/plataforma/visao-geral.md`, tabela "Stack": linha nova depois de "Execução": `| Contêineres | Docker e Docker Compose | 29 e 5 |`. No parágrafo seguinte, frase nova: "O Docker só executa a aplicação em contêiner, da mesma forma em qualquer máquina; a publicação continua na Vercel."
- `docs/plataforma/infraestrutura.md`:
  - cabeçalho: `relacionados: [RNF014, RNF015, RS016, 0030, NNNN]`;
  - introdução: "Sem servidor próprio, domínio ou contêineres." passa a "Sem servidor próprio nem domínio, e a aplicação não é hospedada em contêineres: o Docker serve só para executá-la da mesma forma em qualquer máquina (Execução em contêiner).";
  - "Ambientes", linha Desenvolvimento: "`npm run dev` em `http://localhost:3000`, ou em contêiner com `docker compose up --build`, no mesmo endereço" | "codificar e testar localmente; o contêiner executa a aplicação compilada da mesma forma em qualquer máquina";
  - "Variáveis de ambiente": "(ignorado pelo Git)" passa a "(ignorado pelo Git e fora da imagem do contêiner)", mais a frase de L2;
  - seção nova no fim, "## Execução em contêiner": "Por exigência da disciplina, a aplicação também roda num contêiner Docker, com o mesmo comportamento em qualquer máquina, independentemente do sistema operacional e do Node.js instalado (decisão NNNN). O contêiner não substitui a Vercel, que continua publicando a pré-visualização e a produção, nem o Supabase, que continua sendo o único banco: executa localmente a aplicação compilada, ligada ao projeto do Supabase pelas variáveis do `.env.local`." Depois, uma tabela com os três arquivos: `Dockerfile` (três estágios a partir da imagem oficial do Node.js 24: `npm ci`; `next build` com a saída standalone, `output: "standalone"` no `next.config.ts`; imagem final só com o servidor compilado, `public/` e `.next/static/`, executada pelo usuário `node`, sem privilégios de administrador), `.dockerignore` (deixa fora da imagem os `.env*` de qualquer pasta, `node_modules`, `.next`, `.git` e `.claude`, onde ficam os worktrees do Claude Code; RS016) e `compose.yaml` (serviço `app` em `http://localhost:3000`, com as variáveis lidas do `.env.local` na execução). Fecha com: "Com o Docker instalado e o `.env.local` preenchido: `docker compose up --build`. O dia a dia continua com `npm run dev`, que recarrega as páginas a cada alteração. A imagem não é publicada em registro, e o CI não a constrói: um erro no `Dockerfile` só aparece quando alguém executa o comando. Na Vercel, a saída standalone só acrescenta a pasta `.next/standalone/` ao build."
- `docs/plataforma/estrutura-de-pastas.md`:
  - fim da árvore, linha nova depois de `components.json · .env.example · ...`: `Dockerfile · compose.yaml · .dockerignore (execução em contêiner)`;
  - equivalência, linha `docker-compose.yml` e `Dockerfile`: "não existem" | "banco e hospedagem gerenciados (decisão 0030)" passa a "`compose.yaml` e `Dockerfile` na raiz, só para executar a aplicação compilada em contêiner" | "a hospedagem continua na Vercel e o banco no Supabase (decisões 0030 e NNNN)".
- `docs/plataforma/seguranca.md`, RS016, coluna Implementação, como no Quadro 35: "As chaves ficam em variáveis de ambiente da Vercel e no arquivo `.env.local`, ignorado pelo Git e excluído da imagem do contêiner pelo `.dockerignore`. A chave de serviço do Supabase existe somente no servidor, e nenhuma variável é exposta ao navegador."
- `docs/plataforma/CONTEXT.md`, linha de `infraestrutura.md`: "Ambientes, variáveis de ambiente, preparação do banco, publicação e CI" passa a "Ambientes, variáveis de ambiente, preparação do banco, publicação, CI e execução em contêiner".
- `docs/decisoes/CONTEXT.md`, linha nova no fim: `| [NNNN](NNNN-execucao-em-conteiner.md) | Docker para executar a aplicação em contêiner |`.

## Decisões técnicas

- Seguidas: 0001 (uma aplicação, um `package.json`), 0023 (Node.js 24: imagem `node:24`), 0029 (registros na saída padrão, que no contêiner aparecem no terminal do `docker compose up`), 0030 (hospedagem na Vercel, banco no Supabase), 0031 (estrutura ICM), 0024 e 0035 (sem teste automatizado fora de regras e esquemas), 0033 e 0034 (fluxo Git).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| NNNN – Docker para executar a aplicação em contêiner | execução apenas com o Node.js instalado em cada máquina; hospedagem em contêiner; construção da imagem no CI | exigência da disciplina; a aplicação roda da mesma forma em qualquer máquina com o Docker, e a publicação e o banco não mudam | nova, relacionada à 0030 (não a substitui: a 0030 descarta a hospedagem em contêineres, que continua descartada) |

**Número.** NNNN é o maior número de `docs/decisoes/` na `main` mais 1, no momento da gravação (etapa 03, `procedimentos/decisao.md`). Hoje a `main` vai até a 0037, mas o plano da #2, ainda não incorporado, propõe a 0038; se a #2 for incorporada antes, esta passa a 0039. Se as duas forem gravadas com o mesmo número, quem for incorporado depois renumera o seu registro antes do merge: nome do arquivo, `id`, título, linha do índice e citações em `infraestrutura.md` e `estrutura-de-pastas.md`.

**Texto do registro** (gravado na etapa 03, com a data da gravação):

```markdown
---
id: NNNN
titulo: Docker para executar a aplicação em contêiner
status: aceita
data: <aaaa-mm-dd>
origem: issue #6, plano memoria/tarefas/6-execucao-em-conteiner/01_plano.md
relacionados: [RNF015, RS016, 0023, 0030]
---

# NNNN – Docker para executar a aplicação em contêiner

## Decisão

A aplicação também é executada num contêiner Docker, para rodar da mesma forma em qualquer máquina com o Docker. O `Dockerfile` constrói a imagem em três estágios, a partir da imagem oficial do Node.js 24, com a saída standalone do Next.js, e a imagem final só tem o servidor compilado, executado por um usuário sem privilégios de administrador. O `.dockerignore` deixa os arquivos `.env*` fora da imagem, e o `compose.yaml` publica a aplicação em `http://localhost:3000` com as variáveis do `.env.local` lidas na execução. O contêiner não hospeda nada: a pré-visualização e a produção continuam na Vercel, o banco continua no Supabase, a imagem não é publicada em registro e o CI não a constrói. O desenvolvimento continua com `npm run dev`.

## Alternativa descartada

Execução apenas com o Node.js instalado em cada máquina. Também não se adotam a hospedagem em contêiner, já descartada na decisão 0030, nem a construção da imagem no CI.

## Justificativa

Exigência da disciplina: o contêiner garante o mesmo comportamento em qualquer máquina, independentemente do sistema operacional e da versão do Node.js instalada. Não substitui a decisão 0030, cuja alternativa descartada, "contêineres", é a hospedagem em contêineres, que continua descartada. Consequências aceitas: o `next.config.ts` passa a ter `output: "standalone"`, que na Vercel só acrescenta a pasta `.next/standalone/` ao build e desliga a otimização de estáticos imutáveis entre publicações; a imagem é construída sem variáveis de ambiente, então o código as lê na execução; e, como o CI não constrói a imagem, um erro no `Dockerfile` só aparece quando alguém executa o `docker compose up --build`.
```

Escolhas locais, sem registro:

- `node:24-slim` (Debian): a variante do exemplo oficial; usa glibc, como o CI (Ubuntu) e a Vercel. Fica na linha 24 sem fixar a versão menor, como o `node-version: 24` do CI e o `engines` `24.x`. Descartadas: Alpine (musl, diferente do CI e da Vercel) e versão exata (reprodutível, mas exige atualização manual).
- Usuário `node` da própria imagem; nomes dos estágios, `name: glow` e serviço `app`; sem `init`, `HEALTHCHECK` nem cache do npm entre builds (`--mount=type=cache`).

## Riscos e dúvidas

- Sem o Docker nesta máquina, o agente não executa o `Dockerfile` nem o `compose.yaml`. A simulação do estágio final (critérios 1 e 2) cobre o `next build` standalone e o `server.js`, não a sintaxe dos arquivos do Docker nem o `.dockerignore`; o teste manual do integrante com o Docker Desktop é a única verificação de ponta a ponta. Se ele falhar, a correção entra no mesmo PR (volta à etapa 02).
- Tag `node:24-slim` sem versão fixa: a versão menor do Node.js e a base Debian mudam com o tempo, como já acontece no CI e na Vercel.
- `.env.local` obrigatório: sem ele, o `docker compose up` para com erro. Nenhum integrante tem o arquivo ainda (`setup/questionario.md`, seção 6); para o teste manual basta copiar o `.env.example`, porque a aplicação ainda não usa os valores.
- Valores com `$` no `.env.local`: o Compose e o Next.js podem interpretá-los de forma diferente (substituição de variáveis). As variáveis da aplicação (endereços e chaves do Supabase) não costumam ter `$`; conferir quando o Supabase for ligado.
- Cookies `Secure` (RS007) com o contêiner em `http://localhost` e `NODE_ENV=production`: os navegadores os aceitam em `localhost`; a tarefa de autenticação confere também no contêiner.
- Em worktree, o Next.js pode adotar a pasta da cópia principal como raiz por achar dois `package-lock.json`, mudando o caminho dentro de `.next/standalone/`; por isso a simulação da etapa 02 é feita num clone limpo fora do repositório. No Docker o contexto tem um único `package-lock.json`.
- Conflitos com a #2: só `docs/decisoes/CONTEXT.md` e o número da decisão (ver "Arquivos").
- Ramificação `chore/6-docker`, criada na etapa 02 a partir da `main` atualizada (`procedimentos/git.md`); título do PR em Conventional Commits, como `chore: run the app in a Docker container`.

## Fora do escopo

- Publicação da imagem em registro de contêineres, hospedagem em contêiner, Supabase local em contêiner e construção da imagem no CI (issue).
- Desenvolvimento dentro do contêiner, com recarga a cada alteração (`docker compose watch` ou volumes).
- Atualização automática da imagem base pelo Dependabot, `HEALTHCHECK`, imagem para várias arquiteturas e desligamento da telemetria do Next.js.
- `workflows/procedimentos/deploy.md` e a decisão 0030, que não mudam.

## Acréscimo de escopo: instruções de uso do Docker (15/10/2026)

**Pedido.** Na etapa 03, o desenvolvedor pediu: "garanta que as instruções de uso do docker pra equipe e pra ia estao inclusos no sistema". Já entregue: o comando no `AGENTS.md`, no `README.md` e na seção 3 do questionário; a seção "Execução em contêiner" de `infraestrutura.md`, que diz o que é e qual comando roda; e a proibição de L4 em `guia/regras.md`. Falta o passo a passo da equipe e o procedimento da IA: quando testar no contêiner e como examinar a imagem sem expor as variáveis.

**Arquivos.** Dois fora do plano aprovado (`workflows/procedimentos/testes.md` e `guia/como-pedir.md`) e texto novo em dois do plano (`infraestrutura.md` e `README.md`). Em comum com a #2: `guia/como-pedir.md`, em que a #2 muda as linhas 15, 47 e 62 e esta tarefa acrescenta uma linha no fim da tabela "Outros pedidos" (trechos separados). A #2 não toca `workflows/procedimentos/testes.md`. A seção 6 do questionário fica como está, porque a #2 a reescreve.

**Textos propostos:**

- `docs/plataforma/infraestrutura.md`, "Execução em contêiner": o parágrafo final passa a ser este passo a passo, seguido do parágrafo atual sem a primeira frase:

  ```markdown
  Para usar:

  1. Instalar o Docker Desktop (Docker 29 e Compose 5) e deixá-lo aberto.
  2. Ter na pasta o `.env.local`, copiado do `.env.example` e preenchido (seção "Variáveis de ambiente"); sem ele, o Compose para com "env file ... not found".
  3. Rodar `docker compose up --build`: constrói a imagem com o código atual e sobe a aplicação em `http://localhost:3000`. Sem o `--build`, o Compose reaproveita a imagem anterior.
  4. Encerrar com `Ctrl+C` ou, se a aplicação subiu em segundo plano (`-d`), com `docker compose down`.

  A porta 3000 é a mesma do `npm run dev`: rode um de cada vez.
  ```

- `workflows/procedimentos/testes.md`, seção nova entre "Automatizados" e "Manuais":

  ````markdown
  ## Contêiner (Docker)

  Quando a tarefa muda o `Dockerfile`, o `.dockerignore`, o `compose.yaml`, o `next.config.ts`, as dependências ou a leitura de variáveis de ambiente, conferir também a aplicação compilada no contêiner (`docs/plataforma/infraestrutura.md`):

  ```
  docker compose up --build -d   constrói a imagem e sobe a aplicação em http://localhost:3000
  docker compose top             processos do contêiner, com o usuário (uid 1000, node)
  docker compose logs app        saída da aplicação
  docker compose down            encerra e remove o contêiner
  ```

  1. Com o contêiner no ar, conferir a página inicial e as rotas da tarefa.
  2. Para examinar a imagem por dentro, usar um contêiner novo, sem o `.env.local`: `docker run --rm --entrypoint sh glow-app -c "<comando>"`. Nunca `docker compose config`, `docker inspect`, `docker exec` nem `docker compose exec`, que mostram as variáveis (`guia/regras.md`).
  3. Sem o `.env.local`, o agente não o cria: pede ao desenvolvedor que copie o `.env.example`. Sem o Docker na máquina, o teste vira passo manual de um integrante que o tenha, registrado no plano.
  4. Registrar o resultado em `notas.md` e no relatório.
  ````

- `guia/como-pedir.md`, "Outros pedidos", linha nova no fim da tabela: `| Testar no contêiner | Crie o `.env.local` (cópia do `.env.example`) e peça: `Na #12, teste a aplicação no contêiner.` Para rodar você mesmo: `docker compose up --build` (passo a passo em `docs/plataforma/infraestrutura.md`). |`
- `README.md`, parágrafo do contêiner: "com o Docker instalado" passa a "com o Docker Desktop instalado", e o parágrafo termina com "Passo a passo em `docs/plataforma/infraestrutura.md`, seção "Execução em contêiner"."

**Fora deste acréscimo:** liberar os comandos do Docker no `allow` do `.claude/settings.json`, que só reduziria as confirmações; o `CODEOWNERS` e os modelos de PR, que a #2 altera.
