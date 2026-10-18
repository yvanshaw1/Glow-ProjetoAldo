---
titulo: Dados – Equipe
assunto: equipe
origem: Documentação de Arquitetura de Software, seção 5.2 (Quadros 14, 15, 16)
tabelas: [staff, roles, role_permissions]
---

# Dados: Equipe

Salvo indicação, as colunas são obrigatórias, os identificadores são `uuid` gerados pelo banco e toda tabela tem `created_at`. Convenções gerais (tipos, nomes de restrições, RLS, exclusão lógica, migrations): [../padroes/banco.md](../padroes/banco.md).

## Tabelas

### `staff`

Funcionários e administrador.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK; FK para `auth.users` | Mesmo identificador da conta no Supabase Auth. |
| `first_name` | `text` |  | Nome. |
| `last_name` | `text` |  | Sobrenome. |
| `email` | `text` | Único | E-mail de acesso, copiado para listagem e busca (RN022). |
| `role_id` | `uuid` | FK para `roles`; conforme o perfil | Cargo do sistema; vazio apenas na conta de administrador (RN024). |
| `job_title` | `text` | Opcional | Descrição do cargo ocupado na empresa. |
| `is_admin` | `boolean` | Padrão: falso | Identifica a conta de administrador, que não aparece nas listagens (RN027). |
| `is_active` | `boolean` | Padrão: verdadeiro | Situação da conta; falso impede o acesso (RN026). |
| `must_change_password` | `boolean` | Padrão: falso | Indica troca de senha pendente no primeiro acesso (RS004). |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `roles`

Cargos.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK | Identificador do cargo. |
| `name` | `text` | Único | Nome do cargo. |
| `description` | `text` | Opcional | Descrição do cargo. |
| `is_active` | `boolean` | Padrão: verdadeiro | Cargo inativo não concede permissões nem pode ser atribuído (RN026). |
| `updated_at` | `timestamptz` |  | Data da última alteração. |

### `role_permissions`

Permissões de cada cargo.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `role_id` | `uuid` | PK; FK para `roles` | Cargo. |
| `permission_key` | `permission_key` | PK | Permissão concedida ao cargo. |

## Tipos enumerados

| Tipo | Valores | Uso |
|---|---|---|
| `permission_key` | `dashboard`, `appointments`, `services`, `clients`, `staff`, `settings` | Permissões do painel, uma por página (RN025). |

## Regras garantidas pelo banco

- em `staff`, o cargo é obrigatório quando a conta não é de administrador;
- há no máximo uma conta de administrador (`uq_staff_is_admin`);
- o e-mail do funcionário é gravado em minúsculas e sem espaços (`ck_staff_email`), e o nome do cargo não se repete, sem diferenciar maiúsculas;

## Gravações em várias tabelas

Feitas por função SQL, em uma única transação, chamada pelo repositório (RNF010):

- `save_role`: cargo e permissões;

## Relacionamentos

| Relacionamento | Cardinalidade | Chave estrangeira | Exclusão física |
|---|---|---|---|
| Cargo possui funcionários | 1 para N | `role_id` em `staff` | Bloqueada; cargos são desativados. |
| Cargo possui permissões | 1 para N | `role_id` em `role_permissions` | Em cascata; as permissões são configuração do cargo. |

## Observações

- A conta de administrador é um registro de `staff` com `is_admin` verdadeiro e sem cargo, criada pelo script de dados iniciais, com o nome "Administrador" e o sobrenome "Glow"; nunca aparece nas listagens nem pode ser editada pelo painel ([RN027](RN027-administrador.md)).
- Funcionários e cargos não são excluídos, apenas desativados (`is_active`) ([RN026](RN026-desativacao.md)).
