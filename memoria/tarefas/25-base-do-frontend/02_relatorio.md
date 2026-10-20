---
issue: 25
pull_request: <número>
---

# Relatório: Base do frontend: shadcn/ui, tema, cliente da API, sessão e layouts

## O que foi feito

- **Componentes base:** shadcn/ui sobre Base UI, com o preset Nova (decisão 0049): botão, campo, rótulo, `Field`, separador, aviso, menu lateral e lugar reservado. Os formulários usam React Hook Form 7.90 com o `zodResolver`.
- **Sistema de design do Glow:** neomorfismo com laranja e temas claro e escuro pela preferência do sistema. As escalas vêm de φ, com contraste de 4,8:1 ou mais em todo texto e de 3:1 em borda de campo e foco (RNF005).
- **CSS global** em dois arquivos: `reset.css`, com o que o Preflight do Tailwind não cobre, e `globals.css`, com as variáveis do tema e as regras base.
- **Cliente HTTP único** (`src/lib/api-client.ts`):
  - JSON e Problem Details;
  - só o 401 `UNAUTHENTICATED` leva a `/login?next=<página atual>`, e a carga da sessão não redireciona;
  - o 403 `PASSWORD_CHANGE_REQUIRED` leva a `/set-password`;
  - nenhuma chamada é repetida;
  - a falha de rede e a resposta fora do formato usam as mensagens do catálogo.
- **Contexto da sessão**, carregado de `GET /api/auth/me` a cada carga de página: visitante no 401; logout e visitante na conta desativada; "indisponível" na falha. Oferece `signIn`, `signOut` e `reload`.
- **Layout do portal:** cabeçalho por perfil, com entrar e criar conta, ou sair, e menu à direita no celular, e rodapé com acesso rápido (RF005, UC01 FA01, UC03 FA05).
- **Layout do painel:** navegação só com as páginas do cargo, na ordem de RN025, com todas para o admin. É uma barra fixa a partir de 1024 px e um menu lateral no celular, com o bloco do usuário e "Sair" (RN025, RN027, RF036, UC08 FA03).
- **Páginas:** `not-found.tsx`, `error.tsx` e a página provisória `/admin`.

## Arquivos alterados

- `package.json` e `package-lock.json`: `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `react-hook-form`, `@hookform/resolvers`; `shadcn` e `tw-animate-css` em `devDependencies`.
- `components.json`, `src/lib/utils.ts` (`cn()` com os tamanhos de título do tema) e `src/components/ui/`: `button`, `input`, `label`, `field`, `separator`, `alert`, `sheet` e `skeleton`, com as variantes de `docs/padroes/design.md`.
- `src/lib/api-client.ts`: criado.
- `src/hooks/use-session.ts` e `src/components/shared/session-provider.tsx`, `brand-link.tsx` e `sign-out-button.tsx`: criados.
- `src/components/portal/layout/site-header.tsx` e `site-footer.tsx`; `src/components/admin/layout/admin-nav.tsx` e `admin-top-bar.tsx`: criados.
- `src/app/layout.tsx` (Nunito, atalho para o conteúdo, `SessionProvider`), `globals.css` e `reset.css`, `not-found.tsx` e `error.tsx`.
- `src/app/(portal)/layout.tsx` e `page.tsx`; `src/app/(admin)/admin/layout.tsx` e `page.tsx`.
- `src/shared/constants/permissions.ts` (`PERMISSION_PAGES`) e `profiles.ts` (`PROFILE_LABELS`).
- `tests/lib/api-client.test.ts` e `tests/lib/README.md`: criados.
- README de `src/app`, `src/app/(admin)/admin`, `src/components/ui`, `tests` e `tests/http`.

## Testes executados

- `npm run check`: aprovado, com 185 testes (15 novos). Os testes ficaram no commit 209ae48, anterior ao código, e falharam antes dele, com o módulo ainda inexistente.
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. Com o `shadcn` em `dependencies`, como a CLI grava, seriam 7 falhas altas.
- `npx next build`: concluído, com `/`, `/admin` e `/_not-found` estáticas.
- Formulário temporário com `useForm`, `zodResolver(registerSchema)`, `Controller` e `Field`: tipos aprovados, e o arquivo foi apagado.
- Local, com o `next start` ligado ao Supabase local, contas de teste criadas por roteiro e uma rota temporária de sessão, apagada antes do commit:
  - **Painel:**
    - o funcionário com `appointments` e `clients` vê só "Agendamentos" e "Clientes", a 360 px (menu lateral à esquerda) e a 1440 px (barra fixa);
    - o admin vê as seis, na ordem de RN025;
    - o cargo inativo vê só o nome, o perfil e "Sair".
  - **Portal:**
    - visitante: "Entrar" e "Criar conta";
    - cliente: "Agendar", "Meus agendamentos", "Minha conta" e "Sair";
    - funcionário: "Painel", que leva à primeira página permitida;
    - "Sair" responde 204 e volta a `/` como visitante.
  - **360 px:**
    - nada transborda em `/`, `/admin`, endereço inexistente e página de erro;
    - os menus abrem pelo clique e pelo Enter, fecham com Esc e devolvem o foco ao botão;
    - os alvos de toque têm 40 px;
    - o primeiro Tab cai em "Pular para o conteúdo", com o contorno de foco visível.
  - **Tema escuro**, por emulação: as cores do escuro aplicadas.
  - **Supabase Auth parado:** o painel mostra o aviso com "Tentar novamente", que recupera a navegação; o portal mostra as opções de visitante.
  - **Conta desativada depois do login:** o logout é chamado, e o cabeçalho volta ao de visitante.
  - **Lighthouse 13.5.0** na `/`: acessibilidade 100 no celular e no computador, nos temas claro e escuro, com `color-contrast` aprovado e nenhuma auditoria reprovada. Desempenho: 97 no celular (LCP simulado de 2,7 s; CLS 0) e 100 no computador.
- **Contêiner** (`docker compose up --build -d`, com o `.env.local` copiado pelo Yvan): a imagem compilou, baixando a Nunito no build. `/` e `/admin` responderam 200, um endereço inexistente 404 e o `me` de visitante 401. O CSS do tema e a fonte são servidos pelo próprio site, e o processo roda como `node` (UID 1000). `docker compose down` encerrou.
- **Pré-visualização:** passo do desenvolvedor (veja o PR).

## Documentação atualizada

- **Módulos:**
  - `docs/padroes/design.md`, `design-midia.md` e `layouts.md` (novos);
  - `docs/padroes/frontend.md` e `testes.md`;
  - `docs/CONTEXT.md`;
  - `docs/acesso/autenticacao.md`;
  - `docs/catalogo/UC01-consultar-portal-publico.md`;
  - `docs/plataforma/estrutura-de-pastas.md` e `visao-geral.md`;
  - `wireframes/README.md`;
  - `workflows/procedimentos/testes.md`;
  - `guia/regras.md` e `AGENTS.md`.
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (onde ficam os padrões de design) → `design.md`, `frontend.md`, `docs/CONTEXT.md`, `wireframes/README.md` e `AGENTS.md`;
  - L2 (paleta e WCAG) e L3 (temas) → `design.md`;
  - L4 (escalas φ) e L5 (neomorfismo e acessibilidade) → `design.md` e o README de `src/components/ui/`;
  - L6 (imagens e ícones) → `design-midia.md` e `estrutura-de-pastas.md`;
  - L7 (cabeçalho do portal) → `layouts.md` e UC01;
  - L8 (rodapé) e L9 (bloco do usuário) → `layouts.md`;
  - L10 (401 e sessão em página pública) → `frontend.md` e `autenticacao.md`;
  - L11 (sessão com conta desativada ou falha) e L12 (erros que voltam à tela) → `frontend.md`;
  - L13 (aviso no formulário) → `frontend.md` e o README de `src/components/ui/`;
  - L14 (verificação de telas) → `workflows/procedimentos/testes.md`;
  - L15 (arquivos de CSS) → `frontend.md`, `estrutura-de-pastas.md` e o README de `src/app/`;
  - L16 (`layouts.md` separado, achado na construção) → `layouts.md`, `frontend.md` e `docs/CONTEXT.md`.
- **Decisões:** 0049 criada; 0050 criada, substituindo a 0045.
- **Documentos formais a atualizar:**
  - **Documentação de Análise do Sistema, seção 10.2 (Quadro 26):** no FA01 do UC01, as opções do cliente (Agendar, Meus agendamentos e Minha conta) e a de sair.
  - **Documentação de Arquitetura de Software, seção 9 (Quadro 38):** decisões 0049 (shadcn/ui sobre Base UI, com os pacotes só de CSS em `devDependencies`) e 0050 (testes também do cliente da API, no lugar da 0045).
  - **Documentação de Arquitetura de Software, seção 2 (stack):** shadcn/ui sobre Base UI.
  - **Documentação de Arquitetura de Software, seção 3 (frontend):**
    - formulários com `Field` e `Controller`;
    - regras do `api-client` (401, 403, 409, falha de rede e resposta fora do formato);
    - estados da sessão;
    - CSS global em `reset.css` e `globals.css`;
    - layouts do portal e do painel;
    - padrões de design (cores dos dois temas com o contraste, tipografia, escalas, sombras, estados, ícones e imagens).
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadro 5):** o parâmetro `next` do `/login`, só com caminho interno.
  - **Documentação de Arquitetura de Software, seções 3.1 e 4.1:** `reset.css` em `src/app/`, `tests/lib/` e `public/images/`.
  - **Documentação de Desenvolvimento com IA, seção 8:** testes automatizados do cliente da API (0050) e os passos de verificação de telas (Lighthouse, 360 e 1440 px, dois temas).

## Pendências

- **Pré-visualização sem tela de login.** Os estados com sessão só podem ser conferidos abrindo a sessão pelo console do navegador, com a sua conta de admin, ou na pré-visualização da #26. Não existe funcionário na produção até o UC19, então o critério do funcionário com duas permissões foi conferido só no banco local.
- **Tamanho do PR.** São cerca de 1.020 linhas escritas à mão em `src`, com o CSS do tema e os README, mais 589 geradas pela CLI do shadcn, num commit próprio, e o lock. É mais que as ~400 do procedimento. A issue junta componentes, tema, cliente da API, sessão e dois layouts, que dependem uns dos outros: os layouts usam a sessão, a sessão usa o cliente, e todos usam o tema.
- **LCP no celular.** O Lighthouse local simulou 2,7 s no celular, acima da meta de 2,5 s de `frontend.md`, numa página só com o título. Fica para medir na pré-visualização e na tarefa do UC01, que monta a página inicial.
- **Para a #26:**
  - o `/login` lê o `next` e só o aceita com caminho interno;
  - o `proxy.ts` usa `PERMISSION_PAGES` para a primeira página permitida e decide o destino do funcionário de cargo inativo;
  - as telas usam `Field`, `Controller` e `zodResolver`, o `Alert` no topo do formulário, e `signIn` ou `reload` depois do login e da troca de senha.
- **Para o UC01:** contato, endereço, redes sociais e nome da empresa no rodapé, por `GET /api/public/company` (RN028); imagens da página inicial conforme `design-midia.md`.
- **`guia/CONTEXT.md`** cita os padrões por área e não os módulos novos (`design.md`, `layouts.md`). Fora desta tarefa, se quiser, vira uma tarefa de documentação.
- **Componentes gerados.** Uma atualização dos componentes de `src/components/ui/` pela CLI sobrescreve as variantes e o import do `cn`, que precisam ser refeitos (`design.md`).
- **Logotipo e favicon:** não há arquivos; a marca é o texto "Glow".
