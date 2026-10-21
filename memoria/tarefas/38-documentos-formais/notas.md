# Notas: 38-documentos-formais

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-20 – descoberta

Conferências do planejamento, sem alterar nenhum `.docx`:

- **Worktree.** O desta sessão é `36-regras-do-agendamento-05611e`, na ramificação `claude/38-documentos-formais-960010`, em 7f8a547, igual à `origin/main` (#21 a #26, #35 e #36). O plano e as notas ficam sem commit, como nas etapas 01 anteriores. A etapa 02 cria `docs/38-formal-documents` a partir da `origin/main`.
- **Outras tarefas.** Um PR aberto, o #54 (#37, ramificação `feat/37-company-settings`), incorporável e aguardando revisão; ele não toca em `documentos-formais/`. Issues abertas: #37 a #51. A pasta de notas compartilhadas da sessão que iniciou esta estava vazia; as pendências das notas irmãs (`APP_URL=` no `.env.example` e o ano do plano da #21) já entraram no PR #53.
- **Histórico dos `.docx`.** Últimas alterações no PR #20 (#19, dac9081) e no #10 (#9). Os três têm o sumário como campo `TOC`; as legendas dos quadros e figuras usam campo `SEQ`; as citações "Quadro N" no texto são texto simples, sem campo `REF`.
- **Leitura.** Pelo `word/document.xml` (`unzip -p`) e um script Node.js no scratchpad desta sessão, que gera um texto por documento com os títulos, as legendas e os quadros; o Word não foi aberto. A numeração dos títulos é automática e foi conferida pelas entradas do sumário: na Análise, 8 é Requisitos de Segurança, 9.1 a Relação das Regras de Negócio e 9.4 o Formato dos Dados; na Arquitetura, 4.1 Camadas, 4.2 Módulos, 4.3.1 Autenticação, 6.2 Validação e 6.4 Respostas e Erros; no Desenvolvimento com IA, 5.3 Como Programar e 8.1 Testes Automatizados.
- **Links.** Análise: 403 links internos, para marcadores com o nome do identificador (`RF001`, `RN036`...) e do sumário. Arquitetura: 282, com 229 para `AnaliseDoSistema.docx`. Desenvolvimento com IA: 67. O texto novo com identificador precisa do mesmo tipo de link.
- **Citações divergentes dos relatórios**, todas na tabela do plano:
  - RN035 aparece como "9.1, Quadro 20", mas os formatos estão na 9.4, Quadros 23 e 24; no Quadro 20, RN035 só remete ao Quadro 23. O `origem` do módulo RN035 cita 9.1;
  - a sessão, o logout, a conta e o bloqueio (#23 e #24) aparecem como "3.2 e 5.2", mas o texto está na 4.3.1 e na 4.3.2;
  - a Análise não tem mensagens de validação;
  - o `updatedAt` do `PUT` da empresa (#37) já está coberto pela introdução do Apêndice A.
- **Quadro 38.** Sem coluna de número. Tem as decisões 0001 a 0030, 0037, 0038 e 0042 a 0044. Faltam 0031 a 0036 e 0039 a 0041: as de processo estão descritas no Desenvolvimento com IA (ICM na seção 2, merge e squash na 7.3, TDD na 8.1, tarefas de ponta a ponta na 7.1, `documentos-formais/` e `wireframes/` na 3), mas a 0032 (`proxy.ts`) e a 0036 (pastas), de arquitetura, não estão em lugar nenhum como decisão (L2).
- **Outros achados fora dos relatórios** (L2): a seção 5.3 do Desenvolvimento com IA reproduz o item de `guia/regras.md` sobre as versões recentes, sem o Base UI que a #25 acrescentou; as árvores da Arquitetura não têm `src/shared/constants/` nem `src/server/rules/`.
- **Scripts da #19.** Continuam em `C:\Users\yvans\AppData\Local\Temp\claude\C--CursoSI-Projeto-aldo-av2-6periodo-Glow---Est-tica-Automotiva-App--claude-worktrees-vibrant-ramanujan-5502b2\23983705-1261-4030-8f5a-6e82496d5003\scratchpad\`: `word-edit.ps1` (operações de um JSON em UTF-8, com marcação de código e itálico), `word-links.ps1`, `word-pages.ps1`, `pdf-pages.ps1` e as operações usadas na #19 (`ops-arquitetura.json`, `ops-desenvolvimento.json`). Na etapa 02, são copiados para o scratchpad da sessão, sem ir ao repositório.
- **Ferramentas.** Sem `pandoc`, LibreOffice nem `pdftoppm`; o `python` do PATH é o atalho da Microsoft Store. Há `unzip`, Node.js e o Word.

## 2026-10-20 – decisão

Plano gravado em `aguardando_aprovacao`, com as lacunas, todas com a opção 1 recomendada:

- L1, itens da #35, da #36 e da #37: a #35 e a #36 entram; a #37, se o PR #54 for incorporado antes da construção;
- L2, achados fora dos relatórios: entram a regra do Base UI na 5.3 do Desenvolvimento com IA, `constants/` e `rules/` nas árvores e a 0032 e a 0036 no Quadro 38;
- L3, substituídas no Quadro 38: coluna "Nº" e "(substituída por NNNN)", como em `docs/decisoes/CONTEXT.md`, para a 0024, a 0045 e a 0050;
- L4, conteúdo que pediria quadro novo: nenhum quadro novo; as mensagens de validação não entram na Análise, e os valores dos cabeçalhos de segurança entram como lista na seção 7 da Arquitetura;
- L5, frontend novo na seção 3: resumo em texto do design na 3.5.4, sem as tabelas de `design.md`;
- L6, tamanho: um PR, com um commit por documento;
- L7, revisão: lista por seção no PR, resumo antes e depois no relatório e a comparação do Word (`CompareDocuments`) para o Yvan, fora do repositório.

Nenhuma decisão técnica nova. Nenhum `.docx` foi alterado.

Pontos explícitos para a aprovação:

- a ordem com o PR #54: com a opção 1 da L1, a construção espera a incorporação dele ou segue sem os itens da #37;
- durante a construção, os três `.docx` precisam estar fechados no Word do Yvan;
- antes de aprovar o PR, o Yvan abre os três documentos no Word, para o critério "abrem sem reparo".

## 2026-10-21 – decisão

Plano aprovado por yvan (21/10/2026), com a opção 1 em L1 a L7. Status em `em_execucao`. O PR #54 foi incorporado (a037b4c) antes da construção, então os itens da #37 entram (L1). Ramificação `docs/38-formal-documents` criada da `origin/main` (a037b4c), sem vínculo com a `main`.

## 2026-10-21 – descoberta

Edição pelo Word, por automação, com o motor da #19 copiado para o scratchpad desta sessão (`engine/word-edit.ps1`) e as operações em JSON (`ops-analise.json`, `ops-desenvolvimento.json` e `ops-arquitetura.json`, este gerado por `gen-arquitetura.js`, que alinha as linhas das árvores). Operações novas no motor: parágrafo antes de outro, inserção antes do fim do trecho, linha removida, célula por posição, linha achada por outra coluna ou pelo começo do texto, coluna nova à esquerda (Quadro 38), parágrafo com o formato de outro e lista com o modelo de outra lista.

Comportamentos do Word achados na conferência em imagem, todos corrigidos antes do commit:

- o parágrafo criado por `InsertParagraphAfter` herda o estilo do parágrafo seguinte: na 3.2 da Arquitetura, ele saiu com o estilo da legenda do Quadro 5;
- o parágrafo logo depois de um quadro tem 12 pt antes; o parágrafo novo inserido ali herdava esse espaço, e o seguinte o mantinha (Análise 9.4, Arquitetura 3.2 e 6.4);
- o número inteiro do JSON não é aceito como largura de coluna sem conversão para `single`;
- quebras de linha ruins: "Zod 4" e "ESLint 9" e "φ = 1,618" com espaço não separável; "8-4-4-4-12" com hífens não separáveis; `INVALID_CURRENT_PASSWORD`, mais largo que a coluna do Quadro 39, com um espaço de largura zero depois de `CURRENT_`.

## 2026-10-21 – desvio

Desvios pequenos, sem mudar escopo nem lacuna:

- **Item 5 (Análise, Quadro 19, RS003):** não mudou. O `seguranca.md` mantém o texto do requisito; os 72 bytes e a senha sem normalização estão na implementação, que entrou no Quadro 23 (item 2) e no Quadro 35 da Arquitetura (item 28).
- **Item 14:** o Quadro 5 foi reescrito na ordem de `protecao-das-paginas.md`, com 8 linhas no lugar de 7; a linha "Usuário se autentica em /login" virou a do autenticado nas telas de acesso, como no módulo.
- **Item 15:** a linha Base do Quadro 6 segue `src/components/ui/` e mantém tabela, calendário e aviso flutuante, que já estavam no documento.
- **Item 21:** a frase de abertura da 4.2 ganhou "em `src/server/rules/`, sem acesso ao banco nem ao relógio" (L2 e `calculos.md`).
- **Item 25:** o dado opcional vazio entrou na lista da 6.2 (Validação), como em `api.md`, e não na 6.1.
- **Item 27:** o campo aninhado em `fields` entrou no parágrafo do Problem Details da 6.4.
- **Item 28:** os valores dos cabeçalhos entraram como lista com letras, a) a e), entre uma frase de abertura e o parágrafo sobre os scripts e o XSS (L4).
- **Item 29:** a frase da constante do fuso ficou sem o caminho do arquivo, que esticava a linha justificada.
- **Item 31:** o 503 entrou na frase antes do Quadro 39, e não em cada rota.

## 2026-10-21 – descoberta

Conferência dos três documentos editados, antes do commit:

- **Texto:** extraído do `word/document.xml` e comparado com o original, sem as linhas do sumário. Só mudam os trechos dos itens 1 a 36 (Análise, 37 linhas; Desenvolvimento com IA, 17; Arquitetura, 233).
- **Abertura e sumário** (`engine/verify.ps1`, só leitura, sem reparo): os três abrem; cada entrada do sumário confere com o título, no texto e na página (44, 39 e 53 entradas, nenhuma divergência). Páginas: Análise 55 (igual), Desenvolvimento com IA 34 (33 antes), Arquitetura 72 (67 antes). `unzip -t` sem erro.
- **Links:** Análise 403 → 406, Desenvolvimento com IA 67 → 80, Arquitetura 282 → 293 (15 novos menos os 4 do Quadro 5 reescrito).
- **Imagem:** as páginas alteradas exportadas em PDF pelo Word e renderizadas em PNG, conferidas uma a uma.
- **Comparação do Word (L7):** gerada no scratchpad, em `comparacao/` (52, 30 e 247 revisões), fora do repositório.
- Commits f1a9a67 (Análise), 3eda345 (Desenvolvimento com IA) e 2453b37 (Arquitetura); `npm run check` aprovado, com 371 testes. Nenhum Word ficou aberto.

## 2026-10-21 – decisão

O Yvan pediu a etapa 03. A `origin/main` continua em a037b4c, que a ramificação já contém, então não houve merge. Relatório gravado, com as alterações por documento e o destino de cada item dos relatórios; plano em `concluido`. Ramificação enviada e PR #55 aberto, com `Closes #38`.
