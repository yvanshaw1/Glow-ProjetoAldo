---
id: UC20
titulo: Manter funcionários
assunto: equipe
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 45)
requisitos: [RF077, RF078, RF080, RF081, RF084]
regras: [RN026, RN027]
---

# UC20 – Manter funcionários

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar funcionários.

## Pós-condições

- As alterações são gravadas.
- O funcionário desativado deixa de ter acesso ao painel administrativo.

## Fluxo principal

1. O funcionário acessa a página de gerenciamento de funcionários e cargos.
2. O sistema exibe a lista de funcionários ativos, sem incluir a conta de administrador (RN027).
3. O funcionário seleciona um registro e a opção de editar.
4. O sistema exibe as informações do funcionário selecionado.
5. O funcionário altera as informações e confirma.
6. O sistema valida e grava as alterações.

## Fluxos alternativos

### FA01 – Exibição de inativos (passo 2)

1. O funcionário ativa a opção de exibir inativos e o sistema inclui os funcionários inativos na listagem.

### FA02 – Desativação de funcionário (passo 3)

1. O funcionário seleciona a opção de desativar.
2. O sistema solicita a confirmação e, uma vez confirmada, desativa o registro (RN026, RS011).

## Fluxos de exceção

### FE01 – Dados inválidos (passo 6)

1. O sistema indica os campos com problema e o fluxo retorna ao passo 5.

## Relacionados

- Requisitos: [RF077](requisitos.md), [RF078](requisitos.md), [RF080](requisitos.md), [RF081](requisitos.md), [RF084](requisitos.md)
- Regras: [RN026](RN026-desativacao.md), [RN027](RN027-administrador.md)
- Segurança: [RS011](../plataforma/seguranca.md)
- Telas e API: [rotas.md](rotas.md)
