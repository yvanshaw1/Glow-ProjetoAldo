// RN017: the statuses of an appointment, in the order of the sequence (and of
// the appointment_status enum of the database), then the two final ones.
export const APPOINTMENT_STATUSES = [
  "scheduled",
  "checked_in",
  "in_progress",
  "awaiting_payment",
  "completed",
  "cancelled",
  "rescheduled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

// Names of the statuses in RN017 and in the glossary (guia/mapa.md).
export const APPOINTMENT_STATUS_LABELS = {
  scheduled: "Agendado",
  checked_in: "Em espera",
  in_progress: "Em execução",
  awaiting_payment: "Finalizado",
  completed: "Concluído",
  cancelled: "Cancelado",
  rescheduled: "Reagendado",
} as const satisfies Record<AppointmentStatus, string>;
