# 04 Encerrar

Confirmar que a entrega chegou à produção e limpar o ambiente local. Esta etapa não grava nada no repositório.

## Entradas

| Item | Para quê |
|---|---|
| pull request incorporado | confirmação de que a tarefa entrou na `main` |
| `workflows/procedimentos/deploy.md` | conferência da publicação |
| `memoria/tarefas/<issue>-<nome>/02_relatorio.md` | o que deve ser conferido |

## Processo

1. Conferir a publicação em produção conforme `procedimentos/deploy.md`, nos fluxos citados no relatório.
2. Se a tarefa tinha migration, confirmar que ela foi aplicada (`procedimentos/migration.md`).
3. Conferir que a issue foi fechada pela referência no pull request e que a ramificação remota foi removida.
4. Atualizar a cópia local: `git switch main`, `git pull` e remoção da ramificação local da tarefa.

## Saídas

| Item | Estado |
|---|---|
| produção | conferida |
| issue | fechada |
| cópia local | na `main` atualizada |

Se a produção apresentar defeito, registrar uma issue `tipo:defeito` (`procedimentos/deploy.md` explica como republicar a versão anterior).
