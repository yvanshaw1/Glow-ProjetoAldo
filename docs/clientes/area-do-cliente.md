---
titulo: Conteúdo da área do cliente
assunto: clientes
origem: issue #58, plano memoria/tarefas/58-telas-do-cliente/01_plano.md (L2, L6)
relacionados: [UC04, UC05, RF012, RF013, RF014, RF015, RF016, RF017, RF018, RN002, RN036]
---

# Conteúdo da área do cliente

Abas, seções e textos de `/profile`, do [UC04](UC04-atualizar-dados-da-conta.md) e do [UC05](UC05-manter-veiculos.md). Cabeçalho: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); listagem, janelas e formulários: [../padroes/componentes.md](../padroes/componentes.md).

A troca de senha grava de verdade (`POST /api/auth/change-password`); enquanto os dados da conta e os veículos usarem os dados de demonstração, o aviso fica só nessas partes ([../padroes/componentes.md](../padroes/componentes.md)).

## Página

- Título: "Minha conta".
- Aba "Dados pessoais", com as seções "Dados da conta" e "Senha".
- Aba "Meus veículos", com o aviso de demonstração no topo.

## Dados da conta (UC04)

- Título da seção: "Dados da conta".
- Campos: "Nome", "Sobrenome", "E-mail", só para leitura, com a descrição "O e-mail de acesso não pode ser alterado.", e "Celular", com a descrição "Com DDD, como (82) 99999-8888.".
- Botão "Salvar alterações" ("Salvando…"); sucesso "Dados da conta salvos.".
- Enquanto os dados carregam, o lugar dos campos fica reservado; na falha, o aviso com a mensagem e "Tentar novamente".

## Senha (UC04 FA01)

- Título da seção: "Senha"; parágrafo "Para alterar a senha, informe a senha atual."; botão "Alterar senha".
- Janela "Alterar senha", com "Senha atual", "Nova senha" (descrição "De 8 a 72 caracteres, com letra maiúscula, número e caractere especial.") e "Confirmar nova senha", e os botões "Cancelar" e "Salvar nova senha" ("Salvando…"). A senha atual errada (FE02) e as outras falhas aparecem no topo da janela, que continua aberta.
- Sucesso: a janela fecha, e a seção mostra "Senha alterada. As sessões abertas em outros aparelhos foram encerradas." (decisão 0048).

## Meus veículos (UC05)

- Botão "Cadastrar veículo" acima da lista; sem veículos, ele fica no estado vazio.
- Lista paginada, na ordem em que os veículos foram vinculados à conta ([rotas.md](rotas.md)).
- Cartão: "<marca> <modelo>", "Placa <placa> · <cor> · <ano>" e "<tipo> · Porte <porte>" ([RN002](RN002-porte-definido-pelo-tipo.md)), e o botão "Editar".
- Veículo também vinculado a outra conta (FE03, [RN036](RN036-placa-unica.md)): no lugar do botão, "Este veículo também está vinculado a outra conta. Para alterar os dados, procure a empresa." (a mensagem de `VEHICLE_SHARED`).
- Sem veículos: "Nenhum veículo cadastrado" e "Cadastre um veículo para agendar serviços.", com o botão "Cadastrar veículo".
- Enquanto a lista carrega, o lugar dos cartões fica reservado; na falha, o aviso com a mensagem e "Tentar novamente".

### Cadastro

O cadastro começa pela placa (UC05, RN036). "Continuar" consulta a placa: se ela já está cadastrada, a janela mostra o tipo, a marca, o modelo, a cor e o ano, sem edição, e o envio vincula o veículo à conta (FA01); se não, pede esses dados. "Voltar" retorna à placa sem perder o que foi digitado. É uma janela só, sem indicação de etapas, porque o formulário não é extenso (RNF002).

- Janela "Cadastrar veículo": campo "Placa" (descrição "Como ABC1D23 ou ABC-1234."), botões "Cancelar" e "Continuar" ("Consultando…").
- Depois da consulta, a placa continua visível, só para leitura.
- Placa já cadastrada (FA01): "Esta placa já está cadastrada. Confira os dados do veículo.", os dados em lista e "Adicionar à minha conta" ("Salvando…").
- Placa nova: "Tipo" (descrição "O porte é definido pelo tipo."), "Marca", "Modelo", "Cor" e "Ano", e "Cadastrar veículo" ("Salvando…").
- Nos dois casos, "Voltar" para a placa. A falha do envio aparece no topo da janela.

### Edição (UC05 FA02)

- Janela "Editar veículo": "Tipo", "Placa", "Marca", "Modelo", "Cor" e "Ano", preenchidos; botões "Cancelar" e "Salvar alterações" ("Salvando…").
- A falha aparece no topo da janela; no 409 `VERSION_CONFLICT`, a lista é lida de novo e os campos passam aos dados atuais (RNF011).

## Fora da tela

Sem requisito: foto de perfil, "Cliente desde", "Sair" (já no cabeçalho) e a exclusão da conta, que só o funcionário faz (RF074).
