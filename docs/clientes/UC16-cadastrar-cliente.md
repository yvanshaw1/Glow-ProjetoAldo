---
id: UC16
titulo: Cadastrar cliente
assunto: clientes
ator: Funcionário
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 41)
requisitos: [RF071]
regras: [RN022, RN023]
---

# UC16 – Cadastrar cliente

**Ator principal:** Funcionário. **Ator secundário:** Não se aplica.

## Pré-condições

- O funcionário está autenticado no painel administrativo e seu cargo possui a permissão de gerenciar clientes.

## Pós-condições

- O cliente é cadastrado, passa a constar na listagem de clientes e pode autenticar-se no portal com o e-mail e a senha inicial informados, devendo trocá-la no primeiro acesso (RN023).

## Fluxo principal

1. Na página de gerenciamento de clientes, o funcionário seleciona a opção de criar cliente.
2. O sistema exibe o formulário de cadastro.
3. O funcionário informa e-mail, nome, sobrenome, telefone e senha e confirma (RN023).
4. O sistema valida os dados informados (RN022, RS003).
5. O sistema grava o cadastro e exibe o cliente na listagem (RS002).

## Fluxos alternativos

Não há.

## Fluxos de exceção

### FE01 – Dados inválidos ou incompletos (passo 4)

1. O sistema indica os campos com problema e o fluxo retorna ao passo 3.

### FE02 – E-mail já cadastrado (passo 4)

1. O sistema informa que já existe um cliente com o e-mail informado.

## Relacionados

- Requisitos: [RF071](requisitos.md)
- Regras: [RN022](../acesso/RN022-e-mail-unico.md), [RN023](../acesso/RN023-senha-inicial.md)
- Segurança: [RS002](../plataforma/seguranca.md), [RS003](../plataforma/seguranca.md)
- Telas e API: [rotas.md](rotas.md)
