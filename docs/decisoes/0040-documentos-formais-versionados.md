---
id: 0040
titulo: Documentos formais versionados em documentos-formais/
status: aceita
data: 2026-10-18
origem: issue #9, plano memoria/tarefas/9-documentos-formais/01_plano.md
relacionados: [0031, 0038]
---

# 0040 – Documentos formais versionados em documentos-formais/

## Decisão

Os três documentos formais em Word (Análise do Sistema, Arquitetura de Software e Desenvolvimento com IA) ficam versionados em `documentos-formais/`. A IA continua lendo os módulos de `docs/`, que os reproduzem por assunto, e só abre os `.docx` quando o desenvolvedor pede para lê-los ou alterá-los. Para o Git, os `.docx` são binários (`.gitattributes`); os arquivos de trava do Office ficam fora do versionamento (`.gitignore`), e a pasta fica fora da imagem do contêiner (`.dockerignore`).

## Alternativa descartada

Manter os `.docx` fora do repositório, como previa a estrutura inicial; ou a IA ler os `.docx` em vez dos módulos.

## Justificativa

A disciplina exige a documentação dentro do projeto. Os módulos de `docs/` continuam sendo a fonte da IA, por economia de contexto (decisão 0031). Consequências aceitas: o diff de um `.docx` é binário e não aparece na revisão, então o pull request descreve por seção o que mudou nele; cada versão acrescenta cerca de 1 MB ao histórico.
