---
issue: 21
pull_request: 27
---

# Relatório: Formatos de dados (RN035), catálogo de erros e tipos comuns da API em src/shared

## O que foi feito

Nenhuma rota ou tela mudou. As tarefas seguintes (#22 a #26) passam a ter em `src/shared`:

- **Formatos de RN035** (`src/shared/validation/formats.ts`): um esquema Zod para cada dado que não depende do banco nem da configuração da empresa, de nome e e-mail a CNPJ, redes sociais, horários e textos com limite. Cada esquema normaliza e depois valida, com uma única mensagem por campo, a de `mensagens-de-validacao.md` (RN035, RS003, RS013).
- **Parâmetros comuns** (`params.ts`): o id do caminho, em qualquer formato 8-4-4-4-12, e `page` e `pageSize`, com o máximo de 50 (RNF008).
- **Erros** (`src/shared/errors`): o catálogo dos 19 códigos de `api.md`, com status e mensagem, e a classe `AppError` (RS017).
- **Paginação e respostas** (`src/shared/constants/pagination.ts` e `src/shared/api`): os tamanhos de página e os tipos `Page<T>` e `ProblemDetails` (decisão 0025).
- **Testes** (TDD, decisão 0035): 93 casos em `tests/validation/`, escritos e enviados num commit anterior ao código.
- **Vitest**: saem o `passWithNoTests` e o `TODO(#4)`, como a #4 pedia.
- **Lacunas**: L1 a L11 decididas pelo desenvolvedor (opção 1 em todas) e gravadas nos módulos de `docs/`.

## Arquivos alterados

- `package.json`, `package-lock.json`: `zod` 4.6.7 como dependência de execução. O lockfile foi gerado com o npm 11.21.1, e só a entrada `zod` mudou.
- `vitest.config.ts`: sem `passWithNoTests`.
- `src/shared/validation/formats.ts`, `params.ts`: novos.
- `src/shared/errors/catalog.ts`, `app-error.ts`: novos.
- `src/shared/constants/pagination.ts`, `src/shared/api/pagination.ts`, `problem.ts`: novos.
- `tests/validation/formats.test.ts`, `params.test.ts`: novos.
- `src/shared/validation/README.md`, `tests/validation/README.md`: o que vai em `formats.ts` e `params.ts` (L1).
- `docs/plataforma/RN035-formatos-dos-dados.md`, `mensagens-de-validacao.md` (novo), `CONTEXT.md`, `seguranca.md`, `estrutura-de-pastas.md` e `docs/padroes/api.md`: textos das lacunas.
- `memoria/tarefas/21-formatos-e-erros/`: plano, notas e este relatório.

## Testes executados

- `npm run check`: passou sem erros nem avisos (Prettier, `tsc`, ESLint e 93 testes do Vitest).
- Vermelho antes do verde: no commit dos testes (1455e4c), as duas suítes falhavam porque os esquemas não existiam.
- Critério da #4: `npx vitest run --dir tests/rules`, sem nenhum teste, sai com código 1.
- Catálogo: os 19 códigos, status e mensagens de `catalog.ts` foram comparados por script com a tabela de `api.md`, sem divergências.
- L10: o id de demonstração `md5('glow-demo:category:Lavagem')::uuid` é recusado pelo `z.uuid()` e aceito pelo `z.guid()`, conferido com o Zod instalado.
- Contêiner, porque as dependências mudaram: sem `.env.local` no worktree, a imagem foi construída com `docker build` e executada com `docker run`, sem variáveis. A página inicial respondeu 200.
- Manual na pré-visualização: não se aplica, porque nenhuma tela ou rota mudou. A pré-visualização da Vercel confirma só o build.

## Documentação atualizada

- Módulos: `docs/plataforma/RN035-formatos-dos-dados.md`, `docs/plataforma/mensagens-de-validacao.md` (novo), `docs/plataforma/CONTEXT.md`, `docs/plataforma/seguranca.md` (RS003), `docs/plataforma/estrutura-de-pastas.md`, `docs/padroes/api.md` (Validação) e os README de `src/shared/validation` e `tests/validation`.
- Lacunas resolvidas, todas na opção 1:
  - L1, onde ficam os formatos: README de `validation/` e de `tests/validation/`, `estrutura-de-pastas.md` e RN035;
  - L2, normalização dos textos: RN035;
  - L3, senha: RN035 e `seguranca.md`;
  - L4, nomes com hífen e apóstrofo: RN035;
  - L5, DDDs e máscaras: RN035;
  - L6, inicial maiúscula: RN035;
  - L7, ano-modelo: RN035;
  - L8, CNPJ alfanumérico e exemplo -95: RN035;
  - L9, Instagram e Facebook: RN035;
  - L10, formato do id: `api.md`;
  - L11, mensagens: `mensagens-de-validacao.md`, `CONTEXT.md` e RN035.
- Decisões: nenhuma.
- Documentos formais a atualizar:
  - **Documentação de Análise do Sistema, seção 9.1 (Quadro 20), RN035:**
    - normalização dos textos: tabulação e quebra de linha viram espaço, acentos na forma NFC, e a senha fica fora;
    - senha: maiúscula acentuada vale, o caractere especial é qualquer um que não seja letra, número ou espaço, e o limite de 72 conta bytes;
    - nomes: maiúscula depois do hífen e do apóstrofo, apóstrofo tipográfico, hífen e apóstrofo só entre letras;
    - a lista dos 67 DDDs e os caracteres de máscara aceitos;
    - "demais letras como digitadas" em marca, modelo, nomes de serviço, categoria e cargo e na descrição do cargo ocupado;
    - ano até o ano seguinte ao corrente;
    - CNPJ alfanumérico, sem catorze caracteres iguais, e o exemplo 12.345.678/0001-95;
    - Instagram e Facebook com subdomínio, caminho do perfil e até 200 caracteres;
    - se o documento trouxer mensagens de validação, as de `mensagens-de-validacao.md`.
  - **Documentação de Análise do Sistema, seção 8 (Quadro 19), e Documentação de Arquitetura de Software, seção 7 (Quadro 35), RS003:** o limite de 72 conta bytes em UTF-8, e a senha não passa pela normalização dos textos.
  - **Documentação de Arquitetura de Software, seção 6 (validação da API):** o id do caminho é qualquer UUID no formato 8-4-4-4-12, sem exigir versão.
  - **Documentação de Arquitetura de Software, seções 3.1 e 4.1 (estrutura de pastas):** `src/shared/validation` com `formats.ts`, `params.ts` e os esquemas por módulo.

## Pendências

- O `aprovado_em` do plano está como "00:04 19/10/2024". O ano parece erro de digitação, e só o desenvolvedor pode corrigir o campo.
- O RN035 ficou com cerca de 2,2 mil tokens, um pouco acima do limite de cerca de 2 mil (`docs/CONTEXT.md`). Se a equipe quiser dividi-lo, a seção "Campos obrigatórios e opcionais" pode ir para um arquivo próprio, numa tarefa de documentação.
- O PR soma cerca de 630 linhas sem contar os testes, acima das cerca de 400 de `pull-request.md`. Um terço de `formats.ts` são constantes e mensagens, e `catalog.ts` é a transcrição da tabela de `api.md`.
- Próximas tarefas, nesta ordem: #22, #23, #24 e #25 (estas duas em paralelo) e #26. As lacunas já vistas de cada uma estão em `notas.md`.
