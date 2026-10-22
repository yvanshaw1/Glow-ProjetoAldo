---
titulo: Conteúdo do assistente de agendamento
assunto: agendamento
origem: issue #59, plano memoria/tarefas/59-agendar-e-editar/01_plano.md (L2, L4, L7, L8)
relacionados: [UC05, UC06, RF019, RF020, RF021, RF022, RF023, RF024, RF025, RF026, RF027, RN004, RN005, RN006, RN011, RN013, RN015, RN016, RNF002]
---

# Conteúdo do assistente de agendamento

Etapas, campos e textos de `/booking`, do [UC06](UC06-agendar-servico.md). Cabeçalho: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); formulário em etapas, listagem e aviso de demonstração: [../padroes/componentes.md](../padroes/componentes.md).

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

## Fora da tela

Sem requisito: a janela que se abre sozinha sem veículo, o filtro por categoria, os "Serviços sob orçamento", o código promocional, o "Limpar" do resumo e a previsão em cada horário.
