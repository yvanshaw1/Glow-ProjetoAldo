---
issue: 19
titulo: "Documentos formais atualizados com a #15 e a #17, sem confirmação de e-mail"
areas: [cicd]
tipo: documentacao
requisitos: [RS003, RS015, RS016]
status: concluido
aprovado_por: yvan
aprovado_em: 23:03 18/10/2026
---

# Plano: Documentos formais atualizados com a #15 e a #17, sem confirmação de e-mail

## Objetivo

Deixar os `.docx` de `documentos-formais/` de acordo com o ICM depois da #15 (wireframes, decisão 0041) e da #17 (banco de dados, decisões 0042 a 0044). Entram três coisas:

- a criação das contas sem confirmação de e-mail, porque o projeto não tem provedor de e-mail (decisões 0015 e 0044);
- a preparação do Supabase sem configuração no painel;
- a correção do Kayke como colaborador em `setup/questionario.md`, já feita no commit `97f6d99` (tarefa trivial aprovada na conversa).

Os módulos do ICM já dizem tudo isso: nenhum arquivo de `docs/` muda. O ESLint fica no 9 (decisão 0037). Fontes dos textos: as seções "Documentos formais a atualizar" de `memoria/tarefas/15-wireframes/02_relatorio.md` e `memoria/tarefas/17-banco-de-dados/02_relatorio.md`, e os módulos citados em cada item. Nada novo é inventado.

## O que muda

### Arquitetura de Software (`ArquiteturaDoSoftware.docx`)

1. **Quadro 1 (Tecnologias):** linha nova, a CLI do Supabase 2.120, com o papel de conferir as migrations num banco local e aplicá-las no projeto (decisão 0043). Fonte: `docs/plataforma/visao-geral.md`.
2. **Seção 4.3.2 (Perfis e Contas):** frase nova. Toda conta é criada pelo servidor com a chave de serviço (`auth.admin.createUser`), já com o e-mail confirmado; a aplicação não usa o cadastro público do Supabase Auth, então nenhum e-mail é enviado e não há confirmação de e-mail (decisões 0015 e 0044). Fonte: `docs/acesso/autenticacao.md`.
3. **Seção 5 (introdução):**
   - "Toda a estrutura é criada por um único arquivo de migration" passa a dizer que a estrutura vem das migrations de `supabase/migrations/`. A inicial cria tipos, tabelas, restrições, gatilhos, índices, RLS e o bucket `service-images`; cada função de gravação entra depois, com a funcionalidade que a chama (L1 da #17).
   - Frase nova: além da RLS, os papéis `anon` e `authenticated` não têm privilégio nas tabelas e funções (decisão 0042).

   Fonte: `docs/padroes/banco.md`.
4. **Seção 5.2 (Tabelas), quadros de colunas:**
   - Quadros 13 (`clients`), 14 (`staff`) e 28 (`login_attempts`): o e-mail gravado em minúsculas.
   - Quadro 14: no máximo uma conta de administrador.
   - Quadro 17 (`vehicles`): a placa em maiúsculas, sem hífen, nos padrões Mercosul ou antigo.
   - Quadros 15 (`roles`), 19 (`categories`) e 20 (`services`): os nomes únicos sem diferenciar maiúsculas.

   Fonte: os `dados.md` de clientes, equipe, catálogo e `docs/acesso/autenticacao.md` (L3 a L5 da #17).
5. **Seção 5.2, regras garantidas pelo banco e gatilhos:**
   - Itens novos na lista: um único administrador; placa e e-mail na forma normalizada; nomes únicos sem diferenciar maiúsculas; e os quatro preços do serviço por porte, conferidos no fim da transação (L4).
   - No parágrafo dos gatilhos: os nomes `trg_` e o erro com o nome `ck_` da regra (L7).
   - No parágrafo das funções de gravação: cada uma entra em migration própria, na tarefa da funcionalidade (L1).

   Fonte: `docs/padroes/banco.md` e os `dados.md`.
6. **Quadro 35 (segurança), RS003:** "O mínimo de 8 também é configurado no Supabase Auth." passa a dizer que o Supabase Auth fica com a configuração padrão e que o esquema é aplicado no servidor antes de toda chamada que define senha, inclusive no script do administrador (decisão 0044). Fonte: `docs/plataforma/seguranca.md`.
7. **Seção 8.3 (Banco de Dados e Dados Iniciais):**
   - Os três passos passam a ser: aplicar as migrations (a inicial com o bucket); carregar o `seed.sql` junto, com `npx supabase db push --include-seed`, incluindo os valores iniciais (de segunda a sexta das 08:00 às 18:00 com pausa das 12:00 às 13:00, sábado das 08:00 às 12:00, domingo fechado e o nome "Glow – Estética Automotiva"); e rodar o script do administrador.
   - O parágrafo do painel ("a confirmação de e-mail é desativada... senha mínima... service-images") passa a "nada é configurado à mão no painel" (decisão 0044).
   - O parágrafo da demonstração ganha a carga pelo SQL Editor e a recarga sem duplicar.

   Fonte: `docs/plataforma/infraestrutura.md` e `docs/configuracoes/dados.md`.
8. **Seção 8.4 (Publicação), parágrafo das migrations:** antes do `db push`, a migration é conferida num banco local descartável, com `npx supabase start` e `npx supabase db reset` (decisão 0043). Fonte: `workflows/procedimentos/migration.md`.
9. **Seção 8.6 (Execução em contêiner):** o `.dockerignore` também exclui `wireframes`. Fonte: `docs/plataforma/infraestrutura.md` (#15).
10. **Quadro 38 (Decisões técnicas):** três linhas no fim, uma para cada decisão de arquitetura, com o texto de cada registro: 0042 (banco sem privilégios para as chaves públicas), 0043 (CLI fixada e banco local) e 0044 (preparação sem painel). A 0041 depende da L1.

### Desenvolvimento com IA (`DesenvolvimentoComIA.docx`)

11. **Seção 3 (Arquitetura de Diretórios):**
    - linha `wireframes/` na árvore, depois de `documentos-formais/`;
    - item novo na lista das pastas, com o texto do `AGENTS.md`: "telas de outro sistema, em PDF, como referência de esqueleto e componentes das páginas; o que a página tem vem de `docs/` e as cores, do tema" (decisão 0041).
12. **Seção das variações por tipo de tarefa, "alteração do banco":** a migration é conferida num banco local antes da aplicação (decisão 0043).
13. **Regras da IA, Limites:** o item "envia código diretamente à main, incorpora pull requests, aplica migrations no banco ou publica a aplicação" ganha "vincula o projeto do Supabase ou usa `--linked` ou `--db-url` na CLI; o único banco que o agente acessa é o local, descartável". Fonte: `guia/regras.md`.
14. **Seção 6.2, exemplo do `.claude/settings.json`:** os bloqueios `Bash(npx supabase link:*)` e `Bash(npx supabase db reset --linked:*)`, como no arquivo real.
15. **Quadro 10 (Ferramentas):** a linha "Supabase CLI e painel" passa a "Supabase CLI": banco local para conferir as migrations e aplicação delas pelo integrante designado (decisão 0043); nada é configurado à mão no painel (decisão 0044).

### Análise do Sistema

Não muda: o documento não fala do Supabase, do painel nem de confirmação de e-mail. Os casos de uso de cadastro (UC02, UC16 e UC19) já não pedem confirmação.

## Como os `.docx` são editados

Pelo Microsoft Word, por automação (PowerShell e COM), como na #9: substituição de texto e linhas novas copiadas da linha anterior de cada quadro, para manter estilos e numeração. Depois, sumário atualizado (`TablesOfContents.Update`) e salvamento.

Na etapa 01, a automação travou ao abrir os documentos com o Word invisível, e a instância criada foi encerrada. Na etapa 02:

1. A primeira tentativa abre o Word visível, para ver se há alguma caixa de diálogo (ativação, privacidade, modo protegido) e fechá-la.
2. Se o Word continuar travando, a alternativa é editar o `word/document.xml` de dentro do `.docx` com um script Node.js e recompactar pelo .NET. Nesse caso, o sumário fica com os números de página anteriores, e o desenvolvedor o atualiza no Word (F9) antes do PR.

Antes de editar, uma cópia dos `.docx` originais fica no scratchpad da sessão, fora do repositório.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado os três `.docx`, quando procuro "confirmação de e-mail", então nenhum trecho manda configurá-la no painel, e a Arquitetura diz que a conta nasce com o e-mail confirmado (decisão 0044) | busca no texto extraído dos três documentos depois da edição |
| Dado a seção 8.3 da Arquitetura, quando a comparo com `docs/plataforma/infraestrutura.md`, então as duas descrevem a mesma preparação, em três passos e sem painel | leitura lado a lado, registrada no relatório |
| Dado o Quadro 38, então ele traz as decisões 0041 a 0044 | texto extraído do quadro. Com a opção 1 da L1, a 0041 fica no Desenvolvimento com IA, e o critério passa a valer para os dois documentos juntos |
| Dado os `.docx` alterados, quando os abro no Word, então abrem sem reparo, com o sumário atualizado | abertura no Word por automação, sem aviso de reparo; páginas alteradas exportadas em PDF pelo Word e conferidas em imagem |
| Dado o `setup/questionario.md`, então o Kayke aparece como colaborador | commit `97f6d99` na ramificação da tarefa |
| Dado o PR, quando o CI roda, então o `npm run check` passa | `npm run check` local e o check `check` do PR |

## Arquivos

| Arquivo | Ação |
|---|---|
| `documentos-formais/ArquiteturaDoSoftware.docx` | alterar (itens 1 a 10) |
| `documentos-formais/DesenvolvimentoComIA.docx` | alterar (itens 11 a 15) |
| `setup/questionario.md` | já alterado no commit `97f6d99` |
| `memoria/tarefas/19-documentos-formais-banco/` | `01_plano.md` e `notas.md` nesta etapa; `02_relatorio.md` na etapa 03 |

A ramificação da tarefa, `docs/19-formal-documents`, nasce da `docs/kayke-collaborator`, que é a `origin/main` mais o commit `97f6d99`. Assim o PR leva a correção do Kayke junto. Na etapa 04, a ramificação `docs/kayke-collaborator` e a memória `pendencia-kayke-no-questionario` saem.

Não mudam:

- os módulos de `docs/`, que já estão certos;
- `documentos-formais/AnaliseDoSistema.docx`;
- o código, o `package.json` e o ESLint (decisão 0037).

Nenhuma outra tarefa em andamento mexe nesses arquivos.

## Testes previstos

Nenhum teste automatizado: a tarefa não muda código (decisões 0024 e 0035).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Onde a decisão 0041 (wireframes) entra nos documentos formais

**Problema.** O relatório da #15 pede três coisas na Arquitetura: a linha `wireframes/` na árvore da seção 3.1, a 0041 no Quadro 38 e a linha `wireframes/` na árvore do Desenvolvimento com IA. Mas os documentos separam as decisões:

- o Quadro 38 da Arquitetura só tem decisões de arquitetura;
- as de processo e de estrutura do repositório, como a 0039 (tarefas de ponta a ponta) e a 0040 (documentos formais versionados), aparecem só no texto do Desenvolvimento com IA;
- a árvore da seção 3.1 da Arquitetura mostra o código e não lista as pastas da ICM, nem `documentos-formais/`.

**Opções:**

- [X] **1. Só no Desenvolvimento com IA (recomendada).** A 0041 entra como as decisões 0039 e 0040: na árvore e na lista de pastas da seção 3 (item 11). Na Arquitetura, só o `.dockerignore` da seção 8.6 (item 9). Os dois documentos mantêm a divisão que já seguem.
- [ ] **2. Como no relatório da #15.** Também a linha `wireframes/` na árvore da seção 3.1 e a 0041 no Quadro 38 da Arquitetura. A árvore do código e o quadro de arquitetura passam a ter um item de processo, e a 0039 e a 0040 continuam de fora.

**Texto proposto (opção 1):** o dos itens 9 e 11. Nenhum módulo de `docs/` muda.

## Decisões técnicas

Nenhuma nova. Seguidas:

- 0040: documentos formais versionados, abertos pelo agente a pedido do desenvolvedor;
- 0037: ESLint 9;
- 0041 a 0044: os textos que entram nos documentos.

## Riscos e dúvidas

- A automação do Word travou na etapa 01. Se travar de novo, vale o caminho alternativo de "Como os `.docx` são editados", e o sumário fica para você atualizar no Word.
- O `.docx` é binário, e a revisão do PR não mostra o diff. Por isso a descrição do PR lista cada alteração com a seção, e as páginas alteradas vão em imagem no relatório.
- Com o texto novo, a paginação pode mudar e mover figuras e quadros. As páginas seguintes às alterações também são conferidas em imagem.

## Fora do escopo

- Atualizar o ESLint, que fica no 9 (decisão 0037).
- Qualquer mudança em código, em `docs/` ou na Análise do Sistema.
- Itens dos documentos formais que não venham da #15 nem da #17.
