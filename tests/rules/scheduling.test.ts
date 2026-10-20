import { describe, expect, it } from "vitest";
import {
  calculateEstimatedDuration,
  calculateEstimatedEnd,
  findAvailabilityError,
  findStartError,
  type BusinessDay,
} from "@/server/rules/scheduling";
import { COMPANY_TIME_ZONE } from "@/shared/constants/time-zone";

// docs/agendamento/calculos.md, section 3. The hours of supabase/seed.sql
// (docs/configuracoes/dados.md): Monday to Friday from 08:00 to 18:00, with a
// break from 12:00 to 13:00; Saturday from 08:00 to 12:00; Sunday closed.
// Monday is 23 November 2026, and the instants carry the offset of Maceió,
// as the API sends them.

const CLOSED = {
  isOpen: false,
  opensAt: null,
  closesAt: null,
  breakStartsAt: null,
  breakEndsAt: null,
};
const WEEKDAY_HOURS = {
  isOpen: true,
  opensAt: "08:00",
  closesAt: "18:00",
  breakStartsAt: "12:00",
  breakEndsAt: "13:00",
};
const BUSINESS_HOURS: BusinessDay[] = [
  { weekday: 0, ...CLOSED },
  { weekday: 1, ...WEEKDAY_HOURS },
  { weekday: 2, ...WEEKDAY_HOURS },
  { weekday: 3, ...WEEKDAY_HOURS },
  { weekday: 4, ...WEEKDAY_HOURS },
  { weekday: 5, ...WEEKDAY_HOURS },
  {
    weekday: 6,
    isOpen: true,
    opensAt: "08:00",
    closesAt: "12:00",
    breakStartsAt: null,
    breakEndsAt: null,
  },
];

const MONDAY_BEFORE_OPENING = new Date("2026-11-23T07:00:00-03:00");

function checkStart(
  startsAt: string,
  now: Date = MONDAY_BEFORE_OPENING,
  businessHours: BusinessDay[] = BUSINESS_HOURS,
) {
  return findStartError({
    startsAt: new Date(startsAt),
    businessHours,
    timeZone: COMPANY_TIME_ZONE,
    now,
  });
}

function estimateEnd(
  startsAt: string,
  durationMinutes: number,
  businessHours: BusinessDay[] = BUSINESS_HOURS,
) {
  return calculateEstimatedEnd({
    startsAt: new Date(startsAt),
    durationMinutes,
    businessHours,
    timeZone: COMPANY_TIME_ZONE,
  });
}

describe("calculateEstimatedDuration", () => {
  it("sums the average durations (RN014)", () => {
    expect(
      calculateEstimatedDuration([
        { durationMinutes: 60 },
        { durationMinutes: 90 },
      ]),
    ).toBe(150);
  });
});

describe("findStartError", () => {
  it("accepts the first time of the day (RN013)", () => {
    expect(checkStart("2026-11-23T08:00:00-03:00")).toBeNull();
  });

  it("accepts the last slot before closing (RN013)", () => {
    expect(checkStart("2026-11-23T17:30:00-03:00")).toBeNull();
  });

  it("accepts a start at the end of the break (RN013)", () => {
    expect(checkStart("2026-11-23T13:00:00-03:00")).toBeNull();
  });

  it("rejects a start at closing time (RN013)", () => {
    expect(checkStart("2026-11-23T18:00:00-03:00")).toBe(
      "OUTSIDE_BUSINESS_HOURS",
    );
  });

  it("rejects a start before opening (RN013)", () => {
    expect(checkStart("2026-11-23T07:30:00-03:00")).toBe(
      "OUTSIDE_BUSINESS_HOURS",
    );
  });

  it("rejects a start during the break (RN013)", () => {
    expect(checkStart("2026-11-23T12:00:00-03:00")).toBe("DURING_BREAK");
    expect(checkStart("2026-11-23T12:30:00-03:00")).toBe("DURING_BREAK");
  });

  it("rejects a start off the 30-minute slots (RN035)", () => {
    expect(checkStart("2026-11-23T09:15:00-03:00")).toBe("OFF_TIME_SLOT");
    expect(checkStart("2026-11-23T09:00:30-03:00")).toBe("OFF_TIME_SLOT");
  });

  it("rejects a start on a closed day (RN013)", () => {
    expect(checkStart("2026-11-29T10:00:00-03:00")).toBe("CLOSED_DAY");
  });

  it("uses the hours of each weekday (RN013)", () => {
    expect(checkStart("2026-11-28T11:30:00-03:00")).toBeNull();
    expect(checkStart("2026-11-28T12:00:00-03:00")).toBe(
      "OUTSIDE_BUSINESS_HOURS",
    );
  });

  it("treats a weekday missing from the list as closed", () => {
    const withoutMonday = BUSINESS_HOURS.filter((day) => day.weekday !== 1);
    expect(
      checkStart(
        "2026-11-23T09:00:00-03:00",
        MONDAY_BEFORE_OPENING,
        withoutMonday,
      ),
    ).toBe("CLOSED_DAY");
  });

  it("reads the day and the time in the company's time zone", () => {
    // 09:00 and 12:30 on Monday in Maceió.
    expect(checkStart("2026-11-23T12:00:00Z")).toBeNull();
    expect(checkStart("2026-11-23T15:30:00Z")).toBe("DURING_BREAK");
  });

  it("rejects a start before now (RN015)", () => {
    const now = new Date("2026-11-23T10:10:00-03:00");
    expect(checkStart("2026-11-23T10:00:00-03:00", now)).toBe("IN_THE_PAST");
  });

  it("accepts a start at the current instant (RN015)", () => {
    const now = new Date("2026-11-23T10:00:00-03:00");
    expect(checkStart("2026-11-23T10:00:00-03:00", now)).toBeNull();
  });

  it("accepts a booking made while the company is closed", () => {
    // The hours limit the booked time, not the moment of the booking.
    const sundayNight = new Date("2026-11-29T22:00:00-03:00");
    expect(checkStart("2026-11-30T08:00:00-03:00", sundayNight)).toBeNull();
  });
});

describe("findAvailabilityError", () => {
  it("checks the hours without the current instant (RN033)", () => {
    // A past time within the hours, as in an edit after the vehicle arrives.
    expect(
      findAvailabilityError({
        startsAt: new Date("2026-11-16T09:00:00-03:00"),
        businessHours: BUSINESS_HOURS,
        timeZone: COMPANY_TIME_ZONE,
      }),
    ).toBeNull();
  });
});

describe("calculateEstimatedEnd", () => {
  it("ends on the same day (RN034)", () => {
    expect(estimateEnd("2026-11-23T09:00:00-03:00", 120)).toEqual(
      new Date("2026-11-23T11:00:00-03:00"),
    );
  });

  it("crosses the break (RN034)", () => {
    expect(estimateEnd("2026-11-23T11:00:00-03:00", 120)).toEqual(
      new Date("2026-11-23T14:00:00-03:00"),
    );
  });

  it("crosses the night (RN034)", () => {
    // 2 hours on Monday, 2 hours on Tuesday.
    expect(estimateEnd("2026-11-23T16:00:00-03:00", 240)).toEqual(
      new Date("2026-11-24T10:00:00-03:00"),
    );
  });

  it("skips a closed day (RN034)", () => {
    // Saturday from 11:00 to 12:00, Sunday closed, Monday from 08:00 to 09:00.
    expect(estimateEnd("2026-11-28T11:00:00-03:00", 120)).toEqual(
      new Date("2026-11-30T09:00:00-03:00"),
    );
  });

  it("ends at closing time on the same day (RN034)", () => {
    expect(estimateEnd("2026-11-23T16:00:00-03:00", 120)).toEqual(
      new Date("2026-11-23T18:00:00-03:00"),
    );
  });

  it("ends at the start of the break (RN034)", () => {
    expect(estimateEnd("2026-11-23T11:00:00-03:00", 60)).toEqual(
      new Date("2026-11-23T12:00:00-03:00"),
    );
  });

  it("spans several days (RN034)", () => {
    // 2,400 minutes, the longest service (RN035): 9 hours a day from Monday
    // to Thursday and 4 hours on Friday.
    expect(estimateEnd("2026-11-23T08:00:00-03:00", 2400)).toEqual(
      new Date("2026-11-27T12:00:00-03:00"),
    );
  });

  it("starts counting at the next period from a start outside the hours (RN034)", () => {
    // A kept date on a day the company closed after the booking (RN033).
    expect(estimateEnd("2026-11-29T10:00:00-03:00", 60)).toEqual(
      new Date("2026-11-30T09:00:00-03:00"),
    );
  });

  it("gives no forecast without an open day", () => {
    const allClosed = BUSINESS_HOURS.map((day) => ({ ...day, ...CLOSED }));
    expect(estimateEnd("2026-11-23T09:00:00-03:00", 60, allClosed)).toBeNull();
  });
});
