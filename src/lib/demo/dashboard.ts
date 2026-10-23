import { ApiError } from "@/lib/api-client";
import type { DemoRequest } from "@/lib/demo/routes";
import type {
  Dashboard,
  DashboardAgendaItem,
  DashboardAnalysis,
  DashboardAnalysisHighlight,
} from "@/shared/api/dashboard";
import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "@/shared/constants/appointment-statuses";
import { ERROR_CATALOG } from "@/shared/errors/catalog";
import { formatCalendarDate, toCompanyInstant } from "@/shared/format/date";

// Demo data of the dashboard (decision 0055). The appointments of the period
// are generated, as the ones of supabase/seed-demo.sql, from 90 days before
// today to 14 days after it, on the business days of supabase/seed.sql
// (Monday to Friday and a short Saturday): the number of each day is worked
// out from the day itself, with no Math.random, so the numbers do not change
// between reads. The indicators are worked out over them as RN021 and
// docs/agendamento/calculos.md (section 5) say, and the agenda of the day is a
// fixed list of the clients, vehicles and services of the seed. Both routes
// are read-only: the analysis is a POST that writes nothing (UC27).

const MS_PER_DAY = 86_400_000;
const DAYS_BEFORE_TODAY = 90;
const DAYS_AFTER_TODAY = 14;
const SUNDAY = 0;
const SATURDAY = 6;
const CENTS_PER_REAL = 100;
const PERCENT = 100;
// RN035: up to 12 months, which is up to 366 days counting both dates.
const MAX_PERIOD_DAYS = 366;
// A multiplicative hash: the high bits of the product vary from a day to the
// next one, the low bits do not.
const HASH_MULTIPLIER = 2_654_435_761;
const HASH_SHIFT = 16;
const SLOTS_PER_DAY = 8;
// As the seed: a day to come has 5% of cancelled appointments; a past day,
// 10% of cancelled and 5% of rescheduled ones.
const FUTURE_CANCELLED_PERCENT = 5;
const PAST_CANCELLED_PERCENT = 10;
const PAST_RESCHEDULED_PERCENT = 15;
const CALENDAR_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_MESSAGE = "Preencha este campo.";
const REVERSED_PERIOD_MESSAGE = "A data final não pode ser anterior à inicial.";
const LONG_PERIOD_MESSAGE = "O período não pode passar de 12 meses.";

// RN021: the appointments paid.
const PAID_STATUSES: readonly AppointmentStatus[] = [
  "completed",
  "rescheduled",
];

// The totals of the combinations of services of the seed that
// src/lib/demo/appointments.ts uses, at the prices of the size of the Fiat
// Toro and the Toyota SW4.
const TOTALS = [105, 130, 190, 220, 390, 550];

// An appointment of the period. In the demo it is completed on its scheduled
// day, so the day of completion of RN021 is the same one.
type DemoAppointment = {
  scheduledDay: string;
  status: AppointmentStatus;
  total: number;
};

type Period = { from: string; to: string };

type DemoAgendaItem = Omit<
  DashboardAgendaItem,
  "scheduledAt" | "estimatedEndAt"
> & {
  // The time of the start and of the estimated end (RN034), on today.
  start: string;
  end: string;
};

// The appointments of today, always on the day of the call, even on a day the
// company is closed. The ids are md5 of 'glow-demo:dashboard-agenda:<n>' as a
// UUID; the clients, vehicles and services are the seed's, with the prices of
// the size of each vehicle (RN002).
const AGENDA: readonly DemoAgendaItem[] = [
  {
    id: "f49e0e6a-a990-4c55-a9fd-df88f546da87",
    status: "completed",
    start: "08:00",
    end: "08:50",
    clientName: "Ana Souza",
    vehicle: { plate: "GLW1A01", brand: "Volkswagen", model: "Polo" },
    services: [
      { id: "c64b0c68-6690-ab4c-dd8d-397aec5be871", name: "Lavagem simples" },
      {
        id: "c4c3b3ae-8b50-6a4f-af47-041a8f2c210e",
        name: "Pretinho nos pneus",
      },
    ],
    total: 50,
  },
  {
    id: "4b09a3f6-62f4-67b7-d971-c7e21bbfb1e5",
    status: "awaiting_payment",
    start: "09:00",
    end: "10:30",
    clientName: "Bruno Lima",
    vehicle: { plate: "GLW2B02", brand: "Toyota", model: "Corolla" },
    services: [
      { id: "7ce749ea-491a-fa99-6834-718d1fe5725e", name: "Lavagem completa" },
    ],
    total: 85,
  },
  {
    id: "e5312705-3160-eca5-5520-050ca3cd8755",
    status: "in_progress",
    start: "09:30",
    // Through the break.
    end: "13:30",
    clientName: "Carla Mendes",
    vehicle: { plate: "GLW3C03", brand: "Jeep", model: "Compass" },
    services: [
      { id: "a338b84b-5bc4-06aa-b66f-025b61bd7a64", name: "Lavagem técnica" },
    ],
    total: 220,
  },
  {
    id: "f56e5aee-73a8-98c7-a4f8-19db053c474b",
    status: "checked_in",
    start: "10:30",
    end: "11:30",
    clientName: "Diego Ferreira",
    vehicle: { plate: "GLW4D04", brand: "Toyota", model: "Hilux" },
    services: [
      { id: "c64b0c68-6690-ab4c-dd8d-397aec5be871", name: "Lavagem simples" },
      { id: "ac4fa6ae-6246-3d34-9fd9-4f849625ecb6", name: "Cera de carnaúba" },
    ],
    total: 105,
  },
  {
    id: "a1aca3ec-d7ba-8fe8-c961-51606236c4c7",
    status: "scheduled",
    start: "14:00",
    end: "18:00",
    clientName: "Eduarda Santos",
    vehicle: { plate: "GLW5E05", brand: "Hyundai", model: "HB20" },
    services: [
      {
        id: "7cb46ab5-32b1-f8e0-e0a7-6d9f9cf55798",
        name: "Polimento comercial",
      },
    ],
    total: 280,
  },
  {
    id: "ea196580-5211-4342-8891-7c1afdb3759e",
    status: "cancelled",
    start: "15:00",
    end: "16:00",
    clientName: "Felipe Araújo",
    vehicle: { plate: "GLW6F06", brand: "Honda", model: "City" },
    services: [
      {
        id: "cff70583-8ed7-ad1c-ab6a-bc266b04f31f",
        name: "Higienização do ar-condicionado",
      },
    ],
    total: 120,
  },
];

// RN039: the text only interprets the indicators, with no digits, and says
// nothing about the direction of a change, because the demo does not compare
// the indicators of the two periods. The summary has up to 600 characters and
// each observation, up to 240.
const SUMMARY =
  "Em linhas gerais, o período teve movimento regular, com a receita concentrada nos serviços concluídos e uma taxa de cancelamento que pede atenção. Esta é uma análise de demonstração, escrita à mão: com a rota ligada, o texto virá do serviço de inteligência artificial a partir dos números do período.";

const HIGHLIGHTS: DashboardAnalysisHighlight[] = [
  {
    indicator: "revenue",
    comment:
      "A receita acompanha o ritmo dos atendimentos concluídos, e os dias de maior movimento concentram boa parte dela.",
  },
  {
    indicator: "appointmentCount",
    comment:
      "Os agendamentos se distribuem pelos dias úteis, e o sábado fica mais leve porque a empresa funciona só meio período.",
  },
  {
    indicator: "averageTicket",
    comment:
      "O ticket médio depende da mistura entre lavagens simples e serviços de maior valor, como polimento e higienização.",
  },
  {
    indicator: "cancellationRate",
    comment:
      "Os cancelamentos merecem acompanhamento: confirmar o agendamento perto da data pode ajudar a reduzi-los.",
  },
];

// GET /api/admin/dashboard (UC09): the period of the query, or the current
// month when it has none.
export function answerDashboard({ query }: DemoRequest): Dashboard {
  const today = formatCalendarDate(new Date().toISOString());
  const month = findMonth(today);
  const period = {
    from: readCalendarDay(query.get("from")) ?? month.from,
    to: readCalendarDay(query.get("to")) ?? month.to,
  };
  assertPeriod(period);

  const appointments = listAppointments(today).filter((appointment) =>
    isWithin(appointment.scheduledDay, period),
  );
  const paid = appointments.filter(({ status }) =>
    PAID_STATUSES.includes(status),
  );
  const revenue = sumTotals(paid);
  const cancelled = countWithStatus(appointments, "cancelled");

  return {
    ...period,
    revenue,
    appointmentCount: appointments.length,
    averageTicket: paid.length === 0 ? 0 : roundToCents(revenue / paid.length),
    cancellationRate:
      appointments.length === 0
        ? 0
        : roundToCents((cancelled / appointments.length) * PERCENT),
    revenueByDay: listDays(period).map((date) => ({
      date,
      revenue: sumTotals(
        paid.filter((appointment) => appointment.scheduledDay === date),
      ),
    })),
    appointmentsByStatus: APPOINTMENT_STATUSES.map((status) => ({
      status,
      count: countWithStatus(appointments, status),
    })),
    agenda: AGENDA.map(({ start, end, ...item }) => ({
      ...item,
      scheduledAt: toCompanyInstant(today, start),
      estimatedEndAt: toCompanyInstant(today, end),
    })),
  };
}

// POST /api/admin/dashboard/analysis (UC27): a fixed text, for the period of
// the body. The previous period (RN038) only tells whether there is something
// to compare. The screen does not offer the analysis of a period without
// appointments (UC27 FE01), so the answer for it is not simulated.
export function answerDashboardAnalysis({
  body,
}: DemoRequest): DashboardAnalysis {
  const from = readBodyDay(body, "from");
  const to = readBodyDay(body, "to");
  if (!from || !to) {
    throw validationError({
      ...(from ? {} : { from: REQUIRED_MESSAGE }),
      ...(to ? {} : { to: REQUIRED_MESSAGE }),
    });
  }
  const period = { from, to };
  assertPeriod(period);

  const days = countDays(period);
  const previousTo = addDays(from, -1);
  const previousPeriod = {
    from: addDays(previousTo, 1 - days),
    to: previousTo,
  };
  const today = formatCalendarDate(new Date().toISOString());
  return {
    ...period,
    previousFrom: previousPeriod.from,
    previousTo: previousPeriod.to,
    hasComparison: listAppointments(today).some((appointment) =>
      isWithin(appointment.scheduledDay, previousPeriod),
    ),
    summary: SUMMARY,
    highlights: HIGHLIGHTS,
    generatedAt: new Date().toISOString(),
  };
}

// The generated appointments and the ones of the agenda of today.
function listAppointments(today: string): DemoAppointment[] {
  const todayNumber = toDayNumber(today);
  const days = Array.from(
    { length: DAYS_BEFORE_TODAY + 1 + DAYS_AFTER_TODAY },
    (_, index) => todayNumber - DAYS_BEFORE_TODAY + index,
  );
  const generated = days
    .filter((day) => day !== todayNumber && findWeekday(day) !== SUNDAY)
    .flatMap((day) => {
      const count =
        findWeekday(day) === SATURDAY
          ? 1 + (drawFor(day, 0) % 2)
          : 2 + (drawFor(day, 0) % 3);
      return Array.from({ length: count }, (_, index) => {
        const draw = drawFor(day, index + 1);
        return {
          scheduledDay: fromDayNumber(day),
          status: pickStatus(day < todayNumber, draw % PERCENT),
          total: TOTALS[Math.floor(draw / PERCENT) % TOTALS.length],
        };
      });
    });
  const fixed = AGENDA.map(({ status, total }) => ({
    scheduledDay: today,
    status,
    total,
  }));
  return [...generated, ...fixed];
}

// A number from 0 to 65535 for a day and a slot of the day.
function drawFor(dayNumber: number, slot: number): number {
  return (
    Math.imul(dayNumber * SLOTS_PER_DAY + slot, HASH_MULTIPLIER) >>> HASH_SHIFT
  );
}

function pickStatus(isPast: boolean, percent: number): AppointmentStatus {
  if (!isPast) {
    return percent < FUTURE_CANCELLED_PERCENT ? "cancelled" : "scheduled";
  }
  if (percent < PAST_CANCELLED_PERCENT) return "cancelled";
  return percent < PAST_RESCHEDULED_PERCENT ? "rescheduled" : "completed";
}

function countWithStatus(
  appointments: readonly DemoAppointment[],
  status: AppointmentStatus,
): number {
  return appointments.filter((appointment) => appointment.status === status)
    .length;
}

function sumTotals(appointments: readonly DemoAppointment[]): number {
  return appointments.reduce((sum, { total }) => sum + total, 0);
}

function roundToCents(value: number): number {
  return Math.round(value * CENTS_PER_REAL) / CENTS_PER_REAL;
}

// A calendar day written as 2026-10-01, or null when the value is not one.
function readCalendarDay(value: string | null): string | null {
  if (value === null || !CALENDAR_DAY_PATTERN.test(value)) return null;
  const day = toDayNumber(value);
  // Date.parse accepts 2026-02-30 and moves it to the next month.
  return Number.isNaN(day) || fromDayNumber(day) !== value ? null : value;
}

function readBodyDay(body: unknown, name: keyof Period): string | null {
  if (typeof body !== "object" || body === null) return null;
  const value: unknown = Reflect.get(body, name);
  return typeof value === "string" ? readCalendarDay(value) : null;
}

// RN035: the first day not after the last one, up to 366 days.
function assertPeriod(period: Period): void {
  const days = countDays(period);
  if (days < 1) throw validationError({ to: REVERSED_PERIOD_MESSAGE });
  if (days > MAX_PERIOD_DAYS)
    throw validationError({ to: LONG_PERIOD_MESSAGE });
}

function validationError(fields: Record<string, string>): ApiError {
  return new ApiError({
    status: ERROR_CATALOG.VALIDATION_ERROR.status,
    code: "VALIDATION_ERROR",
    detail: ERROR_CATALOG.VALIDATION_ERROR.message,
    fields,
  });
}

function isWithin(day: string, { from, to }: Period): boolean {
  return day >= from && day <= to;
}

// The days of the period, both included.
function listDays(period: Period): string[] {
  const first = toDayNumber(period.from);
  return Array.from({ length: countDays(period) }, (_, index) =>
    fromDayNumber(first + index),
  );
}

function countDays({ from, to }: Period): number {
  return toDayNumber(to) - toDayNumber(from) + 1;
}

// The current month, from its first day to its last one.
function findMonth(today: string): Period {
  const date = new Date(`${today}T00:00:00Z`);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return {
    from: fromDayNumber(Date.UTC(year, month, 1) / MS_PER_DAY),
    // Day 0 of the next month is the last one of this month.
    to: fromDayNumber(Date.UTC(year, month + 1, 0) / MS_PER_DAY),
  };
}

function addDays(day: string, amount: number): string {
  return fromDayNumber(toDayNumber(day) + amount);
}

// A calendar day has no time zone: it is read as midnight in UTC and counted
// in days since 1970-01-01, so the arithmetic never meets a time change.
function toDayNumber(day: string): number {
  return Date.parse(`${day}T00:00:00Z`) / MS_PER_DAY;
}

function fromDayNumber(dayNumber: number): string {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

function findWeekday(dayNumber: number): number {
  return new Date(dayNumber * MS_PER_DAY).getUTCDay();
}
