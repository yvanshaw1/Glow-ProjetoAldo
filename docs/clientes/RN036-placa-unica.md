---
id: RN036
titulo: Placa única
assunto: clientes
tema: Veículos
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [RF015, RF018, RF075, RF076, UC05, UC18]
---

# RN036 – Placa única

Cada placa corresponde a um único veículo no sistema. Ao cadastrar um veículo, o sistema verifica a placa: se ela já estiver cadastrada, o veículo existente é vinculado à conta, com os seus dados preenchidos automaticamente, em vez de ser criado outro veículo. Um mesmo veículo pode estar vinculado a mais de uma conta, como na troca de proprietário ou no uso compartilhado, mas não duas vezes à mesma conta. Os dados de um veículo vinculado a mais de uma conta só podem ser alterados pelo funcionário.

## Onde se aplica

- Requisitos: [RF015](requisitos.md), [RF018](requisitos.md), [RF075](requisitos.md), [RF076](requisitos.md)
- Casos de uso: [UC05](UC05-manter-veiculos.md), [UC18](UC18-manter-veiculos-do-cliente.md)
