---
id: UC07
titulo: Acompanhar agendamentos
assunto: agendamento
ator: Cliente
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 32)
requisitos: [RF028, RF029, RF030]
regras: [RN019]
---

# UC07 – Acompanhar agendamentos

**Ator principal:** Cliente. **Ator secundário:** Não se aplica.

## Pré-condições

- O cliente está autenticado no portal.

## Pós-condições

- Os agendamentos do cliente são exibidos.
- No caso de cancelamento, o agendamento passa ao status “Cancelado”.

## Fluxo principal

1. O cliente acessa a página de agendamentos.
2. O sistema exibe os agendamentos atuais, com data, horário, veículo, serviços e status (RS009).
3. O cliente seleciona o histórico.
4. O sistema exibe os agendamentos já encerrados: concluídos, cancelados ou reagendados.

## Fluxos alternativos

### FA01 – Cancelamento de agendamento (passo 2)

1. O cliente seleciona um agendamento com o status “Agendado” e solicita o cancelamento (RN019).
2. O sistema solicita a confirmação.
3. O cliente confirma e o sistema altera o status para “Cancelado”, movendo o agendamento para o histórico.

### FA02 – Reagendamento de serviço concluído (passo 4)

1. No histórico, o cliente aciona a opção de reagendar em um agendamento com o status “Concluído”, e o fluxo prossegue conforme o UC25.

### FA03 – Edição de agendamento (passo 2)

1. O cliente aciona a opção de editar em um agendamento com o status “Agendado”, e o fluxo prossegue conforme o UC26.

## Fluxos de exceção

### FE01 – Nenhum agendamento encontrado (passos 2 ou 4)

1. O sistema informa que não há agendamentos a exibir.

### FE02 – Cancelamento não permitido (FA01)

1. O agendamento não está mais com o status “Agendado”; o sistema informa que ele não pode ser cancelado pelo portal.

## Relacionados

- Requisitos: [RF028](requisitos.md), [RF029](requisitos.md), [RF030](requisitos.md)
- Regras: [RN019](RN019-cancelamento.md)
- Segurança: [RS009](../plataforma/seguranca.md)
- Outros casos de uso: [UC25](UC25-reagendar-servico-concluido.md), [UC26](UC26-editar-agendamento.md)
- Telas e API: [rotas.md](rotas.md)
