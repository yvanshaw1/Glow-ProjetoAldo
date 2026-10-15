# tools/ – Scripts mecânicos

Trabalho que não exige IA fica em scripts locais, executados por pessoas ou pelo agente. Os scripts abaixo serão criados nas primeiras tarefas de código; até lá, os passos são feitos à mão.

| Script | Faz | Enquanto não existe |
|---|---|---|
| `new-task.mjs <issue> <nome>` | cria `memoria/tarefas/<issue>-<nome>/` com `01_plano.md` e `notas.md` a partir dos moldes | copiar `_templates/plano.md` e `_templates/notas.md` |
| `task-status.mjs` | lista as tarefas e o status de cada plano | ler o cabeçalho de cada `01_plano.md` |
| `check-docs.mjs` | confere os cabeçalhos YAML de `docs/`, se todo RF, RNF, RS, RN e UC citado existe e, em `docs/decisoes/`, se os números são únicos e sequenciais, se todo registro está no índice e se toda substituição aponta para uma decisão existente | conferência na revisão do PR |

Regras: Node.js 24 sem dependências extras, sem acesso a rede ou a banco, saída curta e código de saída diferente de zero quando algo falha (para poder entrar no CI).
