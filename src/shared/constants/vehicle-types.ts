// RN002: the type informed in the vehicle register, from which the database
// derives the size (vehicle_type enum, decision 0013).
export const VEHICLE_TYPES = ["hatch", "sedan", "suv", "pickup"] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

// The types as the screens show them (RN002).
export const VEHICLE_TYPE_LABELS = {
  hatch: "Hatch",
  sedan: "Sedan",
  suv: "SUV",
  pickup: "Picape",
} as const satisfies Record<VehicleType, string>;
