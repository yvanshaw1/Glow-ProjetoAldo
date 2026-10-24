---
titulo: Conteúdo da página de clientes do painel
assunto: clientes
origem: issue #64, plano memoria/tarefas/64-clientes-e-veiculos/01_plano.md (L1, L3, L4)
relacionados: [UC16, UC17, UC18, RF016, RF069, RF070, RF071, RF072, RF073, RF074, RF075, RF076, RN002, RN022, RN023, RN030, RN035, RN036, RNF002, RNF008, RNF011]
---

# Conteúdo da página de clientes do painel

Lista, detalhes, janelas, confirmações e estados de `/admin/clients`, do [UC16](UC16-cadastrar-cliente.md), do [UC17](UC17-manter-cliente.md) e do [UC18](UC18-manter-veiculos-do-cliente.md). Cabeçalho e navegação: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); listagem, diálogos, campo de senha e telas de demonstração: [../padroes/componentes.md](../padroes/componentes.md); contrato das rotas: [rotas.md](rotas.md); cadastro e edição de veículo do cliente: [area-do-cliente.md](area-do-cliente.md).

Enquanto as rotas `/api/admin/clients` e `/api/admin/vehicles` usarem os dados de demonstração de `src/lib/demo/admin-clients.ts` (decisão 0055), o aviso de demonstração fica logo abaixo do título da página.

## Página

- Título: "Clientes". Abaixo dele, o aviso de demonstração, a busca e o botão "Novo cliente" (ao lado da busca a partir de 768 px, e abaixo dela no celular) e a lista. Os detalhes são uma janela da própria página: `rotas.md` não tem subrota.
- O acesso à página é da permissão `clients` ([RN025](../equipe/RN025-permissoes.md)).

## Lista (UC17 passos 2 a 4, RF069, RF070)

- Busca "Buscar por nome, e-mail ou telefone": vale 300 ms depois da última tecla e volta à primeira página. O telefone vale com ou sem a máscara.
- "Limpar filtros" aparece quando há busca, volta à lista completa e leva o foco à busca.
- Ordem alfabética pelo nome completo; o cliente excluído nunca aparece ([RN030](../plataforma/RN030-exclusao-logica.md)).
- 20 por página, com a faixa "1–13 de 13" ([RNF008](../plataforma/requisitos.md)).
- A linha tem o nome completo, o e-mail, o telefone com máscara e o botão "Ver detalhes", com o nome do cliente para o leitor de tela. Uma coluna no celular e duas a partir de 1280 px.

## Estados

- Carregamento: esqueleto de linhas.
- Vazio sem busca: "Nenhum cliente cadastrado" e "Cadastre um cliente para ele aparecer aqui.".
- Vazio com busca (UC17 FE01): "Nenhum cliente encontrado" e "Não há clientes para o critério informado.".
- Falha: o aviso com a mensagem e "Tentar novamente". A falha de uma ação aparece no topo da janela ou da confirmação.

## Detalhes (UC17 passo 5, RF072)

- Janela "Detalhes do cliente", que lê o cliente e os veículos ao abrir: nome completo, e-mail e telefone.
- Seção "Veículos", com um cartão por veículo: "<marca> <modelo>", "Placa <placa> · <cor> · <ano>", "<tipo> · Porte <porte>" ([RN002](RN002-porte-definido-pelo-tipo.md)), a indicação "Também vinculado a outra conta" quando é o caso ([RN036](RN036-placa-unica.md)) e o botão "Editar". Sem veículos: "Nenhum veículo cadastrado".
- Botões "Editar dados", "Cadastrar veículo" e "Excluir conta".
- Enquanto carrega, o lugar fica reservado; na falha, o aviso com "Tentar novamente".

## Novo cliente (UC16, RF071, RN022, RN023)

- Janela "Novo cliente" com "E-mail", "Nome", "Sobrenome", "Celular" (descrição "Com DDD, como (82) 99999-8888.") e "Senha inicial" (descrição "De 8 a 72 caracteres, com letra maiúscula, número e caractere especial. O cliente troca a senha no primeiro acesso.", com o botão de mostrar), sem confirmação da senha.
- Botões "Cancelar" e "Cadastrar cliente" ("Cadastrando…"). É uma janela só, sem etapas ([RNF002](../plataforma/requisitos.md)). A falha aparece no topo da janela.
- `EMAIL_IN_USE` (FE02) aparece no topo da janela com a mensagem do catálogo de erros; a rota (#42) define se o painel usa um texto próprio.

## Editar dados (UC17 passos 6 e 7, RF073)

- Janela "Editar cliente" com "Nome", "Sobrenome" e "Celular" preenchidos e o "E-mail" só para leitura, com a descrição "O e-mail de acesso não pode ser alterado.". Botões "Cancelar" e "Salvar alterações" ("Salvando…").
- No 409 `VERSION_CONFLICT`, o aviso fica no topo e os dados são lidos de novo ([RNF011](../plataforma/requisitos.md)).

## Excluir conta (UC17 FA01, RF074, RN030)

- Confirmação "Excluir esta conta?", "A conta deixa de ser exibida e perde o acesso ao sistema. Os veículos e os agendamentos do cliente são preservados.", botões "Voltar" e "Excluir conta" ("Excluindo…"), na cor de erro.
- Com sucesso, a confirmação e os detalhes fecham, e a lista é lida de novo.

## Veículos do cliente (UC18, RF016, RF075, RF076)

- **Cadastrar veículo.** Janela "Cadastrar veículo" como a do portal ([area-do-cliente.md](area-do-cliente.md), Cadastro), com "Adicionar à conta" no lugar de "Adicionar à minha conta"; a consulta é `GET /api/admin/vehicles/lookup`, e o envio, `POST /api/admin/clients/:id/vehicles`. Placa já entre os veículos do cliente (FE02): o aviso é o de `VEHICLE_ALREADY_LINKED`.
- **Editar veículo.** Janela "Editar veículo" como a do portal, sem a trava do veículo compartilhado: no que está em mais de uma conta, o aviso "As alterações valem para todas as contas vinculadas a este veículo." fica no topo do formulário. O envio é `PATCH /api/admin/vehicles/:id`; `PLATE_IN_USE` (FE03) e `VERSION_CONFLICT` aparecem no topo da janela.

## Fora da tela

Sem requisito: remover o vínculo de um veículo, trocar a senha do cliente pelo painel, mostrar a troca de senha pendente e as contagens de agendamentos do cliente.
