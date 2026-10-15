---
id: 0006
titulo: Acesso a dados com supabase-js e uma migration em SQL
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: []
---

# 0006 – Acesso a dados com supabase-js e uma migration em SQL

## Decisão

Acesso a dados com `supabase-js` e uma migration em SQL.

## Alternativa descartada

Biblioteca de mapeamento objeto-relacional.

## Justificativa

Evita mais uma dependência e mais uma camada de configuração; o esquema do MVP é pequeno e estável.
