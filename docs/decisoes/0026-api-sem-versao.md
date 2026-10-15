---
id: 0026
titulo: API sem versão no caminho, com mudanças aditivas
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: []
---

# 0026 – API sem versão no caminho, com mudanças aditivas

## Decisão

API sem versão no caminho, com mudanças aditivas.

## Alternativa descartada

Versionamento pelo caminho, como `/api/v1`.

## Justificativa

A API é interna e publicada junto com as páginas que a usam; mudanças aditivas evitam quebrar uma página aberta durante uma publicação, sem o custo de manter duas versões.
