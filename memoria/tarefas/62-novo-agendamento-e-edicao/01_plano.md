---
issue: 62
titulo: "Telas de agendamentos do painel com dados de demonstração: novo agendamento e edição"
areas: [frontend]
tipo: funcionalidade
requisitos: [UC11, UC26, RF050, RF051, RF055, RN003, RN004, RN005, RN006, RN009, RN010, RN011, RN012, RN013, RN014, RN015, RN016, RN032, RN033, RN034, RNF002, RNF004, RNF005, RNF011]
status: concluido
aprovado_por: yvan
aprovado_em: 12:44 - 24/10/2026
---

# Plano: Telas de agendamentos do painel com dados de demonstração: novo agendamento e edição

## Objetivo

Construir, em `/admin/appointments` (T6 de `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, decisão 0055), o assistente do funcionário, com dados de demonstração:

- **Novo agendamento** (UC11, RF050, RF051): botão na página e janela com cinco etapas, como o wireframe `NewAppointmentStep1` a `Step5`: "Cliente" (busca), "Veículo", "Serviços", "Data e horário" e "Pagamento e resumo", com o resumo de `POST /api/admin/appointments/preview` ao lado (RN010, RN034) e a volta a qualquer etapa antes de confirmar (RNF002).
- **Edição** (UC26 FA01, RF055, RN032, RN033): "Editar" no detalhe, em qualquer status, abre o mesmo assistente numa janela, sem a etapa do cliente e com as escolhas do agendamento.
- As buscas do assistente (`GET /api/admin/appointments/lookup/clients`, `.../vehicles` e `.../services`) e as gravações `POST /api/admin/appointments` e `PATCH /api/admin/appointments/:id` entram na lista de demonstração; as gravações respondem `NOT_IMPLEMENTED`.

Nenhuma rota, migration ou esquema de validação e nenhum import de `src/server/`. Nenhuma dependência nova.

## Base conferida

- Issue #62 aberta, sem PR aberto no repositório. `origin/main` e a ramificação desta sessão (`claude/eager-sanderson-f0828f`) em 36da37e (#87), árvore limpa.
- Dependências cumpridas: a #61 (PRs #84 a #87, fechada em 24/10/2026), a #59 e a #78 (assistente do cliente, as etapas de data, pagamento e resumo já em `src/components/shared/`) e a #56. As rotas (#46, #49 e #50) estão abertas e sem código: `src/app/api/admin/appointments/` só tem READMEs.
- Herdado da #61 (nota de passagem): "Novo agendamento" e "Editar" ficaram fora dela; as janelas sobre o detalhe ficam sempre montadas com o gatilho `hidden`, para o aviso de um 409 ser lido; o aviso de falha vai ao topo da janela, com o foco (`FormAlert`); os `combobox` precisam de `aria-label`; a leitura que acompanha o formulário não desativa os campos nem o foco (`componentes.md`); `src/lib/demo/admin-appointments.ts` tem `ACCOUNTS`, `COMBOS` e `ROWS`, e `previewOrder` e `CATALOG` saem exportados de `src/lib/demo/appointments.ts`.
- O reagendamento do painel (`reschedule-appointment-dialog.tsx`) repete a lógica do modo `reschedule` do `BookingWizard`; a #61 deixou a unificação para esta tarefa (P4).
- Wireframes lidos (celular, `Step1` a `Step5`): janela "Novo agendamento" ancorada embaixo, indicador de cinco etapas, busca de cliente com o nome e o e-mail, veículos "marca modelo · ano" com a placa, serviços com filtro por categoria, "Sob orçamento" e "Total estimado", calendário e grade de horários com o horário de término, resumo em quatro cartões com as formas de pagamento. O que não tem requisito no Glow fica de fora, como na #59: o filtro por categoria, "Sob orçamento", o "+1d" e o término em cada horário (previsão só no resumo, `agendar-servico.md`).
- Divergência entre o wireframe e os documentos: o wireframe tem cinco etapas, e o UC11 põe a forma de pagamento no passo 5 e o resumo no 6; como no assistente do cliente, a forma de pagamento fica na última etapa, junto do total que ela muda (`agendar-servico.md`, Etapas), e as cinco etapas do wireframe e do RF050 se mantêm.

## Como funciona

### Novo agendamento

- Botão "Novo agendamento" ao lado das abas de `/admin/appointments` (ícone `CalendarPlus`; no celular o texto cabe a 360 px, ou fica só o ícone com o nome acessível). A janela fica ancorada embaixo no celular, com rolagem interna, e a partir de 1024 px mostra o "Resumo do pedido" ao lado do formulário, como a janela de reagendamento. "Cancelar" na primeira etapa e Esc fecham; a janela não fecha durante o envio; o foco volta ao botão.
- **Cliente** (UC11 passo 2): campo de busca (nome ou e-mail, 300 ms, até 100 caracteres) e as opções em botões de opção nativos, em páginas de 10, cada uma com o nome e o e-mail. Sem texto, a dica; sem resultado, o estado vazio com o caminho para cadastrar o cliente (FE01). Trocar o cliente zera veículo, serviços e adicionais (RN003, RN004).
- **Veículo** (passo 3): os veículos do cliente, no mesmo cartão do assistente do cliente. Sem veículo, o assistente indica cadastrar o veículo nos detalhes do cliente (FE02), com o caminho para `/admin/clients`.
- **Serviços** (passo 4, FA02): os serviços com o valor do porte do veículo e os adicionais do principal marcado (RN006, RN009), como no assistente do cliente. Trocar o veículo mantém os serviços marcados.
- **Data e horário e Pagamento e resumo** (passos 5 e 6): as etapas compartilhadas da #59, sem mudança para o novo agendamento (RN013, RN015 e RN016: horário de funcionamento, nunca no passado, sem controle de capacidade).
- Envio: "Confirmar agendamento" ("Agendando…"); na demonstração, o aviso de `NOT_IMPLEMENTED` no topo do formulário, com a janela aberta. Concluído (rota real), a janela fecha e a listagem é lida de novo (UC11 passo 8).

### Edição

- "Editar" no rodapé do detalhe, em qualquer status (UC26 FA01, RN032); janela "Editar agendamento", sobre o detalhe, com as quatro etapas preenchidas pelo agendamento: veículo (entre os do cliente), serviços e adicionais, data e horário, forma de pagamento. A prévia leva `appointmentId`, e o envio leva `updatedAt` sem conversão, como na #59. "Salvar alterações" ("Salvando…").
- O calendário abre no mês do agendamento; manter o instante original vale sempre (RN033); a orientação das outras escolhas segue o status (L5).
- `VERSION_CONFLICT` mantém o aviso no topo, com o foco, e lê o agendamento de novo (RNF011), como a janela de edição do cliente.

### Dados de demonstração (decisão 0055)

- `lookup/clients`: os clientes do `seed-demo.sql` (mais o de P2), filtrados pela busca sem distinção de maiúsculas, em ordem alfabética, paginados. `lookup/vehicles`: os veículos do cliente, a partir de `ACCOUNTS`/`VEHICLES` de `admin-appointments.ts`. `lookup/services`: a resposta de `answerBookableServices` do cliente, pelo porte do veículo. `POST` e `PATCH` sem `load`, recusados.
- O detalhe passa a trazer o `clientId` (L2).

## Ordem da construção

Em quatro PRs, cada um com a verificação local e a etapa 03 próprias (P1), todos com "Refs #62" e o último com "Closes #62":

**PR 1, base** (`feat/62-appointment-lookups`): tipos, dados e entradas de `routes.ts` das buscas e das duas gravações; `clientId` no detalhe; o cliente sem veículo (P2); `rotas.md` (L1, L2). Verificação das respostas por um teste temporário do Vitest com `apiRequest`, apagado antes do commit.

**PR 2, etapas** (`feat/62-booking-steps`), depois do PR 1: as etapas de veículo e de serviços passam do portal para `src/components/shared/`, com o endereço e os textos por propriedade (P3); o assistente do cliente passa a usá-las; a etapa "Cliente" nasce em `src/components/admin/appointments/`. Verificação: `/booking` e `/appointments` do cliente, que mudam de importação.

**PR 3, novo agendamento** (`feat/62-new-appointment`), depois do PR 2: o assistente do painel no modo novo, a janela, o botão na página e a linha "Cliente" do resumo; módulo da tela (L3).

**PR 4, edição** (`feat/62-edit-appointment`), depois do PR 3: o modo edição, a janela, "Editar" no detalhe, a orientação de data e horário por status (L5, P5) e o conflito de versão; módulo da tela (L4, L5). Fecha a issue.

## Critérios de aceitação e verificação

Os passos de tela são manuais (decisão 0052). A demonstração dá os valores esperados: a Lavagem simples custa R$ 40 no porte pequeno e R$ 50 no médio, a Cera de carnaúba (adicional) R$ 35, e as taxas do `seed.sql` são todas zero, então o total é o subtotal. Ana Souza tem dois veículos (Polo `GLW1A01` e Argo `GLW4K14`, os dois pequenos); Bruno Lima tem o Corolla (`GLW2B02`, médio); o cliente de P2 não tem veículo.

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um cliente sem veículo, quando chego à etapa do veículo, então o assistente indica cadastrar o veículo nos detalhes do cliente (UC11 FE02) | Local, com o admin local: busco o cliente de P2 e escolho-o; a etapa "Veículo" mostra o estado vazio de L3 com o caminho para Clientes, "Próximo" mostra "Escolha o veículo." e nada avança sem veículo |
| Dado o resumo, quando volto e troco um serviço, então as outras etapas continuam (RNF002, RF051) | Local: Ana Souza, Polo, "Lavagem simples" com "Cera de carnaúba", um dia útil e um horário, "Pix"; no resumo o total é R$ 75,00; "Voltar" até "Serviços", troco por "Lavagem completa"; ao voltar a "Data e horário" e a "Pagamento e resumo", o dia, o horário e "Pix" continuam, o cliente e o veículo também, e o resumo traz os valores novos da prévia |
| Dado a busca de cliente, quando digito, então só os clientes dele aparecem; sem texto, a dica; sem resultado, o caminho para cadastrar (UC11 passo 2 e FE01) | Local: "souza" dá Ana Souza; "BRUNO" (sem distinção de maiúsculas) dá Bruno Lima; "zzz" mostra o vazio de L3 com o caminho para `/admin/clients`; sem texto, a dica e nenhuma chamada a `lookup/clients` na lista de requisições; a busca vale 300 ms depois da última tecla |
| Dado outro cliente escolhido depois do veículo, quando volto e troco, então o veículo e os serviços saem e a data e o pagamento ficam (RN003, RN004) | Local: troco Ana Souza por Bruno Lima na etapa 1; "Veículo" volta vazia, "Serviços" sem marca, data, horário e forma de pagamento iguais |
| Dado o veículo escolhido, quando vejo os serviços, então vejo os valores do porte dele e os adicionais do principal marcado (RN006, RN009, UC11 FA02) | Local: Polo (pequeno) "Lavagem simples" R$ 40,00, Corolla (médio) R$ 50,00; marcar o principal mostra "Adicionais de Lavagem simples" com "+ R$ 35,00" na "Cera de carnaúba"; desmarcar o tira; trocar o veículo mantém os serviços e mostra os valores do novo porte |
| Dado a data e o horário, quando escolho, então valem o funcionamento da empresa e o instante futuro, sem controle de capacidade (UC11 FE03, RN013, RN015, RN016) | Local: domingo e dias passados desativados; os horários de 30 em 30 minutos fora da pausa; o horário que já passou, hoje, não aparece; a previsão de conclusão só no resumo |
| Dado o resumo, quando confirmo, então a demonstração recusa e nada é gravado (UC11 passo 8, decisão 0055) | Local: "Agendando…" com `aria-disabled` e o foco no botão; no topo, com o foco, "Esta ação ainda não está disponível nesta versão de demonstração."; a janela aberta, a listagem igual, e nenhuma chamada a `/api/admin/*` além das buscas, da prévia e da gravação recusada |
| Dado um agendamento de qualquer status, quando abro o detalhe, então "Editar" aparece ao lado das ações do status (UC26 FA01, RN032) | Local, um de cada um dos sete status (Agendado, Em espera, Em execução, Finalizado, Concluído, Cancelado e Reagendado): "Editar" em todos, e as ações de L3 do módulo da #61 nos mesmos lugares |
| Dado "Editar", quando abro a janela, então as quatro etapas vêm preenchidas e o resumo traz os valores recalculados (UC26 passos 3 a 5, RN033) | Local: veículo, serviços e adicionais, data, horário e pagamento do agendamento; sem a etapa "Cliente"; o calendário no mês do agendamento; a prévia com `appointmentId`; trocar o veículo lista só os do cliente (L2) e mantém os serviços; "Salvar alterações" mostra o `NOT_IMPLEMENTED` no topo, com a janela aberta |
| Dado a edição, quando escolho data e horário, então a tela orienta pelo status do agendamento (RN033, UC26 FA01, FE02) | Local: "Agendado" oferece instantes futuros (adiantados ou não); "Em espera" até "Reagendado", só até o momento da edição; "Cancelado", todo horário de funcionamento; o instante original sempre selecionável; nunca o domingo nem fora do horário |
| Dado o 409 `VERSION_CONFLICT`, quando acontece na edição, então o aviso fica no topo e o agendamento é lido de novo (RNF011) | Local, com alteração temporária de `routes.ts`, sem commit, desfeita e conferida por `git diff`: uma gravação que responde 409 mantém o aviso, troca os campos e a versão; se a releitura falha, "Tentar novamente" e o envio com a versão antiga fica bloqueado |
| Dado o sucesso do envio, quando acontece, então as janelas fecham e a lista é lida de novo (UC11 passo 8) | Local, com alteração temporária de `routes.ts` (uma gravação que responde 200), sem commit: a janela fecha, a listagem lê de novo, e o foco vai a um lugar definido na verificação (lacuna herdada da #61, ver Riscos) |
| Dado o carregamento, o vazio e a falha, quando ocorrem, então a tela mostra o lugar reservado, a mensagem ou o aviso com "Tentar novamente" (RNF004) | Local: os 400 ms da demonstração em cada etapa; falha de cada busca por alteração temporária de `routes.ts`, "Tentar novamente" lê de novo, sem leitura repetida sozinha; a prévia em falha deixa "Confirmar agendamento" indisponível sem desativar os campos |

Critérios comuns às telas de demonstração (issue):

| Critério | Verificação |
|---|---|
| Esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md` (decisão 0041) | Revisão: o que fica de fora do wireframe está em "Base conferida" e em "Fora do escopo" |
| `useApiQuery` ou `usePaginatedList` e o endereço de `rotas.md`; tipos em `src/shared/api/appointments.ts`; dados em `src/lib/demo/`, com os nomes do `seed-demo.sql` | Revisão do diff; as gravações são as únicas chamadas fora dos dois hooks (ações do clique, nunca repetidas, `api.md`) |
| O aviso de demonstração na tela; o envio de qualquer formulário mostra o `NOT_IMPLEMENTED`, e nada é gravado | O aviso da página continua logo abaixo do `h1`; as janelas não o repetem; "Confirmar agendamento" e "Salvar alterações" mostram o aviso da API |
| A 360 × 800 primeiro e a 1440 × 900, claro e escuro, pelo teclado, sem transbordar, Lighthouse de acessibilidade sem auditoria reprovada | Local, no Chrome sem interface: a página, o detalhe e cada etapa das duas janelas nas duas larguras e nos dois temas, `scrollWidth` igual a `innerWidth`; pelo teclado, o botão, a busca, as opções, o calendário, a grade de horários e os botões de cada etapa (o foco fica na janela e volta ao botão que a abriu); Lighthouse 13.5.0 de acessibilidade com o cookie da sessão de teste, celular e computador, claro e escuro, as janelas pelo modo `snapshot` |
| Nenhuma rota, migration ou esquema de validação novo, e nenhum import de `src/server/` | `git diff --stat` sem `src/app/api/` nem `src/shared/validation/` (e, só em P5 opção 1, uma linha de `src/server/rules/editing.ts`); `grep` por `@/server` nos arquivos novos |

### Como a verificação local é feita

Como na #61 (notas de passagem em `side-session-notes`, roteiros `61-scripts-de-verificacao/`), em cada PR:

- **Banco local.** Docker Desktop aberto, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`; `npx supabase start` no primeiro plano (com `timeout`) e `npx supabase db reset`; nunca `--linked` nem `--db-url` (decisão 0043). A saída de `supabase start` imprime chaves locais: mascarada antes de ler.
- **Conta de teste.** Um admin local criado por `supabase/scripts/create-admin.mjs`, com e-mail fictício `@example.com` e a senha gerada em arquivo do scratchpad, nunca exibida; só existe no banco local.
- **Aplicação.** `npx next build` com as variáveis do banco local passadas ao processo (sem exibi-las nem gravá-las) e `next start -p 3060` em segundo plano, encerrado pelo PID.
- **Telas**, num Chrome sem interface controlado pelo `puppeteer-core` do cache do Lighthouse 13.5.0 (o painel do app oculto trava o foco do Base UI; o tema padrão é o escuro, e o claro vem de `prefers-color-scheme`); roteiros da #61 copiados para o scratchpad e adaptados (caminhos de `start.sh` e `local-env.sh`, `admin.json` gerado de novo). Armadilhas já registradas: `element.click()` no navegador para o que fica fora da tela, `input.select()` em vez de triplo clique, `formatCurrency` com espaço não separável, heredoc com apóstrofo (gravar roteiros com a ferramenta Write), `$$` em `String.replace`.
- **Alterações temporárias**, sem commit, por `globalThis.__demo` e por trechos de `routes.ts` e dos módulos de demonstração (falha de cada busca e da prévia, uma gravação que responde 409 e outra que responde 200), desfeitas com `git checkout -- src` e conferidas com `git status`.
- **Lighthouse.** `npx -y lighthouse@13.5.0` com `--only-categories=accessibility,performance`, celular e computador, claro e escuro (`--blink-settings=preferredColorScheme=1`), com o cookie da sessão de teste por `--extra-headers` num arquivo do scratchpad apagado no fim. O LCP e o CLS do celular ficam no PR.
- **Verificações automáticas.** `npm run check` sem erros nem avisos e `npx next build` em cada PR.
- **Encerramento.** `next start` encerrado, `npx supabase stop`, alterações temporárias desfeitas, `headers.json` apagado.
- Sem dependência nova, não há conferência em contêiner.

## Arquivos

| Arquivo | Ação | PR |
|---|---|---|
| `src/shared/api/appointments.ts` | alterar: `clientId` em `AdminAppointment`, `AdminClientOption` | 1 |
| `src/lib/demo/admin-appointments.ts` | alterar: os ids dos clientes, as respostas das três buscas, o `clientId` do detalhe | 1 |
| `src/lib/demo/routes.ts` | alterar: as três buscas (leitura), `POST /api/admin/appointments` e `PATCH .../:id` (sem `load`) | 1 |
| `supabase/seed-demo.sql` | alterar: um cliente sem veículo (P2) | 1 |
| `docs/agendamento/rotas.md` | alterar (L1, L2) | 1 |
| `src/components/portal/appointments/booking-vehicle-step.tsx`, `booking-services-step.tsx` | mover para `src/components/shared/` (`git mv`) e parametrizar | 2 |
| `src/components/portal/appointments/booking-wizard.tsx` | alterar: as importações e as propriedades | 2 |
| `src/components/admin/appointments/booking-client-step.tsx` | criar | 2 |
| `src/hooks/use-paginated-list.ts` | alterar só se a busca sem texto não puder ficar fora do hook (ver Riscos) | 2 |
| `src/components/shared/README.md`, `src/components/portal/appointments/README.md` | alterar: o que passa a morar em cada pasta | 2 |
| `src/components/admin/appointments/appointment-wizard.tsx`, `appointment-form-dialog.tsx` | criar | 3, 4 |
| `src/components/admin/appointments/appointment-views.tsx` | alterar: o botão "Novo agendamento" e a nova leitura da lista | 3 |
| `src/components/shared/booking-summary.tsx` | alterar: a linha "Cliente" | 3 |
| `src/components/shared/step-form.tsx`, `docs/padroes/componentes.md` | alterar: o indicador com mais de quatro etapas (desvio, ver notas) | 3 |
| `docs/agendamento/agendamentos-do-painel.md` | alterar: as seções do novo agendamento e da edição, e "Fora da tela" (L3, L4, L5) | 3, 4 |
| `src/components/admin/appointments/appointment-details-dialog.tsx` | alterar: "Editar" | 4 |
| `src/components/shared/booking-schedule-step.tsx` | alterar: a orientação de data e horário por status | 4 |
| `src/shared/constants/appointment-date-limits.ts` | criar (P5, opção 1) | 4 |
| `src/server/rules/editing.ts` | alterar: passa a importar a tabela (P5, opção 1) | 4 |
| `src/components/admin/appointments/README.md` | conferir (já cita UC11 e UC26) | 3, 4 |
| `memoria/tarefas/62-novo-agendamento-e-edicao/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` | todos |

Estimativa em `src/`, sem testes nem README: PR 1 cerca de 200 linhas (20 de tipos, 120 de dados, 60 de entradas); PR 2 cerca de 260 (170 da etapa "Cliente", 90 de propriedades nas etapas movidas e no assistente do cliente), mais a mudança de lugar de dois arquivos (cerca de 460 linhas, `git mv`); PR 3 cerca de 420 (270 do assistente, 90 da janela, 25 do botão, 15 do resumo, 20 de ajustes); PR 4 cerca de 300 (90 do modo edição, 60 do rodapé e da janela, 25 do detalhe, 60 da orientação, 25 da tabela, 40 do conflito).

### Em comum com outras tarefas

- **#61** (feita): mesmos `src/shared/api/appointments.ts`, `src/lib/demo/admin-appointments.ts`, `src/lib/demo/routes.ts` e o detalhe; esta tarefa só acrescenta.
- **#59 e #58** (cliente): o PR 2 muda as importações e as propriedades das etapas de veículo e de serviços do assistente do cliente; `/booking` e `/appointments` voltam a ser conferidos.
- **#63 a #65**: uma linha por rota em `src/lib/demo/routes.ts` (conflito simples). A #64 (clientes) pode usar o cliente sem veículo de P2.
- **#46, #49 e #50** (rotas): tiram as entradas de `routes.ts`; a #49 e a #50 seguem L1 e L2 de `rotas.md`.
- **#67** (documentos formais): recebe, do relatório, os campos das três buscas e o `clientId` (Arquitetura de Software, Apêndice A).

## Testes previstos

Nenhuma função pura nova com regra de negócio: a tabela de limites de P5 é constante, e a orientação da tela é conferida à mão (decisão 0052), com os valores da tabela acima. `tests/rules/editing.test.ts` já cobre os limites do funcionário e deve continuar passando depois que a tabela mudar de lugar (P5, opção 1). `npm run check` (formatação, tipos, lint e os testes existentes) e `npx next build` devem passar em cada PR.

## Documentação

- `docs/agendamento/rotas.md`: os campos das três buscas e o `clientId` (L1, L2).
- `docs/agendamento/agendamentos-do-painel.md`: as seções "Novo agendamento" (L3) e "Editar" (L4, L5); em "Ações por status", a linha de "Editar" deixa de depender de "quando a tela existir"; em "Fora da tela", sai "Editar" e "Novo agendamento", e entram o filtro por categoria, o "Sob orçamento" e o horário de término em cada horário do wireframe.
- Documentos formais, pela #67: Arquitetura de Software, Apêndice A (as três buscas e o `clientId`); nenhuma `RN` muda, então a Análise do Sistema não precisa de ajuste.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Campos das três buscas do assistente

**Problema.** `rotas.md` descreve `lookup/clients` como "lista resumida de clientes", `lookup/vehicles` como "lista de veículos" e `lookup/services` como "serviços, valores e adicionais", sem campos, ordem, o que a busca compara nem a paginação. A regra de `rotas.md` ("`page` e `pageSize` em toda listagem") não diz se vale para as buscas.

**Opções:**

- [x] **1. Reaproveitar os formatos que já existem (recomendada).** Clientes: `id`, `name` e `email`; veículos: os de `GET /api/me/vehicles`; serviços: os de `GET /api/me/bookable-services`. As três paginadas. Os tipos e as etapas do assistente do cliente servem às duas interfaces, e o contrato fica pequeno.
- [ ] **2. Campos novos só do painel**, por exemplo o telefone do cliente. Mais completo na tela, mas nenhum requisito pede, e os formatos se afastam dos do cliente.

**Texto proposto (opção recomendada):**

- `docs/agendamento/rotas.md`, `GET /api/admin/appointments/lookup/clients`: "Entrada: `search*` (parte do nome ou do e-mail, sem distinção de maiúsculas), `page`, `pageSize`. Resposta: **200** lista paginada de `id`, `name` e `email`, em ordem alfabética do nome; só clientes ativos (RN030)."
- `docs/agendamento/rotas.md`, `.../lookup/vehicles`: "Entrada: `clientId*`, `page`, `pageSize`. Resposta: **200** lista paginada dos veículos do cliente, nos campos de `GET /api/me/vehicles`, na ordem em que foram vinculados (RN003)."
- `docs/agendamento/rotas.md`, `.../lookup/services`: "Entrada: `vehicleId*`, `page`, `pageSize`. Resposta: **200** lista paginada nos campos e na ordem de `GET /api/me/bookable-services`, com o preço do porte do veículo (RN009)."

### L2. O detalhe não traz o cliente do agendamento

**Problema.** Na edição, o assistente lista os veículos do cliente (RN003, RN032) por `lookup/vehicles?clientId=`, mas `GET /api/admin/appointments/:id` só devolve `clientName`, sem o identificador do cliente.

**Opções:**

- [x] **1. Acrescentar `clientId` ao detalhe e às quatro gravações (recomendada).** Um campo, no formato que a #50 vai construir; a tela edita sem outra leitura.
- [ ] **2. Buscar o cliente pelo nome em `lookup/clients`.** Sem mudar o contrato, mas o nome não é único e a busca erraria o cliente.

**Texto proposto (opção recomendada):**

- `docs/agendamento/rotas.md`, `GET /api/admin/appointments/:id`: "Resposta: **200** `id`, `status`, … `clientId`, `clientName`, …" (o campo entra antes de `clientName`, no tipo `AdminAppointment`). As gravações, que respondem neste formato, o herdam.

### L3. Etapas, textos e estados do novo agendamento

**Problema.** UC11 e RF050 dão as etapas e as exceções (FE01 a FE03), mas nenhum documento tem os textos, os estados nem a posição do botão do assistente do painel; `agendamentos-do-painel.md` o deixa "fora da tela".

**Opções:**

- [x] **1. As cinco etapas do wireframe, no estilo do assistente do cliente (recomendada).** "Cliente", "Veículo", "Serviços", "Data e horário" e "Pagamento e resumo", com os textos abaixo.
- [ ] **2. Quatro etapas, com o cliente e o veículo juntos.** Menos cliques, mas contraria o RF050 e o wireframe, e a lista de veículos depende de o cliente já estar escolhido.

**Texto proposto (opção recomendada)**, em `docs/agendamento/agendamentos-do-painel.md`, nova seção "Novo agendamento (UC11, RF050, RF051)":

- Botão "Novo agendamento", com o ícone `CalendarPlus`, ao lado das abas; a janela "Novo agendamento", ancorada embaixo no celular, com rolagem interna até 90% da altura; "Cancelar" na primeira etapa e Esc voltam à página; a janela não fecha durante o envio. O "Resumo do pedido" fica ao lado (a partir de 1024 px) ou abaixo, com a linha "Cliente" antes do veículo.
- **Cliente:** legenda "Para qual cliente é o agendamento?"; campo "Buscar cliente", com a ajuda "Nome ou e-mail" (300 ms, até 100 caracteres); antes do texto, "Digite o nome ou o e-mail para buscar o cliente."; cada opção, o nome e o e-mail, em páginas de 10; sem resultado (FE01), "Nenhum cliente encontrado" e "Confira o que foi digitado ou cadastre o cliente em Clientes.", com o link "Cadastrar cliente" para `/admin/clients`; sem escolha, "Escolha o cliente.". Trocar o cliente tira o veículo, os serviços e os adicionais.
- **Veículo:** legenda "Qual veículo de <nome do cliente> será atendido?"; as opções como no assistente do cliente (`agendar-servico.md`); sem veículo (FE02), "Nenhum veículo cadastrado" e "Cadastre o veículo nos detalhes do cliente, em Clientes, e volte para agendar.", com o link "Ir para Clientes"; sem escolha, "Escolha o veículo." (RN004).
- **Serviços:** legenda "Quais serviços serão feitos?"; o resto, como no assistente do cliente (FA02, RN005, RN006, RN009).
- **Data e horário e Pagamento e resumo:** como no assistente do cliente; botão "Confirmar agendamento" ("Agendando…"). A falha aparece no topo, com a janela aberta; concluído, a janela fecha e a listagem é lida de novo.
- "Fora da tela" deixa de citar "Novo agendamento" e passa a citar o filtro por categoria, o "Sob orçamento" e o horário de término em cada horário.

### L4. "Editar": onde fica, como se chama e o que a janela traz

**Problema.** UC26 FA01 manda o funcionário "acionar a opção de editar", e `agendamentos-do-painel.md` diz só que "Editar" fica ao lado das ações "quando a tela de edição existir". Faltam a posição, os textos, as etapas da janela e o tratamento do conflito de versão, que o assistente do cliente já tem (`agendar-servico.md`, "Edição e reagendamento").

**Opções:**

- [x] **1. A edição do cliente, feita pelo funcionário (recomendada).** "Editar" no rodapé do detalhe, em qualquer status; janela "Editar agendamento" com as quatro etapas preenchidas (sem "Cliente", que não muda, RN003); o conflito como na #59.
- [ ] **2. As cinco etapas, com o cliente editável.** Troca de cliente contraria RN032 (a edição altera veículo, serviços, pagamento, data e horário) e não é pedida.

**Texto proposto (opção recomendada)**, em `docs/agendamento/agendamentos-do-painel.md`, nova seção "Editar (UC26 FA01, RF055)":

- Botão "Editar" no rodapé do detalhe, em qualquer status, ao lado das ações do status; abre sobre o detalhe a janela "Editar agendamento", com as etapas "Veículo", "Serviços", "Data e horário" e "Pagamento e resumo", preenchidas com as escolhas do agendamento; o veículo é um dos do cliente (RN003, `lookup/vehicles` pelo `clientId`); o cliente aparece no "Resumo do pedido". O calendário abre no mês do agendamento; a prévia leva `appointmentId`, e o envio leva `updatedAt` sem conversão. Botão "Salvar alterações" ("Salvando…"); Esc ou "Cancelar" na primeira etapa voltam ao detalhe; a janela não fecha durante o envio.
- `VERSION_CONFLICT`: o aviso fica no topo, com o foco, e o agendamento é lido de novo, trocando os campos e a versão; se a releitura falhar, "Tentar novamente", e o envio com a versão antiga fica bloqueado (RNF011). As ações do detalhe acompanham o agendamento relido.
- Sucesso: as duas janelas fecham e a listagem é lida de novo. Falhas, como o `NOT_IMPLEMENTED` da demonstração, aparecem no formulário; a gravação não é repetida sozinha.
- Em "Ações por status", "Editar" sai da frase "quando a tela de edição existir" e passa para a tabela, em todos os status.

### L5. Data e horário na edição pelo funcionário (RN033)

**Problema.** RN033 dá limites diferentes por status ao funcionário (futuro e adiantável em "Agendado"; nunca depois do momento da edição quando o veículo já chegou; só o funcionamento em "Cancelado"), mas a etapa "Data e horário" compartilhada só conhece a regra do cliente: nada antes do agendamento original nem antes de agora. Em "Em espera" ou "Concluído", ela ofereceria só instantes futuros, que são justamente os inválidos, e a edição ficaria inútil.

**Opções:**

- [x] **1. A tela orienta pelo status, como a regra (recomendada).** A etapa recebe o limite do status: "Agendado", nada antes de agora e sem exigir postergar; "Em espera", "Em execução", "Finalizado", "Concluído" e "Reagendado", nada depois de agora (dias passados selecionáveis, com "Mês anterior"); "Cancelado", só o funcionamento. O instante original é sempre selecionável. A API continua decidindo (UC26 FE02).
- [ ] **2. A tela oferece todo horário de funcionamento e deixa a API recusar.** Sem tabela na tela, mas o funcionário escolhe instantes que só a API recusa, e na demonstração nada recusa.

**Texto proposto (opção recomendada)**, em `docs/agendamento/agendamentos-do-painel.md`, na seção "Editar":

- "Data e horário: a tela só orienta, e quem confere é a API (RN033). Em 'Agendado', os horários são os de funcionamento a partir de agora, adiantando ou postergando. Em 'Em espera', 'Em execução', 'Finalizado', 'Concluído' e 'Reagendado', são os de funcionamento até o momento da edição, em dias de hoje ou anteriores, e o calendário permite voltar a meses passados. Em 'Cancelado', todo horário de funcionamento. O instante marcado continua sempre selecionável."

## Decisões técnicas

- Seguidas:
  - 0013 e 0017: porte pelo tipo e código em inglês, textos em português;
  - 0035 e 0052: nenhuma função pura nova com regra; a tela, a demonstração e os componentes, à mão;
  - 0036: o que serve às duas interfaces mora em `src/components/shared/` (P3);
  - 0041: esqueleto pelo wireframe, conteúdo pelos casos de uso, estilo por `design.md`;
  - 0049: `Dialog` e os campos do shadcn/ui sobre Base UI;
  - 0053: datas e horários no fuso da empresa;
  - 0055: a tela com os dados de demonstração e o aviso, sem rota nem esquema.
- Nenhuma nova: não há dependência nem escolha entre alternativas fora das já decididas.

Escolhas locais, sem registro:

- Os blocos de dados do painel continuam em `admin-appointments.ts`, que já tem os clientes, os veículos e a prévia; as buscas só leem esses dados.
- O assistente do painel é um componente próprio (`appointment-wizard.tsx`) com os modos novo e edição, e o do cliente continua separado: cada um tem rotas, etapas e textos próprios (P4 trata do reagendamento).
- A busca de cliente só consulta com texto; sem ele, a dica (a rota pede `search*`).

## Pontos à parte

Decisões do Yvan que não são lacunas da documentação. Marque `x`.

### P1. Divisão em PRs

Estimativa em "Arquivos": PR 1 cerca de 200 linhas, PR 2 cerca de 260 (mais dois arquivos que mudam de pasta), PR 3 cerca de 420 e PR 4 cerca de 300.

- [x] **1. Quatro PRs (recomendada).** Base, etapas, novo agendamento e edição; o último fecha a issue.
- [ ] **2. Três PRs:** a base entra nas etapas (cerca de 460 em `src/`).
- [ ] **3. Dois PRs:** base e etapas num, o assistente e a edição noutro (cerca de 1.000 em `src/`, bem acima das ~400 de `pull-request.md`).

### P2. O cliente sem veículo na demonstração

Os 12 clientes do `seed-demo.sql` têm veículo, e o critério "cliente sem veículo" (UC11 FE02) precisa de um cliente assim na tela.

- [x] **1. Um 13º cliente sem veículo no `seed-demo.sql` e nos dados de demonstração (recomendada).** Por exemplo, "Natália Pires", `natalia.pires@example.com`, sem linha em `client_vehicles`; o professor vê o caso na tela, e a #64 (clientes) o reaproveita. Não é migration: o `seed-demo.sql` só carrega dados fictícios no banco local, e o sorteio dos agendamentos usa só os clientes com veículo. Os números fixos da #61 (6, 8 e 36) não mudam.
- [ ] **2. Sem mudança no seed:** o caso só aparece por alteração temporária, sem commit, na verificação; o professor não vê o estado.

### P3. Etapas de veículo e de serviços do assistente do cliente

Hoje as duas etapas importam `AddVehicleDialog` e os endereços `/api/me/*`, e o README de `src/components/admin/appointments/` manda o componente usado pela outra interface para `src/components/shared/`.

- [x] **1. Mover as duas etapas para `shared/`, com o endereço, os filtros, a legenda, o estado vazio e a ação de cadastro por propriedade (recomendada).** O assistente do cliente passa o que tem hoje, e o do painel passa o dele; a #61 já indicou esse caminho. Risco pequeno para `/booking` e `/appointments`, conferidos de novo no PR 2.
- [ ] **2. Copiar as duas etapas para `admin/appointments/`.** Sem mexer no assistente do cliente, mas cerca de 450 linhas repetidas e os dois em risco de se afastar.

### P4. O reagendamento do painel

`reschedule-appointment-dialog.tsx` (242 linhas) repete a lógica do modo `reschedule` do assistente; a #61 deixou a unificação para esta tarefa.

- [x] **1. Mantê-lo como está (recomendada).** Está verificado na #61 e fora do escopo da #62; o assistente novo cuida só do novo agendamento e da edição. A repetição fica registrada nas notas.
- [ ] **2. Torná-lo o terceiro modo do assistente do painel.** Tira cerca de 120 linhas repetidas e deixa um assistente só, mas mexe no código verificado e soma cerca de 80 linhas ao PR 4, que passa de ~400.

### P5. Onde mora a tabela de limites de data do funcionário (L5)

`src/server/rules/editing.ts` tem `STAFF_DATE_LIMITS`, que a tela não pode importar (`server-only`). A tela precisa do mesmo mapa por status.

- [x] **1. Mover a tabela para `src/shared/constants/appointment-date-limits.ts` e importá-la nos dois lados (recomendada).** Uma só fonte; muda uma linha de `editing.ts`, coberta por `tests/rules/editing.test.ts`.
- [ ] **2. Copiar a tabela na tela, com um comentário.** Não toca no servidor, mas a regra passa a estar escrita em dois lugares.

### P6. Ambiente de verificação

O roteiro usa o Docker Desktop (que precisa estar aberto), `npx supabase start` e `db reset`, o admin local criado por `supabase/scripts/create-admin.mjs`, o cookie da sessão de teste no Lighthouse e alterações temporárias, sem commit, em `routes.ts` e nos módulos de demonstração, desfeitas com `git checkout` antes do commit. É o mesmo acordo das #56 a #61 e da #78. Em P2, opção 1, o `db reset` carrega também o cliente novo.

- [x] **1. Aprovado, como nas tarefas anteriores (recomendada).**
- [ ] **2. Ajustar:** <o que muda>

## Riscos e dúvidas

- **A busca de cliente e o hook.** `usePaginatedList` sempre chama o caminho, e a rota pede `search*`: sem texto, a tela precisa não chamar. A saída local é montar a lista de resultados só com texto; se isso não couber sem repetir o hook, entra uma opção de "desligado" em `src/hooks/use-paginated-list.ts` (listada em "Arquivos"). A decisão fica nas notas.
- **Enter na busca.** O campo de busca fica dentro do formulário em etapas; Enter não pode avançar a etapa nem enviar o formulário. Conferido pelo teclado.
- **Janela sobre janela.** "Editar" abre sobre o detalhe, como "Reagendar" e "Concluir": o foco inicial, o retorno ao botão que abriu e o Esc seguem a #78; a janela fica sempre montada, com o gatilho `hidden`, para o aviso de um 409 ser lido.
- **Rotas de demonstração com o mesmo prefixo.** `GET /api/admin/appointments/lookup/clients` convive com `GET /api/admin/appointments/:id`; `match.ts` compara segmento a segmento, então os dois não colidem (`lookup/clients` tem dois segmentos depois de `appointments`). Conferido no PR 1.
- **O caminho de sucesso não roda na demonstração.** Todas as gravações são recusadas; o fechamento das janelas, a releitura da lista e o conflito de versão só se conferem por alteração temporária. O foco depois do sucesso (o cartão pode ter saído da visão) é uma lacuna herdada da #61 (decidir na #46 e na #50): aqui o foco volta ao botão que abriu a janela, e o resultado vai ao relatório.
- **Orientação por dias passados.** Em L5, o calendário permite meses passados; a rota de configuração (`GET /api/public/company`) só traz o horário de funcionamento, então o limite de quão atrás se pode ir é o início do calendário que a etapa já tem (sem limite). Nada a decidir, mas conferido a 360 px.
- **LCP no celular.** Nas telas anteriores o LCP simulado ficou acima de 2,5 s com o aviso de demonstração como elemento; a janela fechada não pesa na página, mas a medida e a causa vão ao PR.
- **Tipos provisórios.** Os campos das buscas e o `clientId` saem de L1 e L2; se a #49 ou a #50 mudar um nome, o tipo e a demonstração acompanham.
- **Lacunas de regra.** L5 só orienta a tela; nenhuma `RN` muda, então os `.docx` só mudam no Apêndice A (#67).
- **Pontos para a sua aprovação**, além das lacunas: P1 a P6, a conta de admin no banco local e as alterações temporárias, sem commit.

## Fora do escopo

- As rotas (#46, #49 e #50), os esquemas de validação e qualquer gravação; o cadastro de cliente e de veículo dentro do assistente (UC16 e UC18 são da tela de clientes, #64).
- O reagendamento e a conclusão, já feitos na #61; a unificação do reagendamento (P4, opção 1).
- Partes do wireframe sem requisito: o filtro por categoria, "Sob orçamento", o "+1d" e o horário de término em cada horário, "Total estimado" na etapa de serviços, o "Box", os avisos de atraso e a marca "Multi-dia".
- Edição do status pela edição do agendamento (só pelas transições de RN017).
