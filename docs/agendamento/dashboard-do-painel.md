---
titulo: Conteúdo da tela do dashboard
assunto: agendamento
origem: issue #60, plano memoria/tarefas/60-telas-do-dashboard/01_plano.md (L2, L3, L6)
relacionados: [UC09, RF040, RF041, RF042, RF043, RN017, RN021, RN035, RN037]
---

# Conteúdo da tela do dashboard

Período, indicadores, agenda do dia e estados de `/admin`, do [UC09](UC09-visualizar-dashboard.md). Cabeçalho e navegação: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); etiqueta de status e telas de demonstração: [../padroes/componentes.md](../padroes/componentes.md); contrato da rota: [rotas.md](rotas.md).

Enquanto as rotas do dashboard usarem os dados de demonstração de `src/lib/demo/dashboard.ts` (decisão 0055), o aviso de demonstração fica logo abaixo do título da página.

## Página

- Título: "Dashboard". Seções, numa coluna: "Período", os indicadores, "Agenda do dia" e, nos PRs seguintes da tarefa, "Análise do período", "Receita por dia" e "Agendamentos por status".
- A página lê o dashboard ao abrir, sem período: vale o mês atual do servidor, e os campos mostram o período da resposta.

## Período (UC09 FE02, RN035)

O período é escolhido por atalhos e por dois campos de data.

- Atalhos: "Este mês" (do primeiro ao último dia do mês atual, o padrão), "Hoje", "7 dias" e "30 dias" (os últimos dias, contando o de hoje). Cada um preenche "De" e "Até" e vale na hora; fica marcado o que coincide com o período mostrado.
- Campos "De" e "Até": a mudança de um campo vale 300 ms depois da última alteração, como a busca das listagens.
- Durante a leitura, nada fica desativado e o foco não sai do controle usado; o conteúdo anterior continua na tela, com a aparência de carregando.
- Período recusado (UC09 FE02): a mensagem aparece junto ao campo ("A data final não pode ser anterior à inicial." ou "O período não pode passar de 12 meses."), e a área de resultados diz "Informe um período válido para ver o dashboard."
- A linha "Período exibido: 01/10/2026 a 31/10/2026." acompanha a resposta e é anunciada quando ela chega.

## Indicadores (RF040, RN021)

Quatro, com os valores da resposta, sem cálculo na tela, cada um com uma linha que diz o que conta:

- "Receita": "Agendamentos Concluído e Reagendado".
- "Agendamentos": "Todos os status do período".
- "Ticket médio": "Receita por agendamento pago".
- "Taxa de cancelamento": "Cancelados sobre o total do período".

Período sem agendamentos (UC09 FE01): os valores zerados e "Não há dados a apresentar neste período."

## Agenda do dia (RF043)

- Título "Agenda do dia", com a data de hoje por extenso.
- Os agendamentos marcados para hoje, de qualquer status, por horário. Cada item: "<início> às <previsão>", o cliente, "<marca> <modelo> · <placa>", os serviços, o total e a etiqueta de status ([RN017](RN017-sequencia-de-status.md)), com os dados copiados no agendamento ([RN037](RN037-copia-no-agendamento.md)). Uma coluna no celular; a linha em colunas a partir de 768 px.
- Sem agendamentos: "Nenhum agendamento para hoje" e "Os agendamentos marcados para hoje aparecem aqui.".

## Estados

- Na primeira leitura, o lugar dos indicadores e da agenda fica reservado; numa nova leitura, o conteúdo anterior continua na tela, com a aparência de carregando (RNF004).
- Na falha da leitura (UC09 FE03), o aviso com a mensagem da API e "Tentar novamente"; o seletor de período continua na tela.

## Fora da tela, sem requisito

A saudação, "Avaliação média", "Alertas" e a variação em relação ao período anterior nos cartões (a rota não devolve o período anterior).

## Onde se aplica

- Requisitos: [RF040 a RF043](requisitos.md)
- Casos de uso: [UC09](UC09-visualizar-dashboard.md)
- Regras: [RN021](RN021-indicadores-do-dashboard.md), [RN035](../plataforma/RN035-formatos-dos-dados.md)
