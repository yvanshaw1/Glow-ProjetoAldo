---
titulo: Proteção das páginas
assunto: acesso
origem: Documentação de Arquitetura de Software, seção 3.2 (Quadro 5); issue #26, plano memoria/tarefas/26-telas-de-acesso/01_plano.md (L1 a L4)
relacionados: [RF010, RN001, RN023, RN025, RN026, RN027, RS001, RS004, RS008, RS010, RS011, 0032, 0046, 0051]
---

# Proteção das páginas (`src/proxy.ts`)

No Next.js 16 o arquivo é `src/proxy.ts` (decisão 0032). Ele organiza a navegação; quem decide o acesso aos dados é sempre a API (RS008).

## Como confere

- Roda só nas telas de acesso (`/login`, `/register` e `/set-password`) e nas páginas restritas (`/profile`, `/booking`, `/appointments` e `/admin*`). A página inicial, o catálogo, a API e os arquivos estáticos ficam de fora.
- Confere a sessão no Supabase Auth, renovando os cookies quando preciso, e lê do banco perfil, situação, troca pendente e permissões, como os guards (decisões 0046 e 0051, RS011). A decisão é a função pura `decidePageAccess` (`src/server/auth/page-access.ts`).
- Toda resposta dele leva `Cache-Control: private, no-store`, porque depende da sessão e pode levar cookies renovados.
- Se o Supabase falhar, a página segue sem redirecionamento, e as chamadas dela à API mostram o erro.
- Conta desativada ou sem perfil é tratada como visitante (RN026).
- Depois do login e da troca de senha, a tela recarrega o próprio endereço, e o proxy aplica a tabela abaixo.

## Destino

| Situação | Comportamento |
|---|---|
| Visitante em `/profile`, `/booking`, `/appointments` ou `/admin*` | vai a `/login?next=<página pedida>` (RF010, RN001) |
| Visitante em `/set-password` | vai a `/login` |
| Troca de senha pendente em página restrita | vai a `/set-password?next=<página pedida>` (RS004) |
| Troca de senha pendente em `/login` ou `/register` | vai a `/set-password`, com o `next` recebido |
| Autenticado, sem troca pendente, em `/login`, `/register` ou `/set-password` | vai ao `next`, se o perfil puder abrir a página; senão, à página inicial da área (RN029) |
| Cliente em `/admin*` | vai a `/`, com o aviso de acesso negado (RS010) |
| Funcionário ou admin em página exclusiva de cliente | vai à primeira página permitida, com o aviso |
| Funcionário sem a permissão da página | vai à primeira página permitida, com o aviso (RN025) |

A página `/admin` pede a permissão `dashboard`, e cada `/admin/<página>`, a sua (`autenticacao.md`, Autorização). O admin tem todas (RN027).

## Página inicial de cada área

Cliente: `/`, a página inicial do portal. Funcionário e admin: a primeira página permitida, na ordem de RN025; o admin vai a `/admin`. Funcionário sem nenhuma permissão (cargo inativo): `/`, com o aviso de acesso negado, sempre que pede o painel, inclusive ao entrar.

## Parâmetro `next`

Vale só um caminho interno de página: começa com uma `/` e não com `//` nem `/\`, continua no próprio site quando lido como endereço e não fica em `/api`, em `/_next` nem nas telas `/login`, `/register` e `/set-password`. Com outro valor, o parâmetro é ignorado.

A pessoa autenticada vai ao `next` se o perfil puder abrir a página (página pública, do cliente para o cliente, do painel com a permissão); senão, à página inicial da área, com o aviso de acesso negado. O `next` acompanha os atalhos entre o login e o cadastro, o fim do cadastro e a troca de senha pendente.

## Aviso de acesso negado

Quando leva a pessoa a outra página por falta de permissão (cliente no painel, funcionário em página do cliente ou sem a permissão da página, funcionário sem nenhuma permissão), o proxy acrescenta `denied=1` ao destino. Os layouts do portal e do painel mostram então, no topo do conteúdo, o aviso "Você não tem permissão para acessar essa página."; o parâmetro sai do endereço, e o aviso some na navegação seguinte (UC08 FE03, RS008). O visitante vai ao login sem aviso.
