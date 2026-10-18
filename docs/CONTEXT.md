# docs/ – Referências

Os módulos reproduzem, por assunto, os três documentos formais do projeto (Análise do Sistema, Arquitetura de Software e Desenvolvimento com IA, entregues na AV2 em 15/10/2026), para que o agente leia só o necessário. Os `.docx` ficam em `documentos-formais/`, versionados porque a disciplina exige a documentação no projeto; o agente lê estes módulos e só abre os `.docx` quando o desenvolvedor pede para lê-los ou alterá-los (decisão 0040). Quando um deles muda, os módulos correspondentes mudam no mesmo pull request, e vice-versa.

| Pasta | Conteúdo |
|---|---|
| `acesso/` | cadastro, login único, sessão, troca de senha, bloqueio por tentativas, proteção das páginas |
| `agendamento/` | agendar, editar, cancelar, reagendar, concluir; status; preço e previsão; dashboard |
| `catalogo/` | serviços, categorias, precificação, imagens, catálogo público e página inicial |
| `clientes/` | conta do cliente, clientes no painel, veículos |
| `equipe/` | funcionários, cargos, permissões, administrador |
| `configuracoes/` | dados da empresa, disponibilidade, formas de pagamento |
| `plataforma/` | visão geral e stack, requisitos não funcionais, segurança, formatos dos dados, exclusão lógica, infraestrutura |
| `padroes/` | como programar: `codigo.md` (todas as áreas), `frontend.md`, `backend.md`, `api.md`, `banco.md`, `testes.md` |
| `decisoes/` | registros de decisão; índice em `decisoes/CONTEXT.md` |

Cada assunto tem um `CONTEXT.md` com a lista dos seus arquivos. Comece por ele.

## Onde fica cada identificador

| Prefixo | Arquivo |
|---|---|
| RF | `docs/<assunto>/requisitos.md` |
| RNF | `docs/plataforma/requisitos.md` |
| RS | `docs/plataforma/seguranca.md` (com a implementação) |
| RN | `docs/<assunto>/RNxxx-<nome>.md`, um por regra |
| UC | `docs/<assunto>/UCxx-<nome>.md`, um por caso de uso |

Para achar um identificador sem saber o assunto: `docs/**/RN034-*.md`, `docs/**/UC26-*.md` ou busca do texto `RF031` em `docs/*/requisitos.md`.

## Onde registrar conhecimento novo

Lacuna decidida pelo desenvolvedor (`guia/regras.md`) vira documentação aqui:

| Conhecimento novo | Onde |
|---|---|
| Regra de negócio | novo `docs/<assunto>/RNxxx-<nome>.md` (molde `_templates/modulo.md`) e linha no `CONTEXT.md` do assunto |
| Requisito funcional | `docs/<assunto>/requisitos.md` |
| Requisito não funcional ou de segurança | `docs/plataforma/requisitos.md` ou `docs/plataforma/seguranca.md` (com a implementação) |
| Fluxo, alternativa ou exceção de um caso de uso | o `UCxx-*.md` correspondente; caso de uso novo vira arquivo novo |
| Tabela, coluna, restrição ou função SQL | `dados.md` do assunto, junto com a migration |
| Rota, campo ou erro da API | `rotas.md` do assunto, a especificação OpenAPI e, se for erro novo, `docs/padroes/api.md` |
| Formato de dado | `docs/plataforma/RN035-formatos-dos-dados.md` |
| Convenção de código de uma área | `docs/padroes/<área>.md` |
| O que cabe em uma pasta de código, ou pasta nova | `README.md` da pasta e, se a árvore mudar, `docs/plataforma/estrutura-de-pastas.md` |
| Escolha técnica entre alternativas | novo `docs/decisoes/NNNN-<nome>.md` (molde `_templates/decisao.md`) e linha em `decisoes/CONTEXT.md` |
| Termo de negócio e seu nome no código | glossário de `guia/mapa.md` |
| Passo do processo de trabalho | `workflows/` ou `workflows/procedimentos/` |
| Limite ou comportamento da IA | `guia/regras.md` |

## Manutenção

- Identificador novo usa o próximo número livre do prefixo; nunca renumerar nem reaproveitar números.
- Todo módulo começa com cabeçalho YAML (identificador ou título, assunto, origem e relacionados); ao criar um item, atualizar os `relacionados` dos itens ligados.
- Até cerca de 2 mil tokens por arquivo; se passar, dividir por subassunto e atualizar o `CONTEXT.md` da pasta.
- Mudou regra, tabela ou rota no código: atualizar o módulo no mesmo pull request.
