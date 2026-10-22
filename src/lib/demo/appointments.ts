import { ApiError } from "@/lib/api-client";
import { demoPage } from "@/lib/demo/list";
import type { DemoRequest } from "@/lib/demo/routes";
import type {
  AppointmentService,
  AppointmentVehicle,
  ClientAppointment,
  ClientAppointmentSummary,
} from "@/shared/api/appointments";
import type { Page } from "@/shared/api/pagination";
import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";
import { SHORT_LIST_PAGE_SIZE } from "@/shared/constants/pagination";
import { COMPANY_TIME_ZONE } from "@/shared/constants/time-zone";
import { ERROR_CATALOG } from "@/shared/errors/catalog";

// Demo data of the appointments module (decision 0055): seven appointments of
// Henrique Costa, the client of src/lib/demo/clients.ts, with his two
// vehicles and the services, prices by size and durations of
// supabase/seed-demo.sql. The fees of supabase/seed.sql are all zero, so the
// total is the subtotal. The dates are relative to the Monday of the current
// week in the company's time zone, so the scheduled ones stay in the future,
// always on the business days and hours of supabase/seed.sql.

// Maceió has no daylight saving time: the offset of the company's time zone
// (decision 0053) in the instants of the demo.
const COMPANY_OFFSET = "-03:00";
const MS_PER_DAY = 86_400_000;
const DAYS_PER_WEEK = 7;
const UPDATED_AT = "2026-06-23T12:00:00+00:00";

// en-CA writes the calendar day as 2026-10-21.
const calendarDayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: COMPANY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// docs/agendamento/rotas.md: the statuses of each scope and the order of the
// dates, the nearest first among the current ones and the latest first in the
// history.
const SCOPES: Record<
  string,
  { statuses: readonly AppointmentStatus[]; direction: 1 | -1 }
> = {
  current: {
    statuses: ["scheduled", "checked_in", "in_progress", "awaiting_payment"],
    direction: 1,
  },
  history: {
    statuses: ["completed", "cancelled", "rescheduled"],
    direction: -1,
  },
};

// Days after the Monday of the current week, or the day of the call.
type DemoDay = number | "today";

type DemoAppointment = Omit<
  ClientAppointment,
  "scheduledAt" | "estimatedEndAt"
> & {
  start: [day: DemoDay, time: string];
  // RN034, worked out by hand over the business hours of seed.sql: Monday to
  // Friday from 08:00 to 18:00 with a break from 12:00 to 13:00.
  end: [day: DemoDay, time: string];
};

// The copies of the two vehicles of the account (RN037), with the seed's ids.
const TORO: AppointmentVehicle = {
  id: "a229a2b8-eb46-90df-1285-bcd05a9570a0",
  plate: "GLW8H08",
  type: "pickup",
  size: "extra_large",
  brand: "Fiat",
  model: "Toro",
  color: "Azul",
  year: 2021,
};
const SW4: AppointmentVehicle = {
  id: "c27d6551-0c94-5624-d779-0cad75a490a3",
  plate: "GLW5L15",
  type: "suv",
  size: "large",
  brand: "Toyota",
  model: "SW4",
  color: "Prata",
  year: 2019,
};

// The services of the seed in these appointments, with its ids (md5 of
// 'glow-demo:service:<name>' as a UUID).
type DemoService = Omit<AppointmentService, "price">;

const SIMPLE_WASH: DemoService = {
  id: "c64b0c68-6690-ab4c-dd8d-397aec5be871",
  name: "Lavagem simples",
  type: "main",
  durationMinutes: 40,
};
const COMPLETE_WASH: DemoService = {
  id: "7ce749ea-491a-fa99-6834-718d1fe5725e",
  name: "Lavagem completa",
  type: "main",
  durationMinutes: 90,
};
const TECHNICAL_WASH: DemoService = {
  id: "a338b84b-5bc4-06aa-b66f-025b61bd7a64",
  name: "Lavagem técnica",
  type: "main",
  durationMinutes: 180,
};
const COMMERCIAL_POLISH: DemoService = {
  id: "7cb46ab5-32b1-f8e0-e0a7-6d9f9cf55798",
  name: "Polimento comercial",
  type: "main",
  durationMinutes: 240,
};
const INTERIOR_CLEANING: DemoService = {
  id: "06c8860d-1b78-2d75-4a2e-fede222dc8d7",
  name: "Higienização interna completa",
  type: "main",
  durationMinutes: 300,
};
const OZONE_SANITIZING: DemoService = {
  id: "fd8928ee-be2c-ebd5-176b-669e3e18f80c",
  name: "Oxi-sanitização",
  type: "complementary",
  durationMinutes: 40,
};
const CARNAUBA_WAX: DemoService = {
  id: "ac4fa6ae-6246-3d34-9fd9-4f849625ecb6",
  name: "Cera de carnaúba",
  type: "additional",
  durationMinutes: 20,
};
const TIRE_SHINE: DemoService = {
  id: "c4c3b3ae-8b50-6a4f-af47-041a8f2c210e",
  name: "Pretinho nos pneus",
  type: "additional",
  durationMinutes: 10,
};
const LEATHER_CARE: DemoService = {
  id: "e904e83f-4d0f-e45b-3e7e-ab9fffc852cb",
  name: "Hidratação de couro",
  type: "additional",
  durationMinutes: 40,
};

// The service with its price for the size of the vehicle, or its fixed price.
function withPrice(service: DemoService, price: number): AppointmentService {
  return { ...service, price };
}

// The ids are md5 of 'glow-demo:client-appointment:<n>' as a UUID: the seed's
// appointments are drawn at random, so these are not in it. The rescheduled
// one gave rise to the completed one four weeks later (RN020).
const APPOINTMENTS: DemoAppointment[] = [
  {
    id: "2192b83a-985b-3d3f-9a3f-b7662db8c25c",
    status: "in_progress",
    start: ["today", "08:00"],
    end: ["today", "09:40"],
    vehicle: TORO,
    services: [withPrice(COMPLETE_WASH, 120), withPrice(TIRE_SHINE, 10)],
    paymentMethod: "pix",
    estimatedDurationMinutes: 100,
    subtotal: 130,
    feePercent: 0,
    total: 130,
    updatedAt: UPDATED_AT,
  },
  {
    id: "84ccb653-18f3-c117-8e5d-4da585e0cc33",
    status: "scheduled",
    // Through the break.
    start: [9, "09:00"],
    end: [9, "14:00"],
    vehicle: SW4,
    services: [withPrice(COMMERCIAL_POLISH, 390)],
    paymentMethod: "credit",
    estimatedDurationMinutes: 240,
    subtotal: 390,
    feePercent: 0,
    total: 390,
    updatedAt: UPDATED_AT,
  },
  {
    id: "fda5a40d-9457-0ecf-6b6d-d406ad842caa",
    status: "scheduled",
    // Through the night.
    start: [16, "14:00"],
    end: [17, "09:40"],
    vehicle: TORO,
    services: [
      withPrice(INTERIOR_CLEANING, 450),
      withPrice(OZONE_SANITIZING, 100),
    ],
    paymentMethod: "debit",
    estimatedDurationMinutes: 340,
    subtotal: 550,
    feePercent: 0,
    total: 550,
    updatedAt: UPDATED_AT,
  },
  {
    id: "1b7bd3fa-4a20-a90a-58d1-5f24cbcb6c17",
    status: "completed",
    start: [-3, "08:30"],
    end: [-3, "09:30"],
    vehicle: TORO,
    services: [withPrice(SIMPLE_WASH, 70), withPrice(CARNAUBA_WAX, 35)],
    paymentMethod: "pix",
    estimatedDurationMinutes: 60,
    subtotal: 105,
    feePercent: 0,
    total: 105,
    updatedAt: UPDATED_AT,
  },
  {
    id: "2c7edd24-9b5a-51d7-3deb-6d5876211f7a",
    status: "cancelled",
    start: [-12, "10:00"],
    end: [-12, "14:00"],
    vehicle: SW4,
    services: [withPrice(TECHNICAL_WASH, 220)],
    paymentMethod: "cash",
    estimatedDurationMinutes: 180,
    subtotal: 220,
    feePercent: 0,
    total: 220,
    updatedAt: UPDATED_AT,
  },
  {
    id: "40fdf744-d4a3-d9fe-06a7-622e1f363d4e",
    status: "completed",
    start: [-19, "08:00"],
    end: [-19, "10:10"],
    vehicle: SW4,
    services: [withPrice(COMPLETE_WASH, 100), withPrice(LEATHER_CARE, 90)],
    paymentMethod: "credit",
    estimatedDurationMinutes: 130,
    subtotal: 190,
    feePercent: 0,
    total: 190,
    updatedAt: UPDATED_AT,
  },
  {
    id: "4f2a4583-e7a4-3f3f-37cd-917cba41e086",
    status: "rescheduled",
    start: [-47, "08:00"],
    end: [-47, "10:10"],
    vehicle: SW4,
    services: [withPrice(COMPLETE_WASH, 100), withPrice(LEATHER_CARE, 90)],
    paymentMethod: "credit",
    estimatedDurationMinutes: 130,
    subtotal: 190,
    feePercent: 0,
    total: 190,
    updatedAt: UPDATED_AT,
  },
];

// GET /api/me/appointments, with the scope of the tab.
export function answerAppointments({
  query,
}: DemoRequest): Page<ClientAppointmentSummary> {
  const scope = SCOPES[query.get("scope") ?? ""];
  const appointments = scope
    ? listAppointments(new Date())
        .filter((appointment) => scope.statuses.includes(appointment.status))
        .sort(
          (first, second) =>
            scope.direction *
            (Date.parse(first.scheduledAt) - Date.parse(second.scheduledAt)),
        )
        .map(toSummary)
    : [];
  return demoPage(appointments, query, { pageSize: SHORT_LIST_PAGE_SIZE });
}

// GET /api/me/appointments/:id
export function answerAppointment({ params }: DemoRequest): ClientAppointment {
  const appointment = listAppointments(new Date()).find(
    ({ id }) => id === params.id,
  );
  if (!appointment) {
    throw new ApiError({
      status: ERROR_CATALOG.NOT_FOUND.status,
      code: "NOT_FOUND",
      detail: ERROR_CATALOG.NOT_FOUND.message,
    });
  }
  return appointment;
}

// The appointments with their instants in the week of now.
function listAppointments(now: Date): ClientAppointment[] {
  const today = Date.parse(`${calendarDayFormat.format(now)}T00:00:00Z`);
  const daysAfterMonday = (new Date(today).getUTCDay() + 6) % DAYS_PER_WEEK;
  const monday = today - daysAfterMonday * MS_PER_DAY;
  const toInstant = ([day, time]: [DemoDay, string]) => {
    const date = day === "today" ? today : monday + day * MS_PER_DAY;
    const calendarDay = new Date(date).toISOString().slice(0, 10);
    return `${calendarDay}T${time}:00${COMPANY_OFFSET}`;
  };
  return APPOINTMENTS.map(({ start, end, ...appointment }) => ({
    ...appointment,
    scheduledAt: toInstant(start),
    estimatedEndAt: toInstant(end),
  }));
}

function toSummary({
  id,
  status,
  scheduledAt,
  estimatedEndAt,
  vehicle: { plate, brand, model, color },
  services,
  total,
}: ClientAppointment): ClientAppointmentSummary {
  return {
    id,
    status,
    scheduledAt,
    estimatedEndAt,
    vehicle: { plate, brand, model, color },
    services: services.map(({ id, name }) => ({ id, name })),
    total,
  };
}
