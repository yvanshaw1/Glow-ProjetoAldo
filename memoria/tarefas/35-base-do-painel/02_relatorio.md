---
issue: 35
pull_request: 52
---

# Relatório: Base das telas do painel: listagem paginada, diálogos, formulário em etapas e formatos de moeda e data

## O que foi feito

- **Componentes do shadcn/ui sobre Base UI** (decisão 0049): diálogo, diálogo de confirmação, seleção, caixa de seleção, chave, abas, área de texto, etiqueta e estado vazio, com as variantes de `docs/padroes/design.md` e "Fechar" no lugar de "Close". Nenhuma dependência nova.
- **Listagem paginada** (RNF008):
  - busca 300 ms depois da última tecla, com até 100 caracteres (RN035);
  - filtros e "Limpar filtros" (RF048);
  - nova busca e novo filtro voltam à primeira página;
  - paginação com a faixa "1–20 de 134", anunciada pelo leitor de tela;
  - estados de carga, falha com "Tentar novamente" e vazio com a mensagem da tela (RNF004).
- **Diálogo de confirmação** (RNF003, RNF004, RNF005): o foco começa em "Cancelar", fica no diálogo e volta ao botão que o abriu; durante a ação, o diálogo não fecha, e a falha aparece dentro dele.
- **Formulário em etapas** (RNF002): um formulário para todas as etapas, indicação da etapa atual, "Próximo" que confere só a etapa, "Voltar" sem perder dados e o erro da API levando à etapa do campo.
- **Campo monetário** (RN035, L2): cada algarismo digitado entra no fim dos centavos, e o campo entrega o valor em reais.
- **Formatos** (RN035, RNF016): moeda, data, data e hora no fuso da empresa e duração, com `Intl`. O fuso passou a ser a constante `COMPANY_TIME_ZONE` (decisão 0053), no lugar da variável `APP_TIMEZONE`.
- **Componentes de formulário compartilhados:** `FormField`, `FormAlert`, `PasswordInput` e `SubmitButton` passaram de `portal/auth/` a `shared/`, e o `useFormFailure` a `src/hooks/`. O `FormField` passou a tipar o valor de cada campo pelo nome dele, para os campos de número e de marcar do painel.
- **Hooks:** `useApiQuery` (leitura com carregamento, falha, recarga e cancelamento) e `usePaginatedList`.

## Arquivos alterados

- `src/components/ui/dialog.tsx`, `alert-dialog.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`, `tabs.tsx`, `textarea.tsx`, `badge.tsx` e `empty.tsx`: criados pela CLI e ajustados.
- `src/components/shared/paginated-list.tsx`, `list-pagination.tsx`, `empty-state.tsx`, `confirm-dialog.tsx`, `step-form.tsx` e `money-input.tsx`: criados.
- `src/components/shared/form-field.tsx`, `form-alert.tsx`, `password-input.tsx` e `submit-button.tsx`: vindos de `src/components/portal/auth/`; o `FormField` com os tipos pelo nome do campo, e o `SubmitButton` com `size` e `className`.
- `src/components/portal/auth/login-form.tsx`, `register-form.tsx` e `set-password-form.tsx`: imports e `SubmitButton` com `size="lg"` e `className="w-full"`.
- `src/hooks/use-api-query.ts`, `use-paginated-list.ts` e `use-form-failure.ts`: criados.
- `src/lib/api-client.ts`: `withQuery`, `QueryParams` e `toApiError`.
- `src/shared/format/currency.ts`, `date.ts` e `duration.ts`: criados.
- `src/shared/constants/time-zone.ts`: criado (`COMPANY_TIME_ZONE`).
- `src/shared/validation/formats.ts`: `SEARCH_TERM_MAX_LENGTH` exportado (acréscimo aceito pelo Yvan).
- `.env.example`: sem a linha `APP_TIMEZONE=`, apagada pelo Yvan.
- `tests/format/currency.test.ts`, `date.test.ts` e `duration.test.ts`: criados; `tests/lib/api-client.test.ts`: casos de `withQuery`.
- README de `src/components/ui/`, `src/components/shared/`, `src/hooks/`, `src/lib/`, `src/shared/format/`, `src/shared/constants/`, `tests/format/` e `tests/lib/`.

## Testes executados

- `npm run check`: aprovado, com 250 testes (23 novos). Os testes ficaram no commit f512de8, anterior ao código, e falharam antes dele: 3 módulos inexistentes e 4 casos de `withQuery`.
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído.
- Local, com o Supabase local, o admin de teste e uma página e duas rotas temporárias, apagadas antes do commit. A lista, a busca, os filtros e a falha foram conferidos no navegador do app; o teclado, as larguras e os temas, num Chrome sem interface (o painel do navegador do app estava oculto, e nele o foco dos diálogos não se move).
  - **Listagem:** `?page=1&pageSize=20` na carga e `page=2` na página seguinte; "item 1" digitado faz uma só chamada, com `page=1&pageSize=20&search=item+1`; o filtro e "Limpar filtros" voltam à primeira página; a busca sem resultado mostra o estado vazio com a mensagem da tela; a falha mostra o aviso, e "Tentar novamente" refaz a chamada.
  - **Formatos na tela:** "R$ 1.250,00" digitando 1, 2, 5, 0, 0, 0; datas como "01/10/2026 às 08:30" para 11:30 UTC; durações como "4 h 45 min".
  - **Diálogos:** a 360 e a 1440 px, nos dois temas, a confirmação abre pelo teclado com o foco em "Cancelar", Tab e Shift+Tab não saem dela, e Esc devolve o foco ao botão que a abriu; o mesmo no diálogo do formulário. A falha da ação aparece dentro do diálogo aberto, com o foco no aviso.
  - **Formulário em etapas:** as mensagens da etapa sem avançar; o foco no título da nova etapa; "Voltar" e "Próximo" mantêm os dados das duas etapas, inclusive os valores; o erro da API num campo da etapa 1 volta a ela, com a mensagem junto ao campo.
  - **Larguras e temas:** nada transborda na lista e nos dois diálogos, a 360 e a 1440 px, nos temas claro e escuro; no celular, o diálogo fica ancorado embaixo.
  - **Lighthouse 13.5.0**, acessibilidade, na lista e com cada diálogo aberto, nos modos celular e computador e nos dois temas: 100 nos 12 relatórios, sem auditoria reprovada.
  - **Telas de acesso:** `/login` e `/register` sem transbordar, com o botão de envio na largura do formulário e o "Mostrar senha".
  - **Registro:** nenhuma linha com e-mail, senha, token ou cookie (RS018).
- **Pré-visualização:** passo do desenvolvedor (veja o PR).

## Documentação atualizada

- **Módulos:**
  - `docs/padroes/componentes.md` (novo): listagem, diálogos, formulário em etapas e campo monetário;
  - `docs/padroes/frontend.md`, `design.md` e `testes.md`;
  - `docs/plataforma/RN035-formatos-dos-dados.md`, `infraestrutura.md` e `estrutura-de-pastas.md`;
  - `docs/agendamento/calculos.md` e `docs/CONTEXT.md`.
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (fuso da empresa no navegador) → decisão 0053, `frontend.md`, `infraestrutura.md`, `calculos.md`, `.env.example` e os README de `src/shared/constants/` e `src/shared/format/`;
  - L2 (digitação no campo monetário) → `componentes.md` e o README de `src/shared/format/`;
  - L3 (página, busca e filtros no componente) → `componentes.md`;
  - L4 (duração sem horas ou sem minutos) → RN035.
- **Decisões:** 0053 criada.
- **Documentos formais a atualizar:**
  - **Documentação de Análise do Sistema, seção 9.1 (Quadro 20, RN035):** a exibição da duração passa a "1 h 30 min; 45 min; 2 h".
  - **Documentação de Arquitetura de Software, variáveis de ambiente:** sai `APP_TIMEZONE`; o fuso da empresa é a constante `COMPANY_TIME_ZONE` (`America/Maceio`), usada pelo navegador e pelo servidor.
  - **Documentação de Arquitetura de Software, seção 9 (Quadro 38):** decisão 0053 (fuso da empresa como constante compartilhada, sem variável de ambiente).
  - **Documentação de Arquitetura de Software, seção 3 (frontend):** os componentes compartilhados (listagem paginada com busca e filtros no componente, diálogo de confirmação, formulário em etapas e campo monetário), as datas no fuso da empresa e os componentes do shadcn/ui acrescentados.
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes de formatação passam a cobrir moeda, data, data e hora e duração, e os do cliente da API, os parâmetros de consulta.

## Pendências

- **Pré-visualização.** A página temporária não vai ao PR, então os componentes do painel foram conferidos só localmente. Na pré-visualização, confira `/login` e `/register`, cujos componentes mudaram de pasta. As primeiras telas do painel (#39 a #42) conferem os componentes na pré-visualização.
- **`/set-password`** não foi aberta na verificação, porque exige uma conta com a senha inicial pendente; usa os mesmos componentes, e o build e os tipos passaram.
- **Variável `APP_TIMEZONE`:** apagar também da Vercel e do `.env.local` (passo do Yvan).
- **`design.md`** ficou com 7,8 mil caracteres, perto do limite de cerca de 2 mil tokens por módulo; a próxima inclusão pede dividi-lo, como na #25.
- **Botão de limpar da busca:** o "×" que o Chrome põe no campo `type="search"` usa a cor do navegador, não a do tema. Fica para a primeira tela que usar a listagem, se incomodar.
- **Para a #37:** começar da `main` com esta tarefa, porque o formulário dos dados da empresa usa `FormField`, `FormAlert` e `SubmitButton`, agora em `src/components/shared/`.
- **Para a #49:** o serviço do agendamento passa `COMPANY_TIME_ZONE` às funções da #36.
- **Tamanho do PR.** Cerca de 1.080 linhas escritas à mão em `src`, 850 dos componentes gerados pela CLI (num commit próprio, a957a22, com os ajustes em outro), 144 de testes e 84 de documentação, acima das ~400 do procedimento. A issue junta as peças de propósito, para as tarefas seguintes não as criarem em paralelo; os testes, o código gerado, os ajustes, a mudança de pasta e os componentes novos vão em commits separados.
