import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";

// RF044: the three views of the listing of the panel.
export const APPOINTMENT_VIEWS = ["today", "future", "history"] as const;

export type AppointmentView = (typeof APPOINTMENT_VIEWS)[number];

// Names of the views in UC10 and in the glossary (guia/mapa.md).
export const APPOINTMENT_VIEW_LABELS = {
  today: "Hoje",
  future: "Futuros",
  history: "Histórico",
} as const satisfies Record<AppointmentView, string>;

const OPEN_STATUSES = [
  "scheduled",
  "checked_in",
  "in_progress",
  "awaiting_payment",
] as const satisfies readonly AppointmentStatus[];

// docs/agendamento/rotas.md, GET /api/admin/appointments: the view tells the
// statuses, so every appointment is in one view only. Today and the future
// are told apart by the day of the appointment (today includes the days
// before it); the history has every date.
export const APPOINTMENT_VIEW_STATUSES = {
  today: OPEN_STATUSES,
  future: OPEN_STATUSES,
  history: ["completed", "cancelled", "rescheduled"],
} as const satisfies Record<AppointmentView, readonly AppointmentStatus[]>;

// RF045: the listing is sorted by time or by status.
export const APPOINTMENT_SORTS = ["time", "status"] as const;

export type AppointmentSort = (typeof APPOINTMENT_SORTS)[number];

export const APPOINTMENT_SORT_LABELS = {
  time: "Horário",
  status: "Status",
} as const satisfies Record<AppointmentSort, string>;
