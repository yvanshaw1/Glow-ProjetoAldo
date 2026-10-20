import { describe, expect, it } from "vitest";
import { formatDuration } from "@/shared/format/duration";

// Display of the average duration of a service, from 5 to 2,400 minutes
// (RN035, column Exibição): the part equal to zero is left out.

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1 h 30 min");
  });

  it("formats minutes under an hour", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(5)).toBe("5 min");
  });

  it("formats whole hours", () => {
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(2400)).toBe("40 h");
  });
});
