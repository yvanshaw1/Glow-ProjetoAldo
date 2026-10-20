import "server-only";
import type { ServiceType } from "@/shared/constants/service-types";
import type { VehicleSize } from "@/shared/constants/vehicle-sizes";

// docs/agendamento/calculos.md, section 1 (RN009, RN010, RN012). Values in
// reais in and out, as the database, the API and the screens use them; the
// sum and the adjustment are made in whole cents (docs/padroes/api.md), so
// 0.10 + 0.20 is 0.30.

const CENTS_PER_REAL = 100;
// A percent has up to two decimals (RN035): 2.75% is 275 hundredths.
const HUNDREDTHS_PER_PERCENT = 100;
const HUNDREDTHS_IN_WHOLE = 10_000;

export type ServicePricing =
  | { pricingMode: "fixed"; fixedPrice: number }
  | {
      pricingMode: "by_size";
      pricesBySize: Readonly<Record<VehicleSize, number>>;
    };

export type PricedService = ServicePricing & { id: string };

export type PricedItem = { serviceId: string; price: number };

export type AppointmentPrice = {
  items: PricedItem[];
  subtotal: number;
  total: number;
};

// Services with the type and, for an additional one, the main services it is
// linked to (service_additionals).
export type CompositionService = {
  id: string;
  type: ServiceType;
  linkedMainServiceIds: readonly string[];
};

export type CompositionError =
  "NO_MAIN_OR_COMPLEMENTARY" | "ADDITIONAL_WITHOUT_MAIN";

function toCents(value: number): number {
  return Math.round(value * CENTS_PER_REAL);
}

function toReais(cents: number): number {
  return cents / CENTS_PER_REAL;
}

// Only the total is rounded, once, to the nearest cent, with half a cent up.
// The total is never negative, so this is also what round() of PostgreSQL
// gives (calculos.md).
function calculateTotalInCents(subtotalInCents: number, feePercent: number) {
  const feeInHundredths = Math.round(feePercent * HUNDREDTHS_PER_PERCENT);
  const totalInHundredths =
    subtotalInCents * (HUNDREDTHS_IN_WHOLE + feeInHundredths);
  return Math.floor(
    (totalInHundredths + HUNDREDTHS_IN_WHOLE / 2) / HUNDREDTHS_IN_WHOLE,
  );
}

// RN009: the price of the vehicle size, or the fixed price; an additional
// service always has a fixed price (docs/catalogo/dados.md).
export function calculateServicePrice(
  service: ServicePricing,
  vehicleSize: VehicleSize,
): number {
  return service.pricingMode === "fixed"
    ? service.fixedPrice
    : service.pricesBySize[vehicleSize];
}

// RN010 and RN012: the subtotal adjusted by the percent of the payment method,
// positive for a surcharge and negative for a discount. Also the total of a
// completion with another payment method (RN018).
export function calculateTotal({
  subtotal,
  feePercent,
}: {
  subtotal: number;
  feePercent: number;
}): number {
  return toReais(calculateTotalInCents(toCents(subtotal), feePercent));
}

// The price of each item, the subtotal and the total, always from the
// current catalog (RN020, decision 0021).
export function priceServices({
  services,
  vehicleSize,
  feePercent,
}: {
  services: readonly PricedService[];
  vehicleSize: VehicleSize;
  feePercent: number;
}): AppointmentPrice {
  const items = services.map((service) => ({
    serviceId: service.id,
    price: calculateServicePrice(service, vehicleSize),
  }));
  const subtotalInCents = items.reduce(
    (sum, item) => sum + toCents(item.price),
    0,
  );
  return {
    items,
    subtotal: toReais(subtotalInCents),
    total: toReais(calculateTotalInCents(subtotalInCents, feePercent)),
  };
}

export function findCompositionError(
  services: readonly CompositionService[],
): CompositionError | null {
  // RN005: at least one main or complementary service.
  if (services.every((service) => service.type === "additional")) {
    return "NO_MAIN_OR_COMPLEMENTARY";
  }
  // RN006: an additional service only with a main service it is linked to.
  const mainServiceIds = new Set(
    services
      .filter((service) => service.type === "main")
      .map((service) => service.id),
  );
  const hasAdditionalWithoutMain = services.some(
    (service) =>
      service.type === "additional" &&
      !service.linkedMainServiceIds.some((id) => mainServiceIds.has(id)),
  );
  return hasAdditionalWithoutMain ? "ADDITIONAL_WITHOUT_MAIN" : null;
}
