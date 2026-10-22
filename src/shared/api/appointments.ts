import type { PublicCategory } from "@/shared/api/catalog";
import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";
import type { PaymentMethod } from "@/shared/constants/payment-methods";
import type { ServiceType } from "@/shared/constants/service-types";
import type { VehicleSize } from "@/shared/constants/vehicle-sizes";
import type { VehicleType } from "@/shared/constants/vehicle-types";

// Bodies of the appointment routes of the client in
// docs/agendamento/rotas.md (UC06, UC07). The vehicle and the services of an
// appointment are the copies made in it (RN037); the dates are instants in
// ISO 8601.

// The vehicle as it was when the appointment was made.
export type AppointmentVehicle = {
  id: string;
  plate: string;
  type: VehicleType;
  size: VehicleSize;
  brand: string;
  model: string;
  color: string;
  year: number;
};

// A service with the price of the vehicle size and the duration it had.
export type AppointmentService = {
  id: string;
  name: string;
  type: ServiceType;
  price: number;
  durationMinutes: number;
};

// The scope of GET /api/me/appointments: the current appointments or the
// history.
export type AppointmentScope = "current" | "history";

// One item of the page of GET /api/me/appointments, of the scope asked.
export type ClientAppointmentSummary = {
  id: string;
  status: AppointmentStatus;
  scheduledAt: string;
  // RN034
  estimatedEndAt: string;
  vehicle: Pick<AppointmentVehicle, "plate" | "brand" | "model" | "color">;
  services: Pick<AppointmentService, "id" | "name">[];
  total: number;
};

// GET /api/me/appointments/:id
export type ClientAppointment = Omit<
  ClientAppointmentSummary,
  "vehicle" | "services"
> & {
  // RN014
  estimatedDurationMinutes: number;
  paymentMethod: PaymentMethod;
  subtotal: number;
  // RN012: positive for a surcharge, negative for a discount, zero for none.
  feePercent: number;
  vehicle: AppointmentVehicle;
  services: AppointmentService[];
  // RNF011: treated as text.
  updatedAt: string;
};

// An active additional linked to a main service, always with a fixed price
// (RN006, RN009).
export type BookableAdditional = Pick<
  AppointmentService,
  "id" | "name" | "price" | "durationMinutes"
>;

// One item of the page of GET /api/me/bookable-services: an active main or
// complementary service of an active category (RN008, RN031), with the price
// of the size of the vehicle or the fixed one (RN009).
export type BookableService = Omit<AppointmentService, "type"> & {
  type: Exclude<ServiceType, "additional">;
  description: string;
  category: PublicCategory;
  // Empty in a complementary service.
  additionals: BookableAdditional[];
};

// POST /api/me/appointments/preview: the values of the choice, by the
// current catalog, without writing.
export type AppointmentPreview = {
  // Only the services that can be booked (RN008, RN031).
  services: AppointmentService[];
  subtotal: number;
  // RN012; null without the payment method.
  feePercent: number | null;
  // RN010; the subtotal without the payment method.
  total: number;
  // RN014
  estimatedDurationMinutes: number;
  // RN034; null without the date and time.
  estimatedEndAt: string | null;
};
