---
id: 0037
titulo: ESLint 9 com a configuração do Next.js
status: aceita
data: 2026-10-15
origem: issue #1, plano memoria/tarefas/1-base-do-projeto/01_plano.md (lacuna L1)
relacionados: [RNF014, 0023, 0028]
---

# 0037 – ESLint 9 com a configuração do Next.js

## Decisão

A análise estática usa o ESLint 9 (linha 9.39) com a configuração do Next.js (`eslint-config-next`, regras `core-web-vitals` e `typescript`), até essa configuração aceitar o ESLint 10.

## Alternativa descartada

ESLint 10 com a configuração do Next.js, convivendo com os avisos de dependência par do npm; ou ESLint 10 sem a configuração do Next.js.

## Justificativa

O `eslint-config-next@16.4.1` depende de `eslint-plugin-react`, `eslint-plugin-import` e `eslint-plugin-jsx-a11y`, que só aceitam ESLint até o 9, e o create-next-app 16.4.1 instala o ESLint 9; com o 10, o `npm ci` emite avisos de dependência par que os `overrides` do npm não eliminam, e as regras desses plugins podem falhar. Sem a configuração do Next.js, perdem-se as regras que `docs/padroes/codigo.md` exige. É o mesmo motivo da decisão 0023: ferramenta da stack sem suporte à versão nova.

Consequências aceitas: a linha 9 do ESLint já não tem suporte, e o `npm ci` imprime `npm warn deprecated eslint@9.39.5`, admitido no primeiro critério da issue #1; a escolha é revista a cada atualização do Next.js, e a troca pelo ESLint 10 é feita por um registro que substitui este.
