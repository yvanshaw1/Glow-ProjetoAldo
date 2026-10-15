---
titulo: Requisitos funcionais – Catálogo
assunto: catalogo
origem: Documentação de Análise do Sistema, seções 6.1.1, 6.2.4 (Quadros 6, 14)
ids: [RF001, RF002, RF003, RF004, RF005, RF006, RF057, RF058, RF059, RF060, RF061, RF062, RF063, RF064, RF065, RF066, RF067, RF068]
---

# Requisitos funcionais: Catálogo

Prioridade: Essencial (obrigatório no MVP), Importante (sem ele o sistema funciona mal) e Desejável (pode ser adiado). As regras citadas entre parênteses ficam em arquivos `RNxxx-*.md`.

## Página inicial e catálogo

| ID | Requisito | Prioridade |
|---|---|---|
| RF001 | O sistema deve disponibilizar uma página inicial pública contendo cabeçalho com barra de navegação, seção de destaque (hero), seção institucional sobre a empresa e seção de localização. | Essencial |
| RF002 | O sistema deve exibir, na página inicial, atalhos para as páginas de cadastro e de login de clientes. | Essencial |
| RF003 | O sistema deve exibir, no rodapé, os dados de contato da empresa, links de acesso rápido às páginas do portal e atalhos para as redes sociais. | Importante |
| RF004 | O sistema deve obter as informações institucionais exibidas na página inicial e no rodapé a partir das configurações da empresa mantidas no painel administrativo (RN028). | Importante |
| RF005 | O sistema deve manter o cabeçalho com a barra de navegação em todas as páginas públicas do portal, incluindo as de login e de cadastro. | Importante |
| RF006 | O sistema deve disponibilizar uma página pública de catálogo que apresente os serviços principais e complementares ativos, com nome, descrição e imagem. | Essencial |

## Gestão de serviços e categorias

| ID | Requisito | Prioridade |
|---|---|---|
| RF057 | O sistema deve permitir alternar entre o catálogo de serviços e a listagem de categorias. | Importante |
| RF058 | O sistema deve permitir filtrar os serviços por tipo (principal, adicional ou complementar). | Importante |
| RF059 | O sistema deve permitir exibir ou ocultar os serviços inativos na listagem. | Importante |
| RF060 | O sistema deve permitir o cadastro de serviços por meio de formulário em etapas, iniciado pela seleção do tipo de serviço (RN006). | Essencial |
| RF061 | Para serviço principal, o sistema deve solicitar categoria, forma de precificação (por porte do veículo ou valor fixo), duração média, nome, descrição e imagem; em seguida, os valores de cada porte ou o valor fixo; e, por fim, permitir o vínculo opcional de serviços adicionais já cadastrados (RN007, RN009). | Essencial |
| RF062 | Para serviço adicional, o sistema deve solicitar nome, duração média e valor fixo e permitir o vínculo opcional a um serviço principal já cadastrado (RN009). | Essencial |
| RF063 | Para serviço complementar, o sistema deve solicitar categoria, forma de precificação, duração média, nome, descrição e imagem, além dos valores correspondentes à forma de precificação escolhida (RN007, RN009). | Essencial |
| RF064 | O sistema deve permitir a edição dos serviços cadastrados. | Essencial |
| RF065 | O sistema deve permitir desativar e reativar um serviço, controlando sua exibição no catálogo e no agendamento do cliente (RN008). | Essencial |
| RF066 | O sistema deve permitir a exclusão de serviços (RN030). | Importante |
| RF067 | O sistema deve permitir o cadastro de categorias, informando nome e descrição. | Essencial |
| RF068 | O sistema deve permitir editar, desativar e reativar categorias e exibir ou ocultar as categorias inativas na listagem (RN031). | Importante |
