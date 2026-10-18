---
issue: 15
titulo: "Wireframes de referência das páginas em wireframes/"
areas: [frontend, cicd]
tipo: documentacao
requisitos: [RN001, RF074]
status: concluido
aprovado_por: yvan  
aprovado_em: 18/10/2026 16:32
---

# Plano: Wireframes de referência das páginas em wireframes/

## Objetivo

Versionar em `wireframes/` os 94 PDFs que o desenvolvedor montou com as telas de outro sistema de estética automotiva. Esse sistema tem as mesmas funcionalidades do Glow e algumas a mais. As telas servem de referência de esqueleto e componentes das páginas, para a equipe e para a IA. O `README.md` da pasta explica a origem e o uso: aproveitar a estrutura, deixar de fora o que não tem requisito em `docs/` e não copiar as cores. As cores virão das variáveis do tema (`@theme` em `src/app/globals.css`), que ainda serão definidas. Segundo o desenvolvedor, todos os dados exibidos nas telas são fictícios. Nenhum requisito muda; o README cita RN001 e RF074 só para explicar o que a referência tem a mais.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um clone limpo, quando abro `wireframes/`, então os 94 PDFs estão lá, sem alteração, junto com o `README.md` | `git ls-files wireframes \| wc -l` dá 95; os hashes dos PDFs são iguais aos da pasta original |
| Dado o `README.md` da pasta, quando o leio, então ele explica a origem, o uso, as cores pelo tema e o mapa pasta → página → casos de uso | leitura, comparada com a seção "Texto do README" abaixo |
| Dado um PDF da pasta, quando o Git o compara, então ele é tratado como binário | `git check-attr binary -- wireframes/publicPages/login/LoginDesktop.pdf` dá `set` |
| Dado `docker compose up --build`, quando rodo, então a página inicial responde 200, o contexto enviado não inclui `wireframes/` e a imagem não tem a pasta | tamanho do contexto na saída do build; `docker run --rm --entrypoint sh glow-app -c "ls -A /app"` |
| Dado `npm run check`, quando rodo, então passa como antes | `npm run check` |
| Dado `AGENTS.md`, `README.md`, `estrutura-de-pastas.md` e `frontend.md`, quando os leio, então cada um cita `wireframes/` como no texto proposto | leitura |

## Arquivos

| Arquivo | Ação |
|---|---|
| `wireframes/**/*.pdf` (94) | criar: os arquivos do desenvolvedor, como estão |
| `wireframes/README.md` | criar: texto abaixo |
| `.gitattributes` | alterar: `*.pdf binary` |
| `.dockerignore` | alterar: `wireframes` fora do contexto da imagem, com comentário |
| `docs/plataforma/infraestrutura.md` | alterar: na tabela de "Execução em contêiner", o `.dockerignore` deixa fora também `wireframes` |
| `docs/plataforma/estrutura-de-pastas.md` | alterar: `wireframes/` na árvore da raiz |
| `AGENTS.md` | alterar: linha `wireframes/` no mapa |
| `README.md` | alterar: item `wireframes/` em "Como o repositório está organizado" |
| `docs/padroes/frontend.md` | alterar: em "Estrutura", consultar o wireframe da página |
| `docs/decisoes/0041-wireframes-de-referencia.md`, `docs/decisoes/CONTEXT.md` | criar e alterar, se a decisão abaixo for aprovada |
| `memoria/tarefas/15-wireframes/` | criar: plano e notas nesta etapa; `02_relatorio.md` na etapa 03 |

## Texto do README

`wireframes/README.md`:

```markdown
# `wireframes/` – Referência visual das páginas

Os PDFs desta pasta são telas de outro sistema de estética automotiva, com as mesmas funcionalidades do Glow e algumas a mais, por ser mais completo. Não são o desenho final do Glow: são um exemplo de como o wireframe das nossas páginas deve ser, mostrando o esqueleto de cada página e os componentes que ela usa. Os dados exibidos nas telas são fictícios.

## Como usar

- **Aproveitar:** a disposição da página (cabeçalho, menu, colunas, cartões, tabelas, formulários e modais), a ordem dos passos dos assistentes e a adaptação entre desktop e celular.
- **Deixar de fora:** toda funcionalidade, campo ou detalhe sem requisito em `docs/`. O que a página tem vem dos requisitos e dos casos de uso do assunto; o wireframe só mostra como organizá-la. Exemplos que aparecem nas telas e não existem no Glow: cupons (fora do escopo do MVP, `docs/plataforma/visao-geral.md`), avaliações (Reviews), relatórios, o seletor de animações, os boxes de atendimento e a exclusão da conta pelo próprio cliente (no Glow, só o funcionário exclui a conta de um cliente, RF074).
- **Não copiar:** as cores, o nome, o logotipo, os textos e as imagens da outra empresa. As cores do Glow vêm das variáveis do tema (`@theme` em `src/app/globals.css`), que ainda serão definidas; os componentes usam só essas variáveis (`docs/padroes/frontend.md`). Os textos da interface seguem os casos de uso.
- **Em caso de conflito:** se o wireframe e `docs/` divergirem, vale `docs/`.

Os PDFs são imagens, sem texto selecionável. Para construir uma página, abra só os PDFs da pasta dela.

## Organização

Uma pasta por página. Cada tela tem uma versão `Desktop` e uma `Mobile`; as telas e os modais com vários passos são numerados (`Step1`, `Step2`...).

| Pasta | Página do Glow | Casos de uso |
|---|---|---|
| `publicPages/homepage/` | `/`, página inicial; `LoginRegisterRequirementModal` é o aviso de que é preciso entrar ou criar uma conta para agendar (RN001) | UC01 |
| `publicPages/catalog/` | `/services`, catálogo de serviços | UC01 |
| `publicPages/login/` | `/login`, login único de clientes e funcionários | UC03, UC08 |
| `publicPages/register/` | `/register`, cadastro de cliente | UC02 |
| `clientPages/appointment/` | `/booking`, assistente de agendamento, com o cadastro de veículo quando o cliente ainda não tem nenhum | UC06, UC05 |
| `clientPages/clientAppointments/` | `/appointments`, agendamentos do cliente e cancelamento | UC07 |
| `clientPages/profile/` | `/profile`, dados da conta e veículos | UC04, UC05 |
| `staffPages/dashboard/` | `/admin`, dashboard | UC09 |
| `staffPages/appointmentManagment/` | `/admin/appointments`, agendamentos e novo agendamento para um cliente | UC10, UC11, UC12, UC26 |
| `staffPages/servicesManagment/` | `/admin/services`, serviços (principal, adicional e complementar) e categorias | UC13, UC14, UC15 |
| `staffPages/clientsManagment/` | `/admin/clients`, clientes | UC16, UC17 |
| `staffPages/staffManagment/` | `/admin/staff`, funcionários e cargos | UC19, UC20, UC21 |
| `staffPages/adminPainelConfs/` | `/admin/settings`, dados da empresa, disponibilidade e formas de pagamento | UC22, UC23, UC24 |
| `staffPages/headerMobile/` | menu lateral do painel no celular (layout do painel) | — |

A troca de senha no primeiro acesso (`/set-password`) não tem wireframe.

## Referências

- Telas e rotas de cada assunto: `docs/<assunto>/rotas.md`
- Padrões de frontend e tema: `docs/padroes/frontend.md`
- Decisão: `docs/decisoes/0041-wireframes-de-referencia.md`
```

A correspondência da tabela foi conferida nos `rotas.md` e nos casos de uso. Os exemplos de "Deixar de fora" foram conferidos nas telas (menu do painel, cartões de agendamento, perfil do cliente) e, em `docs/`, pela ausência de requisito. A exceção são os cupons, que `visao-geral.md` declara fora do escopo.

## Demais textos

- `AGENTS.md`, mapa, linha nova depois de `documentos-formais/`: "| `wireframes/` | telas de outro sistema, em PDF, como referência de esqueleto e componentes das páginas; o que a página tem vem de `docs/` e as cores, do tema (`README.md` da pasta) |".
- `README.md` da raiz, depois do item `documentos-formais/`: "- `wireframes/`: telas de referência, em PDF, para o esqueleto e os componentes das páginas; o `README.md` da pasta explica o uso."
- `docs/plataforma/estrutura-de-pastas.md`, árvore, linha nova depois de `documentos-formais/`: "├── wireframes/                      telas de referência (PDF): esqueleto e componentes das páginas (decisão 0041)".
- `docs/padroes/frontend.md`, fim da seção "Estrutura": "Antes de construir uma página, abrir o wireframe dela em `wireframes/` (mapa no `README.md` da pasta). Ele orienta o esqueleto e os componentes; o conteúdo vem do caso de uso, e as cores, do tema."
- `.dockerignore`, no fim: comentário "# Reference wireframes (PDF), not part of the app." e a linha `wireframes`.
- `docs/plataforma/infraestrutura.md`, linha do `.dockerignore`: "`.claude`, onde ficam os worktrees do Claude Code, e `documentos-formais`" passa a "`.claude`, onde ficam os worktrees do Claude Code, `documentos-formais` e `wireframes`".

## Testes previstos

Nenhum teste automatizado: a tarefa não muda código (decisão 0024). Verificações:

- `npm run check` sem erros nem avisos novos;
- `docker compose up --build` com a página inicial em 200 e o contexto e a imagem sem `wireframes/` (`workflows/procedimentos/testes.md`, "Contêiner (Docker)"); o Docker Desktop precisa estar aberto e o `.env.local` na pasta;
- `git check-attr binary` nos PDFs e `git ls-files wireframes` com 95 arquivos;
- hashes dos 94 PDFs iguais antes e depois do commit.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Nomes das pastas e dos arquivos dos wireframes

**Problema.** As pastas e os PDFs usam `camelCase` (`publicPages`, `HomepageDesktop.pdf`), e alguns nomes têm erro de grafia em inglês: `Managment` em vez de `Management`, `Aditional` em vez de `Additional` e `Painel` em vez de `Panel`. O repositório usa `kebab-case` nos nomes de pastas e arquivos de código (`docs/plataforma/estrutura-de-pastas.md`). Os PDFs não são código, então a regra não os cobre de forma explícita.

**Opções:**

- [x] **1. Manter os nomes como estão (recomendada).** Os arquivos sobem como você os montou. A pasta é referência, não código, e o mapa do README indica a página de cada pasta. Fica uma pasta fora do padrão de nomes.
- [ ] **2. Renomear para `kebab-case` e corrigir a grafia.** O padrão fica uniforme, com renomeação dos 94 arquivos e das 17 pastas e a tabela do README ajustada. A pasta deixa de bater com a sua cópia original.

**Texto proposto (opção recomendada):**

- Nenhum além do README, que já usa os nomes atuais.

## Decisões técnicas

- Seguidas: 0031 (estrutura ICM: a pasta entra no mapa do `AGENTS.md`), 0038 (o `.dockerignore` deixa fora da imagem o que não é da aplicação) e 0040 (precedente de pasta de referência binária na raiz, marcada no `.gitattributes`).

| Decisão proposta | Alternativas descartadas | Justificativa | Nova ou substitui |
|---|---|---|---|
| 0041 – Wireframes de referência versionados em `wireframes/`, em PDF, como estão. Servem só para o esqueleto e os componentes das páginas: o conteúdo vem de `docs/` e as cores, do tema. Ficam marcados como binários e fora da imagem do contêiner. | Guardar fora do repositório, com um link: a IA não os alcança. Guardar em `docs/`: lá ficam módulos de texto curtos, que a IA lê; 33 MB de imagens destoam. Redesenhar já com as cores do Glow: as cores ainda não existem. | A equipe e a IA precisam da referência junto do código. Consequências aceitas: cerca de 33 MB a mais no histórico do Git; os PDFs são imagens, então a IA abre só os da página em construção. | nova |

## Riscos e dúvidas

- Tamanho: 33 MB de PDFs, o maior com 3 MB, abaixo do limite de 100 MB por arquivo do GitHub. O clone fica mais pesado de forma permanente, mesmo se a pasta for apagada depois.
- As telas mostram o nome, o endereço e o contato da outra empresa; o README proíbe copiar esses itens.
- Os nomes dos PDFs ficam em inglês com erros de grafia (L1).
- Arquivos em comum com outras tarefas: nenhum. Não há pull request aberto, e a `main` está em `a8328e5`.
- Documentos formais: as árvores de pastas da Arquitetura de Software (seção 3.1) e do Desenvolvimento com IA (seção 3) não têm `wireframes/`. O `02_relatorio.md` indica a atualização (`guia/regras.md`, "Lacunas na documentação", passo 4); alterar os `.docx` fica fora desta tarefa, salvo pedido do desenvolvedor.
- Ramificação `docs/15-wireframes`, criada a partir da `main` na etapa 02 (`workflows/procedimentos/git.md`).

## Fora do escopo

- Definir a paleta e as variáveis do tema em `src/app/globals.css`.
- Construir ou alterar páginas.
- Editar o conteúdo dos PDFs (cores, marca, textos).
- Atualizar os `.docx` de `documentos-formais/`.
