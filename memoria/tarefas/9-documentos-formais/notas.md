# Notas: 9-documentos-formais

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-18 – decisão

O desenvolvedor escolheu manter o Docker como está (só executa a aplicação compilada; o desenvolvimento usa o Node.js 24 local) e versionar os .docx no repositório, porque a disciplina exige a documentação no projeto; a IA continua lendo só `docs/`.

## 2026-10-18 – descoberta

Teste do contêiner na `main` (`2f5beee`), com o Docker Desktop 29.8.2: `docker compose up --build -d` subiu em 16 s com cache; `http://localhost:3000` respondeu 200 com o título "Glow – Estética Automotiva"; processo com o uid 1000 (`node`); imagem de 411 MB sem `.env*`, `.git` nem a pasta dos .docx.

## 2026-10-18 – desvio

O Igor saiu do questionário, dos registros da #2 e da capa dos três .docx antes da aprovação do plano, por pedido explícito do desenvolvedor na conversa (correção trivial, sem regra nem código). Os .docx foram salvos pelo Word; as cópias anteriores ficaram fora do repositório.
