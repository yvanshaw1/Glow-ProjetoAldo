---
titulo: Conteúdo da página de agendamentos do cliente
assunto: agendamento
origem: issue #58, plano memoria/tarefas/58-telas-do-cliente/01_plano.md (L3, L4)
relacionados: [UC07, UC25, RF028, RF029, RF030, RF032, RN017, RN019, RN020]
---

# Conteúdo da página de agendamentos do cliente

Abas, cartão, detalhe, ações e textos de `/appointments`, do [UC07](UC07-acompanhar-agendamentos.md). Cabeçalho: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); listagem, janelas e etiqueta de status: [../padroes/componentes.md](../padroes/componentes.md).

Enquanto as rotas `/api/me/appointments` usarem os dados de demonstração, o aviso fica logo abaixo do título da página.

## Página

- Título: "Meus agendamentos".
- Abas "Atuais" (Agendado, Em espera, Em execução e Finalizado) e "Histórico" (Concluído, Cancelado e Reagendado), em ordem de data ([rotas.md](rotas.md)). Cada aba lê a lista de novo ao ser escolhida, então um cancelamento aparece no histórico.
- Uma lista paginada por aba, sem grupos; uma coluna, duas a partir de 1024 px.
- Enquanto a lista carrega, o lugar dos cartões fica reservado; na falha, o aviso com a mensagem e "Tentar novamente".

## Cartão

A etiqueta de status ([RN017](RN017-sequencia-de-status.md)), "<marca> <modelo>", "Placa <placa> · <cor>", "Data: <data e hora>", "Previsão de conclusão: <data e hora>", "Serviços: <nomes>", "Total: <valor>" e o botão "Ver detalhes".

## Nenhum agendamento (UC07 FE01)

- Em "Atuais": "Nenhum agendamento atual" e "Os seus próximos agendamentos aparecem aqui.".
- Em "Histórico": "Nenhum agendamento no histórico" e "Os agendamentos concluídos, cancelados e reagendados aparecem aqui.".

## Detalhe

- Janela "Detalhes do agendamento", que lê o agendamento ao abrir: a etiqueta; "Data e horário", "Previsão de conclusão" e "Duração estimada"; "Veículo" (marca e modelo, placa, cor, ano, tipo e porte); "Serviços", com o valor de cada um; "Forma de pagamento"; "Subtotal" e "Acréscimo de <percentual>" ou "Desconto de <percentual>", só quando a forma de pagamento tem percentual; "Total".
- Enquanto carrega, o lugar fica reservado; na falha, o aviso com "Tentar novamente".

## Ações por status

Só no detalhe. A tela só orienta; quem decide é a API (RS008).

- "Agendado": "Cancelar agendamento" ([RN019](RN019-cancelamento.md)).
- Os outros: nenhuma nesta tela, além das da #59.

## Cancelamento (UC07 FA01)

- Confirmação: título "Cancelar este agendamento?", texto "O agendamento passa a Cancelado e vai para o histórico. Esta ação não pode ser desfeita.", botões "Voltar" e "Cancelar agendamento" ("Cancelando…"), na cor de erro.
- Confirmado, as duas janelas fecham e a lista é lida de novo. A falha, como o 409 `INVALID_STATUS` de um agendamento que já mudou de status (FE02), aparece dentro da confirmação.

## Fora da tela

Sem requisito: os grupos "Em andamento" e "Próximos", o "Cancelar" no próprio cartão, o motivo do cancelamento, o "Agendar" no topo (o cabeçalho já tem) e o "Box".
