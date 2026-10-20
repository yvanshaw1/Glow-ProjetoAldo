import { describe, expect, it } from "vitest";
import { formatCnpj } from "@/shared/format/cnpj";

// Display of the CNPJ of RN035 (column Exibição), also used as the mask of the
// CNPJ field while it is typed. Since July 2026 the first twelve characters
// may be letters.

describe("formatCnpj", () => {
  it("formats a CNPJ with the mask", () => {
    expect(formatCnpj("12345678000195")).toBe("12.345.678/0001-95");
  });

  it("formats an alphanumeric CNPJ in upper case", () => {
    expect(formatCnpj("12abc34501de35")).toBe("12.ABC.345/01DE-35");
  });

  it("formats a CNPJ while it is typed", () => {
    expect(formatCnpj("12")).toBe("12");
    expect(formatCnpj("123")).toBe("12.3");
    expect(formatCnpj("123456")).toBe("12.345.6");
    expect(formatCnpj("123456789")).toBe("12.345.678/9");
    expect(formatCnpj("1234567800019")).toBe("12.345.678/0001-9");
  });

  it("keeps a formatted CNPJ as it is", () => {
    expect(formatCnpj("12.345.678/0001-95")).toBe("12.345.678/0001-95");
  });

  it("keeps only letters and digits, up to fourteen", () => {
    expect(formatCnpj("12.345.678/0001-9512")).toBe("12.345.678/0001-95");
    expect(formatCnpj("")).toBe("");
  });
});
