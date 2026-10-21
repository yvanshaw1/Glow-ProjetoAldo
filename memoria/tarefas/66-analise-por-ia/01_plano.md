---
issue: 66
titulo: "Análise do período no dashboard, gerada por IA"
areas: [frontend, backend, testes]
tipo: funcionalidade
requisitos: [UC27, UC09, RF089, RF090, RF040, RF041, RF042, RN038, RN039, RN021, RN035, RNF017, RNF018, RNF007, RS008, RS013, RS014, RS016, RS017, RS018, RS019, RS020]
status: em_execucao
aprovado_por: yvan
aprovado_em: 21/10/2026 - 09:22
---

# Plano: Análise do período no dashboard, gerada por IA

## Objetivo

Dar ao painel uma primeira funcionalidade de IA: em `/admin`, o funcionário com a permissão `dashboard` pede uma análise em texto dos indicadores do período exibido (UC27, novo), com a comparação com o período anterior. O texto é escrito por um modelo de linguagem em plano gratuito, que recebe só valores agregados calculados pelo sistema (RN038, nova) e nunca dados pessoais. A resposta é validada antes de aparecer (RN039, nova), identificada como gerada por IA (RF089 e RF090, novos), e a falha da IA não derruba o dashboard (RNF017, nova).

Entregas:

- `POST /api/admin/dashboard/analysis`, com `requirePermission("dashboard")` (RS008, RS019);
- funções puras da análise em `src/server/rules/dashboard-analysis.ts`, com TDD (decisões 0035 e 0052): período anterior, entrada só com agregados, mensagens ao modelo e conferência da resposta;
- adaptador `server-only` em `src/server/ai/`, com `fetch` no formato Chat Completions, sem SDK, e o endereço, o modelo e a chave lidos do ambiente (decisão 0054, nova);
- o cartão "Análise do período" do dashboard, que a issue de telas #60 (`proposta-das-issues.md`) constrói com dados de demonstração, ligado à rota;
- os requisitos novos, a decisão e os módulos de `docs/` e da ICM.

Não há migration: nada é gravado.

## Issue e pasta

Issue #66, criada em 21/10/2026 com o texto de `proposta-das-issues.md` (seção "Issue IA"), depois do OK do Yvan; a pasta, provisória como `sem-issue-analise-por-ia/`, passou a `66-analise-por-ia/`. A mesma pasta guarda a proposta das telas sem lógica e da nova ordem das issues (`proposta-das-issues.md`), aprovada e aplicada no GitHub: as telas são a #56 (#56, base da demonstração) à #65, e a DOC é a #67.

## Base

- Worktree `37-dados-da-empresa-1b1de5`, ramificação `claude/plano-ia-no-sistema-11479b`, em a037b4c, igual à `origin/main` (conferido com `git fetch`). Plano, notas e proposta sem commit, como nas etapas 01 anteriores.
- PR aberto: o #55 (#38, documentos formais), que só altera `documentos-formais/` e `memoria/`. Nenhuma outra tarefa altera os `.docx` até ele ser incorporado (decisão 0040).
- Próximos números livres, conferidos em `docs/` e na ramificação do #55: RF089, RN038, UC27, RNF017, RS019 e a decisão 0054.

## Funcionalidades de IA analisadas

O sistema tem dois tipos de dado: agregados do negócio (receita, quantidades, taxas) e dados pessoais (clientes, veículos, placas, funcionários). Os termos gratuitos do Gemini proíbem dados pessoais ("Do not submit sensitive, confidential, or personal information to the Unpaid Services"), e qualquer provedor externo é um terceiro. Por isso, a primeira funcionalidade deve funcionar só com agregados ou com dados públicos. A escolha está na L1; a recomendada é a análise do dashboard, a ideia do Yvan e do rascunho do Codex.

- **Análise do período no dashboard** (recomendada): só agregados, sob demanda, só leitura, demonstrável e próxima dos "relatórios inteligentes" de um ERP.
- **Descrição sugerida do serviço** no cadastro (UC13): dados públicos do catálogo; o texto vai ao portal, então exige revisão humana antes de gravar.
- **Busca de agendamentos em linguagem natural** (UC10): o texto digitado pode trazer nomes de clientes, que iriam ao provedor.
- **Resumo da agenda do dia** (RF043): a agenda tem cliente, veículo e placa; seria preciso anonimizar.
- **Classificação** (por exemplo, dos cancelamentos): o sistema não guarda motivo de cancelamento nem avaliação, então não há o que classificar.
- **Chat livre com o sistema**: fora, pelo risco de injeção de instruções e de dado pessoal no texto.

## Provedores comparados

Conferidos na web em 21/10/2026; os limites dos planos gratuitos mudam sem aviso. Fontes no fim de `notas.md`.

- **Groq** (recomendado, D1): plano Free sem cartão; modelos de produção `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `llama-3.3-70b-versatile` e `llama-3.1-8b-instant`. Para o `gpt-oss-120b`, a página de limites traz 30 requisições por minuto, 1.000 por dia, 8 mil tokens por minuto e 200 mil por dia, com 429 e `retry-after` acima disso. Não retém os dados das requisições por padrão (só registros de abuso por até 30 dias), oferece retenção zero e, pelo contrato, não treina com as entradas e saídas. Saída estruturada estrita (esquema JSON) no `gpt-oss`. Formato Chat Completions em `https://api.groq.com/openai/v1`. Dados processados nos Estados Unidos.
- **Google Gemini API**: plano gratuito sem cartão para os modelos Flash e Flash-Lite (`gemini-2.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, `gemini-2.5-flash`, `gemini-3.6-flash` e outros); o Brasil está entre as regiões. Os limites não são mais publicados (só no AI Studio de cada projeto) e "não são garantidos". No gratuito, o Google usa as entradas e saídas para melhorar os produtos, com revisão humana, e os termos proíbem dados pessoais. Melhor qualidade em português; formato Chat Completions e saída estruturada.
- **Cloudflare Workers AI** (o do rascunho): 10 mil neurônios por dia no plano Free, zerados às 00:00 UTC, com erro acima disso. Com o `@cf/openai/gpt-oss-120b` (31.818 neurônios por milhão de tokens de entrada e 68.182 de saída), uma análise de um mês custa cerca de 100 neurônios, umas 90 por dia. Não usa o conteúdo para treinar. Precisa de conta e do identificador da conta no endereço; a página do formato compatível não confirma o esquema JSON. `docs/plataforma/visao-geral.md` diz hoje "Sem domínio próprio, Cloudflare, ...".
- **OpenRouter, modelos `:free`**: 20 por minuto e 50 por dia sem compra de créditos (1.000 com 10 créditos comprados). Os modelos gratuitos mudam com frequência, e a política de dados depende de quem atende cada um.
- **AI Gateway da Vercel**: plano gratuito com crédito mensal incluído, só alguns modelos e limites por modelo menores, não publicados; retenção zero só nos planos pagos. Não exige conta nova, mas os números não são verificáveis.
- **Hugging Face Inference Providers**: contas gratuitas não têm mais crédito mensal (o PRO tem US$ 2); só com compra.
- **GitHub Models**: encerrado em 30/07/2026.
- **No navegador**: as APIs de IA do Chrome (Summarizer estável no Chrome 138, Prompt API na web no 148) exigem Chrome de computador, 22 GB livres e GPU com mais de 4 GB, não funcionam no celular e o Summarizer não escreve em português; o WebLLM baixa uns 700 MB por um modelo de 1 bilhão de parâmetros e depende de WebGPU. Contrariam RNF001, RNF006 e RNF009.

## Pré-requisitos e dependências

- **#51 (dashboard):** a análise usa os indicadores calculados pelo serviço `dashboard`, que ainda não existe (`src/app/(admin)/admin/page.tsx` só tem o título). O PR de código desta tarefa depende da #51. Ela precisa deixar o cálculo dos indicadores de um período numa função do serviço que a análise chame duas vezes (período e anterior), e decidir antes as lacunas de `calculos.md` (onde agregar e a data da taxa de cancelamento). A proposta tira da #51 a dependência da #50: o `supabase/seed-demo.sql` já tem agendamentos concluídos, cancelados e reagendados (`proposta-das-issues.md`).
- **#60 (tela do dashboard com dados de demonstração):** constrói o cartão da análise; este plano o liga à rota.
- **#56 (base das telas de demonstração):** a entrada da rota da análise na lista de demonstração sai no PR de código desta tarefa.
- **PR de documentação desta tarefa:** não depende de nada e pode ser o primeiro; a #60 o usa como fonte dos textos do cartão.

## Requisitos novos

Textos propostos; números conferidos como os próximos livres. Prioridade proposta "Desejável", por ser um complemento do dashboard; troque se quiser.

**`docs/agendamento/requisitos.md`, seção Dashboard:**

| ID | Requisito | Prioridade |
|---|---|---|
| RF089 | O sistema deve gerar, quando o funcionário solicitar, uma análise em texto dos indicadores do período exibido no dashboard, produzida por um serviço de inteligência artificial (RN038, RN039). | Desejável |
| RF090 | O sistema deve exibir a análise identificada como gerada por inteligência artificial, com a data e o horário da geração, junto aos indicadores do período, sem substituí-los. | Desejável |

**`docs/agendamento/RN038-dados-da-analise-do-dashboard.md`** (tema Indicadores): "A análise do dashboard usa somente valores agregados calculados pelo sistema: os indicadores do período (RN021); os do período anterior, de mesma quantidade de dias e terminado no dia anterior à data inicial; a variação de cada indicador; a receita por dia; e a quantidade de agendamentos por status. Nenhum dado que identifique clientes, veículos ou funcionários, como nome, e-mail, telefone, placa ou identificador, e nada da agenda do dia é enviado ao serviço de inteligência artificial. Sem agendamentos no período, a análise não é gerada; sem agendamentos no período anterior, ela é gerada sem a comparação."

**`docs/agendamento/RN039-conteudo-da-analise-do-dashboard.md`** (tema Indicadores): "A análise só interpreta os valores recebidos: não calcula nem apresenta números, que são sempre os exibidos pelo sistema nos indicadores, e nenhuma ação é executada a partir dela. Ela tem um resumo de até 600 caracteres e até quatro observações de até 240 caracteres, cada uma ligada a um indicador, em português do Brasil e sem algarismos (L3). A resposta fora desse formato é descartada, e a análise é tratada como não gerada."

**`docs/agendamento/UC27-gerar-analise-do-dashboard.md`** (ator principal Funcionário; ator secundário Serviço de inteligência artificial; requisitos RF089 e RF090; regras RN038, RN039 e RN035):

- Pré-condições: o funcionário está autenticado no painel, o cargo dele permite o dashboard, e o dashboard exibe os indicadores de um período (UC09).
- Pós-condições: a análise do período é exibida, identificada como gerada por inteligência artificial; nada é gravado.
- Fluxo principal:
  1. O funcionário solicita a análise do período exibido.
  2. O sistema reúne os valores agregados do período e do período anterior (RN038).
  3. O sistema envia os valores ao serviço de inteligência artificial e indica que a análise está em andamento.
  4. O serviço de inteligência artificial devolve o texto da análise.
  5. O sistema confere a resposta (RN039) e exibe a análise junto aos indicadores, identificada como gerada por inteligência artificial, com a data e o horário da geração.
- FA01 – Nova análise (passo 5): o funcionário solicita outra; o sistema a gera e substitui a exibida.
- FA02 – Troca do período (passo 5): o funcionário escolhe outro período no dashboard; a análise exibida deixa de aparecer.
- FA03 – Período anterior sem agendamentos (passo 2): o sistema gera a análise sem a comparação e informa que o período anterior não tem dados.
- FE01 – Período sem agendamentos (passo 1): a solicitação fica indisponível, e o sistema informa que não há dados suficientes para a análise.
- FE02 – Falha do serviço de inteligência artificial (passos 3 a 5): sem resposta no tempo limite (RNF018), com o limite de uso atingido, indisponível ou com resposta fora do formato (RN039), o sistema informa que a análise não pôde ser gerada e permite nova tentativa; os indicadores continuam exibidos (RNF017).
- FE03 – Período inválido: como no UC09 FE02 (RN035).

**`docs/agendamento/UC09-visualizar-dashboard.md`:** "Fluxos alternativos: Não há." passa a "FA01 – Análise do período (passo 3): o funcionário solicita a análise dos indicadores, gerada por inteligência artificial (UC27)."; UC27 e RF089 nos relacionados.

**`docs/plataforma/requisitos.md`:**

| ID | Categoria | Descrição | Prioridade |
|---|---|---|---|
| RNF017 | Confiabilidade | A falha ou a indisponibilidade de um serviço externo complementar, como o de inteligência artificial, não deve impedir o uso das demais informações e funções da tela. | Importante |
| RNF018 | Desempenho | A geração da análise por inteligência artificial deve ser concluída ou interrompida em até 20 segundos, com indicação de andamento durante a espera; o limite de RNF007 não se aplica a ela (L5). | Desejável |

**`docs/plataforma/seguranca.md`:**

| ID | Categoria | Requisito | Implementação |
|---|---|---|---|
| RS019 | Integrações | A comunicação com serviços externos de inteligência artificial deve partir somente do servidor, depois da verificação da sessão e da permissão, com a credencial fornecida pela configuração do ambiente e nunca exposta ao navegador nem registrada. | A rota `POST /api/admin/dashboard/analysis` chama `requirePermission("dashboard")`. O adaptador de `src/server/ai/` (`import "server-only"`) lê `AI_BASE_URL`, `AI_MODEL` e `AI_API_KEY` durante a requisição e envia a chave só no cabeçalho de autorização, por HTTPS; sem as variáveis, a rota responde 503 `AI_UNAVAILABLE`. A chave não aparece no código do navegador nem no registro. |
| RS020 | Integrações | Os dados enviados a serviços externos de inteligência artificial devem se limitar aos necessários, sem dados pessoais, e a resposta desses serviços deve ser tratada como não confiável, validada quanto ao formato e ao tamanho antes de ser exibida. | A entrada é montada por uma função pura que só recebe valores agregados (RN038), sem texto digitado pelo usuário. A resposta é pedida em esquema JSON e conferida por `src/server/rules/dashboard-analysis.ts` (RN039); o texto aparece como texto, nunca como HTML (RS014). Entradas e respostas não são gravadas nem registradas. |

## Como funciona

### Contrato da API

`POST /api/admin/dashboard/analysis` (`docs/agendamento/rotas.md`, rotas do painel: dashboard). É `POST` porque é uma ação com custo, que nunca é repetida automaticamente (`api.md`); nada é gravado.

- **Entrada:** `from*` e `to*`, datas de calendário (`aaaa-mm-dd`), as mesmas do dashboard exibido, com os limites de RN035 (início até o fim, até 12 meses). O esquema `dashboardAnalysisSchema`, em `src/shared/validation/dashboard.ts`, reutiliza o do período da #51, com as duas datas obrigatórias. Campos não previstos são descartados (RS013).
- **Resposta 200** (`DashboardAnalysis`, em `src/shared/api/dashboard.ts`): `from`, `to`, `previousFrom`, `previousTo`, `hasComparison`, `summary`, `highlights` (de zero a quatro, cada um com `indicator` e `comment`) e `generatedAt` (ISO 8601).
- **Indicadores** das observações, em `src/shared/constants/dashboard-indicators.ts`, com os rótulos: `revenue` (Receita), `appointmentCount` (Agendamentos), `averageTicket` (Ticket médio), `cancellationRate` (Taxa de cancelamento), `revenueByDay` (Receita por dia) e `appointmentsByStatus` (Agendamentos por status).
- **Erros** (L4): 400 `VALIDATION_ERROR` (período); 401 `UNAUTHENTICATED`; 403 `FORBIDDEN`, `ACCOUNT_INACTIVE` e `PASSWORD_CHANGE_REQUIRED`; 409 `INSUFFICIENT_DATA` (período sem agendamentos, sem chamar a IA); 413; 415; 503 `AI_UNAVAILABLE` (sem configuração, tempo esgotado, 429 ou falha do provedor, resposta inválida); 500.

### Entrada do modelo (RN038)

Montada por `buildAnalysisInput` a partir do resultado do serviço do dashboard, com os nomes de campo que a #51 definir. O tipo da entrada não tem campo de texto livre. Exemplo de um mês:

```json
{
  "period": { "from": "2026-10-01", "to": "2026-10-31", "days": 31 },
  "previousPeriod": { "from": "2026-08-31", "to": "2026-09-30", "hasAppointments": true },
  "indicators": {
    "revenue": { "current": 12500.0, "previous": 10000.0, "variationPercent": 25.0 },
    "appointmentCount": { "current": 50, "previous": 40, "variationPercent": 25.0 },
    "averageTicket": { "current": 250.0, "previous": 250.0, "variationPercent": 0.0 },
    "cancellationRate": { "current": 15.0, "previous": 10.0, "variationPoints": 5.0 }
  },
  "revenueByDay": [{ "date": "2026-10-01", "revenue": 450.0 }],
  "appointmentsByStatus": { "Agendado": 4, "Concluído": 30, "Cancelado": 8 }
}
```

- Período anterior (L2): mesma quantidade de dias, terminando no dia anterior a `from`. 01/10/2026 a 31/10/2026 → 31/08/2026 a 30/09/2026.
- Variação: percentual sobre o valor anterior, com uma casa; na taxa de cancelamento, diferença em pontos percentuais. Valor anterior zero: sem variação (`null`).
- Os status vão com os rótulos de RN017, para o texto usar os nomes da tela.
- Tamanho estimado: 1,5 mil tokens num mês e 5,5 mil em 12 meses, com as instruções e a resposta.

### Mensagens e resposta

- `buildAnalysisMessages(input)`: uma mensagem de sistema fixa, em português, versionada no código, e uma mensagem com a entrada em JSON. A de sistema diz: analisar indicadores de uma empresa de estética automotiva para a própria equipe; usar só os valores recebidos; não escrever algarismos, falando em aumento, queda e estabilidade, porque a tela mostra os números; apresentar causas só como hipóteses; responder no esquema, com um resumo e até quatro observações ligadas aos indicadores da lista.
- Pedido ao provedor: `model` de `AI_MODEL`, `response_format` com o esquema JSON estrito (`summary` e `highlights`, com `indicator` em lista fechada), `temperature` 0,3, limite de tokens de saída e, no `gpt-oss`, `reasoning_effort` baixo. Os nomes exatos dos campos do limite e do raciocínio são conferidos na documentação do provedor na construção.
- `parseAnalysis(text)` (RN039): JSON válido; `summary` de 1 a 600 caracteres; até quatro `highlights`, com indicador da lista e `comment` de 1 a 240 caracteres; textos normalizados como os de RN035 (espaços e caracteres de controle); nenhum algarismo (L3). Devolve a análise ou um código de recusa (`"INVALID_RESPONSE"`, `"NUMBERS_IN_TEXT"`), como as regras da #36; campos não previstos são descartados.

### Backend (decisões 0003, 0005 e 0054)

| Camada | Arquivo | Faz |
|---|---|---|
| Rota | `src/app/api/admin/dashboard/analysis/route.ts` | `POST`: `requirePermission("dashboard")`, `dashboardAnalysisSchema.parse(body)` e `generateDashboardAnalysis`; responde com `respondOk` |
| Serviço | `src/server/services/dashboard.ts` (da #51) | `generateDashboardAnalysis(period)`: calcula os indicadores do período e do anterior em paralelo, pela função da #51; sem agendamentos no período, `AppError("INSUFFICIENT_DATA")`; monta a entrada e as mensagens, chama o adaptador, confere a resposta; recusa ou falha → `AppError("AI_UNAVAILABLE")`, com uma linha `warn` do motivo; sucesso → uma linha `info` |
| Regras | `src/server/rules/dashboard-analysis.ts` | `findPreviousPeriod`, `calculateVariation`, `buildAnalysisInput`, `buildAnalysisMessages` e `parseAnalysis`, puras (sem relógio, ambiente nem rede) |
| Apoio | `src/server/ai/chat-completion.ts` | `requestChatCompletion({ messages, schema })`: lê as três variáveis na requisição; `fetch` a `${AI_BASE_URL}/chat/completions` com `Authorization: Bearer`; corta em 15 s (`AbortSignal.timeout`); devolve o texto da resposta e os tokens usados, ou o motivo da falha (`not_configured`, `timeout`, `rate_limited`, `provider_error`); nenhuma nova tentativa |

- **Registro** (decisão 0029, RS018): `warn` com o motivo, o status HTTP do provedor e a duração; `info` "análise do dashboard gerada", com o modelo, os tokens de entrada e de saída e a duração. Nunca a chave, as mensagens nem a resposta. O 409 `INSUFFICIENT_DATA` fica na linha comum da requisição.
- **Ambiente** (`docs/plataforma/infraestrutura.md`): `AI_BASE_URL` (não sigilosa, `https://api.groq.com/openai/v1`), `AI_MODEL` (não sigilosa, `openai/gpt-oss-120b`) e `AI_API_KEY` (sigilosa). Lidas na requisição, nunca no build, então o `docker compose up --build` continua sem elas, e a análise responde indisponível. O `.env.example` é editado pelo Yvan (os nomes, sem valores); as variáveis da Vercel também.

### Tela (cartão da #60, ligado aqui)

`src/components/admin/dashboard/dashboard-analysis-card.tsx`, de cliente, logo abaixo dos cartões dos indicadores, na largura toda, a partir de 360 px:

- Título "Análise do período" (`h2`), com o ícone `Sparkles` do Lucide, decorativo, e o texto "Um resumo em texto dos indicadores deste período, escrito por inteligência artificial a partir dos números do sistema."
- Botão "Gerar análise"; durante a chamada, "Gerando análise…", desativado, com o lugar reservado de três linhas (`aria-busy`).
- Resultado: o resumo; as observações em lista, com o rótulo do indicador em negrito e o comentário; a nota "Gerado por inteligência artificial em 21/10/2026, 14:32. Pode conter imprecisões: os números oficiais são os dos indicadores.", com a data e a hora no fuso da empresa (decisão 0053); e "Gerar novamente".
- Sem comparação (`hasComparison: false`): "O período anterior não tem agendamentos: a análise não compara os períodos."
- Período sem agendamentos (os indicadores zerados do UC09 FE01): botão desativado e "Não há dados suficientes no período para gerar a análise."
- Falha: o aviso com a mensagem do `ApiError` e "Tentar novamente", como a listagem (`componentes.md`); os indicadores continuam.
- Uma região `role="status"` fica sempre no cartão e recebe "Análise gerada." (como o aviso de sucesso da #37). Trocar o período volta o cartão ao início (UC27 FA02).

## Ordem da construção

Um PR de documentação e um de código (ponto de aprovação em "Riscos e dúvidas").

**PR 1, documentação** (`Refs #66`), logo depois da aprovação, sem depender de outra tarefa:

1. Ramificação `docs/66-ai-analysis` da `origin/main`, sem vínculo com a `main`.
2. Requisitos, regras, caso de uso, RNF e RS novos; `rotas.md`, `calculos.md`, os padrões e a plataforma; `docs/plataforma/servico-de-ia.md` (L8).
3. Registro 0054 e a linha em `docs/decisoes/CONTEXT.md` (gravados na etapa 03, com o número livre na hora).
4. ICM (seção "Documentação").
5. `npm run check`; relatório parcial em `notas.md`.

**PR 2, código** (`Closes #66`), depois da #51 e da #60:

1. Ramificação `feat/66-ai-analysis` da `origin/main` e `npx -y npm@11.21.1 ci`.
2. Testes de `tests/rules/dashboard-analysis.test.ts` e `tests/validation/dashboard.test.ts`, em vermelho, num commit próprio.
3. Regras e esquema, até os testes passarem.
4. Contrato: `openapi.yaml`, antes da rota (`api.md`).
5. Códigos do catálogo, tipos, adaptador, serviço e rota.
6. Cartão ligado à rota; a entrada da análise sai da lista de demonstração (#56).
7. README das pastas.
8. Verificação local; etapa 03, com o PR e o `02_relatorio.md`.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um funcionário com a permissão `dashboard` e um período com agendamentos, quando aciona "Gerar análise", então vê, em até 20 s, o resumo e até quatro observações em português, sem algarismos, identificados como gerados por IA, e os indicadores continuam iguais (UC27, RF089, RF090, RN039, RNF018) | Local, com o provedor simulado (abaixo) e os dados do `seed-demo.sql`: a análise aparece com a nota e a hora. Pré-visualização, pelo Yvan, com a chave do Groq: o mesmo, com o modelo real |
| Dado o período de 01/10/2026 a 31/10/2026, quando a análise é gerada, então o serviço de IA recebe os indicadores desse período e os de 31/08/2026 a 30/09/2026, sem nomes, e-mails, telefones, placas, identificadores nem a agenda do dia (RN038, RS020) | Testes de `findPreviousPeriod` e `buildAnalysisInput`. Local: o provedor simulado grava o corpo recebido num arquivo do scratchpad, conferido contra os nomes e as placas do `seed-demo.sql` |
| Dado um período sem agendamentos, quando o abro, então "Gerar análise" fica indisponível, com a mensagem; chamada direto, a rota responde 409 `INSUFFICIENT_DATA` sem chamar a IA (UC27 FE01) | Local, na tela e pelo roteiro; o provedor simulado não recebe nada |
| Dado o serviço de IA fora do ar, lento (mais de 15 s), com o limite atingido (429) ou com resposta fora do formato, quando gero a análise, então vejo que ela não pôde ser gerada, com "Tentar novamente", e os indicadores continuam (UC27 FE02, RNF017) | Local, com o provedor simulado em cada modo: 503 `AI_UNAVAILABLE` em Problem Details, a linha `warn` com o motivo, nenhuma nova chamada automática |
| Dado uma resposta com algarismos, com mais de quatro observações ou com um indicador fora da lista, quando chega, então é descartada (RN039) | Testes de `parseAnalysis`; local, pelo provedor simulado |
| Dado o período anterior sem agendamentos, quando gero a análise, então ela vem sem a comparação, com o aviso (UC27 FA03) | Teste de `buildAnalysisInput`; local, com um período no começo dos dados |
| Dado um funcionário sem a permissão `dashboard`, um cliente ou ninguém com sessão, quando chama a rota, então recebe 403, 403 ou 401, e a IA não é chamada (RS008, RS010, RS019) | Local, pelo roteiro, com as contas de teste; sem `Origin`, 403 |
| Dado o ambiente sem as variáveis da IA, quando gero a análise, então vejo a mensagem de indisponível, e o resto do dashboard funciona (RNF017, RS019) | Local, com o `next start` sem as variáveis: 503 e a linha `warn` `not_configured` |
| Dado o registro do servidor e o código do navegador, depois de análises e falhas, então nenhum traz a chave, as mensagens ou a resposta do modelo (RS016, RS018, RS019) | Local: busca no registro do `next start` e em `.next/static` pela chave de teste do provedor simulado e por trechos do texto devolvido |
| Dado outro período escolhido, quando a análise estava na tela, então ela sai (UC27 FA02) | Local, na tela |

Também, pela seção "Interface" de `workflows/procedimentos/testes.md`: o cartão em `/admin` (inicial, carregando, resultado, sem comparação, sem dados e falha), a 360 × 800 primeiro e a 1440 × 900, claro e escuro, pelo teclado, com o anúncio da região de status e o Lighthouse de acessibilidade sem auditoria reprovada.

### Como a verificação local é feita

Como na #37 (banco local, contas de teste, `next build` e `next start`, Chrome sem interface com o `puppeteer-core` do cache do Lighthouse), com duas diferenças:

- **Provedor simulado.** Um servidor Node.js no scratchpad, em `http://127.0.0.1`, que responde no formato Chat Completions nos modos sucesso, demora de 20 s, 429, 500, texto que não é JSON, resposta com algarismo e cinco observações, e grava o corpo recebido. O `next start` recebe `AI_BASE_URL` com esse endereço, um `AI_MODEL` qualquer e uma chave inventada para o teste. O agente não usa a chave real e não chama o Groq.
- **Dados.** O `seed-demo.sql` carregado no banco local depois do `db reset`, pelo editor SQL do Supabase Studio local, porque o `config.toml` só aplica o `seed.sql`; o plano da #51 confirma o caminho.
- **Pré-visualização**, passo seu: a conta do Groq, a chave em `AI_API_KEY` e as duas outras variáveis na Vercel (Production e Preview) e a análise do mês atual gerada com o modelo real, com a captura no PR.

## Arquivos

PR 1 (documentação):

| Arquivo | Ação |
|---|---|
| `docs/agendamento/requisitos.md` | alterar: RF089 e RF090, `ids` |
| `docs/agendamento/RN038-dados-da-analise-do-dashboard.md`, `RN039-conteudo-da-analise-do-dashboard.md` | criar |
| `docs/agendamento/UC27-gerar-analise-do-dashboard.md` | criar |
| `docs/agendamento/UC09-visualizar-dashboard.md`, `RN021-indicadores-do-dashboard.md` | alterar: FA01 e relacionados |
| `docs/agendamento/CONTEXT.md` | alterar: UC27, RN038, RN039 e a contagem dos RF |
| `docs/agendamento/rotas.md` | alterar: a tela `/admin` e a rota da análise |
| `docs/agendamento/calculos.md` | alterar: seção 6, a análise (período anterior, variação, entrada e resposta) |
| `docs/plataforma/requisitos.md`, `seguranca.md` | alterar: RNF017, RNF018, RS019, RS020 |
| `docs/plataforma/servico-de-ia.md` | criar (L8) |
| `docs/plataforma/CONTEXT.md` | alterar: o módulo novo |
| `docs/plataforma/visao-geral.md`, `infraestrutura.md`, `estrutura-de-pastas.md` | alterar |
| `docs/padroes/api.md`, `backend.md`, `testes.md`, `design-midia.md` | alterar |
| `docs/decisoes/0054-analise-por-ia-no-groq.md`, `docs/decisoes/CONTEXT.md` | criar e alterar (etapa 03) |
| `AGENTS.md`, `guia/mapa.md`, `guia/regras.md`, `guia/CONTEXT.md` | alterar |
| `workflows/procedimentos/testes.md`, `pull-request.md`, `deploy.md` | alterar |
| `memoria/tarefas/66-analise-por-ia/` | plano, notas, proposta e, no fim, `02_relatorio.md` |

PR 2 (código):

| Arquivo | Ação |
|---|---|
| `src/app/api/admin/dashboard/analysis/route.ts`, `README.md` | criar |
| `src/server/ai/chat-completion.ts`, `README.md` | criar |
| `src/server/rules/dashboard-analysis.ts` | criar |
| `src/server/rules/README.md` | alterar |
| `src/server/services/dashboard.ts` | alterar (criado pela #51) |
| `src/shared/api/dashboard.ts`, `src/shared/validation/dashboard.ts` | alterar (criados pela #51) |
| `src/shared/constants/dashboard-indicators.ts` | criar |
| `src/shared/errors/catalog.ts` | alterar: `INSUFFICIENT_DATA` e `AI_UNAVAILABLE` |
| `src/components/admin/dashboard/dashboard-analysis-card.tsx` | alterar, se a ligação pedir (criado pela #60) |
| `src/lib/demo/` | alterar: sai a entrada da análise (#56) |
| `tests/rules/dashboard-analysis.test.ts` | criar |
| `tests/validation/dashboard.test.ts` | alterar (criado pela #51) |
| `docs/plataforma/openapi.yaml` | alterar: o caminho, `DashboardAnalysis`, `DashboardAnalysisInput` e as respostas `InsufficientData` e `AiUnavailable` |
| `.env.example` | alterar pelo Yvan: os três nomes; o agente confere pelo hash (memória do projeto) |

### Em comum com outras tarefas

- **#51:** `services/dashboard.ts`, `shared/api/dashboard.ts`, `shared/validation/dashboard.ts` e `components/admin/dashboard/`. O PR 2 começa depois da incorporação dela.
- **#60:** o cartão; **#56:** a lista de demonstração.
- **#55 e DOC:** os `.docx` só mudam na issue DOC, depois do #55.
- **Qualquer issue com erro novo:** `catalog.ts` e a tabela de `api.md`.

## Testes previstos

Valores esperados tirados de RN038, de RN039 e das opções recomendadas de L2 e L3. Sem banco, servidor, navegador ou rede (decisões 0035 e 0052).

`tests/rules/dashboard-analysis.test.ts`:

- finds the previous period with the same number of days: 2026-10-01 a 2026-10-31 → 2026-08-31 a 2026-09-30
- finds the previous day of a single-day period: 2026-10-21 → 2026-10-20
- finds the previous period across the year: 2026-01-01 a 2026-01-31 → 2025-12-01 a 2025-12-31
- finds the previous period across a leap day: 2028-03-01 a 2028-03-31 → 2028-01-30 a 2028-02-29
- calculates the variation over the previous value: 10.000,00 → 12.500,00 = 25,0; 80 → 60 = −25,0; 3 → 4 = 33,3
- has no variation when the previous value is zero: 0 → 5 = `null`
- uses percentage points for the cancellation rate: 10,0 → 15,0 = 5,0
- builds the input only with aggregated values: com uma agenda do dia com nome, e-mail, telefone, placa e id, a entrada não tem a agenda, e o JSON dela não contém nenhum desses valores
- marks the comparison as unavailable when the previous period has no appointments: `hasAppointments: false` e as variações `null`
- uses the status labels of RN017 in the input: `completed` → "Concluído"
- sends the fixed instructions and the input as JSON: duas mensagens, a de sistema e a do usuário, e a do usuário volta à entrada pelo `JSON.parse`
- accepts a valid analysis: resumo e duas observações, com os espaços repetidos removidos
- rejects a response that is not JSON → `"INVALID_RESPONSE"`
- rejects a missing, empty or over 600-character summary → `"INVALID_RESPONSE"`
- rejects more than four highlights, an unknown indicator or a comment over 240 characters → `"INVALID_RESPONSE"`
- rejects digits in the summary or in a comment: "A receita subiu 25%." → `"NUMBERS_IN_TEXT"` (L3)
- discards unknown fields of the response

`tests/validation/dashboard.test.ts`, novos casos:

- requires both dates of the analysis: sem `from` ou sem `to` → "Preencha este campo."
- rejects an analysis period that starts after it ends or is longer than twelve months → as mensagens de período da #51 (RN035)

Rota, serviço, adaptador e cartão são conferidos à mão (decisão 0052), com o provedor simulado.

## Documentação

### Módulos de `docs/` (PR 1)

Além dos textos de "Requisitos novos" e das lacunas:

- `docs/agendamento/rotas.md`: a tela `/admin` passa a "Dashboard, com a análise do período por IA"; nova rota `POST /api/admin/dashboard/analysis`, com a entrada, a resposta e os erros do contrato acima.
- `docs/agendamento/calculos.md`: seção 6, "Análise do dashboard (RN038, RN039)", com o período anterior, a variação, o que a entrada leva e a conferência da resposta, em `rules/dashboard-analysis.ts`.
- `docs/agendamento/CONTEXT.md`: RF de 31 para 33; linhas de UC27, RN038 e RN039; "Módulos de backend `appointments` e `dashboard`" continua.
- `docs/plataforma/visao-geral.md`: no Produto, "painel administrativo: dashboard, com a análise do período por IA, ..."; na Stack, linha "IA (análise do dashboard) | modelo de linguagem do Groq, no formato Chat Completions | serviço"; na frase "Sem domínio próprio, Cloudflare, ..." nada muda com a opção 1 da D1; em "Fora do escopo do MVP" e na seção nova "Evolução prevista", os textos da seção "Evolução prevista" abaixo.
- `docs/plataforma/infraestrutura.md`: "Três serviços em plano gratuito" passa a quatro, com o Groq para a análise do dashboard; as três variáveis na tabela; o que acontece sem elas.
- `docs/plataforma/estrutura-de-pastas.md`: `server/ai/` (adaptador do serviço de IA) e `rules/dashboard-analysis.ts` na árvore; na equivalência, a linha `providers/` passa a "`src/server/supabase/` e `src/server/ai/`; sem e-mail (decisão 0015)".
- `docs/padroes/api.md`, Erros: as linhas "| 409 | `INSUFFICIENT_DATA` | Não há dados suficientes no período para gerar a análise. |" e "| 503 | `AI_UNAVAILABLE` | Não foi possível gerar a análise agora. Tente novamente em instantes. |", e a frase: "O 503 `AI_UNAVAILABLE` responde quando o serviço de IA não está configurado, não responde a tempo, recusa por limite ou devolve resposta fora do formato; o motivo vai só ao registro."
- `docs/padroes/backend.md`: `ai/` na árvore de `src/server/`; no registro, o `warn` da falha da IA e o `info` da análise gerada; uma frase que remete a `servico-de-ia.md` (o arquivo está no limite de tamanho).
- `docs/padroes/testes.md`, tabela de casos: linha "Análise do dashboard | período anterior com a mesma quantidade de dias, na virada do ano e no ano bissexto; variação, inclusive com o valor anterior zero e em pontos percentuais; entrada só com agregados; resposta válida, fora do formato e com algarismos (RN038, RN039)".
- `docs/padroes/design-midia.md`, Ícones: "`Sparkles` identifica o conteúdo gerado por IA, sempre com o texto que o diz."
- `docs/plataforma/servico-de-ia.md` (novo, L8): provedor e modelo, o formato e os campos do pedido, as variáveis, os limites conferidos em 21/10/2026 com as fontes, o tempo limite, cada falha e o código que ela vira, o que o registro guarda, como trocar de provedor pelas variáveis, a verificação com o provedor simulado e o uso em funcionalidades futuras (seção "Evolução prevista" abaixo).
- OpenAPI: no PR 2, com a rota (`api.md`).

### Evolução prevista: a IA nos módulos futuros do ERP (PR 1)

Acréscimo pedido pelo Yvan ao aprovar o plano (21/10/2026): a documentação, inclusive a formal, registra que a intenção é levar a IA também a funções futuras da empresa, essenciais num ERP, como o estoque e o financeiro, que talvez não caibam no MVP. Só a intenção entra: nenhum requisito, tela ou código desses módulos. O adaptador desta tarefa já não depende do dashboard (recebe as mensagens e o esquema da resposta), então nada a mais é construído para isso (`guia/regras.md`, "construir só o que o plano pede").

Textos propostos:

- `docs/plataforma/visao-geral.md`, "Fora do escopo do MVP": "...; documentos fiscais; estoque; ..." passa a "...; documentos fiscais; estoque; gestão financeira além do valor e da forma de pagamento de cada agendamento; ...".
- `docs/plataforma/visao-geral.md`, seção nova "Evolução prevista", depois de "Fora do escopo do MVP": "O Glow foi pensado como a base de um sistema de gestão (ERP) de estética automotiva. Funções essenciais a um ERP, como o controle de estoque e a gestão financeira, ficam fora do MVP pelo prazo do projeto. A intenção é acrescentá-las depois e levar a elas a análise por inteligência artificial que começa no dashboard (UC27), com as mesmas regras: só dados agregados, nenhum dado pessoal enviado ao serviço de IA e a resposta conferida antes de ser exibida (RS019, RS020). Essas funções ainda não têm requisitos."
- `docs/plataforma/servico-de-ia.md`, seção "Uso em funcionalidades futuras": "O adaptador de `src/server/ai/` recebe as mensagens e o esquema da resposta e não conhece o dashboard. Uma análise nova, como as previstas para o estoque e o financeiro (`visao-geral.md`, Evolução prevista), entra com a sua regra de dados agregados, as suas funções puras em `src/server/rules/` e a sua rota com a permissão da página, seguindo RS019 e RS020, sem mudar o adaptador."
- Registro 0054, Justificativa, frase final: "O mesmo adaptador e as mesmas regras servem às análises previstas para funções futuras de um ERP, como o estoque e o financeiro, fora do MVP."

RS019 e RS020 já falam de "serviços externos de inteligência artificial", e não só da análise do dashboard, então valem para esses usos sem mudança.

### ICM (PR 1)

- `AGENTS.md`, linha da stack: acrescentar "o Groq (modelo de linguagem da análise do dashboard, em plano gratuito)".
- `guia/mapa.md`: no esquema, "só o servidor acessa o Supabase" passa a "só o servidor acessa o Supabase e o serviço de IA, que recebe só valores agregados (RN038)"; `ai/` na árvore de `server/`; no glossário, "Análise do período | `DashboardAnalysis`, `POST /api/admin/dashboard/analysis` | texto gerado por IA a partir dos agregados (RN038, RN039)".
- `guia/regras.md`, "Como programar", item novo: "a IA do produto (análise do dashboard) recebe só os valores agregados de RN038, e a resposta dela é dado não confiável, conferido e exibido como texto (RS020); os testes nunca chamam o provedor, e a chave dele é um segredo como os outros (RS016)."
- `guia/CONTEXT.md`, linha dos padrões: "mais `docs/plataforma/servico-de-ia.md` quando a tarefa chama a IA do produto".
- `workflows/procedimentos/testes.md`, Interface: "A IA do produto é conferida localmente com um provedor simulado no scratchpad, pelo `AI_BASE_URL`, nos modos de sucesso e de falha; o provedor real só na pré-visualização, pelo desenvolvedor."
- `workflows/procedimentos/pull-request.md`, checklist de segurança: "- [ ] Chamada a serviço de IA só pelo servidor, com dados agregados e sem dado pessoal, e resposta conferida antes de exibir (RS019, RS020)."
- `workflows/procedimentos/deploy.md`, Lembretes: "As variáveis `AI_*` ficam na Vercel em Production e Preview; conferir a cota do provedor de IA nos dias antes da apresentação."
- `workflows/01_planejar.md` a `04_encerrar.md` não mudam.

### Documentos formais (#67, depois do #55)

A edição só começa depois de incorporado o #55, na #67 (DOC), pelo método da #38: plano, notas e relatório em `memoria/tarefas/67-<nome-curto>/`; edição pelo Word por automação, em cópias; conferência do texto antes e depois, do sumário entrada por entrada, dos links e das páginas em imagem; um commit por documento. A fonte de cada item é o módulo de `docs/` do PR 1. O lugar exato de cada item é conferido no plano da DOC, que pode abrir os `.docx`.

Análise do Sistema (`AnaliseDoSistema.docx`):

1. Seções 1 a 5: no produto, o dashboard com a análise do período por IA; o Serviço de inteligência artificial como ator secundário externo (`visao-geral.md`).
2. 6.2, quadro do dashboard (RF040 a RF043): linhas RF089 e RF090.
3. 7, Quadro 18: RNF017 e RNF018.
4. 8, Quadro 19: RS019 e RS020.
5. 9.1, Quadro 20: RN038 e RN039.
6. 10.1, lista ou diagrama dos casos de uso: UC27. Se o diagrama for imagem, ele precisa ser refeito (decidido no plano da DOC).
7. 10.2: quadro novo do UC27 depois do Quadro 51 (UC26); no Quadro 34 (UC09), o FA01.

Arquitetura de Software (`ArquiteturaDoSoftware.docx`):

8. 2.2, Quadro 1: a linha da IA.
9. 3.2, Quadro 4: `/admin` com a análise do período.
10. 4.1, árvore de `src/server/`: `ai/` e `rules/dashboard-analysis.ts`.
11. 4.2: as funções puras da análise.
12. 6.4, Quadro 33: `INSUFFICIENT_DATA` e `AI_UNAVAILABLE`; Quadro 34: o `warn` da falha da IA e o `info` da análise gerada.
13. 7, Quadro 35 e Complementos: RS019 e RS020; o que o registro guarda das chamadas.
14. 8: quatro serviços em plano gratuito; 8.2, Quadro 37: `AI_BASE_URL`, `AI_MODEL` e `AI_API_KEY`.
15. 9, Quadro 38: a decisão 0054.
16. Apêndice A, quadro das rotas do painel do agendamento: `POST /api/admin/dashboard/analysis`.

Desenvolvimento com IA (`DesenvolvimentoComIA.docx`):

17. 5.3, Como Programar: o item novo de `guia/regras.md`, que separa a IA usada para desenvolver da IA do produto.
18. Seção do checklist de segurança do PR (a conferir): o item de RS019 e RS020.
19. 8.1, Quadro 9: a linha "Análise do dashboard".
20. 8.2: a verificação com o provedor simulado e com o real na pré-visualização.

Evolução prevista (acréscimo de 21/10/2026, fonte: `visao-geral.md` e `servico-de-ia.md`):

21. Análise, seções 1 a 5, no escopo: a gestão financeira em "Fora do escopo"; parágrafo novo "Evolução prevista", com a intenção de levar a IA ao estoque e ao financeiro.
22. Arquitetura, 4.1, junto de `ai/`: o adaptador não conhece o dashboard e serve às análises futuras; 9, Quadro 38, a justificativa da 0054 com a frase dos módulos futuros.
23. Desenvolvimento com IA, onde o item 17 entrar: a IA do produto começa pelo dashboard e foi pensada para os módulos futuros do ERP, com as mesmas regras (RS019, RS020).

A DOC também leva os itens das telas de demonstração (`proposta-das-issues.md`, decisão 0055) e, se já gravada, a decisão do Recharts (#60).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Primeira funcionalidade de IA

**Problema.** Os documentos não têm IA no produto. O Yvan quer uma funcionalidade de IA, com modelos gratuitos e sem dado pessoal enviado ao provedor (seção "Funcionalidades de IA analisadas").

**Opções:**

- [x] **1. Análise do período no dashboard (recomendada).** Usa só agregados, então cumpre os termos de todos os provedores gratuitos; sob demanda, cabe em qualquer cota; só leitura, sem migration, e a falha fica no cartão. É o "relatório inteligente" de um ERP. Depende da #51.
- [ ] **2. Descrição sugerida do serviço no cadastro.** Sem dado pessoal, mas o texto vai ao catálogo público e precisa de revisão antes de gravar; vale menos para a gestão. Depende da #44.
- [ ] **3. Busca de agendamentos em linguagem natural.** O texto digitado pode trazer nomes, que iriam ao provedor; o resultado se limita aos filtros que já existem. Depende da #46.
- [ ] **4. Resumo da agenda do dia.** A agenda tem cliente e placa, e a anonimização seria regra nova. Depende da #46 e da #51.

**Texto proposto (opção 1):** os de "Requisitos novos" e da seção "Documentação".

### L2. Comparação com o período anterior

**Problema.** RN021 define os indicadores de um período, sem comparação. Uma análise sem comparação quase repete os cartões.

**Opções:**

- [x] **1. Período anterior de mesma duração, terminado no dia anterior ao início (recomendada).** 01/10 a 31/10 → 31/08 a 30/09. Uma consulta a mais, pela mesma função do dashboard; vale para qualquer período de até 12 meses.
- [ ] **2. Mesmo período do ano anterior.** Tira a sazonalidade, mas os dados começam em 2026: até 2027 nunca haveria comparação.
- [ ] **3. Sem comparação.** Uma consulta só, mas a análise fica descritiva.

**Texto proposto (opção 1):** RN038 e `calculos.md`, seção 6: "Período anterior: a mesma quantidade de dias, terminando no dia anterior à data inicial. Variação: percentual sobre o valor anterior, com uma casa decimal; na taxa de cancelamento, a diferença em pontos percentuais; sem variação quando o valor anterior é zero."

### L3. Números no texto da análise

**Problema.** Um modelo de linguagem pode errar ou inventar números. RN021 e `api.md` dizem que os valores são calculados pelo sistema.

**Opções:**

- [x] **1. Texto sem algarismos, conferido pelo sistema (recomendada).** O modelo fala em aumento, queda e estabilidade, e a resposta com qualquer algarismo é descartada (FE02). Os números ficam nos cartões, ao lado. A regra é verificável por teste; em troca, o texto fica menos preciso ("a receita subiu"), e a resposta pode ser recusada às vezes.
- [ ] **2. Algarismos permitidos, com a nota "Confira os números nos indicadores".** Texto mais rico, sem garantia de que os números estão certos.
- [ ] **3. Frases fixas montadas pelo sistema a partir das variações.** Nenhum erro possível, mas não há IA no texto.

**Texto proposto (opção 1):** RN039, "... em português do Brasil e sem algarismos"; `calculos.md`, seção 6: "A resposta com algarismo no resumo ou numa observação é descartada."

### L4. Período sem dados e falhas do provedor

**Problema.** `api.md` não tem código para a análise sem dados nem para a falha de um serviço de IA; o 503 `SERVICE_UNAVAILABLE` é descrito só para o Supabase Auth.

**Opções:**

- [x] **1. Dois códigos novos: 409 `INSUFFICIENT_DATA` e 503 `AI_UNAVAILABLE` (recomendada).** A tela distingue "não há o que analisar" de "tente de novo"; o motivo técnico da falha vai só ao registro (RS017).
- [ ] **2. 200 com a análise vazia e o motivo no corpo, e o `SERVICE_UNAVAILABLE` para a falha.** Menos códigos, mas a tela leria o corpo do sucesso para achar a falha, e o 503 mudaria de sentido.

**Texto proposto (opção 1):** as duas linhas e a frase de `api.md` da seção "Documentação"; os códigos em `src/shared/errors/catalog.ts`.

### L5. Tempo de resposta

**Problema.** RNF007 pede até 2 s nas consultas. Um modelo de linguagem gratuito leva segundos, e a Vercel corta a função em 300 s no plano Hobby.

**Opções:**

- [x] **1. RNF018 novo: até 20 s, com indicação de andamento; o adaptador corta a chamada em 15 s (recomendada).** O funcionário espera com o cartão em "Gerando análise…", e a espera tem fim.
- [ ] **2. Resposta em fluxo (streaming), com o texto aparecendo aos poucos.** Parece mais rápida, mas a saída estruturada do Groq não aceita fluxo, e o texto só seria conferido no fim (RN039).

**Texto proposto (opção 1):** RNF018 de "Requisitos novos"; `servico-de-ia.md`: "O adaptador interrompe a chamada em 15 segundos."

### L6. Guardar a análise

**Problema.** Nada diz se a análise gerada fica gravada.

**Opções:**

- [x] **1. Não guardar (recomendada).** Nada vai ao banco nem ao registro; recarregar a página perde a análise; sem migration nem regra de validade.
- [ ] **2. Guardar a última por período, numa tabela.** Evita chamadas repetidas e mostra a análise a outros funcionários, mas exige migration, uma regra de validade (o período muda com novos agendamentos) e grava texto gerado por IA.

**Texto proposto (opção 1):** UC27, pós-condição "nada é gravado"; RS020, "Entradas e respostas não são gravadas nem registradas."

### L7. Limite de uso

**Problema.** Cada clique consome a cota gratuita do provedor, e nada limita as chamadas.

**Opções:**

- [x] **1. Sem limite próprio (recomendada).** O botão fica desativado durante a chamada, nada é repetido automaticamente, e o 429 do provedor vira `AI_UNAVAILABLE`. Um funcionário pode gastar a cota do dia clicando muitas vezes; aceitável na demonstração, e `seguranca.md` já deixa de fora o limite de requisições distribuído.
- [ ] **2. Limite por funcionário numa tabela do banco.** Protege a cota, mas exige migration e um valor de limite que a análise não define.

**Texto proposto (opção 1):** `servico-de-ia.md`: "Não há limite próprio de chamadas: o botão fica desativado durante a geração, nenhuma chamada é repetida, e o limite do provedor responde `AI_UNAVAILABLE`."

### L8. Onde descrever o serviço de IA

**Problema.** A tabela "Onde registrar conhecimento novo" de `docs/CONTEXT.md` não tem lugar para um serviço externo. `backend.md` (7,4 mil caracteres) e `infraestrutura.md` (7,3 mil) estão perto do limite de 2 mil tokens.

**Opções:**

- [x] **1. Módulo novo `docs/plataforma/servico-de-ia.md` (recomendada).** Um lugar só para o provedor, os limites, as falhas e a troca; `backend.md`, `infraestrutura.md` e `seguranca.md` remetem a ele.
- [ ] **2. Espalhar por `backend.md`, `infraestrutura.md` e `seguranca.md`.** Sem arquivo novo, mas os três passariam do limite e teriam de ser divididos.

**Texto proposto (opção 1):** o módulo novo; linha em `docs/plataforma/CONTEXT.md`; e, em `docs/CONTEXT.md`, na tabela "Onde registrar conhecimento novo", a linha "| Serviço externo usado pelo servidor, como o de IA | `docs/plataforma/servico-de-ia.md` |".

## Decisões técnicas

- Seguidas:
  - 0003, 0005 e 0036: rota, serviço, regras e repositório, com a permissão na API; a pasta nova `src/server/ai/` entra em `estrutura-de-pastas.md`;
  - 0008: um esquema para a rota e para o cartão;
  - 0017: código em inglês, interface e instruções ao modelo em português;
  - 0025 e 0026: Problem Details e uma rota nova, sem mudar contrato existente;
  - 0029: o registro na saída padrão, sem serviço externo de monitoramento;
  - 0030: o novo serviço também em plano gratuito; a 0054 a complementa, sem substituí-la;
  - 0035 e 0052: TDD nas regras e no esquema; rota, adaptador e cartão à mão;
  - 0053: a hora da geração no fuso da empresa;
  - 0055 (aprovada na proposta, #56): o cartão é construído com dados de demonstração antes da rota.

### D1. Provedor e modelo da análise

**Problema.** O rascunho sugere o Cloudflare Workers AI. A comparação ("Provedores comparados") mostra outras opções gratuitas compatíveis com a arquitetura. Todas as da lista falam o formato Chat Completions, então a escolha fica nas variáveis de ambiente e pode ser trocada sem mudar o código.

**Opções:**

- [x] **1. Groq, com o `openai/gpt-oss-120b` (recomendada).** Sem cartão; limites publicados de 1.000 análises e 200 mil tokens por dia, bem acima da demonstração; não retém os dados por padrão nem treina com eles; saída estruturada estrita, que garante o formato pedido; resposta rápida. Consequências: depende de um serviço externo sem garantia de gratuidade; os agregados são processados nos Estados Unidos; 8 mil tokens por minuto dão cerca de uma análise de 12 meses por minuto.
- [ ] **2. Gemini API, com um modelo Flash-Lite.** O melhor português, mas os limites não são publicados nem garantidos, o Google usa as entradas e saídas do plano gratuito para melhorar os produtos, com revisão humana, e os nomes dos modelos mudam com frequência.
- [ ] **3. Cloudflare Workers AI, com o `@cf/openai/gpt-oss-120b` (rascunho do Codex).** Não treina com os dados; cerca de 90 análises por dia; precisa de conta e do identificador da conta, o esquema JSON não está confirmado no formato compatível, e "Sem ... Cloudflare" sai de `visao-geral.md`.
- [ ] **4. OpenRouter `:free` ou o AI Gateway da Vercel.** O primeiro dá 50 chamadas por dia sem compra, com modelos e políticas variáveis; o segundo não exige conta nova, mas os limites gratuitos não são publicados.

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| 0054: a análise do dashboard usa um modelo de linguagem do Groq em plano gratuito (`openai/gpt-oss-120b`), chamado só pelo servidor no formato Chat Completions, com `fetch` e saída por esquema JSON, sem SDK; endereço, modelo e chave vêm do ambiente; o adaptador fica em `src/server/ai/` | Gemini, Cloudflare Workers AI, OpenRouter, AI Gateway da Vercel e Hugging Face (D1); modelos no navegador (contrariam RNF001, RNF006 e RNF009); SDK de IA, como o `ai` da Vercel (dependência nova para uma chamada só) | Sem custo e sem dependência nova; os dados agregados não são retidos nem usados para treino; o formato estruturado garante a conferência de RN039; outro provedor compatível entra pelas variáveis; o mesmo adaptador e as mesmas regras servem às análises previstas para o estoque e o financeiro, fora do MVP. Aceito: um serviço externo sem garantia de gratuidade, com os dados nos Estados Unidos | nova; complementa a 0030 |

Escolhas locais, sem registro:

- `POST` para a análise, por ser ação com custo, nunca repetida.
- As funções da análise em `src/server/rules/`, onde ficam as regras puras testadas (decisão 0052), em vez de uma pasta de testes nova.
- O serviço da análise no `dashboard.ts` da #51, um arquivo por módulo (`backend.md`).
- Os indicadores das observações como lista `as const` em `src/shared/constants/`, com os rótulos.
- As mensagens ao modelo como constante no código, revisada no PR.

## Riscos e dúvidas

- **Gratuidade.** Os limites e os termos dos planos gratuitos mudam sem aviso (o Gemini deixou de publicar os limites; o GitHub Models foi encerrado em 2026). Mitigação: a troca de provedor é configuração, descrita em `servico-de-ia.md`, e a falha não derruba a tela.
- **Contrato da #51.** Os nomes de campo da entrada seguem os tipos que a #51 definir. Se ela os mudar, o PR 2 acompanha, sem mudar as regras deste plano.
- **Recusas por algarismo (L3).** O modelo pode escrever algarismos mesmo instruído. Se a recusa for frequente na verificação, a correção é a mensagem de sistema, não a regra; se não bastar, volta a você como dúvida.
- **Qualidade do texto.** O `gpt-oss-120b` escreve bem em português, mas pior que o Gemini. A verificação na pré-visualização mostra se basta.
- **Tamanho dos módulos.** `api.md` passa de 7,6 mil para cerca de 8 mil caracteres, no limite; `seguranca.md` já tem 9,2 mil, e cada RS vai obrigatoriamente nele.
- **Conta do Groq.** Quem cria a conta aceita os termos do Groq; é passo seu, como as variáveis na Vercel e o `.env.example`.
- **Pontos para a sua aprovação:**
  - [x] **1. Uma issue com dois PRs (recomendada):** documentação agora (`Refs #N`) e código depois da #51 (`Closes #N`), como a opção 2 da #37.
  - [ ] **2. Duas issues:** uma de documentação (`tipo:documentacao`) e uma de código.
  - [ ] **3. Um PR só,** no fim, depois da #51; a documentação e a DOC esperam.
  - Também: o provedor simulado e a chave inventada na verificação local; o `seed-demo.sql` no banco local; as contas de teste locais e o cookie no Lighthouse, como na #37.

## Fora do escopo

- Chat livre, texto digitado enviado à IA, SQL ou consulta gerados pelo modelo e acesso do modelo ao banco.
- Análise guardada (L6), limite próprio de chamadas (L7), resposta em fluxo (L5), exportação da análise.
- As outras funcionalidades de L1 e qualquer IA no portal.
- Os módulos de estoque e financeiro e a IA neles: só a intenção entra na documentação (seção "Evolução prevista").
- O dashboard em si (#51) e a tela com dados de demonstração (#60).
- Testes automatizados da rota, do adaptador e do cartão (decisão 0052).
- Os `.docx` (issue DOC).

## Estado da construção

PR 1 (documentação) entregue na ramificação `docs/66-ai-analysis`, com `Refs #66`: requisitos, regras, caso de uso, serviço de IA, padrões, ICM e a decisão 0054, mais a memória da tarefa. Nenhum arquivo fora da lista do plano; `npm run check` aprovado. O plano continua `em_execucao` até o PR 2 (código), que depende da #51 e da #60. Relatório parcial em `02_relatorio.md`.
