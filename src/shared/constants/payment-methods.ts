// RN011: the payment methods, chosen in the booking and paid in person
// (payment_method enum).
export const PAYMENT_METHODS = ["credit", "debit", "pix", "cash"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Names of the methods in RN011 and in the glossary (guia/mapa.md).
export const PAYMENT_METHOD_LABELS = {
  credit: "Crédito",
  debit: "Débito",
  pix: "Pix",
  cash: "Dinheiro",
} as const satisfies Record<PaymentMethod, string>;
