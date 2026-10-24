import { ApiError } from "@/lib/api-client";
import {
  CATALOG,
  notFound,
  previewOrder,
  type PreviewBody,
} from "@/lib/demo/appointments";
import { demoPage } from "@/lib/demo/list";
import type { DemoRequest } from "@/lib/demo/routes";
import { SEED_VEHICLES } from "@/lib/demo/vehicles";
import type {
  AdminAppointment,
  AdminAppointmentSummary,
  AppointmentPreview,
  AppointmentVehicle,
  PaymentOption,
} from "@/shared/api/appointments";
import type { Page } from "@/shared/api/pagination";
import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "@/shared/constants/appointment-statuses";
import {
  APPOINTMENT_SORTS,
  APPOINTMENT_VIEWS,
  APPOINTMENT_VIEW_STATUSES,
  type AppointmentSort,
  type AppointmentView,
} from "@/shared/constants/appointment-views";
import { ADMIN_LIST_PAGE_SIZE } from "@/shared/constants/pagination";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/shared/constants/payment-methods";
import type { VehicleSize } from "@/shared/constants/vehicle-sizes";
import type { VehicleType } from "@/shared/constants/vehicle-types";
import { ERROR_CATALOG } from "@/shared/errors/catalog";
import { formatCalendarDate, toCompanyInstant } from "@/shared/format/date";

// Demo data of the appointments of the panel (decision 0055): 50 appointments
// of the 12 clients and 14 vehicles of supabase/seed-demo.sql, with the
// services and the prices by size of the same seed and the fees of
// supabase/seed.sql (all zero), worked out by the preview of
// src/lib/demo/appointments.ts. The six of today repeat the agenda of the
// dashboard (src/lib/demo/dashboard.ts). The days are relative to today in the
// company's time zone, always on the business days of the seed, so the counts
// of each view do not change from one day to the next: 6 today, 8 in the
// future and 36 in the history (docs/agendamento/rotas.md, L1 of
// memoria/tarefas/61-agendamentos-do-painel/01_plano.md).

const MS_PER_DAY = 86_400_000;
const DAYS_PER_WEEK = 7;
const UPDATED_AT = "2026-06-23T12:00:00+00:00";
const VIEW_MESSAGE = "Escolha uma visão válida.";

// RN002: the size the database derives from the type (decision 0013).
const SIZE_BY_TYPE = {
  hatch: "small",
  sedan: "medium",
  suv: "large",
  pickup: "extra_large",
} as const satisfies Record<VehicleType, VehicleSize>;

// The ids are the seed's (md5 of 'glow-demo:vehicle:<plate>' as a UUID), and
// the client is the one in whose name the appointments of the vehicle are (the
// SW4 is also in the account of Isabela Melo, RN036).
const ACCOUNTS: Record<string, [id: string, clientName: string]> = {
  GLW1A01: ["52697984-4a36-5e0a-8d64-c791dee31a2b", "Ana Souza"],
  GLW2B02: ["3909c1ba-30f5-1e8b-e50f-bb09ca12e1d4", "Bruno Lima"],
  GLW3C03: ["5c168feb-a9c0-91d9-f989-dd8b85b48c28", "Carla Mendes"],
  GLW4D04: ["fd673331-08e6-5c34-caeb-393e3cad961f", "Diego Ferreira"],
  GLW5E05: ["265c94d0-f92e-ede6-4c31-724a59100f76", "Eduarda Santos"],
  GLW6F06: ["a4465e8d-97a9-edc3-412e-99a605abcc32", "Felipe Araújo"],
  GLW7G07: ["c9398a22-566d-2ece-94b1-aa1a6d4874bc", "Gabriela Rocha"],
  GLW8H08: ["a229a2b8-eb46-90df-1285-bcd05a9570a0", "Henrique Costa"],
  GLW9J09: ["b5cc9755-56bc-3069-585c-5ef100d07aaa", "Isabela Melo"],
  GLW1010: ["28ab2b1f-29da-26da-0cdb-fd0bf368c2f8", "João Pedro Barros"],
  GLW2020: ["422d165d-2555-9576-8c7c-930748de9569", "Larissa Cavalcanti"],
  GLW3030: ["f0829d46-fc4b-ebf1-1ce0-675cdbd9180f", "Marcos Tenório"],
  GLW4K14: ["da326a11-65e9-b083-759d-50f4c6188bb6", "Ana Souza"],
  GLW5L15: ["c27d6551-0c94-5624-d779-0cad75a490a3", "Henrique Costa"],
};

const VEHICLES: readonly AppointmentVehicle[] = SEED_VEHICLES.map(
  ([plate, type, brand, model, color, year]) => ({
    id: ACCOUNTS[plate][0],
    plate,
    type,
    size: SIZE_BY_TYPE[type],
    brand,
    model,
    color,
    year,
  }),
);

// The combinations of services of seed-demo.sql the appointments use, by
// name, in the catalog of src/lib/demo/appointments.ts.
const COMBOS: readonly (readonly string[])[] = [
  ["Lavagem simples", "Pretinho nos pneus"],
  ["Lavagem simples"],
  ["Lavagem simples", "Cera de carnaúba"],
  ["Lavagem completa"],
  ["Lavagem completa", "Cera de carnaúba"],
  ["Lavagem completa", "Pretinho nos pneus", "Repelente de chuva nos vidros"],
  ["Lavagem completa", "Lavagem de motor"],
  ["Lavagem técnica", "Hidratação de couro"],
  ["Polimento comercial"],
  ["Higienização interna completa", "Oxi-sanitização"],
  ["Higienização do ar-condicionado"],
  ["Lavagem técnica"],
];

// The ids of the six appointments of today, which are the ones of the agenda
// of the dashboard, by the plate of the vehicle; the others are numbered.
const AGENDA_IDS: Record<string, string> = {
  GLW1A01: "f49e0e6a-a990-4c55-a9fd-df88f546da87",
  GLW2B02: "4b09a3f6-62f4-67b7-d971-c7e21bbfb1e5",
  GLW3C03: "e5312705-3160-eca5-5520-050ca3cd8755",
  GLW4D04: "f56e5aee-73a8-98c7-a4f8-19db053c474b",
  GLW5E05: "a1aca3ec-d7ba-8fe8-c961-51606236c4c7",
  GLW6F06: "ea196580-5211-4342-8891-7c1afdb3759e",
};

// The day of the call, or the days after the Monday of the current week: the
// negative ones are before any day of the week, and 7 or more are after it.
type DemoDay = number | "today";

type DemoRow = [
  status: AppointmentStatus,
  day: DemoDay,
  time: string,
  plate: string,
  combo: number,
  paymentMethod: PaymentMethod,
];

const ROWS: readonly DemoRow[] = [
  // Today: the four of the agenda of the dashboard still open, and two of
  // days before it that nobody moved on (UC10, RF044).
  ["awaiting_payment", "today", "09:00", "GLW2B02", 3, "credit"],
  ["in_progress", "today", "09:30", "GLW3C03", 11, "debit"],
  ["checked_in", "today", "10:30", "GLW4D04", 2, "cash"],
  ["scheduled", "today", "14:00", "GLW5E05", 8, "pix"],
  ["scheduled", -3, "16:00", "GLW7G07", 6, "debit"],
  ["checked_in", -4, "10:00", "GLW9J09", 4, "pix"],
  // In the future.
  ["scheduled", 7, "09:00", "GLW1010", 1, "pix"],
  ["scheduled", 8, "10:30", "GLW2020", 3, "credit"],
  ["scheduled", 9, "08:00", "GLW3030", 7, "debit"],
  ["scheduled", 10, "14:00", "GLW4K14", 5, "cash"],
  ["scheduled", 11, "09:30", "GLW1A01", 8, "pix"],
  ["scheduled", 14, "13:00", "GLW6F06", 9, "credit"],
  ["scheduled", 15, "08:30", "GLW8H08", 4, "debit"],
  ["scheduled", 17, "15:00", "GLW5L15", 10, "cash"],
  // History: the two of the agenda of the dashboard that are not open, and
  // the last six weeks, 25 Concluído, 6 Cancelado and 3 Reagendado.
  ["completed", "today", "08:00", "GLW1A01", 0, "pix"],
  ["cancelled", "today", "15:00", "GLW6F06", 10, "credit"],
  ["completed", -3, "08:00", "GLW3C03", 1, "pix"],
  ["completed", -4, "09:30", "GLW6F06", 6, "credit"],
  ["completed", -5, "10:30", "GLW9J09", 11, "debit"],
  ["cancelled", -6, "13:30", "GLW3030", 4, "cash"],
  ["completed", -7, "14:30", "GLW1A01", 9, "pix"],
  ["completed", -9, "08:30", "GLW4D04", 2, "credit"],
  ["completed", -10, "16:00", "GLW7G07", 7, "debit"],
  ["completed", -11, "09:00", "GLW1010", 0, "cash"],
  ["cancelled", -12, "11:00", "GLW4K14", 5, "pix"],
  ["completed", -13, "13:00", "GLW2B02", 10, "credit"],
  ["completed", -14, "08:00", "GLW5E05", 3, "debit"],
  ["completed", -16, "08:30", "GLW8H08", 2, "cash"],
  ["completed", -17, "10:30", "GLW2020", 1, "pix"],
  ["completed", -18, "13:30", "GLW5L15", 6, "credit"],
  ["cancelled", -19, "14:30", "GLW3C03", 11, "debit"],
  ["completed", -20, "15:00", "GLW6F06", 4, "cash"],
  ["completed", -21, "16:00", "GLW9J09", 9, "pix"],
  ["completed", -23, "08:30", "GLW3030", 2, "credit"],
  ["completed", -24, "11:00", "GLW1A01", 7, "debit"],
  ["cancelled", -25, "13:00", "GLW4D04", 0, "cash"],
  ["completed", -26, "08:00", "GLW7G07", 5, "pix"],
  ["completed", -27, "09:30", "GLW1010", 10, "credit"],
  ["rescheduled", -28, "10:30", "GLW4K14", 3, "debit"],
  ["completed", -30, "08:30", "GLW2B02", 2, "cash"],
  ["completed", -31, "14:30", "GLW5E05", 1, "pix"],
  ["cancelled", -32, "15:00", "GLW8H08", 6, "credit"],
  ["completed", -33, "16:00", "GLW2020", 11, "debit"],
  ["completed", -34, "09:00", "GLW5L15", 4, "cash"],
  ["rescheduled", -35, "11:00", "GLW3C03", 9, "pix"],
  ["completed", -37, "08:30", "GLW6F06", 2, "credit"],
  ["completed", -38, "08:00", "GLW9J09", 7, "debit"],
  ["cancelled", -39, "09:30", "GLW3030", 0, "cash"],
  ["completed", -40, "10:30", "GLW1A01", 5, "pix"],
  ["rescheduled", -41, "13:30", "GLW4D04", 10, "credit"],
];

// GET /api/admin/appointments (UC10): the page of a view, with the status, the
// search and the sorting of the query.
export function answerAdminAppointments({
  query,
}: DemoRequest): Page<AdminAppointmentSummary> {
  const view = readView(query.get("view"));
  const sort =
    APPOINTMENT_SORTS.find((item) => item === query.get("sort")) ?? "time";
  const now = new Date();
  const today = formatCalendarDate(now.toISOString());
  const appointments = listAppointments(now)
    .filter((appointment) => isInView(appointment, view, today))
    // The latest first in the history, the nearest first in the others.
    .sort(compareAppointments(sort, view === "history" ? -1 : 1))
    .map(toSummary);
  return demoPage(appointments, query, {
    pageSize: ADMIN_LIST_PAGE_SIZE,
    searchIn: ({ clientName, vehicle }) => [
      clientName,
      vehicle.plate,
      vehicle.brand,
      vehicle.model,
    ],
    filters: { status: ({ status }) => status },
  });
}

// GET /api/admin/appointments/:id
export function answerAdminAppointment({
  params,
}: DemoRequest): AdminAppointment {
  const appointment = listAppointments(new Date()).find(
    ({ id }) => id === params.id,
  );
  if (!appointment) throw notFound();
  return appointment;
}

// POST /api/admin/appointments/preview, worked out as the one of the client:
// only the vehicles of the seed, and the rules that count are the API's.
export function answerAdminAppointmentPreview({
  body,
}: DemoRequest): AppointmentPreview {
  const { vehicleId, ...order } = body as PreviewBody;
  const vehicle = VEHICLES.find(({ id }) => id === vehicleId);
  if (!vehicle) throw notFound();
  return previewOrder(vehicle.size, order);
}

// The appointments with their instants in the week of now.
function listAppointments(now: Date): AdminAppointment[] {
  const today = formatCalendarDate(now.toISOString());
  const daysAfterMonday =
    (findWeekday(today) + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
  const monday = addDays(today, -daysAfterMonday);
  return ROWS.map(([status, day, time, plate, combo, paymentMethod], index) => {
    const vehicle = findVehicle(plate);
    const serviceIds = COMBOS[combo].map(findServiceId);
    const isToday = day === "today";
    const date = isToday ? today : addDays(monday, day);
    // Today stays at its hours even when the company is closed, as the
    // agenda of the dashboard: the end (RN034) is worked out on the Monday
    // of the week, a business day, and moved to today.
    const preview = previewOrder(vehicle.size, {
      serviceIds,
      paymentMethod,
      scheduledAt: toCompanyInstant(isToday ? monday : date, time),
    });
    if (!preview.estimatedEndAt) throw new Error("The end of the preview");
    return {
      id: isToday ? AGENDA_IDS[plate] : demoId(index),
      status,
      scheduledAt: toCompanyInstant(date, time),
      estimatedEndAt: moveDays(
        preview.estimatedEndAt,
        isToday ? daysBetween(monday, today) : 0,
      ),
      estimatedDurationMinutes: preview.estimatedDurationMinutes,
      clientName: ACCOUNTS[plate][1],
      paymentMethod,
      subtotal: preview.subtotal,
      // A method was given, so the preview has the fee.
      feePercent: preview.feePercent ?? 0,
      total: preview.total,
      vehicle,
      services: preview.services,
      updatedAt: UPDATED_AT,
      paymentOptions:
        status === "awaiting_payment"
          ? listPaymentOptions(vehicle.size, serviceIds)
          : null,
    };
  });
}

// RF053: the total of each payment method, in the order of RN011.
function listPaymentOptions(
  size: VehicleSize,
  serviceIds: string[],
): PaymentOption[] {
  return PAYMENT_METHODS.map((paymentMethod) => {
    const { feePercent, total } = previewOrder(size, {
      serviceIds,
      paymentMethod,
    });
    return { paymentMethod, feePercent: feePercent ?? 0, total };
  });
}

function toSummary({
  id,
  status,
  scheduledAt,
  estimatedEndAt,
  clientName,
  vehicle: { plate, brand, model },
  services,
  total,
}: AdminAppointment): AdminAppointmentSummary {
  return {
    id,
    status,
    scheduledAt,
    estimatedEndAt,
    clientName,
    vehicle: { plate, brand, model },
    services: services.map(({ id, name }) => ({ id, name })),
    total,
  };
}

function readView(value: string | null): AppointmentView {
  const view = APPOINTMENT_VIEWS.find((item) => item === value);
  if (!view) {
    throw new ApiError({
      status: ERROR_CATALOG.VALIDATION_ERROR.status,
      code: "VALIDATION_ERROR",
      detail: ERROR_CATALOG.VALIDATION_ERROR.message,
      fields: { view: VIEW_MESSAGE },
    });
  }
  return view;
}

// The statuses of the view, and for the open ones the day: today also has the
// days before it.
function isInView(
  { status, scheduledAt }: AdminAppointment,
  view: AppointmentView,
  today: string,
): boolean {
  const statuses: readonly AppointmentStatus[] =
    APPOINTMENT_VIEW_STATUSES[view];
  if (!statuses.includes(status)) return false;
  if (view === "history") return true;
  const day = formatCalendarDate(scheduledAt);
  return view === "today" ? day <= today : day > today;
}

// RF045: by the time, or by the status in the order of RN017 and, inside
// each status, by the time.
function compareAppointments(sort: AppointmentSort, direction: 1 | -1) {
  const byTime = (first: AdminAppointment, second: AdminAppointment): number =>
    direction *
    (Date.parse(first.scheduledAt) - Date.parse(second.scheduledAt));
  if (sort === "time") return byTime;
  return (first: AdminAppointment, second: AdminAppointment): number =>
    APPOINTMENT_STATUSES.indexOf(first.status) -
      APPOINTMENT_STATUSES.indexOf(second.status) || byTime(first, second);
}

function findVehicle(plate: string): AppointmentVehicle {
  const vehicle = VEHICLES.find((item) => item.plate === plate);
  if (!vehicle)
    throw new Error(`No vehicle of the seed has the plate ${plate}`);
  return vehicle;
}

function findServiceId(name: string): string {
  const service = CATALOG.find((item) => item.name === name);
  if (!service) throw new Error(`No service of the catalog is ${name}`);
  return service.id;
}

// The appointments of the seed are drawn at random, so these ids are not in
// it: a number in the shape of a UUID.
function demoId(index: number): string {
  return `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
}

// A calendar day has no time zone: it is read as midnight in UTC, so the
// arithmetic never meets a time change.
function addDays(day: string, amount: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + amount * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

function daysBetween(first: string, second: string): number {
  return (Date.parse(second) - Date.parse(first)) / MS_PER_DAY;
}

// From 0 (Sunday) to 6 (Saturday).
function findWeekday(day: string): number {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

// The same time, some days later, in the company's time zone.
function moveDays(instant: string, amount: number): string {
  return toCompanyInstant(
    addDays(formatCalendarDate(instant), amount),
    instant.slice(11, 16),
  );
}
