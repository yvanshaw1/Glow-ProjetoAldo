# Notas: 21-formatos-e-erros

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-18 – decisão

As issues #21 a #26 foram criadas com o OK do desenvolvedor à proposta de divisão da fundação de código: "OK, crie as seis issues como estão, com todos os formatos de RN035 na issue 1, e faça a etapa 01 da primeira."

| Issue | Conteúdo | Depende de |
|---|---|---|
| #21 | formatos de RN035, catálogo de erros e tipos da API em `src/shared` (esta) | – |
| #22 | base do servidor: clientes do Supabase, tratamento único e registro | #21 |
| #23 | sessão e login único: login, logout, `me`, bloqueio de tentativas e guards | #22 |
| #24 | cadastro de cliente e troca de senha pela API | #23 |
| #25 | base do frontend: shadcn/ui, tema, `api-client`, sessão e layouts | #23 |
| #26 | telas de acesso e `src/proxy.ts` | #24 e #25 |

A #21 e a #22 vão em sequência porque as duas mexem no `package.json`. Depois da #23, a #24 e a #25 podem andar em paralelo.

Lacunas já vistas nas outras issues, para os planos delas:

- #22: como verificar o tratamento único sem nenhuma rota que o use (a decisão 0024 limita os testes às regras e aos esquemas); qual código responde à recusa por `Origin`.
- #23: `GET /api/auth/me` e o logout com a senha inicial pendente, já que `autenticacao.md` diz que toda rota, exceto a de troca de senha, responde 403; incremento do contador de `login_attempts` sem corrida entre requisições (talvez uma função SQL nova, fora das seis previstas).
- #24: qual código acompanha o 401 da senha atual incorreta (`rotas.md` não diz).
- #25: cores, fontes e espaçamentos do tema ainda não definidos (`wireframes/README.md`).

## 2026-10-18 – descoberta

Conferências do planejamento, sem instalar nada no projeto:

- `zod` 4.6.7, de 12/10/2026, é a versão `latest`. O pacote foi baixado com `npm pack` para o scratchpad da sessão, só para ler as expressões regulares. O `z.uuid()` exige versão de 1 a 8 e variante 8, 9, a ou b; o `z.guid()` aceita qualquer 8-4-4-4-12. Os ids do `seed-demo.sql` vêm de `md5(...)::uuid` e falham no `z.uuid()` em cerca de 7 de cada 8 casos (L10).
- O e-mail do Zod 4.6.7 exige caracteres sem acento e o fim do domínio com ao menos duas letras.
- A Receita Federal emite CNPJ alfanumérico desde julho de 2026 (IN RFB nº 2.229/2024): 12 posições alfanuméricas e 2 dígitos numéricos, com valor = código ASCII − 48 no módulo 11 (L8). Dígitos conferidos com um cálculo em Node: 12.345.678/0001-95 e 12.ABC.345/01DE-35 são válidos; o exemplo de RN035, 12.345.678/0001-90, não é.
- A #4 foi fechada como "not planned", mas o `TODO(#4)` e o `passWithNoTests` continuam no `vitest.config.ts`. Esta tarefa os remove.
- npm: a última 11.x é a 11.21.1; nesta máquina, 11.6.2.
- O PR #20 (documentos formais) não tem arquivo em comum com esta tarefa.
- O worktree desta sessão é `angry-dijkstra-1b028a`, na ramificação `claude/epic-agnesi-c61aca`, e não pode ser renomeado. A etapa 02 cria a ramificação da tarefa a partir da `main`.

## 2026-10-19 – decisão

Plano aprovado pelo desenvolvedor, com a opção 1 nas lacunas L1 a L11. O `aprovado_em` ficou "00:04 19/10/2024". O ano parece erro de digitação, porque o plano é de 2026, mas o agente não altera os campos de aprovação: o aviso vai ao desenvolvedor.

## 2026-10-19 – descoberta

Etapa 02:

- A ramificação `feat/21-shared-formats-and-errors` saiu da `origin/main` (7ce6ad0). O `git switch -c` a ligou à `origin/main` como upstream. O vínculo foi desfeito, para que nenhum envio vá à `main`; a etapa 03 envia com `git push -u origin feat/21-shared-formats-and-errors`.
- O `zod` 4.6.7 já estava no `package-lock.json` como dependência de desenvolvimento, trazido pela configuração do ESLint. O npm 11.21.1 só mudou a entrada para produção, e as 26 linhas `@emnapi` continuam. O aviso `install-scripts` sobre o `unrs-resolver` já existia antes e não é desta tarefa.
- O id de `md5('glow-demo:category:Lavagem')::uuid` (4e31423b-fe30-cf42-7e5a-eebc618ac6e6) foi conferido: o `z.uuid()` recusa, e o `z.guid()` aceita (L10).
- O critério da #4 foi conferido com `npx vitest run --dir tests/rules`, que sai com código 1 ("No test files found"). Isso equivale a trocar o `include` sem editar o arquivo.
- Os 93 testes cobrem toda a lista do plano. Alguns casos foram acrescentados dentro do mesmo escopo: mensagem de obrigatório em e-mail, senha, ano, valor e texto; valor que não é texto no nome; primeiro e último DDD da lista; termo de busca vazio.
- O RN035 ficou com 7,8 KB, cerca de 2,2 mil tokens, um pouco acima do limite de cerca de 2 mil. "Campos obrigatórios e opcionais" não foi movido: fica para o desenvolvedor decidir na revisão.
- Detalhes de implementação dentro do plano: `jobTitleSchema` é o mesmo esquema de `entityNameSchema`, que tem o mesmo formato em RN035. `AppError` guarda só o código, os campos e o `Retry-After`; o status vem do catálogo, no tratamento único da #22. O termo de busca usa a mensagem de limite também quando o valor não é texto.
