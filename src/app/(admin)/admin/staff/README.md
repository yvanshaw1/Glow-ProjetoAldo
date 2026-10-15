# `/admin/staff` – Funcionários e cargos

Acesso: Permissão `staff`. A proteção da página fica em `src/proxy.ts`; quem decide o acesso aos dados é a API.

## Vai aqui

- `page.tsx`: componente de servidor que monta a tela com os componentes de `src/components/admin/staff/` e `src/components/admin/roles/`; as partes com dados e interação são componentes de cliente
- `loading.tsx` e `error.tsx`, se a tela precisar de estados próprios de carregamento e erro

## Não vai aqui

- componentes (→ `src/components/admin/staff/` e `src/components/admin/roles/`)
- chamadas ao Supabase ou imports de `src/server/`: os dados vêm da API, via `src/lib/api-client.ts`
- regras de negócio ou validação própria (os esquemas são os de `src/shared/validation/`)
- textos fixos fora do padrão: interface em português, valores e datas por `src/shared/format/`

## Referências

- `docs/equipe/UC19-cadastrar-funcionario.md`
- `docs/equipe/UC20-manter-funcionarios.md`
- `docs/equipe/UC21-gerenciar-cargos-e-permissoes.md`
- `docs/equipe/rotas.md`
- `docs/padroes/frontend.md`
