import { describe, expect, it } from "vitest";
import {
  respondCreated,
  respondNoContent,
  respondOk,
  respondPage,
} from "@/server/http/respond";

// Success responses of docs/padroes/api.md (Desenho and Paginação).

describe("respond", () => {
  it("responds 200 with the data as JSON", async () => {
    const response = respondOk({ name: "Lavagem completa" });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toEqual({ name: "Lavagem completa" });
  });

  it("responds 201 with the created record", async () => {
    const response = respondCreated({ id: "4e31423b", plate: "ABC1234" });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "4e31423b", plate: "ABC1234" });
  });

  it("responds 204 without body", async () => {
    const response = respondNoContent();

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  it("responds a page with data, page, pageSize and total (RNF008)", async () => {
    const response = respondPage(
      [{ plate: "ABC1234" }],
      { page: 2, pageSize: 10 },
      11,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: [{ plate: "ABC1234" }],
      page: 2,
      pageSize: 10,
      total: 11,
    });
  });
});
