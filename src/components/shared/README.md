# `src/components/shared/` – Componentes das duas interfaces

Componentes usados pelo portal e pelo painel: formulário em etapas, etiqueta de status do agendamento, diálogo de confirmação, listagem com busca e filtros, estado vazio, campo de valor monetário, os campos e o aviso dos formulários, o campo de senha, o botão de envio e o provedor da sessão (contexto React carregado de `GET /api/auth/me`).

## Vai aqui

- componente usado nas duas interfaces ou em vários módulos

## Não vai aqui

- componente usado em uma interface só (→ `portal/` ou `admin/`) ou em um módulo só
- componentes base do shadcn (→ `ui/`)
- estado global além da sessão

## Referências

- `docs/padroes/frontend.md`
- `docs/plataforma/requisitos.md` (RNF002 a RNF004, usabilidade)
