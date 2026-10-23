---
id: 0056
titulo: Gráficos do dashboard com o Recharts, carregado sob demanda
status: aceita
data: 2026-10-23
origem: issue #60, plano memoria/tarefas/60-telas-do-dashboard/01_plano.md (D1)
relacionados: [RF041, RF042, RNF005, RNF006, 0041, 0049, 0055]
---

# 0056 – Gráficos do dashboard com o Recharts, carregado sob demanda

<!-- status: "aceita" ao gravar; quando outra decisão a substituir, a única alteração permitida neste arquivo é status: substituída por NNNN. Passo a passo: workflows/procedimentos/decisao.md -->

## Decisão

Os gráficos do dashboard (a receita por dia e os agendamentos por status) usam o Recharts 3.10, em versão exata (3.10.1), com o `react-is` 19 como dependência direta, o par dele com o React 19. O desenho fica num só módulo de cliente (`src/components/admin/dashboard/dashboard-charts.tsx`), o único que importa o Recharts, carregado por `next/dynamic` com `ssr: false` depois da página, quando a primeira resposta do dashboard chega; o lugar do gráfico fica reservado enquanto o código carrega. Não se usa o componente `chart` do shadcn/ui. As cores são as variáveis do tema (`docs/padroes/design.md`, Gráficos), e cada gráfico tem uma tabela equivalente, visualmente oculta, para o leitor de tela, com o desenho em `aria-hidden` e sem a camada de acessibilidade da biblioteca.

## Alternativa descartada

- Gráficos em SVG escrito à mão, sem dependência: sem peso nem dependência nova, mas eixos, escalas e dicas ficariam por conta do projeto, e a stack documentada já lista o Recharts.
- O componente `chart` do shadcn/ui, sobre o Recharts: a mesma dependência, com uma camada de configuração de cores a mais e a CLI do shadcn, que trava na pergunta de sobrescrita e sobrescreve os ajustes.
- Chart.js (desenha em canvas, que as variáveis CSS do tema não pintam e que a verificação do desenho não alcança), ECharts, Nivo e Victory (mais pesados ou com mais API para dois gráficos de barras).

## Justificativa

O Recharts já está na stack documentada (`docs/plataforma/visao-geral.md`) e na regra de Desempenho (`docs/padroes/frontend.md`); são componentes React que desenham SVG, e o SVG segue o tema claro e escuro pelas variáveis do CSS. Só `/admin` paga o peso, e só depois da página (RNF006): o código dos gráficos está num chunk de 360 KB, cerca de 100 KB comprimidos (102.572 bytes com gzip), que o navegador pede depois do evento de carga e do LCP (medido no Lighthouse do celular: carga aos 162 ms, LCP aos 233 ms e o pedido do chunk aos 601 ms, sem a limitação de rede), e o HTML de `/admin` não o referencia. O desenho não é lido nem focável, e a tabela de cada gráfico dá ao leitor de tela os mesmos dados, o que atende a RNF005.

Consequências aceitas:

- dependências indiretas (`react-redux`, `immer`, `reselect`, `es-toolkit` e `victory-vendor`, entre outras) e cerca de 7,4 MB desempacotados em `node_modules`;
- o `react-is` 19 como dependência direta, porque a versão 16 que já estava na árvore, trazida por `prop-types` (do ESLint), não acompanha o React 19 e era a que o npm escolhia para o Recharts;
- o tempo bloqueado do celular no Lighthouse subiu de 50 a 60 ms para 180 ms, e a nota de desempenho, de 95 para 92, com o LCP e o CLS iguais (3,0 s e 0);
- o gráfico não aparece sem JavaScript, e o `Cell` do Recharts, depreciado para a versão 4, não é usado: a cor de cada barra vem do prop `shape`.
