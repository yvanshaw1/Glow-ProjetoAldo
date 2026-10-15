---
titulo: Requisitos funcionais – Equipe
assunto: equipe
origem: Documentação de Análise do Sistema, seção 6.2.6 (Quadro 16)
ids: [RF077, RF078, RF079, RF080, RF081, RF082, RF083, RF084]
---

# Requisitos funcionais: Equipe

Prioridade: Essencial (obrigatório no MVP), Importante (sem ele o sistema funciona mal) e Desejável (pode ser adiado). As regras citadas entre parênteses ficam em arquivos `RNxxx-*.md`.

## Gestão de funcionários e cargos

| ID | Requisito | Prioridade |
|---|---|---|
| RF077 | O sistema deve permitir alternar entre a lista de funcionários e a lista de cargos. | Importante |
| RF078 | O sistema deve permitir exibir ou ocultar funcionários e cargos inativos nas listagens. | Importante |
| RF079 | O sistema deve permitir cadastrar um funcionário por meio de formulário em duas etapas: na primeira, nome, sobrenome, e-mail, senha e, opcionalmente, a descrição do cargo; na segunda, a atribuição do cargo do sistema (RN023, RN024). | Essencial |
| RF080 | O sistema deve permitir a edição das informações dos funcionários. | Essencial |
| RF081 | O sistema deve permitir desativar funcionários (RN026). | Essencial |
| RF082 | O sistema deve permitir criar um cargo por meio de formulário em duas etapas: na primeira, nome e descrição opcional; na segunda, as permissões concedidas ao cargo, ao menos uma, entre as disponíveis para cada página do painel administrativo (RN025). | Essencial |
| RF083 | O sistema deve permitir editar e desativar cargos (RN026). | Essencial |
| RF084 | O sistema não deve exibir a conta de administrador nas listagens do painel administrativo nem permitir que ela seja editada ou desativada pelos funcionários (RN027). | Essencial |
