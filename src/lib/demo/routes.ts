import type { HttpMethod } from "@/lib/api-client";

// Decision 0055: the routes not built yet, answered by the API client with
// the demo data of this folder (docs/padroes/componentes.md, Telas de
// demonstração). The task that builds a route takes it out of this list.

// The parameters of the path, as :id, and the query of the call.
export type DemoRequest = {
  params: Record<string, string>;
  query: URLSearchParams;
};

// Gives the body of a read, with the type of src/shared/api.
export type DemoAnswer = (request: DemoRequest) => unknown;

export type DemoRoute = {
  method: HttpMethod;
  // As in docs/*/rotas.md, with :name for a parameter of the path.
  path: string;
  // Only a read has it: it loads the data module when a screen asks for it.
  // A write has none and is refused with NOT_IMPLEMENTED.
  load?: () => Promise<DemoAnswer>;
};

export const DEMO_ROUTES: readonly DemoRoute[] = [
  // docs/catalogo/rotas.md, built by #48.
  {
    method: "GET",
    path: "/api/public/categories",
    load: () =>
      import("@/lib/demo/catalog").then(
        (catalog) => catalog.answerPublicCategories,
      ),
  },
  {
    method: "GET",
    path: "/api/public/services",
    load: () =>
      import("@/lib/demo/catalog").then(
        (catalog) => catalog.answerPublicServices,
      ),
  },
  // docs/clientes/rotas.md, built in phase 3.
  {
    method: "GET",
    path: "/api/me/profile",
    load: () =>
      import("@/lib/demo/clients").then((clients) => clients.answerProfile),
  },
  { method: "PATCH", path: "/api/me/profile" },
  {
    method: "GET",
    path: "/api/me/vehicles",
    load: () =>
      import("@/lib/demo/vehicles").then((vehicles) => vehicles.answerVehicles),
  },
  {
    method: "GET",
    path: "/api/me/vehicles/lookup",
    load: () =>
      import("@/lib/demo/vehicles").then(
        (vehicles) => vehicles.answerVehicleLookup,
      ),
  },
  { method: "POST", path: "/api/me/vehicles" },
  { method: "PATCH", path: "/api/me/vehicles/:id" },
];
