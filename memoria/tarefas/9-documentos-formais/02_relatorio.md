---
issue: 9
pull_request: 10
---

# Relatório: Documentos formais no repositório, guia de instalação e .docx atualizados

## O que foi feito

Os três documentos formais (.docx) passaram a ser versionados em `documentos-formais/` (decisão 0040), porque a disciplina exige a documentação no projeto; a IA continua lendo os módulos de `docs/` e só abre os .docx a pedido do desenvolvedor. Os .docx foram atualizados para o estado do ICM depois das #1, #2 e #6, o README ganhou os pré-requisitos e os primeiros passos com `npm ci`, e o integrante listado por engano saiu do questionário, dos registros da #2 e da capa dos documentos. O Docker ficou como estava (decisão 0038), confirmado por teste.

## Arquivos alterados

- `documentos-formais/` (três .docx) — criados a partir de `DocumentacaoWord/` e atualizados; sumários refeitos no Word.
- `.gitattributes` — `*.docx binary`.
- `.gitignore` — arquivos de trava do Office (`~$*`).
- `.dockerignore` — `documentos-formais` fora do contexto da imagem.
- `docs/decisoes/0040-documentos-formais-versionados.md` e `docs/decisoes/CONTEXT.md` — decisão nova e índice.
- `AGENTS.md`, `guia/regras.md`, `docs/CONTEXT.md` — a pasta e a regra de leitura dos .docx.
- `docs/plataforma/estrutura-de-pastas.md` — `documentos-formais/` na árvore da raiz.
- `docs/plataforma/infraestrutura.md` — `documentos-formais` na linha do `.dockerignore` (incluído na etapa 02, com aprovação).
- `README.md` — pré-requisitos, primeiros passos e a pasta dos documentos formais.
- `setup/questionario.md` e `memoria/tarefas/2-tarefas-de-ponta-a-ponta/` — sem o integrante listado por engano.

## Testes executados

- `npm run check` (depois do `npm ci`): formatação, tipos, lint e testes sem erros nem avisos.
- `npm audit --omit=dev --audit-level=high`: nenhuma vulnerabilidade.
- `docker compose up --build`: status 200 em `http://localhost:3000`, processo `node`; a imagem não tem `documentos-formais` nem `.env*`.
- Os três .docx abertos no Word por automação, com o sumário atualizado; capa, Quadro 1, seção 8.6, Quadro 38, seções 6.2 e 7.1 conferidas em imagem.
- `git check-attr binary`: os três .docx com `binary: set`; o texto dos .docx sem o nome retirado.
- Manual na pré-visualização: não se aplica; a tarefa não muda a aplicação.

## Documentação atualizada

- Módulos: `AGENTS.md`, `README.md`, `guia/regras.md`, `docs/CONTEXT.md`, `docs/plataforma/estrutura-de-pastas.md`, `docs/plataforma/infraestrutura.md`, `setup/questionario.md`.
- Lacunas resolvidas: L1, nome da pasta → `documentos-formais/` → `AGENTS.md`, `README.md`, `docs/CONTEXT.md`, `guia/regras.md`; L2, quem confere os critérios → na aprovação do plano → Desenvolvimento com IA, seção 7.2.
- Decisões: 0040 criada.
- Documentos formais a atualizar: nenhum; foram atualizados nesta tarefa.
  - Arquitetura de Software: Quadro 1 e parágrafo das versões (ESLint 9); seção 2.4 (Prettier sem os `.md`); seção 3.1 (`.dockerignore`); seção 8.2 (variáveis lidas na execução); seção 8.5 (`next typegen` e job `check`); seção 8.6 (`.dockerignore` completo e passo a passo); Quadro 38 (decisão 0037); capa.
  - Desenvolvimento com IA: seção 3 (árvore com `documentos-formais/`, `.github/` sem CODEOWNERS); 3.1 (sem responsável por área; exceção do `.env.example` no exemplo); 3.2 (Quadro 3 e cinco critérios da tarefa trivial); 3.3 (padrões das camadas); 3.4 (onde ficam os .docx); 3.5 (`areas: [backend]`); 3.6 (questionário e `documentos-formais/`); 4.1 (aprovação de outro integrante); 5 (`.env.example`, Docker, versões da stack, leitura dos .docx); 6.2 (permissões do Docker); 7.1 e Quadro 8 (tarefas de ponta a ponta; títulos novos); 7.2 (etiquetas e critérios conferidos na aprovação do plano); 7.4 (sem CODEOWNERS); 8.2 (conferência no contêiner); 8.3 (critério de pronto); Quadro 10 (GitHub sem CODEOWNERS; onde fica cada documentação); capa.
  - Análise do Sistema: capa.

## Pendências

- Cinco vulnerabilidades altas só de desenvolvimento, na cadeia `eslint-config-next` → `fast-glob` → `micromatch` → `braces`, anteriores a esta tarefa; não bloqueiam o CI (`npm audit --omit=dev`). Decidir se viram uma issue de configuração.
- #3 (molde do plano): o plano está num worktree parado em `a258ed5` e precisa ser refeito sobre a `main` atual.
- #4 (`passWithNoTests`): espera a primeira tarefa com teste.
- Questionário: usuário do GitHub da Laura e aceite do convite do Kayke.
