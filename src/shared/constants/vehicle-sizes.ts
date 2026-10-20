// RN002: the size the database derives from the vehicle type, which sets the
// price of the services by size (vehicle_size enum, decision 0013).
export const VEHICLE_SIZES = [
  "small",
  "medium",
  "large",
  "extra_large",
] as const;

export type VehicleSize = (typeof VEHICLE_SIZES)[number];

// The sizes as the screens show them (docs/clientes/dados.md).
export const VEHICLE_SIZE_LABELS = {
  small: "P",
  medium: "M",
  large: "G",
  extra_large: "GG",
} as const satisfies Record<VehicleSize, string>;
