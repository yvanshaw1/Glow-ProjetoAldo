---
issue: 64
pull_request: 99
---

# Relatório: Telas de clientes e veículos do painel com dados de demonstração

Em três PRs: o #97, da base (`Refs #64`); o #98, da lista e dos detalhes (`Refs #64`, sobre o #97); e o #99, dos formulários (`Closes #64`, este, sobre o #98). O relatório está completo, e o plano passou a `concluido` neste PR.

## O que foi feito

PR #97, base:

- **Tipo** `AdminClient` em `src/shared/api/clients.ts`.
- **Dados de demonstração** (decisão 0055): `SEED_CLIENTS` (os 13 clientes do `seed-demo.sql`, com ids, telefones e placas), `SIZE_BY_TYPE` e `VEHICLE_IDS` movidos de `admin-appointments.ts` para `clients.ts` e `vehicles.ts`; `src/lib/demo/admin-clients.ts` responde `GET /api/admin/clients` (busca por nome, e-mail e telefone, com ou sem a máscara), `/:id` e `/:id/vehicles`; `GET /api/admin/vehicles/lookup` usa a consulta de placa existente; `POST`, `PATCH` e `DELETE` de clientes e `POST` e `PATCH` de veículos são recusados com `NOT_IMPLEMENTED`.
- **Documentação:** `docs/clientes/clientes-do-painel.md` (L1, L3 e L4), a linha em `docs/clientes/CONTEXT.md` e os campos das leituras e da consulta de placa em `rotas.md` (L2).

PR #98, lista e detalhes:

- **`/admin/clients`** com o aviso de demonstração, a busca por nome, e-mail ou telefone (UC17, RF069, RF070), "Limpar filtros", os estados de carregamento, vazio ("Nenhum cliente encontrado", FE01) e falha, e o cartão do cliente.
- **Detalhes** (UC17, RF072): janela com os dados da conta e os veículos por página, com tipo e porte (RN002) e a indicação de veículo vinculado a outra conta (RN036); "Excluir conta" com confirmação que diz que veículos e agendamentos são preservados (UC17 FA01, RF074, RN030).

PR #99, formulários:

- **Novo cliente** (UC16, RF071, RN022, RN023): e-mail, nome, sobrenome, celular com máscara e senha inicial com o botão de mostrar; campos vazios indicados no primeiro envio (FE01).
- **Editar dados** (UC17 passos 6 e 7, RF073): o mesmo formulário, com o e-mail só para leitura e `VERSION_CONFLICT` com releitura (RNF011).
- **Veículos do cliente** (UC18, RF016, RF075, RF076): cadastro pela placa, com os dados preenchidos quando a placa já existe (FA01), e edição, inclusive do veículo compartilhado, com o aviso de que vale para todas as contas.
- Os diálogos `add-vehicle-dialog`, `edit-vehicle-dialog` e `vehicle-fields` foram movidos de `portal/vehicles/` para `src/components/shared/` e recebem os endereços por parâmetro; `/profile` e `/booking` passam os seus (`vehicle-paths.ts`).

## Arquivos alterados

- `src/shared/api/clients.ts`, `src/lib/demo/clients.ts`, `vehicles.ts`, `admin-clients.ts` (novo), `admin-appointments.ts` (passa a importar `SEED_CLIENTS`, `SIZE_BY_TYPE` e `VEHICLE_IDS`) e `routes.ts`.
- `src/app/(admin)/admin/clients/page.tsx` (novo).
- `src/components/admin/clients/` (novos): `client-list.tsx`, `client-card.tsx`, `client-details-dialog.tsx`, `client-form-dialog.tsx`, `client-fields.tsx`, `delete-client-button.tsx`.
- `src/components/admin/vehicles/` (novos): `client-vehicle-list.tsx` e `client-vehicle-card.tsx`; `README.md` alterado.
- `src/components/shared/`: `add-vehicle-dialog.tsx`, `edit-vehicle-dialog.tsx` e `vehicle-fields.tsx` (movidos de `portal/vehicles/`, os dois primeiros com os endereços por parâmetro); `README.md` alterado.
- `src/components/portal/vehicles/`: `vehicle-paths.ts` (novo), `vehicle-card.tsx`, `vehicle-list.tsx` e `README.md`; `src/components/portal/appointments/booking-add-vehicle.tsx`.
- `docs/clientes/clientes-do-painel.md` (novo), `CONTEXT.md` e `rotas.md`.

## Testes executados

- `npm run check`: sem erros nem avisos em cada PR (414 testes) e `npx next build`.
- Nenhuma função pura de regra de negócio entrou, então não há teste novo (decisão 0052). O `admin-clients.ts` foi conferido por um teste temporário do Vitest (apagado): 13 clientes em ordem alfabética, "souza" com um resultado, "silva" sem resultado, busca por telefone com e sem a máscara, os veículos do Henrique (GG não compartilhado e G compartilhado) e a Natália sem veículos.
- Verificação local no navegador, com o banco local (`db reset`), o admin local e `next start` na porta 3060, a 360 × 800 e 1440 × 900, claro e escuro:
  - **Lista e busca:** 13 clientes, faixa "1–13 de 13", "souza" (1), "costa", "ana.souza@", telefone com e sem a máscara, "silva" no estado vazio com "Limpar filtros", que leva o foco à busca.
  - **Detalhes:** Ana Souza (dois Hatch · P), Henrique Costa (Picape · GG e SUV · G, com a indicação de compartilhado em um só) e Natália Pires ("Nenhum veículo cadastrado.").
  - **Formulários:** "Novo cliente" (rótulos, máscara, "Mostrar senha", cinco indicações de campo vazio no primeiro envio, `NOT_IMPLEMENTED` no topo com a janela aberta), "Editar dados" (e-mail só leitura, sem senha), "Excluir conta" (confirmação, "Voltar", falha dentro dela), cadastro de veículo (placa existente com "Adicionar à conta", placa nova com tipo, marca, modelo, cor e ano, sem escolha de porte) e edição de veículo (aviso só no compartilhado).
  - **Sem transbordo** nas quatro combinações de largura e tema, com a página e com a janela de detalhes aberta.
  - **Teclado, a 360 px:** Tab chega à busca, a "Novo cliente" e a cada "Ver detalhes"; o foco fica preso nas janelas; as setas mudam o tipo do veículo; Enter abre, envia e consulta a placa; Espaço mostra a senha; Esc devolve o foco ao botão de origem, inclusive na janela sobre os detalhes e na confirmação; "Limpar filtros" por Enter leva o foco à busca.
  - **Lighthouse 13.5.0 de acessibilidade:** 1,0 nas quatro combinações da página (navegação, com o cookie do admin local) e 1,0 nas 56 capturas de estado (14 estados nas quatro combinações: lista, busca sem resultado, detalhes com e sem veículos, confirmação com falha, "Novo cliente" vazio, com erros e com a falha, "Editar dados", cadastro de veículo em três passos, edição do veículo compartilhado e com a falha).
  - **Desempenho de `/admin/clients` (Lighthouse, navegação, `next start` local):** celular claro e escuro, LCP 3,2 s, CLS 0, TBT de 20 a 30 ms, desempenho 0,93; computador, LCP 0,6 s, CLS 0, desempenho 1. O LCP do celular fica acima dos 2,5 s de `frontend.md`, como nas telas anteriores.
  - **Alteração temporária de `src/lib/demo`, `match.ts` e `api-client.ts` (desfeita por `git checkout -- src`):** falha da lista, com "Tentar novamente" por Enter e duas leituras; lista vazia, e com busca; carregamento lento da lista e dos detalhes, sem transbordo; falha dos detalhes e dos veículos, cada uma com "Tentar novamente"; veículos vazios; gravação com sucesso (novo cliente fecha a janela, lê a lista de novo e devolve o foco a "Novo cliente"; "Editar dados" fecha a janela e lê os detalhes e a lista; cadastro de veículo fecha a janela e lê os veículos; exclusão fecha a confirmação e os detalhes, lê a lista e devolve o foco a "Ver detalhes"); `EMAIL_IN_USE`, `VEHICLE_ALREADY_LINKED` e `PLATE_IN_USE` no topo das janelas; `VERSION_CONFLICT` no cliente (aviso no topo, campos e detalhes com os dados atuais) e no veículo (aviso e releitura).
  - **Área do cliente e agendamento, depois da mudança dos diálogos de veículo:** `/profile` (lista, "Adicionar à minha conta", edição sem o aviso do painel, veículo compartilhado sem "Editar") e `/booking` (o diálogo de cadastro abre), com um cliente de teste criado no banco local.
- Ambiente local encerrado (`next start` parado, `npx supabase stop`, cookie apagado).
- Achado da verificação: o primeiro envio do formulário de cliente só indicava o e-mail vazio com `mode: "onTouched"` do React Hook Form; o formulário passou a validar no envio e a revalidar na alteração, e o estado de envio ficou na janela (commit `fix(clients)` no #99).

## Documentação atualizada

- Módulos: `docs/clientes/clientes-do-painel.md` (novo), `docs/clientes/CONTEXT.md` e `docs/clientes/rotas.md` (os campos das leituras e a consulta de placa com `null`).
- Lacunas resolvidas: L1 → opção 1 (detalhes em janela, módulo novo) → `clientes-do-painel.md`; L2 → opção 1 → `rotas.md`; L3 → opção 1 (seed mantido, verificado com "souza" e "silva") → nenhum arquivo além do módulo; L4 → opção 1 (mensagem de `EMAIL_IN_USE` fica para a #42) → `clientes-do-painel.md`, com a mesma observação para `VEHICLE_ALREADY_LINKED`.
- Decisões: nenhuma.
- Documentos formais a atualizar (pela #67): Arquitetura de Software, Apêndice A, com os campos das leituras de clientes e a consulta de placa de `rotas.md`; nenhuma `RN` mudou, então a Análise do Sistema não precisa de ajuste.

## Pendências

- As rotas reais (#42 e #45): cada uma tira a sua entrada de `src/lib/demo/routes.ts` e o aviso da tela; seguem os campos de `rotas.md`.
- A mensagem do catálogo para `EMAIL_IN_USE` ("Se você já tem conta, entre com ela.") e para `VEHICLE_ALREADY_LINKED` ("Este veículo já está na sua conta.") foi escrita para o portal; a #42 e a #45 decidem se o painel ganha texto próprio (UC16 FE02 pede informar que o e-mail já existe).
- O critério da issue cita "silva", que não está no seed (L3): o comentário ajustando o termo na issue é do Yvan.
- O foco depois de uma exclusão com sucesso: na demonstração o cartão continua e o foco volta ao "Ver detalhes" dele; com a rota real o cartão sai da visão e o foco cai no `body` (lacuna herdada da #61, para a #42).
- LCP do celular de `/admin/clients` em 3,2 s no Lighthouse local (limite de 2,5 s em `frontend.md`): medir na pré-visualização da Vercel.
- **Passo do Yvan:** conferir `/admin/clients` em produção, logado como administrador, depois da incorporação do #99.
