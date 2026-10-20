---
id: 0050
titulo: Testes automatizados das regras, dos esquemas, do tratamento único e do cliente da API
status: aceita
data: 2026-10-19
origem: issue #25, memoria/tarefas/25-base-do-frontend/01_plano.md (Decisões técnicas)
relacionados: [RS014, RS017, RS018, 0035, 0045]
substitui: 0045
---

# 0050 – Testes automatizados das regras, dos esquemas, do tratamento único e do cliente da API

## Decisão

O Vitest testa as funções puras das regras de negócio, os esquemas de `src/shared/validation`, o tratamento único das requisições (`src/server/http`) e o cliente da API das páginas (`src/lib/api-client.ts`). O cliente é testado com `fetch` e `location` simulados por `vi.stubGlobal`, sem servidor, navegador ou rede, e os testes são escritos antes do código. Os fluxos de tela, os componentes e o contexto da sessão continuam testados à mão na pré-visualização.

## Alternativa descartada

Conferir os redirecionamentos do cliente à mão, com uma página temporária; testes de componentes com jsdom e Testing Library; testes de ponta a ponta.

## Justificativa

Todas as telas usam o `api-client`, como todas as rotas usam o tratamento único (0045): uma regressão no 401 ou no 403 de troca de senha aparece em todas ao mesmo tempo.

Na #25, nenhuma tela chama uma rota que responda esses códigos, porque a carga da sessão não redireciona; sem o teste, o critério da issue não teria verificação.

O teste roda no ambiente `node` do Vitest, sem dependência nova. Testes de componentes exigiriam jsdom e Testing Library e mudariam mais a 0045.
