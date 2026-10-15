---
id: UC25
titulo: Reagendar serviço concluído
assunto: agendamento
ator: Cliente
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 50)
requisitos: [RF032, RF056]
regras: [RN008, RN009, RN010, RN011, RN013, RN014, RN015, RN020, RN034]
---

# UC25 – Reagendar serviço concluído

**Ator principal:** Cliente. **Ator secundário:** Funcionário (fluxo alternativo FA01)

## Pré-condições

- O cliente está autenticado no portal.
- O agendamento a reagendar pertence ao cliente e está com o status “Concluído” (RN020).

## Pós-condições

- Um novo agendamento é registrado com o status “Agendado”, para o mesmo veículo e com os mesmos serviços, com os valores e a duração estimada calculados pelo catálogo atual.
- O agendamento original passa ao status “Reagendado”.

## Fluxo principal

1. O cliente acessa o histórico na página de agendamentos (UC07).
2. O cliente seleciona um agendamento com o status “Concluído” e aciona a opção de reagendar.
3. O sistema inicia um novo agendamento com o mesmo veículo e os mesmos serviços do agendamento original, calculando os valores e a duração estimada pelo catálogo atual (RN020, RN009, RN014).
4. O cliente seleciona a forma de pagamento, e o sistema calcula o valor total (RN011, RN010).
5. O sistema exibe, para seleção, as datas e os horários de funcionamento da empresa (RN013, RN015).
6. O cliente seleciona a data e o horário e confirma.
7. O sistema calcula a previsão de conclusão (RN034), registra o novo agendamento com o status “Agendado” e altera o status do agendamento original para “Reagendado”.

## Fluxos alternativos

### FA01 – Reagendamento pelo funcionário (passo 1)

1. O funcionário, com permissão de gerenciar agendamentos, acessa o histórico na página de gerenciamento de agendamentos (UC10) e aciona a opção de reagendar em um agendamento com o status “Concluído”.
2. O fluxo prossegue a partir do passo 3, com o funcionário no lugar do cliente.

## Fluxos de exceção

### FE01 – Agendamento não concluído (passo 2)

1. A opção de reagendar não é oferecida para agendamentos com status diferente de “Concluído”.

### FE02 – Serviço indisponível (passo 3)

1. Algum serviço do agendamento original não está mais ativo; o sistema informa quais serviços não puderam ser incluídos e mantém os demais no novo agendamento (RN008).

### FE03 – Data ou horário inválido (passo 7)

1. A data e o horário escolhidos estão fora do funcionamento da empresa ou já passaram; o sistema recusa o agendamento e o fluxo retorna ao passo 5 (RN013, RN015).

## Relacionados

- Requisitos: [RF032](requisitos.md), [RF056](requisitos.md)
- Regras: [RN008](../catalogo/RN008-servico-inativo.md), [RN009](../catalogo/RN009-precificacao.md), [RN010](RN010-valor-total.md), [RN011](RN011-formas-de-pagamento.md), [RN013](RN013-disponibilidade.md), [RN014](RN014-duracao-estimada.md), [RN015](RN015-sem-data-no-passado.md), [RN020](RN020-reagendamento.md), [RN034](RN034-previsao-de-conclusao.md)
- Outros casos de uso: [UC07](UC07-acompanhar-agendamentos.md), [UC10](UC10-consultar-agendamentos.md)
- Telas e API: [rotas.md](rotas.md)
