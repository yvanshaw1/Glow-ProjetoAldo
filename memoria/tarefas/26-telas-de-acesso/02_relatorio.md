---
issue: 26
pull_request: 34
---

# Relatório: Telas de acesso e proteção das páginas: /register, /login, /set-password e src/proxy.ts

## O que foi feito

- **`/login`** (UC03, UC08, RN029, decisão 0019):
  - e-mail e senha, com o aviso de erro no topo e a opção "Criar conta" sempre visível (UC03 FE01);
  - o aviso "Conta criada..." depois do cadastro;
  - depois do login, a tela recarrega o endereço, e o `proxy.ts` leva ao `next`, à página inicial da área ou à troca de senha.
- **`/register`** (UC02, RF007):
  - nome, sobrenome, e-mail, celular com máscara, senha e confirmação de senha (L6, opção 2);
  - e-mail em uso com o atalho "Entrar" e os dados mantidos (UC02 FE02);
  - depois do cadastro, leva a `/login?registered=1`.
- **`/set-password`** (UC03 FA03, UC08 FA01, RN023, RS004): senha inicial, nova senha e confirmação; depois da troca, a pessoa segue para a sua área ou para a página que tinha pedido.
- **`src/proxy.ts`** (decisões 0032 e 0051):
  - confere a sessão e a conta como os guards, só nas telas de acesso e nas páginas restritas;
  - aplica a tabela de destino (RF010, RN001, RN025, RS001, RS004, RS010);
  - envia `Cache-Control: private, no-store` em toda resposta;
  - deixa a página seguir quando o Supabase falha.
- **Aviso de acesso negado** nos layouts do portal e do painel (UC08 FE03, RS008).
- **Máscara do celular** pela função de exibição de `src/shared/format` (RN035).
- **Esquemas dos formulários** com a confirmação de senha ("As senhas não conferem.").

## Arquivos alterados

- `src/proxy.ts`: criado.
- `src/server/auth/page-access.ts`: criado (`decidePageAccess`, `PageAccount`).
- `src/server/supabase/clients.ts`: comentário dos cabeçalhos anticache.
- `src/shared/format/phone.ts`: criado (`formatPhone`).
- `src/shared/validation/auth.ts`: `registerFormSchema` e `changePasswordFormSchema`.
- `src/app/(portal)/login/page.tsx`, `register/page.tsx` e `set-password/page.tsx`: criados.
- `src/components/portal/auth/`: `auth-card.tsx`, `form-field.tsx`, `form-alert.tsx`, `password-input.tsx`, `submit-button.tsx`, `next-param.ts`, `login-form.tsx`, `register-form.tsx` e `set-password-form.tsx`, criados.
- `src/components/shared/access-denied-notice.tsx`: criado.
- `src/app/(portal)/layout.tsx` e `src/app/(admin)/admin/layout.tsx`: o aviso de acesso negado.
- `tests/auth/page-access.test.ts` e `tests/format/phone.test.ts`, com os README das pastas: criados.
- `tests/validation/auth.test.ts`: casos da confirmação de senha.
- README de `src`, `src/server/auth`, `src/shared/format`, `src/components/portal/auth`, `tests`, `tests/http` e `tests/lib`.

## Testes executados

- `npm run check`: aprovado, com 227 testes (42 novos). Os testes ficaram no commit a5ab868, anterior ao código, e falharam antes dele.
- `npx next build`: concluído; `/login` e `/register` dinâmicas, `/set-password` estática, e o proxy compilado com o código de `src/server`.
- Local, com o `next start` ligado ao Supabase local e contas de teste criadas por roteiro:
  - **Proxy:** 46 conferências da tabela de destino, todas aprovadas:
    - visitante, conta desativada, cliente, funcionário, admin, funcionário sem permissão e as duas contas com senha inicial;
    - `next` de outro site (`//`, `/\`, `https://`), da API e das telas de acesso;
    - `Cache-Control` com `private` e `no-store` em toda resposta do proxy; a `/`, fora dele, mantém o `s-maxage`.
  - **Critério 1:** o visitante em `/booking` foi ao login, ao cadastro (com o `next`), de volta ao login com "Conta criada..." e, depois de entrar, a `/booking`, que mostra a página não encontrada até a tarefa do UC06.
  - **Critério 2:** o cliente em `/admin` foi a `/` com o aviso de acesso negado, e o `denied=1` saiu do endereço.
  - **Critério 3:** o funcionário com `dashboard` e `appointments` foi de `/admin/settings` a `/admin` com o aviso; o admin abriu `/admin/settings` sem redirecionamento.
  - **Critério 4:**
    - o cliente com senha inicial foi do login a `/set-password?next=%2Fbooking`;
    - a nova senha igual à inicial mostrou a mensagem junto ao campo, sem chamar a API;
    - a senha inicial errada mostrou "A senha atual está incorreta.";
    - a troca levou a `/booking`, e o `me` passou a `mustChangePassword: false`;
    - o funcionário com senha inicial seguiu o mesmo caminho até `/admin`;
    - o corpo enviado levou só `currentPassword` e `newPassword`.
  - **Critério 5:** "E-mail ou senha incorretos." no topo, com o foco, o e-mail e a senha mantidos, e "Criar conta" visível a 360 × 800. Também conferidos: conta desativada ("Esta conta está desativada..."), bloqueio depois de 5 erros ("Muitas tentativas...") e e-mail malformado (mensagem junto ao campo, sem chamada).
  - **Critério 6:** o e-mail de um cliente existente mostrou a mensagem de `EMAIL_IN_USE` com "Entrar" (que leva o `next`), todos os campos mantidos.
  - **Critério 7:** cliente em `/login` e `/register` vai a `/`; funcionário e admin, a `/admin`; funcionário de cargo inativo, a `/?denied=1`.
  - **Tela:**
    - 360 × 800 e 1440 × 900, temas claro e escuro, sem transbordar;
    - a máscara "(82) 99999-8888" ao digitar;
    - "As senhas não conferem." ao sair da confirmação;
    - "Mostrar senha" pelo teclado, com `aria-pressed`, e foco visível.
  - **Lighthouse 13.5.0**, acessibilidade 100 nas 12 auditorias: `/login`, `/register` e `/set-password` (esta com a sessão de um cliente com senha inicial), celular e computador, claro e escuro.
  - **Supabase Auth parado:** `/admin` e `/login` seguiram com 200, com a linha `warn` `auth_unavailable`; o login respondeu 503.
  - **Renovação do token**, com o `jwt_expiry` de 60 segundos só no banco local (alteração desfeita e conferida no `git status`): em duas rodadas seguidas, a página do proxy trouxe os cookies renovados, e o `me` continuou 200.
  - **Registro:** nenhuma senha, e-mail, token ou cookie na saída do `next start`.
- Pré-visualização: passo do desenvolvedor (veja o PR).

## Documentação atualizada

- **Módulos:**
  - `docs/acesso/protecao-das-paginas.md` (novo), `autenticacao.md`, `CONTEXT.md` e `rotas.md`;
  - `docs/acesso/UC03-autenticar-se-no-portal.md` e `UC08-autenticar-se-no-painel-administrativo.md`;
  - `docs/padroes/frontend.md`, `layouts.md` e `testes.md`;
  - `docs/plataforma/estrutura-de-pastas.md` e `mensagens-de-validacao.md`.
- **Lacunas resolvidas:**
  - L1 (página inicial de cada área), opção 1 → `protecao-das-paginas.md` e UC03;
  - L2 (parâmetro `next`), opção 1 → `protecao-das-paginas.md`;
  - L3 (telas de acesso fora do estado esperado), opção 1 → `protecao-das-paginas.md`, `autenticacao.md`, `CONTEXT.md`, `rotas.md` e o README de `src`;
  - L4 (aviso de acesso negado), opção 1 → `protecao-das-paginas.md`, `layouts.md` e UC08;
  - L5 (sucesso do cadastro), opção 1 → `rotas.md`;
  - L6 (campos de senha), **opção 2** ("Mostrar senha" e confirmação) → `frontend.md`, `mensagens-de-validacao.md` e `rotas.md`;
  - L7 (máscara do celular), opção 1 → `frontend.md` e o README de `src/shared/format`.
- **Decisões:** 0051 criada; 0052 criada, substituindo a 0050.
- **Documentos formais a atualizar:**
  - **Documentação de Análise do Sistema, Quadro 28 (UC03):** passo 5, a página inicial do portal com as opções do cliente.
  - **Documentação de Análise do Sistema, Quadro 33 (UC08):** FE03, a primeira página permitida e o aviso de acesso negado.
  - **Documentação de Arquitetura de Software, seção 9 (Quadro 38):** decisões 0051 (proteção das páginas com a sessão e a conta conferidas no `proxy.ts`, que também decide o destino depois do login) e 0052 (testes também da formatação e da proteção das páginas, no lugar da 0050).
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadro 5):** a tabela completa da proteção das páginas, a página inicial de cada área, o parâmetro `next` e o aviso de acesso negado.
  - **Documentação de Arquitetura de Software, seção 3 (frontend):** campos de senha com "Mostrar senha" e confirmação; máscaras pelas funções de `src/shared/format`.
  - **Documentação de Arquitetura de Software, seções 3.1 e 4.1:** `page-access.ts` em `src/server/auth/`, `tests/auth/` e `tests/format/`.
  - **Documentação de Análise do Sistema, seção 9.1 (Quadro 20), mensagens de validação:** "As senhas não conferem.".
  - **Documentação de Desenvolvimento com IA, seção 8:** testes automatizados da formatação e da proteção das páginas (0052).

## Pendências

- **Pré-visualização:**
  - o cadastro de teste cria um cliente na base da produção (use o da #24, se existir);
  - não há funcionário nem conta com senha inicial na produção até o UC16 e o UC19, então esses fluxos foram conferidos só no banco local.
- **Pré-busca dos links.** Com o painel do navegador do app oculto, a carga do painel do admin gerou só 2 conferências no Supabase Auth (o proxy e o `me`), e nem o cursor sobre um link disparou pré-busca. O custo das pré-buscas com a página visível fica para medir na pré-visualização; se pesar, uma tarefa pode desligar a pré-busca dos links do painel.
- **Páginas que ainda não existem:** `/booking`, `/appointments`, `/profile` e as do painel, exceto `/admin`, mostram a página não encontrada depois do redirecionamento certo, sem o aviso de acesso negado.
- **Aviso de acesso negado na mesma página:** voltar à mesma página por um link (por exemplo, "Início" em `/`) mantém o aviso; ele some ao ir a outra página.
- **Máscara:** ao editar no meio do número, o cursor vai para o fim.
- **Tamanho do PR.** São cerca de 1.050 linhas em `src`, com comentários e JSX, mais 360 de testes e 145 de documentação, acima das ~400 do procedimento. A issue junta três telas e o proxy, que dependem um do outro: as telas recarregam o endereço para o proxy levar ao destino. Os testes, as funções puras, o proxy, as telas e a documentação vão em commits separados.
