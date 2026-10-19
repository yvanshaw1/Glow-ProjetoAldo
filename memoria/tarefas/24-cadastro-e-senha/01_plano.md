---
issue: 24
titulo: "Cadastro de cliente e troca de senha pela API"
areas: [backend, testes]
tipo: funcionalidade
requisitos: [UC02, UC03, UC04, UC08, RN022, RN023, RS002, RS003, RS004, RS005, RS006, RS007, RS013]
status: concluido
aprovado_por: yvan
aprovado_em: 19/10/2026 - 14:32
---

# Plano: Cadastro de cliente e troca de senha pela API

## Objetivo

Criar pela API a conta de cliente do portal (UC02, RN022) e trocar a senha, inclusive a inicial no primeiro acesso (UC03 FA03 e FE03, UC08 FA01 e FE04, RN023, RS004): `POST /api/auth/register` e `POST /api/auth/change-password`. A conta nasce no Supabase Auth por `auth.admin.createUser`, com o e-mail confirmado (decisões 0015 e 0044), e o perfil em `clients`; se o perfil falhar, a conta recém-criada é removida (`backend.md`).

A troca de senha confere a senha atual, exige a nova no formato de RS003 e diferente da atual, grava pelo Supabase Auth e tira `must_change_password`. A mesma rota atende à alteração de senha da área do cliente (UC04 FA01 e FE02, RF014), cuja tela fica fora do escopo. Nenhuma migration: a tarefa usa as tabelas e as funções que já existem.

## Como funciona

### Cadastro (`POST /api/auth/register`)

1. Rota pública, sem guard. O corpo passa por `registerSchema`: nome e sobrenome, e-mail, celular e senha nos formatos de RN035 e RS003, com os campos não previstos descartados (RS013), inclusive `mustChangePassword`. Corpo inválido responde 400 `VALIDATION_ERROR`, com a mensagem de cada campo (UC02 FE01).
2. `createAccount` (novo `src/server/auth/accounts.ts`) chama `auth.admin.createUser` com a chave de serviço, o e-mail, a senha e `email_confirm: true`, sem `user_metadata`. `email_exists` ou `user_already_exists` responde 409 `EMAIL_IN_USE` (RN022): o Supabase Auth não aceita e-mail repetido, então isso cobre clientes, funcionários e o admin. O e-mail de um cliente excluído fica livre, porque a exclusão remove a conta do Supabase Auth, e o índice `uq_clients_email` só vale entre os não excluídos (`docs/clientes/dados.md`). Supabase Auth indisponível responde 503 `SERVICE_UNAVAILABLE`, com a linha `warn` `auth_unavailable` que o login já usa.
3. `insertClient` grava em `clients` o id da conta, o nome, o sobrenome, o e-mail e o celular normalizados. A violação de `uq_clients_email` vira `EMAIL_IN_USE` no repositório (`backend.md`, Erros).
4. Qualquer falha do passo 3 remove a conta recém-criada (`deleteAccount`, `auth.admin.deleteUser`) antes de o erro seguir para a resposta. Se a remoção também falhar, uma linha `error` `account_removal_failed` registra só o id da conta e o código do Supabase Auth, e o erro original segue.
5. Responde 201 com os dados gravados, sem iniciar sessão (L1). A rota não lê nem altera a sessão: se houver uma, ela continua.

### Troca de senha (`POST /api/auth/change-password`)

1. `requireUser({ allowPasswordChange: true })`: sessão válida e conta ativa, aceitando a senha inicial pendente (L1 da #23). Sem sessão, 401 `UNAUTHENTICATED`; funcionário desativado, 403 `ACCOUNT_INACTIVE`.
2. `changePasswordSchema`: `currentPassword` só obrigatória e com até 72 bytes, como no login (`signInPasswordSchema`); `newPassword` no formato de RS003 (`passwordSchema`) e diferente da atual (L6). Corpo inválido responde 400 sem contar tentativa.
3. `reserveLoginAttempt(email)` com o e-mail da conta (L4). E-mail bloqueado responde 429 `ACCOUNT_LOCKED` com `Retry-After`.
4. `signIn(email, currentPassword)`, a mesma função do login, no cliente de sessão (decisão 0048). Senha errada: a tentativa fica contada, e a resposta é 401 `INVALID_CURRENT_PASSWORD` (L3); a sessão do navegador não muda. Supabase Auth indisponível: a tentativa é devolvida, e a resposta é 503. Senha certa: o contador é apagado, e a sessão do navegador é trocada por uma nova, gravada nos cookies.
5. Se a entrada devolver um id diferente do da conta, o que só aconteceria com o e-mail da linha diferente do da conta no Supabase Auth, a sessão é encerrada e a resposta é 500.
6. `updatePassword(newPassword)` grava a senha pelo `updateUser` do cliente de sessão. O Supabase Auth mantém a sessão usada e encerra as outras sessões da conta (L5): as de outros aparelhos e a que o navegador tinha antes do passo 4.
7. Com `mustChangePassword`, a marca sai da linha de `clients` ou de `staff`, conforme o perfil, só se ainda estiver marcada, para o `updated_at` não mudar à toa (RNF011). A senha é gravada antes de a marca sair: se a segunda gravação falhar, a pessoa tem a senha nova e a marca continua, o lado seguro do RS004.
8. Responde 204, com os cookies da sessão renovada.

Conferido no código do Supabase Auth (`supabase/auth`, ramificação `master`):

- `UserUpdate` (`PUT /user`) confere a força da senha, recusa a senha igual à atual com `same_password` e chama `UpdatePassword(tx, sessionID)`, que encerra todas as outras sessões da conta (`LogoutAllExceptMe`). Com "secure password change" ligado, só aceita a troca por uma sessão de menos de 24 horas, ou com um código enviado por e-mail.
- `adminUserUpdate` chama `UpdatePassword(tx, nil)`, que encerra todas as sessões, inclusive a usada.
- A exigência de senha atual do próprio Supabase Auth (`UpdatePasswordRequireCurrentPassword`, campo `current_password`) é configuração do servidor do Supabase Auth, que não aparece no `supabase/config.toml` do projeto.

No `auth-js` 2.117.3 instalado, o `signInWithPassword` com senha errada devolve o erro sem apagar a sessão guardada. Só a senha certa grava a nova sessão.

### Arquivos novos e alterados de `src/`

| Arquivo | Conteúdo |
|---|---|
| `shared/validation/auth.ts` | `registerSchema` e `RegisterInput`; `changePasswordSchema` e `ChangePasswordInput` (L6) |
| `shared/api/auth.ts` | tipo `RegisteredClient`, o corpo do 201 do cadastro (L1) |
| `shared/errors/catalog.ts` | código `INVALID_CURRENT_PASSWORD` (L3) |
| `server/auth/accounts.ts` | novo: `createAccount` e `deleteAccount`, pela chave de serviço |
| `server/auth/session.ts` | `updatePassword`; `Account` ganha `email`; `isAuthUnavailable` e `logAuthUnavailable` passam a ser exportadas, para `accounts.ts` |
| `server/repositories/clients.ts` | `email` na conta; `insertClient`, com a violação de `uq_clients_email` como `EMAIL_IN_USE`; `clearClientPasswordChange` |
| `server/repositories/staff.ts` | `email` na conta; `clearStaffPasswordChange` |
| `server/services/auth.ts` | `register(input)` e `changePassword(account, input)` |
| `app/api/auth/register/route.ts` | novo, pelo `handleRoute` |
| `app/api/auth/change-password/route.ts` | novo, pelo `handleRoute` |

## Ordem da construção

1. Criar a ramificação `feat/24-register-and-change-password` a partir da `origin/main`, desfazer o vínculo com a `main` e rodar `npm ci`, como na #23.
2. Escrever o contrato das duas rotas em `docs/plataforma/openapi.yaml`, antes da implementação (`api.md`), e conferi-lo com `npx -y @redocly/cli@2.57.0 lint`.
3. Escrever os testes de `tests/validation/auth.test.ts` e conferir que falham (vermelho). Eles vão num commit próprio, antes do código.
4. Escrever os esquemas, o tipo e o código novo do catálogo em `src/shared`, até os testes passarem (verde).
5. Escrever `accounts.ts`, as mudanças de `session.ts`, os repositórios, o serviço e as duas rotas.
6. Documentação das lacunas, a decisão 0048 e os README.
7. Verificação local, com o `npm run check`, o banco local, as contas de teste e a rota temporária (seção seguinte).
8. Etapa 03: PR e `02_relatorio.md`. Não há migration para o Yvan aplicar.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado dados válidos, quando o visitante se cadastra, então recebe 201, a conta existe no Supabase Auth com o e-mail confirmado e em `clients` com nome, sobrenome, e-mail e celular normalizados (RN035), e ele consegue entrar (UC02) | Teste de `registerSchema` (normalização). Local: cadastro com "  maria  DA silva ", "  Maria@Email.COM " e "(82) 99999-8888" responde 201 com "Maria da Silva", "maria@email.com" e "82999998888", sem `Set-Cookie`. O SQL mostra `email_confirmed_at` preenchido em `auth.users` e a linha de `clients` com o mesmo id e `must_change_password` falso. O login com a senha do cadastro responde 200 com `profile` "client". Pré-visualização: cadastro de um cliente de teste e login |
| Dado um e-mail já usado por um cliente ou por um funcionário, quando tenta se cadastrar, então recebe 409 `EMAIL_IN_USE` (RN022) | Local: o mesmo e-mail, também em maiúsculas, e o e-mail de um funcionário de teste respondem 409, e o total de linhas de `auth.users` e de `clients` não muda. O e-mail de um cliente excluído (linha com `deleted_at` e conta removida do Supabase Auth pelo roteiro, como a exclusão do UC17 fará) responde 201 |
| Dado um campo inválido, quando tenta se cadastrar, então recebe 400 `VALIDATION_ERROR` com a mensagem do campo (UC02 FE01) | Testes de `registerSchema`. Local: telefone fixo e nome com número respondem 400 com as mensagens em `fields`, sem conta nova no Supabase Auth |
| Dado uma falha ao gravar em `clients`, quando o cadastro é feito, então a conta do Supabase Auth é removida (`backend.md`) | Local, com duas falhas provocadas só no banco local: (a) uma linha de `clients` não excluída com o e-mail do cadastro e sem conta no Supabase Auth faz a gravação violar `uq_clients_email`, e a resposta é 409; (b) uma restrição temporária em `clients`, que recusa um celular escolhido, faz a gravação falhar, e a resposta é 500. Nos dois casos, o SQL mostra que `auth.users` não tem o e-mail. A restrição é removida pelo `npx supabase db reset` |
| Dado a senha atual errada, quando tenta trocar a senha, então recebe 401 (`rotas.md`) | Local: 401 `INVALID_CURRENT_PASSWORD` (L3), e o `me` com os mesmos cookies continua 200. Com 5 senhas erradas, a sexta tentativa, com a senha certa, recebe 429 com `Retry-After` perto de 900, e o login desse e-mail também (L4) |
| Dado uma nova senha igual à atual ou fora do formato, quando tenta trocar, então recebe 400 (RN023, RS003) | Testes de `changePasswordSchema`. Local: as duas respondem 400 com a mensagem em `fields.newPassword`, sem contar tentativa (SQL de `login_attempts`) |
| Dado uma conta com `must_change_password`, quando troca a senha, então recebe 204, a marca sai e as rotas protegidas voltam a responder (RS004) | Local, com um cliente e um funcionário marcados: o login responde 200 com `mustChangePassword: true`, e a rota temporária com `requireUser()` responde 403 `PASSWORD_CHANGE_REQUIRED`. A troca responde 204, e, com os cookies da resposta, a rota temporária responde 200 e o `me` traz `mustChangePassword: false`. O login com a senha antiga responde 401, e com a nova, 200. Numa conta sem a marca, a troca não muda o `updated_at` da linha |

Verificação de L5, sem critério na issue: antes da troca, a mesma conta entra por um segundo arquivo de cookies, como outro aparelho, e os cookies do primeiro são copiados. Depois da troca, o `me` responde 401 com o segundo arquivo e com a cópia, e 200 com os cookies da resposta da troca.

### Como a verificação local é feita

Igual à da #23:

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Aplicação.** `npm run dev`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório. O agente não cria `.env*`. **Ponto para a sua aprovação**, como na #23: são as chaves que a CLI gera para o banco local e descartável; nenhuma chave do projeto real é tocada.
- **Contas de teste.** Um roteiro no scratchpad da sessão, fora do repositório, cria pelo `auth.admin.createUser` um cliente e um funcionário com `must_change_password`, um funcionário comum (o e-mail para o 409) e o cliente excluído. As senhas são geradas pelo roteiro e nunca exibidas. Os clientes do cadastro são criados pela própria rota.
- **Chamadas.** Um roteiro com `fetch` do Node, com os cookies num arquivo do scratchpad e o valor de cada cookie trocado por `<oculto>` na saída.
- **Rota temporária.** `src/app/api/dev-check/user/route.ts`, com `requireUser()`, só no worktree, apagada antes de qualquer commit e conferida no `git status`, como na #22 e na #23.
- **SQL.** Pelo `psql` da imagem do banco, num contêiner novo ligado à rede do `supabase_db_glow`, sem `docker exec`: contas em `auth.users`, linhas de `clients` e `staff`, `login_attempts`, a linha de conflito e a restrição temporária.
- **Supabase Auth parado** (`docker stop supabase_auth_glow`, religado logo depois): cadastro e troca de senha respondem 503, e a tentativa da troca é devolvida.
- **Registro.** Na saída do `npm run dev`, nenhuma linha traz senha, e-mail, token ou cookie (RS018); as linhas da troca trazem o `userId`.
- **Limite do Supabase Auth.** Cada troca gasta uma das 30 entradas a cada 5 minutos do banco local; os testes são espaçados.
- **`npm run check`** sem erros nem avisos, local e no CI.
- **Pré-visualização**, passo do desenvolvedor: as linhas marcadas como "Pré-visualização" na tabela acima (veja o primeiro risco).

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/shared/validation/auth.ts` | alterar: `registerSchema`, `changePasswordSchema` (L6) |
| `src/shared/api/auth.ts` | alterar: `RegisteredClient` (L1) |
| `src/shared/errors/catalog.ts` | alterar: `INVALID_CURRENT_PASSWORD` (L3) |
| `src/server/auth/accounts.ts` | criar |
| `src/server/auth/session.ts` | alterar |
| `src/server/repositories/clients.ts` | alterar |
| `src/server/repositories/staff.ts` | alterar |
| `src/server/services/auth.ts` | alterar |
| `src/app/api/auth/register/route.ts` | criar |
| `src/app/api/auth/change-password/route.ts` | criar |
| `src/app/api/auth/change-password/README.md` | alterar: o guard aceita a senha inicial pendente |
| `src/server/auth/README.md` | alterar: `accounts.ts` |
| `tests/validation/auth.test.ts` | alterar |
| `docs/plataforma/openapi.yaml` | alterar: as duas rotas, `RegisterInput`, `RegisteredClient` e `ChangePasswordInput` |
| `docs/acesso/rotas.md` | alterar (L1 a L6) |
| `docs/acesso/autenticacao.md` | alterar (L1, L4, L5) |
| `docs/acesso/dados.md` | alterar (L4) |
| `docs/acesso/UC03-autenticar-se-no-portal.md` | alterar (L2) |
| `docs/acesso/UC08-autenticar-se-no-painel-administrativo.md` | alterar (L2) |
| `docs/plataforma/mensagens-de-validacao.md` | alterar (L6) |
| `docs/plataforma/seguranca.md` | alterar: RS004 e RS006 (L4, 0048) |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: `accounts.ts` em `server/auth/` |
| `docs/padroes/api.md` | alterar: catálogo (L3) e usos do 503 |
| `docs/padroes/backend.md` | alterar: `accounts.ts` na árvore e o cadastro de conta |
| `docs/decisoes/0048-senha-atual-conferida-por-nova-entrada.md` | criar |
| `docs/decisoes/CONTEXT.md` | alterar: linha da 0048 |
| `memoria/tarefas/24-cadastro-e-senha/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |

O README de `register/` já diz "Guard: nenhum (rota pública)" e não muda. Os de `services/`, `repositories/`, `validation/` e `shared/api/` já descrevem estes arquivos.

### Em comum com outras tarefas em andamento

- Nenhum PR aberto e nenhuma ramificação da #25.
- A #25 (base do frontend) vai usar `src/shared/errors/catalog.ts` e `src/shared/api/auth.ts`, que esta tarefa só acrescenta. O `api-client` dela precisa levar ao login só o `UNAUTHENTICATED`: o `INVALID_CREDENTIALS` e o `INVALID_CURRENT_PASSWORD` também são 401 e aparecem no formulário (L3).
- A #26 vai usar as duas rotas nas telas `/register` e `/set-password` (L1, L2).

## Testes previstos

Valores esperados tirados de RN035, de `mensagens-de-validacao.md`, de RS003, de RN023 e da opção recomendada de cada lacuna.

`tests/validation/auth.test.ts`, `registerSchema` (L1)

- normalizes the client's data: "  maria  DA silva " → "Maria da Silva"; " d’ávila " → "D'Ávila"; "  Maria@Email.COM " → "maria@email.com"; "(82) 99999-8888" → "82999998888"; a senha " Senha forte 1! " fica como digitada
- requires every field: ausentes ou vazios → "Preencha este campo." em `firstName`, `lastName`, `email`, `phone` e `password`
- rejects a landline as the client's phone: "(82) 3333-4444" → "Informe um celular com DDD, como (82) 99999-8888."
- rejects a name with a digit: "Maria2" → "Use de 2 a 60 letras; espaço, hífen e apóstrofo também valem."
- rejects a password outside the RS003 rules: "senha forte 1!", sem maiúscula → "A senha deve ter de 8 a 72 caracteres, com letra maiúscula, número e caractere especial."
- discards fields not in the schema (RS013): `mustChangePassword: true`, `id` e `profile: "admin"` → ausentes

`tests/validation/auth.test.ts`, `changePasswordSchema` (L6)

- keeps both passwords as typed: " Senha atual 1! " e " Nova senha 2! ", com espaços → iguais
- accepts a current password outside the RS003 rules: "abc" → "abc", porque o 401 vem do serviço
- rejects a new password equal to the current one: "Senha forte 1!" nas duas → `newPassword`: "A nova senha precisa ser diferente da atual."
- accepts a new password that differs from the current one only in a space: "Senha forte 1!" e "Senha forte 1! " → aceitas, porque a senha não é normalizada (RN035)
- rejects a new password outside the RS003 rules: "novasenha1!" → `newPassword`: a mensagem do RS003
- reports only the format message when the new password is invalid and equal to the current one: "abc" nas duas → só `newPassword` com a mensagem do RS003
- requires both passwords: ausentes ou vazias → "Preencha este campo." em `currentPassword` e `newPassword`
- rejects a current password above 72 bytes in UTF-8 with the RS003 message: 37 "é" (74 bytes) → `currentPassword` com a mensagem do RS003, como no login
- discards fields not in the schema (RS013): `email` → ausente

O serviço, os repositórios e `accounts.ts` dependem do Supabase e ficam fora dos testes automatizados (decisão 0045). Eles são conferidos à mão, como descrito acima.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Resposta do cadastro e sessão depois dele

**Problema.** `rotas.md` diz só "**201** conta criada". Faltam três respostas:

- o corpo do 201;
- se o cadastro já abre a sessão. O UC02, passo 6, diz que o sistema "direciona o usuário para a autenticação", mas `rotas.md` e `autenticacao.md` não dizem nada;
- o que acontece se alguém com sessão aberta chamar a rota. A pré-condição do UC02 é "O visitante não está autenticado".

**Opções:**

- [X] **1. 201 com os dados gravados, sem id e sem abrir sessão (recomendada).** Exemplo: `{ "firstName": "Maria", "lastName": "da Silva", "email": "maria@email.com", "phone": "82999998888" }`, já normalizados, os mesmos campos de `GET /api/me/profile`. Sem id, porque o id vem sempre da sessão (RS009). A interface informa o sucesso e leva ao login (UC02, passo 6), podendo preencher o e-mail. A rota não lê nem altera a sessão: quem já está autenticado é levado à sua área pelo `proxy.ts` (#26), e, se chamar a API mesmo assim, a sessão dele continua.
- [ ] **2. 201 sem corpo.** É mais simples, mas a interface não vê os dados como foram gravados, por exemplo o nome com as partículas em minúsculas.
- [ ] **3. 201 com a sessão já aberta e o corpo do login (`SessionUser`).** Poupa um passo ao cliente, mas contraria o passo 6 do UC02, que precisaria mudar, e gasta mais uma entrada do limite do Supabase Auth a cada cadastro.

**Texto proposto (opção 1):**

- `docs/acesso/rotas.md`, cadastro: "Entrada: `firstName*, lastName*, email*, phone*, password*`" passa a "Entrada: `firstName*, lastName*` (nome e sobrenome de RN035), `email*` (RN035), `phone*` (celular de RN035), `password*` (RS003)".
- Mesmo trecho: "Resposta: **201** conta criada; 409 `EMAIL_IN_USE`." passa a "Resposta: **201** dados gravados, já normalizados: `firstName`, `lastName`, `email` e `phone`, sem iniciar sessão (a interface leva ao login); 409 `EMAIL_IN_USE`, também para o e-mail de um funcionário."
- `docs/acesso/autenticacao.md`, Perfis e contas, depois do primeiro parágrafo: "O cadastro pelo portal não inicia sessão nem altera a que existir. Se a gravação do perfil falhar, a conta recém-criada no Supabase Auth é removida."
- `docs/plataforma/openapi.yaml`: esquemas `RegisterInput` e `RegisteredClient`.

### L2. Senha atual no primeiro acesso

**Problema.** `rotas.md` exige `currentPassword*` na troca de senha, "inclusive no primeiro acesso", e o UC04 (FA01) pede a senha atual na alteração voluntária. Mas o UC03 (FA03) e o UC08 (FA01), passo 2, dizem só "informa a nova senha e confirma". A tela `/set-password` (#26) precisa saber se pede a senha inicial de novo.

**Opções:**

- [X] **1. A senha atual é sempre exigida; no primeiro acesso, é a senha inicial (recomendada).** A tela `/set-password` pede a senha inicial e a nova. Se a sessão do primeiro acesso ficar aberta num computador compartilhado, quem sentar depois não consegue definir a senha e tomar a conta. A rota e o esquema são os mesmos no UC03, no UC08 e no UC04.
- [ ] **2. Com a troca pendente, a senha atual é dispensada.** A tela fica mais curta, mas contraria o `currentPassword*` de `rotas.md`, e o esquema passa a depender da conta. "Diferente da inicial" só seria conferido pelo erro `same_password` do Supabase Auth, depois do envio. Quem encontrar a sessão aberta logo depois do primeiro login define a senha.

**Texto proposto (opção 1):**

- `docs/acesso/UC03-autenticar-se-no-portal.md`, FA03, passo 2: "O cliente informa a nova senha e confirma." passa a "O cliente informa a senha inicial e a nova senha e confirma."
- `docs/acesso/UC08-autenticar-se-no-painel-administrativo.md`, FA01, passo 2: "O funcionário informa a nova senha e confirma." passa a "O funcionário informa a senha inicial e a nova senha e confirma."
- `docs/acesso/rotas.md`, troca de senha: "Entrada: `currentPassword*, newPassword*`" passa a "Entrada: `currentPassword*` (a senha atual, que no primeiro acesso é a inicial; só obrigatória e com até 72 bytes, como no login), `newPassword*` (RS003, diferente da atual)".
- Documento formal a atualizar no relatório: Documentação de Análise do Sistema, Quadros 28 e 33.

### L3. Código da senha atual incorreta

**Problema.** `rotas.md` diz "401 senha atual incorreta", sem código (lacuna já anotada na #21). Os dois 401 do catálogo não servem: `UNAUTHENTICATED` diz "Sua sessão expirou", e `INVALID_CREDENTIALS` diz "E-mail ou senha incorretos", mas a tela não tem e-mail. O UC04 (FE02) pede que o sistema informe o cliente, e o `api-client` da #25 precisa distinguir esse 401 da sessão expirada.

**Opções:**

- [X] **1. Código novo `INVALID_CURRENT_PASSWORD`, 401, "A senha atual está incorreta." (recomendada).** A interface mostra a mensagem no formulário, e só o `UNAUTHENTICATED` leva ao login. O RS005 não se aplica, porque a pessoa já está autenticada e não digita o e-mail.
- [ ] **2. Reaproveitar `INVALID_CREDENTIALS`.** Não acrescenta código, mas a mensagem fala de um e-mail que a tela não pede.
- [ ] **3. 400 `VALIDATION_ERROR`, com a mensagem em `fields.currentPassword`.** A mensagem fica junto ao campo, pelo mesmo caminho dos outros erros de formulário, mas contraria `rotas.md` e o critério da issue (401).

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, tabela de erros, nova linha depois de `INVALID_CREDENTIALS`: "| 401 | `INVALID_CURRENT_PASSWORD` | A senha atual está incorreta. |".
- `docs/acesso/rotas.md`, troca de senha: "401 senha atual incorreta" passa a "401 `INVALID_CURRENT_PASSWORD`".
- `src/shared/errors/catalog.ts`: o código, com status 401 e a mensagem.

### L4. Senhas atuais erradas e o bloqueio por tentativas (RS006)

**Problema.** O RS006 limita as tentativas de login, e a troca de senha também confere uma senha no Supabase Auth, mas nenhum módulo diz se essa conferência conta. Quem tiver uma sessão roubada poderia testar senhas pela troca para tomar a conta. O limite do Supabase Auth não protege, porque conta por IP, e todas as chamadas saem do servidor.

**Opções:**

- [X] **1. O mesmo contador do login, pelo e-mail da conta (recomendada).** A conferência reserva a tentativa antes (decisão 0047), a senha certa zera o contador, e a falha do Supabase Auth devolve a tentativa. 5 senhas erradas seguidas, somando login e troca, bloqueiam as duas rotas por 15 minutos, com 429 `ACCOUNT_LOCKED` e `Retry-After`. Quem tiver uma sessão roubada testa no máximo 5 senhas a cada 15 minutos. A pessoa que errar 5 vezes espera 15 minutos para trocar a senha e para entrar em outro aparelho; a sessão atual continua.
- [ ] **2. Sem contagem, só o limite do Supabase Auth.** São 30 entradas a cada 5 minutos por IP, divididas por todos, porque as chamadas saem do servidor. Uma sessão roubada testa até 30 senhas a cada 5 minutos e esgota o limite de login de todo mundo (503).
- [ ] **3. Um contador só da troca de senha.** Não interfere no login, mas exige tabela ou coluna nova, uma migration que a issue não cita.

**Texto proposto (opção 1):**

- `docs/acesso/dados.md`, Bloqueio, novo parágrafo no fim: "A conferência da senha atual na troca de senha usa o mesmo contador, pelo e-mail da conta: conta como tentativa, a senha certa zera o contador, a falha do Supabase Auth devolve a tentativa, e o e-mail bloqueado recebe 429 `ACCOUNT_LOCKED` também na troca."
- `docs/acesso/autenticacao.md`, Sessão: "Bloqueio: 5 falhas seguidas para o mesmo e-mail bloqueiam o login por 15 minutos" passa a "Bloqueio: 5 falhas seguidas para o mesmo e-mail, no login ou na senha atual da troca de senha, bloqueiam as duas rotas por 15 minutos".
- `docs/plataforma/seguranca.md`, RS006, Implementação: "e bloqueia o login por quinze minutos após a quinta falha" passa a "e bloqueia o login e a troca de senha por quinze minutos após a quinta falha, contadas as senhas erradas das duas rotas".
- `docs/acesso/rotas.md`, troca de senha: acrescentar "429 `ACCOUNT_LOCKED`" às respostas.

### L5. Sessões depois da troca de senha

**Problema.** A documentação não diz o que acontece com a sessão deste navegador e com as de outros aparelhos depois da troca. O Supabase Auth decide parte disso, conforme o código conferido: a troca feita pela sessão do usuário encerra todas as outras sessões da conta e mantém a usada; a troca pela chave de serviço encerra todas. Manter as outras sessões não é possível pelo Supabase Auth.

**Opções:**

- [X] **1. A sessão deste navegador continua, renovada, e as dos outros aparelhos são encerradas (recomendada).** No primeiro acesso, a pessoa segue para a sua área, como diz o passo 3 do FA03 do UC03 e do FA01 do UC08. Uma sessão roubada antes da troca deixa de valer na requisição seguinte (decisão 0046).
- [ ] **2. Todas as sessões são encerradas, inclusive esta, e a pessoa entra de novo com a nova senha.** É mais rígida, mas o primeiro acesso passaria a exigir dois logins seguidos, contra o FA03 e o FA01.

**Texto proposto (opção 1):**

- `docs/acesso/autenticacao.md`, Sessão, novo item depois do logout: "A troca de senha mantém a sessão deste navegador, renovada nos cookies, e encerra as dos outros aparelhos da conta (decisão 0048)."
- `docs/acesso/rotas.md`, troca de senha: "Resposta: **204** senha alterada;" passa a "Resposta: **204** senha alterada e marca de troca pendente removida; a sessão deste navegador continua, renovada nos cookies, e as de outros aparelhos são encerradas;".

### L6. Nova senha igual à atual

**Problema.** RN023, RS004 e o FE03 do UC03 exigem a nova senha diferente da inicial, e `rotas.md` responde 400, mas `mensagens-de-validacao.md` não tem mensagem para isso. `rotas.md` também fala em "fora do tamanho mínimo", quando a regra é a de RS003.

**Opções:**

- [X] **1. Conferida no esquema compartilhado, com a mensagem em `newPassword` (recomendada).** A mensagem é "A nova senha precisa ser diferente da atual.", e a comparação é exata, sem normalização, como a senha é gravada (RN035). O formulário avisa antes de enviar, e o teste é escrito antes do código (TDD). A senha de formato inválido recebe só a mensagem do RS003.
- [ ] **2. Conferida só no servidor, pelo erro `same_password` do Supabase Auth.** O formulário só descobre depois do envio, e a regra fica fora dos testes automatizados.

**Texto proposto (opção 1):**

- `docs/plataforma/mensagens-de-validacao.md`, nova linha depois de "Senha": "| Nova senha igual à atual | A nova senha precisa ser diferente da atual. |".
- `docs/acesso/rotas.md`, troca de senha: "400 senha nova igual à atual ou fora do tamanho mínimo" passa a "400 `VALIDATION_ERROR`: nova senha igual à atual ou fora do formato de RS003".

## Decisões técnicas

- Seguidas: 0003 (rota, serviço e repositório), 0004 e 0006 (Supabase pelo `supabase-js`), 0005 e 0042 (autorização na API; dados só pela chave de serviço), 0015 e 0044 (conta criada por `auth.admin.createUser` com o e-mail confirmado, sem e-mail enviado), 0016 e 0047 (contador de tentativas, L4), 0017 (código em inglês), 0020 (tabelas separadas de contas), 0022 (cliente excluído fora das seleções), 0025 (Problem Details), 0026 (API sem versão), 0033 (merge), 0035 (testes antes do código), 0036 (`import 'server-only'`), 0045 (testes dos esquemas) e 0046 (sessão conferida no Supabase Auth).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| A troca de senha confere a senha atual com uma nova entrada no Supabase Auth (`signInWithPassword`) pelo cliente de sessão. A entrada troca a sessão do navegador por uma nova, e a nova senha é gravada por essa sessão (`updateUser`); o Supabase Auth então encerra as outras sessões da conta | Função SQL que compara a senha com `auth.users.encrypted_password` por `crypt()`; exigência de senha atual do próprio Supabase Auth (`current_password`); entrada num cliente à parte, sem cookies, e gravação pela sessão antiga; gravação pela chave de serviço (`auth.admin.updateUserById`) | Usa o mesmo `signIn` do login e o mesmo contador (L4). A senha não passa pelo banco nem pelos registros dele (RS002, RS018). A função SQL dependeria das tabelas internas do Supabase Auth e de uma migration. A exigência de senha atual é configuração do servidor do Supabase Auth, ausente do `config.toml`, e precisaria do painel (0044). O cliente à parte deixaria uma sessão a mais para encerrar em cada caminho de falha, e a sessão antiga pode ter mais de 24 horas, idade que o Supabase Auth recusa para trocar a senha quando "secure password change" está ligado. A chave de serviço encerra todas as sessões, inclusive esta (L5, opção 2). Consequências: cada troca gasta uma das 30 entradas a cada 5 minutos por IP; a sessão do navegador é renovada, o que também descarta uma cópia dela feita antes da troca | nova (0048) |

Texto da decisão (gravado na etapa 03):

- `docs/decisoes/0048-senha-atual-conferida-por-nova-entrada.md`: `titulo` "Senha atual conferida por nova entrada no Supabase Auth, que renova a sessão do navegador", `relacionados: [RN023, RS002, RS004, RS006, RS007, 0044, 0046, 0047]`, com a decisão, as alternativas e a justificativa da tabela.
- `docs/decisoes/CONTEXT.md`: a linha nova.
- `docs/plataforma/seguranca.md`, RS004, Implementação: "A coluna `must_change_password` bloqueia as demais rotas até a troca, e a nova senha deve ser diferente da inicial." passa a "A coluna `must_change_password` bloqueia as demais rotas até a troca, e a nova senha deve ser diferente da inicial. A troca confere a senha atual por uma nova entrada no Supabase Auth, que renova a sessão do navegador e encerra as dos outros aparelhos (decisão 0048)."

Outras mudanças de documentação, que só aplicam regras existentes às rotas novas:

- `docs/padroes/api.md`, parágrafo do 503: "no login, no logout e na conferência da sessão" passa a "no login, no logout, na conferência da sessão, no cadastro e na troca de senha".
- `docs/padroes/backend.md`, árvore: "auth/ session.ts (sessão e perfil), guards.ts (...), login-attempts.ts" ganha "accounts.ts (criação e remoção de contas no Supabase Auth)". Gravações e consultas, item do cadastro de conta: acrescentar "a violação de `uq_clients_email` na gravação do perfil vira `EMAIL_IN_USE`, depois de removida a conta; se a remoção falhar, o id da conta vai ao registro numa linha `error`".
- `docs/plataforma/estrutura-de-pastas.md`: "session.ts · guards.ts · login-attempts.ts" passa a "session.ts · guards.ts · login-attempts.ts · accounts.ts".
- `src/server/auth/README.md`: `accounts.ts` na descrição e em "Vai aqui" ("criação e remoção de contas no Supabase Auth").
- `src/app/api/auth/change-password/README.md`: "Guard: `requireUser`." passa a "Guard: `requireUser`, aceitando a senha inicial pendente."
- `docs/plataforma/openapi.yaml`: descrição da tag `auth` com cadastro e troca de senha.

Escolhas locais, sem registro:

- `Account` ganha `email`, lido da linha de `clients` ou de `staff`, a cópia do e-mail da conta (`docs/clientes/dados.md`). Assim a troca não faz outra chamada ao Supabase Auth. A conferência do id depois da entrada (passo 5 da troca) protege contra uma cópia diferente.
- `createAccount` e `deleteAccount` ficam em `src/server/auth/accounts.ts`, porque o UC16 e o UC19 vão usá-las; `isAuthUnavailable` e `logAuthUnavailable` passam a ser exportadas por `session.ts`, no segundo uso.
- `email_exists` e `user_already_exists` viram `EMAIL_IN_USE`, como no `create-admin.mjs`.
- Nada vai para o `user_metadata` do Supabase Auth: nome e celular ficam só em `clients`, sem cópia de dado pessoal.
- Nenhum evento `info` novo: a linha da requisição já registra rota, status e, na troca, o `userId`, e `backend.md` não lista cadastro nem troca de senha entre os eventos de negócio.

## Riscos e dúvidas

- **Conta de teste na produção.** A pré-visualização usa o mesmo projeto do Supabase da produção, então o cadastro de teste cria um cliente real, que fica até a exclusão do UC17 existir. **Ponto para a sua aprovação:** usar um e-mail de teste seu e mantê-lo como conta de teste, ou removê-lo depois pelo SQL. A troca de senha é testada nessa mesma conta, sem tocar no admin.
- **Limite de entradas do Supabase Auth.** Cada troca de senha gasta uma das 30 entradas a cada 5 minutos por IP, as mesmas do login (risco já anotado na #23). O cadastro usa a API de administração, que não entra nesse limite.
- **Cadastro sem limite.** Nada impede alguém de criar contas em série. Fica fora desta tarefa; se for preciso, vira uma issue.
- **E-mail em uso.** O 409 mostra que o e-mail tem conta, o que o RN022 e o FE02 do UC02 pedem. A mensagem do catálogo não confirma de quem é a conta.
- **Conta sem perfil.** Se a gravação do perfil e a remoção da conta falharem juntas, a conta fica no Supabase Auth sem perfil: um novo cadastro com o e-mail recebe 409, e o login recebe 401 com a linha `warn` da #23. O id vai ao registro, para ser removida à mão.
- **Falha entre as duas gravações da troca.** Se a senha for gravada e a remoção da marca falhar, a resposta é 500. A pessoa tenta de novo e precisa informar a senha nova como atual.
- **E-mail copiado.** As tarefas que mudarem o e-mail de uma conta (UC17 e UC20, se mudarem) precisam manter iguais o e-mail do Supabase Auth e o da linha, ou a troca de senha responde 500 (passo 5).
- **Serviço sem teste automatizado.** Cadastro, remoção e troca dependem do Supabase e são conferidos à mão (decisão 0045).

## Fora do escopo

- Telas `/register` e `/set-password` (#26) e a alteração de senha na área do cliente (UC04, tela das tarefas de clientes).
- Cadastro de cliente e de funcionário pelo painel (UC16 e UC19), que vão reutilizar `createAccount` e `deleteAccount`.
- Limite de cadastros e limpeza de contas sem perfil.
- `api-client` e o tratamento dos 401 na interface (#25).

## Acréscimo de escopo (achado na verificação local, 19/10/2026)

### L7. Detalhe do erro do banco no registro (RS018)

**Problema.** Na verificação local, a falha provocada na gravação de `clients` (restrição temporária, critério 4) respondeu 500 como previsto, mas a linha `error` do registro trouxe a linha recusada, com o nome, o e-mail e o celular do corpo do cadastro:

```
"error":{"name":null,"message":"{ code: '23514', details: 'Failing row contains (<id>, Falha, Perfil, <e-mail>, <celular>, ...)', hint: null, message: 'new row for relation \"clients\" violates check constraint ...' }","stack":null}
```

O RS018 e `backend.md` proíbem registrar o corpo das rotas de autenticação. A causa está no tratamento único da #22: o erro do PostgREST não é um `Error`, e o `describeError` de `src/server/http/handler.ts` o registra inteiro com `inspect`, inclusive o campo `details`. O mesmo vale para qualquer repositório que relança o erro do `supabase-js` (a violação de unicidade traz "Key (email)=(...) already exists" no `details`). Corrigir exige alterar dois arquivos fora do plano.

**Opções:**

- [X] **1. O tratamento único registra só o código e a mensagem do erro que não é `Error` (recomendada).** O `describeError` passa a gravar `code` e `message` desses erros, sem `details` e sem `hint`; o `Error` continua com nome, mensagem e rastro. A correção vale para todas as rotas, e um teste do tratamento único a protege. A mensagem do PostgreSQL nomeia a restrição e a tabela, o que basta para investigar pelo `requestId`.
- [ ] **2. Só o repositório de `clients` troca o erro do `insert` por um `Error` com o código e a mensagem.** Resolve o caso desta tarefa, mas os outros repositórios, inclusive os da #23, continuam registrando o `details`.
- [ ] **3. Nada muda nesta tarefa, e o defeito vira uma issue.** O cadastro fica publicado com o defeito até a correção.

**Texto proposto (opção 1):**

- `docs/padroes/backend.md`, Registro, depois de "Nunca registrar senha, token, cookie, cabeçalho de autorização nem o corpo das rotas de autenticação (RS018).": "Do erro do banco, que não é `Error`, o registro guarda só o código e a mensagem: o detalhe pode citar a linha recusada, com dados do corpo."

**Arquivos a mais:**

| Arquivo | Ação |
|---|---|
| `src/server/http/handler.ts` | alterar: `describeError` |
| `tests/http/handler.test.ts` | alterar: dois casos, abaixo |
| `docs/padroes/backend.md` | alterar (já está na lista): Registro |

**Testes a mais**, em `tests/http/handler.test.ts`, escritos antes da correção:

- logs only the code and the message of an error that is not an Error: o erro `{ code: "23514", message: "new row for relation \"clients\" violates check constraint", details: "Failing row contains (...)", hint: null }` → linha `error` com `code` e `message`, sem `details`
- never logs ... of an auth route, novo caso "when a database error of a 500 quotes the refused row": o `details` com o e-mail de teste → o e-mail não aparece no registro

### Estado da construção

Feito dentro do plano aprovado, na ramificação `feat/24-register-and-change-password` (commits 036b789 a 7ce1473): contrato OpenAPI, testes, `src/shared`, servidor, rotas, documentação e decisão 0048. `npm run check` aprovado, com 168 testes.

Verificação local, com o Supabase local: cadastro (19 conferências), troca de senha (29), bloqueio (6) e Supabase Auth parado (6), todas aprovadas, exceto uma conferência do cadastro que falhou por erro do roteiro (o booleano convertido em texto é `true`, não `t`); a consulta direta mostrou todas as contas com o e-mail confirmado. O registro não trouxe senha, token, cookie nem e-mail, exceto na linha do L7. A rota temporária foi apagada.

Nada mais é construído até a nova aprovação; o PR não foi aberto.
