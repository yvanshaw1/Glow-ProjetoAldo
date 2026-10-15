# 03 Entregar

Revisar o próprio trabalho, deixar a documentação e a memória da tarefa coerentes e abrir o pull request. Tudo o que precisa estar na `main` entra neste PR, porque depois da incorporação a `main` só muda por outro PR.

## Entradas

| Arquivo | Para quê |
|---|---|
| alterações da ramificação | o que será entregue |
| `memoria/tarefas/<issue>-<nome>/01_plano.md` e `notas.md` | escopo prometido e desvios |
| `workflows/procedimentos/pull-request.md` | título, descrição e checklist |
| `docs/plataforma/seguranca.md` | verificações de segurança |

## Processo

1. Revisar o diff contra o plano, `guia/regras.md` e o checklist de segurança; corrigir o que faltar.
2. Atualizar os módulos de `docs/` afetados, inclusive as lacunas decididas no plano ou em `notas.md`, e a especificação OpenAPI, se rotas mudaram; gravar as decisões aprovadas conforme `procedimentos/decisao.md`.
3. Gravar `02_relatorio.md` a partir do molde: o que foi feito, arquivos, testes executados, documentação alterada (com o que muda nos `.docx`) e pendências.
4. Mudar o status do plano para `concluido`.
5. Atualizar a ramificação com a `main` e executar `npm run check` de novo (`procedimentos/git.md`).
6. Fazer os commits e abrir o pull request conforme `procedimentos/pull-request.md`, com `Closes #<issue>` na descrição.

## Saídas

| Item | Estado |
|---|---|
| pull request | aberto e pronto para revisão |
| `02_relatorio.md` | gravado |
| `01_plano.md` | `concluido` |

Avança quando o CI e o build da Vercel passam e outro integrante, que não o autor, aprova. Alterações pedidas na revisão voltam à `02_construir.md`, com o status `em_execucao`, na mesma ramificação e na mesma pasta.

## Pare e pergunte se

- o diff contiver algo fora do plano;
- um item do checklist de segurança não puder ser atendido;
- surgir conflito de merge que não seja mecânico.
