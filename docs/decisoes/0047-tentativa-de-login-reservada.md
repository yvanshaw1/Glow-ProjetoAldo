---
id: 0047
titulo: Tentativa de login reservada por função SQL antes de conferir a senha
status: aceita
data: 2026-10-19
origem: issue #23, memoria/tarefas/23-sessao-e-login/01_plano.md (Decisões técnicas)
relacionados: [RS005, RS006, 0016, 0042]
---

# 0047 – Tentativa de login reservada por função SQL antes de conferir a senha

## Decisão

Cada tentativa de login é reservada antes de conferir a senha, pela função SQL `reserve_login_attempt`, que confere o bloqueio e conta a tentativa com a linha do e-mail travada. A senha certa apaga a linha, e a falha do Supabase Auth devolve a tentativa (`release_login_attempt`). O limite e a duração chegam como parâmetros, das constantes do servidor (`src/server/auth/login-attempts.ts`). Regras do bloqueio: `docs/acesso/dados.md`.

## Alternativa descartada

Ler e gravar o contador pelo `supabase-js`: duas requisições simultâneas leem o mesmo valor, e uma falha se perde. Contar só depois da falha, numa função SQL: não perde contagem, mas uma rajada de requisições simultâneas passa pela conferência antes de qualquer falha ser contada e confere mais de 5 senhas.

## Justificativa

Com a reserva, a sexta tentativa simultânea já encontra o bloqueio, e nunca são conferidas mais de 5 senhas por bloqueio, como o RS006 pede (decisão 0016). Exige uma migration que só acrescenta duas funções. Elas seguem `docs/padroes/banco.md`: `search_path` vazio, nomes qualificados, `execute` revogado de `public`, `anon` e `authenticated` (decisão 0042) e concedido ao `service_role`. Os valores 5 e 15 ficam em constantes do servidor (`docs/padroes/codigo.md`), não no SQL.
