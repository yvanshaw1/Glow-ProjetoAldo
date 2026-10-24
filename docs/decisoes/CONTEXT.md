# docs/decisoes/ – Registros de decisão

Escolhas técnicas e de processo do projeto, uma por arquivo, numeradas e nunca reescritas. Antes de propor uma escolha técnica, procure aqui se ela já foi decidida ou descartada.

- Quando registrar, como propor e como gravar: `workflows/procedimentos/decisao.md`.
- Decisão nova: próximo número livre, molde `_templates/decisao.md`, linha nova nesta tabela.
- Decisão que muda outra: registro novo com `substitui: NNNN`; no antigo, só a linha `status:` passa a `substituída por NNNN`, e o título dele aqui ganha "(substituída por NNNN)".

| Nº | Decisão |
|---|---|
| [0001](0001-aplicacao-unica-nextjs.md) | Uma única aplicação Next.js para portal, painel e API |
| [0002](0002-api-em-rotas-do-nextjs.md) | API em rotas do próprio Next.js |
| [0003](0003-backend-em-camadas.md) | Backend em camadas de rota, serviço e repositório |
| [0004](0004-supabase.md) | Supabase para banco, autenticação e arquivos |
| [0005](0005-autorizacao-na-api.md) | Autorização na API, com o banco fechado ao navegador |
| [0006](0006-supabase-js-e-migration-sql.md) | Acesso a dados com supabase-js e uma migration em SQL |
| [0007](0007-tailwind-e-shadcn.md) | Tailwind CSS com shadcn/ui |
| [0008](0008-validacao-compartilhada.md) | Validação, formatação e mensagens compartilhadas em src/shared |
| [0009](0009-concorrencia-otimista.md) | Controle de concorrência otimista por updated_at |
| [0010](0010-permissoes-por-pagina.md) | Permissões fixas, uma por página do painel |
| [0011](0011-copia-no-agendamento.md) | Cópia dos dados no agendamento |
| [0012](0012-permissoes-como-enum.md) | Permissões como tipo enumerado |
| [0013](0013-porte-calculado-pelo-banco.md) | Porte calculado pelo banco a partir do tipo |
| [0014](0014-sem-controle-de-capacidade.md) | Sem controle de capacidade e de conflito de horários |
| [0015](0015-sem-envio-de-emails.md) | Sem envio de e-mails |
| [0016](0016-tentativas-de-login-no-banco.md) | Controle de tentativas de login em tabela do banco |
| [0017](0017-codigo-em-ingles.md) | Todo o código em inglês, com a interface em português |
| [0018](0018-placa-unica.md) | Placa única, com vínculo entre clientes e veículos |
| [0019](0019-login-unico.md) | Página de login única |
| [0020](0020-tabelas-separadas-de-contas.md) | Tabelas separadas para clientes e para funcionários |
| [0021](0021-valores-calculados-na-edicao.md) | Edição de agendamento com valores sempre calculados pelo sistema |
| [0022](0022-exclusao-logica.md) | Exclusão lógica de clientes e de serviços |
| [0023](0023-typescript-6-e-node-24.md) | TypeScript 6.0 e Node.js 24 LTS |
| [0024](0024-testes-das-regras-de-negocio.md) | Testes automatizados apenas das regras de negócio (substituída por 0045) |
| [0025](0025-erros-rfc-9457.md) | Erros no formato Problem Details (RFC 9457) |
| [0026](0026-api-sem-versao.md) | API sem versão no caminho, com mudanças aditivas |
| [0027](0027-react-hook-form.md) | Formulários com React Hook Form |
| [0028](0028-prettier.md) | Formatação automática com Prettier |
| [0029](0029-registro-estruturado.md) | Registro estruturado na saída padrão, consultado na Vercel |
| [0030](0030-planos-gratuitos.md) | Vercel e Supabase em plano gratuito, sem domínio próprio |
| [0031](0031-estrutura-icm.md) | Orientação da IA pela estrutura de pastas da ICM |
| [0032](0032-proxy-ts.md) | Proteção das páginas em src/proxy.ts |
| [0033](0033-atualizacao-por-merge.md) | Atualização das ramificações por merge, sem rebase |
| [0034](0034-incorporacao-por-squash.md) | Incorporação por squash, com Closes #N |
| [0035](0035-tdd-nas-regras.md) | TDD nas regras de negócio e nos esquemas de validação |
| [0036](0036-organizacao-das-pastas.md) | Organização das pastas do código |
| [0037](0037-eslint-9.md) | ESLint 9 com a configuração do Next.js |
| [0038](0038-execucao-em-conteiner.md) | Docker para executar a aplicação em contêiner |
| [0039](0039-tarefas-de-ponta-a-ponta.md) | Tarefas de ponta a ponta, sem dono por área |
| [0040](0040-documentos-formais-versionados.md) | Documentos formais versionados em documentos-formais/ |
| [0041](0041-wireframes-de-referencia.md) | Wireframes de referência versionados em wireframes/ |
| [0042](0042-banco-sem-privilegios-publicos.md) | Banco sem privilégios para as chaves públicas |
| [0043](0043-cli-e-banco-local-do-supabase.md) | CLI do Supabase fixada no projeto e banco local para conferir as migrations |
| [0044](0044-preparacao-sem-painel.md) | Preparação do Supabase sem configuração manual no painel |
| [0045](0045-testes-do-tratamento-unico.md) | Testes automatizados das regras, dos esquemas e do tratamento único das requisições (substituída por 0050) |
| [0046](0046-sessao-conferida-no-supabase-auth.md) | Sessão conferida no Supabase Auth a cada requisição |
| [0047](0047-tentativa-de-login-reservada.md) | Tentativa de login reservada por função SQL antes de conferir a senha |
| [0048](0048-senha-atual-conferida-por-nova-entrada.md) | Senha atual conferida por nova entrada no Supabase Auth, que renova a sessão do navegador |
| [0049](0049-shadcn-sobre-base-ui.md) | shadcn/ui sobre Base UI, com os pacotes só de CSS em devDependencies |
| [0050](0050-testes-do-cliente-da-api.md) | Testes automatizados das regras, dos esquemas, do tratamento único e do cliente da API (substituída por 0052) |
| [0051](0051-protecao-das-paginas-no-proxy.md) | Proteção das páginas com a sessão e a conta conferidas no proxy.ts, que também decide o destino depois do login |
| [0052](0052-testes-da-formatacao-e-da-protecao-das-paginas.md) | Testes automatizados das regras, dos esquemas, do tratamento único, do cliente da API, da formatação e da proteção das páginas |
| [0053](0053-fuso-da-empresa-como-constante.md) | Fuso da empresa como constante compartilhada, sem variável de ambiente |
| [0054](0054-analise-por-ia-no-groq.md) | Análise do dashboard por um modelo de linguagem do Groq em plano gratuito, chamado pelo servidor no formato Chat Completions |
| [0055](0055-telas-de-demonstracao.md) | Telas construídas antes das rotas, com dados de demonstração respondidos pelo cliente da API |
| [0056](0056-recharts-nos-graficos-do-dashboard.md) | Gráficos do dashboard com o Recharts, carregado sob demanda |
