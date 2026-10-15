---
id: UC05
titulo: Manter veículos
assunto: clientes
ator: Cliente
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 30)
requisitos: [RF015, RF016, RF017, RF018]
regras: [RN002, RN036]
---

# UC05 – Manter veículos

**Ator principal:** Cliente. **Ator secundário:** Não se aplica.

## Pré-condições

- O cliente está autenticado no portal.

## Pós-condições

- O veículo fica vinculado à conta do cliente, com o porte definido, e disponível para agendamentos.
- Se a placa já estava cadastrada, o veículo existente é vinculado à conta, sem criação de outro veículo (RN036).
- No caso de edição, os dados do veículo são atualizados.

## Fluxo principal

1. Na área do cliente, o cliente seleciona a opção de cadastrar veículo.
2. O sistema solicita a placa do veículo.
3. O cliente informa a placa.
4. O sistema verifica se a placa já está cadastrada (RN036); não estando, solicita o tipo do veículo (hatch, sedan, SUV ou picape), a marca, o modelo, a cor e o ano.
5. O cliente informa os dados e confirma.
6. O sistema valida os dados, define o porte do veículo a partir do tipo (RN002), grava o veículo e o vincula à conta.
7. O sistema exibe o veículo na lista de veículos da conta.

## Fluxos alternativos

### FA01 – Placa já cadastrada (passo 4)

1. O sistema exibe o tipo, a marca, o modelo, a cor e o ano do veículo já cadastrado, preenchidos automaticamente e sem possibilidade de alteração nesta etapa.
2. O cliente confere os dados e confirma.
3. O sistema vincula o veículo existente à conta, sem criar outro veículo (RN036), e o fluxo prossegue no passo 7.

### FA02 – Edição de veículo (passo 1)

1. Na lista de veículos da conta, o cliente seleciona um veículo e aciona a opção de editar.
2. O sistema exibe os dados do veículo para alteração.
3. O cliente altera os dados desejados e confirma.
4. O sistema valida os dados, redefine o porte se o tipo tiver sido alterado e grava as alterações, sem modificar os agendamentos já registrados (RN002).

## Fluxos de exceção

### FE01 – Dados inválidos ou incompletos (passo 6 ou FA02)

1. O sistema indica os campos com problema e mantém os dados já informados para correção.

### FE02 – Veículo já vinculado à conta (passo 4)

1. A placa informada já está entre os veículos da conta; o sistema informa o cliente e não cria outro vínculo.

### FE03 – Veículo vinculado a outra conta (FA02)

1. O veículo também está vinculado a outra conta; a edição não é oferecida ao cliente, e o sistema informa que alterações devem ser solicitadas à empresa (RN036).

### FE04 – Placa de outro veículo (FA02)

1. Na edição, a nova placa pertence a outro veículo já cadastrado; o sistema recusa a alteração (RN036).

## Relacionados

- Requisitos: [RF015](requisitos.md), [RF016](requisitos.md), [RF017](requisitos.md), [RF018](requisitos.md)
- Regras: [RN002](RN002-porte-definido-pelo-tipo.md), [RN036](RN036-placa-unica.md)
- Telas e API: [rotas.md](rotas.md)
