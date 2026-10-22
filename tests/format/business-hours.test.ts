import { describe, expect, it } from "vitest";
import type { BusinessDay } from "@/shared/api/settings";
import {
  formatBusinessHours,
  listStartTimes,
} from "@/shared/format/business-hours";

// Business hours of one day on the home page (docs/catalogo/
// paginas-publicas.md, Localização), and its start times in the booking
// (docs/agendamento/agendar-servico.md), with the times as the API gives
// them: HH:MM in the company's time zone. The days are those of
// supabase/seed.sql.

const MONDAY: BusinessDay = {
  weekday: 1,
  isOpen: true,
  opensAt: "08:00",
  closesAt: "18:00",
  breakStartsAt: "12:00",
  breakEndsAt: "13:00",
};

const SATURDAY: BusinessDay = {
  weekday: 6,
  isOpen: true,
  opensAt: "08:00",
  closesAt: "12:00",
  breakStartsAt: null,
  breakEndsAt: null,
};

const SUNDAY: BusinessDay = {
  weekday: 0,
  isOpen: false,
  opensAt: null,
  closesAt: null,
  breakStartsAt: null,
  breakEndsAt: null,
};

describe("formatBusinessHours", () => {
  it("formats a day with a break", () => {
    expect(
      formatBusinessHours({
        weekday: 1,
        isOpen: true,
        opensAt: "08:00",
        closesAt: "18:00",
        breakStartsAt: "12:00",
        breakEndsAt: "13:00",
      }),
    ).toBe("08:00 às 12:00 e 13:00 às 18:00");
  });

  it("formats a day without a break", () => {
    expect(
      formatBusinessHours({
        weekday: 6,
        isOpen: true,
        opensAt: "08:00",
        closesAt: "12:00",
        breakStartsAt: null,
        breakEndsAt: null,
      }),
    ).toBe("08:00 às 12:00");
  });

  it("formats a closed day", () => {
    expect(
      formatBusinessHours({
        weekday: 0,
        isOpen: false,
        opensAt: null,
        closesAt: null,
        breakStartsAt: null,
        breakEndsAt: null,
      }),
    ).toBe("Fechado");
  });
});

// RN013 and RN035: an appointment starts on the hour or half hour, from the
// opening (included) to the closing (excluded), out of the break.
describe("listStartTimes", () => {
  it("lists the start times every 30 minutes, out of the break", () => {
    expect(listStartTimes(MONDAY)).toEqual([
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
    ]);
  });

  it("lists the start times of a day without a break", () => {
    expect(listStartTimes(SATURDAY)).toEqual([
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
    ]);
  });

  it("returns no time on a closed day", () => {
    expect(listStartTimes(SUNDAY)).toEqual([]);
  });

  it("starts at the opening and stops before the closing", () => {
    expect(
      listStartTimes({ ...SATURDAY, opensAt: "08:30", closesAt: "10:00" }),
    ).toEqual(["08:30", "09:00", "09:30"]);
  });

  it("skips a break that ends on the half hour", () => {
    expect(
      listStartTimes({
        ...MONDAY,
        opensAt: "11:00",
        closesAt: "15:00",
        breakEndsAt: "13:30",
      }),
    ).toEqual(["11:00", "11:30", "13:30", "14:00", "14:30"]);
  });
});
