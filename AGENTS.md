# Glow – Estética Automotiva

Sistema web de uma empresa de estética automotiva: portal público e do cliente (catálogo, conta, veículos, agendamento e acompanhamento) e painel administrativo (dashboard, agendamentos, serviços, clientes, equipe e configurações). MVP acadêmico, com entrega final na AV3 (início de dezembro de 2026).

Stack: Next.js 16.4 (App Router) e React 19.3 em TypeScript 6.0, Tailwind CSS 4.3 com shadcn/ui, Zod 4.6, React Hook Form 7.90, Supabase (PostgreSQL, Auth e Storage) via supabase-js 2.117 e @supabase/ssr 0.12, Vitest 5, ESLint 9, Prettier 3.9, Node.js 24 LTS e Vercel; Docker 29 e Docker Compose 5 para executar a aplicação em contêiner.

## Antes de qualquer tarefa

Leia `guia/CONTEXT.md` e siga a rota do tipo de tarefa. Carregue só o que a rota, o contrato da etapa e o plano indicam; nunca pastas inteiras.

## Mapa

| Pasta | Conteúdo |
|---|---|
| `guia/` | roteamento (`CONTEXT.md`), o sistema em uma tela e o glossário (`mapa.md`), limites da IA (`regras.md`) |
| `workflows/` | ciclo da tarefa: `01_planejar` → `02_construir` → `03_entregar` → `04_encerrar`, e `procedimentos/` |
| `docs/` | referências por assunto (requisitos, regras `RNxxx`, casos de uso `UCxx`, dados e rotas), `padroes/` e `decisoes/` |
| `documentos-formais/` | os três documentos formais em Word (`.docx`), exigidos pela disciplina; a IA usa `docs/` e só abre os `.docx` quando o desenvolvedor pede para lê-los ou alterá-los |
| `memoria/tarefas/` | plano, relatório e notas de cada tarefa |
| `_templates/` | moldes de plano, relatório, notas, módulo e decisão |
| `setup/` · `tools/` | questionário da estrutura · scripts mecânicos, sem IA |
| `src/` · `supabase/` · `tests/` | código da aplicação · migration e dados iniciais · testes |

## Comandos

```
npm run dev                 executa a aplicação em http://localhost:3000
npm run check               formatação, tipos, lint e testes (o mesmo que o CI)
npm test                    testes com o Vitest
docker compose up --build   executa a aplicação compilada em contêiner, no mesmo endereço
```

## Áreas

Frontend, Backend e API, Banco de dados, Testes e QA, CI/CD e fluxo Git. Não há responsável por área: cada integrante leva uma tarefa de ponta a ponta, por todas as áreas que ela toca, e outro integrante aprova o pull request (decisão 0039). Integrantes, usuários do GitHub e quem aplica as migrations: `setup/questionario.md`.

## Regras inegociáveis (detalhes em `guia/regras.md`)

- Não construir sem plano com status `aprovado`; nunca alterar o status de aprovação de um plano.
- Nunca ler arquivos `.env*`, exceto o `.env.example`, que tem só os nomes das variáveis, nem escrever segredos em código, testes, documentos ou registros.
- Toda regra de negócio e toda decisão de acesso ficam no servidor; o que vem do navegador nunca é confiável.
- Código, nomes, rotas, tabelas e commits em inglês; textos da interface e documentação em português do Brasil.
- Nunca enviar código direto à `main`, forçar envio, incorporar pull request, aplicar migration ou publicar.
- O que a documentação não define é perguntado, com a proposta de texto e de onde documentar; nunca inventar regra, valor ou texto de requisito.
