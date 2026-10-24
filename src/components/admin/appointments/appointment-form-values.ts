import type { BookingFormValues } from "@/components/shared/booking-form-values";
import type { AdminClientOption } from "@/shared/api/appointments";

// The values of the form of the panel (docs/agendamento/agendamentos-do-painel.md):
// the ones of the booking, shared with the portal, and the client, who is
// chosen first (UC11 step 2).
export type AppointmentFormValues = BookingFormValues & {
  client: AdminClientOption | null;
};
