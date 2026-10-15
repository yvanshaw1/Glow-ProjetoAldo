---
id: UC12
titulo: Atualizar status do agendamento
assunto: agendamento
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 37)
requisitos: [RF052, RF053, RF054]
regras: [RN010, RN012, RN017, RN018, RN019]
---

# UC12 – Atualizar status do agendamento

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar agendamentos.
- O agendamento está com o status “Agendado”, “Em espera”, “Em execução” ou “Finalizado”.

## Pós-condições

- O novo status é gravado e refletido na página de agendamentos do cliente e no dashboard.

## Fluxo principal

1. O funcionário localiza o agendamento na página de gerenciamento de agendamentos (UC10).
2. O funcionário aciona a mudança para o próximo status.
3. O sistema verifica se a transição é permitida, na sequência “Agendado”, “Em espera”, “Em execução”, “Finalizado” e “Concluído” (RN017).
4. O sistema grava o novo status.
5. O sistema atualiza a listagem.

## Fluxos alternativos

### FA01 – Conclusão com registro do pagamento (passo 2)

1. Com o agendamento no status “Finalizado”, o funcionário aciona a conclusão.
2. O sistema exibe o resumo do atendimento realizado: veículo, serviços, valores, forma de pagamento escolhida e valor total.
3. O funcionário confirma a forma de pagamento utilizada pelo cliente ou a altera; nesse caso, o sistema aplica o percentual da nova forma e recalcula o valor total (RN012, RN010).
4. O funcionário recebe o pagamento presencialmente e confirma a conclusão; o sistema grava o status “Concluído” (RN018).

### FA02 – Cancelamento do agendamento (passo 2)

1. O funcionário aciona o cancelamento de um agendamento com o status “Agendado” ou “Em espera” (RN019).
2. O sistema solicita a confirmação.
3. O funcionário confirma e o sistema altera o status para “Cancelado”.

## Fluxos de exceção

### FE01 – Transição não permitida (passo 3)

1. O sistema recusa a alteração e informa o status atual do agendamento.

## Relacionados

- Requisitos: [RF052](requisitos.md), [RF053](requisitos.md), [RF054](requisitos.md)
- Regras: [RN010](RN010-valor-total.md), [RN012](../configuracoes/RN012-percentual-da-forma-de-pagamento.md), [RN017](RN017-sequencia-de-status.md), [RN018](RN018-conclusao-com-pagamento.md), [RN019](RN019-cancelamento.md)
- Outros casos de uso: [UC10](UC10-consultar-agendamentos.md)
- Telas e API: [rotas.md](rotas.md)
