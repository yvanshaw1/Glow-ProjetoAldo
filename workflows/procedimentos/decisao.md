# Procedimento: registro de decisão

`docs/decisoes/` guarda as escolhas técnicas e de processo que alguém poderia questionar depois, no formato ADR: decisão, alternativa descartada e justificativa. É a memória permanente do projeto; `notas.md` é só a memória da tarefa.

## Quando registrar

Registrar quando a escolha:

- tinha alternativas viáveis, e alguém poderia perguntar "por que não a outra?";
- afeta mais de um módulo ou área: estrutura de pastas, contrato da API, modelo de dados, segurança, dependências, convenções ou processo de trabalho;
- é difícil ou cara de desfazer;
- contraria ou muda uma decisão existente.

Não registrar:

- o que a documentação ou uma decisão já define: basta citar o número;
- detalhe local, reversível sem efeito fora do arquivo, como o nome de uma variável ou a forma de um laço;
- requisito ou regra de negócio: isso é lacuna da documentação e vai para RF ou RN (`docs/CONTEXT.md`).

## Analisar (etapa 01)

1. Para cada escolha técnica do plano, ler `docs/decisoes/CONTEXT.md` e os registros que tocam o tema.
2. Classificar a escolha:

| Situação | O que fazer |
|---|---|
| já coberta por uma decisão | seguir e citar o número no plano |
| contraria uma decisão | não seguir em silêncio: propor uma decisão nova que substitui a antiga, com o motivo da mudança |
| escolha nova que atende aos critérios acima | propor uma decisão nova |
| escolha local | nada a registrar |

3. Propor na seção "Decisões técnicas" do plano, com a alternativa recomendada e as descartadas. A aprovação do plano aprova as decisões.
4. Escolha que surgir só na etapa 02: parar, registrar a proposta em `notas.md` e esperar a aprovação do desenvolvedor.

## Gravar (etapa 03, só depois de aprovada)

1. Número: o maior de `docs/decisoes/` mais 1, com quatro dígitos. Nunca reaproveitar um número.
2. Criar `docs/decisoes/NNNN-<nome-curto>.md` a partir de `_templates/decisao.md`, com `status: aceita`, a data, a `origem` (issue e plano) e os `relacionados` (RF, RN, RS e decisões).
3. Escrever a decisão no presente, a alternativa descartada e a justificativa com as consequências aceitas. Uma decisão por arquivo.
4. Acrescentar a linha no índice `docs/decisoes/CONTEXT.md`.
5. Se substitui outra: no registro novo, `substitui: NNNN`; no antigo, mudar só a linha `status:` para `substituída por NNNN`, a única alteração permitida num registro existente; no índice, acrescentar "(substituída por NNNN)" ao título do antigo.
6. Atualizar os módulos que descrevem o que foi decidido (padrões, plataforma, assunto) e trocar as citações do número antigo pelo novo.
7. Se a decisão muda algo dos documentos formais, como o quadro de decisões da arquitetura, listar em "Documentos formais a atualizar" do `02_relatorio.md`.

## Nunca

- reescrever, renumerar ou apagar um registro;
- gravar uma decisão sem aprovação do desenvolvedor;
- deixar uma decisão durável só em `notas.md`.
