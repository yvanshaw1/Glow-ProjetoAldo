---
titulo: Layouts do portal e do painel
origem: issue #25, plano memoria/tarefas/25-base-do-frontend/01_plano.md (L7 a L9)
relacionados: [RF005, RF036, RN025, RN027, RN028, RS008, UC01, UC03, UC08]
---

# Layouts do portal e do painel

Parte de [frontend.md](frontend.md). Estilo: [design.md](design.md).

A navegação só orienta: quem decide o acesso é a API (RS008). Os dois layouts mostram no topo do conteúdo o aviso de acesso negado, quando o `proxy.ts` leva a pessoa até ali ([../acesso/protecao-das-paginas.md](../acesso/protecao-das-paginas.md)). Enquanto a sessão carrega, as ações ficam reservadas, sem deslocar a página.

Portal (`src/app/(portal)/layout.tsx`, também em `/login`, `/register` e `/set-password`, RF005):

| Quem | Links | Ações |
|---|---|---|
| Visitante | Início (`/`), Serviços (`/services`) | Entrar (`/login`), Criar conta (`/register`, botão principal) |
| Cliente | Início, Serviços, Agendar (`/booking`), Meus agendamentos (`/appointments`), Minha conta (`/profile`) | Sair, que leva a `/` (UC03 FA05) |
| Funcionário ou admin | Início, Serviços, Painel (a primeira página permitida; sem o link se não houver nenhuma) | Sair, que leva a `/` |

- A partir de 768 px, os links ficam na barra; abaixo, num menu à direita, aberto pelo botão "Abrir menu".
- Rodapé: a marca; "Contato", com o endereço, o telefone (link `tel:`) e o e-mail (link `mailto:`); "Redes sociais", com os links de texto Instagram, Facebook e WhatsApp (`https://wa.me/55` e o número); e "Acesso rápido" (Serviços e Agendar). Abaixo, "© <ano> <nome da empresa>. Todos os direitos reservados.", com o ano no fuso da empresa. Os dados vêm de `GET /api/public/company` (RN028); o dado vazio não aparece, nem o bloco sem nenhum dado. Os links abrem na mesma aba.
- Enquanto os dados da empresa carregam, as linhas de contato e do aviso de direitos ficam reservadas. Na falha, o aviso com a mensagem e "Tentar novamente" fica no lugar de "Contato" e "Redes sociais", e o aviso de direitos não aparece (UC01 FE02).

Painel (`src/app/(admin)/admin/layout.tsx`):

- A partir de 1024 px, a navegação fica numa barra fixa à esquerda; abaixo, num menu lateral à esquerda, aberto pelo botão "Abrir menu" (wireframe `staffPages/headerMobile/`).
- Os links são os de `permissions` do `me`, na ordem de RN025, com os nomes de `PERMISSION_LABELS`; o funcionário sem permissão vê só o bloco do usuário.
- No pé, o nome, o perfil ("Funcionário" ou "Administrador") e "Sair", que leva a `/login` (UC08 FA03).
- Se a sessão não carregar, o painel mostra o aviso com "Tentar novamente".

Páginas de erro, fora dos dois layouts: `not-found.tsx` ("Página não encontrada") e `error.tsx` ("Algo deu errado", com "Tentar novamente"), sem a mensagem interna do erro.
