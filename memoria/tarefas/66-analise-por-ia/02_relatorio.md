---
issue: 66
pull_request: 68
---

# Relatório: Análise do período no dashboard, gerada por IA

Relatório parcial: PR 1 de 2, só de documentação (`Refs #66`). O PR 2, de código (`Closes #66`), vem depois da #51 e da #60 e completa este relatório.

## O que foi feito

- **Requisitos novos**, com os textos aprovados no plano:
  - RF089 e RF090 (análise sob demanda, identificada como gerada por IA);
  - RN038 (só valores agregados, com o período anterior de mesma duração) e RN039 (sem algarismos, resumo e até quatro observações, resposta conferida);
  - UC27 (Gerar análise do dashboard), com o FA01 no UC09;
  - RNF017 (a falha de um serviço externo complementar não derruba a tela) e RNF018 (até 20 segundos);
  - RS019 (chamada só pelo servidor, com a credencial no ambiente) e RS020 (dados mínimos e resposta não confiável).
- **Contrato da rota** `POST /api/admin/dashboard/analysis` em `rotas.md`, com os erros novos 409 `INSUFFICIENT_DATA` e 503 `AI_UNAVAILABLE` em `api.md`. A especificação OpenAPI fica para o PR 2, com a rota.
- **Regras puras da análise** descritas em `calculos.md`, seção 6: período anterior, variação, entrada do modelo e conferência da resposta.
- **Serviço de IA:** módulo novo `servico-de-ia.md`, com o provedor (Groq, `openai/gpt-oss-120b`), as variáveis `AI_BASE_URL`, `AI_MODEL` e `AI_API_KEY`, os limites conferidos em 21/10/2026, as falhas, o registro, a troca de provedor e o uso futuro.
- **Evolução prevista** em `visao-geral.md`, a pedido do Yvan: a gestão financeira fora do escopo do MVP e a intenção de levar a IA ao estoque e ao financeiro, com as mesmas regras.
- **Decisão 0054**, gravada.
- **ICM:** `AGENTS.md`, `guia/` e os procedimentos de testes, de PR e de publicação.
- **Memória da tarefa:** plano, notas, a proposta das telas de demonstração e da nova ordem das issues (aplicada no GitHub: #56 a #67 criadas, #39 a #51 editadas) e este relatório.

## Arquivos alterados

- `docs/agendamento/`: `RN038-dados-da-analise-do-dashboard.md`, `RN039-conteudo-da-analise-do-dashboard.md` e `UC27-gerar-analise-do-dashboard.md` criados; `requisitos.md`, `UC09-visualizar-dashboard.md`, `RN021-indicadores-do-dashboard.md`, `CONTEXT.md`, `rotas.md` e `calculos.md` alterados.
- `docs/plataforma/`: `servico-de-ia.md` criado; `requisitos.md`, `seguranca.md`, `CONTEXT.md`, `visao-geral.md`, `infraestrutura.md` e `estrutura-de-pastas.md` alterados.
- `docs/padroes/`: `api.md`, `backend.md`, `testes.md` e `design-midia.md` alterados.
- `docs/CONTEXT.md`: a linha do serviço externo em "Onde registrar conhecimento novo".
- `docs/decisoes/0054-analise-por-ia-no-groq.md` criado; `docs/decisoes/CONTEXT.md` alterado.
- `AGENTS.md`, `guia/mapa.md`, `guia/regras.md`, `guia/CONTEXT.md` alterados.
- `workflows/procedimentos/testes.md`, `pull-request.md` e `deploy.md` alterados.
- `memoria/tarefas/66-analise-por-ia/`: `01_plano.md`, `notas.md`, `proposta-das-issues.md` e `02_relatorio.md` criados.

## Testes executados

- `npm run check`: aprovado, com 18 arquivos e 371 testes, sem erros nem avisos; nenhum código mudou.
- Links relativos de todos os arquivos alterados apontam para arquivos que existem; cada identificador novo (RF089, RF090, RNF017, RNF018, RS019, RS020) está definido uma vez.
- Pré-visualização: sem tela nova neste PR; o build da Vercel confere que a aplicação continua compilando.

## Documentação atualizada

- Módulos: os da seção "Arquivos alterados"; a OpenAPI muda no PR 2.
- Lacunas resolvidas, todas com a opção 1:
  - L1 (funcionalidade) → análise do período no dashboard → UC27, RF089, RF090;
  - L2 (comparação) → período anterior de mesma duração → RN038, `calculos.md`;
  - L3 (números) → texto sem algarismos, conferido → RN039, `calculos.md`;
  - L4 (erros) → `INSUFFICIENT_DATA` e `AI_UNAVAILABLE` → `api.md`, `servico-de-ia.md`;
  - L5 (tempo) → RNF018, chamada cortada em 15 segundos → `requisitos.md`, `servico-de-ia.md`;
  - L6 (guardar) → nada é gravado → UC27, RS020, `servico-de-ia.md`;
  - L7 (limite de uso) → sem limite próprio → `servico-de-ia.md`;
  - L8 (onde descrever) → `servico-de-ia.md`, com a linha em `docs/CONTEXT.md`.
- Decisões: 0054 criada.
- Documentos formais a atualizar, na #67, depois do #55, pela lista por seção do plano (itens 1 a 23):
  - Análise do Sistema: produto, atores, fora do escopo e "Evolução prevista" (seções 1 a 5); RF089 e RF090 (6.2); RNF017 e RNF018 (Quadro 18); RS019 e RS020 (Quadro 19); RN038 e RN039 (Quadro 20); UC27 (10.1 e quadro novo na 10.2) e o FA01 do UC09 (Quadro 34);
  - Arquitetura de Software: a IA na stack (Quadro 1); `/admin` (Quadro 4); `src/server/ai/` e as regras da análise (4.1, 4.2); os dois códigos e os níveis de registro (Quadros 33 e 34); RS019 e RS020 (Quadro 35 e Complementos); quatro serviços e as variáveis `AI_*` (8, Quadro 37); a 0054 (Quadro 38); a rota no Apêndice A;
  - Desenvolvimento com IA: a regra da IA do produto e a intenção de uso futuro (5.3); o item do checklist de segurança do PR; a linha "Análise do dashboard" (Quadro 9); a verificação com o provedor simulado (8.2).

## Pendências

- PR 2 da #66, depois da #51 e da #60: regras com TDD, adaptador, serviço, rota, códigos do catálogo, tipos, o cartão ligado à rota e a especificação OpenAPI. O plano fica em `em_execucao` até lá.
- Pelo Yvan, antes da pré-visualização do PR 2: a conta do Groq, as três variáveis na Vercel (Production e Preview) e os três nomes no `.env.example`.
- Os `.docx`: #67.
- `docs/plataforma/seguranca.md` tem 10,8 mil caracteres, acima do guia de cerca de 2 mil tokens; os RS só podem ficar nele.
