---
id: 0032
titulo: Proteção das páginas em src/proxy.ts
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 3.2
---

# 0032 – Proteção das páginas em src/proxy.ts

## Decisão

As páginas restritas são protegidas pelo arquivo `src/proxy.ts`, convenção do Next.js 16.

## Alternativa descartada

Arquivo `middleware.ts`.

## Justificativa

No Next.js 16, a convenção `middleware` foi depreciada e renomeada para `proxy`, que é executado no runtime Node.js. Assistentes treinados em versões anteriores tendem a criar `middleware.ts`: não usar. Com a pasta `src/`, o arquivo fica em `src/proxy.ts`, no mesmo nível de `app/`.
