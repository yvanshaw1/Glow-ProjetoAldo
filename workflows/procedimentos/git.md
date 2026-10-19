# Procedimento: Git

## Ramificação

- Uma ramificação por tarefa, de um único desenvolvedor e ligada a uma única issue.
- Nome: `<tipo>/<issue>-<nome-curto-em-ingles>`, como `feat/42-edit-appointment`.
- Tipos: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`.
- Vida curta: a tarefa cabe em um ou dois dias de trabalho; funcionalidade grande vira vários pull requests pequenos. Parte incorporada e ainda incompleta fica fora da navegação.

```
git switch main && git pull
git switch -c feat/42-edit-appointment
```

## Commits

- Conventional Commits, em inglês: `tipo(escopo): descrição no imperativo`, título com até 72 caracteres; corpo opcional com a lista do que mudou.
- Um commit é uma mudança lógica, com os testes passando; refatoração nunca vai junto com mudança de comportamento.

```
feat(appointments): allow clients to postpone scheduled appointments

- PATCH /api/me/appointments/:id accepts a later date and time (RN032)
- postponeAppointment in src/server/services/appointments.ts
- tests in tests/rules/appointment-edit.test.ts
```

## Atualização com a main

Ao menos uma vez por dia e sempre antes de abrir o pull request:

```
git fetch origin
git merge origin/main
npm run check
```

A equipe não usa rebase nem envio forçado: o squash na incorporação já deixa a `main` linear (decisão 0033). Commit já enviado nunca é alterado com `--amend`.

## Conflitos

1. Entender as duas alterações antes de escolher; nunca aceitar só a própria versão.
2. Editar os marcadores à mão, rodar `npm run check` e só então concluir o merge.
3. Se a resolução não for óbvia, falar com o autor da outra alteração.
4. O agente resolve só conflitos mecânicos, como importações e formatação; regra de negócio ou código de outra tarefa: parar e perguntar.

Prevenção: ramificações curtas e atualizadas, commits pequenos e, na aprovação do plano, conferência no quadro de tarefas de quem mais está alterando os mesmos arquivos.
