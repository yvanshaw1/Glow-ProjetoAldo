---
id: 0008
titulo: Validação, formatação e mensagens compartilhadas em src/shared
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: []
---

# 0008 – Validação, formatação e mensagens compartilhadas em src/shared

## Decisão

Validação, formatação e mensagens compartilhadas em `src/shared`.

## Alternativa descartada

Validações, formatações e mensagens separadas no frontend e no backend.

## Justificativa

Os mesmos formatos e mensagens valem na página e no servidor, sem duplicação; o servidor continua sendo quem decide.
