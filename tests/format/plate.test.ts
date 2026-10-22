import { describe, expect, it } from "vitest";
import { formatPlate } from "@/shared/format/plate";

// Display of the plate of RN035 (column Exibição): ABC1D23 in the Mercosul
// pattern and ABC-1234 in the old one. The plate field also uses it as the
// mask while the plate is typed. The plates are those of seed-demo.sql.

describe("formatPlate", () => {
  it("keeps a Mercosul plate as stored", () => {
    expect(formatPlate("GLW1A01")).toBe("GLW1A01");
  });

  it("adds the hyphen to an old plate", () => {
    expect(formatPlate("GLW1010")).toBe("GLW-1010");
  });

  it("removes the hyphen typed in a Mercosul plate", () => {
    expect(formatPlate("glw-1a01")).toBe("GLW1A01");
  });

  it("masks a plate while it is typed", () => {
    expect(formatPlate("glw")).toBe("GLW");
    expect(formatPlate("glw1")).toBe("GLW1");
    expect(formatPlate("glw10")).toBe("GLW-10");
    expect(formatPlate("glw1a")).toBe("GLW1A");
  });

  it("ignores other characters and stops at seven", () => {
    expect(formatPlate("glw 1a01x")).toBe("GLW1A01");
  });
});
