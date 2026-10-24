import { notFound } from "@/lib/demo/appointments";
import { SEED_CLIENTS } from "@/lib/demo/clients";
import { demoPage } from "@/lib/demo/list";
import type { DemoRequest } from "@/lib/demo/routes";
import { SEED_VEHICLES, SIZE_BY_TYPE, VEHICLE_IDS } from "@/lib/demo/vehicles";
import type { AdminClient } from "@/shared/api/clients";
import type { Page } from "@/shared/api/pagination";
import type { ClientVehicle } from "@/shared/api/vehicles";
import {
  ADMIN_LIST_PAGE_SIZE,
  SHORT_LIST_PAGE_SIZE,
} from "@/shared/constants/pagination";
import { formatPhone } from "@/shared/format/phone";

// Demo data of the panel routes of the clients module (decision 0055), from
// supabase/seed-demo.sql: its 13 clients and their vehicles, the SW4 in two
// accounts (RN036). The ids are the seed's, so the routes of #42 and #45
// answer the same ones. The plate lookup is the one of the client area
// (src/lib/demo/vehicles.ts).

const UPDATED_AT = "2026-06-23T12:00:00+00:00";
const SORT_LOCALE = "pt-BR";

function toAdminClient({
  id,
  firstName,
  lastName,
  email,
  phone,
}: (typeof SEED_CLIENTS)[number]): AdminClient {
  return { id, firstName, lastName, email, phone, updatedAt: UPDATED_AT };
}

// In alphabetical order of the full name (docs/clientes/clientes-do-painel.md).
const CLIENTS: AdminClient[] = SEED_CLIENTS.map(toAdminClient).sort(
  (first, second) =>
    `${first.firstName} ${first.lastName}`.localeCompare(
      `${second.firstName} ${second.lastName}`,
      SORT_LOCALE,
    ),
);

// GET /api/admin/clients: the search looks at the name, the e-mail and the
// phone, with or without the mask (UC17 step 3, RF070).
export function answerAdminClients({ query }: DemoRequest): Page<AdminClient> {
  return demoPage(CLIENTS, query, {
    pageSize: ADMIN_LIST_PAGE_SIZE,
    searchIn: ({ firstName, lastName, email, phone }) => [
      `${firstName} ${lastName}`,
      email,
      phone,
      formatPhone(phone),
    ],
  });
}

// GET /api/admin/clients/:id
export function answerAdminClient({ params }: DemoRequest): AdminClient {
  const client = CLIENTS.find(({ id }) => id === params.id);
  if (!client) throw notFound();
  return client;
}

// GET /api/admin/clients/:id/vehicles: in the order of the seed's links.
export function answerAdminClientVehicles({
  params,
  query,
}: DemoRequest): Page<ClientVehicle> {
  const client = SEED_CLIENTS.find(({ id }) => id === params.id);
  if (!client) throw notFound();
  const vehicles = client.plates.map((plate) => toClientVehicle(plate));
  return demoPage(vehicles, query, { pageSize: SHORT_LIST_PAGE_SIZE });
}

function toClientVehicle(plate: string): ClientVehicle {
  const seedVehicle = SEED_VEHICLES.find(([seedPlate]) => seedPlate === plate);
  if (!seedVehicle) {
    throw new Error(`No vehicle of the seed has the plate ${plate}`);
  }
  const [, type, brand, model, color, year] = seedVehicle;
  return {
    id: VEHICLE_IDS[plate],
    plate,
    type,
    size: SIZE_BY_TYPE[type],
    brand,
    model,
    color,
    year,
    // RN036: the vehicle is in more than one account.
    isShared:
      SEED_CLIENTS.filter((client) => client.plates.includes(plate)).length > 1,
    updatedAt: UPDATED_AT,
  };
}
