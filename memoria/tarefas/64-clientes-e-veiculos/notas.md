# Notas: 64-clientes-e-veiculos

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-24 – descoberta: dependências conferidas

A #64 é a T8 de `memoria/tarefas/66-analise-por-ia/proposta-das-issues.md` e depende só da #56, incorporada. `origin/main` e a ramificação da sessão (`claude/magical-meninsky-0318ac`, worktree `36-regras-do-agendamento-05611e`, nome herdado e não renomeável) em a4adcfe (#95, a #63), árvore limpa; nenhum PR aberto. As rotas (#42 e #45) estão abertas e sem código. Plano e notas sem commit, como nas etapas 01 anteriores.

## 2026-10-24 – descoberta: notas de passagem lidas

Lidos o plano, as notas e o relatório da #63 e as notas da #61 (`side-session-notes/local_c7eddc37-…`, dados de outra sessão): janelas sempre montadas com o gatilho `hidden`, `FormAlert` no topo com o foco, `aria-label` nos `combobox`, e as armadilhas da verificação (heredoc com apóstrofo, `$$` em `String.replace`, `puppeteer click()` fora da tela, `triple click` em `input[type=search]`, espaço não separável em `formatCurrency`, `next build` com patch quebrado). Os roteiros de `61-scripts-de-verificacao/` não foram copiados nesta etapa; a etapa 02 os recria no scratchpad (`browser.mjs`, `make-admin.mjs`, `make-cookie.mjs`, `lh-*`, `patch-*`), com os caminhos deste worktree, e gera um `admin.json` novo.

## 2026-10-24 – descoberta: código e dados reaproveitáveis

- `src/lib/demo/clients.ts` só tem o perfil do Henrique Costa e `vehicles.ts` só os veículos dele, mais os 14 do seed para a consulta de placa. Os 13 clientes (ids do seed) e os ids dos veículos estão em `admin-appointments.ts` (`CLIENTS` e `ACCOUNTS`), sem exportação; o plano os move para `clients.ts` e `vehicles.ts` e faz `admin-appointments.ts` importá-los.
- Os diálogos de cadastro e edição de veículo do portal (`portal/vehicles/`) têm `/api/me/vehicles` fixo; o plano propõe movê-los para `shared/` e parametrizar os endereços (P3), o que toca `/profile` e `/booking`.
- O catálogo de erros já tem `EMAIL_IN_USE`, `PLATE_IN_USE` e `VEHICLE_ALREADY_LINKED`; `EMAIL_IN_USE` tem o texto do cadastro público (L4).

## 2026-10-24 – descoberta: wireframes

PDFs de `staffPages/clientsManagment/` abertos no painel do navegador (`file:///…pdf`): a listagem do celular, legível (título "Clientes", busca "Buscar por nome ou e-mail…", contagem "26 clientes", "Criar cliente", linhas com avatar de iniciais, nome, e-mail e "Ver"), e os dois modais "Novo cliente" só como miniatura (a visualização estática do painel não rolou o PDF): janela curta com poucos campos e "Cancelar" e o botão de criar. A listagem de desktop não foi aberta (mesmo esqueleto, em tabela). Não há wireframe dos detalhes, da edição nem dos veículos; o conteúdo vem de `docs/clientes/`.

## 2026-10-24 – descoberta: lacunas e contradições

- Nenhum módulo define textos, linha da lista, detalhes, formulários e estados; `rotas.md` só tem `/admin/clients`, então os detalhes só podem ser janela (L1).
- As leituras de `rotas.md` não têm campos, e a consulta de placa do painel devolve "resposta vazia" enquanto a do portal devolve `null` (L2).
- O termo "silva" do critério de aceitação não existe no `seed-demo.sql` (L3).
- A mensagem de `EMAIL_IN_USE` é a do cadastro público, que não confirma que o e-mail existe, e UC16 FE02 diz que o sistema informa que já existe um cliente (L4).

## 2026-10-24 – decisão: plano gravado em aguardando_aprovacao

`01_plano.md` com as lacunas L1 a L4 e os pontos P1 a P4 (opção recomendada primeiro: três PRs, ambiente como nas tarefas anteriores, diálogos de veículo movidos e parametrizados, produção logada como passo do Yvan). Nenhum teste automatizado novo (decisão 0052), nenhuma dependência nova e nenhuma decisão técnica nova. A etapa 02 só começa quando o Yvan gravar `aprovado` no arquivo e eu conferir o status e as caixas.

## 2026-10-24 – decisão: plano aprovado

O Yvan gravou `status: aprovado` em 24/10/2026, com a opção 1 em L1 a L4, P1, P2 e P3 (caixas `[x]`; o P4 é só aviso). Conferido no arquivo antes da etapa 02; o `status` passou a `em_execucao`, sem tocar em `aprovado_por` nem em `aprovado_em`.

## 2026-10-24 – desvio: arquivo fora da lista do plano

Entrou `src/components/portal/vehicles/vehicle-paths.ts` (`PORTAL_VEHICLES_PATH` e `PORTAL_ADD_VEHICLE_PROPS`), para os três pontos do portal que usam os diálogos de veículo movidos passarem os endereços sem repetir texto. Está na lista do plano para o Yvan confirmar. `src/shared/api/vehicles.ts` não precisou mudar, e o tipo do cliente do painel é um só, `AdminClient` (lista e detalhe têm os mesmos campos em `rotas.md`), em vez de dois.

## 2026-10-24 – descoberta: React Hook Form com `mode: "onTouched"`

No formulário de cliente, com `mode: "onTouched"`, o primeiro envio só indicava o primeiro campo vazio (o e-mail); o segundo indicava todos. Sem o `mode` (validação no envio, revalidação na alteração) todos aparecem no primeiro envio. A janela de categoria da #63 usa `onTouched` com dois campos; vale conferir se o mesmo ocorre lá. Também: `reset` com os campos ainda não montados pode descartar a validação; a janela reabre com os dados do cliente porque o `reset` vem ao fechar.

## 2026-10-24 – descoberta: mensagens do catálogo escritas para o portal

`EMAIL_IN_USE` e `VEHICLE_ALREADY_LINKED` mostram "Se você já tem conta, entre com ela." e "Este veículo já está na sua conta." também no painel. A L4 já deixava a primeira para a #42; a segunda segue para a #45 e foi registrada em `clientes-do-painel.md`.

## 2026-10-24 – decisão: PRs e verificação

#97 (base), #98 (lista e detalhes, sobre o #97) e #99 (formulários, sobre o #98, `Closes #64`), todos rascunho; `memoria/` só no último, como na #62 e na #63. Verificação completa no ambiente local antes de fechar o último PR (teclado, Lighthouse de acessibilidade em página e 56 estados, LCP e CLS do celular, falha, vazio, carregamento, sucesso e conflito por alteração temporária, e `/profile` e `/booking` depois da mudança dos diálogos); detalhes no relatório. Ambiente local encerrado. Pendência do Yvan: a produção logada.
