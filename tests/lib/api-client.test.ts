import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { ApiError, apiRequest, withQuery } from "@/lib/api-client";
import type { DemoAnswer, DemoRoute } from "@/lib/demo/routes";
import type { SessionUser } from "@/shared/api/auth";
import type { Page } from "@/shared/api/pagination";
import type { ProblemDetails } from "@/shared/api/problem";
import type { ErrorCode } from "@/shared/errors/catalog";

// The single HTTP client of the pages (docs/padroes/frontend.md, decision
// 0052). fetch and location are stubbed, and so is the list of demo routes
// (decision 0055): no server, browser or network.

const REQUEST_ID = "a1b2c3d4";

type DemoService = { id: string; name: string; type: string };

// The demo list of these tests. Its paths are not the ones of the other
// tests, which keep going to the stubbed fetch.
const demo = vi.hoisted(() => {
  // The services of supabase/seed-demo.sql, completed up to 25.
  const serviceNames: [string, string][] = [
    ["Lavagem simples", "main"],
    ["Lavagem completa", "main"],
    ["Lavagem técnica", "main"],
    ["Polimento comercial", "main"],
    ["Polimento técnico", "main"],
    ["Vitrificação de pintura", "main"],
    ["Higienização interna completa", "main"],
    ["Película nos vidros", "main"],
    ["Lavagem a seco", "main"],
    ["Higienização do ar-condicionado", "complementary"],
    ["Lavagem de motor", "complementary"],
    ["Revitalização de faróis", "complementary"],
    ["Oxi-sanitização", "complementary"],
    ["Cristalização de vidros", "complementary"],
    ["Cera de carnaúba", "additional"],
    ["Pretinho nos pneus", "additional"],
    ["Hidratação de couro", "additional"],
    ["Repelente de chuva nos vidros", "additional"],
    ...Array.from({ length: 7 }, (_, index): [string, string] => [
      `Serviço de teste ${index + 19}`,
      "main",
    ]),
  ];
  return {
    services: serviceNames.map(([name, type], index) => ({
      id: `service-${String(index + 1).padStart(2, "0")}`,
      name,
      type,
    })),
    preview: { total: 85, durationMinutes: 90 },
    loadServiceList: vi.fn<() => Promise<DemoAnswer>>(),
    loadService: vi.fn<() => Promise<DemoAnswer>>(),
    loadPreview: vi.fn<() => Promise<DemoAnswer>>(),
  };
});

vi.mock("@/lib/demo/routes", async () => {
  const { demoPage } = await import("@/lib/demo/list");
  demo.loadServiceList.mockResolvedValue(({ query }) =>
    demoPage(demo.services, query, {
      pageSize: 20,
      searchIn: (service) => [service.name],
      filters: { type: (service) => service.type },
    }),
  );
  demo.loadService.mockResolvedValue(({ params }) =>
    demo.services.find((service) => service.id === params.id),
  );
  demo.loadPreview.mockResolvedValue(() => demo.preview);
  const routes: DemoRoute[] = [
    { method: "GET", path: "/api/admin/services", load: demo.loadServiceList },
    { method: "GET", path: "/api/admin/services/:id", load: demo.loadService },
    {
      method: "POST",
      path: "/api/admin/appointments/preview",
      load: demo.loadPreview,
    },
    { method: "POST", path: "/api/admin/services" },
  ];
  return { DEMO_ROUTES: routes };
});

type LocationStub = {
  pathname: string;
  search: string;
  assign: Mock<(url: string) => void>;
};

let fetchMock: Mock<typeof fetch>;
let locationStub: LocationStub;

function problemResponse(
  status: number,
  code: ErrorCode,
  detail: string,
  fields?: Record<string, string>,
): Response {
  const problem: ProblemDetails = {
    type: "about:blank",
    title: "Error",
    status,
    detail,
    instance: "/api/test",
    code,
    requestId: REQUEST_ID,
    ...(fields && { fields }),
  };
  return new Response(JSON.stringify(problem), {
    status,
    headers: { "content-type": "application/problem+json" },
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function catchApiError(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.then(
    () => null,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

// The page is navigating away: the call never settles, so the screen keeps
// its loading state until the new page loads.
async function expectPendingNavigation(promise: Promise<unknown>) {
  const settled = vi.fn();
  promise.then(settled, settled);
  await vi.waitFor(() => expect(locationStub.assign).toHaveBeenCalled());
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(settled).not.toHaveBeenCalled();
}

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>();
  locationStub = { pathname: "/", search: "", assign: vi.fn() };
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("location", locationStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("sends a JSON body with the method", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 201));
    const body = { firstName: "Maria", lastName: "da Silva" };

    await apiRequest("/api/auth/register", { method: "POST", body });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/auth/register");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify(body));
    expect(new Headers(init?.headers).get("content-type")).toBe(
      "application/json",
    );
    expect(init?.credentials).toBe("same-origin");
    expect(init?.cache).toBe("no-store");
  });

  it("returns the body of a successful response", async () => {
    const user: SessionUser = {
      profile: "staff",
      firstName: "Maria",
      lastName: "da Silva",
      mustChangePassword: false,
      permissions: ["appointments", "clients"],
    };
    fetchMock.mockResolvedValue(jsonResponse(user));

    await expect(apiRequest<SessionUser>("/api/auth/me")).resolves.toEqual(
      user,
    );
  });

  it("returns nothing for a 204", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(
      apiRequest("/api/auth/logout", { method: "POST" }),
    ).resolves.toBeUndefined();
  });

  it("turns a Problem Details into an ApiError", async () => {
    fetchMock.mockResolvedValue(
      problemResponse(
        400,
        "VALIDATION_ERROR",
        "Confira os campos destacados.",
        {
          firstName: "Preencha este campo.",
        },
      ),
    );

    const error = await catchApiError(
      apiRequest("/api/auth/register", { method: "POST", body: {} }),
    );

    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Confira os campos destacados.");
    expect(error.fields).toEqual({ firstName: "Preencha este campo." });
    expect(error.requestId).toBe(REQUEST_ID);
  });

  it("leads to the login page with the current page on 401 UNAUTHENTICATED", async () => {
    locationStub.pathname = "/admin/clients";
    locationStub.search = "?page=2";
    fetchMock.mockResolvedValue(
      problemResponse(
        401,
        "UNAUTHENTICATED",
        "Sua sessão expirou. Entre novamente.",
      ),
    );

    const promise = apiRequest("/api/admin/clients");

    await expectPendingNavigation(promise);
    expect(locationStub.assign).toHaveBeenCalledWith(
      "/login?next=%2Fadmin%2Fclients%3Fpage%3D2",
    );
  });

  it("keeps the 401 of wrong credentials for the form", async () => {
    fetchMock.mockResolvedValue(
      problemResponse(
        401,
        "INVALID_CREDENTIALS",
        "E-mail ou senha incorretos.",
      ),
    );

    const error = await catchApiError(
      apiRequest("/api/auth/login", { method: "POST", body: {} }),
    );

    expect(error.code).toBe("INVALID_CREDENTIALS");
    expect(error.message).toBe("E-mail ou senha incorretos.");
    expect(locationStub.assign).not.toHaveBeenCalled();
  });

  it("keeps the 401 of a wrong current password for the form", async () => {
    fetchMock.mockResolvedValue(
      problemResponse(
        401,
        "INVALID_CURRENT_PASSWORD",
        "A senha atual está incorreta.",
      ),
    );

    const error = await catchApiError(
      apiRequest("/api/auth/change-password", { method: "POST", body: {} }),
    );

    expect(error.code).toBe("INVALID_CURRENT_PASSWORD");
    expect(error.message).toBe("A senha atual está incorreta.");
    expect(locationStub.assign).not.toHaveBeenCalled();
  });

  it("returns the 401 of the session load without leaving the page", async () => {
    fetchMock.mockResolvedValue(
      problemResponse(
        401,
        "UNAUTHENTICATED",
        "Sua sessão expirou. Entre novamente.",
      ),
    );

    const error = await catchApiError(
      apiRequest("/api/auth/me", { isSessionLoad: true }),
    );

    expect(error.code).toBe("UNAUTHENTICATED");
    expect(locationStub.assign).not.toHaveBeenCalled();
  });

  it("leads to the password change on 403 PASSWORD_CHANGE_REQUIRED", async () => {
    fetchMock.mockResolvedValue(
      problemResponse(
        403,
        "PASSWORD_CHANGE_REQUIRED",
        "Defina uma nova senha para continuar.",
      ),
    );

    const promise = apiRequest("/api/me/profile");

    await expectPendingNavigation(promise);
    expect(locationStub.assign).toHaveBeenCalledWith("/set-password");
  });

  it.each([
    [
      "ACCOUNT_INACTIVE",
      "Esta conta está desativada. Procure a administração da empresa.",
    ],
    ["FORBIDDEN", "Você não tem permissão para realizar esta ação."],
  ] as const)("keeps the 403 %s for the screen", async (code, detail) => {
    fetchMock.mockResolvedValue(problemResponse(403, code, detail));

    const error = await catchApiError(apiRequest("/api/admin/staff"));

    expect(error.status).toBe(403);
    expect(error.code).toBe(code);
    expect(error.message).toBe(detail);
    expect(locationStub.assign).not.toHaveBeenCalled();
  });

  it("returns a version conflict without repeating the request", async () => {
    fetchMock.mockResolvedValue(
      problemResponse(
        409,
        "VERSION_CONFLICT",
        "Estes dados foram alterados por outra pessoa. Confira os dados atualizados e tente novamente.",
      ),
    );

    const error = await catchApiError(
      apiRequest("/api/me/profile", { method: "PATCH", body: {} }),
    );

    expect(error.code).toBe("VERSION_CONFLICT");
    expect(error.message).toBe(
      "Estes dados foram alterados por outra pessoa. Confira os dados atualizados e tente novamente.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never repeats a write after a network failure", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const error = await catchApiError(
      apiRequest("/api/auth/register", { method: "POST", body: {} }),
    );

    expect(error.code).toBe("SERVICE_UNAVAILABLE");
    expect(error.message).toBe(
      "O serviço está temporariamente indisponível. Tente novamente em instantes.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats a response that is not Problem Details as an internal error", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>Bad Gateway</html>", {
        status: 502,
        headers: { "content-type": "text/html" },
      }),
    );

    const error = await catchApiError(apiRequest("/api/auth/me"));

    expect(error.status).toBe(502);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.message).toBe(
      "Não foi possível concluir a operação. Tente novamente em instantes.",
    );
  });

  it("rejects an aborted request as aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    fetchMock.mockImplementation((_path, init) =>
      Promise.reject(init?.signal?.reason),
    );

    const reason = await apiRequest("/api/auth/me", {
      signal: controller.signal,
    }).then(
      () => null,
      (error: unknown) => error,
    );

    expect(reason).not.toBeInstanceOf(ApiError);
    expect(reason).toHaveProperty("name", "AbortError");
  });
});

// Decision 0055 (docs/padroes/componentes.md, Telas de demonstração): a
// route of the demo list answers after 400 ms, without the network. The
// clock is simulated, so no test waits.
describe("apiRequest with demo data", () => {
  const DEMO_WAIT_MS = 400;
  const SERVICES_PATH = "/api/admin/services";

  async function afterDemoWait<T>(promise: Promise<T>): Promise<T> {
    const [result] = await Promise.all([
      promise,
      vi.advanceTimersByTimeAsync(DEMO_WAIT_MS),
    ]);
    return result;
  }

  function readServicePage(params: Record<string, string | number>) {
    return afterDemoWait(
      apiRequest<Page<DemoService>>(withQuery(SERVICES_PATH, params)),
    );
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("answers a listed read with the fixed data, without a network request", async () => {
    const service = await afterDemoWait(
      apiRequest<DemoService>("/api/admin/services/service-07"),
    );

    expect(service).toEqual({
      id: "service-07",
      name: "Higienização interna completa",
      type: "main",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("waits 400 ms before answering a listed route", async () => {
    const settled = vi.fn();
    const promise = apiRequest<DemoService>("/api/admin/services/service-07");
    promise.then(settled, settled);

    await vi.advanceTimersByTimeAsync(399);
    expect(settled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toHaveProperty("id", "service-07");
  });

  it("answers a listed POST that does not write with the fixed data", async () => {
    const preview = await afterDemoWait(
      apiRequest("/api/admin/appointments/preview", {
        method: "POST",
        body: { serviceIds: ["service-01"] },
      }),
    );

    expect(preview).toEqual({ total: 85, durationMinutes: 90 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads only the data of the requested route", async () => {
    await readServicePage({ page: 1, pageSize: 20 });

    expect(demo.loadServiceList).toHaveBeenCalledTimes(1);
    expect(demo.loadService).not.toHaveBeenCalled();
    expect(demo.loadPreview).not.toHaveBeenCalled();
  });

  it("pages the fixed list", async () => {
    const page = await readServicePage({ page: 2, pageSize: 20 });

    expect(page.data.map((service) => service.id)).toEqual([
      "service-21",
      "service-22",
      "service-23",
      "service-24",
      "service-25",
    ]);
    expect(page.page).toBe(2);
    expect(page.pageSize).toBe(20);
    expect(page.total).toBe(25);
  });

  it("caps the page size of the fixed list at 50", async () => {
    const page = await readServicePage({ page: 1, pageSize: 100 });

    expect(page.pageSize).toBe(50);
    expect(page.data).toHaveLength(25);
    expect(page.total).toBe(25);
  });

  it("searches the term in the fields of the screen, ignoring case", async () => {
    const page = await readServicePage({
      page: 1,
      pageSize: 20,
      search: "LAVAGEM",
    });

    expect(page.data.map((service) => service.name)).toEqual([
      "Lavagem simples",
      "Lavagem completa",
      "Lavagem técnica",
      "Lavagem a seco",
      "Lavagem de motor",
    ]);
    expect(page.page).toBe(1);
    expect(page.total).toBe(5);
  });

  it("filters the fixed list by equality", async () => {
    const page = await readServicePage({
      page: 1,
      pageSize: 20,
      type: "additional",
    });

    expect(page.data.map((service) => service.name)).toEqual([
      "Cera de carnaúba",
      "Pretinho nos pneus",
      "Hidratação de couro",
      "Repelente de chuva nos vidros",
    ]);
    expect(page.total).toBe(4);
  });

  it("refuses a listed write with NOT_IMPLEMENTED, without a network request", async () => {
    const error = await afterDemoWait(
      catchApiError(
        apiRequest(SERVICES_PATH, {
          method: "POST",
          body: { name: "Lavagem simples" },
        }),
      ),
    );

    expect(error.status).toBe(501);
    expect(error.code).toBe("NOT_IMPLEMENTED");
    expect(error.message).toBe(
      "Esta ação ainda não está disponível nesta versão de demonstração.",
    );
    expect(error.fields).toBeNull();
    expect(error.requestId).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a route out of the list to the API", async () => {
    const company = { companyName: "Glow – Estética Automotiva" };
    fetchMock.mockResolvedValue(jsonResponse(company));

    await expect(apiRequest("/api/admin/settings/company")).resolves.toEqual(
      company,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/settings/company");
  });

  it("sends another method of a listed path to the API", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiRequest("/api/admin/services/service-07", {
      method: "PATCH",
      body: { name: "Polimento técnico" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects an aborted demo request as aborted", async () => {
    const controller = new AbortController();
    const reason = apiRequest(SERVICES_PATH, {
      signal: controller.signal,
    }).then(
      () => null,
      (error: unknown) => error,
    );

    await vi.advanceTimersByTimeAsync(200);
    controller.abort();

    await expect(reason).resolves.toHaveProperty("name", "AbortError");
    expect(await reason).not.toBeInstanceOf(ApiError);
    expect(demo.loadServiceList).not.toHaveBeenCalled();
  });
});

// The listings send page, pageSize, the search and the filters in the query
// (docs/padroes/api.md, Paginação; docs/padroes/componentes.md).
describe("withQuery", () => {
  const CLIENTS_PATH = "/api/admin/clients";

  it("adds the query parameters to the path", () => {
    expect(
      withQuery(CLIENTS_PATH, { page: 2, pageSize: 20, search: "Maria José" }),
    ).toBe("/api/admin/clients?page=2&pageSize=20&search=Maria+Jos%C3%A9");
  });

  it("leaves out the empty parameters", () => {
    expect(
      withQuery(CLIENTS_PATH, { page: 1, search: "", status: undefined }),
    ).toBe("/api/admin/clients?page=1");
  });

  it("writes booleans as true or false", () => {
    expect(withQuery(CLIENTS_PATH, { includeInactive: true })).toBe(
      "/api/admin/clients?includeInactive=true",
    );
    expect(withQuery(CLIENTS_PATH, { includeInactive: false })).toBe(
      "/api/admin/clients?includeInactive=false",
    );
  });

  it("returns the path alone without parameters", () => {
    expect(withQuery(CLIENTS_PATH, {})).toBe(CLIENTS_PATH);
  });
});
