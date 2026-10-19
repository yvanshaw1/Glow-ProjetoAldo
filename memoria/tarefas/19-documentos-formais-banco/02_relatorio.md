---
issue: 19
pull_request: 20
---

# Relatório: Documentos formais atualizados com a #15 e a #17, sem confirmação de e-mail

## O que foi feito

Os documentos formais passaram a dizer o mesmo que o ICM depois da #15 (wireframes, decisão 0041) e da #17 (banco de dados, decisões 0042 a 0044):

- as contas são criadas pelo servidor já com o e-mail confirmado, sem confirmação de e-mail, porque o projeto não tem provedor de e-mail (decisões 0015 e 0044);
- nada é configurado à mão no painel do Supabase;
- o banco é preparado em três passos, com as migrations, o `seed.sql` pelo `db push --include-seed` e o script do administrador;
- toda migration é conferida num banco local antes da aplicação.

O Kayke passou a constar como colaborador em `setup/questionario.md`. Foi uma tarefa trivial aprovada na conversa, que entrou nesta ramificação. Os módulos de `docs/` não mudaram, porque já diziam tudo isso. O ESLint continua no 9 (decisão 0037).

## Arquivos alterados

- `documentos-formais/ArquiteturaDoSoftware.docx` (itens 1 a 10 do plano):
  - Quadro 1: a CLI do Supabase 2.120;
  - 4.3.2: as contas criadas pelo servidor com o e-mail confirmado;
  - 5: as migrations e os privilégios;
  - quadros 13, 14, 15, 17, 19, 20 e 28: e-mail em minúsculas, placa normalizada, nomes únicos sem diferenciar maiúsculas e um único administrador;
  - 5.2: as regras novas, os nomes dos gatilhos e uma migration por função;
  - Quadro 35: o RS003;
  - 8.3: a preparação em três passos e sem painel;
  - 8.4: a conferência local;
  - 8.6: `wireframes` no `.dockerignore`;
  - Quadro 38: as decisões 0042, 0043 e 0044.
- `documentos-formais/DesenvolvimentoComIA.docx` (itens 11 a 15):
  - a árvore e a lista de pastas com `wireframes/` (decisão 0041);
  - a conferência local na "alteração do banco";
  - o limite de não vincular o projeto do Supabase nem usar `--linked` ou `--db-url`;
  - os bloqueios novos no exemplo do `.claude/settings.json`;
  - a linha "Supabase CLI" do Quadro 10.
- `setup/questionario.md`: o Kayke como colaborador.
- `memoria/tarefas/19-documentos-formais-banco/`: plano, notas e este relatório.

`documentos-formais/AnaliseDoSistema.docx` não mudou: o documento não fala do Supabase, do painel nem de confirmação de e-mail.

## Testes executados

- `npm run check`: aprovado. A tarefa não tem código nem teste automatizado (decisões 0024 e 0035).
- **Edição:** pelo Word, por automação, primeiro em cópias. A primeira passada perdia a fonte Courier e o itálico dos trechos substituídos; foi refeita a partir dos originais, com marcação para código e termos em inglês (ver `notas.md`).
- **Texto:** extraído dos `.docx` editados e comparado com o original. Fora os marcadores internos do sumário, só mudam os trechos dos 15 itens. Nenhum trecho dos três documentos manda configurar a confirmação de e-mail no painel.
- **Imagem:** as páginas alteradas (Arquitetura 6, 21, 24, 28 a 31, 35 a 37, 47, 51 a 53, 55, 58 e 59; Desenvolvimento com IA 8, 14, 17, 18, 23 e 32) foram exportadas em PDF pelo Word, renderizadas em PNG e conferidas: formatação igual à do resto, link do RS003, alinhamento da árvore e do JSON e o cabeçalho repetido no Quadro 38.
- **Abertura:** os dois `.docx` abrem no Word direto do repositório, sem reparo nem modo protegido, com o sumário atualizado (Arquitetura com 67 páginas, Desenvolvimento com IA com 33).

## Documentação atualizada

- **Módulos:** nenhum de `docs/`.
- **Lacunas resolvidas:** L1, onde a 0041 entra nos documentos formais → opção 1: só no Desenvolvimento com IA, como a 0039 e a 0040; na Arquitetura, só o `.dockerignore` da 8.6. Por isso a árvore da seção 3.1 e o Quadro 38 da Arquitetura não ganharam a 0041, ao contrário do que sugeria o relatório da #15.
- **Decisões:** nenhuma nova.
- **Documentos formais a atualizar:** nenhum. Os itens pendentes das #15 e #17 entraram nesta tarefa.

## Pendências

- Na etapa 04: apagar a ramificação local `docs/kayke-collaborator` e a memória `pendencia-kayke-no-questionario`, porque a correção do Kayke entra neste PR.
