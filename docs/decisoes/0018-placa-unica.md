---
id: 0018
titulo: Placa única, com vínculo entre clientes e veículos
status: aceita
data: 2026-10-15
origem: Documentação de Arquitetura de Software, seção 9 (Quadro 38)
relacionados: [RN036]
---

# 0018 – Placa única, com vínculo entre clientes e veículos

## Decisão

Placa única, com vínculo entre clientes e veículos.

## Alternativa descartada

Um registro de veículo para cada cliente.

## Justificativa

Um mesmo carro nunca tem dois cadastros diferentes; o cadastro de uma placa existente apenas cria o vínculo, e o histórico do veículo é preservado na troca de proprietário (RN036).
