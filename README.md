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
- `documentos-formais/`: os três documentos formais em Word exigidos pela disciplina. A IA usa os módulos de `docs/` e só abre os `.docx` quando alguém pede.
- `wireframes/`: telas de referência, em PDF, para o esqueleto e os componentes das páginas; o `README.md` da pasta explica o uso.

**Para a equipe:** como pedir tarefas à IA, etapa por etapa, está em [`guia/como-pedir.md`](guia/como-pedir.md).

## Primeiros passos

Pré-requisitos: Git, Node.js 24 (LTS) com o npm e, só para executar em contêiner, o Docker Desktop.

1. Clonar o repositório e entrar na pasta:

   ```
   git clone https://github.com/yvanshaw1/Glow-ProjetoAldo.git
   cd Glow-ProjetoAldo
   ```

2. Instalar as dependências exatamente como no `package-lock.json`: `npm ci`.
3. Copiar `.env.example` para `.env.local` e preencher os valores (`docs/plataforma/infraestrutura.md`, seção "Variáveis de ambiente"). O `.env.local` nunca é versionado nem colado em conversas com IA.
4. Executar com `npm run dev` e abrir `http://localhost:3000`.
5. Antes de abrir um pull request, rodar `npm run check`: formatação, tipos, lint e testes, como no CI.

### Em contêiner

Com o Docker Desktop aberto e o `.env.local` preenchido, `docker compose up --build` constrói a imagem e executa a aplicação compilada em `http://localhost:3000`, da mesma forma em qualquer máquina; encerre com `Ctrl+C`. A porta é a mesma do `npm run dev`: use um de cada vez. O desenvolvimento continua com `npm run dev`, e a publicação, na Vercel. Detalhes em `docs/plataforma/infraestrutura.md`, seção "Execução em contêiner".
