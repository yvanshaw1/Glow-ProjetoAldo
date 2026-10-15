---
titulo: Requisitos funcionais – Acesso
assunto: acesso
origem: Documentação de Análise do Sistema, seções 6.1.2, 6.2.1 (Quadros 7, 11)
ids: [RF007, RF008, RF009, RF010, RF011, RF033, RF034, RF035, RF036, RF037, RF038, RF039]
---

# Requisitos funcionais: Acesso

Prioridade: Essencial (obrigatório no MVP), Importante (sem ele o sistema funciona mal) e Desejável (pode ser adiado). As regras citadas entre parênteses ficam em arquivos `RNxxx-*.md`.

## Cadastro e autenticação de clientes

| ID | Requisito | Prioridade |
|---|---|---|
| RF007 | O sistema deve permitir que o visitante crie uma conta de cliente informando nome, sobrenome, e-mail, telefone e senha. | Essencial |
| RF008 | O sistema deve permitir que o cliente se autentique no portal com e-mail e senha. | Essencial |
| RF009 | O sistema deve permitir que o cliente autenticado encerre sua sessão. | Essencial |
| RF010 | O sistema deve restringir a área do cliente e as páginas de agendamentos e de agendar serviço a clientes autenticados, direcionando o visitante para a página de login (RN001). | Essencial |
| RF011 | O sistema deve exigir que o cliente cuja conta foi criada por um funcionário defina uma nova senha no primeiro acesso ao portal, antes de liberar as páginas restritas (RN023, RS004). | Essencial |

## Autenticação e controle de acesso ao painel

| ID | Requisito | Prioridade |
|---|---|---|
| RF033 | O sistema deve permitir que o funcionário se autentique com e-mail e senha, pela mesma página de login utilizada pelos clientes, e direcioná-lo ao painel administrativo (RN029). | Essencial |
| RF034 | O sistema deve permitir que o funcionário autenticado encerre sua sessão. | Essencial |
| RF035 | O sistema deve liberar as páginas e as ações do painel administrativo de acordo com as permissões do cargo atribuído ao funcionário (RN024). | Essencial |
| RF036 | O sistema deve exibir na barra de navegação do painel apenas os links das páginas permitidas pelo cargo do funcionário (RN025). | Importante |
| RF037 | O sistema deve impedir o acesso de funcionários desativados (RN026). | Essencial |
| RF038 | O sistema deve exigir que o funcionário defina uma nova senha no primeiro acesso ao painel administrativo, antes de liberar as demais páginas (RN023, RS004). | Essencial |
| RF039 | O sistema deve conceder ao administrador acesso a todas as páginas e ações do painel administrativo, independentemente de cargo (RN027). | Essencial |
