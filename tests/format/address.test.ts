import { describe, expect, it } from "vitest";
import { formatDirectionsLink } from "@/shared/format/address";

// The "Como chegar" link of the home page (docs/catalogo/
// paginas-publicas.md, Localização): the route to the saved address on
// Google Maps, with the address encoded. The address is the fictitious one of
// supabase/seed-demo.sql.

describe("formatDirectionsLink", () => {
  it("builds the directions link of an address", () => {
    expect(
      formatDirectionsLink("Rua Exemplo, 100 – Ponta Verde, Maceió – AL"),
    ).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Rua%20Exemplo%2C%20100%20%E2%80%93%20Ponta%20Verde%2C%20Macei%C3%B3%20%E2%80%93%20AL",
    );
  });
});
