# Proposta: telas antes da lógica e nova ordem das issues

Aprovada por yvan na conversa em 21/10/2026, com a opção 1 em LT1 a LT4, e aplicada no GitHub no mesmo dia: as issues novas foram criadas com os números abaixo, e o corpo da #39 à #51 foi editado conforme "Mudanças nas issues existentes".

| Código nesta proposta | Issue |
|---|---|
| T0 | #56 |
| T1 | #57 |
| T2 | #58 |
| T3 | #59 |
| T4 | #60 |
| T5 | #61 |
| T6 | #62 |
| T7 | #63 |
| T8 | #64 |
| T9 | #65 |
| IA | #66 |
| DOC | #67 |

## Situação (21/10/2026)

- `main` em a037b4c, com a fundação (#21 a #26), a #35, a #36 e a #37. O #55 (#38) aguarda revisão.
- Issues abertas da fase 2: #39 a #51, em quatro ondas. A fase 3 (lógica do portal do cliente) não tem issues.
- Telas prontas: `/login`, `/register`, `/set-password`, a aba "Empresa" de `/admin/settings`, os layouts e o rodapé do portal.
- Telas que faltam, todas com rota em `docs/*/rotas.md` e wireframe em `wireframes/`:
  - portal público: `/` (só o título) e `/services`;
  - portal do cliente: `/profile`, `/booking` e `/appointments`;
  - painel: `/admin` (só o título), `/admin/appointments`, `/admin/services`, `/admin/clients`, `/admin/staff` e as abas "Disponibilidade" e "Formas de pagamento" de `/admin/settings`;
  - a análise por IA do dashboard (`01_plano.md`).

O Yvan quer agora o frontend de todas essas telas, sem lógica, para o professor ver o que o projeto vai entregar.

## Como as telas sem lógica convivem com os padrões

Os padrões supõem que a rota já existe: "as partes que exibem ou alteram dados são componentes de cliente que buscam pela API" e "cada componente busca os dados que exibe" (`frontend.md`); formulários com os esquemas Zod (`frontend.md`); a especificação OpenAPI "muda no mesmo PR que a rota" (`api.md`). Nada diz o que uma tela mostra antes da rota existir. São as lacunas LT1 a LT4, com uma decisão nova.

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada.

### LT1. De onde vêm os dados das telas sem rota

**Problema.** Sem a rota, a chamada da tela recebe a página 404 do Next.js, e o cliente da API mostra a falha de `INTERNAL_ERROR`. O professor veria só avisos de erro.

**Opções:**

- [x] **1. Dados de demonstração no cliente da API (recomendada).** O `apiRequest` procura a rota numa lista de `src/lib/demo/` antes de chamar a rede e, se a acha, devolve dados fixos, tipados pelos tipos de `src/shared/api/`. A tela já nasce na forma final (`useApiQuery` e `usePaginatedList` com o endereço de `rotas.md`), e a tarefa de lógica não a reescreve: constrói a rota e tira a entrada da lista. A onda de telas não toca backend, banco nem OpenAPI, então anda rápido e em paralelo. Em troca, muda o cliente da API, que é testado (decisão 0052), e os tipos podem precisar de ajuste quando a rota chegar.
- [ ] **2. Rotas da API com o contrato e dados fixos no serviço.** Contrato primeiro, com a permissão já conferida na API (RS008). Mas cada tela leva rota, serviço, tipos e especificação OpenAPI: a onda fica mais lenta e toca o backend.
- [ ] **3. Dados fixos dentro de cada componente.** Mais rápido no começo, mas contraria "cada componente busca os dados que exibe", e toda tela é reescrita na tarefa de lógica.
- [ ] **4. Telas sem dados, com o estado vazio e o aviso "em construção".** Nada a remover depois, mas o professor vê só o esqueleto.

**Texto proposto (opção 1):**

- `docs/padroes/componentes.md`, nova seção "Telas de demonstração (decisão 0055)":
  - "Enquanto a rota de uma tela não existe, `src/lib/demo/` responde no lugar dela. O `apiRequest` procura o método e o caminho na lista de demonstração antes de chamar a rede e, se os acha, devolve os dados fixos do módulo, tipados por `src/shared/api/`, depois de 400 ms, para os estados de carregamento aparecerem. Os dados de cada módulo só são carregados quando a tela os pede."
  - "As leituras, inclusive os `POST` que não gravam, como a prévia de valores e a análise do dashboard, devolvem os dados fixos; as gravações respondem `NOT_IMPLEMENTED`, que a tela mostra como qualquer falha."
  - "Os dados fixos usam os nomes, as placas e os serviços fictícios do `supabase/seed-demo.sql` (`guia/regras.md`, Dados)."
- `docs/padroes/frontend.md`, Comunicação com a API, item novo: "Rota ainda não construída: os dados de demonstração de `src/lib/demo/` (`componentes.md`, decisão 0055)."
- `docs/padroes/api.md`, Erros: "| 501 | `NOT_IMPLEMENTED` | Esta ação ainda não está disponível nesta versão de demonstração. |", com a frase "Só o cliente da API produz o `NOT_IMPLEMENTED`, nas telas de demonstração; ele sai do catálogo com a última rota de demonstração."
- `docs/plataforma/estrutura-de-pastas.md`, linha de `lib/`: "api-client.ts · utils.ts (cn() do shadcn) · demo/ (dados das telas de demonstração, decisão 0055)".
- `docs/padroes/testes.md`, linha "Cliente da API": acrescentar "respostas das rotas de demonstração, sem chamada de rede, e a recusa das gravações".
- `src/lib/README.md` e o novo `src/lib/demo/README.md`.

### LT2. O que a tela mostra enquanto usa dados de demonstração

**Problema.** Dados fixos que parecem reais enganam quem usa e o professor; algumas telas misturam partes reais e de demonstração (a localização da página inicial vem de `GET /api/public/company`, que já existe; a aba "Empresa" já grava).

**Opções:**

- [x] **1. Aviso fixo no topo da tela, ou da aba ou seção de demonstração (recomendada).** Um aviso informativo, sem fechar, com o ícone `FlaskConical`: "Dados de demonstração: esta parte ainda não está ligada ao sistema, e nada do que você fizer nela é gravado." Sai com a última rota da tela.
- [ ] **2. Etiqueta "Demonstração" ao lado do título.** Mais discreta, mas não diz que nada é gravado.
- [ ] **3. Nada na tela.** A tela parece pronta, e o envio de um formulário surpreende com a recusa.

**Texto proposto (opção 1):** `docs/padroes/componentes.md`, seção "Telas de demonstração": "Toda tela, aba ou seção com dados de demonstração mostra no topo o aviso 'Dados de demonstração: esta parte ainda não está ligada ao sistema, e nada do que você fizer nela é gravado.', com o ícone `FlaskConical`, sem botão de fechar (`DemoNotice`, em `src/components/shared/`)."

### LT3. Listagens e formulários na demonstração

**Problema.** Uma lista fixa não pagina nem filtra sozinha; os formulários usam os esquemas de `src/shared/validation`, que são escritos com TDD (decisão 0035) e ainda não existem para a maioria das telas.

**Opções:**

- [x] **1. Listagens com página, busca e filtros sobre a lista fixa; formulários sem os esquemas (recomendada).** A lista de demonstração aplica `page` e `pageSize`, a busca (texto contido, sem distinção de maiúsculas, nos campos que a tela busca) e os filtros por igualdade, então os controles funcionam. Os formulários têm todos os campos, etapas, máscaras e diálogos, mas sem a validação, que entra com a rota e os testes; o envio mostra o `NOT_IMPLEMENTED` no aviso do formulário.
- [ ] **2. Listagens só com página; formulários sem os esquemas.** Menos código de demonstração, mas a busca e os filtros parecem quebrados.
- [ ] **3. Como a 1, com os esquemas já nos formulários, escritos com TDD na tarefa da tela.** As mensagens de validação aparecem na demonstração, mas a onda de telas fica com a parte mais demorada das tarefas de lógica.

**Texto proposto (opção 1):** `docs/padroes/componentes.md`, seção "Telas de demonstração": "Na demonstração, a listagem pagina, busca e filtra sobre a lista fixa. O formulário tem os campos, as etapas, as máscaras e os diálogos, sem o esquema de validação, que entra com a rota; o envio mostra o aviso de `NOT_IMPLEMENTED`."

### LT4. Fim da demonstração

**Problema.** Os dados de demonstração não podem ficar numa tela que já tem a rota real, e alguma tela pode não ganhar lógica até a AV3 (a fase 3, se o tempo faltar).

**Opções:**

- [x] **1. Cada tarefa de lógica tira as suas rotas da lista e o aviso da tela; a última remove a demonstração (recomendada).** O que não for ligado até a AV3 continua com o aviso, de forma explícita.
- [ ] **2. Remover toda a demonstração antes da AV3.** As telas sem rota passam a mostrar a falha.

**Texto proposto (opção 1):** `docs/padroes/componentes.md`, seção "Telas de demonstração": "A tarefa que constrói rotas tira as entradas delas da lista e o aviso da tela no mesmo PR; a que tirar a última remove `src/lib/demo/`, o código `NOT_IMPLEMENTED` e o `DemoNotice`." E em `workflows/procedimentos/pull-request.md`, checklist: "- [ ] A rota nova saiu da lista de `src/lib/demo/`, e a tela ligada a ela não mostra mais o aviso de demonstração."

### Decisão proposta

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| 0055: as telas são construídas antes das rotas, na forma final, com dados de demonstração respondidos pelo cliente da API (`src/lib/demo/`), um aviso na tela e as gravações recusadas com `NOT_IMPLEMENTED` | rotas com dados fixos no servidor; dados no componente; telas vazias (LT1); Mock Service Worker (dependência nova e um service worker em `public/`) | O professor vê todas as telas cedo; a tarefa de lógica não reescreve a tela; a onda de telas não toca backend, banco nem OpenAPI. Aceito: código temporário no cliente da API, testado e removido rota a rota | nova |

O número é o próximo livre na gravação (`workflows/procedimentos/decisao.md`): 0054 é a da IA (`01_plano.md`), se o PR de documentação dela for incorporado antes; a do Recharts (T4) vem depois.

## Critérios comuns às telas de demonstração (T1 a T9)

Valem para cada issue de tela, além dos critérios próprios dela:

- Esqueleto pelo wireframe da pasta, conteúdo pelos casos de uso do assunto, estilo por `design.md` (decisão 0041).
- Componentes de cliente com `useApiQuery` ou `usePaginatedList` e o endereço de `rotas.md`; tipos em `src/shared/api/<módulo>.ts`; dados em `src/lib/demo/<módulo>.ts`, com os nomes do `seed-demo.sql`.
- Estados de carregamento, vazio e falha com "Tentar novamente" (`componentes.md`).
- O aviso de demonstração (LT2); o envio de qualquer formulário mostra o `NOT_IMPLEMENTED`, e nada é gravado.
- A 360 × 800 primeiro e a 1440 × 900, claro e escuro, pelo teclado, sem transbordar, e o Lighthouse de acessibilidade sem auditoria reprovada.
- Nenhuma rota, migration ou esquema de validação novo, e nenhum import de `src/server/`.

## Issues novas

Números atribuídos na criação. Rótulos existentes; nenhum novo.

### T0. Base das telas de demonstração: dados no cliente da API, aviso e etiqueta de status

Rótulos: `area:frontend`, `area:testes`, `tipo:funcionalidade`.

**Objetivo.** Permitir construir as telas antes das rotas (decisão 0055): o cliente da API responde com dados fixos para as rotas da lista de demonstração e recusa as gravações; o aviso de demonstração e a etiqueta de status ficam prontos para todas as telas.

**Requisitos.** RN017; RNF004 e RNF005; decisões 0049, 0052 e 0055 (nova). Depende de #35 (feita).

**Escopo.**

- `src/lib/demo/`: a lista de rotas (método, caminho com `:id` e a carga do módulo de dados), a página, a busca e os filtros sobre a lista fixa (LT3) e o README.
- `apiRequest` consultando a lista antes do `fetch`, com a espera de 400 ms; gravação na lista → `NOT_IMPLEMENTED` (501), novo no catálogo.
- `DemoNotice` em `src/components/shared/` (LT2).
- `StatusBadge` em `src/components/shared/`, com o nome do status escrito e a cor de `design.md` (RN017, RNF005); sai do escopo da #46.
- Testes em `tests/lib/api-client.test.ts`; a documentação de LT1 a LT4 e a decisão 0055.

**Critérios de aceitação.**

- Dado uma rota na lista, quando a tela a lê, então recebe os dados fixos sem nenhuma requisição de rede.
- Dado 25 itens fixos, quando peço a página 2 com 20 por página, então recebo 5 itens e o total 25; com uma busca, só os itens com o termo, a partir da página 1.
- Dado uma gravação numa rota da lista, quando a tela envia, então recebe `NOT_IMPLEMENTED` com a mensagem do catálogo, sem requisição de rede.
- Dado uma rota fora da lista, então a chamada vai à API como hoje: as telas de acesso e a aba "Empresa" continuam iguais.
- Dado cada um dos sete status, quando a etiqueta aparece, então o nome está escrito, com contraste de 4,5:1 nos dois temas.

**Fora do escopo.** As telas (T1 a T9).

### T1. Telas do portal público: página inicial e catálogo

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Dar à página inicial e ao catálogo o conteúdo final, com os serviços de demonstração até a #48.

**Requisitos.** UC01; RF001, RF002, RF004, RF005 e RF006; RN008, RN028 e RN031; RNF001, RNF005 e RNF006. Depende de T0.

**Fontes.** `docs/catalogo/` (UC01, `rotas.md`), `docs/padroes/layouts.md`, `design.md` e `design-midia.md`; wireframes `publicPages/homepage/` e `publicPages/catalog/`.

**Escopo.**

- `/`: seção de destaque, seção institucional, localização com os dados reais de `GET /api/public/company` (já existe) e atalhos para cadastro e login.
- Vindos da #48: a imagem da seção de destaque, de um banco público de licença livre, com o crédito em `design-midia.md` e o aval do Yvan; a forma de mostrar a localização, decidida no plano.
- `/services`: cartões com nome, descrição e imagem e o filtro por categoria, com os dados de demonstração de `GET /api/public/services`; mensagens de nenhum serviço e de falha (UC01 FE01, FE02).

**Critérios de aceitação.**

- Dado um visitante, quando abre `/`, então vê o destaque, a institucional, a localização com o endereço gravado e os atalhos (UC01, RN028).
- Dado uma categoria no filtro, quando a aplico, então só os serviços dela aparecem.
- Dado o Lighthouse no celular em `/` e `/services`, então a acessibilidade não reprova, e o LCP fica registrado no PR (meta de 2,5 s, RNF006).

**Fora do escopo.** `GET /api/public/services` (#48).

### T2. Telas do cliente: conta, veículos e agendamentos

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Construir `/profile` e `/appointments` com dados de demonstração.

**Requisitos.** UC04, UC05, UC07 e UC25; RF012 a RF018, RF028 a RF030 e RF032; RN002, RN017, RN019, RN020 e RN036. Depende de T0.

**Fontes.** `docs/clientes/` e `docs/agendamento/` (UC citados, `rotas.md`); wireframes `clientPages/profile/` e `clientPages/clientAppointments/`.

**Escopo.**

- `/profile`: dados da conta, com edição; troca de senha pela rota real `POST /api/auth/change-password` (#24); veículos com tipo e porte, cadastro pela placa e edição.
- `/appointments`: atuais e histórico, com o status escrito; detalhe; cancelar com confirmação, só no "Agendado"; reagendar, só no "Concluído".

**Critérios de aceitação.**

- Dado um cliente, quando abre `/profile`, então vê os dados da conta e os veículos, com o tipo e o porte (UC04, UC05).
- Dado a troca de senha com a senha atual certa, quando confirmo, então a senha muda de verdade (a única gravação real da tela).
- Dado um agendamento "Agendado", quando abro o detalhe, então vejo "Cancelar"; num "Concluído" do histórico, "Reagendar" (RN019, RN020).

**Fora do escopo.** A edição do agendamento (T3); as rotas `/api/me` (fase 3).

### T3. Telas do cliente: agendar serviço e editar o agendamento

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Construir o assistente de agendamento de `/booking`, também usado na edição a partir de `/appointments`.

**Requisitos.** UC06, UC05 (veículo no assistente) e UC26; RF019 a RF027 e RF031; RN003 a RN006, RN009 a RN015 e RN032 a RN034; RNF002. Depende de T0 e T2.

**Fontes.** `docs/agendamento/` (UC06, UC26, `rotas.md`); wireframes `clientPages/appointment/`.

**Escopo.** Assistente em etapas no `StepForm`: veículo (com o cadastro quando não há nenhum); serviços com os adicionais vinculados e a soma; data e horário; forma de pagamento; resumo com total, duração e previsão de demonstração de `POST /api/me/appointments/preview`. A edição abre o mesmo assistente a partir do detalhe da T2.

**Critérios de aceitação.**

- Dado o resumo, quando volto à etapa dos serviços e troco um, então as outras etapas continuam preenchidas (RNF002).
- Dado um principal com adicionais vinculados, quando o escolho, então o assistente oferece os adicionais (RN006).
- Dado a confirmação, quando a envio, então vejo o aviso de `NOT_IMPLEMENTED`, e nada é gravado.

**Fora do escopo.** As rotas `/api/me` (fase 3).

### T4. Telas do painel: dashboard e análise do período

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Trocar o dashboard provisório pela tela final, com os gráficos e o cartão da análise por IA, com dados de demonstração.

**Requisitos.** UC09 e UC27; RF040 a RF043, RF089 e RF090; RN021, RN038 e RN039; RNF006. Depende de T0 e do PR de documentação da issue IA.

**Fontes.** `docs/agendamento/` (UC09, UC27, `rotas.md`), `docs/padroes/frontend.md` (Desempenho), `memoria/tarefas/66-analise-por-ia/01_plano.md` (cartão); wireframes `staffPages/dashboard/`.

**Escopo.**

- `/admin`: seletor de período, cartões dos indicadores, gráficos da receita por dia e dos agendamentos por status e a agenda do dia, com os dados de demonstração de `GET /api/admin/dashboard`.
- Vindo da #51: o Recharts, dependência nova, carregado sob demanda (`next/dynamic`), com o registro de decisão e a conferência em contêiner.
- O cartão "Análise do período" do plano da IA, com a análise de demonstração de `POST /api/admin/dashboard/analysis`.

**Critérios de aceitação.**

- Dado o período padrão, quando abro `/admin`, então vejo os quatro indicadores, os dois gráficos e a agenda do dia (UC09).
- Dado "Gerar análise", quando o aciono, então o cartão mostra o andamento e depois a análise de demonstração, com o aviso de demonstração da tela.
- Dado o Lighthouse no celular, quando audito `/admin`, então o código dos gráficos só carrega depois da página (RNF006).

**Fora do escopo.** `GET /api/admin/dashboard` (#51) e a análise real (issue IA).

### T5. Telas do painel: consulta de agendamentos, detalhe e mudanças de status

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Construir a listagem e o detalhe de `/admin/appointments`, com as ações de status.

**Requisitos.** UC10, UC12 e UC25 (FA01); RF044 a RF049 e RF052 a RF056; RN017 a RN020 e RN037; RNF005 e RNF008. Depende de T0.

**Fontes.** `docs/agendamento/` (UC citados, `rotas.md`); wireframes `staffPages/appointmentManagment/`.

**Escopo.** Visões do dia, futuras e histórico; filtro por status, busca por cliente ou veículo, ordenação, "Limpar filtros" e atualizar; detalhe, com o total de cada forma no "Finalizado"; avançar, concluir com o resumo e a forma de pagamento, cancelar com confirmação e reagendar, cada ação só nos status em que vale.

**Critérios de aceitação.**

- Dado a visão "Histórico" e o filtro "Cancelado", quando os aplico, então só os cancelados aparecem; "Limpar filtros" volta à visão completa.
- Dado um agendamento "Finalizado", quando abro "Concluir", então vejo o resumo e o total de cada forma de pagamento (RF053).

**Fora do escopo.** O novo agendamento e a edição (T6); as rotas (#46, #50).

### T6. Telas do painel: novo agendamento e edição

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Construir o assistente "Novo agendamento" de `/admin/appointments`, também usado na edição.

**Requisitos.** UC11 e UC26 (FA01); RF050, RF051 e RF055; RN003, RN005, RN006, RN009 a RN016, RN032 a RN034; RNF002. Depende de T5; de preferência depois da T3, com o mesmo autor, para reaproveitar as etapas.

**Fontes.** `docs/agendamento/` (UC11, UC26, `rotas.md`); wireframes `staffPages/appointmentManagment/` (`NewAppointmentStep1` a `Step5`).

**Escopo.** Assistente em etapas: cliente (busca), veículo, serviços, data e horário, forma de pagamento e resumo de `POST /api/admin/appointments/preview`; a edição abre o mesmo assistente a partir do detalhe da T5.

**Critérios de aceitação.**

- Dado um cliente sem veículo, quando chego à etapa do veículo, então o assistente indica cadastrar o veículo nos detalhes do cliente (UC11 FE02).
- Dado o resumo, quando volto e troco um serviço, então as outras etapas continuam (RNF002).

**Fora do escopo.** As rotas (#49, #50).

### T7. Telas do painel: serviços e categorias

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Construir as abas "Serviços" e "Categorias" de `/admin/services`.

**Requisitos.** UC13, UC14 e UC15; RF057 a RF068; RN006 a RN009, RN030 e RN031. Depende de T0.

**Fontes.** `docs/catalogo/` (UC citados, `rotas.md`); wireframes `staffPages/servicesManagment/`.

**Escopo.** Listagem de serviços com filtro por tipo e a opção de inativos; formulário em etapas conforme o tipo (dados; valores por porte ou fixo; adicionais do principal), com o campo de imagem e a prévia local, sem envio (vindos da #47); categorias com nome e descrição; desativar, reativar e excluir com confirmação.

**Critérios de aceitação.**

- Dado o tipo adicional, quando começo o cadastro, então o formulário pede só nome, duração e valor fixo, sem imagem (UC13 FA01).
- Dado o tipo complementar, quando começo o cadastro, então não há a etapa dos adicionais (UC13 FA02).

**Fora do escopo.** As rotas e o envio da imagem (#40, #44, #47).

### T8. Telas do painel: clientes e veículos

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Construir `/admin/clients`, com os veículos nos detalhes do cliente.

**Requisitos.** UC16, UC17 e UC18; RF016 e RF069 a RF076; RN002, RN022, RN023, RN030 e RN036. Depende de T0.

**Fontes.** `docs/clientes/` (UC citados, `rotas.md`); wireframes `staffPages/clientsManagment/`.

**Escopo.** Listagem com busca; detalhes da conta com os veículos; cadastro com a senha inicial; edição, com o e-mail não editável; exclusão com confirmação; cadastro de veículo pela placa, com os dados preenchidos quando a placa já existe, e edição.

**Critérios de aceitação.**

- Dado o termo "silva", quando busco, então só os clientes com o termo aparecem; sem resultado, o estado vazio.
- Dado os detalhes de um cliente, quando os abro, então vejo os veículos com tipo e porte.

**Fora do escopo.** As rotas (#42, #45).

### T9. Telas do painel: funcionários, cargos, disponibilidade e formas de pagamento

Rótulos: `area:frontend`, `tipo:funcionalidade`.

**Objetivo.** Construir as abas de `/admin/staff` e as duas abas que faltam em `/admin/settings`.

**Requisitos.** UC19, UC20, UC21, UC23 e UC24; RF077 a RF084, RF087 e RF088; RN012, RN013 e RN024 a RN027. Depende de T0.

**Fontes.** `docs/equipe/` e `docs/configuracoes/` (UC citados, `rotas.md`); wireframes `staffPages/staffManagment/` e `staffPages/adminPainelConfs/`.

**Escopo.** Abas "Funcionários" e "Cargos" (listagens com a opção de inativos, formulários em duas etapas, desativação e reativação com confirmação); abas "Disponibilidade" (os sete dias, com a pausa) e "Formas de pagamento" (os quatro percentuais), ao lado da aba "Empresa" da #37.

**Critérios de aceitação.**

- Dado `/admin/settings`, quando troco de aba, então "Empresa" continua gravando de verdade, e as outras duas mostram o aviso de demonstração.
- Dado o cadastro de cargo, quando avanço, então a segunda etapa mostra as seis permissões na ordem de RN025.

**Fora do escopo.** As rotas (#39, #41, #43).

### Issue IA. Análise do período no dashboard, gerada por IA

Rótulos: `area:frontend`, `area:backend`, `area:testes`, `tipo:funcionalidade`. Plano: `memoria/tarefas/66-analise-por-ia/01_plano.md` (hoje na pasta provisória `sem-issue-analise-por-ia/`).

**Objetivo.** Permitir que o funcionário com a permissão `dashboard` peça, em `/admin`, uma análise em texto dos indicadores do período, comparada com o período anterior, escrita por um modelo de linguagem em plano gratuito que recebe só valores agregados; a falha da IA não afeta o dashboard.

**Requisitos.** UC27 (novo) e UC09; RF089 e RF090 (novos) e RF040 a RF042; RN038 e RN039 (novas), RN021 e RN035; RNF017 e RNF018 (novos) e RNF007; RS008, RS016, RS017, RS018, RS019 e RS020 (novos); decisões 0030 e 0054 (nova).

Depende de #51 e da T4 (PR de código). O PR de documentação não depende de nenhuma.

**Escopo.**

- PR 1, documentação: os requisitos, as regras, o caso de uso, a decisão 0054, `docs/plataforma/servico-de-ia.md`, `rotas.md`, os padrões e a ICM; em `visao-geral.md`, a seção "Evolução prevista", com a intenção de levar a IA às funções futuras de um ERP, como o estoque e o financeiro, fora do MVP.
- PR 2, código: `POST /api/admin/dashboard/analysis`, com `requirePermission("dashboard")`; funções puras da análise em `src/server/rules/`, com TDD; adaptador `server-only` em `src/server/ai/`, com `fetch` e sem SDK; variáveis `AI_BASE_URL`, `AI_MODEL` e `AI_API_KEY`; o cartão da T4 ligado à rota; especificação OpenAPI.

**Critérios de aceitação.**

- Dado um período com agendamentos, quando aciono "Gerar análise", então vejo, em até 20 s, um resumo e até quatro observações em português, sem algarismos, identificados como gerados por IA (UC27, RF089, RF090, RN039, RNF018).
- Dado o período de 01/10/2026 a 31/10/2026, quando a análise é gerada, então o serviço de IA recebe os indicadores dele e os de 31/08/2026 a 30/09/2026, sem nome, e-mail, telefone, placa, identificador nem a agenda do dia (RN038, RS020).
- Dado um período sem agendamentos, quando o abro, então "Gerar análise" fica indisponível, e a rota responde 409 `INSUFFICIENT_DATA` sem chamar a IA (UC27 FE01).
- Dado o serviço de IA fora do ar, lento, sem cota ou com resposta fora do formato, quando gero a análise, então vejo que ela não pôde ser gerada, com "Tentar novamente", e os indicadores continuam (UC27 FE02, RNF017).
- Dado um funcionário sem a permissão `dashboard`, quando chama a rota, então recebe 403, e a IA não é chamada (RS008, RS019).
- Dado o registro do servidor e o código do navegador, então nenhum traz a chave, as mensagens enviadas ou a resposta do modelo (RS016, RS018, RS019).

**Fora do escopo.** Chat livre; texto digitado enviado à IA; consulta gerada pelo modelo; análise guardada; exportação; outras funcionalidades de IA.

### Issue DOC. Documentos formais com a análise por IA e as telas de demonstração

Rótulos: `area:cicd`, `tipo:documentacao`, como a #38.

**Objetivo.** Deixar os três `.docx` de acordo com o PR de documentação da issue IA, com a decisão 0055 (T0) e, se já gravada, a do Recharts (T4).

**Requisitos.** RF089, RF090, RN038, RN039, UC27, RNF017, RNF018, RS019, RS020; decisões 0040, 0054 e 0055.

Depende da incorporação do #55, do PR de documentação da issue IA e da T0.

**Escopo.** A lista por seção da seção "Documentos formais" de `01_plano.md` da issue IA, inclusive a evolução prevista (a intenção de levar a IA ao estoque, ao financeiro e a outras funções de um ERP fora do MVP, itens 21 a 23), mais os itens da T0 (Arquitetura 3.4, Comunicação com a API; 6.4, Quadro 33, `NOT_IMPLEMENTED`; 9, Quadro 38). Método da #38: edição pelo Word por automação, em cópias; conferência do texto, do sumário, dos links e das páginas em imagem; um commit por documento.

**Critérios de aceitação.**

- Dado cada item da lista, quando procuro o trecho no `.docx`, então ele está atualizado, e o texto extraído antes e depois só muda nesses trechos.
- Dado o Quadro 38, então ele traz as decisões até a última gravada.
- Dado os `.docx`, quando o Yvan os abre no Word, então abrem sem reparo, com o sumário atualizado.

**Fora do escopo.** As lógicas das ondas L1 a L4, que entram numa DOC seguinte, perto da AV3.

## Mudanças nas issues existentes

Só o corpo; títulos e rótulos continuam. Em todas que tinham "Página ..." no escopo, o item passa a "A tela da T*n*, ligada às rotas: o esquema de validação no formulário e as rotas fora da lista de demonstração (decisão 0055)".

| Issue | Muda |
|---|---|
| #39 Cargos | a página vai para a T9; depende da T9 |
| #40 Categorias | a página vai para a T7; depende da T7 |
| #41 Disponibilidade e formas de pagamento | as abas vão para a T9; depende da T9 (a #37 já está feita) |
| #42 Clientes | a página vai para a T8; depende da T8 |
| #43 Funcionários | a aba vai para a T9; depende de #39 e da T9 |
| #44 Serviços | a aba vai para a T7; depende de #40 e da T7 |
| #45 Veículos pelo painel | a tela vai para a T8; depende de #42 e da T8 |
| #46 Consulta de agendamentos | a página vai para a T5, e a etiqueta de status para a T0; depende da T5 |
| #47 Imagem dos serviços | o campo com a prévia vai para a T7; ficam a rota de envio e a ligação; depende de #44 |
| #48 Página inicial e catálogo | as páginas, a imagem de destaque e a forma da localização vão para a T1; fica `GET /api/public/services` e a ligação; depende de #44, #47 e da T1 |
| #49 Registrar agendamento | o assistente vai para a T6; depende de #41, #44, #45, #46 e da T6 (a #36 está feita) |
| #50 Status e edição | as ações e a edição vão para a T5 e a T6; depende de #49 |
| #51 Dashboard | a página e o Recharts vão para a T4; sai a dependência da #50, porque o `seed-demo.sql` tem concluídos, cancelados e reagendados (carregado no banco local para a verificação); sai a da #46 (a etiqueta está na T0); entra "o cálculo dos indicadores de um período fica numa função do serviço, reutilizada pela análise da issue IA"; depende da T4 |

## Nova ordem

| Onda | Issues | Começa quando |
|---|---|---|
| T, telas | T0 e o PR de documentação da issue IA | agora, em paralelo |
| T, telas | T1, T2, T4, T5, T7, T8 e T9 | T0 incorporada (a T4 também com o PR de documentação da IA) |
| T, telas | T3, depois T6 | T2 (T3); T5 (T6) |
| L1, lógica | #39, #40, #41, #42, #46, #51 e a DOC | a tela de cada uma; a DOC com o #55, o PR de documentação da IA e a T0 |
| L2 | #43, #44, #45 e o PR de código da IA | #39 (#43), #40 (#44), #42 (#45), #51 (IA) |
| L3 | #47, #48 e #49 | #44 (#47); #44 e #47 (#48); #41, #44, #45 e #46 (#49) |
| L4 | #50 | #49 |
| Fase 3 | lógica do portal do cliente (issues a criar, sugestão: conta e veículos; agendar; acompanhar, editar, cancelar e reagendar) | #45 (conta e veículos), #49 (agendar), #50 (o resto) |

Com quatro pessoas: depois da T0, as telas se dividem por pastas diferentes. Os arquivos em comum são a lista de `src/lib/demo/` (uma linha por rota, conflito simples) e os tipos de `src/shared/api/appointments.ts` (T2, T3, T5 e T6) e `vehicles.ts` (T2 e T8), que pedem ordem ou combinação entre os autores.

## Riscos

- **Calendário.** Faltam cerca de seis semanas até a AV3. A onda de telas tem onze PRs (T0 a T9 e o de documentação da IA); depois vêm 13 issues de lógica, o código da IA, a DOC e a fase 3, ainda sem issues. A fase 3 pode chegar à AV3 só como demonstração, com o aviso (LT4).
- **Conta para o professor.** As telas do painel exigem uma conta de funcionário com permissões; até a #43, só existe a conta de administrador da equipe. Ponto para você: apresentar com a conta da equipe ou criar uma conta de funcionário à parte antes da #43 (fora desta proposta). As telas do cliente funcionam com uma conta criada em `/register`.
- **Tipos provisórios.** Os tipos de `src/shared/api/` vêm de `rotas.md`, que descreve algumas respostas por alto ("lista paginada com cliente, veículo, serviços..."); a tarefa de lógica pode ajustá-los, junto com os dados fixos.
- **Telas que mudam com a lógica.** A validação dos formulários só aparece nas tarefas de lógica (LT3, opção 1).

## O que muda no GitHub depois do seu OK

1. Criar a T0 a T9, a issue IA e a DOC, com os textos acima e os rótulos indicados.
2. Editar o corpo da #39 à #51 conforme a tabela "Mudanças nas issues existentes".
3. Renomear a pasta provisória para `<número da IA>-analise-por-ia` e pôr o número no plano.

Nada é feito sem o seu OK na conversa.
