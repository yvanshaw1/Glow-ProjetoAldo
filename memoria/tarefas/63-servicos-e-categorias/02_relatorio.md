---
issue: 63
pull_request: 95
---

# Relatório: Telas de serviços e categorias do painel com dados de demonstração

Em três PRs: o #93, da base (`Refs #63`); o #94, das listagens (`Refs #63`); e o #95, do formulário do serviço (`Closes #63`, este). O relatório está completo, e o plano passou a `concluido` neste PR.

## O que foi feito

PR #93, base:

- **Tipos** `AdminCategory`, `AdminServiceSummary` e `AdminService` em `src/shared/api/catalog.ts`.
- **Dados de demonstração** (decisão 0055) em `src/lib/demo/admin-catalog.ts`, com as quatro categorias (uma inativa), os 17 serviços e os vínculos do `seed-demo.sql`, sem o serviço excluído; `GET /api/admin/services`, `/api/admin/services/:id` e `GET /api/admin/categories` respondidos por eles (tipo, `includeInactive` e busca por nome); `POST`, `PATCH` e `DELETE` de serviços e `POST` e `PATCH` de categorias recusados com `NOT_IMPLEMENTED`.
- **Documentação:** `docs/catalogo/servicos-do-painel.md` (L1, L2, L4, L5 e L6), a linha em `docs/catalogo/CONTEXT.md` e os campos das leituras em `rotas.md` (L3).

PR #94, listagens:

- **`/admin/services`** com as abas "Serviços" e "Categorias" (RF057) e o aviso de demonstração.
- **Serviços** (UC14, RF058, RF059, RF065, RF066): busca por nome, filtro por tipo, "Exibir inativos", "Limpar filtros", cartão com tipo, situação, categoria, duração e valor, o aviso "Categoria inativa: oculto para o cliente" (RN031), "Desativar" e "Reativar" sem confirmação e "Excluir" com confirmação (RN030).
- **Categorias** (UC15, RF067, RF068): cartão com a situação, "Nova categoria" e "Editar" em janela com nome e descrição obrigatórios, "Desativar" e "Reativar" com confirmação, "Exibir inativos"; sem exclusão (L1).
- `PaginatedList` com busca e botão "Limpar filtros" opcionais e `FormField` com `rules` opcional.

PR #95, formulário do serviço:

- **Novo serviço** (UC13, RF060 a RF063): escolha do tipo e formulário em etapas conforme o tipo: principal em três ("Informações", "Valores", "Adicionais"), complementar em duas (FA02) e adicional em uma, só com nome, duração, valor fixo e o vínculo opcional a principais, sem imagem (FA01); categorias só as ativas (RN007), precificação por porte ou fixa (RN009) e, sem categoria ativa, o aviso com "Ir para as categorias" (FE03).
- **Campo de imagem** com prévia local, troca e "Remover imagem", conferindo formato e tamanho só como orientação (FE02, RS015); nada é enviado.
- **Editar serviço** (UC14, RF064): a mesma janela, lida do detalhe, sem a escolha do tipo; `VERSION_CONFLICT` mantém o aviso no topo e lê o serviço de novo (RNF011).
- **`FormDialog`** em `src/components/shared/`, movido de `admin/appointments/` e usado também pela janela do serviço.

## Arquivos alterados

- `src/shared/api/catalog.ts`, `src/lib/demo/admin-catalog.ts` (novo), `src/lib/demo/routes.ts`.
- `src/app/(admin)/admin/services/page.tsx` (novo).
- `src/components/admin/catalog/` (novos): `catalog-tabs.tsx`, `service-list.tsx`, `service-card.tsx`, `service-active-button.tsx`, `service-type-filter.tsx`, `inactive-switch.tsx`, `category-list.tsx`, `category-card.tsx`, `category-form-dialog.tsx`, `service-form-dialog.tsx`, `service-wizard.tsx`, `service-form-values.ts`, `service-data-step.tsx`, `service-prices-step.tsx`, `service-links-step.tsx`, `service-image-field.tsx`, `choice-group.tsx`.
- `src/components/shared/form-dialog.tsx` (movido de `admin/appointments/appointment-form-dialog.tsx`), `form-field.tsx`, `paginated-list.tsx`; `src/components/admin/appointments/appointment-views.tsx` e `appointment-details-dialog.tsx` (o nome do `FormDialog`).
- `docs/catalogo/servicos-do-painel.md` (novo), `CONTEXT.md` e `rotas.md`.

## Testes executados

- `npm run check`: sem erros nem avisos em cada PR (414 testes) e `npx next build`.
- Nenhuma função pura de regra de negócio entrou, então não há teste novo (decisão 0052). O `admin-catalog.ts` foi conferido por um teste temporário do Vitest com `apiRequest` (apagado): 16 serviços ativos, filtros, busca, 4 categorias com inativas, detalhe com vínculos e gravação recusada.
- Verificação local no navegador, com o banco local (`db reset`), o admin local e `next start` na porta 3060, a 360 × 800 e 1440 × 900, claro e escuro:
  - **Listagens:** 16 serviços ativos e 17 com inativos (a "Cristalização de vidros" entra; a "Película nos vidros", de categoria inativa, aparece sempre, com o aviso); "Adicional" e "Complementar" listam os 4 de cada; busca "lavagem" dá 4; "Limpar filtros" leva o foco à busca; "Desativar" mostra "Desativando…" e a falha no topo com o foco; "Excluir" abre a confirmação com o foco em "Voltar" e mostra a falha dentro dela; Esc devolve o foco ao botão. Categorias: 3 ativas e 4 com inativas, sem "Excluir"; "Salvar" vazio marca os dois campos; a falha fica no topo da janela com o foco; "Desativar" confirma.
  - **Formulário:** principal em três etapas (erros em cada uma, duração de 5 a 2.400, imagem inválida recusada com a mensagem de FE02 e válida com prévia, quatro valores por porte ou o fixo, quatro adicionais, volta mantendo os valores e a imagem, falha de demonstração no topo com a janela aberta); complementar em duas, sem adicionais; adicional em uma etapa, sem imagem, categoria nem precificação, com o vínculo; edição do "Lavagem completa" (categoria, por porte, 90 minutos, quatro valores, quatro adicionais marcados) e da "Cera de carnaúba" (vinculada a duas principais).
  - **Sem transbordo** em nenhuma das quatro combinações de largura e tema.
  - **Teclado, a 360 px:** Tab chega às abas e a "Novo serviço", e Enter abre a janela com o foco em "Cancelar"; as setas mudam o tipo e a forma de precificação; a categoria escolhida por Enter, ArrowDown e Enter; Espaço marca um adicional; o foco fica preso na janela (Tab dá a volta em "Valor fixo", "Voltar", "Salvar serviço" e "Fechar"); o envio vira "Salvando…" com `aria-disabled`, e a falha leva o foco ao aviso; Esc devolve o foco a "Novo serviço", e na confirmação, a "Excluir". As abas só se ativam com Enter ou Espaço (comportamento do componente).
  - **Lighthouse 13.5.0 de acessibilidade:** 1,0 nas quatro combinações da página (navegação, com o cookie do admin local) e 1,0 em 84 capturas de estado (21 estados nas quatro combinações: listagens, confirmações, falhas, janelas de categoria, escolha do tipo, as três etapas do principal com e sem erros, prévia da imagem, adicional, complementar e a edição).
  - **Desempenho de `/admin/services` (Lighthouse, navegação, `next start` local):** celular claro e escuro, LCP 3,3 s, CLS 0, TBT 80 ms, desempenho 0,92; computador, LCP 0,9 s, CLS 0, desempenho 0,99. O LCP do celular fica acima dos 2,5 s de `frontend.md`, como nas telas anteriores.
  - **Alteração temporária de `src/lib/demo`, `match.ts` e `api-client.ts` (desfeita por `git checkout -- src`):** falha da leitura, com "Tentar novamente" pelo teclado e uma só leitura; lista vazia nas duas abas, e com busca "Nenhum serviço encontrado"; carregamento lento com os três esqueletos e sem transbordo; gravação com sucesso: "Desativar" serviço sem aviso e com a listagem lida de novo, exclusão fecha a confirmação, o novo serviço fecha a janela e devolve o foco a "Novo serviço", a nova categoria e a desativação de categoria fecham as janelas e leem a lista de novo; conflito `VERSION_CONFLICT` na edição: o aviso no topo e o detalhe lido de novo (2 leituras).
- Ambiente local encerrado (`next start` parado, `npx supabase stop`).

## Documentação atualizada

- Módulos: `docs/catalogo/servicos-do-painel.md` (novo), `docs/catalogo/CONTEXT.md` e `docs/catalogo/rotas.md` (os campos das três leituras).
- Lacunas resolvidas: L1 → opção 1 (sem excluir categoria) → `servicos-do-painel.md`; L2 → opção 1 → `servicos-do-painel.md`; L3 → opção 1 → `rotas.md`; L4 → opção 1 → `servicos-do-painel.md`; L5 → opção 1 → `servicos-do-painel.md`; L6 → opção 1 → `servicos-do-painel.md`.
- Decisões: nenhuma.
- Documentos formais a atualizar (pela #67): Arquitetura de Software, Apêndice A, com os campos das leituras de serviços e categorias de `rotas.md`; nenhuma `RN` mudou, então a Análise do Sistema não precisa de ajuste.

## Pendências

- As rotas reais (#40 e #44) e o envio da imagem (#47): cada uma tira a sua entrada de `src/lib/demo/routes.ts` e o aviso da tela; a #44 segue os campos de `rotas.md` e o limite de 50 itens nas listas de escolha do formulário (L3).
- A issue #63 pede "excluir" categoria; a documentação não tem (L1). O comentário ajustando o escopo da issue é do Yvan.
- O foco depois de uma exclusão com sucesso, quando o cartão sai da visão, segue para a #44 (lacuna herdada da #61); aqui ele cai em "Excluir", porque o cartão continua.
- LCP do celular de `/admin/services` em 3,3 s no Lighthouse local (limite de 2,5 s em `frontend.md`): medir na pré-visualização da Vercel.
- **Passo do Yvan:** conferir `/admin/services` em produção, logado como administrador, depois da incorporação do #95.
