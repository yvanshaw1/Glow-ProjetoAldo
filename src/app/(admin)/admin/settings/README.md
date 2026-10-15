# `/admin/settings` – Configurações: empresa, disponibilidade e formas de pagamento

Acesso: Permissão `settings`. A proteção da página fica em `src/proxy.ts`; quem decide o acesso aos dados é a API.

## Vai aqui

- `page.tsx`: componente de servidor que monta a tela com os componentes de `src/components/admin/settings/`; as partes com dados e interação são componentes de cliente
- `loading.tsx` e `error.tsx`, se a tela precisar de estados próprios de carregamento e erro

## Não vai aqui

- componentes (→ `src/components/admin/settings/`)
- chamadas ao Supabase ou imports de `src/server/`: os dados vêm da API, via `src/lib/api-client.ts`
- regras de negócio ou validação própria (os esquemas são os de `src/shared/validation/`)
- textos fixos fora do padrão: interface em português, valores e datas por `src/shared/format/`

## Referências

- `docs/configuracoes/UC22-configurar-dados-da-empresa.md`
- `docs/configuracoes/UC23-configurar-disponibilidade.md`
- `docs/configuracoes/UC24-configurar-formas-de-pagamento.md`
- `docs/configuracoes/rotas.md`
- `docs/padroes/frontend.md`
