---
issue: 59
titulo: "PR 3 — edição e reagendamento do cliente com dados de demonstração"
areas: [frontend, testes]
tipo: funcionalidade
requisitos: [UC06, UC07, UC25, UC26, RF019, RF020, RF021, RF022, RF023, RF024, RF025, RF026, RF031, RF032, RN005, RN006, RN008, RN020, RN032, RN033, RN034, RNF002, RNF003, RNF004, RNF005, RNF011, RS008, RS009]
status: em_execucao
aprovado_por: yvan
aprovado_em: 22/10/2026
---

# Plano: PR 3 da #59 — editar e reagendar

## Objetivo

Completar a #59 com a edição de um agendamento “Agendado” (UC26) e o reagendamento de um “Concluído” (UC25), a partir do detalhe de `/appointments`, reutilizando o assistente de `/booking`. As gravações continuam respondendo `NOT_IMPLEMENTED`, sem persistência (0055).

Este é o complemento da etapa 01 solicitado em 22/10/2026, restrito ao terceiro PR. O plano geral em `../59-agendar-e-editar/01_plano.md`, sua aprovação por Yvan e as opções já escolhidas em L1–L8 ficam preservados. A nova pasta separa a aprovação deste complemento do histórico dos PRs anteriores; não abre outra issue. O plano geral continua sendo referência para o que já foi entregue.

## Base conferida

- Issue: https://github.com/yvanshaw1/Glow-ProjetoAldo/issues/59, aberta.
- PR #75, base: incorporado em `aa60565`; PR #76, página: incorporado em `9e8a4a9`. Não havia PR aberto na consulta de 22/10/2026.
- Checkout atualizado de `58959f8` para `9e8a4a9` por avanço direto, com árvore inicialmente limpa; ramificação `feat/59-edit-and-reschedule`, sem upstream.
- Já existem tipos do detalhe e da prévia, respostas de demonstração, as duas entradas de gravação, quatro etapas, resumo, seleção de adicionais e funções de data. Não refazer os PRs 1 e 2.
- `BookingWizard` só implementa criação; `STATUS_ACTIONS` só oferece cancelamento. `BookingScheduleStep` elimina horários passados e não recebe o instante original. `BookingSummary` ainda não informa indisponíveis.
- `AppointmentCard` já recebe `onChange`, ligado a `list.reload`; o detalhe chama esse retorno com o nome `onCancelled`. Basta generalizar o nome no cartão e no detalhe: a lista não precisa mudar.

## Construção proposta

### Modos e integração

Um único `BookingWizard`, com configuração por modo em tabela, um `useForm` e as etapas existentes. Novo continua sendo o modo padrão de `/booking`. Edição e reagendamento recebem o detalhe completo, retornos de cancelamento/sucesso e a comunicação do estado de envio para a janela.

| Modo | Valores iniciais e etapas | Chamada ao confirmar |
|---|---|---|
| Novo | Comportamento atual; quatro etapas | `POST /api/me/appointments`, sem mudança |
| Edição | Quatro etapas; veículo, serviços, adicionais, data, horário e pagamento preenchidos | `PATCH /api/me/appointments/:id`, com `vehicleId`, todos os `serviceIds`, `paymentMethod`, `scheduledAt` e `updatedAt` do registro lido |
| Reagendamento | Só data/horário e pagamento/resumo; veículo e serviços fixos do original; data, horário e pagamento vazios | `POST /api/me/appointments/:id/reschedule`, somente `paymentMethod` e `scheduledAt` |

Separar os principais/complementares dos adicionais pelo `type` de cada item do detalhe. Não perder adicionais no preenchimento nem ao voltar entre etapas. Na edição, passar `canAddVehicle={false}`: a janela de cadastro não é oferecida, conforme L3 já aprovada.

`AppointmentChangeDialog` abre sobre o detalhe, com “Editar agendamento” ou “Reagendar serviço”. “Cancelar” na primeira etapa e Esc fecham só o assistente, devolvendo o foco ao acionador. Impedir fechamento durante envio. Fechar e reabrir remonta o formulário com o registro, sem aproveitar um rascunho abandonado. Em sucesso real, fechar as duas janelas e chamar `onChange`; na demonstração, manter as janelas e mostrar a falha. Preservar o cancelamento existente.

Usar `Dialog`/`DialogContent` do projeto, com largura apropriada ao assistente e rolagem interna até `90dvh`. Ajustar a composição local do assistente/resumo para caber na largura efetiva da janela; evitar a coluna lateral fixa de 20rem comprimindo o formulário. Não mudar globalmente `Dialog` ou `StepForm`.

### Ações por status

- `scheduled`: “Editar” e “Cancelar agendamento”.
- `completed`: “Reagendar”.
- `checked_in`, `in_progress`, `awaiting_payment`: “Este agendamento não pode mais ser alterado por aqui. Para mudar algo, fale com a empresa.”
- `cancelled`, `rescheduled`: nenhuma ação.

Esses textos e a janela sobre o detalhe já foram aprovados em L3/L7 do plano geral. A API continua decidindo o acesso; a tabela só orienta a tela (RS008).

### Data e horário na edição

Receber o instante original em `BookingScheduleStep`. Conferir comparações como instantes, usando os formatos compartilhados no fuso da empresa (0053).

- Abrir no mês do agendamento e manter o par original selecionável, inclusive se estiver no passado ou fora da disponibilidade atual, como exige RN033. Não basta conservar o valor internamente e ocultar sua opção.
- As alternativas precisam estar no funcionamento atual e ser posteriores tanto ao instante original quanto ao momento atual. Manter o instante original é a exceção, não uma nova alternativa passada.
- Permitir navegar de volta ao mês original após explorar outros meses; a regra atual de “Mês anterior” usa o mês de hoje e precisa considerar essa exceção.
- Trocar o dia continua limpando só o horário; voltar às etapas mantém as outras escolhas. Novo e reagendamento mantêm RN013/RN015, sem a exceção da edição.

### Prévia, mensagens e concorrência

Manter uma única leitura da prévia pelo `useApiQuery`; na edição, acrescentar `appointmentId` ao corpo. Enviar IDs de principais, complementares e adicionais. Valores, duração e previsão vêm da resposta; nenhuma conta de negócio nos componentes.

No reagendamento, comparar os IDs do original com os itens da resposta atual e mostrar “Não estão mais disponíveis e ficaram de fora: <nomes>.” (L7, UC25 FE02). Não produzir essa mensagem durante carga inicial, erro ou enquanto a resposta anterior estiver sendo substituída. O caso sem principal/complementar depende de L9 abaixo.

Rótulos: “Salvar alterações”/“Salvando…” e “Confirmar reagendamento”/“Reagendando…”. Mostrar `NOT_IMPLEMENTED` e `INVALID_STATUS` pelo tratamento existente, sem simular sucesso ou repetir gravações.

Em `VERSION_CONFLICT`, manter o aviso com foco no topo, reler o detalhe e substituir os valores e a versão do formulário (RNF011). A nova leitura também atualiza o detalhe e suas ações por status. Se falhar, oferecer “Tentar novamente” e impedir novo envio com a versão antiga. Se o registro deixar de ser `scheduled`, não manter uma edição utilizável. Implementar o fluxo local com os hooks/componentes existentes; não alterar o contrato compartilhado de `useApiQuery`.

## Critérios de aceitação e verificação

Todos os passos de tela abaixo são verificação manual local e na pré-visualização (0052). Falhas/sucesso que a demonstração não produz exigem respostas temporárias controladas, removidas antes da entrega; não afirmar que houve persistência real.

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado cada status, quando abro o detalhe, então vejo somente suas ações e mensagens | Conferir os sete status; simular os ausentes da lista fixa. Repetir o cancelamento já existente |
| Dado um Agendado, quando aciono Editar, então as quatro etapas vêm preenchidas | Conferir os dois agendamentos de demonstração, inclusive adicionais, pagamento e instante; sem “Cadastrar veículo” |
| Dado o resumo, quando volto e troco um serviço, então as outras etapas permanecem preenchidas (critério da issue, RNF002) | Em edição e `/booking`, trocar serviço e veículo; conferir data, horário, pagamento e atualização da prévia |
| Dado um principal vinculado, quando o marco, então vejo seus adicionais (critério da issue, RN006) | Regressão em `/booking` e edição; adicional compartilhado permanece enquanto houver principal marcado correspondente |
| Dado o instante original, quando mantenho ou altero a data, então somente manter ou postergar é possível (RN033) | Original futuro, passado e fora do expediente atual; dia anterior, horário anterior no mesmo dia, posterior válido; ir a outro mês e voltar ao original; repetir em fuso de aparelho diferente |
| Dado um Concluído, quando aciono Reagendar, então começo na data/horário, com veículo e serviços fixos (critério da issue) | Duas etapas; pagamento vazio; Fiat Toro com Lavagem simples e Cera de carnaúba: R$ 105,00; SW4 com Lavagem completa e Hidratação de couro: R$ 190,00, pelos dados atuais |
| Dado um serviço indisponível, quando a prévia termina, então identifico os removidos e mantenho os restantes | Resposta temporária sem um item; sem aviso falso durante carregamento; caso sem principal/complementar conforme escolha de L9 |
| Dada a confirmação, quando envio, então recebo NOT_IMPLEMENTED e nada é gravado (critério da issue) | Três modos; foco no aviso e escolhas preservadas. Inspecionar o corpo antes da interceptação de demonstração; nenhuma chamada de rede a `/api/me/*` |
| Dada versão desatualizada, quando recebo VERSION_CONFLICT, então releio e substituo o registro | Simular 409, nova versão, falha de releitura e mudança de status; sem repetição automática do PATCH |
| Dado sucesso ou fechamento, quando a janela termina, então estado e foco são coerentes | Esc/Cancelar retornam ao detalhe; sucesso simulado fecha ambas e recarrega a lista; envio em andamento impede fechamento |
| Dadas as dimensões e os temas exigidos, quando navego pelo teclado, então a janela permanece utilizável | 360 × 800 e 1440 × 900, claro/escuro; rolagem interna, sem transbordamento horizontal, títulos e foco corretos; Lighthouse acessibilidade sem auditoria reprovada |
| Dado carregamento, vazio ou falha, quando interajo, então vejo o estado correto e posso tentar novamente | Detalhe, veículos, serviços, disponibilidade e prévia; erros não apagam escolhas nem usam resultado antigo como atual |

## Arquivos

| Arquivo | Ação |
|---|---|
| `.prettierignore` | Excluir `supabase/.temp/`, artefatos gerados do CLI; ajuste autorizado por Yvan na conversa de 22/10/2026 após o bloqueio do check |
| `src/components/portal/appointments/appointment-change-dialog.tsx` | Criar a janela dos dois modos e o controle de fechamento |
| `src/components/portal/appointments/booking-wizard.tsx` | Acrescentar modos, preenchimento, chamadas, callbacks, concorrência e composição na janela |
| `src/components/portal/appointments/booking-schedule-step.tsx` | Acrescentar o instante original e a exceção de RN033; faltava na lista do PR 3 do plano geral |
| `src/components/portal/appointments/booking-summary.tsx` | Acrescentar o aviso de indisponíveis; faltava na lista do PR 3 do plano geral |
| `src/components/portal/appointments/appointment-details-dialog.tsx` | Ações por status, abertura, recarga do detalhe e callback comum |
| `src/components/portal/appointments/appointment-card.tsx` | Passar o callback com nome comum, em lugar de `onCancelled` |
| `docs/agendamento/agendar-servico.md` | Incorporar L3/L7 aprovadas, explicitar RN033 e, após escolha, L9; atualizar metadados |
| `docs/agendamento/meus-agendamentos.md` | Incorporar ações e mensagens de L3/L7 e os identificadores UC26/RF031 |
| `docs/agendamento/CONTEXT.md` | Atualizar a descrição do assistente para incluir edição/reagendamento em `/appointments` |
| `memoria/tarefas/59-editar-e-reagendar/01_plano.md` e `notas.md` | Complemento e memória do PR 3 |
| `memoria/tarefas/59-agendar-e-editar/notas.md` | Apontar para este complemento, preservando o histórico |
| `memoria/tarefas/59-agendar-e-editar/02_relatorio.md` | Na etapa 03, completar o relatório cumulativo dos três PRs e vincular este plano |

O README de `src/components/portal/appointments/` já admite estes componentes. `booking-vehicle-step.tsx` já aceita `canAddVehicle`; `appointment-list.tsx` já recarrega pelo callback. Não prever alterações nesses arquivos sem necessidade demonstrada.

## Testes previstos

- Sem testes novos de componentes: decisão 0052. Não há nova regra de servidor, esquema ou função compartilhada neste recorte que exija TDD.
- Na etapa 02: `npm run check`, build e auditoria usados pelo projeto; depois os cenários manuais acima, incluindo regressão de `/booking` e cancelamento.
- Conferir wireframes de `clientPages/appointment/` e `clientPages/clientAppointments/` antes da construção visual; os PDFs não foram abertos nesta etapa de planejamento.
- Consultar a documentação oficial das versões instaladas antes de usar APIs novas de React Hook Form ou Base UI. Nenhuma dependência nova prevista.
- Na etapa 01: conferir diff, caminhos, rastreabilidade e preservação da aprovação anterior. Testes de aplicação não executados, pois só há planejamento.

## Lacunas na documentação

L1–L8 do plano geral já têm opção escolhida. L3 e a parte de L7 da edição/reagendamento ainda precisam ser transcritas para os módulos na construção. A exceção da data mantida não é lacuna: RN033 já a define.

### L9. Reagendamento sem principal ou complementar disponível

**Problema.** UC25 FE02 manda informar indisponíveis e manter os restantes. RN005 exige principal ou complementar, mas não há texto nem fluxo de tela definido quando a prévia não devolve nenhum deles. O reagendamento tem composição fixa e não possui etapa para escolher substitutos.

**Opções:**

- [X] **1. Informar e impedir a confirmação, oferecendo iniciar um novo agendamento (recomendada).** Preserva RN005 e a composição fixa de RN020. A pessoa decide sair para `/booking`, sem redirecionamento automático.
- [ ] **2. Informar e permitir apenas voltar ao detalhe.** Mantém o escopo da janela; o cliente usa o menu existente para agendar novamente.

**Texto proposto para a opção 1:** em `docs/agendamento/agendar-servico.md`, seção “Edição e reagendamento”: “Se a prévia não retornar nenhum serviço principal ou complementar, o reagendamento não pode ser confirmado (RN005). Exibir ‘Nenhum serviço principal ou complementar deste agendamento está disponível. Para escolher outros serviços, faça um novo agendamento.’ e o link ‘Agendar outro serviço’ para `/booking`. A opção de voltar ao detalhe permanece disponível. A tela não substitui serviços automaticamente.”

A escolha define somente a experiência da tela; a validação definitiva continua no servidor. Não implementar o texto ou a alternativa antes da decisão do desenvolvedor.

## Decisões técnicas

Nenhuma ADR nova. Seguidas: 0009 (versão), 0021 (valores calculados), 0027 (React Hook Form), 0031 (ICM), 0041 (wireframes), 0049 (Base UI), 0051 (proteção existente), 0052 (verificação das telas), 0053 (fuso) e 0055 (demonstração).

Escolhas locais: composição por modo no assistente existente; janela que coordena estado de envio e fechamento; callback `onChange` para cancelar, editar e reagendar. Não criar estado global, outro assistente ou nova rota de página.

## Riscos e dúvidas

- L9 precisa de escolha. O plano é revisável sem reabrir as opções já aprovadas do plano geral.
- A prévia de demonstração usa catálogo/configurações fixos e não implementa a concorrência ou a persistência reais. `appointmentId` precisa ser enviado na edição, mas o simulador atual não o utiliza para buscar uma versão histórica. Não declarar que os testes da tela validam o futuro backend.
- A filtragem de serviços do servidor deverá garantir RN005/RN006 mesmo quando um principal ficar indisponível; não inferir vínculo de adicionais apenas pelo tipo ou pelo nome da resposta da prévia.
- A janela sobre o detalhe exige conferir foco, rolagem e títulos, principalmente no celular; a largura do viewport não é a largura disponível ao formulário.
- A documentação anterior relata LCP de 3,0 s em `/booking` no celular, acima de RNF006. Reavaliar na entrega e registrar resultado; não atribuir essa pendência ao PR 3 sem medição.
- A estimativa anterior de ~350 linhas pode crescer com RN033 e concorrência. Conferir o tamanho real antes de abrir o PR, sem omitir cenários para caber na estimativa.

## Fora do escopo

Rotas reais `/api/me`, servidor, migrations, autenticação, autorização, esquemas Zod, novos dados de seed, dependências, OpenAPI da fase 3, painel (#62), documentos formais (#67), mudanças globais de tema e refatorações dos PRs 1/2. Nenhum envio, merge ou publicação nesta etapa. O PR 3 usará `Closes #59` somente na etapa 03.
