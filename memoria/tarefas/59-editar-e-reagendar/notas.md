# Notas: 59-editar-e-reagendar

Registro do PR 3 da #59. Contexto anterior: `../59-agendar-e-editar/01_plano.md`, `notas.md` e `02_relatorio.md`. Ao retomar, ler este plano complementar e estas notas, depois somente os módulos necessários à etapa.

## 2026-10-22 — descoberta: retomada e GitHub

Yvan pediu a análise da ICM adotada pelo Glow e a etapa 01 de 04 do terceiro PR. Confirmados no GitHub os PRs #75 e #76 incorporados, a issue #59 aberta e nenhum PR aberto. A cópia local estava em `58959f8`, sem alterações; `git fetch origin` e `git merge --ff-only origin/main` trouxeram `9e8a4a9`. Criada a ramificação `feat/59-edit-and-reschedule`, sem upstream. Nenhum commit ou envio nesta sessão.

O plano geral está em `em_execucao`, aprovado anteriormente por Yvan, com L1–L8 escolhidas. O complemento fica em pasta própria para preservar esse registro e entregar um `01_plano.md` em `aguardando_aprovacao` para o recorte solicitado. A implementação ainda não começou.

## 2026-10-22 — descoberta: análise da ICM

Fonte primária consultada: [README de Jake Van Clief](https://github.com/RinDig/Interpretable-Context-Methodology/blob/main/README.md). A proposta usa diretórios e Markdown para orientar um agente ao longo de etapas, carregar contexto seletivamente e oferecer artefatos intermediários editáveis pelo humano. Não depende de uma LLM específica ou de vários agentes.

Correspondência observada no Glow:

| Papel na ICM | Implementação local |
|---|---|
| Identidade e entrada | `AGENTS.md` |
| Roteamento | `guia/CONTEXT.md` e `docs/<assunto>/CONTEXT.md` |
| Contrato de cada etapa | `workflows/01_planejar.md` a `04_encerrar.md` |
| Referências seletivas | RF/RN/UC, dados, rotas, padrões e decisões em `docs/` |
| Artefatos de trabalho | Planos, notas e relatórios em `memoria/tarefas/` |

Avaliação: a adaptação é coerente com a decisão 0031. Os contratos são arquivos, não necessariamente diretórios numerados, mas mantêm a separação das etapas. A rastreabilidade por identificadores, a aprovação humana e a separação entre documentação modular e documentos formais tornam a revisão concreta.

Cuidados observados: o plano geral tem 411 linhas e reúne três PRs; convém retomar pelo recorte atual e conservar o histórico por referência. As notas contêm instruções operacionais de outra ferramenta/ambiente que são evidências históricas, não permissões novas. Regras de `.claude/settings.json` não configuram automaticamente o Codex: os limites de `AGENTS.md` e `guia/regras.md` devem ser obedecidos diretamente. Não foi alterada a arquitetura ICM nem criada uma ADR.

## 2026-10-22 — decisão do usuário: preferência de modelos

Preferência explícita de Yvan, registrada para continuidade deste trabalho:

| Tipo de tarefa | Modelo preferido |
|---|---|
| Trivial: edições rápidas, regex, CSS, scripts isolados | GPT-6 Luna ou GPT-5.6 Terra |
| Planejamento: arquitetura, banco, engenharia de prompt | GPT-6 Astra, raciocínio mínimo/médio |
| Complexa: regras difíceis, refatoração de legado, agentes autônomos | GPT-6.1 Sol ou GPT-6 Sol |

Para esta etapa, a preferência é GPT-6 Astra com raciocínio médio. Yvan informou ter iniciado o chat com Astra em Alto. A sessão não dispõe de ferramenta para mudar seu próprio modelo ou esforço durante a execução; o agente não afirmou ter feito essa troca. Usar a preferência quando houver controle suportado e, caso contrário, informar a limitação. Este arquivo registra a preferência no projeto; não representa alteração de configuração global ou garantia de memória automática entre chats. A preferência não autoriza criar outros chats ou delegar tarefas por conta própria.

## 2026-10-22 — descoberta: diferenças do recorte

Além de adicionar os modos, é necessário alterar `booking-schedule-step.tsx` para manter o instante original conforme RN033, e `booking-summary.tsx` para mostrar indisponíveis. Esses dois arquivos apareciam apenas no PR 2 na lista geral. `appointment-card.tsx` precisa acompanhar o nome do callback comum; `appointment-list.tsx` já possui `onChange={list.reload}`. A aprovação anterior não foi reescrita.

## 2026-10-22 — dúvida: L9

UC25 FE02 não descreve a tela quando não sobra principal/complementar, exigido por RN005. Opção recomendada: aviso, confirmação impedida e link opcional para um novo agendamento. Alternativa: aviso e retorno ao detalhe, sem link. Texto e destino da documentação constam em L9 do plano complementar. Nenhuma opção marcada pelo agente.

## 2026-10-22 — verificação da etapa 01

Somente arquivos de memória criados/alterados; nenhuma implementação, instalação, execução de banco, leitura de `.env*`, alteração de documento formal, teste de aplicação ou build. Verificação desta etapa: diff e caminhos dos arquivos previstos. Os 411 testes citados no relatório anterior são evidência dos PRs anteriores, não uma execução desta sessão.

## 2026-10-22 — aprovação e construção (etapa 02)

Yvan aprovou o plano e marcou L9, opção 1, no arquivo, com `aprovado_por: yvan` e `aprovado_em: 22/10/2026`. Conferida a aprovação, o status passou a `em_execucao`, conforme o contrato da etapa 02; os campos de aprovação não foram alterados pelo agente. L3, L7 e L9 foram incorporadas aos módulos de agendamento.

Implementados os modos de edição e reagendamento no assistente existente, a janela sobre o detalhe e as ações dos sete status. Edição preserva os valores e o instante original (RN033), envia a versão sem reformatar e relê o registro após conflito. Falha nessa releitura bloqueia novo envio até a recuperação; mudança de status também desabilita a edição. Reagendamento tem duas etapas, composição fixa e aviso dos itens indisponíveis; L9 impede confirmar quando não resta principal/complementar. O sucesso fecha ambas as janelas e recarrega a lista; a demonstração continua recusando gravações.

Conferidos os wireframes de agendamento e histórico com renderização local dos PDFs; nenhum documento formal foi aberto. Consultadas as APIs oficiais de [Dialog do Base UI](https://base-ui.com/react/components/dialog) e [reset do React Hook Form](https://react-hook-form.com/docs/useform/reset). Não foram alterados os componentes compartilhados nem adicionadas dependências.

### Ajuste autorizado do Prettier

O primeiro `npm run check` parou porque o Prettier tentava formatar `supabase/.temp/linked-project.json`, arquivo gerado pelo CLI e já ignorado pelo Git por configuração da subpasta. O `.prettierignore` da raiz só excluía Markdown. Yvan autorizou na conversa a correção adequada; acrescentada somente a exclusão `supabase/.temp/` e incluído o arquivo no escopo do plano. O JSON não foi lido nem modificado. A exclusão de artefatos gerados segue a [documentação oficial do Prettier](https://prettier.io/docs/ignore).

### Ambiente e verificações locais

- A instalação local estava incompleta. Restaurada pelo lockfile com `npx -y npm@11.21.1 ci`, sem alterações em `package.json`/lockfile. A instalação relatou nove vulnerabilidades altas em dependências de desenvolvimento; `npm audit --omit=dev --audit-level=high` não encontrou vulnerabilidades de produção. Não houve atualização de dependências fora do plano.
- O primeiro build falhou ao baixar Nunito de `fonts.gstatic.com`; a repetição concluiu sem mudança de código ou contorno de configuração.
- Navegador Chrome isolado, aplicação compilada em `localhost:3059`, dados fictícios da demonstração. Configuração do Supabase vazia no processo de teste, sem conexão com banco; respostas públicas de empresa e sessão controladas no navegador. Isso verifica a tela, não a integração de autenticação ou o futuro backend.
- Scripts descartáveis externos ao repositório, em `%TEMP%/glow-pr59-3`, verificaram os fluxos e produziram capturas. Não constituem nova suíte permanente de componentes (0052).
- Fluxos principais em 360 × 800 e 1440 × 900, claro/escuro: preenchimento, calendário, pagamento, erro `NOT_IMPLEMENTED`, foco no aviso, Esc retornando ao detalhe e foco no acionador; duas etapas do reagendamento com escolhas inicialmente vazias; nenhuma chamada de rede de gravação a `/api/me/*` ou transbordamento horizontal.
- Respostas temporárias controladas verificaram: original passado em domingo fechado e original durante a pausa; preservação exata do instante enviado e da versão; `appointmentId` na prévia de edição; conflito com nova versão, falha de releitura e recuperação, mudança para `in_progress`; indisponibilidade parcial e total; falha da prévia sem aviso falso de indisponíveis, seguida de recuperação; sucesso fechando as janelas e recarregando a lista; Esc bloqueado durante o envio.
- Conferidas as ações dos sete status, a regressão do cancelamento, o agendamento novo com `NOT_IMPLEMENTED`, a manutenção de data/horário/pagamento ao trocar serviço e veículo e o adicional compartilhado mantido enquanto outro principal correspondente está escolhido. Navegação com Tab/Enter/Esc e retorno de foco conferidos. Repetido o calendário de edição em `Asia/Tokyo`, mantendo data e hora da empresa.
- Lighthouse 13.5.0, auditoria de acessibilidade por snapshot: **100/100, nenhuma auditoria reprovada em 24 snapshots** (quatro etapas de edição e duas de reagendamento × dois tamanhos × dois temas). JSONs em `%TEMP%/glow-pr59-3/lighthouse-*.json`. Não é uma medição de desempenho/LCP.
- A instrumentação temporária de `src/lib/api-client.ts` foi removida e o arquivo restaurado byte a byte antes da verificação final; `git diff --exit-code -- src/lib/api-client.ts` passou. Nenhuma simulação de sucesso ou conflito será entregue no código.

### Limites e continuidade

Permanecem para a etapa 03 a revisão na pré-visualização com sessão real, o CI/build remoto e a reavaliação da pendência anterior de LCP em `/booking`. Não afirmar persistência real, validação de acesso integrado ou sucesso em todos os cenários de falha das listas existentes a partir destes testes locais. Não houve migration, publicação, envio de código ou abertura de PR. O relatório cumulativo será atualizado na etapa 03, no caminho previsto no plano.

### Fechamento local da etapa 02

Após restaurar o cliente da API: `npm run check` passou (formatação, tipos, lint sem avisos e **411 testes em 22 arquivos**); build Next.js 16.4.1 concluído com sucesso; repetidos os fluxos principais nas quatro combinações de tamanho/tema, todos aprovados. Conferidos também os dois Agendados, com seus serviços pré-selecionados (inclusive adicional), e os dois Concluídos, com totais de reagendamento de R$ 105,00 e R$ 190,00. `git diff --check` passou, sem instrumentação restante no código.

Commits locais: `283439f` (exclusão dos temporários no Prettier), `f28c1a1` (funcionalidade e módulos) e um commit de memória com este registro. Branch `feat/59-edit-and-reschedule`, sem envio. Status mantido em `em_execucao`; a conclusão formal e o PR pertencem à etapa 03.

## 2026-10-22 — etapa 03 autorizada

Yvan pediu para prosseguir após a conclusão local. Conferidos novamente a issue #59, o diff, o checklist de segurança e `origin/main`: branch já atualizada, sem conflitos. `npm run check` repetido com sucesso (411 testes); auditoria de produção repetida sem vulnerabilidades. Relatório cumulativo atualizado, sem reescrever a evidência histórica dos PRs #75/#76. Plano complementar marcado `concluido`, preservando aprovação e escolha L9; isto indica implementação entregue, não aprovação humana do PR nem encerramento da issue.

Incluídas duas capturas de dados fictícios em `evidencias/`, como artefatos da entrega exigidos pelo procedimento de PR, e a linha correspondente na relação de arquivos do plano. Nenhuma mudança adicional no produto. A pré-visualização autenticada e o LCP continuam pendentes; não foram declarados aprovados.

Tamanho conferido: 501 linhas alteradas nos seis componentes, além de documentação e uma linha de configuração. O procedimento manda dividir alterações acima de cerca de 400 antes da revisão. Abrir o terceiro PR como rascunho torna o resultado concreto e permite CI/pré-visualização; antes de marcá-lo pronto, solicitar a escolha entre manter o recorte aprovado como exceção explícita ou dividir edição e reagendamento. Não inventar aprovação dessa exceção nem pedir revisão a um integrante enquanto isso estiver pendente.

Terceiro PR aberto: [#77](https://github.com/yvanshaw1/Glow-ProjetoAldo/pull/77), em rascunho, com `Closes #59`, passos de verificação, capturas e checklist. Branch enviada normalmente, sem force push; CI e Vercel iniciados. Decisão sobre tamanho solicitada a Yvan após disponibilizar o diff concreto. Nenhuma incorporação ou encerramento da issue.
