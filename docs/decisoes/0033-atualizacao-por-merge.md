---
id: 0033
titulo: Atualização das ramificações por merge, sem rebase
status: aceita
data: 2026-10-15
origem: Documentação de Desenvolvimento com IA, seção 7.3
---

# 0033 – Atualização das ramificações por merge, sem rebase

## Decisão

As ramificações são atualizadas com `git merge origin/main`; a equipe não usa rebase nem envio forçado, e um commit já enviado nunca é alterado.

## Alternativa descartada

Rebase da ramificação sobre a `main` seguido de `git push --force-with-lease`.

## Justificativa

A incorporação por squash já mantém linear o histórico da `main`; o merge evita reescrever o histórico e dispensa o envio forçado, que também é bloqueado para o agente em `.claude/settings.json`.
