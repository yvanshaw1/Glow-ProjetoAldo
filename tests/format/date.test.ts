import { describe, expect, it } from "vitest";
import {
  formatCalendarDate,
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatLongDate,
  formatMonth,
  formatTime,
  formatYear,
  toCompanyInstant,
} from "@/shared/format/date";

// Display of the dates of RN035 (column Exibição) and RNF016, in the company's
// time zone, America/Maceio (UTC-3), whatever the zone of the device
// (decision 0053). A calendar date has no time zone and shows as it is. The
// booking (UC06) reads the day and the time of an instant there, and writes
// the instant of a chosen day and time as the API takes it: ISO 8601 with the
// offset (docs/padroes/api.md).

describe("formatDate", () => {
  it("formats an instant as the date in the company's time zone", () => {
    expect(formatDate("2026-10-15T12:30:00Z")).toBe("15/10/2026");
  });

  it("formats an instant sent with an offset", () => {
    expect(formatDate("2026-10-15T09:30:00-03:00")).toBe("15/10/2026");
  });

  it("uses the company's day near midnight", () => {
    expect(formatDate("2026-10-15T02:30:00Z")).toBe("14/10/2026");
  });

  it("formats a calendar date as it is", () => {
    expect(formatDate("2026-10-01")).toBe("01/10/2026");
  });
});

describe("formatDateTime", () => {
  it("formats the date and the time", () => {
    expect(formatDateTime("2026-10-15T12:30:00Z")).toBe("15/10/2026 às 09:30");
  });

  it("formats midnight as 00:00", () => {
    expect(formatDateTime("2026-10-15T03:00:00Z")).toBe("15/10/2026 às 00:00");
  });
});

describe("formatYear", () => {
  it("formats the year of an instant in the company's time zone", () => {
    expect(formatYear("2026-10-15T12:30:00Z")).toBe("2026");
  });

  it("uses the company's year near the new year", () => {
    expect(formatYear("2027-01-01T02:30:00Z")).toBe("2026");
    expect(formatYear("2027-01-01T03:00:00Z")).toBe("2027");
  });
});

describe("formatCalendarDate", () => {
  it("writes the calendar day of an instant in the company's time zone", () => {
    expect(formatCalendarDate("2026-10-22T12:00:00Z")).toBe("2026-10-22");
  });

  it("uses the company's day near midnight", () => {
    expect(formatCalendarDate("2026-10-22T02:30:00Z")).toBe("2026-10-21");
    expect(formatCalendarDate("2026-10-22T03:00:00Z")).toBe("2026-10-22");
  });
});

describe("formatTime", () => {
  it("writes the time of an instant in the company's time zone", () => {
    expect(formatTime("2026-10-22T12:00:00Z")).toBe("09:00");
  });

  it("writes a time near midnight", () => {
    expect(formatTime("2026-10-22T02:30:00Z")).toBe("23:30");
    expect(formatTime("2026-10-22T03:00:00Z")).toBe("00:00");
  });
});

describe("toCompanyInstant", () => {
  it("builds the instant of a day and a time in the company's time zone", () => {
    const instant = toCompanyInstant("2026-10-28", "09:00");

    expect(instant).toBe("2026-10-28T09:00:00-03:00");
    expect(Date.parse(instant)).toBe(Date.parse("2026-10-28T12:00:00Z"));
  });

  it("keeps the day of a time late in the evening", () => {
    expect(toCompanyInstant("2026-12-31", "17:30")).toBe(
      "2026-12-31T17:30:00-03:00",
    );
  });
});

describe("formatMonth", () => {
  it("writes the month and the year of a calendar day", () => {
    expect(formatMonth("2026-10-01")).toBe("outubro de 2026");
  });

  it("writes the month of the last day as it is", () => {
    expect(formatMonth("2026-12-31")).toBe("dezembro de 2026");
  });
});

describe("formatLongDate", () => {
  it("writes the weekday and the date of a calendar day", () => {
    expect(formatLongDate("2026-10-28")).toBe(
      "quarta-feira, 28 de outubro de 2026",
    );
  });

  it("writes the first day of a month as it is", () => {
    expect(formatLongDate("2026-11-01")).toBe("domingo, 1 de novembro de 2026");
  });
});

describe("formatDayMonth", () => {
  it("writes a calendar day as the day and the month", () => {
    expect(formatDayMonth("2026-10-05")).toBe("05/10");
  });

  it("keeps the calendar day, as an instant it would still be the day before", () => {
    expect(formatDayMonth("2026-10-01")).toBe("01/10");
  });

  it("writes the last day of the year and a leap day", () => {
    expect(formatDayMonth("2026-12-31")).toBe("31/12");
    expect(formatDayMonth("2028-02-29")).toBe("29/02");
  });
});
