// RN009: a service has one fixed price or one price per vehicle size
// (pricing_mode enum).
export const PRICING_MODES = ["fixed", "by_size"] as const;

export type PricingMode = (typeof PRICING_MODES)[number];

// Names of the modes in the glossary (guia/mapa.md).
export const PRICING_MODE_LABELS = {
  fixed: "Valor fixo",
  by_size: "Por porte",
} as const satisfies Record<PricingMode, string>;
