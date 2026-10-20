import "server-only";
import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";

// docs/agendamento/calculos.md, section 2 (RN017 to RN020). Each action is a
// route of docs/agendamento/rotas.md. The admin acts as staff: the route has
// already checked the appointments permission.

export type AppointmentAction =
  "advance" | "complete" | "cancel" | "reschedule";

export type AppointmentActor = "client" | "staff";

type StatusTransition = {
  action: AppointmentAction;
  from: AppointmentStatus;
  to: AppointmentStatus;
  actors: readonly AppointmentActor[];
};

// Cancelled and rescheduled have no way out: they are final, so an appointment
// is rescheduled only once (RN020).
const STATUS_TRANSITIONS: readonly StatusTransition[] = [
  { action: "advance", from: "scheduled", to: "checked_in", actors: ["staff"] },
  {
    action: "advance",
    from: "checked_in",
    to: "in_progress",
    actors: ["staff"],
  },
  {
    action: "advance",
    from: "in_progress",
    to: "awaiting_payment",
    actors: ["staff"],
  },
  // RN018: only the completion, with the payment method used, ends the
  // service.
  {
    action: "complete",
    from: "awaiting_payment",
    to: "completed",
    actors: ["staff"],
  },
  // RN019
  {
    action: "cancel",
    from: "scheduled",
    to: "cancelled",
    actors: ["client", "staff"],
  },
  { action: "cancel", from: "checked_in", to: "cancelled", actors: ["staff"] },
  {
    action: "reschedule",
    from: "completed",
    to: "rescheduled",
    actors: ["client", "staff"],
  },
];

// The status the action leads to, or null when the table does not allow it
// (409 INVALID_STATUS).
export function findNextStatus({
  action,
  status,
  actor,
}: {
  action: AppointmentAction;
  status: AppointmentStatus;
  actor: AppointmentActor;
}): AppointmentStatus | null {
  const transition = STATUS_TRANSITIONS.find(
    (row) =>
      row.action === action &&
      row.from === status &&
      row.actors.includes(actor),
  );
  return transition?.to ?? null;
}
