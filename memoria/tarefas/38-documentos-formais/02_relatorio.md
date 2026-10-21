---
issue: 38
pull_request: 55
---

# Relatório: Documentos formais atualizados com a #21 à #26

## O que foi feito

Os três `.docx` de `documentos-formais/` passaram a dizer o mesmo que os módulos de `docs/` depois da #21 à #26, da #35, da #36 e da #37 (o PR #54 foi incorporado antes da construção, L1). O Quadro 38 da Arquitetura ganhou a coluna "Nº" e vai até a decisão 0053, com a 0024, a 0045 e a 0050 marcadas como substituídas (L3). Nenhum módulo de `docs/` nem o código mudaram.

A edição foi feita pelo Word, por automação, em cópias, com o motor da #19 e operações novas (`notas.md`). Cada texto veio do módulo citado no plano.

## Alterações por documento

O número é o do item do plano. "Antes" e "depois" resumem o texto; o texto completo está nos documentos e na comparação do Word.

### Análise do Sistema (`AnaliseDoSistema.docx`)

1. **9.4, parágrafo da normalização.** Antes: remove espaços e caracteres de controle. Depois: exceto na senha, tabulação e quebra de linha viram espaço, o acento é unido à letra (NFC) e as descrições ficam num parágrafo.
2. **Quadro 23.**
   - Nome e sobrenome: maiúscula depois do hífen e do apóstrofo; os dois só entre letras; apóstrofo tipográfico gravado como `'`.
   - Senha: maiúscula acentuada; caractere especial definido; sem normalização; 72 bytes em UTF-8; no login, só obrigatória e até 72 bytes (RS005).
   - Marca e modelo: "preservando as siglas digitadas em maiúsculas" → "as demais letras ficam como digitadas".
   - Ano: "até o ano corrente" → "até o ano seguinte ao corrente", no fuso da empresa.
   - CNPJ: "catorze algarismos" → alfanumérico, sem os catorze iguais, gravado sem máscara; exemplo "…0001-90" → "…0001-95".
   - Instagram e Facebook: domínio ou subdomínio, caminho do perfil, até 200 caracteres.
   - Nomes de serviço, categoria e cargo, e descrição do cargo: "e as demais letras como digitadas".
   - Duração, exibição: "1 h 30 min" → "1 h 30 min; 45 min; 2 h".
3. **9.4, parágrafo novo depois do Quadro 23:** os 67 DDDs, os caracteres de máscara aceitos e o +55 recusado.
4. **9.4, parágrafo do Quadro 24:** a opcional deixada vazia fica sem valor e apaga o gravado.
5. **8, Quadro 19, RS003:** sem mudança (ver "Itens dos relatórios").
6. **9.1, Quadro 20, RN033:** a data e o horário só são conferidos quando alterados; os status depois da chegada do veículo por extenso; no "Cancelado", só a disponibilidade.
7. **Quadro 26, UC01, FA01:** as opções do cliente (Agendar, Meus agendamentos e Minha conta) e a de sair.
8. **Quadro 28, UC03:** passo 5, "a área restrita ao cliente" → "a página inicial do portal, com as opções restritas ao cliente"; FA03, passo 2, "a senha inicial e a nova senha".
9. **Quadro 33, UC08:** FA01, passo 2, "a senha inicial e a nova senha"; FE03, "exibe a primeira página permitida", com RN025.
10. **Quadro 47, UC22, FE01:** RN035 junto do CNPJ e do e-mail em formato inválido.

Novos links: RS005, RN025 e RN035. Páginas: 55, como antes.

### Arquitetura de Software (`ArquiteturaDoSoftware.docx`)

11. **Quadro 1, Interface:** "Tailwind CSS e shadcn/ui" → "… sobre Base UI".
12. **3.1, árvore de `src/`:**
    - `globals.css` e `reset.css`;
    - `validation/` com `formats.ts`, `params.ts` e um esquema por módulo;
    - `constants/` (L2);
    - `public/`;
    - `tests/` com as subpastas `rules/`, `validation/`, `http/`, `lib/`, `auth/` e `format/`.
13. **3.1, layouts:** o cabeçalho e o rodapé do portal (RN028), a navegação do painel e o aviso de acesso negado nos dois.
14. **3.2:**
    - o `proxy.ts` confere sessão e conta como os guards, por `decidePageAccess`, com `Cache-Control: private, no-store`;
    - parágrafo novo: a página inicial de cada área, o parâmetro `next` e o aviso de acesso negado (RN025, RS008);
    - Quadro 4: `/admin/settings` em abas;
    - Quadro 5 reescrito com as oito situações de `protecao-das-paginas.md`.
15. **Quadro 6:** a linha Base com os componentes do shadcn/ui acrescentados; a linha Comuns com a listagem paginada e as peças dos formulários.
16. **3.4:**
    - só o 401 `UNAUTHENTICATED` leva ao login, com o `next`;
    - itens novos: a falha de rede, a resposta fora do formato e os parâmetros de consulta;
    - as máscaras pelas funções de exibição, sem biblioteca.
17. **3.5.2:** os quatro estados da sessão; os formulários com `Field` e `Controller`; item novo dos campos de senha, com "Mostrar senha" e a confirmação.
18. **3.5.3:** datas no fuso da empresa, pela constante `COMPANY_TIME_ZONE`.
19. **3.5.4:** item novo do CSS global; parágrafo novo da identidade visual (L5).
20. **4.1, árvore de `src/server/`:** `login-attempts.ts` com as funções SQL, `accounts.ts`, `page-access.ts`, `handleRoute` e `rules/` (L2).
21. **4.2:**
    - as funções puras em `src/server/rules/`;
    - reais na fronteira e centavos por dentro, com o meio centavo para cima;
    - os limites do expediente e da pausa e a previsão no limite;
    - o "Cancelado" e a data mantida na edição.
22. **4.3.1:**
    - a sessão vale até o logout, com cookies de 400 dias, e é conferida a cada requisição;
    - o logout encerra só a sessão do navegador e funciona sem sessão;
    - a conta desativada, excluída ou sem perfil;
    - o bloqueio soma login e troca de senha, com a tentativa reservada e o 503.
23. **4.3.2:**
    - o cadastro não inicia sessão;
    - a senha pendente é aceita no `me` e no logout;
    - a troca de senha confere a senha atual por nova entrada e encerra as sessões dos outros aparelhos.
24. **5.2:** no Quadro 28, a descrição de `failed_count`; frase nova com `reserve_login_attempt` e `release_login_attempt`.
25. **6.1 e 6.2:**
    - o horário do dia em `HH:MM`;
    - `Cache-Control: no-store` em toda resposta;
    - item novo do dado opcional vazio (`null`).
26. **6.2:**
    - UUID no formato 8-4-4-4-12, sem exigir a versão;
    - a gravação sem corpo;
    - 102.400 bytes;
    - o JSON inválido;
    - item novo do `Origin` (RS014).
27. **6.4:**
    - o `handleRoute`;
    - o campo aninhado em `fields`;
    - o erro do banco no registro, a linha por requisição e o usuário em toda linha;
    - parágrafo novo do 503;
    - Quadro 33: linha `INVALID_CURRENT_PASSWORD` e a nova mensagem de `VERSION_CONFLICT`;
    - Quadro 34: o `info` por resultado e os novos casos de `warn`.
28. **7:**
    - Quadro 35: RS003, RS004, RS006 e RS007;
    - Complementos: o desvio de links e formulários;
    - frase nova e lista a) a e) com os valores dos cabeçalhos, mais o parágrafo dos scripts e do XSS (L4).
29. **8.2:** sem `APP_URL` e `APP_TIMEZONE` no Quadro 37; frase nova da constante `COMPANY_TIME_ZONE`.
30. **9, Quadro 38:**
    - coluna "Nº" e frase nova antes do quadro;
    - "(substituída por 0045)" na 0024;
    - linhas novas: 0032 e 0036 (L2) e 0045 a 0053, com a 0045 e a 0050 marcadas como substituídas.
31. **Apêndice A, Quadro 39:** a frase antes do quadro (logout público, senha pendente e 503); os corpos do cadastro, do login e do `me`; o logout sem sessão; as respostas da troca de senha.
32. **Apêndice A, Quadro 40:** `GET /api/public/company` sem o CNPJ, com o opcional vazio como `null`.

Novos links: RN028, RN025 (três vezes), RS008, RF010, RN001, RS004, RN029, RS010, RS014 (duas vezes), RS007, RS006 e RS003; saem os quatro do Quadro 5 antigo. Páginas: 72, eram 67.

### Desenvolvimento com IA (`DesenvolvimentoComIA.docx`)

33. **5.3:** o shadcn/ui sobre Base UI, com `render` no lugar do `asChild` (L2).
34. **8.1, primeiro parágrafo:** o Vitest testa também o tratamento único, o cliente da API, a formatação e a proteção das páginas; as pastas de `tests/`; o que continua à mão.
35. **Quadro 9:** os casos novos de preço, datas, edição e validação; linhas novas Tratamento único, Cliente da API, Proteção das páginas e Formatação.
36. **8.2, parágrafo novo:** a verificação das telas em 360 e 1440 pixels, nos dois temas, pelo teclado e com o Lighthouse.

Novos links: 13 identificadores no Quadro 9. Páginas: 34, eram 33.

## Itens dos relatórios

Cada item das seções "Documentos formais a atualizar", com o item deste relatório em que entrou.

- **#21:** RN035, normalização (1); senha, nomes, letras como digitadas, ano, CNPJ e redes sociais (2); DDDs e máscaras (3); RS003 na Arquitetura (28); id do caminho (26); `src/shared/validation` (12).
  - Mensagens de validação: não se aplica; a Análise não tem mensagens (L4).
  - RS003 no Quadro 19 da Análise: não muda. O texto do requisito em `seguranca.md` é o mesmo; os 72 bytes e a senha sem normalização são da implementação (itens 2 e 28).
- **#22:** decisão 0045 (30); tratamento único nos testes (34, 35); `APP_URL` (29); `Origin`, gravação sem corpo, 102.400 bytes, JSON inválido e campo aninhado (26, 27); linha por requisição e `handleRoute` (27, 20); valores dos cabeçalhos (28, L4); política de conteúdo (28); `tests/http/` (12).
- **#23:** decisões 0046 e 0047 (30); sessão, logout, conta e senha pendente (22, 23); bloqueio e funções SQL (22, 24); login, `me` e logout no Apêndice A (31); `Cache-Control` e 503 (25, 27); usuário no registro e casos de `warn` (27); RS006 e RS007 (28); senha no login (2); casos do tratamento único (35).
- **#24:** UC03 FA03 e UC08 FA01 (8, 9); decisão 0048 (30); cadastro sem sessão, troca de senha e bloqueio somado (22, 23); cadastro e troca de senha no Apêndice A (31); `INVALID_CURRENT_PASSWORD` e 503 (27, 31); `accounts.ts` (20); erro do banco no registro (27); RS004 e RS006 (28).
- **#25:** UC01 FA01 (7); decisões 0049 e 0050 (30); stack (11); formulários e estados da sessão (17); `api-client` (16); CSS global e design (19, L5); layouts (13); parâmetro `next` (14); `reset.css`, `tests/lib/` e `public/` (12); testes do cliente da API e verificação das telas (34, 35, 36).
- **#26:** UC03 passo 5 e UC08 FE03 (8, 9); decisões 0051 e 0052 (30); proteção das páginas (14); campos de senha e máscaras (17, 16); `page-access.ts`, `tests/auth/` e `tests/format/` (20, 12); testes da formatação e da proteção (34, 35).
  - "As senhas não conferem.": não se aplica (L4).
- **#35:** duração (2); `APP_TIMEZONE` (29); decisão 0053 (30); componentes (15); datas no fuso (18); testes de formatação e de parâmetros de consulta (35).
- **#36:** funções puras (21); RN033 (6); casos dos testes (35).
- **#37:** opcional vazio (4, 25); UC22 (10); abas de `/admin/settings` (14); `GET /api/public/company` sem o CNPJ (32); `HH:MM` (25); mensagem de `VERSION_CONFLICT` (27); testes de validação e de formatação (35).
  - `updatedAt` na entrada de `PUT /api/admin/settings/company`: já coberto. A introdução do Apêndice A diz que o campo vale para todas as rotas `PATCH` e `PUT` e não é repetido.
- **Achados da leitura (L2):** `constants/` e `rules/` nas árvores (12, 20), decisões 0032 e 0036 (30), Base UI na 5.3 (33).

## Arquivos alterados

- `documentos-formais/AnaliseDoSistema.docx` (itens 1 a 10, commit f1a9a67).
- `documentos-formais/DesenvolvimentoComIA.docx` (itens 33 a 36, commit 3eda345).
- `documentos-formais/ArquiteturaDoSoftware.docx` (itens 11 a 32, commit 2453b37).
- `memoria/tarefas/38-documentos-formais/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: aprovado, com 371 testes. A tarefa não tem código nem teste automatizado (decisões 0035 e 0052).
- **Texto:** extraído do `word/document.xml` de cada documento e comparado com o original, sem as linhas do sumário: só mudam os trechos dos itens 1 a 36.
- **Abertura e sumário:** os três abrem no Word por automação, só para leitura e sem reparo; `unzip -t` sem erro. Cada entrada do sumário confere com o título, no texto e na página (44, 53 e 39 entradas, nenhuma divergência).
- **Links:** Análise 403 → 406, Arquitetura 282 → 293, Desenvolvimento com IA 67 → 80, os novos com o marcador do identificador.
- **Imagem:** as páginas alteradas exportadas em PDF pelo Word, renderizadas em PNG e conferidas uma a uma. A conferência achou problemas de diagramação, corrigidos antes do commit (`notas.md`):
  - um parágrafo com o estilo da legenda;
  - espaço a mais depois de quadros;
  - quebras de linha ruins em "Zod 4", "φ = 1,618", "8-4-4-4-12" e `INVALID_CURRENT_PASSWORD`.
- **Comparação do Word (L7):** gerada fora do repositório, com 52, 247 e 30 revisões, e entregue ao Yvan.
- **Pré-visualização:** nada visível muda; basta o build da Vercel concluir.

## Documentação atualizada

- **Módulos:** nenhum de `docs/`.
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (itens da #35, #36 e #37) → entraram, com o PR #54 incorporado antes da construção;
  - L2 (achados da leitura) → itens 12, 20, 30 e 33;
  - L3 (substituídas no Quadro 38) → coluna "Nº" e "(substituída por NNNN)";
  - L4 (quadro novo) → nenhum quadro novo; mensagens fora da Análise; cabeçalhos em lista na seção 7;
  - L5 (design na seção 3) → resumo em texto na 3.5.4;
  - L6 (tamanho) → um PR, um commit por documento;
  - L7 (revisão) → lista no PR, resumo neste relatório e comparação do Word.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar:** nenhum. Os itens pendentes da #21 à #26 e da #35 à #37 entraram nesta tarefa.

## Pendências

- Antes de aprovar o PR, o Yvan abre os três documentos no Word, para o critério "abrem sem reparo".
- O cabeçalho `origem` de `docs/plataforma/RN035-formatos-dos-dados.md` cita "seção 9.1 (Quadro 20)", e a tabela está na 9.4, Quadros 23 e 24. Ficou como está, porque a issue deixa `docs/` fora.
