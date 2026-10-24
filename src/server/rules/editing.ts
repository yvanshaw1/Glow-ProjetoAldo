import "server-only";
import {
  findAvailabilityError,
  type AvailabilityError,
  type BusinessDay,
} from "@/server/rules/scheduling";
import type { AppointmentActor } from "@/server/rules/status-transitions";
import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";
import {
  STAFF_DATE_LIMITS,
  type DateLimit,
} from "@/shared/constants/appointment-date-limits";

// docs/agendamento/calculos.md, section 4 (RN032, RN033). An edit never
// changes the status: only findNextStatus does. The prices, the duration and
// the estimated end are calculated again by pricing.ts and scheduling.ts.

export type ScheduleChangeError =
  AvailabilityError | "NOT_AFTER_SCHEDULED" | "IN_THE_PAST" | "AFTER_NOW";

// RN032: the client edits only a scheduled appointment; the staff, in any
// status. false is a 409 INVALID_STATUS.
export function canEditAppointment({
  actor,
  status,
}: {
  actor: AppointmentActor;
  status: AppointmentStatus;
}): boolean {
  return actor === "staff" || status === "scheduled";
}

// RN033: the date and the time are checked only when they change; a kept
// date stays valid even if it has passed or the hours have changed. The
// client only postpones it; the staff brings it forward or postpones it.
export function findScheduleChangeError({
  actor,
  status,
  scheduledAt,
  newScheduledAt,
  now,
  businessHours,
  timeZone,
}: {
  actor: AppointmentActor;
  status: AppointmentStatus;
  scheduledAt: Date;
  newScheduledAt: Date;
  now: Date;
  businessHours: readonly BusinessDay[];
  timeZone: string;
}): ScheduleChangeError | null {
  if (newScheduledAt.getTime() === scheduledAt.getTime()) return null;
  const availabilityError = findAvailabilityError({
    startsAt: newScheduledAt,
    businessHours,
    timeZone,
  });
  if (availabilityError) return availabilityError;
  if (actor === "client") {
    if (newScheduledAt < scheduledAt) return "NOT_AFTER_SCHEDULED";
    return newScheduledAt < now ? "IN_THE_PAST" : null;
  }
  const limit: DateLimit = STAFF_DATE_LIMITS[status];
  if (limit === "not_before_now" && newScheduledAt < now) return "IN_THE_PAST";
  if (limit === "not_after_now" && newScheduledAt > now) return "AFTER_NOW";
  return null;
}
