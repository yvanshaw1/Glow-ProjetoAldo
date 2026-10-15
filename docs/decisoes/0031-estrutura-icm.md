---
id: 0031
titulo: Orientação da IA pela estrutura de pastas da ICM
status: aceita
data: 2026-10-15
origem: Documentação de Desenvolvimento com IA, seções 2 e 3
---

# 0031 – Orientação da IA pela estrutura de pastas da ICM

## Decisão

A IA é orientada pela estrutura de pastas da Interpretable Context Methodology: `AGENTS.md` (identidade), `guia/` (roteamento e regras), `workflows/` (contratos das etapas), `docs/` (referências em módulos) e `memoria/` (artefatos de cada tarefa).

## Alternativa descartada

Instruções em um único arquivo extenso ou em prompts avulsos, repetidos a cada conversa.

## Justificativa

Cada etapa carrega só o contexto de que precisa, de 2 mil a 8 mil tokens, contra 30 mil a 50 mil de um prompt único (VAN CLIEF; MCDERMOTT, 2026); as regras ficam versionadas e revisáveis, e qualquer assistente que leia o `AGENTS.md` segue a mesma estrutura.
