# Notas: 25-base-do-frontend

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-19 – descoberta

Conferências do planejamento, sem instalar nada no projeto:

- **Worktree.** O desta sessão é `angry-cray-d35991`, na ramificação `claude/25-base-do-frontend-c27168`, em aadac86, igual à `origin/main` (#21 a #24 e o PR #31). O worktree já tem `node_modules` (`npm ci` da #23). O plano e as notas ficam sem commit, como nas etapas 01 anteriores. A etapa 02 cria `feat/25-frontend-base` a partir da `origin/main`.
- **Outras tarefas.** Nenhum PR aberto. Das issues, só a #25 e a #26 estão abertas; não há issue do UC01 nem do UC09 para citar num `TODO`. A pasta de notas compartilhadas da sessão que iniciou esta estava vazia; a nota da #24 está na pasta de outra sessão da família.
- **Protótipo descartável** no scratchpad da sessão (`probe/`, cópia do `package.json`, do lock, das configurações, do `globals.css` e do `layout.tsx`, com `npm ci`):
  - a CLI do shadcn 4.22.1 tem `--base base|radix|aria` e os presets Nova, Vega, Maia, Lyra, Mira, Luma, Sera, Rhea e Custom; desde julho de 2026, o Base UI é o padrão;
  - `init --base base --preset nova -t next` gravou `components.json` (`style: base-nova`), `src/lib/utils.ts` (`export { cn } from "cn"`), `button.tsx`, o CSS com `@import "tw-animate-css"` e `@import "shadcn/tailwind.css"`, e a fonte Geist no `layout.tsx`;
  - a CLI acrescentou em `dependencies`, com `^`: `@base-ui/react` 1.9.0, `class-variance-authority` 0.7.1, `cn` 0.5.0, `lucide-react` 1.59.0, `shadcn` 4.22.1 e `tw-animate-css` 1.4.0;
  - `add input label field alert sheet skeleton` criou também `separator.tsx`; `add form` não criou nada (não há `form` para Base UI);
  - o `sheet.tsx` tem o texto oculto "Close", em inglês; os gerados não seguem o Prettier do projeto;
  - **auditoria:** com o `shadcn` em `dependencies`, `npm audit --omit=dev --audit-level=high` (o passo do CI) acusou 7 falhas altas (`braces` → `micromatch` → `fast-glob` → `@shadcn/registry`, `ts-morph`, `shadcn`); com `shadcn` e `tw-animate-css` em `devDependencies`, 0. Na `main`, 0;
  - `npx -y npm@11.21.1 install` refez o lock; o aviso `install-scripts` dele é do `unrs-resolver`, que já existia (ESLint do Next.js);
  - `next build`, ESLint e TypeScript aceitaram os componentes gerados com o carregador `@tailwindcss/turbopack`; o `next/font/google` baixou a fonte no build;
  - o Next.js 16.4.1 não mostra mais o tamanho das páginas no fim do `next build`.
- **Versões no npm em 19/10/2026:** `react-hook-form` 7.90.0 (11/10); `@hookform/resolvers` 5.9.2 (17/10) e 6.0.0 (19/10), ambos com `zod` `^3.25.0 || ^4.0.0`; `@base-ui/react` 1.9.0 (09/10); `cn` 0.5.0 (16/10); `lucide-react` 1.59.0 (17/10); `lighthouse` 13.5.0 (18/09).
- **Next.js 16.4.1** (`node_modules/next/dist/docs`): o `error.tsx` recebe `error` e `retry` (desde a 16.2), e `reset` fica para casos raros; o `not-found.tsx` na raiz atende aos endereços sem rota e aparece dentro do layout raiz.
- **Contraste.** Calculado por um roteiro no scratchpad (`contrast.mjs`), pela fórmula da WCAG, com as transparências dos componentes (`/80`, `/10`, `/50`) misturadas sobre o fundo. As duas paletas de L1 passam de 4,5:1 em todo texto; na clara, o anel de foco a 50% fica abaixo de 3:1, mas a borda do componente focado usa a cor cheia.
- **Documentação:**
  - o UC08 (FA03) leva ao login depois do "Sair" no painel, e o UC03 (FA05), à página inicial;
  - o RF005 quer o cabeçalho também em `/login` e `/register`;
  - o README de `components/portal/layout/` põe os dados da empresa no rodapé (RN028), mas `GET /api/public/company` ainda não existe;
  - o glossário (`guia/mapa.md`) já tem "Cliente · Funcionário · Administrador" para os perfis;
  - `public/` só tem o `.gitkeep`, sem logotipo nem favicon.
- **Máquina:** Chrome e Edge instalados (para o Lighthouse em linha de comando); o worktree não tem `.env.local`, necessário à conferência em contêiner.

## 2026-10-19 – decisão

Primeira versão do plano em `aguardando_aprovacao`, com as lacunas L1 a L10 e as decisões novas 0049 (shadcn/ui sobre Base UI, com os pacotes só de CSS em `devDependencies`) e 0050 (testes do cliente da API, substitui a 0045). Nada foi construído.

Pontos explícitos para a aprovação: as chaves do banco local no `next start`, a rota temporária de sessão e a página temporária de erro (como na #23 e na #24); a página provisória `/admin`; como conferir a pré-visualização sem a tela de login. Passo do desenvolvedor: copiar o `.env.local` para o worktree antes da conferência em contêiner.

## 2026-10-19 – decisão

O Yvan enviou, na conversa, a direção de design do frontend: neomorfismo com laranja, paletas clara e escura e um design system derivado de φ = 1,618 (Nunito; escalas de tipografia, espaçamento, raio, sombra, movimento e pontos de quebra; estados; ícones; imagens). O texto foi gerado por outra IA e deve ser analisado e documentado só no necessário, em `docs/`. Ele também pediu imagens e ícones de fontes públicas, e que fique documentado que os wireframes são só esqueleto e que o estilo segue o padrão de design.

O plano foi refeito com a nova direção. A primeira versão tinha a paleta grafite e âmbar e a fonte Plus Jakarta Sans, que saíram. As lacunas passaram a L1 a L14: design (L1 a L6), layouts (L7 a L9), cliente da API e sessão (L10 a L13) e verificação (L14).

Análise (roteiro `neu.mjs` no scratchpad, fórmula da WCAG):

- **Tema escuro enviado:** passa em tudo. Texto 11,75; secundário 4,85; laranja 6,53; laranja profundo 4,55. O texto do botão laranja precisa ser a cor do fundo (6,53): nem o texto principal (1,80) nem o branco (2,10) passam.
- **Tema claro enviado:** falha em quatro usos.
  - texto secundário `#8B7355`: 3,66;
  - laranja primário como texto: 1,89;
  - laranja profundo como texto: 3,51 (serve como foco, que pede 3:1);
  - sombra escura como borda de campo: 1,63.

  O branco não passa sobre nenhum laranja, e o texto principal sobre o laranja primário dá 6,63.
- **Ajustes propostos:** texto secundário `#745F46` (4,94); link `#A34A26` (4,80); borda de campo `#8A7966` (3,42) e, no escuro, `#808075` (3,43); erro `#A8231C` (5,86) e, no escuro, `#FF9B8F` (6,75).
- **Tailwind 4.3** (`node_modules/tailwindcss/theme.css`): tem os namespaces `--inset-shadow-*`, `--text-*--line-height` e `--breakpoint-*`. As curvas padrão (`ease-in`, `ease-out`, `ease-in-out`) e os 150 ms da transição padrão já são os valores do documento enviado.
- **Itens descartados ou ajustados do documento enviado:**
  - texto de 10 px, que fica abaixo do legível;
  - redefinir `text-xs` e `text-sm`, o que encolheria os componentes;
  - pontos de quebra 1240 e 2000, sem requisito, porque os componentes usam os do Tailwind;
  - 636 ms, porque não há transição de página;
  - Phosphor, porque a Lucide já vem com o shadcn;
  - IE11, porque o RNF009 pede só os navegadores atuais.
- **Wireframes:** que são só esqueleto já estava em `wireframes/README.md`, `frontend.md`, `AGENTS.md` e na 0041, mas só para as cores. O L1 estende a regra ao estilo visual inteiro e aponta para `docs/padroes/design.md`.
- **Imagens:** a #25 não tem tela com imagem. A seção de destaque é do UC01, e as imagens dos serviços entram pelo painel (RS015). O L6 propõe as regras agora (Unsplash e Pexels, licença conferida, crédito registrado em `design.md`) e o download nas tarefas das páginas, com o aval do Yvan para cada arquivo.

## 2026-10-19 – decisão

O Yvan pediu no plano um arquivo de reset, para zerar o estilo dos navegadores, e um `globals.css` para as variáveis globais. Entrou como L15, com o conteúdo em "CSS global" no plano.

- **Preflight.** O Preflight do Tailwind 4.3 (`node_modules/tailwindcss/preflight.css`) já zera margens, espaçamentos internos e bordas (`0 solid`), usa `box-sizing`, tira o tamanho e o peso dos títulos, o estilo de listas e links e o fundo dos controles, faz os controles herdarem a fonte e deixa as imagens em bloco com `max-width: 100%`.
- **O que fica de fora do Preflight:** `overflow-wrap` e `text-wrap`, a altura da tela no `body`, o movimento reduzido e o foco (fora o do Firefox).
- **`reset.css`:** a recomendação é cobrir só essas faltas, sem cores nem variáveis, na camada `base`. Um reset completo próprio ou por `all: unset` quebraria os componentes do shadcn/ui e do Base UI e o foco.
- **Base UI** (guia de início rápido, lido pela web): pede `isolation: isolate` na raiz da aplicação, por causa dos menus em portal, e `body { position: relative }`, pelo fundo dos menus no Safari do iOS 26. O primeiro vira a classe `isolate` no layout raiz, e o segundo vai para o `reset.css`.

## 2026-10-19 – decisão

Plano aprovado por yvan (19/10/2026), com a opção 1 em L1 a L15. Status em `em_execucao`. Os pontos para aprovação (chaves do banco local no `next start`, rota temporária de sessão, página temporária de erro e página provisória `/admin`) foram aprovados com o plano.

Na conversa, o Yvan lembrou que o projeto é mobile first. A verificação passou a começar sempre pelos 360 px.

## 2026-10-19 – descoberta

Etapa 02:

- **Ramificação.** `feat/25-frontend-base` criada da `origin/main` (aadac86), sem vínculo com a `main`.
- **`next dev` esquecido.** O primeiro `npm ci` falhou com EPERM no `next-swc.win32-x64-msvc.node`, porque um `next dev -p 3023` deixado pela sessão da #23 neste mesmo worktree (desde 13:40) segurava o arquivo. Os três processos foram encerrados por PID, e o `npm ci` passou.
- **Commits, nesta ordem:**
  - 209ae48: testes em vermelho, com o módulo ainda inexistente;
  - f7649ec: shadcn/ui e dependências;
  - 1c1ada3: `api-client`, com 15 testes verdes;
  - aa11b71: `design.md` e `design-midia.md`;
  - d9c3540: sessão;
  - c0aa55b: tema, reset e componentes;
  - f559d9e: layouts e páginas de erro;
  - a26bb82: documentação e decisões 0049 e 0050;
  - 7fbc271: correção do `cn`.
- **Lock.** A CLI do shadcn instalou com o npm 11.6.2, que mexeu nas entradas `@emnapi`. O lock foi restaurado e refeito com `npx -y npm@11.21.1 install` depois de ajustar o `package.json`, sem nenhuma entrada `@emnapi` removida. `npm ci` e `npm audit --omit=dev --audit-level=high` com 0.
- **Divisões de módulo.** `design.md` passou do limite de 2 mil tokens, e ícones e imagens foram para `design-midia.md`, como o L1 previa. `frontend.md` chegou a 8,6 mil caracteres com "Layouts", que foi para `docs/padroes/layouts.md`: desvio registrado como L16 no plano, que voltou a `aguardando_aprovacao`.
- **`cn` do shadcn.** O pacote `cn` 0.5.0 segue as regras do tailwind-merge e tratava `text-h3` como cor: a marca saiu com 16 px. Corrigido com `createCn` de `cn/config` em `src/lib/utils.ts`, e os componentes de `ui/` passaram a importar dele.
- **`guia/CONTEXT.md`** cita os padrões por área (`frontend.md`, `backend.md`...) e não os módulos novos (`design.md`, `layouts.md`). Fora da lista do plano, ficou sem mudança; sugestão para o relatório.
- **Formulário.** O formulário temporário com `useForm`, `zodResolver(registerSchema)`, `Controller` e `Field` compilou sem erro e foi apagado.

## 2026-10-19 – descoberta

Verificação local, com o Supabase local, `next build` e `next start -p 3025`, as variáveis por `local/local-env.sh` e as contas por `local/accounts.mjs` no scratchpad. As contas são: cliente; funcionário "Atendimento" (`appointments`, `clients`); funcionário de cargo inativo; admin. A sessão foi aberta pela rota temporária `api/dev-check/session`, com as credenciais no ambiente do processo.

- **Painel por permissões:**
  - o funcionário "Atendimento" vê só "Agendamentos" e "Clientes", a 360 px (menu lateral à esquerda) e a 1440 px (barra fixa);
  - o admin vê as seis, na ordem de RN025;
  - o cargo inativo não vê nenhuma, só "Ana Lima / Funcionário / Sair".
- **Portal:**
  - visitante: "Entrar" e "Criar conta";
  - cliente: "Agendar", "Meus agendamentos", "Minha conta" e "Sair";
  - funcionário: "Painel", que leva a `/admin/appointments`, e "Sair"; sem "Painel" no cargo inativo;
  - "Sair" responde 204 e volta a `/` como visitante, e o `me` seguinte responde 401.
- **360 px:**
  - nada transborda em `/`, `/admin`, endereço inexistente e página de erro;
  - os menus abrem pelo clique e pelo Enter, fecham com Esc e devolvem o foco ao botão;
  - os alvos de toque têm 40 px;
  - os títulos descem um passo (h1 de 42 px).
- **Teclado.** O primeiro Tab cai em "Pular para o conteúdo", com o contorno de 2 px no laranja profundo.
- **Tema escuro**, por emulação de `prefers-color-scheme`: fundo `#2E2E24` e texto `#F2EDE4`.
- **Supabase Auth parado:** o painel mostra o aviso de `SERVICE_UNAVAILABLE` com "Tentar novamente", que recupera a navegação depois de religado; o portal mostra as opções de visitante. O aviso aparece depois de alguns segundos, porque o servidor espera a resposta do Supabase Auth.
- **Conta desativada pelo SQL:** o `me` responde 403, o provedor chama o logout (204), e o cabeçalho volta ao de visitante.
- **Lighthouse 13.5.0** na `/`: acessibilidade 100 no celular e no computador, nos temas claro e escuro (`--force-dark-mode`), com `color-contrast` aprovado e nenhuma auditoria reprovada. Desempenho: 0,97 no celular, com LCP simulado de 2,7 s, e 1,0 no computador (LCP 0,6 s); CLS 0.
- **CSS compilado:** Preflight uma vez, `reset.css` na camada `base`, variáveis dos dois temas e sombras com as cores do tema ativo.
- **Captura sem interface.** Uma captura do Chrome sem interface a 360 px cortou o botão do menu, porque a janela tem largura mínima de cerca de 500 px. A emulação do navegador do app mostrou o botão.
- **Temporários.** A rota e a página temporárias foram apagadas antes do commit da correção do `cn`, e o `git status` ficou limpo. O `next start` continua na porta 3025, com o build que tem a rota, para o Yvan navegar como admin de teste.
- **Conta real.** O Yvan passou na conversa o e-mail e a senha do admin da produção. O agente não os usou: a conta não existe no banco local, e entrar na produção com senha real é proibido. Foi recomendada a troca da senha.
- **Falta:** a conferência em contêiner, que precisa do `.env.local` copiado pelo Yvan para o worktree, e a etapa 03.

## 2026-10-19 – decisão

L16 aprovado com a opção 1, com o `aprovado_em` mantido. O Yvan copiou o `.env.local` para o worktree.

## 2026-10-19 – descoberta

Etapa 03:

- **Contêiner** (`docker compose up --build -d`): a imagem compilou, baixando a Nunito no build. `/` e `/admin` responderam 200, um endereço inexistente 404 e o `me` de visitante 401. O CSS do tema e a fonte são servidos pelo próprio site, e o processo roda como `node` (UID 1000). `docker compose down` encerrou.
- **Ambiente local encerrado:** o `next start` da porta 3025, por PID, e o Supabase local, com `npx supabase stop`.
- **`main`:** sem commits novos (aadac86).
- **Relatório e plano:** relatório gravado e plano em `concluido`.
