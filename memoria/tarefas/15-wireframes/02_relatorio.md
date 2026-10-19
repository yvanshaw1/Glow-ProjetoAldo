---
issue: 15
pull_request: 16
---

# Relatório: Wireframes de referência das páginas em wireframes/

## O que foi feito

Os 94 PDFs com as telas de outro sistema de estética automotiva entraram em `wireframes/` sem alteração, como referência de esqueleto e componentes das páginas do Glow. O `README.md` da pasta explica de onde vêm as telas e como usá-las. Ele manda aproveitar a estrutura, deixar de fora o que não tem requisito em `docs/` e não copiar as cores, o nome nem a marca da outra empresa. As cores virão das variáveis do tema, que ainda serão definidas. O README também liga cada pasta à página do Glow e aos casos de uso. A pasta foi registrada na árvore, no mapa da IA, no padrão de frontend e na decisão 0041. Nenhum requisito muda; RN001 e RF074 são citados só para explicar telas da referência.

## Arquivos alterados

- `wireframes/` — 94 PDFs e o `README.md` (novo)
- `.gitattributes` — `*.pdf binary`
- `.dockerignore` — `wireframes` fora do contexto da imagem
- `AGENTS.md` — linha `wireframes/` no mapa
- `README.md` — item `wireframes/` na organização do repositório
- `docs/plataforma/estrutura-de-pastas.md` — `wireframes/` na árvore
- `docs/plataforma/infraestrutura.md` — o `.dockerignore` deixa fora também `wireframes`
- `docs/padroes/frontend.md` — consultar o wireframe da página antes de construí-la
- `docs/decisoes/0041-wireframes-de-referencia.md` (novo) e `docs/decisoes/CONTEXT.md`
- `memoria/tarefas/15-wireframes/` — plano, notas e este relatório

## Testes executados

- `npm run check`: sem erros nem avisos (Prettier, `next typegen` e `tsc`, ESLint, Vitest ainda sem arquivos de teste).
- Contêiner: `docker compose up --build -d` com contexto de 105 kB, sem `wireframes/`; página inicial com 200; processo com o uid 1000 (`node`); imagem só com `.next`, `node_modules`, `package.json`, `public` e `server.js`.
- Git: 95 arquivos em `wireframes/`; `git check-attr binary` dá `set` nos PDFs; hashes dos 94 PDFs iguais aos originais.
- Manual na pré-visualização: não se aplica, porque nenhuma página mudou.

## Documentação atualizada

- Módulos: `docs/plataforma/estrutura-de-pastas.md`, `docs/plataforma/infraestrutura.md`, `docs/padroes/frontend.md`, `docs/decisoes/CONTEXT.md`, além de `AGENTS.md`, `README.md` e `wireframes/README.md`.
- Lacunas resolvidas: L1 → opção 1, manter os nomes dos PDFs → nenhum texto além do README. Confirmada na conversa, porque a caixa não estava marcada no arquivo (`notas.md`).
- Decisões: 0041 criada.
- Documentos formais a atualizar:
  - Arquitetura de Software, seção 3.1 (árvore de pastas): linha `wireframes/`.
  - Arquitetura de Software, seção 8.6: o `.dockerignore` exclui também `wireframes`.
  - Arquitetura de Software, Quadro 38 (decisões): linha da 0041.
  - Desenvolvimento com IA, seção 3 (árvore): linha `wireframes/`; na seção 3.1, se o exemplo do `AGENTS.md` reproduzir o mapa, a linha nova.

## Pendências

- Definir as cores do Glow nas variáveis do tema (`@theme` em `src/app/globals.css`), que o README cita como pendentes. Ainda não há issue: a equipe abre quando escolher a paleta.
