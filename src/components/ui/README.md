# `src/components/ui/` – Componentes base do shadcn/ui

Botão, campo, seleção, diálogo, tabela, abas, etiqueta, calendário, aviso no formulário (alert) e, quando uma tela precisar, aviso flutuante (toast), e os componentes de campo (`Field`), usados com o `Controller` do React Hook Form. São gerados pela CLI sobre Base UI: `npx -y shadcn@<versão> add <componente>` (decisão 0049). A CLI grava os pacotes em `dependencies` com `^`: fixar a versão e deixar em `devDependencies` os que só servem ao CSS (`shadcn`, `tw-animate-css`). Textos em inglês dos componentes gerados são traduzidos.

## Vai aqui

- componentes gerados pelo shadcn, com as variantes ajustadas ao tratamento de `docs/padroes/design.md` (sombras, estados e raios); uma atualização pela CLI sobrescreve os ajustes, que precisam ser refeitos

## Não vai aqui

- componentes de negócio (→ `shared/`, `portal/` ou `admin/`)
- lógica, chamadas à API ou textos do sistema
- cores fixas: o visual vem das variáveis do tema em `src/app/globals.css`

## Referências

- `docs/padroes/frontend.md`
- `docs/decisoes/0007-tailwind-e-shadcn.md`
