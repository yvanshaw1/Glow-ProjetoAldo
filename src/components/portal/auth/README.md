# `src/components/portal/auth/` – Portal: auth

Formulários de cadastro, login único e troca de senha no primeiro acesso.

## Vai aqui

- componentes `.tsx` deste módulo nesta interface, em `kebab-case` (ex.: `auth-form.tsx`)
- formulários com React Hook Form e os esquemas de `src/shared/validation/`
- `next-param.ts`: leitura e repasse do parâmetro `next` entre as telas, conferido só pelo `src/proxy.ts`

## Não vai aqui

- componente usado por outro módulo ou pela outra interface (→ `src/components/shared/`)
- chamada ao Supabase ou import de `src/server/` (dados pela API)
- cálculo de regra de negócio (preço, previsão, transição de status): a API calcula

## Referências

- `docs/acesso/UC02-cadastrar-se-como-cliente.md`
- `docs/acesso/UC03-autenticar-se-no-portal.md`
- `docs/acesso/UC08-autenticar-se-no-painel-administrativo.md`
- `docs/acesso/rotas.md`
- `docs/padroes/frontend.md`
