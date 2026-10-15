---
id: UC04
titulo: Atualizar dados da conta
assunto: clientes
ator: Cliente
origem: Documentação de Análise do Sistema, seção 10.2 (Quadro 29)
requisitos: [RF012, RF013, RF014]
regras: []
---

# UC04 – Atualizar dados da conta

**Ator principal:** Cliente. **Ator secundário:** Não se aplica.

## Pré-condições

- O cliente está autenticado no portal.

## Pós-condições

- Os dados da conta são atualizados.

## Fluxo principal

1. O cliente acessa a área do cliente.
2. O sistema exibe os dados da conta e os veículos cadastrados (RS009).
3. O cliente altera as informações desejadas, como o número de telefone, e confirma.
4. O sistema valida os dados informados.
5. O sistema grava as alterações e confirma a atualização.

## Fluxos alternativos

### FA01 – Alteração de senha (passo 3)

1. O cliente informa a senha atual e a nova senha.
2. O sistema confere a senha atual, valida a nova senha e grava a alteração (RS003, RS002).

## Fluxos de exceção

### FE01 – Dados inválidos (passo 4)

1. O sistema indica os campos com problema e o fluxo retorna ao passo 3.

### FE02 – Senha atual incorreta (FA01)

1. O sistema recusa a alteração e informa o cliente.

## Relacionados

- Requisitos: [RF012](requisitos.md), [RF013](requisitos.md), [RF014](requisitos.md)
- Segurança: [RS002](../plataforma/seguranca.md), [RS003](../plataforma/seguranca.md), [RS009](../plataforma/seguranca.md)
- Telas e API: [rotas.md](rotas.md)
