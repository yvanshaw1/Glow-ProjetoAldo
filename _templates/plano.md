---
issue: <número>
titulo: <título da issue>
areas: [<frontend, backend, banco, testes, cicd: as que a tarefa toca>]
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

<O que a documentação não cobre, ou onde ela se contradiz: um bloco por lacuna, numerados L1, L2..., com a opção recomendada em primeiro. O arquivo de cada item do texto proposto segue a tabela "Onde registrar conhecimento novo" de `docs/CONTEXT.md`. Se a documentação cobre tudo, trocar o parágrafo e os blocos abaixo por "nenhuma".>

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. <título curto>

**Problema.** <O que falta ou o que se contradiz, citando os arquivos e os trechos.>

**Opções:**

- [ ] **1. <nome> (recomendada).** <consequência>
- [ ] **2. <nome>.** <consequência>

**Texto proposto (opção recomendada):**

- `<arquivo>`, <trecho>: "<texto atual>" passa a "<texto novo>".
- `<arquivo novo>`, novo: <o que contém>.

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
