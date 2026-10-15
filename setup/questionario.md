# Questionário de configuração da estrutura

Respondido uma vez pela equipe; as respostas alimentam o `AGENTS.md`, a pasta `guia/` e os arquivos do GitHub. Só é refeito quando a estrutura muda. Itens **pendentes** precisam de resposta antes da primeira tarefa de código.

## 1. Identidade do projeto

- Sistema: Glow – Estética Automotiva; portal público e do cliente e painel administrativo.
- Contexto: MVP da disciplina Sistemas Inteligentes (Sistemas de Informação, CESMAC). Documentação entregue na AV2 (15/10/2026); sistema completo em produção na AV3 (início de dezembro de 2026).
- Equipe: Yvan, Kayke, Laura, Lucas e Igor.
- Fuso da empresa: `America/Maceio`.

## 2. Áreas e responsáveis (**pendente**)

Cada integrante responde por uma área de ponta a ponta: planeja e conduz o agente nas tarefas da área, mantém o padrão dela em `docs/padroes/` e revisa os PRs que a alteram. Ao preencher, copiar para o `AGENTS.md` (seção Áreas) e para `.github/CODEOWNERS`.

| Área | Responsável | Usuário no GitHub |
|---|---|---|
| Frontend | **pendente** | **pendente** |
| Backend e API | **pendente** | **pendente** |
| Banco de dados | **pendente** | **pendente** |
| Testes e QA | **pendente** | **pendente** |
| CI/CD e fluxo Git | **pendente** | **pendente** |

Integrante que aplica as migrations (`supabase db push`): **pendente**.

## 3. Comandos

Criados na tarefa de base do projeto, no `package.json`:

| Comando | Faz |
|---|---|
| `npm run dev` | executa em `http://localhost:3000` |
| `npm run check` | `prettier --check`, `tsc --noEmit`, ESLint e Vitest, na ordem do CI |
| `npm test` | Vitest uma vez |
| `npm run format` | `prettier --write` |

## 4. Convenções

- Código, rotas, tabelas e commits em inglês; interface e documentação em português do Brasil.
- Ramificação `<tipo>/<issue>-<nome-curto>`; Conventional Commits; atualização com `git merge origin/main`; incorporação por squash com `Closes #<issue>`.
- Assistente principal: Claude Code (lê `CLAUDE.md`, que importa `AGENTS.md`). Outros assistentes leem o `AGENTS.md` direto.

## 5. GitHub (**pendente**)

- [x] Repositório criado, com a pasta `App/` como raiz. Endereço: `https://github.com/yvanshaw1/Glow-ProjetoAldo`. Visibilidade: público, porque no plano gratuito a proteção da `main` e a varredura de segredos com proteção de envio só existem em repositório público, e a Vercel Hobby não publica commits de colaboradores em repositório privado.
- [ ] Commit inicial. É feito uma vez, fora do ciclo de tarefas e sem issue, porque o ciclo parte da `main`. Na pasta `App/`:
  - `git init -b main`;
  - `.gitattributes` com `* text=auto eol=lf`, porque o Git do Windows converte as quebras de linha para CRLF e o `prettier --check` falharia;
  - `.gitignore` mínimo com `.env*`, `!.env.example`, `node_modules/`, `.next/` e o arquivo pessoal `settings.local.json` da pasta `.claude/`, que a tarefa #1 completa;
  - o desenvolvedor confere o `git status` antes do commit `docs: add ICM structure and folder skeleton`;
  - remote `origin`.
  
  O envio (`git push -u origin main`) é feito pelo desenvolvedor.
- [ ] Varredura de segredos com proteção de envio ativada (Settings → Security).
- [ ] Etiquetas: `area:frontend`, `area:backend`, `area:banco`, `area:testes`, `area:cicd`, `tipo:funcionalidade`, `tipo:defeito`, `tipo:investigacao`, `tipo:documentacao`, `tipo:configuracao`.
- [ ] Quadro no GitHub Projects com as colunas: a fazer, planejamento, aguardando aprovação, em construção, em revisão, concluído.
- [ ] Proteção da `main`: só por PR; CI e build da Vercel obrigatórios; ramificação atualizada; 1 aprovação, descartada com commits novos; conversas resolvidas; só squash; remoção automática da ramificação incorporada.
- [ ] Alertas de dependências (Dependabot) ativados.

## 6. Serviços (**pendente**)

- [ ] Projeto no Supabase criado; confirmação de e-mail desativada; senha mínima 8; bucket `service-images`.
- [ ] Projeto na Vercel ligado ao repositório, com as variáveis de `docs/plataforma/infraestrutura.md`.
- [ ] Cada integrante com o seu `.env.local` (nunca versionado nem colado em conversas com IA).
