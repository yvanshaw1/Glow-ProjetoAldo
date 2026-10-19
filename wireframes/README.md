# `wireframes/` – Referência visual das páginas

Os PDFs desta pasta são telas de outro sistema de estética automotiva, com as mesmas funcionalidades do Glow e algumas a mais, por ser mais completo. Não são o desenho final do Glow: são um exemplo de como o wireframe das nossas páginas deve ser, mostrando o esqueleto de cada página e os componentes que ela usa. Os dados exibidos nas telas são fictícios.

## Como usar

- **Aproveitar:** a disposição da página (cabeçalho, menu, colunas, cartões, tabelas, formulários e modais), a ordem dos passos dos assistentes e a adaptação entre desktop e celular.
- **Deixar de fora:** toda funcionalidade, campo ou detalhe sem requisito em `docs/`. O que a página tem vem dos requisitos e dos casos de uso do assunto; o wireframe só mostra como organizá-la. Exemplos que aparecem nas telas e não existem no Glow: cupons (fora do escopo do MVP, `docs/plataforma/visao-geral.md`), avaliações (Reviews), relatórios, o seletor de animações, os boxes de atendimento e a exclusão da conta pelo próprio cliente (no Glow, só o funcionário exclui a conta de um cliente, RF074).
- **Não copiar:** as cores, o nome, o logotipo, os textos e as imagens da outra empresa. As cores do Glow vêm das variáveis do tema (`@theme` em `src/app/globals.css`), que ainda serão definidas; os componentes usam só essas variáveis (`docs/padroes/frontend.md`). Os textos da interface seguem os casos de uso.
- **Em caso de conflito:** se o wireframe e `docs/` divergirem, vale `docs/`.

Os PDFs são imagens, sem texto selecionável. Para construir uma página, abra só os PDFs da pasta dela.

## Organização

Uma pasta por página. Cada tela tem uma versão `Desktop` e uma `Mobile`; as telas e os modais com vários passos são numerados (`Step1`, `Step2`...).

| Pasta | Página do Glow | Casos de uso |
|---|---|---|
| `publicPages/homepage/` | `/`, página inicial; `LoginRegisterRequirementModal` é o aviso de que é preciso entrar ou criar uma conta para agendar (RN001) | UC01 |
| `publicPages/catalog/` | `/services`, catálogo de serviços | UC01 |
| `publicPages/login/` | `/login`, login único de clientes e funcionários | UC03, UC08 |
| `publicPages/register/` | `/register`, cadastro de cliente | UC02 |
| `clientPages/appointment/` | `/booking`, assistente de agendamento, com o cadastro de veículo quando o cliente ainda não tem nenhum | UC06, UC05 |
| `clientPages/clientAppointments/` | `/appointments`, agendamentos do cliente e cancelamento | UC07 |
| `clientPages/profile/` | `/profile`, dados da conta e veículos | UC04, UC05 |
| `staffPages/dashboard/` | `/admin`, dashboard | UC09 |
| `staffPages/appointmentManagment/` | `/admin/appointments`, agendamentos e novo agendamento para um cliente | UC10, UC11, UC12, UC26 |
| `staffPages/servicesManagment/` | `/admin/services`, serviços (principal, adicional e complementar) e categorias | UC13, UC14, UC15 |
| `staffPages/clientsManagment/` | `/admin/clients`, clientes | UC16, UC17 |
| `staffPages/staffManagment/` | `/admin/staff`, funcionários e cargos | UC19, UC20, UC21 |
| `staffPages/adminPainelConfs/` | `/admin/settings`, dados da empresa, disponibilidade e formas de pagamento | UC22, UC23, UC24 |
| `staffPages/headerMobile/` | menu lateral do painel no celular (layout do painel) | — |

A troca de senha no primeiro acesso (`/set-password`) não tem wireframe.

## Referências

- Telas e rotas de cada assunto: `docs/<assunto>/rotas.md`
- Padrões de frontend e tema: `docs/padroes/frontend.md`
- Decisão: `docs/decisoes/0041-wireframes-de-referencia.md`
