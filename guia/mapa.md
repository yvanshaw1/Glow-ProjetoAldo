# O sistema em uma tela

Uma única aplicação Next.js reúne as duas interfaces e a API. O navegador fala só com a aplicação; só o servidor acessa o Supabase e o serviço de IA, que recebe só valores agregados (RN038).

```
página (React) → src/lib/api-client.ts → rota src/app/api/**/route.ts (sessão, permissão, Zod)
  → serviço src/server/services/ (usa as funções puras de src/server/rules/) → repositório src/server/repositories/ (supabase-js)
  → PostgreSQL (RLS ligado e sem políticas: só a chave de serviço do servidor lê e grava)
análise do dashboard: serviço dashboard → src/server/ai/ → serviço de IA (Groq), só com valores agregados
```

| Grupo da API | Quem acessa |
|---|---|
| `/api/auth` | público (cadastro e login) e sessão (logout, `me`, troca de senha) |
| `/api/public` | qualquer pessoa: dados da empresa e catálogo |
| `/api/me` | perfil `client`, sempre filtrado pelo cliente da sessão |
| `/api/admin` | perfis `staff` e `admin`, conforme a permissão da página |

## Assuntos, módulos e telas

| Assunto (`docs/`) | Módulos do backend | Tabelas | Telas |
|---|---|---|---|
| `acesso` | `auth` | `login_attempts` (perfis em `clients` e `staff`) | `/login`, `/register`, `/set-password` |
| `catalogo` | `catalog` | `categories`, `services`, `service_prices`, `service_additionals` | `/`, `/services`, `/admin/services` |
| `clientes` | `clients`, `vehicles` | `clients`, `vehicles`, `client_vehicles` | `/profile`, `/admin/clients` |
| `agendamento` | `appointments`, `dashboard` | `appointments`, `appointment_services` | `/booking`, `/appointments`, `/admin`, `/admin/appointments` |
| `equipe` | `staff`, `roles` | `staff`, `roles`, `role_permissions` | `/admin/staff` |
| `configuracoes` | `settings` | `business_settings`, `business_hours`, `payment_fees` | `/admin/settings` |
| `plataforma` | (todos) | – | stack, requisitos não funcionais, segurança, formatos, infraestrutura |

```
src/
├── app/            (portal)/ e (admin)/admin/ com as páginas; api/ com as rotas (a pasta segue a URL)
├── components/     ui/ (shadcn), shared/, portal/<módulo>/, admin/<módulo>/
├── hooks/          hooks de cliente reutilizáveis
├── lib/            api-client.ts, utils.ts
├── shared/         validation/, format/, errors/, constants/, api/: usados pelo front e pelo back
├── server/         auth/, http/, rules/ (puras), services/, repositories/, supabase/, ai/: só servidor
└── proxy.ts        proteção das páginas (Next.js 16; não existe middleware.ts)
public/             estáticos
supabase/           migrations/, seed.sql, seed-demo.sql, scripts/
tests/              rules/ e validation/, espelhando o código
```

Árvore completa, regras de dependência e o que não existe aqui: `docs/plataforma/estrutura-de-pastas.md`.

## Glossário

| Termo de negócio | No código | Observação |
|---|---|---|
| Cliente · Funcionário · Administrador | `client` · `staff` · `admin` (`staff.is_admin`) | perfis; o admin tem acesso total e não aparece em listagens (RN027) |
| Cargo · Permissão | `role` · `permission_key` | permissões: `dashboard`, `appointments`, `services`, `clients`, `staff`, `settings` (RN025) |
| Veículo · Tipo | `vehicle` · `vehicle_type` | `hatch`, `sedan`, `suv`, `pickup`; placa única (RN036) |
| Porte P, M, G, GG | `vehicle_size` | `small`, `medium`, `large`, `extra_large`; gerado pelo tipo (RN002) |
| Serviço principal, adicional, complementar | `service_type` | `main`, `additional`, `complementary` (RN006) |
| Valor fixo · por porte | `pricing_mode` | `fixed`, `by_size` (RN009) |
| Agendamento | `appointment` | ordem de serviço com cópia dos dados (RN037) |
| Agendado, Em espera, Em execução, Finalizado, Concluído, Cancelado, Reagendado | `appointment_status` | `scheduled`, `checked_in`, `in_progress`, `awaiting_payment`, `completed`, `cancelled`, `rescheduled` (RN017) |
| Crédito, débito, Pix, dinheiro | `payment_method` | `credit`, `debit`, `pix`, `cash` (RN011) |
| Acréscimo ou desconto da forma | `payment_fees.percent`, `appointments.fee_percent` | número com sinal; negativo é desconto (RN012) |
| Disponibilidade · Dados da empresa | `business_hours` · `business_settings` | dias, horários e pausa (RN013) · linha única (RN028) |
| Duração média · estimada | `avg_duration_minutes` · `estimated_duration_minutes` | minutos (RN014) |
| Previsão de conclusão | `estimated_end_at` | só conta horário de funcionamento (RN034) |
| Reagendamento | `reschedule`, `rescheduled_from_id` | novo agendamento a partir de um concluído (RN020) |
| Exclusão lógica · Desativação | `deleted_at` · `is_active` | clientes e serviços são excluídos logicamente; o resto é desativado (RN030) |
| Senha inicial | `must_change_password` | troca obrigatória no primeiro acesso (RN023) |
| Receita, ticket médio, taxa de cancelamento | módulo `dashboard` | (RN021) |
| Análise do período | `DashboardAnalysis`, `POST /api/admin/dashboard/analysis` | texto gerado por IA a partir dos valores agregados (RN038, RN039) |
