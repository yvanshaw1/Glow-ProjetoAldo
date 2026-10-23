---
issue: 78
titulo: "Foco perdido na janela de reagendamento de /appointments"
areas: [frontend]
tipo: defeito
requisitos: [UC25, RF032, RN005, RN020, RNF005]
status: concluido
aprovado_por: yvan
aprovado_em: 17:52 - 23/10/2026
---

# Plano: Foco perdido na janela de reagendamento de /appointments

## Objetivo

Corrigir o foco da janela "Reagendar serviço" de `/appointments` (UC25, RF032, RN020), achado na revisão do PR #77 (#59) e já em produção: o foco não entra na janela ao abrir e vai para o `body` a cada escolha que lê a prévia de novo (horário e forma de pagamento). O esperado é o de `docs/padroes/componentes.md` (Diálogos) e de RNF005: o foco começa em "Cancelar", fica na janela e continua na opção escolhida, como já acontece na janela "Editar agendamento" (UC26).

A correção deixa as escolhas habilitadas enquanto a prévia carrega e faz só a confirmação esperar a resposta. Uma ramificação, um pull request.

## Reprodução do defeito

Como o defeito é de tela (decisão 0052), a reprodução é um roteiro manual, executado **antes** da correção, para ver o defeito, e **de novo depois**, para ver que sumiu. O roteiro fica no scratchpad da sessão (não vai ao repositório); o resultado das duas passagens vai para `notas.md` e para o relatório.

**Ambiente** (o mesmo da #59 e do corpo da #78): `next build` e `next start` com o Supabase local (Docker Desktop aberto, `npx supabase start`), a conta de teste de cliente do banco local (a senha de teste não vai a nenhum documento), Chrome sem interface pelo `puppeteer-core` do cache do Lighthouse 13.5.0, a 360 × 800, tema claro (na passagem final, também 1440 × 900 e tema escuro). O painel do navegador do app não serve: oculto, ele trava o foco do Base UI.

**Leitura do foco.** Depois de cada ação, ler `document.activeElement` a 50, 150, 400 e 900 ms: a tag, o nome acessível, se está dentro da janela (`closest('[data-slot="dialog-content"]')`) e `matches(":disabled")`. O Base UI passa por elementos-guarda antes de assentar o foco, então a primeira leitura sozinha engana.

**Roteiro** (a coluna "hoje" é o que a #78 registrou; o esperado é o da correção):

1. **Abrir.** Login por `fetch("/api/auth/login")` na página; `/appointments`, aba "Histórico", "Ver detalhes" de um "Concluído" (o Fiat Toro, R$ 105,00, ou o Toyota SW4, R$ 190,00), "Reagendar". Hoje: o foco continua em "Reagendar", fora da janela, aos 900 ms. Esperado: "Cancelar" da janela, nas quatro leituras.
2. **Causa.** Na mesma abertura, ler `button.disabled` e `button.matches(":disabled")` dos "Cancelar" da janela durante a carga da prévia (com a resposta da prévia atrasada por alteração temporária de `src/lib/demo/appointments.ts`, como na #59). Confirma ou corrige a hipótese da seção "Causa".
3. **Horário.** Tab até um dia do calendário, Espaço, Tab até o grupo "Horário", setas e Espaço num horário. Hoje: `body`, e `body` 900 ms depois. Esperado: o horário escolhido, antes e depois da resposta da prévia.
4. **Pagamento.** "Próximo" (o foco vai a "Etapa 2 de 2: Pagamento e resumo"), setas e Espaço numa forma de pagamento. Hoje: `body`. Esperado: a forma escolhida.
5. **Confirmação.** Com a prévia atrasada ou com falha (alteração temporária), chegar a "Confirmar reagendamento": não envia, nem por clique, nem por Enter num campo; com a resposta, envia e mostra o aviso de `NOT_IMPLEMENTED`. Esperado igual antes e depois da correção.
6. **Sem serviço disponível.** Prévia temporária sem nenhum principal ou complementar (RN005, UC25 FE02): o aviso, "Agendar outro serviço" e "Cancelar", com o foco em "Cancelar" e não no `body`.
7. **Fechar.** Esc e "Cancelar" fecham só a janela e devolvem o foco a "Reagendar" do detalhe.
8. **Regressão.** "Editar" de um "Agendado" começa em "Cancelar" e mantém o foco nas escolhas; o `VERSION_CONFLICT` temporário mantém o aviso no topo, com o foco, e a releitura (também a que falha, com "Tentar novamente"); `/booking` mantém o foco nas escolhas; o botão de envio de outro formulário (`/login`, por exemplo) continua mostrando o carregamento e mantendo o foco.
9. **Telas.** 360 × 800 e 1440 × 900, claro e escuro, sem rolagem horizontal (`scrollWidth` igual a `innerWidth`), e `npx -y lighthouse@13.5.0` (`snapshot`) de acessibilidade com a janela aberta depois das interações, nos modos celular e computador, sem auditoria reprovada.

## Causa

O que se lê no código (`booking-wizard.tsx`):

- `isBlocked = needsReload || (mode === "reschedule" && !isPreviewReady)`, e `isPreviewReady` é falso enquanto o `useApiQuery` espera a resposta da requisição atual. No reagendamento, o corpo da prévia muda a cada horário e a cada forma de pagamento, então cada escolha reabre a espera.
- `isBlocked` desativa o `<fieldset>` com o formulário inteiro. O elemento que tem o foco (o botão de opção recém-escolhido) passa a estar desativado, e o Chrome tira o foco dele: vai para o `body`. Na edição, `isBlocked` só vale no conflito de versão, por isso ela não tem o problema.
- Ao abrir, a espera da primeira prévia também desativa o formulário, e o foco inicial não chega a "Cancelar".

**Hipótese a confirmar no passo 2.** A issue atribui a falha de abertura a um segundo "Cancelar", fora do formulário e só durante a carga, que seria o escolhido pelo `initialFocus` de `appointment-change-dialog.tsx` e sumiria em seguida. Mas `HTMLButtonElement.disabled` reflete só o atributo do botão, não o `<fieldset>` que o contém: o "Cancelar" do `StepForm`, dentro do `<fieldset disabled>`, passa em `!button.disabled`, vem antes do provisório na ordem do DOM e é o que o `initialFocus` devolve; como está desativado de fato, o `focus()` não faz nada, e o foco fica no botão que abriu a janela. Isso bate melhor com a evidência da #78 (o foco continua em "Reagendar", e não no `body`). As duas hipóteses têm a mesma raiz, o formulário desativado durante a leitura da prévia, e a mesma correção.

## Correção proposta

A recomendada (opção A) e as descartadas:

- **A. Só a confirmação espera a prévia (recomendada).** O formulário só fica desativado no conflito de versão da edição (`needsReload`), como hoje. No reagendamento, a espera da prévia desativa apenas "Confirmar reagendamento", que continua focável (`aria-disabled`, como o `SubmitButton` já faz no carregamento) e não envia enquanto a prévia não responde. As escolhas ficam habilitadas e o foco não sai delas. O "Cancelar" provisório fica só para `needsReload`, `isUnavailable` e `isInvalidStatus`, quando o `StepForm` está desativado ou fora da tela.
- **B. Desativar o formulário só na primeira prévia.** Resolve o foco a cada escolha, mas não o da abertura, e mantém um botão provisório que some. Descartada.
- **C. Trocar o `<fieldset disabled>` por `inert` ou por uma sobreposição.** Muda a semântica para o leitor de tela e continua tirando o foco do elemento escolhido. Descartada.

Pontos da opção A:

1. `booking-wizard.tsx`: separar `isBlocked` em `needsReload` (trava do `<fieldset>`) e `isAwaitingPreview = mode === "reschedule" && !isPreviewReady` (só o envio). A guarda de `submit()` passa a cobrir os dois; o `StepForm` recebe `isSubmitDisabled={isAwaitingPreview}`.
2. `step-form.tsx` e `submit-button.tsx`: uma propriedade opcional (`isSubmitDisabled` no primeiro, `isDisabled` no segundo) que desativa o botão sem tirar o foco e sem mudar o rótulo. Sem a propriedade, nada muda nos oito formulários que usam o `SubmitButton`; o `StepForm` só é usado pelo assistente de agendamento.
3. Quando `isUnavailable` surge, o `StepForm` (onde o foco começa, depois da correção) sai da tela; o foco vai para o "Cancelar" que fica (ref e efeito em `booking-wizard.tsx`). Hoje o foco nunca chegava lá, então isso é consequência da correção, não um defeito novo.
4. `appointment-change-dialog.tsx`: sem alteração prevista. O `initialFocus` passa a achar um "Cancelar" ativo. Se o passo 2 mostrar o contrário, ele é ajustado para testar `matches(":disabled")`.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dada a janela "Reagendar serviço" fechada, quando a abro, então o foco entra e fica em "Cancelar", mesmo com a prévia lenta (RNF005; componentes.md, Diálogos; UC25) | Roteiro, passos 1 e 2 |
| Dada a janela aberta, quando escolho um horário ou uma forma de pagamento pelo teclado, então o foco continua na opção escolhida, antes e depois da resposta da prévia (RNF005) | Roteiro, passos 3 e 4 |
| Dada a prévia sem resposta ou com falha, quando tento confirmar, então nada é enviado, e com a resposta o envio funciona como hoje, com o aviso de `NOT_IMPLEMENTED` (RN020) | Roteiro, passo 5 |
| Dada a prévia sem nenhum serviço principal ou complementar disponível, quando ela responde, então aparecem o aviso, "Agendar outro serviço" e "Cancelar", com o foco em "Cancelar" (RN005, UC25 FE02) | Roteiro, passo 6 |
| Dada a janela aberta, quando uso Esc ou "Cancelar", então fecha só ela e o foco volta a "Reagendar" do detalhe (RNF005) | Roteiro, passo 7 |
| Dadas a edição, o conflito de versão, `/booking` e os outros formulários, quando uso o teclado, então nada muda (RNF005, RNF011) | Roteiro, passo 8 |
| Dados os dois tamanhos e os dois temas, quando abro a janela, então não há rolagem horizontal nem auditoria de acessibilidade reprovada | Roteiro, passo 9 |
| Dada a alteração, quando rodo `npm run check`, então formatação, tipos, lint e testes passam | `npm run check` |

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/portal/appointments/booking-wizard.tsx` | alterar: `isBlocked` dividido, `isSubmitDisabled`, "Cancelar" provisório só nos três casos, foco em "Cancelar" ao surgir `isUnavailable` |
| `src/components/shared/step-form.tsx` | alterar: propriedade opcional `isSubmitDisabled` |
| `src/components/shared/submit-button.tsx` | alterar: propriedade opcional `isDisabled` |
| `src/components/portal/appointments/appointment-change-dialog.tsx` | conferir; só altera se o passo 2 mostrar que o `initialFocus` precisa de `matches(":disabled")` |
| `docs/padroes/componentes.md` | alterar, se a L2 for aprovada: regra da leitura que acompanha o formulário |
| `docs/agendamento/agendar-servico.md` | alterar, se a L2 for aprovada: o envio do reagendamento espera a prévia |
| `docs/padroes/testes.md` | alterar, se a L1 for aprovada: o defeito de tela |
| `workflows/procedimentos/testes.md` | alterar, se a L1 for aprovada: o defeito de tela |
| `guia/CONTEXT.md` | alterar, se a L1 for aprovada: a linha "Correção de defeito" |
| `memoria/tarefas/59-agendar-e-editar/01_plano.md` | alterar o cabeçalho `status` para `concluido`, se o ponto à parte P1 for aprovado |
| `memoria/tarefas/78-foco-no-reagendamento/02_relatorio.md` | criar na etapa 02 |

## Testes previstos

Nenhum teste automatizado novo. A correção não cria função pura: é uma condição entre o estado da prévia e a trava do formulário, dentro de um componente, e a decisão 0052 deixa as telas à mão. O que "falhava antes" é o roteiro manual (passos 1, 3 e 4, que mostram o defeito antes da correção); a L1 pede a confirmação dessa leitura da regra. Os testes existentes continuam passando em `npm run check`.

## Lacunas na documentação

Duas lacunas. Marque `x` na opção escolhida; o texto proposto corresponde à recomendada.

### L1. Defeito de tela e "todo defeito ganha um teste"

**Problema.** `docs/padroes/testes.md` (Regras dos testes) diz "Todo defeito corrigido ganha um teste que falhava antes da correção"; `workflows/procedimentos/testes.md` diz "Defeito corrigido: primeiro um teste que reproduz o defeito e falha"; `guia/CONTEXT.md` diz "o plano começa por um teste que reproduz o defeito". Mas a decisão 0052 e a mesma `testes.md` ("Fluxos de tela são testados à mão") mantêm componentes e telas sem teste automatizado. Num defeito de tela como este, as duas regras não cabem juntas e a documentação não diz qual vale.

**Opções:**

- [x] **1. O roteiro manual do plano faz o papel do teste (recomendada).** O plano traz o roteiro que reproduz o defeito, executado antes e depois da correção, com o resultado em `notas.md` e no relatório. Segue a 0052, sem dependência nova. O defeito de tela não ganha proteção automática contra a volta.
- [ ] **2. Extrair a condição para uma função pura testada.** Daria um teste automatizado, mas só da condição, não do foco, e criaria uma função sem outro uso. Pode valer em outro defeito, em que a regra seja de fato uma função.
- [ ] **3. Testes de componente (jsdom e Testing Library).** Dependência nova e mudança da 0052, fora do escopo de um defeito. Descartada.

**Texto proposto (opção recomendada):**

- `docs/padroes/testes.md`, Regras dos testes: "Todo defeito corrigido ganha um teste que falhava antes da correção." passa a "Todo defeito corrigido ganha um teste que falhava antes da correção; o defeito de tela, que a decisão 0052 deixa à mão, ganha o roteiro manual do plano, executado antes da correção (reproduz o defeito) e depois dela, com o resultado nas notas e no relatório."
- `workflows/procedimentos/testes.md`, Automatizados: "Defeito corrigido: primeiro um teste que reproduz o defeito e falha; depois a correção." passa a "Defeito corrigido: primeiro um teste que reproduz o defeito e falha; depois a correção. No defeito de tela, o teste é o roteiro manual do plano, que reproduz o defeito antes e passa depois."
- `guia/CONTEXT.md`, linha "Correção de defeito": "o plano começa por um teste que reproduz o defeito" passa a "o plano começa por um teste que reproduz o defeito (no defeito de tela, pelo roteiro manual que o reproduz)".

### L2. A leitura que acompanha o formulário não desativa as escolhas

**Problema.** Nenhum documento diz o que a tela faz enquanto a prévia carrega: `docs/agendamento/agendar-servico.md` (Edição e reagendamento) fala só dos avisos depois da resposta, e `docs/padroes/componentes.md` (Formulário em etapas) não trata da leitura de dados que acompanha as etapas. O PR #77 escolheu desativar o formulário inteiro no reagendamento, e foi isso que quebrou o foco (RNF005). A regra certa precisa estar escrita para a próxima tela que leia a API a cada escolha.

**Opções:**

- [x] **1. Documentar a regra (recomendada).** Os campos ficam habilitados e o foco fica onde está; só o envio espera a resposta. Evita repetir o defeito em outras telas.
- [ ] **2. Não documentar.** A regra fica só no código, e o próximo formulário que ler a API a cada escolha pode repetir o defeito.

**Texto proposto (opção recomendada):**

- `docs/padroes/componentes.md`, Formulário em etapas, novo item: "Enquanto o formulário lê a API de novo a cada escolha, como a prévia do agendamento, os campos continuam habilitados e o foco fica onde está (RNF005); só o botão de envio espera a resposta, indisponível com `aria-disabled`, sem perder o foco."
- `docs/agendamento/agendar-servico.md`, Edição e reagendamento, item "Reagendamento (UC25)": acrescentar "Enquanto a prévia não responde, ou se ela falha, 'Confirmar reagendamento' fica indisponível; as escolhas continuam habilitadas, e o resumo mostra o carregamento ou a falha com 'Tentar novamente'."

## Decisões técnicas

Nenhuma nova. A escolha entre as opções A, B e C da "Correção proposta" é local (um componente e uma propriedade opcional em dois compartilhados, reversível sem efeito fora deles) e não entra em `docs/decisoes/` (`workflows/procedimentos/decisao.md`).

- Seguidas: 0052 (telas à mão), 0055 (telas de demonstração, sem rota nem migration), 0049 (shadcn sobre Base UI: o `Button` com `focusableWhenDisabled`, que o `SubmitButton` já usa), 0027 (React Hook Form).

## Pontos à parte

Decisões do Yvan que não são lacunas da documentação. Marque `x`.

### P1. Plano geral da #59

O plano `memoria/tarefas/59-agendar-e-editar/01_plano.md` ficou em `em_execucao`, embora a #59 esteja fechada pelo PR #77 (o complemento do PR 3, em `memoria/tarefas/59-editar-e-reagendar/`, está `concluido`). Mudar o `status` do cabeçalho para `concluido` é o passo 4 de `workflows/03_entregar.md`, que ficou sem fazer; não mexe em `aprovado_por` nem em `aprovado_em`.

- [x] **1. Sim, neste pull request (recomendada).** Uma linha do cabeçalho, listada na descrição do PR.
- [ ] **2. Não.** Fica para quando o Yvan quiser.

### P2. Ambiente de verificação

O roteiro usa o Docker Desktop (que precisa estar aberto), `npx supabase start`, a conta de teste de cliente do banco local e alterações temporárias, sem commit, em `src/lib/demo/appointments.ts` (atraso, falha, serviço indisponível e conflito de versão da prévia e das gravações), desfeitas com `git checkout` antes do commit. É o mesmo acordo da #59.

- [x] **1. Aprovado, como na #59 (recomendada).**
- [ ] **2. Ajustar:** <o que muda>

## Riscos e dúvidas

- **Causa da abertura.** A hipótese do `button.disabled` (seção "Causa") difere da registrada na #78; o passo 2 do roteiro decide antes de qualquer alteração. Se estiver errada, o plano muda só no ponto 4 da "Correção proposta".
- **`SubmitButton` é de oito formulários.** As propriedades são opcionais e sem efeito quando ausentes; o passo 8 confere o carregamento de um outro formulário, e `npm run check` confere os tipos.
- **Enter com o botão indisponível.** O envio implícito (Enter num campo) clica o botão de envio; com `aria-disabled` (e não o atributo `disabled`), o Base UI precisa impedir o clique. O passo 5 confere, e a guarda de `submit()` é a segunda barreira.
- **Sem texto para a espera.** O botão indisponível não explica por quê; o resumo já mostra o carregamento ou a falha com "Tentar novamente", e nenhum texto novo foi inventado.
- **Foco depende de o painel estar visível.** Por isso o roteiro roda no Chrome sem interface e não no painel do app.
- **Banco local.** O roteiro depende do Docker Desktop aberto e do banco local com os dados de demonstração; sem eles, a verificação do defeito não roda e a etapa 02 para.

## Fora do escopo

- `/booking` e a edição (UC26), que não têm o defeito, e o foco do aviso do conflito de versão e da releitura.
- A rota real da prévia, o esquema de validação e qualquer migration (decisão 0055).
- `Dialog`, `DialogContent` e o `initialFocus` do `AppointmentChangeDialog` além do que o passo 2 exigir.
- Testes automatizados de componente e dependência nova.
- O dashboard (#60) e qualquer outra tela.
