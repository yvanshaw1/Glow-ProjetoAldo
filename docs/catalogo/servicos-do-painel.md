---
titulo: Conteúdo da página de serviços e categorias do painel
assunto: catalogo
origem: issue #63, plano memoria/tarefas/63-servicos-e-categorias/01_plano.md (L1 a L6)
relacionados: [UC13, UC14, UC15, RF057, RF058, RF059, RF060, RF061, RF062, RF063, RF064, RF065, RF066, RF067, RF068, RN006, RN007, RN008, RN009, RN030, RN031, RN035, RS015, RNF002, RNF011]
---

# Conteúdo da página de serviços e categorias do painel

Abas, listagens, cartões, janelas, confirmações e estados de `/admin/services`, do [UC13](UC13-cadastrar-servico.md), do [UC14](UC14-manter-servicos.md) e do [UC15](UC15-manter-categorias.md). Cabeçalho e navegação: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); listagem, formulário em etapas, campo monetário e telas de demonstração: [../padroes/componentes.md](../padroes/componentes.md); contrato das rotas: [rotas.md](rotas.md).

Enquanto as rotas `/api/admin/services` e `/api/admin/categories` usarem os dados de demonstração de `src/lib/demo/admin-catalog.ts` (decisão 0055), o aviso de demonstração fica logo abaixo do título da página.

## Página

- Título "Serviços". Abaixo dele, o aviso de demonstração e as abas "Serviços" e "Categorias" (RF057), cada uma com o botão de criar ("Novo serviço", "Nova categoria") ao lado das abas a partir de 768 px e abaixo delas no celular.
- Cada aba lê a rota de novo ao ser escolhida e começa sem busca nem filtro. O acesso à página é da permissão `services` ([RN025](../equipe/RN025-permissoes.md)).

## Serviços (UC14, RF058, RF059)

- Busca "Buscar por nome", que vale 300 ms depois da última tecla e volta à primeira página.
- Filtro por tipo com "Todos", "Principal", "Adicional" e "Complementar" (RF058).
- Interruptor "Exibir inativos" (RF059, FA01): sem ele, a listagem tem só os serviços ativos; o serviço excluído nunca aparece ([RN030](../plataforma/RN030-exclusao-logica.md)).
- "Limpar filtros" aparece quando há busca, tipo escolhido ou inativos exibidos, e tira os três numa ação só. O foco vai à busca.
- Os serviços vêm em ordem alfabética, 20 por página, com a faixa "1–20 de 36" e os botões de página (RNF008).

## Cartão do serviço

- O nome; a etiqueta do tipo ("Principal", "Adicional" ou "Complementar"); a etiqueta "Inativo", quando é o caso; a categoria e a descrição, que o adicional não tem; "Duração: <duração>"; o valor ("A partir de <menor valor>" no serviço por porte, ou o valor fixo); e os botões "Editar", "Desativar" ou "Reativar" e "Excluir".
- O serviço de uma categoria inativa continua na listagem do painel, com o aviso "Categoria inativa: oculto para o cliente" ([RN031](RN031-categoria-inativa.md)).
- Uma coluna no celular, duas a partir de 768 px e três a partir de 1280 px.

## Ações do serviço

- **Desativar e reativar** ([RN008](RN008-servico-inativo.md), UC14 FA02 e FA03): sem confirmação. O botão passa a "Desativando…" ou "Reativando…" e fica indisponível, sem perder o foco (`aria-disabled`); a falha aparece no topo da listagem, com o foco.
- **Excluir** (FA04): confirmação com o título "Excluir este serviço?", o texto "O serviço deixa de ser exibido e não pode ser desfeito pelo painel. Os agendamentos em que ele consta são preservados.", e os botões "Voltar" e "Excluir serviço" ("Excluindo…"), na cor de erro. A falha aparece dentro da confirmação.
- **Editar**: abre a janela do cadastro, descrita abaixo.

## Janela "Novo serviço" (UC13, RF060 a RF063)

Primeiro a escolha do tipo, em três botões de opção com o nome e uma frase: "Principal" ("Serviço central do agendamento"), "Adicional" ("Oferecido junto com um serviço principal, com valor fixo") e "Complementar" ("Serviço independente, sem adicionais"), e o botão "Continuar". Em seguida, o formulário em etapas de [componentes.md](../padroes/componentes.md), que conforme o tipo (RN006) tem:

| Tipo | Etapas |
|---|---|
| Principal | "Informações", "Valores" e "Adicionais" |
| Complementar | "Informações" e "Valores" (sem vínculo de adicionais, FA02) |
| Adicional | uma só, sem título de etapa (FA01) |

- **Informações** (RF061 e RF063): "Categoria" (só as ativas), "Forma de precificação" ("Por porte" ou "Valor fixo", em botões de opção), "Duração média (minutos)" (de 5 a 2.400), "Nome", "Descrição" e "Imagem (opcional)".
- **Valores** ([RN009](RN009-precificacao.md)): "Valor fixo", ou "Pequeno (P)", "Médio (M)", "Grande (G)" e "Extra grande (GG)", todos obrigatórios, no campo monetário e maiores que zero.
- **Adicionais**, só no principal: os adicionais cadastrados, para marcar, sem obrigatoriedade. Sem nenhum: "Nenhum serviço adicional cadastrado."
- **Adicional** (RF062): "Nome", "Duração média (minutos)", "Valor fixo" e, opcional, "Serviços principais vinculados"; sem categoria, descrição, imagem nem forma de precificação. Sem principal cadastrado: "Nenhum serviço principal cadastrado."
- Sem categoria ativa, no principal e no complementar, a janela diz "Cadastre uma categoria antes de criar este serviço." (FE03), com o botão "Ir para as categorias".
- O último botão é "Salvar serviço" ("Salvando…"). A falha aparece no topo da janela, com o foco, e os dados informados continuam nos campos.
- **Imagem** (UC13 passo 4 e FE02, [RS015](../plataforma/seguranca.md)): o botão "Escolher imagem" (JPEG, PNG ou WebP, até 2 MB), a prévia abaixo do campo, "Trocar imagem" e "Remover imagem". Arquivo de outro tipo ou maior que 2 MB: "Use uma imagem JPEG, PNG ou WebP de até 2 MB." Na demonstração a imagem só aparece na prévia, e nada é enviado.

## Editar serviço (UC14 passos 4 a 7, RF064)

A mesma janela, "Editar serviço", sem a escolha do tipo, que não se altera (`dados.md`), e com os dados do detalhe. Um 409 `VERSION_CONFLICT` ([RNF011](../plataforma/requisitos.md)) mostra o aviso no topo e recarrega os dados do serviço.

## Categorias (UC15, RF067, RF068)

- Cartão com o nome, a descrição, a etiqueta "Ativa" ou "Inativa" e os botões "Editar" e "Desativar" ou "Reativar". Interruptor "Exibir inativos" (FA03). A categoria não tem exclusão, só desativação ([RN030](../plataforma/RN030-exclusao-logica.md)).
- Janela "Nova categoria" ou "Editar categoria", com "Nome" e "Descrição", ambos obrigatórios ([rotas.md](rotas.md)), e os botões "Cancelar" e "Salvar" ("Salvando…").
- **Desativar** (FA02): confirmação "Desativar esta categoria?", "Os serviços dela deixam de aparecer no portal e no agendamento, mas continuam no painel. Você pode reativá-la depois.", botões "Voltar" e "Desativar categoria". **Reativar**: "Reativar esta categoria?", "Os serviços dela voltam a aparecer no portal e no agendamento.", botões "Voltar" e "Reativar categoria" ([RN031](RN031-categoria-inativa.md)).

## Estados

- Carregamento: o esqueleto dos cartões. Vazio: "Nenhum serviço cadastrado", "Nenhuma categoria cadastrada" e, com busca ou filtro, "Nenhum serviço encontrado". Falha da leitura: o aviso com "Tentar novamente".
- A falha de uma gravação aparece no topo da janela ou da confirmação, com a mensagem da API.
