# Notas: 35-base-do-painel

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-20 – descoberta

Conferências do planejamento, sem alterar o código do projeto:

- **Worktree.** O desta sessão é `angry-cray-d35991`, na ramificação `claude/35-base-do-painel-bd7913`, já em 84ea44c, igual à `origin/main` (#21 a #26). O `git switch --detach origin/main` funcionou, e a sessão voltou à própria ramificação, no mesmo commit. O plano e as notas ficam sem commit, como nas etapas 01 anteriores. A etapa 02 cria `feat/35-panel-base` a partir da `origin/main`.
- **Outras tarefas.** Nenhum PR aberto. Issues abertas: #35 a #51. A #37 (dados da empresa) depende só da #26 e vai usar `FormField`, `FormAlert` e `SubmitButton`, que esta tarefa muda de pasta; a #36 (regras puras) recebe o fuso por parâmetro e pode alterar `docs/agendamento/calculos.md`, que a L1 também altera. A pasta de notas compartilhadas da sessão que iniciou esta estava vazia.
- **Protótipo descartável** (`probe/` no scratchpad: cópia do `package.json`, do lock, do `components.json`, de `ui/`, do `utils.ts` e do CSS, com `npx -y npm@11.21.1 ci`):
  - `npx -y shadcn@4.22.1 add dialog alert-dialog select checkbox switch tabs textarea badge table pagination empty input-group` não mudou o `package.json` nem o lock: tudo usa `@base-ui/react` 1.9.0, `lucide-react` e `class-variance-authority`;
  - todos os gerados importam `import { cn } from "cn"`;
  - o `add` parou na pergunta "The file button.tsx already exists. Would you like to overwrite?", mesmo com `--yes`; com `--overwrite`, a CLI reescreveu `button.tsx` e `input.tsx` sem as variantes de `design.md`;
  - textos em inglês: "Close" no `dialog.tsx` (texto oculto e botão do rodapé); "pagination", "Previous", "Next", "Go to previous page", "Go to next page" e "More pages" no `pagination.tsx`;
  - o `pagination.tsx` usa links (`<a>` pelo `render` do `Button`);
  - o botão de fechar do `dialog` usa o tamanho `icon-sm` (28 px);
  - com o import trocado para `@/lib/utils`, o `tsc --noEmit` aceitou os gerados com o `button.tsx` do projeto;
  - linhas geradas: `dialog` 160, `alert-dialog` 187, `select` 200, `checkbox` 28, `switch` 31, `tabs` 81, `textarea` 17, `badge` 51, `empty` 103, `table` 115, `pagination` 130, `input-group` 158;
  - versões no npm em 20/10: `shadcn` 4.22.1 (18/10, a `latest`), `@base-ui/react` 1.9.0.
- **Base UI 1.9.0:** o `Popup` do `alert-dialog` é o `DialogPopup`, com `initialFocus` e `finalFocus`; o `onOpenChange` recebe os detalhes do evento.
- **`Intl` no Node 24.11.1 (ICU 77.1):**
  - moeda: "R$ 1.250,00", "R$ 0,50", "R$ 0,00", "R$ 99.999,99" (espaço não separável U+00A0);
  - `dateStyle` e `timeStyle` `short` dão "15/10/2026, 09:30": o " às " precisa ser montado; com `hour` e `minute` de `2-digit`, a meia-noite sai "00:00";
  - em `America/Maceio`, `2026-10-15T02:30:00Z` é "14/10/2026";
  - `Intl.DurationFormat` existe (TypeScript 6.0.3 tem o tipo em `lib.es2025.intl`): `short` dá "1 h e 30 min", `narrow` dá "1 h 30 min", `long` dá "1 hora e 30 minutos";
  - `Intl.NumberFormat` com unidade e `unitDisplay: "short"` dá "1 h" e "30 min", com espaço comum.
- **Fuso.** `APP_TIMEZONE` aparece só em `docs/plataforma/infraestrutura.md`, `docs/agendamento/calculos.md` e no `.env.example` (`grep`, sem abrir o arquivo); nenhum código a usa. Nenhuma variável usa `NEXT_PUBLIC_`, e `src/shared/` não lê `process.env`: o navegador não tem o fuso (L1).
- **ESLint:** `eslint-plugin-react-hooks` 7.1.1, pela configuração do Next.js, com as regras do React Compiler (`set-state-in-effect`). A #26 já evitou `setState` em efeito no aviso de acesso negado.
- **Código atual:**
  - `SubmitButton` fixa `size="lg"` e `w-full`; `useFormFailure` está dentro de `form-alert.tsx`; os quatro componentes só são importados pelos três formulários de acesso;
  - `moneySchema` espera número em reais, e `null` recebe "Preencha este campo." (`isMissing`);
  - `paginationSchema` e os tamanhos de página (`ADMIN_LIST_PAGE_SIZE` = 20) já existem; a resposta é `Page<T>`;
  - as rotas de listagem documentadas usam `search`, `page` e `pageSize` (clientes), mais `type` e `includeInactive` (serviços) e `view`, `status` e `sort` (agendamentos);
  - o `button` tem as variantes `default`, `outline`, `secondary`, `ghost`, `destructive` e `link`, e os tamanhos até `icon-lg`.
- **Wireframes de `staffPages/`** (só esqueleto):
  - listagens com barra de busca, contador e ação principal; filtros em pílula ("Todos", "Principal"...) e chave "Exibir inativos"; clientes em tabela no computador e em lista no celular; serviços e agendamentos em cartões;
  - paginação com a faixa "1–9 de 22" e os botões primeira, anterior, números, próxima e última;
  - formulário em etapas em janela, com "1 Informações — 2 Preços — 3 Vínculos", "Cancelar" e "Próximo" na primeira etapa e "Voltar" e "Próximo" nas outras; no celular, a janela fica ancorada embaixo;
  - os campos de valor mostram "R$ 0,00" vazios;
  - não há wireframe do diálogo de confirmação.
- **Tamanho dos módulos:** `design.md` 7,2 mil caracteres, `frontend.md` 7,4 mil, `api.md` 7,3 mil (o maior). Por isso o comportamento dos componentes vai para o módulo novo `componentes.md`, como o `layouts.md` da #25.

## 2026-10-20 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas L1 (fuso da empresa no navegador), L2 (digitação no campo monetário), L3 (página, busca e filtros no componente ou no endereço) e L4 (duração sem horas ou sem minutos), e a decisão nova 0053 (fuso da empresa como constante compartilhada), que depende da opção 1 de L1. Nada foi construído, e não há migration nem dependência nova.

Pontos explícitos para a aprovação:

- as chaves do banco local no `next start` e a rota temporária de sessão do admin de teste;
- o cookie de teste no Lighthouse da página temporária;
- a pré-visualização só das telas de acesso, porque a página temporária não vai ao PR.

Passo do desenvolvedor, se L1 ficar com a opção 1: apagar a linha `APP_TIMEZONE=` do `.env.example` e a variável da Vercel e do `.env.local`.

## 2026-10-20 – decisão

Plano aprovado por yvan (20/10/2026), com a opção 1 em L1 a L4 e a decisão 0053. Status em `em_execucao`. Ramificação `feat/35-panel-base` criada da `origin/main` (84ea44c), sem vínculo com a `main`, e `npm ci` (646 pacotes).

## 2026-10-20 – desvio

Etapa 02, construção. Commits, nesta ordem:

- f512de8: testes em vermelho (3 arquivos sem módulo e 4 casos de `withQuery`; os 227 anteriores verdes);
- a957a22: os nove componentes gerados pela CLI, sem mudança;
- adace4c: ajustes dos gerados (`cn`, variantes de `design.md`, "Fechar", Prettier);
- a9a2487: formatos, `COMPANY_TIME_ZONE` e `withQuery` (250 testes verdes);
- 28d99b5: mudança dos componentes de acesso para `shared/` e do `useFormFailure` para `src/hooks/`;
- e3d6ce1: tipos do `FormField` pelo nome do campo;
- b45fcc7: hooks e componentes novos de `shared/`.

Desvios pequenos, sem mudar regra nem escopo:

- **Sobrescrita da CLI.** O `add` sem `--overwrite` para na pergunta sobre o `button.tsx`, mesmo com `--yes`. O `add` rodou com `--overwrite`, e `button.tsx` e `input.tsx` foram restaurados com `git checkout` logo depois, o que equivale a responder "não". O `package.json` e o lock não mudaram.
- **`FormField`.** O genérico só tinha o tipo do formulário, então o `value` do campo era a união de todos os campos: nos formulários de acesso, todos texto, isso não aparecia; no painel, com número e booleano, não compila. O `FormField` e o `FieldInputProps` passaram a receber o nome do campo como parâmetro de tipo, e o `control` aceita os valores transformados do `zodResolver`. Só tipos, sem mudança de comportamento.
- **`toApiError`** no `api-client`: o `useApiQuery` é o segundo uso da conversão do erro inesperado em `INTERNAL_ERROR`, que estava dentro do `useFormFailure`; os dois e o `ConfirmDialog` usam a função.
- **`SEARCH_TERM_MAX_LENGTH`** passou a ser exportado de `src/shared/validation/formats.ts`, como `COMPANY_NAME_MAX_LENGTH`, para a busca da listagem usar o limite de RN035 sem repetir o número. Arquivo fora da lista do plano, só com o `export`.
- **Indicação das etapas.** Os títulos das outras etapas aparecem quando o formulário tem 448 px de largura ou mais (consulta de contêiner `@md`), e não pela largura da tela: dentro do diálogo de 512 px, a tela não diz quanto espaço há. Eles encolhem com reticências em vez de transbordar; o leitor de tela ouve todos.
- **Chave (`switch`).** O botão desligado fica em `--input` (3,4:1 sobre o fundo) e, ligado, em `--primary-foreground` sobre o trilho `--primary`, para o estado ter 3:1 nos dois temas (WCAG 1.4.11); o plano dizia "botão em relevo". O texto de `design.md` segue o código.
- **Etiqueta `destructive`.** Fundo `--destructive` a 10% nos dois temas: 5,0:1 no claro e 5,6:1 no escuro; com os 20% gerados para o escuro, 4,50:1, no limite.
- **Valor monetário vazio no formulário:** o `defaultValues` usa `undefined`, porque o tipo de entrada do `moneySchema` é número; o campo entrega `null` quando apagado, e os dois recebem "Preencha este campo.".

## 2026-10-20 – descoberta

Verificação local (Supabase local com `db reset`, admin de teste pelo `create-admin.mjs` com a senha gerada em `local/env.sh` no scratchpad, `next build` e `next start -p 3035`, sessão pela rota temporária `api/dev-check/session`):

- **Painel do navegador do app oculto.** Com o painel oculto, a página roda em segundo plano: o Base UI move o foco num quadro de animação que não roda, e as capturas ficam velhas. A lista, a busca, os filtros e a falha foram conferidos no navegador do app; o teclado dos diálogos, o formulário em etapas, as larguras e os temas, num Chrome sem interface controlado pelo `puppeteer-core` 25.14.0 que vem com o Lighthouse 13.5.0 (`local/check-ui.mjs`, `check-dialog.mjs`, `check-fixes.mjs`, `check-auth.mjs`).
- **Listagem:** `?page=1&pageSize=20` na carga, `page=2` na próxima página, uma só chamada para "item 1" digitado (`page=1&pageSize=20&search=item+1`), o filtro "Tipo" da página 2 volta a `page=1&type=main`, "Limpar filtros" tira busca e filtro, "zzz" mostra o estado vazio com a mensagem da página e sem paginação, a falha mostra o aviso e "Tentar novamente" refaz a chamada. Uma chamada por carga de página.
- **Diálogos:** a 360 e a 1440 px, nos dois temas, a confirmação abre pelo Enter com o foco em "Cancelar", Tab e Shift+Tab ficam entre "Cancelar" e "Excluir", Esc fecha e devolve o foco a "Excluir"; o diálogo do formulário mantém o foco dentro e devolve a "Novo item". A falha da ação aparece dentro do diálogo aberto, com o foco no aviso. No celular, a janela fica ancorada embaixo (360 px de largura); no computador, centralizada com 512 px.
- **Formulário em etapas:** "Próximo" com campos vazios mostra as três mensagens e deixa o foco no nome; a etapa 2 recebe o foco no título "Etapa 2 de 3: Valores"; 1, 2, 5, 0, 0, 0 dão "R$ 1.250,00"; "Voltar" e "Próximo" mantêm os valores das duas etapas; o envio com o nome "Erro" volta à etapa 1 com a mensagem junto ao campo e o aviso no topo.
- **Larguras e temas:** nada transborda na lista, no diálogo do formulário e na confirmação, a 360 e a 1440 px, nos dois temas. A 360 px, a indicação mostra só o título da etapa atual; a 1440 px, dentro da janela, os três.
- **Lighthouse 13.5.0**, acessibilidade, em `/admin/dev-check`, `?open=steps` e `?open=confirm`, celular e computador, claro e escuro (`--force-dark-mode`): 100 nos 12, sem auditoria reprovada; `aria-dialog-name` aplicada e aprovada com os diálogos abertos. O cookie foi por `--extra-headers`, num arquivo apagado no fim, e os JSON foram apagados, porque guardam o cabeçalho.
- **Telas de acesso:** `/login` e `/register` sem transbordar a 360 e a 1440 px, com o botão de envio na largura do formulário e 48 px de altura e o "Mostrar senha". `/set-password` só abre com a senha inicial pendente e não foi aberta; usa os mesmos componentes, e o build e os tipos passaram.
- **Duas correções achadas** (commit 945909e): a faixa da paginação mostrava a página nova enquanto os itens antigos ainda estavam na tela, e passou a vir dos dados recebidos, sendo anunciada quando eles chegam; "Limpar filtros" sumia com o foco, que passou a ir ao campo de busca. Conferidas de novo: "1–20 de 45" durante a carga e "21–40 de 45" depois; o foco no campo de busca.
- **Registro:** nenhuma linha do `next start` com e-mail, senha, token ou cookie (RS018).
- **Encerramento:** arquivos temporários apagados (`git status` só com a pasta da tarefa), `next start` encerrado por PID, `npx supabase stop`, emulação de tela do navegador desfeita. `npm run check` com 250 testes, `npm audit --omit=dev --audit-level=high` com 0 e `next build` sem as rotas temporárias.

## 2026-10-20 – decisão

O Yvan apagou a linha `APP_TIMEZONE=` do `.env.example` no worktree e aceitou o `export` de `SEARCH_TERM_MAX_LENGTH` em `formats.ts`. A mudança foi conferida por hash do Git, sem abrir o arquivo: igual ao da `main` sem a linha, mantendo a falta de quebra de linha no fim que o original já tinha. A `main` continua em 84ea44c, e não há PR aberto. Relatório gravado e plano em `concluido`.
