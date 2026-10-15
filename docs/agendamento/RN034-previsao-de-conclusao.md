---
id: RN034
titulo: Previsão de conclusão
assunto: agendamento
tema: Disponibilidade
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [RF026, RF051, RN014, RN033, UC06, UC11, UC25, UC26]
---

# RN034 – Previsão de conclusão

A previsão de conclusão do agendamento é calculada a partir da data e do horário marcados, somando a duração estimada (RN014) apenas nos períodos de funcionamento da empresa: os dias fechados, os horários fora do expediente e a pausa do dia não são contados, pois ninguém trabalha no veículo nesses períodos. Assim, um agendamento com muitos serviços pode ter conclusão prevista para um dia posterior ao da entrada do veículo. A previsão tem caráter informativo e é recalculada sempre que o agendamento é editado.

## Onde se aplica

- Requisitos: [RF026](requisitos.md), [RF051](requisitos.md)
- Casos de uso: [UC06](UC06-agendar-servico.md), [UC11](UC11-registrar-agendamento-para-cliente.md), [UC25](UC25-reagendar-servico-concluido.md), [UC26](UC26-editar-agendamento.md)
- Regras ligadas: [RN014](RN014-duracao-estimada.md), [RN033](RN033-coerencia-da-edicao.md)
