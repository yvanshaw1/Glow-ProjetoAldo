---
id: 0029
titulo: Registro estruturado na saída padrão, consultado na Vercel
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: []
---

# 0029 – Registro estruturado na saída padrão, consultado na Vercel

## Decisão

Registro estruturado na saída padrão, consultado na Vercel.

## Alternativa descartada

Serviço externo de registro e monitoramento.

## Justificativa

Permite localizar qualquer falha pelo `requestId` sem acrescentar um serviço à stack.
