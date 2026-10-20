---
titulo: Componentes compartilhados das telas
origem: issue #35, plano memoria/tarefas/35-base-do-painel/01_plano.md (L2, L3)
relacionados: [RNF002, RNF003, RNF004, RNF005, RNF008, RNF011, RN035]
---

# Componentes compartilhados das telas

Parte de [frontend.md](frontend.md). Estilo: [design.md](design.md). Código: `src/components/shared/` e `src/hooks/`.

## Listagem (RNF008)

- A página, a busca e os filtros ficam no componente (`usePaginatedList`), não no endereço: recarregar a página, voltar a ela ou voltar do login mostra a primeira página, sem busca nem filtros. A paginação usa botões.
- A chamada leva `page`, `pageSize` (o de [api.md](api.md)) e, quando houver, `search` e os filtros (`withQuery`); parâmetro vazio não vai.
- A busca vale 300 ms depois da última tecla, com até 100 caracteres (RN035). Nova busca, novo filtro e "Limpar filtros", que tira a busca e os filtros numa ação só (RF048), voltam à primeira página.
- A paginação mostra a faixa "1–20 de 134", anunciada pelo leitor de tela, e os botões primeira, anterior, até três números, próxima e última. Se uma exclusão esvaziar a última página, a listagem vai à última página com itens.
- Estados (RNF004): na primeira carga, o lugar reservado; numa nova carga, os itens anteriores no estado "Carregando"; na falha, o aviso com "Tentar novamente"; sem itens, o estado vazio com a mensagem da tela.

## Diálogos

- Cadastro e edição ficam numa janela (`dialog`), ancorada embaixo no celular.
- Ação irreversível ou de efeito relevante (excluir, desativar, cancelar) pede o diálogo de confirmação (`ConfirmDialog`), com "Cancelar" e a ação nomeada pelo verbo, como "Excluir".
- O foco começa em "Cancelar", fica no diálogo enquanto ele está aberto e volta ao botão que o abriu (RNF005). Durante a chamada, o diálogo não fecha, e a falha aparece dentro dele (RNF003, RNF004).

## Formulário em etapas (RNF002)

- Um único formulário (`useForm`) para todas as etapas, no `StepForm`: voltar não perde nada.
- A indicação mostra o número de cada etapa e o título da atual, com `aria-current="step"`; os outros títulos aparecem quando o formulário tem largura para eles. Ao mudar de etapa, o foco vai ao título dela.
- "Próximo" confere só os campos da etapa; "Voltar" não confere nada; o último botão envia tudo. Um erro da API num campo de outra etapa leva a ela.
- Na primeira etapa, "Cancelar" fica no lugar de "Voltar".

## Campo monetário (RN035)

O campo monetário (`MoneyInput`) mostra sempre o valor formatado (`formatCurrency`) e entrega ao formulário o número em reais, ou `null` quando vazio (RN035). Cada algarismo digitado entra no fim dos centavos: 1 dá R$ 0,01, e 1, 2, 5, 0, 0, 0 dão R$ 1.250,00; apagar tira o último. Até R$ 99.999,99; o algarismo além disso é ignorado. Teclado numérico no celular. A leitura do texto digitado é `readCurrencyInput`, em `src/shared/format/currency.ts`.

## Formulários

- O rótulo do campo opcional termina em "(opcional)", e o obrigatório não tem marca. O valor `null` da API aparece como campo vazio, e o campo vazio vai como texto vazio, que o esquema converte em `null`.
- No formulário que continua na tela depois de gravar, como os das configurações, o sucesso aparece no topo do formulário, no lugar do aviso de falha, como status (`role="status"`), com o ícone e o texto, como "Dados da empresa salvos.". Some na próxima alteração ou no próximo envio.
- No 409 `VERSION_CONFLICT`, o aviso fica no topo, com o foco, e o formulário recarrega o registro, trocando o que foi digitado pelos dados atuais.
