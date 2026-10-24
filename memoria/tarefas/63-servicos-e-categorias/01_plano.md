---
issue: 63
titulo: "Telas de serviços e categorias do painel com dados de demonstração"
areas: [frontend]
tipo: funcionalidade
requisitos: [UC13, UC14, UC15, RF057, RF058, RF059, RF060, RF061, RF062, RF063, RF064, RF065, RF066, RF067, RF068, RN006, RN007, RN008, RN009, RN030, RN031, RN035, RNF002, RNF004, RNF005, RNF011]
status: concluido
aprovado_por: yvan
aprovado_em: 16:39 - 24/10/2026
---

# Plano: Telas de serviços e categorias do painel com dados de demonstração

## Objetivo

Construir `/admin/services` (T7 de `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, decisão 0055) com dados de demonstração e duas abas, "Serviços" e "Categorias" (RF057), como os wireframes de `staffPages/servicesManagment/`:

- **Serviços** (UC14, RF058, RF059, RF064 a RF066): listagem em cartões com filtro por tipo, "Exibir inativos" e busca; "Editar", "Desativar" ou "Reativar" e "Excluir" (com confirmação, RN030) em cada cartão.
- **Cadastro e edição de serviço** (UC13, RF060 a RF063): janela "Novo serviço" com a escolha do tipo e o formulário em etapas conforme o tipo: principal em três (dados; valores por porte ou fixo; adicionais), complementar em duas (sem adicionais, FA02) e adicional em uma (nome, duração, valor fixo e vínculo opcional, sem imagem, FA01). Campo de imagem com prévia local, sem envio.
- **Categorias** (UC15, RF067, RF068): listagem com "Exibir inativos", "Nova categoria" (nome e descrição), "Editar" e "Desativar" ou "Reativar" com confirmação (RN031).

A gravação de qualquer formulário ou ação mostra o aviso de `NOT_IMPLEMENTED`, e nada é gravado. Nenhuma rota, migration ou esquema de validação, nenhum import de `src/server/` e nenhuma dependência nova.

## Base conferida

- Issue #63 aberta, sem PR aberto no repositório. `origin/main` e a ramificação desta sessão (`claude/63-servicos-e-categorias-6465a4`) em 37a2a97 (#92), com a árvore limpa.
- Dependência cumprida: a #56 (base da demonstração) e as telas de demonstração até a #62 estão na `main`. As rotas (#40 e #44) e o envio da imagem (#47) estão abertas e sem código: `src/app/api/admin/` não tem rota de serviços nem de categorias.
- Existem: `src/app/(admin)/admin/services/` (só `README.md`), `src/components/admin/catalog/` (só `README.md`), `src/shared/constants/service-types.ts` e `pricing-modes.ts`, `vehicle-sizes.ts`, `MoneyInput`, `ConfirmDialog`, `StepForm`, `PaginatedList`, `EmptyState`, `DemoNotice` e `Tabs`. O `seed-demo.sql` já tem as quatro categorias (uma inativa), 14 serviços ativos ou inativos, um excluído (não aparece) e os vínculos; nenhuma alteração do seed.

## Critérios de aceitação e verificação

Os critérios da issue vêm primeiro; os comuns das telas de demonstração (decisão 0055) vêm depois. Pela decisão 0052, telas e componentes são verificados à mão; os passos são os da seção "Roteiro manual" abaixo, no banco local e no `next start` com `NEXT_PUBLIC_*` do banco local (como a #61 e a #62).

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado o tipo adicional, quando começo o cadastro, então o formulário pede só nome, duração e valor fixo, sem imagem (UC13 FA01, RF062, RN009) | Passo manual M3: escolher "Adicional" em "Novo serviço": nome, duração, valor, e o vínculo opcional a principais (L5); sem categoria, descrição, imagem, precificação nem etapas |
| Dado o tipo complementar, quando começo o cadastro, então não há a etapa dos adicionais (UC13 FA02, RF063) | Passo manual M4: "Complementar" tem duas etapas (indicação "Informações" e "Valores"), e o último botão é "Salvar serviço" |
| Dado o tipo principal, quando cadastro, então há três etapas, com valores por porte (P, M, G e GG) ou fixo conforme a precificação, e os adicionais ao fim (UC13 passos 4 a 9, RN009) | Passo manual M2 |
| Dado a listagem, quando filtro por tipo, exibo inativos ou busco, então a lista mostra só o que corresponde, e "Limpar filtros" volta à completa (UC14, RF058, RF059) | Passo manual M5 |
| Dado um serviço de categoria inativa, quando exibo inativos, então ele consta no painel com o aviso da categoria (RN031) | Passo manual M5 |
| Dado uma categoria, quando desativo, reativo ou aciono excluir serviço, então a confirmação aparece, e o envio mostra `NOT_IMPLEMENTED` (UC14 FA04, UC15 FA02, RN030, RN031) | Passo manual M6 e M7 |
| Dado nome ou descrição de categoria vazios, quando confirmo, então os campos pendentes são indicados e os dados mantidos (UC15 FE01) | Passo manual M7 |
| Dado o campo de imagem, quando escolho um arquivo, então a prévia aparece sem envio, e a troca e a remoção funcionam (UC13 passo 4) | Passo manual M2 e M8 |
| Dado qualquer janela ou formulário, quando uso só o teclado (Tab, Shift+Tab, setas nos botões de opção, Enter, Esc), então alcanço e aciono tudo, o foco é visível e Esc devolve o foco ao botão de origem (WCAG 2.1.1, 2.4.7) | Passo manual M9 |
| Dado a tela a 360 × 800 e a 1440 × 900, no tema claro e no escuro, então não há transbordo horizontal | Passo manual M10 |
| Dado a tela, o Lighthouse de acessibilidade não tem auditoria reprovada, e o LCP e o CLS do celular são medidos | Passo manual M10 (Lighthouse 13.5 em modo `snapshot` para os estados e `navigation` com o cookie do admin local para a página) |
| Dado carregamento, lista vazia ou falha da leitura, então aparecem o esqueleto, a mensagem de vazio e o aviso com "Tentar novamente" (`componentes.md`) | Passo manual M11, com a alteração temporária de `src/lib/demo` e `api-client.ts` como na #61 (`globalThis.__demo`, desfeita por `git checkout -- src`) |
| Dado o aviso, então "Dados de demonstração…" aparece abaixo do título, e a tela não importa `src/server/` nem cria rota, migration ou esquema | `npm run check` e `git diff --stat` conferidos antes de cada PR |

### Roteiro manual

- **M1.** Abrir `/admin/services` como o admin local: título, aviso de demonstração, abas "Serviços" e "Categorias", e o botão "Novo serviço" (na aba de categorias, "Nova categoria").
- **M2.** "Novo serviço" → "Principal": etapa 1 (categoria só das ativas, precificação "Por porte" ou "Valor fixo", duração em minutos, nome, descrição, imagem); "Próximo" com campo obrigatório vazio indica o campo; etapa 2 pede os quatro valores (P, M, G e GG) ou o fixo; etapa 3 lista os adicionais para marcar; "Voltar" em qualquer etapa mantém o digitado; "Salvar serviço" mostra o aviso de `NOT_IMPLEMENTED` no topo, com a janela aberta.
- **M3 e M4.** Adicional e complementar, como nos critérios.
- **M5.** Filtros: "Todos", "Principal", "Adicional", "Complementar"; "Exibir inativos" (aparecem "Cristalização de vidros" e "Película nos vidros", esta com o aviso de categoria inativa); busca "lavagem" (300 ms); "Limpar filtros"; paginação de 20.
- **M6.** "Desativar" e "Reativar" de serviço, "Excluir" com confirmação (e o foco volta ao botão).
- **M7.** Aba "Categorias": "Nova categoria" e "Editar" com validação dos campos, "Desativar" e "Reativar" com confirmação, "Exibir inativos" (aparece "Película e envelopamento").
- **M8.** Edição de um serviço: "Editar" abre o mesmo formulário com os dados do `GET /api/admin/services/:id`, sem trocar o tipo.
- **M9.** Teclado completo de todas as janelas e abas (setas entre as abas e entre os botões de tipo e de precificação).
- **M10.** 360 × 800 e 1440 × 900, claro e escuro; Lighthouse; LCP e CLS do celular na página.
- **M11.** Carregamento, vazio e falha, por alteração temporária sem commit.

## Arquivos

Cada um na pasta cujo `README.md` o admite.

| Arquivo | Ação |
|---|---|
| `src/shared/api/catalog.ts` | alterar: `AdminCategory`, `AdminServiceListItem`, `AdminService` (detalhe), `ServicePrices` |
| `src/lib/demo/admin-catalog.ts` | criar: dados do `seed-demo.sql` (categorias, serviços, valores, vínculos) e as respostas das quatro leituras |
| `src/lib/demo/routes.ts` | alterar: `GET /api/admin/services`, `/:id`, `GET /api/admin/categories`; `POST` e `PATCH` de serviços e categorias, `DELETE /:id` e `POST /image` sem `load` |
| `src/app/(admin)/admin/services/page.tsx` | criar |
| `src/components/admin/catalog/catalog-tabs.tsx` | criar: abas e botão de criar de cada aba |
| `src/components/admin/catalog/service-list.tsx` | criar: filtros, busca, "Exibir inativos" e cartões |
| `src/components/admin/catalog/service-card.tsx` | criar |
| `src/components/admin/catalog/service-form-dialog.tsx` | criar: janela de cadastro e edição, com a escolha do tipo |
| `src/components/admin/catalog/service-form-values.ts` | criar: valores do formulário e as etapas de cada tipo |
| `src/components/admin/catalog/service-data-step.tsx`, `service-prices-step.tsx`, `service-links-step.tsx` | criar: as três etapas |
| `src/components/admin/catalog/service-image-field.tsx` | criar: campo de imagem com prévia local (L4) |
| `src/components/admin/catalog/category-list.tsx`, `category-card.tsx`, `category-form-dialog.tsx` | criar |
| `src/components/admin/catalog/README.md` | alterar: arquivos do módulo, se a lista de "Vai aqui" mudar |
| `docs/catalogo/servicos-do-painel.md` | criar: módulo da tela (L2) |
| `docs/catalogo/CONTEXT.md`, `docs/catalogo/rotas.md` | alterar: linha do módulo e os campos das leituras (L3) |

Arquivos fora da lista acima, acrescentados na construção (desvios registrados em `notas.md`, a confirmar pelo Yvan):

| Arquivo | Ação |
|---|---|
| `src/components/shared/form-field.tsx` | alterar: `rules` opcional, para as checagens do formulário sem esquema |
| `src/components/shared/paginated-list.tsx` | alterar: busca e botão "Limpar filtros" opcionais (a lista de categorias não tem busca) |
| `src/components/shared/form-dialog.tsx` | mover de `admin/appointments/appointment-form-dialog.tsx` e renomear `FormDialog`, para a janela do serviço usar a mesma |
| `src/components/admin/appointments/appointment-views.tsx`, `appointment-details-dialog.tsx` | alterar: o nome e o endereço do `FormDialog` |
| `src/components/admin/catalog/choice-group.tsx`, `inactive-switch.tsx`, `service-active-button.tsx`, `service-type-filter.tsx`, `service-wizard.tsx` | criar |

Arquivos de ponto de contato com outras telas de demonstração: `src/lib/demo/routes.ts` e `src/shared/api/catalog.ts` (já usado pelo portal público). Se a etapa de construção mexer em arquivo fora desta lista, ele vai para as notas e para esta lista, e o Yvan confirma o desvio.

## Testes previstos

Nenhum teste automatizado novo: a tela não cria função pura de regra de negócio (decisão 0052: telas, componentes e dados de demonstração são verificados à mão), e as regras RN006 a RN009 ficam no servidor, na tarefa da rota (#44). As etapas de cada tipo são uma tabela em `service-form-values.ts`, conferida em M2 a M4. O `npm run check` (formatação, tipos, lint e os testes existentes) roda antes de cada PR.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Excluir categoria

**Problema.** A issue (escopo) pede "desativar, reativar e excluir com confirmação" nas categorias, e o wireframe tem "Excluir" no cartão. UC15 só tem edição, desativação e reativação; RN030 diz que "categorias não são excluídos, apenas desativados"; `dados.md` bloqueia a exclusão física; `rotas.md` não tem `DELETE /api/admin/categories/:id`.

**Opções:**

- [x] **1. Sem "Excluir" na categoria (recomendada).** Vale a documentação (`docs/` prevalece sobre o wireframe). A issue ganha um comentário seu ajustando o escopo. O serviço continua com "Excluir" (UC14 FA04, RN030).
- [ ] **2. Com "Excluir" na categoria.** Exige reescrever RN030, UC15, `rotas.md` e `dados.md` (e a #40), e contraria a decisão 0022; fora do escopo de uma tela.

**Texto proposto (opção recomendada):**

- `docs/catalogo/servicos-do-painel.md`, novo, seção "Categorias": "A categoria não tem exclusão, só desativação (RN030)."
- Nenhuma alteração de UC15 nem de RN030.

### L2. Conteúdo da página `/admin/services`

**Problema.** Nenhum módulo define os textos, a ordem dos controles, o cartão, as janelas e os estados da página; só UC13 a UC15, as regras e o wireframe (outro sistema, com extras que o Glow não tem: porte "Moto", "Tipo de banco", "Sob orçamento", boxes, seletor de dias, horas e minutos, limite de 120 caracteres e de 1 MB).

**Opções:**

- [x] **1. Novo módulo `docs/catalogo/servicos-do-painel.md` (recomendada).** Como `agendamentos-do-painel.md` e `dashboard-do-painel.md`; a tela segue o texto abaixo.
- [ ] **2. Deixar a tela definir os textos.** O código passaria a ser a única fonte, contra `guia/regras.md`.

**Texto proposto (opção recomendada)**, em `docs/catalogo/servicos-do-painel.md` (novo; linha no `CONTEXT.md` do assunto):

- **Página.** Título "Serviços"; abaixo, o aviso de demonstração e as abas "Serviços" e "Categorias" (RF057), cada uma com o botão de criar ("Novo serviço", "Nova categoria") ao lado das abas a partir de 768 px, e abaixo delas no celular. Cada aba lê a rota de novo ao ser escolhida e começa sem busca nem filtro. Acesso: permissão `services` (RN025).
- **Serviços.** Busca "Buscar por nome" (300 ms, volta à primeira página); filtro por tipo com "Todos", "Principal", "Adicional" e "Complementar" (RF058); interruptor "Exibir inativos" (RF059; sem ele, só os ativos); "Limpar filtros" quando há busca, tipo ou inativos. Ativos e excluídos: o excluído nunca aparece. 20 por página, com a faixa "1–20 de 36".
- **Cartão do serviço.** Nome; etiqueta do tipo ("Principal", "Adicional", "Complementar"); etiqueta "Inativo" quando inativo; categoria (nada no adicional); descrição (nada no adicional); "Duração: <duração>" (`formatDuration`); o preço ("A partir de <menor valor>" por porte, o valor fixo, ou "Valor fixo"); e os botões "Editar", "Desativar" ou "Reativar" e "Excluir". Serviço de categoria inativa mostra "Categoria inativa: oculto para o cliente" (RN031).
- **Desativar e reativar serviço** (UC14 FA02 e FA03, RN008): sem confirmação, como "Avançar" nos agendamentos; o botão fica "Desativando…" ou "Reativando…" e indisponível sem perder o foco. **Excluir** (FA04): confirmação "Excluir este serviço?", "O serviço deixa de ser exibido e não pode ser desfeito pelo painel. Os agendamentos em que ele consta são preservados.", botões "Voltar" e "Excluir serviço" ("Excluindo…"), na cor de erro.
- **Janela "Novo serviço"** (RF060): primeiro, a escolha do tipo, em três botões de opção com o nome e uma frase ("Principal: serviço central do agendamento", "Adicional: oferecido junto com um principal, valor fixo", "Complementar: serviço independente, sem adicionais"), e "Continuar". A indicação de etapas e os botões são os de `componentes.md` (Formulário em etapas).
  - **Principal e complementar, etapa 1 "Informações"** (RF061, RF063): "Categoria" (só as ativas), "Forma de precificação" ("Por porte" ou "Valor fixo"), "Duração média (minutos)" (de 5 a 2.400), "Nome", "Descrição" e "Imagem (opcional)", com a prévia. **Etapa 2 "Valores"**: "Pequeno (P)", "Médio (M)", "Grande (G)" e "Extra grande (GG)", todos obrigatórios e maiores que zero, ou "Valor fixo" (RN009). **Etapa 3 "Adicionais"**, só no principal: lista de adicionais para marcar, opcional; vazia: "Nenhum serviço adicional cadastrado." O complementar termina na etapa 2.
  - **Adicional, uma etapa** (RF062): "Nome", "Duração média (minutos)", "Valor fixo" e, opcional, "Serviços principais vinculados"; sem categoria, descrição, imagem nem precificação.
  - Sem categoria ativa, no principal e no complementar: "Cadastre uma categoria antes de criar este serviço." (UC13 FE03), com o botão que leva à aba "Categorias".
  - Botão do fim: "Salvar serviço" ("Salvando…"). A falha aparece no topo da janela, com o foco.
- **Edição** (UC14 passos 4 a 7, RF064): a mesma janela, "Editar serviço", com o tipo fixo (não se altera) e os dados lidos do detalhe.
- **Categorias.** Cartão com o nome, a descrição, a etiqueta "Ativa" ou "Inativa" e "Editar", "Desativar" ou "Reativar"; interruptor "Exibir inativos" (FA03; RF068). Janela "Nova categoria" / "Editar categoria" com "Nome" e "Descrição" (obrigatória, como em `rotas.md`), botões "Cancelar" e "Salvar". **Desativar**: confirmação "Desativar esta categoria?", "Os serviços dela deixam de aparecer no portal e no agendamento, mas continuam no painel. Você pode reativá-la depois.", botões "Voltar" e "Desativar categoria". **Reativar**: "Reativar esta categoria?", "Os serviços dela voltam a aparecer no portal e no agendamento.", "Reativar categoria".
- **Estados.** Carregamento: esqueleto de cartões; vazio: "Nenhum serviço cadastrado" / "Nenhuma categoria cadastrada" (e "Nenhum serviço encontrado" com filtro); falha: o aviso com "Tentar novamente". A falha de uma ação aparece no topo da janela ou da confirmação.

### L3. Campos das leituras e das listas de escolha

**Problema.** `rotas.md` diz "lista de serviços", "serviço completo" e "lista de categorias" sem os campos, e as listas são paginadas (`docs/padroes/api.md`, até 50 por página), mas o formulário precisa de todas as categorias ativas e de todos os adicionais e principais para os vínculos.

**Opções:**

- [x] **1. Definir os campos e usar os filtros que já existem (recomendada).** Categorias para o formulário: `GET /api/admin/categories?pageSize=50` (só as ativas, sem `includeInactive`); adicionais: `GET /api/admin/services?type=additional&pageSize=50`; principais: `type=main`. Sem rota nova; o limite de 50 é registrado como risco.
- [ ] **2. Rota de busca própria para o formulário (como `lookup/…` dos agendamentos).** Mais uma rota na #44 e na #40; fora do escopo da tela.

**Texto proposto (opção recomendada):**

- `docs/catalogo/rotas.md`, `GET /api/admin/services`: "Resposta: **200** lista paginada de `id`, `type`, `name`, `description` (ou `null`), `category` (`id` e `name`, ou `null`), `avgDurationMinutes`, `pricingMode` (ou `null`), `fixedPrice` (ou `null`), `startingPrice` (menor valor, ou `null`), `isActive`, `isCategoryActive` (ou `null`) e `updatedAt`."
- `GET /api/admin/services/:id`: "Resposta: **200** os campos da lista, `imageUrl` (ou `null`), `prices` (`small`, `medium`, `large` e `extraLarge`, ou `null`) e `additionalIds` (principal) ou `mainServiceIds` (adicional)."
- `GET /api/admin/categories`: "Resposta: **200** lista paginada de `id`, `name`, `description`, `isActive` e `updatedAt`."

### L4. Campo de imagem: #47 ou #63

**Problema.** A issue diz "campo de imagem e a prévia local, sem envio (vindos da #47)"; a #47 diz "o campo de imagem com a prévia vem da #63". Cada uma remete à outra. Formatos e tamanho: RS015 (JPEG, PNG e WebP, até 2 MB); o wireframe diz 1 MB e "Imagem de capa".

**Opções:**

- [x] **1. A #63 constrói o campo, sem envio (recomendada).** Escolha do arquivo, conferência de formato e de tamanho no navegador só como orientação (a rota confere, RS015), prévia por `URL.createObjectURL`, troca e remoção. A #47 liga o campo à rota. Os dois textos das issues ficam coerentes se você ajustar a #63 ("a #47 liga o envio").
- [ ] **2. Deixar o campo para a #47.** A tela de demonstração ficaria sem o campo de imagem do UC13 passo 4.

**Texto proposto (opção recomendada):**

- `docs/catalogo/servicos-do-painel.md`, seção da janela: "Imagem (opcional): botão 'Escolher imagem' (JPEG, PNG ou WebP, até 2 MB), prévia de 4:3 abaixo do campo, 'Trocar imagem' e 'Remover imagem'. Arquivo de outro tipo ou maior que 2 MB: 'Use uma imagem JPEG, PNG ou WebP de até 2 MB.' (UC13 FE02). Na demonstração a imagem só aparece na prévia; nada é enviado." A prévia usa `<img>` (endereço local `blob:`, que o `next/image` não otimiza), com largura e altura reservadas para o CLS.

### L5. Vínculo opcional no serviço adicional

**Problema.** O critério da issue diz que o adicional pede "só nome, duração e valor fixo, sem imagem"; UC13 FA01 passo 2 e RF062 também oferecem "o vínculo opcional a um serviço principal já cadastrado" (`mainServiceIds`, `rotas.md`).

**Opções:**

- [x] **1. Nome, duração e valor fixo, mais o vínculo opcional (recomendada).** O critério fica cumprido ("só" quer dizer sem categoria, descrição, imagem nem precificação), e RF062 também.
- [ ] **2. Só os três campos, sem o vínculo.** Contraria RF062 e UC13 FA01; os adicionais só poderiam ser vinculados pelo principal.

**Texto proposto (opção recomendada):** o texto de L2 para o adicional; nenhum arquivo além do módulo novo.

### L6. Busca por nome

**Problema.** `GET /api/admin/services` tem o parâmetro `search` e o wireframe, "Buscar por nome…", mas UC14 e RF058 e RF059 só citam o filtro por tipo e os inativos, e a issue não cita a busca.

**Opções:**

- [x] **1. Incluir a busca na listagem de serviços (recomendada).** A rota já a define; o custo é um campo e o `searchIn` do `demoPage`.
- [ ] **2. Deixar a busca de fora.** Cumpre só a issue; a rota teria um parâmetro sem tela.

**Texto proposto (opção recomendada):** o texto de L2 da aba "Serviços", sem alteração de requisito.

## Decisões técnicas

- Seguidas: 0022 (exclusão lógica), 0027 (React Hook Form), 0041 (wireframes de referência), 0049 (shadcn sobre Base UI), 0052 (testes à mão para telas) e 0055 (telas de demonstração), mais `componentes.md` (formulário em etapas, `MoneyInput`, diálogos, listagem) e `design.md`.
- Nenhuma nova.

## Riscos e dúvidas

- **Limite de 50 nas listas de escolha (L3).** O seed tem 4 adicionais e 8 principais; com a rota real, mais de 50 pediria busca ou a rota própria, na #44.
- **Validação só da etapa.** Como na #62, "Próximo" confere só o obrigatório da etapa (`rules` do React Hook Form); os limites de nome (RN035: 2 a 60 caracteres) e de duração (5 a 2.400) entram com o esquema, na #44. Na demonstração, a tela já aplica `required`, `min` e `max` nos campos de valor e de duração, sem esquema novo.
- **Dados que mudam sozinhos.** As gravações não gravam; a listagem fica como o seed, e "Desativar" mostra a falha. A releitura com `updatedAt` novo e o 409 `VERSION_CONFLICT` (RNF011) são verificados por alteração temporária, como na #62, antes do último PR.
- **Etapas e janelas.** A indicação de etapas do `StepForm` com três etapas cabe a 360 px; a escolha do tipo é uma pré-etapa da janela, fora do `StepForm`.
- **Prévia de imagem e CLS.** `blob:` não passa pelo `next/image`; o contêiner da prévia reserva a proporção.
- **Revogar a URL da prévia.** `URL.revokeObjectURL` ao trocar e ao desmontar, para não vazar memória.

## Divisão em PRs e pontos à parte

O total previsto em `src/` passa de 400 linhas (cerca de 1.200 a 1.500 com tipos, dados e três formulários), então proponho **três PRs encadeados**, cada um verificado e com `npm run check` verde, o último com "Closes #63" e os três com `memoria/tarefas/63-…` só no último, como na #62.

### P1. Divisão em PRs

- [x] **1. Três PRs (recomendada).**
  - **PR 1 – base:** tipos, dados de demonstração, entradas de `routes.ts`, `rotas.md` (L3) e o módulo `servicos-do-painel.md` (L1, L2, L4 a L6) (~350 linhas em `src/`).
  - **PR 2 – listagens:** página, abas, listagem de serviços com filtros e ações, e a aba "Categorias" completa, com a janela de categoria e as confirmações (~550 linhas).
  - **PR 3 – formulário do serviço:** escolha do tipo, três etapas, campo de imagem, edição (~550 linhas).
- [ ] **2. Um PR só.** Mais de 1.200 linhas de uma vez, difícil de revisar.

### P2. Ambiente de verificação

- [x] **1. Como nas tarefas anteriores (recomendada).** Docker Desktop aberto; `npx supabase start` e `db reset` (carrega o `seed-demo.sql`); admin local criado por `make-admin.mjs` (senha gerada, não registrada); `next build` e `next start -p 3060` com as variáveis do banco local; cookie do admin no Lighthouse (CLI 13.5, `navigation` para a página e `snapshot` para os estados); alterações temporárias de `src/lib/demo` e `src/lib/api-client.ts` sem commit, desfeitas por `git checkout -- src`. Tudo é feito antes de marcar o último PR como pronto, inclusive o teclado completo e o LCP e o CLS do celular; no fim, `npx supabase stop`.
- [ ] **2. Só no navegador do app, sem Lighthouse nem banco local.** Deixaria sem medida o que o plano promete.

### P3. O que fica para você conferir

- [ ] A tela em produção logada (Vercel), depois da incorporação do último PR: passo seu, listado no relatório.

## Fora do escopo

- As rotas de serviços e categorias (#40 e #44) e o envio da imagem (#47), com o domínio do Storage em `next.config.ts`.
- A seleção por porte "Moto", "Tipo de banco", "Sob orçamento", os boxes, o seletor de dias, horas e minutos e o resto do wireframe sem requisito no Glow.
- Exclusão de categoria (L1) e qualquer regra de negócio no navegador (RN006 a RN009 ficam no servidor).
- O catálogo público (`/services`) e o agendamento do cliente, que já leem as rotas públicas de demonstração.
