---
id: 0009
titulo: Controle de concorrência otimista por updated_at
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: [RNF011]
---

# 0009 – Controle de concorrência otimista por updated_at

## Decisão

Controle de concorrência otimista por `updated_at`.

## Alternativa descartada

Última gravação prevalece, ou bloqueio do registro durante a edição.

## Justificativa

Impede que uma edição apague a de outro funcionário sem exigir bloqueios; a verificação é feita pelo banco, na própria gravação (RNF011).
