---
issue: 37
titulo: "Dados da empresa no painel e no rodapé do portal"
areas: [frontend, backend, testes]
tipo: funcionalidade
requisitos: [UC22, UC01, RF004, RF085, RF086, RN028, RN035, RS008, RS010, RS013, RS014, RNF001, RNF003, RNF004, RNF005, RNF006, RNF011]
status: concluido
aprovado_por: yvan
aprovado_em: 20:20 - 20/10/2026
---

# Plano: Dados da empresa no painel e no rodapé do portal

## Objetivo

Entregar o UC22 de ponta a ponta e completar o rodapé do portal (RN028, L8 da #25):

- `GET /api/public/company`, com os dados institucionais e a disponibilidade dos sete dias, que a #41 depois deixa editável;
- `GET` e `PUT /api/admin/settings/company`, com `requirePermission("settings")` (RS008, RS010), os formatos de RN035 e o `updatedAt` com 409 `VERSION_CONFLICT` (RNF011, decisão 0009);
- a página `/admin/settings`, com a aba "Empresa" e o lugar das abas da #41 (RF085, RF086);
- o rodapé do portal com contato, endereço, redes sociais e o nome da empresa no aviso de direitos, vindos da rota pública, sem o dado opcional vazio (RF004, RN028);
- a especificação OpenAPI das três rotas.

Não há migration nem dependência nova: `business_settings` e `business_hours` já existem, com a linha única e os sete dias criados por `supabase/seed.sql`.

## Base da construção

- Ramificação `feat/37-company-settings`, criada da `origin/main` (7f8a547, com a #21 à #26, a #35 e a #36), sem vínculo com a `main`, e `npx -y npm@11.21.1 ci`.
- Contratos usados sem mudança:
  - `handleRoute`, `respondOk` (`src/server/http/`), `requirePermission` (`src/server/auth/guards.ts`) e `getServiceClient` (`src/server/supabase/clients.ts`);
  - em `src/shared/validation/formats.ts`, já testados na #21: `plainTextSchema` com `COMPANY_NAME_MAX_LENGTH` (100) e `ADDRESS_MAX_LENGTH` (200), `cnpjSchema` (inclusive o alfanumérico), `emailSchema`, `companyPhoneSchema`, `mobilePhoneSchema` (o WhatsApp), `instagramUrlSchema` e `facebookUrlSchema`;
  - `formatPhone` (`src/shared/format/phone.ts`), que também é a máscara;
  - `apiRequest`, `ApiError` e `toApiError` (`src/lib/api-client.ts`); `useApiQuery` e `useFormFailure` (`src/hooks/`);
  - `FormField`, `FormAlert` e `SubmitButton` (`src/components/shared/`) e, de `ui/`, `Tabs`, `Input`, `Alert`, `Skeleton` e `Button`;
  - `BusinessDay` das regras da #36 (`src/server/rules/scheduling.ts`): os horários são texto `HH:MM`, a mesma forma que a rota pública devolve (L7), para o serviço do agendamento (#49) passar a disponibilidade às regras sem conversão.

## Como funciona

### Contrato da API

Corpo das respostas, em `src/shared/api/settings.ts`, com `null` em todo dado opcional vazio (L1):

| Rota | Resposta 200 |
|---|---|
| `GET /api/public/company` | `companyName`, `email`, `phone`, `whatsapp`, `address`, `instagramUrl`, `facebookUrl` e `businessHours`: os sete dias, de domingo (0) a sábado (6), cada um com `weekday`, `isOpen`, `opensAt`, `closesAt`, `breakStartsAt` e `breakEndsAt` (`HH:MM` ou `null`, L7) |
| `GET /api/admin/settings/company` | `companyName`, `cnpj`, `email`, `phone`, `address`, `instagramUrl`, `facebookUrl`, `whatsapp` e `updatedAt` (texto ISO 8601, como o banco devolve) |
| `PUT /api/admin/settings/company` | o mesmo corpo do `GET`, com o `updatedAt` novo |

- A rota pública não traz o CNPJ nem o `updatedAt`: `rotas.md` lista nome, contato, endereço, redes sociais e disponibilidade, e `layouts.md` não põe o CNPJ no rodapé.
- Entrada do `PUT`: `companyName*`, `cnpj`, `email`, `phone`, `address`, `instagramUrl`, `facebookUrl`, `whatsapp` e `updatedAt*`. Como o `PUT` substitui a configuração (`api.md`), o campo opcional ausente, `null` ou vazio apaga o que estava gravado (L1). Campos não previstos são descartados (RS013).
- Erros do `PUT`: 400 `VALIDATION_ERROR`, com a mensagem de cada campo em `fields`; 401 `UNAUTHENTICATED`; 403 `FORBIDDEN` (cliente, funcionário sem a permissão ou origem recusada), `ACCOUNT_INACTIVE` e `PASSWORD_CHANGE_REQUIRED`; 409 `VERSION_CONFLICT`; 413; 415; 500. O `GET` do painel tem os mesmos 401 e 403. A rota pública só responde 500 na falha inesperada.

### Esquemas (`src/shared/validation/`)

- `formats.ts`, novo `optionalFormat(esquema)`: `undefined`, `null` e o texto vazio depois da normalização de RN035 (inclusive só espaços) viram `null`; o texto preenchido passa pelo formato, com a mensagem dele (L1). Fica em `formats.ts` porque vale para todo dado opcional de RN035, como a descrição do cargo ocupado (#43).
- `params.ts`, novo `updatedAtSchema`: texto ISO 8601 com deslocamento e frações de segundo (`z.iso.datetime({ offset: true })`), como o PostgreSQL devolve (`2026-10-20T13:45:12.345678+00:00`); ausente ou fora do formato, "Atualize a página e tente novamente." (L6). Vale para todo `PATCH` e `PUT`.
- `settings.ts`, novo `companySettingsSchema`, usado pela rota e pelo formulário (decisão 0008):

| Campo | Esquema |
|---|---|
| `companyName` | `plainTextSchema(COMPANY_NAME_MAX_LENGTH)`, obrigatório |
| `cnpj` | `optionalFormat(cnpjSchema)` |
| `email` | `optionalFormat(emailSchema)` |
| `phone` | `optionalFormat(companyPhoneSchema)` |
| `address` | `optionalFormat(plainTextSchema(ADDRESS_MAX_LENGTH))` |
| `instagramUrl`, `facebookUrl` | `optionalFormat(instagramUrlSchema)`, `optionalFormat(facebookUrlSchema)` |
| `whatsapp` | `optionalFormat(mobilePhoneSchema)` |
| `updatedAt` | `updatedAtSchema` |

Tipos: `CompanySettingsInput` (`z.output`, o que a rota e o serviço recebem) e `CompanySettingsFormInput` (`z.input`, o do formulário).

### Backend (decisões 0003, 0005, 0006 e 0042)

| Camada | Arquivo | Faz |
|---|---|---|
| Rota | `src/app/api/public/company/route.ts` | `GET`, sem guard; chama `getPublicCompany` e responde com `respondOk` |
| Rota | `src/app/api/admin/settings/company/route.ts` | `GET`: `requirePermission("settings")` e `getCompanySettings`. `PUT`: o guard, `companySettingsSchema.parse(body)` e `updateCompanySettings` |
| Serviço | `src/server/services/settings.ts` | `getPublicCompany`: lê os dados e a disponibilidade em paralelo (`Promise.all`), sem o CNPJ e o `updatedAt`. `getCompanySettings`. `updateCompanySettings`: sem linha devolvida, lança `AppError("VERSION_CONFLICT")`, que o tratamento único registra como `warn` |
| Repositório | `src/server/repositories/business-settings.ts` | `findBusinessSettings` e `updateBusinessSettings(valores, updatedAt)`: um único `update ... eq("id", 1).eq("updated_at", updatedAt).select()`, que devolve a linha nova ou `null` quando o `updated_at` já mudou (RNF011). O gatilho `trg_business_settings_updated_at` grava o novo `updated_at` |
| Repositório | `src/server/repositories/business-hours.ts` | `listBusinessHours`: os sete dias por `weekday`, com o `time` do banco (`08:00:00`) convertido em `HH:MM`. A #41 acrescenta aqui a gravação |

- A linha única de `business_settings` sempre existe (`seed.sql`, `dados.md`): se faltar, é falha inesperada, 500 com o `requestId` no registro, e não 404.
- Sem linha própria de registro para a alteração dos dados: `backend.md` não a lista entre os eventos de negócio, e o tratamento único já grava a requisição com o usuário.

### Página `/admin/settings` (L2)

- `src/app/(admin)/admin/settings/page.tsx`, componente de servidor: o título "Configurações" (`h1`, `text-h3 md:text-h2`, como o dashboard) e o `SettingsTabs`.
- `src/components/admin/settings/settings-tabs.tsx`, de cliente: as abas de `ui/tabs` sobre uma lista de seções (valor, rótulo e componente). Agora só "Empresa" (`company`); a #41 acrescenta "Disponibilidade" e "Formas de pagamento" à lista. A aba escolhida fica no componente, como a listagem (L3 da #35): recarregar volta a "Empresa". Os painéis ficam montados (`keepMounted`), para trocar de aba não perder o que foi digitado.
- `src/components/admin/settings/company-settings-form.tsx`, de cliente (wireframe `companyInfo`, só o esqueleto; descrição, logradouro, bairro, cidade, estado e CEP ficam de fora, porque `dados.md` tem um endereço só e nenhuma descrição):
  - **Carga:** `useApiQuery<CompanySettings>("/api/admin/settings/company")`. Na primeira carga, o lugar reservado (`Skeleton`) dos campos; na falha, o `Alert` com a mensagem do `ApiError` e "Tentar novamente", como a listagem (`componentes.md`).
  - **Campos**, em grupos (`fieldset` com `legend` no estilo de sobretítulo), numa coluna e em duas a partir de 768 px:
    - Identificação: "Nome da empresa"; "CNPJ (opcional)", com a máscara `formatCnpj`, `autoCapitalize="characters"`;
    - Contato: "E-mail (opcional)" (`type="email"`); "Telefone (opcional)", com `formatPhone` e `inputMode="tel"`;
    - Redes sociais: "Instagram (opcional)" e "Facebook (opcional)" (`type="url"`), com a descrição "Como https://instagram.com/glow" e "Como https://facebook.com/glow"; "WhatsApp (opcional)", com `formatPhone` e `inputMode="tel"`. O WhatsApp fica nas redes sociais, como no UC22 e no wireframe;
    - Endereço: "Endereço (opcional)", um campo de até 200 caracteres.
  - Todos com `autoComplete="off"`: são dados da empresa, não de quem preenche (WCAG 1.3.5 vale para os dados da própria pessoa). Os valores gravados chegam aos campos com as máscaras (`formatCnpj`, `formatPhone`), e o `null`, como texto vazio (L1).
  - **Envio:** o `SubmitButton` "Salvar alterações" / "Salvando…", no fim do formulário, à direita a partir de 640 px. O `zodResolver(companySettingsSchema)` confere campo a campo, e o corpo enviado é o já normalizado, com o `updatedAt` da última leitura, que fica nos valores do formulário sem campo na tela.
  - **Sucesso:** o formulário recebe a resposta como os novos valores (com o `updatedAt` novo), e o aviso "Dados da empresa salvos." aparece no topo do formulário, como status (L5).
  - **Falha:** o `useFormFailure` põe as mensagens nos campos e o `detail` no `FormAlert`, que recebe o foco (RNF003, RNF005). No 409 `VERSION_CONFLICT`, o aviso fica e o formulário recarrega os dados atuais pelo `reload()` do `useApiQuery`, substituindo o que foi digitado (L6, `frontend.md`).

### Rodapé do portal (L3, L4)

- `src/components/portal/layout/site-footer.tsx` continua de servidor, com a marca e "Acesso rápido", e passa a uma grade: uma coluna, duas a partir de 768 px e quatro a partir de 1024 px (`design.md`), com o aviso de direitos numa linha abaixo, depois de uma divisória em `--border`.
- `src/components/portal/layout/company-footer-info.tsx`, novo, de cliente: `useApiQuery<PublicCompany>("/api/public/company")`, uma vez por carga de página (o layout do portal não é desmontado na navegação entre páginas). Mostra:
  - **Contato** (`<address>`): endereço; telefone com `formatPhone`, em link `tel:`; e-mail em link `mailto:`; cada um com o ícone decorativo do Lucide (`MapPin`, `Phone`, `Mail`, 16 px, `aria-hidden`);
  - **Redes sociais:** links de texto "Instagram", "Facebook" e "WhatsApp" (`wa.me`), porque o Lucide 1.59 não tem ícones de marca (L3);
  - **Aviso de direitos:** "© 2026 Glow – Estética Automotiva. Todos os direitos reservados.", com o nome gravado e o ano no fuso da empresa (`formatYear`, decisão 0053).
  - Cada dado vazio (`null`) não aparece, e o bloco sem nenhum dado também não, com o título dele.
  - Carregando: o lugar reservado das linhas de contato e do aviso, para não deslocar a página (RNF006). Na falha: o `Alert` com a mensagem do `ApiError` e "Tentar novamente", no lugar dos dois blocos, sem o aviso de direitos (L4, UC01 FE02).
- Os links usam `--link`, como "Acesso rápido", e abrem na mesma aba (L3).

### Formatos (`src/shared/format/`)

| Arquivo | Função | Saída |
|---|---|---|
| `cnpj.ts` (novo) | `formatCnpj(texto)` | "12.345.678/0001-95" (RN035, coluna Exibição); letras em maiúsculas ("12.ABC.345/01DE-35"); só letras e algarismos, até 14, com a máscara crescendo durante a digitação, como `formatPhone` |
| `phone.ts` | `formatPhoneLink(algarismos)` | "tel:+558233334444" |
| `phone.ts` | `formatWhatsAppLink(algarismos)` | "https://wa.me/5582999998888" |
| `date.ts` | `formatYear(valor)` | o ano de um instante no fuso da empresa: "2027-01-01T02:30:00Z" → "2026" |

### Especificação OpenAPI (`docs/plataforma/openapi.yaml`)

A especificação já existe desde a #23 (`api.md`) e ganha, no mesmo PR que as rotas:

- as tags `public` ("Dados da empresa e catálogo, sem autenticação") e `settings` ("Configurações do painel, com a permissão `settings`");
- os caminhos `/api/public/company` (`getPublicCompany`, `security: []`) e `/api/admin/settings/company` (`getCompanySettings` e `updateCompanySettings`, `sessionCookie`);
- os esquemas `PublicCompany`, `BusinessDay`, `CompanySettings` e `CompanySettingsInput`, com os formatos de RN035 nas descrições e os exemplos;
- as respostas reutilizáveis `Unauthenticated`, `PanelForbidden` (`FORBIDDEN`, `ACCOUNT_INACTIVE`, `PASSWORD_CHANGE_REQUIRED` e a origem recusada) e `VersionConflict`, que as próximas rotas do painel também usam.

### Arquivos novos e alterados de `src/`

| Arquivo | Conteúdo |
|---|---|
| `app/api/public/company/route.ts` | novo: `GET` |
| `app/api/admin/settings/company/route.ts` | novo: `GET` e `PUT` |
| `app/(admin)/admin/settings/page.tsx` | novo |
| `components/admin/settings/settings-tabs.tsx`, `company-settings-form.tsx` | novos |
| `components/portal/layout/company-footer-info.tsx` | novo |
| `components/portal/layout/site-footer.tsx` | grade, os blocos da empresa e o aviso de direitos |
| `server/services/settings.ts` | novo |
| `server/repositories/business-settings.ts`, `business-hours.ts` | novos |
| `shared/api/settings.ts` | novo: `PublicCompany`, `CompanySettings`, `BusinessDay` |
| `shared/validation/settings.ts` | novo |
| `shared/validation/formats.ts` | `optionalFormat` |
| `shared/validation/params.ts` | `updatedAtSchema` |
| `shared/format/cnpj.ts` | novo |
| `shared/format/phone.ts`, `date.ts` | `formatPhoneLink`, `formatWhatsAppLink`, `formatYear` |

## Ordem da construção

1. Criar a ramificação `feat/37-company-settings` da `origin/main`, desfazer o vínculo com a `main` e rodar `npx -y npm@11.21.1 ci`.
2. Testes de `tests/validation/` e `tests/format/` (seção "Testes previstos"), conferidos em vermelho, num commit próprio (decisões 0035 e 0052).
3. `optionalFormat`, `updatedAtSchema`, `companySettingsSchema`, `formatCnpj`, os links de telefone e `formatYear`, até os testes passarem.
4. Contrato: `openapi.yaml` e `docs/configuracoes/rotas.md`, antes das rotas (`api.md`).
5. Tipos de `src/shared/api/settings.ts`, repositórios, serviço e rotas.
6. Rodapé.
7. Página, abas e formulário.
8. Documentação das lacunas e README.
9. Verificação local (seção seguinte).
10. Etapa 03: PR e `02_relatorio.md`.

## Critérios de aceitação e verificação

| Critério (Dado, Quando, Então) | Verificação |
|---|---|
| Dado um funcionário com a permissão `settings`, quando altera o telefone e o Instagram e confirma, então o rodapé do portal passa a mostrar os dados novos (UC22, RN028) | Local, com o funcionário de teste de cargo com `settings` e com o admin: em `/admin/settings`, "(82) 3333-4444" e "https://instagram.com/glow", "Salvar alterações": o `PUT` responde 200 com "8233334444", o aviso "Dados da empresa salvos." aparece, e o formulário mostra os valores com a máscara. Em `/`, como visitante, o rodapé mostra "(82) 3333-4444" com o link `tel:+558233334444` e o link "Instagram" para o endereço gravado. Pré-visualização: o mesmo, pelo desenvolvedor |
| Dado um CNPJ com dígito verificador errado ou um e-mail sem domínio, quando confirma, então a mensagem aparece junto ao campo e nada é gravado (UC22 FE01, RN035) | Testes de `companySettingsSchema`. Local: "12.345.678/0001-96" mostra "Informe um CNPJ válido." e "maria@" mostra "Informe um e-mail válido, como maria@email.com." junto aos campos, sem nenhum `PUT` na lista de requisições. Pelo roteiro, o mesmo corpo enviado direto à rota responde 400 `VALIDATION_ERROR` com `fields.cnpj` e `fields.email`, e o `GET` seguinte traz o mesmo `updatedAt` |
| Dado o nome da empresa vazio, quando confirma, então recebe "Preencha este campo." (RN035) | Testes de `companySettingsSchema` (vazio, só espaços e ausente). Local: o campo apagado mostra a mensagem junto a ele; pelo roteiro, 400 com `fields.companyName` |
| Dado duas pessoas editando os dados ao mesmo tempo, quando a segunda confirma, então recebe o aviso de `VERSION_CONFLICT`, e os dados são recarregados (decisão 0009) | Local, com duas páginas abertas na mesma tela: a primeira grava; a segunda grava outro valor e recebe o aviso de L6 no topo, com o foco, e o formulário passa a mostrar o valor da primeira, com o `updatedAt` novo. Pelo roteiro: o `PUT` com o `updatedAt` antigo responde 409 em Problem Details, nada muda no `GET`, e o registro do `next start` tem a linha `warn` com `VERSION_CONFLICT` |
| Dado um funcionário sem a permissão `settings`, quando chama `PUT /api/admin/settings/company`, então recebe 403 (RS008) | Local, pelo roteiro: o funcionário de teste do cargo "Atendimento" (`appointments` e `clients`) recebe 403 `FORBIDDEN` no `PUT` e no `GET`; o cliente de teste também (RS010); sem sessão, 401 `UNAUTHENTICATED`; o `PUT` sem `Origin`, 403 `FORBIDDEN`. Nada é gravado (`updatedAt` igual). Na tela, o funcionário sem a permissão que abre `/admin/settings` volta com o aviso de acesso negado (`proxy.ts`, #26) |
| Dado um visitante, quando abre qualquer página do portal, então o rodapé mostra os dados da empresa; um dado opcional vazio não aparece | Local, como visitante, em `/`, `/login` e `/register`: com os dados do `seed.sql` (só o nome), o rodapé mostra a marca, "Acesso rápido" e o aviso com "Glow – Estética Automotiva", sem "Contato" nem "Redes sociais"; com só o e-mail e o endereço preenchidos no painel, "Contato" com os dois, sem telefone e sem "Redes sociais"; com todos preenchidos, todos; com todos apagados de novo, como no início. Com a rota fora do ar (o `next start` sem o banco), o aviso com "Tentar novamente" no rodapé. Pré-visualização: as mesmas páginas |

Também, pela seção "Interface" de `workflows/procedimentos/testes.md`: `/admin/settings` (formulário carregado, com os erros e com o aviso de sucesso) e `/` e `/login` (rodapé), a 360 × 800 primeiro e a 1440 × 900, nos temas claro e escuro, sem transbordar, pelo teclado (a aba, os campos na ordem, o envio e o foco no aviso) e com o Lighthouse de acessibilidade sem auditoria reprovada. Como o rodapé está em toda página pública, também o Lighthouse de desempenho em `/` e `/login`, no modo celular, com o CLS até 0,1 (RNF006).

### Como a verificação local é feita

- **Banco local.** Docker Desktop, com `/c/Users/yvans/AppData/Local/Programs/DockerDesktop/resources/bin` no `PATH`, `npx supabase start` e `npx supabase db reset`, só com o `seed.sql`. Nunca `--linked` nem `--db-url` (decisão 0043).
- **Contas de teste**, só no banco local: um roteiro no scratchpad cria pelo `auth.admin.createUser` um cliente, um funcionário do cargo "Configurações" (`settings`) e um do cargo "Atendimento" (`appointments` e `clients`), com os cargos gravados pela chave de serviço do banco local; o admin vem do `create-admin.mjs`. As senhas são geradas pelo roteiro, ficam num arquivo do scratchpad e nunca são exibidas.
- **Aplicação.** `npx next build` e `npx next start -p 3037`, com as variáveis do banco local passadas ao processo a partir de `npx supabase status -o env`, sem exibi-las nem gravá-las no repositório. Cada mudança é conferida com um novo build, porque o `next dev` responde 500 nesta máquina.
- **Sessão.** Os roteiros abrem a sessão por `POST /api/auth/login`, com `fetch` do Node e as credenciais do arquivo do scratchpad, e passam os cookies ao navegador; não há rota temporária, porque o login já existe (#26).
- **Rotas**, por um roteiro no scratchpad (`check-company.mjs`): os critérios acima, com os valores dos cookies ocultos.
- **Telas**, num Chrome sem interface controlado pelo `puppeteer-core` que vem com o Lighthouse 13.5.0, porque o painel do navegador do app oculto trava o foco do Base UI (memória do projeto): os critérios de tela, as duas larguras, os dois temas e o teclado.
- **Lighthouse.** `npx -y lighthouse@13.5.0`, acessibilidade, em `/admin/settings`, `/` e `/login`, celular e computador, claro e escuro (`--force-dark-mode`); desempenho em `/` e `/login`, celular. O cookie do painel vai por `--extra-headers`, num arquivo do scratchpad apagado no fim, com os JSON, que guardam o cabeçalho.
- **Verificações automáticas.** `npm run check` sem erros nem avisos, `npx next build` e `npm audit --omit=dev --audit-level=high`.
- **Encerramento.** `next start` encerrado por PID e `npx supabase stop`.
- **Pré-visualização**, passo seu: o Lighthouse e as duas larguras de `/admin/settings` e `/`, com as capturas no PR, e o primeiro critério. Ela usa o banco do Supabase de produção (decisão 0030): a alteração do telefone e do Instagram muda os dados reais da empresa. **Ponto para a sua aprovação:** preencher com os dados reais da empresa, ou gravar os de teste e restaurar os anteriores no próprio painel.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/app/api/public/company/route.ts` | criar |
| `src/app/api/admin/settings/company/route.ts` | criar |
| `src/app/(admin)/admin/settings/page.tsx` | criar |
| `src/components/admin/settings/settings-tabs.tsx`, `company-settings-form.tsx` | criar |
| `src/components/admin/settings/README.md` | alterar: as abas das seções (L2) |
| `src/components/portal/layout/company-footer-info.tsx` | criar |
| `src/components/portal/layout/site-footer.tsx` | alterar |
| `src/server/services/settings.ts` | criar |
| `src/server/repositories/business-settings.ts`, `business-hours.ts` | criar |
| `src/shared/api/settings.ts` | criar |
| `src/shared/validation/settings.ts` | criar |
| `src/shared/validation/formats.ts`, `params.ts` | alterar: `optionalFormat`, `updatedAtSchema` |
| `src/shared/validation/README.md` | alterar: o `updatedAt` em `params.ts` e o dado opcional |
| `src/shared/format/cnpj.ts` | criar |
| `src/shared/format/phone.ts`, `date.ts` | alterar |
| `src/shared/format/README.md` | alterar: o ano e os links de telefone e de WhatsApp |
| `tests/validation/settings.test.ts` | criar |
| `tests/validation/formats.test.ts`, `params.test.ts` | alterar |
| `tests/format/cnpj.test.ts` | criar |
| `tests/format/phone.test.ts`, `date.test.ts` | alterar |
| `tests/format/README.md` | alterar: `cnpj.test.ts` na lista |
| `docs/plataforma/openapi.yaml` | alterar |
| `docs/configuracoes/rotas.md` | alterar: a tela (L2) e as três rotas, com a resposta e os erros |
| `docs/configuracoes/UC22-configurar-dados-da-empresa.md` | alterar: os relacionados (RN035) |
| `docs/padroes/api.md` | alterar (L1, L7) |
| `docs/padroes/layouts.md` | alterar (L3, L4) |
| `docs/padroes/design-midia.md` | alterar (L3) |
| `docs/padroes/componentes.md` | alterar (L1, L5, L6) |
| `docs/padroes/testes.md` | alterar: tabela de casos |
| `docs/plataforma/RN035-formatos-dos-dados.md` | alterar (L1) |
| `docs/plataforma/mensagens-de-validacao.md` | alterar (L6) |
| `src/shared/errors/catalog.ts` | alterar: a mensagem de `VERSION_CONFLICT` (L6) |
| `tests/lib/api-client.test.ts` | alterar: a mensagem de `VERSION_CONFLICT` no caso do 409 (L6) |
| `memoria/tarefas/37-dados-da-empresa/` | `01_plano.md`, `notas.md` e, na etapa 03, `02_relatorio.md` |

Os README de `src/app/api/public/company/`, `src/app/api/admin/settings/company/`, `src/app/(admin)/admin/settings/`, `src/components/portal/layout/`, `src/server/services/`, `src/server/repositories/` e `tests/validation/` já cobrem os arquivos novos e não mudam.

### Em comum com outras tarefas em andamento

- Nenhum PR aberto; a `main` está em 7f8a547.
- **#41** (disponibilidade e formas de pagamento) depende desta: acrescenta as duas abas em `settings-tabs.tsx`, a gravação em `business-hours.ts`, os arquivos de `payment-fees` e as rotas no `openapi.yaml`, nos `settings.ts` de `services/`, `validation/` e `shared/api/`, e usa `updatedAtSchema`, `optionalFormat`, `PanelForbidden` e `VersionConflict`. Começar depois da incorporação desta evita conflito nesses arquivos.
- **#38** (documentos formais): o relatório desta tarefa lista os documentos formais a atualizar (L1, L6 e L7).
- **#48** (página inicial): a seção de localização usa a mesma rota pública; o rodapé já faz uma chamada por página, e a #48 decide se a página reaproveita os dados ou faz a sua.
- As telas do painel com gravação (#39 a #51) seguem L1, L5 e L6.

## Testes previstos

Valores esperados tirados de RN035, de `mensagens-de-validacao.md` e da opção recomendada de L1, L3 e L6. Sem banco, servidor, navegador ou rede (decisões 0035 e 0052).

`tests/validation/formats.test.ts`, `optionalFormat`:

- turns an absent, null, empty or blank optional value into null: `undefined`, `null`, `""` e `"   "` → `null` (L1)
- applies the format to a filled optional value: `optionalFormat(emailSchema)` com " Maria@Email.COM " → "maria@email.com"
- rejects a filled optional value with the message of its format: "maria@" → "Informe um e-mail válido, como maria@email.com."

`tests/validation/params.test.ts`, `updatedAtSchema`:

- accepts the updatedAt as the database sends it: "2026-10-20T13:45:12.345678+00:00" → o mesmo texto
- rejects an absent or malformed updatedAt: ausente, "", "20/10/2026" e "abc" → "Atualize a página e tente novamente." (L6)

`tests/validation/settings.test.ts`, `companySettingsSchema`:

- normalizes every field of the company data: "  Glow   Estética " → "Glow Estética"; "12.abc.345/01de-35" → "12ABC34501DE35"; " Contato@Glow.COM " → "contato@glow.com"; "(82) 3333-4444" → "8233334444"; "(82) 99999-8888" → "82999998888"; "https://instagram.com/glow" e "https://www.facebook.com/glow" como vieram; o endereço sem os espaços repetidos (RN035)
- accepts the company name alone, with every optional field empty: os sete opcionais vazios, `null` ou ausentes → `null` (RN035, Dados da empresa; L1)
- requires the company name: "", "   " e ausente → "Preencha este campo." (critério da issue)
- rejects a company name over 100 characters → "Use até 100 caracteres."
- rejects a CNPJ with a wrong check digit: "12.345.678/0001-96" → "Informe um CNPJ válido." (UC22 FE01)
- rejects an e-mail without a domain: "maria@" e "maria@email" → "Informe um e-mail válido, como maria@email.com." (UC22 FE01)
- rejects a landline as the WhatsApp: "(82) 3333-4444" → "Informe um celular com DDD, como (82) 99999-8888."
- rejects an Instagram address on another site: "https://glow.com/instagram" → "Informe o endereço do perfil no Instagram, começando por https://."
- rejects an address over 200 characters → "Use até 200 caracteres."
- requires the updatedAt: ausente → "Atualize a página e tente novamente."
- discards unknown fields: `id` e `createdAt` no corpo não aparecem no resultado (RS013)

`tests/format/cnpj.test.ts`:

- formats a CNPJ with the mask: "12345678000195" → "12.345.678/0001-95" (RN035)
- formats an alphanumeric CNPJ in upper case: "12abc34501de35" → "12.ABC.345/01DE-35"
- formats a CNPJ while it is typed: "12" → "12"; "123" → "12.3"; "123456" → "12.345.6"; "123456789" → "12.345.678/9"; "1234567800019" → "12.345.678/0001-9"
- keeps a formatted CNPJ as it is: "12.345.678/0001-95" → o mesmo
- keeps only letters and digits, up to fourteen: "12.345.678/0001-9512" → "12.345.678/0001-95"; "" → ""

`tests/format/phone.test.ts`, novos casos:

- links a phone for calling: "8233334444" → "tel:+558233334444"; "82999998888" → "tel:+5582999998888"
- links the WhatsApp to a chat: "82999998888" → "https://wa.me/5582999998888" (L3)

`tests/format/date.test.ts`, novos casos:

- formats the year of an instant in the company's time zone: "2026-10-15T12:30:00Z" → "2026"
- uses the company's year near the new year: "2027-01-01T02:30:00Z" → "2026"; "2027-01-01T03:00:00Z" → "2027"

Rotas, serviço, repositórios, rodapé e página são conferidos à mão, como na seção anterior (decisão 0052).

## Documentação

Além dos textos das lacunas:

- `docs/configuracoes/rotas.md`:
  - `GET /api/public/company`, Resposta: "**200** `companyName`, `email`, `phone`, `whatsapp`, `address`, `instagramUrl`, `facebookUrl` e `businessHours`, com os sete dias de domingo (0) a sábado (6): `weekday`, `isOpen`, `opensAt`, `closesAt`, `breakStartsAt` e `breakEndsAt`. Dado opcional vazio é `null`; o CNPJ não é público.";
  - `GET /api/admin/settings/company`, Resposta: "**200** `companyName`, `cnpj`, `email`, `phone`, `address`, `instagramUrl`, `facebookUrl`, `whatsapp` e `updatedAt`.";
  - `PUT /api/admin/settings/company`, Entrada: "`companyName*, cnpj, email, phone, address, instagramUrl, facebookUrl, whatsapp, updatedAt*`; o opcional ausente, `null` ou vazio apaga o valor gravado." Resposta: "**200** o corpo do `GET`, com o `updatedAt` novo; 400 campo fora de RN035; 409 `VERSION_CONFLICT`."
- `docs/configuracoes/UC22-configurar-dados-da-empresa.md`: `regras: [RN028, RN035]` e RN035 em "Relacionados", porque o FE01 aplica os formatos dela.
- `docs/padroes/testes.md`, tabela de casos:
  - "Validação e formatos": acrescentar "dado opcional vazio, versão do registro (`updatedAt`)";
  - "Formatação": acrescentar "CNPJ durante a digitação e alfanumérico; links de telefone e de WhatsApp; ano no fuso da empresa".
- README:
  - `src/components/admin/settings/`: "Formulários de dados da empresa, disponibilidade por dia (com pausa) e percentuais das formas de pagamento." passa a "Abas das seções de `/admin/settings` (`settings-tabs.tsx`) e os formulários de dados da empresa, disponibilidade por dia (com pausa) e percentuais das formas de pagamento, um por aba.";
  - `src/shared/validation/`: "`params.ts`, o id do caminho e a paginação" passa a "`params.ts`, o id do caminho, a paginação e o `updatedAt` das gravações"; e "`optionalFormat` torna opcional qualquer formato: vazio vira `null`";
  - `src/shared/format/`: depois de "data `dd/mm/aaaa`, horário e duração", acrescentar "o ano do aviso de direitos e os links de telefone (`tel:`) e de WhatsApp";
  - `tests/format/`: a lista ganha `cnpj.test.ts`.

## Lacunas na documentação

Cada lacuna traz o problema, as opções com a consequência de cada uma e o texto que entra na documentação. Marque com `x` a opção escolhida. O texto proposto corresponde à opção recomendada; se você escolher outra, ele é refeito antes da construção.

### L1. Dado opcional vazio na API e na tela

**Problema.** RN035 lista os opcionais dos dados da empresa (CNPJ, e-mail, telefone, endereço, Instagram, Facebook e WhatsApp), e `codigo.md` diz que "ausência é `null` explícito". Nada diz como a API recebe o opcional vazio (`null`, ausente ou `""`), se o vazio apaga o que estava gravado, nem como a tela marca o campo opcional. Os esquemas de `formats.ts` recusam o vazio com "Preencha este campo.". Esta é a primeira tela com opcionais; a descrição do cargo ocupado (#43) e outras vêm depois.

**Opções:**

- [X] **1. Ausente, `null` ou vazio viram `null`; o vazio apaga; o rótulo diz "(opcional)" (recomendada).** O formulário manda o texto vazio, e o esquema o converte em `null`, o mesmo que a rota grava e devolve; o texto só de espaços também, porque a normalização de RN035 o esvazia. Como o `PUT` substitui a configuração, apagar um campo e salvar remove o dado. Na tela, o campo opcional tem "(opcional)" no rótulo, como no wireframe, porque quase todos os campos da tela são opcionais.
- [ ] **2. Só `null` ou ausente na API; o formulário troca o vazio por `null` antes de enviar.** O contrato fica mais estrito, mas o esquema compartilhado com o formulário teria de aceitar o vazio de qualquer jeito, e cada formulário faria a troca.
- [ ] **3. O vazio é gravado como texto vazio.** Contraria `codigo.md` e obriga cada leitura a tratar dois tipos de ausência.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Validação, novo item depois de "Campos não previstos são descartados...": "Dado opcional ausente, `null` ou vazio depois da normalização de RN035 é gravado e devolvido como `null`; no `PUT` e no `PATCH`, enviá-lo vazio apaga o valor gravado. Toda resposta traz o campo opcional, com `null` quando vazio."
- `docs/plataforma/RN035-formatos-dos-dados.md`, depois de "Um cadastro só é gravado quando todas as obrigatórias estão presentes e válidas.": "Uma opcional deixada vazia fica sem valor, e o valor que estava gravado é apagado."
- `docs/padroes/componentes.md`, nova seção "Formulários", primeiro item: "O rótulo do campo opcional termina em '(opcional)', e o obrigatório não tem marca. O valor `null` da API aparece como campo vazio, e o campo vazio vai como texto vazio, que o esquema converte em `null`."
- Documento formal a atualizar no relatório: Documentação de Análise do Sistema, Quadro 20 (RN035).

### L2. Disposição de `/admin/settings`

**Problema.** `rotas.md` tem uma tela só, `/admin/settings`, com empresa, disponibilidade e formas de pagamento, e o UC22 diz que o sistema "exibe as opções" e o funcionário "seleciona as configurações da empresa". O wireframe `adminPainelConfs` mostra uma página de cartões que leva a uma subpágina por seção, com "‹ Configurações" para voltar. A issue pede "o lugar das seções" da #41.

**Opções:**

- [X] **1. Abas na própria página (recomendada).** "Empresa" agora; a #41 acrescenta "Disponibilidade" e "Formas de pagamento". Uma rota só, como `rotas.md`; as abas são a seleção do UC22, com o componente `tabs` da #35 e a navegação por setas do Base UI. A aba escolhida fica no componente: recarregar volta a "Empresa". Os painéis ficam montados, então trocar de aba não perde o que foi digitado, e cada aba grava só a sua seção. Até a #41, a lista tem uma aba só. A 360 px, as três abas da #41 podem não caber na largura: a lista rola na horizontal, conferido na #41.
- [ ] **2. Seções empilhadas.** As três seções, cada uma com o seu formulário e o seu botão, uma abaixo da outra. Sem estado de aba, mas a página fica longa no celular, e não há a seleção do UC22.
- [ ] **3. Subpáginas, como o wireframe.** `/admin/settings` com três cartões e `/admin/settings/company`, `/business-hours` e `/payment-fees`. Cada seção tem o seu endereço, mas entram três telas novas em `rotas.md`, com pastas e README, e até a #41 a página de opções tem um cartão só.

**Texto proposto (opção 1):**

- `docs/configuracoes/rotas.md`, Telas, linha de `/admin/settings`: "Configurações: empresa, disponibilidade e formas de pagamento" passa a "Configurações, em abas: Empresa, Disponibilidade e Formas de pagamento".
- `docs/configuracoes/rotas.md`, depois da tabela de telas: "A aba escolhida fica na página, sem mudar o endereço, e começa em Empresa. Trocar de aba mantém o que foi digitado nas outras; cada aba grava só a sua seção."
- `src/components/admin/settings/README.md`: o texto da seção "Documentação".

### L3. Conteúdo do rodapé

**Problema.** `layouts.md` diz que contato, endereço, redes sociais e o nome da empresa no aviso de direitos vêm de `GET /api/public/company` e "entram com essa rota, na tarefa do UC01"; a issue os traz para esta tarefa. Nada diz o texto do aviso de direitos, como o telefone, o e-mail e o WhatsApp viram links, nem como as redes sociais aparecem: o wireframe usa ícones de marca, e o Lucide 1.59, a única biblioteca de ícones (`design-midia.md`), não tem os do Instagram, do Facebook nem do WhatsApp (conferido no pacote).

**Opções:**

- [X] **1. Links de texto, com o aviso "© ano nome. Todos os direitos reservados." (recomendada).** Blocos "Contato" (endereço, telefone em `tel:` e e-mail em `mailto:`, com os ícones `MapPin`, `Phone` e `Mail` do Lucide) e "Redes sociais" (links de texto "Instagram", "Facebook" e "WhatsApp", este para `https://wa.me/55` mais o número), ao lado de "Acesso rápido". O aviso usa o nome gravado e o ano no fuso da empresa. Os links abrem na mesma aba, sem aviso de nova janela. Sem dependência e sem desenho de marca no código.
- [ ] **2. Ícones de marca em SVG no código**, de um conjunto livre como o Simple Icons. Fica como o wireframe, mas é outra fonte de ícones, contra `design-midia.md`, cada ícone precisa de rótulo, e o uso das marcas segue as regras de cada empresa.
- [ ] **3. Ícones genéricos do Lucide** (como `MessageCircle` para o WhatsApp). A marca não fica reconhecível, e o rótulo continua necessário.

**Texto proposto (opção 1):**

- `docs/padroes/layouts.md`, Portal, item "Rodapé": "Rodapé: a marca e 'Acesso rápido' (Serviços e Agendar). Contato, endereço, redes sociais e o nome da empresa no aviso de direitos vêm de `GET /api/public/company` (RN028) e entram com essa rota, na tarefa do UC01." passa a "Rodapé: a marca; 'Contato', com o endereço, o telefone (link `tel:`) e o e-mail (link `mailto:`); 'Redes sociais', com os links de texto Instagram, Facebook e WhatsApp (`https://wa.me/55` e o número); e 'Acesso rápido' (Serviços e Agendar). Abaixo, '© <ano> <nome da empresa>. Todos os direitos reservados.', com o ano no fuso da empresa. Os dados vêm de `GET /api/public/company` (RN028); o dado vazio não aparece, nem o bloco sem nenhum dado. Os links abrem na mesma aba."
- `docs/padroes/design-midia.md`, Ícones, novo item: "O Lucide não tem ícones de marca: as redes sociais aparecem como links de texto."

### L4. Rodapé enquanto carrega e na falha

**Problema.** O UC01 FE02 diz que, na falha ao carregar os dados da página inicial, que incluem o rodapé (passo 2), "o sistema exibe mensagem de erro e permite nova tentativa". O rodapé está em toda página do portal, e `layouts.md` não diz o que ele mostra enquanto a rota responde nem quando ela falha. O RN028 impede um nome ou um contato fixo no código como reserva.

**Opções:**

- [X] **1. Lugar reservado na carga; na falha, o aviso com "Tentar novamente" (recomendada).** Enquanto carrega, as linhas de contato e do aviso de direitos ficam reservadas, sem deslocar a página (RNF006). Na falha, o `Alert` com a mensagem do `ApiError` e "Tentar novamente" ocupa o lugar de "Contato" e "Redes sociais", como a listagem (`componentes.md`); a marca e "Acesso rápido" continuam, e o aviso de direitos sai, porque precisa do nome gravado. Segue o UC01 FE02.
- [ ] **2. Na falha, o rodapé só com a marca e "Acesso rápido", sem aviso.** Mais discreto, mas contraria o UC01 FE02, e quem precisa do contato não sabe que houve falha.

**Texto proposto (opção 1):**

- `docs/padroes/layouts.md`, Portal, depois do item "Rodapé": "Enquanto os dados da empresa carregam, as linhas de contato e do aviso de direitos ficam reservadas. Na falha, o aviso com a mensagem e 'Tentar novamente' fica no lugar de 'Contato' e 'Redes sociais', e o aviso de direitos não aparece (UC01 FE02)."

### L5. Aviso de sucesso do formulário que continua na tela

**Problema.** `frontend.md` pede "ao final, aviso de sucesso ou falha (RNF004)", e a L13 da #25 deixou o aviso flutuante para "a primeira tela que precisar dele". Até aqui, todo formulário mudava de página no sucesso. O de configurações continua na tela depois de gravar, e nada diz onde nem como o sucesso aparece.

**Opções:**

- [X] **1. Aviso no topo do formulário, como status (recomendada).** O mesmo lugar do aviso de falha, com o `Alert` da variante padrão, o ícone `CircleCheck` e o texto "Dados da empresa salvos.", em `role="status"`, que o leitor de tela anuncia sem tirar o foco do botão. Some na próxima alteração de um campo ou no próximo envio. Sem dependência nova, perto do formulário (RNF003).
- [ ] **2. Aviso flutuante (toast).** Entra o componente `sonner` do shadcn, uma dependência nova, e a mensagem aparece longe do formulário.

**Texto proposto (opção 1):**

- `docs/padroes/componentes.md`, seção "Formulários", segundo item: "No formulário que continua na tela depois de gravar, como os das configurações, o sucesso aparece no topo do formulário, no lugar do aviso de falha, como status (`role="status"`), com o ícone e o texto, como 'Dados da empresa salvos.'. Some na próxima alteração ou no próximo envio."
- `src/components/ui/README.md` não muda: o aviso flutuante continua para quando uma tela precisar dele.

### L6. Conflito de versão na tela

**Problema.** `frontend.md` diz que, no 409 `VERSION_CONFLICT`, "a tela de edição mostra o aviso e recarrega o registro", mas a mensagem do catálogo é "Estes dados foram alterados por outra pessoa. Atualize a página e tente novamente.": a tela já recarregou, então "atualize a página" pede o que já aconteceu. Também falta a mensagem do `updatedAt` ausente ou fora do formato, que não é campo da tela; sem ela, o Zod responderia em inglês.

**Opções:**

- [X] **1. Mensagem que pede a conferência dos dados recarregados (recomendada).** `VERSION_CONFLICT` passa a "Estes dados foram alterados por outra pessoa. Confira os dados atualizados e tente novamente.". A tela mostra o aviso no topo, com o foco, e troca o que foi digitado pelos dados atuais. O `updatedAt` ausente ou fora do formato responde 400 com "Atualize a página e tente novamente." em `fields.updatedAt`, o que só acontece com uma tela desatualizada.
- [ ] **2. Manter a mensagem do catálogo.** Nada muda no catálogo, mas a mensagem pede para atualizar uma página que já foi atualizada.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Erros, linha de `VERSION_CONFLICT`: "Estes dados foram alterados por outra pessoa. Atualize a página e tente novamente." passa a "Estes dados foram alterados por outra pessoa. Confira os dados atualizados e tente novamente."; a mesma mensagem em `src/shared/errors/catalog.ts` e no caso do 409 de `tests/lib/api-client.test.ts`, que hoje fixa a mensagem antiga.
- `docs/plataforma/mensagens-de-validacao.md`, nova linha antes de "`page` e `pageSize`": "| Versão do registro (`updatedAt`) ausente ou fora do formato | Atualize a página e tente novamente. |".
- `docs/padroes/componentes.md`, seção "Formulários", terceiro item: "No 409 `VERSION_CONFLICT`, o aviso fica no topo, com o foco, e o formulário recarrega o registro, trocando o que foi digitado pelos dados atuais."
- Documento formal a atualizar no relatório: Documentação de Arquitetura de Software, se o catálogo de erros estiver nela.

### L7. Formato do horário do dia na API

**Problema.** `api.md` diz "datas e horários ISO 8601 com fuso". O horário de funcionamento é um horário do dia que se repete toda semana, sem data, e um deslocamento nele não tem sentido. A rota pública devolve os horários dos sete dias, e a #41 os recebe no `PUT` de disponibilidade. O `halfHourTimeSchema` (#21) e o `BusinessDay` das regras (#36) já usam `HH:MM`, e o PostgreSQL devolve o tipo `time` como `08:00:00`.

**Opções:**

- [X] **1. `HH:MM`, no fuso da empresa, sem data nem deslocamento (recomendada).** O mesmo formato na entrada, na saída e nas regras; o repositório tira os segundos do `time`.
- [ ] **2. `HH:MM:SS`, como o banco devolve.** Sem conversão na leitura, mas diferente da entrada (`halfHourTimeSchema`) e das regras.
- [ ] **3. Com deslocamento (`08:00-03:00`).** Segue o texto atual, mas o deslocamento não se aplica a um horário recorrente, e as regras teriam de removê-lo.

**Texto proposto (opção 1):**

- `docs/padroes/api.md`, Desenho: "JSON em `camelCase`; datas e horários ISO 8601 com fuso; dinheiro como número com duas casas." passa a "JSON em `camelCase`; datas e horários ISO 8601 com fuso; horário do dia, como o de funcionamento, em `HH:MM`, no fuso da empresa, sem data nem deslocamento; dinheiro como número com duas casas."
- Documento formal a atualizar no relatório: Documentação de Arquitetura de Software, convenções da API.

## Decisões técnicas

Nenhuma nova.

- Seguidas:
  - 0003, 0005 e 0006: rota, serviço e repositório, com a permissão conferida na API e o `supabase-js`;
  - 0042: a leitura e a gravação pela chave de serviço, também na rota pública;
  - 0008: um esquema para a rota e o formulário, com as mensagens de `src/shared`;
  - 0009: `updatedAt` conferido na própria gravação, numa instrução só;
  - 0017: código em inglês, interface em português;
  - 0025: Problem Details, com as respostas reutilizáveis na especificação;
  - 0026: as rotas são novas, sem mudar contrato existente;
  - 0035 e 0052: testes antes do código nos esquemas e nos formatos; rotas, telas e rodapé à mão;
  - 0036: pastas;
  - 0041: wireframe só como esqueleto (descrição e endereço em partes ficam de fora);
  - 0049: `Field` com `Controller` e `zodResolver`; `tabs` da #35;
  - 0051: o `proxy.ts` já protege `/admin/settings` pela permissão `settings`;
  - 0053: o ano do aviso de direitos no fuso da empresa.

Escolhas locais, sem registro:

- Dois repositórios, `business-settings.ts` e `business-hours.ts`, um por tabela, para a #41 mexer só no segundo.
- `optionalFormat` em `formats.ts` e `updatedAtSchema` em `params.ts`, porque valem para outros módulos.
- A rota pública sem o CNPJ e sem o `updatedAt`.
- O rodapé de servidor com uma parte de cliente, que busca os dados (`frontend.md`, Renderização).
- `autoComplete="off"` nos campos da empresa; o WhatsApp no grupo "Redes sociais"; o endereço num campo só (`dados.md`).
- O `updatedAt` nos valores do formulário, sem campo na tela.
- Os links de telefone e de WhatsApp e o ano em `src/shared/format/`, com teste.
- A linha única ausente como 500, não 404.

## Riscos e dúvidas

- **Comparação do `updated_at`.** O `supabase-js` leva o valor na consulta (`updated_at=eq.2026-10-20T13:45:12.345678+00:00`); o `+` do deslocamento precisa chegar codificado, senão vira espaço e toda gravação daria conflito. O roteiro confere a gravação com o valor lido e o 409 com o antigo.
- **Uma aba só até a #41.** A lista de abas com "Empresa" sozinha parece incompleta até a #41 ser incorporada; as duas são da fase 2.
- **Deslocamento do rodapé.** O rodapé busca os dados depois da carga. Nas páginas curtas, como `/login` a 1440 × 900, ele aparece na tela, e a diferença entre o lugar reservado e o conteúdo pode deslocar o aviso de direitos; o Lighthouse de desempenho confere o CLS.
- **Uma chamada por página.** Toda carga completa de página do portal chama a rota pública (`Cache-Control: no-store`, `api.md`); a navegação entre páginas não, porque o layout fica montado.
- **Pré-visualização e dados reais** (seção "Como a verificação local é feita"): **ponto para a sua aprovação**.
- **Tamanho do PR.** Estimativa de 650 a 750 linhas em `src/` (formulário com cerca de 220, rodapé 120, repositórios 110, serviço e rotas 80, esquemas e formatos 80, tipos e abas 80), mais cerca de 250 de `openapi.yaml`, 250 de testes e 100 de documentação, acima das ~400 de `workflows/procedimentos/pull-request.md`. **Ponto para a sua aprovação:**
  - [X] **1. Um PR, com commits separados (recomendada),** como a #35 e a #36: testes, esquemas e formatos, contrato, backend, rodapé, página e documentação.
  - [ ] **2. Dois PRs:** o primeiro com os esquemas, as rotas, a especificação e o rodapé (`Refs #37`); o segundo com a página de configurações (`Closes #37`), revisado depois do primeiro.
- **Outros pontos para a sua aprovação**, como nas tarefas anteriores: as chaves do banco local no `next start`; as contas de teste no banco local; o cookie de teste no Lighthouse.

## Fora do escopo

- Disponibilidade e formas de pagamento: as abas, as rotas `business-hours` e `payment-fees`, a gravação e os percentuais (#41). A rota pública desta tarefa já devolve a disponibilidade, só para leitura.
- A página inicial, com a seção de localização e os horários (#48).
- CNPJ no rodapé ou em outra página pública.
- Descrição da empresa, endereço em partes (logradouro, bairro, cidade, estado, CEP), mapa e "Como chegar" do wireframe, sem requisito em `docs/`.
- Termos de uso e política de privacidade no rodapé.
- Ícones de marca das redes sociais (L3, opção 2) e aviso flutuante (L5, opção 2).
- Testes automatizados de rotas, serviços, repositórios e componentes (decisão 0052).

## Estado da construção

Feito dentro do plano aprovado, na ramificação `feat/37-company-settings` (commits e84249b a db14c53): testes em vermelho, esquemas e formatos, contrato, backend, rodapé, página, mensagem de `VERSION_CONFLICT`, documentação das lacunas e as duas correções achadas na verificação (o opcional ausente do corpo e o painel da aba na ordem do Tab). Nenhum arquivo fora da lista do plano. `npm run check` aprovado, com 371 testes; verificação local aprovada, com o resultado em `notas.md`. Relatório em `02_relatorio.md`.
