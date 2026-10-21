---
issue: 37
pull_request: 54
---

# Relatório: Dados da empresa no painel e no rodapé do portal

## O que foi feito

- **Rota pública** `GET /api/public/company` (RN028, RF004): nome, contato, endereço, redes sociais e a disponibilidade dos sete dias, com os horários em `HH:MM` (L7). O CNPJ não é público, e o dado opcional vazio vem como `null` (L1).
- **Rotas do painel** `GET` e `PUT /api/admin/settings/company` (UC22, RF086), com `requirePermission("settings")` (RS008, RS010):
  - os formatos de RN035 pelo `companySettingsSchema`, com o nome da empresa obrigatório e os demais opcionais; o opcional ausente, `null` ou vazio apaga o valor gravado (L1);
  - o `updatedAt` conferido na própria gravação, com 409 `VERSION_CONFLICT` quando o registro mudou (RNF011, decisão 0009); a mensagem passou a "Estes dados foram alterados por outra pessoa. Confira os dados atualizados e tente novamente." (L6).
- **Página** `/admin/settings` (RF085), com a aba "Empresa" (L2). O formulário tem os grupos Identificação, Contato, Redes sociais e Endereço, com as máscaras de CNPJ e de telefone, "(opcional)" nos rótulos (L1), o aviso "Dados da empresa salvos." como status (L5) e, no conflito de versão, o aviso com o foco e os dados atuais no lugar do que foi digitado (L6).
- **Rodapé do portal** (RN028, L3, L4): "Contato" (endereço, telefone em `tel:` e e-mail em `mailto:`), "Redes sociais" (links de texto Instagram, Facebook e WhatsApp, em `wa.me`) e "© <ano> <nome da empresa>. Todos os direitos reservados.", com o ano no fuso da empresa. O dado vazio e o bloco sem dados não aparecem; na carga, o lugar reservado; na falha, o aviso com "Tentar novamente" (UC01 FE02).
- **Formatos** (RN035): `formatCnpj`, também como máscara, inclusive o CNPJ alfanumérico; `formatPhoneLink`, `formatWhatsAppLink` e `formatYear`.
- **Especificação OpenAPI** das três rotas, com as respostas reutilizáveis `Unauthenticated`, `PanelForbidden` e `VersionConflict`.

## Arquivos alterados

- `src/app/api/public/company/route.ts` e `src/app/api/admin/settings/company/route.ts`: criados.
- `src/app/(admin)/admin/settings/page.tsx`: criado.
- `src/components/admin/settings/settings-tabs.tsx` e `company-settings-form.tsx`: criados.
- `src/components/portal/layout/company-footer-info.tsx`: criado; `site-footer.tsx`: a marca e "Acesso rápido" passados ao componente dos dados da empresa.
- `src/server/services/settings.ts`: criado (`getPublicCompany`, `getCompanySettings`, `updateCompanySettings`).
- `src/server/repositories/business-settings.ts` e `business-hours.ts`: criados.
- `src/shared/api/settings.ts`: criado (`PublicCompany`, `CompanySettings`, `BusinessDay`).
- `src/shared/validation/settings.ts`: criado; `formats.ts`: `optionalFormat`; `params.ts`: `updatedAtSchema`.
- `src/shared/format/cnpj.ts`: criado; `phone.ts`: `formatPhoneLink` e `formatWhatsAppLink`; `date.ts`: `formatYear`.
- `src/shared/errors/catalog.ts`: mensagem de `VERSION_CONFLICT`.
- `tests/validation/settings.test.ts` e `tests/format/cnpj.test.ts`: criados; `tests/validation/formats.test.ts`, `params.test.ts`, `tests/format/phone.test.ts` e `date.test.ts`: casos novos; `tests/lib/api-client.test.ts`: mensagem de `VERSION_CONFLICT`.
- `docs/plataforma/openapi.yaml`, `docs/configuracoes/rotas.md` e `UC22-configurar-dados-da-empresa.md`; `docs/padroes/api.md`, `componentes.md`, `layouts.md`, `design-midia.md` e `testes.md`; `docs/plataforma/RN035-formatos-dos-dados.md` e `mensagens-de-validacao.md`.
- README de `src/components/admin/settings/`, `src/shared/validation/`, `src/shared/format/` e `tests/format/`.

## Testes executados

- `npm run check`: aprovado, com 371 testes (26 novos). Os testes ficaram no commit e84249b, anterior ao código, e falharam antes dele: 2 módulos inexistentes e os casos novos de `formats`, `params`, `phone` e `date`. O teste do opcional ausente entrou antes da correção dele (commit 4402645) e falhava sem ela.
- `npm audit --omit=dev --audit-level=high` (o passo do CI): 0 falhas. `npx next build`: concluído, com as duas rotas dinâmicas.
- Local, com o Supabase local, contas de teste só nele (cliente, funcionário com `settings`, funcionário do cargo "Atendimento" e admin) e o `next start`:
  - **Rotas** (25 conferências): o `PUT` com o `updatedAt` lido grava; o antigo dá 409 `VERSION_CONFLICT`, sem gravar, com a linha `warn` no registro; CNPJ errado e "maria@" dão 400 com a mensagem de cada campo; o nome vazio, "Preencha este campo."; sem `updatedAt`, "Atualize a página e tente novamente."; o opcional vazio, `null` ou ausente apaga o valor; o campo não previsto é descartado; o funcionário sem `settings` e o cliente recebem 403, sem sessão 401, sem `Origin` 403; a rota pública não traz CNPJ nem `updatedAt`.
  - **Telas**, num Chrome sem interface: e-mail e endereço salvos aparecem no rodapé sem telefone e sem "Redes sociais"; o telefone e o Instagram novos aparecem no rodapé, com `tel:+558233334444`; as máscaras de telefone e de CNPJ na digitação; CNPJ errado, e-mail sem domínio e nome vazio mostram as mensagens junto aos campos, sem `PUT`, com o foco no primeiro inválido; com duas páginas abertas, a segunda recebe o aviso de conflito com o foco e passa a mostrar os dados gravados pela primeira; o funcionário sem `settings` volta da página com o aviso de acesso negado; com o banco parado, o rodapé mostra a falha com "Tentar novamente", que refaz a chamada uma vez.
  - **Larguras, temas e teclado:** nada transborda em `/login` e `/admin/settings` a 360 e a 1440 px, nos temas claro e escuro; o Tab vai da aba aos oito campos e ao botão, com o contorno de foco em todos.
  - **Lighthouse 13.5.0**, acessibilidade, em `/admin/settings`, `/` e `/login`, celular e computador, claro e escuro: 100 nos 12 relatórios. Desempenho no celular: CLS de 0,003 em `/` e 0 em `/login`; LCP de 2,8 s e 3,2 s, os mesmos da `main` sem esta tarefa (2,6 a 2,8 s e 3,17 s).
  - **Registro:** nenhuma linha com senha, cookie, token, cabeçalho de autorização nem os e-mails de teste (RS018).
- **Pré-visualização:** passo do desenvolvedor (veja o PR).

## Documentação atualizada

- **Módulos:**
  - `docs/plataforma/openapi.yaml`: as três rotas, as tags `public` e `settings`, os esquemas e as respostas reutilizáveis;
  - `docs/configuracoes/rotas.md`: a tela em abas e a entrada, a resposta e os erros das três rotas;
  - `docs/configuracoes/UC22-configurar-dados-da-empresa.md`: RN035 nas regras;
  - `docs/padroes/api.md`, `componentes.md` (seção "Formulários"), `layouts.md`, `design-midia.md` e `testes.md`;
  - `docs/plataforma/RN035-formatos-dos-dados.md` e `mensagens-de-validacao.md`.
- **Lacunas resolvidas** (opção 1 em todas):
  - L1 (dado opcional vazio) → `api.md`, RN035 e `componentes.md`;
  - L2 (disposição de `/admin/settings`) → `rotas.md` e o README de `src/components/admin/settings/`;
  - L3 (conteúdo do rodapé) → `layouts.md` e `design-midia.md`;
  - L4 (rodapé na carga e na falha) → `layouts.md`;
  - L5 (aviso de sucesso do formulário que fica na tela) → `componentes.md`;
  - L6 (conflito de versão na tela) → `api.md`, `mensagens-de-validacao.md`, `componentes.md` e `src/shared/errors/catalog.ts`;
  - L7 (horário do dia na API) → `api.md`.
- **Decisões:** nenhuma.
- **Documentos formais a atualizar:**
  - **Documentação de Análise do Sistema, seção 9.1 (Quadro 20, RN035):** uma opcional deixada vazia fica sem valor, e o valor que estava gravado é apagado.
  - **Documentação de Análise do Sistema, seção 10.2 (Quadro 47, UC22):** RN035 entre as regras do caso de uso, pelo FE01.
  - **Documentação de Arquitetura de Software, seção 3.2 (Quadros 3 e 4) e Apêndice A:** `/admin/settings` em abas (Empresa, Disponibilidade e Formas de pagamento); a resposta de `GET /api/public/company` sem o CNPJ; o `updatedAt` na entrada de `PUT /api/admin/settings/company`.
  - **Documentação de Arquitetura de Software, seção 6 (convenções da API):** o horário do dia em `HH:MM`, no fuso da empresa, sem data nem deslocamento; o opcional ausente, `null` ou vazio gravado e devolvido como `null`; a nova mensagem de `VERSION_CONFLICT`, se o catálogo de erros estiver no documento.
  - **Documentação de Desenvolvimento com IA, seção 8:** os testes de validação passam a cobrir o dado opcional vazio e a versão do registro, e os de formatação, o CNPJ, os links de telefone e de WhatsApp e o ano no fuso da empresa.

## Pendências

- **Pré-visualização**, passo do Yvan: o Lighthouse das ferramentas do navegador e as larguras de 360 e 1440 px em `/admin/settings` e `/login`, com as capturas no PR, e o primeiro critério da issue. Ela usa o banco de produção: preencher com os dados reais da empresa, ou restaurar os anteriores depois do teste.
- **LCP acima de 2,5 s** no celular simulado, local, em `/` e `/login`: já estava assim na `main`, e esta tarefa não o muda. Conferir na pré-visualização (RNF006); se continuar, vale uma issue própria, porque o elemento de LCP de `/` é o título da página.
- **Para a #41:** as abas "Disponibilidade" e "Formas de pagamento" entram em `SETTINGS_SECTIONS` (`settings-tabs.tsx`), e a 360 px a lista de três abas rola na horizontal, a conferir; a gravação dos horários entra em `business-hours.ts`; as rotas novas usam `updatedAtSchema`, `PanelForbidden` e `VersionConflict`, e a disponibilidade usa o `updatedAt` mais recente da lista (`api.md`).
- **Para a #48:** a página inicial usa a mesma rota pública; o rodapé já faz uma chamada por carga de página.
- **Tamanho do PR.** 912 linhas em `src/` (sem os README), 284 de testes e 412 de documentação (386 do `openapi.yaml`), acima das ~400 do procedimento; o Yvan aprovou um PR só, com commits separados.
