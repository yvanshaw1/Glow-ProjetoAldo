---
titulo: Padrões de frontend
origem: Documentação de Arquitetura de Software, seção 3
relacionados: [RNF001, RNF002, RNF003, RNF004, RNF005, RNF006, RNF009, RNF016, RN035]
---

# Padrões de frontend

React no App Router do Next.js 16, Tailwind CSS 4 e shadcn/ui. Telas e rotas de cada assunto: `docs/<assunto>/rotas.md`.

## Estrutura

```
src/app/(portal)/            páginas do portal: page.tsx (/), services/, register/, login/, set-password/, profile/, booking/, appointments/
src/app/(admin)/admin/       páginas do painel: page.tsx (dashboard), appointments/, services/, clients/, staff/, settings/
src/app/                     layout.tsx, globals.css (tema), not-found.tsx, error.tsx
src/components/ui/           gerados pelo shadcn/ui; negócio nunca fica aqui
src/components/shared/       formulário em etapas, etiqueta de status, diálogo de confirmação, listagem com busca e filtros, estado vazio, campo monetário
src/components/portal/<mód>/ ex.: layout/ (cabeçalho, rodapé), catalog/ (cartão de serviço), vehicles/ (formulário), appointments/ (assistente de agendamento, também na edição)
src/components/admin/<mód>/  ex.: layout/ (navegação por permissões), dashboard/ (indicadores, gráficos, agenda do dia), appointments/ (filtros, resumo de conclusão)
src/hooks/                   listagem paginada, chamada à API com carregamento
src/lib/                     api-client.ts (cliente HTTP único), utils.ts (cn do shadcn)
public/                      logo, favicon, imagem da página inicial
```

Os grupos `(portal)` e `(admin)` não aparecem no endereço; cada um tem o seu `layout.tsx`. Os nomes de módulo nas subpastas de componentes são os do backend (`catalog`, `clients`, `vehicles`, `appointments`, `dashboard`, `staff`, `roles`, `settings`), mais `layout`. As páginas só compõem componentes; regras de negócio ficam no backend. Componente de cliente nunca importa de `src/server/`. Árvore completa: `docs/plataforma/estrutura-de-pastas.md`.

Antes de construir uma página, abrir o wireframe dela em `wireframes/` (mapa no `README.md` da pasta). Ele orienta o esqueleto e os componentes; o conteúdo vem do caso de uso, e as cores, do tema.

## Renderização

Estrutura, layouts e textos fixos são componentes de servidor. As partes que exibem ou alteram dados são componentes de cliente que buscam pela API. Só o componente que precisa de interação ou estado leva `'use client'`, nunca a página inteira. Páginas não acessam Supabase nem banco, nem pelo servidor (RNF013).

## Comunicação com a API (`src/lib/api-client.ts`)

- Mesmo domínio, sob `/api`, JSON; a sessão vai no cookie, e a página nunca manipula token.
- Erros chegam em Problem Details (`docs/padroes/api.md`): `detail` vira o aviso, `fields` vira a mensagem junto a cada campo (RNF003).
- 401 → `/login`; 403 `PASSWORD_CHANGE_REQUIRED` → `/set-password`; 409 `VERSION_CONFLICT` → avisa e recarrega o registro.
- Durante a chamada: estado de carregamento e botão de envio desativado; ao final, aviso de sucesso ou falha (RNF004). Requisição de gravação nunca é repetida automaticamente.

## Estado e formulários

- Estado no componente que o usa; sem biblioteca de estado global. Único estado compartilhado: a sessão (perfil e permissões), num contexto React carregado de `GET /api/auth/me` e trocado só no login e no logout.
- Cada componente busca os dados que exibe, sem repassar propriedades por muitos níveis.
- Formulários com React Hook Form e os esquemas Zod de `src/shared/validation`, pelos componentes de formulário do shadcn/ui; validação campo a campo; máscaras de telefone, CNPJ, placa e valores; exibição com `src/shared/format` (RN035). A validação da página orienta; a que vale é a do servidor.
- Formulários extensos em etapas, com indicação da etapa e volta sem perder dados (RNF002).

## Textos e formatos

Interface em português do Brasil, valores em `R$ 1.250,00` e datas `dd/mm/aaaa` (RNF016), formatados com `Intl` em `src/shared/format`, sem biblioteca de datas. Mensagens claras, junto ao elemento (RNF003).

## Desempenho (RNF006)

Metas Core Web Vitals nas páginas públicas e telas principais, medidas com o Lighthouse na pré-visualização: LCP até 2,5 s, INP até 200 ms, CLS até 0,1.

- Componentes pesados de uma tela só, como os gráficos do dashboard (Recharts), carregados sob demanda (`next/dynamic`).
- Imagens dos serviços com o componente de imagem do Next.js (formatos modernos, tamanhos por tela, carregamento adiado).
- Toda dependência nova é avaliada também pelo peso no carregamento.

## Responsividade, acessibilidade e tema

- Construir a partir da menor tela, com os pontos de quebra do Tailwind (RNF001); Chrome, Edge, Firefox e Safari atuais (RNF009).
- Elemento HTML certo para cada função (`button` para ação, `a` para navegação, `nav`, `main`, títulos em ordem); todo campo com rótulo; erro vinculado ao campo; tudo acessível pelo teclado; foco visível (RNF005).
- Contraste mínimo de 4,5:1 e nenhuma informação só por cor (o status também é escrito). Conferir com a auditoria de acessibilidade do Lighthouse.
- Cores, fontes e espaçamentos definidos uma vez como variáveis do tema do Tailwind 4 (`@theme` em `src/app/globals.css`); componentes usam só essas variáveis.
