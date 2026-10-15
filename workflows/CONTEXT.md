# Ciclo de uma tarefa

Toda tarefa percorre quatro etapas, com dois pontos de controle humano. Cada etapa tem um contrato com entradas, processo e saídas; leia só o contrato da etapa em que a tarefa está.

```
issue → 01 Planejar → [aprovação do plano] → 02 Construir → 03 Entregar → [CI, build e revisão] → 04 Encerrar
             ↑  ajustes no plano  |              |                  ↑   alterações pedidas   |
             └────────────────────┘              └── mudança de escopo volta ao 01 ──────────┘
```

| Etapa | Contrato | Produz |
|---|---|---|
| 01 Planejar | `01_planejar.md` | `memoria/tarefas/<issue>-<nome>/01_plano.md` com status `aguardando_aprovacao` |
| 02 Construir | `02_construir.md` | código e testes na ramificação da tarefa, `notas.md` |
| 03 Entregar | `03_entregar.md` | `02_relatorio.md`, docs atualizados, pull request com `Closes #<issue>` |
| 04 Encerrar | `04_encerrar.md` | produção conferida, cópia local da `main` atualizada |

## Pontos de controle

1. **Aprovação do plano**: o desenvolvedor lê `01_plano.md`, ajusta se quiser e muda o status para `aprovado`, com `aprovado_por` e `aprovado_em`. O agente nunca faz isso. Sem aprovação, nada de código.
2. **Revisão do pull request**: só incorpora com CI aprovado, build da Vercel concluído, ramificação atualizada e aprovação do responsável pela área.

## Status do plano

| Status | Significado | Quem altera |
|---|---|---|
| `aguardando_aprovacao` | Plano gravado, ou revisto após mudança de escopo | agente |
| `aprovado` | Construção autorizada | só o desenvolvedor |
| `em_execucao` | Construção em andamento | agente, a partir de `aprovado` |
| `concluido` | Entrega completa no pull request; vale na `main` quando ele é incorporado | agente, na etapa 03 |
| `cancelado` | Tarefa abandonada; motivo em `notas.md` | só o desenvolvedor |

## Quadro de tarefas (GitHub Projects)

O cartão da issue acompanha o ciclo. As colunas "A fazer", "Em revisão" e "Concluído" são movidas pela automação do quadro; as demais, pelo desenvolvedor. O agente não mexe no quadro.

| Coluna | Quando |
|---|---|
| A fazer | issue criada ou reaberta (automático) |
| Planejamento | etapa 01 em andamento |
| Aguardando aprovação | plano em `aguardando_aprovacao`, inclusive quando volta por mudança de escopo |
| Em construção | plano `aprovado`, etapa 02 |
| Em revisão | PR aberto com `Closes #<issue>` (automático), até a incorporação; ajustes pedidos na revisão não mudam a coluna |
| Concluído | PR incorporado e issue fechada pelo `Closes #<issue>` (automático) |

## Variações por tipo de tarefa

- Consulta: não percorre o ciclo.
- Trivial (`procedimentos/tarefa-trivial.md`): plano resumido aprovado na conversa, sem pasta de tarefa nem relatório; ramificação, PR, CI e revisão como sempre. Se um critério deixar de valer no meio do trabalho, passa ao ciclo completo.
- Correção de defeito: o plano começa por um teste que reproduz o defeito e falha antes da correção.
- Investigação (spike): o plano define a pergunta e um prazo curto; o protótipo não é incorporado, e a conclusão vira registro em `docs/decisoes/`, com a implementação planejada depois como funcionalidade.
- Alteração do banco: a migration vai no mesmo PR e é aplicada pelo integrante designado depois da aprovação e antes da incorporação (`procedimentos/migration.md`).
- Documentação: o plano indica só os módulos que mudam e o motivo.

Mudança de escopo durante a construção (arquivo fora do plano, dependência nova, mudança de banco ou de regra): parar, registrar em `notas.md`, atualizar o plano e devolvê-lo a `aguardando_aprovacao`.

## Procedimentos

`procedimentos/git.md` (ramificações, commits, atualização, conflitos) · `testes.md` · `pull-request.md` · `migration.md` · `deploy.md` · `decisao.md` (quando e como registrar uma decisão) · `tarefa-trivial.md` (critérios e ciclo reduzido).
