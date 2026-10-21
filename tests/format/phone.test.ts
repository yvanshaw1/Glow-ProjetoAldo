import { describe, expect, it } from "vitest";
import {
  formatPhone,
  formatPhoneLink,
  formatWhatsAppLink,
} from "@/shared/format/phone";

// Display of the phones of RN035 (column Exibição), also used as the mask of
// the phone fields while they are typed (docs/padroes/frontend.md).

describe("formatPhone", () => {
  it("formats a mobile phone with the area code", () => {
    expect(formatPhone("82999998888")).toBe("(82) 99999-8888");
  });

  it("formats a landline with the area code", () => {
    expect(formatPhone("8233334444")).toBe("(82) 3333-4444");
  });

  it("formats a phone while it is typed", () => {
    expect(formatPhone("")).toBe("");
    expect(formatPhone("8")).toBe("(8");
    expect(formatPhone("82")).toBe("(82");
    expect(formatPhone("829")).toBe("(82) 9");
    expect(formatPhone("8299998")).toBe("(82) 9999-8");
    expect(formatPhone("8299999888")).toBe("(82) 9999-9888");
  });

  it("keeps a formatted phone as it is", () => {
    expect(formatPhone("(82) 99999-8888")).toBe("(82) 99999-8888");
  });

  it("keeps only digits, up to eleven", () => {
    expect(formatPhone("829999988881")).toBe("(82) 99999-8888");
    expect(formatPhone("abc")).toBe("");
  });
});

describe("formatPhoneLink", () => {
  it("links a phone for calling", () => {
    expect(formatPhoneLink("8233334444")).toBe("tel:+558233334444");
    expect(formatPhoneLink("82999998888")).toBe("tel:+5582999998888");
  });
});

describe("formatWhatsAppLink", () => {
  it("links the WhatsApp to a chat", () => {
    expect(formatWhatsAppLink("82999998888")).toBe(
      "https://wa.me/5582999998888",
    );
  });
});
