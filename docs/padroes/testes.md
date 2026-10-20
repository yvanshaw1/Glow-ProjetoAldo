---
titulo: Padrões de testes e qualidade
origem: Documentação de Desenvolvimento com IA, seção 8; Documentação de Arquitetura de Software, seção 9
relacionados: [RN009, RN010, RN012, RN013, RN017, RN018, RN019, RN020, RN032, RN033, RN034, RN035]
---

# Padrões de testes e qualidade

Comandos e passos: `workflows/procedimentos/testes.md`.

## O que é testado automaticamente

O Vitest testa as funções puras das regras de negócio (`docs/agendamento/calculos.md`), os esquemas de `src/shared/validation`, o tratamento único das requisições (`src/server/http`), este com `Request` e `Response` padrão, sem servidor, e o cliente da API (`src/lib/api-client.ts`), com `fetch` e `location` simulados. Fluxos de tela são testados à mão na pré-visualização (decisão 0050). Os testes espelham o código: `tests/rules/<arquivo>.test.ts` para `src/server/rules/`, `tests/validation/<módulo>.test.ts` para `src/shared/validation/` `tests/http/<arquivo>.test.ts` para `src/server/http/` e `tests/lib/<arquivo>.test.ts` para `src/lib/`.

| Módulo | Casos que os testes devem cobrir |
|---|---|
| Cálculo de preço | valor por porte e fixo, soma dos itens, acréscimo, desconto, desconto de 100%, arredondamento ao centavo (RN009, RN010, RN012) |
| Transições de status | sequência completa, conclusão com troca da forma de pagamento, cancelamento pelo cliente e pelo funcionário, reagendamento único (RN017, RN018, RN019, RN020) |
| Datas e previsão | fora do expediente, na pausa, em dia fechado, no passado; previsão atravessando a pausa, a noite e dias fechados (RN013, RN034) |
| Regras de edição | cliente só posterga; funcionário adianta ou posterga; data incompatível com o status é recusada (RN032, RN033) |
| Validação e formatos | nomes com partículas, e-mail, celular, placa nos dois padrões, ano, CNPJ, senha, descarte de campos não previstos (RN035) |
| Tratamento único | Problem Details de `AppError`, de erro de validação e de erro inesperado; recusa por formato, tamanho e origem sem chegar à rota; registro sem senha, token, cookie, cabeçalho de autorização nem corpo; resposta fora de cache; usuário em toda linha do registro (RS014, RS017, RS018) |
| Cliente da API | JSON e Problem Details; 401 `UNAUTHENTICATED` leva a `/login` com a página atual, os outros 401 voltam à tela, e o da carga da sessão não sai da página; 403 `PASSWORD_CHANGE_REQUIRED` leva a `/set-password`; nenhuma chamada repetida; falha de rede e resposta fora do formato |

Todo caso desta tabela tem ao menos um teste, e o revisor confere a correspondência no pull request.

## TDD (BECK, 2010)

Regras de negócio e esquemas são escritos com TDD: teste do caso, que falha (vermelho); mínimo de código para passar (verde); melhoria com os testes passando (refatoração). O desenvolvedor confere primeiro os testes, curtos e comparáveis à análise: eles são a especificação que o código gerado precisa cumprir (decisão 0035).

## Regras dos testes

- O teste descreve a regra, não a implementação: o valor esperado vem da análise, nunca da execução do próprio código, e não quebra quando o código muda sem mudar o comportamento.
- Um teste, um comportamento; o nome é a especificação, em inglês: `rejects a password without a number`, nunca `test validate 2`.
- Casos de borda de cada regra: vazio e ausente, zero e negativo, primeiro e último horário do expediente, virada do dia, desconto de 100%.
- Rápidos, independentes e repetíveis: sem banco, sem rede, sem espera, sem depender da ordem; a data atual é sempre passada pelo teste.
- Todo defeito corrigido ganha um teste que falhava antes da correção.
- A suíte inteira roda em poucos segundos, para ser executada a cada alteração, não só no CI.

## Testes manuais e aceitação

- Todo PR que muda comportamento é testado na pré-visualização pelo caso de uso afetado: fluxo principal, alternativos e de exceção.
- Critérios de aceitação das issues em Dado, Quando, Então; o plano liga cada critério a um teste ou a um passo manual.
- Antes da AV3: sessão de teste exploratório por funcionalidade, feita por quem não a construiu.

## Critérios de pronto

Uma tarefa só está pronta quando:

- o plano foi aprovado (na tarefa trivial, na conversa) e o código segue os padrões das áreas que a tarefa toca;
- `npm run check` passa localmente e no CI, e o build da Vercel conclui;
- os casos de uso afetados foram testados na pré-visualização;
- o checklist de segurança do PR foi conferido;
- `02_relatorio.md` está gravado (dispensado na tarefa trivial), e os módulos de `docs/` e a especificação OpenAPI refletem o que mudou;
- outro integrante, que não o autor, aprovou o PR, e a issue foi fechada pela sua incorporação.
