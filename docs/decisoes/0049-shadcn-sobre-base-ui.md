---
id: 0049
titulo: shadcn/ui sobre Base UI, com os pacotes só de CSS em devDependencies
status: aceita
data: 2026-10-19
origem: issue #25, memoria/tarefas/25-base-do-frontend/01_plano.md (Decisões técnicas)
relacionados: [RNF005, 0007, 0027]
---

# 0049 – shadcn/ui sobre Base UI, com os pacotes só de CSS em devDependencies

## Decisão

Os componentes do shadcn/ui são gerados sobre Base UI, com o preset Nova (`npx shadcn init --base base --preset nova`). Os formulários usam os componentes `Field` com o `Controller` do React Hook Form e o `zodResolver`, porque não há componente `form` para Base UI. Os pacotes que só servem ao CSS (`shadcn`, pelo `shadcn/tailwind.css`, e `tw-animate-css`) ficam em `devDependencies`, e as versões ficam fixas, sem `^`.

## Alternativa descartada

Radix (`--base radix`), o padrão anterior, com a propriedade `asChild` e o componente `form`; React Aria (`--base aria`); deixar os pacotes em `dependencies`, como a CLI grava.

## Justificativa

O Base UI é o padrão da CLI do shadcn desde julho de 2026, e a documentação do shadcn o mostra primeiro. Radix e React Aria continuam aceitos, e os componentes existem para os três. O Base UI está na versão 1.9 e é mantido pela equipe do MUI.

Consequências aceitas:

- a propriedade `render` substitui o `asChild`, e o TypeScript acusa o uso errado;
- o formulário é composto com `Field` e `Controller`;
- assistentes treinados antes tendem a escrever código de Radix, e `guia/regras.md` avisa.

Em `dependencies`, o pacote `shadcn`, que é a própria CLI, com babel, ts-morph e o SDK do MCP, reprova o passo de auditoria do CI (`npm audit --omit=dev --audit-level=high`, 7 falhas altas pela `braces`). Em `devDependencies`, a auditoria dá 0, e o CSS é lido só no build: a Vercel e o contêiner instalam as `devDependencies` para compilar.
