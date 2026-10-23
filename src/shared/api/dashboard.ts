import type {
  AppointmentService,
  AppointmentVehicle,
} from "@/shared/api/appointments";
import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";
import type { DashboardIndicator } from "@/shared/constants/dashboard-indicators";

// Bodies of the dashboard routes in docs/agendamento/rotas.md (UC09, UC27).
// The dates of a period are calendar days (2026-10-01) and the instants are
// ISO 8601.

// The revenue of one day (RF041), by the day of completion (RN021).
export type DashboardRevenueDay = {
  date: string;
  revenue: number;
};

// The appointments of the period with one status (RF042).
export type DashboardStatusCount = {
  status: AppointmentStatus;
  count: number;
};

// One appointment of the day (RF043), with the data copied in it (RN037).
export type DashboardAgendaItem = {
  id: string;
  status: AppointmentStatus;
  scheduledAt: string;
  // RN034
  estimatedEndAt: string;
  clientName: string;
  vehicle: Pick<AppointmentVehicle, "plate" | "brand" | "model">;
  services: Pick<AppointmentService, "id" | "name">[];
  total: number;
};

// GET /api/admin/dashboard
export type Dashboard = {
  // The period applied, which is the current month when none was asked.
  from: string;
  to: string;
  // RN021: the appointments Concluído and Reagendado, by the day of completion.
  revenue: number;
  // RN021: the appointments of the period, of any status, by the scheduled day.
  appointmentCount: number;
  // RN021: zero when no appointment was paid.
  averageTicket: number;
  // RN021: from 0 to 100.
  cancellationRate: number;
  // Every day of the period, with 0 on the days without revenue.
  revenueByDay: DashboardRevenueDay[];
  // The seven statuses, in the order of RN017.
  appointmentsByStatus: DashboardStatusCount[];
  // The appointments scheduled for the current day, by time.
  agenda: DashboardAgendaItem[];
};

// One observation of the analysis, about one of the indicators (RN039).
export type DashboardAnalysisHighlight = {
  indicator: DashboardIndicator;
  comment: string;
};

// POST /api/admin/dashboard/analysis (UC27): the text only interprets the
// indicators of the screen (RN039).
export type DashboardAnalysis = {
  from: string;
  to: string;
  // RN038: the period of the same number of days that ends the day before.
  previousFrom: string;
  previousTo: string;
  // False when the previous period has no appointments (UC27 FA03).
  hasComparison: boolean;
  summary: string;
  highlights: DashboardAnalysisHighlight[];
  generatedAt: string;
};
