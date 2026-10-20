---
id: 0053
titulo: Fuso da empresa como constante compartilhada, sem variável de ambiente
status: aceita
data: 2026-10-20
origem: issue #35, memoria/tarefas/35-base-do-painel/01_plano.md (L1 e Decisões técnicas)
relacionados: [RN013, RN035, RNF016]
---

# 0053 – Fuso da empresa como constante compartilhada, sem variável de ambiente

## Decisão

O fuso da empresa é a constante `COMPANY_TIME_ZONE` (`"America/Maceio"`), em `src/shared/constants/time-zone.ts`. Os formatos de `src/shared/format` a usam no navegador para mostrar datas e horários, e o serviço do agendamento a usa no servidor para passar o fuso às regras puras. A variável de ambiente `APP_TIMEZONE` deixa de existir.

## Alternativa descartada

(a) Manter `APP_TIMEZONE` no servidor e entregar o fuso à tela pela API, num campo de `GET /api/public/company`; (b) usar o fuso do aparelho de quem usa; (c) `NEXT_PUBLIC_APP_TIMEZONE`.

## Justificativa

O navegador precisa do fuso para mostrar datas (RN035, RNF016), e nenhuma variável de ambiente chega a ele (`docs/plataforma/infraestrutura.md`).

- (a) custa mais uma chamada por tela com data e muda o contrato da rota pública dos dados da empresa.
- (b) mostra outro horário a quem estiver com o relógio em outro fuso, diferente do que o servidor confere (RN013).
- (c) é gravada no build, contra a regra de ler as variáveis só na execução: a imagem do contêiner é construída sem elas.

Há uma empresa só, em Maceió (`setup/questionario.md`), e o Brasil não tem horário de verão desde 2019. A constante é a fonte única dos dois lados, como os limites de `src/shared/constants/` (`docs/padroes/codigo.md`). Consequência aceita: mudar o fuso exige uma alteração revisada do código.
