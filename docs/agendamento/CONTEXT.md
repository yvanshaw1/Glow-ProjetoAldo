# docs/agendamento/ – Agendamento

Agendar, editar, cancelar, reagendar e concluir atendimentos; status; preço e previsão de conclusão; dashboard, com a análise do período por IA. Módulos de backend `appointments` e `dashboard`.

Leia só o que a tarefa pede: o caso de uso do fluxo, as regras que ele cita e, para implementar, `dados.md` e `rotas.md`. Para achar um identificador em qualquer assunto: `docs/**/RN0xx-*.md`, `docs/**/UCxx-*.md` ou busca pelo ID em `docs/*/requisitos.md`.

| Arquivo | Conteúdo |
|---|---|
| requisitos.md | Requisitos funcionais RF019–RF032, RF040–RF056, RF089–RF090 (33) |
| UC06-agendar-servico.md | Agendar serviço (Cliente) |
| UC07-acompanhar-agendamentos.md | Acompanhar agendamentos (Cliente) |
| UC09-visualizar-dashboard.md | Visualizar dashboard (Funcionário) |
| UC10-consultar-agendamentos.md | Consultar agendamentos (Funcionário) |
| UC11-registrar-agendamento-para-cliente.md | Registrar agendamento para cliente (Funcionário) |
| UC12-atualizar-status-do-agendamento.md | Atualizar status do agendamento (Funcionário) |
| UC25-reagendar-servico-concluido.md | Reagendar serviço concluído (Cliente) |
| UC26-editar-agendamento.md | Editar agendamento (Cliente) |
| UC27-gerar-analise-do-dashboard.md | Gerar análise do dashboard (Funcionário) |
| RN003-cliente-e-veiculo-do-agendamento.md | Cliente e veículo do agendamento |
| RN004-veiculo-antes-dos-servicos.md | Veículo antes dos serviços |
| RN005-servico-obrigatorio-no-agendamento.md | Serviço obrigatório no agendamento |
| RN010-valor-total.md | Valor total |
| RN011-formas-de-pagamento.md | Formas de pagamento |
| RN013-disponibilidade.md | Disponibilidade |
| RN014-duracao-estimada.md | Duração estimada |
| RN015-sem-data-no-passado.md | Sem data no passado |
| RN016-sem-controle-de-capacidade.md | Sem controle de capacidade |
| RN017-sequencia-de-status.md | Sequência de status |
| RN018-conclusao-com-pagamento.md | Conclusão com pagamento |
| RN019-cancelamento.md | Cancelamento |
| RN020-reagendamento.md | Reagendamento |
| RN021-indicadores-do-dashboard.md | Indicadores do dashboard |
| RN032-quem-edita-o-agendamento.md | Quem edita o agendamento |
| RN033-coerencia-da-edicao.md | Coerência da edição |
| RN034-previsao-de-conclusao.md | Previsão de conclusão |
| RN037-copia-no-agendamento.md | Cópia no agendamento |
| RN038-dados-da-analise-do-dashboard.md | Dados da análise do dashboard |
| RN039-conteudo-da-analise-do-dashboard.md | Conteúdo da análise do dashboard |
| dados.md | Tabelas `appointments`, `appointment_services` |
| rotas.md | Telas e rotas da API |
| meus-agendamentos.md | Conteúdo e textos da página de agendamentos do cliente (`/appointments`) |
| dashboard-do-painel.md | Conteúdo e textos da tela do dashboard (`/admin`): período, indicadores, agenda do dia e estados |
| agendamentos-do-painel.md | Conteúdo e textos da página de agendamentos do painel (`/admin/appointments`): visões, controles, cartão, detalhe, ações de status (inclusive o reagendamento) e estados |
| agendar-servico.md | Etapas, campos e textos do assistente de agendamento (`/booking`), edição e reagendamento (`/appointments`) |
| calculos.md | Funções puras de preço, status, datas, edição e da análise do dashboard (testadas com TDD) |
