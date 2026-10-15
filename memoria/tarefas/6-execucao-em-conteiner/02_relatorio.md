---
issue: 6
pull_request: 7
---

# Relatório: Executar a aplicação em contêiner Docker

## O que foi feito

A aplicação compilada roda num contêiner Docker com `docker compose up --build`, em `http://localhost:3000`, da mesma forma em qualquer máquina com o Docker. A imagem é construída em três estágios a partir da `node:24-slim`, com a saída standalone do Next.js, e o servidor roda como o usuário `node`, sem privilégios de administrador. Nenhum arquivo `.env*` entra na imagem: o contêiner recebe as variáveis do `.env.local` só na execução. A publicação continua na Vercel, o banco no Supabase e o desenvolvimento com `npm run dev`; o CI não mudou. Atende RNF014, RNF015 e RS016, com a decisão 0038.

A equipe tem o passo a passo de uso em `infraestrutura.md` (citado no `README.md`) e um pedido pronto em `guia/como-pedir.md`; a IA tem, em `workflows/procedimentos/testes.md`, quando testar no contêiner, quais comandos usar e como examinar a imagem sem expor as variáveis.

Desvios do plano, registrados em `notas.md`:

- Acréscimo de escopo pedido pelo desenvolvedor na etapa 03 e aprovado no plano: as instruções de uso do Docker para a equipe e para a IA (`workflows/procedimentos/testes.md` e `guia/como-pedir.md`, fora do plano original, e texto novo em `infraestrutura.md` e no `README.md`).
- Os critérios 1 e 2, previstos como teste manual de um integrante, foram verificados pelo agente nesta máquina, depois que o desenvolvedor instalou o Docker Desktop e criou o `.env.local`.

## Arquivos alterados

- `Dockerfile`: estágios `dependencies` (`npm ci`), `builder` (`npm run build`, sem variáveis) e `runner` (`server.js`, `public/` e `.next/static/`, `USER node`, `HOSTNAME=0.0.0.0`).
- `.dockerignore`: `**/.env*`, `**/node_modules`, `**/.next`, `.git` e `.claude` (L1).
- `compose.yaml`: projeto `glow`, serviço `app` na porta 3000, `env_file: .env.local`.
- `next.config.ts`: `output: "standalone"`.
- `package.json`: sem o script `start` (L3).
- `guia/regras.md` e `.claude/settings.json`: comandos do Docker que mostram as variáveis do `.env.local` (L4).
- `AGENTS.md`, `README.md`, `setup/questionario.md` (seção 3), `docs/plataforma/visao-geral.md`, `infraestrutura.md` (L2 e seção "Execução em contêiner", com o passo a passo), `estrutura-de-pastas.md`, `seguranca.md` (RS016) e `docs/plataforma/CONTEXT.md`.
- `workflows/procedimentos/testes.md`: seção "Contêiner (Docker)", com o procedimento da IA.
- `guia/como-pedir.md`: pedido "Testar no contêiner" em "Outros pedidos".
- `docs/decisoes/0038-execucao-em-conteiner.md` e `docs/decisoes/CONTEXT.md`: decisão 0038.
- `memoria/tarefas/6-execucao-em-conteiner/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: aprovado no worktree e num clone limpo da ramificação.
- Critério 1: `docker compose up --build` com o `.env.local` do desenvolvedor (cópia do `.env.example`): `/` com 200, `lang="pt-BR"`, título e `<h1>` "Glow – Estética Automotiva", os sete estáticos com 200 e 404 numa rota inexistente; `docker compose down` em cerca de 1 s. Sem o `.env.local`, o Compose para com "env file ... not found".
- Critério 2: na imagem, `find / -xdev` não acha `.env*`, `.git` nem `.claude`; `id` dá `node` (uid 1000), a configuração tem `User=node`, e `docker compose top` mostra o `next-server` com uid 1000. O contexto do build tem 22,6 kB, e o estágio `builder` também não tem `.env*`, `.git` nem `.claude` (L1). `docker stop` em 0,6 s, com o `SIGTERM` tratado pelo Next.js.
- Critério 3: checks `check` e `Vercel` conferidos neste PR.
- Critério 4: `npm run dev` serve `/` com 200 e o `<h1>`; o `AGENTS.md` mantém o hash depois do `next dev`.
- Critério 5: `git grep -i -E "docker|contêiner|conteiner"` fora de `memoria/tarefas/`; cada resultado conferido com a seção 8.6 e os Quadros 1, 35, 36 e 38. A 0030 continua com "contêineres" na alternativa descartada (registro imutável), e a 0038 explica que ali se trata da hospedagem.
- Sem Docker, antes: num clone limpo, `npm run build` gera `.next/standalone/` (32 MB) sem `.env*` nem `.git`, e o `server.js`, com `public/` e `.next/static/` copiados, serve a página e os estáticos.
- Procedimento de `testes.md` executado como escrito: `docker compose up --build -d`, `/` com 200, `docker compose top` com uid 1000, `docker compose logs app`, `docker run --rm --entrypoint sh glow-app` com `id` dando `node` e sem `.env*` nem `.git`, e `docker compose down`.
- Nenhum teste automatizado: a tarefa não cria regra de negócio nem esquema (decisões 0024 e 0035).
- Durante os testes, nenhum comando mostrou as variáveis do `.env.local` (L4): só a imagem, construída sem elas, foi examinada por dentro.

## Documentação atualizada

- Módulos: `AGENTS.md`, `README.md`, `setup/questionario.md`, `guia/regras.md`, `guia/como-pedir.md`, `workflows/procedimentos/testes.md`, `docs/plataforma/CONTEXT.md`, `visao-geral.md`, `infraestrutura.md`, `estrutura-de-pastas.md` e `seguranca.md`.
- Lacunas resolvidas:
  - L1, padrões do `.dockerignore` só na raiz → `**/` e `.claude` → `.dockerignore` e `infraestrutura.md`.
  - L2, imagem construída sem variáveis → código lê as variáveis só na execução → `infraestrutura.md` ("Variáveis de ambiente").
  - L3, aviso do `next start` com a saída standalone → script `start` removido → `package.json`.
  - L4, comandos do Docker que mostram as variáveis → regra e bloqueio → `guia/regras.md` e `.claude/settings.json`.
- Decisões: 0038 criada (o Quadro 38 já a traz).
- Documentos formais a atualizar:
  - Documentação de Arquitetura de Software, seção 8.6: o `.dockerignore` exclui os `.env*`, `node_modules` e `.next` de qualquer pasta, além do `.git` e da pasta `.claude`, onde ficam os worktrees do Claude Code (L1).
  - Documentação de Arquitetura de Software, seção 8.2: o código lê as variáveis na execução, durante a requisição, nunca na construção, porque a imagem do contêiner é construída sem elas (L2).
  - Documentação de Arquitetura de Software, seção 3.1: `.dockerignore` na raiz, ao lado do `Dockerfile` e do `compose.yaml` (opcional; a árvore do documento é resumida).
  - Documentação de Desenvolvimento com IA, seção 5 (regras da IA): o agente também não exibe as variáveis pelo Docker (`docker compose config`, `docker inspect` e `env` dentro do contêiner) (L4).
  - Documentação de Desenvolvimento com IA, seção 6.2: o `deny` do `.claude/settings.json` inclui `docker compose config`, `docker inspect`, `docker container inspect`, `docker exec` e `docker compose exec` (L4).
  - Documentação de Desenvolvimento com IA, seção 8 (testes): quando a tarefa muda a imagem, o `next.config.ts`, as dependências ou a leitura de variáveis, a aplicação compilada também é conferida no contêiner com `docker compose up --build`, examinando a imagem sem o `.env.local`.
  - Documentação de Arquitetura de Software, seção 8.6: passo a passo de uso (Docker Desktop, `.env.local`, `--build`, encerramento e porta 3000 em comum com o `npm run dev`), se o documento for detalhar o uso.

## Pendências

- Número da decisão: se a #2 for incorporada antes deste PR com a 0038 dela, este registro passa a 0039 (nome do arquivo, `id`, título, índice e citações em `infraestrutura.md` e `estrutura-de-pastas.md`).
- O CI não constrói a imagem (fora do escopo da issue): uma mudança que quebre o `Dockerfile` só aparece quando alguém roda o `docker compose up --build`.
- A tarefa dos clientes do Supabase confere a leitura das variáveis só na execução (L2) e os cookies `Secure` em `http://localhost` no contêiner.
