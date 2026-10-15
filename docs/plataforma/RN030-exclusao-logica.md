---
id: RN030
titulo: Exclusão lógica
assunto: plataforma
tema: Exclusão
origem: Documentação de Análise do Sistema, seção 9.1 (Quadro 20)
relacionados: [RF066, RF074, UC14, UC17]
---

# RN030 – Exclusão lógica

Nenhum registro com histórico é apagado. A exclusão de clientes e de serviços é lógica: o registro deixa de ser exibido e de poder ser utilizado, mas é preservado, de modo que o histórico de agendamentos e os indicadores do dashboard não sejam alterados. Funcionários, cargos e categorias não são excluídos, apenas desativados, e veículos e agendamentos permanecem sempre registrados.

## Onde se aplica

- Requisitos: [RF066](../catalogo/requisitos.md), [RF074](../clientes/requisitos.md)
- Casos de uso: [UC14](../catalogo/UC14-manter-servicos.md), [UC17](../clientes/UC17-manter-cliente.md)
