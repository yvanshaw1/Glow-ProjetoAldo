---
id: 0039
titulo: Tarefas de ponta a ponta, sem dono por área
status: aceita
data: 2026-10-15
origem: issue #2, plano memoria/tarefas/2-tarefas-de-ponta-a-ponta/01_plano.md
relacionados: [RNF014, 0031, 0034]
---

# 0039 – Tarefas de ponta a ponta, sem dono por área

## Decisão

Não há responsável fixo por área. Cada integrante leva uma tarefa de ponta a ponta, por todas as áreas que ela toca (interface, API, banco, testes e fluxo Git), e conduz o agente nas quatro etapas. O pull request é aprovado por qualquer outro integrante, nunca pelo autor, como exige a proteção da `main` (uma aprovação). O repositório não tem `.github/CODEOWNERS`. As etiquetas `area:*` indicam as áreas que a tarefa toca, várias por issue, e o plano as lista no campo `areas`. As migrations continuam aplicadas por um único integrante, designado em `setup/questionario.md`.

## Alternativa descartada

Um responsável por área (Frontend, Backend e API, Banco de dados, Testes e QA, CI/CD e fluxo Git), que planejaria as tarefas da área, manteria o padrão dela em `docs/padroes/` e revisaria os pull requests que a alteram, com o CODEOWNERS indicando o revisor de cada pasta.

## Justificativa

As funcionalidades do sistema atravessam todas as áreas: a edição de um agendamento, por exemplo, muda tela, rota, serviço, regra e teste. Com dono por área, uma tarefa dependeria de várias pessoas e esperaria a revisão de cada uma; de ponta a ponta, quem planeja entrega a funcionalidade inteira, e a revisão por qualquer outro integrante distribui a carga entre os seis. Consequências aceitas: nenhum padrão tem guardião, então mudanças em `docs/padroes/` passam pelo plano e pela revisão como qualquer outra; o revisor pode não dominar todas as áreas que revisa, e por isso o plano aprovado, os critérios de aceitação e o checklist do pull request são a referência da revisão. A aplicação das migrations fica com uma só pessoa porque todos os ambientes usam o mesmo projeto do Supabase, e uma migration aplicada vale na hora para a produção (`workflows/procedimentos/migration.md`).
