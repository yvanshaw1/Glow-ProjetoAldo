import { describe, expect, it } from "vitest";
import { formatPercent } from "@/shared/format/percent";

// Display of the percent of a payment method of RN035 (column Exibição):
// from 0 to 100, with two decimals, as 5,00%. The screen passes the absolute
// value and writes "Acréscimo" or "Desconto" by the sign.

describe("formatPercent", () => {
  it("formats a percent with two decimals", () => {
    expect(formatPercent(5)).toBe("5,00%");
  });

  it("formats a fractional percent", () => {
    expect(formatPercent(2.75)).toBe("2,75%");
  });

  it("formats the whole", () => {
    expect(formatPercent(100)).toBe("100,00%");
  });
});
