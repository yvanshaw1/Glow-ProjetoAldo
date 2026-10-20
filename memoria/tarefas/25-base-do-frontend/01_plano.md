---
issue: 25
titulo: "Base do frontend: shadcn/ui, tema, cliente da API, sessão e layouts"
areas: [frontend, testes]
tipo: funcionalidade
requisitos: [RNF001, RNF003, RNF004, RNF005, RNF006, RNF009, RNF016, RN025, RN027, RN028, RS004, RS008, RF005, RF009, RF034, RF036, UC01, UC03, UC08]
status: concluido
aprovado_por: yvan
aprovado_em: 19/10/2026
---

# Plano: Base do frontend: shadcn/ui, tema, cliente da API, sessão e layouts

## Objetivo

Preparar o que toda tela vai usar (RNF001, RNF003, RNF004, RNF005, RNF009, RNF016):

- os componentes do shadcn/ui (decisão 0007), agora sobre Base UI (decisão nova 0049);
- o sistema de design do Glow: neomorfismo com laranja, temas claro e escuro e escalas derivadas da razão áurea, documentado em `docs/padroes/design.md` e aplicado em `@theme` e nos componentes (L1 a L6);
- o React Hook Form 7.90 com o resolver do Zod (decisão 0027);
- o cliente HTTP único `src/lib/api-client.ts`;
- o contexto da sessão, carregado de `GET /api/auth/me`.

A tarefa monta os layouts do portal e do painel. O do portal tem cabeçalho com entrar e criar conta, ou sair, e rodapé (RF005, UC01 FA01, UC03 FA05). O do painel tem a navegação só com as páginas permitidas e, no celular, menu lateral (RN025, RN027, RF036, UC08 FA03). Entram ainda as páginas `not-found.tsx` e `error.tsx`. A navegação só orienta, e quem decide o acesso continua sendo a API (RS008). Nenhuma rota da API muda, e não há migration.

## Como funciona

### Sistema de design (`docs/padroes/design.md`)

Base: a paleta e o design system enviados pelo desenvolvedor em 19/10/2026 (neomorfismo com laranja, φ = 1,618), analisados contra a WCAG, o Tailwind 4 e o shadcn/ui. O que entra, com as correções, está em L1 a L6:

| Assunto | Resumo | Lacuna |
|---|---|---|
| Onde fica | `docs/padroes/design.md`, novo; `frontend.md` continua com a engenharia e ganha "Layouts" | L1 |
| Cores | as duas paletas enviadas, com 4 valores do tema claro escurecidos para passar na WCAG e a cor de erro, que faltava | L2 |
| Temas | claro e escuro pela preferência do sistema (`prefers-color-scheme`), sem botão de troca | L3 |
| Escalas | tipografia, raios e sombras com os valores φ exatos; espaçamento φ arredondado para a grade de 4 px do Tailwind; pontos de quebra do Tailwind; mínimo de 12 px no texto | L4 |
| Neomorfismo | superfícies e botões secundários em relevo; botão principal preenchido de laranja; campo rebaixado com borda de 3:1; foco com contorno | L5 |
| Imagens e ícones | Lucide para os ícones; imagens de bancos públicos de licença livre, com crédito registrado, obtidas nas tarefas das páginas que as usam | L6 |

Fonte: Nunito, como enviado, pelo `next/font/google`, em arquivo variável (pesos 300 a 700 usados), servida pelo próprio site. A pilha de fontes do sistema fica como reserva.

O que fica de fora do documento enviado, por não ter uso ou requisito: o ponto de quebra de 2.000 px, a duração de 636 ms (não há transição de página), o texto de 10 px, a tipografia Phosphor e o suporte ao IE11 (RNF009 pede só os navegadores atuais).

### Componentes base (shadcn/ui)

1. `npx -y shadcn@4.22.1 init --base base --preset nova -t next` (decisão 0049). A CLI grava:
   - `components.json`, com o estilo `base-nova`, os ícones `lucide` e os atalhos `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils` e `@/hooks`;
   - `src/lib/utils.ts`, com o `cn()` (`export { cn } from "cn"`);
   - `src/components/ui/button.tsx`;
   - o CSS base em `globals.css`, que o tema substitui;
   - a fonte Geist em `layout.tsx`, que a Nunito substitui.
2. `npx -y shadcn@4.22.1 add input label field alert sheet skeleton` (o `field` traz o `separator`):

   | Componente | Uso |
   |---|---|
   | `button`, `input`, `label`, `field` e `separator` | botão, campo e formulário das telas de acesso (#26); o botão também nos layouts |
   | `alert` | aviso no formulário (L13) e em `error.tsx` |
   | `sheet` | menu lateral do painel e menu do portal no celular |
   | `skeleton` | lugar reservado enquanto a sessão carrega, sem deslocar a página |

3. Com Base UI não existe o componente `form`: no teste do planejamento, `shadcn add form` não criou nada. Os formulários usam `Field`, `FieldLabel` e `FieldError` com o `Controller` do React Hook Form e o `zodResolver` de `@hookform/resolvers/zod`, com os esquemas de `src/shared/validation`. Na construção, um formulário temporário com `useForm`, `zodResolver(registerSchema)` e `Field` confere só os tipos e é apagado antes do commit. A #26 constrói os formulários de verdade.
4. Ajustes nos arquivos gerados, num commit separado do código gerado:
   - Prettier;
   - o texto oculto "Close" do `sheet.tsx` passa a "Fechar" (RNF016);
   - as variantes de `button`, `input`, `alert`, `sheet` e `skeleton` passam ao tratamento de L5: sombras, estados e raios do tema. A variante `link` do botão usa a cor de link, porque o laranja primário não pode ser texto no tema claro (L2).

Dependências, conferidas num protótipo descartável no scratchpad da sessão, em 19/10/2026:

| Pacote | Versão | Onde | Para quê |
|---|---|---|---|
| `@base-ui/react` | 1.9.0 | `dependencies` | primitivas dos componentes |
| `class-variance-authority` | 0.7.1 | `dependencies` | variantes dos componentes |
| `cn` | 0.5.0 | `dependencies` | o `cn()` que junta as classes do Tailwind, dos mantenedores do shadcn |
| `lucide-react` | 1.59.0 | `dependencies` | ícones (L6) |
| `react-hook-form` | 7.90.0 | `dependencies` | formulários, na versão da stack (decisão 0027) |
| `@hookform/resolvers` | 5.9.2 | `dependencies` | `zodResolver`, compatível com o Zod 4; a 6.0.0 saiu em 19/10 e fica de fora |
| `shadcn` | 4.22.1 | `devDependencies` | só o `shadcn/tailwind.css`, lido no build |
| `tw-animate-css` | 1.4.0 | `devDependencies` | animações do menu lateral, só CSS |

As versões ficam fixas, sem `^`, como `next`, `react` e `zod`. A CLI grava tudo em `dependencies` com `^`.

No protótipo, com o `shadcn` em `dependencies`, o passo de auditoria do CI (`npm audit --omit=dev --audit-level=high`) acusou 7 falhas altas. A cadeia é `braces` → `micromatch` → `fast-glob` → `@shadcn/registry`, `ts-morph` e `shadcn`. Com `shadcn` e `tw-animate-css` em `devDependencies`, a auditoria dá 0 (decisão 0049).

A CLI instala pelo npm 11.6.2 da máquina, que poda as entradas `@emnapi/*`. Por isso, depois dela, o `package.json` é ajustado e o lock é refeito com `npx -y npm@11.21.1 install`, e o `npm ci` confirma o lock. No protótipo, o `next build`, o ESLint e o TypeScript aceitaram os componentes gerados, com o carregador `@tailwindcss/turbopack`. Só o Prettier pediu formatação.

Peso no carregamento (RNF006): `@base-ui/react` e `lucide-react` entram por componente e por ícone importado. O Lighthouse local também roda a categoria de desempenho na `/`, só para registro.

### CSS global (`src/app/reset.css` e `src/app/globals.css`)

Dois arquivos, conforme L15. O `@import "tailwindcss"` já traz o Preflight, o reset do Tailwind. Ele zera margens, espaçamentos internos e bordas, usa `box-sizing: border-box`, tira o tamanho e o peso dos títulos, o estilo de listas e links e o fundo dos controles de formulário, faz os controles herdarem a fonte e deixa as imagens em bloco, limitadas à largura. Os componentes do shadcn/ui e do Base UI contam com ele.

**`src/app/reset.css`**: só o que o Preflight não cobre, sem cores, fontes nem variáveis do tema. Fica na camada `base`, então as classes do Tailwind continuam valendo sobre ele.

| Regra | Para quê |
|---|---|
| `body { min-height: 100dvh; position: relative; -webkit-font-smoothing: antialiased; }` | página com a altura da tela; `position: relative` é o pedido do Base UI para o fundo dos menus cobrir a tela no Safari do iOS 26 |
| `h1` a `h6`: `text-wrap: balance`; `overflow-wrap: break-word` | títulos com linhas equilibradas, e palavra longa sem transbordar em 360 px (RNF001) |
| `p`, `li`, `dd`, `figcaption`: `text-wrap: pretty`; `overflow-wrap: break-word` | sem palavra sozinha na última linha, e e-mail ou endereço longo sem transbordar |
| `@media (prefers-reduced-motion: reduce)`: animações e transições de 0,01 ms em todos os elementos, com `!important` | quem pede menos movimento no sistema não vê animação (L4); o `!important` é o padrão dessa regra, para valer sobre as classes |

**`src/app/globals.css`**: a entrada do CSS, a única importada pelo layout raiz, nesta ordem:

1. Os imports: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css` e `./reset.css` na camada `base`.
2. As variáveis globais:
   - as cores do tema claro em `:root`, e as do escuro em `@media (prefers-color-scheme: dark)`, com `color-scheme: light dark` (L2, L3);
   - o `@theme inline`, que liga as cores às classes do Tailwind (`bg-background`, `text-muted-foreground`, `bg-primary`...) e a fonte (`--font-sans`, a Nunito do `next/font/google`, com a pilha do sistema como reserva);
   - o `@theme` com os tokens de L4: raios, sombras duplas (`--shadow-neu-*` e `--inset-shadow-neu-*`, que usam as cores de sombra do tema ativo), títulos (`--text-h1`...), `--container-page`, `--spacing-header` e `--spacing-sidebar`.
3. As regras base que aplicam as variáveis aos elementos, na camada `base`:
   - `body` com o fundo, a cor e a fonte do tema e altura de linha 1,618;
   - `:focus-visible` com o contorno de foco de L5;
   - `:target` com `scroll-margin-top: var(--spacing-header)`, para o atalho "Pular para o conteúdo" não esconder o início sob o cabeçalho fixo;
   - `svg.lucide { stroke-width: 1.5 }`, o traço dos ícones de L6, sem repetir a propriedade em cada ícone.

Sai a variante `dark` por classe que a CLI grava, e a variante `dark:` volta a seguir o sistema, o padrão do Tailwind. Saem as variáveis `chart-*` e `sidebar-*`, que nenhum componente desta tarefa usa. Os padrões de movimento do Tailwind (150 ms e as curvas `ease-in`, `ease-out` e `ease-in-out`) já são os do documento enviado e não mudam.

Estilo de componente ou de página não entra em nenhum dos dois arquivos: fica nas classes do Tailwind, no próprio componente (`frontend.md`).

### Cliente da API (`src/lib/api-client.ts`)

`apiRequest<T>(path, options)`, com `method` (padrão `GET`), `body` (JSON), `signal` e `isSessionLoad`, usada só pela carga da sessão (L10). A função:

1. Chama o `fetch` no mesmo domínio, com `credentials: "same-origin"` e `cache: "no-store"`. Com corpo, envia `Content-Type: application/json` e o `JSON.stringify` dele. O navegador manda o `Origin` que o servidor confere nas gravações (RS014).
2. No sucesso, devolve `undefined` no 204 e o JSON nos demais.
3. No erro com `application/problem+json`, lança `ApiError`, com `status`, `code`, a mensagem `detail`, `fields` e `requestId` (`src/shared/api/problem.ts`). A resposta fora desse formato, como a página de erro da plataforma num 502, vira `ApiError` `INTERNAL_ERROR`, com a mensagem do catálogo. A falha de rede vira `ApiError` `SERVICE_UNAVAILABLE`, também com a mensagem do catálogo (L12). A chamada cancelada pelo `signal` rejeita como cancelada, sem virar `ApiError`.
4. Redirecionamentos (L10):
   - 401 `UNAUTHENTICATED` leva a `/login?next=<caminho e consulta atuais>`, exceto com `isSessionLoad`;
   - 403 `PASSWORD_CHANGE_REQUIRED` leva a `/set-password`.

   Nos dois casos, a navegação é completa (`location.assign`), e a promessa não se resolve: a tela fica no estado de carregamento até a página mudar (RNF004), sem mostrar erro. Os outros 401, como `INVALID_CREDENTIALS` e `INVALID_CURRENT_PASSWORD`, voltam ao formulário.
5. Nenhuma chamada é repetida, nem leitura nem gravação (`api.md`). O 409 `VERSION_CONFLICT` e os outros erros voltam à tela (L12).

### Sessão

`SessionProvider` (`src/components/shared/session-provider.tsx`, componente de cliente) fica no layout raiz, e as telas o leem pelo `useSession()` (`src/hooks/use-session.ts`). Ele chama o `me` ao carregar a página, com `isSessionLoad`, e passa de `loading` a um destes estados:

| Resposta do `me` | Estado |
|---|---|
| 200 | `authenticated`, com o `SessionUser` |
| 401 `UNAUTHENTICATED` | `visitor`, sem sair da página (L10) |
| 403 `ACCOUNT_INACTIVE` | chama o logout, que apaga os cookies, e fica `visitor` (L11) |
| outro erro, inclusive falha de rede | `unavailable` (L11) |

O contexto também oferece:

- `signIn(user)`: grava o usuário devolvido pelo login (#26);
- `signOut(destination)`: chama `POST /api/auth/logout` e navega para `destination`, mesmo se o logout falhar, porque o servidor apaga os cookies também no 503 (L6 da #23). O destino é `/` no portal (UC03 FA05) e `/login` no painel (UC08 FA03);
- `reload()`: chama o `me` de novo. É usado pelo "Tentar novamente" do painel e, na #26, depois da troca de senha.

A sessão é carregada uma vez por carga de página: o provedor continua montado nas navegações internas. Uma mudança de cargo aparece na barra na carga seguinte, e a API já a aplica na requisição seguinte (RS011).

### Layout raiz (`src/app/layout.tsx`)

`<html lang="pt-BR">` com a variável da fonte, e só ele importa o `globals.css`. O primeiro elemento focável é o atalho "Pular para o conteúdo", visível só com o foco, que leva a `#conteudo` (RNF005). O `SessionProvider` envolve as páginas, dentro de um contêiner com a classe `isolate` do Tailwind (`isolation: isolate`), o outro pedido do Base UI, para os menus em portal ficarem sempre por cima da página.

### Portal (`src/app/(portal)/layout.tsx`)

Componente de servidor com `SiteHeader`, `<main id="conteudo">` e `SiteFooter`. Vale também para `/login`, `/register` e `/set-password`, que ficam no grupo `(portal)` (RF005). O `(portal)/page.tsx` perde o `<main>` próprio, que passa ao layout, e mantém o título provisório; o conteúdo é do UC01.

- **`SiteHeader`** (cliente): a marca "Glow" leva a `/`. Os links e as ações seguem L7, conforme o estado da sessão:
  - `loading`: `Skeleton` do mesmo tamanho das ações;
  - `visitor` e `unavailable`: "Entrar" e "Criar conta";
  - `authenticated`: os links do perfil e "Sair".

  A partir de `md` (768 px), os links ficam na barra, dentro de `<nav aria-label="Principal">`. Abaixo disso, o botão "Abrir menu" abre um `Sheet` à direita com os mesmos links e ações. O link da página atual leva `aria-current="page"` e o estado "pressionado" de L5.
- **`SiteFooter`** (servidor): conforme L8.

### Painel (`src/app/(admin)/admin/layout.tsx`)

Componente de servidor. A partir de `lg` (1024 px), a navegação fica numa barra fixa à esquerda (`w-sidebar`). Abaixo disso, uma barra no topo tem a marca e o botão "Abrir menu", que abre um `Sheet` à esquerda com a mesma navegação (wireframe `staffPages/headerMobile/`). O conteúdo fica em `<main id="conteudo">`.

**`AdminNav`** (cliente), em `<nav aria-label="Painel">`:

- `authenticated`: um link por item de `user.permissions`, que o `me` já entrega na ordem de RN025 e com todas as permissões para o admin. O texto vem de `PERMISSION_LABELS`, o endereço vem de `PERMISSION_PAGES`, e cada link tem um ícone decorativo (`aria-hidden`). O link atual leva `aria-current="page"` e o estado "pressionado", e escolher um link fecha o `Sheet`. No fim fica o bloco do usuário (L9), com "Sair", que leva a `/login`.
- `loading`: `Skeleton` da lista.
- `unavailable`: `Alert` com a mensagem de `SERVICE_UNAVAILABLE` e "Tentar novamente" (`reload()`).
- `visitor`: nenhum link. O `proxy.ts` da #26 mantém o visitante fora de `/admin`.
- Funcionário com cargo inativo (`permissions` vazio): só o bloco do usuário e "Sair". Para onde ele vai é decisão da #26.

`src/app/(admin)/admin/page.tsx` é provisória, só com o título "Dashboard" (`PERMISSION_LABELS.dashboard`). Sem página em `/admin`, o layout do painel não é exibido, e os critérios não podem ser conferidos. O conteúdo do dashboard é do UC09 (veja Riscos).

### Constantes e componentes compartilhados

- `PERMISSION_PAGES`, em `src/shared/constants/permissions.ts`, liga cada permissão à sua página, conforme a tabela de `autenticacao.md`: `dashboard` → `/admin`, `appointments` → `/admin/appointments`, e assim por diante. A #26 usa a mesma lista para "a primeira página permitida".
- `PROFILE_LABELS`, em `src/shared/constants/profiles.ts` (L9): "Cliente", "Funcionário" e "Administrador", do glossário de `guia/mapa.md`.
- `src/components/shared/brand-link.tsx`: a marca em texto, "Glow", com link para `/`, usada no cabeçalho, no rodapé, no painel e nas páginas de erro, enquanto não há logotipo em `public/`.
- `src/components/shared/sign-out-button.tsx`: o "Sair" do portal e do painel, desativado e com "Saindo…" durante a chamada (RNF004).

### Páginas de erro

- `src/app/not-found.tsx` (servidor) mostra a marca, o título "Página não encontrada", o texto "Não encontramos o que você procura." (`NOT_FOUND` do catálogo) e o link "Ir para a página inicial". Ela aparece dentro do layout raiz, sem o cabeçalho do portal, porque atende a qualquer endereço, inclusive os de `/admin`.
- `src/app/error.tsx` (cliente, com `error` e `retry` do Next.js 16.4) mostra a marca, o título "Algo deu errado" e um `Alert` com a mensagem de `INTERNAL_ERROR`, "Não foi possível concluir a operação. Tente novamente em instantes.". Tem o botão "Tentar novamente" (`retry()`) e o link "Ir para a página inicial". A mensagem do erro não é exibida, porque pode trazer detalhe interno.

O erro no próprio layout raiz continua com a página padrão do Next.js (`global-error.tsx` fica fora).

### Arquivos novos e alterados de `src/`

| Arquivo | Conteúdo |
|---|---|
| `lib/api-client.ts` | novo: `apiRequest` e `ApiError` |
| `lib/utils.ts` | novo, da CLI: `cn()` |
| `components/ui/*.tsx` | novos, da CLI, com as variantes de L5: `button`, `input`, `label`, `field`, `separator`, `alert`, `sheet` e `skeleton` |
| `components/shared/session-provider.tsx` | novo: contexto da sessão |
| `components/shared/brand-link.tsx` | novo: marca com link para `/` |
| `components/shared/sign-out-button.tsx` | novo: "Sair" |
| `components/portal/layout/site-header.tsx` | novo: cabeçalho, com o menu do celular |
| `components/portal/layout/site-footer.tsx` | novo: rodapé |
| `components/admin/layout/admin-nav.tsx` | novo: navegação por permissões e bloco do usuário |
| `components/admin/layout/admin-top-bar.tsx` | novo: barra do celular, com o menu lateral |
| `hooks/use-session.ts` | novo: `useSession()` |
| `app/layout.tsx` | Nunito, atalho para o conteúdo, contêiner `isolate` e `SessionProvider` |
| `app/reset.css` | novo: complementos do Preflight, sem cores nem variáveis (L15) |
| `app/globals.css` | entrada do CSS: imports, variáveis do tema e regras base (L15) |
| `app/not-found.tsx` e `app/error.tsx` | novos |
| `app/(portal)/layout.tsx` | novo |
| `app/(portal)/page.tsx` | sem o `<main>`, que passa ao layout |
| `app/(admin)/admin/layout.tsx` | novo |
| `app/(admin)/admin/page.tsx` | novo, provisório: título "Dashboard" |
| `shared/constants/permissions.ts` | `PERMISSION_PAGES` |
| `shared/constants/profiles.ts` | `PROFILE_LABELS` (L9) |

## Ordem da construção

1. Criar a ramificação `feat/25-frontend-base` a partir da `origin/main`, desfazer o vínculo com a `main` e rodar `npm ci`, como na #23 e na #24.
2. Escrever `tests/lib/api-client.test.ts` e o README da pasta e conferir que os testes falham (vermelho). Eles vão num commit próprio, antes do código (decisão 0050).
3. Rodar o `shadcn init` e o `add`, ajustar o `package.json` (versões fixas; `shadcn` e `tw-animate-css` em `devDependencies`) e refazer o lock com `npx -y npm@11.21.1 install`. Depois, conferir as entradas `@emnapi/*` no lock e rodar o `npm ci` e o Prettier nos gerados. O código gerado, sem outras mudanças, vai num commit próprio.
4. Escrever o `api-client.ts` até os testes passarem (verde).
5. `docs/padroes/design.md`, antes do tema, porque o código o segue.
6. `reset.css`, `globals.css` (variáveis do tema e regras base), Nunito e layout raiz; variantes dos componentes (L5) e a tradução do "Close"; constantes; sessão; componentes compartilhados; layouts do portal e do painel; páginas de erro; página provisória do painel. Conferir o formulário temporário (só os tipos) e apagá-lo.
7. Restante da documentação das lacunas, as decisões 0049 e 0050 e os README.
8. Verificação local (seção seguinte).
9. Etapa 03: PR e `02_relatorio.md`. Não há migration.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um funcionário com as permissões `appointments` e `clients`, quando abre o painel, então a navegação mostra só essas duas páginas; o admin vê as seis (RN025, RN027) | Local, a 1440 px e a 360 px, na barra e no menu lateral: <br>• o funcionário de teste com o cargo "Atendimento" (`appointments` e `clients`) vê só "Agendamentos" e "Clientes"; <br>• o admin vê as seis, na ordem de RN025; <br>• o funcionário de cargo inativo não vê nenhuma, só o nome e o "Sair". <br>Pré-visualização: o admin (veja Riscos) |
| Dado um visitante, quando abre o portal, então o cabeçalho oferece entrar e cadastrar; autenticado, oferece sair (UC03 FA05) | Local: <br>• sem sessão, "Entrar" e "Criar conta"; <br>• cliente: "Agendar", "Meus agendamentos", "Minha conta" e "Sair"; <br>• funcionário: "Painel" e "Sair"; <br>• "Sair" recebe 204 e volta a `/` com "Entrar" e "Criar conta". <br>Pré-visualização: visitante e admin |
| Dado uma resposta 401 de qualquer chamada, quando o `api-client` a recebe, então leva a `/login`; a 403 `PASSWORD_CHANGE_REQUIRED` leva a `/set-password` | Testes de `tests/lib/api-client.test.ts` (decisão 0050), com o 401 lido como em L10. Local: a carga da sessão do visitante (`me` com 401) não tira ninguém de `/`. Nenhuma tela da #25 chama uma rota que responda 401 ou 403 de troca de senha; a #26 exercita os dois nas telas |
| Dado telas de 360 px e de 1440 px, quando abro os layouts, então nada transborda, e no celular a navegação do painel abre em menu lateral (RNF001) | Local, no navegador do app, nas duas larguras e nos dois temas: <br>• `document.documentElement.scrollWidth` igual a `innerWidth` em `/`, `/admin` (admin, "Atendimento" e cargo inativo), um endereço inexistente e a página temporária de erro; <br>• os menus abrem pelo clique e pelo teclado, fecham com Esc e devolvem o foco ao botão; <br>• abaixo de 1024 px, o painel abre o menu lateral à esquerda. <br>Pré-visualização: as duas larguras nas ferramentas do navegador (L14) |
| Dado a auditoria de acessibilidade do Lighthouse na pré-visualização, quando audito a página inicial, então não há contraste abaixo de 4,5:1 (RNF005) | Contrastes calculados em L2: todo texto com 4,8:1 ou mais, nos dois temas; bordas de campo e foco com 3:1 ou mais. Local: `npx -y lighthouse@13.5.0` em `/`, nos modos celular e computador e nos dois temas, com a auditoria `color-contrast` aprovada e nenhuma outra de acessibilidade reprovada. Pré-visualização: o Lighthouse das ferramentas do navegador, passo seu (L14) |

### Como a verificação local é feita

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Contas de teste.** Um roteiro no scratchpad da sessão, fora do repositório, cria pelo `auth.admin.createUser` um cliente, um funcionário com o cargo "Atendimento" (`appointments` e `clients`) e um com cargo inativo; os cargos são gravados por SQL. O admin vem do `create-admin.mjs`. As senhas são geradas pelo roteiro e nunca exibidas.
- **Aplicação.** `npx next build` e `npx next start -p 3025`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório. Nesta máquina, o `next dev` responde 500 nas páginas, porque o Turbopack não cria o processo Node do PostCSS (código 0xc0000142 do Windows), então cada mudança é conferida com um novo build. **Ponto para a sua aprovação**, como na #23 e na #24: são as chaves que a CLI gera para o banco local e descartável.
- **Sessão sem a tela de login.** A tela é da #26, então uma rota temporária, `src/app/api/dev-check/session/route.ts`, abre a sessão. `GET ?as=client|staff|inactive|admin` faz o login com as credenciais da conta de teste, que chegam ao processo do `next start` pelo ambiente, a partir de um arquivo do scratchpad. Nenhuma senha passa pelo endereço, pela conversa ou pelo navegador. A rota existe só no worktree e é apagada antes de qualquer commit, conferida no `git status`, como as rotas `dev-check` da #23 e da #24. **Ponto para a sua aprovação.**
- **Página temporária de erro.** `src/app/(portal)/dev-check/page.tsx` lança um erro ao renderizar, para mostrar o `error.tsx` e o "Tentar novamente". Também é apagada antes do commit.
- **Navegador.** O navegador do app (Chromium), em 360 × 800 e 1440 × 900, com o tema claro e o escuro pela emulação de `prefers-color-scheme`. Confere a tabela acima, a ordem do Tab (o atalho "Pular para o conteúdo" primeiro), o foco visível e os estados de L5 (cursor, pressionado, desativado). As capturas de tela ficam no scratchpad.
- **Lighthouse.** `npx -y lighthouse@13.5.0 http://localhost:3025/ --only-categories=accessibility,performance`, com o Chrome instalado na máquina, sem interface, nos modos celular (padrão) e computador (`--preset=desktop`), com o JSON no scratchpad. O tema escuro é auditado com a preferência de cor emulada no Chrome. Se a opção da linha de comando não funcionar nesta versão, o que fica conferido na construção, a auditoria do escuro passa a ser feita pelas ferramentas do navegador do app.
- **Estados da sessão:**
  - Supabase Auth parado (`docker stop supabase_auth_glow`, religado logo depois): o cabeçalho do portal mostra "Entrar" e "Criar conta", e o painel mostra o aviso com "Tentar novamente", que volta a funcionar com o Supabase Auth religado;
  - funcionário desativado pelo SQL: na carga seguinte, o logout é chamado (cookies com `Max-Age=0`) e o cabeçalho volta ao de visitante;
  - "Sair" no portal leva a `/`; no painel, leva a `/login`, que mostra a página não encontrada até a #26.
- **Verificações automáticas.** `npm run check` sem erros nem avisos, `npm audit --omit=dev --audit-level=high` (o passo do CI) e `npx next build`.
- **CSS compilado** (`.next/static/css`): o Preflight aparece uma vez; o `reset.css`, importado pelo carregador `@tailwindcss/turbopack`, aparece na camada `base`; e as variáveis dos dois temas estão presentes (L15).
- **Contêiner**, porque as dependências mudam (`workflows/procedimentos/testes.md`): `docker compose up --build -d` no worktree, `/` e `/admin` respondem 200, o processo roda como `node`, e o `docker compose down` encerra. O build baixa a Nunito do Google Fonts. O worktree não tem `.env.local`, e o agente não o cria: **passo seu**, copiar o seu `.env.local` para o worktree antes desta conferência. Sem login no contêiner, que usa o Supabase da produção: só as páginas e o `me` de visitante.
- **Pré-visualização**, passo do desenvolvedor (L14 e o primeiro risco).

## Arquivos

| Arquivo | Ação |
|---|---|
| `package.json` e `package-lock.json` | alterar: dependências (decisão 0049) |
| `components.json` | criar (CLI) |
| `src/lib/utils.ts` | criar (CLI) |
| `src/lib/api-client.ts` | criar |
| `src/components/ui/button.tsx`, `input.tsx`, `label.tsx`, `field.tsx`, `separator.tsx`, `alert.tsx`, `sheet.tsx`, `skeleton.tsx` | criar (CLI) e ajustar (L5) |
| `src/components/shared/session-provider.tsx`, `brand-link.tsx`, `sign-out-button.tsx` | criar |
| `src/components/portal/layout/site-header.tsx`, `site-footer.tsx` | criar |
| `src/components/admin/layout/admin-nav.tsx`, `admin-top-bar.tsx` | criar |
| `src/hooks/use-session.ts` | criar |
| `src/app/layout.tsx`, `src/app/globals.css` | alterar |
| `src/app/reset.css` | criar (L15) |
| `src/app/README.md` | alterar: `reset.css` e o papel do `globals.css` (L15) |
| `src/app/not-found.tsx`, `src/app/error.tsx` | criar |
| `src/app/(portal)/layout.tsx` | criar |
| `src/app/(portal)/page.tsx` | alterar |
| `src/app/(admin)/admin/layout.tsx`, `page.tsx` | criar |
| `src/app/(admin)/admin/README.md` | alterar: `layout.tsx` em "Vai aqui" |
| `src/shared/constants/permissions.ts` | alterar: `PERMISSION_PAGES` |
| `src/shared/constants/profiles.ts` | alterar: `PROFILE_LABELS` (L9) |
| `src/components/ui/README.md` | alterar (decisão 0049, L5, L13) |
| `tests/lib/api-client.test.ts` | criar |
| `tests/lib/README.md` | criar |
| `tests/README.md` | alterar: `lib/` |
| `docs/padroes/design.md` | criar (L1 a L6) |
| `docs/padroes/frontend.md` | alterar (L1, L7 a L13, L15, decisão 0049) |
| `docs/padroes/testes.md` | alterar (decisão 0050) |
| `docs/CONTEXT.md` | alterar: `design.md` na linha de `padroes/` |
| `docs/catalogo/UC01-consultar-portal-publico.md` | alterar (L7) |
| `docs/acesso/autenticacao.md` | alterar (L10) |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: `tests/lib/`, `public/images/` (L6) e `reset.css` (L15) |
| `docs/plataforma/visao-geral.md` | alterar: Base UI na stack |
| `docs/decisoes/0049-shadcn-sobre-base-ui.md` | criar |
| `docs/decisoes/0050-testes-do-cliente-da-api.md` | criar |
| `docs/decisoes/0045-testes-do-tratamento-unico.md` | alterar: só a linha `status:` |
| `docs/decisoes/CONTEXT.md` | alterar: 0049, 0050 e a 0045 substituída |
| `wireframes/README.md` | alterar (L1) |
| `workflows/procedimentos/testes.md` | alterar (L14) |
| `guia/regras.md` | alterar (decisão 0049) |
| `AGENTS.md` | alterar: Base UI na stack; linha de `wireframes/` no Mapa (L1) |
| `memoria/tarefas/25-base-do-frontend/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |

Temporários, apagados antes de qualquer commit: `src/app/api/dev-check/session/route.ts`, `src/app/(portal)/dev-check/page.tsx` e o formulário que confere os tipos.

### Em comum com outras tarefas em andamento

- Nenhum PR aberto. A única outra issue aberta é a #26, que depende desta.
- A #26 vai usar:
  - `apiRequest` e `ApiError`;
  - `useSession()` (`signIn`, `signOut` e `reload`);
  - o parâmetro `next` (L10) e `PERMISSION_PAGES`;
  - `Field`, `Input`, `Label`, `Button` e `Alert`, já no tratamento de L5;
  - o layout do portal, porque `/login`, `/register` e `/set-password` ficam no grupo `(portal)`.

## Testes previstos

`tests/lib/api-client.test.ts`, com `fetch` e `location` simulados (`vi.stubGlobal`), sem servidor, banco ou rede (decisão 0050). Os valores esperados vêm do catálogo (`src/shared/errors/catalog.ts`), de `frontend.md` e da opção recomendada de L10 a L12.

- sends a JSON body with the method: `POST /api/auth/register` com um objeto → o `fetch` recebe `method: "POST"`, `Content-Type: application/json`, o corpo em texto JSON, `credentials: "same-origin"` e `cache: "no-store"`
- returns the body of a successful response: 200 com um `SessionUser` → o mesmo objeto
- returns nothing for a 204: 204 → `undefined`
- turns a Problem Details into an ApiError: 400 `VALIDATION_ERROR` com `fields: { firstName: "Preencha este campo." }` → `ApiError` com `status` 400, `code` `VALIDATION_ERROR`, mensagem "Confira os campos destacados.", os mesmos `fields` e o `requestId`
- leads to the login page with the current page on 401 UNAUTHENTICATED: página em `/admin/clients?page=2` → `location.assign("/login?next=%2Fadmin%2Fclients%3Fpage%3D2")`, e a promessa continua pendente
- keeps the 401 of wrong credentials for the form: 401 `INVALID_CREDENTIALS` → `ApiError` com "E-mail ou senha incorretos.", sem navegar
- keeps the 401 of a wrong current password for the form: 401 `INVALID_CURRENT_PASSWORD` → `ApiError` com "A senha atual está incorreta.", sem navegar
- returns the 401 of the session load without leaving the page: `isSessionLoad` e 401 `UNAUTHENTICATED` → `ApiError` `UNAUTHENTICATED`, sem navegar
- leads to the password change on 403 PASSWORD_CHANGE_REQUIRED: → `location.assign("/set-password")`, e a promessa continua pendente
- keeps the other 403 for the screen: `ACCOUNT_INACTIVE` e `FORBIDDEN` → `ApiError` com as mensagens do catálogo, sem navegar
- returns a version conflict without repeating the request: `PATCH` com 409 `VERSION_CONFLICT` → `ApiError` com "Estes dados foram alterados por outra pessoa. Atualize a página e tente novamente." e o `fetch` chamado uma vez
- never repeats a write after a network failure: `POST` com o `fetch` rejeitado → `ApiError` `SERVICE_UNAVAILABLE` com "O serviço está temporariamente indisponível. Tente novamente em instantes." e o `fetch` chamado uma vez
- treats a response that is not Problem Details as an internal error: 502 com `text/html` → `ApiError` com `status` 502, `code` `INTERNAL_ERROR` e "Não foi possível concluir a operação. Tente novamente em instantes."
- rejects an aborted request as aborted: `signal` cancelado → rejeição `AbortError`, não `ApiError`

O contexto da sessão, os layouts, a navegação e o visual dependem do navegador e da API e são conferidos à mão, como acima (decisão 0050).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

São cinco grupos: design (L1 a L6), layouts (L7 a L9), cliente da API e sessão (L10 a L13), verificação (L14) e arquivos de CSS (L15).

### L1. Onde ficam os padrões de design e estilo

**Problema.** Não há módulo de design. `frontend.md` (cerca de 1.200 tokens) tem as regras de engenharia e só uma linha sobre o tema. O conteúdo enviado em 19/10 cobre cores, tipografia, espaçamento, raios, sombras, estados, ícones, movimento, imagens e pontos de quebra. Somado a `frontend.md`, passaria do limite de cerca de 2 mil tokens por arquivo (`docs/CONTEXT.md`).

Que os wireframes são só exemplo de esqueleto já está escrito em `wireframes/README.md`, em `frontend.md` (Estrutura), no `AGENTS.md` (Mapa) e na decisão 0041. Mas os três primeiros só dizem que as **cores** vêm do tema, e o README diz que elas "ainda serão definidas". Nada diz que fontes, sombras, raios e ícones também não vêm do wireframe, e o wireframe tem estilo próprio: escuro, plano, com magenta.

**Opções:**

- [X] **1. Módulo novo `docs/padroes/design.md`; `frontend.md` fica com a engenharia e ganha "Layouts" (recomendada).** O design é lido por quem desenha ou ajusta componentes, e a engenharia, por quem programa; cada um lê só o seu. O documento enviado entra resumido, só com o que tem uso, e as escolhas de cada seção vêm de L2 a L6. Se passar de 2 mil tokens, "Imagens e ícones" vira `design-midia.md`.
- [ ] **2. Tudo em `frontend.md`.** Um arquivo só, mas que passa do limite e precisa ser dividido de qualquer jeito.
- [ ] **3. Só no código (`globals.css` e componentes), sem módulo.** Nada a manter em dois lugares, mas a IA e a equipe ficam sem a regra, por exemplo a de não usar o laranja primário como texto, que o código não mostra.

**Texto proposto (opção 1):**

- `docs/padroes/design.md`, novo (`titulo: Padrões de design e estilo`, `origem: issue #25, plano memoria/tarefas/25-base-do-frontend/01_plano.md`, `relacionados: [RNF001, RNF005, RNF006, RNF016, 0007, 0049]`), com estas seções:
  1. Princípios: este módulo é a fonte do estilo visual, e os wireframes de `wireframes/` dão só o esqueleto e os componentes das páginas; neomorfismo suave, com relevo dado por sombra dupla (luz de cima à esquerda); poucas cores fortes, com o laranja reservado à ação principal e ao destaque; formas simples e cantos arredondados; bastante espaço e poucos elementos por tela; o mesmo tratamento em todos os componentes; e o baixo contraste do estilo compensado ativamente (WCAG AA).
  2. Cores e temas (L2, L3).
  3. Tipografia: Nunito e as escalas de L4.
  4. Espaçamento, grade e pontos de quebra (L4).
  5. Raios, sombras e estados (L4, L5).
  6. Componentes (L5).
  7. Ícones, imagens e movimento (L4, L6).
- `docs/padroes/frontend.md`, Responsividade, acessibilidade e tema, último item: "Cores, fontes e espaçamentos definidos uma vez como variáveis do tema do Tailwind 4 (`@theme` em `src/app/globals.css`); componentes usam só essas variáveis." passa a "Cores, fontes e espaçamentos definidos uma vez como variáveis do tema do Tailwind 4 (`@theme` em `src/app/globals.css`); componentes usam só essas variáveis. Valores, estados e regras visuais: [design.md](design.md)."
- `docs/padroes/frontend.md`, nova seção "Layouts", com o texto de L7 a L9.
- `docs/CONTEXT.md`, linha de `padroes/`: "como programar: `codigo.md` (todas as áreas), `frontend.md`, `backend.md`, `api.md`, `banco.md`, `testes.md`" passa a "como programar: `codigo.md` (todas as áreas), `frontend.md` e `design.md` (estilo visual), `backend.md`, `api.md`, `banco.md`, `testes.md`".
- `wireframes/README.md`, Como usar, item "Não copiar": "as cores, o nome, o logotipo, os textos e as imagens da outra empresa. As cores do Glow vêm das variáveis do tema (`@theme` em `src/app/globals.css`), que ainda serão definidas; os componentes usam só essas variáveis (`docs/padroes/frontend.md`)." passa a "o estilo visual (cores, fontes, sombras, raios e ícones), o nome, o logotipo, os textos e as imagens da outra empresa. O estilo do Glow segue `docs/padroes/design.md`, aplicado nas variáveis do tema (`@theme` em `src/app/globals.css`); os componentes usam só essas variáveis."
- `docs/padroes/frontend.md`, Estrutura: "Ele orienta o esqueleto e os componentes; o conteúdo vem do caso de uso, e as cores, do tema." passa a "Ele orienta só o esqueleto e os componentes; o conteúdo vem do caso de uso, e o estilo visual, de [design.md](design.md), nunca do wireframe."
- `AGENTS.md`, Mapa, linha de `wireframes/`: "o que a página tem vem de `docs/` e as cores, do tema (`README.md` da pasta)" passa a "o que a página tem vem de `docs/`, e o estilo visual, de `docs/padroes/design.md` (`README.md` da pasta)".
- A decisão 0041 não muda: ela já diz que os wireframes servem só ao esqueleto e que as cores vêm do tema, sem contradizer o módulo novo.

### L2. Paleta: quatro usos do tema claro abaixo da WCAG

**Problema.** `frontend.md` e o RNF005 exigem 4,5:1 no texto, e a WCAG (1.4.11) pede 3:1 na borda que identifica um campo e no foco. Calculado pela fórmula da WCAG, o tema escuro enviado passa em tudo. O tema claro falha em quatro usos:

| Uso no tema claro | Cor enviada | Contraste no fundo `#F3E6D8` |
|---|---|---|
| Texto secundário | `#8B7355` | 3,66 (mínimo 4,5) |
| Laranja primário como texto ou link | `#FF8C42` | 1,89 (mínimo 4,5) |
| Laranja profundo como texto | `#C55A2E` | 3,51 (mínimo 4,5) |
| Sombra escura como borda do campo | `#C9B49A` | 1,63 (mínimo 3) |

Além disso, a paleta não tem cor de erro, e o texto branco não passa sobre nenhum laranja (de 1,74 a 4,31), então o texto do botão principal precisa ser escuro.

**Opções:**

- [X] **1. Manter as cores enviadas e escurecer só o que falha, com regras de uso (recomendada).** Fundo, sombras e laranjas ficam como enviados. Mudam o texto secundário claro e a borda dos campos, e entram a cor de link do tema claro e a de erro. O laranja primário vira só preenchimento, com texto escuro, e o laranja profundo vira o foco, que pede 3:1. Tabelas abaixo.
- [ ] **2. Manter todas as cores enviadas, sem ajuste.** O texto secundário e os links do tema claro reprovam no Lighthouse (critério 5 da issue), e os campos ficam sem borda visível.
- [ ] **3. Outra paleta, informada por você.** Os contrastes são recalculados e o plano volta para a sua aprovação.

Tema claro (opção 1; os ajustados em negrito):

| Variável | Cor | Uso | Contraste |
|---|---|---|---|
| `--background`, `--card`, `--popover`, `--secondary` | `#F3E6D8` | fundo e superfícies (o componente tem a cor do fundo) | – |
| `--foreground` | `#2E2318` | texto principal | 12,5 |
| `--muted-foreground` | **`#745F46`** (era `#8B7355`) | texto secundário | 4,9 |
| `--primary` | `#FF8C42` | preenchimento do botão principal; nunca texto | – |
| `--primary-foreground` | `#2E2318` | texto do botão principal | 6,6 |
| `--primary-hover` | `#FFB38A` (laranja suave) | botão principal sob o cursor | texto: 8,8 |
| `--link` | **`#A34A26`** (novo, do laranja profundo) | link e destaque em texto | 4,8 |
| `--ring` | `#C55A2E` (laranja profundo) | contorno de foco | 3,5 (mínimo 3) |
| `--input` | **`#8A7966`** (novo) | borda dos campos | 3,4 (mínimo 3) |
| `--border` | `#C9B49A` | divisórias decorativas | – |
| `--muted` | `#C9B49A` | lugar reservado do carregamento | texto: 7,6 |
| `--accent` | `#FAF3EB` | item de menu sob o cursor | texto: 13,9 |
| `--destructive` | **`#A8231C`** (novo) | erro, sempre com texto ou ícone | 5,9 |
| `--shadow-dark`, `--shadow-light` | `#C9B49A`, `#FAF3EB` | sombra e realce | – |

Tema escuro (opção 1; só a borda dos campos, o link e o erro são novos):

| Variável | Cor | Uso | Contraste |
|---|---|---|---|
| `--background`, `--card`, `--popover`, `--secondary` | `#2E2E24` | fundo e superfícies | – |
| `--foreground` | `#F2EDE4` | texto principal | 11,8 |
| `--muted-foreground` | `#A89878` | texto secundário | 4,9 |
| `--primary` | `#FF9A56` | preenchimento do botão principal | – |
| `--primary-foreground` | `#2E2E24` | texto do botão principal | 6,5 |
| `--primary-hover` | `#FFB38A` | botão principal sob o cursor | texto: 7,9 |
| `--link` | `#FF9A56` | link e destaque em texto | 6,5 |
| `--ring` | `#E87430` (laranja profundo) | contorno de foco | 4,6 |
| `--input` | **`#808075`** (novo) | borda dos campos | 3,4 |
| `--border` | `#3E3E32` | divisórias decorativas | – |
| `--muted` | `#1F1F18` | lugar reservado do carregamento | texto: 14,8 |
| `--accent` | `#3E3E32` | item de menu sob o cursor | texto: 9,3 |
| `--destructive` | **`#FF9B8F`** (novo) | erro, sempre com texto ou ícone | 6,8 |
| `--shadow-dark`, `--shadow-light` | `#1F1F18`, `#3E3E32` | sombra e realce | – |

Resultado: todo texto tem 4,8:1 ou mais nos dois temas, e borda de campo e foco têm 3:1 ou mais.

**Texto proposto (opção 1):**

- `docs/padroes/design.md`, Cores e temas: as duas tabelas acima, mais as regras: "o laranja primário é só preenchimento, com texto escuro; texto em laranja usa `--link`; o branco não é usado sobre laranja; erro nunca é indicado só pela cor (`frontend.md`); fundo nunca é preto nem branco puro, para as sombras aparecerem; cor nova entra nesta tabela com o contraste calculado".

### L3. Tema claro e escuro

**Problema.** O documento enviado tem paleta clara e escura, mas não diz como o tema é escolhido. Nenhum requisito pede a troca de tema.

**Opções:**

- [X] **1. Pela preferência do sistema, sem botão de troca (recomendada).** O CSS escolhe o tema por `prefers-color-scheme`. Não há código no navegador, nada a gravar e nenhum piscar de tema na carga da página. Quem quiser o outro tema muda no sistema ou no navegador.
- [ ] **2. Botão de troca, com a preferência gravada no navegador.** Exige um roteiro antes da pintura da página para não piscar, ou uma dependência (`next-themes`), e o botão em todas as telas.
- [ ] **3. Só o tema claro.** Metade das cores, mas descarta a paleta escura enviada.

**Texto proposto (opção 1):**

- `docs/padroes/design.md`, Cores e temas: "O tema segue a preferência do sistema (`prefers-color-scheme`), sem botão de troca: as cores do claro ficam em `:root`, e as do escuro, na consulta de mídia. A variante `dark:` do Tailwind segue a mesma preferência. Toda tela é conferida nos dois temas."

### L4. Escalas φ no Tailwind e no shadcn/ui

**Problema.** O documento enviado deriva tudo de φ, mas três escalas entram em conflito com o Tailwind 4 e com os componentes gerados:

- **Espaçamento.** A escala φ (4, 8, 13, 21, 34, 55, 89, 144 px) não cabe na grade de 4 px do Tailwind (`p-3` é 12 px), que os componentes do shadcn usam.
- **Tipografia.** Redefinir `text-xs` e `text-sm` para 10 e 12 px, como no documento, encolheria os componentes, que usam essas classes nos rótulos e botões. Texto de 10 px fica abaixo do legível no celular. Títulos de 68 e 110 px não cabem em 360 px.
- **Pontos de quebra.** 1240 e 2000 px trocariam os do Tailwind (1024 e 1280), em que os componentes já se baseiam, sem requisito que peça a mudança.

**Opções:**

- [X] **1. φ exato onde não há conflito; arredondado ou do Tailwind onde há (recomendada).**
  - Raios, sombras e títulos com os valores φ exatos, em variáveis próprias.
  - Espaçamento φ arredondado para a grade de 4 px, com as classes do Tailwind; a diferença é de 1 a 2 px.
  - Texto de 12 px no mínimo.
  - Títulos descem um passo abaixo de 768 px.
  - Pontos de quebra do Tailwind, com o conteúdo limitado a 1240 px, o valor φ do documento.
- [ ] **2. Tokens φ exatos para tudo, ao lado da escala do Tailwind.** Fiel ao documento, mas convivem duas escalas de espaçamento, e os componentes gerados continuam na do Tailwind.
- [ ] **3. Trocar as escalas do Tailwind pelas φ.** Fiel ao documento, mas encolhe o texto dos componentes, muda o desenho de todos eles e exige revisar cada componente que entrar depois.

Valores da opção 1:

| Escala | Valores |
|---|---|
| Títulos | `text-h3` 26 px, `text-h2` 42 px, `text-h1` 68 px, `text-display` 110 px; altura de linha 1,2; espaçamento entre letras de -0,02em (h2, h3) e -0,03em (h1, display). Abaixo de 768 px, cada título usa o tamanho do passo anterior; o `display` só a partir de 1280 px |
| Texto | 16 px com altura de linha 1,618; 14 px (`text-sm`) em rótulos; 12 px (`text-xs`) em legendas, o mínimo; sobretítulo em caixa alta com 0,08em entre letras |
| Pesos | 300 só no `display`, 400 no texto, 600 em subtítulos e botões, 700 em títulos; no máximo três por tela; botões em caixa normal |
| Espaçamento (φ → Tailwind) | 4 → `1`; 8 → `2`; 13 → `3` (12); 21 → `5` (20); 34 → `8` (32); 55 → `14` (56); 89 → `22` (88); 144 → `36`. Usos: ícone e texto 4; interno do componente 8; botão 12; cartão 20; entre cartões 32; seção 56; destaque e rodapé 88 |
| Grade | margem lateral de 24 px (32 px a partir de 1024); 1 coluna, 2 a partir de 768, 3 ou 4 a partir de 1024; conteúdo até 1240 px (`--container-page`) |
| Raios | `rounded-lg` 8 px (botões, campos, etiquetas); `rounded-xl` 13 px (cartões, avisos, menus); `rounded-2xl` 21 px (menu lateral, janelas grandes); `rounded-3xl` 34 px (cartões de destaque); `rounded-full` (pílulas, avatares, chaves) |
| Sombras | `shadow-neu-sm` 4/4/8 px; `shadow-neu-md` 6/6/13 px; `shadow-neu-lg` 10/10/21 px; `inset-shadow-neu-sm` 4/4/8 px; `inset-shadow-neu-md` 6/6/13 px; sempre a sombra escura em +x +y e o realce em -x -y |
| Pontos de quebra | os do Tailwind: 640, 768, 1024, 1280 e 1536 px |
| Movimento | 150 ms (cursor e microinterações, o padrão do Tailwind), 243 ms (cor) e 393 ms (menu lateral); curvas padrão do Tailwind, que já são as do documento; a troca de sombra não é animada, só `transform` e `opacity`; com `prefers-reduced-motion`, sem movimento |

**Texto proposto (opção 1):**

- `docs/padroes/design.md`, Tipografia, Espaçamento, grade e pontos de quebra, Raios, sombras e estados, e Movimento: a tabela acima, com a regra: "Os valores derivam de φ = 1,618. O espaçamento é arredondado para a grade de 4 px do Tailwind, usada pelos componentes do shadcn/ui; raios, sombras e títulos usam os valores exatos, em variáveis do tema."

### L5. Neomorfismo nos componentes e acessibilidade

**Problema.** O documento enviado pede componentes da mesma cor do fundo, diferenciados só pela sombra, em todos os componentes, e acessibilidade "com compensação ativa", sem dizer qual. A WCAG 1.4.11 pede 3:1 no que identifica um campo, e a sombra escura do tema claro tem 1,6:1. Um botão principal da cor do fundo também se perde entre os outros. Os componentes gerados pelo shadcn usam borda e preenchimento, não sombra dupla.

**Opções:**

- [X] **1. Neomorfismo nas superfícies e nos botões secundários; botão principal preenchido; campo rebaixado com borda (recomendada).**

  | Componente | Tratamento |
  |---|---|
  | Superfícies (cabeçalho, cartões, avisos, menus, barra do painel) | cor do fundo com `shadow-neu-md` |
  | Botão principal | laranja primário com texto escuro, a única cor forte da tela |
  | Botões secundários, de ícone e de menu | cor do fundo com `shadow-neu-sm` |
  | Campo | rebaixado (`inset-shadow-neu-sm`) com borda de 1 px em `--input` (3:1) |
  | Link de texto | `--link`, sublinhado sob o cursor |
  | Item atual da navegação | rebaixado, com o texto em `--link` e `aria-current`: não depende só da cor |
  | Botão só com ícone | `aria-label`; a dica flutuante, quando houver, não substitui o rótulo |

  | Estado | Tratamento |
  |---|---|
  | Repouso | a sombra do componente |
  | Cursor sobre | `shadow-neu-lg`; o botão principal passa ao laranja suave |
  | Pressionado | `inset-shadow-neu-md` e `scale(0.98)` |
  | Foco | contorno de 2 px em `--ring`, afastado 3 px |
  | Desativado | opacidade 0,5, cursor `not-allowed`, `shadow-neu-sm` |
  | Carregando | opacidade 0,7, sem cliques, com indicador giratório em `--link` |

- [ ] **2. Neomorfismo puro, como no documento.** Campos sem borda e botão principal da cor do fundo: o campo reprova a WCAG 1.4.11 no tema claro, e a ação principal some entre as secundárias.
- [ ] **3. Componentes planos do shadcn, só com a paleta.** Sem ajuste nos componentes gerados, mas sem o estilo pedido.

**Texto proposto (opção 1):**

- `docs/padroes/design.md`, Raios, sombras e estados, e Componentes: as duas tabelas acima, com a regra: "A sombra dá o relevo, mas nunca é a única pista: campo tem borda de 3:1, a ação principal tem cor, o item atual tem cor e `aria-current`, e o foco tem contorno."
- `src/components/ui/README.md`, Vai aqui: "componentes gerados pelo shadcn, com ajustes de variante ou de tema quando necessário" passa a "componentes gerados pelo shadcn, com as variantes ajustadas ao tratamento de `docs/padroes/design.md` (sombras, estados e raios)".

### L6. Imagens e ícones de fontes públicas

**Problema.** Você pediu imagens de fontes públicas para os serviços, a seção de destaque e o que mais for preciso, e ícones públicos. Nenhum módulo diz de onde as imagens podem vir, com que licença, onde ficam nem como o crédito é registrado. A #25 não tem tela com imagem: a seção de destaque é do UC01, e as imagens dos serviços são enviadas pelo painel ao Storage (RS015, UC13).

**Opções:**

- [X] **1. Regras agora, imagens nas tarefas das páginas que as usam (recomendada).**
  - **Ícones:** Lucide (licença ISC), já instalado com o shadcn/ui. Contorno, traço de 1,5, pontas arredondadas. 16 px em texto, botões e navegação; 26 px em ícones de destaque; 42 e 68 px só em ilustrações (estado vazio, seções da página inicial). A cor é a do texto, e o ativo usa `--link`. Uma biblioteca só, sem Phosphor.
  - **Imagens:** só de bancos com licença de uso comercial gratuito, como Unsplash e Pexels, conferida na página de cada imagem no dia do download. Sem marca, placa legível nem pessoa identificável (dado pessoal). Em WebP, com proporção de 1:1, φ:1 ou 16:9, `object-fit: cover` e o raio do contêiner. Cada uma tem o crédito registrado: arquivo, autor, fonte, licença e endereço.
  - **Onde ficam:** as fixas, como a da seção de destaque, em `public/images/`, só quando o código as referencia. As dos serviços entram pelo painel no Storage, como dado. As da demonstração seguem as mesmas regras.
  - **Texto sobre imagem:** sobre um degradê escuro, com o contraste de 4,5:1 conferido na imagem escolhida.
  - **Carregamento:** `next/image`, com espera até a imagem aparecer, exceto a da seção de destaque (`priority`), e a proporção reservada para não deslocar a página (RNF006).
  - **Quando:** cada download é feito na tarefa da página e pedido a você antes, com o nome, a fonte e o tamanho do arquivo. A #25 não baixa imagem.
- [ ] **2. Regras agora e a imagem da seção de destaque já nesta tarefa.** Adianta o UC01, mas o arquivo fica em `public/` sem ser usado até lá, contra `estrutura-de-pastas.md` ("só arquivos estáticos referenciados pelo código").
- [ ] **3. Imagens próprias ou geradas por IA, em vez de bancos públicos.** Sem questão de licença de terceiros, mas depende de produzi-las, e a geração por IA tem termos próprios.

**Texto proposto (opção 1):**

- `docs/padroes/design.md`, Ícones e imagens: o texto da opção 1, com a tabela "Créditos das imagens" (arquivo, autor, fonte, licença, endereço e data), vazia até a primeira imagem.
- `docs/plataforma/estrutura-de-pastas.md`, item de `public/`: depois de "Em `public/` vão só arquivos estáticos referenciados pelo código (logo, favicon, imagem da página inicial)", acrescentar "; imagens em `public/images/`, com origem e licença registradas em `docs/padroes/design.md`".

### L7. Itens do cabeçalho do portal

**Problema.** Os documentos falam dos itens do cabeçalho sem dizer quais são nem os textos:

- o UC01 cita "barra de navegação" e "atalhos para cadastro e login" (passo 2) e "as opções restritas ao cliente" (FA01);
- o UC03 FA05 e o RF005 citam a opção de sair e o cabeçalho em todas as páginas públicas.

Também não está dito o que o funcionário vê quando abre o portal. As páginas do cliente ainda não existem.

**Opções:**

- [X] **1. Itens por perfil, já ligados às rotas de `rotas.md` (recomendada).**

  | Quem | Links | Ações |
  |---|---|---|
  | Visitante | Início (`/`), Serviços (`/services`) | Entrar (`/login`), Criar conta (`/register`, botão principal) |
  | Cliente | Início, Serviços, Agendar (`/booking`), Meus agendamentos (`/appointments`), Minha conta (`/profile`) | Sair, que leva a `/` (UC03 FA05) |
  | Funcionário ou admin | Início, Serviços, Painel (a primeira página permitida; sem o link se não houver nenhuma) | Sair, que leva a `/` |

  Até as tarefas dessas páginas, os links levam à página não encontrada.
- [ ] **2. Igual à 1, mas cada link entra com a sua página.** Nenhum link fica sem página, mas o cabeçalho da #25 fica só com Início e as ações, e a navegação do cliente só se completa depois de quatro tarefas.
- [ ] **3. Igual à 1, sem o "Painel" para o funcionário.** Ele volta ao painel pelo endereço.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Layouts, Portal: a tabela acima, mais: "A partir de 768 px, os links ficam na barra; abaixo, num menu à direita, aberto pelo botão 'Abrir menu'. Enquanto a sessão carrega, as ações ficam reservadas, sem deslocar a página."
- `docs/catalogo/UC01-consultar-portal-publico.md`, FA01, passo 1: "O cliente autenticado acessa as páginas públicas da mesma forma, com a barra de navegação exibindo também as opções restritas ao cliente." passa a "O cliente autenticado acessa as páginas públicas da mesma forma, com a barra de navegação exibindo também as opções restritas ao cliente (Agendar, Meus agendamentos e Minha conta) e a opção de sair."
- Documento formal a atualizar no relatório: Documentação de Análise do Sistema, Quadro 26 (UC01).

### L8. Rodapé antes dos dados da empresa (RN028)

**Problema.** O README de `src/components/portal/layout/` descreve o rodapé "com contato, acesso rápido e redes sociais, vindos dos dados da empresa (RN028)". O RN028 manda exibir sempre os dados das configurações. Mas `GET /api/public/company` ainda não existe e não está na issue.

**Opções:**

- [x] **1. Rodapé sem os dados da empresa até a rota pública (recomendada).** Agora o rodapé tem a marca e "Acesso rápido", com Serviços (`/services`) e Agendar (`/booking`). A tarefa que criar `GET /api/public/company` (UC01) acrescenta contato, endereço, redes sociais e o nome da empresa no aviso de direitos. Nenhum dado institucional fica no código.
- [ ] **2. Criar a rota pública nesta tarefa.** O rodapé fica completo, mas a tarefa ganha serviço, repositório, contrato OpenAPI e verificação do backend, fora da issue.
- [ ] **3. Dados da empresa fixos no código até a rota.** Contraria o RN028 e precisa ser desfeito depois.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Layouts, Portal: "Rodapé: a marca e 'Acesso rápido' (Serviços e Agendar). Contato, endereço, redes sociais e o nome da empresa no aviso de direitos vêm de `GET /api/public/company` (RN028) e entram com essa rota, na tarefa do UC01."

### L9. Bloco do usuário na navegação do painel

**Problema.** O wireframe `staffPages/headerMobile/` mostra, no pé do menu, o nome, uma descrição ("Administrador") e a saída. O `SessionUser` traz nome e perfil, mas não o nome do cargo, e `PROFILES` não tem rótulos. O UC08 (FA03) diz que, ao sair, o sistema exibe a página de login.

**Opções:**

- [X] **1. Nome e perfil (recomendada).** Por exemplo, "Maria Souza" e "Funcionário" ou "Administrador", com os rótulos do glossário em `PROFILE_LABELS`. "Sair" leva a `/login` (UC08 FA03).
- [ ] **2. Só o nome e "Sair".** Nada novo em `src/shared`.
- [ ] **3. Nome e cargo.** Exige o nome do cargo no `me` (rota, OpenAPI e serviço), fora da issue.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Layouts, Painel: "A partir de 1024 px, a navegação fica numa barra fixa à esquerda; abaixo, num menu lateral à esquerda, aberto pelo botão 'Abrir menu' (wireframe `staffPages/headerMobile/`). Os links são os de `permissions` do `me`, na ordem de RN025, com os nomes de `PERMISSION_LABELS`; o funcionário sem permissão vê só o bloco do usuário. No pé, o nome, o perfil ('Funcionário' ou 'Administrador') e 'Sair', que leva a `/login` (UC08 FA03)."

### L10. O 401 no `api-client` e a sessão em página pública

**Problema.** `frontend.md` diz "401 → `/login`", e o critério da issue diz "Dado uma resposta 401 de qualquer chamada". Isso entra em conflito com três pontos:

- `INVALID_CREDENTIALS` e `INVALID_CURRENT_PASSWORD` também são 401 e precisam aparecer no formulário (L3 da #24);
- a carga da sessão chama o `me` em toda página, inclusive nas públicas. Para o visitante, o `me` responde 401 `UNAUTHENTICATED`, então o redirecionamento tiraria todo visitante da página inicial;
- o UC03 (FA02, RF010) pede a volta à página pedida depois do login, e nenhum módulo diz como o endereço chega ao `/login`.

**Opções:**

- [X] **1. Só o `UNAUTHENTICATED` leva ao login, com a página atual em `next`; a carga da sessão não leva (recomendada).** O 401 `UNAUTHENTICATED` vai a `/login?next=<caminho e consulta atuais>`, e os outros 401 voltam ao formulário. A carga da sessão marca a chamada (`isSessionLoad`) e trata o 401 como visitante. O redirecionamento é uma navegação completa, que recomeça o contexto da sessão, e a chamada fica pendente até a página mudar. O `/login` da #26 só usa o `next` se for um caminho interno, que começa com `/` e não com `//`, para não servir de redirecionamento para outro site. O `proxy.ts` usa o mesmo parâmetro.
- [ ] **2. Todo 401 leva ao login, como diz a frase do critério.** Os formulários de login e de troca de senha nunca mostrariam o erro, e a página inicial mandaria o visitante ao login.
- [ ] **3. Só o `UNAUTHENTICATED` leva ao login, sem `next`.** Fica mais simples, mas, depois de a sessão expirar, a pessoa volta ao início da sua área, não à página onde estava.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Comunicação com a API: "401 → `/login`; 403 `PASSWORD_CHANGE_REQUIRED` → `/set-password`; 409 `VERSION_CONFLICT` → avisa e recarrega o registro." passa a dois itens. Este é o primeiro, e o segundo vem de L12: "401 `UNAUTHENTICATED` → `/login?next=<página atual>`; os outros 401 (`INVALID_CREDENTIALS`, `INVALID_CURRENT_PASSWORD`) voltam ao formulário, e a carga da sessão trata o 401 como visitante, sem sair da página. 403 `PASSWORD_CHANGE_REQUIRED` → `/set-password`. O redirecionamento é uma navegação completa, e a chamada fica pendente até a página mudar."
- `docs/acesso/autenticacao.md`, Proteção das páginas, primeira linha: "vai a `/login` e, autenticado, volta à página pedida se o perfil puder (RF010)" passa a "vai a `/login?next=<página pedida>` e, autenticado, volta a ela se o perfil puder (RF010); o `next` só vale com caminho interno".

### L11. Carga da sessão com a conta desativada ou com falha

**Problema.** O `me` pode responder 403 `ACCOUNT_INACTIVE`, quando o funcionário é desativado depois do login: a conta "recebe 403 em toda rota com sessão, até o logout" (`autenticacao.md`). O `me` também pode falhar, com 503 ou erro de rede. Nenhum módulo diz o que o cabeçalho e o painel mostram nesses casos. Na conta desativada, os cookies continuam no navegador sem servir para nada.

**Opções:**

- [X] **1. Desativada: a sessão é encerrada e a pessoa vira visitante; falha: estado "indisponível" (recomendada).** No 403 `ACCOUNT_INACTIVE`, o provedor chama o logout, que responde 204 também nesse caso (L1 da #23), e o cabeçalho passa ao de visitante. Se a pessoa tentar entrar, o login mostra "Esta conta está desativada. Procure a administração da empresa.". Na falha, o portal mostra as opções de visitante, e o painel mostra o aviso de `SERVICE_UNAVAILABLE` com "Tentar novamente", que carrega a sessão de novo.
- [ ] **2. Desativada vira visitante, sem encerrar a sessão.** Os cookies ficam até o logout, mas a pessoa não vê como sair, porque o cabeçalho mostra "Entrar".
- [ ] **3. Desativada continua "autenticada", só com "Sair".** O cabeçalho precisaria de um estado a mais, sem nome nem perfil, e o painel ficaria com a navegação vazia.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Estado e formulários: "Único estado compartilhado: a sessão (perfil e permissões), num contexto React carregado de `GET /api/auth/me` e trocado só no login e no logout." passa a "Único estado compartilhado: a sessão (perfil e permissões), num contexto React carregado de `GET /api/auth/me` a cada carga de página e trocado só no login e no logout. Sem sessão (401), o contexto é de visitante; com a conta desativada (403 `ACCOUNT_INACTIVE`), o contexto chama o logout e fica de visitante; na falha, o portal mostra as opções de visitante, e o painel, o aviso com 'Tentar novamente'."

### L12. Erros que voltam à tela

**Problema.** `frontend.md` põe "409 `VERSION_CONFLICT` → avisa e recarrega o registro" entre as tarefas do `api-client`, mas o cliente HTTP não sabe que registro recarregar nem onde a tela mostra o aviso. O documento também diz que "requisição de gravação nunca é repetida automaticamente". Nada cobre a falha de rede nem a resposta fora do Problem Details, como a página de erro da plataforma num 502 ou 504.

**Opções:**

- [X] **1. O `api-client` devolve o erro à tela, sem repetir; falha de rede e resposta fora do formato usam mensagens do catálogo (recomendada).** O `ApiError` traz `status`, `code`, `detail` como mensagem, `fields` e `requestId`. No 409 `VERSION_CONFLICT`, a tela de edição, nas próximas tarefas, mostra o aviso e recarrega o registro. A falha de rede usa a mensagem de `SERVICE_UNAVAILABLE`, e a resposta fora do formato, a de `INTERNAL_ERROR`. Nenhuma chamada é repetida, nem leitura nem gravação.
- [ ] **2. O `api-client` recarrega a página inteira no 409.** Vale para todas as telas sem código a mais, mas perde o que foi digitado e não mostra o aviso.
- [ ] **3. Mensagem própria para a falha de rede, como "Sem conexão".** É mais precisa, mas cria uma mensagem fora do catálogo, cujo texto precisaria ser decidido.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Comunicação com a API, segundo item do desdobramento de L10: "O `api-client` devolve os outros erros à tela como `ApiError` (código, `detail` e `fields`), sem repetir nenhuma chamada: no 409 `VERSION_CONFLICT`, a tela de edição mostra o aviso e recarrega o registro. A falha de rede usa a mensagem de `SERVICE_UNAVAILABLE`, e a resposta fora do formato Problem Details, a de `INTERNAL_ERROR`."

### L13. Aviso no formulário ou aviso flutuante

**Problema.** A issue pede "botão, campo, formulário e aviso", e o README de `src/components/ui/` lista "aviso (toast)". `frontend.md` diz que "`detail` vira o aviso" e pede "aviso de sucesso ou falha" (RNF004). O RNF003 exige a mensagem junto ao elemento, e o aviso flutuante aparece longe do formulário.

**Opções:**

- [X] **1. Aviso no formulário (`alert`) agora; o flutuante entra com a primeira tela que precisar dele (recomendada).** O `detail` aparece num `Alert` no topo do formulário (RNF003). O sucesso de um formulário que muda de página aparece na página seguinte, como o cadastro, que leva ao login (#26). Nenhuma dependência a mais, e o `error.tsx` também usa o `Alert`.
- [ ] **2. `alert` e aviso flutuante agora.** O aviso de resultado das operações (RNF004) já fica pronto para o painel, mas entra um componente que nem a #25 nem a #26 usam.
- [ ] **3. Só o aviso flutuante.** Um componente só, mas a mensagem fica longe do formulário, contra o RNF003.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Comunicação com a API: "Erros chegam em Problem Details (`docs/padroes/api.md`): `detail` vira o aviso, `fields` vira a mensagem junto a cada campo (RNF003)." passa a "Erros chegam em Problem Details (`docs/padroes/api.md`): `detail` vira o aviso no topo do formulário (componente `alert`), `fields` vira a mensagem junto a cada campo (RNF003)."
- `src/components/ui/README.md`: "aviso (toast)" passa a "aviso no formulário (alert) e, quando uma tela precisar, aviso flutuante (toast)".

### L14. Verificação de acessibilidade, de larguras e de temas

**Problema.** `frontend.md` pede a auditoria de acessibilidade do Lighthouse, e a issue fixa as larguras de 360 px e 1440 px e o Lighthouse na pré-visualização. Com dois temas (L3), cada tela precisa ser conferida nos dois. `workflows/procedimentos/testes.md` (Manuais) não diz como fazer, então cada tarefa de tela repetiria os passos no plano. A pré-visualização da Vercel exige o seu login (proteção de implantação), que o agente não tem.

**Opções:**

- [X] **1. Passos no procedimento de testes, com conferência local pelo agente e na pré-visualização pelo desenvolvedor (recomendada).** O agente confere as telas localmente, com `next build` e `next start`, no navegador do app e no Lighthouse em linha de comando, nos dois temas. O desenvolvedor repete o Lighthouse e as larguras nas ferramentas do navegador, na pré-visualização, e anexa a captura ao PR.
- [ ] **2. Só nesta tarefa, no plano.** O procedimento não muda, e as próximas tarefas de tela repetem os passos.

**Texto proposto (opção 1):**

- `workflows/procedimentos/testes.md`, nova seção "Interface", depois de "Contêiner (Docker)":
  1. Local: a aplicação compilada (`npx next build` e `npx next start`), no navegador do app, em 360 × 800 e 1440 × 900, nos temas claro e escuro (emulação de `prefers-color-scheme`). Em cada página da tarefa, nada transborda (`document.documentElement.scrollWidth` igual a `innerWidth`), tudo funciona pelo teclado e o foco fica visível.
  2. Local: `npx -y lighthouse@13.5.0 <endereço> --only-categories=accessibility`, nos modos celular e computador (`--preset=desktop`) e nos dois temas, sem auditoria reprovada.
  3. Pré-visualização, pelo desenvolvedor: o Lighthouse das ferramentas do navegador (Acessibilidade, celular e computador) e as duas larguras no modo de dispositivo, com a captura de tela no PR.

### L15. Arquivos de CSS global: reset e variáveis

**Problema.** Você pediu um arquivo de reset, para zerar o estilo dos navegadores, e um `globals.css` para as variáveis globais. A documentação prevê só o `globals.css`, "Tailwind e o tema com `@theme`" (`src/app/README.md`, `estrutura-de-pastas.md`, `frontend.md`). Ela não diz nada de reset nem do que entra no CSS global além do tema. O `@import "tailwindcss"` já aplica o Preflight, o reset do Tailwind, e os componentes do shadcn/ui e do Base UI contam com ele: por exemplo, a borda `0 solid`, que faz a classe `border` funcionar, e o fundo transparente dos botões.

**Opções:**

- [X] **1. Dois arquivos: `reset.css` só com o que o Preflight não cobre, e `globals.css` como entrada, com as variáveis e as regras base (recomendada).** O `reset.css` não tem cor, fonte nem variável, e fica na camada `base`. O `globals.css` importa o Tailwind e o `reset.css` e define as variáveis do tema e as poucas regras que as aplicam aos elementos. O conteúdo de cada um está em "CSS global", acima. Nada é zerado duas vezes, e o reset não depende do tema.
- [ ] **2. Três arquivos: `reset.css`, `globals.css` só com as variáveis e `base.css` com as regras base.** A separação fica maior, mas o `base.css` teria cerca de 15 linhas, e a ordem dos três imports passa a importar.
- [ ] **3. Um reset completo próprio no lugar do Preflight.** "Zera tudo" do nosso jeito, mas exige importar o Tailwind por partes, sem o Preflight, e revisar cada componente do shadcn/ui e do Base UI, que contam com ele. Um reset por `all: unset` também apagaria o contorno de foco e o `display` dos elementos, contra o RNF005.

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Estrutura, linha de `src/app/`: "layout.tsx, globals.css (tema), not-found.tsx, error.tsx" passa a "layout.tsx, globals.css (entrada do CSS e variáveis do tema), reset.css, not-found.tsx, error.tsx".
- `docs/padroes/frontend.md`, Responsividade, acessibilidade e tema, novo item antes do último: "CSS global em dois arquivos de `src/app/`. `reset.css` traz só o que o Preflight do Tailwind, o reset que vem com `@import \"tailwindcss\"`, não cobre, sem cores, fontes nem variáveis. `globals.css` é a entrada, importada só pelo layout raiz: imports, variáveis do tema e as regras base que as aplicam aos elementos. Estilo de componente ou de página fica nas classes do Tailwind, no componente."
- `docs/plataforma/estrutura-de-pastas.md`, árvore de `src/app/`: "layout.tsx · globals.css (tema com @theme) · not-found.tsx · error.tsx" passa a "layout.tsx · globals.css (entrada do CSS e tema com @theme) · reset.css · not-found.tsx · error.tsx".
- `src/app/README.md`, Vai aqui: "`globals.css` (Tailwind e o tema com `@theme`)" passa a "`globals.css` (entrada do CSS: imports, variáveis do tema com `@theme` e regras base) e `reset.css` (o que o Preflight do Tailwind não cobre, sem cores nem variáveis)". Não vai aqui, novo item: "estilo de componente ou de página em CSS global (→ classes do Tailwind no componente)".

## Decisões técnicas

- Seguidas:
  - 0005 (a navegação só orienta; o acesso é decidido na API, RS008);
  - 0007 (shadcn/ui) e 0027 (React Hook Form);
  - 0008 (mensagens do catálogo e esquemas de `src/shared`);
  - 0010 e 0012 (uma permissão por página, `PERMISSIONS`);
  - 0017 (código em inglês, interface em português) e 0019 (um só `/login`);
  - 0025 (Problem Details) e 0032 (proteção das páginas no `proxy.ts`, da #26);
  - 0035 (testes antes do código) e 0036 (pastas);
  - 0038 (conferência em contêiner, porque as dependências mudam);
  - 0041 (wireframes só como esqueleto; as cores vêm do tema);
  - 0046 (sessão conferida no servidor; a tela só a lê pelo `me`).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| shadcn/ui sobre Base UI, preset Nova (`--base base --preset nova`). Formulários com `Field`, o `Controller` do React Hook Form e o `zodResolver`. Os pacotes que só servem ao CSS (`shadcn` e `tw-animate-css`) ficam em `devDependencies`, e as versões ficam fixas | Radix (`--base radix`), o padrão anterior, com `asChild` e o componente `form`; React Aria (`--base aria`); deixar os pacotes em `dependencies`, como a CLI grava | O Base UI é o padrão da CLI desde julho de 2026, e a documentação do shadcn o mostra primeiro. Radix e React Aria continuam aceitos, e os componentes existem para os três. O Base UI está na versão 1.9 e é mantido pela equipe do MUI. Consequências aceitas: a propriedade `render` substitui o `asChild` (o TypeScript acusa o uso errado); não há componente `form`, e o formulário é composto com `Field` e `Controller`; assistentes treinados antes tendem a escrever código de Radix, então `guia/regras.md` avisa. Em `dependencies`, o pacote `shadcn`, que é a própria CLI, com babel, ts-morph e o SDK do MCP, reprova o passo de auditoria do CI (7 falhas altas, pela `braces`). Em `devDependencies`, a auditoria dá 0, e o CSS é lido só no build: a Vercel e o contêiner instalam as `devDependencies` para compilar | nova (0049) |
| Testes automatizados também do cliente da API (`tests/lib/api-client.test.ts`), com `fetch` e `location` simulados por `vi.stubGlobal`, sem servidor, navegador ou rede, escritos antes do código. As telas continuam testadas à mão | Conferir os redirecionamentos à mão, com uma página temporária; testes de componentes com jsdom e Testing Library; testes de ponta a ponta | Todas as telas usam o `api-client`, como todas as rotas usam o tratamento único: uma regressão no 401 ou no 403 aparece em todas ao mesmo tempo. Na #25, nenhuma tela chama uma rota que responda esses códigos, porque a carga da sessão não redireciona; sem o teste, o critério da issue não teria verificação. Roda no ambiente `node` do Vitest, sem dependência nova. Testes de componentes exigiriam jsdom e Testing Library e mudariam mais a 0045 | nova (0050), substitui 0045 |

O sistema de design (L1 a L6) não vira registro de decisão: é padrão de área e fica em `docs/padroes/design.md`, como os outros padrões (`docs/CONTEXT.md`, "Convenção de código de uma área").

Texto das decisões (gravadas na etapa 03):

- `docs/decisoes/0049-shadcn-sobre-base-ui.md`: `titulo` "shadcn/ui sobre Base UI, com os pacotes só de CSS em devDependencies", `relacionados: [RNF005, 0007, 0027]`, com a decisão, as alternativas e a justificativa da tabela.
- `docs/decisoes/0050-testes-do-cliente-da-api.md`: `titulo` "Testes automatizados das regras, dos esquemas, do tratamento único e do cliente da API", `substitui: 0045`, `relacionados: [RS014, RS017, RS018, 0035, 0045]`, idem.
- `docs/decisoes/0045-testes-do-tratamento-unico.md`: só `status:` passa a "substituída por 0050".
- `docs/decisoes/CONTEXT.md`: as linhas da 0049 e da 0050 e "(substituída por 0050)" no título da 0045.
- `docs/padroes/frontend.md`, abertura: "React no App Router do Next.js 16, Tailwind CSS 4 e shadcn/ui." passa a "React no App Router do Next.js 16, Tailwind CSS 4 e shadcn/ui sobre Base UI (decisão 0049)."
- `docs/padroes/frontend.md`, Estado e formulários: "Formulários com React Hook Form e os esquemas Zod de `src/shared/validation`, pelos componentes de formulário do shadcn/ui;" passa a "Formulários com React Hook Form e os esquemas Zod de `src/shared/validation` (`zodResolver`), pelos componentes `Field` do shadcn/ui com o `Controller` (decisão 0049);".
- `docs/padroes/testes.md`:
  - O que é testado automaticamente: "e o tratamento único das requisições (`src/server/http`), este com `Request` e `Response` padrão, sem servidor." passa a "o tratamento único das requisições (`src/server/http`), este com `Request` e `Response` padrão, sem servidor, e o cliente da API (`src/lib/api-client.ts`), com `fetch` e `location` simulados (decisão 0050).";
  - na mesma seção, a lista do espelhamento ganha "`tests/lib/<arquivo>.test.ts` para `src/lib/`";
  - nova linha na tabela: "| Cliente da API | JSON e Problem Details; 401 `UNAUTHENTICATED` leva a `/login` com a página atual, os outros 401 voltam à tela, e o da carga da sessão não sai da página; 403 `PASSWORD_CHANGE_REQUIRED` leva a `/set-password`; nenhuma chamada repetida; falha de rede e resposta fora do formato |".
- `tests/README.md`: `lib/` testa `src/lib/`, e "decisão 0045" passa a "decisão 0050". `tests/lib/README.md`, novo, do molde de `tests/http/README.md`.
- `docs/plataforma/estrutura-de-pastas.md`, árvore de `tests/`: nova linha "lib/  espelha src/lib (cliente da API)".
- `docs/plataforma/visao-geral.md`, stack: "| Interface | Tailwind CSS e shadcn/ui | 4.3 |" passa a "| Interface | Tailwind CSS e shadcn/ui sobre Base UI | 4.3 |".
- `AGENTS.md`, Stack: "Tailwind CSS 4.3 com shadcn/ui" passa a "Tailwind CSS 4.3 com shadcn/ui sobre Base UI".
- `guia/regras.md`, Como programar, último item: depois de "Zod 4 e ESLint 9, com configuração flat, mudaram em relação às versões anteriores", acrescentar "; o shadcn/ui usa Base UI, com a propriedade `render` no lugar do `asChild` do Radix (decisão 0049)".
- `src/components/ui/README.md`: "gerados pela CLI: `npx shadcn@latest add <componente>`" passa a "gerados pela CLI sobre Base UI: `npx -y shadcn@<versão> add <componente>` (decisão 0049). A CLI grava os pacotes em `dependencies` com `^`: fixar a versão e deixar em `devDependencies` os que só servem ao CSS (`shadcn`, `tw-animate-css`). Textos em inglês dos componentes gerados são traduzidos."

Escolhas locais, sem registro:

- A sessão é carregada no navegador, pelo `me`, como `frontend.md` já define. As páginas não leem a sessão no servidor (RNF013).
- Os redirecionamentos do `api-client` e o "Sair" usam navegação completa (`location.assign`), porque o `api-client` não é um componente e não tem o roteador do Next.js. A carga nova também recomeça o contexto da sessão.
- `PERMISSION_PAGES` fica ao lado de `PERMISSION_LABELS`, porque o painel e o `proxy.ts` (#26) usam os dois.
- A marca é o texto "Glow" até haver logotipo em `public/`.
- O tema não tem as variáveis `chart-*` e `sidebar-*`. Elas entram com os componentes que as usarem, como os gráficos do dashboard.

## Riscos e dúvidas

- **Pré-visualização sem tela de login.** O login é da #26, então na pré-visualização da #25 só há sessão se você abrir uma pelo console do navegador, com `fetch("/api/auth/login", ...)` e as suas credenciais de admin digitadas por você. **Ponto para a sua aprovação:** conferir na pré-visualização o visitante, o Lighthouse e as larguras, e os estados com sessão só com o admin, por esse caminho; ou deixar os estados com sessão para a pré-visualização da #26.
- **Funcionário com duas permissões.** Não existe funcionário na produção até o UC19, então o primeiro critério com o funcionário "Atendimento" é conferido só no banco local.
- **Página provisória `/admin`.** **Ponto para a sua aprovação:** sem ela, o layout do painel não aparece em nenhum endereço até o UC09. Ela só tem o título "Dashboard", e qualquer funcionário a vê até o `proxy.ts` da #26 levá-lo à primeira página permitida. Não há issue do UC09 para citar num `TODO`.
- **Chaves do banco local, rota temporária de sessão e página temporária de erro.** **Pontos para a sua aprovação**, como na #23 e na #24 (seção "Como a verificação local é feita").
- **`.env.local` no worktree.** A conferência em contêiner precisa dele, e só você o copia.
- **`next dev` nesta máquina.** As páginas respondem 500 no `next dev` (Turbopack e PostCSS, código 0xc0000142), então a verificação local usa `next build` e `next start`, com um build novo a cada mudança.
- **Neomorfismo e contraste.** O estilo depende de sombras de baixo contraste. As regras de L5 compensam onde a WCAG exige, mas um componente novo que copie só a sombra pode reprovar; `design.md` torna a regra explícita, e o Lighthouse de cada tarefa de tela confere.
- **Variantes dos componentes gerados.** O tratamento de L5 muda as classes de `button`, `input`, `alert`, `sheet` e `skeleton`. Uma atualização desses componentes pela CLI sobrescreve os ajustes, então quem atualizar precisa refazê-los. O commit separado (passo 3 da ordem) mostra o que foi gerado e o que foi ajustado.
- **Links sem página.** Até as tarefas de cada página, os links do cabeçalho e da navegação levam à página não encontrada, inclusive o "Sair" do painel, que leva a `/login` até a #26.
- **Versões recentes.** `cn` 0.5.0 (16/10), `@base-ui/react` 1.9.0 (09/10), `lucide-react` 1.59.0 (17/10) e a CLI 4.22.1 (18/10) são as que a CLI instala hoje. `react-hook-form` 7.90.0 (11/10) é a versão da stack. O `@hookform/resolvers` 6.0.0 saiu em 19/10, e a tarefa usa o 5.9.2.
- **Fonte no build.** O build na Vercel e no contêiner baixa a Nunito do Google Fonts. Sem rede, o build falha.
- **Sessão no navegador.** A cada carga completa de página, as ações do cabeçalho ficam reservadas até o `me` responder, sem deslocar a página. Uma mudança de cargo só aparece na barra na carga seguinte, mas a API já a aplica (RS011).
- **Conta desativada (L11).** A carga da página faz um `POST` de logout. O logout não exige sessão e responde sempre 204.
- **Tamanho do PR.** São cerca de 580 linhas geradas pela CLI em 8 arquivos, mais o lock, e uma estimativa de 700 a 800 linhas escritas à mão, com os testes e o tema, além de `design.md`. O código gerado vai num commit próprio, para a revisão ler o escrito à mão em separado.

## Fora do escopo

- `/login`, `/register`, `/set-password` e `src/proxy.ts` (#26), com:
  - os cabeçalhos anticache das páginas: as páginas da #25 não trazem dados da sessão, que chegam pelo `me`, com `Cache-Control: no-store`;
  - o destino do funcionário de cargo inativo;
  - a saída do visitante de `/admin`.
- O conteúdo de `/` (UC01), com a seção de destaque e a sua imagem, e do dashboard (UC09); os dados da empresa no rodapé (L8).
- Download de imagens (L6): cada uma entra na tarefa da página que a usa, com o seu aval.
- Logotipo e favicon: não há arquivos em `public/`.
- Aviso flutuante (L13), botão de troca de tema (L3), `global-error.tsx` e `loading.tsx`.
- Hooks de listagem paginada e de chamada com carregamento, máscaras e `src/shared/format`: entram com as telas que os usarem.
- Testes automatizados de componentes e da sessão (decisão 0050).

## Acréscimo de escopo (achado na construção, 19/10/2026)

### L16. `layouts.md` separado de `frontend.md`

**Problema.** Com a seção "Layouts" (L7 a L9) e os textos de L10 a L15, `docs/padroes/frontend.md` chegou a 8,6 mil caracteres, acima do limite de cerca de 2 mil tokens por módulo (`docs/CONTEXT.md`, Manutenção); o maior módulo atual, `api.md`, tem 7,3 mil. O L1 previa a divisão só para `design.md`, que foi feita (`design-midia.md`, com ícones e imagens). A seção "Layouts" foi para um módulo próprio, fora da lista de arquivos do plano.

**Opções:**

- [X] **1. Manter `docs/padroes/layouts.md` (recomendada).** `frontend.md` volta a 6,9 mil caracteres e aponta para `layouts.md` e `design.md`; `docs/CONTEXT.md` lista os dois. Quem programa um layout lê só o que precisa.
- [ ] **2. Devolver "Layouts" a `frontend.md`.** Um arquivo a menos, mas acima do limite, contra a regra de `docs/CONTEXT.md`.

**Texto (opção 1, já no commit a26bb82):** `docs/padroes/layouts.md`, novo, com o texto de L7 a L9; `frontend.md`, Estrutura: "Cabeçalho, rodapé e navegação de cada área: [layouts.md](layouts.md)."; `docs/CONTEXT.md`: `layouts.md` e `design-midia.md` na linha de `padroes/`.

### Correção sem mudança de escopo

O `cn()` gerado pela CLI (pacote `cn`, com as regras do tailwind-merge) tratava `text-h3` como cor e o descartava ao lado de `text-foreground`: a marca saiu com 16 px em vez de 26 px. `src/lib/utils.ts` passou a criar o `cn()` com `createCn` de `cn/config`, que registra `text-h1`, `text-h2`, `text-h3` e `text-display` como tamanhos de fonte, e os componentes de `src/components/ui/` passaram a importá-lo de `@/lib/utils` (commit 7fbc271). Os dois arquivos já estavam no plano.

### Estado da construção

Feito dentro do plano aprovado, na ramificação `feat/25-frontend-base` (commits 209ae48 a 7fbc271): testes do `api-client` em vermelho, shadcn/ui e dependências, `api-client`, `design.md`, sessão, tema e componentes, layouts e páginas de erro, documentação e decisões 0049 e 0050, e a correção do `cn`. `npm run check` aprovado, com 185 testes; `npm audit --omit=dev --audit-level=high` com 0.

Verificação local aprovada, com o resultado em `notas.md`. Falta a conferência em contêiner, que precisa do `.env.local` no worktree. O PR não foi aberto.
