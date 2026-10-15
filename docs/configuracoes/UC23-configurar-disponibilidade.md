---
id: UC23
titulo: Configurar disponibilidade
assunto: configuracoes
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 48)
requisitos: [RF085, RF087]
regras: [RN013]
---

# UC23 – Configurar disponibilidade

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo permite o acesso às configurações.

## Pós-condições

- A disponibilidade é atualizada e passa a ser considerada na oferta de horários para novos agendamentos (RN013).

## Fluxo principal

1. O funcionário acessa a página de configurações e seleciona a opção de disponibilidade.
2. O sistema exibe os dias da semana e os horários de funcionamento configurados.
3. O funcionário seleciona os dias de funcionamento e define, para cada dia, os horários de abertura e de encerramento e, se houver, a pausa, como o horário de almoço.
4. O funcionário confirma.
5. O sistema valida e grava a disponibilidade.

## Fluxos alternativos

Não há.

## Fluxos de exceção

### FE01 – Horário inconsistente (passo 5)

1. O horário de encerramento é anterior ou igual ao de abertura; o sistema indica o problema e o fluxo retorna ao passo 3.

### FE02 – Pausa inconsistente (passo 5)

1. A pausa não está contida entre a abertura e o encerramento, ou o seu término não é posterior ao seu início; o sistema indica o problema e o fluxo retorna ao passo 3.

## Relacionados

- Requisitos: [RF085](requisitos.md), [RF087](requisitos.md)
- Regras: [RN013](../agendamento/RN013-disponibilidade.md)
- Telas e API: [rotas.md](rotas.md)
