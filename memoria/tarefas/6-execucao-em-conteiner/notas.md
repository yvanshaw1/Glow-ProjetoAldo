# Notas: 6-execucao-em-conteiner

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-15 – descoberta

Conferências do planejamento, no Next.js 16.4.1 instalado: a saída standalone é uma etapa extra no fim do `next build` (`writeStandaloneDirectory` em `build/index.js`), depois do aviso aos adaptadores, e copia `.env` e `.env.production` para `.next/standalone/` quando existem no build; com standalone, `server/config.js` desliga `supportsImmutableAssets` e `server/next.js` faz o `next start` imprimir um aviso. O `server.js` gerado escuta em `process.env.HOSTNAME || '0.0.0.0'` e o servidor trata `SIGINT` e `SIGTERM`. O exemplo oficial `with-docker` (lido no GitHub) usa `node:24-slim`, três estágios, `USER node` e `HOSTNAME=0.0.0.0`. O `package-lock.json` tem os binários Linux `gnu` e `musl`, x64 e arm64. Os trechos dos `.docx` (Arquitetura 2.2, 3.1, 7, 8, 8.6 e 9; Desenvolvimento com IA 3, 6.1 e 9) foram extraídos para conferência, fora do repositório.

## 2026-10-15 – decisão

A ramificação `chore/6-docker` não foi criada na etapa 01: o `01_planejar.md` não a prevê, e o `02_construir.md` a cria no passo 2. O plano e estas notas estão, sem commit, no worktree `.claude/worktrees/issue-1-base-759082` (ramificação `claude/issue-6-docker-c13f9c`, igual à `main` em 8eee74c); na etapa 02 eles seguem para a ramificação da tarefa. Esta máquina não tem o Docker: os critérios 1 e 2 dependem do teste manual de um integrante com o Docker Desktop.
