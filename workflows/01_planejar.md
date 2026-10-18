# 01 Planejar

Transformar a issue em um plano que o desenvolvedor possa aprovar. Esta etapa não altera código.

## Entradas

| Arquivo | Para quê |
|---|---|
| issue da tarefa | objetivo, requisitos citados e critérios de aceitação (Dado, Quando, Então) |
| `guia/CONTEXT.md` | o que ler para o tipo de tarefa |
| `docs/<assunto>/` (pela rota) | caso de uso, regras citadas, `dados.md`, `rotas.md` |
| `codigo.md` e `docs/padroes/<área>.md` de cada área que a tarefa toca | como programar nessas áreas |
| `docs/decisoes/CONTEXT.md` e os registros que tocam a tarefa | o que já foi decidido e por quê |
| `workflows/procedimentos/decisao.md` | quando a tarefa envolve escolha técnica |
| `README.md` das pastas de destino em `src/`, `supabase/` e `tests/` | o que vai e o que não vai em cada pasta |
| `_templates/plano.md` | molde do plano |

## Processo

1. Criar a pasta `memoria/tarefas/<issue>-<nome-curto>/` com `01_plano.md` e `notas.md` a partir dos moldes.
2. Resumir o objetivo e citar os identificadores envolvidos (RF, RN, RS, UC).
3. Conferir se a documentação cobre tudo o que a tarefa exige. Cada lacuna ou contradição vai para a seção "Lacunas na documentação" do plano, com opções, recomendação, texto proposto e arquivo de destino (`guia/regras.md`); a aprovação do plano decide também as lacunas.
4. Analisar cada escolha técnica contra as decisões existentes (`procedimentos/decisao.md`): a coberta é citada pelo número; a nova, ou a que contraria uma decisão, vai para a seção "Decisões técnicas" do plano.
5. Associar cada critério de aceitação a um teste automatizado ou a um passo de teste manual.
6. Listar os arquivos a criar ou alterar, cada um na pasta cujo README o admite, incluindo os módulos de `docs/` das lacunas e das decisões; o desenvolvedor usa essa lista para ver se outra tarefa em andamento mexe nos mesmos arquivos.
7. Listar os testes previstos, escritos antes do código nas regras de negócio e nas validações (TDD).
8. Apontar riscos, dúvidas e o que fica fora do escopo.
9. Gravar o plano com `status: aguardando_aprovacao` e avisar o desenvolvedor.

## Saídas

| Arquivo | Estado |
|---|---|
| `memoria/tarefas/<issue>-<nome-curto>/01_plano.md` | `aguardando_aprovacao` |
| `memoria/tarefas/<issue>-<nome-curto>/notas.md` | criado |

Avança quando o desenvolvedor muda o status para `aprovado`. Se ele pedir ajustes, revisar o plano e mantê-lo em `aguardando_aprovacao`.

## Pare e pergunte se

- um requisito estiver ambíguo, ausente ou em conflito com o código;
- a issue não tiver critérios de aceitação verificáveis;
- a tarefa exigir dependência nova ou mudança de banco, autenticação ou autorização não citada na issue.
