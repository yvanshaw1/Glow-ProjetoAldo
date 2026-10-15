# Notas: 1-base-do-projeto

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-15 – dúvida

Revisor de CI/CD pendente. A rota "CI/CD e configuração" de `guia/CONTEXT.md` exige a revisão do responsável por CI/CD, mas a seção 2 de `setup/questionario.md` (áreas e responsáveis) ainda está **pendente** e está sendo respondida em outra sessão. O `CODEOWNERS` continua comentado. Antes de pedir a revisão do PR (etapa 03), conferir quem responde por CI/CD; esta tarefa não altera o `CODEOWNERS`.

## 2026-10-15 – descoberta

Conferências feitas no planejamento, em pasta temporária fora do repositório: o create-next-app 16.4.1 instala TypeScript `^5`, ESLint `^9` e `@types/node` `^20`; integra o Tailwind CSS 4 pelo `@tailwindcss/turbopack`, sem `postcss.config.mjs`; gera `AGENTS.md` (o `next dev` também o regrava ao detectar um assistente de IA, opção `agentRules`). Com TypeScript 6.0.3, `next typegen && tsc --noEmit` passa no scaffold. Com ESLint 10.12, o `npm ci` emite avisos de dependência par (lacuna L1 do plano). O `prettier --check .` acusa 101 dos 279 `.md` (lacuna L3). Versões no npm em 15/10/2026: TypeScript `latest` 7.0.2 (6.0.3 na linha 6), ESLint 10.12.0 (9.39.5 na linha 9), Prettier 3.9.10, Vitest 5.0.4, Vite 8.3.4, `actions/checkout` v7 e `actions/setup-node` v7.

## 2026-10-15 – decisão

A ramificação `chore/1-project-base` não foi criada na etapa 01: o contrato `workflows/01_planejar.md` não a prevê, e o `02_construir.md` a cria no passo 2. O plano e estas notas estão, sem commit, no worktree `.claude/worktrees/issue-1-base-759082` (ramificação `claude/issue-1-base-759082`, igual à `main` em a258ed5); na etapa 02 eles seguem para a ramificação da tarefa.

## 2026-10-15 – desvio

Etapa 02 iniciada: plano `aprovado` (opção 1 em L1 a L5), status `em_execucao`, ramificação `chore/1-project-base` criada a partir da `main` (a258ed5). Scaffold gerado com o comando do plano; com `--no-agents-md` ele não traz `AGENTS.md`.

## 2026-10-15 – dúvida

O `.env.example` não pôde ser criado: as configurações globais do Claude Code do desenvolvedor (`~/.claude/settings.json`, fora do repositório) negam `Read(**/.env.*)`, o que também bloqueia a escrita. A regra é do desenvolvedor e não foi contornada. Opções: 1. o desenvolvedor cria o arquivo com as sete linhas da seção "Configuração" do plano (recomendada); 2. o desenvolvedor troca a negação global por padrões que não cubram o `.env.example`.

## 2026-10-15 – dúvida

O ESLint 9 está descontinuado: o npm marca toda a linha 9.x como "no longer supported", e o `npm ci` limpo imprime `npm warn deprecated eslint@9.39.5`, o que esbarra no primeiro critério ("sem erros nem avisos"). O ESLint 10 continua com avisos de dependência par, e os `overrides` do npm não os eliminam (testado). Não há combinação sem aviso hoje. Opções: 1. manter o ESLint 9.39.5, admitir esse aviso no critério e registrar na decisão 0037 que a linha 9 já não tem suporte (recomendada: é a combinação que o Next.js 16.4 instala e testa); 2. ESLint 10.12 com os avisos de dependência par, sem a decisão 0037 e sem mudar a documentação, que já diz 10, aceitando o risco de regras dos plugins falharem.

## 2026-10-15 – dúvida

O `npm ci` também imprime "5 high severity vulnerabilities". São todas de desenvolvimento, na cadeia `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces` (GHSA-vfj7-8cjw-p6xm, `braces` até 3.0.3, e a 3.0.3 é a última versão publicada: não há correção). O `npm audit --omit=dev --audit-level=high` do CI dá zero e passa. Opções: 1. aceitar o resumo, que não é aviso do npm nem afeta produção, e registrar no relatório (recomendada); 2. `npm ci --no-audit` no CI para limpar o log, mantendo a etapa de audit de produção.

## 2026-10-15 – dúvida

O Vitest 5 (Vite 8) imprime um aviso ao carregar o `vitest.config.ts`: sintaxe ESM num pacote tratado como CommonJS. Opções: 1. `"type": "module"` no `package.json` (recomendada; testado: `npm run check` sem avisos e `next build` gera a rota `/`); 2. renomear para `vitest.config.mts` e atualizar a árvore de `estrutura-de-pastas.md`. A opção 1 está aplicada, sem commit, até a resposta.

## 2026-10-15 – decisão

O desenvolvedor respondeu na conversa as quatro dúvidas acima, todas pela opção recomendada: (1) o desenvolvedor cria o `.env.example`; (2) ESLint 9.39.5 mantido, e o primeiro critério passa a admitir o aviso `npm warn deprecated eslint@9.39.5`; a decisão 0037, gravada na etapa 03, registra que a linha 9 já não tem suporte; (3) o resumo "5 high severity vulnerabilities" das dependências de desenvolvimento é aceito e vai para o relatório como conhecido e sem correção; (4) `"type": "module"` no `package.json`. Nenhuma delas acrescenta arquivo, dependência ou regra ao plano, que segue `em_execucao`.
