---
issue: 58
pull_request: 72
---

# Relatório: Telas do cliente com dados de demonstração: conta, veículos e agendamentos

Relatório parcial: PR 1 de 3, da aba "Dados pessoais" de `/profile` (`Refs #58`). O PR 2, dos veículos (`Refs #58`), e o PR 3, dos agendamentos (`Closes #58`), vêm depois da incorporação deste e completam este relatório.

## O que foi feito

- **Página `/profile`** ("Minha conta", UC04): a aba "Dados pessoais", com duas seções.
- **Dados da conta** (UC04, RF012, RF013): os dados de demonstração de Henrique Costa, do `seed-demo.sql`, com o aviso de demonstração logo abaixo do título da seção; "Nome", "Sobrenome", "E-mail" (só leitura) e "Celular" (com a máscara); "Salvar alterações" envia `PATCH /api/me/profile`, que na demonstração mostra o aviso de `NOT_IMPLEMENTED`. Na carga, o lugar dos campos fica reservado; na falha, aparece o aviso com "Tentar novamente"; no 409 `VERSION_CONFLICT`, o formulário recarrega os dados (RNF011).
- **Senha** (UC04 FA01 e FE02, RF014): sem o aviso de demonstração, porque grava de verdade. "Alterar senha" abre a janela com "Senha atual", "Nova senha" e "Confirmar nova senha", validada pelo `changePasswordFormSchema` e enviada a `POST /api/auth/change-password` (#24). A senha atual errada mostra a mensagem no topo da janela, que continua aberta; o sucesso fecha a janela e mostra "Senha alterada. As sessões abertas em outros aparelhos foram encerradas." (decisão 0048).
- **Dados de demonstração** (decisão 0055): `ClientProfile`, `answerProfile` e as entradas `GET` e `PATCH /api/me/profile` da lista de demonstração.

## Arquivos alterados

- `src/app/(portal)/profile/page.tsx`: criado.
- `src/components/portal/clients/profile-tabs.tsx`, `account-form.tsx` e `password-section.tsx`: criados.
- `src/shared/api/clients.ts`: criado.
- `src/lib/demo/clients.ts`: criado.
- `src/lib/demo/routes.ts`: as duas entradas do perfil.
- `docs/clientes/area-do-cliente.md`: criado, com a parte da conta.
- `docs/clientes/rotas.md` e `docs/clientes/CONTEXT.md`.
- `memoria/tarefas/58-telas-do-cliente/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: aprovado, com 387 testes; o PR 1 não tem função pura nova (componentes conferidos à mão, decisão 0052).
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, com `/profile` estática.
- Local, com o Supabase local, uma conta de teste de cliente só nele e o `next start`:
  - **Conteúdo:** a aba "Dados pessoais", "Dados da conta" com o aviso logo abaixo do título e os dados de Henrique Costa, e "Senha" sem o aviso.
  - **Larguras e temas:** 360 × 800 e 1440 × 900, claro e escuro, sem transbordar.
  - **Teclado:** do "Pular para o conteúdo" ao rodapé, passando pela aba, pelos quatro campos, por "Salvar alterações" e por "Alterar senha", com o foco visível; na janela, o foco começa em "Senha atual", fica nela e volta ao botão com Esc.
  - **Envio de demonstração:** a máscara do celular na digitação e o aviso de `NOT_IMPLEMENTED` no topo do formulário, com o foco.
  - **Troca de senha real:** a senha atual errada mostra "A senha atual está incorreta."; a certa fecha a janela e mostra o sucesso; depois de sair, a senha antiga é recusada em `/login` e a nova entra.
  - **Falha da leitura** (alteração temporária dos dados de demonstração, sem commit): o aviso com "Tentar novamente", que traz os dados.
  - **Rede:** nenhuma chamada a `/api/me/*`.
  - **Lighthouse 13.5.0, acessibilidade:** 100 em `/profile`, no celular e no computador, nos temas claro e escuro.
  - **LCP no celular:** 3,1 e 3,2 s com o estrangulamento simulado e 1,9 s com o estrangulamento do DevTools; o LCP é o texto do aviso de demonstração. CLS de 0,007 no celular e 0,017 no computador.
  - **Registro do `next start`**, acumulado nas três execuções: sem cookie, token, cabeçalho de autorização, senha, chave nem e-mail.
- **Pré-visualização:** passo do desenvolvedor (veja o PR).

## Documentação atualizada

- **Módulos:**
  - `docs/clientes/area-do-cliente.md`, novo: abas, seções e textos da aba "Dados pessoais";
  - `docs/clientes/rotas.md`: os campos de `GET /api/me/profile`;
  - `docs/clientes/CONTEXT.md`: o módulo novo.
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (campos das respostas) → `clientes/rotas.md`, a parte do perfil;
  - L2 (conteúdo de `/profile`) → `area-do-cliente.md`, a parte da conta;
  - L1 dos veículos, L2 dos veículos e L6 entram no PR 2; L1 dos agendamentos, L3, L4 e L5, no PR 3.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar** (pela #67), até aqui:
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadro 4) e Apêndice A:** a resposta de `GET /api/me/profile` com `firstName`, `lastName`, `email`, `phone` e `updatedAt`.

## Pendências

- **PR 2 (veículos):** a aba "Meus veículos", com a lista, o cadastro pela placa e a edição; `formatPlate` com testes; os campos das rotas de veículos (L1); a parte dos veículos de L2 e L6.
- **PR 3 (agendamentos):** `/appointments`, com as abas, o cartão, o detalhe e o cancelamento; `formatPercent` com testes; L1 dos agendamentos, L3 e L5; e, com o OK do Yvan na conversa, a edição dos corpos da #58 e da #59 (L4).
- **Pré-visualização**, passo do Yvan: `/profile` no celular e no computador, com o Lighthouse e o LCP no PR.
