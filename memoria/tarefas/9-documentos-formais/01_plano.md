---
issue: 9
titulo: "Documentos formais no repositório, guia de instalação e .docx atualizados"
areas: [cicd]
tipo: documentacao
requisitos: [RS016]
status: em_execucao
aprovado_por: yvan
aprovado_em: 18/10/2026 12:24
---

# Plano: Documentos formais no repositório, guia de instalação e .docx atualizados

## Objetivo

Versionar os três documentos formais (.docx) em `documentos-formais/`, porque a disciplina exige a documentação dentro do projeto. A IA continua lendo os módulos de `docs/` e só abre os .docx quando o desenvolvedor pede para lê-los ou alterá-los. Atualizar os .docx para o estado do ICM depois das issues #1, #2 e #6, completar o guia de instalação do README e retirar o Igor, que não faz parte da equipe. O Docker fica como está (decisão 0038): o teste de 18/10/2026 confirmou build, página inicial, usuário `node` e imagem sem `.env*`.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um clone limpo, quando abro `documentos-formais/`, então os três .docx estão lá e abrem no Word sem reparo | `git ls-files documentos-formais`; abertura no Word por automação |
| Dado os .docx, quando procuro os itens dos relatórios das #1, #2 e #6, então cada um está aplicado | comparação do texto antes e depois, item a item (lista abaixo) |
| Dado o repositório, quando procuro "Igor", então não há ocorrência | `git grep -i -w igor` vazio; texto dos .docx sem o nome |
| Dado o README, quando sigo os primeiros passos, então a aplicação sobe com `npm run dev` ou com `docker compose up --build` | passo manual com `npm ci`, `npm run dev` e `docker compose up --build` |
| Dado `npm run check` e `docker compose up --build`, quando rodo, então passam como antes e a imagem não tem `documentos-formais/` | `npm run check`; `docker run --rm --entrypoint sh glow-app -c "ls -A /app"` |

## Arquivos

| Arquivo | Ação |
|---|---|
| `setup/questionario.md`, `memoria/tarefas/2-tarefas-de-ponta-a-ponta/` (`01_plano.md`, `02_relatorio.md`, `notas.md`) | alterar: sem o Igor (já feito na cópia principal, aprovado na conversa) |
| `documentos-formais/AnaliseDoSistema.docx`, `ArquiteturaDoSoftware.docx`, `DesenvolvimentoComIA.docx` | criar (movidos de `DocumentacaoWord/`) e atualizar |
| `.gitattributes` | alterar: `*.docx binary` |
| `.gitignore` | alterar: arquivos de trava do Office (`~$*`) |
| `.dockerignore` | alterar: `documentos-formais` fora do contexto da imagem |
| `docs/decisoes/0040-documentos-formais-versionados.md`, `docs/decisoes/CONTEXT.md` | criar e alterar |
| `AGENTS.md` | alterar: linha `documentos-formais/` no mapa, com a regra de leitura (texto em L1) |
| `README.md` | alterar: pré-requisitos, primeiros passos com `npm ci` e a pasta dos documentos formais |
| `guia/regras.md` | alterar: os `.docx` ficam em `documentos-formais/`, não fora do repositório; em "Uso do contexto", o item "ler os módulos de `docs/`; abrir os `.docx` só quando o desenvolvedor pedir para lê-los ou alterá-los" |
| `docs/CONTEXT.md` | alterar: idem, com a mesma regra de leitura |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: `documentos-formais/` na árvore da raiz |
| `docs/plataforma/infraestrutura.md` | alterar: na tabela de "Execução em contêiner", o `.dockerignore` também deixa fora a pasta `documentos-formais` (incluído na etapa 02; ver `notas.md`) |
| `memoria/tarefas/9-documentos-formais/` | criar: plano, notas e relatório |

## Mudanças nos .docx

Já feito, aprovado na conversa: o Igor saiu da capa dos três documentos.

**Arquitetura de Software**

1. Quadro 1: ESLint 9 em vez de 10 ("5.0, 9 e 3.9"). [#1]
2. Parágrafo das versões por compatibilidade: são quatro, com o ESLint 9 preso pela configuração do Next.js (decisão 0037). [comparação]
3. Seção 2.4: o Prettier formata só código e configuração, não os `.md`. [#1]
4. Seção 3.1: `.dockerignore` na árvore, ao lado do `Dockerfile` e do `compose.yaml`. [#6] O `.prettierignore` e o `postcss.config.mjs` não entram: a árvore não lista arquivos de configuração. [#1]
5. Seção 8.2: as variáveis são lidas na execução, durante a requisição, nunca na construção. [#6]
6. Seção 8.5: `next typegen` antes do `tsc --noEmit`; o job `check` é o check obrigatório da `main`. [#1]
7. Seção 8.6: o `.dockerignore` exclui `.env*`, `node_modules` e `.next` de qualquer pasta, além de `.git`, `.claude` e `documentos-formais`; passo a passo de uso (Docker Desktop, `.env.local`, `--build`, encerramento, porta 3000 em comum com o `npm run dev`). [#6]
8. Quadro 38: linha da decisão 0037. [#1]

**Desenvolvimento com IA**

9. Seção 3, árvore: `.github/` sem o CODEOWNERS; linha nova `documentos-formais/`. [#2 e esta tarefa]
10. Seção 3.1: sem responsável por área, com os integrantes no questionário; no exemplo do `AGENTS.md`, a regra do `.env` com a exceção do `.env.example`. [#2 e #1]
11. Seção 3.2: rota de CI/CD só "Ciclo completo"; "padrão da área" passa a "padrões das camadas que a tarefa toca"; os critérios da tarefa trivial ficam iguais aos cinco de `workflows/procedimentos/tarefa-trivial.md`. [#2 e comparação]
12. Seção 3.3: no exemplo do 01 Planejar, a linha dos padrões passa a falar das camadas que a tarefa toca. [comparação]
13. Seção 3.4: os `.docx` ficam em `documentos-formais/`; o agente lê os módulos de `docs/` e só abre os `.docx` quando o desenvolvedor pede. [esta tarefa]
14. Seção 3.5: exemplo do cabeçalho com `areas: [backend]`. [#2]
15. Seção 3.6: o questionário trata dos integrantes, dos usuários do GitHub e de quem aplica as migrations; `.github/` sem o CODEOWNERS. [#2]
16. Seção 4.1: o PR é incorporado com a aprovação de outro integrante, que não o autor. [#2]
17. Seção 5: exceção do `.env.example`; documentação do Next.js em `node_modules/next/dist/docs/`; ESLint 9; o agente não exibe as variáveis pelo Docker. [#1 e #6]
18. Seção 6.2: exemplo do `.claude/settings.json` com os bloqueios do Docker e sem o `Read(./.env.*)`, que hoje barraria o `.env.example`. [#6 e comparação]
19. Seção 7.1 e Quadro 8: sem responsável por área, com as tarefas de ponta a ponta (decisão 0039); o quadro lista as áreas e os seus padrões. [#2]
20. Seção 7.2: uma etiqueta de tipo e uma `area:*` por área tocada; critérios de aceitação conferidos conforme a lacuna L2. [#2]
21. Seção 7.4: sem o CODEOWNERS; o autor pede a revisão a outro integrante, que aprova. [#2]
22. Seção 8: conferência no contêiner quando a tarefa muda a imagem, o `next.config.ts`, as dependências ou a leitura de variáveis. [#6]
23. Seção 8.3: critério de pronto com a aprovação de outro integrante e os padrões das camadas tocadas. [#2]
24. Seção 9, Quadro 10: linha do GitHub sem o CODEOWNERS. [#2]

**Análise do Sistema**: só a capa.

Os textos seguem os módulos já aprovados do ICM; nada novo é inventado. A edição preserva estilos, numeração das listas e o sumário, que é atualizado no Word.

## Testes previstos

Nenhum teste automatizado novo: a tarefa não muda código. Verificações:

- `npm run check` sem erros nem avisos novos;
- `docker compose up --build`, página inicial com status 200 e a imagem sem `documentos-formais/` (`workflows/procedimentos/testes.md`, "Contêiner (Docker)");
- os três .docx abertos no Word por automação, sumário atualizado e as páginas alteradas conferidas em imagem;
- `git check-attr -a documentos-formais/*.docx` mostra `binary`; `git grep -i -w igor` vazio.

## Lacunas na documentação

### L1. Nome da pasta dos documentos formais

**Problema.** A pasta veio como `DocumentacaoWord/`, fora do padrão de nomes do repositório (minúsculas, `kebab-case`) e sem o termo que o ICM usa ("documentos formais").

**Opções**

- [X] `documentos-formais/` (recomendada): segue o padrão e o vocabulário do ICM, e não se confunde com `docs/`.
- [ ] Manter `DocumentacaoWord/`: nenhum renome, mas fica como a única pasta fora do padrão.

**Texto proposto**

- `AGENTS.md`, mapa: linha "`documentos-formais/` | documentos formais em Word (.docx) exigidos pela disciplina; a IA usa os módulos de `docs/` e só abre os .docx quando o desenvolvedor pede para lê-los ou alterá-los".

### L2. Quem confere os critérios de aceitação (Desenvolvimento com IA, seção 7.2)

**Problema.** O documento diz que os critérios são "conferidos pelo responsável pela área", que deixou de existir (decisão 0039). O relatório da #2 sugere um texto, que ainda não foi confirmado.

**Opções**

- [X] Conferidos na aprovação do plano (recomendada): é o ponto de controle em que o desenvolvedor já lê os critérios (`workflows/CONTEXT.md`).
- [ ] Conferidos pelo revisor do PR: a conferência fica só no fim, quando mudar custa mais.

**Texto proposto**

- Desenvolvimento com IA, seção 7.2: de "conferidos pelo responsável pela área" passa a "conferidos na aprovação do plano".

## Decisões técnicas

- Seguidas: 0031 (estrutura ICM; a IA lê os módulos), 0038 (Docker só executa a aplicação; a pasta nova fica fora da imagem) e 0039 (aprovação por outro integrante).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| 0040 – Documentos formais versionados em `documentos-formais/`; a IA lê os módulos de `docs/` e só abre os .docx a pedido do desenvolvedor, para lê-los ou alterá-los | manter os .docx fora do repositório; a IA ler os .docx em vez dos módulos | a disciplina exige a documentação no projeto; os módulos de `docs/` continuam sendo a fonte da IA, por economia de contexto; consequência aceita: o diff dos .docx é binário, então o PR descreve o que mudou neles | nova |

## Riscos e dúvidas

- O diff dos .docx não aparece no GitHub: a descrição do PR lista as mudanças por seção, e o revisor confere no Word.
- O Word regrava o arquivo inteiro ao salvar; os estilos e o sumário são conferidos em imagem antes do commit.
- O histórico do Git cresce cerca de 1 MB a cada versão dos .docx; aceitável para três arquivos até a AV3.

## Fora do escopo

- Mudanças no Docker além do `.dockerignore` e desenvolvimento dentro do contêiner (mantido pela decisão 0038, por escolha do desenvolvedor em 18/10/2026).
- O molde do plano com lacunas em blocos (#3) e o `passWithNoTests` (#4).

## Commits previstos

1. `docs: remove Igor from the team records`
2. `docs: add the task 9 plan`
3. `chore: version the formal documents in documentos-formais`
4. `docs: point the ICM to the formal documents folder` (com a decisão 0040)
5. `docs: add setup prerequisites to the README`
6. `docs: update the formal documents to the current ICM`
7. `docs: add the task 9 report`
