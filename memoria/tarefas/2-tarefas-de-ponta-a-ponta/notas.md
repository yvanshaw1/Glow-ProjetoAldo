# Notas: 2-tarefas-de-ponta-a-ponta

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-15 – descoberta

Estado do GitHub conferido com o `gh` (autenticado como `yvanshaw1`), base das seções 2 e 5 do questionário:

- Colaboradores: `yvanshaw1`, `joaomanoel999` e `LFaustin0`; convite pendente para `Kaykebr144`. Igor e Laura ainda sem usuário.
- Ruleset `main` ativo, sem exceções: bloqueia exclusão e envio forçado; PR com 1 aprovação, descartada com commits novos; conversas resolvidas; só squash; `require_code_owner_review: false`. Sem checks obrigatórios (fase 2, no PR da #1).
- Repositório público; remoção automática da ramificação incorporada ligada; só squash permitido.
- Alertas do Dependabot ativos (`vulnerability-alerts` responde 204); atualizações automáticas de segurança desligadas.
- Varredura de segredos e proteção de envio ativas.

Supabase e Vercel não foram consultados: o estado da seção 6 vem da issue #2 (Supabase criado sem configuração, Vercel ligada sem variáveis, nenhum `.env.local`).

## 2026-10-15 – descoberta

Arquivos em comum com a #1 (plano em `.claude/worktrees/issue-1-base-759082`): `AGENTS.md`, `guia/regras.md` e `docs/plataforma/estrutura-de-pastas.md` em trechos separados; `docs/decisoes/CONTEXT.md` com conflito mecânico (as duas linhas entram no fim da tabela, 0037 antes da 0038).

## 2026-10-15 – desvio

Plano aprovado pelo Yvan com a opção 1 (recomendada) de L1, L2 e L3. Enquanto ele aguardava aprovação, a `main` recebeu os PRs #5 (issue #1) e #7 (issue #6), em `eb85140`. Ajustes mecânicos na construção, sem mudança de escopo:

- A decisão desta tarefa vira **0039** (`docs/decisoes/0039-tarefas-de-ponta-a-ponta.md`): a 0038 ficou com "Docker para executar a aplicação em contêiner" (#6), e `procedimentos/decisao.md` manda usar o maior número mais 1, sem reaproveitar. Onde o plano diz 0038 (registro, índice, `AGENTS.md`, questionário, `pull-request.md`, critérios 1 e 5), vale 0039.
- Questionário, seção 5: a fase 2 da proteção já está ativa (checks `check` e `Vercel` obrigatórios, com a ramificação atualizada; ruleset conferido pelo `gh`), então o item vai marcado, com a descrição completa, no lugar do texto em duas fases.
- Questionário, seção 6: o Yvan criou o `.env.local` na #6 (relatório dela), e a Vercel usa o preset Next.js (nota da sessão da #1); os itens dizem isso.
- Os conflitos previstos com a #1 não existem mais: a ramificação `docs/2-team-model` parte de `eb85140`, que já tem a 0037 e a 0038 no índice.
- A #3 (planejamento em outro worktree) altera só a seção "Lacunas na documentação" de `_templates/plano.md`; esta tarefa, só o cabeçalho. Sem conflito.
- A cópia principal (`App/`) tem uma alteração local, não commitada, em `setup/questionario.md` (seção 1, "Equipe: ... Igor e João"). Este PR substitui a linha pelo texto aprovado; o desenvolvedor descarta a alteração local antes do `git pull` depois da incorporação.
- Questionário, seção 5: com todos os itens marcados, o título perde o "(**pendente**)", como a seção 2, que agora é "Equipe".

## 2026-10-15 – descoberta

Etapa 02 verificada em `docs/2-team-model`, antes do registro da 0039 (etapa 03): as buscas dos critérios 1 e 3 e de "padrão da área" voltam vazias fora de `memoria/tarefas/`; "responsável" sobra só em "Não há responsável (fixo) por área", no `AGENTS.md` e no questionário, como aprovado. `npm ci` e `npm run check` passam (o Prettier ignora os `.md`; nenhum teste ainda). Falta na etapa 03: gravar `docs/decisoes/0039-tarefas-de-ponta-a-ponta.md` e a linha do índice, e repetir as buscas.
