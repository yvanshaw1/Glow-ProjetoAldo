---
titulo: Componentes compartilhados das telas
origem: issue #35, plano memoria/tarefas/35-base-do-painel/01_plano.md (L2, L3); issue #78, plano memoria/tarefas/78-foco-no-reagendamento/01_plano.md (L2)
relacionados: [RNF002, RNF003, RNF004, RNF005, RNF008, RNF011, RN017, RN035, 0055]
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
- Ação irreversível ou de efeito relevante (excluir, desativar, cancelar) pede o diálogo de confirmação (`ConfirmDialog`), com "Cancelar" e a ação nomeada pelo verbo, como "Excluir"; quando a ação é cancelar, o botão que fecha é "Voltar", para os dois botões não terem o mesmo verbo.
- O foco começa em "Cancelar" (ou "Voltar"), fica no diálogo enquanto ele está aberto e volta ao botão que o abriu (RNF005). Durante a chamada, o diálogo não fecha, e a falha aparece dentro dele (RNF003, RNF004).

## Formulário em etapas (RNF002)

- Um único formulário (`useForm`) para todas as etapas, no `StepForm`: voltar não perde nada.
- A indicação mostra o número de cada etapa e o título da atual, com `aria-current="step"`; os outros títulos aparecem quando o formulário tem largura para eles. O título da atual encolhe com reticências quando não cabe, e o leitor de tela ouve o título inteiro. Ao mudar de etapa, o foco vai ao título dela.
- "Próximo" confere só os campos da etapa; "Voltar" não confere nada; o último botão envia tudo. Um erro da API num campo de outra etapa leva a ela.
- Na primeira etapa, "Cancelar" fica no lugar de "Voltar" quando o formulário está numa janela; numa página, como `/booking`, a primeira etapa não tem esse botão.
- Enquanto o formulário lê a API de novo a cada escolha, como a prévia do agendamento, os campos continuam habilitados e o foco fica onde está (RNF005); só o botão de envio espera a resposta, indisponível com `aria-disabled`, sem perder o foco.

## Campo monetário (RN035)

O campo monetário (`MoneyInput`) mostra sempre o valor formatado (`formatCurrency`) e entrega ao formulário o número em reais, ou `null` quando vazio (RN035). Cada algarismo digitado entra no fim dos centavos: 1 dá R$ 0,01, e 1, 2, 5, 0, 0, 0 dão R$ 1.250,00; apagar tira o último. Até R$ 99.999,99; o algarismo além disso é ignorado. Teclado numérico no celular. A leitura do texto digitado é `readCurrencyInput`, em `src/shared/format/currency.ts`.

## Formulários

- O rótulo do campo opcional termina em "(opcional)", e o obrigatório não tem marca. O valor `null` da API aparece como campo vazio, e o campo vazio vai como texto vazio, que o esquema converte em `null`.
- No formulário que continua na tela depois de gravar, como os das configurações, o sucesso aparece no topo do formulário, no lugar do aviso de falha, como status (`role="status"`), com o ícone e o texto, como "Dados da empresa salvos.". Some na próxima alteração ou no próximo envio.
- No 409 `VERSION_CONFLICT`, o aviso fica no topo, com o foco, e o formulário recarrega o registro, trocando o que foi digitado pelos dados atuais.

## Telas de demonstração (decisão 0055)

- Enquanto a rota de uma tela não existe, `src/lib/demo/` responde no lugar dela. O `apiRequest` procura o método e o caminho na lista de demonstração antes de chamar a rede e, se os acha, devolve os dados fixos do módulo, tipados por `src/shared/api/`, depois de 400 ms, para os estados de carregamento aparecerem. Os dados de cada módulo só são carregados quando a tela os pede.
- As leituras, inclusive os `POST` que não gravam, como a prévia de valores e a análise do dashboard, devolvem os dados fixos; a resposta que depende do corpo, como a prévia, é calculada sobre os dados fixos do módulo e as configurações do `seed.sql`, até a rota existir. As gravações respondem `NOT_IMPLEMENTED`, que a tela mostra como qualquer falha.
- Os dados fixos usam os nomes, as placas e os serviços fictícios do `supabase/seed-demo.sql` (`guia/regras.md`, Dados).
- Toda tela, aba ou seção com dados de demonstração mostra o aviso "Dados de demonstração: esta parte ainda não está ligada ao sistema, e nada do que você fizer nela é gravado.", com o ícone `FlaskConical`, sem botão de fechar (`DemoNotice`, em `src/components/shared/`). Ele fica logo abaixo do título da página, ou no topo do painel da aba, ou logo abaixo do título da seção, antes de qualquer dado ou formulário.
- Na demonstração, a listagem pagina, busca e filtra sobre a lista fixa. O formulário tem os campos, as etapas, as máscaras e os diálogos, sem o esquema de validação, que entra com a rota; o envio mostra o aviso de `NOT_IMPLEMENTED`. No formulário em etapas, "Próximo" confere só se as escolhas obrigatórias da etapa foram feitas (`rules` do React Hook Form), para a etapa seguinte ter do que depender, como o veículo antes dos serviços (RF019); o esquema as substitui com a rota.
- A tarefa que constrói rotas tira as entradas delas da lista e o aviso da tela no mesmo PR; a que tirar a última remove `src/lib/demo/`, o código `NOT_IMPLEMENTED` e o `DemoNotice`.

## Etiqueta de status (RN017)

O status do agendamento aparece na etiqueta `StatusBadge`, de `src/components/shared/`, sempre com o nome de RN017 escrito. O tom indica a fase, só com as cores do tema; o contraste do texto é calculado pela fórmula da WCAG sobre `--background`, a cor das superfícies.

| Status | Etiqueta | Texto (claro / escuro) |
|---|---|---|
| Agendado, Em espera, Em execução e Finalizado | em relevo (`shadow-neu-sm`), texto em `--link` | 4,8 / 6,5 |
| Concluído | rebaixada (`inset-shadow-neu-sm`), texto em `--foreground` | 12,5 / 11,8 |
| Cancelado | fundo `--destructive` a 10%, texto em `--destructive` | 5,0 / 5,5 |
| Reagendado | sem fundo, borda de 1 px em `--input`, texto em `--muted-foreground` | 4,9 / 4,9 |
