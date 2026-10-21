import { describe, expect, it } from "vitest";
import { formatBusinessHours } from "@/shared/format/business-hours";

// Business hours of one day on the home page (docs/catalogo/
// paginas-publicas.md, Localização), with the times as the API gives them:
// HH:MM in the company's time zone. The days are those of supabase/seed.sql.

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
