---
id: 0045
titulo: Testes automatizados das regras, dos esquemas e do tratamento único das requisições
status: substituída por 0050
data: 2026-10-19
origem: issue #22, memoria/tarefas/22-base-do-servidor/01_plano.md (L1)
relacionados: [RS014, RS017, RS018, 0024, 0035]
substitui: 0024
---

# 0045 – Testes automatizados das regras, dos esquemas e do tratamento único das requisições

## Decisão

O Vitest testa as funções puras das regras de negócio, os esquemas de `src/shared/validation` e o tratamento único das requisições (`src/server/http`), este com `Request` e `Response` padrão, sem servidor, banco ou rede. Os fluxos de tela continuam testados à mão na pré-visualização.

## Alternativa descartada

Testes só das regras e dos esquemas, com o tratamento único conferido à mão; testes de interface de ponta a ponta; testes com o banco.

## Justificativa

O tratamento único é usado por todas as rotas e concentra RS014, RS017 e RS018: uma regressão nele aparece em todas as rotas ao mesmo tempo, e conferir à mão a cada mudança a recusa por formato, tamanho e origem e o registro sem dados sensíveis não é viável. Como não depende de servidor, banco ou rede, os testes são rápidos e independentes como os das regras. Os testes de ponta a ponta continuam fora pelo motivo da 0024: os fluxos de tela são verificados à mão.
