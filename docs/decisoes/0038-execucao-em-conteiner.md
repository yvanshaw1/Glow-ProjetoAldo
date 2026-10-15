---
id: 0038
titulo: Docker para executar a aplicação em contêiner
status: aceita
data: 2026-10-15
origem: issue #6, plano memoria/tarefas/6-execucao-em-conteiner/01_plano.md
relacionados: [RNF015, RS016, 0023, 0030]
---

# 0038 – Docker para executar a aplicação em contêiner

## Decisão

A aplicação também é executada num contêiner Docker, para rodar da mesma forma em qualquer máquina com o Docker. O `Dockerfile` constrói a imagem em três estágios, a partir da imagem oficial do Node.js 24, com a saída standalone do Next.js, e a imagem final só tem o servidor compilado, executado por um usuário sem privilégios de administrador. O `.dockerignore` deixa os arquivos `.env*` fora da imagem, e o `compose.yaml` publica a aplicação em `http://localhost:3000` com as variáveis do `.env.local` lidas na execução. O contêiner não hospeda nada: a pré-visualização e a produção continuam na Vercel, o banco continua no Supabase, a imagem não é publicada em registro e o CI não a constrói. O desenvolvimento continua com `npm run dev`.

## Alternativa descartada

Execução apenas com o Node.js instalado em cada máquina. Também não se adotam a hospedagem em contêiner, já descartada na decisão 0030, nem a construção da imagem no CI.

## Justificativa

Exigência da disciplina: o contêiner garante o mesmo comportamento em qualquer máquina, independentemente do sistema operacional e da versão do Node.js instalada. Não substitui a decisão 0030, cuja alternativa descartada, "contêineres", é a hospedagem em contêineres, que continua descartada. Consequências aceitas: o `next.config.ts` passa a ter `output: "standalone"`, que na Vercel só acrescenta a pasta `.next/standalone/` ao build e desliga a otimização de estáticos imutáveis entre publicações; a imagem é construída sem variáveis de ambiente, então o código as lê na execução; e, como o CI não constrói a imagem, um erro no `Dockerfile` só aparece quando alguém executa o `docker compose up --build`.
