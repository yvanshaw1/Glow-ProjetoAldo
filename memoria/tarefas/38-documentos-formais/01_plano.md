---
issue: 38
titulo: "Documentos formais atualizados com a #21 à #26"
areas: [cicd]
tipo: documentacao
requisitos: [RN033, RN035, RS003, RS004, RS006, RS007, RS014, UC01, UC03, UC08, UC22]
status: concluido
aprovado_por: yvan
aprovado_em: 21/10/2026
---

# Plano: Documentos formais atualizados com a #21 à #26

## Objetivo

Deixar os três `.docx` de `documentos-formais/` de acordo com o que a #21 à #26 decidiram e construíram, seguindo as seções "Documentos formais a atualizar" dos seis relatórios (decisão 0040). O Quadro 38 da Arquitetura passa a ir até a última decisão, a 0053, com as substituídas marcadas. Com a opção recomendada da L1, entram também os itens da #35 e da #36, já na `main`, e os da #37, se o PR #54 for incorporado antes da construção.

Os módulos de `docs/` já dizem tudo isso e são a fonte de cada texto; nenhum deles muda, nem o código. Nada novo é inventado: o que nenhum módulo diz não entra.

## Base da construção

- Ramificação `docs/38-formal-documents`, criada da `origin/main`, sem vínculo com a `main`. Hoje a `main` está em 7f8a547 (#21 a #26, #35 e #36); se o PR #54 (#37) for incorporado antes, a ramificação sai depois dele (L1).
- Edição pelo Microsoft Word, por automação (PowerShell e COM), como na #19. Os scripts da #19 continuam no scratchpad daquela sessão (`word-edit.ps1`, `word-links.ps1`, `pdf-pages.ps1` e `word-pages.ps1`, na pasta do worktree `vibrant-ramanujan-5502b2`). Eles são copiados para o scratchpad desta sessão e adaptados; nada disso vai ao repositório.
- Antes de editar, os três originais são copiados para o scratchpad. A edição é feita em cópias, que só voltam ao repositório depois da conferência.
- Convenções dos documentos, conferidas na #19 e mantidas: texto em Arial 12, e Arial 10 nos quadros; código em Courier New um ponto menor; termos em inglês em itálico; identificadores (RF, RN, RS, UC) como links. Na Análise, o link vai ao marcador do próprio documento; na Arquitetura, a `AnaliseDoSistema.docx`, com o marcador do identificador.

## Como os itens são aplicados

1. **Fonte.** O texto vem do módulo de `docs/` citado em cada item, na redação dos documentos formais, e não do relatório, que só resume.
2. **Lugar real.** Cada item vai para o lugar em que o documento trata do assunto. Quando o relatório cita outra seção ou outro quadro, vale o lugar real, e o relatório desta tarefa registra os dois. As divergências achadas na leitura estão na tabela abaixo.
3. **Trecho inexistente.** Se o assunto não tem lugar no documento, o item entra como frase, item de lista ou linha de um quadro existente, na seção que cobre o assunto. Quadro novo só com a opção 2 da L4, porque renumera os seguintes, e as citações "Quadro N" do texto são texto simples, sem campo.
4. **Item condicional ou já coberto.** Item cuja condição não vale (a #21: "se o documento trouxer mensagens de validação") ou que o texto atual já cobre não muda nada. O relatório registra cada um, com o motivo.
5. **Formatação.** O texto novo entra antes ou depois do trecho existente, sem regravar o parágrafo, para não perder a formatação, como na segunda passada da #19.

### Citações divergentes

| Relatório | Citado | Lugar real |
|---|---|---|
| #21, #23, #35 e #37 (RN035) | Análise, 9.1, Quadro 20 | 9.4 (Formato dos Dados), Quadros 23 e 24 e os parágrafos deles; no Quadro 20, RN035 só remete ao Quadro 23. O cabeçalho de `docs/plataforma/RN035-formatos-dos-dados.md` cita 9.1, o que explica a divergência |
| #21 e #26 (mensagens de validação) | Análise, 9.1, Quadro 20 | não existe: o documento não tem mensagens de validação (L4) |
| #23 e #24 (sessão, logout, conta, bloqueio, troca de senha) | Arquitetura, 3.2 e 5.2, Quadros 5 e 28 | 4.3.1 (Autenticação) e 4.3.2 (Perfis e Contas); na 5.2, só o Quadro 28 e a lista das funções SQL |
| #21, #22, #24, #25 e #26 (pastas) | Arquitetura, 3.1 e 4.1 | 3.1: árvore de `src/`, com `tests/`; 4.1: árvore de `src/server/` |
| #22 (tabela dos cabeçalhos de segurança) | Arquitetura, 4 e 6.4 | 7, parágrafo "Complementam essas medidas" (L4) |
| #35 (variáveis de ambiente) | Arquitetura, sem número | 8.2, Quadro 37 |
| #37 (`updatedAt` na entrada de `PUT /api/admin/settings/company`) | Apêndice A, Quadro 48 | já coberto: a introdução do apêndice diz que o `updatedAt` vale para todas as rotas `PATCH` e `PUT` e não é repetido |

## O que muda

Cada item traz a origem (relatório), o lugar e a fonte. Os itens da #35, da #36 e da #37 dependem da L1, e os marcados com L2, da L2.

### Análise do Sistema (`AnaliseDoSistema.docx`)

1. **9.4, parágrafo antes do Quadro 23 (normalização)** (#21): os textos, exceto a senha; tabulação e quebra de linha viram espaço; os demais caracteres de controle saem; o acento separado é unido à letra (NFC); espaços nas pontas e repetidos saem; texto puro; descrição num único parágrafo. Fonte: `docs/plataforma/RN035-formatos-dos-dados.md`.
2. **Quadro 23, linhas** (#21, #23 e #35). Fonte: RN035.
   - Nome e sobrenome: maiúscula também depois do hífen e do apóstrofo; hífen e apóstrofo só entre letras; o apóstrofo tipográfico gravado como `'`.
   - Senha: maiúscula inclusive acentuada; caractere especial é o que não for letra, número ou espaço; gravada como digitada, sem a normalização; 72 bytes em UTF-8; no login, só obrigatória e até 72 bytes (#23).
   - Marca e modelo, nomes de serviço, categoria e cargo, e descrição do cargo ocupado: "as demais letras como digitadas".
   - Ano: até o ano seguinte ao corrente, no fuso da empresa.
   - CNPJ: alfanumérico, sem os catorze caracteres iguais, gravado sem máscara e com as letras em maiúsculas; exibição "12.345.678/0001-95".
   - Instagram e Facebook: domínio ou subdomínio da rede, caminho do perfil e até 200 caracteres.
   - Duração média, coluna Exibição: "1 h 30 min; 45 min; 2 h" (#35).
3. **9.4, parágrafo novo depois do Quadro 23** (#21): os 67 DDDs da Anatel; os caracteres de máscara aceitos e removidos nos telefones e no CNPJ; o +55 não é aceito. Fonte: RN035.
4. **9.4, parágrafo do Quadro 24** (#37): "Uma opcional deixada vazia fica sem valor, e o valor que estava gravado é apagado." Fonte: RN035, depois do PR #54.
5. **8, Quadro 19, RS003** (#21): o limite de 72 conta bytes em UTF-8, e a senha não passa pela normalização dos textos. Fonte: `docs/plataforma/seguranca.md`.
6. **9.1, Quadro 20, RN033** (#36): a data e o horário só são conferidos quando alterados; os status depois da chegada do veículo, por extenso; no "Cancelado", só a disponibilidade. Fonte: `docs/agendamento/RN033-coerencia-da-edicao.md`.
7. **10.2, Quadro 26, UC01, FA01** (#25): as opções do cliente (Agendar, Meus agendamentos e Minha conta) e a de sair. Fonte: `docs/catalogo/UC01-consultar-portal-publico.md`.
8. **Quadro 28, UC03** (#24 e #26): passo 5, "exibe a página inicial do portal, com as opções restritas ao cliente"; FA03, passo 2, "informa a senha inicial e a nova senha". Fonte: `docs/acesso/UC03-autenticar-se-no-portal.md`.
9. **Quadro 33, UC08** (#24 e #26): FA01, passo 2, a senha inicial e a nova senha; FE03, "exibe a primeira página permitida e informa a restrição (RS008, RN025)". Fonte: `docs/acesso/UC08-autenticar-se-no-painel-administrativo.md`.
10. **Quadro 47, UC22, FE01** (#37): RN035, com link, junto do CNPJ e do e-mail em formato inválido. Fonte: `docs/configuracoes/UC22-configurar-dados-da-empresa.md`, depois do PR #54.

Não se aplicam: as mensagens de validação da #21 (condicional) e "As senhas não conferem." da #26, porque o documento não tem mensagens de validação (L4).

### Arquitetura de Software (`ArquiteturaDoSoftware.docx`)

11. **2.2, Quadro 1, Interface** (#25): "Tailwind CSS e shadcn/ui" passa a "Tailwind CSS e shadcn/ui sobre Base UI". Fonte: `docs/plataforma/visao-geral.md`.
12. **3.1, árvore de `src/`** (#21, #22, #25 e #26), no nível de detalhe atual:
    - `app/`: `reset.css` ao lado de `globals.css`;
    - `shared/validation/`: `formats.ts`, `params.ts` e um esquema por módulo;
    - `public/images/`;
    - `tests/`: as subpastas `rules/`, `validation/`, `http/`, `lib/`, `auth/` e `format/`, no lugar da linha única.

    Com a L2, também `shared/constants/`. Fonte: `docs/plataforma/estrutura-de-pastas.md`.
13. **3.1, parágrafo dos layouts** (#25): o que o layout do portal e o do painel têm. Fonte: `docs/padroes/layouts.md`.
14. **3.2, Quadros 4 e 5** (#25, #26 e #37):
    - Quadro 5 com as linhas de `docs/acesso/protecao-das-paginas.md`: visitante em `/set-password`, troca pendente em `/login` e `/register`, o `next` só com caminho interno e o aviso de acesso negado;
    - parágrafo antes do quadro: a página inicial de cada área;
    - Quadro 4: `/admin/settings` em abas (Empresa, Disponibilidade e Formas de pagamento), pela #37.
15. **3.3, Quadro 6** (#35): na linha Base, os componentes do shadcn/ui acrescentados; na linha Comuns, a listagem paginada com busca e filtros no componente, o diálogo de confirmação, o formulário em etapas e o campo monetário. Fonte: `docs/padroes/componentes.md`.
16. **3.4, Comunicação com a API** (#25, #26 e #35):
    - só o 401 `UNAUTHENTICATED` leva a `/login` com a página atual, e a carga da sessão não redireciona;
    - o 403 `PASSWORD_CHANGE_REQUIRED` e o 409;
    - a falha de rede e a resposta fora do formato;
    - os parâmetros de consulta, sem os vazios;
    - as máscaras pelas funções de `src/shared/format`.

    Fonte: `docs/padroes/frontend.md`.
17. **3.5.2, Estado e Formulários** (#25 e #26):
    - os estados da sessão (`loading`, `authenticated`, `visitor` e `unavailable`);
    - os formulários com `Field` e o `Controller` do React Hook Form, sem componente `form` (decisão 0049);
    - os campos de senha com "Mostrar senha" e a confirmação no cadastro e na troca de senha.

    Fonte: `docs/padroes/frontend.md`.
18. **3.5.3, Desempenho** (#35): datas no fuso da empresa, pela constante `COMPANY_TIME_ZONE` (decisão 0053). Fonte: `frontend.md`.
19. **3.5.4, Acessibilidade e Identidade Visual** (#25): o CSS global em `reset.css` e `globals.css` e os padrões de design, na forma da L5. Fonte: `docs/padroes/design.md` e `design-midia.md`.
20. **4.1, árvore de `src/server/`** (#22, #23, #24 e #26): `auth/` com `accounts.ts` e `page-access.ts`; `login-attempts.ts` com as funções SQL; `handler.ts` com o `handleRoute`. Com a L2, também `rules/`. Fonte: `estrutura-de-pastas.md`.
21. **4.2, funções puras** (#36):
    - o total em centavos inteiros, arredondado uma vez, com o meio centavo para cima, e as funções recebendo e devolvendo reais;
    - o início válido inclui a abertura e o fim da pausa e exclui o encerramento e o início da pausa;
    - a previsão que termina num limite fica nele;
    - a data da edição só é conferida quando muda, e o "Cancelado" segue só a disponibilidade.

    Fonte: `docs/agendamento/calculos.md`.
22. **4.3.1, Autenticação** (#23 e #24; citado 3.2 e 5.2):
    - a sessão vale até o logout, com cookies de 400 dias, e é conferida no Supabase Auth a cada requisição (decisão 0046);
    - o logout funciona sem sessão e encerra só a do navegador;
    - a conta desativada, excluída ou sem perfil não inicia sessão;
    - a tentativa é reservada antes de conferir a senha (decisão 0047), e o bloqueio de quinze minutos soma o login e a troca de senha;
    - o 503 quando o Supabase Auth falha.

    Fonte: `docs/acesso/autenticacao.md` e `docs/acesso/dados.md`.
23. **4.3.2, Perfis e Contas** (#23 e #24):
    - o cadastro não inicia sessão;
    - com a troca pendente, o 403 vale fora da troca de senha, do `me` e do logout;
    - a troca confere a senha atual por nova entrada no Supabase Auth, mantém a sessão do navegador e encerra as dos outros aparelhos (decisão 0048).

    Fonte: `autenticacao.md`.
24. **5.2, Quadro 28 e funções SQL** (#23 e #24): a descrição de `failed_count` (contada ao começar cada tentativa; a linha é apagada no login certo); `reserve_login_attempt` e `release_login_attempt` na lista das funções. Fonte: `docs/acesso/dados.md`.
25. **6.1, Desenho Geral** (#23 e #37):
    - `Cache-Control: no-store` em toda resposta da API;
    - o horário do dia em `HH:MM`, no fuso da empresa, sem data nem deslocamento (#37);
    - o opcional ausente, `null` ou vazio gravado e devolvido como `null` (#37).

    Fonte: `docs/padroes/api.md`.
26. **6.2, Validação dos Dados** (#21 e #22; citado 6):
    - o id do caminho é qualquer UUID no formato 8-4-4-4-12, sem exigir versão;
    - o `Origin` com o host da própria requisição, e a gravação sem ele recusada com 403 `FORBIDDEN`;
    - a gravação sem corpo dispensa o formato;
    - 100 KB são 102.400 bytes;
    - o JSON inválido responde 400 sem `fields`;
    - o campo aninhado em `fields` usa o caminho com pontos.

    Fonte: `api.md`.
27. **6.4, Respostas e Erros** (#22, #23, #24 e #37):
    - toda rota usa o `handleRoute`;
    - uma linha de registro por requisição, com o nível pelo resultado e o usuário em toda linha;
    - do erro do banco, o registro guarda só o código e a mensagem;
    - o uso do 503 `SERVICE_UNAVAILABLE`, também no cadastro e na troca de senha;
    - Quadro 33: linha nova `INVALID_CURRENT_PASSWORD` (#24) e a nova mensagem de `VERSION_CONFLICT` (#37);
    - Quadro 34: os novos casos de `warn` (#23).

    Fonte: `docs/padroes/backend.md`, `api.md` e o catálogo de `api.md`.
28. **7, Quadro 35 e Complementos** (#21, #22, #23 e #24):
    - RS003: os 72 bytes em UTF-8 e a senha sem a normalização;
    - RS004: a conferência da senha atual e as sessões;
    - RS006: o bloqueio também na troca de senha, com a reserva da tentativa;
    - RS007: a sessão conferida a cada requisição;
    - Complementos: a política de conteúdo também impede o desvio de links e formulários, e os valores dos cabeçalhos entram como lista (L4).

    Fonte: `docs/plataforma/seguranca.md` e `backend.md`.
29. **8.2, Quadro 37** (#22 e #35): saem as linhas `APP_URL` e `APP_TIMEZONE`; frase nova: o fuso é a constante `COMPANY_TIME_ZONE` (`America/Maceio`), usada pelo navegador e pelo servidor (decisão 0053). Fonte: `docs/plataforma/infraestrutura.md`.
30. **9, Quadro 38** (#22 a #26 e #35): linhas 0045 a 0053, com o texto de cada registro de `docs/decisoes/`, e a 0024, a 0045 e a 0050 marcadas como substituídas, na forma da L3. Com a L2, também a 0032 e a 0036.
31. **Apêndice A, Quadro 39** (#23 e #24):
    - frase antes do quadro: o logout também é público;
    - cadastro: a entrada e a resposta 201;
    - login e `me`: a entrada e os corpos de resposta;
    - troca de senha: 204, 400, 401 `INVALID_CURRENT_PASSWORD` e 429;
    - o 503 onde a rota o usa.

    Fonte: `docs/acesso/rotas.md` e `docs/plataforma/openapi.yaml`.
32. **Apêndice A, Quadro 40** (#37): a resposta de `GET /api/public/company` sem o CNPJ. Fonte: `docs/configuracoes/rotas.md`, depois do PR #54.

### Desenvolvimento com IA (`DesenvolvimentoComIA.docx`)

33. **5.3, Como Programar** (L2): no item das versões recentes, o shadcn/ui sobre Base UI, com `render` no lugar do `asChild` do Radix (decisão 0049), como em `guia/regras.md` desde a #25.
34. **8.1, primeiro parágrafo** (#22, #25 e #26; decisões 0050 e 0052): o Vitest testa as regras, os esquemas, o tratamento único (`tests/http/`), o cliente da API (`tests/lib/`), a formatação (`tests/format/`) e a proteção das páginas (`tests/auth/`); as telas, os componentes, o contexto da sessão e o `proxy.ts` inteiro continuam testados à mão. Fonte: `docs/padroes/testes.md` e a decisão 0052.
35. **8.1, Quadro 9** (#22, #23, #25, #26, #35, #36 e #37), com as linhas de `testes.md`:
    - Cálculo de preço, Datas e previsão e Regras de edição: os casos novos da #36;
    - linhas novas: Tratamento único (#22 e #23), Cliente da API (#25 e #35), Proteção das páginas (#26) e Formatação (#26, #35 e #37);
    - Validação e formatos: o dado opcional vazio e a versão do registro (#37).
36. **8.2, Testes Manuais** (#25): a verificação das telas com a aplicação compilada, em 360 × 800 e 1440 × 900, nos temas claro e escuro, pelo teclado e com o Lighthouse. Fonte: `workflows/procedimentos/testes.md`.

## Ordem da construção

1. Conferir se o PR #54 foi incorporado (L1) e criar `docs/38-formal-documents` da `origin/main`, sem vínculo com a `main`.
2. Copiar os originais e os scripts da #19 para o scratchpad. Acrescentar ao motor as operações que faltam: linha nova num quadro, copiada da vizinha; linha removida; e, com a L3, a coluna "Nº" do Quadro 38.
3. Escrever as operações de cada documento a partir dos módulos, item por item.
4. Aplicar nas cópias, um documento por vez: editar, atualizar o sumário (`TablesOfContents.Update`), salvar e exportar em PDF.
5. Conferir (seção abaixo); corrigir e repetir a partir dos originais, se preciso.
6. Levar as cópias ao repositório e fazer um commit por documento; rodar `npm run check`.
7. Etapa 03: `02_relatorio.md` com o resumo por documento (L7), o PR com a lista por seção e a comparação do Word para o Yvan.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado cada item das seções "Documentos formais a atualizar" dos seis relatórios, quando procuro o trecho no `.docx` indicado, então ele está atualizado | Texto extraído antes e depois de cada documento, comparado sem as linhas do sumário: só mudam os trechos dos itens 1 a 36. O relatório lista cada item dos relatórios com o lugar em que entrou, ou o motivo de não ter entrado (não se aplica ou já coberto) |
| Dado o Quadro 38, então ele traz as decisões até a 0053, com a 0024, a 0045 e a 0050 marcadas como substituídas | Texto extraído do quadro, comparado com `docs/decisoes/CONTEXT.md`. A issue pede até a 0052; a 0053, da #35, entra pelo pedido desta etapa |
| Dado os `.docx` alterados, quando os abro no Word, então abrem sem reparo, com o sumário atualizado | Conferência abaixo, pelo agente, e abertura pelo Yvan no Word antes de aprovar o PR |
| Dado o PR, quando o CI roda, então o `npm run check` passa | `npm run check` local e o check `check` do PR |

### Como a conferência é feita

- **Abertura sem reparo.** Cada `.docx` salvo é aberto de novo no Word, por automação e só para leitura, direto da pasta do repositório; a abertura não pode dar erro, aviso de conteúdo ilegível nem modo protegido. Antes, `unzip -t` confere o pacote.
- **Sumário.** Atualizado pelo Word antes de salvar. Depois, um script compara cada entrada do sumário com o título correspondente: o mesmo texto, o mesmo número da seção e a mesma página (`Range.Information`).
- **Texto.** A extração do `word/document.xml` antes e depois, por um script Node.js no scratchpad, como o desta etapa, com o diff conferido item a item.
- **Imagem.** As páginas alteradas e as seguintes são exportadas em PDF pelo Word e renderizadas em PNG (`Windows.Data.Pdf`, como na #19), para conferir a fonte, o itálico, o Courier, os links, o cabeçalho repetido dos quadros e a paginação.
- **Links.** Os links novos de identificadores apontam para o marcador certo, e os antigos continuam iguais em quantidade.

## Arquivos

| Arquivo | Ação |
|---|---|
| `documentos-formais/AnaliseDoSistema.docx` | alterar (itens 1 a 10) |
| `documentos-formais/ArquiteturaDoSoftware.docx` | alterar (itens 11 a 32) |
| `documentos-formais/DesenvolvimentoComIA.docx` | alterar (itens 33 a 36) |
| `memoria/tarefas/38-documentos-formais/` | `01_plano.md` e `notas.md` nesta etapa; `02_relatorio.md` na etapa 03 |

Nenhum módulo de `docs/` muda, nem o código, o `package.json` ou o `.gitattributes`.

### Em comum com outras tarefas em andamento

- **PR #54 (#37):** não toca nos `.docx`, mas o relatório dele lista os itens 4, 10, 14 (Quadro 4), 25, 27, 32 e 35 (L1).
- Um `.docx` não se incorpora: duas ramificações que o alterem entram em conflito sem solução automática, e uma refaz a edição. Até o PR desta tarefa ser incorporado, nenhuma outra tarefa altera `documentos-formais/`; as próximas só listam os itens no relatório, como hoje.

## Testes previstos

Nenhum teste automatizado: a tarefa não muda código (decisões 0035 e 0052).

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Itens da #35, da #36 e da #37

**Problema.** A issue cita só os relatórios da #21 à #26, mas os da #35 e da #36, já na `main`, e o da #37, no PR #54 em revisão, também listam documentos formais a atualizar, nos mesmos quadros (Quadros 9, 20, 23, 33, 37 e 38, seções 3, 4.2, 6 e Apêndice A). O Quadro 38 até a 0053 já traz uma decisão da #35. Os textos da #37 só são fonte depois que o PR #54 for incorporado.

**Opções:**

- [x] **1. A #35 e a #36 entram; a #37 entra se o PR #54 for incorporado antes da construção (recomendada).** Os documentos ficam em dia com tudo o que está na `main`, numa única passada em cada quadro. Se o #54 ainda estiver aberto na etapa 02, os itens 4, 10, 32 e as partes da #37 nos itens 14, 25, 27 e 35 ficam para a próxima issue de documentos formais, e o relatório desta tarefa os lista.
- [ ] **2. A #35 e a #36 entram; a #37 vai para uma issue nova de qualquer forma.** O escopo não depende do PR #54, mas os Quadros 9, 33 e o Apêndice A são abertos de novo logo depois.
- [ ] **3. Só a #21 à #26, com o Quadro 38 até a 0053; a #35, a #36 e a #37 numa issue nova.** Segue o texto da issue, mas a próxima tarefa repete a passada nos mesmos quadros, e a 0053 entra antes do resto da #35.

**Texto proposto (opção 1):** nenhum módulo muda. O relatório desta tarefa registra os itens da #35, da #36 e da #37 em "Documentos formais a atualizar" como feitos, ou os da #37 como pendentes, se o #54 não tiver sido incorporado.

### L2. Achados da leitura, fora dos relatórios

**Problema.** Lendo os `.docx`, apareceram três diferenças com os módulos que nenhum relatório listou:

- o Desenvolvimento com IA, seção 5.3, reproduz o item de `guia/regras.md` sobre as versões recentes da stack, que ganhou na #25 o shadcn/ui sobre Base UI, com `render` no lugar do `asChild` (decisão 0049);
- as árvores da Arquitetura não têm `src/shared/constants/` (3.1) nem `src/server/rules/` (4.1), que `docs/plataforma/estrutura-de-pastas.md` já tem;
- o Quadro 38 não tem a 0032 (proteção das páginas em `src/proxy.ts`) nem a 0036 (organização das pastas), que são de arquitetura; as que faltam além delas (0031, 0033 a 0035 e 0039 a 0041) são de processo e estão no Desenvolvimento com IA.

**Opções:**

- [x] **1. Os três entram nesta tarefa (recomendada).** São trechos curtos, com fonte nos módulos e nos registros, nos mesmos lugares que esta tarefa já altera (itens 12, 20, 30 e 33). Com a coluna "Nº" da L3, o Quadro 38 fica sem lacuna de número sem explicação.
- [ ] **2. Ficam de fora.** Esta tarefa fica restrita aos relatórios, e o relatório dela lista os três achados para uma issue futura.

**Texto proposto (opção 1):** o dos itens 12, 20, 30 e 33. Nenhum módulo muda.

### L3. Decisões substituídas no Quadro 38

**Problema.** O Quadro 38 não tem número nas decisões. A issue pede a 0045 e a 0050 marcadas como substituídas, e o relatório da #22 sugere trocar no lugar o texto da linha da 0024 ("Testes automatizados apenas das regras de negócio"). Em `docs/decisoes/CONTEXT.md`, a substituída continua na lista, com "(substituída por NNNN)" no título.

**Opções:**

- [x] **1. Coluna "Nº" e marcação como no índice (recomendada).** Primeira coluna, estreita, com o número de quatro dígitos de cada registro. As linhas da 0024, da 0045 e da 0050 ficam com o texto que têm e ganham, na coluna Decisão, "(substituída por 0045)", "(substituída por 0050)" e "(substituída por 0052)". As linhas novas entram em ordem de número. O parágrafo antes do quadro ganha: "O número é o do registro em docs/decisoes/; as decisões de processo estão na Documentação de Desenvolvimento com IA." As outras colunas estreitam um pouco.
- [ ] **2. Sem coluna nova, com a marcação por extenso.** A linha substituída ganha "(substituída pela decisão “<título da que a substitui>”)". Nada muda na largura, mas as marcações ficam longas, e a 0045 aparece substituída pela 0050, que também é substituída.
- [ ] **3. Só as decisões vigentes.** A linha da 0024 passa a ter o texto da 0052, e a 0045 e a 0050 não aparecem. O quadro fica mais curto, mas perde o histórico, e o critério da issue muda para "sem as substituídas".

**Texto proposto (opção 1):** o do item 30 e o parágrafo acima. Nenhum módulo muda.

### L4. Conteúdo que pediria quadro novo

**Problema.** Dois itens trazem tabelas que os documentos não têm:

- a #21 (condicional) e a #26 pedem as mensagens de validação na Análise, que não tem nenhuma (`docs/plataforma/mensagens-de-validacao.md` tem 22);
- a #22 pede a tabela de valores dos cabeçalhos de segurança, que a Arquitetura só nomeia, na seção 7.

As legendas usam campo `SEQ` e se renumeram sozinhas, mas as citações "Quadro N" no texto são texto simples: um quadro novo na Análise, depois do Quadro 24, renumera os Quadros 25 a 51 e as citações deles; na Arquitetura, depois do 35, renumera do 36 ao 48. Os cabeçalhos de vários módulos de `docs/` citam esses números (por exemplo, "Quadro 38" em `docs/padroes/testes.md`), e a issue deixa `docs/` fora do escopo.

**Opções:**

- [x] **1. Sem quadro novo (recomendada).** Na Análise, as mensagens não entram: o documento define os formatos, e as mensagens são texto da interface, que fica no módulo; os dois itens são registrados como "não se aplica". Na Arquitetura, os valores dos cabeçalhos entram como lista no parágrafo "Complementam essas medidas" da seção 7, com os cinco cabeçalhos.
- [ ] **2. Quadros novos.** "Mensagens de validação" depois do Quadro 24 da Análise e "Cabeçalhos de segurança" na seção 7 da Arquitetura, com a renumeração dos quadros seguintes e das citações no texto dos dois documentos. Os módulos de `docs/` que citam os números antigos ficam desatualizados até outra issue.

**Texto proposto (opção 1):** na Arquitetura, seção 7, depois de "configurados em next.config.ts": a lista dos valores de `docs/padroes/backend.md` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=63072000`, `Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`), com a frase de que a política não restringe os scripts e que, contra XSS, vale o escape do React. Nenhum módulo muda.

### L5. Quanto do frontend novo entra na seção 3

**Problema.** A #25 pede na seção 3 "padrões de design (cores dos dois temas com o contraste, tipografia, escalas, sombras, estados, ícones e imagens)". Esse conteúdo é de `docs/padroes/design.md` (7,8 mil caracteres, com seis tabelas), `design-midia.md` e `layouts.md`, criados na #25, e não veio dos `.docx`. Hoje a seção 3.5.4 tem um item sobre as variáveis do tema em `globals.css`.

**Opções:**

- [x] **1. Resumo em texto na 3.5.4 (recomendada).** Cerca de um parágrafo e meio, sem quadro: o neomorfismo suave, os dois temas pela preferência do sistema, o laranja só como preenchimento com texto escuro, o contraste mínimo (4,5:1 no texto, 3:1 na borda de campo e no foco), a Nunito, as escalas derivadas de φ, as sombras duplas e os estados, os ícones do Lucide e as imagens pelo `next/image`. Os valores exatos ficam nos módulos, como já acontece com os padrões de código.
- [ ] **2. Reprodução completa.** Subseções novas com as tabelas de cores, tipografia, espaçamento, raios, estados e componentes, como quadros novos depois do Quadro 6, que renumeram os seguintes (ver L4). O documento cresce cerca de quatro páginas, e cada ajuste de cor passa a exigir uma tarefa de documentos formais.

**Texto proposto (opção 1):** o resumo acima, no item 19. Nenhum módulo muda.

### L6. Um PR ou um por documento

**Problema.** São três documentos e 36 itens, a maioria na Arquitetura. `workflows/procedimentos/pull-request.md` limita o tamanho pelo número de linhas, o que não se aplica a um `.docx`, cuja revisão é pela lista de alterações (decisão 0040).

**Opções:**

- [x] **1. Um PR, com um commit por documento (recomendada).** Uma revisão e uma aprovação, com `Closes #38`; os itens que valem para dois documentos (RS003, as decisões 0050 e 0052) ficam juntos. A descrição separa as alterações por documento.
- [ ] **2. Um PR por documento**, na ordem Análise, Desenvolvimento com IA e Arquitetura. Cada revisão é menor, mas são três aprovações e três esperas do CI, e a issue só fecha no último.

**Texto proposto (opção 1):** nenhum arquivo muda; vale para esta tarefa.

### L7. Como a revisão vê a mudança dos `.docx`

**Problema.** O diff de um `.docx` é binário. A decisão 0040 manda o PR descrever por seção o que mudou, como na #19, mas o revisor não tem como conferir o texto de cada item sem abrir os dois documentos.

**Opções:**

- [x] **1. Lista no PR, resumo no relatório e comparação do Word (recomendada).** A descrição do PR lista as alterações por documento e seção. O `02_relatorio.md` traz, por documento, cada item com o lugar e um resumo do texto anterior e do novo. Para o Yvan, o agente gera no scratchpad a comparação do Word (`CompareDocuments`, a mesma de Revisar → Comparar) entre o original e o alterado, com as mudanças marcadas, fora do repositório. A descrição do PR explica como qualquer revisor gera a mesma comparação, com o `.docx` da `main` e o da ramificação. Os `.docx` versionados ficam sem marcas de revisão.
- [ ] **2. Também o texto extraído no repositório**, por exemplo `documentos-formais/texto/*.md`, gerado a cada alteração, para o GitHub mostrar o diff. A revisão fica legível, mas cada tarefa de documentos formais passa a manter seis arquivos, o texto duplica o de `docs/`, e a mudança pede uma decisão nova sobre a 0040.
- [ ] **3. Só a lista no PR, como na #19.** Nenhum esforço a mais, e o revisor confia na lista.

**Texto proposto (opção 1):** nenhum arquivo muda; o relatório diz se a comparação do Word funcionou, para uma próxima tarefa adotá-la no procedimento de PR.

## Decisões técnicas

Nenhuma nova.

- Seguidas:
  - 0040: documentos formais versionados, abertos pelo agente a pedido do desenvolvedor, e o PR descreve por seção o que mudou;
  - 0045 a 0053: os textos que entram no Quadro 38 e nas seções;
  - 0035 e 0052: sem teste automatizado, porque não há código.
- Escolha local, sem registro: a edição pelo Word por automação, com o motor da #19.

## Riscos e dúvidas

- **Automação do Word.** Na #19, o Word travou só ao exportar em `.txt`; abrir, editar, atualizar o sumário, salvar e exportar em PDF funcionaram com o Word invisível. O texto é extraído do XML, sem o Word. Se o Yvan estiver com um dos `.docx` aberto, a gravação falha: peço para fechar.
- **Formatação.** A substituição de frases inteiras perdeu o Courier e o itálico na primeira passada da #19. Por isso o texto novo entra antes ou depois do existente, com a marcação de código e de itálico do motor.
- **Paginação.** Com cerca de três páginas novas na Arquitetura, quadros e figuras mudam de página. As páginas seguintes às alterações também são conferidas em imagem, e o sumário é conferido entrada por entrada.
- **Tamanho.** É a maior tarefa de documentos formais até aqui: 36 itens contra 15 na #19. A conferência é feita por documento, para um erro não exigir refazer os três.
- **PR #54.** Com a opção 1 da L1, se ele for incorporado durante a construção, a ramificação recebe a `main` por merge (decisão 0033) antes dos itens da #37.
- **Cabeçalho de RN035.** O `origem` de `docs/plataforma/RN035-formatos-dos-dados.md` cita "seção 9.1 (Quadro 20)", mas a tabela de formatos está na 9.4, Quadros 23 e 24. Fica como está, porque a issue deixa `docs/` fora; o relatório o lista.

## Fora do escopo

- Mudanças em `docs/` ou no código (issue).
- Itens de tarefas posteriores à #37 (#39 em diante).
- O exemplo do `AGENTS.md` na seção 3.1 do Desenvolvimento com IA: é declarado resumido e continua valendo.
- Os cabeçalhos `origem` dos módulos que citam outro número de seção.

## Estado da construção

Feito dentro do plano aprovado, na ramificação `docs/38-formal-documents` (commits f1a9a67, 3eda345 e 2453b37): os itens 1 a 36, com a opção 1 em L1 a L7 e os itens da #37 (PR #54 incorporado antes da construção). `npm run check` aprovado, com 371 testes. Os desvios pequenos (RS003 do Quadro 19 sem mudança, o Quadro 5 na ordem do módulo, o opcional vazio na 6.2, o 503 antes do Quadro 39 e as correções de diagramação) estão em `notas.md`. Relatório em `02_relatorio.md`.
