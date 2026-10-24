import type { AppointmentVehicle } from "@/shared/api/appointments";
import type { PaymentMethod } from "@/shared/constants/payment-methods";

// The values of the booking form (docs/agendamento/agendar-servico.md), shared
// by the steps of the portal and of the panel.

// The vehicle as the steps and the summary show it.
export type BookingVehicle = Pick<
  AppointmentVehicle,
  "id" | "plate" | "brand" | "model" | "color"
>;

export type BookingFormValues = {
  vehicle: BookingVehicle | null;
  // RN005: the main and complementary services.
  serviceIds: string[];
  // RN006: the additionals of the checked main services.
  additionalIds: string[];
  // The day (aaaa-mm-dd) and the start time (HH:MM) in the company's time
  // zone; the API takes them as one instant.
  date: string | null;
  time: string | null;
  paymentMethod: PaymentMethod | null;
};
