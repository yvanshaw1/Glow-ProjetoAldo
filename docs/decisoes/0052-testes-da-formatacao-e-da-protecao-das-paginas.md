---
id: 0052
titulo: Testes automatizados das regras, dos esquemas, do tratamento único, do cliente da API, da formatação e da proteção das páginas
status: aceita
data: 2026-10-20
origem: issue #26, memoria/tarefas/26-telas-de-acesso/01_plano.md (Decisões técnicas)
relacionados: [RN035, RS014, RS017, RS018, 0035, 0050, 0051]
substitui: 0050
---

# 0052 – Testes automatizados das regras, dos esquemas, do tratamento único, do cliente da API, da formatação e da proteção das páginas

## Decisão

O Vitest testa as funções puras das regras de negócio, os esquemas de `src/shared/validation`, o tratamento único das requisições (`src/server/http`), o cliente da API das páginas (`src/lib/api-client.ts`) e também:

- as funções de exibição de `src/shared/format`, em `tests/format/`;
- a decisão de acesso às páginas (`src/server/auth/page-access.ts`), em `tests/auth/`.

Os testes são escritos antes do código. As telas, os componentes, o contexto da sessão e o `src/proxy.ts` inteiro continuam testados à mão.

## Alternativa descartada

Conferir os redirecionamentos e a máscara do telefone só à mão; testar o `proxy.ts` inteiro com `next/experimental/testing/server`.

## Justificativa

Os critérios da proteção das páginas são saídas de `decidePageAccess`, e a validação do parâmetro `next` impede o redirecionamento para outro site. As duas cabem em testes rápidos, sem servidor nem rede, como o cliente da API (0050). A formatação aplica a coluna Exibição de RN035, que as telas com telefone usam também como máscara.

O utilitário experimental do Next.js testaria também a ida ao Supabase, que depende de rede, e pode mudar entre versões. O que mudou desde a 0050: a #26 trouxe a primeira função de formatação e a primeira regra de navegação com saída verificável.
