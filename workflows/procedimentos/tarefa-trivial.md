# Procedimento: tarefa trivial

Ciclo reduzido para alterações mínimas. A aprovação continua obrigatória; o que muda é a forma: o plano é resumido e aprovado na conversa, sem arquivo.

## Critérios

Uma tarefa só é trivial se cumprir **todos**; se falhar um, segue o ciclo completo a partir de `workflows/01_planejar.md`:

- altera no máximo um arquivo de código, sem contar os testes;
- não toca regra de negócio, banco, autenticação, autorização nem validação;
- não exige dependência nova nem muda versão de dependência;
- não muda nada descrito em `docs/`: rotas, campos da API, mensagens do catálogo de erros, rótulos de status, nomes do glossário, formatos, tamanhos de página;
- pode ser desfeita sem efeito sobre dados.

| É trivial | Não é trivial (e por quê) |
|---|---|
| trocar o texto fixo de um botão ou de um título em uma página | mudar uma mensagem do catálogo de erros (está em `docs/padroes/api.md`) |
| corrigir um erro de digitação em texto da interface | mudar o rótulo de um status, como "Em espera" (nome da análise e do glossário) |
| ajustar espaçamento ou cor de um componente com as variáveis do tema | acrescentar um campo a um formulário (validação e API) |
| renomear uma variável interna dentro de um arquivo | mudar a quantidade de itens por página (`docs/padroes/api.md`) |
| remover uma importação ou um código sem uso em um arquivo | atualizar a versão de uma dependência |
| corrigir um comentário | qualquer alteração em dois ou mais arquivos de código |

## Fluxo

1. **Issue**: obrigatória, porque a ramificação e o `Closes #<issue>` dependem do número.
2. **Classificação**: o agente confere os critérios um a um e responde com o plano resumido: o que muda, o arquivo, como verificar e por que cada critério é atendido. Se um critério falhar, diz qual e segue o ciclo completo.
3. **Aprovação**: o desenvolvedor aprova na conversa. Sem essa aprovação explícita, nada é alterado.
4. **Execução**: ramificação, alteração, `npm run check`, commit e pull request (`git.md` e `pull-request.md`). Não há pasta em `memoria/tarefas/` nem `02_relatorio.md`: a descrição do PR diz o que mudou e registra "tarefa trivial aprovada na conversa".
5. **Revisão e encerramento**: iguais aos de qualquer PR, inclusive a conferência em produção (`workflows/04_encerrar.md`).

## Se deixar de ser trivial

Se, durante o trabalho, um critério deixar de valer (um segundo arquivo, uma regra, algo descrito em `docs/`), o agente para, explica ao desenvolvedor qual critério falhou e segue pelo ciclo completo a partir da etapa 01, criando a pasta da tarefa. O que já foi feito entra no plano como ponto de partida; nada é entregue como trivial.
