# `src/server/supabase/` – Clientes do Supabase

Criação dos clientes do Supabase usados no servidor: com a chave de serviço, para dados e criação de contas; com `@supabase/ssr`, para a sessão em cookies; e o envio de imagens ao bucket `service-images` do Storage.

## Vai aqui

- fábricas dos clientes e o envio ao Storage

## Não vai aqui

- chaves no código: vêm de `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`
- consultas de negócio (→ `repositories/`)
- qualquer uso fora de `src/server/`

## Referências

- `docs/plataforma/infraestrutura.md` (Variáveis de ambiente)
- `docs/padroes/banco.md` (Acesso)
