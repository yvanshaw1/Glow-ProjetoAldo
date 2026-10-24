---
titulo: Conteúdo das abas Disponibilidade e Formas de pagamento do painel
assunto: configuracoes
origem: issue #65, plano memoria/tarefas/65-equipe-e-configuracoes/01_plano.md (L4, L5)
relacionados: [UC23, UC24, RF085, RF087, RF088, RN012, RN013, RN035, RNF004]
---

# Conteúdo das abas Disponibilidade e Formas de pagamento do painel

Textos, controles e estados das abas "Disponibilidade" ([UC23](UC23-configurar-disponibilidade.md)) e "Formas de pagamento" ([UC24](UC24-configurar-formas-de-pagamento.md)) de `/admin/settings`. Estilo: [../padroes/design.md](../padroes/design.md); formulários e telas de demonstração: [../padroes/componentes.md](../padroes/componentes.md); contrato das rotas: [rotas.md](rotas.md). Onde o wireframe `staffPages/adminPainelConfs/` diverge deste texto (sem a pausa, horários de fechamento diferentes, regras de sinal por forma de pagamento e botão de gravar por forma), vale este texto.

## Abas

- "Empresa", "Disponibilidade" e "Formas de pagamento" ([RF085](requisitos.md)), nessa ordem; a aba escolhida e o digitado em cada uma ficam como em [rotas.md](rotas.md).
- Enquanto as rotas `business-hours` e `payment-fees` usarem os dados de demonstração de `src/lib/demo/settings.ts` (decisão 0055), o aviso de demonstração fica no topo do painel de cada uma dessas duas abas; a "Empresa" não o tem. O envio de qualquer uma mostra a falha `NOT_IMPLEMENTED` no topo da aba, e nada é gravado.

## Disponibilidade (UC23, RF087, RN013)

- Texto de apoio: "Defina os dias e os horários em que a empresa atende."
- Sete linhas, de domingo a sábado, cada uma com o interruptor "<dia> aberto" (descrição visível "Aberto" ou "Fechado"), "Abre às", "Fecha às" e o interruptor "Pausa" com "Início da pausa" e "Fim da pausa".
- Os horários são listas de meia em meia hora ([RN035](../plataforma/RN035-formatos-dos-dados.md)), das 00:00 às 23:30. Dia fechado esconde os horários e a pausa e guarda o que havia, se for reaberto; dia aberto novo vem com 08:00 e 18:00, sem pausa.
- Botão "Salvar disponibilidade" ("Salvando…"), no fim; falha no topo; sucesso "Disponibilidade salva." como status. Carregamento com o lugar reservado; falha com "Tentar novamente".
- A consistência dos horários (UC23 FE01 e FE02) é conferida pela rota; `PUT` não tem `updatedAt`, então a aba não tem `VERSION_CONFLICT`.

## Formas de pagamento (UC24, RF088, RN012)

- Texto de apoio: "Defina o acréscimo ou o desconto aplicado ao valor do agendamento em cada forma de pagamento."
- Quatro cartões (Crédito, Débito, Pix e Dinheiro), cada um com "Ajuste" (Acréscimo ou Desconto, botões de opção) e "Percentual" (de 0 a 100, vírgula decimal, duas casas, sufixo "%"). O percentual zero é "sem ajuste" (FA01).
- Botão "Salvar percentuais" ("Salvando…"); falha no topo; sucesso "Percentuais salvos." como status. O valor guardado é o percentual com sinal, negativo para desconto ([dados.md](dados.md)).
- O percentual fora do intervalo (UC24 FE01) é conferido pela rota; `PUT` não tem `updatedAt`.

## Dados de demonstração

Os do `seed.sql`: de segunda a sexta, das 08:00 às 18:00, com pausa das 12:00 às 13:00; sábado, das 08:00 às 12:00; domingo fechado; as quatro formas de pagamento sem ajuste.
