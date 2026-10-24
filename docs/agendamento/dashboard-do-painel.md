---
titulo: Conteúdo da tela do dashboard
assunto: agendamento
origem: issue #60, plano memoria/tarefas/60-telas-do-dashboard/01_plano.md (L2, L3, L5, L6)
relacionados: [UC09, UC27, RF040, RF041, RF042, RF043, RF089, RF090, RN017, RN021, RN035, RN037, RN038, RN039]
---

# Conteúdo da tela do dashboard

Período, indicadores, análise do período, gráficos, agenda do dia e estados de `/admin`, do [UC09](UC09-visualizar-dashboard.md) e do [UC27](UC27-gerar-analise-do-dashboard.md). Cabeçalho e navegação: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); etiqueta de status e telas de demonstração: [../padroes/componentes.md](../padroes/componentes.md); contrato da rota: [rotas.md](rotas.md).

Enquanto as rotas do dashboard usarem os dados de demonstração de `src/lib/demo/dashboard.ts` (decisão 0055), o aviso de demonstração fica logo abaixo do título da página.

## Página

- Título: "Dashboard". Seções, numa coluna: "Período", os indicadores, "Análise do período", "Receita por dia" e "Agendamentos por status" (lado a lado a partir de 1280 px, a receita em 2/3) e "Agenda do dia".
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

## Análise do período (UC27, RF089, RF090)

Cartão na largura toda, logo abaixo dos indicadores, com o ícone `Sparkles` ([../padroes/design-midia.md](../padroes/design-midia.md)) e os textos abaixo. O texto da análise é de um serviço de IA e aparece como texto, nunca como HTML (RS020).

- Título "Análise do período" e "Um resumo em texto dos indicadores deste período, escrito por inteligência artificial a partir dos números do sistema."
- Botão "Gerar análise". A geração é pedida pelo clique, nunca sozinha. Enquanto espera, o botão diz "Gerando análise…", fica indisponível sem perder o foco (`aria-disabled`) e o lugar do texto fica reservado, em três linhas.
- Resultado: o resumo; as observações, cada uma com o nome do indicador em negrito; "Gerado por inteligência artificial em 23/10/2026 às 14:32. Pode conter imprecisões: os números oficiais são os dos indicadores." (data e hora no fuso da empresa, decisão 0053); e o botão passa a "Gerar novamente", que troca a análise exibida (UC27 FA01).
- Sem comparação (UC27 FA03): "O período anterior não tem agendamentos: a análise não compara os períodos."
- Período sem agendamentos (UC27 FE01): o botão fica indisponível, e o texto "Não há dados suficientes no período para gerar a análise." o descreve.
- Falha (UC27 FE02): o aviso com a mensagem da API e "Tentar novamente", que pede de novo e leva o foco ao botão; os indicadores continuam na tela (RNF017).
- Uma região de status, sempre presente, anuncia "Análise gerada.". Escolher outro período leva o cartão de volta ao começo (UC27 FA02), e a chamada em curso é cancelada.

## Gráficos (RF041, RF042, UC09 passo 3)

- "Receita por dia": barras, uma por dia do período, em `--link`; no eixo horizontal, o dia e o mês ("05/10"), com poucos rótulos; no vertical, valores em reais; a dica com a data e o valor. Sem receita no período: "Nenhuma receita no período."
- "Agendamentos por status": barras horizontais, uma por status, na ordem de [RN017](RN017-sequencia-de-status.md), com o nome e a quantidade escritos; as cores seguem os tons da etiqueta de status. Sem agendamentos: "Nenhum agendamento no período."
- Cores, contraste e acesso sem a cor: [../padroes/design.md](../padroes/design.md), Gráficos. Cada gráfico tem uma tabela com os mesmos dados, visualmente oculta, para o leitor de tela ("Dia" e "Receita"; "Status" e "Agendamentos"); o desenho não é lido nem focável.
- O código dos gráficos (Recharts, decisão 0056) só é carregado depois da página, quando a primeira resposta chega (RNF006); até lá, o lugar do gráfico fica reservado.

## Agenda do dia (RF043)

- Título "Agenda do dia", com a data de hoje por extenso.
- Os agendamentos marcados para hoje, de qualquer status, por horário. Cada item: "<início> às <previsão>", o cliente, "<marca> <modelo> · <placa>", os serviços, o total e a etiqueta de status ([RN017](RN017-sequencia-de-status.md)), com os dados copiados no agendamento ([RN037](RN037-copia-no-agendamento.md)). Uma coluna no celular; a linha em colunas a partir de 768 px.
- Sem agendamentos: "Nenhum agendamento para hoje" e "Os agendamentos marcados para hoje aparecem aqui.".

## Estados

- Na primeira leitura, o lugar dos indicadores, dos gráficos e da agenda fica reservado; numa nova leitura, o conteúdo anterior continua na tela, com a aparência de carregando (RNF004).
- Na falha da leitura (UC09 FE03), o aviso com a mensagem da API e "Tentar novamente"; o seletor de período continua na tela.

## Fora da tela, sem requisito

A saudação, "Avaliação média", "Alertas" e a variação em relação ao período anterior nos cartões (a rota não devolve o período anterior).

## Onde se aplica

- Requisitos: [RF040 a RF043](requisitos.md), [RF089 e RF090](requisitos.md)
- Casos de uso: [UC09](UC09-visualizar-dashboard.md), [UC27](UC27-gerar-analise-do-dashboard.md)
- Regras: [RN021](RN021-indicadores-do-dashboard.md), [RN035](../plataforma/RN035-formatos-dos-dados.md), [RN038](RN038-dados-da-analise-do-dashboard.md), [RN039](RN039-conteudo-da-analise-do-dashboard.md)
