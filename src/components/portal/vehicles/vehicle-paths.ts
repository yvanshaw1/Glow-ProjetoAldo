// The routes of the vehicles of the client area (docs/clientes/rotas.md), for
// the register and edit dialogs of src/components/shared/, which the panel
// also uses with its own routes.
export const PORTAL_VEHICLES_PATH = "/api/me/vehicles";

export const PORTAL_ADD_VEHICLE_PROPS = {
  createPath: PORTAL_VEHICLES_PATH,
  lookupPath: "/api/me/vehicles/lookup",
  linkLabel: "Adicionar à minha conta",
} as const;
