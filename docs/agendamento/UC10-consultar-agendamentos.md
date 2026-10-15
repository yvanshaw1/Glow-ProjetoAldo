---
id: UC10
titulo: Consultar agendamentos
assunto: agendamento
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 35)
requisitos: [RF044, RF045, RF046, RF047, RF048, RF049]
regras: []
---

# UC10 – Consultar agendamentos

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar agendamentos.

## Pós-condições

- Os agendamentos são exibidos conforme a visão, a ordenação e os filtros selecionados.

## Fluxo principal

1. O funcionário acessa a página de gerenciamento de agendamentos.
2. O sistema exibe os agendamentos do dia.
3. O funcionário alterna entre as visões de agendamentos do dia, agendamentos futuros e histórico.
4. O sistema exibe os agendamentos da visão selecionada.

## Fluxos alternativos

### FA01 – Ordenação

1. O funcionário escolhe ordenar por horário ou por status e o sistema reordena a listagem.

### FA02 – Filtro por status

1. O funcionário seleciona um status e o sistema exibe apenas os agendamentos correspondentes.

### FA03 – Busca

1. O funcionário informa um cliente ou um veículo e o sistema exibe os agendamentos correspondentes.

### FA04 – Limpeza de filtros

1. O funcionário aciona a opção de limpar filtros e o sistema restabelece a listagem completa da visão.

### FA05 – Atualização da listagem

1. O funcionário aciona a opção de atualizar e o sistema recarrega os dados.

### FA06 – Reagendamento de serviço concluído

1. No histórico, o funcionário aciona a opção de reagendar em um agendamento com o status “Concluído”, e o fluxo prossegue conforme o UC25.

### FA07 – Edição de agendamento

1. O funcionário aciona a opção de editar em um agendamento de qualquer status, e o fluxo prossegue conforme o UC26.

## Fluxos de exceção

### FE01 – Nenhum agendamento encontrado

1. O sistema informa que não há agendamentos para os critérios selecionados.

## Relacionados

- Requisitos: [RF044](requisitos.md), [RF045](requisitos.md), [RF046](requisitos.md), [RF047](requisitos.md), [RF048](requisitos.md), [RF049](requisitos.md)
- Outros casos de uso: [UC25](UC25-reagendar-servico-concluido.md), [UC26](UC26-editar-agendamento.md)
- Telas e API: [rotas.md](rotas.md)
