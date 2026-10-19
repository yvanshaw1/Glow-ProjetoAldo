---
issue: 24
pull_request: <número>
---

# Relatório: Cadastro de cliente e troca de senha pela API

## O que foi feito

- `POST /api/auth/register`: cria a conta no Supabase Auth por `auth.admin.createUser`, com o e-mail confirmado, e o cliente em `clients`, com os dados normalizados (UC02, RN022, RN035). Se a gravação do cliente falhar, a conta recém-criada é removida. Responde 201 com os dados gravados, sem abrir sessão; o e-mail já usado por cliente ou funcionário recebe 409 `EMAIL_IN_USE`.
- `POST /api/auth/change-password`: confere a senha atual, inclusive a inicial, por uma nova entrada no Supabase Auth, com o mesmo bloqueio do login (RS006). Grava a nova senha pela sessão do navegador e tira `must_change_password` (UC03 FA03, UC04 FA01, UC08 FA01, RN023, RS004, decisão 0048). A sessão do navegador continua, renovada, e as de outros aparelhos são encerradas.
- Código novo `INVALID_CURRENT_PASSWORD` (401) no catálogo de erros.
- `registerSchema` e `changePasswordSchema` em `src/shared/validation/auth.ts`, com a nova senha diferente da atual.
- Tratamento único: do erro que não é `Error`, como o do banco, o registro guarda só o código e a mensagem (L7, RS018).
- `docs/plataforma/openapi.yaml` com as duas rotas.

## Arquivos alterados

- `src/app/api/auth/register/route.ts` e `change-password/route.ts`: criados.
- `src/server/auth/accounts.ts`: criado, com `createAccount` e `deleteAccount`.
- `src/server/auth/session.ts`: `updatePassword`; `Account` com `email`; `isAuthUnavailable` e `logAuthUnavailable` exportadas.
- `src/server/services/auth.ts`: `register` e `changePassword`; `checkPassword` extraída do login, sem mudar o comportamento dele.
- `src/server/repositories/clients.ts`: `email` na conta, `insertClient` e `clearClientPasswordChange`.
- `src/server/repositories/staff.ts`: `email` na conta e `clearStaffPasswordChange`.
- `src/server/http/handler.ts`: `describeError` sem o `details` dos erros do banco.
- `src/shared/validation/auth.ts`, `src/shared/api/auth.ts` (`RegisteredClient`) e `src/shared/errors/catalog.ts`.
- `tests/validation/auth.test.ts` e `tests/http/handler.test.ts`: casos novos.
- README de `src/server/auth/` e de `src/app/api/auth/change-password/`.

## Testes executados

- `npm run check`: aprovado, com 170 testes (17 novos). Os testes ficaram em commits anteriores ao código (a86005b e 0a865da) e falharam antes dele: 15 e 2 falhas.
- `npx -y @redocly/cli@2.57.0 lint docs/plataforma/openapi.yaml`: válido, com o aviso antigo de `info` sem `license`.
- `npx next build`: concluído, com as cinco rotas da API e a página `/`.
- Local, com o `next dev` ligado ao Supabase local e contas de teste criadas por roteiro no scratchpad:
  - Cadastro (19 conferências): 201 com "Maria da Silva", "D'Ávila", e-mail em minúsculas e celular só com os algarismos; conta com o e-mail confirmado e linha de `clients` com o mesmo id; login em seguida; 409 para o mesmo e-mail em maiúsculas e para o e-mail de um funcionário, sem conta nova; 201 para o e-mail de um cliente excluído; 400 com as mensagens dos campos; conta removida depois da violação de `uq_clients_email` (409) e de uma restrição temporária (500); sessão aberta intocada; 403 sem `Origin`. Uma conferência falhou por erro do roteiro (comparou o booleano convertido em texto com `t`); a consulta direta mostrou todas as contas com o e-mail confirmado.
  - Troca de senha (29): cliente com senha pendente recebe 403 `PASSWORD_CHANGE_REQUIRED` na rota temporária com `requireUser()`; senha atual errada recebe 401 `INVALID_CURRENT_PASSWORD`, conta como tentativa e mantém a sessão; nova igual à atual e fora do RS003 recebem 400 sem contar; a troca responde 204 com os cookies renovados, zera o contador, tira a marca e libera a rota temporária; outro aparelho e a cópia dos cookies antigos recebem 401; a senha antiga deixa de entrar e a nova entra; o mesmo para um funcionário; sem a marca, o `updated_at` não muda; sem sessão, 401 `UNAUTHENTICATED`.
  - Bloqueio (6): 5 senhas atuais erradas recebem 401, a sexta tentativa, com a senha certa, recebe 429 com `Retry-After: 900`, o login do mesmo e-mail também, e a sessão continua.
  - Supabase Auth parado (6): cadastro e troca de senha respondem 503, sem conta, linha ou tentativa contada.
  - Registro: nenhuma senha, token, cookie ou e-mail, depois da correção do L7 (conferido de novo com a falha provocada); `userId` nas linhas da troca de senha. A rota temporária foi apagada antes do commit.
- Pré-visualização: passo do desenvolvedor (veja o PR).

## Documentação atualizada

- Módulos: `docs/acesso/rotas.md`, `autenticacao.md`, `dados.md`, `UC03-autenticar-se-no-portal.md` e `UC08-autenticar-se-no-painel-administrativo.md`; `docs/plataforma/openapi.yaml`, `mensagens-de-validacao.md`, `seguranca.md` e `estrutura-de-pastas.md`; `docs/padroes/api.md` e `backend.md`.
- Lacunas resolvidas (opção 1 em todas):
  - L1 (resposta do cadastro e sessão) → `rotas.md`, `autenticacao.md` e `openapi.yaml`;
  - L2 (senha atual no primeiro acesso) → UC03, UC08 e `rotas.md`;
  - L3 (código da senha atual incorreta) → `api.md`, `rotas.md` e o catálogo;
  - L4 (bloqueio na troca de senha) → `dados.md`, `autenticacao.md`, `seguranca.md` e `rotas.md`;
  - L5 (sessões depois da troca) → `autenticacao.md` e `rotas.md`;
  - L6 (nova senha igual à atual) → `mensagens-de-validacao.md` e `rotas.md`;
  - L7 (detalhe do erro do banco no registro, achado na verificação) → `backend.md`.
- Decisões: 0048 criada.
- Documentos formais a atualizar:
  - **Documentação de Análise do Sistema, seção 10.2 (Quadros 28 e 33):** no FA03 do UC03 e no FA01 do UC08, passo 2, a pessoa informa a senha inicial e a nova senha.
  - **Documentação de Arquitetura de Software, seção 9 (Quadro 38):** decisão 0048 (senha atual conferida por nova entrada no Supabase Auth, que renova a sessão do navegador).
  - **Documentação de Arquitetura de Software, seções 3.2 e 5.2 (Quadros 5 e 28):** cadastro sem sessão e com a conta removida se o perfil falhar; troca de senha que mantém a sessão do navegador e encerra as dos outros aparelhos; bloqueio de 15 minutos somando login e troca de senha.
  - **Documentação de Arquitetura de Software, Apêndice A:** entrada e resposta 201 do cadastro; entrada e respostas da troca de senha (204, 400, 401 `INVALID_CURRENT_PASSWORD` e 429).
  - **Documentação de Arquitetura de Software, seção 6:** código `INVALID_CURRENT_PASSWORD` no catálogo; o 503 também no cadastro e na troca de senha.
  - **Documentação de Arquitetura de Software, seções 4 e 6.4:** `accounts.ts` em `src/server/auth/`; do erro do banco, o registro guarda só o código e a mensagem.
  - **Documentação de Arquitetura de Software, seção 7 (Quadro 35):** implementação de RS004 (conferência da senha atual e sessões) e de RS006 (bloqueio também na troca de senha).

## Pendências

- **Pré-visualização.** O cadastro de teste cria um cliente na base da produção, que fica até a exclusão do UC17 existir, ou até ser removido pelo SQL. Não há migration a aplicar.
- **Primeiro acesso na pré-visualização.** Nenhuma conta com a senha pendente existe na produção até o UC16 e o UC19; o fluxo foi conferido só no banco local.
- **Devolução da tentativa na troca de senha.** Com o Supabase Auth parado, a troca responde 503 já no guard, antes da reserva. A devolução usa o mesmo `checkPassword` do login, conferido na #23.
- **Para a #25:** o `api-client` leva ao login só o 401 `UNAUTHENTICATED`; o `INVALID_CREDENTIALS` e o `INVALID_CURRENT_PASSWORD` aparecem no formulário.
- **Para a #26:** a tela `/set-password` pede a senha inicial e a nova (L2).
- **`next dev` nesta máquina.** A página `/` respondeu 500 no `next dev` porque o Turbopack não conseguiu criar o processo Node do PostCSS (código 0xc0000142 do Windows). O `next build` compila a página sem erro, e esta tarefa não mexe em páginas nem em CSS.
- **Cadastro sem limite e contas sem perfil:** sem limite de cadastros e sem limpeza das contas que sobrarem sem perfil; se for preciso, viram issues.
