---
id: 0003
titulo: Backend em camadas de rota, serviço e repositório
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: []
---

# 0003 – Backend em camadas de rota, serviço e repositório

## Decisão

Backend em camadas de rota, serviço e repositório.

## Alternativa descartada

Regras de negócio nas rotas ou nas páginas.

## Justificativa

Isola as regras em funções testáveis e deixa claro onde cada tipo de alteração deve ser feito, o que também orienta o uso da IA na codificação.
