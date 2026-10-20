---
issue: 35
titulo: "Base das telas do painel: listagem paginada, diálogos, formulário em etapas e formatos de moeda e data"
areas: [frontend, testes]
tipo: funcionalidade
requisitos: [RNF001, RNF002, RNF003, RNF004, RNF005, RNF008, RNF016, RN035]
status: concluido
aprovado_por: yvan
aprovado_em: 20/10/2026 - 10:17
---

# Plano: Base das telas do painel: listagem paginada, diálogos, formulário em etapas e formatos de moeda e data

## Objetivo

Preparar as peças que as páginas do painel da fase 2 (#39 a #51) vão compartilhar, para que andem em paralelo sem criar a mesma peça duas vezes:

- os componentes do shadcn/ui sobre Base UI que o painel usa, com as variantes de `design.md` e os textos em português (decisão 0049);
- em `src/components/shared/`: a listagem com busca, filtros, paginação e estado vazio (RNF008), o diálogo de confirmação (RNF005), o formulário em etapas (RNF002) e o campo monetário (RN035);
- a mudança de `FormField`, `FormAlert`, `PasswordInput` e `SubmitButton` de `src/components/portal/auth/` para `src/components/shared/`;
- em `src/hooks/`: a listagem paginada e a chamada à API com carregamento e erro, sobre o `api-client`;
- em `src/shared/format/`: moeda, data, data e hora e duração, com `Intl` e testes antes do código (RN035, coluna Exibição; RNF016; decisão 0052).

Nenhuma rota da API muda, não há migration e não há dependência nova.

## Base da construção

- Ramificação `feat/35-panel-base`, criada da `origin/main` (84ea44c, com a #21 à #26), sem vínculo com a `main`, e `npm ci`.
- Contratos usados sem mudança:
  - `apiRequest` e `ApiError` (`src/lib/api-client.ts`), que ganha só a função `withQuery` (abaixo);
  - `Page<T>` (`src/shared/api/pagination.ts`) e os tamanhos de página de `src/shared/constants/pagination.ts` (`ADMIN_LIST_PAGE_SIZE` = 20 no painel);
  - `moneySchema` e `durationMinutesSchema` (`src/shared/validation/formats.ts`): o valor em reais é número, e o vazio (`null`) recebe "Preencha este campo.";
  - `Field`, `Button`, `Input`, `Alert`, `Skeleton` e `Sheet`, já no tratamento de `design.md`.

## Como funciona

### Componentes do shadcn/ui (decisão 0049)

Protótipo descartável no scratchpad da sessão (20/10/2026): uma cópia do `package.json`, do lock, do `components.json`, dos componentes de `ui/`, do `utils.ts` e do CSS, com `npm ci` e `npx -y shadcn@4.22.1 add` (a versão de `components.json` e a mais recente no npm). Resultado:

- **Nenhuma dependência nova.** Todos usam `@base-ui/react` 1.9.0, `lucide-react` e `class-variance-authority`, já instalados; o `package.json` e o lock ficaram iguais. Por isso não há conferência em contêiner (`workflows/procedimentos/testes.md`).
- **Import do `cn`.** Todo arquivo gerado importa `import { cn } from "cn"`, o pacote, e não o `@/lib/utils`, que registra os tamanhos de título do tema (correção da #25). O import é trocado em cada um.
- **Sobrescrita.** O `alert-dialog` usa o `button`, e a CLI pergunta se sobrescreve o `button.tsx`. Com `--overwrite`, ela reescreveu o `button.tsx` e o `input.tsx` com as variantes originais, apagando as de `design.md`. A resposta é "não", e o `git diff` desses dois arquivos é conferido vazio depois do `add`.
- **Textos em inglês:** "Close" no `dialog.tsx`, no texto oculto do botão de fechar e no botão do rodapé, passa a "Fechar".
- **Tipos.** Com o import trocado, o TypeScript aceitou os gerados com o nosso `button.tsx` (as variantes `outline` e `ghost` e o tamanho `icon-sm` existem).

Entram nove componentes (cerca de 860 linhas geradas):

| Componente | Uso no painel |
|---|---|
| `dialog` | janelas de cadastro e de edição, com o formulário em etapas |
| `alert-dialog` | diálogo de confirmação |
| `select` | filtros e campos de escolha, como categoria, cargo e status |
| `checkbox` | permissões do cargo e vínculos de serviços adicionais |
| `switch` | "Exibir inativos" e situação |
| `tabs` | Serviços e Categorias, Funcionários e Cargos, visões dos agendamentos |
| `textarea` | descrições |
| `badge` | etiquetas de tipo e de situação; a de status do agendamento é da #46 |
| `empty` | base do estado vazio |

Ficam de fora, por não terem uso agora:

- `pagination`: os itens são links (`<a>`) para endereços, e a paginação desta tarefa usa botões (L3);
- `table`: entra com a primeira tela em tabela (clientes, #42);
- `input-group`: o ícone da busca fica no próprio campo, como o botão do `PasswordInput`.

Ajustes nos gerados, num commit separado do código gerado, conforme `design.md`:

| Componente | Ajuste |
|---|---|
| todos | `cn` de `@/lib/utils`; Prettier |
| `dialog` | superfície do fundo com `shadow-neu-lg` e `rounded-2xl`, sem o anel; a partir de 640 px, centralizada, até 512 px; abaixo, ancorada embaixo, com a largura da tela, até 90% da altura e rolagem interna (wireframes de `staffPages/`); botão de fechar com o tamanho `icon` (40 px, o alvo de toque da #25); "Fechar" |
| `alert-dialog` | a mesma superfície, sempre centralizada |
| `select` | gatilho como campo (rebaixado, borda em `--input`); lista como menu (`shadow-neu-md`, `rounded-xl`), item sob o cursor em `--accent` |
| `checkbox` e `switch` | borda de 1 px em `--input`, também quando marcados; marcado, preenchido de `--primary`, com a marca em `--primary-foreground`; a chave com o trilho rebaixado e o botão em relevo |
| `tabs` | lista rebaixada; a aba atual em relevo, com o texto em `--link` e o `aria-selected` do Base UI |
| `textarea` | como o campo |
| `badge` | `rounded-lg`, 12 px, peso 600; contraste de cada variante calculado pela fórmula da WCAG |
| `empty` | ícone de 42 px (`design-midia.md`), título e texto secundário |

### Componentes que passam a `src/components/shared/`

Com `git mv`, para manter o histórico, e os imports atualizados nos três formulários de acesso:

- `form-field.tsx` (`FormField`), `form-alert.tsx` (`FormAlert`), `password-input.tsx` (`PasswordInput`) e `submit-button.tsx` (`SubmitButton`);
- o `useFormFailure`, hoje dentro de `form-alert.tsx`, vai para `src/hooks/use-form-failure.ts`, porque é um hook usado por vários componentes (README de `src/hooks/`).

O comportamento não muda, com uma exceção: o `SubmitButton` deixa de fixar `w-full` e `size="lg"` e passa ao `Button` o `size` e o `className` recebidos. Os três formulários de acesso passam `size="lg"` e `className="w-full"` e ficam como estão; num diálogo, o botão fica ao lado de "Cancelar". Ficam em `portal/auth/` o `AuthCard`, o `next-param.ts` e os três formulários, que só o portal usa.

### Componentes novos de `src/components/shared/`

Comportamento geral, documentado em `docs/padroes/componentes.md` (seção "Documentação", abaixo).

**Listagem** (`paginated-list.tsx`, `PaginatedList`; `list-pagination.tsx`, `ListPagination`). A página (componente de cliente) chama o `usePaginatedList` e passa o resultado ao componente, com:

- o rótulo e o texto de exemplo da busca, como "Buscar clientes" e "Nome ou e-mail";
- os filtros e as ações da página (por exemplo, "Novo cliente"), opcionais;
- o título e o texto do estado vazio;
- a função que desenha os itens: cartões ou linhas, conforme o wireframe da página.

Partes, de cima para baixo:

1. **Barra:** a busca, um campo `type="search"` com a lupa decorativa, o rótulo oculto, até 100 caracteres (RN035) e `enterKeyHint="search"`; os filtros; "Limpar filtros", só quando há busca ou filtro (RF048); e as ações. No celular, empilhadas.
2. **Itens**, por estado:
   - primeira carga: lugar reservado (`Skeleton`), sem deslocar a página;
   - nova carga (página, busca ou filtro): os itens anteriores ficam, com `aria-busy` e o estado "Carregando" de `design.md`;
   - falha: `Alert` com a mensagem do `ApiError` e "Tentar novamente";
   - nenhum item: o estado vazio, com o título e o texto recebidos da página.
3. **Paginação** (`ListPagination`), em `<nav aria-label="Paginação">`:
   - a faixa "1–20 de 134" numa região `role="status"`, anunciada pelo leitor de tela depois de cada busca;
   - botões de ícone "Primeira página", "Página anterior", "Próxima página" e "Última página" (`aria-label`), desativados nas pontas;
   - até três números em volta da página atual, com `aria-label` "Página 2", e a atual com `aria-current="page"` e o estado "pressionado" de `design.md`;
   - sem botões quando há uma página só; em 360 px, a faixa fica acima dos botões.

**Estado vazio** (`empty-state.tsx`, `EmptyState`), sobre o `empty`: ícone decorativo de 42 px (`SearchX` como padrão), título, texto opcional e ação opcional, todos recebidos da tela.

**Diálogo de confirmação** (`confirm-dialog.tsx`, `ConfirmDialog`), sobre o `alert-dialog` (`role="alertdialog"`). Recebe o botão que o abre, o título, o texto, o rótulo da ação e o da ação em andamento ("Excluir" e "Excluindo…"), a variante do botão (`destructive` para excluir) e a função assíncrona que a executa.

- Abre pelo botão (Enter ou Espaço). O foco começa em "Cancelar", a opção segura, e fica preso no diálogo; Esc e "Cancelar" fecham, e o foco volta ao botão que o abriu (Base UI).
- Durante a chamada, a ação fica no estado "Carregando", e o diálogo não fecha (RNF004).
- Na falha, o `FormAlert` aparece dentro do diálogo, com a mensagem do `ApiError`, e recebe o foco; o diálogo continua aberto.
- No sucesso, o diálogo fecha e avisa a página (por exemplo, para recarregar a listagem).

**Formulário em etapas** (`step-form.tsx`, `StepForm`). Recebe o formulário do `useForm`, a lista de etapas (título e campos de cada uma), a função de envio, o rótulo do envio e o da ação em andamento, a função de cancelar (opcional) e o conteúdo de cada etapa.

- Um único `useForm` para todas as etapas: a etapa que sai da tela tem os valores guardados pelo React Hook Form (`shouldUnregister: false`, o padrão), então voltar não perde nada (RNF002).
- **Indicação:** uma lista ordenada com o número e o título de cada etapa, a atual com `aria-current="step"` e as anteriores marcadas como concluídas. Abaixo de 640 px, só a atual mostra o título, e as outras, o número, com o título oculto para o leitor de tela. Ao mudar de etapa, o foco vai a um título oculto, como "Etapa 2 de 3: Preços".
- **Botões:** "Voltar", sem conferir nada; "Próximo", que confere só os campos da etapa (`trigger`) e, com erro, deixa as mensagens junto aos campos e o foco no primeiro inválido; na última etapa, o envio, com o `SubmitButton`. Na primeira etapa, "Cancelar" fica no lugar de "Voltar", se a tela der a função (wireframe `newMainServiceStep1Modal`).
- **Erro da API:** o `useFormFailure` põe as mensagens nos campos; se o primeiro campo com erro for de outra etapa, o formulário vai a ela.
- O formulário funciona dentro de um `Dialog` ou numa página.

**Campo monetário** (`money-input.tsx`, `MoneyInput`), conforme L2. Recebe e devolve o valor em reais (`number | null`), que é o que `moneySchema` e a API usam, e mostra `formatCurrency(valor)`. Cada mudança passa o texto por `readCurrencyInput`. Usa `inputMode="numeric"`, o texto de exemplo "R$ 0,00" e os demais atributos do `Input`, inclusive os do `FormField` (`id`, `aria-invalid` e `aria-describedby`).

### Hooks (`src/hooks/`)

**`useApiQuery<T>(caminho | null)`** (`use-api-query.ts`) devolve `data`, `error` (`ApiError`), `isLoading` e `reload()`.

- Faz o `GET` pelo `apiRequest`. Um novo caminho ou o `reload()` cancelam a chamada anterior (`AbortController`), e a saída do componente também.
- Durante a nova carga, os dados anteriores continuam, para a listagem não piscar. O `isLoading` é derivado: a última resposta guardada é de outro caminho ou de outra recarga. Assim, não há `setState` síncrono no efeito, que o `eslint-plugin-react-hooks` 7.1.1 do projeto recusa (`set-state-in-effect`).
- Erro que não é `ApiError` vira `INTERNAL_ERROR`, como no `useFormFailure`. A chamada cancelada não vira erro.
- Com o caminho `null`, nada é chamado; serve à carga condicional, como o detalhe do registro escolhido.
- Gravações (`POST`, `PATCH`, `DELETE`) não passam por ele: os formulários usam o `isSubmitting` do React Hook Form, e o diálogo de confirmação, o próprio estado. Nenhuma é repetida (`api.md`).

**`usePaginatedList<T>({ path, pageSize, initialFilters })`** (`use-paginated-list.ts`) guarda no componente a página, a busca e os filtros (L3) e chama o `useApiQuery` com `withQuery(path, { page, pageSize, search, ...filtros })`. Devolve:

- `items`, `total`, `page`, `pageCount` e `setPage`;
- `searchText` e `setSearchText`: o campo mostra o texto na hora, e a busca vale 300 ms depois da última tecla (`SEARCH_DELAY_MS`), sem espaços nas pontas e sem o parâmetro quando vazia;
- `filters`, `setFilter(nome, valor)`, `clearFilters()` e `hasActiveFilters`;
- `isLoading`, `error` e `reload()`.

Cada nova busca, cada filtro e "Limpar filtros" voltam à primeira página (critério da issue), no próprio evento ou no temporizador da busca, nunca num efeito. Se a resposta vier sem itens numa página além da última, o que acontece quando uma exclusão esvazia a última página, a listagem vai à última página com itens.

**`useFormFailure`** (`use-form-failure.ts`): o mesmo código de hoje, só mudado de arquivo.

### Cliente da API (`src/lib/api-client.ts`)

Nova função pura `withQuery(caminho, parâmetros)`, que monta o endereço com `URLSearchParams`:

- deixa de fora os parâmetros `undefined` e os textos vazios;
- escreve os booleanos como `true` e `false`;
- devolve o caminho sozinho quando não sobra nenhum parâmetro.

Fica no `api-client` porque monta os endereços da API, e os testes de `tests/lib/` já cobrem o arquivo (decisão 0052). O `apiRequest` não muda. As listagens das próximas tarefas usam a mesma função para os filtros: `type` e `includeInactive` (#44); `view`, `status` e `sort` (#46).

### Formatos (`src/shared/format/`)

Funções puras com `Intl` e `pt-BR`, sem biblioteca, conferidas no Node 24.11.1 (ICU 77.1):

| Arquivo | Função | Saída |
|---|---|---|
| `currency.ts` | `formatCurrency(valor)` | `Intl.NumberFormat` com `currency: "BRL"`: 1250 → "R$ 1.250,00"; 0,5 → "R$ 0,50" |
| `currency.ts` | `readCurrencyInput(texto)` | os algarismos digitados como centavos (L2): "125000" → 1250; sem algarismos ou só zeros → `null` |
| `date.ts` | `formatDate(valor)` | "15/10/2026", no fuso da empresa (L1); a data de calendário ("2026-10-01") sai como está, sem conversão de fuso |
| `date.ts` | `formatDateTime(valor)` | "15/10/2026 às 09:30": a data e o horário de 24 horas (`hourCycle: "h23"`), unidos por " às " |
| `duration.ts` | `formatDuration(minutos)` | "1 h 30 min"; sem a parte zero (L4): "45 min", "2 h" |

- **Espaço da moeda.** O `Intl` separa "R$" do número com o espaço não separável (U+00A0), que impede o "R$" de ficar no fim de uma linha e o número na seguinte. A tela mostra "R$ 1.250,00", como no critério; os testes escrevem o espaço como ` `.
- **Data e hora.** Um instante (ISO 8601 com fuso, como a API envia) é mostrado no fuso da empresa, qualquer que seja o do aparelho. A data de calendário (`aaaa-mm-dd`, como o período do dashboard) não é convertida: `new Date("2026-10-01")` é a meia-noite UTC, que no fuso de Maceió ainda é 30/09. O `Intl` junta data e hora com vírgula ("15/10/2026, 09:30"), por isso o " às " de RN035 é montado na função.
- **Duração.** Usa `Intl.NumberFormat` com as unidades `hour` e `minute` (`unitDisplay: "short"`), e a junção das duas partes fica no código. O `Intl.DurationFormat` (Firefox só desde a versão 136) junta as partes conforme o padrão de lista do `pt-BR`: o estilo `short` dá "1 h e 30 min", e só o `narrow` dá "1 h 30 min", o que pode variar entre os navegadores.
- **Fuso da empresa:** `COMPANY_TIME_ZONE = "America/Maceio"`, em `src/shared/constants/time-zone.ts` (L1, decisão 0053).

### Página temporária de conferência

Os componentes não têm página real até as próximas tarefas. Para conferir os critérios no layout do painel, como na #25, entram arquivos temporários, apagados antes de qualquer commit e conferidos no `git status`:

- `src/app/(admin)/admin/dev-check/page.tsx`, com um componente de cliente na mesma pasta:
  - abas "Listagem" e "Formulário";
  - a listagem de 45 itens fictícios, com 20 por página (`ADMIN_LIST_PAGE_SIZE`), cada um com etiqueta, valor, data e hora e duração formatados;
  - filtros: uma seleção "Tipo" e a chave "Simular falha";
  - "Excluir" com o diálogo de confirmação, que falha com a chave ligada;
  - "Novo item" com o formulário em etapas num `Dialog`: dados, com texto, área de texto e seleção; valores, com dois campos monetários; opções, com caixa de seleção e chave. O envio com o nome "Erro" simula um 400 com o campo da primeira etapa;
  - com `?open=steps` ou `?open=confirm`, o diálogo já abre na carga, para o Lighthouse auditá-lo.
- `src/app/api/dev-check/items/route.ts`: `GET` com `page`, `pageSize`, `search`, `type` e `fail`, resposta `Page<T>` com 600 ms de espera, para o estado de carregamento aparecer, e, com `fail=true`, 503 `SERVICE_UNAVAILABLE` em Problem Details.
- `src/app/api/dev-check/session/route.ts`: abre a sessão do admin de teste com as credenciais do ambiente do `next start`, como na #25; nenhuma senha passa pelo endereço, pela conversa ou pelo navegador.

O `proxy.ts` deixa o admin abrir `/admin/dev-check` (endereço desconhecido do painel só confere o perfil, decisão 0051), e `/api/` fica fora dele.

### Arquivos novos e alterados de `src/`

| Arquivo | Conteúdo |
|---|---|
| `components/ui/dialog.tsx`, `alert-dialog.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`, `tabs.tsx`, `textarea.tsx`, `badge.tsx`, `empty.tsx` | novos, da CLI, com os ajustes acima |
| `components/shared/form-field.tsx`, `form-alert.tsx`, `password-input.tsx`, `submit-button.tsx` | vindos de `portal/auth/`; o `SubmitButton` recebe `size` e `className` |
| `components/shared/paginated-list.tsx`, `list-pagination.tsx`, `empty-state.tsx`, `confirm-dialog.tsx`, `step-form.tsx`, `money-input.tsx` | novos |
| `components/portal/auth/login-form.tsx`, `register-form.tsx`, `set-password-form.tsx` | imports e `SubmitButton` com `size="lg"` e `className="w-full"` |
| `hooks/use-api-query.ts`, `use-paginated-list.ts` | novos |
| `hooks/use-form-failure.ts` | novo, com o `useFormFailure` de `form-alert.tsx` |
| `lib/api-client.ts` | `withQuery` |
| `shared/format/currency.ts`, `date.ts`, `duration.ts` | novos |
| `shared/constants/time-zone.ts` | novo: `COMPANY_TIME_ZONE` (L1) |

## Ordem da construção

1. Criar a ramificação `feat/35-panel-base` da `origin/main`, desfazer o vínculo com a `main` e rodar `npm ci`.
2. Escrever os testes de `tests/format/` (moeda, data e duração) e os casos de `withQuery` em `tests/lib/api-client.test.ts`, com o README de `tests/format/`, e conferir que falham (vermelho). Eles vão num commit próprio, antes do código (decisões 0035 e 0052).
3. Rodar `npx -y shadcn@4.22.1 add dialog alert-dialog select checkbox switch tabs textarea badge empty`, respondendo "não" à sobrescrita do `button`, e conferir que `button.tsx`, `input.tsx`, `package.json` e o lock não mudaram. O código gerado, sem outras mudanças, vai num commit próprio.
4. Ajustes dos gerados (tabela acima), num commit.
5. `time-zone.ts`, `currency.ts`, `date.ts`, `duration.ts` e `withQuery`, até os testes passarem (verde).
6. Mudança dos quatro componentes de `portal/auth/` para `shared/` e do `useFormFailure` para `src/hooks/`, com `git mv`, num commit sem outra mudança de comportamento.
7. Hooks e componentes novos de `shared/`.
8. Documentação (seção "Documentação" e lacunas), decisão 0053 e README.
9. Verificação local (seção seguinte), com os arquivos temporários, apagados antes de qualquer commit.
10. Etapa 03: PR e `02_relatorio.md`. Não há migration.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado o valor 1250, quando formatado como moeda, então aparece "R$ 1.250,00"; 0,5 aparece como "R$ 0,50" (RN035, RNF016) | Testes de `tests/format/currency.test.ts`. Local: na página temporária, digitar 1, 2, 5, 0, 0, 0 no campo monetário mostra "R$ 1.250,00", e a listagem mostra os valores formatados |
| Dado a data 15/10/2026 às 9h30 no fuso da empresa, quando formatada, então aparece "15/10/2026" e, com o horário, "15/10/2026 às 09:30" (RN035) | Testes de `tests/format/date.test.ts`, com o instante em UTC, com o fuso de Maceió e perto da meia-noite. Local: as datas da listagem temporária |
| Dado 90 minutos, quando formatados como duração, então aparece "1 h 30 min" (RN035) | Testes de `tests/format/duration.test.ts` |
| Dado uma listagem com mais itens que o tamanho da página, quando avanço de página ou busco um termo, então a chamada à API leva `page`, `pageSize` e `search`, e cada nova busca volta à primeira página (RNF008) | Testes de `withQuery`. Local, na lista de requisições do navegador do app, com os 45 itens: <br>• a carga chama `?page=1&pageSize=20`, e "Próxima página", `?page=2&pageSize=20`; <br>• na página 2, digitar "item 1" faz uma só chamada, 300 ms depois da última tecla, com `?page=1&pageSize=20&search=item+1`; <br>• o filtro "Tipo" e "Limpar filtros" também voltam à primeira página; <br>• a faixa "1–20 de 45" muda a cada página e é lida pelo leitor de tela (`role="status"`) |
| Dado uma busca sem resultado, quando a listagem carrega, então aparece o estado vazio com a mensagem recebida da tela | Local: a busca "zzz" mostra o estado vazio com o título e o texto passados pela página temporária, sem a paginação. Também: com "Simular falha", o aviso com "Tentar novamente", que recarrega a listagem |
| Dado o diálogo de confirmação, quando o abro e o fecho pelo teclado, então o foco fica nele enquanto está aberto e volta ao botão que o abriu (RNF005) | Local, só com o teclado, a 360 e a 1440 px: <br>• Tab até "Excluir" e Enter: o foco vai a "Cancelar"; <br>• Tab e Shift+Tab não saem do diálogo (`document.activeElement` sempre dentro dele); <br>• Esc fecha, e o foco volta a "Excluir"; <br>• o mesmo com "Cancelar"; <br>• com "Simular falha", a confirmação mostra o aviso dentro do diálogo, com o foco nele, e o diálogo continua aberto. <br>O mesmo vale para o `Dialog` do formulário em etapas |
| Dado um formulário em etapas, quando volto a uma etapa anterior, então os dados já informados continuam preenchidos (RNF002) | Local: <br>• preencher a etapa 1, "Próximo", preencher a etapa 2, "Voltar": os campos da etapa 1 continuam preenchidos; "Próximo": os da etapa 2 também, inclusive os campos monetários; <br>• "Próximo" com um campo obrigatório vazio mostra a mensagem junto ao campo e não avança; <br>• a etapa atual aparece com `aria-current="step"`, e o foco vai ao título da etapa; <br>• o envio com o nome "Erro" volta à etapa 1, com a mensagem junto ao campo |
| Dado telas de 360 px e de 1440 px, nos dois temas, quando abro uma página temporária com os componentes, então nada transborda e o Lighthouse não reprova a acessibilidade (RNF001, RNF005) | Local, primeiro a 360 × 800 e depois a 1440 × 900, nos temas claro e escuro: `scrollWidth` igual a `innerWidth` com a listagem, com cada diálogo aberto (ancorado embaixo no celular) e em cada etapa. Lighthouse 13.5.0 em `/admin/dev-check`, `?open=steps` e `?open=confirm`, nos modos celular e computador e nos dois temas, sem auditoria de acessibilidade reprovada |

Também, porque os componentes de acesso mudam de pasta: `/login`, `/register` e `/set-password` continuam iguais a 360 e a 1440 px, com "Mostrar senha" e o botão de envio no estado de carregamento.

### Como a verificação local é feita

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Admin de teste.** `supabase/scripts/create-admin.mjs`, com `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` de um arquivo do scratchpad, fora do repositório, com a senha gerada pelo roteiro e nunca exibida.
- **Aplicação.** `npx next build` e `npx next start -p 3035`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório, e as credenciais do admin de teste para a rota temporária de sessão. Cada mudança é conferida com um novo build, porque o `next dev` responde 500 nesta máquina. **Ponto para a sua aprovação**, como na #23 a #26: as chaves do banco local e a rota temporária de sessão.
- **Navegador do app**, conforme a seção "Interface" de `workflows/procedimentos/testes.md`: 360 × 800 primeiro (mobile first) e 1440 × 900, temas claro e escuro pela emulação de `prefers-color-scheme`, a tabela acima, a ordem do Tab e o foco visível. A lista de requisições confere os parâmetros e o número de chamadas da busca.
- **Lighthouse.** `npx -y lighthouse@13.5.0` nos três endereços da tabela, com `--only-categories=accessibility`, nos modos celular e computador e nos dois temas (`--force-dark-mode` no escuro, como na #25). A página exige a sessão do admin de teste, cujo cookie vai por `--extra-headers`, num arquivo do scratchpad apagado depois, como na #26. **Ponto para a sua aprovação.**
- **Verificações automáticas.** `npm run check` sem erros nem avisos, `npx next build` e `npm audit --omit=dev --audit-level=high` (o passo do CI).
- **Temporários.** A página, as duas rotas e o componente de conferência são apagados antes de qualquer commit, e o `git status` é conferido.
- **Encerramento.** `next start` encerrado por PID e `npx supabase stop`.
- **Pré-visualização**, passo seu: a página temporária não vai ao PR, então os critérios dos componentes ficam conferidos só localmente, com as capturas no PR. Na pré-visualização: `/login`, `/register` e `/set-password` (componentes mudados de pasta), com o Lighthouse e as duas larguras do passo 3 da seção "Interface". **Ponto para a sua aprovação.**

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/ui/dialog.tsx`, `alert-dialog.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`, `tabs.tsx`, `textarea.tsx`, `badge.tsx`, `empty.tsx` | criar (CLI) e ajustar |
| `src/components/ui/README.md` | alterar: os componentes novos e os cuidados com a CLI |
| `src/components/portal/auth/form-field.tsx`, `form-alert.tsx`, `password-input.tsx`, `submit-button.tsx` | mover para `src/components/shared/` |
| `src/components/portal/auth/login-form.tsx`, `register-form.tsx`, `set-password-form.tsx` | alterar: imports e `SubmitButton` |
| `src/components/shared/paginated-list.tsx`, `list-pagination.tsx`, `empty-state.tsx`, `confirm-dialog.tsx`, `step-form.tsx`, `money-input.tsx` | criar |
| `src/components/shared/README.md` | alterar |
| `src/hooks/use-api-query.ts`, `use-paginated-list.ts`, `use-form-failure.ts` | criar |
| `src/hooks/README.md` | alterar |
| `src/lib/api-client.ts` | alterar: `withQuery` |
| `src/lib/README.md` | alterar: `withQuery` |
| `src/shared/format/currency.ts`, `date.ts`, `duration.ts` | criar |
| `src/shared/format/README.md` | alterar (L1, L2) |
| `src/shared/constants/time-zone.ts` | criar (L1) |
| `src/shared/constants/README.md` | alterar (L1) |
| `tests/format/currency.test.ts`, `date.test.ts`, `duration.test.ts` | criar |
| `tests/format/README.md` | alterar |
| `tests/lib/api-client.test.ts` | alterar: casos de `withQuery` |
| `tests/lib/README.md` | alterar: os parâmetros de consulta |
| `docs/padroes/componentes.md` | criar |
| `docs/padroes/frontend.md` | alterar (L1 e o apontador para `componentes.md`) |
| `docs/padroes/design.md` | alterar: linhas da tabela "Componentes" |
| `docs/padroes/testes.md` | alterar: tabela de casos |
| `docs/CONTEXT.md` | alterar: `componentes.md` na linha de `padroes/` |
| `docs/plataforma/RN035-formatos-dos-dados.md` | alterar (L4) |
| `docs/plataforma/infraestrutura.md` | alterar (L1) |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: linha de `format/` |
| `docs/agendamento/calculos.md` | alterar (L1) |
| `docs/decisoes/0053-fuso-da-empresa-como-constante.md` | criar (L1) |
| `docs/decisoes/CONTEXT.md` | alterar: 0053 |
| `.env.example` | **passo seu** (L1): apagar a linha `APP_TIMEZONE=` |
| `memoria/tarefas/35-base-do-painel/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |

Os README de `src/components/portal/auth/` e de `src/app/(admin)/admin/` já cobrem o que fica e não mudam.

Temporários, apagados antes de qualquer commit: `src/app/(admin)/admin/dev-check/` (página e componente), `src/app/api/dev-check/items/route.ts` e `src/app/api/dev-check/session/route.ts`.

### Em comum com outras tarefas em andamento

- Nenhum PR aberto.
- **#37** (dados da empresa): o formulário de `/admin/settings` vai usar o `FormField`, o `FormAlert` e o `SubmitButton`. Se começar antes da incorporação desta, importa de `portal/auth/` e quebra depois da mudança; o melhor é a #37 começar da `main` com a #35.
- **#36** (regras puras): recebe o fuso por parâmetro, como `calculos.md` define, e não muda com L1; mas esta tarefa altera a linha 10 de `docs/agendamento/calculos.md`, que a #36 também pode alterar (a regra de desempate do arredondamento).
- **#38** (documentos formais): o relatório desta tarefa lista os documentos formais a atualizar (L1, L4 e a decisão 0053).
- As tarefas de tela da fase 2 (#39 a #51) dependem desta e usam as peças daqui.

## Testes previstos

Valores esperados tirados de RN035 (coluna Exibição), RNF016, `api.md` e da opção recomendada de L1, L2 e L4. Sem servidor, navegador ou rede (decisão 0052).

`tests/format/currency.test.ts`:

- formats a value in reais: 1250 → "R$ 1.250,00" (RN035)
- formats cents with two decimals: 0.5 → "R$ 0,50"
- formats the largest value: 99999.99 → "R$ 99.999,99"
- formats zero, the total with a full discount: 0 → "R$ 0,00" (RN012)
- reads the typed digits as cents: "1" → 0.01; "125000" → 1250
- reads a digit typed after a formatted value: "R$ 1.250,005" → 12500.05
- reads a value after a deleted digit: "R$ 1.250,0" → 125
- ignores the leading zeros: "R$ 0,005" → 0.05
- ignores a digit beyond the largest value: "R$ 99.999,991" → 99999.99
- reads no value without digits or with zeros only: "", "R$ ", "abc" e "0" → `null`

`tests/format/date.test.ts`:

- formats an instant as the date in the company's time zone: "2026-10-15T12:30:00Z" → "15/10/2026"
- formats an instant sent with an offset: "2026-10-15T09:30:00-03:00" → "15/10/2026"
- uses the company's day near midnight: "2026-10-15T02:30:00Z" → "14/10/2026"
- formats a calendar date as it is: "2026-10-01" → "01/10/2026"
- formats the date and the time: "2026-10-15T12:30:00Z" → "15/10/2026 às 09:30"
- formats midnight as 00:00: "2026-10-15T03:00:00Z" → "15/10/2026 às 00:00"

`tests/format/duration.test.ts`:

- formats hours and minutes: 90 → "1 h 30 min" (RN035)
- formats minutes under an hour: 45 → "45 min"; 5 → "5 min"
- formats whole hours: 120 → "2 h"; 2400 → "40 h"

`tests/lib/api-client.test.ts`, novos casos de `withQuery`:

- adds the query parameters to the path: `/api/admin/clients` com `{ page: 2, pageSize: 20, search: "Maria José" }` → `/api/admin/clients?page=2&pageSize=20&search=Maria+Jos%C3%A9`
- leaves out the empty parameters: `{ page: 1, search: "", status: undefined }` → `/api/admin/clients?page=1`
- writes booleans as true or false: `{ includeInactive: true }` → `?includeInactive=true`; `false` → `?includeInactive=false`
- returns the path alone without parameters: `{}` → `/api/admin/clients`

Os componentes, os hooks e a página temporária são conferidos à mão, como acima (decisão 0052).

## Documentação

Além dos textos das lacunas:

- `docs/padroes/componentes.md`, novo, "parte de `frontend.md`", como `layouts.md` (L16 da #25): `frontend.md` tem 7,4 mil caracteres, e o texto destes componentes o levaria acima do limite de cerca de 2 mil tokens (`docs/CONTEXT.md`). `titulo: Componentes compartilhados das telas`, `origem: issue #35, plano memoria/tarefas/35-base-do-painel/01_plano.md`, `relacionados: [RNF002, RNF003, RNF004, RNF005, RNF008, RN035]`. Seções:
  1. **Listagem (RNF008):** o texto de L3 e o comportamento da seção "Listagem", acima: busca 300 ms depois da última tecla, até 100 caracteres; nova busca, filtro e "Limpar filtros" voltam à primeira página; parâmetro vazio não vai; a faixa "1–20 de 134" anunciada; a volta à última página com itens depois de uma exclusão; os estados de carga, falha e vazio.
  2. **Diálogos:** cadastro e edição em janela (`dialog`); confirmação de ação irreversível ou de efeito relevante (excluir, desativar, cancelar) no diálogo de confirmação, com "Cancelar" e a ação nomeada pelo verbo; o foco começa em "Cancelar", fica no diálogo e volta ao botão que o abriu; durante a chamada, o diálogo não fecha; a falha aparece dentro dele (RNF003, RNF004, RNF005).
  3. **Formulário em etapas (RNF002):** um único formulário para as etapas; a indicação com `aria-current="step"`; "Próximo" confere só a etapa; "Voltar" não confere; erro da API leva à etapa do campo; "Cancelar" na primeira etapa.
  4. **Campo monetário:** o texto de L2.
- `docs/padroes/frontend.md`, Estado e formulários, último item: "Formulários extensos em etapas, com indicação da etapa e volta sem perder dados (RNF002)." passa a "Formulários extensos em etapas, com indicação da etapa e volta sem perder dados (RNF002). Listagem, diálogos, formulário em etapas e campo monetário: [componentes.md](componentes.md)."
- `docs/CONTEXT.md`, linha de `padroes/`: "`frontend.md` e `layouts.md`" passa a "`frontend.md`, `layouts.md` e `componentes.md`".
- `docs/padroes/design.md`, tabela "Componentes", novas linhas:
  - "| Janela (diálogo) | superfície com `shadow-neu-lg` e `rounded-2xl`, centralizada; abaixo de 640 px, ancorada embaixo, com a largura da tela |"
  - "| Abas | lista rebaixada; a aba atual em relevo, com o texto em `--link` e `aria-selected` |"
  - "| Caixa de seleção e chave | borda de 1 px em `--input`, também quando marcadas; marcadas, preenchidas de `--primary`, com a marca em `--primary-foreground` |"
  - "| Etiqueta | `rounded-lg`, 12 px, peso 600; o significado sempre escrito, nunca só pela cor |"
- `docs/padroes/testes.md`, tabela de casos:
  - linha "Formatação": "telefone celular e fixo, durante a digitação e já formatado (RN035)" passa a "telefone celular e fixo, durante a digitação e já formatado; moeda, inclusive zero, e a leitura do campo monetário; data de um instante no fuso da empresa, perto da meia-noite, e data de calendário; data e hora; duração com e sem horas ou minutos (RN035, RNF016)";
  - linha "Cliente da API": acrescentar "; parâmetros de consulta, sem os vazios".
- `docs/plataforma/estrutura-de-pastas.md`, árvore de `src/shared/`: "exibição de moeda, telefone, placa, CNPJ e datas (Intl)" passa a "exibição de moeda, telefone, placa, CNPJ, datas e duração (Intl)".
- README:
  - `src/components/ui/`: na lista, "diálogo de confirmação, caixa de seleção, chave, área de texto e estado vazio"; e "A CLI grava `import { cn } from \"cn\"` em cada componente: trocar por `@/lib/utils`, que conhece os tamanhos de título do tema. Quando um componente depende do `button` ou do `input`, a CLI pergunta se os sobrescreve: responder não, para não perder as variantes."
  - `src/components/shared/`: a lista ganha "os campos e o aviso dos formulários, o campo de senha e o botão de envio".
  - `src/hooks/`: a lista ganha "a falha dos formulários (`use-form-failure.ts`)".
  - `src/lib/`: "`api-client.ts`, o único cliente HTTP das páginas (...)" ganha "e a montagem dos parâmetros de consulta (`withQuery`)".
  - `tests/format/`: "um arquivo de teste para cada arquivo de `src/shared/format/` (`phone.test.ts`, `currency.test.ts`...)".
  - `tests/lib/`: a descrição ganha "e a montagem dos parâmetros de consulta".

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Fuso da empresa no navegador

**Problema.** O critério da issue pede a data "no fuso da empresa". O fuso é a variável de ambiente `APP_TIMEZONE` (`docs/plataforma/infraestrutura.md`), mas nenhuma variável chega ao navegador: nenhuma usa o prefixo `NEXT_PUBLIC_`, e todas são lidas na execução, nunca no build. Além disso, `src/shared/` não lê `process.env` (README da pasta). `docs/agendamento/calculos.md` cita `APP_TIMEZONE` como o fuso que o serviço passa às regras puras. Nenhum código usa `APP_TIMEZONE` hoje; ela só aparece na documentação e no `.env.example`.

**Opções:**

- [X] **1. Constante compartilhada `COMPANY_TIME_ZONE`; `APP_TIMEZONE` deixa de existir (recomendada).** O valor `"America/Maceio"` fica em `src/shared/constants/time-zone.ts`. Os formatos o usam no navegador, e o serviço do agendamento (#49), no servidor, ao passar o fuso às funções da #36. Uma fonte só para os dois lados, como os limites de `src/shared/constants/` (`codigo.md`). Mudar o fuso passa a exigir uma alteração do código, revisada em PR. A empresa é uma só, em Maceió (`setup/questionario.md`), e o Brasil não tem horário de verão desde 2019. **Passo seu:** apagar a linha `APP_TIMEZONE=` do `.env.example`, que o agente não edita, e a variável da Vercel e do seu `.env.local`. Vira a decisão 0053.
- [ ] **2. Fuso entregue pela API.** `GET /api/public/company` (#37) ganha o campo `timeZone`, lido de `APP_TIMEZONE`, e as telas o carregam antes de mostrar uma data. A variável continua, mas cada tela com data espera mais uma chamada (ou um contexto novo), e o contrato da #37 muda.
- [ ] **3. Fuso do aparelho.** Nada a configurar, mas contraria o critério: quem estiver com o relógio em outro fuso vê outro horário, diferente do que o servidor confere (RN013).

**Texto proposto (opção 1):**

- `docs/padroes/frontend.md`, Textos e formatos: depois de "formatados com `Intl` em `src/shared/format`, sem biblioteca de datas.", acrescentar "Datas e horários aparecem no fuso da empresa (`COMPANY_TIME_ZONE`, decisão 0053), qualquer que seja o do aparelho; a data de calendário (`aaaa-mm-dd`) aparece como está."
- `docs/plataforma/infraestrutura.md`, Variáveis de ambiente: sai a linha "| `APP_TIMEZONE` | não | fuso da empresa, `America/Maceio` |"; depois da tabela, "O fuso da empresa não é variável de ambiente: é a constante `COMPANY_TIME_ZONE` (`America/Maceio`), em `src/shared/constants/time-zone.ts`, usada pelo navegador e pelo servidor (decisão 0053)."
- `docs/agendamento/calculos.md`, primeiro parágrafo: "fuso da empresa (`APP_TIMEZONE`, `America/Maceio`)" passa a "fuso da empresa (`COMPANY_TIME_ZONE`, `America/Maceio`)".
- `src/shared/constants/README.md`, Vai aqui: novo item "o fuso da empresa (`time-zone.ts`), usado pelos formatos e pelas regras do agendamento".
- `src/shared/format/README.md`: depois de "com a API `Intl`", acrescentar "; datas e horários no fuso da empresa (`COMPANY_TIME_ZONE`)".
- `docs/decisoes/0053-fuso-da-empresa-como-constante.md` (seção "Decisões técnicas").
- Documento formal a atualizar no relatório: Documentação de Arquitetura de Software, variáveis de ambiente e quadro de decisões.

### L2. Digitação no campo monetário

**Problema.** `frontend.md` manda aplicar a máscara de valores na digitação, pelas funções de exibição de `src/shared/format`, mas não diz como se digita um valor nem em que forma o campo o entrega ao formulário. O `moneySchema` espera um número em reais (`api.md`: dinheiro como número com duas casas). O wireframe `newMainServiceStep2Modal` mostra "R$ 0,00" nos campos vazios.

**Opções:**

- [X] **1. Algarismos como centavos, da direita para a esquerda (recomendada).** Cada algarismo entra no fim dos centavos: 1 dá R$ 0,01; 1, 2, 5, 0, 0, 0 dão R$ 1.250,00; apagar tira o último algarismo. O campo mostra sempre o valor formatado e entrega o número em reais, ou `null` quando vazio. Até 7 algarismos (R$ 99.999,99, RN035); o oitavo é ignorado. Teclado numérico no celular (`inputMode="numeric"`). Colar "1.250,00" dá R$ 1.250,00, mas colar "1250" dá R$ 12,50. Como no celular da #26, editar no meio do número leva o cursor ao fim.
- [ ] **2. Digitação livre, formatada ao sair do campo.** Digita-se "1250" ou "1250,5", e o campo mostra R$ 1.250,00 ou R$ 1.250,50 ao perder o foco. É natural para quem digita o valor inteiro, mas a máscara não vale durante a digitação, contra `frontend.md`. A leitura também precisa decidir o ponto: "1.250" pode ser mil duzentos e cinquenta ou um real e vinte e cinco.
- [ ] **3. Campo numérico do navegador (`type="number"`), sem máscara.** Não exige código, mas o separador decimal depende do navegador, e o valor aparece sem "R$", contra RNF016.

**Texto proposto (opção 1):**

- `docs/padroes/componentes.md`, Campo monetário: "O campo monetário (`MoneyInput`) mostra sempre o valor formatado (`formatCurrency`) e entrega ao formulário o número em reais, ou `null` quando vazio (RN035). Cada algarismo digitado entra no fim dos centavos: 1 dá R$ 0,01, e 1, 2, 5, 0, 0, 0 dão R$ 1.250,00; apagar tira o último. Até R$ 99.999,99; o algarismo além disso é ignorado. Teclado numérico no celular. A leitura do texto digitado é `readCurrencyInput`, em `src/shared/format/currency.ts`."
- `src/shared/format/README.md`, Vai aqui: "funções puras de exibição, sem dependências externas; os campos também as usam como máscara na digitação" passa a "funções puras de exibição, sem dependências externas; os campos também as usam como máscara na digitação, e o campo monetário lê os algarismos digitados como centavos (`readCurrencyInput`)".

### L3. Página, busca e filtros da listagem: no componente ou no endereço

**Problema.** RNF008 e `api.md` definem os parâmetros, e `frontend.md` diz "estado no componente que o usa", mas nada diz se a página, a busca e os filtros de uma listagem ficam também no endereço (`?page=2&search=...`). A escolha muda o que acontece ao recarregar, ao voltar no navegador e ao voltar do login quando a sessão expira (o `api-client` leva a página atual no `next`).

**Opções:**

- [X] **1. No componente (recomendada).** Recarregar a página, voltar a ela ou voltar do login mostra a primeira página, sem busca nem filtros. Não exige ler nem conferir parâmetros do endereço, nem `Suspense` nas páginas (`useSearchParams`). Duas listagens na mesma página, como Serviços e Categorias, não disputam os mesmos parâmetros. A paginação usa botões, porque é ação, não navegação (`frontend.md`).
- [ ] **2. No endereço.** Recarregar e voltar mantêm a página, a busca e os filtros, e o endereço pode ser compartilhado. Cada listagem precisa ler e conferir os parâmetros do endereço, a página precisa de `Suspense`, duas listagens na mesma página precisam de nomes distintos, e a paginação vira links.

**Texto proposto (opção 1):**

- `docs/padroes/componentes.md`, Listagem, primeiro item: "A página, a busca e os filtros ficam no componente (`usePaginatedList`), não no endereço: recarregar a página, voltar a ela ou voltar do login mostra a primeira página, sem busca nem filtros. A paginação usa botões."

### L4. Duração sem horas ou sem minutos

**Problema.** RN035, coluna Exibição, mostra só "1 h 30 min". A duração vai de 5 a 2.400 minutos, e o módulo não diz como aparecem 45 minutos nem 2 horas. O wireframe de serviços mostra "35 min" e "4h".

**Opções:**

- [X] **1. Sem a parte zero (recomendada).** 45 dá "45 min"; 120, "2 h"; 2.400, "40 h"; 90, "1 h 30 min". Sem dias, porque o limite é de 40 horas de trabalho (RN035).
- [ ] **2. Sempre as duas partes.** "0 h 45 min" e "2 h 0 min": uniforme, mas com zeros que não informam nada.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "Duração média do serviço", coluna Exibição: "1 h 30 min" passa a "1 h 30 min; 45 min; 2 h".
- Documento formal a atualizar no relatório: Documentação de Análise do Sistema, Quadro 20 (RN035).

## Decisões técnicas

- Seguidas:
  - 0007 e 0049: shadcn/ui sobre Base UI, com a CLI fixa em 4.22.1, sem pacote novo;
  - 0027 e 0049: React Hook Form com `Field`, `Controller` e `zodResolver`, também no formulário em etapas;
  - 0008: mensagens do catálogo (`INTERNAL_ERROR` no erro inesperado) e esquemas de `src/shared/validation`;
  - 0017: código em inglês, interface em português;
  - 0025: Problem Details, lidos como `ApiError`;
  - 0035 e 0052: testes antes do código, em `tests/format/` e `tests/lib/`; componentes e hooks conferidos à mão;
  - 0036: pastas;
  - 0041: wireframes só como esqueleto;
  - 0051: o proxy deixa o admin abrir um endereço desconhecido do painel (página temporária).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| O fuso da empresa é a constante `COMPANY_TIME_ZONE` (`"America/Maceio"`), em `src/shared/constants/time-zone.ts`, usada pelos formatos no navegador e, no servidor, pelo serviço que passa o fuso às regras puras. A variável `APP_TIMEZONE` deixa de existir (L1, opção 1) | (a) `APP_TIMEZONE` no servidor e o fuso entregue à tela pela API; (b) o fuso do aparelho; (c) `NEXT_PUBLIC_APP_TIMEZONE` | O navegador precisa do fuso para mostrar datas (RN035, RNF016), e nenhuma variável de ambiente chega a ele (`infraestrutura.md`). (a) custa mais uma chamada por tela e muda o contrato da #37. (b) mostra outro horário a quem estiver em outro fuso, diferente do que o servidor confere (RN013). (c) é gravada no build, contra a regra de ler as variáveis só na execução: a imagem do contêiner é construída sem elas. Há uma empresa só, em Maceió, sem horário de verão desde 2019: a constante é a fonte única dos dois lados, como os limites de `src/shared/constants/` (`codigo.md`). Consequência aceita: mudar o fuso exige uma alteração revisada do código | nova (0053) |

Texto da decisão (gravada na etapa 03, só com a opção 1 de L1):

- `docs/decisoes/0053-fuso-da-empresa-como-constante.md`: `titulo` "Fuso da empresa como constante compartilhada, sem variável de ambiente", `relacionados: [RN013, RN035, RNF016]`, com a decisão, as alternativas e a justificativa da tabela.
- `docs/decisoes/CONTEXT.md`: a linha da 0053.

Escolhas locais, sem registro:

- `withQuery` no `api-client`, e não em cada hook: todas as listagens e filtros montam o endereço do mesmo jeito, e o teste já existe.
- `isLoading` derivado da última resposta guardada, sem `setState` síncrono em efeito (`eslint-plugin-react-hooks` 7.1.1).
- A busca 300 ms depois da última tecla, em vez de um botão "Buscar" (o wireframe tem só o campo), com a faixa de resultados anunciada (`role="status"`).
- Até três números na paginação, para caber em 360 px com os quatro botões de ícone.
- O formulário em etapas com um único `useForm`, a conferência por etapa com `trigger` e a navegação só por "Voltar" e "Próximo": os números da indicação não são clicáveis, para nenhuma etapa ser pulada sem conferência.
- O foco inicial do diálogo de confirmação em "Cancelar".
- `useFormFailure` em `src/hooks/`; o `SubmitButton` com `size` e `className`.
- `Intl.NumberFormat` com unidades na duração, em vez do `Intl.DurationFormat`.
- Sem os componentes `pagination`, `table` e `input-group` do shadcn nesta tarefa.

## Riscos e dúvidas

- **CLI do shadcn.** Uma nova execução do `add` volta a gravar `import { cn } from "cn"` e pergunta se sobrescreve o `button` e o `input`; o README de `ui/` passa a dizer o que fazer. Os ajustes de variante ficam num commit separado do código gerado, para a revisão ver o que foi gerado e o que foi ajustado.
- **Foco depois de uma exclusão.** Se a ação apagar o item, o botão que abriu o diálogo sai da tela, e o Base UI não tem para onde devolver o foco. A tela que exclui decide o destino (por exemplo, o título da listagem); o `ConfirmDialog` aceita o destino do foco (`finalFocus` do Base UI).
- **Saída do `Intl` em cada navegador.** Os testes fixam a saída do Node 24.11.1 (ICU 77.1). Chrome, Edge, Firefox e Safari usam versões próprias dos dados de localização, e um espaço ou uma abreviação podem variar, só na tela. A conferência local é no Chromium do navegador do app.
- **Cursor no campo monetário.** Ao editar no meio do número, o cursor vai para o fim (L2), como no celular da #26.
- **Página temporária fora da pré-visualização.** Os critérios dos componentes ficam conferidos só localmente; a pré-visualização confere as telas de acesso (componentes movidos). As primeiras páginas reais (#39 a #42) conferem os componentes na pré-visualização.
- **`.env.example`** (L1, opção 1): só você apaga a linha `APP_TIMEZONE=`; até lá, a variável sobra sem uso.
- **Tamanho do PR.** Cerca de 860 linhas geradas pela CLI em nove arquivos, num commit próprio, e uma estimativa de 800 a 1.000 escritas à mão (componentes, hooks, formatos e ajustes de variante), mais cerca de 200 de testes e 150 de documentação, acima das ~400 do procedimento. A issue junta as peças de propósito, para as tarefas seguintes não as criarem em paralelo. Os testes, o código gerado, os ajustes, a mudança de pasta e os componentes novos vão em commits separados.
- **Pontos para a sua aprovação** (seção "Como a verificação local é feita"): as chaves do banco local e a rota temporária de sessão; o cookie de teste no Lighthouse; a pré-visualização só das telas de acesso.

## Fora do escopo

- Páginas e rotas do painel, que vêm com os seus módulos, e a etiqueta de status do agendamento (#46).
- Os componentes `table`, `pagination` e `input-group` do shadcn, aviso flutuante (toast), calendário e seletor de data.
- Uma janela de formulário compartilhada (diálogo com formulário, rodapé e fechamento): entra quando a segunda tela repetir o mesmo arranjo.
- Formatos de horário isolado ("08:00 às 18:00", #41), de percentual ("5,00%", #41), de período do dashboard (#51), de placa (#45) e de CNPJ (#37), que entram com as telas que os usam.
- Página, busca e filtros no endereço (L3, opção 2).
- Testes automatizados de componentes e de hooks (decisão 0052).

## Acréscimo de escopo (achado na construção, 20/10/2026)

- `src/shared/validation/formats.ts`: `SEARCH_TERM_MAX_LENGTH` passou a ser exportado, como `COMPANY_NAME_MAX_LENGTH`, para a busca da listagem usar o limite de RN035 (100 caracteres) sem repetir o número. Só a palavra `export`; a validação não muda.

Os demais desvios, todos dentro dos arquivos do plano, estão em `notas.md`: os tipos do `FormField` pelo nome do campo, o `toApiError` no `api-client`, a indicação das etapas pela largura do formulário, as cores da chave e da etiqueta `destructive`, e as duas correções achadas na verificação.

## Estado da construção

Feito dentro do plano aprovado, na ramificação `feat/35-panel-base` (commits f512de8 a 945909e): testes em vermelho, componentes gerados e ajustados, formatos e `withQuery`, mudança de pasta dos componentes de acesso, tipos do `FormField`, hooks e componentes novos, documentação e decisão 0053, e as correções da verificação. `npm run check` aprovado, com 250 testes; verificação local aprovada, com o resultado em `notas.md`. O Yvan apagou a linha `APP_TIMEZONE=` do `.env.example` e aceitou o acréscimo em `formats.ts`. Relatório em `02_relatorio.md`.
