---
titulo: Requisitos funcionais – Clientes e veículos
assunto: clientes
origem: Documentação de Análise do Sistema, seções 6.1.3, 6.2.5 (Quadros 8, 15)
ids: [RF012, RF013, RF014, RF015, RF016, RF017, RF018, RF069, RF070, RF071, RF072, RF073, RF074, RF075, RF076]
---

# Requisitos funcionais: Clientes e veículos

Prioridade: Essencial (obrigatório no MVP), Importante (sem ele o sistema funciona mal) e Desejável (pode ser adiado). As regras citadas entre parênteses ficam em arquivos `RNxxx-*.md`.

## Área do cliente

| ID | Requisito | Prioridade |
|---|---|---|
| RF012 | O sistema deve disponibilizar ao cliente uma área para consulta dos dados da sua conta. | Essencial |
| RF013 | O sistema deve permitir que o cliente edite as informações da conta, como o número de telefone. | Essencial |
| RF014 | O sistema deve permitir que o cliente altere sua senha. | Essencial |
| RF015 | O sistema deve permitir que o cliente cadastre veículos em sua conta informando primeiro a placa: se a placa já estiver cadastrada no sistema, os demais dados do veículo são preenchidos automaticamente; caso contrário, o cliente informa o tipo (hatch, sedan, SUV ou picape), a marca, o modelo, a cor e o ano (RN036). | Essencial |
| RF016 | O sistema deve definir automaticamente o porte do veículo (P, M, G ou GG) a partir do tipo informado no cadastro (RN002). | Essencial |
| RF017 | O sistema deve listar os veículos cadastrados na conta do cliente. | Essencial |
| RF018 | O sistema deve permitir que o cliente edite os dados dos seus veículos, exceto dos vinculados também a outra conta; quando o tipo é alterado, o porte é redefinido (RN002, RN036). | Importante |

## Gestão de clientes e veículos

| ID | Requisito | Prioridade |
|---|---|---|
| RF069 | O sistema deve listar os clientes cadastrados. | Essencial |
| RF070 | O sistema deve permitir buscar clientes por nome, e-mail e demais dados cadastrais. | Importante |
| RF071 | O sistema deve permitir que o funcionário cadastre um cliente informando e-mail, nome, sobrenome, telefone e senha (RN023). | Essencial |
| RF072 | O sistema deve permitir a consulta dos detalhes da conta de um cliente, incluindo seus veículos. | Essencial |
| RF073 | O sistema deve permitir que o funcionário edite as informações da conta de um cliente. | Essencial |
| RF074 | O sistema deve permitir que o funcionário exclua a conta de um cliente (RN030). | Importante |
| RF075 | O sistema deve permitir que o funcionário cadastre veículos na conta do cliente informando primeiro a placa, com o preenchimento automático dos demais dados quando a placa já estiver cadastrada e, caso contrário, a seleção do tipo e a informação de marca, modelo, cor e ano (RN002, RN036). | Essencial |
| RF076 | O sistema deve permitir que o funcionário edite os veículos cadastrados na conta do cliente, inclusive os vinculados a mais de uma conta; quando o tipo é alterado, o porte é redefinido (RN002, RN036). | Importante |
