# Notas: 15-wireframes

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-18 – decisão

O desenvolvedor informou na conversa que todos os dados exibidos nos wireframes (nomes, e-mails e telefones nas listas do painel) são fictícios. Também informou que as cores do projeto ainda não estão definidas: ficarão nas variáveis globais de CSS do tema. As telas servem para a IA entender o esqueleto e os componentes das páginas.

## 2026-10-18 – descoberta

Os 94 PDFs são imagens, sem texto extraível (`pdftotext` não devolve nada). Só dá para conferir o conteúdo abrindo cada arquivo. Foram abertos, para escrever o README: `HomepageDesktop`, `LoginRegisterRequirementModal`, `ClientProfile2Desktop`, `DashboardStaffPageDesktop`, `AppointmentManagmentDesktop`, `clientManagmentDesktop` e `staffManagment1Desktop`.

## 2026-10-18 – desvio

O plano chegou com `status: aprovado`, mas nenhuma das caixas da L1 estava marcada no arquivo. O desenvolvedor confirmou na conversa a opção 1 (manter os nomes), e a caixa foi marcada com essa confirmação.

## 2026-10-18 – descoberta

Verificação da etapa 02, na ramificação `docs/15-wireframes`: `npm run check` sem erros nem avisos. Com o Docker Desktop 29.8.2, `docker compose up --build -d` enviou um contexto de 105 kB, sem os 33 MB de `wireframes/`; a página inicial respondeu 200, com o processo no uid 1000 (`node`). A imagem tem só `.next`, `node_modules`, `package.json`, `public` e `server.js`. No Git, `wireframes/` tem 95 arquivos, os PDFs têm o atributo `binary`, e os hashes dos 94 PDFs são iguais aos da pasta original.
