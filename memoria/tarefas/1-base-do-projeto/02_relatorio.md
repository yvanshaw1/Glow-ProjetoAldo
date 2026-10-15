---
issue: 1
pull_request: 5
---

# Relatório: Base do projeto: Next.js, ferramentas de qualidade e CI

## O que foi feito

A aplicação Next.js 16.4.1 roda na raiz do repositório, sem nenhuma funcionalidade: a página inicial provisória (`/`) mostra só o nome da empresa, em `pt-BR`. As ferramentas de qualidade estão configuradas, com TypeScript 6.0, ESLint 9 com a configuração do Next.js, Prettier e Vitest, e o `npm run check` executa formatação, tipos, lint e testes na ordem do CI. O fluxo `CI` roda, no job `check`, essas quatro etapas e o `npm audit` de produção a cada envio e a cada PR para a `main`. Os nomes das variáveis de ambiente estão no `.env.example`, sem valores, e o `.gitignore` cobre os arquivos com valores. Atende RNF014, RNF015 e RS016.

Desvios do plano, todos decididos pelo desenvolvedor e registrados em `notas.md`:

- `"type": "module"` no `package.json`, para o Vitest 5 carregar o `vitest.config.ts` sem aviso.
- O primeiro critério passa a admitir dois avisos do `npm ci` que não têm solução hoje: a descontinuação do ESLint 9 (`npm warn deprecated eslint@9.39.5`) e o resumo "5 high severity vulnerabilities", todas em dependências de desenvolvimento.
- O `.env.example` foi criado pelo desenvolvedor, porque as configurações globais do Claude Code dele não deixam o agente escrever `.env*`; o conteúdo foi conferido só por hash.

## Arquivos alterados

- `package.json` e `package-lock.json`: dependências, scripts (`dev`, `build`, `start`, `format`, `format:check`, `typecheck`, `lint`, `test` e `check`), `"type": "module"` e `engines.node` `24.x`.
- `tsconfig.json`, `next.config.ts` e `eslint.config.mjs`: do scaffold, com `agentRules: false`, `eslint-config-prettier` e as exclusões de `.claude/worktrees`.
- `prettier.config.mjs`, `.prettierignore` e `vitest.config.ts`: configuração padrão do Prettier sem os `.md`; Vitest com os aliases `@/` e `server-only` e `passWithNoTests` provisório (#4).
- `.gitignore`: completado com as entradas do scaffold e `.claude/worktrees/`.
- `.env.example`: os sete nomes de `infraestrutura.md`, sem valores.
- `.github/workflows/ci.yml`: fluxo `CI`, job `check`.
- `src/app/layout.tsx`, `src/app/globals.css` e `src/app/(portal)/page.tsx`: layout raiz em `pt-BR`, Tailwind CSS e página inicial provisória.
- `AGENTS.md`, `guia/regras.md`, `docs/padroes/codigo.md`, `docs/plataforma/estrutura-de-pastas.md`, `docs/plataforma/infraestrutura.md` e `docs/plataforma/visao-geral.md`: lacunas L1 a L5 e o nome do job.
- `docs/decisoes/0037-eslint-9.md` e `docs/decisoes/CONTEXT.md`: decisão 0037.
- `memoria/tarefas/1-base-do-projeto/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: aprovado no worktree e num clone limpo da ramificação, sem nenhum aviso; o `npm ci` do clone limpo mostrou só os dois avisos aceitos.
- `next build` local: gera `/` e `/_not-found`.
- Teste temporário, apagado em seguida: `import "server-only"` passa pelo alias do `vitest.config.ts`.
- Manual: `npm run dev` serviu `/` com status 200, `<html lang="pt-BR">`, título e `<h1>` "Glow – Estética Automotiva"; o `AGENTS.md` ficou igual depois do `next dev` (L5).
- `git check-ignore -v`: `.env.local` ignorado por `.env*`; `.env.example` liberado por `!.env.example`.
- Esqueleto: nenhum arquivo apagado em relação à `main`; continuam 112 `README.md`.
- Pré-visualização da Vercel e primeira execução do CI: conferidas no PR.

## Documentação atualizada

- Módulos: `AGENTS.md`, `guia/regras.md`, `docs/padroes/codigo.md`, `docs/plataforma/estrutura-de-pastas.md`, `docs/plataforma/infraestrutura.md` e `docs/plataforma/visao-geral.md`.
- Lacunas resolvidas:
  - L1, versão do ESLint → ESLint 9 → `AGENTS.md`, `guia/regras.md`, `visao-geral.md` e decisão 0037.
  - L2, `.env.example` → exceção para o agente → `AGENTS.md` e `guia/regras.md`.
  - L3, Prettier nos `.md` → só código e configuração → `codigo.md` e `estrutura-de-pastas.md`.
  - L4, Tailwind CSS sem PostCSS → seguir o scaffold → `estrutura-de-pastas.md`.
  - L5, `next dev` reescrevendo o `AGENTS.md` → `agentRules: false` → `guia/regras.md`.
- Decisões: 0037 criada.
- Documentos formais a atualizar:
  - Documentação de Arquitetura de Software, seção 2 (stack): ESLint 9 em vez de 10.
  - Documentação de Arquitetura de Software, seção 2.4 (padrões de código): Prettier só em código e configuração, sem os `.md`.
  - Documentação de Arquitetura de Software, seções 3.1 e 4.1 (estrutura de pastas): raiz sem `postcss.config.mjs` e com `.prettierignore`.
  - Documentação de Arquitetura de Software, seção 8 (CI): `next typegen` antes do `tsc --noEmit`; job `check` como check obrigatório da `main`.
  - Documentação de Arquitetura de Software, seção 9 (Quadro 38): decisão 0037.
  - Documentação de Desenvolvimento com IA, regras da IA: exceção do `.env.example`, documentação do Next.js em `node_modules/next/dist/docs/` e ESLint 9 na stack.

## Pendências

- #4: remover o `passWithNoTests` do `vitest.config.ts` quando existir o primeiro teste.
- Fase 2 da proteção da `main`: o desenvolvedor acrescenta o check `check` ao ruleset depois da primeira execução do CI neste PR, antes de incorporá-lo.
- Revisor do PR: a seção 2 de `setup/questionario.md` ainda está pendente; a #2 propõe que qualquer outro integrante aprove.
- Dependências de desenvolvimento: 5 vulnerabilidades altas na cadeia `eslint-config-next` → `braces`, sem versão corrigida; acompanhar nas atualizações do Next.js, junto com a volta ao ESLint 10 (decisão 0037).
