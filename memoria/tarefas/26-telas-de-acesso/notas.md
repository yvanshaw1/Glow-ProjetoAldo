# Notas: 26-telas-de-acesso

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-20 – descoberta

Conferências do planejamento, sem alterar o código do projeto:

- **Worktree.** O desta sessão é `24-cadastro-e-senha-e77823`, na ramificação `claude/compassionate-mayer-f655d1`, em aadac86, igual à `origin/main` (#21 a #24 e o PR #31). O plano e as notas ficam sem commit, como nas etapas 01 anteriores.
- **Arquivos da #25.** Eles ainda não estão na `main`. Mover a ramificação da sessão para `origin/feat/25-frontend-base` (`git reset --keep`) foi negado pela permissão da sessão. Os arquivos foram lidos de uma cópia extraída com `git archive origin/feat/25-frontend-base` no scratchpad, e o código instalado (Next.js 16.4.1), no `node_modules` do worktree `angry-cray-d35991`, que está em `feat/25-frontend-base`, só para leitura.
- **Outras tarefas.** O PR yvanshaw1/Glow-ProjetoAldo#33 (#25) está aberto, sem revisão. As únicas issues abertas são a #25 e a #26. A pasta de notas compartilhadas da sessão que iniciou esta estava vazia; as notas da #23, da #24 e da #25 estão nas pastas de outras sessões da família.
- **Next.js 16.4.1** (`node_modules/next/dist/docs` e `dist/server/web/adapter.js`):
  - o proxy roda no Node.js, e o `cookies()` de `next/headers` funciona nele: o adaptador cria um armazenamento de requisição (`createRequestStoreForAPI`) e, no fim, grava o `Set-Cookie` do que o `cookies()` gravou na resposta devolvida pelo proxy, qualquer que seja;
  - o guia de autenticação recomenda só conferência "otimista" no proxy, porque ele roda também nas pré-buscas dos links; a documentação do projeto (`autenticacao.md`) pede consulta ao perfil, e o plano propõe a decisão 0051;
  - o `matcher` precisa ser literal, e `/admin/:path*` também casa com `/admin`;
  - o proxy recebe o endereço sem os parâmetros internos (`_rsc`), salvo com `skipProxyUrlNormalize`;
  - a pré-busca de rota estática (`prefetch` padrão) traz a rota inteira e passa pelo proxy.
- **Protótipo descartável** (`probe/` no scratchpad: Next.js 16.4.1, React 19.3.0 e `server-only` 0.0.1, com `next build` e `next start -p 3926`, encerrado por PID):
  - o proxy importou um módulo com `import "server-only"`, e o build passou;
  - o `cookies().set()` dentro do proxy saiu como `Set-Cookie` na página e no redirecionamento 307;
  - o `Cache-Control: private, no-store` posto pelo proxy ficou na resposta da página estática (`/admin`, `x-nextjs-cache: HIT`), no lugar do `s-maxage=31536000`; a `/`, fora do `matcher`, manteve o `s-maxage`.
- **Código da #25 e da #24 usado pelo plano:**
  - `session.ts` (`getSessionUserId`, `loadAccount`) usa `createSessionClient()`, com o `cookies()`; serve ao proxy sem mudança;
  - o `Alert` sempre tem `role="alert"`, com as variantes `default` e `destructive`;
  - o `FieldError` tem `role="alert"`, mas não liga o erro ao campo por `aria-describedby`;
  - o `FieldDescription` pinta o link interno com `text-primary` no cursor, o que `design.md` proíbe no tema claro: não pôr link na descrição;
  - não há componente de cartão nem de indicador giratório em `src/components/ui/`;
  - o cabeçalho do portal calcula o "Painel" pela primeira permissão (`site-header.tsx`).
- **Catálogo.** `EMAIL_IN_USE` já diz "Se você já tem conta, entre com ela.", e `ACCOUNT_LOCKED` diz "Aguarde alguns minutos", sem o tempo. O `ApiError` não expõe o `Retry-After`.
- **Wireframes.** O Read do PDF sem `pages` funcionou; com `pages`, falhou por falta do `pdftoppm`. O login e o cadastro são um cartão centralizado, com o atalho entre as duas telas. Trazem "Esqueci a senha", captcha, aceite de termos, telefone opcional, mostrar senha e confirmar senha, que não têm requisito (L6 trata dos dois últimos).
- **Documentação:**
  - recuperação de senha fora do escopo (`visao-geral.md`); captcha descartado de propósito (`seguranca.md`);
  - o UC08 FE03 pede informar a restrição, e a tabela de `autenticacao.md` só redireciona (L4);
  - `autenticacao.md` tem 6,3 mil caracteres, e o texto novo passaria do limite de cerca de 2 mil tokens (L3 propõe o módulo `protecao-das-paginas.md`);
  - `src/README.md` aponta `autenticacao.md` para as regras do `proxy.ts`;
  - a 0050 é citada em `testes.md` e nos README de `tests/`, `tests/http/` e `tests/lib/`.

## 2026-10-20 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas L1 a L7 e as decisões novas 0051 (proteção das páginas no `proxy.ts`, com sessão e conta conferidas como nos guards, e o destino depois do login decidido por ele) e 0052 (testes da formatação e da proteção das páginas, substitui 0050). Nada foi construído, e não há migration nem dependência nova.

Pontos explícitos para a aprovação:

- as chaves do banco local no `next start`;
- a redução temporária do `jwt_expiry` no `config.toml` local, para conferir a renovação do token pelo proxy;
- o cookie de teste no Lighthouse de `/set-password`;
- o cliente de teste na pré-visualização.

A ramificação `feat/26-access-screens` sai da `main` depois do #33, ou de `feat/25-frontend-base`, com merge da `main` depois do squash.

## 2026-10-20 – decisão

Plano aprovado por yvan (20/10/2026), com a opção 1 em L1 a L5 e L7, a **opção 2 em L6** ("Mostrar senha" e "Confirmar senha" no cadastro e na troca de senha), as decisões 0051 e 0052 e os quatro pontos para aprovação. Na conversa, o Yvan escreveu "campo de confirmação de e-mail", mas a marcação no arquivo é a da L6, de confirmação de senha; não há lacuna de confirmação de e-mail. Status em `em_execucao`.

Como o plano manda, o texto da L6 foi refeito para a opção 2 antes da construção. Entram mais três arquivos:

- `src/shared/validation/auth.ts`, com `registerFormSchema` e `changePasswordFormSchema`;
- `tests/validation/auth.test.ts`, com 7 casos novos;
- `docs/plataforma/mensagens-de-validacao.md`, com "As senhas não conferem.".

Conferido no Zod 4.6.7: o `refine` com a opção `when` roda a comparação mesmo com outro campo inválido; `.extend()` num esquema com `refine` não lança erro, e `safeExtend` existe.

## 2026-10-20 – descoberta

- O PR #33 foi incorporado em a2c861f (20/10, 11:25), com o mesmo conteúdo de ff9e9ce, revisado no planejamento. A ramificação `feat/26-access-screens` saiu da `origin/main` (a2c861f), sem vínculo com a `main`. `npm ci` feito (646 pacotes).

## 2026-10-20 – desvio

Etapa 02, construção. Commits, nesta ordem:

- a5ab868: testes em vermelho (2 arquivos sem módulo e 7 casos de `auth.test.ts`);
- 6fc269b: `page-access.ts`, `phone.ts` e os esquemas dos formulários (227 testes verdes);
- 56fed13: `src/proxy.ts`;
- f773d18: telas, componentes de `portal/auth` e o aviso de acesso negado nos layouts;
- dae2960: documentação, decisões 0051 e 0052 e README.

Desvios pequenos, sem mudar regra nem escopo:

- **Dois arquivos a mais em `src/components/portal/auth/`:** `form-field.tsx` (rótulo, campo, descrição e erro ligados por `aria-describedby`, usado pelos 11 campos) e `next-param.ts` (`readNextParam` e `withNext`, usados pelas páginas e pelos dois formulários). O README da pasta ganhou o `next-param.ts`.
- **"Mostrar senha" com nome fixo.** O botão mantém o nome "Mostrar senha" e diz o estado em `aria-pressed`. Trocar o nome junto com o estado contraria o padrão de botão de alternância. O texto do `frontend.md` já diz só "Mostrar senha".
- **Cadastro com `router.push`.** Depois do 201, o cadastro vai ao login pelo roteador do Next.js, porque o ESLint (`@next/next/no-location-assign-relative-destination`) recusa o `location.assign`. O visitante continua visitante, e o proxy roda na busca da página. O login e a troca de senha continuam com `location.replace`, que recarrega a sessão.
- **Título de cada página:** "Entrar – Glow", "Criar conta – Glow" e "Nova senha – Glow" (`metadata`), para o título da aba descrever a tela (WCAG 2.4.2).
- **Registro da falha no proxy.** O `describeError` do tratamento único é privado; o proxy registra a falha (`page_protection_failed`) só com o caminho, o código e a mensagem, sem mexer em `handler.ts`.
- **Aviso de acesso negado.** O estado acompanha o caminho durante a renderização, sem `setState` em efeito: o aviso some ao sair da página e não volta ao retornar a ela. O painel passou o `main` a `flex-col gap-8`, para o aviso ficar acima do conteúdo.
- **Rotas:** `/login` e `/register` ficaram dinâmicas (leem `searchParams`), e `/set-password`, estática. O build passou com o proxy importando `src/server`.

## 2026-10-20 – descoberta

Verificação local (Supabase local, `next build` e `next start -p 3026`, variáveis por `local/local-env.sh` e contas por `local/accounts.mjs` no scratchpad; o admin pelo `create-admin.mjs`):

- **Proxy** (`local/check-proxy.mjs`): 46 de 46. Na primeira rodada, 3 casos acusaram falha só porque a página não encontrada do Next.js troca o `Cache-Control` do proxy por `private, no-cache, no-store, max-age=0, must-revalidate`, ainda mais restrito; a conferência passou a aceitar qualquer valor com `private` e `no-store`.
- **Navegador do app:** os 7 critérios conferidos na tela, a 360 e a 1440 px e nos dois temas, com o resultado no relatório.
- **Corpo da troca de senha:** um invólucro do `fetch` na página mostrou que o envio leva só `currentPassword` e `newPassword`.
- **Correção na verificação:** depois de um erro da API, o aviso continuava na tela quando o envio seguinte parava na validação da tela. Os três formulários passaram a limpá-lo também nesse caso (`handleSubmit(submit, clearFailure)`, commit 0e6d47d).
- **Aviso de acesso negado:** some ao ir a outra página, mas não ao voltar à mesma página por um link; o texto de `protecao-das-paginas.md` passou a dizer "quando a pessoa vai a outra página".
- **Lighthouse 13.5.0:** acessibilidade 100 nas 12 auditorias. O cookie de `/set-password` foi para `--extra-headers` num arquivo do scratchpad, apagado depois.
- **Pré-busca:** o painel do navegador do app estava oculto. A carga do painel do admin gerou 2 chamadas `GET /user` no registro do `supabase_auth_glow` (o proxy e o `me`), e o cursor sobre um link não gerou nenhuma; sem conclusão sobre a pré-busca com a página visível. A contagem anterior, de 7 chamadas, era do Lighthouse rodando ao mesmo tempo.
- **Supabase Auth parado** (`docker stop supabase_auth_glow`, religado): `/admin` e `/login` com 200, `/admin/settings` com a página não encontrada (o proxy não decide sem a conta), linha `warn` `auth_unavailable` sem `requestId`, login com 503.
- **Renovação:** com `jwt_expiry = 60` só no `config.toml` local (desfeito com `git checkout` e conferido no `git status`), duas rodadas de 75 segundos: a página do proxy trouxe `Set-Cookie` com os cookies novos, e o `me` respondeu 200.
- **Limite de entradas:** cerca de 30 entradas no Supabase Auth em 15 minutos, espaçadas; o limite não foi atingido.
- **Encerramento:** `next start` encerrado por PID, `npx supabase stop` (com o volume) e a emulação de tela do navegador do app desfeita.
