---
id: UC24
titulo: Configurar formas de pagamento
assunto: configuracoes
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 49)
requisitos: [RF085, RF088]
regras: [RN010, RN012]
---

# UC24 – Configurar formas de pagamento

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo permite o acesso às configurações.

## Pós-condições

- Os percentuais são atualizados e passam a ser aplicados no cálculo do valor dos novos agendamentos (RN010).

## Fluxo principal

1. O funcionário acessa a página de configurações e seleciona a opção de formas de pagamento.
2. O sistema exibe as formas de pagamento (crédito, débito, Pix e dinheiro) com os percentuais configurados.
3. O funcionário define, para cada forma de pagamento, o percentual e se ele representa acréscimo ou desconto (RN012).
4. O funcionário confirma.
5. O sistema valida e grava os percentuais.

## Fluxos alternativos

### FA01 – Forma de pagamento sem ajuste (passo 3)

1. O funcionário mantém o percentual zerado, e o valor do agendamento não sofre acréscimo nem desconto para essa forma de pagamento.

## Fluxos de exceção

### FE01 – Percentual inválido (passo 5)

1. O valor informado não é numérico, é negativo ou representa desconto superior a 100%; o sistema indica o problema e o fluxo retorna ao passo 3.

## Relacionados

- Requisitos: [RF085](requisitos.md), [RF088](requisitos.md)
- Regras: [RN010](../agendamento/RN010-valor-total.md), [RN012](RN012-percentual-da-forma-de-pagamento.md)
- Telas e API: [rotas.md](rotas.md)
