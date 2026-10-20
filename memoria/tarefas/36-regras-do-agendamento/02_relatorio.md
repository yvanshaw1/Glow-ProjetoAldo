---
issue: 36
pull_request:
---

# Relatório: Regras puras do agendamento: preço, datas e previsão, transições de status e edição

## O que foi feito

Funções puras do módulo `appointments`, em `src/server/rules/`, escritas com TDD (decisões 0035 e 0052), para o serviço do painel (#49, #50) e, na fase 3, do portal. Nenhuma rota, tela, tabela ou função SQL mudou; não há migration nem dependência nova.

- **Preço e composição** (`pricing.ts`; RN005, RN006, RN009, RN010, RN012, RN018):
  - valor do item pelo porte do veículo ou fixo, subtotal e total com o percentual da forma de pagamento;
  - valores em reais na entrada e na saída, com a conta em centavos inteiros; só o total é arredondado, com o meio centavo para cima (L1);
  - composição: ao menos um principal ou complementar, e cada adicional com um principal a que está vinculado.
- **Transições de status** (`status-transitions.ts`; RN017 a RN020): a tabela de `calculos.md` (avançar, concluir, cancelar e reagendar), com quem pode fazer cada uma; "Cancelado" e "Reagendado" são finais.
- **Datas e previsão** (`scheduling.ts`; RN013 a RN016, RN034):
  - duração estimada;
  - início válido: dia aberto, dentro do expediente, fora da pausa, em intervalo de 30 minutos e não no passado, no fuso recebido (`COMPANY_TIME_ZONE`, decisão 0053), com o início do expediente e da pausa incluídos e o fim excluído (L4);
  - previsão de conclusão pulando pausa, noite e dias fechados, terminando no próprio limite quando o trabalho acaba nele (L4).
- **Edição** (`editing.ts`; RN032, RN033):
  - o cliente edita só "Agendado"; o funcionário, qualquer status;
  - a data só é conferida quando muda (L2);
  - o cliente só posterga; o funcionário adianta ou posterga, nunca para o passado em "Agendado" nem para depois do momento da alteração depois da chegada do veículo; no "Cancelado", só a disponibilidade (L3).
- **Listas de enum** em `src/shared/constants/`, com os rótulos do glossário: status do agendamento, tipos de serviço, formas de precificação e portes; e o intervalo de 30 minutos (`TIME_SLOT_MINUTES`).

## Arquivos alterados

- `src/server/rules/pricing.ts`, `status-transitions.ts`, `scheduling.ts` e `editing.ts`: criados.
- `src/shared/constants/appointment-statuses.ts`, `service-types.ts`, `pricing-modes.ts`, `vehicle-sizes.ts` e `time-slot.ts`: criados.
- `tests/rules/pricing.test.ts`, `status-transitions.test.ts`, `scheduling.test.ts` e `editing.test.ts`: criados.
- `docs/agendamento/calculos.md`, `docs/agendamento/RN033-coerencia-da-edicao.md` e `docs/padroes/testes.md`: alterados.
- `.env.example`: sem a linha `APP_URL=` (commit do Yvan, acréscimo pedido por ele; plano aprovado da #22, L3).
- `memoria/tarefas/21-formatos-e-erros/01_plano.md`: `aprovado_em` com o ano 2026 no lugar de 2024 (commit do Yvan, acréscimo pedido por ele).

## Testes executados

- `npm run check`: aprovado, com 345 testes (95 novos: 23 de preço, 16 de transições, 25 de datas e 31 de edição). Os testes ficaram no commit 93b220c, anterior ao código, e falharam antes dele pela falta dos quatro módulos.
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 vulnerabilidades. `npx next build`: concluído.
- A conversão de horário local em instante foi conferida também num teste temporário, apagado antes do commit: as trocas de horário de verão de `America/New_York` e a virada do ano em Maceió.
- **Pré-visualização:** nada visível muda; basta o build da Vercel concluir.

## Documentação atualizada

- **Módulos:** `docs/agendamento/calculos.md` (seções 1, 3 e 4), `docs/agendamento/RN033-coerencia-da-edicao.md` e `docs/padroes/testes.md` (tabela de casos e `relacionados`).
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (desempate do arredondamento) → `calculos.md`, seção 1;
  - L2 (edição que mantém a data) → RN033 e `calculos.md`, seção 4;
  - L3 (data na edição de um "Cancelado") → RN033 e `calculos.md`, seção 4;
  - L4 (limites do expediente e da pausa) → `calculos.md`, seção 3.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar:**
  - **Documentação de Arquitetura de Software, seção 4.2 (funções puras):**
    - o total é calculado em centavos inteiros e arredondado uma vez, com o meio centavo para cima, e as funções recebem e devolvem reais;
    - o início válido inclui a abertura e o início da pausa e exclui o encerramento e o fim da pausa;
    - a previsão que termina num limite fica nele;
    - a data da edição só é conferida quando muda, e o "Cancelado" segue só a disponibilidade.
  - **Documentação de Análise do Sistema, seção 9.1 (Quadro 20, RN033):** a data e o horário só são conferidos quando alterados; os status depois da chegada do veículo são "Em espera", "Em execução", "Finalizado", "Concluído" e "Reagendado"; no "Cancelado", vale só a disponibilidade.
  - **Documentação de Desenvolvimento com IA, seção 8 (casos dos testes):** composição dos serviços, meio centavo, duração estimada, intervalos de 30 minutos, previsão terminando no encerramento, quem edita em cada status e data mantida.

## Pendências

- **#49 e #50:** o serviço `appointments` converte os códigos de recusa (`NO_MAIN_OR_COMPLEMENTARY`, `ADDITIONAL_WITHOUT_MAIN`, `CLOSED_DAY`, `OUTSIDE_BUSINESS_HOURS`, `DURING_BREAK`, `OFF_TIME_SLOT`, `IN_THE_PAST`, `NOT_AFTER_SCHEDULED`, `AFTER_NOW`) em `VALIDATION_ERROR`, com as mensagens que a #49 documentar, e o `null` de `findNextStatus` e o `false` de `canEditAppointment` em 409 `INVALID_STATUS`. O repositório tira os segundos dos horários de `business_hours` (`"HH:MM"`).
- **Tamanho do PR:** 581 linhas em `src/`, acima das ~400 do procedimento; o Yvan decidiu manter um PR só.
- **Formas de pagamento e tipos de veículo** em `src/shared/constants/` ficam para a #41 e a #45, as primeiras a usá-los.
- **Cópia principal do Yvan:** depois da incorporação, descartar as duas alterações locais (`git restore .env.example memoria/tarefas/21-formatos-e-erros/01_plano.md`) e fazer o `git pull`.
