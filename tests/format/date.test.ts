import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatYear } from "@/shared/format/date";

// Display of the dates of RN035 (column Exibição) and RNF016, in the company's
// time zone, America/Maceio (UTC-3), whatever the zone of the device
// (decision 0053). A calendar date has no time zone and shows as it is.

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
