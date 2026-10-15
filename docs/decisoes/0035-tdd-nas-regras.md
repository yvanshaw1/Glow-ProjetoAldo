---
id: 0035
titulo: TDD nas regras de negócio e nos esquemas de validação
status: aceita
data: 2026-10-15
origem: Documentação de Desenvolvimento com IA, seção 8.1
---

# 0035 – TDD nas regras de negócio e nos esquemas de validação

## Decisão

As funções puras de regra de negócio e os esquemas de validação são desenvolvidos com TDD: testes que falham primeiro, código mínimo depois, refatoração com os testes passando.

## Alternativa descartada

Testes escritos depois do código.

## Justificativa

Os testes, curtos e comparáveis à análise, viram a especificação que o código gerado pela IA precisa cumprir; o desenvolvedor confere primeiro os testes e só depois a implementação (BECK, 2010).
