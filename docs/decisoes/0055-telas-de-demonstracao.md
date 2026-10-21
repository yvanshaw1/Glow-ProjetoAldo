---
id: 0055
titulo: Telas construídas antes das rotas, com dados de demonstração respondidos pelo cliente da API
status: aceita
data: 2026-10-21
origem: issue #56, plano memoria/tarefas/56-base-da-demonstracao/01_plano.md (Decisões técnicas); proposta memoria/tarefas/66-analise-por-ia/proposta-das-issues.md (LT1 a LT4)
relacionados: [RNF004, RNF008, 0035, 0052]
---

# 0055 – Telas construídas antes das rotas, com dados de demonstração respondidos pelo cliente da API

## Decisão

As telas são construídas antes das rotas, na forma final: componentes de cliente com `useApiQuery` ou `usePaginatedList` e os endereços de `rotas.md`. Enquanto a rota de uma tela não existe, o `apiRequest` procura o método e o caminho numa lista de `src/lib/demo/` antes de chamar a rede e, se os acha, responde depois de 400 ms:

- a leitura, inclusive o `POST` que não grava, com os dados fixos do módulo, tipados por `src/shared/api/` e com os dados fictícios do `supabase/seed-demo.sql`; a listagem pagina, busca e filtra sobre a lista fixa;
- a gravação, com o `ApiError` `NOT_IMPLEMENTED` (501), sem gravar nada.

A tela, a aba ou a seção com esses dados mostra o aviso de demonstração (`DemoNotice`). Cada tarefa de lógica tira as suas rotas da lista e o aviso da tela no mesmo PR; a que tirar a última remove `src/lib/demo/`, o `NOT_IMPLEMENTED` e o `DemoNotice`. Detalhes em `docs/padroes/componentes.md` (Telas de demonstração).

## Alternativa descartada

- Rotas da API com o contrato e dados fixos no serviço: o contrato viria primeiro, mas cada tela levaria rota, serviço, tipos e especificação OpenAPI, e a onda de telas tocaria o backend.
- Dados fixos dentro de cada componente: mais rápido no começo, mas contraria "cada componente busca os dados que exibe" (`frontend.md`), e cada tela seria reescrita na tarefa de lógica.
- Telas sem dados, só com o estado vazio e o aviso "em construção": nada a remover depois, mas o professor veria só o esqueleto.
- Mock Service Worker: intercepta a rede sem mudar o cliente, mas é uma dependência nova e um service worker em `public/`.

## Justificativa

O professor vê todas as telas cedo, com dados e com os estados de carregamento, vazio e falha; a tarefa de lógica não reescreve a tela, só constrói a rota e tira a entrada da lista; e a onda de telas não toca backend, banco nem OpenAPI, então as telas andam em paralelo. O cliente da API continua testado sem rede (decisão 0052), agora também com a lista de demonstração simulada.

Consequências aceitas: código temporário no cliente da API, removido rota a rota; os dados fictícios no código do navegador, carregados só quando a tela os pede; os tipos de `src/shared/api/` podem mudar quando a rota chegar; e o que não for ligado até a AV3 continua com o aviso, de forma explícita.
