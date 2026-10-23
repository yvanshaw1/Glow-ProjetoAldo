---
issue: 78
pull_request: 79
---

# Relatório: Foco perdido na janela de reagendamento de /appointments

## O que foi feito

- **Reagendamento (UC25, RF032, RN020, RNF005).** A janela "Reagendar serviço" deixa as escolhas habilitadas enquanto a prévia carrega; só "Confirmar reagendamento" espera a resposta, indisponível com `aria-disabled` e sem perder o foco. O foco entra em "Cancelar" ao abrir, fica no horário e na forma de pagamento escolhidos antes e depois da resposta da prévia e, quando nenhum serviço principal ou complementar está disponível (RN005, UC25 FE02), vai para o "Cancelar" que fica.
- **Formulário desativado só no conflito.** O `<fieldset>` do assistente só é desativado na releitura depois de `VERSION_CONFLICT` (edição). O "Cancelar" provisório aparece só nesse caso, no aviso de nenhum serviço disponível e no de agendamento que não pode mais ser alterado.
- **Componentes compartilhados.** `StepForm` e `SubmitButton` ganharam uma propriedade opcional (`isSubmitDisabled` e `isDisabled`) que deixa o botão de envio indisponível sem tirar o foco; sem ela, nada muda nos oito formulários que usam o `SubmitButton`.
- **Defeito de tela e teste.** O roteiro manual do plano passou a ser o teste do defeito de tela (L1).

## Arquivos alterados

- `src/components/portal/appointments/booking-wizard.tsx` — `isBlocked` dividido em `needsReload` (trava do `<fieldset>`) e `isAwaitingPreview` (só o envio); guarda de `submit()` nos dois; "Cancelar" provisório só em `needsReload`, `isUnavailable` e `isInvalidStatus`; foco nele quando surge `isUnavailable`.
- `src/components/shared/step-form.tsx` — propriedade opcional `isSubmitDisabled`, repassada ao botão de envio.
- `src/components/shared/submit-button.tsx` — propriedade opcional `isDisabled`.
- `docs/padroes/componentes.md` — item da leitura que acompanha o formulário (L2).
- `docs/agendamento/agendar-servico.md` — o envio do reagendamento espera a prévia (L2).
- `docs/padroes/testes.md`, `workflows/procedimentos/testes.md` e `guia/CONTEXT.md` — o defeito de tela (L1).
- `memoria/tarefas/59-agendar-e-editar/01_plano.md` — `status: concluido` (P1).
- `memoria/tarefas/78-foco-no-reagendamento/` — plano, notas e este relatório.

`appointment-change-dialog.tsx` foi conferido e não mudou: o `initialFocus` passa a achar um "Cancelar" ativo.

## Testes executados

- `npm run check`: formatação, tipos, lint (`--max-warnings=0`) e 411 testes em 22 arquivos, sem erros nem avisos. Nenhum teste automatizado novo: a correção não cria função pura (decisão 0052; L1).
- Roteiro manual do plano, antes e depois da correção, em `next build` e `next start` com o Supabase local e o Chrome sem interface (360 × 800 claro; 1440 × 900 escuro). **Antes:** o foco continuava em "Reagendar" ao abrir e ia ao `body` em cada horário e forma de pagamento. **Depois:** "Cancelar" ao abrir; o foco fica na opção escolhida, antes e depois da prévia; Esc devolve o foco a "Reagendar". Passos 1 a 4 e 7, também no segundo "Concluído"; sem rolagem horizontal.
- **Respostas temporárias** (sem commit, desfeitas): prévia atrasada, com falha, sem serviço disponível e com retirada parcial; `VERSION_CONFLICT` na edição, com a releitura funcionando e falhando. Passo 5: o envio não sai antes da resposta, nem por clique nem por Enter, e sai depois dela, com o aviso de `NOT_IMPLEMENTED` e o foco nele. Passo 6: o foco vai a "Cancelar" (antes ficava em "Reagendar").
- **Regressões:** "Editar" começa em "Cancelar" e mantém o foco nas escolhas; o conflito da edição, com a releitura falhando e a nova tentativa, tem o mesmo resultado do código original; `/booking` mantém o foco no horário e na forma de pagamento; o botão de `/login` mostra "Entrando…" com o foco e `aria-disabled`.
- **Lighthouse** `snapshot` de acessibilidade com a janela aberta depois das interações: nota 1 e nenhuma auditoria reprovada em celular e computador, nos temas claro e escuro.
- Pré-visualização da Vercel: pelo desenvolvedor, depois da abertura do PR.

## Documentação atualizada

- Módulos: `docs/padroes/componentes.md`, `docs/agendamento/agendar-servico.md`, `docs/padroes/testes.md`, `workflows/procedimentos/testes.md` e `guia/CONTEXT.md`.
- Lacunas resolvidas: L1 (defeito de tela) → o roteiro manual do plano é o teste → `testes.md`, `procedimentos/testes.md` e `guia/CONTEXT.md`; L2 (leitura que acompanha o formulário) → campos habilitados e só o envio espera → `componentes.md` e `agendar-servico.md`.
- Decisões: nenhuma.
- Documentos formais a atualizar: nenhum (os `.docx` não foram abertos).

## Pendências

- O foco, depois da nova tentativa de uma releitura que falhou no conflito da edição, vai ao painel da janela e não ao primeiro campo. É igual no código original e fora do escopo desta issue; vira issue `tipo:defeito` se o Yvan quiser tratar.
