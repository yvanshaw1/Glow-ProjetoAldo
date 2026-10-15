---
titulo: Padrões de código (todas as áreas)
origem: Documentação de Arquitetura de Software, seção 2.4; Documentação de Desenvolvimento com IA, seção 5.3
---

# Padrões de código

Valem para todo código, escrito por integrante ou por IA. O que a ferramenta verifica é garantido por TypeScript, ESLint e Prettier no CI; o resto, pela revisão. Base: código limpo (MARTIN, 2009), sem abstração para casos que os requisitos não preveem.

## Idioma

Código, identificadores, rotas, tabelas, colunas, valores de enum, mensagens de commit e comentários em inglês. Textos exibidos na interface em português do Brasil, vindos de `src/shared` quando reutilizados.

## Nomes

Os nomes revelam o propósito e seguem o glossário de `guia/mapa.md` (o status "Agendado" é `scheduled` na tabela, nos tipos, nas funções e na API). Sem nomes genéricos (`data`, `info`, `temp`), prefixos de tipo ou abreviações, exceto `id` e `url`.

| Elemento | Convenção | Exemplo |
|---|---|---|
| Variáveis e funções | `camelCase`; função começa por verbo | `calculateTotal`, `findClientByEmail` |
| Booleanos | `camelCase` com `is`, `has` ou `can` | `isActive`, `hasPermission` |
| Componentes, tipos e classes | `PascalCase`, substantivos | `AppointmentCard`, `PriceBreakdown` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE`, `LOGIN_LOCK_MINUTES` |
| Arquivos e pastas | `kebab-case`, exceto nomes reservados do Next.js (`page.tsx`, `route.ts`) | `price-calculator.ts` |
| Tabelas e colunas | `snake_case`, tabelas no plural | `client_vehicles`, `estimated_end_at` |
| Campos do JSON da API | `camelCase` | `estimatedEndAt`, `pageSize` |
| Códigos de erro | `UPPER_SNAKE_CASE` | `VERSION_CONFLICT` |

## Funções e módulos

- Uma função faz uma coisa, e o nome é o contrato: quem calcula não grava no banco nem monta resposta HTTP.
- Regras de negócio são funções puras: recebem tudo por parâmetro, inclusive a data atual e as configurações; não leem relógio, banco ou ambiente.
- Funções curtas: se não cabe em uma tela, está fazendo mais de uma coisa. Mais de três parâmetros: um objeto com campos nomeados.
- Condições de erro no início, com retorno ou erro imediato; nada de aninhar o caminho principal.
- Comportamento que varia por um valor fixo (transições por status, rótulos) fica em tabela de consulta, não em sequência de `if` ou `switch`.
- Sem mutação: `const` por padrão, parâmetros nunca alterados, objetos alterados viram cópias.
- Composição de funções e componentes, sem herança; classes só para os erros da aplicação (`AppError`).
- Lógica repetida vai para o módulo a que pertence (serviço do módulo ou `src/shared`), mas abstração só depois de um segundo uso real. Não existe pasta genérica de utilitários; onde cada coisa mora: `docs/plataforma/estrutura-de-pastas.md`.

## Tipos, constantes e ausência de valor

- TypeScript estrito, sem `any` e sem `!` para calar o compilador; tipos de entrada derivados dos esquemas Zod (fonte única dos formatos).
- Nada de número ou texto solto com significado de regra: limites e parâmetros (tamanho de página, tentativas de login, intervalo de 30 minutos) são constantes nomeadas no módulo dono ou em `src/shared/constants/`, quando usadas pelos dois lados. Os valores de enum (status, permissões, formas de pagamento, tipos) ficam ali como listas `as const`, com os rótulos em português, e são a fonte dos esquemas Zod e da interface.
- Ausência é `null` explícito, tratado por quem chama; função que devolve lista devolve lista vazia, nunca `null`.

## Comentários e formatação

- Comentário só explica o porquê ou uma regra não evidente, citando o identificador: `// RN034: skip closed hours`.
- Sem código comentado nem código morto; pendência só com número de issue (`// TODO(#57): ...`).
- Formatação pelo Prettier, com a configuração padrão, nos arquivos de código e de configuração; os `.md` ficam fora (`.prettierignore`), porque o alinhamento das tabelas reescreveria a documentação a cada edição. Análise pelo ESLint do Next.js; a revisão discute conteúdo, não estilo.
