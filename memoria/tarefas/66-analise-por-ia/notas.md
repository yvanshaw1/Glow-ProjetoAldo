# Notas: 66-analise-por-ia

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo. Até a criação da #66, a pasta se chamava `sem-issue-analise-por-ia`.

## 2026-10-21 – descoberta

Conferências do planejamento, sem alterar código, `.docx` nem o GitHub:

- **Origem.** Sessão iniciada pela sessão principal para planejar três coisas ligadas: a IA no produto, a documentação dela e a nova prioridade das issues (telas antes da lógica). O rascunho do Codex colado pelo Yvan (resumo em `side-session-notes/local_d0d6debf-.../rascunho-codex-ia-dashboard.md`) foi lido como sugestão.
- **Worktree.** `37-dados-da-empresa-1b1de5`, ramificação `claude/plano-ia-no-sistema-11479b`, em a037b4c, igual à `origin/main` depois do `git fetch`. Plano, notas e proposta sem commit, como nas etapas 01 anteriores.
- **GitHub.** Um PR aberto, o #55 (#38, `docs/38-formal-documents`), que só muda `documentos-formais/` e `memoria/`. Issues abertas: #38 a #51. O próximo número do repositório é o 56.
- **Números livres.** RF089, RN038, UC27, RNF017, RS019 e a decisão 0054, conferidos em `docs/`, `guia/`, `workflows/` e na ramificação do #55.
- **Estado do dashboard.** `src/app/(admin)/admin/page.tsx` só tem o título; não existem `GET /api/admin/dashboard` nem `src/server/services/dashboard.ts`. `calculos.md` deixa para o plano da #51 onde agregar e a data da taxa de cancelamento.
- **`seed-demo.sql`.** Tem agendamentos em todos os status (3 concluídos, 3 cancelados, 3 reagendados, entre outros), com datas relativas a `now()`. Por isso a #51 não precisa esperar a #50. O `config.toml` só aplica o `seed.sql`; a verificação carrega o `seed-demo.sql` à parte.
- **Restrições achadas nos módulos.** `visao-geral.md` diz "Sem domínio próprio, Cloudflare, provedor de e-mail, monitoramento externo ou ORM" (pesa contra o Workers AI do rascunho); `estrutura-de-pastas.md` trata `src/server/supabase/` como o "único provedor externo"; `seguranca.md` já deixa de fora o limite de requisições distribuído; `api.md` descreve o 503 só para o Supabase Auth.
- **Tamanho dos módulos.** `backend.md` 7,4 mil caracteres, `api.md` 7,6 mil, `frontend.md` 7,7 mil, `infraestrutura.md` 7,3 mil, `seguranca.md` 9,2 mil: por isso o módulo novo `servico-de-ia.md` (L8).
- **Seções dos `.docx`.** Tiradas dos cabeçalhos `origem` dos módulos e do plano, das notas e do relatório da #38 (lidos por `git show` da ramificação do #55), sem abrir os `.docx`. Ficam a conferir no plano da DOC: o quadro exato do dashboard na 6.2 da Análise, a forma da 10.1 (lista ou diagrama) e a seção do checklist de segurança no Desenvolvimento com IA.
- **Ícones.** O `lucide-react` 1.59.0 instalado tem `sparkles`, `flask-conical`, `trending-up`, `trending-down` e `info`. O Recharts ainda não está instalado (entra com a T4).
- **Telas.** Prontas: `/login`, `/register`, `/set-password`, a aba "Empresa" e os layouts. A troca de senha do cliente (`POST /api/auth/change-password`) já existe e pode ser real na T2.

## 2026-10-21 – descoberta

Pesquisa dos provedores gratuitos, na web, em 21/10/2026:

- **Gemini API:** no plano gratuito, os modelos Flash e Flash-Lite (`gemini-2.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`, `gemini-2.5-flash`, `gemini-3-flash-preview`, `gemini-3.6-flash`, `gemini-3.8-flash`) são gratuitos, com "Used to improve our products: Yes". A página de limites não traz mais os números (só no AI Studio), e eles "não são garantidos". Os termos (vigentes desde 23/03/2026) proíbem dados pessoais no plano gratuito, permitem revisão humana e exigem 18 anos. O Brasil está entre as regiões. Formato compatível com Chat Completions, com saída estruturada e `reasoning_effort`.
- **Groq:** modelos de produção `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `openai/gpt-oss-120b` e `openai/gpt-oss-20b`. Para o `gpt-oss`, a página de limites mostra 30 RPM, 1 mil RPD, 8 mil TPM e 200 mil TPD (a página tem abas Free e Developer, e o texto extraído não diz de qual são; conferir na conta). Acima do limite, 429 com `retry-after`. Não retém dados de inferência por padrão, registros de abuso por até 30 dias, retenção zero para todos; o contrato proíbe treinar com as entradas e saídas (citado por fontes de terceiros). Saída estruturada estrita no `gpt-oss`, sem fluxo. Endereço `https://api.groq.com/openai/v1`. Plano Free sem cartão, segundo o fórum do Groq.
- **Cloudflare Workers AI:** 10 mil neurônios por dia nos planos Free e Paid; no Free, erro acima disso, zerado às 00:00 UTC. `@cf/openai/gpt-oss-120b`: 31.818 neurônios por milhão de tokens de entrada e 68.182 de saída; `@cf/meta/llama-3.3-70b-instruct-fp8-fast`: 26.668 e 204.805. Não usa o conteúdo para treinar. Formato compatível em `https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1/chat/completions`; a página não fala de `json_schema`.
- **OpenRouter `:free`:** 20 RPM; 50 por dia com menos de 10 créditos comprados, 1 mil com 10 ou mais.
- **Hugging Face Inference Providers:** contas gratuitas sem crédito mensal; PRO com US$ 2.
- **AI Gateway da Vercel:** plano gratuito com crédito mensal, só modelos marcados, limites por modelo não publicados; retenção zero só em Pro e Enterprise; comprar créditos tira do gratuito.
- **GitHub Models:** encerrado em 30/07/2026.
- **No navegador:** Summarizer do Chrome estável desde o 138 (computador, 22 GB livres, GPU com mais de 4 GB ou 16 GB de RAM; sem celular; inglês, japonês, espanhol, alemão e francês, sem português); Prompt API na web no Chrome 148. WebLLM: cerca de 695 MB para um Llama 3.2 1B em 4 bits, WebGPU (Firefox incompleto, segundo fontes de terceiros).
- **Vercel Functions (Hobby, Fluid compute):** 300 s de duração padrão e máxima.

Fontes:

- https://ai.google.dev/gemini-api/docs/rate-limits
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/billing
- https://ai.google.dev/gemini-api/terms
- https://ai.google.dev/gemini-api/docs/available-regions
- https://ai.google.dev/gemini-api/docs/openai
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/models
- https://console.groq.com/docs/your-data
- https://console.groq.com/docs/structured-outputs
- https://console.groq.com/docs/openai
- https://community.groq.com/t/is-there-a-free-tier-and-what-are-its-limits/790
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/
- https://developers.cloudflare.com/workers-ai/platform/privacy/
- https://openrouter.ai/docs/api/reference/limits
- https://huggingface.co/docs/inference-providers/pricing
- https://vercel.com/docs/ai-gateway/pricing
- https://vercel.com/docs/ai-gateway/rate-limits
- https://vercel.com/docs/functions/limitations
- https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models
- https://developer.chrome.com/docs/ai/built-in-apis
- https://developer.chrome.com/docs/ai/summarizer-api
- https://pinggy.io/blog/run_llm_in_browser_webgpu/

## 2026-10-21 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas, todas com a opção 1 recomendada:

- L1, funcionalidade: análise do período no dashboard;
- L2, comparação: período anterior de mesma duração, terminado no dia anterior ao início;
- L3, números no texto: sem algarismos, conferido pelo sistema;
- L4, erros: 409 `INSUFFICIENT_DATA` e 503 `AI_UNAVAILABLE`, novos;
- L5, tempo: RNF018 novo, até 20 s, com a chamada cortada em 15 s;
- L6, guardar: não;
- L7, limite de uso: sem limite próprio;
- L8, documentação: módulo novo `docs/plataforma/servico-de-ia.md`.

Decisão técnica D1, recomendada a opção 1: Groq com o `openai/gpt-oss-120b`, no formato Chat Completions, com `fetch`, sem SDK, e endereço, modelo e chave no ambiente (decisão 0054, nova, complementa a 0030). Requisitos novos propostos: RF089, RF090, RN038, RN039, UC27, RNF017, RNF018, RS019 e RS020. Nada foi construído; não há migration; nenhuma dependência nova nesta tarefa.

Pontos explícitos para a aprovação: uma issue com dois PRs (documentação agora, código depois da #51); o provedor simulado e a chave inventada na verificação local; o `seed-demo.sql` no banco local; a conta do Groq e as variáveis na Vercel e no `.env.example` pelo Yvan.

Proposta das telas e das issues gravada em `proposta-das-issues.md`, também aguardando aprovação: LT1 a LT4 (recomendados dados de demonstração no cliente da API, aviso fixo, listagens que filtram sobre a lista fixa e formulários sem os esquemas, remoção rota a rota), decisão 0055 nova, issues novas T0 a T9, IA e DOC, mudanças no corpo da #39 à #51 e a nova ordem das ondas. Nada foi criado nem editado no GitHub.

## 2026-10-21 – decisão

Plano aprovado por yvan na conversa; ele marcou `status: aprovado`, `aprovado_por` e `aprovado_em` (21/10/2026 - 09:22), sem marcar as caixas. As caixas da opção 1 (L1 a L8, D1 e "uma issue com dois PRs") foram marcadas pelo agente, porque os textos aprovados são os da opção recomendada. A `proposta-das-issues.md` continua aguardando o OK: nenhuma issue criada ou editada.

Acréscimo pedido na aprovação: a documentação, inclusive os `.docx`, registra a intenção de levar a IA a funções futuras de um ERP, como o estoque e o financeiro, que talvez não caibam no MVP. Entrou no plano como a seção "Evolução prevista" (textos para `visao-geral.md`, `servico-de-ia.md` e a justificativa da 0054), nos itens 21 a 23 dos documentos formais e em "Fora do escopo"; na proposta, no escopo das issues IA e DOC. Só a intenção: nenhum requisito, tela ou código desses módulos. "Financeiro" não aparecia em `docs/`; "estoque" já estava em "Fora do escopo do MVP".

## 2026-10-21 – decisão

Proposta das issues aprovada por yvan na conversa, com a opção 1 em LT1 a LT4 (caixas marcadas pelo agente). Aplicado no GitHub, pelo `gh`, como yvanshaw1:

- Issues criadas, com os números previstos: #56 (T0, base da demonstração), #57 (T1, portal público), #58 (T2, conta, veículos e agendamentos do cliente), #59 (T3, agendar e editar), #60 (T4, dashboard e análise), #61 (T5, consulta e status no painel), #62 (T6, novo agendamento e edição no painel), #63 (T7, serviços e categorias), #64 (T8, clientes e veículos), #65 (T9, equipe e configurações), #66 (IA, esta tarefa) e #67 (DOC). As telas levam os critérios comuns no corpo; a #56 leva o resumo de LT1 a LT4.
- Corpo da #39 à #51 editado: o item da página passou a "a tela da #5x/#6x ligada às rotas", com as dependências novas; a #46 perdeu a etiqueta de status (#56); a #51 perdeu o Recharts (#60) e a dependência da #50 e ganhou a função dos indicadores reutilizada pela #66. Títulos e rótulos não mudaram. Conferido relendo cada corpo: igual ao enviado, a menos da linha em branco final.
- Pasta renomeada de `sem-issue-analise-por-ia` para `66-analise-por-ia`; no plano, `issue: 66` e os marcadores `T0` e `T4` trocados por #56 e #60. Os corpos enviados ficam no scratchpad desta sessão (`issues/`).

Próximo passo da #66: o PR 1 (documentação), em `docs/66-ai-analysis`, que leva também esta pasta ao repositório. A #56 pode começar em paralelo.

## 2026-10-21 – desvio

Etapa 02, PR 1 (documentação), pedida pelo Yvan. Plano em `em_execucao`. Ramificação `docs/66-ai-analysis` criada da `origin/main` (a037b4c), sem vínculo com a `main` (`git switch --no-track -c`, no próprio worktree). Commits, nesta ordem:

- 0922ce1: agendamento (RF089, RF090, RN038, RN039, UC27, UC09 com o FA01, RN021, `CONTEXT.md`, `rotas.md`, seção 6 de `calculos.md`);
- 4613954: plataforma (RNF017, RNF018, RS019, RS020, `servico-de-ia.md` novo, `visao-geral.md` com a gestão financeira fora do escopo, a "Evolução prevista", o ator e a linha da stack; `infraestrutura.md`, `estrutura-de-pastas.md`, os dois `CONTEXT.md`);
- 92ce075: padrões (`api.md`, `backend.md`, `testes.md`, `design-midia.md`);
- a4e818d: ICM (`AGENTS.md`, `guia/mapa.md`, `regras.md`, `CONTEXT.md`, os procedimentos de testes, PR e publicação).

As alterações foram aplicadas por um roteiro Node.js no scratchpad (`docs-edits.mjs`), que confere cada trecho antigo uma única vez antes de gravar. Nenhum arquivo fora da lista do plano; nenhum código. `npm run check` aprovado, com 371 testes; todos os links relativos dos arquivos alterados apontam para arquivos que existem; cada identificador novo está definido uma vez.

Desvios pequenos, sem mudar regra nem escopo:

- **Decisão 0054** ainda não gravada: o procedimento de decisão a grava na etapa 03, com o número livre na hora. Os módulos já citam a 0054.
- **Tamanho dos módulos:** `seguranca.md` passou de 9,2 mil para 10,8 mil caracteres (os RS só podem ficar nele); `api.md` 8,1 mil; `backend.md` 7,8 mil; `calculos.md` 7,7 mil. Acima do guia de 2 mil tokens só o `seguranca.md`, que já estava.
- **`calculos.md`:** a tabela do começo ganhou a linha "6. Análise do dashboard"; a seção 5 continua fora dela, porque os indicadores não ficam em `rules/`.
- **`guia/mapa.md`:** o esquema ganhou uma linha própria para o caminho da análise até o serviço de IA, em vez de mudar a linha do PostgreSQL.
- A pasta `memoria/tarefas/66-analise-por-ia/` continua sem commit e entra na etapa 03, com o registro da decisão.

## 2026-10-21 – decisão

Etapa 03 do PR 1, pedida pelo Yvan. Decisão 0054 gravada (`docs/decisoes/0054-analise-por-ia-no-groq.md` e a linha no índice), com o número livre conferido. Relatório parcial gravado. O plano fica em `em_execucao`, e não `concluido`: este PR usa `Refs #66`, e a entrega só termina com o PR 2, como a opção 1 aprovada ("uma issue com dois PRs"). O número do PR no relatório (68) foi previsto pelo último número do repositório (67) e é conferido depois de abrir o PR.
