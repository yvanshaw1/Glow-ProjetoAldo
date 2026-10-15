---
titulo: Visão geral, escopo e stack
assunto: plataforma
origem: Documentação de Análise do Sistema, seções 1 a 5; Documentação de Arquitetura de Software, seção 2
---

# Visão geral, escopo e stack

## Produto

Aplicação web de uma única empresa de estética automotiva, usada pelo navegador, com duas interfaces e um backend em uma só aplicação Next.js:

- **portal público e do cliente**: página inicial institucional, catálogo, cadastro e login; para o cliente, conta, veículos, agendamento e acompanhamento (editar, cancelar, reagendar);
- **painel administrativo**: dashboard, agendamentos (criar, editar, avançar status, concluir com a forma de pagamento, cancelar, reagendar), serviços e categorias, clientes e veículos, funcionários e cargos, configurações.

## Fora do escopo do MVP

Pagamento online (o pagamento é presencial; o sistema só registra a forma e calcula o valor); envio de e-mails (convites, notificações, recuperação de senha); aplicativo nativo; documentos fiscais; estoque; controle de capacidade e de conflito de horários; fidelidade, cupons e promoções; várias empresas ou unidades.

## Premissas

Todo veículo é hatch, sedan, SUV ou picape; pagamento presencial por crédito, débito, Pix ou dinheiro; a empresa mantém catálogo, valores, dados, horários e percentuais atualizados.

## Atores

| Ator | Perfil | Papel |
|---|---|---|
| Visitante | – | vê página inicial, catálogo, login e cadastro; ao se cadastrar vira Cliente |
| Cliente | `client` | mantém conta e veículos, agenda e acompanha os seus agendamentos |
| Funcionário | `staff` | usa o painel conforme as permissões do cargo |
| Administrador | `admin` | equipe de desenvolvimento; acesso irrestrito e oculto nas listagens (RN027) |

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Linguagem | TypeScript | 6.0 |
| Framework | Next.js (App Router) com React | 16.4 e 19.3 |
| Execução | Node.js | 24 LTS |
| Interface | Tailwind CSS e shadcn/ui | 4.3 |
| Gráficos | Recharts | 3.10 |
| Validação | Zod | 4.6 |
| Formulários | React Hook Form | 7.90 |
| Dados | PostgreSQL, Auth e Storage do Supabase, via `supabase-js` e `@supabase/ssr` | gerenciado; 2.117 e 0.12 |
| Qualidade | Vitest, ESLint e Prettier | 5.0, 10 e 3.9 |
| Versionamento e CI | Git, GitHub e GitHub Actions | serviço |
| Hospedagem | Vercel | serviço |

TypeScript fica na 6.0 (e não 7.0) porque as regras de TypeScript do ESLint usadas pelo Next.js ainda não suportam a 7. As versões exatas ficam no `package.json` e no arquivo de travamento; reconfira no npm ao criar o projeto. Sem domínio próprio, Cloudflare, provedor de e-mail, monitoramento externo ou ORM.

## Princípios

- A API é a única porta de entrada dos dados; as páginas não acessam banco nem Supabase (RNF013).
- Regras de negócio na camada de serviços, em funções testáveis; nunca nas páginas.
- Uma base de código e uma linguagem para interface e backend.
- Toda autorização é decidida no servidor; a interface só reflete (RS008).
- Só o necessário para o MVP: serviços gerenciados em plano gratuito, sem infraestrutura adicional.
