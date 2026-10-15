# Como pedir tarefas à IA

Guia para as pessoas da equipe. A IA não precisa ler este arquivo: as instruções dela estão em `AGENTS.md`, `guia/` e `workflows/`.

## Princípio

O pedido diz **qual tarefa** e **qual etapa**. O que ler, como programar e quando parar já está nos arquivos, como propõe a ICM: a estrutura faz o papel do prompt. Por isso:

- uma tarefa por conversa: comece cada tarefa com conversa limpa (`/clear` no Claude Code); a memória fica em `memoria/tarefas/`, não no chat;
- cite identificadores (UC26, RN033) em vez de colar trechos dos documentos; a IA acha os arquivos;
- entre uma etapa e outra, revise o que a IA produziu. O ganho do método está nos dois pontos de controle.

## Antes de pedir

- Issue com objetivo, identificadores e critérios de aceitação no formato Dado, Quando, Então, mais as etiquetas de área e de tipo (modelos em `.github/ISSUE_TEMPLATE/`).
- Tarefa pequena, de um ou dois dias. "Fazer o agendamento" vira várias issues: cálculo de preço, previsão de conclusão, rota de criação, tela do assistente.

## Pedidos por etapa

**01 Planejar**

```
Tarefa #12 (funcionalidade, backend): edição de agendamento pelo cliente (UC26).
Critérios:
- Dado um agendamento "Agendado" para 20/11 às 9h, quando o cliente muda para 19/11, então é recusado (RN033).
- Dado um agendamento "Em espera", quando o cliente tenta editar, então recebe 409 INVALID_STATUS (RN032).
Fora do escopo: a tela (fica para a #13).
Faça a etapa 01.
```

Se a issue já estiver no GitHub e a IA tiver acesso ao `gh`, basta: `Planeje a issue #12 (etapa 01).`

**Revisão do plano (você)**: abra `memoria/tarefas/12-<nome>/01_plano.md`, corrija o que precisar direto no arquivo, decida as lacunas da seção "Lacunas na documentação" (marque a opção escolhida), confira as propostas da seção "Decisões técnicas" e mude o status para `aprovado`, com `aprovado_por` e `aprovado_em`. Só você faz isso. Não use o modo de plano do Claude Code nesta etapa: o plano precisa ser gravado em arquivo.

**02 Construir**

```
Plano da #12 aprovado. Faça a etapa 02.
```

**03 Entregar**

```
Etapa 03 da #12.
```

**Revisão do pull request (responsável pela área)**: CI, build da Vercel, pré-visualização e leitura do código. Pedidos de alteração voltam à etapa 02: `Atenda os comentários do PR da #12 (volta à etapa 02).`

**04 Encerrar**

```
PR da #12 incorporado. Etapa 04.
```

## Outros pedidos

| Situação | Pedido |
|---|---|
| Retomar uma tarefa em outra sessão | `Retome a tarefa #12.` |
| Tirar dúvida sem alterar nada | `Consulta: quem pode cancelar um agendamento em espera?` |
| Corrigir um desvio | `Isso viola a RN033: o funcionário pode adiantar. Corrija e registre em notas.md.` |
| Correção que se repete | `Transforme essa correção em regra no padrão da área.` |
| Decidir uma lacuna apontada pela IA | `Na #12, fico com a opção 2 da lacuna sobre arredondamento. Documente como proposto.` |
| Saber por que algo foi decidido | `Consulta: por que a API não tem /v1? Cite a decisão.` |
| Questionar uma decisão existente | `Na #12, proponha substituir a decisão 0028 (Prettier) por <alternativa>, com a justificativa.` |
| Registrar uma escolha feita fora do plano | `Na #12, registre como decisão a escolha de <x>, conforme o procedimento de decisão.` |
| Conferir se a documentação cobre um tema | `Consulta: a documentação cobre o reagendamento de um serviço desativado? Aponte lacunas e onde documentar.` |
| Defeito | `Tarefa #20 (defeito): <issue>. Faça a etapa 01 começando pelo teste que reproduz o defeito.` |
| Investigação | `Tarefa #21 (investigação): <pergunta>. Prazo: meio dia. Faça a etapa 01.` |
| Tarefa trivial (critérios em `workflows/procedimentos/tarefa-trivial.md`) | `Tarefa #22: trocar o texto do botão "Enviar" para "Agendar" em /booking. Confira se é trivial e proponha o plano resumido aqui.` Depois de ler o plano resumido, responda `Aprovado.` Se a IA disser que não é trivial, siga o ciclo completo. |

## Quando a IA aponta uma lacuna

A IA não inventa o que a documentação não define. Ela registra a lacuna (no plano ou em `notas.md`) com as opções, a recomendação, o texto proposto e o arquivo onde documentar. Você decide; a decisão entra nos módulos de `docs/` no mesmo pull request, e o `02_relatorio.md` lista o que muda nos documentos formais (`.docx`), para quem cuida deles atualizar antes da AV3.

## Evite

- "Faça o projeto inteiro" ou "implemente o agendamento": grande demais, a IA lê demais e supõe demais.
- Colar trechos dos documentos no pedido.
- Aprovar o plano sem ler.
- Pedir à IA que aprove o plano, incorpore o PR ou aplique migration: ela recusa por regra.
- Continuar uma tarefa numa conversa longa de outra.

## Primeira tarefa: base do projeto

O ciclo cria a ramificação a partir da `main` e abre o PR para ela, e a IA nunca envia nada à `main`. Por isso o commit inicial, só com a estrutura ICM e o esqueleto, é um passo único fora do ciclo (`setup/questionario.md`, seção 5): a IA prepara e você envia.

**1. Commit inicial** (conversa nova, com a pasta `App/` aberta):

```
Configuração inicial: faça o commit inicial descrito em setup/questionario.md,
seção 5 (passo único, fora do ciclo de tarefas e sem issue). Antes do commit, me
mostre o git status e espere o meu ok. Não faça o push.
```

**2. Envio (você):** `git push -u origin main`.

**3. Etiquetas e issue #1** (na mesma conversa):

```
Push feito. Crie com o gh as etiquetas da seção 5 do questionário e a issue #1 com
o título e o texto da seção "Primeira tarefa" de guia/como-pedir.md. Mostre o texto
antes de criar. Depois marque no questionário os itens concluídos.
```

Texto da issue #1:

```
Título: Base do projeto: Next.js, ferramentas de qualidade e CI
Etiquetas: tipo:configuracao, area:cicd

## Objetivo

Aplicação Next.js 16 rodando em App/, com as ferramentas de qualidade e o CI de
docs/plataforma/infraestrutura.md, sem nenhuma funcionalidade.

## Requisitos

RNF014, RNF015 e RS016; docs/plataforma/infraestrutura.md e
docs/plataforma/estrutura-de-pastas.md.

## Escopo

- create-next-app (TypeScript, Tailwind, ESLint, App Router, src/, npm, --disable-git)
  em pasta temporária e movido para App/, sem sobrescrever AGENTS.md, CLAUDE.md,
  README.md, .gitignore, .gitattributes nem nada da ICM e do esqueleto; se o scaffold
  trouxer arquivos com esses nomes, o plano propõe o que aproveitar.
- O src/app/page.tsx do scaffold sai: a página inicial é src/app/(portal)/page.tsx,
  por ora só com o nome da empresa.
- .gitignore completo, .env.example, scripts dev/check/test/format, Prettier, Vitest,
  server-only, engines Node 24 e .github/workflows/ci.yml.

## Critérios de aceitação

- Dado um clone limpo, quando rodo npm ci e npm run check, então tudo passa sem erros
  nem avisos.
- Dado npm run dev, quando abro http://localhost:3000, então vejo a página inicial
  provisória.
- Dado um .env.local na pasta, quando rodo git status, então ele não aparece; o
  .env.example é versionado e tem só os nomes das variáveis.
- Dado um PR para a main, quando o CI roda, então executa as etapas de
  infraestrutura.md na ordem e para na primeira que falhar.
- Dado o esqueleto de pastas, quando a tarefa termina, então as pastas e os README.md
  continuam lá.

## Fora do escopo

shadcn/ui, Supabase, layouts e telas.
```

**4. GitHub e Vercel (você):**
- convidar os colaboradores;
- ativar a varredura de segredos e a proteção da `main` (questionário, seção 5). O CI e o build da Vercel só podem ser marcados como obrigatórios depois de rodarem uma vez, no PR da tarefa 1;
- ligar a Vercel ao repositório antes da etapa 03, para o PR ter pré-visualização. O primeiro deploy da `main` falha porque ainda não há aplicação; isso é esperado.

**5. Tarefa #1** (conversa nova):

```
Planeje a issue #1 (etapa 01).
```

Sem o `gh`, cole o texto da issue seguido de `Faça a etapa 01.` As etapas seguintes usam os pedidos de "Pedidos por etapa".
