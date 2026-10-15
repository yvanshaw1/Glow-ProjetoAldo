---
issue: 2
titulo: "Equipe sem responsável por área: tarefas de ponta a ponta"
area: cicd
tipo: documentacao
requisitos: [RNF014]
status: concluido
aprovado_por: yvan    
aprovado_em: 15/10/2026 - 20:09
---

# Plano: Equipe sem responsável por área: tarefas de ponta a ponta

## Objetivo

Adaptar a estrutura ICM ao modelo de equipe decidido em 15/10/2026 (D1 a D5 da issue): cada integrante leva uma tarefa de ponta a ponta, por todas as áreas que ela toca, e qualquer outro integrante aprova o pull request. Sai o `.github/CODEOWNERS`, as etiquetas `area:*` passam a ser várias por issue, o modelo de plano ganha o campo `areas` e a mudança fica registrada na decisão 0038. O questionário de configuração recebe as respostas pendentes e o estado real do GitHub e dos serviços. Toca RNF014 (padrões de codificação e de revisão).

Os textos novos estão completos na seção "Textos propostos": aprovar o plano aprova também a redação da 0038 e as frases de cada arquivo.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado o repositório, quando procuro "responsável pela área", "responsável por CI/CD" e "CODEOWNERS", então só aparecem no registro 0038, que explica a mudança | `git grep -n -i -e "responsável pela área" -e "responsável por CI/CD" -e "responsáveis" -e "CODEOWNERS" -- . ':!memoria/tarefas'` lista só `docs/decisoes/0038-*.md`; `git ls-files .github/CODEOWNERS` vazio. Leitura do critério: L3 |
| Dado um PR pronto para revisão, quando leio `pull-request.md` e `03_entregar.md`, então a aprovação exigida é a de um integrante que não é o autor, coerente com o ruleset da `main` | leitura dos dois arquivos; o ruleset `main`, conferido em 15/10/2026, exige 1 aprovação e não exige revisão de code owner (`require_code_owner_review: false`), então a remoção do CODEOWNERS não muda a proteção |
| Dado o questionário, quando leio as seções 1, 2, 5 e 6, então elas mostram os seis integrantes, os usuários do GitHub conhecidos, o integrante das migrations e o estado real de cada item, sem chave, endereço de projeto ou valor de variável | leitura das seções contra o estado conferido pelo `gh` em 15/10/2026 (notas.md); `git grep -n -i -e "supabase.co" -e "vercel.app" -e "eyJ" -e "sb_" -e "_KEY=" -- setup/` vazio |
| Dado o modelo de plano e o modelo de issue de funcionalidade, quando abro uma tarefa nova, então posso indicar várias áreas | leitura de `_templates/plano.md` (`areas: [...]`) e de `.github/ISSUE_TEMPLATE/funcionalidade.md`; depois da incorporação, o desenvolvedor abre "New issue → Funcionalidade" no GitHub e confere o texto (o GitHub só usa os modelos da `main`) |
| Dado `docs/decisoes/CONTEXT.md`, quando procuro a 0038, então ela está no índice com status aceita | `git grep -n "0038" docs/decisoes/` mostra a linha do índice e o registro com `status: aceita` |

Verificações além dos critérios: `git grep -n -i -e "padrão da área" -e "padrões da área" -e "o da área"` vazio fora de `memoria/tarefas/`; todo caminho citado nos textos novos existe.

## Arquivos

| Arquivo | Ação | Motivo |
|---|---|---|
| `setup/questionario.md` | alterar | seções 1, 2, 5 e 6 (D4, respostas pendentes, estado real) |
| `AGENTS.md` | alterar | seção Áreas (D1) |
| `guia/CONTEXT.md` | alterar | padrões das áreas que a tarefa toca; sem revisor de CI/CD |
| `guia/como-pedir.md` | alterar | etiquetas (D3), revisor do PR (D1), correção que vira padrão |
| `guia/regras.md` | alterar | padrões das áreas que a tarefa toca |
| `workflows/CONTEXT.md` | alterar | ponto de controle 2 (D1) |
| `workflows/01_planejar.md` e `workflows/02_construir.md` | alterar | entrada dos padrões |
| `workflows/03_entregar.md` | alterar | quem aprova (D1) |
| `workflows/procedimentos/pull-request.md` | alterar | quem revisa e aprova (D1, D2, L2) |
| `docs/padroes/testes.md` | alterar | critérios de pronto (D1) |
| `docs/plataforma/estrutura-de-pastas.md` | alterar | `.github/` sem CODEOWNERS (D2) |
| `_templates/plano.md` | alterar | `area` vira `areas: [...]` (D3) |
| `.github/pull_request_template.md` | alterar | critério de pronto |
| `.github/ISSUE_TEMPLATE/funcionalidade.md` | alterar | várias etiquetas `area:*` (D3) |
| `.github/CODEOWNERS` | remover | D2 |
| `docs/decisoes/0038-tarefas-de-ponta-a-ponta.md` | criar | D5 |
| `docs/decisoes/CONTEXT.md` | alterar | linha da 0038 |
| `memoria/tarefas/2-tarefas-de-ponta-a-ponta/` | criar | `01_plano.md` e `notas.md` nesta etapa; `02_relatorio.md` na etapa 03 |

Arquivos que a busca acha e que não mudam: `docs/plataforma/infraestrutura.md` (já diz "aprovação de outro integrante"); `workflows/procedimentos/migration.md`, `docs/padroes/banco.md`, `supabase/README.md` e `supabase/scripts/README.md` ("integrante designado", coerente com D4); `docs/CONTEXT.md` e `docs/padroes/codigo.md` ("todas as áreas" e `docs/padroes/<área>.md`, sem ideia de dono; ver L1); `workflows/procedimentos/testes.md`, `memoria/CONTEXT.md` e a decisão 0028 ("integrante" no sentido de pessoa da equipe); "área do cliente", "área restrita" e "área" dos layouts em `docs/` e `src/` (sentido do sistema). Os modelos de issue de defeito e de investigação não têm seção de área e continuam assim.

### Em comum com a issue #1 (worktree `issue-1-base-759082`, plano em `aguardando_aprovacao`)

| Arquivo | #1 altera | #2 altera | Conflito no merge |
|---|---|---|---|
| `AGENTS.md` | linha da stack (ESLint 9) e regra do `.env*` | seção Áreas | não: trechos separados por várias linhas |
| `guia/regras.md` | regra do `.env*` e último item de "Como programar" | parágrafo de abertura de "Como programar" | não: trechos separados |
| `docs/plataforma/estrutura-de-pastas.md` | linha da raiz (`.prettierignore`, sem `postcss.config.mjs`) | linha do `.github/` | não: trechos separados |
| `docs/decisoes/CONTEXT.md` | linha da 0037 no fim da tabela | linha da 0038 no fim da tabela | **sim**, mecânico: manter as duas linhas, 0037 antes da 0038 |

A #1 não toca `setup/questionario.md` nem `.github/CODEOWNERS`; o plano dela cita o CODEOWNERS e o "responsável por CI/CD" como pendências da seção 2, que esta tarefa resolve.

## Textos propostos

Com a opção recomendada de L1 ("área") e de L2. Na opção 2 de L1, "áreas" vira "camadas" nas mesmas frases, e os nomes `area:*`, `areas` e `docs/padroes/<área>.md` ficam como estão.

### `docs/decisoes/0038-tarefas-de-ponta-a-ponta.md` (criar na etapa 03, conforme `procedimentos/decisao.md`)

```markdown
---
id: 0038
titulo: Tarefas de ponta a ponta, sem dono por área
status: aceita
data: 2026-10-15
origem: issue #2, plano memoria/tarefas/2-tarefas-de-ponta-a-ponta/01_plano.md
relacionados: [RNF014, 0031, 0034]
---

# 0038 – Tarefas de ponta a ponta, sem dono por área

## Decisão

Não há responsável fixo por área. Cada integrante leva uma tarefa de ponta a ponta, por todas as áreas que ela toca (interface, API, banco, testes e fluxo Git), e conduz o agente nas quatro etapas. O pull request é aprovado por qualquer outro integrante, nunca pelo autor, como exige a proteção da `main` (uma aprovação). O repositório não tem `.github/CODEOWNERS`. As etiquetas `area:*` indicam as áreas que a tarefa toca, várias por issue, e o plano as lista no campo `areas`. As migrations continuam aplicadas por um único integrante, designado em `setup/questionario.md`.

## Alternativa descartada

Um responsável por área (Frontend, Backend e API, Banco de dados, Testes e QA, CI/CD e fluxo Git), que planejaria as tarefas da área, manteria o padrão dela em `docs/padroes/` e revisaria os pull requests que a alteram, com o CODEOWNERS indicando o revisor de cada pasta.

## Justificativa

As funcionalidades do sistema atravessam todas as áreas: a edição de um agendamento, por exemplo, muda tela, rota, serviço, regra e teste. Com dono por área, uma tarefa dependeria de várias pessoas e esperaria a revisão de cada uma; de ponta a ponta, quem planeja entrega a funcionalidade inteira, e a revisão por qualquer outro integrante distribui a carga entre os seis. Consequências aceitas: nenhum padrão tem guardião, então mudanças em `docs/padroes/` passam pelo plano e pela revisão como qualquer outra; o revisor pode não dominar todas as áreas que revisa, e por isso o plano aprovado, os critérios de aceitação e o checklist do pull request são a referência da revisão. A aplicação das migrations fica com uma só pessoa porque todos os ambientes usam o mesmo projeto do Supabase, e uma migration aplicada vale na hora para a produção (`workflows/procedimentos/migration.md`).
```

### `docs/decisoes/CONTEXT.md`

Linha nova no fim da tabela:

```
| [0038](0038-tarefas-de-ponta-a-ponta.md) | Tarefas de ponta a ponta, sem dono por área |
```

### `setup/questionario.md`

Seção 1, item da equipe:

```
- Equipe: Igor, João, Kayke, Laura, Lucas e Yvan.
```

Seção 2, inteira:

```markdown
## 2. Equipe

Não há responsável fixo por área (decisão 0038). Cada integrante leva uma tarefa de ponta a ponta, por todas as áreas que ela toca, e conduz o agente nas quatro etapas; qualquer outro integrante revisa e aprova o pull request, nunca o autor. Os padrões de `docs/padroes/` mudam como qualquer documento: numa tarefa, com plano aprovado e revisão.

| Integrante | Usuário no GitHub | Acesso ao repositório |
|---|---|---|
| Igor | pendente | sem acesso até informar o usuário |
| João | `joaomanoel999` | colaborador |
| Kayke | `Kaykebr144` | convite enviado, ainda não aceito |
| Laura | pendente | sem acesso até informar o usuário |
| Lucas | `LFaustin0` | colaborador |
| Yvan | `yvanshaw1` | dono do repositório |

Integrante que aplica as migrations (`supabase db push`, `workflows/procedimentos/migration.md`): Yvan (`yvanshaw1`).
```

Seção 5, itens alterados (os demais ficam como estão):

```markdown
- [x] Commit inicial. <texto atual do item mantido, com os subitens>
- [x] Etiquetas: `area:frontend`, `area:backend`, `area:banco`, `area:testes`, `area:cicd`, `tipo:funcionalidade`, `tipo:defeito`, `tipo:investigacao`, `tipo:documentacao`, `tipo:configuracao`. Cada issue leva uma etiqueta de tipo e uma `area:*` para cada área que a tarefa toca.
- [ ] Proteção da `main`, em duas fases. Fase 1, ativa no ruleset `main`: só por PR, sem exclusão nem envio forçado; 1 aprovação, descartada com commits novos; conversas resolvidas; só squash; remoção automática da ramificação incorporada. Fase 2, no PR da tarefa #1: CI e build da Vercel obrigatórios, com a ramificação atualizada.
- [x] Alertas de dependências (Dependabot) ativados.
```

Seção 6, itens:

```markdown
- [ ] Projeto no Supabase: criado, ainda sem configuração; faltam desativar a confirmação de e-mail, definir a senha mínima de 8 caracteres e criar o bucket `service-images`.
- [ ] Projeto na Vercel: ligado ao repositório, ainda sem as variáveis de `docs/plataforma/infraestrutura.md`.
- [ ] Cada integrante com o seu `.env.local` (nunca versionado nem colado em conversas com IA): nenhum criado ainda.
```

### `AGENTS.md`, seção Áreas

```
Frontend, Backend e API, Banco de dados, Testes e QA, CI/CD e fluxo Git. Não há responsável por área: cada integrante leva uma tarefa de ponta a ponta, por todas as áreas que ela toca, e outro integrante aprova o pull request (decisão 0038). Integrantes, usuários do GitHub e quem aplica as migrations: `setup/questionario.md`.
```

### `guia/CONTEXT.md`

- Linha "Tarefa trivial": "o arquivo afetado e o padrão da área" → "o arquivo afetado e os padrões das áreas que ele toca".
- Linha "Funcionalidade": "padrão da área; decisões citadas" → "padrões das áreas que a tarefa toca; decisões citadas".
- Linha "CI/CD e configuração", coluna Fluxo: "Ciclo completo, com revisão do responsável por CI/CD" → "Ciclo completo".
- Parágrafo final: "Padrões das áreas: `docs/padroes/codigo.md` sempre, mais `frontend.md`, `backend.md` e `api.md`, `banco.md` e `testes.md`, conforme as áreas que a tarefa toca."

### `guia/como-pedir.md`

- "Antes de pedir": "mais as etiquetas de área e de tipo" → "mais a etiqueta de tipo e uma `area:*` para cada área que a tarefa toca".
- Título do passo de revisão: "**Revisão do pull request (responsável pela área)**" → "**Revisão do pull request (outro integrante, nunca o autor)**".
- Tabela "Outros pedidos", linha "Correção que se repete": `Transforme essa correção em regra no padrão da área.` → `Transforme essa correção em regra no padrão correspondente de docs/padroes/.`

### `guia/regras.md`, abertura de "Como programar"

"(sempre `codigo.md`, mais o da área)" → "(sempre `codigo.md`, mais os das áreas que a tarefa toca)".

### `workflows/CONTEXT.md`, ponto de controle 2

"... ramificação atualizada e aprovação do responsável pela área." → "... ramificação atualizada e aprovação de outro integrante, que não o autor."

### `workflows/01_planejar.md` e `workflows/02_construir.md`, tabela de entradas

- 01: `| codigo.md e docs/padroes/<área>.md de cada área que a tarefa toca | como programar nessas áreas |` (com os caminhos em código, como hoje).
- 02: `| codigo.md e docs/padroes/<área>.md de cada área que a tarefa toca | como programar |`.

### `workflows/03_entregar.md`, saída

"Avança quando o CI e o build da Vercel passam e o responsável pela área aprova." → "Avança quando o CI e o build da Vercel passam e outro integrante, que não o autor, aprova."

### `workflows/procedimentos/pull-request.md`

- "Abrir", passo 2: "Na entrega, atualizar com a `main` (`git.md`), rodar `npm run check`, marcar como pronto para revisão e pedir a revisão a outro integrante no próprio PR." (L2)
- "Revisar", primeiro item: "Qualquer integrante que não seja o autor revisa e aprova (decisão 0038); a proteção da `main` exige uma aprovação."
- "Incorporar": "aprovação do responsável (a aprovação cai se entrarem commits novos)" → "aprovação de outro integrante (a aprovação cai se entrarem commits novos)".

### `docs/padroes/testes.md`, critérios de pronto

- "o código segue os padrões da área;" → "o código segue os padrões das áreas que a tarefa toca;"
- "o responsável pela área aprovou o PR, e a issue foi fechada pela sua incorporação." → "outro integrante, que não o autor, aprovou o PR, e a issue foi fechada pela sua incorporação."

### `docs/plataforma/estrutura-de-pastas.md`, árvore

`├── .github/                         workflows/ci.yml, modelos de PR e de issue`

### `_templates/plano.md`, cabeçalho

`areas: [<frontend, backend, banco, testes, cicd: as que a tarefa toca>]` no lugar de `area: <frontend | backend | banco | testes | cicd>`.

### `.github/pull_request_template.md`, critérios de pronto

"- [ ] Plano aprovado (ou tarefa trivial aprovada na conversa) e código nos padrões das áreas que a tarefa toca."

### `.github/ISSUE_TEMPLATE/funcionalidade.md`, última seção

```markdown
## Áreas

<!-- Adicione uma etiqueta para cada área que a tarefa toca: area:frontend, area:backend, area:banco, area:testes, area:cicd. -->
```

## Testes previstos

Nenhum teste automatizado: a tarefa só muda documentação e modelos, e o Vitest cobre só regras de negócio e esquemas (decisões 0024 e 0035). A verificação é pelas buscas e leituras da tabela de critérios. Se a #1 já estiver incorporada quando esta tarefa for entregue, `npm run check` roda também; o Prettier ignora os `.md` na proposta L3 da #1.

## Lacunas na documentação

| Lacuna | Opções (recomendada primeiro) | Texto proposto | Onde documentar |
|---|---|---|---|
| L1. A issue troca "padrão da área" por "padrões das camadas que a tarefa toca", mas "camada" já tem outro sentido no projeto: rota, serviço e repositório (decisão 0003, `docs/padroes/backend.md`, `guia/regras.md` duas linhas abaixo da frase alterada: "respeitar as camadas"). As etiquetas `area:*`, o campo `areas`, `docs/padroes/<área>.md`, `docs/CONTEXT.md` e o título de `codigo.md` ("todas as áreas") usam "área". | 1. Manter "área" e tirar só a ideia de dono: "padrões das áreas que a tarefa toca" (recomendada). 2. "Camada", como no texto da issue, só nas frases alteradas, deixando "camada" com dois sentidos e "área" nos nomes das etiquetas, do campo e dos arquivos. | os da seção "Textos propostos" | arquivos da tabela "Arquivos" |
| L2. O CODEOWNERS pedia a revisão automaticamente ao revisor da pasta, e a seção 2 dava a cada área quem mantinha o padrão dela. Sem os dois, nada diz quem pede a revisão nem quem cuida de `docs/padroes/`. | 1. O autor pede a revisão a outro integrante no próprio PR, ao marcá-lo como pronto; os padrões mudam numa tarefa, com plano e revisão, como qualquer documento (recomendada). 2. Não dizer nada: o PR pronto fica no quadro, em "Em revisão", até alguém revisar. | `pull-request.md`, passo 2 de "Abrir"; última frase do parágrafo da seção 2 do questionário; consequência na 0038 | `workflows/procedimentos/pull-request.md`, `setup/questionario.md`, `docs/decisoes/0038-*.md` |
| L3. Lido ao pé da letra, o primeiro critério falha: este plano e o da #1, em `memoria/tarefas/`, citam "CODEOWNERS" e "responsável pela área" para descrever a mudança. | 1. A busca do critério exclui `memoria/tarefas/`, que é o histórico das tarefas (recomendada). 2. Reescrever os planos sem os termos, o que tira deles a descrição do que muda. | nenhum: só a forma de verificar | nenhum |

## Decisões técnicas

- Seguidas: 0031 (estrutura ICM: a mudança fica nos arquivos que orientam a IA), 0033 (atualização por merge, inclusive no conflito com a #1), 0034 (squash com `Closes #2`).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| 0038 – Tarefas de ponta a ponta, sem dono por área: D1 (aprovação de qualquer outro integrante), D2 (sem CODEOWNERS), D3 (várias `area:*` por issue e campo `areas`) e D4 (migrations por um integrante designado, hoje o Yvan, registrado no questionário). Texto completo em "Textos propostos" | um responsável por área, com o CODEOWNERS indicando o revisor de cada pasta | aprovadas pelo desenvolvedor na conversa de configuração, em 15/10/2026, e listadas na issue #2 (D5 fixa o número 0038, porque a 0037 está proposta no plano da #1) | nova; nenhum registro anterior trata de responsáveis por área |

## Riscos e dúvidas

- Numeração: a 0037 está só proposta na #1. Se a #2 for incorporada antes, o índice fica por um tempo com a 0038 sem a 0037; o `tools/check-docs.mjs`, que conferiria a sequência, ainda não existe. Se a 0037 for recusada na #1, a etapa 03 desta tarefa para e pergunta se a 0038 vira 0037 antes de gravar o registro (`procedimentos/decisao.md`: o número é dado na gravação).
- Conflito em `docs/decisoes/CONTEXT.md` com a #1: mecânico, resolvido na atualização com a `main` (`procedimentos/git.md`).
- Sem a #1 incorporada, não há `package.json` nem CI: `npm run check` não existe, e o build da Vercel na pré-visualização falha por falta de aplicação, como na `main`. Nenhum dos dois é check obrigatório antes da fase 2 da proteção; a incorporação fica a critério do desenvolvedor.
- Quem aprova o PR desta tarefa: Lucas (`LFaustin0`) ou João (`joaomanoel999`), que já aceitaram o convite. Até a incorporação, a documentação ainda pede o "responsável pela área"; D1 já vale pela aprovação na conversa de configuração.
- O estado do GitHub e dos serviços no questionário é o de 15/10/2026 (conferência em `notas.md`); convites aceitos depois exigem atualizar a tabela da seção 2 antes da etapa 03.
- Ramificação `docs/2-team-model`, criada na etapa 02 a partir da `main` atualizada (`procedimentos/git.md`); título do PR em Conventional Commits, como `docs: adopt end-to-end tasks without area owners`.

## Fora do escopo

- Documentos formais (`.docx`): o `02_relatorio.md` lista o que muda neles, como a descrição das áreas e responsáveis e do CODEOWNERS na Documentação de Desenvolvimento com IA.
- Configuração do Supabase e da Vercel, convites do GitHub (Igor, Laura e o aceite do Kayke) e a fase 2 da proteção da `main` (PR da #1).
- Nomes e descrições das etiquetas no GitHub, que continuam valendo; modelos de issue de defeito e de investigação.
- O plano da #1, que usa o campo `area` do modelo atual.
