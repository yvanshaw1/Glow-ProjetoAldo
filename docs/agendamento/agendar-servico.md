---
titulo: Conteúdo do assistente de agendamento
assunto: agendamento
origem: issue #59, plano memoria/tarefas/59-agendar-e-editar/01_plano.md (L2, L3, L4, L7, L8) e complemento memoria/tarefas/59-editar-e-reagendar/01_plano.md (L9)
relacionados: [UC05, UC06, UC25, UC26, RF019, RF020, RF021, RF022, RF023, RF024, RF025, RF026, RF027, RF031, RF032, RN004, RN005, RN006, RN008, RN011, RN013, RN015, RN016, RN020, RN032, RN033, RNF002, RNF011]
---

# Conteúdo do assistente de agendamento

Etapas, campos e textos de `/booking`, do [UC06](UC06-agendar-servico.md), e do assistente de edição e reagendamento em `/appointments` (UC26, UC25). Cabeçalho: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); formulário em etapas, listagem e aviso de demonstração: [../padroes/componentes.md](../padroes/componentes.md).

Enquanto as rotas `/api/me/bookable-services` e `/api/me/appointments` usarem os dados de demonstração, o aviso fica logo abaixo do título da página. Os valores, a duração e a previsão vêm sempre da prévia (`POST /api/me/appointments/preview`, [rotas.md](rotas.md)); a tela não soma nem calcula.

## Página

- Título: "Agendar serviço".
- O assistente e, ao lado (a partir de 1024 px) ou abaixo (no celular), o "Resumo do pedido".
- Antes das etapas, o título "Etapas do agendamento", só para o leitor de tela.
- A primeira etapa não tem "Cancelar": sair é pelo menu.

## Etapas

Quatro etapas no formulário em etapas: "Veículo", "Serviços", "Data e horário" e "Pagamento e resumo", como no wireframe. A forma de pagamento fica na última etapa, junto do total que ela muda: os passos 7 e 8 do [UC06](UC06-agendar-servico.md) acontecem depois dos passos 9 e 10, e o passo 4 do [UC25](UC25-reagendar-servico-concluido.md), depois do 5, sem mudar o que o sistema faz em cada um.

"Próximo" confere a escolha da etapa, e a mensagem some assim que ela é feita.

## Veículo

- Legenda: "Qual veículo será atendido?".
- Cada opção: "<marca> <modelo>", "Placa <placa> · <cor>" e "<tipo> · Porte <porte>", em páginas de 10.
- O botão "Cadastrar veículo" acima da lista abre a janela da área do cliente ([../clientes/area-do-cliente.md](../clientes/area-do-cliente.md)); cadastrado, a lista é lida de novo.
- Sem veículos (UC06 FE01): "Nenhum veículo cadastrado" e "Para agendar um serviço, cadastre um veículo na sua conta.", com o botão "Cadastrar veículo".
- Sem escolha: "Escolha o veículo." ([RN004](RN004-veiculo-antes-dos-servicos.md), RF019).

## Serviços

- Legenda: "Quais serviços você quer?".
- Cada opção: o nome, o valor do porte do veículo ou o fixo, a categoria, a duração média e a descrição, em páginas de 12.
- Ao marcar um principal, os adicionais vinculados a ele aparecem logo abaixo, sob "Adicionais de <serviço>", cada um com "+ <valor>" ([RN006](../catalogo/RN006-tipos-de-servico.md), UC06 FA01). Ao desmarcar um principal, saem os adicionais que não estão vinculados a nenhum outro principal marcado (FA02); o adicional vinculado a mais de um principal aparece sob cada um deles, com a mesma marcação.
- Trocar o veículo mantém os serviços marcados e mostra os valores do novo porte (FA03).
- Sem serviços: "Nenhum serviço disponível" e "No momento, não há serviços para agendar.".
- Sem escolha: "Escolha ao menos um serviço principal ou complementar." ([RN005](RN005-servico-obrigatorio-no-agendamento.md), FE02).

## Data e horário

A data é escolhida num calendário do mês, com os dias como botões de opção, "Mês anterior" e "Próximo mês"; começa no mês de hoje, ou no do agendamento, na edição, sem limite de meses à frente. O dia sem horário livre (fechado, passado ou com todos os horários já passados) fica desativado. Escolhido o dia, aparecem os horários de início dele, de 30 em 30 minutos, da abertura ao último antes do encerramento, fora da pausa e sem os que já passaram ([RN013](RN013-disponibilidade.md), [RN015](RN015-sem-data-no-passado.md)), todos, sem controle de capacidade ([RN016](RN016-sem-controle-de-capacidade.md)). Os horários vêm de `GET /api/public/company`. A tela só orienta: quem confere a data e o horário é a API (UC06 FE03). A previsão de conclusão do horário escolhido aparece no resumo do pedido, sem previsão em cada horário.

- Legendas: "Data" e "Horário".
- Antes da data: "Escolha uma data para ver os horários.". Outro dia tira o horário escolhido.
- Sem escolha: "Escolha a data." e "Escolha o horário.".

## Pagamento e resumo

- "Veículo", "Data e horário" e "Previsão de conclusão".
- Legenda "Forma de pagamento", com "Crédito", "Débito", "Pix" e "Dinheiro", e a descrição "O pagamento é feito na empresa, no dia do atendimento." ([RN011](RN011-formas-de-pagamento.md)).
- "Total", logo acima dos botões, para quem está no celular não confirmar sem vê-lo.
- Sem escolha: "Escolha a forma de pagamento.".
- Botão "Confirmar agendamento" ("Agendando…"). A falha, como o `NOT_IMPLEMENTED` da demonstração ou a data recusada (FE03), aparece no topo do formulário.

## Resumo do pedido

- Título: "Resumo do pedido".
- O veículo; os serviços com o valor; "Subtotal"; "Acréscimo de <percentual>" ou "Desconto de <percentual>", só quando a forma de pagamento tem percentual; "Total"; "Duração estimada"; "Previsão de conclusão", depois da data e do horário.
- Sem serviço: "Nenhum serviço escolhido.".
- Numa nova prévia, os valores anteriores ficam no estado de carregamento; na falha, o aviso com "Tentar novamente".

## Confirmação (UC06 passo 13)

Título "Agendamento confirmado", texto "O seu agendamento para <data> às <hora> foi registrado e já aparece em Meus agendamentos.", com o link "Ver meus agendamentos". O foco vai ao título.

## Edição e reagendamento

As ações do [detalhe de `/appointments`](meus-agendamentos.md) abrem o mesmo assistente numa janela sobre ele: "Editar agendamento" ou "Reagendar serviço". "Cancelar" na primeira etapa ou Esc voltam ao detalhe; a janela não fecha durante o envio. No celular, fica ancorada embaixo, com rolagem interna até 90% da altura. O aviso de demonstração continua sendo o da página.

- **Edição (UC26):** as quatro etapas vêm preenchidas com veículo, serviços e adicionais, data, horário e pagamento do registro. O cadastro de veículo não é oferecido, para não abrir uma terceira janela. O calendário abre no mês do agendamento; manter o instante original é permitido mesmo se já passou ou a disponibilidade mudou (RN033). Ele continua selecionável ao navegar entre meses. As outras opções respeitam o funcionamento atual e precisam ser futuras e posteriores ao original. A prévia recebe `appointmentId`; o envio leva `updatedAt` sem conversão. Botão "Salvar alterações" ("Salvando…").
- **Reagendamento (UC25):** só "Data e horário" e "Pagamento e resumo", com essas escolhas vazias. Veículo e serviços do original ficam fixos; valores e duração vêm da prévia pelo catálogo atual (RN020). Botão "Confirmar reagendamento" ("Reagendando…"). O envio leva somente pagamento e instante.
- **Indisponíveis (UC25 FE02):** depois da resposta atual da prévia, mostrar no resumo "Não estão mais disponíveis e ficaram de fora: <nomes>." para os serviços do original ausentes. Não anunciar remoções durante carregamento ou falha.
- **Sem principal/complementar (RN005):** impedir a confirmação e exibir "Nenhum serviço principal ou complementar deste agendamento está disponível. Para escolher outros serviços, faça um novo agendamento.", com "Agendar outro serviço" para `/booking` e a opção de voltar ao detalhe. Não substituir serviços automaticamente.
- **Conflito (RNF011):** `VERSION_CONFLICT` mantém o aviso no topo, com foco, e relê o registro, substituindo os campos e a versão. Falha da releitura oferece "Tentar novamente" e impede envio com a versão antiga; mudança para outro status impede continuar a edição. As ações do detalhe também acompanham o registro relido.
- **Resultado:** sucesso fecha as duas janelas e recarrega a lista. Falhas, inclusive `NOT_IMPLEMENTED` e `INVALID_STATUS`, aparecem no formulário; a gravação não é repetida automaticamente. Na demonstração, nada é gravado.

## Fora da tela

Sem requisito: a janela que se abre sozinha sem veículo, o filtro por categoria, os "Serviços sob orçamento", o código promocional, o "Limpar" do resumo e a previsão em cada horário.
