import { demoPage } from "@/lib/demo/list";
import type { DemoRequest } from "@/lib/demo/routes";
import type { Page } from "@/shared/api/pagination";
import type { ClientVehicle, VehicleLookup } from "@/shared/api/vehicles";
import { SHORT_LIST_PAGE_SIZE } from "@/shared/constants/pagination";
import type { VehicleType } from "@/shared/constants/vehicle-types";

// Demo data of the vehicles module (decision 0055), from
// supabase/seed-demo.sql: the vehicles of Henrique Costa, the client of
// src/lib/demo/clients.ts, and every vehicle of the seed for the plate
// lookup. The ids are the seed's (md5 of 'glow-demo:vehicle:<plate>' as a
// UUID), so the routes of phase 3 answer the same ones.

const UPDATED_AT = "2026-06-23T12:00:00+00:00";

// The two vehicles of the account, in the order of the seed's links. The SW4
// is also linked to Isabela Melo (RN036).
const CLIENT_VEHICLES: ClientVehicle[] = [
  {
    id: "a229a2b8-eb46-90df-1285-bcd05a9570a0",
    plate: "GLW8H08",
    type: "pickup",
    size: "extra_large",
    brand: "Fiat",
    model: "Toro",
    color: "Azul",
    year: 2021,
    isShared: false,
    updatedAt: UPDATED_AT,
  },
  {
    id: "c27d6551-0c94-5624-d779-0cad75a490a3",
    plate: "GLW5L15",
    type: "suv",
    size: "large",
    brand: "Toyota",
    model: "SW4",
    color: "Prata",
    year: 2019,
    isShared: true,
    updatedAt: UPDATED_AT,
  },
];

// The plate, type, brand, model, color and year of the 14 vehicles of the
// seed, as in its insert.
export type SeedVehicle = [
  plate: string,
  type: VehicleType,
  brand: string,
  model: string,
  color: string,
  year: number,
];

export const SEED_VEHICLES: readonly SeedVehicle[] = [
  ["GLW1A01", "hatch", "Volkswagen", "Polo", "Prata", 2021],
  ["GLW2B02", "sedan", "Toyota", "Corolla", "Preto", 2022],
  ["GLW3C03", "suv", "Jeep", "Compass", "Branco", 2023],
  ["GLW4D04", "pickup", "Toyota", "Hilux", "Prata", 2020],
  ["GLW5E05", "hatch", "Hyundai", "HB20", "Branco", 2019],
  ["GLW6F06", "sedan", "Honda", "City", "Cinza", 2021],
  ["GLW7G07", "suv", "Hyundai", "Creta", "Vermelho", 2022],
  ["GLW8H08", "pickup", "Fiat", "Toro", "Azul", 2021],
  ["GLW9J09", "hatch", "Chevrolet", "Onix", "Preto", 2020],
  ["GLW1010", "sedan", "Volkswagen", "Virtus", "Branco", 2023],
  ["GLW2020", "suv", "Volkswagen", "T-Cross", "Cinza", 2024],
  ["GLW3030", "pickup", "Chevrolet", "S10", "Preto", 2018],
  ["GLW4K14", "hatch", "Fiat", "Argo", "Vermelho", 2022],
  ["GLW5L15", "suv", "Toyota", "SW4", "Prata", 2019],
];

// GET /api/me/vehicles
export function answerVehicles({ query }: DemoRequest): Page<ClientVehicle> {
  return demoPage(CLIENT_VEHICLES, query, { pageSize: SHORT_LIST_PAGE_SIZE });
}

// GET /api/me/vehicles/lookup, with the plate as typed: RN035 takes it with
// or without the hyphen and in lower case.
export function answerVehicleLookup({
  query,
}: DemoRequest): VehicleLookup | null {
  const plate = (query.get("plate") ?? "").toUpperCase().replaceAll("-", "");
  const vehicle = SEED_VEHICLES.find(([seedPlate]) => seedPlate === plate);
  if (!vehicle) return null;
  const [, type, brand, model, color, year] = vehicle;
  return { type, brand, model, color, year };
}
