---
id: 0054
titulo: Análise do dashboard por um modelo de linguagem do Groq em plano gratuito, chamado pelo servidor no formato Chat Completions
status: aceita
data: 2026-10-21
origem: issue #66, plano memoria/tarefas/66-analise-por-ia/01_plano.md (D1 e Decisões técnicas)
relacionados: [RF089, RF090, RN038, RN039, UC27, RNF017, RNF018, RS019, RS020, 0029, 0030]
---

# 0054 – Análise do dashboard por um modelo de linguagem do Groq em plano gratuito, chamado pelo servidor no formato Chat Completions

## Decisão

A análise do período no dashboard usa um modelo de linguagem do Groq em plano gratuito, o `openai/gpt-oss-120b`. Ele é chamado só pelo servidor, no formato Chat Completions, com `fetch` e a saída pedida por esquema JSON, sem SDK. O endereço, o modelo e a chave vêm das variáveis `AI_BASE_URL`, `AI_MODEL` e `AI_API_KEY`, e o adaptador fica em `src/server/ai/`. Detalhes em `docs/plataforma/servico-de-ia.md`.

## Alternativa descartada

- Gemini API no plano gratuito: os limites não são publicados nem garantidos, e o Google usa as entradas e as saídas do plano gratuito para melhorar os produtos, com revisão humana.
- Cloudflare Workers AI: cerca de 90 análises por dia com o mesmo modelo, conta e identificador da conta à parte, esquema JSON não confirmado no formato compatível, e a stack não usa a Cloudflare.
- OpenRouter com modelos `:free` (50 chamadas por dia sem compra de créditos, modelos e políticas de dados variáveis), AI Gateway da Vercel (limites do plano gratuito não publicados) e Hugging Face (sem crédito gratuito para contas gratuitas).
- Modelos no navegador: só Chrome de computador, sem português no resumidor do Chrome, ou download de centenas de megabytes, contra RNF001, RNF006 e RNF009.
- SDK de IA, como o `ai` da Vercel: uma dependência nova para uma chamada só.

## Justificativa

Sem custo e sem dependência nova. Os limites publicados do plano gratuito (1.000 requisições e 200 mil tokens por dia) passam do que a demonstração precisa; os dados das requisições não são retidos por padrão nem usados para treino; a saída estruturada estrita garante o formato que RN039 confere. Como outros provedores falam o mesmo formato, a troca é feita pelas variáveis, sem mudar o código. O mesmo adaptador e as mesmas regras servem às análises previstas para o estoque e o financeiro, fora do MVP. Complementa a 0030 com um serviço a mais em plano gratuito. Consequências aceitas: um serviço externo sem garantia de gratuidade, com os dados agregados processados nos Estados Unidos, e a análise indisponível quando ele falha (RNF017).
