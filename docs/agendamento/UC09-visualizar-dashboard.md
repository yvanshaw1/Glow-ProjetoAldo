---
id: UC09
titulo: Visualizar dashboard
assunto: agendamento
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 34)
requisitos: [RF040, RF041, RF042, RF043]
regras: [RN021, RN035]
---

# UC09 – Visualizar dashboard

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo permite o acesso ao dashboard.

## Pós-condições

- Os indicadores e a agenda do dia são exibidos.

## Fluxo principal

1. O funcionário acessa a página de dashboard.
2. O sistema calcula e exibe os indicadores de receita, quantidade de agendamentos, ticket médio e taxa de cancelamento (RN021).
3. O sistema exibe a receita por dia e a distribuição dos agendamentos por status.
4. O sistema exibe a agenda do dia.

## Fluxos alternativos

### FA01 – Análise do período (passo 3)

1. O funcionário solicita a análise dos indicadores, gerada por inteligência artificial (UC27).

## Fluxos de exceção

### FE01 – Ausência de dados no período (passo 2)

1. O sistema exibe os indicadores zerados e informa que não há dados a apresentar.

### FE02 – Período inválido

1. A data inicial é posterior à final ou o intervalo passa de 12 meses; o sistema solicita outro período (RN035).

### FE03 – Falha ao carregar os dados

1. O sistema exibe mensagem de erro e permite nova tentativa.

## Relacionados

- Requisitos: [RF040](requisitos.md), [RF041](requisitos.md), [RF042](requisitos.md), [RF043](requisitos.md), [RF089](requisitos.md)
- Regras: [RN021](RN021-indicadores-do-dashboard.md), [RN035](../plataforma/RN035-formatos-dos-dados.md)
- Casos de uso: [UC27](UC27-gerar-analise-do-dashboard.md)
- Telas e API: [rotas.md](rotas.md)
