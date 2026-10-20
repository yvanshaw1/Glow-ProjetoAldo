import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { ApiError, apiRequest, withQuery } from "@/lib/api-client";
import type { SessionUser } from "@/shared/api/auth";
import type { ProblemDetails } from "@/shared/api/problem";
import type { ErrorCode } from "@/shared/errors/catalog";

// The single HTTP client of the pages (docs/padroes/frontend.md, decision
// 0050). fetch and location are stubbed: no server, browser or network.

const REQUEST_ID = "a1b2c3d4";

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
        "Estes dados foram alterados por outra pessoa. Atualize a página e tente novamente.",
      ),
    );

    const error = await catchApiError(
      apiRequest("/api/me/profile", { method: "PATCH", body: {} }),
    );

    expect(error.code).toBe("VERSION_CONFLICT");
    expect(error.message).toBe(
      "Estes dados foram alterados por outra pessoa. Atualize a página e tente novamente.",
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
