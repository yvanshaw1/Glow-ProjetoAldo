---
id: UC01
titulo: Consultar portal público
assunto: catalogo
ator: Visitante
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 26)
requisitos: [RF001, RF002, RF003, RF004, RF005, RF006]
regras: [RN008, RN028]
---

# UC01 – Consultar portal público

**Ator principal:** Visitante. **Ator secundário:** Não se aplica.

## Pré-condições

- Não há.

## Pós-condições

- As informações institucionais e o catálogo de serviços são exibidos ao visitante.

## Fluxo principal

1. O visitante acessa o endereço do portal.
2. O sistema exibe a página inicial, com a barra de navegação, a seção de destaque, a seção institucional, a localização da empresa, os atalhos para cadastro e login e o rodapé (RN028).
3. O visitante seleciona o catálogo de serviços na barra de navegação.
4. O sistema exibe os serviços principais e complementares ativos, com nome, descrição e imagem (RN008).

## Fluxos alternativos

### FA01 – Acesso por cliente autenticado (passo 1)

1. O cliente autenticado acessa as páginas públicas da mesma forma, com a barra de navegação exibindo também as opções restritas ao cliente (Agendar, Meus agendamentos e Minha conta) e a opção de sair.

## Fluxos de exceção

### FE01 – Nenhum serviço ativo (passo 4)

1. O sistema informa que não há serviços disponíveis no momento.

### FE02 – Falha ao carregar os dados (passos 2 ou 4)

1. O sistema exibe mensagem de erro e permite nova tentativa.

## Relacionados

- Requisitos: [RF001](requisitos.md), [RF002](requisitos.md), [RF003](requisitos.md), [RF004](requisitos.md), [RF005](requisitos.md), [RF006](requisitos.md)
- Regras: [RN008](RN008-servico-inativo.md), [RN028](../configuracoes/RN028-dados-institucionais.md)
- Telas e API: [rotas.md](rotas.md)
