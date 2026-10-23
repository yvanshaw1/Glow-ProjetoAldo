# Notas: 78-foco-no-reagendamento

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-23 – descoberta

Conferências do planejamento, sem alterar o código do projeto:

- **Origem.** Sessão iniciada pela sessão da #59 para conduzir a #78 (`tipo:defeito`, `area:frontend`), achada na revisão do PR #77 (0bb61f8) e aberta com o OK do Yvan; a correção vai antes da #60. Lidos a issue, a nota de passagem da sessão da #59, os planos e as notas da #59 (geral e do PR 3), `agendar-servico.md`, `meus-agendamentos.md`, UC25 e `componentes.md`.
- **Worktree.** `56-base-da-demonstracao-e6d9a4` (nome herdado, não renomeável), na ramificação `claude/78-foco-no-reagendamento-351d85`, em 0bb61f8, igual à `origin/main` depois do `git fetch`. Plano e notas sem commit, como na #58 e na #59. A etapa 02 cria `fix/78-reschedule-focus` a partir da `origin/main`, com `git switch --no-track -c` e `npx -y npm@11.21.1 ci`. A cópia principal `App/` precisa de `git pull` (passo do Yvan).
- **Causa.** No reagendamento, `isBlocked` desativa o `<fieldset>` inteiro enquanto a prévia não responde, e a prévia é lida de novo a cada horário e a cada forma de pagamento; a edição só bloqueia no conflito de versão.
- **Hipótese diferente da issue.** `HTMLButtonElement.disabled` reflete só o atributo do botão, não o `<fieldset>` que o contém. Então o `initialFocus` de `appointment-change-dialog.tsx` (`textContent === "Cancelar" && !button.disabled`) acha primeiro o "Cancelar" do `StepForm`, que vem antes do provisório no DOM e está desativado de fato: o `focus()` não faz nada, e o foco fica em "Reagendar". Isso bate com a evidência da #78 (900 ms depois, o foco continua no botão do detalhe, e não no `body`). O passo 2 do roteiro confirma antes de qualquer alteração; a correção é a mesma.
- **Efeito da correção.** Com o formulário habilitado, o foco começa no "Cancelar" do `StepForm`, que sai da tela quando a prévia indica que nenhum serviço principal ou complementar está disponível (RN005); o plano prevê mandar o foco ao "Cancelar" que fica.
- **Tamanho.** Cerca de 30 linhas em três arquivos de `src/`, sem teste automatizado novo (decisão 0052); a verificação é o roteiro manual do plano.
- **Verificação.** Mesma técnica da #59 (`verificacao-de-tela-sem-painel`): Docker Desktop, `npx supabase start`, `next build` e `next start`, Chrome sem interface pelo `puppeteer-core` do cache do Lighthouse, foco lido de 50 a 900 ms depois de cada tecla, e respostas temporárias da prévia por alteração de `src/lib/demo/appointments.ts`, sem commit.

## 2026-10-23 – decisão

Plano gravado em `aguardando_aprovacao`, com:

- L1, defeito de tela e "todo defeito ganha um teste" (`testes.md`, `procedimentos/testes.md` e `guia/CONTEXT.md` pedem teste que reproduz o defeito, e a 0052 deixa as telas à mão): recomendado o roteiro manual do plano como o teste do defeito de tela;
- L2, a leitura que acompanha o formulário não desativa as escolhas (`componentes.md` e `agendar-servico.md`): recomendado documentar a regra;
- P1, levar o plano geral da #59 de `em_execucao` para `concluido` neste PR (passo 4 de `03_entregar.md`, que ficou sem fazer);
- P2, o ambiente de verificação, nos mesmos termos da #59.

Nada foi construído.

## 2026-10-23 – decisão

Plano aprovado por yvan (cabeçalho gravado por ele: `status: aprovado`, `aprovado_em: 17:52 - 23/10/2026`, e as opções 1 de L1, L2, P1 e P2 marcadas no arquivo, conferidas antes da etapa 02). Status em `em_execucao`. Ramificação `fix/78-reschedule-focus` criada da `origin/main` (0bb61f8), sem vínculo (`git switch --no-track -c`); o `node_modules` do worktree já estava instalado.

## 2026-10-23 – descoberta

Execução, com o roteiro do plano em `next build` e `next start -p 3078`, Docker Desktop aberto, `npx supabase start` (do backup), cliente de teste novo por `POST /api/auth/register` (201), com e-mail `@example.com` e senha geradas em `local/client.json` do scratchpad, nunca exibidos, variáveis do banco local por `local/local-env.sh` do scratchpad (só aceita `http://127.0.0.1:`, não exibe valores), Chrome sem interface pelo `puppeteer-core` do cache do Lighthouse 13.5.0:

- **Antes da correção** (360 × 800, claro), passos 1 a 4: ao abrir "Reagendar", o foco continua em "Reagendar" aos 50, 150, 400 e 900 ms; Espaço e setas no grupo "Horário": `body` nas quatro leituras; Espaço e seta na forma de pagamento: `body`. Escolher só o dia mantém o foco.
- **Passo 2, causa confirmada.** 30 ms depois de abrir, os dois "Cancelar" da janela: o do `StepForm` com `button.disabled` falso e `:disabled` verdadeiro (o `<fieldset>` o desativa), e o provisório ativo. O `initialFocus` devolve o primeiro, que não aceita foco. A hipótese do plano estava certa; a da issue (foco no provisório que some) não se sustenta: desde a leitura de 50 ms o foco já estava em "Reagendar".
- **Depois da correção**, os mesmos passos: foco em "Cancelar" nas quatro leituras; no horário, na forma de pagamento e nas setas, o foco fica na opção escolhida antes e depois da prévia. A 1440 × 900 escuro e no segundo "Concluído" (Toyota SW4), igual. Esc devolve o foco a "Reagendar" do detalhe. Sem rolagem horizontal nos dois tamanhos.
- **Passo 5.** Com a prévia atrasada para 3 s (alteração temporária): "Confirmar reagendamento" fica com `aria-disabled="true"` e focável; Enter nele, clique nele e Enter numa forma de pagamento não enviam nada (sem aviso); com a resposta, `aria-disabled="false"`, e o Enter envia e mostra o aviso de `NOT_IMPLEMENTED` com o foco. Com a prévia falhando: o botão fica indisponível, o resumo mostra a falha e "Tentar novamente" (as escolhas continuam habilitadas); depois do reparo e da nova tentativa, o envio funciona.
- **Passo 6.** Sem nenhum principal ou complementar: aviso, "Agendar outro serviço" e "Cancelar", com o foco em "Cancelar". Antes da correção, o foco ficava em "Reagendar" (nunca entrou na janela). Com a retirada parcial (só o adicional), o aviso "Não estão mais disponíveis e ficaram de fora" aparece depois da resposta, e o foco fica na forma de pagamento escolhida.
- **Passo 8.** "Editar" de um "Agendado": começa em "Cancelar"; setas nos horários e nas formas de pagamento mantêm o foco; `VERSION_CONFLICT` (alteração temporária) mostra o aviso no topo, com o foco; com a releitura falhando, "Tentar novamente" e o formulário desativado, e depois da nova tentativa o formulário volta (foco na janela). Mesmo resultado com o código original, então nada mudou na edição. `/booking`: o foco fica no horário e na forma de pagamento. `/login`: o botão passa a "Entrando…" com o foco e `aria-disabled`, e volta a "Entrar" depois da resposta (sem comparação com o original: sem a propriedade nova, o botão não muda).
- **Passo 9.** Lighthouse `snapshot` de acessibilidade com a janela aberta depois das interações (um dia, um horário, a segunda etapa e uma forma de pagamento): nota 1 e nenhuma auditoria reprovada em celular claro, celular escuro, computador claro e computador escuro.
- **Alterações temporárias** (sem commit, desfeitas com `git checkout -- src/lib`): `src/lib/demo/match.ts` (atraso), `src/lib/demo/appointments.ts` (prévia com falha, sem serviço ou parcial; releitura com falha) e `src/lib/api-client.ts` (`VERSION_CONFLICT` no `PATCH`), todas por `globalThis.__demo` no roteiro. A compilação final, sem elas, repetiu o roteiro dos passos 1 a 4 e 7 com o mesmo resultado. Roteiros no scratchpad da sessão: `browser.mjs`, `make-client.mjs`, `verify-reschedule.mjs`, `verify-states.mjs`, `lh-snapshot.mjs`, `patch-states.mjs`.
- **Encerramento.** `next start` encerrado por PID e `npx supabase stop`, com o backup.
- **Outra observação.** Depois da nova tentativa da releitura que falhou, o foco vai ao painel da janela, não ao primeiro campo. É assim também no código original, fora do escopo da #78; se quiserem tratar, é outra issue.
