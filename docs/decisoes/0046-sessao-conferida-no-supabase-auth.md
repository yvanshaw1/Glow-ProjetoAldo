---
id: 0046
titulo: Sessão conferida no Supabase Auth a cada requisição
status: aceita
data: 2026-10-19
origem: issue #23, memoria/tarefas/23-sessao-e-login/01_plano.md (Decisões técnicas)
relacionados: [RS001, RS007, RS011, 0005]
---

# 0046 – Sessão conferida no Supabase Auth a cada requisição

## Decisão

O `requireUser` confere a sessão com `getUser()`, que consulta o Supabase Auth a cada requisição e renova o token de acesso vencido. Sem sessão válida, a rota responde 401 `UNAUTHENTICATED`.

## Alternativa descartada

`getClaims()`, que confere só a assinatura e a validade do token, sem consultar o Supabase Auth; `getSession()`, que só lê o cookie, sem conferir nada.

## Justificativa

O RS007 pede a sessão invalidada no logout. Com `getUser()`, o token de uma sessão encerrada (logout, revogação, conta removida) deixa de valer na requisição seguinte; com `getClaims()`, valeria até expirar, por até 1 hora. O custo é uma chamada ao Supabase Auth por requisição, somada às duas consultas do perfil que o RS011 já exige, aceitável no tráfego do MVP. O `proxy.ts` (#26) só organiza a navegação e pode usar outro método, porque quem decide o acesso é a API.
