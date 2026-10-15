---
titulo: Requisitos não funcionais
assunto: plataforma
origem: Documentação de Análise do Sistema, seção 7 (Quadro 18)
ids: [RNF001, RNF002, RNF003, RNF004, RNF005, RNF006, RNF007, RNF008, RNF009, RNF010, RNF011, RNF012, RNF013, RNF014, RNF015, RNF016]
---

# Requisitos não funcionais

Valem para todo o sistema. Os requisitos de segurança (RS) estão em [seguranca.md](seguranca.md).

| ID | Categoria | Descrição | Prioridade |
|---|---|---|---|
| RNF001 | Usabilidade | A interface deve ser responsiva, adaptando-se a telas de computadores, tablets e celulares. | Essencial |
| RNF002 | Usabilidade | Formulários extensos devem ser divididos em etapas, com indicação da etapa atual e possibilidade de retorno às etapas anteriores sem perda dos dados informados. | Importante |
| RNF003 | Usabilidade | As mensagens de validação, de erro e de confirmação devem ser claras, redigidas em português e exibidas junto ao elemento a que se referem. | Importante |
| RNF004 | Usabilidade | O sistema deve fornecer retorno visual para operações em andamento, concluídas ou com falha. | Importante |
| RNF005 | Acessibilidade | As telas devem adotar boas práticas de acessibilidade, como contraste adequado, rótulos nos campos de formulário e navegação por teclado. | Desejável |
| RNF006 | Desempenho | As páginas públicas devem ser carregadas em até 3 segundos em conexão de banda larga. | Importante |
| RNF007 | Desempenho | As operações de consulta e de gravação devem responder em até 2 segundos em condições normais de uso. | Importante |
| RNF008 | Desempenho | Todas as listagens devem ser paginadas, com uma quantidade de itens por página adequada a cada tela e um limite máximo definido pelo sistema. | Importante |
| RNF009 | Compatibilidade | O sistema deve funcionar nas versões atuais dos navegadores Google Chrome, Microsoft Edge, Mozilla Firefox e Safari. | Essencial |
| RNF010 | Confiabilidade | Toda gravação que envolva mais de um registro, como um agendamento com os seus serviços ou um serviço com os seus valores, deve ser atômica: ou todos os dados são gravados, ou nenhum. | Essencial |
| RNF011 | Confiabilidade | Alterações simultâneas em um mesmo registro não devem se sobrescrever: se o registro tiver sido alterado por outra pessoa depois de aberto para edição, a gravação deve ser recusada e o usuário, avisado para recarregar os dados. | Importante |
| RNF012 | Disponibilidade | O portal deve permitir que o cliente registre agendamentos a qualquer momento, mesmo fora do horário de funcionamento da empresa. | Importante |
| RNF013 | Manutenibilidade | A solução deve separar as interfaces (portal e painel) do backend, com comunicação exclusivamente por API. | Essencial |
| RNF014 | Manutenibilidade | O código-fonte deve ser versionado e seguir os padrões de codificação e de revisão definidos na Documentação de Desenvolvimento com IA. | Essencial |
| RNF015 | Implantação | Os parâmetros que variam entre ambientes devem ser definidos por configuração externa ao código. | Importante |
| RNF016 | Localização | A interface deve ser apresentada em português do Brasil, com valores monetários em reais (R$) e datas no formato dd/mm/aaaa. | Essencial |
