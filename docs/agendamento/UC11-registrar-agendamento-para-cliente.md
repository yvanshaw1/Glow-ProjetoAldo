---
id: UC11
titulo: Registrar agendamento para cliente
assunto: agendamento
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 36)
requisitos: [RF050, RF051]
regras: [RN003, RN006, RN009, RN010, RN011, RN013, RN015, RN034]
---

# UC11 – Registrar agendamento para cliente

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar agendamentos.
- O cliente está cadastrado e possui ao menos um veículo.

## Pós-condições

- O agendamento é registrado com o status “Agendado”, vinculado ao cliente e ao veículo selecionados (RN003).

## Fluxo principal

1. Na página de gerenciamento de agendamentos, o funcionário seleciona a opção de novo agendamento.
2. O sistema exibe a primeira etapa do formulário, e o funcionário seleciona o cliente.
3. O sistema exibe os veículos do cliente, e o funcionário seleciona o veículo.
4. O sistema exibe os serviços com os valores aplicáveis ao porte do veículo (RN009), e o funcionário seleciona os serviços desejados.
5. O funcionário seleciona a data, o horário e a forma de pagamento (RN013, RN011).
6. O sistema exibe o resumo do agendamento, com o valor total já ajustado pela forma de pagamento e a previsão de conclusão (RN010, RN034).
7. O funcionário confere os dados e confirma.
8. O sistema registra o agendamento com o status “Agendado” e atualiza a listagem.

## Fluxos alternativos

### FA01 – Edição a partir do resumo (passo 6)

1. O funcionário retorna à etapa que deseja alterar.
2. O funcionário altera os dados e avança novamente até o resumo.

### FA02 – Inclusão de serviços adicionais (passo 4)

1. Ao selecionar um serviço principal com adicionais vinculados, o sistema os oferece para inclusão (RN006).

## Fluxos de exceção

### FE01 – Cliente não cadastrado (passo 2)

1. O funcionário interrompe o agendamento e cadastra o cliente (UC16).

### FE02 – Cliente sem veículo cadastrado (passo 3)

1. O funcionário interrompe o agendamento e cadastra o veículo do cliente (UC18).

### FE03 – Data ou horário inválido (passo 5)

1. A data e o horário escolhidos estão fora do funcionamento da empresa ou já passaram; o sistema informa o problema e solicita outra escolha (RN013, RN015).

## Relacionados

- Requisitos: [RF050](requisitos.md), [RF051](requisitos.md)
- Regras: [RN003](RN003-cliente-e-veiculo-do-agendamento.md), [RN006](../catalogo/RN006-tipos-de-servico.md), [RN009](../catalogo/RN009-precificacao.md), [RN010](RN010-valor-total.md), [RN011](RN011-formas-de-pagamento.md), [RN013](RN013-disponibilidade.md), [RN015](RN015-sem-data-no-passado.md), [RN034](RN034-previsao-de-conclusao.md)
- Outros casos de uso: [UC16](../clientes/UC16-cadastrar-cliente.md), [UC18](../clientes/UC18-manter-veiculos-do-cliente.md)
- Telas e API: [rotas.md](rotas.md)
