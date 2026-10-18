# Notas: 3-lacunas-em-blocos

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-15 – descoberta

Issue #3 criada com o `gh`, com o texto aprovado pelo desenvolvedor na conversa (etiquetas `tipo:documentacao` e `area:cicd`). O formato novo das lacunas veio do plano da #1 (`memoria/tarefas/1-base-do-projeto/01_plano.md`, na ramificação da #1, ainda sem commit quando este plano foi gravado). `guia/como-pedir.md`, `workflows/01_planejar.md` e `guia/regras.md` não citam a tabela e ficam como estão. A #2 também altera `_templates/plano.md`, mas só o cabeçalho.

## 2026-10-18 – desvio

Plano refeito sobre a `main` atual (`2f5beee`). O primeiro, nunca commitado, está no worktree `.claude/worktrees/optimistic-bartik-2fb396` (parado em `a258ed5`, antes das #1, #2, #6 e #9), com `status: aprovado` por yvan em 18/10/2026 12:20; o worktree fica até o desenvolvedor decidir removê-lo. O texto novo do molde é o mesmo; mudaram o cabeçalho (`areas: [cicd]`, decisão 0039), a lista dos planos que já usam blocos (#1, #6 e #9; o da #2 usa a tabela), os riscos (a #2 foi incorporada; o PR #10 não tem arquivo em comum com esta tarefa) e o risco do `.docx`, que o PR #10 versiona em `documentos-formais/` (decisão 0040). Por isso este plano volta a `aguardando_aprovacao`. Ele está, sem commit, neste worktree (`.claude/worktrees/angry-dijkstra-1b028a`, ramificação `claude/angry-dijkstra-1b028a`, igual à `main` em `2f5beee`); na etapa 02 segue para a ramificação `docs/3-plan-gap-blocks`.

## 2026-10-18 – descoberta

Etapa 02 iniciada: plano `aprovado` por yvan em 18/10/2026 12:46, sem alteração no conteúdo; status `em_execucao`. Ramificação `docs/3-plan-gap-blocks` criada a partir de `origin/main` (`2f5beee`) com `--no-track`, neste mesmo worktree. Seção "Lacunas na documentação" de `_templates/plano.md` trocada; o trecho do molde, extraído por script, é idêntico ao bloco "Texto novo do molde" do plano (critério 1). A busca 1 não acha nada em `_templates/`, `guia/` e `workflows/` (critério 3). Os critérios 2 e 4 foram conferidos por leitura; nenhum outro arquivo mudou. O worktree não tinha `node_modules`: `npm ci` antes do `npm run check`.

## 2026-10-18 – descoberta

`npm run check` aprovado (Prettier, tipos, ESLint sem avisos; o Vitest sai com código 0 sem arquivos de teste). O `npm ci` avisa "deprecated eslint@9.39.5: This version is no longer supported": vem da `main` (decisão 0037), não desta tarefa, e não altera o `package-lock.json`. Se o desenvolvedor quiser tratar, vira outra issue `tipo:configuracao`.
