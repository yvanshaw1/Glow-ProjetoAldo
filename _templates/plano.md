---
issue: <número>
titulo: <título da issue>
area: <frontend | backend | banco | testes | cicd>
tipo: <funcionalidade | defeito | investigacao | documentacao | configuracao>
requisitos: [<RF, RN, RS, UC citados>]
status: aguardando_aprovacao
aprovado_por:
aprovado_em:
---

# Plano: <título>

## Objetivo

<O que a tarefa entrega, em duas ou três frases, citando os identificadores.>

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado ..., quando ..., então ... (RNxxx) | teste `tests/...` ou passo manual na pré-visualização |

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/...` | criar / alterar |

## Testes previstos

- <nome do teste em inglês> — valor esperado tirado de <RN ou formato>

## Lacunas na documentação

<O que a documentação não cobre, ou onde ela se contradiz. Escrever "nenhuma" se a documentação cobre tudo. A aprovação do plano decide cada lacuna; marcar a opção escolhida.>

| Lacuna | Opções (recomendada primeiro) | Texto proposto | Onde documentar |
|---|---|---|---|
| <o que falta> | 1. ... (recomendada) 2. ... | <redação para o módulo> | `docs/<assunto>/<arquivo>.md` |

## Decisões técnicas

<Escolhas técnicas da tarefa conferidas contra docs/decisoes/ (workflows/procedimentos/decisao.md). Escrever "nenhuma nova" se todas já estiverem decididas.>

- Seguidas: <números das decisões existentes que a tarefa aplica>

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| <o que se decide> | <o que não se adota> | <por quê, com as consequências> | nova / substitui NNNN |

## Riscos e dúvidas

- <risco ou dúvida; dúvida sem resposta bloqueia a aprovação>

## Fora do escopo

- <o que esta tarefa não faz>
