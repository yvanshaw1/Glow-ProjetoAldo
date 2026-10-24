import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";

// RN033: how far the staff may move the date and the time of an appointment
// (docs/agendamento/RN033-coerencia-da-edicao.md). The rules of the server
// check it (src/server/rules/editing.ts); the edition of the panel uses it to
// guide the choice. null leaves only the business hours.
export type DateLimit = "not_before_now" | "not_after_now" | null;

// In scheduled, never in the past; once the vehicle has arrived, never after
// the moment of the change. A cancelled appointment may not have seen the
// vehicle, so only the hours apply to it.
export const STAFF_DATE_LIMITS = {
  scheduled: "not_before_now",
  checked_in: "not_after_now",
  in_progress: "not_after_now",
  awaiting_payment: "not_after_now",
  completed: "not_after_now",
  rescheduled: "not_after_now",
  cancelled: null,
} as const satisfies Record<AppointmentStatus, DateLimit>;
