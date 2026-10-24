---
issue: 64
titulo: "Telas de clientes e veículos do painel com dados de demonstração"
areas: [frontend]
tipo: funcionalidade
requisitos: [UC16, UC17, UC18, RF016, RF069, RF070, RF071, RF072, RF073, RF074, RF075, RF076, RN002, RN022, RN023, RN030, RN036, RNF002, RNF003, RNF004, RNF005, RNF008, RNF011]
status: concluido
aprovado_por: yvan
aprovado_em: 24/10/2026
---

# Plano: Telas de clientes e veículos do painel com dados de demonstração

## Objetivo

Construir `/admin/clients` (T8 de `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`, decisão 0055) com dados de demonstração, como o wireframe de `staffPages/clientsManagment/`:

- **Listagem** (UC17 passos 1 a 4, RF069, RF070): clientes em ordem alfabética, com busca por nome, e-mail ou telefone, "Ver detalhes" em cada item e o estado vazio quando nada corresponde (FE01).
- **Detalhes da conta** (UC17 passo 5, RF072): janela com os dados da conta e os veículos (tipo e porte, RN002), "Editar dados", "Excluir conta" e "Cadastrar veículo".
- **Cadastro de cliente** (UC16, RF071): janela "Novo cliente" com e-mail, nome, sobrenome, telefone e senha inicial (RN022, RN023).
- **Edição e exclusão** (UC17 FA01, passos 6 e 7, RF073, RF074): o mesmo formulário, com o e-mail só para leitura, e a confirmação da exclusão (RN030).
- **Veículos do cliente** (UC18, RF016, RF075, RF076): cadastro pela placa, com os dados preenchidos quando a placa já existe (RN036), e edição, inclusive do veículo vinculado a mais de uma conta.

A gravação de qualquer formulário ou ação mostra o aviso de `NOT_IMPLEMENTED`, e nada é gravado. Nenhuma rota, migration ou esquema de validação, nenhum import de `src/server/` e nenhuma dependência nova.

## Base conferida

- Issue #64 aberta, sem PR aberto. `origin/main` e a ramificação desta sessão (`claude/magical-meninsky-0318ac`) em a4adcfe (#95, a #63), com a árvore limpa.
- Dependência cumprida: a #56 (base da demonstração) e as telas de demonstração até a #63 estão na `main`. As rotas (#42 e #45) estão abertas e sem código: `src/app/api/admin/` não tem rota de clientes nem de veículos.
- Existem: `src/app/(admin)/admin/clients/` e `src/components/admin/clients/` e `admin/vehicles/` (só `README.md`), `FormDialog`, `ConfirmDialog`, `PaginatedList` (busca e "Limpar filtros" opcionais), `FormField` (`rules`), `PasswordInput`, `DemoNotice`, `EmptyState`, os diálogos de veículo do portal (`add-vehicle-dialog.tsx`, `edit-vehicle-dialog.tsx`, `vehicle-fields.tsx`, com `/api/me/vehicles` fixo), `src/lib/demo/clients.ts` (só o perfil do Henrique) e `vehicles.ts` (os veículos dele e os 14 do seed para a consulta de placa), `formatPhone` e `formatPlate`.
- O `seed-demo.sql` tem 13 clientes (a Natália Pires sem veículo; a SW4 `GLW5L15` em duas contas, RN036) e 14 veículos. `admin-appointments.ts` guarda os 13 clientes (`CLIENTS`, com os ids do seed) e os ids dos veículos (`ACCOUNTS`), sem exportá-los. Nenhuma alteração do seed (ver L3).
- Wireframes abertos no painel do navegador: a listagem do celular (título "Clientes", busca "Buscar por nome ou e-mail…", contagem "26 clientes", "Criar cliente", linhas com avatar de iniciais, nome, e-mail e "Ver") e a miniatura do modal "Novo cliente" (celular e desktop: janela curta com poucos campos e "Cancelar" e o botão de criar). Não há wireframe dos detalhes, da edição nem dos veículos.

## Critérios de aceitação e verificação

Os critérios da issue vêm primeiro; os comuns das telas de demonstração (decisão 0055) vêm depois. Pela decisão 0052, telas e componentes são verificados à mão; os passos são os da seção "Roteiro manual" abaixo, no banco local e no `next start` com `NEXT_PUBLIC_*` do banco local (como a #61 a #63). Nenhuma função pura de regra de negócio será criada; se alguma surgir na construção, ela ganha teste antes do código e o plano é atualizado.

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado o termo "souza", quando busco, então só os clientes com o termo aparecem, em 300 ms e na primeira página (UC17 passo 3, RF070) | Passo manual M3 (a issue cita "silva", que não está no seed: L3) |
| Dado o termo "silva", quando busco, então não há cliente e aparece o estado vazio "Nenhum cliente encontrado", com "Limpar filtros" (UC17 FE01) | Passo manual M3 |
| Dado os detalhes de um cliente, quando os abro, então vejo os dados da conta e os veículos com tipo e porte (UC17 passo 5, RF072, RN002) | Passo manual M4: Ana Souza (Hatch · P e Hatch · P), Henrique Costa (Picape · GG e SUV · G) e Natália Pires ("Nenhum veículo cadastrado") |
| Dado o veículo vinculado a mais de uma conta, quando abro os detalhes, então ele traz a indicação e o "Editar" continua disponível (UC18 FA02, RN036, RF076) | Passo manual M4 e M9: SW4 de Henrique Costa e de Isabela Melo |
| Dado o cadastro de cliente, quando preencho, então há e-mail, nome, sobrenome, telefone com máscara e senha inicial com o botão de mostrar; campos vazios ou inválidos são indicados e os dados mantidos (UC16 passos 2 a 4, FE01, RN023) | Passo manual M5 |
| Dado o formulário de cadastro, quando confirmo com dados preenchidos, então aparece o aviso de `NOT_IMPLEMENTED` no topo da janela, que continua aberta, e nada é gravado (decisão 0055) | Passo manual M5 |
| Dado a edição, quando abro, então o e-mail aparece só para leitura, e os demais campos vêm dos dados do cliente (UC17 passos 6 e 7, RF073) | Passo manual M6 |
| Dado a exclusão da conta, quando a aciono, então a confirmação diz que os veículos e os agendamentos são preservados, e o envio mostra `NOT_IMPLEMENTED` (UC17 FA01, RN030, RF074) | Passo manual M7 |
| Dado o cadastro de veículo, quando informo uma placa já cadastrada ("GLW1A01"), então os dados vêm preenchidos, sem edição, com "Adicionar à conta" (UC18 FA01, RN036) | Passo manual M8 |
| Dado o cadastro de veículo, quando informo uma placa nova ("ABC1D23"), então pede tipo, marca, modelo, cor e ano, e o porte não é escolhido (UC18 passos 4 e 5, RF075, RN002) | Passo manual M8 |
| Dado a edição de veículo, quando abro, então os dados vêm preenchidos, inclusive no veículo compartilhado, com o aviso de que a alteração vale para todas as contas (UC18 FA02, RF076) | Passo manual M9 |
| Dado `EMAIL_IN_USE`, `VEHICLE_ALREADY_LINKED`, `PLATE_IN_USE` e `VERSION_CONFLICT`, quando a gravação os devolve, então a mensagem aparece no topo da janela e, no conflito, a leitura é refeita (UC16 FE02, UC18 FE02 e FE03, RNF011) | Passo manual M11, por alteração temporária de `src/lib/demo` (a demonstração recusa toda gravação com `NOT_IMPLEMENTED`) |
| Dado qualquer janela ou formulário, quando uso só o teclado (Tab, Shift+Tab, setas nos botões de opção e no tipo do veículo, Enter, Esc), então alcanço e aciono tudo, o foco é visível e Esc devolve o foco ao botão de origem, também em janela sobre janela (WCAG 2.1.1, 2.4.7) | Passo manual M10 |
| Dado a tela a 360 × 800 e a 1440 × 900, no tema claro e no escuro, então não há transbordo horizontal | Passo manual M12 |
| Dado a tela, o Lighthouse de acessibilidade não tem auditoria reprovada, e o LCP e o CLS do celular são medidos | Passo manual M12 (Lighthouse em modo `snapshot` para os estados e `navigation` com o cookie do admin local para a página) |
| Dado carregamento, lista vazia ou falha da leitura, então aparecem o esqueleto, a mensagem de vazio e o aviso com "Tentar novamente", na lista e na janela de detalhes (`componentes.md`) | Passo manual M11, com a alteração temporária de `src/lib/demo` e `api-client.ts` como na #61 (`globalThis.__demo`, desfeita por `git checkout -- src`) |
| Dado o aviso, então "Dados de demonstração…" aparece abaixo do título, e a tela não importa `src/server/` nem cria rota, migration ou esquema | `npm run check` e `git diff --stat` conferidos antes de cada PR |

### Roteiro manual

- **M1.** Abrir `/admin/clients` como o admin local: título "Clientes", aviso de demonstração, busca, botão "Novo cliente" e a lista dos 13 clientes em ordem alfabética (20 por página, faixa "1–13 de 13").
- **M2.** Esqueleto no primeiro carregamento e, em uma nova leitura, a lista anterior com a aparência de carregando.
- **M3.** Busca "souza" (um cliente), "costa", "silva" (vazio), "ana.souza@" (e-mail) e "82900000008" (telefone); "Limpar filtros" volta à lista completa e leva o foco à busca.
- **M4.** "Ver detalhes" de Ana Souza, Henrique Costa e Natália Pires: dados da conta, veículos e o vazio.
- **M5.** "Novo cliente": campos, máscara do telefone, senha com "Mostrar senha", "Cancelar", validação de campos vazios, e o aviso de `NOT_IMPLEMENTED` no envio.
- **M6.** "Editar dados" nos detalhes: e-mail só para leitura, "Salvar alterações", aviso no envio.
- **M7.** "Excluir conta": confirmação, "Voltar", "Excluir conta" e o aviso, com o foco voltando ao botão.
- **M8.** "Cadastrar veículo": placa, "Continuar", placa existente (GLW1A01) e nova (ABC1D23), "Voltar" mantendo o digitado.
- **M9.** "Editar" de um veículo comum e do compartilhado, com o aviso da RN036.
- **M10.** Teclado completo da lista, dos detalhes e de cada janela, inclusive a janela sobre os detalhes e o retorno do foco.
- **M11.** Carregamento lento, falha com "Tentar novamente", lista vazia, sucesso das gravações (a janela fecha, a lista e os detalhes são lidos de novo, o foco volta ao botão de origem), `EMAIL_IN_USE`, `VEHICLE_ALREADY_LINKED`, `PLATE_IN_USE` e `VERSION_CONFLICT`, por alteração temporária sem commit.
- **M12.** 360 × 800 e 1440 × 900, claro e escuro; Lighthouse; LCP e CLS do celular na página.

## Arquivos

Cada um na pasta cujo `README.md` o admite.

| Arquivo | Ação |
|---|---|
| `src/shared/api/clients.ts` | alterar: `AdminClientSummary` e `AdminClient` (detalhe) |
| `src/shared/api/vehicles.ts` | alterar: só comentário, se `ClientVehicle` passar a servir às duas telas (P3) |
| `src/lib/demo/clients.ts` | alterar: `SEED_CLIENTS` (os 13 do seed, com ids, e-mails, telefones e placas), tirado de `admin-appointments.ts` |
| `src/lib/demo/vehicles.ts` | alterar: ids dos veículos do seed (tirados de `ACCOUNTS`) e a consulta de placa do painel |
| `src/lib/demo/admin-clients.ts` | criar: respostas de `GET /api/admin/clients`, `/:id`, `/:id/vehicles` e `GET /api/admin/vehicles/lookup` |
| `src/lib/demo/admin-appointments.ts` | alterar: passa a importar `SEED_CLIENTS` e os ids dos veículos (sem mudar a resposta de nenhuma rota) |
| `src/lib/demo/routes.ts` | alterar: as quatro leituras; `POST /api/admin/clients`, `PATCH` e `DELETE /api/admin/clients/:id`, `POST /api/admin/clients/:id/vehicles` e `PATCH /api/admin/vehicles/:id` sem `load` |
| `src/app/(admin)/admin/clients/page.tsx` | criar |
| `src/components/admin/clients/client-list.tsx` | criar: busca, linhas e estados |
| `src/components/admin/clients/client-card.tsx` | criar: a linha do cliente |
| `src/components/admin/clients/client-details-dialog.tsx` | criar: janela de detalhes com as ações |
| `src/components/admin/clients/client-form-dialog.tsx` | criar: janela de cadastro e de edição |
| `src/components/admin/clients/client-fields.tsx` | criar: campos do cliente (nome, sobrenome, e-mail, telefone, senha) |
| `src/components/admin/clients/delete-client-button.tsx` | criar: "Excluir conta" com `ConfirmDialog` |
| `src/components/admin/vehicles/client-vehicle-list.tsx`, `client-vehicle-card.tsx` | criar: os veículos nos detalhes, com "Editar" e a indicação de veículo compartilhado |
| `src/components/shared/vehicle-fields.tsx`, `add-vehicle-dialog.tsx`, `edit-vehicle-dialog.tsx` | mover de `portal/vehicles/` e parametrizar os endereços (P3) |
| `src/components/portal/vehicles/vehicle-card.tsx`, `vehicle-list.tsx`, `src/components/portal/appointments/booking-add-vehicle.tsx` | alterar: endereço dos três componentes movidos |
| `src/components/shared/README.md`, `src/components/portal/vehicles/README.md`, `src/components/admin/vehicles/README.md` | alterar: o que vai em cada pasta, se a lista de "Vai aqui" mudar |
| `docs/clientes/clientes-do-painel.md` | criar: módulo da tela (L1) |
| `docs/clientes/CONTEXT.md`, `docs/clientes/rotas.md` | alterar: linha do módulo e os campos das leituras e da consulta de placa (L2) |

Arquivos fora da lista acima, acrescentados na construção (desvios registrados em `notas.md`, a confirmar pelo Yvan):

| Arquivo | Ação |
|---|---|
| `src/components/portal/vehicles/vehicle-paths.ts` | criar: os endereços do portal para os diálogos de veículo movidos (P3) |

Não foram alterados, apesar de listados: `src/shared/api/vehicles.ts` (sem mudança) e os README de `admin/clients/` e `admin/vehicles/` (a lista de "Vai aqui" não mudou; só o de `admin/vehicles/` ganhou a descrição nova).

Arquivos de ponto de contato com outras telas de demonstração: `src/lib/demo/routes.ts`, `src/lib/demo/admin-appointments.ts`, `src/lib/demo/vehicles.ts`, `src/shared/api/clients.ts` e `vehicles.ts` (o portal usa `ClientProfile` e `ClientVehicle`) e os diálogos de veículo movidos (usados por `/profile` e `/booking`). Se a etapa de construção mexer em arquivo fora desta lista, ele vai para as notas e para esta lista, e o Yvan confirma o desvio.

## Testes previstos

Nenhum teste automatizado novo: a tela não cria função pura de regra de negócio (decisão 0052: telas, componentes e dados de demonstração são verificados à mão), e as regras RN002, RN022, RN023, RN030 e RN036 ficam no servidor, na tarefa das rotas (#42 e #45). O `npm run check` (formatação, tipos, lint e os testes existentes) roda antes de cada PR. O `admin-clients.ts` é conferido por um teste temporário do Vitest com `apiRequest` (apagado), como o `admin-catalog.ts` na #63.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Conteúdo da página `/admin/clients`

**Problema.** Nenhum módulo define os textos, a ordem dos controles, a linha da lista, a janela de detalhes, os formulários e os estados da página: só UC16 a UC18, as regras e o wireframe (outro sistema, que mostra só a lista e a miniatura do modal, e tem a contagem "26 clientes" e o avatar de iniciais, que o Glow não precisa). `rotas.md` só tem a tela `/admin/clients`, sem subrota, então os detalhes não podem ser outra página.

**Opções:**

- [x] **1. Novo módulo `docs/clientes/clientes-do-painel.md`, com os detalhes em janela (recomendada).** Como `agendamentos-do-painel.md` e `servicos-do-painel.md`; a tela segue o texto abaixo, sem rota nova.
- [ ] **2. Detalhes em página própria (`/admin/clients/[id]`).** Acrescenta uma tela a `rotas.md` e à Arquitetura de Software; fora do escopo de uma tela de demonstração.
- [ ] **3. Deixar a tela definir os textos.** O código passaria a ser a única fonte, contra `guia/regras.md`.

**Texto proposto (opção recomendada)**, em `docs/clientes/clientes-do-painel.md` (novo; linha no `CONTEXT.md` do assunto):

- **Página.** Título "Clientes"; abaixo, o aviso de demonstração, a busca e o botão "Novo cliente" (ao lado da busca a partir de 768 px, e abaixo dela no celular), e a lista. Acesso: permissão `clients` (RN025).
- **Lista (UC17 passos 2 a 4, RF069, RF070).** Busca "Buscar por nome, e-mail ou telefone" (300 ms, volta à primeira página); "Limpar filtros" quando há busca. Ordem alfabética pelo nome completo; o cliente excluído nunca aparece (RN030). 20 por página, com a faixa "1–13 de 13" (RNF008). A linha tem o nome completo, o e-mail, o telefone com máscara e o botão "Ver detalhes" (com o nome do cliente para o leitor de tela); uma coluna no celular e duas a partir de 1280 px.
- **Estados.** Carregamento: esqueleto de linhas; vazio sem busca: "Nenhum cliente cadastrado" e "Cadastre um cliente para ele aparecer aqui."; com busca (FE01): "Nenhum cliente encontrado" e "Não há clientes para o critério informado."; falha: o aviso com "Tentar novamente".
- **Detalhes (UC17 passo 5, RF072).** Janela "Detalhes do cliente", que lê o cliente e os veículos ao abrir: nome completo, e-mail e telefone; seção "Veículos" com um cartão por veículo ("<marca> <modelo>", "Placa <placa> · <cor> · <ano>", "<tipo> · Porte <porte>", e "Também vinculado a outra conta" quando é o caso) e o botão "Editar"; sem veículos: "Nenhum veículo cadastrado". Botões "Editar dados", "Cadastrar veículo" e "Excluir conta". Enquanto carrega, o lugar fica reservado; na falha, o aviso com "Tentar novamente".
- **Novo cliente (UC16, RF071, RN023).** Janela "Novo cliente" com "E-mail", "Nome", "Sobrenome", "Celular" (descrição "Com DDD, como (82) 99999-8888.") e "Senha inicial" (descrição "De 8 a 72 caracteres, com letra maiúscula, número e caractere especial. O cliente troca a senha no primeiro acesso.", com o botão de mostrar), sem confirmação da senha; botões "Cancelar" e "Cadastrar cliente" ("Cadastrando…"). É uma janela só, sem etapas (RNF002). A falha aparece no topo da janela.
- **Editar dados (UC17 passos 6 e 7, RF073).** Janela "Editar cliente" com "Nome", "Sobrenome" e "Celular" preenchidos e o "E-mail" só para leitura, com a descrição "O e-mail de acesso não pode ser alterado."; botões "Cancelar" e "Salvar alterações" ("Salvando…"). No 409 `VERSION_CONFLICT`, o aviso fica no topo e os dados são lidos de novo (RNF011).
- **Excluir conta (UC17 FA01, RF074, RN030).** Confirmação "Excluir esta conta?", "A conta deixa de ser exibida e perde o acesso ao sistema. Os veículos e os agendamentos do cliente são preservados.", botões "Voltar" e "Excluir conta" ("Excluindo…"), na cor de erro. Com sucesso, a confirmação e os detalhes fecham, e a lista é lida de novo.
- **Cadastrar veículo (UC18, RF075).** Janela "Cadastrar veículo" como a do portal ([area-do-cliente.md](area-do-cliente.md), Cadastro), com o botão "Adicionar à conta" no lugar de "Adicionar à minha conta", e a consulta em `GET /api/admin/vehicles/lookup`. O envio vai a `POST /api/admin/clients/:id/vehicles`. Placa já entre os veículos do cliente (FE02): o aviso é o de `VEHICLE_ALREADY_LINKED`.
- **Editar veículo (UC18 FA02, RF076).** Janela "Editar veículo" como a do portal, sem a trava do veículo compartilhado: no que está em mais de uma conta, o aviso "As alterações valem para todas as contas vinculadas a este veículo." fica no topo do formulário. O envio vai a `PATCH /api/admin/vehicles/:id`; `PLATE_IN_USE` (FE03) e `VERSION_CONFLICT` aparecem no topo da janela.

### L2. Campos das leituras e consulta de placa

**Problema.** `rotas.md` diz "lista paginada de clientes", "dados da conta" e "lista paginada de veículos, com tipo e porte" sem os campos. A consulta de placa do painel diz "ou resposta vazia", enquanto a do portal (`/api/me/vehicles/lookup`) devolve `null`, e o cliente da API já trata `null`.

**Opções:**

- [x] **1. Definir os campos e igualar a consulta ao portal (recomendada).** Sem rota nova; o painel reaproveita `VehicleLookup` e `ClientVehicle`.
- [ ] **2. Manter "resposta vazia" no painel.** Dois formatos para a mesma consulta, e o diálogo movido (P3) trataria os dois.

**Texto proposto (opção recomendada):**

- `docs/clientes/rotas.md`, `GET /api/admin/clients`: "Resposta: **200** lista paginada de `id`, `firstName`, `lastName`, `email`, `phone` (os 11 algarismos) e `updatedAt`, em ordem alfabética pelo nome completo; `search` procura no nome, no e-mail e no telefone."
- `GET /api/admin/clients/:id`: "Resposta: **200** `id`, `firstName`, `lastName`, `email`, `phone` e `updatedAt`."
- `GET /api/admin/clients/:id/vehicles`: "Resposta: **200** lista paginada de `id`, `plate`, `type`, `size`, `brand`, `model`, `color`, `year`, `isShared` e `updatedAt`, na ordem em que foram vinculados à conta."
- `GET /api/admin/vehicles/lookup`: "Resposta: **200** `type`, `brand`, `model`, `color` e `year` do veículo, se a placa já estiver cadastrada, ou `null`; nunca devolve dados de clientes."

### L3. O termo "silva" do critério de aceitação não está no seed

**Problema.** O critério da issue usa "silva", mas nenhum dos 13 clientes de `seed-demo.sql` tem esse termo (Ana Souza, Bruno Lima, Carla Mendes, Diego Ferreira, Eduarda Santos, Felipe Araújo, Gabriela Rocha, Henrique Costa, Isabela Melo, João Pedro Barros, Larissa Cavalcanti, Marcos Tenório e Natália Pires). Com os dados de demonstração, "silva" cai no estado vazio, e o "só os clientes com o termo" ficaria sem exemplo.

**Opções:**

- [x] **1. Manter o seed e verificar com os dois termos (recomendada).** "souza" mostra a busca com resultado, e "silva" mostra o estado vazio (FE01). Nenhuma alteração do seed, que os agendamentos, o dashboard e a #62 usam, e a issue ganha um comentário seu trocando "silva" por "souza" (ou mantendo os dois).
- [ ] **2. Acrescentar um "Silva" ao seed.** Muda `seed-demo.sql`, `SEED_CLIENTS`, a busca de clientes da #62 e a contagem do dashboard, para um exemplo de busca.

**Texto proposto (opção recomendada):** nenhum arquivo de documentação além do módulo novo; a verificação está em M3.

### L4. Mensagem de `EMAIL_IN_USE` no painel

**Problema.** UC16 FE02 diz "informa que já existe um cliente com o e-mail informado", mas a mensagem do código `EMAIL_IN_USE` em `src/shared/errors/catalog.ts` é a do cadastro público: "Este e-mail não pode ser usado. Se você já tem conta, entre com ela." (sem confirmar que o e-mail existe).

**Opções:**

- [x] **1. Deixar para a #42 (recomendada).** A demonstração nunca devolve esse erro; a tela mostra a mensagem do catálogo, como o portal. A #42 decide se o painel ganha um texto próprio, com a rota. A lacuna fica registrada em `clientes-do-painel.md`.
- [ ] **2. Texto próprio agora.** Exigiria um código ou uma variante da mensagem no catálogo compartilhado, sem rota que o use.

**Texto proposto (opção recomendada):**

- `docs/clientes/clientes-do-painel.md`, seção "Novo cliente": "`EMAIL_IN_USE` (UC16 FE02) aparece no topo da janela com a mensagem do catálogo de erros; a rota (#42) define se o painel usa um texto próprio."

## Decisões técnicas

- Seguidas: 0022 (exclusão lógica), 0027 (React Hook Form), 0039 (tarefas de ponta a ponta), 0041 (wireframes de referência), 0049 (shadcn sobre Base UI), 0052 (testes à mão para telas) e 0055 (telas de demonstração), mais `componentes.md` (diálogos, listagem, `PasswordInput`, `FormDialog`), `frontend.md` e `design.md`.
- Nenhuma nova.

## Riscos e dúvidas

- **Janela sobre janela.** "Editar dados", "Cadastrar veículo", "Editar" de veículo e "Excluir conta" abrem sobre os detalhes. Segue o padrão da #61 e da #62 (janelas sempre montadas com o gatilho `hidden`, para o aviso de um 409 ser lido, `FormAlert` no topo com o foco); o teclado e o retorno do foco são verificados em M10.
- **Diálogos de veículo compartilhados.** Os do portal têm `/api/me/vehicles` fixo; a mudança de pasta toca `/profile` e `/booking` (P3). Conferir os dois depois da mudança (M9 e o portal, com o mesmo roteiro da #58 e da #59).
- **Validação só da tela.** Como na #62 e na #63, o formulário confere só o obrigatório (`rules` do React Hook Form); formato de telefone, regras da senha e da placa entram com o esquema, em #42 e #45. A tela já aplica a máscara de telefone e de placa (`formatPhone`, `formatPlate`).
- **Dados que mudam sozinhos.** As gravações não gravam; lista e detalhes ficam como o seed. A releitura com `updatedAt` novo, o sucesso e os 409 são verificados por alteração temporária, como na #62 e na #63, antes do último PR.
- **FE02 e FE03 do UC18 e `PLATE_IN_USE`** dependem da rota; o navegador não decide (regra no servidor), então só os vemos como falha da gravação (M11).
- **LCP do celular.** Nas telas anteriores ficou acima dos 2,5 s de `frontend.md` no Lighthouse local (3,3 s na #63); é medido de novo e levado ao relatório, com a conferência na pré-visualização da Vercel como passo seu.
- **Wireframe incompleto.** Não há wireframe dos detalhes, da edição nem dos veículos, e o do modal só foi legível como miniatura; o conteúdo vem de `docs/` (L1) e o estilo, de `design.md`.

## Divisão em PRs e pontos à parte

O total previsto em `src/` passa de 400 linhas (cerca de 1.000 a 1.200 com tipos, dados, listagem, janelas e a mudança dos diálogos de veículo), então proponho **três PRs encadeados**, cada um verificado e com `npm run check` verde, o último com "Closes #64" e `memoria/tarefas/64-…` só nele, como na #62 e na #63.

### P1. Divisão em PRs

- [x] **1. Três PRs (recomendada).**
  - **PR 1 – base:** tipos, `SEED_CLIENTS` e os dados de demonstração, entradas de `routes.ts`, `rotas.md` (L2) e o módulo `clientes-do-painel.md` (L1, L3, L4) (~300 linhas em `src/`).
  - **PR 2 – lista e detalhes:** página, busca, linhas, estados, janela de detalhes com os veículos e "Excluir conta" com a confirmação (~400 linhas).
  - **PR 3 – formulários:** "Novo cliente", "Editar dados", e o cadastro e a edição de veículo pelos diálogos movidos e parametrizados (~400 linhas, mais a mudança de pasta).
- [ ] **2. Um PR só.** Mais de 1.000 linhas de uma vez, difícil de revisar.

### P2. Ambiente de verificação

- [x] **1. Como nas tarefas anteriores (recomendada).** Docker Desktop aberto; `npx supabase start` e `db reset` (carrega o `seed-demo.sql`); admin local criado por `make-admin.mjs` (senha gerada, não registrada); `next build` e `next start -p 3060` com as variáveis do banco local; cookie do admin no Lighthouse (CLI 13.5, `navigation` para a página e `snapshot` para os estados); alterações temporárias de `src/lib/demo` e `src/lib/api-client.ts` sem commit, desfeitas por `git checkout -- src`. Os roteiros são recriados a partir dos de `61-scripts-de-verificacao/` no scratchpad da sessão, com os caminhos do worktree. Tudo é feito antes de marcar o último PR como pronto, inclusive o teclado completo e o LCP e o CLS do celular; no fim, `npx supabase stop`.
- [ ] **2. Só no navegador do app, sem Lighthouse nem banco local.** Deixaria sem medida o que o plano promete.

### P3. Diálogos de veículo: mover e parametrizar, ou duplicar

- [x] **1. Mover os três para `src/components/shared/` e parametrizar os endereços (recomendada).** `AddVehicleDialog` e `EditVehicleDialog` ganham os endereços de cadastro, de consulta e de edição por parâmetro, e o texto "Adicionar à minha conta" ou "Adicionar à conta"; o portal passa os seus. Evita repetir cerca de 400 linhas, e o `shared/` é a pasta dos componentes das duas interfaces. Toca `/profile` e `/booking`.
- [ ] **2. Duplicar em `admin/vehicles/`.** Não mexe no portal, mas repete os dois diálogos e os campos, e cada ajuste futuro precisa ser feito nos dois.

### P4. O que fica para você conferir

- [ ] A tela em produção logada (Vercel), depois da incorporação do último PR: passo seu, listado no relatório.

## Fora do escopo

- As rotas de clientes e de veículos do painel (#42 e #45), com as regras de `EMAIL_IN_USE`, `VEHICLE_ALREADY_LINKED`, `PLATE_IN_USE` e a gravação da senha inicial.
- A área do cliente (`/profile`), que já tem seus dados de demonstração, fora a mudança de pasta dos diálogos de veículo (P3).
- Remover o vínculo de um veículo com a conta, trocar a senha do cliente pelo painel e mostrar a troca de senha pendente: sem requisito em `docs/clientes/`.
- O contador "26 clientes", o avatar de iniciais e o resto do wireframe sem requisito no Glow.
- A contagem de clientes e de agendamentos do cliente nos detalhes: sem requisito.
