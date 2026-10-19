---
issue: 22
pull_request: 28
---

# Relatório: Base do servidor: clientes do Supabase, tratamento único das requisições e registro

## O que foi feito

Nenhuma rota de negócio ou tela mudou. A partir da #23, toda rota da API passa a ter em `src/server`:

- **Tratamento único** (`src/server/http/handler.ts`): `handleRoute` envolve a função da rota. Gera o `requestId`. Nas gravações, recusa outra origem (403 `FORBIDDEN`), corpo acima de 100 KB (413) e corpo fora de JSON (415) antes da rota, e entrega o corpo já convertido (RS014). Converte `AppError` e `ZodError` em Problem Details e qualquer outra falha em 500 genérico (RS017, decisão 0025).
- **Registro** (`logger.ts`): uma linha JSON por requisição, com o nível pelo resultado, e linhas próprias para os eventos de negócio, todas com o `requestId` guardado pelo `AsyncLocalStorage`. Nada de cabeçalhos, cookies, query string ou corpo (RS018, decisão 0029).
- **Respostas** (`respond.ts`): 200, 201, 204 e a página `{ data, page, pageSize, total }` (RNF008).
- **Clientes do Supabase** (`src/server/supabase/clients.ts`): o de serviço, para dados e contas, e o de sessão do `@supabase/ssr`, com cookies `HttpOnly`, `Secure` e `SameSite=Lax`, que só fala com o Supabase Auth. Os dois leem as variáveis na requisição (RS007, RS016, decisão 0042).
- **Cabeçalhos de segurança** (`next.config.ts`): os cinco de `seguranca.md`, em todas as respostas.
- **Testes**: 42 casos em `tests/http/`, enviados num commit anterior ao código (decisões 0035 e 0045).
- **Dependência**: `@supabase/ssr` 0.12.7.
- **Lacunas**: L1 a L6 decididas pelo desenvolvedor (opção 1 em todas) e gravadas nos módulos de `docs/`.

## Arquivos alterados

- `package.json`, `package-lock.json`: `@supabase/ssr` 0.12.7, com versão exata. O lockfile foi gerado com o npm 11.21.1, e só entraram `@supabase/ssr` e `cookie`.
- `src/server/http/handler.ts`, `logger.ts`, `respond.ts`: novos.
- `src/server/supabase/clients.ts`: novo.
- `next.config.ts`: `headers()` com os cabeçalhos de segurança.
- `tests/http/handler.test.ts`, `logger.test.ts`, `respond.test.ts` e `README.md`: novos.
- `tests/README.md`, `docs/padroes/testes.md`, `docs/plataforma/estrutura-de-pastas.md`: a pasta `tests/http/` (L1).
- `docs/decisoes/0045-testes-do-tratamento-unico.md` (nova), `0024-testes-das-regras-de-negocio.md` (só o `status`) e `CONTEXT.md`.
- `docs/padroes/api.md`, `docs/padroes/backend.md`, `docs/plataforma/seguranca.md` e `docs/plataforma/infraestrutura.md`: textos das lacunas.
- `memoria/tarefas/22-base-do-servidor/`: plano, notas e este relatório.
- `setup/questionario.md` estava no plano, pela correção do Kayke (commit 97f6d99). O conteúdo já tinha chegado à `main` pelo PR #20, então o merge da ramificação `docs/kayke-collaborator` não muda nenhum arquivo.

## Testes executados

- `npm run check`: passou sem erros nem avisos (Prettier, `tsc`, ESLint e 135 testes do Vitest, 42 deles novos).
- Vermelho antes do verde: no commit dos testes (e0c0039), as três suítes falhavam porque os módulos não existiam.
- `npm audit --omit=dev --audit-level=high`, o mesmo do CI: nenhuma vulnerabilidade.
- Rota temporária, só no worktree e apagada antes dos commits:
  - o `next typegen` aceitou a função do `handleRoute` e recusou um parâmetro de tipo errado;
  - no `next dev`, com `curl`: JSON da mesma origem 200; `text/plain` 415; 150 KB 413, com e sem `Content-Length`; outra origem e sem `Origin` 403, com linha `warn`; `DELETE` sem corpo 204; JSON inválido 400, sem a senha do corpo no registro.
- Cabeçalhos de segurança: os cinco vieram em `/`, numa rota da API e num 404 de `/api`, no `next dev` e no contêiner.
- Contêiner, porque mudaram as dependências, o `next.config.ts` e a leitura das variáveis: sem `.env.local` no worktree, `docker build` concluiu sem nenhuma variável, e `docker run` respondeu 200 na página inicial. O contêiner e a imagem foram removidos.
- Manual na pré-visualização: o build da Vercel concluiu, e o endereço da ramificação (`glow-projetoaldo-git-feat-22-server-base-yvanshaw1s-projects.vercel.app`), o mesmo do link do PR, respondeu 200 em `/` e 404 em `/api/nao-existe`, os dois com os cinco cabeçalhos de segurança e os valores de `backend.md`. Não há tela nem rota para percorrer.

## Documentação atualizada

- Módulos: `docs/padroes/api.md` (Validação e Erros), `docs/padroes/backend.md` (Erros, Registro e a seção nova Cabeçalhos de segurança), `docs/padroes/testes.md`, `docs/plataforma/seguranca.md` (Complementos), `docs/plataforma/infraestrutura.md` (Variáveis de ambiente), `docs/plataforma/estrutura-de-pastas.md` e os README de `tests/` e `tests/http/`.
- Lacunas resolvidas, todas na opção 1:
  - L1, testes do tratamento único: decisão 0045, `testes.md`, `estrutura-de-pastas.md` e os README de `tests/`;
  - L2, código da recusa por origem: `api.md`;
  - L3, origens aceitas: `api.md` e `infraestrutura.md`, sem `APP_URL`;
  - L4, gravação sem corpo, 100 KB, JSON inválido e campos aninhados: `api.md`;
  - L5, linha de registro por requisição: `backend.md`;
  - L6, valores dos cabeçalhos: `backend.md` e `seguranca.md`.
- Decisões: 0045 criada; 0024 substituída por 0045.
- Documentos formais a atualizar:
  - **Documentação de Arquitetura de Software, seção 9 (Quadro 38):** a decisão "Testes automatizados apenas das regras de negócio" passa a "Testes automatizados das regras, dos esquemas e do tratamento único das requisições" (0045).
  - **Documentação de Desenvolvimento com IA, seção 8 (testes):** o Vitest testa também o tratamento único (`src/server/http`), em `tests/http/`.
  - **Documentação de Arquitetura de Software, seção 8 (Quadros 36 e 37):** sai a variável `APP_URL`.
  - **Documentação de Arquitetura de Software, seção 6 (validação e erros da API):** o `Origin` precisa ter o host da própria requisição, e a gravação sem ele é recusada com 403 `FORBIDDEN`; a gravação sem corpo dispensa o formato; 100 KB são 102.400 bytes; JSON inválido responde 400 sem `fields`; campo aninhado em `fields` usa o caminho com pontos.
  - **Documentação de Arquitetura de Software, seções 4 e 6.4 (backend):** uma linha de registro por requisição, com o nível pelo resultado; toda rota usa o `handleRoute`; a tabela de valores dos cabeçalhos de segurança.
  - **Documentação de Arquitetura de Software, seção 7 (Quadro 35), Complementos:** a política de conteúdo também impede o desvio de links e formulários, e os valores ficam em `backend.md`.
  - **Documentação de Arquitetura de Software, seções 3.1 e 4.1 (estrutura de pastas):** `tests/http/`.

## Pendências

- Desenvolvedor: tirar a linha `APP_URL=` do `.env.example` (L3), já que o agente não edita `.env*`; se quiser, tirar também do `.env.local` e das variáveis da Vercel. O código não lê mais essa variável.
- Para a #23, registradas em `notas.md`: o `@supabase/ssr` fixa a validade dos cookies em 400 dias (RS007); os cabeçalhos anticache que ele passa ao `setAll` ainda não chegam à resposta (`TODO(#23)` em `clients.ts`); o usuário entra na linha do registro com os guards (`TODO(#23)` em `logger.ts`); o cookie `Secure` em `http://localhost` não foi conferido no Safari.
- O PR soma cerca de 470 linhas sem contar os testes, o lockfile e a pasta da tarefa, acima das cerca de 400 de `pull-request.md`. Cerca de 60 são documentação, e o `handler.ts` tem 243 linhas, um quarto delas comentários que citam a regra de cada trecho.
- A ramificação local `docs/kayke-collaborator` pode ser apagada: o conteúdo já está na `main`.
