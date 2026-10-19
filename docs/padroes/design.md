---
titulo: Padrões de design e estilo
origem: issue #25, plano memoria/tarefas/25-base-do-frontend/01_plano.md (L1 a L6)
relacionados: [RNF001, RNF005, RNF006, RNF016, 0007, 0049]
---

# Padrões de design e estilo

Estilo visual do portal e do painel. Engenharia de tela: [frontend.md](frontend.md); cabeçalho, rodapé e navegação: [layouts.md](layouts.md); ícones e imagens: [design-midia.md](design-midia.md).

## Princípios

- Este módulo é a fonte do estilo. Os wireframes de `wireframes/` dão só o esqueleto e os componentes das páginas.
- Neomorfismo suave: o componente tem a cor do fundo, e o relevo vem de uma sombra dupla, com a luz de cima à esquerda.
- Poucas cores fortes: o laranja fica para a ação principal e o destaque.
- Formas simples (retângulo, círculo, pílula), cantos arredondados, bastante espaço e poucos elementos por tela.
- O mesmo tratamento em todos os componentes.
- O baixo contraste do estilo é compensado ativamente (WCAG AA): a sombra dá o relevo, mas nunca é a única pista. O campo tem borda de 3:1, a ação principal tem cor, o item atual tem cor e `aria-current`, e o foco tem contorno.

## Cores e temas

O tema segue a preferência do sistema (`prefers-color-scheme`), sem botão de troca. As cores do claro ficam em `:root`, e as do escuro, na consulta de mídia, em `src/app/globals.css`. A variante `dark:` do Tailwind segue a mesma preferência. Toda tela é conferida nos dois temas.

| Variável | Claro | Escuro | Uso | Contraste (claro / escuro) |
|---|---|---|---|---|
| `--background` | `#F3E6D8` | `#2E2E24` | fundo e superfícies: cartões, menus e botões secundários usam a mesma cor | – |
| `--foreground` | `#2E2318` | `#F2EDE4` | texto principal | 12,5 / 11,8 |
| `--muted-foreground` | `#745F46` | `#A89878` | texto secundário | 4,9 / 4,9 |
| `--primary` | `#FF8C42` | `#FF9A56` | preenchimento do botão principal; nunca texto | – |
| `--primary-foreground` | `#2E2318` | `#2E2E24` | texto do botão principal | 6,6 / 6,5 |
| `--primary-hover` | `#FFB38A` | `#FFB38A` | botão principal sob o cursor | texto: 8,8 / 7,9 |
| `--link` | `#A34A26` | `#FF9A56` | link e destaque em texto | 4,8 / 6,5 |
| `--ring` | `#C55A2E` | `#E87430` | contorno de foco | 3,5 / 4,6 |
| `--input` | `#8A7966` | `#808075` | borda dos campos | 3,4 / 3,4 |
| `--border` | `#C9B49A` | `#3E3E32` | divisórias decorativas | – |
| `--muted` | `#C9B49A` | `#1F1F18` | lugar reservado do carregamento | texto: 7,6 / 14,8 |
| `--accent` | `#FAF3EB` | `#3E3E32` | item de menu sob o cursor | texto: 13,9 / 9,3 |
| `--destructive` | `#A8231C` | `#FF9B8F` | erro | 5,9 / 6,8 |
| `--shadow-dark` | `#C9B49A` | `#1F1F18` | sombra | – |
| `--shadow-light` | `#FAF3EB` | `#3E3E32` | realce | – |

Regras:

- O laranja primário é só preenchimento, com texto escuro; texto em laranja usa `--link`. O branco não é usado sobre laranja.
- Erro nunca é indicado só pela cor (`frontend.md`).
- O fundo nunca é preto nem branco puro, para as sombras aparecerem.
- O contraste é calculado pela fórmula da WCAG, com as transparências misturadas sobre o fundo. Texto: 4,5:1 no mínimo; borda de campo e foco: 3:1. Cor nova entra nesta tabela com o contraste calculado.

## Tipografia

Nunito, pelo `next/font/google` em `src/app/layout.tsx` (variável `--font-sans`), com a pilha de fontes do sistema como reserva.

| Uso | Classe | Tamanho | Altura de linha | Entre letras |
|---|---|---|---|---|
| Destaque | `text-display` | 110 px | 1,2 | -0,03em |
| Título 1 | `text-h1` | 68 px | 1,2 | -0,03em |
| Título 2 | `text-h2` | 42 px | 1,2 | -0,02em |
| Título 3 | `text-h3` | 26 px | 1,2 | -0,02em |
| Texto | `text-base` | 16 px | 1,618 | 0 |
| Rótulo | `text-sm` | 14 px | 1,5 | 0 |
| Legenda, o mínimo | `text-xs` | 12 px | 1,5 | 0 |

- Abaixo de 768 px, cada título usa o tamanho do passo anterior (`text-h2 md:text-h1`); o destaque só a partir de 1280 px.
- Pesos: 300 só no destaque, 400 no texto, 600 em subtítulos e botões, 700 em títulos; no máximo três por tela.
- Botões em caixa normal. Sobretítulo em caixa alta, 12 px, peso 600 e 0,08em entre letras.

## Espaçamento, grade e pontos de quebra

Os valores derivam de φ = 1,618. O espaçamento é arredondado para a grade de 4 px do Tailwind, que os componentes do shadcn/ui usam; raios, sombras e títulos usam os valores exatos, em variáveis do tema.

| Uso | φ | Classe (px) |
|---|---|---|
| Ícone e texto | 4 | `1` (4) |
| Interno do componente | 8 | `2` (8) |
| Botão | 13 | `3` (12) |
| Cartão | 21 | `5` (20) |
| Entre cartões | 34 | `8` (32) |
| Seção | 55 | `14` (56) |
| Destaque e rodapé | 89 | `22` (88) |
| Seção larga | 144 | `36` (144) |

- Margem lateral de 24 px (`px-6`), 32 px a partir de 1024 px (`lg:px-8`).
- Grade: 1 coluna, 2 a partir de 768 px, 3 ou 4 a partir de 1024 px.
- Conteúdo até 1240 px (`max-w-page`). Altura do cabeçalho: `h-header` (64 px); barra do painel: `w-sidebar` (256 px).
- Pontos de quebra do Tailwind: 640, 768, 1024, 1280 e 1536 px.

## Raios, sombras e estados

| Raio | Valor | Uso |
|---|---|---|
| `rounded-lg` | 8 px | botões, campos, etiquetas |
| `rounded-xl` | 13 px | cartões, avisos, menus |
| `rounded-2xl` | 21 px | menu lateral, janelas grandes |
| `rounded-3xl` | 34 px | cartões de destaque |
| `rounded-full` | – | pílulas, avatares, chaves |

Sombras duplas, sempre com a sombra escura em +x +y e o realce em -x -y: `shadow-neu-sm` (4/4/8 px), `shadow-neu-md` (6/6/13 px) e `shadow-neu-lg` (10/10/21 px); rebaixadas: `inset-shadow-neu-sm` (4/4/8 px) e `inset-shadow-neu-md` (6/6/13 px).

| Estado | Tratamento |
|---|---|
| Repouso | a sombra do componente |
| Cursor sobre | `shadow-neu-lg`; o botão principal passa a `--primary-hover` |
| Pressionado | `inset-shadow-neu-md` e `scale(0.98)` |
| Foco | contorno de 2 px em `--ring`, afastado 3 px |
| Desativado | opacidade 0,5, cursor `not-allowed`, `shadow-neu-sm` |
| Carregando | opacidade 0,7, sem cliques, com indicador giratório em `--link` |

## Componentes

| Componente | Tratamento |
|---|---|
| Superfícies (cabeçalho, cartões, avisos, menus, barra do painel) | cor do fundo com `shadow-neu-md` |
| Botão principal | `--primary` com texto escuro, a única cor forte da tela |
| Botões secundários, de ícone e de menu | cor do fundo com `shadow-neu-sm` |
| Campo | rebaixado (`inset-shadow-neu-sm`) com borda de 1 px em `--input` |
| Link de texto | `--link`, sublinhado sob o cursor |
| Item atual da navegação | rebaixado, com o texto em `--link` e `aria-current` |
| Botão só com ícone | `aria-label`; a dica flutuante, quando houver, não substitui o rótulo |

As variantes dos componentes de `src/components/ui/` seguem estas tabelas. Uma atualização deles pela CLI do shadcn sobrescreve os ajustes, que precisam ser refeitos.

## Movimento

- 150 ms em cursor e microinterações (o padrão do Tailwind), 243 ms em cor e 393 ms no menu lateral.
- Curvas padrão do Tailwind: `ease-out` na entrada, `ease-in` na saída e `ease-in-out` no restante.
- A troca de sombra não é animada: a transição fica em `transform` e `opacity`.
- Com `prefers-reduced-motion`, não há movimento (`src/app/reset.css`).
