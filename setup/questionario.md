# Questionário de configuração da estrutura

Respondido uma vez pela equipe; as respostas alimentam o `AGENTS.md`, a pasta `guia/` e os arquivos do GitHub. Só é refeito quando a estrutura muda. Itens **pendentes** precisam de resposta antes da primeira tarefa de código.

## 1. Identidade do projeto

- Sistema: Glow – Estética Automotiva; portal público e do cliente e painel administrativo.
- Contexto: MVP da disciplina Sistemas Inteligentes (Sistemas de Informação, CESMAC). Documentação entregue na AV2 (15/10/2026); sistema completo em produção na AV3 (início de dezembro de 2026).
- Equipe: João, Kayke, Laura, Lucas e Yvan.
- Fuso da empresa: `America/Maceio`.

## 2. Equipe

Não há responsável fixo por área (decisão 0039). Cada integrante leva uma tarefa de ponta a ponta, por todas as áreas que ela toca, e conduz o agente nas quatro etapas; qualquer outro integrante revisa e aprova o pull request, nunca o autor. Os padrões de `docs/padroes/` mudam como qualquer documento: numa tarefa, com plano aprovado e revisão.

| Integrante | Usuário no GitHub | Acesso ao repositório |
|---|---|---|
| João | `joaomanoel999` | colaborador |
| Kayke | `Kaykebr144` | convite enviado, ainda não aceito |
| Laura | pendente | sem acesso até informar o usuário |
| Lucas | `LFaustin0` | colaborador |
| Yvan | `yvanshaw1` | dono do repositório |

Integrante que aplica as migrations (`supabase db push`, `workflows/procedimentos/migration.md`): Yvan (`yvanshaw1`).

## 3. Comandos

Criados nas tarefas #1 (`package.json`) e #6 (`compose.yaml`):

| Comando | Faz |
|---|---|
| `npm run dev` | executa em `http://localhost:3000` |
| `npm run check` | `prettier --check`, `tsc --noEmit`, ESLint e Vitest, na ordem do CI |
| `npm test` | Vitest uma vez |
| `npm run format` | `prettier --write` |
| `docker compose up --build` | constrói a imagem e executa a aplicação compilada em contêiner, em `http://localhost:3000` |

## 4. Convenções

- Código, rotas, tabelas e commits em inglês; interface e documentação em português do Brasil.
- Ramificação `<tipo>/<issue>-<nome-curto>`; Conventional Commits; atualização com `git merge origin/main`; incorporação por squash com `Closes #<issue>`.
- Assistente principal: Claude Code (lê `CLAUDE.md`, que importa `AGENTS.md`). Outros assistentes leem o `AGENTS.md` direto.

## 5. GitHub

- [x] Repositório criado, com a pasta `App/` como raiz. Endereço: `https://github.com/yvanshaw1/Glow-ProjetoAldo`. Visibilidade: público, porque no plano gratuito a proteção da `main` e a varredura de segredos com proteção de envio só existem em repositório público, e a Vercel Hobby não publica commits de colaboradores em repositório privado.
- [x] Commit inicial. É feito uma vez, fora do ciclo de tarefas e sem issue, porque o ciclo parte da `main`. Na pasta `App/`:
  - `git init -b main`;
  - `.gitattributes` com `* text=auto eol=lf`, porque o Git do Windows converte as quebras de linha para CRLF e o `prettier --check` falharia;
  - `.gitignore` mínimo com `.env*`, `!.env.example`, `node_modules/`, `.next/` e o arquivo pessoal `settings.local.json` da pasta `.claude/`, que a tarefa #1 completa;
  - o desenvolvedor confere o `git status` antes do commit `docs: add ICM structure and folder skeleton`;
  - remote `origin`.
  
  O envio (`git push -u origin main`) é feito pelo desenvolvedor.
- [x] Varredura de segredos com proteção de envio ativada (Settings → Security).
- [x] Etiquetas: `area:frontend`, `area:backend`, `area:banco`, `area:testes`, `area:cicd`, `tipo:funcionalidade`, `tipo:defeito`, `tipo:investigacao`, `tipo:documentacao`, `tipo:configuracao`. Cada issue leva uma etiqueta de tipo e uma `area:*` para cada área que a tarefa toca.
- [x] Quadro no GitHub Projects com as colunas e as automações de `workflows/CONTEXT.md` (Quadro de tarefas).
- [x] Proteção da `main`, no ruleset `main`, ativo e sem exceções: só por PR, sem exclusão nem envio forçado; CI (`check`) e build da Vercel (`Vercel`) obrigatórios, com a ramificação atualizada; 1 aprovação, descartada com commits novos; conversas resolvidas; só squash; remoção automática da ramificação incorporada.
- [x] Alertas de dependências (Dependabot) ativados.

## 6. Serviços (**pendente**)

- [ ] Projeto no Supabase: criado, ainda sem configuração; faltam desativar a confirmação de e-mail, definir a senha mínima de 8 caracteres e criar o bucket `service-images`.
- [ ] Projeto na Vercel: ligado ao repositório, com o preset Next.js; ainda sem as variáveis de `docs/plataforma/infraestrutura.md`.
- [ ] Cada integrante com o seu `.env.local` (nunca versionado nem colado em conversas com IA): só o Yvan criou o dele, na tarefa #6.
