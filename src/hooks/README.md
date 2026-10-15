# `src/hooks/` – Hooks reutilizáveis

Hooks de cliente usados por vários componentes, como a listagem paginada com busca e filtros, a chamada à API com estado de carregamento e o acesso à sessão.

## Vai aqui

- hooks `use-*.ts` usados por dois ou mais componentes

## Não vai aqui

- hook de um componente só (fica no arquivo do componente)
- imports de `src/server/` ou do Supabase
- biblioteca de estado global

## Referências

- `docs/padroes/frontend.md`
