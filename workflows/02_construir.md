# 02 Construir

Implementar exatamente o plano aprovado, com os testes primeiro.

## Entradas

| Arquivo | Para quê |
|---|---|
| `memoria/tarefas/<issue>-<nome>/01_plano.md` | escopo, arquivos, testes e critérios; o status precisa ser `aprovado` |
| `memoria/tarefas/<issue>-<nome>/notas.md` | descobertas de sessões anteriores |
| `docs/padroes/<área>.md` e `codigo.md` | como programar |
| módulos de `docs/` citados no plano | regras e contratos a cumprir |
| `workflows/procedimentos/git.md` e `testes.md` | ramificação, commits e testes |

## Processo

1. Conferir o status `aprovado`; sem ele, parar. Mudar para `em_execucao`.
2. Criar ou atualizar a ramificação da tarefa (`procedimentos/git.md`).
3. Escrever os testes previstos com os valores esperados tirados da análise e confirmar que falham.
4. Escrever o mínimo de código para os testes passarem; depois melhorar o código com os testes passando.
5. Implementar o restante do escopo, só nos arquivos do plano, seguindo os padrões e o README de cada pasta; se a tarefa mudar a função de uma pasta, atualizar o README dela.
6. Executar `npm run check` até passar sem erros nem avisos novos.
7. Fazer commits pequenos, um por mudança lógica.
8. Registrar em `notas.md` desvios, descobertas e decisões tomadas.

## Saídas

| Item | Estado |
|---|---|
| código e testes na ramificação da tarefa | `npm run check` aprovado |
| `notas.md` | atualizado |

Avança para `03_entregar.md` quando todo o plano estiver implementado e verificado.

## Pare e pergunte se

- for preciso alterar arquivo fora do plano, criar dependência ou mudar banco ou regra: registrar em `notas.md`, atualizar o plano e devolvê-lo a `aguardando_aprovacao`;
- um teste falhar por causa que não pertence à tarefa;
- a documentação não definir o que o código precisa decidir, como o valor esperado de um teste: registrar a lacuna em `notas.md` com opções, texto proposto e arquivo de destino (`guia/regras.md`);
- surgir uma escolha técnica fora do plano que mereça registro, ou que contrarie uma decisão: propor em `notas.md` (`procedimentos/decisao.md`) e esperar a aprovação.
