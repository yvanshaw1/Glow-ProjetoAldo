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
