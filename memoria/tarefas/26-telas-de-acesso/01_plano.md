---
issue: 26
titulo: "Telas de acesso e proteção das páginas: /register, /login, /set-password e src/proxy.ts"
areas: [frontend, backend, testes]
tipo: funcionalidade
requisitos: [UC02, UC03, UC08, RF007, RF008, RF010, RF011, RF033, RF035, RF038, RN001, RN023, RN025, RN026, RN027, RN029, RS001, RS003, RS004, RS005, RS008, RS010, RS011, RNF001, RNF003, RNF004, RNF005]
status: concluido
aprovado_por: yvan
aprovado_em: 20/10/2026
---

# Plano: Telas de acesso e proteção das páginas: /register, /login, /set-password e src/proxy.ts

## Objetivo

Criar as três telas de acesso, ligadas às rotas da #23 e da #24, com React Hook Form e os esquemas de `src/shared/validation` (decisões 0027 e 0049):

- `/register`, o cadastro de cliente (UC02, RF007);
- `/login`, o login único de clientes e funcionários (UC03, UC08, RF008, RF033, RN029, decisão 0019);
- `/set-password`, a troca da senha inicial no primeiro acesso (UC03 FA03, UC08 FA01, RF011, RF038, RN023, RS004).

Criar também `src/proxy.ts` (decisão 0032), que aplica a tabela "Proteção das páginas" de `autenticacao.md` (RF010, RN001, RN025, RS001, RS004, RS010) e leva cada pessoa ao destino certo depois do login e da troca de senha.

Nenhuma rota da API muda, e não há migration. A navegação só orienta; quem decide o acesso aos dados continua sendo a API (RS008, decisão 0005).

## Base da construção

- A #26 depende da #25, que está no PR yvanshaw1/Glow-ProjetoAldo#33, aberto e aguardando revisão. A ramificação `feat/26-access-screens` sai da `origin/main` depois da incorporação do #33.
- Se o #33 ainda não estiver na `main` quando o plano for aprovado, a ramificação sai de `origin/feat/25-frontend-base`. Depois do squash do #33, a `main` é incorporada nela por merge (decisão 0033). O PR da #26 só é aberto depois disso, contra a `main`, com o diff só desta tarefa.

Contratos da #25 usados sem mudança:

- `apiRequest` e `ApiError` (`src/lib/api-client.ts`):
  - só o 401 `UNAUTHENTICATED` leva a `/login?next=<página>`;
  - os outros 401 voltam ao formulário;
  - o 403 `PASSWORD_CHANGE_REQUIRED` leva a `/set-password`.
- `useSession()`, com `status`, `user`, `signIn(user)`, `signOut(destino)` e `reload()`.
- `PERMISSION_PAGES` e `PERMISSIONS`, em `src/shared/constants/permissions.ts`.
- `Field`, `FieldLabel`, `FieldDescription` e `FieldError` com o `Controller` e o `zodResolver`, e o `Alert` no topo do formulário para o `detail` (`frontend.md`).
- O layout do portal, que já cobre `/login`, `/register` e `/set-password` (`layouts.md`).

## Como funciona

### Proteção das páginas (`src/proxy.ts`)

Desenho da decisão nova 0051 e das lacunas L1 a L4.

1. **Onde roda.** O `matcher` cobre `/login`, `/register`, `/set-password`, `/profile/:path*`, `/booking/:path*`, `/appointments/:path*` e `/admin/:path*` (que inclui `/admin`). A página inicial, o catálogo, a API e os arquivos estáticos ficam de fora, então as páginas públicas não esperam o Supabase (RNF006). O `matcher` precisa ser literal, porque o Next.js o lê na compilação; um comentário liga a lista às páginas de `page-access.ts`.
2. **Conta.** O proxy usa as mesmas funções dos guards:
   - `getSessionUserId()` confere a sessão com `getUser()` e renova o token vencido (decisão 0046);
   - `loadAccount(id)` lê perfil, situação, troca pendente e permissões do banco (RS011).

   Sem cookie de sessão, o `getUser()` responde sem ir à rede, então o visitante não custa nada. No protótipo descartável (Next.js 16.4.1), o `cookies()` de `next/headers` gravou o `Set-Cookie` na resposta do proxy, também no redirecionamento: os cookies renovados chegam ao navegador sem mudar `session.ts`.
3. **Decisão.** `decidePageAccess(endereço, conta)`, uma função pura em `src/server/auth/page-access.ts`, recebe o caminho e a consulta pedidos e devolve o destino do redirecionamento, ou `null` para mostrar a página. A tabela vem a seguir.
4. **Resposta.** Redirecionamento 307 para o destino, ou a página pedida. Toda resposta do proxy leva `Cache-Control: private, no-store`, porque depende da sessão e pode levar cookies renovados. No protótipo, o cabeçalho do proxy valeu também sobre uma página estática, no lugar do `s-maxage=31536000` do Next.js.
5. **Falha.** Se o Supabase Auth ou o banco falhar, o proxy deixa a página seguir, sem redirecionar:
   - o Supabase Auth indisponível já gera a linha `warn` `auth_unavailable`;
   - outra falha gera uma linha `error`, só com o código e a mensagem.

   A página carrega, e as chamadas dela à API, que continuam protegidas, mostram o erro.

**Estado da conta**, para o proxy:

- **visitante:** sem sessão, sem perfil ou desativada (RN026);
- **troca pendente:** `mustChangePassword`;
- **cliente**, **funcionário** ou **admin**, com as permissões.

**Destino** (L1 a L4):

| Estado | `/login` e `/register` | `/set-password` | Página do cliente (`/profile`, `/booking`, `/appointments`) | Página do painel (`/admin*`) |
|---|---|---|---|---|
| Visitante | a tela | `/login`, com o `next` válido | `/login?next=<página pedida>` | `/login?next=<página pedida>` |
| Troca pendente | `/set-password`, com o `next` válido | a tela | `/set-password?next=<página pedida>` | `/set-password?next=<página pedida>` |
| Cliente | o `next`, se permitido; senão `/` | igual a `/login` | a página | `/` com o aviso |
| Funcionário ou admin | o `next`, se permitido; senão a primeira página permitida | igual a `/login` | a primeira página permitida, com o aviso | com a permissão, a página; sem ela, a primeira permitida, com o aviso |
| Funcionário sem nenhuma permissão | o `next`, se permitido; senão `/` com o aviso | igual a `/login` | `/` com o aviso | `/` com o aviso |

- **Permissão de cada página do painel:** `/admin` pede `dashboard`; `/admin/<página>` pede a permissão de `PERMISSION_PAGES`. Endereço desconhecido em `/admin` só confere o perfil (funcionário ou admin), e a página não encontrada responde. O admin tem todas as permissões (RN027).
- **`next` válido (L2):**
  - começa com uma `/` e não com `//` nem `/\`;
  - continua no próprio site quando lido como endereço;
  - não fica em `/api`, em `/_next` nem nas três telas de acesso.

  Com outro valor, o parâmetro é ignorado. "Permitido" é página pública para todos, página do cliente para o cliente e página do painel com a permissão.
- **`next` pedido pelo visitante:** caminho e consulta, codificados com `encodeURIComponent`, como faz o `api-client`. O Next.js já tira o parâmetro interno `_rsc` do endereço que o proxy recebe.
- **"Com o aviso" (L4):** o destino ganha `denied=1`, e o layout mostra o aviso de acesso negado.

**Depois do login e da troca de senha**, a tela não calcula o destino. Ela recarrega o próprio endereço (`location.replace`), e o proxy, que agora vê a sessão, aplica a tabela. A regra fica num lugar só, no servidor.

### Telas

As três ficam no layout do portal (RF005), cada uma num cartão centralizado (`AuthCard`): superfície do tema com `shadow-neu-md` e `rounded-xl`, até 448 px de largura, ocupando a largura útil em 360 px. Abaixo de 768 px, o título desce um passo, como manda `design.md`. A marca não se repete no cartão, porque já está no cabeçalho.

**Comum aos três formulários:**

- `useForm` com o `zodResolver` do esquema compartilhado e `mode: "onTouched"`: cada campo é validado ao perder o foco e, depois disso, a cada mudança. O envio com erro leva o foco ao primeiro campo inválido.
- Cada campo usa `Field`, `FieldLabel`, o `Controller` e o `FieldError`, com `aria-invalid` e o erro ligado ao campo por `aria-describedby` (RNF003, RNF005).
- Os dados ficam como estavam quando há erro, inclusive as senhas (UC02 FE01).
- Botão de envio (`SubmitButton`): enquanto a chamada e a mudança de página não terminam, fica no estado "Carregando" de `design.md`, com o ícone giratório da Lucide e o texto da ação em andamento (RNF004).
- Resposta de erro (`ApiError`):

  | Resposta | Na tela |
  |---|---|
  | 400 `VALIDATION_ERROR` | `fields` junto a cada campo (`setError`), e o `detail` no aviso |
  | 401 `INVALID_CREDENTIALS` ou `INVALID_CURRENT_PASSWORD`, 403 `ACCOUNT_INACTIVE`, 409 `EMAIL_IN_USE`, 429 `ACCOUNT_LOCKED`, 500, 503 e falha de rede | o `detail`, com a mensagem do catálogo, no aviso (`Alert` destrutivo) no topo do formulário |

  O aviso recebe o foco, para quem usa leitor de tela ou teclado. O 401 `UNAUTHENTICATED` e o 403 `PASSWORD_CHANGE_REQUIRED` são tratados pelo `api-client`.
- Campos de senha (L6, opção 2): `PasswordInput`, com o botão de ícone "Mostrar senha" ou "Ocultar senha" (`aria-pressed`). No cadastro e na troca de senha, a senha que se define tem um campo de confirmação logo abaixo, validado pelo esquema do formulário (`registerFormSchema` e `changePasswordFormSchema`), e só os campos da API são enviados.
- `autocomplete` em todos os campos, para o preenchimento automático e o gerenciador de senhas (WCAG 1.3.5).

**`/login`** (`login-form.tsx`):

- Título "Entrar" e o texto "Use o e-mail e a senha da sua conta.".
- Campos "E-mail" (`email`) e "Senha" (`current-password`), com `loginSchema`.
- Botão "Entrar", que passa a "Entrando…" durante o envio.
- Abaixo do formulário, sempre visível: "Ainda não tem conta?" e o link "Criar conta" (UC03, passo 2, FA01 e FE01). O link leva o `next` recebido.
- Com `registered=1` no endereço, o aviso de sucesso do cadastro aparece no topo (L5).
- 200: `signIn(user)`, para o cabeçalho já mostrar a sessão, e `location.replace` do endereço atual. O proxy leva:
  - ao `next` ou à página inicial da área (RN029, RF010);
  - ou a `/set-password`, com a senha inicial pendente (UC03 FA03, UC08 FA01).
- A página (`page.tsx`, de servidor) lê `next` e `registered` dos `searchParams` e os passa ao formulário. Por isso ela é dinâmica, o que não pesa: o proxy já roda a cada pedido dela.

**`/register`** (`register-form.tsx`):

- Título "Criar conta" e o texto "Cadastre-se para agendar serviços pelo portal.".
- Campos, com `registerFormSchema` (o `registerSchema` mais a confirmação):
  - "Nome" (`given-name`) e "Sobrenome" (`family-name`), lado a lado a partir de 640 px;
  - "E-mail" (`email`);
  - "Celular" (`tel-national`, `inputMode="tel"`), com a máscara de L7 e a descrição "Com DDD, como (82) 99999-8888.";
  - "Senha" (`new-password`), com a descrição "De 8 a 72 caracteres, com letra maiúscula, número e caractere especial." (RS003);
  - "Confirmar senha" (`passwordConfirmation`, `new-password`), com "As senhas não conferem." quando difere (L6).
- Botão "Criar conta", que passa a "Criando conta…".
- Abaixo: "Já tem conta?" e o link "Entrar" (UC02 FA01), com o `next`.
- 201: `location.assign("/login?registered=1")`, mais o `next` recebido (UC02, passo 6; L5).
- 409 `EMAIL_IN_USE`: o aviso traz a mensagem do catálogo ("Este e-mail não pode ser usado. Se você já tem conta, entre com ela.") e o link "Entrar", e os campos continuam preenchidos (UC02 FE02).
- A página lê o `next` dos `searchParams`.

**`/set-password`** (`set-password-form.tsx`):

- Título "Defina uma nova senha" e o texto "Para continuar, troque a senha inicial que você recebeu no cadastro.".
- Campos, com `changePasswordFormSchema` (o `changePasswordSchema` mais a confirmação):
  - "Senha inicial" (`currentPassword`, `current-password`);
  - "Nova senha" (`newPassword`, `new-password`), com a descrição do RS003;
  - "Confirmar nova senha" (`newPasswordConfirmation`, `new-password`), com "As senhas não conferem." quando difere (L6).

  A nova senha igual à inicial recebe a mensagem do esquema (RN023, UC03 FE03, UC08 FE04).
- Botão "Salvar nova senha", que passa a "Salvando…".
- 204: `location.replace` do endereço atual. A sessão já foi renovada nos cookies (decisão 0048), e o proxy, sem a troca pendente, leva ao `next` ou à página inicial da área.
- Sem wireframe (`wireframes/README.md`): segue o mesmo cartão das outras duas.

Os wireframes `publicPages/login/` e `publicPages/register/` dão só o esqueleto (o cartão centralizado, a ordem dos campos e o atalho entre as duas telas). Ficam de fora, por não terem requisito:

- "Esqueci a senha": a recuperação de senha está fora do escopo (`visao-geral.md`);
- o captcha (`seguranca.md`);
- os aceites de termos e de política de privacidade;
- "Telefone (opcional)": o celular é obrigatório (RN035).

O "Mostrar senha" e a confirmação de senha dos wireframes entram pela L6 (opção 2).

### Aviso de acesso negado (L4)

`AccessDeniedNotice` (`src/components/shared/`, componente de cliente) fica no topo do conteúdo dos dois layouts, dentro de um `Suspense`, porque lê o endereço (`useSearchParams`). Com `denied=1`, mostra um `Alert` com "Você não tem permissão para acessar essa página.".

O parâmetro sai do endereço logo depois (`history.replaceState`), para o aviso não voltar ao recarregar, e o aviso some na navegação seguinte. Quando o destino ainda é uma página que não existe (as do cliente e do painel chegam com os seus módulos), a página não encontrada aparece sem o aviso, porque ela fica fora dos layouts.

### Máscara do celular (L7)

`formatPhone(texto)`, em `src/shared/format/phone.ts`, guarda até 11 algarismos e os formata conforme a quantidade:

| Algarismos | Formato |
|---|---|
| 1 e 2 | `(8`, `(82` |
| 3 a 6 | `(82) 9999` |
| 7 a 10 | `(82) 9999-9888`, o fixo |
| 11 | `(82) 99999-8888`, o celular |

O campo aplica a função a cada mudança. Ela é a mesma da exibição do telefone gravado (RN035, coluna Exibição), que as próximas telas vão usar. O `mobilePhoneSchema` já aceita o valor com a máscara e grava só os algarismos.

### Arquivos novos e alterados de `src/`

| Arquivo | Conteúdo |
|---|---|
| `proxy.ts` | novo: `matcher`, leitura da conta, `decidePageAccess`, `Cache-Control` e falha sem redirecionamento (0051) |
| `server/auth/page-access.ts` | novo: `decidePageAccess` e o tipo `PageAccount` (perfil, situação, troca pendente e permissões da `Account`), com as regras de L1 a L4 |
| `server/supabase/clients.ts` | só o comentário do `setAll`: os cabeçalhos anticache das páginas ficam no `proxy.ts`, que marca toda resposta |
| `shared/format/phone.ts` | novo: `formatPhone` (L7) |
| `shared/validation/auth.ts` | `registerFormSchema` e `changePasswordFormSchema`, com a confirmação de senha (L6, opção 2) |
| `app/(portal)/login/page.tsx`, `register/page.tsx`, `set-password/page.tsx` | novos: montam o cartão e o formulário; `login` e `register` leem os `searchParams` |
| `components/portal/auth/auth-card.tsx` | novo: cartão com título e texto |
| `components/portal/auth/login-form.tsx`, `register-form.tsx`, `set-password-form.tsx` | novos |
| `components/portal/auth/password-input.tsx` | novo: campo de senha com "Mostrar senha" (L6) |
| `components/portal/auth/submit-button.tsx` | novo: botão de envio com o estado de carregamento |
| `components/portal/auth/form-alert.tsx` | novo: o aviso do formulário, que recebe o foco |
| `components/shared/access-denied-notice.tsx` | novo: aviso de acesso negado (L4) |
| `app/(portal)/layout.tsx` e `app/(admin)/admin/layout.tsx` | o aviso de acesso negado no topo do `main` (L4) |

O cabeçalho do portal continua calculando o link "Painel" pela primeira permissão (`site-header.tsx`): é a mesma regra da página inicial da área, sem mudança.

## Ordem da construção

1. Criar a ramificação `feat/26-access-screens` (seção "Base da construção"), desfazer o vínculo com a `main` e rodar `npm ci`.
2. Escrever os testes de `tests/auth/page-access.test.ts` e `tests/format/phone.test.ts`, com os README das duas pastas, e os casos novos de `tests/validation/auth.test.ts`, e conferir que falham (vermelho). Eles vão num commit próprio, antes do código (decisões 0035 e 0052).
3. Escrever `page-access.ts`, `phone.ts` e os esquemas dos formulários até os testes passarem (verde).
4. Escrever o `proxy.ts` e o comentário de `clients.ts`.
5. Escrever os componentes de `portal/auth/`, as três páginas, o aviso de acesso negado e a mudança nos dois layouts.
6. Documentação das lacunas, as decisões 0051 e 0052 e os README.
7. Verificação local (seção seguinte).
8. Etapa 03: PR e `02_relatorio.md`. Não há migration nem dependência nova.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um visitante em `/booking`, quando entra, então volta a `/booking` (RF010, RN001) | Testes de `decidePageAccess` (visitante em página do cliente; cliente em `/login` com `next`). Local: <br>• `/booking` sem cookies responde 307 para `/login?next=%2Fbooking`; <br>• no navegador, o login do cliente de teste nessa tela termina em `/booking`, que mostra a página não encontrada até a tarefa do UC06, com o endereço certo. <br>Pré-visualização: o mesmo endereço e o login com o cliente de teste (veja Riscos) |
| Dado um cliente em `/admin`, quando a página carrega, então vai à página inicial do portal (RS010) | Testes. Local: com os cookies do cliente, `/admin` e `/admin/settings` respondem 307 para `/?denied=1`, e no navegador a página inicial mostra o aviso. Pré-visualização: o cliente de teste |
| Dado um funcionário sem a permissão `settings`, quando abre `/admin/settings`, então vai à primeira página permitida (RN025) | Testes. Local: <br>• o funcionário de teste com `dashboard` e `appointments` vai de `/admin/settings` a `/admin?denied=1`, e o dashboard provisório mostra o aviso; <br>• o admin abre `/admin/settings` sem redirecionamento (página não encontrada até a tarefa do UC22); <br>• o funcionário de cargo inativo vai a `/?denied=1` |
| Dado uma conta com senha inicial, quando abre qualquer página restrita, então vai a `/set-password`; trocada a senha, segue para a sua área (RN023, RS004) | Testes. Local, com um cliente e um funcionário com a senha inicial: <br>• `/booking` e `/admin` levam a `/set-password?next=...`; <br>• o login em `/login?next=%2Fbooking` leva a `/set-password?next=%2Fbooking`; <br>• a senha inicial errada mostra "A senha atual está incorreta."; <br>• a nova senha igual à inicial mostra a mensagem junto ao campo; <br>• a confirmação diferente mostra "As senhas não conferem." junto à confirmação, sem chamar a API; <br>• a troca leva o cliente a `/booking` e o funcionário a `/admin`. <br>Só local: não há conta com senha inicial na produção até o UC16 e o UC19 |
| Dado credenciais erradas, quando tenta entrar, então vê "E-mail ou senha incorretos." e a opção de cadastro continua visível (UC03 FE01) | Local, a 360 e a 1440 px: o aviso aparece no topo e recebe o foco, o e-mail continua preenchido, e "Criar conta" continua visível sem rolar a 360 × 800. Também: funcionário desativado ("Esta conta está desativada..."), bloqueio depois de 5 erros (mensagem de `ACCOUNT_LOCKED`) e e-mail malformado (mensagem junto ao campo, sem chamada). Pré-visualização: e-mail inexistente |
| Dado um e-mail já cadastrado, quando tenta se cadastrar, então vê a mensagem de `EMAIL_IN_USE` com o atalho para entrar, e os dados preenchidos ficam (UC02 FE02) | Local: <br>• o cadastro com o e-mail do cliente de teste e com o de um funcionário mostra a mensagem e o link "Entrar", que leva a `/login`; <br>• todos os campos continuam preenchidos, inclusive a senha e a confirmação; <br>• a confirmação diferente da senha mostra "As senhas não conferem.", e o corpo enviado à API não leva a confirmação (lista de requisições do navegador); <br>• o cadastro novo leva a `/login?registered=1`, com o aviso de sucesso, e o login com a conta nova vai a `/`. <br>Pré-visualização: o cadastro com o e-mail do admin (409, sem criar conta) |
| Dado um usuário autenticado em `/login` ou `/register`, quando a página carrega, então vai à página inicial da sua área | Testes. Local: <br>• o cliente vai a `/`; <br>• o funcionário com `dashboard` e o admin vão a `/admin`; <br>• o funcionário de cargo inativo vai a `/?denied=1`. <br>Pré-visualização: o admin em `/login` e em `/register` |

### Como a verificação local é feita

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Aplicação.** `npx next build` e `npx next start -p 3026`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório. Cada mudança é conferida com um novo build, porque o `next dev` responde 500 nesta máquina. **Ponto para a sua aprovação**, como na #23, na #24 e na #25: são as chaves que a CLI gera para o banco local e descartável.
- **Contas de teste.** Um roteiro no scratchpad da sessão cria, pelo `auth.admin.createUser`:
  - um cliente;
  - um cliente com `must_change_password`;
  - um funcionário com o cargo "Recepção" (`dashboard` e `appointments`);
  - um funcionário com o mesmo cargo e `must_change_password`;
  - um funcionário com cargo inativo;
  - um funcionário desativado.

  O admin vem do `create-admin.mjs`. As senhas são geradas pelo roteiro e nunca exibidas.
- **Proxy.** Um roteiro com `fetch` do Node e `redirect: "manual"` percorre cada linha da tabela "Destino" com os cookies de cada conta. Ele confere o `Location` e o `Cache-Control: private, no-store` de cada resposta, com o valor dos cookies trocado por `<oculto>` na saída. Também confere:
  - **`next` de outro site:** com a sessão do cliente, `/login?next=` seguido de `//evil.example`, `/\evil.example`, `https://evil.example/x`, `/api/auth/logout` e `/login` respondem 307 para `/`;
  - **cabeçalhos:** `/` continua com o `Cache-Control` do Next.js, porque fica fora do proxy;
  - **renovação do token:** com o `jwt_expiry` reduzido só no banco local, o proxy renova o token e a resposta da página traz os cookies novos. Depois de duas renovações seguidas, o `me` continua respondendo 200. É uma alteração temporária do `supabase/config.toml`, desfeita antes de qualquer commit e conferida no `git status`. **Ponto para a sua aprovação.**
- **Navegador.** O navegador do app, em 360 × 800 e 1440 × 900, nos temas claro e escuro, conforme a seção "Interface" de `workflows/procedimentos/testes.md`:
  - os fluxos da tabela acima;
  - nada transborda;
  - a ordem do Tab, o foco visível, o "Mostrar senha" pelo teclado e a máscara do celular ao digitar, colar e apagar;
  - o estado de carregamento dos botões.
- **Pré-busca.** No painel, como admin, a lista de requisições do navegador mostra quantas vezes o proxy roda numa carga de página, pelas pré-buscas dos links. O número vai para o relatório (veja Riscos).
- **Lighthouse.** `npx -y lighthouse@13.5.0` em `/login` e `/register`, nos modos celular e computador e nos dois temas, sem auditoria de acessibilidade reprovada. Em `/set-password`, o Lighthouse precisa da sessão do cliente de teste com a senha inicial. O cookie vai por `--extra-headers`, num arquivo do scratchpad, apagado depois. **Ponto para a sua aprovação.**
- **Supabase Auth parado** (`docker stop supabase_auth_glow`, religado logo depois):
  - com cookies, `/admin` responde 200 sem redirecionamento e com a linha `warn` `auth_unavailable`;
  - o login mostra a mensagem de `SERVICE_UNAVAILABLE`.
- **Registro.** Na saída do `next start`, nenhuma linha traz senha, e-mail, token ou cookie (RS018).
- **Verificações automáticas.** `npm run check` sem erros nem avisos e `npx next build`.
- **Pré-visualização**, passo do desenvolvedor: as linhas marcadas como "Pré-visualização" na tabela acima e o passo 3 da seção "Interface" do procedimento de testes (Lighthouse e larguras, com a captura no PR).

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/proxy.ts` | criar (0051) |
| `src/server/auth/page-access.ts` | criar (L1 a L4) |
| `src/server/auth/README.md` | alterar: `page-access.ts` |
| `src/server/supabase/clients.ts` | alterar: só o comentário do `setAll` |
| `src/shared/format/phone.ts` | criar (L7) |
| `src/shared/format/README.md` | alterar (L7) |
| `src/shared/validation/auth.ts` | alterar: esquemas dos formulários, com a confirmação de senha (L6) |
| `tests/validation/auth.test.ts` | alterar: casos da confirmação de senha (L6) |
| `docs/plataforma/mensagens-de-validacao.md` | alterar: "As senhas não conferem." (L6) |
| `src/app/(portal)/login/page.tsx`, `register/page.tsx`, `set-password/page.tsx` | criar |
| `src/components/portal/auth/auth-card.tsx`, `login-form.tsx`, `register-form.tsx`, `set-password-form.tsx`, `password-input.tsx`, `submit-button.tsx`, `form-alert.tsx` | criar |
| `src/components/shared/access-denied-notice.tsx` | criar (L4) |
| `src/app/(portal)/layout.tsx`, `src/app/(admin)/admin/layout.tsx` | alterar (L4) |
| `src/README.md` | alterar: a referência das regras do `proxy.ts` passa a `protecao-das-paginas.md` |
| `tests/auth/page-access.test.ts` | criar |
| `tests/auth/README.md` | criar |
| `tests/format/phone.test.ts` | criar |
| `tests/format/README.md` | criar |
| `tests/README.md`, `tests/http/README.md`, `tests/lib/README.md` | alterar: as pastas novas e a decisão 0052 |
| `docs/acesso/protecao-das-paginas.md` | criar (L1 a L4, 0051) |
| `docs/acesso/autenticacao.md` | alterar: a seção "Proteção das páginas" vira um apontador (L3) |
| `docs/acesso/CONTEXT.md` | alterar: linha do módulo novo |
| `docs/acesso/rotas.md` | alterar: apontador da proteção e conteúdo das telas (L5) |
| `docs/acesso/UC03-autenticar-se-no-portal.md` | alterar (L1) |
| `docs/acesso/UC08-autenticar-se-no-painel-administrativo.md` | alterar (L4) |
| `docs/padroes/frontend.md` | alterar (L6, L7) |
| `docs/padroes/layouts.md` | alterar (L4) |
| `docs/padroes/testes.md` | alterar (0052) |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: `page-access.ts`, `tests/auth/` e `tests/format/` |
| `docs/decisoes/0051-protecao-das-paginas-no-proxy.md` | criar |
| `docs/decisoes/0052-testes-da-formatacao-e-da-protecao-das-paginas.md` | criar |
| `docs/decisoes/0050-testes-do-cliente-da-api.md` | alterar: só a linha `status:` |
| `docs/decisoes/CONTEXT.md` | alterar: 0051, 0052 e a 0050 substituída |
| `memoria/tarefas/26-telas-de-acesso/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |

Os README de `src/app/(portal)/login/`, `register/`, `set-password/` e `src/components/portal/auth/` já descrevem estes arquivos e não mudam.

Temporários, desfeitos antes de qualquer commit: a mudança do `jwt_expiry` em `supabase/config.toml`, conferida no `git status`.

### Em comum com outras tarefas em andamento

- PR yvanshaw1/Glow-ProjetoAldo#33 (#25), aberto. Esta tarefa altera arquivos que ele cria ou altera:
  - os dois layouts;
  - `frontend.md`, `layouts.md` e `testes.md`;
  - `estrutura-de-pastas.md` e `tests/README.md`;
  - `docs/decisoes/CONTEXT.md` e a 0050.

  Por isso a ordem da seção "Base da construção".
- Nenhuma outra issue ou PR aberto.

## Testes previstos

Valores esperados tirados da tabela de `autenticacao.md`, dos critérios da issue, de RN025, RN027, RS004, RS010, RN035 (coluna Exibição) e da opção recomendada de cada lacuna.

`tests/auth/page-access.test.ts` (`decidePageAccess`). As contas são montadas no próprio teste:

- cliente;
- cliente com troca pendente;
- funcionário com `appointments` e `clients`;
- funcionário com troca pendente;
- funcionário sem permissão;
- funcionário desativado;
- admin com as seis permissões.

Casos:

- sends a visitor on a client page to the login with the page in next: `/booking` → `/login?next=%2Fbooking`
- keeps the query of the requested page in next: `/appointments?page=2` → `/login?next=%2Fappointments%3Fpage%3D2`
- sends a visitor on a panel page to the login with the page in next: `/admin/settings` → `/login?next=%2Fadmin%2Fsettings`
- shows the login and the sign-up to a visitor: `/login` e `/register` → `null`
- sends a visitor on the password change to the login: `/set-password` → `/login`
- treats a deactivated account as a visitor: `/admin` → `/login?next=%2Fadmin`; `/login` → `null`
- brings a client back to the page in next after the login: `/login?next=%2Fbooking` → `/booking`
- sends a client on the login or the sign-up to the portal home: `/login` e `/register` → `/`
- sends a client on a panel page to the portal home with the notice: `/admin` e `/admin/settings` → `/?denied=1`
- lets a client open the client pages: `/booking`, `/profile` e `/appointments` → `null`
- sends staff without the page permission to the first allowed page with the notice: `/admin/settings` e `/admin` → `/admin/appointments?denied=1`
- lets staff open a page their role allows: `/admin/clients` → `null`
- sends staff on the login to the first allowed page: `/login` → `/admin/appointments`; o admin → `/admin`
- lets the admin open every panel page: as seis páginas de `PERMISSION_PAGES` → `null`
- sends staff on a client page to the first allowed page with the notice: `/booking` → `/admin/appointments?denied=1`
- sends staff without any permission to the portal home with the notice: `/admin` e `/login` → `/?denied=1`
- lets staff reach an unknown panel address: `/admin/unknown` → `null`
- sends a pending account on a restricted page to the password change with the page in next: o cliente em `/booking` → `/set-password?next=%2Fbooking`; o funcionário em `/admin` → `/set-password?next=%2Fadmin`
- sends a pending account on the login or the sign-up to the password change, keeping next: `/login?next=%2Fbooking` → `/set-password?next=%2Fbooking`; `/register` → `/set-password`
- shows the password change to a pending account: `/set-password` → `null`
- sends an account without a pending change away from the password change, through next: o cliente em `/set-password?next=%2Fbooking` → `/booking`; o funcionário em `/set-password` → `/admin/appointments`
- ignores a next outside the pages of the site: o cliente em `/login` com `next` igual a `//evil.example`, `/\evil.example`, `https://evil.example/booking`, `booking`, `/api/auth/logout`, `/login` ou `/set-password` → `/`
- sends to the area home with the notice when next is not allowed for the profile: o cliente com `next=%2Fadmin` → `/?denied=1`; o funcionário com `next=%2Fadmin%2Fsettings` → `/admin/appointments?denied=1`
- accepts a public page in next for any profile: o funcionário com `next=%2Fservices` → `/services`

`tests/format/phone.test.ts` (`formatPhone`, RN035):

- formats a mobile phone with the area code: `82999998888` → `(82) 99999-8888`
- formats a landline with the area code: `8233334444` → `(82) 3333-4444`
- formats a phone while it is typed: `""` → `""`; `8` → `(8`; `82` → `(82`; `829` → `(82) 9`; `8299998` → `(82) 9999-8`; `8299999888` → `(82) 9999-9888`
- keeps a formatted phone as it is: `(82) 99999-8888` → `(82) 99999-8888`
- keeps only digits, up to eleven: `829999988881` → `(82) 99999-8888`; `abc` → `""`

`tests/validation/auth.test.ts`, `registerFormSchema` e `changePasswordFormSchema` (L6, opção 2):

- rejects a password confirmation that differs from the password: "Senha forte 1!" e "Senha forte 2!" → `passwordConfirmation`: "As senhas não conferem."
- compares the confirmation as typed: "Senha forte 1!" e "Senha forte 1! " → a mesma mensagem, porque a senha não é normalizada (RN035)
- requires the confirmation: ausente ou vazia → "Preencha este campo." em `passwordConfirmation`
- reports the mismatch even when another field is invalid: `firstName` "Maria2" e confirmação diferente → as duas mensagens
- accepts a confirmation equal to the password: → sem erro, e os dados normalizados como em `registerSchema`
- rejects a new password confirmation that differs from the new password: → `newPasswordConfirmation`: "As senhas não conferem."
- keeps the rule of the new password different from the current one: nova igual à atual, com a confirmação igual → `newPassword`: "A nova senha precisa ser diferente da atual."

As telas, o `proxy.ts` inteiro (que depende do Supabase), o aviso e a máscara no campo são conferidos à mão, como descrito acima (decisão 0052).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

São três grupos: o destino de cada pessoa (L1 a L4), as telas (L5 e L6) e a máscara do celular (L7).

### L1. Página inicial de cada área

**Problema.** A tabela de `autenticacao.md` fala da "página inicial da sua área" e diz que, no login, o "cliente vai ao portal" e o "funcionário e admin, à primeira página permitida do painel". Faltam duas respostas:

- **Página do cliente.** O UC03, passo 5, diz que o sistema "exibe a área restrita ao cliente", e as páginas restritas são três (`/profile`, `/booking` e `/appointments`). Nenhum módulo diz qual delas.
- **Funcionário sem nenhuma permissão.** O de cargo inativo entra com `permissions` vazio (#23) e não tem "primeira página permitida". O `layouts.md` já tira o link "Painel" do cabeçalho dele.

**Opções:**

- [X] **1. Cliente em `/`; funcionário sem permissão em `/`, com o aviso de acesso negado (recomendada).**
  - **Cliente:** vai a `/`, a página inicial do portal, que mostra as opções do cliente no cabeçalho. É o mesmo destino do cliente que abre `/admin` (critério da issue).
  - **Funcionário e admin:** vão à primeira página permitida, na ordem de RN025; o admin vai a `/admin`.
  - **Funcionário sem nenhuma permissão:** vai a `/`, com o aviso de L4, sempre que pede o painel, inclusive ao entrar. Ele vê o portal e o "Sair".

  Até as páginas do cliente existirem, nenhum login termina na página não encontrada.
- [ ] **2. Cliente em `/appointments` ("Meus agendamentos").** Fica mais perto de "área restrita", mas, até a tarefa do UC07, todo login de cliente termina na página não encontrada.
- [ ] **3. Igual à 1, mas o funcionário sem permissão não entra: a tela de login mostra um aviso e encerra a sessão.** A regra ficaria no navegador, e a API continuaria aceitando a sessão dele.

**Texto proposto (opção 1):**

- `docs/acesso/protecao-das-paginas.md`, novo (L3), seção "Página inicial de cada área": "Cliente: `/`, a página inicial do portal. Funcionário e admin: a primeira página permitida, na ordem de RN025; o admin vai a `/admin`. Funcionário sem nenhuma permissão (cargo inativo): `/`, com o aviso de acesso negado, sempre que pede o painel, inclusive ao entrar."
- `docs/acesso/UC03-autenticar-se-no-portal.md`, fluxo principal, passo 5: "O sistema inicia a sessão, identifica o perfil da conta e exibe a área restrita ao cliente (RS007, RN029)." passa a "O sistema inicia a sessão, identifica o perfil da conta e exibe a página inicial do portal, com as opções restritas ao cliente (RS007, RN029)."
- Documento formal a atualizar no relatório: Documentação de Análise do Sistema, Quadro 28 (UC03).

### L2. O parâmetro `next`

**Problema.** A #25 (L10) decidiu que o `next` "só vale com caminho interno" (começa com `/` e não com `//`), e a tabela diz que a pessoa "volta a ela se o perfil puder" (RF010). Ficam três pontos:

- **Endereços que o "caminho interno" deixa passar.** `/\evil.example` é lido como `//evil.example` pelos navegadores e leva a outro site. `next=/login` faria o proxy redirecionar o login para ele mesmo, em ciclo. `next=/api/auth/logout` levaria a pessoa a uma rota da API.
- **O `next` entre as telas.** O visitante que pede `/booking`, vai ao login e escolhe "Criar conta" perde a página pedida. A conta com senha inicial (UC03 FA02 e FA03 juntos) também.
- **O `next` que o perfil não pode abrir.** O texto diz só "se o perfil puder", sem dizer para onde vai a pessoa quando não pode.

**Opções:**

- [X] **1. Só caminho interno de página, levado pelo cadastro e pela troca de senha (recomendada).**
  - **Vale:** começa com uma `/` e não com `//` nem `/\`; continua no próprio site quando lido como endereço; não fica em `/api`, em `/_next` nem nas telas de acesso. Com outro valor, o parâmetro é ignorado.
  - **Entre as telas:** o `next` acompanha os atalhos "Criar conta" e "Entrar", o fim do cadastro e a troca de senha pendente.
  - **Fora do perfil:** a pessoa vai à página inicial da área, com o aviso de L4.

  O teste cobre cada forma recusada.
- [ ] **2. Igual à 1, sem passar pelo cadastro nem pela troca de senha.** Depois deles, a pessoa vai à página inicial da área e volta sozinha à página que pediu.

**Texto proposto (opção 1):**

- `docs/acesso/protecao-das-paginas.md`, seção "Parâmetro `next`": "Vale só um caminho interno de página: começa com uma `/` e não com `//` nem `/\`, continua no próprio site quando lido como endereço e não fica em `/api`, em `/_next` nem nas telas `/login`, `/register` e `/set-password`. Com outro valor, o parâmetro é ignorado. A pessoa autenticada vai ao `next` se o perfil puder abrir a página (página pública, do cliente para o cliente, do painel com a permissão); senão, à página inicial da área, com o aviso de acesso negado. O `next` acompanha os atalhos entre o login e o cadastro, o fim do cadastro e a troca de senha pendente."

### L3. Telas de acesso fora do estado esperado

**Problema.** A tabela "Proteção das páginas" de `autenticacao.md` não cobre quatro casos:

- **Visitante em `/set-password`.** A tela exige sessão.
- **`/set-password` sem troca pendente.** É o estado logo depois da troca, e também o de quem abre o endereço sem precisar. A alteração voluntária de senha é do UC04, na área do cliente.
- **Troca pendente em `/login` ou `/register`.** Duas linhas da tabela se cruzam: "Usuário autenticado em `/login` ou `/register` vai à página inicial da sua área" e "Troca de senha pendente em qualquer página restrita vai a `/set-password`". As telas de acesso não são restritas, mas a página inicial do funcionário é.
- **Conta desativada ou sem perfil, com cookies ainda válidos.** O `me` responde 403 ou 401, e o contexto da sessão (#25, L11) encerra a sessão da desativada. A tabela não diz o que o proxy faz.

Além disso, com o texto de L1, L2 e L4, `autenticacao.md` passaria de cerca de 2 mil tokens (hoje tem 6,3 mil caracteres), o limite de `docs/CONTEXT.md`.

**Opções:**

- [X] **1. Tabela completa, num módulo próprio (recomendada).**
  - Visitante em `/set-password` vai a `/login`.
  - Sem troca pendente, `/set-password` faz o mesmo que o login: vai ao `next` ou à página inicial da área.
  - Troca pendente em `/login` ou `/register` vai a `/set-password`, com o `next`.
  - Conta desativada ou sem perfil é tratada como visitante.

  A seção "Proteção das páginas" sai de `autenticacao.md` para `docs/acesso/protecao-das-paginas.md`, com L1, L2, L4 e a decisão 0051. `autenticacao.md` fica com um apontador.
- [ ] **2. Igual à 1, mas a troca pendente em `/login` e `/register` mostra a tela, para entrar com outra conta.** A pessoa continua com a sessão aberta, e o cadastro de outra conta fica disponível a quem tem a senha pendente.
- [ ] **3. Regras da opção 1, mantidas em `autenticacao.md`.** Um arquivo a menos, mas acima do limite de tamanho.

**Texto proposto (opção 1):**

- `docs/acesso/protecao-das-paginas.md`, novo, com o cabeçalho `titulo: Proteção das páginas`, `assunto: acesso`, `origem` (Documentação de Arquitetura de Software, seção 3.2, Quadro 5; issue #26) e `relacionados: [RF010, RN001, RN023, RN025, RN026, RN027, RS001, RS004, RS008, RS010, RS011, 0032, 0046, 0051]`. O conteúdo:
  - Abertura: "No Next.js 16 o arquivo é `src/proxy.ts` (decisão 0032). Ele organiza a navegação; quem decide o acesso aos dados é sempre a API (RS008)."
  - Seção "Como confere", com o texto da decisão 0051: as páginas em que roda; a sessão e a conta conferidas como nos guards; o `Cache-Control: private, no-store`; a página que segue quando o Supabase falha; "Conta desativada ou sem perfil é tratada como visitante."; "Depois do login e da troca de senha, a tela recarrega o próprio endereço, e o proxy aplica a tabela abaixo."
  - Seção "Destino", com a tabela:

    | Situação | Comportamento |
    |---|---|
    | Visitante em `/profile`, `/booking`, `/appointments` ou `/admin*` | vai a `/login?next=<página pedida>` (RF010, RN001) |
    | Visitante em `/set-password` | vai a `/login` |
    | Troca de senha pendente em página restrita | vai a `/set-password?next=<página pedida>` (RS004) |
    | Troca de senha pendente em `/login` ou `/register` | vai a `/set-password`, com o `next` recebido |
    | Autenticado, sem troca pendente, em `/login`, `/register` ou `/set-password` | vai ao `next`, se o perfil puder abrir a página; senão, à página inicial da área (RN029) |
    | Cliente em `/admin*` | vai a `/`, com o aviso de acesso negado (RS010) |
    | Funcionário ou admin em página exclusiva de cliente | vai à primeira página permitida, com o aviso |
    | Funcionário sem a permissão da página | vai à primeira página permitida, com o aviso (RN025) |

  - Seções "Página inicial de cada área" (L1), "Parâmetro `next`" (L2) e "Aviso de acesso negado" (L4).
- `docs/acesso/autenticacao.md`: a seção "Proteção das páginas (`src/proxy.ts`)" inteira, com a tabela, passa a uma seção "Proteção das páginas" só com o parágrafo "O `src/proxy.ts` leva cada pessoa às páginas do seu perfil, das suas permissões e da troca de senha pendente: [protecao-das-paginas.md](protecao-das-paginas.md)." Os `relacionados` ganham 0051.
- `docs/acesso/CONTEXT.md`: a descrição de `autenticacao.md` passa a "Sessão, perfis, guards e permissões", e entra a linha "| protecao-das-paginas.md | `src/proxy.ts`: destino de cada perfil, parâmetro `next` e aviso de acesso negado |".
- `docs/acesso/rotas.md`: "Proteção das páginas: [../acesso/autenticacao.md](../acesso/autenticacao.md)." passa a "Proteção das páginas: [protecao-das-paginas.md](protecao-das-paginas.md)."
- `src/README.md`, Referências: "`docs/acesso/autenticacao.md` (regras do `proxy.ts`)" passa a "`docs/acesso/protecao-das-paginas.md` (regras do `proxy.ts`)".

### L4. Aviso de acesso negado

**Problema.** O UC08 (FE03) diz: "o sistema nega o acesso e informa a restrição (RS008)". A tabela de `autenticacao.md` e o critério da issue só levam à primeira página permitida, sem dizer nada à pessoa. O mesmo vale para o cliente que abre o painel (RS010) e para o funcionário que abre uma página do cliente: a página muda, e a pessoa não sabe por quê.

**Opções:**

- [x] **1. Redirecionar e avisar (recomendada).**
  - Em todo redirecionamento por falta de permissão, o proxy acrescenta `denied=1` ao destino: cliente no painel, funcionário em página do cliente ou sem a permissão, funcionário sem nenhuma permissão.
  - Os dois layouts mostram no topo do conteúdo um `Alert` com "Você não tem permissão para acessar essa página.".
  - O parâmetro sai do endereço depois de lido, e o aviso some na navegação seguinte.
  - O visitante não recebe o aviso: o login já é a resposta.

  Atende ao UC08 FE03 e à tabela ao mesmo tempo, com um componente pequeno.
- [ ] **2. Só redirecionar.** Fica mais simples, e o UC08 FE03 muda para "o sistema exibe a primeira página permitida; a navegação só mostra as páginas permitidas (RN025)". A pessoa não sabe por que a página mudou.

**Texto proposto (opção 1):**

- `docs/acesso/protecao-das-paginas.md`, seção "Aviso de acesso negado": "Quando leva a pessoa a outra página por falta de permissão (cliente no painel, funcionário em página do cliente ou sem a permissão da página, funcionário sem nenhuma permissão), o proxy acrescenta `denied=1` ao destino. Os layouts do portal e do painel mostram então, no topo do conteúdo, o aviso 'Você não tem permissão para acessar essa página.'; o parâmetro sai do endereço, e o aviso some na navegação seguinte (UC08 FE03, RS008). O visitante vai ao login sem aviso."
- `docs/padroes/layouts.md`, depois da frase "A navegação só orienta: quem decide o acesso é a API (RS008).": acrescentar "Os dois layouts mostram no topo do conteúdo o aviso de acesso negado, quando o `proxy.ts` leva a pessoa até ali ([../acesso/protecao-das-paginas.md](../acesso/protecao-das-paginas.md))."
- `docs/acesso/UC08-autenticar-se-no-painel-administrativo.md`, FE03, passo 1: "O funcionário tenta acessar uma página não permitida pelo seu cargo; o sistema nega o acesso e informa a restrição (RS008)." passa a "O funcionário tenta acessar uma página não permitida pelo seu cargo; o sistema nega o acesso, exibe a primeira página permitida e informa a restrição (RS008, RN025)."
- Documento formal a atualizar no relatório: Documentação de Análise do Sistema, Quadro 33 (UC08).

### L5. Sucesso do cadastro

**Problema.** O UC02, passo 6, diz que o sistema "informa o sucesso do cadastro e direciona o usuário para a autenticação". A #25 (L13) decidiu que esse sucesso aparece na página seguinte, e a #24 (L1) deixou aberto preencher o e-mail no login. Não há texto nem mecanismo, e nenhum módulo descreve o que as telas de acesso mostram.

**Opções:**

- [x] **1. `/login?registered=1`, com o aviso de sucesso e sem preencher o e-mail (recomendada).** O login mostra no topo "Conta criada. Agora entre com o seu e-mail e a sua senha.". O e-mail não passa pelo endereço nem fica guardado no navegador. Com o `autocomplete` dos campos, o gerenciador de senhas oferece guardar a conta no cadastro e a preenche no login.
- [ ] **2. Igual à 1, com o e-mail preenchido pelo `sessionStorage`, lido uma vez e apagado.** Um campo a menos para digitar, mas o e-mail fica guardado no navegador, e o código precisa apagá-lo em todo caminho.
- [ ] **3. Tela de sucesso no próprio `/register`, com o botão "Entrar".** Um clique a mais, contra o L13 da #25.

**Texto proposto (opção 1):**

- `docs/acesso/rotas.md`, depois da tabela "Telas", nova seção "Conteúdo das telas":

  | Tela | Campos | Atalhos e avisos |
  |---|---|---|
  | `/register` | Nome, Sobrenome, E-mail, Celular (com máscara), Senha e Confirmar senha | "Já tem conta? Entrar". E-mail em uso: o aviso de `EMAIL_IN_USE`, com o atalho "Entrar". Conta criada: leva a `/login?registered=1` |
  | `/login` | E-mail e Senha | "Ainda não tem conta? Criar conta", sempre visível (UC03 FE01). Com `registered=1`: "Conta criada. Agora entre com o seu e-mail e a sua senha." |
  | `/set-password` | Senha inicial, Nova senha e Confirmar nova senha | – |

  Depois da tabela: "Os atalhos levam o `next` recebido ([protecao-das-paginas.md](protecao-das-paginas.md)). Erros: o `detail` no aviso do topo e `fields` junto a cada campo ([../padroes/frontend.md](../padroes/frontend.md))."

### L6. Campos de senha: mostrar e confirmar

**Problema.** Os wireframes de login e de cadastro têm o botão de mostrar a senha (o ícone de olho) e, no cadastro, o campo "Confirmar senha". Nenhum dos dois está na documentação: nem no RF007, nem no UC02, nem em `rotas.md`, nem no `registerSchema`. Pelo `wireframes/README.md`, fica de fora "todo campo ou detalhe sem requisito em `docs/`".

**Opções:**

- [ ] **1. Botão "Mostrar senha" em todo campo de senha, sem campo de confirmação (recomendada).** O botão de ícone alterna a senha entre visível e oculta, com `aria-label` "Mostrar senha" ou "Ocultar senha" e `aria-pressed`. Ver a senha substitui a confirmação. O esquema compartilhado não muda, e o celular tem um campo a menos.
- [x] **2. "Mostrar senha" e "Confirmar senha" no cadastro e na troca de senha.** É mais um campo em cada tela, fora do esquema compartilhado, com uma mensagem nova ("As senhas não conferem.") a documentar.
- [ ] **3. Nenhum dos dois, como está na documentação.** No celular, a senha é digitada às cegas.

**Texto (opção 2, escolhida; refeito antes da construção):**

- `docs/padroes/frontend.md`, Estado e formulários, novo item depois do item dos formulários: "Campos de senha com o botão de ícone 'Mostrar senha' (`aria-pressed`). Onde a senha é definida (cadastro e troca de senha), um campo de confirmação logo abaixo, conferido só na tela, pelo esquema do formulário em `src/shared/validation`; a API não recebe a confirmação. `autocomplete` `current-password` na senha que se confere e `new-password` na que se define e na confirmação."
- `docs/plataforma/mensagens-de-validacao.md`, nova linha depois de "Nova senha igual à atual": "| Confirmação de senha diferente da senha | As senhas não conferem. |". A frase de abertura passa a citar as duas mensagens que vêm de `auth.ts`: "exceto a da nova senha igual à atual e a da confirmação de senha, que vêm de `auth.ts`, na mesma pasta".
- `src/shared/validation/auth.ts`: `registerFormSchema` e `changePasswordFormSchema`, os esquemas dos formulários, com a confirmação (`passwordConfirmation` e `newPasswordConfirmation`). A comparação é exata, sem normalização, como a senha é gravada (RN035), e roda assim que a senha e a confirmação estão preenchidas, mesmo com outro campo inválido (opção `when` do `refine`, conferida no Zod 4.6.7). O formulário envia à API só os campos de `registerSchema` e de `changePasswordSchema`.

### L7. Máscara do celular no cadastro

**Problema.** O `frontend.md` pede "máscaras de telefone, CNPJ, placa e valores; exibição com `src/shared/format` (RN035)", e o `/register` é o primeiro formulário com telefone. Faltam três coisas:

- `src/shared/format/` ainda está vazia;
- nenhum módulo diz como a máscara é feita;
- as funções de formatação não estão entre o que o Vitest testa (decisão 0050).

**Opções:**

- [x] **1. Máscara na digitação com `formatPhone`, de `src/shared/format/phone.ts`, testada (recomendada; decisão 0052).**
  - A função guarda até 11 algarismos e formata conforme a quantidade (seção "Máscara do celular").
  - É a mesma da exibição do telefone gravado, que as próximas telas vão usar.
  - Não há dependência nova.
  - Consequência aceita: ao editar no meio do número, o cursor vai para o fim.
- [ ] **2. Biblioteca de máscara (como `react-imask`).** Cuida do cursor, mas é dependência nova, com peso no carregamento (RNF006), conferência em contêiner e uma decisão própria.
- [ ] **3. Sem máscara nesta tarefa.** Só o exemplo na descrição do campo; o esquema aceita o número com ou sem máscara. Desvia de `frontend.md` até alguma tarefa criar a formatação.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Estado e formulários: "máscaras de telefone, CNPJ, placa e valores; exibição com `src/shared/format` (RN035)." passa a "máscaras de telefone, CNPJ, placa e valores, aplicadas na digitação pelas mesmas funções de exibição de `src/shared/format`, sem biblioteca de máscara (RN035)."
- `src/shared/format/README.md`, Vai aqui: "funções puras de exibição, sem dependências externas" passa a "funções puras de exibição, sem dependências externas; os campos também as usam como máscara na digitação".

## Decisões técnicas

- Seguidas:
  - 0005 e 0046: a API decide o acesso, e a sessão é conferida com `getUser()`;
  - 0008: esquemas compartilhados;
  - 0010 e 0012: uma permissão por página, `PERMISSIONS`;
  - 0015 e 0044: sem e-mail, então sem "Esqueci a senha";
  - 0017: código em inglês, interface em português;
  - 0019: um só `/login`;
  - 0025: Problem Details;
  - 0027 e 0049: React Hook Form, com `Field` e `Controller`;
  - 0032: `src/proxy.ts`;
  - 0033: merge da `main`;
  - 0035: testes antes do código;
  - 0036: `import 'server-only'` em `src/server`, inclusive no que o proxy importa, conferido no protótipo;
  - 0041: wireframes só como esqueleto;
  - 0048: a troca de senha renova a sessão do navegador.

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| O `src/proxy.ts` confere a sessão e a conta como os guards: `getSessionUserId()` (`getUser`, 0046) e `loadAccount` (RS011). Roda só nas telas de acesso e nas páginas restritas (`matcher`). A decisão fica na função pura `decidePageAccess`. Toda resposta dele leva `Cache-Control: private, no-store`, e, se o Supabase falhar, a página segue sem redirecionamento. Depois do login e da troca de senha, a tela recarrega o próprio endereço, e o proxy leva ao destino | (a) Conferência "otimista", só com o token (`getClaims()`) ou a presença do cookie, como o guia de autenticação do Next.js 16.4 sugere para o proxy. (b) Chamar `GET /api/auth/me` do proxy por `fetch`. (c) `matcher` em todas as páginas, como no exemplo do `@supabase/ssr`. (d) Bloquear a página (503) quando o Supabase falha. (e) Calcular o destino depois do login no navegador, com uma função em `src/shared` | (a) Perfil, permissões e troca pendente estão no banco, não no token (0005, RS011), então o proxy precisa ler a conta de qualquer jeito. Com o `getClaims()`, uma sessão encerrada passaria pelo proxy até o token vencer, mas a API a recusaria (0046): o `api-client` levaria a `/login`, e o proxy, vendo a sessão, devolveria à área, num ciclo. Conferir como os guards mantém os dois lados de acordo. (b) Uma volta a mais pela rede, e os cookies renovados pelo `me` teriam de ser copiados para a resposta. (c) A página inicial e o catálogo esperariam o Supabase sem nada a decidir, contra o RNF006; o token também é renovado pela API. (d) O login também sairia do ar, e a API já protege os dados. (e) A regra ficaria em dois lugares, no proxy e no navegador. Consequências aceitas: cada página protegida, e cada pré-busca dos links para ela, custa uma chamada ao Supabase Auth e duas consultas; o destino depois do login passa por mais um 307 | nova (0051) |
| O Vitest testa também as funções puras de formatação (`src/shared/format`, em `tests/format/`) e a decisão de acesso às páginas (`src/server/auth/page-access.ts`, em `tests/auth/`), escritas antes do código | Conferir os redirecionamentos e a máscara só à mão; testar o `proxy.ts` inteiro com `next/experimental/testing/server` | Os sete critérios da issue são saídas de `decidePageAccess`, e a validação do `next` impede o redirecionamento para outro site. As duas cabem em testes rápidos, sem servidor nem rede, como o `api-client` (0050). A máscara aplica o formato de exibição de RN035, que as próximas telas com telefone vão usar. O utilitário experimental testaria também a ida ao Supabase, que depende de rede, e pode mudar entre versões | nova (0052), substitui 0050 |

Texto das decisões (gravadas na etapa 03):

- `docs/decisoes/0051-protecao-das-paginas-no-proxy.md`: `titulo` "Proteção das páginas com a sessão e a conta conferidas no proxy.ts, que também decide o destino depois do login", `relacionados: [RF010, RN025, RS001, RS004, RS010, RS011, 0005, 0032, 0046]`, com a decisão, as alternativas e a justificativa da tabela.
- `docs/decisoes/0052-testes-da-formatacao-e-da-protecao-das-paginas.md`: `titulo` "Testes automatizados das regras, dos esquemas, do tratamento único, do cliente da API, da formatação e da proteção das páginas", `substitui: 0050`, `relacionados: [RN035, RS014, RS017, RS018, 0035, 0050, 0051]`, idem.
- `docs/decisoes/0050-testes-do-cliente-da-api.md`: só `status:` passa a "substituída por 0052".
- `docs/decisoes/CONTEXT.md`: as linhas da 0051 e da 0052 e "(substituída por 0052)" no título da 0050.
- `docs/padroes/testes.md`, O que é testado automaticamente:
  - "e o cliente da API (`src/lib/api-client.ts`), com `fetch` e `location` simulados." passa a "o cliente da API (`src/lib/api-client.ts`), com `fetch` e `location` simulados, as funções de exibição de `src/shared/format` e a decisão de acesso às páginas (`src/server/auth/page-access.ts`).";
  - "(decisão 0050)" passa a "(decisão 0052)";
  - a lista do espelhamento ganha "`tests/format/<arquivo>.test.ts` para `src/shared/format/` e `tests/auth/<arquivo>.test.ts` para as funções puras de `src/server/auth/`";
  - novas linhas na tabela: "| Proteção das páginas | visitante, troca pendente, cliente, funcionário com e sem a permissão, sem nenhuma permissão e admin, em cada tipo de página; `next` de outro site, da API e das telas de acesso (RF010, RN025, RS004, RS010) |" e "| Formatação | telefone celular e fixo, durante a digitação e já formatado (RN035) |".
- `tests/README.md`: as pastas `auth/` e `format/`, e "decisão 0050" passa a "decisão 0052". `tests/http/README.md` e `tests/lib/README.md`: "decisão 0050" passa a "decisão 0052". `tests/auth/README.md` e `tests/format/README.md`, novos, do molde de `tests/lib/README.md`.
- `docs/plataforma/estrutura-de-pastas.md`:
  - árvore de `src/server/auth/`: "session.ts · guards.ts · login-attempts.ts · accounts.ts" passa a "session.ts · guards.ts · login-attempts.ts · accounts.ts · page-access.ts";
  - árvore de `tests/`: novas linhas "auth/  espelha as funções puras de src/server/auth (proteção das páginas)" e "format/  espelha src/shared/format".
- `src/server/auth/README.md`: "`page-access.ts` decide, sem ir ao banco, para onde o `proxy.ts` leva cada pessoa" na descrição, e "decisão de acesso às páginas, usada pelo `proxy.ts`" em "Vai aqui".

Escolhas locais, sem registro:

- `PageAccount` é um recorte da `Account` (perfil, situação, troca pendente e permissões), então `page-access.ts` não importa nada que vá ao banco.
- Depois do login, a tela chama `signIn(user)` antes de recarregar, para o cabeçalho mostrar a sessão durante a mudança de página. Depois da troca de senha, a recarga já traz a sessão nova pelo `me`.
- Navegação completa (`location.replace` e `location.assign`) depois do envio, como o `api-client`: o proxy roda, e o contexto da sessão recomeça.
- `mode: "onTouched"` nos três formulários.
- Os textos das telas ficam nos próprios componentes, porque cada um aparece num lugar só (`codigo.md`). A mensagem de acesso negado fica no componente do aviso.
- O ícone giratório do botão é o `LoaderCircle` da Lucide, sem componente novo de `ui/`. Com `prefers-reduced-motion`, a rotação para (`reset.css`).
- O cabeçalho do portal mantém o cálculo do link "Painel", que já segue a mesma regra.

## Riscos e dúvidas

- **#33 ainda aberto.** A construção depende dele (seção "Base da construção"). Se ele mudar na revisão, os contratos usados aqui são conferidos de novo antes do PR da #26.
- **Custo do proxy nas pré-buscas.** O Next.js faz a pré-busca dos links visíveis, e cada uma passa pelo proxy. No painel do admin, são até seis, cada uma com uma chamada ao Supabase Auth e duas consultas. A verificação local mede quantas são. Se pesar, uma tarefa futura pode desligar a pré-busca dos links do painel (`prefetch={false}`), que são da #25.
- **Tempo das páginas protegidas.** Cada carga de página restrita espera a sessão e a conta, como cada chamada da API já espera. As telas de acesso do visitante não esperam nada: sem cookie, o `getUser()` não vai à rede.
- **Limite de renovação do Supabase Auth.** O `token_refresh` do `config.toml` local é de 150 a cada 5 minutos por IP. As renovações do proxy e da API saem do servidor, então dividem o mesmo limite. Uma renovação só acontece quando o token de 1 hora vence; o mesmo risco do limite de entradas já está anotado na #23.
- **Páginas que ainda não existem.** `/booking`, `/appointments`, `/profile` e as páginas do painel, exceto `/admin`, chegam com os seus módulos. Até lá, o redirecionamento certo termina na página não encontrada, que não mostra o aviso de acesso negado. Os critérios são conferidos pelo endereço (`Location`), e o aviso, no dashboard provisório.
- **Pré-visualização.** Ela usa o Supabase da produção:
  - o cadastro de teste cria um cliente real, como na #24. **Ponto para a sua aprovação:** usar nos fluxos de cliente o cliente de teste da #24, se você o manteve, ou criar um pelo próprio `/register`; no 409, usar o e-mail do admin, que não cria conta;
  - não existe funcionário nem conta com senha inicial na produção até o UC16 e o UC19, então esses fluxos são conferidos só no banco local.
- **Pontos para a sua aprovação na verificação local:** as chaves do banco local no `next start`; a redução temporária do `jwt_expiry`; o cookie de teste no Lighthouse de `/set-password`.
- **`cookies()` no proxy.** A gravação dos cookies renovados depende de o Next.js 16.4.1 juntar ao `Set-Cookie` da resposta do proxy o que o `cookies()` grava, como o protótipo mostrou. Uma atualização do Next.js que mude isso quebraria a renovação. A conferência da renovação na verificação local protege esta versão.
- **Máscara e cursor.** Ao editar no meio do número, o cursor vai para o fim (L7, opção 1).
- **Parâmetros no endereço.** `registered=1` e `denied=1` ficam visíveis até a tela lê-los. Recarregar o login mostra o aviso de cadastro de novo; o de acesso negado sai do endereço.
- **Tamanho do PR.** Estimativa de 700 a 900 linhas escritas à mão, com cerca de 250 de testes, acima das ~400 do procedimento. A issue junta três telas e o proxy, e as telas dependem do proxy para levar cada pessoa ao destino. Os testes vão num commit próprio, e o proxy e as telas em commits separados.

## Fora do escopo

- As páginas restritas em si (`/profile`, `/booking`, `/appointments` e as do painel), que chegam com os seus módulos.
- A alteração voluntária de senha na área do cliente (UC04), que usa a mesma rota de troca de senha.
- Recuperação de senha, captcha e aceite de termos.
- Preencher o e-mail no login depois do cadastro (L5).
- Mostrar o tempo restante do bloqueio (`Retry-After`): a mensagem do catálogo informa o bloqueio (UC03 FE02).
- Desligar a pré-busca dos links (`prefetch`).
- Testes automatizados de componentes e do `proxy.ts` inteiro (decisão 0052).
- `loading.tsx` e `error.tsx` próprios das telas, logotipo e favicon.

## Estado da construção

Feito dentro do plano aprovado, com a opção 2 em L6, na ramificação `feat/26-access-screens` (commits a5ab868 a 0e6d47d): testes em vermelho, funções puras e esquemas, `proxy.ts`, telas e aviso, documentação e decisões 0051 e 0052, e a correção do aviso do formulário. `npm run check` aprovado, com 227 testes. Desvios pequenos e verificação local em `notas.md`; resultado em `02_relatorio.md`.
