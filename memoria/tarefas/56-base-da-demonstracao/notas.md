# Notas: 56-base-da-demonstracao

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-21 – descoberta

Conferências do planejamento, sem alterar o código do projeto:

- **Origem.** Sessão iniciada pela sessão principal para conduzir a #56 (T0 da `proposta-das-issues.md` da #66), aprovada pelo Yvan com a opção 1 em LT1 a LT4. Os textos de LT1 a LT4 entram no plano como estão; o que eles não cobrem virou L1 a L3.
- **Worktree.** `56-base-da-demonstracao-e6d9a4`, na ramificação `claude/56-base-da-demonstracao-e6d9a4`, em dd70f96, igual à `origin/main` depois do `git fetch` (#21 a #26, #35 a #38 e o PR 1 da #66). Plano e notas sem commit, como nas etapas 01 anteriores. A etapa 02 cria `feat/56-demo-data` a partir da `origin/main`.
- **GitHub.** Nenhum PR aberto. A #46 já diz que "a etiqueta de status vem da #56". A pasta de notas compartilhadas desta sessão estava vazia; as das sessões irmãs são de tarefas antigas (#17 a #26, #38).
- **Cliente da API.** `apiRequest` chama `send` direto; o tipo `HttpMethod` não é exportado; `catalogError` é privado. Para não criar import circular, o `NOT_IMPLEMENTED` é lançado no próprio `api-client.ts`, e `src/lib/demo/` só diz se a entrada tem `load`.
- **Testes atuais.** `tests/lib/api-client.test.ts` usa `/api/auth/*`, `/api/admin/clients`, `/api/admin/staff` e `/api/me/profile`; nenhum teste do projeto usa `vi.mock` nem `vi.useFakeTimers`. O `vitest.config.ts` resolve o `@/`, então o `vi.mock("@/lib/demo/routes")` funciona sem mudança.
- **Paginação.** `paginationSchema(defaultPageSize)` (`src/shared/validation/params.ts`) já faz o padrão, o mínimo de 1 e o máximo de 50; a demonstração o reutiliza.
- **Filtros das rotas futuras.** `rotas.md` tem filtros que não são igualdade: `view` (`today`, `future`, `history`) e `sort` em `GET /api/admin/appointments`, e `includeInactive` no catálogo do painel. Ficam na resposta de cada módulo, antes do `demoPage`.
- **Contraste da etiqueta**, pela fórmula da WCAG, sobre `--background` (roteiro `contrast.mjs` no scratchpad): `--link` sobre o próprio `--link` a 10% dá 4,20 no claro e 5,39 no escuro (reprova no claro; a 12% e 15%, pior); `--destructive` sobre ele a 10%, 5,03 e 5,54; `--link` sobre o fundo, 4,80 e 6,53; `--foreground`, 12,50 e 11,75; `--muted-foreground`, 4,94 e 4,85; `--foreground` sobre `--muted`, 7,65 e 14,21 (descartado: `--muted` é a cor do lugar reservado do carregamento).
- **Componentes.** O `Alert` grava `role="alert"`, mas aceita outro por propriedade (por isso `role="note"` no aviso). O `Badge` tem as variantes `secondary` (fundo com `shadow-neu-sm`), `destructive` (fundo a 10%) e `outline`. O `lucide-react` 1.59 tem `flask-conical` (notas da #66).
- **Proteção das páginas.** `classifyPage` (`src/server/auth/page-access.ts`) trata o caminho desconhecido como público: a página temporária `/demo-check` abre sem sessão.
- **Checklist do PR.** `workflows/procedimentos/pull-request.md` só tem o checklist de segurança, espelhado no modelo de PR, que também tem "Critérios de pronto" (L2).
- **Tamanho dos módulos.** `design.md` 7,8 mil caracteres, `api.md` 8,1 mil, `frontend.md` 7,7 mil e `componentes.md` 3,6 mil: por isso a tabela da etiqueta vai para `componentes.md` (L1), e `api.md` e `frontend.md` recebem só uma ou duas linhas.
- **Decisão.** A última é a 0054; o 0055 está livre hoje e é conferido de novo na etapa 03.

## 2026-10-21 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas:

- L1, aparência da etiqueta de status: recomendado quatro tons por fase, só com as cores do tema (em aberto em relevo com `--link`; Concluído rebaixado; Cancelado em `--destructive`; Reagendado só com a borda);
- L2, item do checklist de LT4: recomendado uma seção própria em `pull-request.md` e a caixa em "Critérios de pronto" do modelo de PR, fora do checklist de segurança;
- L3, posição do aviso: recomendado logo abaixo do título da página, ou no topo da aba ou da seção.

Decisão 0055 aprovada na proposta, gravada na etapa 03. Nada foi construído; não há rota, migration nem dependência nova.

Pontos explícitos para a aprovação: a página temporária `src/app/demo-check/page.tsx`, sem commit; as chaves do banco local no `next start`; a conta de admin no banco local; o cookie de teste no Lighthouse.

## 2026-10-21 – decisão

Plano aprovado por yvan (21/10/2026 - 10:28), com a opção 1 em L1 a L3 e os pontos de aprovação (página temporária sem commit, chaves do banco local no `next start`, admin no banco local e cookie no Lighthouse). O primeiro aviso de aprovação chegou com o arquivo ainda em `aguardando_aprovacao`; a etapa 02 só começou depois que o Yvan gravou o `aprovado`. Status em `em_execucao`. Ramificação `feat/56-demo-data` criada da `origin/main` (dd70f96), sem vínculo com a `main`, e `npx -y npm@11.21.1 ci`.

## 2026-10-21 – desvio

Etapa 02, construção. Commits, nesta ordem:

- 49251e8: testes em vermelho (10 dos 12 casos novos falhavam; os 2 de ida à rede já passavam, porque conferem o comportamento atual);
- 1c4a54e: `NOT_IMPLEMENTED`, `src/lib/demo/` e o `apiRequest` (383 testes verdes);
- 986ff7e: `DemoNotice` e `StatusBadge`;
- 9f6a4a6: documentação das lacunas e de LT1 a LT4, e os README.

Desvios pequenos, sem mudar regra nem escopo:

- **Lista do teste.** O `seed-demo.sql` tem 18 serviços (9 principais, 5 complementares e 4 adicionais); a lista do teste os usa na ordem do arquivo e completa os 25 com "Serviço de teste 19" a "Serviço de teste 25", do tipo principal. Os valores esperados ("Lavagem" em 5, 4 adicionais, o 7º é "Higienização interna completa") foram contados à mão.
- **Comentário do teste.** O cabeçalho de `api-client.test.ts` citava a decisão 0050, substituída pela 0052; passou a citar a 0052 e a 0055.
- **Formatação.** O Prettier reformatou o arquivo de testes depois do primeiro commit; a formatação entrou no próprio commit dos testes, com `--amend`, antes de qualquer envio.
- **Variantes da etiqueta.** Em relevo é a variante `secondary` do `Badge` com `text-link`; rebaixada, a `outline` com `border-transparent inset-shadow-neu-sm`; Cancelado, a `destructive`; Reagendado, a `outline` com `border-input text-muted-foreground`.

## 2026-10-21 – descoberta

Verificação local, aprovada:

- **Ambiente.** Docker Desktop já aberto; `npx supabase start` e `db reset` (só o `seed.sql`); variáveis por `local/local-env.sh` no scratchpad, que só aceita `http://127.0.0.1:` e não as exibe; admin pelo `create-admin.mjs`, com a senha gerada num arquivo do scratchpad; `npx next build` e `npx next start -p 3056`.
- **Página temporária** `src/app/demo-check/page.tsx` (`local/check-ui.mjs`, Chrome sem interface com o `puppeteer-core` do cache do Lighthouse), a 360 × 800 e a 1440 × 900, claro e escuro: o aviso com o texto inteiro, `role="note"`, o ícone de 16 px com `aria-hidden`, sem botão e sem nenhum `role="alert"` na página; as sete etiquetas com o nome escrito e as cores previstas (em aberto `rgb(163, 74, 38)` / `rgb(255, 154, 86)` com sombra; Concluído com a cor do texto e a sombra rebaixada; Cancelado em `--destructive` a 10%; Reagendado com a borda `--input`); nada transborda. Pelo teclado, só o "Pular para o conteúdo" recebe foco: o aviso e as etiquetas não são interativos.
- **Critério 4.** Login do admin por `/login`; em `/admin/settings`, `GET /api/admin/settings/company` 200, `PUT` 200 e "Dados da empresa salvos."; o rodapé chama `GET /api/public/company` (200); nada transborda a 360 px.
- **Lighthouse 13.5.0**, acessibilidade: 100 nas 12 execuções (`/demo-check`, `/login` e `/admin/settings`; celular e computador; claro e escuro com `--force-dark-mode`, conferido na captura de página inteira), com a auditoria de contraste aprovada. O cookie foi por `--extra-headers`; o arquivo de cabeçalhos e os JSON foram apagados.
- **Registro:** nenhuma linha do `next start` com cookie, token, cabeçalho de autorização, a senha ou o e-mail de teste, e nenhuma linha `error`.
- **Encerramento:** `next start` encerrado por PID, `npx supabase stop`, a página temporária apagada (`git status` só com a pasta da tarefa) e um novo `npx next build` sem ela. `npm run check` sem erros nem avisos, com 383 testes; `npm audit --omit=dev --audit-level=high` com 0. Capturas em `local/shots/` no scratchpad.

## 2026-10-21 – decisão

Etapa 03: decisão 0055 gravada (a17b24d), com o número ainda livre (a `origin/main` continuava em dd70f96, sem conflito para atualizar); PR #69 aberto, primeiro como rascunho, para pôr o número no relatório; `02_relatorio.md` gravado e o plano em `concluido`. Diff só com os arquivos da lista do plano: 255 linhas em `src/` sem os README, 265 de testes e 107 de documentação.
