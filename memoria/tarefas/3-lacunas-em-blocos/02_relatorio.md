---
issue: 3
pull_request: 11
---

# Relatório: Molde do plano: lacunas em blocos com caixas de seleção

## O que foi feito

A seção "Lacunas na documentação" de `_templates/plano.md` trocou a tabela de quatro colunas (Lacuna | Opções | Texto proposto | Onde documentar), ilegível com texto longo nas células, por um bloco por lacuna: título `### L1.`, **Problema.**, **Opções:** em caixas `- [ ]` (a recomendada primeiro, com a consequência de cada uma) e **Texto proposto (opção recomendada):** com arquivo e trecho. A frase de abertura pede "Marque com `x` a opção escolhida."; sem lacunas, a seção continua dizendo só "nenhuma". É o formato dos planos da #1 e da #6. Nenhum requisito envolvido; segue a decisão 0031.

Desvio do plano, registrado em `notas.md`: o plano foi refeito sobre a `main` atual (`2f5beee`), porque o primeiro ficou num worktree parado em `a258ed5`; o texto do molde é o mesmo.

## Arquivos alterados

- `_templates/plano.md`: só a seção "Lacunas na documentação".
- `memoria/tarefas/3-lacunas-em-blocos/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: aprovado (Prettier, tipos, ESLint sem avisos; o Vitest sai com código 0 sem arquivos de teste). O Prettier ignora os `.md`, então o molde não passa por ele.
- Critério 1: o trecho do molde, extraído por script, é idêntico ao bloco "Texto novo do molde" do plano.
- Critério 2: a instrução entre `< >` manda trocar o parágrafo e os blocos por "nenhuma" quando a documentação cobre tudo.
- Critério 3: `git grep -nF "| Lacuna |" -- _templates guia workflows` sem resultado.
- Critério 4: `guia/como-pedir.md`, `workflows/01_planejar.md` e `guia/regras.md` não citam a tabela e descrevem o conteúdo de cada lacuna, que o formato novo mantém.
- Nenhum teste automatizado: a tarefa não cria regra de negócio nem esquema (decisões 0024 e 0035).

## Documentação atualizada

- Módulos: nenhum; só o molde `_templates/plano.md`.
- Lacunas resolvidas: nenhuma.
- Decisões: nenhuma.
- Documentos formais a atualizar: Desenvolvimento com IA, seção 3.5 (molde do plano): se ela reproduzir a tabela de lacunas, passa ao formato de blocos com caixas de seleção. O agente não abriu o `.docx`, que não está nesta ramificação (chega com o PR #10).

## Pendências

- Worktree `.claude/worktrees/3-lacunas-em-blocos-antigo` (antes `optimistic-bartik-2fb396`), com o plano antigo sem commit: o desenvolvedor decide quando removê-lo.
- Fora do escopo, sem issue: a tabela da seção "Decisões técnicas" do molde, com o mesmo problema de leitura; o aviso do `npm ci` sobre o ESLint 9 sem suporte (decisão 0037).
