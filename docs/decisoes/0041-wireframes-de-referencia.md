---
id: 0041
titulo: Wireframes de referência versionados em wireframes/
status: aceita
data: 2026-10-18
origem: issue #15, plano memoria/tarefas/15-wireframes/01_plano.md
relacionados: [0031, 0038, 0040]
---

# 0041 – Wireframes de referência versionados em wireframes/

## Decisão

Os wireframes de referência das páginas ficam versionados em `wireframes/`, em PDF, como o desenvolvedor os montou. São telas de outro sistema de estética automotiva, com as mesmas funcionalidades do Glow e algumas a mais, e servem só para o esqueleto e os componentes das páginas. O que cada página tem vem de `docs/`, e as cores vêm das variáveis do tema. O `README.md` da pasta explica o uso e liga cada pasta à página e aos casos de uso. Para o Git, os PDFs são binários (`.gitattributes`), e a pasta fica fora do contexto da imagem do contêiner (`.dockerignore`).

## Alternativa descartada

Guardar os wireframes fora do repositório, com um link, onde a IA não os alcança. Guardá-los em `docs/`, que reúne módulos de texto curtos lidos pela IA. Redesenhá-los antes com as cores do Glow, que ainda não estão definidas.

## Justificativa

A equipe e a IA precisam da referência junto do código, na hora de construir cada página. Consequências aceitas: cerca de 33 MB a mais no histórico do Git, que ficam mesmo se a pasta for apagada; os PDFs são imagens, então a IA abre só os da página em construção; os nomes dos arquivos ficam como vieram, em `camelCase` e fora do padrão `kebab-case` do código (lacuna L1 do plano).
