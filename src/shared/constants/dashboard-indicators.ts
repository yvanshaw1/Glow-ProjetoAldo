// RN039: the indicators an observation of the analysis of the dashboard can be
// about, which are the ones the screen shows (UC09, UC27).
export const DASHBOARD_INDICATORS = [
  "revenue",
  "appointmentCount",
  "averageTicket",
  "cancellationRate",
  "revenueByDay",
  "appointmentsByStatus",
] as const;

export type DashboardIndicator = (typeof DASHBOARD_INDICATORS)[number];

// Names of the indicators on the screen (RF040 to RF042).
export const DASHBOARD_INDICATOR_LABELS = {
  revenue: "Receita",
  appointmentCount: "Agendamentos",
  averageTicket: "Ticket médio",
  cancellationRate: "Taxa de cancelamento",
  revenueByDay: "Receita por dia",
  appointmentsByStatus: "Agendamentos por status",
} as const satisfies Record<DashboardIndicator, string>;
