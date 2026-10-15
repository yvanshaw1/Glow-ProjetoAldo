---
titulo: Requisitos funcionais – Agendamento
assunto: agendamento
origem: Documentação de Análise do Sistema, seções 6.1.4, 6.1.5, 6.2.2, 6.2.3 (Quadros 9, 10, 12, 13)
ids: [RF019, RF020, RF021, RF022, RF023, RF024, RF025, RF026, RF027, RF028, RF029, RF030, RF031, RF032, RF040, RF041, RF042, RF043, RF044, RF045, RF046, RF047, RF048, RF049, RF050, RF051, RF052, RF053, RF054, RF055, RF056]
---

# Requisitos funcionais: Agendamento

Prioridade: Essencial (obrigatório no MVP), Importante (sem ele o sistema funciona mal) e Desejável (pode ser adiado). As regras citadas entre parênteses ficam em arquivos `RNxxx-*.md`.

## Agendamento de serviços pelo cliente

| ID | Requisito | Prioridade |
|---|---|---|
| RF019 | O sistema deve exigir a seleção de um veículo cadastrado antes de exibir os serviços disponíveis para agendamento (RN004). | Essencial |
| RF020 | O sistema deve exibir os serviços ativos disponíveis para agendamento com o valor aplicável ao veículo selecionado: o valor do porte correspondente ou o valor fixo (RN009). | Essencial |
| RF021 | O sistema deve disponibilizar um carrinho no qual o cliente adiciona e remove serviços, com a exibição dos itens selecionados e da soma dos seus valores. | Essencial |
| RF022 | O sistema deve oferecer, para cada serviço principal incluído no carrinho, os serviços adicionais a ele vinculados (RN006). | Importante |
| RF023 | O sistema deve permitir que o cliente selecione a forma de pagamento a ser utilizada presencialmente: crédito, débito, Pix ou dinheiro (RN011). | Essencial |
| RF024 | O sistema deve calcular o valor total do agendamento aplicando, sobre a soma dos valores dos serviços, o percentual de acréscimo ou de desconto da forma de pagamento selecionada (RN010). | Essencial |
| RF025 | O sistema deve permitir a seleção da data e do horário do agendamento dentro dos dias e horários de funcionamento da empresa, sem aceitar data e horário já passados (RN013, RN015). | Essencial |
| RF026 | O sistema deve exibir, antes da confirmação, um resumo com o valor total, a duração estimada e a previsão de conclusão do agendamento, calculada apenas sobre os horários de funcionamento da empresa (RN014, RN034). | Importante |
| RF027 | O sistema deve registrar o agendamento confirmado pelo cliente com o status “Agendado”. | Essencial |

## Acompanhamento de agendamentos pelo cliente

| ID | Requisito | Prioridade |
|---|---|---|
| RF028 | O sistema deve listar os agendamentos atuais do cliente com seus respectivos status. | Essencial |
| RF029 | O sistema deve listar o histórico de agendamentos do cliente. | Essencial |
| RF030 | O sistema deve permitir que o cliente cancele um agendamento que esteja com o status “Agendado” (RN019). | Importante |
| RF031 | O sistema deve permitir que o cliente edite um agendamento com o status “Agendado”, alterando o veículo, os serviços e a forma de pagamento e postergando a data e o horário, com o recálculo dos valores, da duração estimada e da previsão de conclusão (RN032, RN033). | Importante |
| RF032 | O sistema deve permitir que o cliente reagende, a partir do histórico, um agendamento com o status “Concluído”, gerando um novo agendamento com os valores e a duração estimada calculados pelo catálogo atual (RN020). | Importante |

## Dashboard

| ID | Requisito | Prioridade |
|---|---|---|
| RF040 | O sistema deve exibir os indicadores de receita, quantidade de agendamentos, ticket médio e taxa de cancelamento (RN021). | Importante |
| RF041 | O sistema deve exibir a receita por dia. | Importante |
| RF042 | O sistema deve exibir a distribuição dos agendamentos por status. | Importante |
| RF043 | O sistema deve exibir a agenda do dia, com os agendamentos previstos para a data corrente. | Importante |

## Gestão de agendamentos

| ID | Requisito | Prioridade |
|---|---|---|
| RF044 | O sistema deve listar os agendamentos em três visões: agendamentos do dia, agendamentos futuros e histórico de agendamentos. | Essencial |
| RF045 | O sistema deve permitir ordenar a listagem por horário ou por status. | Importante |
| RF046 | O sistema deve permitir filtrar a listagem por status do agendamento. | Importante |
| RF047 | O sistema deve permitir buscar agendamentos de um cliente ou de um veículo específico. | Importante |
| RF048 | O sistema deve permitir limpar, em uma única ação, os filtros e a busca aplicados. | Desejável |
| RF049 | O sistema deve permitir atualizar a listagem de agendamentos sob demanda. | Desejável |
| RF050 | O sistema deve permitir que o funcionário crie um agendamento para um cliente por meio de formulário em etapas: seleção do cliente; seleção do veículo do cliente; seleção dos serviços; seleção de data, horário e forma de pagamento; e resumo do agendamento. | Essencial |
| RF051 | O sistema deve exibir, no resumo, os dados, o valor total e a previsão de conclusão do agendamento (RN010, RN034) e permitir a conferência e a edição antes da confirmação. | Importante |
| RF052 | O sistema deve permitir que o funcionário altere o status do agendamento conforme o andamento do atendimento, na sequência “Agendado”, “Em espera”, “Em execução”, “Finalizado” e “Concluído” (RN017, RN018). | Essencial |
| RF053 | O sistema deve exibir, na conclusão de um agendamento com o status “Finalizado”, o resumo do atendimento realizado e permitir que o funcionário confirme ou altere a forma de pagamento utilizada pelo cliente, com o recálculo do valor total, antes de registrar o status “Concluído” (RN018). | Essencial |
| RF054 | O sistema deve permitir que o funcionário cancele um agendamento que ainda não esteja em execução (RN019). | Importante |
| RF055 | O sistema deve permitir que o funcionário edite um agendamento em qualquer status, alterando o veículo, os serviços e a forma de pagamento e adiantando ou postergando a data e o horário, sem que a data, o horário e os valores fiquem incoerentes (RN032, RN033). | Essencial |
| RF056 | O sistema deve permitir que o funcionário reagende, a partir do histórico, um agendamento com o status “Concluído”, gerando um novo agendamento com os valores e a duração estimada calculados pelo catálogo atual (RN020). | Importante |
