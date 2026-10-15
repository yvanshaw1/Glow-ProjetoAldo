---
id: RN035
titulo: Formatos dos dados
assunto: plataforma
tema: Dados
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [UC09, UC13, UC15, UC21]
---

# RN035 – Formatos dos dados

Os dados informados nos cadastros, nas configurações e nos agendamentos seguem os formatos abaixo, aplicados da mesma forma na interface e no servidor.

Em todos os campos de texto, são removidos os espaços no início e no fim, os espaços repetidos e os caracteres de controle, e o conteúdo é tratado como texto puro, sem interpretação de HTML.

## Formatos

| Dado | Regra | Exibição |
|---|---|---|
| Nome e sobrenome | De 2 a 60 caracteres cada, com letras, inclusive acentuadas, espaço, hífen e apóstrofo. Cada palavra é gravada com a inicial maiúscula e as demais letras minúsculas; as partículas “da”, “de”, “do”, “das”, “dos” e “e” ficam em minúsculas. | Maria da Silva |
| E-mail | Até 254 caracteres, no formato usuário@domínio, com ao menos um ponto no domínio, como em .com ou .com.br, e sem espaços. Gravado em letras minúsculas. | maria@email.com |
| Celular do cliente e WhatsApp da empresa | Número brasileiro com DDD válido e nove dígitos, iniciado por 9. Gravado apenas com os 11 algarismos. | (82) 99999-8888 |
| Telefone da empresa | Fixo, com 10 algarismos, ou celular, com 11, sempre com DDD válido. Gravado apenas com os algarismos. | (82) 3333-4444 |
| Senha | De 8 a 72 caracteres, com ao menos uma letra maiúscula, um número e um caractere especial (RS003). | Nunca é exibida. |
| Placa | Padrão Mercosul (três letras, um número, uma letra e dois números) ou padrão antigo (três letras e quatro números). Aceita digitação com ou sem hífen e em minúsculas; é gravada em maiúsculas, sem hífen. | ABC1D23 ou ABC-1234 |
| Marca e modelo do veículo | De 1 a 40 caracteres. A inicial de cada palavra é gravada em maiúscula, preservando as siglas digitadas em maiúsculas. | Volkswagen; HB20 Sense |
| Cor do veículo | De 3 a 30 caracteres, apenas letras e espaços. Gravada com a inicial maiúscula e as demais letras minúsculas. | Prata; Azul marinho |
| Ano do veículo | Número inteiro de 1886, ano do primeiro automóvel, até o ano corrente. | 2024 |
| Valores em reais | Maiores que zero e até R$ 99.999,99, com duas casas decimais. Os valores calculados pelo sistema são arredondados ao centavo. | R$ 1.250,00 |
| Percentual da forma de pagamento | De 0 a 100, com até duas casas decimais. | 5,00% |
| Duração média do serviço | Número inteiro de minutos, de 5 a 2.400, ou seja, até 40 horas de trabalho. | 1 h 30 min |
| Data e horário do agendamento | Em intervalos de 30 minutos, dentro da disponibilidade da empresa (RN013). | 15/10/2026 às 09:30 |
| CNPJ | Catorze algarismos, com dígitos verificadores válidos. Gravado apenas com os algarismos. | 12.345.678/0001-90 |
| Endereços do Instagram e do Facebook | Endereço iniciado por https:// e pertencente ao domínio da respectiva rede social. | https://instagram.com/glow |
| Nomes de serviço, categoria e cargo | De 2 a 60 caracteres, gravados com a inicial maiúscula. O nome não pode se repetir entre os serviços não excluídos, entre as categorias nem entre os cargos. | Lavagem completa |
| Descrição do cargo ocupado pelo funcionário | De 2 a 60 caracteres, gravada com a inicial maiúscula. | Supervisor de lavagem |
| Horários de funcionamento e pausa | Em hora cheia ou meia hora. Nos dias de funcionamento, a abertura e o encerramento são obrigatórios, o encerramento é posterior à abertura e a pausa, quando houver, fica dentro do expediente. | 08:00 às 18:00 |
| Período do dashboard | Data inicial igual ou anterior à final, com intervalo de até 12 meses. Sem informação, vale o mês atual. | 01/10/2026 a 31/10/2026 |
| Nome da empresa, endereço e descrições | Até 100 caracteres no nome da empresa, 200 no endereço e 500 nas descrições, em texto puro. | Como informado. |
| Termo de busca | Até 100 caracteres. | Como informado. |

## Campos obrigatórios e opcionais

Um cadastro só é gravado quando todas as obrigatórias estão presentes e válidas.

| Cadastro | Obrigatórias | Opcionais |
|---|---|---|
| Cliente, pelo portal | Nome, sobrenome, e-mail, celular e senha. | Nenhuma. |
| Cliente, pelo painel | Nome, sobrenome, e-mail, celular e senha inicial (RN023). | Nenhuma. |
| Funcionário | Nome, sobrenome, e-mail, senha inicial e cargo do sistema. | Descrição do cargo ocupado. |
| Cargo | Nome e ao menos uma permissão (RN025). | Descrição. |
| Veículo | Placa e, se a placa ainda não estiver cadastrada, tipo, marca, modelo, cor e ano (RN036). | Nenhuma. |
| Categoria | Nome e descrição. | Nenhuma. |
| Serviço principal | Categoria, nome, descrição, duração média, forma de precificação e o valor fixo ou os valores dos quatro portes. | Imagem e serviços adicionais vinculados. |
| Serviço complementar | Categoria, nome, descrição, duração média, forma de precificação e o valor fixo ou os valores dos quatro portes. | Imagem. |
| Serviço adicional | Nome, duração média e valor fixo. | Serviços principais vinculados. |
| Agendamento | Veículo, ao menos um serviço principal ou complementar, forma de pagamento, data e horário e, no painel, o cliente (RN005). | Serviços adicionais. |
| Dados da empresa | Nome da empresa. | CNPJ, e-mail, telefone, endereço, Instagram, Facebook e WhatsApp. |
| Disponibilidade | Situação de cada dia, aberto ou fechado, e, nos dias abertos, os horários de abertura e de encerramento. | Pausa do dia, com início e fim. |
| Formas de pagamento | Ajuste de cada forma, sem ajuste, acréscimo ou desconto, com o respectivo percentual. | Nenhuma. |

Implementação: esquemas Zod em `src/shared/validation` (normalizam e validam), exibição em `src/shared/format`; ver [../padroes/api.md](../padroes/api.md).

## Onde se aplica

- Casos de uso: [UC09](../agendamento/UC09-visualizar-dashboard.md), [UC13](../catalogo/UC13-cadastrar-servico.md), [UC15](../catalogo/UC15-manter-categorias.md), [UC21](../equipe/UC21-gerenciar-cargos-e-permissoes.md)
