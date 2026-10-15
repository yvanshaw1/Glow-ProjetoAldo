---
issue: 2
pull_request: 8
---

# Relatório: Equipe sem responsável por área: tarefas de ponta a ponta

## O que foi feito

A estrutura ICM passa a seguir o modelo de equipe decidido em 15/10/2026: não há responsável por área, cada integrante leva uma tarefa de ponta a ponta, por todas as áreas que ela toca, e qualquer outro integrante, nunca o autor, revisa e aprova o pull request. Saiu o `.github/CODEOWNERS`; as etiquetas `area:*` passam a ser várias por issue, e o modelo de plano ganhou o campo `areas`. A decisão fica registrada na 0039. O questionário de configuração mostra os seis integrantes, os usuários do GitHub conhecidos, o Yvan como integrante das migrations e o estado real do GitHub e dos serviços, sem endereço de projeto nem valor de variável. Toca RNF014.

Desvios do plano, registrados em `notas.md`, todos mecânicos e sem mudança de escopo:

- A decisão é a **0039**, não a 0038: enquanto o plano aguardava aprovação, a 0038 foi gravada pela #6 (Docker), e `procedimentos/decisao.md` manda usar o próximo número livre. Os critérios 1 e 5 valem para a 0039.
- Questionário, seção 5: a fase 2 da proteção da `main` já estava ativa (checks `check` e `Vercel`), então o item foi marcado completo, e a seção perdeu o "(**pendente**)". Seção 6: o `.env.local` do Yvan (criado na #6) e o preset Next.js da Vercel.
- Os conflitos previstos com a #1 não aconteceram: a ramificação partiu da `main` já com a 0037 e a 0038.

## Arquivos alterados

- `AGENTS.md`, seção Áreas: sem responsável por área, com a aprovação por outro integrante (0039).
- `guia/CONTEXT.md`, `guia/regras.md`, `workflows/01_planejar.md`, `workflows/02_construir.md`, `docs/padroes/testes.md` e `.github/pull_request_template.md`: "padrões das áreas que a tarefa toca" no lugar de "padrão da área".
- `guia/CONTEXT.md`, `guia/como-pedir.md`, `workflows/CONTEXT.md`, `workflows/03_entregar.md`, `workflows/procedimentos/pull-request.md` e `docs/padroes/testes.md`: aprovação por outro integrante, que não o autor; em `pull-request.md`, o autor pede a revisão no próprio PR (L2).
- `guia/como-pedir.md`: uma etiqueta `area:*` por área que a tarefa toca; correção que se repete vai para o padrão correspondente de `docs/padroes/`.
- `_templates/plano.md`: `areas: [...]`. `.github/ISSUE_TEMPLATE/funcionalidade.md`: seção "Áreas", com uma etiqueta por área.
- `.github/CODEOWNERS`: removido. `docs/plataforma/estrutura-de-pastas.md`: `.github/` sem ele.
- `setup/questionario.md`: seções 1, 2, 5 e 6.
- `docs/decisoes/0039-tarefas-de-ponta-a-ponta.md` e `docs/decisoes/CONTEXT.md`: decisão 0039.

## Testes executados

- `npm run check`: aprovado (formatação, tipos e lint; nenhum teste ainda, como na `main`).
- Critério 1: `git grep -n -i -e "responsável pela área" -e "responsável por CI/CD" -e "responsáveis" -e "CODEOWNERS" -- . ':!memoria/tarefas'` lista só `docs/decisoes/0039-tarefas-de-ponta-a-ponta.md`; `git ls-files .github/CODEOWNERS` vazio.
- Critério 2: `pull-request.md` (passo 2 de "Abrir", "Revisar" e "Incorporar") e `03_entregar.md` exigem a aprovação de outro integrante; o ruleset `main` exige 1 aprovação e não exige code owner (`require_code_owner_review: false`), conferido pelo `gh` em 15/10/2026.
- Critério 3: seções 1, 2, 5 e 6 conferidas contra o `gh` (colaboradores, convite pendente do Kayke, ruleset, Dependabot) e os relatórios da #1 e da #6; `git grep -n -i -e "supabase.co" -e "vercel.app" -e "eyJ" -e "sb_" -e "_KEY=" -- setup/` vazio.
- Critério 4: `_templates/plano.md` com `areas: [...]` e `funcionalidade.md` com a seção "Áreas". Falta conferir no GitHub, depois da incorporação, o modelo em "New issue → Funcionalidade" (o GitHub só usa os modelos da `main`).
- Critério 5: `docs/decisoes/CONTEXT.md` lista a 0039, e o registro tem `status: aceita`.
- Além dos critérios: "padrão da área", "padrões da área" e "o da área" não aparecem fora de `memoria/tarefas/`.

## Documentação atualizada

- Módulos: os da seção "Arquivos alterados".
- Lacunas resolvidas:
  - L1, "camada" já significa rota, serviço e repositório → opção 1, manter "área" sem a ideia de dono → arquivos de "Arquivos alterados".
  - L2, quem pede a revisão e quem cuida de `docs/padroes/` → opção 1, o autor pede a revisão no PR e os padrões mudam por tarefa → `workflows/procedimentos/pull-request.md`, `setup/questionario.md`, decisão 0039.
  - L3, o critério 1 ao pé da letra falha nos planos → opção 1, a busca exclui `memoria/tarefas/` → só a verificação.
- Decisões: 0039 criada.
- Documentos formais a atualizar (Documentação de Desenvolvimento com IA):
  - Seção 3, árvore: `.github/` sem o CODEOWNERS.
  - Seção 3.1: o item "as áreas da equipe e o responsável por cada uma" passa a dizer que não há responsável por área e que os integrantes estão no questionário.
  - Seção 3.2, Quadro 3: a rota de CI/CD e configuração fica "Ciclo completo", sem a revisão do responsável pela área.
  - Seção 3.5: o exemplo do cabeçalho do plano passa de `area: backend` a `areas: [backend]`.
  - Seção 3.6: o questionário trata dos integrantes, dos usuários do GitHub e do integrante das migrations, não das áreas e dos responsáveis; `.github/` sem o CODEOWNERS.
  - Seção 4.1: o PR é incorporado com a aprovação de outro integrante, que não o autor.
  - Seção 7.1 e Quadro 8: reescrever sem responsável por área, com as tarefas de ponta a ponta; o parágrafo que divide "uma funcionalidade que atravessa áreas" em tarefas por área deixa de valer; a linha de CI/CD do quadro sai sem o CODEOWNERS. O quadro pode continuar como lista das áreas e dos seus padrões.
  - Seção 7.2: a issue leva uma etiqueta de tipo e uma `area:*` para cada área que a tarefa toca, não "duas etiquetas"; os critérios de aceitação deixam de ser "conferidos pelo responsável pela área" (sugestão: conferidos na aprovação do plano).
  - Seção 7.4: saem os dois itens do CODEOWNERS; o autor pede a revisão a outro integrante, e a incorporação exige a aprovação de outro integrante.
  - Seção 8.3: o critério de pronto passa a "outro integrante, que não o autor, aprovou o pull request".
  - Seção 9, linha do GitHub no quadro de ferramentas: sem o CODEOWNERS.

## Pendências

- Questionário, seção 2: atualizar a tabela quando o Kayke aceitar o convite e quando Igor e Laura informarem os usuários do GitHub (sem issue: é a manutenção do próprio questionário, feita numa tarefa de documentação).
- Cópia principal (`App/`): a alteração local não commitada em `setup/questionario.md` (linha "Equipe" com o João) é substituída por este PR; descartá-la antes do `git pull` depois da incorporação.
