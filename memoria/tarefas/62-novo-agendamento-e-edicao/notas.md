# Notas: 62-novo-agendamento-e-edicao

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-24 – descoberta: dependências conferidas

A #62 é a T6 de `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md` (depende da T5 = #61 e, de preferência, da T3 = #59). A #61 (PRs #84 a #87), a #59, a #78 e a #56 estão fechadas; `origin/main` em 36da37e (#87), sem PR aberto, e a ramificação da sessão (`claude/eager-sanderson-f0828f`, worktree `36-regras-do-agendamento-05611e`, nome herdado e não renomeável) está no mesmo commit, com a árvore limpa. As rotas (#46, #49, #50) estão abertas e sem código. Plano e notas sem commit, como nas etapas 01 anteriores.

## 2026-10-24 – descoberta: notas de passagem da #61

Lidas as notas de `side-session-notes/local_c7eddc37-…` (dados de outra sessão): o que a #62 herda (janelas sempre montadas com gatilho `hidden`, `FormAlert` no topo com o foco, `aria-label` nos `combobox`, a leitura do formulário que não desativa os campos), as etapas `booking-*` já em `src/components/shared/`, a unificação do reagendamento deixada para a #62 (P4) e as armadilhas da verificação. Os roteiros de `61-scripts-de-verificacao/` não foram copiados nesta etapa; a etapa 02 os copia para o scratchpad e os adapta (`start.sh` e `local-env.sh` têm os caminhos de outro worktree; `admin.json` precisa ser gerado de novo).

## 2026-10-24 – descoberta: wireframes e documentos

Os PDFs de `NewAppointmentStep1` a `Step5` (celular) foram lidos abrindo-os no navegador do app (`pdftoppm` não está instalado, então a ferramenta `Read` não renderiza PDF; `file:///…pdf` no painel do navegador mostra a página, e a rolagem leva à janela). O wireframe tem cinco etapas (Cliente, Veículo, Serviços, Data e horário, Resumo com o pagamento); o UC11 põe o pagamento no passo 5 e o resumo no 6, e o assistente do cliente já resolve isso com "Pagamento e resumo". Não têm requisito no Glow e ficam fora: filtro por categoria, "Sob orçamento", "Total estimado" e o término em cada horário.

## 2026-10-24 – descoberta: lacunas e pontos que a tela exige

- `rotas.md` não tem campos nem paginação das três buscas (L1) e o detalhe não traz `clientId`, que a edição precisa para listar os veículos do cliente (L2).
- Textos, posição do botão e estados do assistente do painel não existem em nenhum módulo (L3, L4); a edição do cliente já tem o conflito de versão (RNF011), que o painel repete.
- A etapa "Data e horário" compartilhada só conhece a regra do cliente (nada antes do original nem de agora); RN033 dá ao funcionário limites por status, e `src/server/rules/editing.ts` já tem a tabela `STAFF_DATE_LIMITS`, que a tela não pode importar (L5, P5).
- Nenhum cliente do `seed-demo.sql` está sem veículo; o critério de UC11 FE02 pede um (P2).
- `usePaginatedList` não tem modo desligado, e `lookup/clients` exige `search*` (Riscos).

## 2026-10-24 – decisão: plano gravado em aguardando_aprovacao

`01_plano.md` com as lacunas L1 a L5 e os pontos P1 a P6, a opção recomendada primeiro em cada um (P1: quatro PRs; P2: cliente sem veículo no seed; P3: mover as etapas de veículo e de serviços para `shared/`; P4: manter o reagendamento do painel; P5: a tabela de limites em `src/shared/constants/`; P6: ambiente como nas tarefas anteriores). Nada foi construído, e nenhuma dependência nova é proposta. A etapa 02 só começa quando o Yvan gravar `aprovado` no arquivo e eu conferir o status e as caixas.

## 2026-10-24 – decisão: plano aprovado

O Yvan gravou `status: aprovado` em 24/10/2026 (12:44), com a opção 1 em L1 a L5 e em P1 a P6 (caixas `[x]`). Conferido no arquivo antes da etapa 02; o `status` passou a `em_execucao`, sem tocar em `aprovado_por` nem em `aprovado_em`.

## 2026-10-24 – desvio: PR 1 construído na ramificação feat/62-appointment-lookups

Tipos (`clientId`, `AdminClientOption`), três buscas e `POST`/`PATCH` em `routes.ts`, 13º cliente (Natália Pires, sem veículo) no `seed-demo.sql` e em `admin-appointments.ts`, `rotas.md` (L1, L2). `listBookableServices` saiu exportada de `appointments.ts`. Verificado por teste temporário do Vitest com `apiRequest` (apagado): busca "SOUZA", 13 clientes, Natália sem veículo, Ana Souza com Polo e Argo, Lavagem simples R$ 40 e Cera R$ 35 no porte pequeno, `clientId` no detalhe, gravações com `NOT_IMPLEMENTED`; `lookup/clients` não colide com `/:id`. `npm run check` passou (414 testes). Sem commit de `memoria/` ainda.

## 2026-10-24 – desvio: PRs 1 e 2 abertos como rascunho

PR 1 = #88 (`feat/62-appointment-lookups`) e PR 2 = #89 (`feat/62-booking-steps`, base na ramificação do #88). No PR 2, a busca de cliente usa `useApiQuery` com caminho nulo sem texto, em vez de `usePaginatedList`, então `src/hooks/use-paginated-list.ts` não mudou. A etapa "Cliente" não tem tela até o PR 3, e a verificação no navegador (`/booking`, `/appointments` e a etapa nova) fica para o PR 3, com o banco local e o admin local; o PR 2 só passou em `npm run check` e `npx next build`.

## 2026-10-24 – desvio: o indicador de etapas não cabe com cinco etapas a 360 px

Na verificação do PR 3, o título da etapa atual sumia (a 360 px, "5 P"), porque cada etapa que não é a atual reserva 52 px com a linha de ligação. Fora do plano, `src/components/shared/step-form.tsx` esconde as linhas abaixo de 448 px quando há mais de quatro etapas (o assistente do cliente, com quatro, não muda), e `docs/padroes/componentes.md` e o módulo da tela ganharam uma frase. Os dois arquivos entraram na lista do plano; o Yvan precisa confirmar o desvio. Outros desvios do PR 3: o "Resumo do pedido" fica abaixo das etapas, como na janela de reagendamento, e não ao lado a partir de 1024 px, como o plano dizia; a janela "Novo agendamento" tem `close` que fecha mesmo com o envio marcado como em andamento, porque o sucesso chama `close` antes de o envio terminar.

## 2026-10-24 – decisão: verificação local do PR 3

Banco local, admin local e `next start` na porta 3060, com roteiros do scratchpad (`verify-new.mjs`, `verify-portal.mjs`, `lh-snapshots-new.mjs`). Novo agendamento a 360 e 1440 px, claro e escuro: etapas, erros, busca ("zzz" vazio, "SOUZA" dá Ana Souza, Enter não avança), veículos de Ana Souza (Polo e Argo), Lavagem simples R$ 40,00 e Cera R$ 35,00 (total R$ 75,00), volta e troca de serviço mantendo data, horário e Pix, falha `NOT_IMPLEMENTED` no topo com a janela aberta, Esc devolve o foco ao botão, sem transbordar. `/booking` e `/appointments` do cliente (conta criada em `/register`): veículos da demonstração com "Cadastrar veículo", serviços, adicionais, data e horário, e a janela "Editar agendamento" sem "Cadastrar veículo", com o foco em "Cancelar". Lighthouse de acessibilidade em snapshot: 1,0 em 36 estados (página e oito estados da janela, nos quatro temas/larguras). Não rodados: o teclado completo (setas nos botões de opção, Tab) e o desempenho do celular; o `seed-demo.sql` com o cliente novo não foi carregado no banco local (a demonstração não lê o banco).

## 2026-10-24 – decisão: PRs 1 e 2 incorporados, PR 3 aberto

#88 (70c3349) e #89 (5314841) foram incorporados na `main` pelo Yvan enquanto a sessão estava parada; o PR 3 passou a ter a `main` como base, com a `main` mesclada na ramificação (`feat/62-new-appointment`). PR 3 = #91, rascunho. Ambiente local encerrado (`next start` parado, `npx supabase stop`).

## 2026-10-24 – decisão: PR 3 incorporado e PR 4 aberto

O #91 (PR 3, 76b7b24) foi incorporado pelo Yvan, que também aprovou o desvio do `step-form.tsx`. PR 4 = #92 (`feat/62-edit-appointment`, "Closes #62"), rascunho, com a `main` mesclada (conflito de adição em `appointment-wizard.tsx`, `appointment-views.tsx` e no módulo da tela, resolvido com a versão da ramificação, que é a da `main` mais o modo edição). Verificação local: "Editar" nos sete status; edição de um "Agendado" em quatro etapas preenchidas (Virtus, Lavagem simples, 26/10 09:00, Pix, total R$ 50,00), falha de demonstração no topo, "Cancelar" devolve o foco a "Editar"; limites de data: "Agendado" de 26 a 31/10 (hoje já sem horário), "Concluído" e "Em espera" até 24/10 com "Mês anterior" habilitado, "Cancelado" de 1 a 31/10 (inclui dias depois de hoje); sem transbordar nas duas larguras e nos dois temas; Lighthouse de acessibilidade 1,0 em 24 estados. Alteração temporária de `src/lib/demo` e `api-client.ts` (desfeita por `git checkout -- src`): gravação 200 fecha as janelas, relê a lista e deixa o foco em "Ver detalhes" do cartão; 409 mantém o aviso no topo e relê o agendamento e o detalhe; releitura que falha mostra "Tentar novamente", bloqueia o envio e, ao funcionar, libera o formulário. Na demonstração, `updatedAt` não muda na releitura, então a etapa não volta à primeira (com a rota real, a chave do `StepForm` muda). Não rodados: teclado completo e desempenho do celular. Ambiente local encerrado.

## 2026-10-24 – desvio: verificações que faltavam, feitas depois da abertura do #92

O plano exigia o teclado e o LCP/CLS do celular, e eu tinha deixado os dois e a releitura com `updatedAt` novo como "não verificados" ao marcar o #92 como pronto. O Yvan apontou que o último PR deve trazer tudo verificado; as três verificações e a carga do `seed-demo.sql` foram feitas no ambiente local, e os resultados estão no relatório (seção "Testes executados"). Nenhum arquivo de `src/` mudou, então o plano continua `concluido`. Lição: a etapa 03 manda corrigir o que faltar antes de abrir o PR; o relatório não pode listar como pendência uma verificação que o próprio plano prometeu.

## 2026-10-24 – decisão: etapa 03 feita

`02_relatorio.md` gravado e plano em `concluido`, no PR #92. O plano, as notas e o relatório entram nesse PR, porque os PRs anteriores não levaram `memoria/`. #88, #89 e #91 já estão incorporados; só o #92 fica para revisão.
