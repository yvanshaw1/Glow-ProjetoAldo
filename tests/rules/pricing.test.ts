import { describe, expect, it } from "vitest";
import {
  calculateServicePrice,
  calculateTotal,
  findCompositionError,
  priceServices,
  type CompositionService,
  type PricedService,
} from "@/server/rules/pricing";

// docs/agendamento/calculos.md, section 1: values in reais in and out,
// computed in whole cents (RN009, RN010, RN012). Only the total is rounded,
// with half a cent up.

const WASH: PricedService = {
  id: "wash",
  pricingMode: "by_size",
  pricesBySize: { small: 80, medium: 100, large: 120, extra_large: 150 },
};
const POLISH: PricedService = {
  id: "polish",
  pricingMode: "fixed",
  fixedPrice: 80,
};
// An additional service always has a fixed price (RN009).
const WAX: PricedService = { id: "wax", pricingMode: "fixed", fixedPrice: 30 };

describe("calculateServicePrice", () => {
  it("prices a by-size service with the price of the vehicle size (RN009)", () => {
    // RN002: an SUV is large (G); the database derives the size from the type.
    expect(calculateServicePrice(WASH, "large")).toBe(120);
  });

  it("prices a fixed service with the same value for any size (RN009)", () => {
    const service: PricedService = {
      id: "interior",
      pricingMode: "fixed",
      fixedPrice: 50,
    };
    expect(calculateServicePrice(service, "small")).toBe(50);
    expect(calculateServicePrice(service, "extra_large")).toBe(50);
  });

  it("prices an additional service with its fixed price (RN009)", () => {
    expect(calculateServicePrice(WAX, "medium")).toBe(30);
  });
});

describe("priceServices", () => {
  const priceWashAndPolish = (feePercent: number) =>
    priceServices({
      services: [WASH, POLISH],
      vehicleSize: "large",
      feePercent,
    });

  it("sums the items into the subtotal (RN010)", () => {
    expect(priceWashAndPolish(0).subtotal).toBe(200);
  });

  it("sums cents without floating-point error", () => {
    const services: PricedService[] = [
      { id: "first", pricingMode: "fixed", fixedPrice: 0.1 },
      { id: "second", pricingMode: "fixed", fixedPrice: 0.2 },
    ];
    const { subtotal } = priceServices({
      services,
      vehicleSize: "small",
      feePercent: 0,
    });
    expect(subtotal).toBe(0.3);
  });

  it("adds the surcharge of the payment method (RN010, RN012)", () => {
    expect(priceWashAndPolish(5).total).toBe(210);
  });

  it("subtracts the discount of the payment method (RN012)", () => {
    expect(priceWashAndPolish(-3).total).toBe(194);
  });

  it("keeps the subtotal without adjustment (RN012)", () => {
    expect(priceWashAndPolish(0).total).toBe(200);
  });

  it("gives a zero total with a full discount (RN012)", () => {
    expect(priceWashAndPolish(-100).total).toBe(0);
  });

  it("prices the selection item by item (RN009, RN010)", () => {
    expect(
      priceServices({
        services: [WASH, WAX],
        vehicleSize: "large",
        feePercent: -5,
      }),
    ).toEqual({
      items: [
        { serviceId: "wash", price: 120 },
        { serviceId: "wax", price: 30 },
      ],
      subtotal: 150,
      total: 142.5,
    });
  });
});

describe("calculateTotal", () => {
  it("applies a percent with two decimals (RN035)", () => {
    // 99.90 × 1.0275 = 102.64725
    expect(calculateTotal({ subtotal: 99.9, feePercent: 2.75 })).toBe(102.65);
  });

  it("rounds to the nearest cent", () => {
    // 99.90 × 0.97 = 96.903
    expect(calculateTotal({ subtotal: 99.9, feePercent: -3 })).toBe(96.9);
  });

  it("rounds half a cent up", () => {
    // 150.10 × 1.05 = 157.605
    expect(calculateTotal({ subtotal: 150.1, feePercent: 5 })).toBe(157.61);
  });

  it("rounds half a cent up with a discount", () => {
    // 150.10 × 0.95 = 142.595
    expect(calculateTotal({ subtotal: 150.1, feePercent: -5 })).toBe(142.6);
  });

  it("recalculates the total from the stored subtotal with another payment method (RN018)", () => {
    // Booked with Pix without adjustment, paid by credit with a 5% surcharge.
    expect(calculateTotal({ subtotal: 200, feePercent: 5 })).toBe(210);
  });
});

describe("findCompositionError", () => {
  const MAIN_A: CompositionService = {
    id: "main-a",
    type: "main",
    linkedMainServiceIds: [],
  };
  const MAIN_B: CompositionService = {
    id: "main-b",
    type: "main",
    linkedMainServiceIds: [],
  };
  const COMPLEMENTARY: CompositionService = {
    id: "complementary",
    type: "complementary",
    linkedMainServiceIds: [],
  };
  const ADDITIONAL_OF_A: CompositionService = {
    id: "additional-a",
    type: "additional",
    linkedMainServiceIds: ["main-a"],
  };

  it("accepts a main service alone (RN005)", () => {
    expect(findCompositionError([MAIN_A])).toBeNull();
  });

  it("accepts a complementary service alone (RN005)", () => {
    expect(findCompositionError([COMPLEMENTARY])).toBeNull();
  });

  it("accepts an additional with the main service it is linked to (RN006)", () => {
    expect(findCompositionError([MAIN_A, ADDITIONAL_OF_A])).toBeNull();
  });

  it("accepts an additional linked to one of the selected main services (RN006)", () => {
    const additionalOfBAndC: CompositionService = {
      id: "additional-bc",
      type: "additional",
      linkedMainServiceIds: ["main-b", "main-c"],
    };
    expect(
      findCompositionError([MAIN_A, MAIN_B, additionalOfBAndC]),
    ).toBeNull();
  });

  it("rejects an empty selection (RN005)", () => {
    expect(findCompositionError([])).toBe("NO_MAIN_OR_COMPLEMENTARY");
  });

  it("rejects an additional service alone (RN005)", () => {
    expect(findCompositionError([ADDITIONAL_OF_A])).toBe(
      "NO_MAIN_OR_COMPLEMENTARY",
    );
  });

  it("rejects an additional whose main service is not selected (RN006)", () => {
    expect(findCompositionError([COMPLEMENTARY, ADDITIONAL_OF_A])).toBe(
      "ADDITIONAL_WITHOUT_MAIN",
    );
  });

  it("rejects an additional with a main service it is not linked to (RN006)", () => {
    expect(findCompositionError([MAIN_B, ADDITIONAL_OF_A])).toBe(
      "ADDITIONAL_WITHOUT_MAIN",
    );
  });
});
