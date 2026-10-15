---
id: UC22
titulo: Configurar dados da empresa
assunto: configuracoes
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 47)
requisitos: [RF004, RF085, RF086]
regras: [RN028]
---

# UC22 – Configurar dados da empresa

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo permite o acesso às configurações.

## Pós-condições

- Os dados da empresa são atualizados.
- A página inicial e o rodapé do portal passam a exibir as informações atualizadas (RN028).

## Fluxo principal

1. O funcionário acessa a página de configurações.
2. O sistema exibe as opções de configurações da empresa, de disponibilidade e de formas de pagamento.
3. O funcionário seleciona as configurações da empresa.
4. O sistema exibe nome da empresa, CNPJ, e-mail, telefone, redes sociais e endereço.
5. O funcionário altera os dados e confirma.
6. O sistema valida e grava as alterações.

## Fluxos alternativos

Não há.

## Fluxos de exceção

### FE01 – Dados inválidos (passo 6)

1. O sistema indica os campos com problema, como CNPJ ou e-mail em formato inválido, e o fluxo retorna ao passo 5.

## Relacionados

- Requisitos: [RF004](../catalogo/requisitos.md), [RF085](requisitos.md), [RF086](requisitos.md)
- Regras: [RN028](RN028-dados-institucionais.md)
- Telas e API: [rotas.md](rotas.md)
