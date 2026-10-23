# Roteamento

Toda tarefa começa aqui. Identifique o tipo, leia só o que a linha indica e siga o fluxo com os contratos de `workflows/`. Ao retomar uma tarefa, leia primeiro a pasta dela em `memoria/tarefas/`.

| Tipo de tarefa | O que ler | Fluxo |
|---|---|---|
| Consulta | `guia/mapa.md` e o módulo indicado em `docs/CONTEXT.md` | Responde sem alterar arquivos e sem abrir pasta de tarefa |
| Tarefa trivial | `workflows/procedimentos/tarefa-trivial.md` (critérios), o arquivo afetado e os padrões das áreas que ele toca | Plano resumido, aprovado na conversa; depois ramificação e pull request |
| Funcionalidade | `docs/<assunto>/CONTEXT.md` → caso de uso, regras citadas, `dados.md`, `rotas.md`; padrões das áreas que a tarefa toca; decisões citadas | Ciclo completo, `01` a `04` |
| Correção de defeito | A issue, o módulo do requisito afetado e os testes existentes | Ciclo completo; o plano começa por um teste que reproduz o defeito (no defeito de tela, pelo roteiro manual que o reproduz) |
| Investigação (spike) | A issue com a pergunta e os módulos do assunto | Protótipo descartável, não incorporado; a conclusão vira registro em `docs/decisoes/` |
| Alteração do banco | `dados.md` do assunto, `docs/padroes/banco.md`, `workflows/procedimentos/migration.md` | Ciclo completo, com o procedimento de migration |
| Documentação | O módulo afetado e `docs/CONTEXT.md` | Ciclo completo, com plano simplificado |
| CI/CD e configuração | `workflows/procedimentos/` e `docs/plataforma/infraestrutura.md` | Ciclo completo |

Padrões das áreas: `docs/padroes/codigo.md` sempre, mais `frontend.md`, `backend.md` e `api.md`, `banco.md` e `testes.md`, conforme as áreas que a tarefa toca. A tarefa que chama a IA do produto lê também `docs/plataforma/servico-de-ia.md`.

Na dúvida entre trivial e ciclo completo, é ciclo completo. Uma tarefa só é tratada como trivial depois de conferidos os critérios do procedimento e aprovada na conversa.
