# memoria/ – Artefatos das tarefas

Cada tarefa tem uma pasta própria, versionada junto com a ramificação dela. Qualquer sessão, do mesmo integrante no dia seguinte ou de outro, retoma o trabalho lendo esses arquivos, sem depender da conversa.

```
memoria/tarefas/<issue>-<nome-curto>/
├── 01_plano.md       plano, com o status no cabeçalho YAML
├── 02_relatorio.md   o que foi feito, arquivos, testes executados, pendências
└── notas.md          descobertas, dúvidas e decisões durante a tarefa
```

- Nome da pasta: número da issue e nome curto em português sem acento, como `42-edicao-de-agendamento`.
- Criação: copiar `_templates/plano.md` e `_templates/notas.md` para a pasta nova (o script `tools/new-task.mjs` fará isso quando existir). O relatório nasce na etapa 03, de `_templates/relatorio.md`.
- Status do plano e quem pode mudá-lo: `workflows/CONTEXT.md`. Só o desenvolvedor aprova.
- Para retomar uma tarefa: ler o cabeçalho do plano (status), depois `notas.md`, depois o resto do plano.

## O que não vai para cá

Segredos, dados pessoais reais, cópias de código ou de saídas longas de terminal. A pasta registra intenções, decisões e resultados, não o código, que está no diff.
