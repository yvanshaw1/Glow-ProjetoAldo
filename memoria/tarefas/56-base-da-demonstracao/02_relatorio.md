---
issue: 56
pull_request: 69
---

# Relatório: Base das telas de demonstração: dados no cliente da API, aviso e etiqueta de status

## O que foi feito

- **Lista de demonstração** (`src/lib/demo/`, decisão 0055, LT1): o `apiRequest` procura o método e o caminho na lista antes do `fetch` e, se os acha, responde depois de 400 ms, sem rede. A leitura, inclusive o `POST` que não grava, devolve os dados do módulo, carregado só quando a tela chama a rota; a gravação recebe `NOT_IMPLEMENTED` (501, "Esta ação ainda não está disponível nesta versão de demonstração."). Cancelada durante a espera, a chamada termina como o `fetch` cancelado. A lista começa vazia: cada tela da #57 à #65 acrescenta as suas rotas.
- **Página, busca e filtros** (LT3, RNF008): `demoPage` aplica `page` e `pageSize` pelo `paginationSchema` das rotas (no máximo 50), a busca sem distinção de maiúsculas nos textos que a tela busca e os filtros por igualdade, na ordem da lista fixa.
- **Aviso de demonstração** (LT2, L3): `DemoNotice`, com o ícone `FlaskConical`, o texto aprovado e `role="note"`, sem botão de fechar, para ficar logo abaixo do título da página ou no topo da aba ou da seção.
- **Etiqueta de status** (RN017, RNF005, L1): `StatusBadge`, com o nome escrito e quatro tons só com as cores do tema; o texto passa de 4,5:1 nos dois temas.
- **Fim da demonstração** (LT4, L2): a regra em `componentes.md`, a seção nova de `pull-request.md` e o item em "Critérios de pronto" do modelo de PR.

## Arquivos alterados

- `src/lib/demo/routes.ts`, `match.ts`, `list.ts` e `README.md`: criados.
- `src/lib/api-client.ts`: a consulta à lista antes do `fetch`, a espera e o `NOT_IMPLEMENTED`; `HttpMethod` exportado.
- `src/shared/errors/catalog.ts`: `NOT_IMPLEMENTED` (501).
- `src/components/shared/demo-notice.tsx` e `status-badge.tsx`: criados.
- `tests/lib/api-client.test.ts`: bloco "apiRequest with demo data", com 12 casos.
- `docs/padroes/componentes.md`, `design.md`, `frontend.md`, `api.md` e `testes.md`; `docs/plataforma/estrutura-de-pastas.md`.
- `docs/decisoes/0055-telas-de-demonstracao.md`: criado; `docs/decisoes/CONTEXT.md`: a linha da 0055.
- `workflows/procedimentos/pull-request.md` e `.github/pull_request_template.md`.
- README de `src/lib/`, `src/components/shared/` e `tests/lib/`.

## Testes executados

- `npm run check`: aprovado, com 383 testes (12 novos). Os testes ficaram no commit 49251e8, anterior ao código, e 10 dos 12 falharam antes dele; os 2 de ida à rede já passavam, porque conferem o comportamento atual.
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, também sem a página temporária.
- Local, com o Supabase local, o admin só nele e o `next start`:
  - **Página temporária** `/demo-check`, sem commit e apagada no fim: o aviso com o texto inteiro, o ícone de 16 px e nenhum botão; as sete etiquetas com o nome escrito e os tons de L1, a 360 × 800 e a 1440 × 900, nos temas claro e escuro, sem transbordar; pelo teclado, só o "Pular para o conteúdo" recebe foco.
  - **Rota fora da lista:** o login do admin por `/login`; em `/admin/settings`, `GET` e `PUT /api/admin/settings/company` com 200 e "Dados da empresa salvos."; o rodapé com `GET /api/public/company`.
  - **Lighthouse 13.5.0**, acessibilidade, em `/demo-check`, `/login` e `/admin/settings`, celular e computador, claro e escuro: 100 nos 12 relatórios, com a auditoria de contraste aprovada.
  - **Registro:** nenhuma linha com cookie, token, cabeçalho de autorização, a senha ou o e-mail de teste (RS018).
- **Pré-visualização:** passo do desenvolvedor (veja o PR).

## Documentação atualizada

- **Módulos:**
  - `docs/padroes/componentes.md`: seções "Telas de demonstração (decisão 0055)" e "Etiqueta de status (RN017)";
  - `docs/padroes/design.md`: linha "Etiqueta";
  - `docs/padroes/frontend.md`: "Comunicação com a API" e a estrutura de `src/lib/`;
  - `docs/padroes/api.md`: 501 `NOT_IMPLEMENTED`, só do cliente da API;
  - `docs/padroes/testes.md`: casos do cliente da API;
  - `docs/plataforma/estrutura-de-pastas.md`: `src/lib/demo/`;
  - `workflows/procedimentos/pull-request.md` e `.github/pull_request_template.md`.
- **Lacunas resolvidas** (opção 1 em todas):
  - LT1 a LT4 da proposta (`memoria/tarefas/66-analise-por-ia/proposta-das-issues.md`) → `componentes.md`, `frontend.md`, `api.md`, `estrutura-de-pastas.md`, `testes.md` e os README;
  - L1 (aparência da etiqueta de status) → `componentes.md` e `design.md`;
  - L2 (item do checklist de LT4) → `pull-request.md` e o modelo de PR;
  - L3 (posição do aviso) → `componentes.md`.
- **Decisões:** 0055 criada.
- **Documentos formais a atualizar** (pela #67):
  - **Documentação de Arquitetura de Software, seção 3.4 (Comunicação com a API):** a rota ainda não construída responde com os dados de demonstração de `src/lib/demo/`, depois de 400 ms e sem rede; a gravação recebe `NOT_IMPLEMENTED` (decisão 0055).
  - **Documentação de Arquitetura de Software, seções 3.1 e 4.1 (estrutura de pastas):** `src/lib/demo/`, com os dados das telas de demonstração.
  - **Documentação de Arquitetura de Software, seção 6.4 (Quadro 33):** 501 `NOT_IMPLEMENTED`, "Esta ação ainda não está disponível nesta versão de demonstração.", produzido só pelo cliente da API.
  - **Documentação de Arquitetura de Software, seção 9 (Quadro 38):** a decisão 0055.
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes do cliente da API cobrem as respostas das rotas de demonstração, sem chamada de rede, e a recusa das gravações.

## Pendências

- **Pré-visualização**, passo do Yvan: `/login` e `/admin/settings` como antes, com o Lighthouse das ferramentas do navegador e as capturas no PR. O aviso e as etiquetas só aparecem na pré-visualização a partir da primeira tela.
- **Para a #57 à #65:** cada tela acrescenta as suas rotas, as de leitura e as de gravação, em `src/lib/demo/routes.ts` (uma linha por rota; conflito simples entre as telas em paralelo), cria o seu `<módulo>.ts` de dados com os nomes do `seed-demo.sql` e mostra o `DemoNotice` logo abaixo do título. O filtro que não é igualdade, como a visão do dia de `/admin/appointments` e a opção de inativos, e a ordenação ficam na resposta do módulo, antes do `demoPage` (README da pasta). A #58, a #60 e a #61 usam a `StatusBadge`.
- **Para a #46:** a etiqueta de status já está pronta.
- **Para a #67:** a lista acima, de documentos formais.
