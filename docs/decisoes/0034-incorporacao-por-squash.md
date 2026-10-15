---
id: 0034
titulo: Incorporação por squash, com Closes #N
status: aceita
data: 2026-10-15
origem: Documentação de Desenvolvimento com IA, seções 7.3 e 7.4
---

# 0034 – Incorporação por squash, com Closes #N

## Decisão

Os pull requests são incorporados por squash; o título segue Conventional Commits, porque vira a mensagem do commit na `main`, e a descrição traz `Closes #N`.

## Alternativa descartada

Merge commit ou rebase merge.

## Justificativa

Cada tarefa corresponde a um único commit na `main`, o histórico fica legível, a issue é fechada automaticamente e a ramificação é removida pelo GitHub.
