import { ApiError } from "@/lib/api-client";
import { demoPage } from "@/lib/demo/list";
import type { DemoRequest } from "@/lib/demo/routes";
import type {
  AppointmentPreview,
  AppointmentService,
  AppointmentVehicle,
  BookableService,
  ClientAppointment,
  ClientAppointmentSummary,
} from "@/shared/api/appointments";
import type { PublicCategory } from "@/shared/api/catalog";
import type { Page } from "@/shared/api/pagination";
import type { AppointmentStatus } from "@/shared/constants/appointment-statuses";
import {
  CATALOG_PAGE_SIZE,
  SHORT_LIST_PAGE_SIZE,
} from "@/shared/constants/pagination";
import type { PaymentMethod } from "@/shared/constants/payment-methods";
import type { ServiceType } from "@/shared/constants/service-types";
import { COMPANY_TIME_ZONE } from "@/shared/constants/time-zone";
import {
  VEHICLE_SIZES,
  type VehicleSize,
} from "@/shared/constants/vehicle-sizes";
import { ERROR_CATALOG } from "@/shared/errors/catalog";

// Demo data of the appointments module (decision 0055): seven appointments of
// Henrique Costa, the client of src/lib/demo/clients.ts, with his two
// vehicles and the services, prices by size and durations of
// supabase/seed-demo.sql. The fees of supabase/seed.sql are all zero, so the
// total is the subtotal. The dates are relative to the Monday of the current
// week in the company's time zone, so the scheduled ones stay in the future,
// always on the business days and hours of supabase/seed.sql. The booking
// reads the services to book of his vehicles and the preview of its choice,
// worked out over the same data.

// Maceió has no daylight saving time: the offset of the company's time zone
// (decision 0053) in the instants of the demo.
const COMPANY_OFFSET = "-03:00";
const MINUTES_PER_HOUR = 60;
// The same offset, in minutes.
const COMPANY_OFFSET_MINUTES = -3 * MINUTES_PER_HOUR;
const MS_PER_MINUTE = 60_000;
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

// The active services of the seed, with its ids (md5 of
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
const TECHNICAL_POLISH: DemoService = {
  id: "ff863a74-e17a-b011-5ae2-9e718d5612c3",
  name: "Polimento técnico",
  type: "main",
  durationMinutes: 480,
};
const CERAMIC_COATING: DemoService = {
  id: "00c3d0e7-79d0-a6b3-9b50-9598c9cadbe7",
  name: "Vitrificação de pintura",
  type: "main",
  durationMinutes: 900,
};
const AIR_CONDITIONING_CLEANING: DemoService = {
  id: "cff70583-8ed7-ad1c-ab6a-bc266b04f31f",
  name: "Higienização do ar-condicionado",
  type: "complementary",
  durationMinutes: 60,
};
const ENGINE_WASH: DemoService = {
  id: "d05d5475-d570-c23f-785d-9cdd9bc54bd3",
  name: "Lavagem de motor",
  type: "complementary",
  durationMinutes: 40,
};
const HEADLIGHT_RESTORATION: DemoService = {
  id: "9b46a99e-80d5-d981-ed80-ea6cd378d2c5",
  name: "Revitalização de faróis",
  type: "complementary",
  durationMinutes: 60,
};
const RAIN_REPELLENT: DemoService = {
  id: "4c854969-1a3a-ae32-c28a-e18ad83e465c",
  name: "Repelente de chuva nos vidros",
  type: "additional",
  durationMinutes: 20,
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

// The two vehicles of the account, for the booking.
const VEHICLES: readonly AppointmentVehicle[] = [TORO, SW4];

// The categories of the services to book, with the seed's ids, as in
// src/lib/demo/catalog.ts.
const WASH: PublicCategory = {
  id: "4e31423b-fe30-cf42-7e5a-eebc618ac6e6",
  name: "Lavagem",
};
const POLISH: PublicCategory = {
  id: "c3cce2b8-4899-3cc5-90a5-5b36e0a9781e",
  name: "Polimento e proteção",
};
const CLEANING: PublicCategory = {
  id: "d3be5225-b9b0-41ef-210a-0d86a965f75d",
  name: "Higienização",
};

// RN009: the price of the seed in reais, one for each size in the order of
// VEHICLE_SIZES (P, M, G and GG), or a fixed one.
type DemoPrice =
  | number
  | readonly [small: number, medium: number, large: number, extraLarge: number];

type PricedService = DemoService & { price: DemoPrice };

type DemoBookableService = PricedService & {
  type: Exclude<ServiceType, "additional">;
  description: string;
  category: PublicCategory;
  additionals: readonly PricedService[];
};

// RN006: the active additionals, always with a fixed price.
const WAX: PricedService = { ...CARNAUBA_WAX, price: 35 };
const SHINE: PricedService = { ...TIRE_SHINE, price: 10 };
const LEATHER: PricedService = { ...LEATHER_CARE, price: 90 };
const REPELLENT: PricedService = { ...RAIN_REPELLENT, price: 50 };

// RN008, RN031: the active main and complementary services of active
// categories, in the order of the seed, with the additionals linked to each
// main one. "Película nos vidros" is of an inactive category.
const BOOKABLE_SERVICES: readonly DemoBookableService[] = [
  {
    ...SIMPLE_WASH,
    type: "main",
    description:
      "Lavagem externa com shampoo neutro, aspiração interna e limpeza dos vidros.",
    category: WASH,
    price: [40, 50, 60, 70],
    additionals: [WAX, SHINE],
  },
  {
    ...COMPLETE_WASH,
    type: "main",
    description:
      "Lavagem externa e interna detalhada, com limpeza de painel, portas, rodas e caixas de roda.",
    category: WASH,
    price: [70, 85, 100, 120],
    additionals: [WAX, SHINE, LEATHER, REPELLENT],
  },
  {
    ...TECHNICAL_WASH,
    type: "main",
    description:
      "Lavagem minuciosa com descontaminação da pintura e limpeza de frisos, emblemas e rodas.",
    category: WASH,
    price: [160, 190, 220, 260],
    additionals: [SHINE, LEATHER, REPELLENT],
  },
  {
    ...COMMERCIAL_POLISH,
    type: "main",
    description:
      "Polimento em uma etapa que remove riscos leves e manchas e devolve o brilho da pintura.",
    category: POLISH,
    price: [280, 330, 390, 450],
    additionals: [REPELLENT],
  },
  {
    ...TECHNICAL_POLISH,
    type: "main",
    description:
      "Correção de pintura em várias etapas, para riscos e marcas mais profundos.",
    category: POLISH,
    price: [550, 650, 750, 850],
    additionals: [],
  },
  {
    ...CERAMIC_COATING,
    type: "main",
    description:
      "Polimento seguido de proteção cerâmica, que repele água e sujeira por até três anos.",
    category: POLISH,
    price: [1100, 1300, 1500, 1700],
    additionals: [],
  },
  {
    ...INTERIOR_CLEANING,
    type: "main",
    description:
      "Limpeza profunda de bancos, carpetes, teto e portas, com extração e secagem.",
    category: CLEANING,
    price: [280, 330, 380, 450],
    additionals: [LEATHER],
  },
  {
    ...AIR_CONDITIONING_CLEANING,
    type: "complementary",
    description:
      "Limpeza e desinfecção dos dutos e do evaporador do ar-condicionado.",
    category: CLEANING,
    price: 120,
    additionals: [],
  },
  {
    ...ENGINE_WASH,
    type: "complementary",
    description:
      "Limpeza do compartimento do motor com produtos que protegem as partes elétricas.",
    category: WASH,
    price: 80,
    additionals: [],
  },
  {
    ...HEADLIGHT_RESTORATION,
    type: "complementary",
    description:
      "Lixamento, polimento e proteção dos faróis amarelados ou opacos.",
    category: POLISH,
    price: 150,
    additionals: [],
  },
  {
    ...OZONE_SANITIZING,
    type: "complementary",
    description:
      "Eliminação de odores, fungos e bactérias do interior com ozônio.",
    category: CLEANING,
    price: 100,
    additionals: [],
  },
];

// Every service the preview can price, also for the panel's demo.
export const CATALOG: readonly PricedService[] = [
  ...BOOKABLE_SERVICES,
  WAX,
  SHINE,
  LEATHER,
  REPELLENT,
];

// supabase/seed.sql: every payment method with 0% (RN012).
const PAYMENT_FEES = {
  credit: 0,
  debit: 0,
  pix: 0,
  cash: 0,
} as const satisfies Record<PaymentMethod, number>;

// RN034, for the demo only: the working periods of supabase/seed.sql, in
// minutes of the day, from Sunday (0) to Saturday (6). Monday to Friday from
// 08:00 to 18:00 with a break from 12:00 to 13:00, Saturday from 08:00 to
// 12:00, Sunday closed.
const WEEKDAY_PERIODS: readonly (readonly [start: number, end: number])[] = [
  [8 * MINUTES_PER_HOUR, 12 * MINUTES_PER_HOUR],
  [13 * MINUTES_PER_HOUR, 18 * MINUTES_PER_HOUR],
];
const SEED_WORKING_PERIODS: readonly (readonly (readonly [
  start: number,
  end: number,
])[])[] = [
  [],
  WEEKDAY_PERIODS,
  WEEKDAY_PERIODS,
  WEEKDAY_PERIODS,
  WEEKDAY_PERIODS,
  WEEKDAY_PERIODS,
  [[8 * MINUTES_PER_HOUR, 12 * MINUTES_PER_HOUR]],
];

// The body of POST /api/me/appointments/preview, as the booking sends it.
export type PreviewBody = {
  vehicleId: string;
  serviceIds: string[];
  paymentMethod?: PaymentMethod | null;
  scheduledAt?: string | null;
};

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
  if (!appointment) throw notFound();
  return appointment;
}

// GET /api/me/bookable-services, with the prices of the size of the vehicle
// (RN009).
export function answerBookableServices({
  query,
}: DemoRequest): Page<BookableService> {
  const { size } = findVehicle(query.get("vehicleId"));
  const services = BOOKABLE_SERVICES.map((service) =>
    toBookableService(service, size),
  );
  return demoPage(services, query, { pageSize: CATALOG_PAGE_SIZE });
}

// POST /api/me/appointments/preview, worked out over the demo data: the
// prices of the size of the vehicle, the fees of seed.sql and the duration
// spread over its business hours. The rules that count are the API's.
export function answerAppointmentPreview({
  body,
}: DemoRequest): AppointmentPreview {
  const { vehicleId, ...order } = body as PreviewBody;
  return previewOrder(findVehicle(vehicleId).size, order);
}

// The values of an order for a vehicle size, which the preview of the panel
// (src/lib/demo/admin-appointments.ts) works out the same way.
export function previewOrder(
  size: VehicleSize,
  { serviceIds, paymentMethod, scheduledAt }: Omit<PreviewBody, "vehicleId">,
): AppointmentPreview {
  // RN008, RN031: a service that cannot be booked is left out.
  const services = serviceIds.flatMap((id) => {
    const service = CATALOG.find((item) => item.id === id);
    return service ? [toAppointmentService(service, size)] : [];
  });
  const subtotal = services.reduce((sum, { price }) => sum + price, 0);
  const feePercent = paymentMethod ? PAYMENT_FEES[paymentMethod] : null;
  const estimatedDurationMinutes = services.reduce(
    (sum, { durationMinutes }) => sum + durationMinutes,
    0,
  );
  return {
    services,
    subtotal,
    feePercent,
    // RN010: the total rounded to the cent once.
    total:
      feePercent === null
        ? subtotal
        : Math.round(subtotal * (100 + feePercent)) / 100,
    estimatedDurationMinutes,
    estimatedEndAt: scheduledAt
      ? calculateDemoEnd(scheduledAt, estimatedDurationMinutes)
      : null,
  };
}

export function notFound(): ApiError {
  return new ApiError({
    status: ERROR_CATALOG.NOT_FOUND.status,
    code: "NOT_FOUND",
    detail: ERROR_CATALOG.NOT_FOUND.message,
  });
}

// RS009: only a vehicle of the account.
function findVehicle(id: string | null): AppointmentVehicle {
  const vehicle = VEHICLES.find((item) => item.id === id);
  if (!vehicle) throw notFound();
  return vehicle;
}

function priceFor(price: DemoPrice, size: VehicleSize): number {
  return typeof price === "number" ? price : price[VEHICLE_SIZES.indexOf(size)];
}

function toAppointmentService(
  { id, name, type, durationMinutes, price }: PricedService,
  size: VehicleSize,
): AppointmentService {
  return { id, name, type, durationMinutes, price: priceFor(price, size) };
}

function toBookableService(
  service: DemoBookableService,
  size: VehicleSize,
): BookableService {
  const { id, name, type, description, category, durationMinutes } = service;
  return {
    id,
    name,
    type,
    description,
    category,
    durationMinutes,
    price: priceFor(service.price, size),
    additionals: service.additionals.map((additional) => ({
      id: additional.id,
      name: additional.name,
      durationMinutes: additional.durationMinutes,
      price: priceFor(additional.price, size),
    })),
  };
}

// RN034, for the demo only, as calculateEstimatedEnd of
// src/server/rules/scheduling.ts: the duration spent in the working periods
// of seed.sql, from the start, skipping the break, the night and Sunday. Work
// that ends exactly at the closing or at the break ends there.
function calculateDemoEnd(scheduledAt: string, durationMinutes: number) {
  // The clock of the company, read as UTC.
  const start = new Date(
    Date.parse(scheduledAt) + COMPANY_OFFSET_MINUTES * MS_PER_MINUTE,
  );
  const startDay = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const startMinute =
    start.getUTCHours() * MINUTES_PER_HOUR + start.getUTCMinutes();
  let remainingMinutes = durationMinutes;
  for (let dayOffset = 0; ; dayOffset += 1) {
    const day = startDay + dayOffset * MS_PER_DAY;
    const fromMinute = dayOffset === 0 ? startMinute : 0;
    for (const [periodStart, periodEnd] of SEED_WORKING_PERIODS[
      new Date(day).getUTCDay()
    ]) {
      const begin = Math.max(periodStart, fromMinute);
      const availableMinutes = periodEnd - begin;
      if (availableMinutes <= 0) continue;
      if (remainingMinutes <= availableMinutes) {
        return toDemoInstant(day, begin + remainingMinutes);
      }
      remainingMinutes -= availableMinutes;
    }
  }
}

// An instant of the demo, in the company's time zone, as the other dates of
// this module.
function toDemoInstant(day: number, minuteOfDay: number): string {
  const calendarDay = new Date(day).toISOString().slice(0, 10);
  const hours = String(Math.floor(minuteOfDay / MINUTES_PER_HOUR));
  const minutes = String(minuteOfDay % MINUTES_PER_HOUR);
  return `${calendarDay}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00${COMPANY_OFFSET}`;
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
