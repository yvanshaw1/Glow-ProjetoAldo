---
id: UC27
titulo: Gerar análise do dashboard
assunto: agendamento
ator: Funcionário
origem: issue #66, plano memoria/tarefas/66-analise-por-ia/01_plano.md
requisitos: [RF089, RF090]
regras: [RN038, RN039, RN035]
---

# UC27 – Gerar análise do dashboard

**Ator principal:** Funcionário. **Ator secundário:** Serviço de inteligência artificial.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo permite o acesso ao dashboard.
- O dashboard exibe os indicadores de um período (UC09).

## Pós-condições

- A análise do período é exibida, identificada como gerada por inteligência artificial; nada é gravado.

## Fluxo principal

1. O funcionário solicita a análise do período exibido.
2. O sistema reúne os valores agregados do período e do período anterior (RN038).
3. O sistema envia os valores ao serviço de inteligência artificial e indica que a análise está em andamento.
4. O serviço de inteligência artificial devolve o texto da análise.
5. O sistema confere a resposta (RN039) e exibe a análise junto aos indicadores, identificada como gerada por inteligência artificial, com a data e o horário da geração.

## Fluxos alternativos

### FA01 – Nova análise (passo 5)

1. O funcionário solicita outra análise; o sistema a gera e substitui a exibida.

### FA02 – Troca do período (passo 5)

1. O funcionário escolhe outro período no dashboard; a análise exibida deixa de aparecer.

### FA03 – Período anterior sem agendamentos (passo 2)

1. O sistema gera a análise sem a comparação e informa que o período anterior não tem dados.

## Fluxos de exceção

### FE01 – Período sem agendamentos (passo 1)

1. A solicitação fica indisponível, e o sistema informa que não há dados suficientes para a análise.

### FE02 – Falha do serviço de inteligência artificial (passos 3 a 5)

1. Sem resposta no tempo limite (RNF018), com o limite de uso atingido, indisponível ou com resposta fora do formato (RN039), o sistema informa que a análise não pôde ser gerada e permite nova tentativa; os indicadores continuam exibidos (RNF017).

### FE03 – Período inválido

1. Como no UC09 FE02: a data inicial é posterior à final ou o intervalo passa de 12 meses; o sistema solicita outro período (RN035).

## Relacionados

- Requisitos: [RF089](requisitos.md), [RF090](requisitos.md)
- Regras: [RN038](RN038-dados-da-analise-do-dashboard.md), [RN039](RN039-conteudo-da-analise-do-dashboard.md), [RN035](../plataforma/RN035-formatos-dos-dados.md)
- Não funcionais e segurança: [RNF017 e RNF018](../plataforma/requisitos.md), [RS019 e RS020](../plataforma/seguranca.md)
- Casos de uso: [UC09](UC09-visualizar-dashboard.md)
- Telas e API: [rotas.md](rotas.md)
- Serviço de IA: [../plataforma/servico-de-ia.md](../plataforma/servico-de-ia.md)
