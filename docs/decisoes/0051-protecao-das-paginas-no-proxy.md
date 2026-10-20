---
id: 0051
titulo: Proteção das páginas com a sessão e a conta conferidas no proxy.ts, que também decide o destino depois do login
status: aceita
data: 2026-10-20
origem: issue #26, memoria/tarefas/26-telas-de-acesso/01_plano.md (Decisões técnicas)
relacionados: [RF010, RN025, RS001, RS004, RS010, RS011, 0005, 0032, 0046]
---

# 0051 – Proteção das páginas com a sessão e a conta conferidas no proxy.ts, que também decide o destino depois do login

## Decisão

O `src/proxy.ts` confere a sessão e a conta como os guards: `getSessionUserId()`, com o `getUser()` da decisão 0046, e `loadAccount`, que lê perfil, situação, troca pendente e permissões do banco (RS011). Ele roda só nas telas de acesso e nas páginas restritas (`matcher`), e a decisão fica na função pura `decidePageAccess` (`src/server/auth/page-access.ts`).

Toda resposta dele leva `Cache-Control: private, no-store`. Se o Supabase falhar, a página segue sem redirecionamento. Depois do login e da troca de senha, a tela recarrega o próprio endereço, e o proxy leva ao destino.

## Alternativa descartada

- Conferência "otimista", só com o token (`getClaims()`) ou a presença do cookie, como o guia de autenticação do Next.js 16.4 sugere para o proxy.
- Chamar `GET /api/auth/me` do proxy por `fetch`.
- `matcher` em todas as páginas, como no exemplo do `@supabase/ssr`.
- Bloquear a página (503) quando o Supabase falha.
- Calcular o destino depois do login no navegador, com uma função em `src/shared`.

## Justificativa

Perfil, permissões e troca pendente estão no banco, não no token (0005, RS011), então o proxy precisa ler a conta de qualquer jeito. Com o `getClaims()`, uma sessão encerrada passaria pelo proxy até o token vencer, mas a API a recusaria (0046): o `api-client` levaria a `/login`, e o proxy, vendo a sessão, devolveria à área, num ciclo. Conferir como os guards mantém os dois lados de acordo.

O `fetch` ao `me` seria uma volta a mais pela rede, e os cookies renovados por ele teriam de ser copiados para a resposta. Com o `matcher` em todas as páginas, a página inicial e o catálogo esperariam o Supabase sem nada a decidir (RNF006); o token também é renovado pela API. Bloquear a página tiraria o login do ar, e a API já protege os dados. O destino calculado no navegador poria a regra em dois lugares.

No Next.js 16.4.1, o `cookies()` de `next/headers` grava o `Set-Cookie` na resposta do proxy, também no redirecionamento, e o `Cache-Control` do proxy vale sobre a página estática; o código de `src/server`, com `import 'server-only'`, roda no proxy.

Consequências aceitas: cada página protegida, e cada pré-busca dos links para ela, custa uma chamada ao Supabase Auth e duas consultas; o destino depois do login passa por mais um redirecionamento 307.
