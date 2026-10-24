---
titulo: Conteúdo da página de agendamentos do painel
assunto: agendamento
origem: issue #61, plano memoria/tarefas/61-agendamentos-do-painel/01_plano.md (L1, L3, L4, L5), e issue #62, plano memoria/tarefas/62-novo-agendamento-e-edicao/01_plano.md (L3)
relacionados: [UC10, UC11, UC12, UC25, RF044, RF045, RF046, RF047, RF048, RF049, RF052, RF050, RF051, RF053, RF054, RF056, RN003, RN004, RN010, RN012, RN017, RN018, RN019, RN020, RN037, RNF004, RNF008]
---

# Conteúdo da página de agendamentos do painel

Visões, filtros, cartão, detalhe, ações de status e estados de `/admin/appointments`, do [UC10](UC10-consultar-agendamentos.md), do [UC12](UC12-atualizar-status-do-agendamento.md) e do [UC25](UC25-reagendar-servico-concluido.md). Cabeçalho e navegação: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); listagem, etiqueta de status e telas de demonstração: [../padroes/componentes.md](../padroes/componentes.md); contrato da rota: [rotas.md](rotas.md).

Enquanto as rotas `/api/admin/appointments` usarem os dados de demonstração de `src/lib/demo/admin-appointments.ts` (decisão 0055), o aviso de demonstração fica logo abaixo do título da página.

## Página

- Título: "Agendamentos". Abaixo dele, o aviso de demonstração e as abas "Hoje", "Futuros" e "Histórico", cada uma com a descrição da visão e a listagem dela.
- Cada aba lê a rota de novo ao ser escolhida e começa sem busca, filtro nem ordem escolhida. O acesso à página é da permissão `appointments` ([RN025](../equipe/RN025-permissoes.md)).

## Visões (UC10 passos 2 a 4, RF044)

Cada agendamento está em uma visão só, pelo status ([RN017](RN017-sequencia-de-status.md)) e, nos em aberto, pelo dia marcado, no fuso da empresa:

| Visão | O que mostra | Descrição na tela |
|---|---|---|
| Hoje | Agendado, Em espera, Em execução e Finalizado, marcados para hoje ou para dias anteriores | "Agendamentos de hoje e de dias anteriores que ainda não foram concluídos nem cancelados." |
| Futuros | os mesmos status, marcados para depois de hoje | "Agendamentos marcados para os próximos dias." |
| Histórico | Concluído, Cancelado e Reagendado, de qualquer data | "Agendamentos concluídos, cancelados e reagendados." |

A agenda do dashboard ([dashboard-do-painel.md](dashboard-do-painel.md), RF043) traz todos os status marcados para hoje; a visão "Hoje" é a fila de trabalho. O "Concluído" fica no histórico, de onde se reagenda ([UC10](UC10-consultar-agendamentos.md) FA06).

## Controles (RF045 a RF049)

- Busca "Buscar por cliente ou veículo", com a ajuda "Cliente, placa, marca ou modelo": vale 300 ms depois da última tecla e volta à primeira página (RF047).
- Filtro "Filtrar por status", com "Todos os status" e só os status da visão (RF046). Ordem, "Ordenar por horário" ou "Ordenar por status" (RF045): o horário vai do mais próximo ao mais distante em "Hoje" e "Futuros" e do mais recente ao mais antigo no "Histórico"; o status segue a ordem de RN017 e, dentro de cada um, o horário.
- "Limpar filtros" aparece quando há busca, status ou outra ordem, e tira os três numa ação só, de volta à listagem completa da visão (RF048, FA04). O foco vai à busca.
- "Atualizar", com o ícone `RefreshCw`, lê a listagem de novo (RF049, FA05).
- Durante a leitura nada fica desativado, e o foco não sai do controle usado; os agendamentos anteriores continuam na tela, com a aparência de carregando.
- A paginação mostra a faixa "1–20 de 36" e os botões de página, 20 por página (RNF008).

## Cartão

A etiqueta de status ([RN017](RN017-sequencia-de-status.md)), o nome do cliente, "<marca> <modelo> · <placa>", "Data: <data e hora>", "Previsão de conclusão: <data e hora>", "Serviços: <nomes>" e "Total: <valor>" e o botão "Ver detalhes", com os dados copiados no agendamento ([RN037](RN037-copia-no-agendamento.md)). A data inclui o dia, porque "Hoje" traz dias anteriores. Uma coluna no celular, duas a partir de 768 px e três a partir de 1280 px.

## Detalhe (UC10 FA06 e FA07, UC12)

- Janela "Detalhes do agendamento", que lê o agendamento ao abrir: a etiqueta; "Cliente"; "Data e horário", "Previsão de conclusão" e "Duração estimada"; "Veículo" (marca e modelo, placa, cor, ano, tipo e porte); "Serviços", com o valor de cada um; "Forma de pagamento"; "Subtotal" e "Acréscimo de <percentual>" ou "Desconto de <percentual>", só quando a forma de pagamento tem percentual; "Total".
- No "Finalizado", também "Total por forma de pagamento": as quatro formas, cada uma com o total que a rota devolve para ela e, quando tem percentual, o acréscimo ou o desconto ([RF053](requisitos.md)). A tela nunca soma nem recalcula.
- Enquanto carrega, o lugar fica reservado; na falha, o aviso com "Tentar novamente".

## Ações por status

Só no detalhe. A tela só orienta; quem decide é a API (RS008).

| Status | Ações |
|---|---|
| Agendado | "Avançar para Em espera" e "Cancelar agendamento" |
| Em espera | "Avançar para Em execução" e "Cancelar agendamento" ([RN019](RN019-cancelamento.md)) |
| Em execução | "Avançar para Finalizado" |
| Finalizado | "Concluir" ([RN018](RN018-conclusao-com-pagamento.md)) |
| Concluído | "Reagendar" ([UC25](UC25-reagendar-servico-concluido.md) FA01, [RN020](RN020-reagendamento.md)) |
| Cancelado, Reagendado | nenhuma |

"Editar" ([UC26](UC26-editar-agendamento.md), qualquer status) fica ao lado delas quando a tela de edição existir.

- **Avançar** ([UC12](UC12-atualizar-status-do-agendamento.md) passos 2 a 5, [RN017](RN017-sequencia-de-status.md)): sem confirmação. O botão passa a "Avançando…", fica indisponível sem perder o foco (`aria-disabled`), e, concluído, a janela fecha e a listagem é lida de novo.
- **Cancelamento** (FA02): confirmação com o título "Cancelar este agendamento?", o texto "O agendamento passa a Cancelado e vai para o histórico. Esta ação não pode ser desfeita.", e os botões "Voltar" e "Cancelar agendamento" ("Cancelando…"), na cor de erro; a falha aparece dentro da confirmação, e, concluído, as duas janelas fecham.
- **Falha** (FE01): o aviso com a mensagem da API fica no topo da janela, com o foco. No 409 `INVALID_STATUS`, o detalhe lê o agendamento de novo, então a etiqueta e as ações passam a ser as do status atual.

## Reagendar (UC25 FA01, RF056)

Janela "Reagendar serviço" sobre o detalhe de um agendamento "Concluído", que se abre pelo histórico. É o reagendamento do cliente ([agendar-servico.md](agendar-servico.md), "Edição e reagendamento"), feito pelo funcionário:

- Duas etapas, "Data e horário" e "Pagamento e resumo", com as escolhas vazias; o veículo e os serviços são os do agendamento original, e os valores, a duração e a previsão vêm da prévia pelo catálogo atual (`POST /api/admin/appointments/preview`, [RN020](RN020-reagendamento.md)), ao lado das etapas, no "Resumo do pedido".
- Os serviços que o catálogo atual não oferece ficam de fora, e o resumo diz "Não estão mais disponíveis e ficaram de fora: <nomes>."; sem nenhum principal ou complementar, "Nenhum serviço principal ou complementar deste agendamento está disponível. Para escolher outros serviços, faça um novo agendamento.", sem o botão de confirmar (UC25 FE02).
- Botão "Confirmar reagendamento" ("Reagendando…"), indisponível sem perder o foco enquanto a prévia não responde; o foco começa em "Cancelar", e Esc ou "Cancelar" voltam ao detalhe. A janela não fecha durante o envio. A falha, como o `NOT_IMPLEMENTED` da demonstração, aparece no topo, com a janela aberta; concluído, as duas janelas fecham e a listagem é lida de novo.

## Concluir (UC12 FA01, RF053)

Janela sobre o detalhe de um agendamento "Finalizado", que lê o agendamento ao abrir.

- Título "Concluir agendamento" e o texto "Confira o resumo do atendimento e a forma de pagamento usada pelo cliente. Receba o pagamento na empresa antes de confirmar."
- O resumo traz o cliente, o veículo, os serviços com o valor de cada um e o subtotal.
- "Forma de pagamento": "Crédito", "Débito", "Pix" e "Dinheiro", cada uma com o total que a rota devolve para ela e a marca de escolhida (a cor nunca é a única pista); começa na forma escolhida no agendamento. O "Total" é o da forma marcada, com "Acréscimo de <percentual>" ou "Desconto de <percentual>" quando ela tem percentual ([RN012](../configuracoes/RN012-percentual-da-forma-de-pagamento.md), [RN010](RN010-valor-total.md)).
- Botões "Cancelar" (com o foco ao abrir) e "Confirmar conclusão" ("Concluindo…", indisponível sem perder o foco). A janela não fecha durante o envio; a falha aparece no topo, com o foco, e, concluído, as duas janelas fecham. Se o agendamento já não está "Finalizado" (409), a janela mostra a mensagem de `INVALID_STATUS` e o detalhe segue o status atual.

## Novo agendamento (UC11, RF050, RF051)

Botão "Novo agendamento", com o ícone `CalendarPlus`, ao lado das abas (abaixo delas no celular, na largura toda). Abre a janela "Novo agendamento", ancorada embaixo no celular, com rolagem interna até 90% da altura. O foco começa em "Cancelar", que, como Esc, fecha a janela; a janela não fecha durante o envio, e o foco volta ao botão. O "Resumo do pedido" fica abaixo das etapas, com a linha "Cliente" antes do veículo, e os valores, a duração e a previsão vêm sempre da prévia (`POST /api/admin/appointments/preview`, [rotas.md](rotas.md)); a tela não soma nem calcula.

Cinco etapas no formulário em etapas, como o wireframe: "Cliente", "Veículo", "Serviços", "Data e horário" e "Pagamento e resumo". A forma de pagamento fica na última etapa, junto do total que ela muda, como no assistente do cliente ([agendar-servico.md](agendar-servico.md), Etapas). "Próximo" confere a escolha da etapa, e a mensagem some assim que ela é feita; voltar a uma etapa antes de confirmar mantém as outras (RF051, FA01).

- **Cliente** (passo 2): legenda "Para qual cliente é o agendamento?"; campo "Buscar cliente", com a ajuda "Nome ou e-mail" (300 ms depois da última tecla, até 100 caracteres); Enter nele não avança a etapa. Antes do texto, "Digite o nome ou o e-mail para buscar o cliente." e nenhuma leitura. Cada opção traz o nome e o e-mail, em páginas de 10. Escolhido, aparece "Cliente escolhido: <nome> · <e-mail>". Sem resultado (FE01), "Nenhum cliente encontrado" e "Confira o que foi digitado ou cadastre o cliente em Clientes.", com o link "Cadastrar cliente" para `/admin/clients`. Sem escolha, "Escolha o cliente.". Trocar o cliente tira o veículo, os serviços e os adicionais, que são dele (RN003, RN004).
- **Veículo** (passo 3): legenda "Qual veículo de <nome do cliente> será atendido?"; as opções como no assistente do cliente. Sem veículo (FE02), "Nenhum veículo cadastrado" e "Cadastre o veículo nos detalhes do cliente, em Clientes, e volte para agendar.", com o link "Ir para Clientes". Sem escolha, "Escolha o veículo.".
- **Serviços** (passo 4, FA02): legenda "Quais serviços serão feitos?"; o resto, como no assistente do cliente (RN005, RN006, RN009). Trocar o veículo mantém os serviços marcados e mostra os valores do novo porte.
- **Data e horário e Pagamento e resumo** (passos 5 e 6): como no assistente do cliente (RN013, RN015, RN016). Botão "Confirmar agendamento" ("Agendando…"), indisponível sem perder o foco enquanto a prévia não responde. A falha, como o `NOT_IMPLEMENTED` da demonstração, aparece no topo, com a janela aberta; concluído, a janela fecha e as listagens são lidas de novo (passo 8).

Com mais de quatro etapas, o indicador mostra a linha entre as outras etapas só a partir de 448 px de largura, para o título da etapa atual caber a 360 px ([../padroes/componentes.md](../padroes/componentes.md), Formulário em etapas).

## Estados (RNF004)

- Na primeira leitura, o lugar dos cartões fica reservado; numa nova leitura, os anteriores continuam na tela, em "Carregando".
- Nenhum agendamento (UC10 FE01): com busca ou filtro, "Nenhum agendamento encontrado" e "Não há agendamentos para os critérios selecionados."; sem eles, em "Hoje", "Nenhum agendamento para hoje" e "Os agendamentos de hoje e os de dias anteriores ainda em aberto aparecem aqui."; em "Futuros", "Nenhum agendamento futuro" e "Os agendamentos marcados para os próximos dias aparecem aqui."; em "Histórico", "Nenhum agendamento no histórico" e "Os agendamentos concluídos, cancelados e reagendados aparecem aqui.".
- Na falha da leitura, o aviso com a mensagem da API e "Tentar novamente"; a busca, os filtros e as abas continuam na tela.

## Fora da tela, sem requisito

O "Box", os avisos de atraso e de aguardando faturamento, a marca "Multi-dia", "Ver mais" e "Ver serviços" e os botões de ação no cartão, do wireframe; no novo agendamento, o filtro por categoria, o "Sob orçamento", o "Total estimado" na etapa de serviços e o horário de término em cada horário.

## Onde se aplica

- Requisitos: [RF044 a RF049](requisitos.md), [RF052 a RF054](requisitos.md), [RF056](requisitos.md)
- Casos de uso: [UC10](UC10-consultar-agendamentos.md), [UC11](UC11-registrar-agendamento-para-cliente.md), [UC12](UC12-atualizar-status-do-agendamento.md), [UC25](UC25-reagendar-servico-concluido.md)
- Regras: [RN010](RN010-valor-total.md), [RN017](RN017-sequencia-de-status.md), [RN018](RN018-conclusao-com-pagamento.md), [RN019](RN019-cancelamento.md), [RN020](RN020-reagendamento.md), [RN037](RN037-copia-no-agendamento.md)
