import type { VehicleSize } from "@/shared/constants/vehicle-sizes";
import type { VehicleType } from "@/shared/constants/vehicle-types";

// Bodies of the vehicle routes of the client in docs/clientes/rotas.md
// (UC05). An empty optional field is null (docs/padroes/api.md).

// One item of the page of GET /api/me/vehicles, in the order the vehicles
// were linked to the account.
export type ClientVehicle = {
  id: string;
  // In upper case, without the hyphen (RN035).
  plate: string;
  type: VehicleType;
  // RN002: derived from the type by the database (decision 0013).
  size: VehicleSize;
  brand: string;
  model: string;
  color: string;
  year: number;
  // RN036, UC05 FE03: the vehicle is also linked to another account, so
  // only the company changes its data.
  isShared: boolean;
  // RNF011: sent back on the PATCH as it came, treated as text.
  updatedAt: string;
};

// GET /api/me/vehicles/lookup: the vehicle of a plate already registered,
// with no data of its clients (RN036); the body is null for a new plate.
export type VehicleLookup = Pick<
  ClientVehicle,
  "type" | "brand" | "model" | "color" | "year"
>;
