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

## Dados da conta (UC04)

- Título da seção: "Dados da conta".
- Campos: "Nome", "Sobrenome", "E-mail", só para leitura, com a descrição "O e-mail de acesso não pode ser alterado.", e "Celular", com a descrição "Com DDD, como (82) 99999-8888.".
- Botão "Salvar alterações" ("Salvando…"); sucesso "Dados da conta salvos.".
- Enquanto os dados carregam, o lugar dos campos fica reservado; na falha, o aviso com a mensagem e "Tentar novamente".

## Senha (UC04 FA01)

- Título da seção: "Senha"; parágrafo "Para alterar a senha, informe a senha atual."; botão "Alterar senha".
- Janela "Alterar senha", com "Senha atual", "Nova senha" (descrição "De 8 a 72 caracteres, com letra maiúscula, número e caractere especial.") e "Confirmar nova senha", e os botões "Cancelar" e "Salvar nova senha" ("Salvando…"). A senha atual errada (FE02) e as outras falhas aparecem no topo da janela, que continua aberta.
- Sucesso: a janela fecha, e a seção mostra "Senha alterada. As sessões abertas em outros aparelhos foram encerradas." (decisão 0048).

## Fora da tela

Sem requisito: foto de perfil, "Cliente desde", "Sair" (já no cabeçalho) e a exclusão da conta, que só o funcionário faz (RF074).
