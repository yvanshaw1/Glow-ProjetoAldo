# Glow – Estética Automotiva

Portal público e do cliente e painel administrativo de uma empresa de estética automotiva. MVP da disciplina Sistemas Inteligentes (Sistemas de Informação, CESMAC), desenvolvido com apoio de IA.

Stack: Next.js 16 e React 19 em TypeScript, Tailwind CSS e shadcn/ui, Supabase (PostgreSQL, Auth e Storage), Vitest, publicação na Vercel e execução em contêiner com Docker.

## Como o repositório está organizado

O repositório segue a Interpretable Context Methodology (ICM): a estrutura de pastas orienta os assistentes de IA, que leem só o necessário para cada tarefa.

- `AGENTS.md`: identidade do projeto e ponto de entrada da IA (o `CLAUDE.md` o importa).
- `guia/`: roteamento por tipo de tarefa, mapa do sistema e glossário, regras da IA.
- `workflows/`: ciclo de cada tarefa (planejar, construir, entregar, encerrar) e procedimentos de Git, testes, pull request, migration e publicação.
- `docs/`: requisitos, regras de negócio, casos de uso, dados e rotas por assunto; padrões de código; registros de decisão.
- `memoria/tarefas/`: plano, relatório e notas de cada tarefa.

**Para a equipe:** como pedir tarefas à IA, etapa por etapa, está em [`guia/como-pedir.md`](guia/como-pedir.md).

## Executar

```
npm install
npm run dev
```

Antes, copie `.env.example` para `.env.local` e preencha os valores (`docs/plataforma/infraestrutura.md`). Verificação completa, como no CI: `npm run check`.

Em contêiner, com o Docker Desktop instalado e o `.env.local` preenchido: `docker compose up --build` constrói a imagem e executa a aplicação compilada em `http://localhost:3000`, da mesma forma em qualquer máquina. O dia a dia continua com `npm run dev`, e a publicação, na Vercel. Passo a passo em `docs/plataforma/infraestrutura.md`, seção "Execução em contêiner".
