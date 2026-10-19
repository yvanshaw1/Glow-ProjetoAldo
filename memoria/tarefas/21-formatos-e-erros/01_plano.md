---
issue: 21
titulo: "Formatos de dados (RN035), catálogo de erros e tipos comuns da API em src/shared"
areas: [backend, testes]
tipo: funcionalidade
requisitos: [RN035, RS003, RS013, RS017, RNF008]
status: concluido
aprovado_por: yvan  
aprovado_em: 00:04 19/10/2024
---

# Plano: Formatos de dados (RN035), catálogo de erros e tipos comuns da API em src/shared

## Objetivo

Criar em `src/shared` o que o servidor e as páginas vão usar para validar a entrada e responder:

- os esquemas Zod dos formatos de RN035, que normalizam e depois validam, escritos com TDD (decisão 0035);
- os esquemas do id no caminho e da paginação (`docs/padroes/api.md`, RNF008);
- o catálogo dos 19 códigos de erro de `api.md`, com status e mensagem, e a classe `AppError` (RS017);
- as constantes de paginação e os tipos da resposta paginada e do Problem Details (decisão 0025).

Nenhuma rota ou tela muda. Os esquemas do corpo de cada rota ficam para as tarefas dos módulos, que compõem estes formatos; a #22 usa o catálogo no tratamento único. Esta tarefa também faz o que a #4 pedia, fechada como "not planned": tira o `passWithNoTests` e o `TODO(#4)` do `vitest.config.ts`, porque passam a existir testes.

## Como fica `src/shared`

| Arquivo | Conteúdo |
|---|---|
| `validation/formats.ts` | `normalizeText`, um esquema por formato de RN035 (tabela abaixo), as mensagens de cada um (L11) e os limites como constantes nomeadas |
| `validation/params.ts` | `idSchema` (L10) e `paginationSchema(defaultPageSize)` |
| `errors/catalog.ts` | `ERROR_CATALOG`, com `status` e `message` de cada código, e o tipo `ErrorCode` |
| `errors/app-error.ts` | `AppError(code, { fields, retryAfterSeconds })`: o código do catálogo e, quando houver, as mensagens por campo e o `Retry-After`; o que falta é `null` |
| `constants/pagination.ts` | `MAX_PAGE_SIZE` = 50, `CATALOG_PAGE_SIZE` = 12, `SHORT_LIST_PAGE_SIZE` = 10 e `ADMIN_LIST_PAGE_SIZE` = 20, conforme a tabela de `api.md` |
| `api/pagination.ts` | `Page<T>`: `{ data, page, pageSize, total }` |
| `api/problem.ts` | `ProblemDetails`: `type`, `title`, `status`, `detail`, `instance`, `code`, `fields` (só no `VALIDATION_ERROR`) e `requestId` |

Os esquemas de texto passam primeiro por `normalizeText` (L2), exceto a senha (L3). Campo obrigatório ausente ou vazio depois da normalização recebe a mensagem de obrigatório; qualquer outra falha, a mensagem do formato. Ser obrigatório ou opcional é decidido pelo esquema do módulo.

| Esquema | Dado de RN035 | Saída |
|---|---|---|
| `personNameSchema` | nome e sobrenome | "Maria da Silva" (L4) |
| `emailSchema` | e-mail | minúsculas |
| `mobilePhoneSchema` | celular do cliente e WhatsApp da empresa | 11 algarismos (L5) |
| `companyPhoneSchema` | telefone da empresa | 10 ou 11 algarismos (L5) |
| `passwordSchema` | senha | como digitada (L3) |
| `plateSchema` | placa | maiúsculas, sem hífen |
| `vehicleBrandModelSchema` | marca e modelo | inicial de cada palavra maiúscula (L6) |
| `vehicleColorSchema` | cor | "Azul marinho" |
| `vehicleYearSchema(currentYear)` | ano (L7) | inteiro |
| `moneySchema` | valores em reais | número em reais; a conversão para centavos fica nas regras do servidor (`api.md`) |
| `percentSchema` | percentual da forma de pagamento | número |
| `durationMinutesSchema` | duração média | inteiro |
| `cnpjSchema` | CNPJ (L8) | 14 caracteres, sem máscara |
| `instagramUrlSchema`, `facebookUrlSchema` | endereços das redes sociais (L9) | como digitado |
| `entityNameSchema` | nomes de serviço, categoria e cargo | inicial maiúscula (L6); a unicidade fica com o serviço do módulo |
| `jobTitleSchema` | descrição do cargo ocupado | inicial maiúscula (L6) |
| `halfHourTimeSchema` | horário de funcionamento e de pausa | "HH:MM", só :00 e :30; a coerência do expediente fica com o módulo `settings` |
| `plainTextSchema(maxLength)` | nome da empresa (100), endereço (200) e descrições (500) | texto puro, sem tirar nem escapar HTML |
| `searchTermSchema` | termo de busca | até 100 caracteres |

Fora daqui, por dependerem do banco, da configuração ou de mais de um campo: data e horário do agendamento (RN013), período do dashboard, coerência entre abertura, encerramento e pausa, e unicidade de nomes, e-mail e placa.

## Ordem da construção

1. Instalar `zod` 4.6.7, com versão exata, como as outras dependências de execução, e gerar o `package-lock.json` com npm 11.19 ou mais novo (`npx -y npm@11.21.1 install --save-exact zod@4.6.7`). O npm 11.6.2 desta máquina poda as entradas opcionais `@emnapi/*`, e o `npm ci` do CI falharia.
2. Escrever `tests/validation/formats.test.ts` e `params.test.ts` e conferir que falham (vermelho). Eles vão num commit próprio, antes do código, para o revisor conferir os testes primeiro (decisão 0035).
3. Escrever `formats.ts` e `params.ts` até passarem (verde) e depois melhorar o código com os testes passando.
4. `errors/`, `constants/` e `api/`; tirar o `passWithNoTests` e o `TODO(#4)`.
5. Documentação das lacunas decididas e `npm run check`.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado " maria  DA silva ", quando passa pelo esquema de nome, então vira "Maria da Silva" (RN035) | `formats.test.ts`, `personNameSchema` |
| Dado "Maria@Email.COM", quando passa pelo esquema de e-mail, então vira "maria@email.com"; "maria@email" é recusado (RN035) | `formats.test.ts`, `emailSchema` |
| Dado "(82) 99999-8888", quando passa pelo esquema de celular, então vira "82999998888"; um número sem o 9 inicial ou com DDD inexistente é recusado (RN035) | `formats.test.ts`, `mobilePhoneSchema` |
| Dado uma senha sem número, sem letra maiúscula, sem caractere especial, com 7 ou com 73 caracteres, quando passa pelo esquema de senha, então é recusada (RS003) | `formats.test.ts`, `passwordSchema` |
| Dado "abc-1d23" ou "abc1234", quando passa pelo esquema de placa, então vira "ABC1D23" ou "ABC1234"; "AB12345" é recusado (RN035) | `formats.test.ts`, `plateSchema` |
| Dado um CNPJ com dígito verificador errado, quando passa pelo esquema, então é recusado (RN035) | `formats.test.ts`, `cnpjSchema` |
| Dado um objeto com um campo não previsto, quando passa por um esquema de objeto, então o campo é descartado (RS013) | `params.test.ts`, `paginationSchema` |
| Dado `pageSize` 80, quando passa pelo esquema de paginação, então vale 50 (RNF008) | `params.test.ts` |
| Dado o código `VERSION_CONFLICT`, quando consultado no catálogo, então traz o status 409 e a mensagem de `api.md` | passo manual: conferir as 19 linhas de `catalog.ts` com a tabela de `api.md`. O tipo `ErrorCode` faz o `tsc` recusar um código fora do catálogo. A pasta `tests/` só admite testes de regras e de esquemas (decisão 0024). |
| Dado o PR, quando o CI roda, então o `npm test` roda os testes novos sem o `passWithNoTests` e o `npm run check` passa | `npm run check` local e o job `check` do CI. Passo manual: com o `include` trocado para um caminho sem testes, o `npm test` falha (critério da #4); depois o `include` volta ao original. |

## Arquivos

| Arquivo | Ação |
|---|---|
| `package.json`, `package-lock.json` | alterar: `zod` 4.6.7 |
| `vitest.config.ts` | alterar: sai o `passWithNoTests` e o `TODO(#4)` |
| `src/shared/validation/formats.ts` | criar |
| `src/shared/validation/params.ts` | criar |
| `src/shared/validation/README.md` | alterar (L1) |
| `src/shared/errors/catalog.ts` | criar |
| `src/shared/errors/app-error.ts` | criar |
| `src/shared/constants/pagination.ts` | criar |
| `src/shared/api/pagination.ts` | criar |
| `src/shared/api/problem.ts` | criar |
| `tests/validation/formats.test.ts` | criar |
| `tests/validation/params.test.ts` | criar |
| `tests/validation/README.md` | alterar (L1) |
| `docs/plataforma/RN035-formatos-dos-dados.md` | alterar (L1 a L9) |
| `docs/plataforma/mensagens-de-validacao.md` | criar (L11) |
| `docs/plataforma/CONTEXT.md` | alterar: linha do arquivo novo (L11) |
| `docs/plataforma/seguranca.md` | alterar: RS003 (L3) |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: linha de `validation/` (L1) |
| `docs/padroes/api.md` | alterar: id no caminho (L10) |
| `memoria/tarefas/21-formatos-e-erros/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |

### Em comum com outras tarefas em andamento

- PR #20 (documentos formais): mexe em `documentos-formais/` e `setup/questionario.md`; nada em comum.
- #22 a #26: ainda não começaram. A #22 importa `errors/` e `api/`; as demais compõem os formatos. Elas devem começar depois da incorporação desta.

## Testes previstos

Valores esperados tirados de RN035 e, quando indicado, da opção recomendada da lacuna. Cada `describe` é um esquema.

`normalizeText`

- trims spaces at both ends
- collapses repeated spaces into one
- removes control characters
- turns tabs and line breaks into a single space (L2)
- composes an accent typed as a separate mark (L2)

`personNameSchema`

- capitalizes each word and lowercases the other letters: "MARIA" → "Maria"
- keeps the particles da, de, do, das, dos and e in lower case: " joão DOS santos e silva " → "João dos Santos e Silva"
- keeps accented letters: "ÂNGELA" → "Ângela"
- capitalizes after a hyphen and an apostrophe: "ana-maria" → "Ana-Maria", "d'ávila" → "D'Ávila" (L4)
- stores the typographic apostrophe as a plain one: "D’Ávila" → "D'Ávila" (L4)
- accepts 2 and 60 characters and rejects 1 and 61
- rejects digits and symbols: "Maria2", "Maria@"
- rejects a hyphen or an apostrophe outside letters: "-Maria", "Maria'", "--" (L4)
- rejects an empty or missing value with the required message

`emailSchema`

- lowercases the address: "Maria@Email.COM" → "maria@email.com"
- accepts a domain with more than one dot: "maria@email.com.br"
- rejects a domain without a dot: "maria@email"
- rejects an address without @ or with a space inside
- accepts 254 characters and rejects 255

`mobilePhoneSchema`

- removes the mask: "(82) 99999-8888" → "82999998888"
- accepts digits only: "82999998888"
- rejects 10 digits
- rejects a number whose first digit after the area code is not 9: "82899998888"
- rejects an area code that does not exist: "20999998888", "23999998888" (L5)
- rejects letters
- rejects the country code: "+55 82 99999-8888" (L5)

`companyPhoneSchema`

- accepts a landline with 10 digits: "(82) 3333-4444" → "8233334444"
- accepts a mobile with 11 digits: "(82) 99999-8888" → "82999998888"
- rejects 11 digits not starting with 9 after the area code
- rejects 9 digits and an area code that does not exist

`passwordSchema`

- accepts 8 characters with upper case, number and special character: "Senha@12"
- rejects 7 characters: "Senh@12"
- accepts 72 characters and rejects 73
- rejects a password without upper case, without a number or without a special character
- counts an accented capital as upper case: "ésenha@1" rejected, "Ésenha@1" accepted (L3)
- does not count a space as a special character: "Senha 123" (L3)
- keeps the password as typed, with spaces at the ends (L3)
- rejects 72 characters that take more than 72 bytes (L3)

`plateSchema`

- accepts the Mercosul pattern with hyphen and lower case: "abc-1d23" → "ABC1D23"
- accepts the old pattern: "abc1234" → "ABC1234", "ABC-1234" → "ABC1234"
- rejects other patterns: "AB12345", "ABCD123", "ABC12D3"

`vehicleBrandModelSchema`

- capitalizes the first letter of each word: "volkswagen" → "Volkswagen", "hb20 sense" → "Hb20 Sense"
- keeps the other letters as typed: "HB20 sense" → "HB20 Sense", "mcLaren" → "McLaren" (L6)
- accepts 1 and 40 characters and rejects 41

`vehicleColorSchema`

- capitalizes only the first letter: "azul MARINHO" → "Azul marinho"
- accepts 3 and 30 characters and rejects 2 and 31
- rejects digits and hyphens: "Azul 2", "Verde-claro"

`vehicleYearSchema(currentYear)`, com o ano corrente 2026 passado pelo teste

- accepts 1886 and rejects 1885
- accepts the current year and the next one, 2027, and rejects 2028 (L7)
- rejects a decimal number and text

`moneySchema`

- accepts 0.01 and 99999.99
- rejects zero, a negative value and 100000
- rejects three decimal places: 10.005
- accepts values that are not exact in binary: 0.07, 19.99
- rejects text: "1.250,00"

`percentSchema`

- accepts 0, 100 and 5.25
- rejects -1, 100.01 and 5.255

`durationMinutesSchema`

- accepts 5 and 2400
- rejects 4, 2401 and 90.5

`cnpjSchema`

- removes the mask: "12.345.678/0001-95" → "12345678000195"
- rejects a wrong check digit: "12.345.678/0001-90" (L8)
- rejects 14 equal digits: "11111111111111" (L8)
- accepts the alphanumeric CNPJ and stores it in upper case: "12.abc.345/01de-35" → "12ABC34501DE35" (L8)
- rejects 13 characters

`instagramUrlSchema` e `facebookUrlSchema`

- accepts the domain and its subdomains: "https://instagram.com/glow", "https://www.instagram.com/glow", "https://m.facebook.com/glow" (L9)
- rejects http: "http://instagram.com/glow"
- rejects another domain that contains the name: "https://instagram.com.golpe.com/glow", "https://notinstagram.com/glow"
- rejects the other network's address in each field
- rejects an address without the profile path: "https://instagram.com/" (L9)
- rejects more than 200 characters (L9)

`entityNameSchema` e `jobTitleSchema`

- capitalizes the first letter: "lavagem completa" → "Lavagem completa", "supervisor de lavagem" → "Supervisor de lavagem"
- keeps the other letters as typed: "polimento 3M" → "Polimento 3M" (L6)
- accepts 2 and 60 characters and rejects 1 and 61

`halfHourTimeSchema`

- accepts "00:00", "08:00", "08:30" and "23:30"
- rejects "08:15", "8:00", "24:00" and "08:00:00"

`plainTextSchema(maxLength)` e `searchTermSchema`

- accepts the limit and rejects one character more (100, 200, 500 and 100 for search)
- keeps HTML as plain text: "<b>Glow</b>" stays as typed

`idSchema`

- accepts a UUID generated by the database
- accepts an id of `seed-demo.sql`, made by `md5(...)::uuid` (L10)
- rejects "123" and "not-a-uuid"

`paginationSchema(defaultPageSize)`

- uses page 1 and the given page size when they are missing
- converts query string values: "2" → 2
- limits pageSize to 50: 80 → 50
- rejects page or pageSize 0, -1, 1.5 and "abc"
- discards unknown parameters (RS013)

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Onde ficam os formatos usados por vários módulos

**Problema.** O `src/shared/validation/README.md` diz "Um arquivo por módulo (`clients.ts`, `vehicles.ts`, `appointments.ts`...)", e a árvore de `estrutura-de-pastas.md`, "esquemas Zod por módulo". Mas os formatos de RN035 servem a vários módulos: nome e e-mail a clientes, funcionários e à conta; celular a clientes e à empresa; nomes a serviço, categoria e cargo. O id e a paginação servem a todas as rotas. Não há lugar previsto para eles.

**Opções:**

- [X] **1. `formats.ts` e `params.ts`, usados pelos arquivos de módulo (recomendada).** Cada formato existe uma vez, com um arquivo de teste espelhado. O revisor compara `formats.ts` com a tabela de RN035 lado a lado.
- [ ] **2. Cada módulo repete os formatos de que precisa.** Duplica regra e teste, e as cópias podem divergir (contraria a decisão 0008).
- [ ] **3. O primeiro módulo define, e os outros importam dele.** Cria dependência entre módulos, como `staff.ts` importar de `clients.ts`.

**Texto proposto (opção 1):**

- `src/shared/validation/README.md`, primeiro parágrafo: "Um arquivo por módulo (`clients.ts`, `vehicles.ts`, `appointments.ts`...)." passa a "`formats.ts` tem um esquema para cada dado de RN035, e `params.ts`, o id do caminho e a paginação, comuns a todas as rotas. Os arquivos de módulo (`clients.ts`, `vehicles.ts`, `appointments.ts`...) montam com eles os corpos e os filtros das rotas."
- `tests/validation/README.md`, primeiro parágrafo: "Um arquivo por esquema de `src/shared/validation/` (`clients.test.ts`, `vehicles.test.ts`...)" passa a "Um arquivo de teste para cada arquivo de `src/shared/validation/` (`formats.test.ts`, `params.test.ts`, `clients.test.ts`...)".
- `docs/plataforma/estrutura-de-pastas.md`, árvore: "esquemas Zod por módulo (normalizam e validam)" passa a "formatos de RN035 (formats.ts), id e paginação (params.ts) e esquemas por módulo".
- `docs/plataforma/RN035-formatos-dos-dados.md`, "Implementação": "esquemas Zod em `src/shared/validation`" passa a "esquemas Zod em `src/shared/validation/formats.ts`".

### L2. Quebras de linha e acentos na normalização dos textos

**Problema.** RN035 manda remover "os caracteres de controle" de todos os campos de texto. A quebra de linha e a tabulação também são caracteres de controle. Removê-las cola as palavras: "Lavagem\ncompleta" vira "Lavagemcompleta". Além disso, um acento digitado como sinal separado, comum em texto colado de outros programas, faz "José" ter cinco caracteres e não passar na regra de letras do nome. O mesmo nome também pode ser gravado de duas formas.

**Opções:**

- [X] **1. Tabulação e quebra de linha viram espaço, e os acentos são unidos à letra (recomendada).** As descrições ficam num parágrafo só, e nomes iguais ficam gravados igual.
- [ ] **2. Manter as quebras de linha só nas descrições.** Abre uma exceção na regra, e as telas precisam exibir as quebras.
- [ ] **3. Remover, como está escrito.** Palavras separadas por quebra de linha ficam coladas.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, parágrafo de abertura: "Em todos os campos de texto, são removidos os espaços no início e no fim, os espaços repetidos e os caracteres de controle, e o conteúdo é tratado como texto puro, sem interpretação de HTML." passa a "Em todos os campos de texto, exceto a senha, a tabulação e a quebra de linha viram espaço, os demais caracteres de controle são removidos, o acento digitado como sinal separado é unido à letra (forma NFC do Unicode), e os espaços no início, no fim e repetidos são removidos. O conteúdo é tratado como texto puro, sem interpretação de HTML, e as descrições ficam em um único parágrafo."

### L3. Senha: normalização, limite de 72 e caractere especial

**Problema.** Há três pontos em aberto:

- A normalização dos textos, aplicada à senha, mudaria a senha: o espaço do fim sumiria, e dois espaços virariam um. RN035 não abre exceção para ela.
- RS003 limita a senha a 72 caracteres porque 72 é o que o bcrypt trata, mas o limite do bcrypt é em bytes. Em UTF-8, cada letra acentuada ocupa dois bytes. Uma senha de 72 caracteres com acentos passa de 72 bytes, e o Supabase Auth recusa a senha ou ignora o que passa do limite, conforme a versão.
- "Letra maiúscula" e "caractere especial" não estão definidos. "É" conta como maiúscula? O espaço conta como caractere especial?

**Opções:**

- [X] **1. A senha fica como digitada, e o limite de 72 conta bytes (recomendada).** Maiúscula inclui as acentuadas. Caractere especial é qualquer um que não seja letra, número ou espaço. Numa senha com muitos acentos, o limite efetivo fica abaixo de 72, um caso raro, e a mensagem continua falando em 72 caracteres.
- [ ] **2. Só caracteres sem acento na senha.** 72 caracteres passam a ser 72 bytes, mas "ç" e as letras acentuadas são recusados, o que estranha quem escreve em português.
- [ ] **3. Contar caracteres, como está escrito.** Uma senha de 72 caracteres com acento chega ao Supabase Auth acima do limite do bcrypt.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "Senha": "De 8 a 72 caracteres, com ao menos uma letra maiúscula, um número e um caractere especial (RS003)." passa a "De 8 a 72 caracteres, com ao menos uma letra maiúscula, inclusive acentuada, um número e um caractere especial, que é qualquer caractere que não seja letra, número ou espaço (RS003). É gravada como digitada, sem a normalização dos textos. O limite de 72 conta bytes em UTF-8, o limite do bcrypt: cada letra acentuada conta como dois."
- `docs/plataforma/seguranca.md`, RS003, Implementação: "exige de 8 a 72 caracteres, com letra maiúscula, número e caractere especial, em todos os formulários e rotas; 72 é o tamanho máximo tratado pelo algoritmo bcrypt." passa a "exige de 8 a 72 caracteres, com letra maiúscula, número e caractere especial, em todos os formulários e rotas; o máximo conta bytes em UTF-8, porque 72 bytes é o que o algoritmo bcrypt trata, e a senha não passa pela normalização dos textos."

### L4. Nomes com hífen e apóstrofo

**Problema.** RN035 aceita hífen e apóstrofo no nome e manda gravar "cada palavra com a inicial maiúscula e as demais letras minúsculas". Faltam três definições:

- "ana-maria" vira "Ana-maria" ou "Ana-Maria"? E "d'ávila", "D'ávila" ou "D'Ávila"?
- O apóstrofo tipográfico (’), que o teclado do iPhone põe no lugar do ', é aceito?
- O nome pode começar ou terminar por hífen ou apóstrofo? "--" tem dois caracteres permitidos.

**Opções:**

- [X] **1. Maiúscula também depois do hífen e do apóstrofo; ’ aceito e gravado como '; hífen e apóstrofo só entre letras (recomendada).** Grava "Ana-Maria" e "D'Ávila", e quem digita no celular não vê o nome recusado.
- [ ] **2. Maiúscula só na primeira letra da palavra; ’ recusado.** Grava "Ana-maria" e "D'ávila".

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "Nome e sobrenome", ao fim da regra: acrescentar "A inicial também fica maiúscula depois do hífen e do apóstrofo (Ana-Maria, D'Ávila). Hífen e apóstrofo só aparecem entre letras, e o apóstrofo tipográfico (’) é gravado como '."

### L5. DDDs válidos e máscara dos telefones e do CNPJ

**Problema.** RN035 exige "DDD válido" sem dar a lista e diz que o telefone é "gravado apenas com os algarismos", sem dizer o que se aceita na digitação. Os parênteses, o espaço e o hífen da máscara são óbvios. Mas e o "+55" de um número copiado do WhatsApp? No CNPJ, a máscara tem ponto, barra e hífen.

**Opções:**

- [X] **1. Os 67 DDDs da Anatel; máscara aceita e removida; "+55" recusado (recomendada).** O campo do formulário já terá máscara (`frontend.md`), então o "+55" só chegaria por chamada direta à API. A mensagem mostra o formato esperado.
- [ ] **2. Igual à 1, mas aceitando e removendo o "+55".** É mais tolerante, ao custo de mais um caso na regra e nos testes.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, depois da tabela "Formatos": novo parágrafo "DDD válido é um dos 67 códigos nacionais da Anatel: 11 a 19, 21, 22, 24, 27, 28, 31 a 35, 37, 38, 41 a 49, 51, 53 a 55, 61 a 69, 71, 73 a 75, 77, 79, 81 a 89 e 91 a 99. Na digitação, são aceitos e removidos os parênteses, os espaços, os hífens e os pontos dos telefones, e os pontos, a barra e o hífen do CNPJ. O código do país (+55) não é aceito."

### L6. Inicial maiúscula: o que acontece com as demais letras

**Problema.** Para marca e modelo, RN035 diz "a inicial de cada palavra é gravada em maiúscula, preservando as siglas digitadas em maiúsculas". Para nomes de serviço, categoria e cargo e para a descrição do cargo ocupado, só "com a inicial maiúscula". Não diz o que acontece com as demais letras. "mcLaren" vira "McLaren" ou "Mclaren"? "polimento 3M" mantém o "M"? "LAVAGEM completa" fica como está?

**Opções:**

- [X] **1. Só a inicial muda, e as demais letras ficam como digitadas (recomendada).** Preserva siglas e grafias como "3M", "HB20" e "McLaren", sem lista de exceções. Um texto todo em maiúsculas fica em maiúsculas.
- [ ] **2. As demais letras vão para minúsculas, exceto nas palavras todas em maiúsculas, tratadas como sigla.** "mcLaren" vira "Mclaren", e "LAVAGEM completa" continua igual, porque "LAVAGEM" parece sigla.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "Marca e modelo do veículo": "A inicial de cada palavra é gravada em maiúscula, preservando as siglas digitadas em maiúsculas." passa a "A inicial de cada palavra é gravada em maiúscula, e as demais letras ficam como digitadas, o que preserva as siglas."
- Mesmo arquivo, linhas "Nomes de serviço, categoria e cargo" e "Descrição do cargo ocupado pelo funcionário": "gravados com a inicial maiúscula" e "gravada com a inicial maiúscula" passam a "gravados com a inicial maiúscula e as demais letras como digitadas" e "gravada com a inicial maiúscula e as demais letras como digitadas".

### L7. Ano do veículo: ano-modelo e de onde vem o ano corrente

**Problema.** RN035 aceita o ano "de 1886 até o ano corrente". O documento do veículo traz o ano de fabricação e o ano-modelo, que costuma ser o seguinte: um carro 2027 já é vendido em 2026. Com a regra atual, quem tem um carro zero-quilômetro modelo 2027 não consegue cadastrá-lo. Também não está escrito de onde vem o ano corrente: o esquema roda no navegador e no servidor e não pode ler o relógio (`codigo.md`). O banco só confere o mínimo (`ck_vehicles_year`), então nenhuma opção exige migration.

**Opções:**

- [X] **1. Até o ano seguinte ao corrente, recebido por parâmetro (recomendada).** Aceita o ano-modelo do carro novo. O servidor passa o ano no fuso da empresa (`APP_TIMEZONE`), e o formulário, o ano do navegador.
- [ ] **2. Até o ano corrente, como está, recebido por parâmetro.** O carro modelo 2027 só pode ser cadastrado a partir de 2027.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "Ano do veículo": "Número inteiro de 1886, ano do primeiro automóvel, até o ano corrente." passa a "Número inteiro de 1886, ano do primeiro automóvel, até o ano seguinte ao corrente, para aceitar o ano-modelo de um veículo novo. O ano corrente é o do fuso da empresa."

### L8. CNPJ alfanumérico, dígitos repetidos e exemplo com dígito errado

**Problema.** Há três pontos:

- RN035 diz "Catorze algarismos". Desde julho de 2026, a Receita Federal emite CNPJ alfanumérico para as novas inscrições (IN RFB nº 2.229/2024). As 12 primeiras posições podem ter letras, e os dois dígitos verificadores continuam numéricos, calculados com o valor de cada caractere igual ao código ASCII menos 48. Uma empresa nova não conseguiria gravar o próprio CNPJ.
- "11111111111111" passa no cálculo dos dígitos verificadores, mas não é um CNPJ real.
- O exemplo de exibição de RN035, "12.345.678/0001-90", tem dígito verificador errado (o certo é -95), e alguém pode copiá-lo como dado de teste.

**Opções:**

- [X] **1. Aceitar também o CNPJ alfanumérico, gravado em maiúsculas; recusar 14 caracteres iguais; corrigir o exemplo (recomendada).** O CNPJ numérico é um caso particular do mesmo cálculo. A coluna `business_settings.cnpj` é texto sem restrição, então não há migration.
- [ ] **2. Só o numérico, como está; recusar repetidos; corrigir o exemplo.** Uma empresa inscrita depois de julho de 2026 não consegue gravar o CNPJ.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "CNPJ": "Catorze algarismos, com dígitos verificadores válidos. Gravado apenas com os algarismos." passa a "Catorze caracteres: os doze primeiros algarismos ou letras, já que a Receita Federal emite CNPJ alfanumérico desde julho de 2026, e os dois últimos algarismos, com dígitos verificadores válidos. Não pode ter os catorze caracteres iguais. Gravado sem a máscara, com as letras em maiúsculas." Na coluna "Exibição", "12.345.678/0001-90" passa a "12.345.678/0001-95".

### L9. Quais endereços do Instagram e do Facebook valem

**Problema.** RN035 pede endereço "pertencente ao domínio da respectiva rede social". Não diz se valem `www.instagram.com`, `m.facebook.com` ou `fb.com`, se o endereço precisa ter o caminho do perfil depois do domínio nem qual é o tamanho máximo.

**Opções:**

- [X] **1. O domínio ou um subdomínio dele, com o caminho do perfil, até 200 caracteres (recomendada).** Aceita o que o navegador mostra ao copiar o endereço do perfil (`https://www.instagram.com/glow`). Recusa `fb.com` e domínios parecidos (`instagram.com.golpe.com`). O limite é o mesmo do endereço da empresa.
- [ ] **2. Só o domínio exato, sem subdomínio.** Recusa `https://www.instagram.com/glow`, a forma mais comum.

**Texto proposto (opção 1):**

- `docs/plataforma/RN035-formatos-dos-dados.md`, linha "Endereços do Instagram e do Facebook": "Endereço iniciado por https:// e pertencente ao domínio da respectiva rede social." passa a "Endereço iniciado por https://, no domínio da respectiva rede social (instagram.com ou facebook.com) ou num subdomínio dele, como www.instagram.com e m.facebook.com, seguido do caminho do perfil, com até 200 caracteres."

### L10. O que é "UUID válido" no id do caminho

**Problema.** `api.md` diz "Id no caminho deve ser UUID válido". O `z.uuid()` do Zod 4.6 exige a versão e a variante da RFC 9562 em duas posições do id (conferido no código do pacote). Os ids do `seed-demo.sql` são gerados por `md5('glow-demo:' || chave)::uuid` e não têm esses bits: cerca de 7 em cada 8 seriam recusados. As rotas responderiam 404 para serviços, clientes e agendamentos de demonstração que existem no projeto real.

**Opções:**

- [X] **1. UUID válido é o formato 8-4-4-4-12 de algarismos hexadecimais, sem exigir versão (`z.guid()`) (recomendada).** É o mesmo formato que o tipo `uuid` do PostgreSQL aceita, e os ids do banco e da demonstração passam.
- [ ] **2. `z.uuid()` estrito e ids com versão no `seed-demo.sql`.** Os ids dos dados já carregados no projeto real mudariam: carregar o seed de novo duplicaria os dados de demonstração.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Validação: "Id no caminho deve ser UUID válido; id inválido responde o mesmo 404 de registro inexistente." passa a "Id no caminho deve ser UUID válido, isto é, 32 algarismos hexadecimais no formato 8-4-4-4-12, como aceita o tipo `uuid` do PostgreSQL, sem exigir a versão (os ids do `seed-demo.sql` vêm de `md5`); id inválido responde o mesmo 404 de registro inexistente."

### L11. Mensagens de validação de cada formato

**Problema.** `api.md` mostra uma única mensagem de campo ("Informe uma placa válida."). Nenhum módulo define as mensagens dos outros formatos nem a de campo obrigatório. São textos da interface, que aparecem junto ao campo (RNF003) e não podem ser inventados. O RN035 já está perto do limite de cerca de 2 mil tokens por arquivo (`docs/CONTEXT.md`), então as mensagens iriam para um arquivo próprio.

**Opções:**

- [X] **1. As mensagens abaixo, em `docs/plataforma/mensagens-de-validacao.md` (recomendada).** Cada mensagem diz o que falta e, quando ajuda, mostra um exemplo.
- [ ] **2. Outras mensagens.** Corrija na lista abaixo, que vira o texto do arquivo.

**Texto proposto (opção 1):** `docs/plataforma/mensagens-de-validacao.md`, novo, com cabeçalho (`titulo`, `assunto: plataforma`, `relacionados: [RN035, RNF003]`), uma frase de abertura ("Mensagens exibidas junto ao campo quando a entrada não segue RN035; vêm de `src/shared/validation/formats.ts`.") e a tabela:

| Dado | Mensagem |
|---|---|
| Campo obrigatório ausente ou vazio | Preencha este campo. |
| Nome e sobrenome | Use de 2 a 60 letras; espaço, hífen e apóstrofo também valem. |
| E-mail | Informe um e-mail válido, como maria@email.com. |
| Celular e WhatsApp | Informe um celular com DDD, como (82) 99999-8888. |
| Telefone da empresa | Informe um telefone com DDD, como (82) 3333-4444. |
| Senha | A senha deve ter de 8 a 72 caracteres, com letra maiúscula, número e caractere especial. |
| Placa | Informe uma placa válida. |
| Marca e modelo | Use de 1 a 40 caracteres. |
| Cor | Use de 3 a 30 letras. |
| Ano | Informe um ano de 1886 a <ano seguinte ao corrente>. |
| Valor em reais | Informe um valor maior que zero e de até R$ 99.999,99. |
| Percentual | Informe um percentual de 0 a 100, com até duas casas decimais. |
| Duração | Informe a duração em minutos, de 5 a 2.400. |
| CNPJ | Informe um CNPJ válido. |
| Instagram | Informe o endereço do perfil no Instagram, começando por https://. |
| Facebook | Informe o endereço da página no Facebook, começando por https://. |
| Nomes de serviço, categoria e cargo; descrição do cargo ocupado | Use de 2 a 60 caracteres. |
| Horário | Escolha um horário em hora cheia ou meia hora. |
| Nome da empresa, endereço, descrições e termo de busca | Use até <limite> caracteres. |
| `page` e `pageSize` | Informe um número inteiro a partir de 1. |

- `docs/plataforma/CONTEXT.md`, tabela: nova linha "| mensagens-de-validacao.md | Mensagens de validação de cada formato de RN035 |".
- `docs/plataforma/RN035-formatos-dos-dados.md`, "Implementação": acrescentar "; mensagens de cada formato em [mensagens-de-validacao.md](mensagens-de-validacao.md)".

## Decisões técnicas

Nenhuma nova.

- Seguidas: 0008 (validação e mensagens compartilhadas em `src/shared`), 0017 (código em inglês, interface em português), 0024 e 0035 (testes só de regras e esquemas, com TDD), 0025 (Problem Details), 0036 (organização das pastas).
- Escolhas locais, sem registro:
  - `z.object` descarta os campos não previstos por padrão (RS013).
  - O e-mail usa o `z.email()` do Zod, mais estrito que RN035: só caracteres sem acento, e o fim do domínio com ao menos duas letras.
  - Ano, texto com limite e paginação são funções que recebem o parâmetro (ano corrente, limite, tamanho padrão); os outros esquemas são constantes.
  - O valor em reais é validado como número com até duas casas, e a comparação tolera a imprecisão do ponto flutuante (0,07 × 100 = 7,000000000000001).

## Riscos e dúvidas

- `package-lock.json`: gerado com o npm 11.6.2 desta máquina, perde as entradas `@emnapi/*`, e o `npm ci` do CI falha. Mitigação: `npx -y npm@11.21.1`, como no passo 1 da construção.
- Os esquemas ficam sem uso no código até a #22 e as tarefas dos módulos; só os testes os usam. A issue pede isso, para que cada módulo só junte formatos já testados.
- O RN035 chega a cerca de 2 mil tokens com os textos de L1 a L9. Se passar muito, a etapa 02 move "Campos obrigatórios e opcionais" para um arquivo próprio e avisa em `notas.md`.
- Os esquemas com transformação têm tipo de entrada diferente do de saída (`z.input` e `z.output`). Isso importa para o React Hook Form (#25 e #26), não para esta tarefa.

## Fora do escopo

- O esquema do corpo de cada rota: cada tarefa de módulo compõe os formatos.
- Verificações que dependem do banco (unicidade de e-mail, placa e nomes), da configuração da empresa (horário dentro da disponibilidade, RN013) ou de mais de um campo (expediente e pausa, período do dashboard).
- Campo opcional vazio que vira `null`: entra com o primeiro módulo que tiver campo opcional (dados da empresa, UC22).
- Exibição dos valores (`src/shared/format`) e o tratamento único das respostas (#22).
- Enumerações (status, permissões, tipos): cada uma entra com o primeiro módulo que a usa. As permissões entram na #23.
