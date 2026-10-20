import { describe, expect, it } from "vitest";
import { formatCurrency, readCurrencyInput } from "@/shared/format/currency";

// Display of the values in reais of RN035 (column Exibição) and RNF016. Intl
// puts a no-break space (U+00A0) between R$ and the number. The money field
// shows formatCurrency and reads each typed digit as the last cent
// (docs/padroes/componentes.md, Campo monetário).

describe("formatCurrency", () => {
  it("formats a value in reais", () => {
    expect(formatCurrency(1250)).toBe("R$ 1.250,00");
  });

  it("formats cents with two decimals", () => {
    expect(formatCurrency(0.5)).toBe("R$ 0,50");
  });

  it("formats the largest value", () => {
    expect(formatCurrency(99999.99)).toBe("R$ 99.999,99");
  });

  it("formats zero, the total with a full discount", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });
});

describe("readCurrencyInput", () => {
  it("reads the typed digits as cents", () => {
    expect(readCurrencyInput("1")).toBe(0.01);
    expect(readCurrencyInput("125000")).toBe(1250);
  });

  it("reads a digit typed after a formatted value", () => {
    expect(readCurrencyInput("R$ 1.250,005")).toBe(12500.05);
  });

  it("reads a value after a deleted digit", () => {
    expect(readCurrencyInput("R$ 1.250,0")).toBe(125);
  });

  it("ignores the leading zeros", () => {
    expect(readCurrencyInput("R$ 0,005")).toBe(0.05);
  });

  it("ignores a digit beyond the largest value", () => {
    expect(readCurrencyInput("R$ 99.999,991")).toBe(99999.99);
  });

  it("reads no value without digits or with zeros only", () => {
    expect(readCurrencyInput("")).toBeNull();
    expect(readCurrencyInput("R$ ")).toBeNull();
    expect(readCurrencyInput("abc")).toBeNull();
    expect(readCurrencyInput("0")).toBeNull();
  });
});
