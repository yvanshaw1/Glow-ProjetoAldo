// RN006: main and complementary services are booked alone; an additional one
// only with a main service it is linked to (service_type enum).
export const SERVICE_TYPES = ["main", "additional", "complementary"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

// Names of the types in the glossary (guia/mapa.md).
export const SERVICE_TYPE_LABELS = {
  main: "Principal",
  additional: "Adicional",
  complementary: "Complementar",
} as const satisfies Record<ServiceType, string>;
