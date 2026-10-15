# `src/server/` – Código só do servidor

Sessão, tratamento de requisições, regras, serviços, repositórios e clientes do Supabase. Todo arquivo começa com `import 'server-only'`: se um componente do navegador importar algo daqui, o build falha. É onde está a chave de serviço do Supabase.

## Vai aqui

- `auth/`, `http/`, `rules/`, `services/`, `repositories/` e `supabase/`

## Não vai aqui

- componentes React ou hooks
- código que o navegador precise (→ `src/shared/`)
- chaves escritas no código: tudo vem de variáveis de ambiente (RS016)

## Referências

- `docs/padroes/backend.md`
- `docs/plataforma/estrutura-de-pastas.md` (Regras de dependência)
