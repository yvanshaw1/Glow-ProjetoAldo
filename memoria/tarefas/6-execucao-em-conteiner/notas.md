# Notas: 6-execucao-em-conteiner

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-15 – descoberta

Conferências do planejamento, no Next.js 16.4.1 instalado: a saída standalone é uma etapa extra no fim do `next build` (`writeStandaloneDirectory` em `build/index.js`), depois do aviso aos adaptadores, e copia `.env` e `.env.production` para `.next/standalone/` quando existem no build; com standalone, `server/config.js` desliga `supportsImmutableAssets` e `server/next.js` faz o `next start` imprimir um aviso. O `server.js` gerado escuta em `process.env.HOSTNAME || '0.0.0.0'` e o servidor trata `SIGINT` e `SIGTERM`. O exemplo oficial `with-docker` (lido no GitHub) usa `node:24-slim`, três estágios, `USER node` e `HOSTNAME=0.0.0.0`. O `package-lock.json` tem os binários Linux `gnu` e `musl`, x64 e arm64. Os trechos dos `.docx` (Arquitetura 2.2, 3.1, 7, 8, 8.6 e 9; Desenvolvimento com IA 3, 6.1 e 9) foram extraídos para conferência, fora do repositório.

## 2026-10-15 – decisão

A ramificação `chore/6-docker` não foi criada na etapa 01: o `01_planejar.md` não a prevê, e o `02_construir.md` a cria no passo 2. O plano e estas notas estão, sem commit, no worktree `.claude/worktrees/issue-1-base-759082` (ramificação `claude/issue-6-docker-c13f9c`, igual à `main` em 8eee74c); na etapa 02 eles seguem para a ramificação da tarefa. Esta máquina não tem o Docker: os critérios 1 e 2 dependem do teste manual de um integrante com o Docker Desktop.

## 2026-10-15 – decisão

Etapa 02 iniciada: plano `aprovado` por yvan (opção 1 em L1 a L4), status `em_execucao`, ramificação `chore/6-docker` criada a partir de `origin/main` (8eee74c) com `--no-track`, porque a `main` está em uso pela cópia principal e não pode ser trocada neste worktree. Os módulos citam a decisão como 0038, o próximo número livre na `main` hoje; a #2 também propõe a 0038 e ainda não foi construída. Se a #2 for incorporada antes, na etapa 03 esta passa a 0039 em `infraestrutura.md`, `estrutura-de-pastas.md`, no registro e no índice.

## 2026-10-15 – descoberta

O Prettier formata o `compose.yaml` (aprovado no `npm run check`) e não tem formatador para o `Dockerfile` nem para o `.dockerignore` (`--file-info` sem parser). `npm run dev` no worktree: `/` com status 200, `lang="pt-BR"`, título e `<h1>` corretos; o `AGENTS.md` manteve o hash `58c62de` antes e depois. A busca do critério 5 acha "Docker"/"contêiner" só nos arquivos do plano e na 0030, que continua igual. Para rodar os servidores de verificação foi criado um `.claude/launch.json` temporário, sem commit, apagado no fim.

## 2026-10-15 – descoberta

Simulação do estágio final, sem o Docker, num clone limpo de `chore/6-docker` (85b82d7) em pasta temporária de caminho curto, apagada depois: `npm ci` só com o resumo de audit já aceito na #1; `npm run build` gera `/` e `/_not-found` e a `.next/standalone/` (32 MB, `server.js` na raiz, sem `public/` nem `.next/static/`); depois de copiar as duas pastas como o `Dockerfile` faz, `find` não acha `.env*` nem `.git` na standalone, e o `server.js` (`PORT` e `HOSTNAME` pelo ambiente) serve `/` com 200, `<h1>` e estáticos com 200, e 404 numa rota inexistente. `npm run check` aprovado no clone e `git status` vazio depois do build. O build avisou que ignorou um `package-lock.json` em `C:\Users\yvans`, fora do repositório; não tem relação com a tarefa e não existe no contêiner. Não verificados aqui, por falta do Docker: a sintaxe do `Dockerfile` e do `compose.yaml`, o `.dockerignore` e o usuário `node` (critérios 1 e 2, teste manual).

## 2026-10-15 – desvio

O desenvolvedor instalou o Docker Desktop nesta máquina (por usuário, em `AppData\Local\Programs\DockerDesktop\resources\bin`, fora do PATH das sessões abertas antes da instalação). Os testes dos critérios 1 e 2 previstos como manuais foram feitos pelo agente, sem `docker exec`, `docker inspect` nem `docker compose config` (L4): só a imagem, construída sem variáveis, foi examinada por dentro. Nenhum arquivo do plano mudou.

## 2026-10-15 – descoberta

Docker 29.8.2 e Compose 5.6.0. `docker build` da ramificação (0c39488) a partir de `node:24-slim` (Node.js 24.22.0): contexto de 22,6 kB, mesmo com `node_modules`, `.next` e `.claude` no worktree (L1); o estágio `builder` não tem `.env*`, `.git` nem `.claude`. O `npm ci` da imagem avisa que o script de instalação do `unrs-resolver` (dependência do ESLint, só de desenvolvimento) não está liberado pelo `allowScripts` do npm 11.19, e o `next build` avisa da telemetria; nenhum dos dois afeta a imagem. Imagem final com 61 MB de camadas próprias (standalone com 60 MB). Contêiner com `-p 3000:3000`: `/` com 200, `lang="pt-BR"`, título e `<h1>` corretos, CSS e scripts com 200 e 404 numa rota inexistente; `docker top` mostra o `next-server` com uid 1000; `docker stop` encerra em 0,6 s (o `SIGTERM` é tratado). Na imagem, `find / -xdev` não acha `.env*`, `.git` nem `.claude`, `id` dá `node`, e a configuração tem `User=node` e `Cmd=[node server.js]`. Sem `.env.local`, o `docker compose up --build` para com "env file ... not found". Falta o `docker compose up --build` com o `.env.local`, que só o desenvolvedor pode criar.

## 2026-10-15 – descoberta

Critério 1 pelo Compose: o desenvolvedor criou o `.env.local` no worktree, copiando o `.env.example` (o agente só conferiu que ele existe e é ignorado pelo Git). `docker compose up --build -d` construiu a imagem `glow-app` e subiu `glow-app-1` em `0.0.0.0:3000`; `/` com 200, `lang="pt-BR"`, título e `<h1>` corretos, os sete estáticos com 200; `docker compose top` mostra o `next-server` com uid 1000; `docker compose down` remove contêiner e rede em cerca de 1 s. Imagens de teste do agente apagadas; ficam a `glow-app` do Compose e o `.env.local` do desenvolvedor no worktree. Com isso, os critérios 1, 2 e 4 estão verificados nesta máquina; o 3 depende dos checks do PR e o 5 foi conferido pela busca.
