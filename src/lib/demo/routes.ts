import type { HttpMethod } from "@/lib/api-client";

// Decision 0055: the routes not built yet, answered by the API client with
// the demo data of this folder (docs/padroes/componentes.md, Telas de
// demonstração). The task that builds a route takes it out of this list.

// The parameters of the path, as :id, the query and the body of the call.
export type DemoRequest = {
  params: Record<string, string>;
  query: URLSearchParams;
  // As the screen sent it; a read by POST, like the preview, answers by it.
  body: unknown;
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
  // docs/catalogo/rotas.md, built by #40 and #44.
  {
    method: "GET",
    path: "/api/admin/services",
    load: () =>
      import("@/lib/demo/admin-catalog").then(
        (catalog) => catalog.answerAdminServices,
      ),
  },
  {
    method: "GET",
    path: "/api/admin/services/:id",
    load: () =>
      import("@/lib/demo/admin-catalog").then(
        (catalog) => catalog.answerAdminService,
      ),
  },
  {
    method: "GET",
    path: "/api/admin/categories",
    load: () =>
      import("@/lib/demo/admin-catalog").then(
        (catalog) => catalog.answerAdminCategories,
      ),
  },
  { method: "POST", path: "/api/admin/services" },
  { method: "PATCH", path: "/api/admin/services/:id" },
  { method: "DELETE", path: "/api/admin/services/:id" },
  { method: "POST", path: "/api/admin/categories" },
  { method: "PATCH", path: "/api/admin/categories/:id" },
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
  // docs/agendamento/rotas.md, built in phase 3.
  {
    method: "GET",
    path: "/api/me/appointments",
    load: () =>
      import("@/lib/demo/appointments").then(
        (appointments) => appointments.answerAppointments,
      ),
  },
  {
    method: "GET",
    path: "/api/me/appointments/:id",
    load: () =>
      import("@/lib/demo/appointments").then(
        (appointments) => appointments.answerAppointment,
      ),
  },
  { method: "POST", path: "/api/me/appointments/:id/cancel" },
  {
    method: "GET",
    path: "/api/me/bookable-services",
    load: () =>
      import("@/lib/demo/appointments").then(
        (appointments) => appointments.answerBookableServices,
      ),
  },
  {
    method: "POST",
    path: "/api/me/appointments/preview",
    load: () =>
      import("@/lib/demo/appointments").then(
        (appointments) => appointments.answerAppointmentPreview,
      ),
  },
  { method: "POST", path: "/api/me/appointments" },
  { method: "PATCH", path: "/api/me/appointments/:id" },
  { method: "POST", path: "/api/me/appointments/:id/reschedule" },
  // docs/agendamento/rotas.md, built by #46, #49 and #50; the preview is a
  // POST that writes nothing.
  {
    method: "GET",
    path: "/api/admin/appointments",
    load: () =>
      import("@/lib/demo/admin-appointments").then(
        (appointments) => appointments.answerAdminAppointments,
      ),
  },
  {
    method: "GET",
    path: "/api/admin/appointments/:id",
    load: () =>
      import("@/lib/demo/admin-appointments").then(
        (appointments) => appointments.answerAdminAppointment,
      ),
  },
  {
    method: "POST",
    path: "/api/admin/appointments/preview",
    load: () =>
      import("@/lib/demo/admin-appointments").then(
        (appointments) => appointments.answerAdminAppointmentPreview,
      ),
  },
  {
    method: "GET",
    path: "/api/admin/appointments/lookup/clients",
    load: () =>
      import("@/lib/demo/admin-appointments").then(
        (appointments) => appointments.answerClientLookup,
      ),
  },
  {
    method: "GET",
    path: "/api/admin/appointments/lookup/vehicles",
    load: () =>
      import("@/lib/demo/admin-appointments").then(
        (appointments) => appointments.answerVehicleLookup,
      ),
  },
  {
    method: "GET",
    path: "/api/admin/appointments/lookup/services",
    load: () =>
      import("@/lib/demo/admin-appointments").then(
        (appointments) => appointments.answerServiceLookup,
      ),
  },
  { method: "POST", path: "/api/admin/appointments" },
  { method: "PATCH", path: "/api/admin/appointments/:id" },
  { method: "POST", path: "/api/admin/appointments/:id/advance" },
  { method: "POST", path: "/api/admin/appointments/:id/complete" },
  { method: "POST", path: "/api/admin/appointments/:id/cancel" },
  { method: "POST", path: "/api/admin/appointments/:id/reschedule" },
  // docs/agendamento/rotas.md, built by #51 and #66; the analysis is a POST
  // that writes nothing.
  {
    method: "GET",
    path: "/api/admin/dashboard",
    load: () =>
      import("@/lib/demo/dashboard").then(
        (dashboard) => dashboard.answerDashboard,
      ),
  },
  {
    method: "POST",
    path: "/api/admin/dashboard/analysis",
    load: () =>
      import("@/lib/demo/dashboard").then(
        (dashboard) => dashboard.answerDashboardAnalysis,
      ),
  },
];
