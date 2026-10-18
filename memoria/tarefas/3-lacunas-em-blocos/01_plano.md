---
issue: 3
titulo: "Molde do plano: lacunas em blocos com caixas de seleção"
areas: [cicd]
tipo: documentacao
requisitos: []
status: em_execucao
aprovado_por: yvan
aprovado_em: 18/10/2026 - 12:46
---

# Plano: Molde do plano: lacunas em blocos com caixas de seleção

## Objetivo

Trocar, em `_templates/plano.md`, a tabela de quatro colunas da seção "Lacunas na documentação" (Lacuna | Opções | Texto proposto | Onde documentar) por um bloco por lacuna, com a opção escolhida marcada numa caixa de seleção. Com texto longo nas células, a tabela fica ilegível no editor (issue #3). Os planos da #1, da #6 e da #9 já usam blocos; o molde passa a gerá-los nos próximos planos. Nenhum requisito (RF, RN, RS, UC) envolvido: a mudança é só na estrutura ICM (decisão 0031).

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado o molde, quando abro "Lacunas na documentação", então não há tabela: há a frase "Marque com `x` a opção escolhida." e o bloco de exemplo L1, com **Problema.**, **Opções:** em caixas `- [ ]` (recomendada primeiro, com a consequência de cada uma) e **Texto proposto (opção recomendada):** com arquivo e trecho | leitura de `_templates/plano.md`, comparada com a seção "Texto novo do molde" abaixo |
| Dado um plano sem lacunas, quando é criado pelo molde, então a seção diz só "nenhuma" | leitura da instrução entre `< >` no início da seção |
| Dado o repositório, quando procuro a tabela antiga em `_templates/`, `guia/` e `workflows/`, então não há resultado | busca 1, abaixo, sem resultado |
| Dado `como-pedir.md`, `01_planejar.md` e `regras.md`, quando os leio, então o que dizem da seção é coerente com o formato novo | leitura dos trechos de "Conferidos, sem alteração" |

Busca 1:

```
git grep -nF "| Lacuna |" -- _templates guia workflows
```

Na `main` atual (`2f5beee`), a busca acha só `_templates/plano.md:38`. Em todo o repositório, acha também `memoria/tarefas/2-tarefas-de-ponta-a-ponta/01_plano.md:224`, o plano da #2, que é histórico e fica como está (ver "Fora do escopo").

## Arquivos

| Arquivo | Ação |
|---|---|
| `_templates/plano.md` | alterar: só a seção "Lacunas na documentação", pelo texto abaixo; o cabeçalho (`areas: [...]`, da #2) e as demais seções ficam iguais |
| `memoria/tarefas/3-lacunas-em-blocos/` | criar: `01_plano.md` e `notas.md` nesta etapa; `02_relatorio.md` na etapa 03 |

### Conferidos, sem alteração

Conferidos de novo na `main` atual (`2f5beee`). Nenhum cita a tabela; todos descrevem o conteúdo de uma lacuna, que o formato novo mantém.

- `guia/como-pedir.md`, "Revisão do plano (você)": "decida as lacunas da seção "Lacunas na documentação" (marque a opção escolhida)" já descreve o gesto das caixas. "Quando a IA aponta uma lacuna" lista opções, recomendação, texto proposto e arquivo, sem falar em colunas.
- `workflows/01_planejar.md`, passo 3 do processo: "com opções, recomendação, texto proposto e arquivo de destino".
- `guia/regras.md`, "Lacunas na documentação", passo 1: a mesma lista. No formato novo, o problema é "o que falta", a opção 1 é a recomendação e o arquivo de destino abre cada item do texto proposto.
- `_templates/relatorio.md`, "Lacunas resolvidas: <lacuna → decisão → arquivo; ou "nenhuma">": continua valendo (por exemplo, "L1 → opção 1 → `docs/...`").
- `workflows/02_construir.md` (lacuna que surge na construção vai para `notas.md`), `workflows/03_entregar.md`, passo 2 ("as lacunas decididas no plano ou em `notas.md`"), e `docs/CONTEXT.md`, "Onde registrar conhecimento novo": não dependem da forma da seção.

## Texto novo do molde

Substitui, em `_templates/plano.md`, tudo o que vai do título "## Lacunas na documentação" até a linha antes de "## Decisões técnicas":

```markdown
## Lacunas na documentação

<O que a documentação não cobre, ou onde ela se contradiz: um bloco por lacuna, numerados L1, L2..., com a opção recomendada em primeiro. O arquivo de cada item do texto proposto segue a tabela "Onde registrar conhecimento novo" de `docs/CONTEXT.md`. Se a documentação cobre tudo, trocar o parágrafo e os blocos abaixo por "nenhuma".>

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. <título curto>

**Problema.** <O que falta ou o que se contradiz, citando os arquivos e os trechos.>

**Opções:**

- [ ] **1. <nome> (recomendada).** <consequência>
- [ ] **2. <nome>.** <consequência>

**Texto proposto (opção recomendada):**

- `<arquivo>`, <trecho>: "<texto atual>" passa a "<texto novo>".
- `<arquivo novo>`, novo: <o que contém>.
```

É o formato dos planos da #1 e da #6, que o desenvolvedor já marcou. O plano da #9 (PR #10) usa uma variante sem a frase de abertura e com as opções sem número; o molde fica com o formato da #1, que a issue pede.

## Testes previstos

- Nenhum teste automatizado: a mudança é num molde de documentação, e os testes automatizados cobrem só as regras de negócio (decisão 0024). A verificação é a da tabela de critérios.
- O `npm run check` roda no CI, mas não alcança o molde: o Prettier ignora os `.md` (`.prettierignore`).

## Lacunas na documentação

nenhuma

## Decisões técnicas

Nenhuma nova.

- Seguidas: 0031 (estrutura ICM, da qual os moldes de `_templates/` fazem parte) e 0039 (tarefas de ponta a ponta: o campo `areas` do cabeçalho deste plano).
- O formato da seção é escolha local de um molde, desfeita editando um arquivo, sem efeito em código, dados ou outros módulos; por isso não vira registro (`workflows/procedimentos/decisao.md`, "Não registrar"). O motivo fica na issue #3.

## Riscos e dúvidas

- Arquivos em comum com outras tarefas: nenhum. A #2, que mudou o cabeçalho do molde, já foi incorporada (`2f5beee`). O PR #10 (issue #9), em revisão, altera `guia/regras.md` (passo 4 de "Lacunas na documentação" e "Uso do contexto"), mas não `_templates/plano.md`, `guia/como-pedir.md` nem `workflows/01_planejar.md`; esta tarefa não altera `guia/regras.md`. As duas podem ser incorporadas em qualquer ordem.
- Documento formal: a seção 3.5 do Desenvolvimento com IA descreve o molde do plano (o PR #10 atualiza nela o exemplo do cabeçalho para `areas: [backend]`). Se ela reproduzir a tabela de lacunas, o `02_relatorio.md` indica a atualização (`guia/regras.md`, "Lacunas na documentação", passo 4). O `.docx` não está nesta ramificação, que parte da `main` antes do PR #10, e, depois dele, o agente só abre os `.docx` quando o desenvolvedor pede (decisão 0040, proposta no PR #10). Conferir e alterar o `.docx` fica fora desta tarefa, salvo pedido do desenvolvedor.
- Ramificação `docs/3-plan-gap-blocks`, criada a partir da `main` na etapa 02 (`workflows/procedimentos/git.md`).

## Fora do escopo

- Planos já gravados: os da #1, #6 e #9 já usam blocos; o da #2 usa a tabela e fica como está, porque é o histórico da tarefa.
- A tabela da seção "Decisões técnicas" do molde, com quatro colunas de texto longo e o mesmo problema de leitura; se o desenvolvedor quiser, vira outra issue `tipo:documentacao`.
- As lacunas que surgem depois do planejamento, registradas em `notas.md`: o molde de notas já pede opções e recomendação em texto livre.
- O `.docx` do Desenvolvimento com IA (ver "Riscos e dúvidas").
