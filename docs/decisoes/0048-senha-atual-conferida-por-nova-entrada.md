---
id: 0048
titulo: Senha atual conferida por nova entrada no Supabase Auth, que renova a sessão do navegador
status: aceita
data: 2026-10-19
origem: issue #24, memoria/tarefas/24-cadastro-e-senha/01_plano.md (Decisões técnicas)
relacionados: [RN023, RS002, RS004, RS006, RS007, 0044, 0046, 0047]
---

# 0048 – Senha atual conferida por nova entrada no Supabase Auth, que renova a sessão do navegador

## Decisão

A troca de senha confere a senha atual com uma nova entrada no Supabase Auth (`signInWithPassword`) pelo cliente de sessão. A entrada troca a sessão do navegador por uma nova, e a nova senha é gravada por essa sessão (`updateUser`); o Supabase Auth então encerra as outras sessões da conta. A conferência usa o mesmo `signIn` e o mesmo contador de tentativas do login (`docs/acesso/dados.md`).

## Alternativa descartada

- Função SQL que compara a senha com `auth.users.encrypted_password` por `crypt()`.
- Exigência de senha atual do próprio Supabase Auth (`current_password`).
- Entrada num cliente à parte, sem cookies, e gravação pela sessão antiga.
- Gravação pela chave de serviço (`auth.admin.updateUserById`).

## Justificativa

A senha não passa pelo banco nem pelos registros dele (RS002, RS018). A função SQL dependeria das tabelas internas do Supabase Auth e de uma migration. A exigência de senha atual é configuração do servidor do Supabase Auth, ausente do `supabase/config.toml`, e precisaria do painel (decisão 0044). O cliente à parte deixaria uma sessão a mais para encerrar em cada caminho de falha, e a sessão antiga pode ter mais de 24 horas, idade que o Supabase Auth recusa para trocar a senha quando "secure password change" está ligado. A chave de serviço encerra todas as sessões, inclusive a do navegador, e o primeiro acesso exigiria dois logins seguidos.

Consequências aceitas: cada troca gasta uma das 30 entradas a cada 5 minutos por IP do Supabase Auth, as mesmas do login. A sessão do navegador é renovada, o que também descarta uma cópia dela feita antes da troca (decisão 0046).
