---
id: UC13
titulo: Cadastrar serviço
assunto: catalogo
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 38)
requisitos: [RF060, RF061, RF062, RF063]
regras: [RN006, RN007, RN009, RN035]
---

# UC13 – Cadastrar serviço

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar serviços.
- Para serviço principal ou complementar, existe ao menos uma categoria cadastrada (RN007).

## Pós-condições

- O serviço é cadastrado e passa a constar no catálogo de serviços do painel.
- Serviços principais e complementares ativos passam a ser exibidos no catálogo público e no agendamento.

## Fluxo principal

1. Na página de gerenciamento de serviços, o funcionário seleciona a opção de novo serviço.
2. O sistema solicita o tipo de serviço: principal, adicional ou complementar (RN006).
3. O funcionário seleciona o tipo principal.
4. O sistema solicita categoria, forma de precificação (por porte ou valor fixo), duração média, nome, descrição e imagem.
5. O funcionário informa os dados e avança.
6. O sistema solicita os valores: um para cada porte (P, M, G e GG) ou um valor único, conforme a forma de precificação (RN009).
7. O funcionário informa os valores e avança.
8. O sistema exibe os serviços adicionais já cadastrados para vínculo opcional.
9. O funcionário seleciona os adicionais desejados, ou nenhum, e confirma.
10. O sistema valida os dados, grava o serviço e o exibe na listagem.

## Fluxos alternativos

### FA01 – Serviço adicional (passo 3)

1. O funcionário seleciona o tipo adicional.
2. O sistema solicita nome, duração média e valor fixo e oferece o vínculo opcional a um serviço principal já cadastrado.
3. O funcionário informa os dados e confirma; o sistema valida e grava o serviço.

### FA02 – Serviço complementar (passo 3)

1. O funcionário seleciona o tipo complementar.
2. O sistema solicita categoria, forma de precificação, duração média, nome, descrição e imagem e, em seguida, os valores.
3. O funcionário informa os dados e confirma; o sistema valida e grava o serviço, sem etapa de vínculo de adicionais.

## Fluxos de exceção

### FE01 – Dados inválidos ou incompletos

1. O sistema indica os campos com problema e mantém o funcionário na etapa correspondente.

### FE02 – Imagem inválida (passo 5)

1. O arquivo não é uma imagem em formato aceito ou excede o tamanho máximo; o sistema recusa o arquivo e solicita outro (RS015).

### FE03 – Nenhuma categoria cadastrada (passo 4)

1. O sistema informa que é necessário cadastrar uma categoria antes (UC15).

### FE04 – Nome já utilizado

1. Já existe um serviço não excluído com o mesmo nome; o sistema solicita outro nome (RN035).

## Relacionados

- Requisitos: [RF060](requisitos.md), [RF061](requisitos.md), [RF062](requisitos.md), [RF063](requisitos.md)
- Regras: [RN006](RN006-tipos-de-servico.md), [RN007](RN007-categoria-obrigatoria.md), [RN009](RN009-precificacao.md), [RN035](../plataforma/RN035-formatos-dos-dados.md)
- Segurança: [RS015](../plataforma/seguranca.md)
- Outros casos de uso: [UC15](UC15-manter-categorias.md)
- Telas e API: [rotas.md](rotas.md)
