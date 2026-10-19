---
titulo: Dados – Acesso
assunto: acesso
origem: Documentação de Arquitetura de Software, seção 5.2 (Quadro 28); issue #23 (decisão 0047)
tabelas: [login_attempts]
relacionados: [RS005, RS006, 0016, 0042, 0047]
---

# Dados: Acesso

Salvo indicação, as colunas são obrigatórias e toda tabela tem `created_at`. Os perfis das contas ficam em `clients` e `staff` ([../clientes/dados.md](../clientes/dados.md), [../equipe/dados.md](../equipe/dados.md)). Convenções gerais (tipos, nomes de restrições, RLS, migrations): [../padroes/banco.md](../padroes/banco.md).

## Tabelas

### `login_attempts`

Tentativas de login por e-mail (RS006, decisão 0016).

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `email` | `text` | PK; em minúsculas | E-mail informado na tentativa. |
| `failed_count` | `integer` | Padrão: 0 | Tentativas seguidas sem login certo, contadas ao começar cada tentativa; a linha é apagada no login certo. |
| `locked_until` | `timestamptz` | Opcional | Fim do bloqueio temporário. |
| `updated_at` | `timestamptz` |  | Data da última tentativa. |

## Bloqueio

5 falhas seguidas para o mesmo e-mail, exista a conta ou não, bloqueiam o login por 15 minutos, contados da quinta tentativa (RS006). Durante o bloqueio, a resposta é 429 `ACCOUNT_LOCKED`, com `Retry-After` nos segundos que faltam, sem conferir a senha; essas tentativas não contam nem prolongam o bloqueio. Quando ele acaba, a contagem recomeça do zero. A senha certa zera o contador, mesmo quando a conta não pode entrar (desativada ou sem perfil). Se o Supabase Auth não atende, a tentativa é devolvida (`release_login_attempt`) e a resposta é 503 `SERVICE_UNAVAILABLE`.

O e-mail com formato inválido recebe 400 antes de qualquer contagem. Os valores 5 e 15 ficam em `src/server/auth/login-attempts.ts` e chegam às funções como parâmetros.

## Funções

Chamadas pelo repositório via `rpc`, com a chave de serviço; só o `service_role` tem `execute` (decisão 0042). Contam sem corrida entre requisições simultâneas (decisão 0047):

- `reserve_login_attempt(p_email, p_max_attempts, p_lock_seconds)`: com a linha do e-mail travada, devolve os segundos que faltam do bloqueio, sem contar a tentativa, ou `null` depois de contá-la; a tentativa que chega ao limite começa o bloqueio;
- `release_login_attempt(p_email)`: devolve a tentativa cuja senha não foi conferida, e o bloqueio que ela tenha começado acaba.

## Regras garantidas pelo banco

- o e-mail é gravado em minúsculas e sem espaços (`ck_login_attempts_email`);
- `failed_count` nunca é negativo (`ck_login_attempts_failed_count`).
