# Notas: 9-documentos-formais

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-18 – decisão

O desenvolvedor escolheu manter o Docker como está (só executa a aplicação compilada; o desenvolvimento usa o Node.js 24 local) e versionar os .docx no repositório, porque a disciplina exige a documentação no projeto; a IA continua lendo só `docs/`.

## 2026-10-18 – descoberta

Teste do contêiner na `main` (`2f5beee`), com o Docker Desktop 29.8.2: `docker compose up --build -d` subiu em 16 s com cache; `http://localhost:3000` respondeu 200 com o título "Glow – Estética Automotiva"; processo com o uid 1000 (`node`); imagem de 411 MB sem `.env*`, `.git` nem a pasta dos .docx.

## 2026-10-18 – desvio

O Igor saiu do questionário, dos registros da #2 e da capa dos três .docx antes da aprovação do plano, por pedido explícito do desenvolvedor na conversa (correção trivial, sem regra nem código). Os .docx foram salvos pelo Word; as cópias anteriores ficaram fora do repositório.

## 2026-10-18 – descoberta

Verificação da etapa 02, na ramificação `docs/9-formal-documents`: `npm ci` e `npm run check` sem erros nem avisos (a pasta principal não tinha `node_modules`, porque a #1 foi construída num worktree); `npm audit --omit=dev --audit-level=high` sem vulnerabilidades. O `npm ci` aponta 5 vulnerabilidades altas só de desenvolvimento (`eslint-config-next` → `fast-glob` → `micromatch` → `braces`), anteriores a esta tarefa e fora do escopo. `docker compose up --build`: status 200, processo `node`, imagem sem `documentos-formais` nem `.env*`. Os três .docx abrem no Word, com o sumário atualizado; as páginas alteradas foram conferidas em imagem.

## 2026-10-18 – desvio

Nos .docx, além do texto previsto: a seção 7.1 do Desenvolvimento com IA passou a se chamar "Áreas e Divisão das Tarefas", e o Quadro 8, "Áreas do sistema", porque os títulos antigos falavam de responsabilidade por área (decisão 0039). O nome do integrante retirado continua só nos registros desta tarefa, que descrevem a remoção, e na mensagem do primeiro commit, que o squash não leva para a `main`.

## 2026-10-18 – dúvida

`docs/plataforma/infraestrutura.md`, tabela de "Execução em contêiner": a linha do `.dockerignore` não cita a pasta `documentos-formais`, que o `.dockerignore` agora exclui. O arquivo não estava no plano. Opções: incluir a correção de uma linha nesta tarefa (recomendada; mantém o módulo igual ao `.dockerignore` e à seção 8.6 da Arquitetura) ou abrir uma issue de documentação. Texto proposto: "deixa fora da imagem os `.env*` de qualquer pasta, `node_modules`, `.next`, `.git`, `.claude`, onde ficam os worktrees do Claude Code, e `documentos-formais` (RS016)". O plano voltou a `aguardando_aprovacao` com o arquivo na lista.
