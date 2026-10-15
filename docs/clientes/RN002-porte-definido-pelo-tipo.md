---
id: RN002
titulo: Porte definido pelo tipo
assunto: clientes
tema: Veículos
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [RF016, RF018, RF075, RF076, RN037, UC05, UC18]
---

# RN002 – Porte definido pelo tipo

O porte do veículo é determinado pelo tipo informado no cadastro, conforme a tabela abaixo, e não é informado diretamente pelo usuário. O tipo também é registrado, pois mais de um tipo pode corresponder ao mesmo porte. Quando o tipo é alterado na edição do veículo, o porte é redefinido, sem modificar os agendamentos já registrados (RN037).

| Tipo | Valor no banco | Porte |
|---|---|---|
| Hatch | `hatch` | P (pequeno) |
| Sedan | `sedan` | M (médio) |
| SUV | `suv` | G (grande) |
| Picape | `pickup` | GG (extragrande) |

## Onde se aplica

- Requisitos: [RF016](requisitos.md), [RF018](requisitos.md), [RF075](requisitos.md), [RF076](requisitos.md)
- Casos de uso: [UC05](UC05-manter-veiculos.md), [UC18](UC18-manter-veiculos-do-cliente.md)
- Regras ligadas: [RN037](../agendamento/RN037-copia-no-agendamento.md)
