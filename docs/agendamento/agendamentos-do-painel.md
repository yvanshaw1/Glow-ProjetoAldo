---
titulo: Conteúdo da página de agendamentos do painel
assunto: agendamento
origem: issue #61, plano memoria/tarefas/61-agendamentos-do-painel/01_plano.md (L1, L5)
relacionados: [UC10, RF044, RF045, RF046, RF047, RF048, RF049, RN017, RN037, RNF004, RNF008]
---

# Conteúdo da página de agendamentos do painel

Visões, filtros, cartão e estados de `/admin/appointments`, do [UC10](UC10-consultar-agendamentos.md). Cabeçalho e navegação: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); listagem, etiqueta de status e telas de demonstração: [../padroes/componentes.md](../padroes/componentes.md); contrato da rota: [rotas.md](rotas.md).

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

A etiqueta de status ([RN017](RN017-sequencia-de-status.md)), o nome do cliente, "<marca> <modelo> · <placa>", "Data: <data e hora>", "Previsão de conclusão: <data e hora>", "Serviços: <nomes>" e "Total: <valor>", com os dados copiados no agendamento ([RN037](RN037-copia-no-agendamento.md)). A data inclui o dia, porque "Hoje" traz dias anteriores. Uma coluna no celular, duas a partir de 768 px e três a partir de 1280 px.

## Estados (RNF004)

- Na primeira leitura, o lugar dos cartões fica reservado; numa nova leitura, os anteriores continuam na tela, em "Carregando".
- Nenhum agendamento (UC10 FE01): com busca ou filtro, "Nenhum agendamento encontrado" e "Não há agendamentos para os critérios selecionados."; sem eles, em "Hoje", "Nenhum agendamento para hoje" e "Os agendamentos de hoje e os de dias anteriores ainda em aberto aparecem aqui."; em "Futuros", "Nenhum agendamento futuro" e "Os agendamentos marcados para os próximos dias aparecem aqui."; em "Histórico", "Nenhum agendamento no histórico" e "Os agendamentos concluídos, cancelados e reagendados aparecem aqui.".
- Na falha da leitura, o aviso com a mensagem da API e "Tentar novamente"; a busca, os filtros e as abas continuam na tela.

## Fora da tela, sem requisito

O "Box", os avisos de atraso e de aguardando faturamento, a marca "Multi-dia" e "Ver mais" e "Ver serviços" do wireframe.

## Onde se aplica

- Requisitos: [RF044 a RF049](requisitos.md)
- Casos de uso: [UC10](UC10-consultar-agendamentos.md)
- Regras: [RN017](RN017-sequencia-de-status.md), [RN037](RN037-copia-no-agendamento.md)
