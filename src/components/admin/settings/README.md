# `src/components/admin/settings/` – Painel: settings

Formulários de dados da empresa, disponibilidade por dia (com pausa) e percentuais das formas de pagamento.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `setting-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/configuracoes/UC22-configurar-dados-da-empresa.md`
- `docs/configuracoes/UC23-configurar-disponibilidade.md`
- `docs/configuracoes/UC24-configurar-formas-de-pagamento.md`
- `docs/configuracoes/rotas.md`
- `docs/padroes/frontend.md`
