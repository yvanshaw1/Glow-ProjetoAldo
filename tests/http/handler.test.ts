import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { z } from "zod";
import { handleRoute, type RouteInput } from "@/server/http/handler";
import { logger, setRequestUser } from "@/server/http/logger";
import { respondNoContent, respondOk } from "@/server/http/respond";
import type { ProblemDetails } from "@/shared/api/problem";
import { AppError } from "@/shared/errors/app-error";
import {
  emailSchema,
  personNameSchema,
  plateSchema,
} from "@/shared/validation/formats";
import { paginationSchema } from "@/shared/validation/params";

// The single handler of docs/padroes/api.md and backend.md (decision 0045).
// Each test builds the request and a route of its own: no server, no
// database, no network.

const APP_HOST = "localhost:3000";
const APP_ORIGIN = `http://${APP_HOST}`;
const OTHER_SITE_ORIGIN = "https://evil.example";
// docs/padroes/api.md: JSON bodies up to 100 KB (102,400 bytes).
const MAX_JSON_BODY_BYTES = 102_400;
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}$/;

type Params = Record<string, string>;
type Route = (input: RouteInput<Params>) => Promise<Response>;
type LogLine = Record<string, unknown>;

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

function buildRequest(
  path: string,
  { method = "GET", headers = {}, body }: RequestOptions = {},
): Request {
  return new Request(`${APP_ORIGIN}${path}`, {
    method,
    headers: { host: APP_HOST, ...headers },
    body,
  });
}

// A write as the app's own pages send it: same origin and a JSON body.
function buildJsonWrite(path: string, body: unknown, method = "POST"): Request {
  return buildRequest(path, {
    method,
    headers: { origin: APP_ORIGIN, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function callRoute(
  route: Route,
  request: Request,
  params: Params = {},
): Promise<Response> {
  return handleRoute(route)(request, { params: Promise.resolve(params) });
}

function readProblem(response: Response): Promise<ProblemDetails> {
  return response.json();
}

// JSON text of exactly `bytes` bytes: {"notes":"aaa..."}.
function jsonOfSize(bytes: number): string {
  const wrapperBytes = JSON.stringify({ notes: "" }).length;
  return JSON.stringify({ notes: "a".repeat(bytes - wrapperBytes) });
}

function failWith(error: unknown): Route {
  return async () => {
    throw error;
  };
}

let consoleLog: MockInstance<typeof console.log>;

beforeEach(() => {
  consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function readLogLines(): LogLine[] {
  return consoleLog.mock.calls.map(([line]) => JSON.parse(String(line)));
}

function readRequestLine(): LogLine {
  const requestLines = readLogLines().filter(
    (line) => line.event === "request",
  );
  expect(requestLines).toHaveLength(1);
  return requestLines[0];
}

describe("errors (RS017)", () => {
  it("responds 404 Problem Details when the route throws AppError NOT_FOUND", async () => {
    const response = await callRoute(
      failWith(new AppError("NOT_FOUND")),
      buildRequest("/api/me/vehicles/123?page=2"),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe(
      "application/problem+json",
    );
    expect(await readProblem(response)).toEqual({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "Não encontramos o que você procura.",
      instance: "/api/me/vehicles/123",
      code: "NOT_FOUND",
      requestId: expect.stringMatching(REQUEST_ID_PATTERN),
    });
  });

  it("sends Retry-After when the AppError has retryAfterSeconds", async () => {
    const response = await callRoute(
      failWith(new AppError("ACCOUNT_LOCKED", { retryAfterSeconds: 900 })),
      buildJsonWrite("/api/auth/login", { email: "maria@email.com" }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("900");
    expect((await readProblem(response)).code).toBe("ACCOUNT_LOCKED");
  });

  it("responds 400 VALIDATION_ERROR with the message of each field when the body fails the schema", async () => {
    const registerSchema = z.object({
      email: emailSchema,
      name: personNameSchema,
    });

    const response = await callRoute(
      async ({ body }) => respondOk(registerSchema.parse(body)),
      buildJsonWrite("/api/auth/register", { email: "maria@email", name: "M" }),
    );

    expect(response.status).toBe(400);
    const problem = await readProblem(response);
    expect(problem.code).toBe("VALIDATION_ERROR");
    expect(problem.detail).toBe("Confira os campos destacados.");
    expect(problem.fields).toEqual({
      email: "Informe um e-mail válido, como maria@email.com.",
      name: "Use de 2 a 60 letras; espaço, hífen e apóstrofo também valem.",
    });
  });

  it("names a nested field by its dotted path", async () => {
    const vehicleSchema = z.object({
      vehicle: z.object({ plate: plateSchema }),
    });

    const response = await callRoute(
      async ({ body }) => respondOk(vehicleSchema.parse(body)),
      buildJsonWrite("/api/me/vehicles", { vehicle: { plate: "AB12345" } }),
    );

    expect((await readProblem(response)).fields).toEqual({
      "vehicle.plate": "Informe uma placa válida.",
    });
  });

  it("responds 400 VALIDATION_ERROR when a query parameter fails the schema", async () => {
    const response = await callRoute(async ({ request }) => {
      const query = new URL(request.url).searchParams;
      return respondOk(
        paginationSchema(20).parse(Object.fromEntries(query.entries())),
      );
    }, buildRequest("/api/admin/clients?page=0"));

    expect(response.status).toBe(400);
    expect((await readProblem(response)).fields).toEqual({
      page: "Informe um número inteiro a partir de 1.",
    });
  });

  it("responds 500 INTERNAL_ERROR with the catalog message and no internal detail", async () => {
    const response = await callRoute(
      failWith(new Error('relation "public.clients" does not exist')),
      buildRequest("/api/me/profile"),
    );

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toBe(
      "application/problem+json",
    );
    const problem = await readProblem(response);
    expect(problem).toEqual({
      type: "about:blank",
      title: "Internal Server Error",
      status: 500,
      detail:
        "Não foi possível concluir a operação. Tente novamente em instantes.",
      instance: "/api/me/profile",
      code: "INTERNAL_ERROR",
      requestId: expect.stringMatching(REQUEST_ID_PATTERN),
    });
    expect(JSON.stringify(problem)).not.toContain("clients");
  });

  it("responds 500 when the route throws a value that is not an Error", async () => {
    const response = await callRoute(
      failWith({
        code: "23505",
        message: "duplicate key value violates unique constraint",
      }),
      buildRequest("/api/me/profile"),
    );

    expect(response.status).toBe(500);
    const problem = await readProblem(response);
    expect(problem.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(problem)).not.toContain("duplicate");
  });
});

describe("input protections (RS014)", () => {
  const route = vi.fn<Route>(async () => respondNoContent());

  afterEach(() => {
    route.mockClear();
  });

  it("refuses a POST with text/plain with 415 without calling the route", async () => {
    const response = await callRoute(
      route,
      buildRequest("/api/me/vehicles", {
        method: "POST",
        headers: { origin: APP_ORIGIN, "content-type": "text/plain" },
        body: "plate=ABC1234",
      }),
    );

    expect(response.status).toBe(415);
    expect((await readProblem(response)).code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(route).not.toHaveBeenCalled();
  });

  it.each([
    ["with", true],
    ["without", false],
  ])(
    "refuses a body above 100 KB with 413 without calling the route, %s Content-Length",
    async (_label, hasContentLength) => {
      const body = jsonOfSize(MAX_JSON_BODY_BYTES + 1);
      const contentLength: Record<string, string> = hasContentLength
        ? { "content-length": String(body.length) }
        : {};

      const response = await callRoute(
        route,
        buildRequest("/api/me/vehicles", {
          method: "POST",
          headers: {
            origin: APP_ORIGIN,
            "content-type": "application/json",
            ...contentLength,
          },
          body,
        }),
      );

      expect(response.status).toBe(413);
      expect((await readProblem(response)).code).toBe("PAYLOAD_TOO_LARGE");
      expect(route).not.toHaveBeenCalled();
    },
  );

  it("accepts a body of exactly 100 KB", async () => {
    const response = await callRoute(
      route,
      buildRequest("/api/me/vehicles", {
        method: "POST",
        headers: { origin: APP_ORIGIN, "content-type": "application/json" },
        body: jsonOfSize(MAX_JSON_BODY_BYTES),
      }),
    );

    expect(response.status).toBe(204);
    expect(route).toHaveBeenCalledOnce();
  });

  it("refuses a POST from another site's Origin with 403 FORBIDDEN without calling the route", async () => {
    const response = await callRoute(
      route,
      buildRequest("/api/me/vehicles", {
        method: "POST",
        headers: {
          origin: OTHER_SITE_ORIGIN,
          "content-type": "application/json",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(403);
    const problem = await readProblem(response);
    expect(problem.code).toBe("FORBIDDEN");
    expect(problem.detail).toBe(
      "Você não tem permissão para realizar esta ação.",
    );
    expect(route).not.toHaveBeenCalled();
  });

  it.each([
    ["without Origin", {}],
    ['with Origin "null"', { origin: "null" }],
  ])("refuses a write %s", async (_label, originHeader) => {
    const response = await callRoute(
      route,
      buildRequest("/api/me/vehicles", {
        method: "POST",
        headers: { "content-type": "application/json", ...originHeader },
        body: "{}",
      }),
    );

    expect(response.status).toBe(403);
    expect(route).not.toHaveBeenCalled();
  });

  it.each([
    ["Host", { host: APP_HOST, origin: APP_ORIGIN }],
    [
      "X-Forwarded-Host",
      {
        host: "localhost:8080",
        "x-forwarded-host": "glow-projetoaldo.vercel.app",
        origin: "https://glow-projetoaldo.vercel.app",
      },
    ],
  ])(
    "accepts a write whose Origin has the host of the request, by %s",
    async (_label, headers) => {
      const response = await callRoute(
        route,
        buildRequest("/api/me/vehicles", {
          method: "POST",
          headers: { "content-type": "application/json", ...headers },
          body: "{}",
        }),
      );

      expect(response.status).toBe(204);
      expect(route).toHaveBeenCalledOnce();
    },
  );

  it.each(["PUT", "PATCH", "DELETE"])(
    "applies the same checks to %s",
    async (method) => {
      const fromOtherSite = await callRoute(
        route,
        buildRequest("/api/me/vehicles/1", {
          method,
          headers: { origin: OTHER_SITE_ORIGIN },
        }),
      );
      const asText = await callRoute(
        route,
        buildRequest("/api/me/vehicles/1", {
          method,
          headers: { origin: APP_ORIGIN, "content-type": "text/plain" },
          body: "plate=ABC1234",
        }),
      );

      expect(fromOtherSite.status).toBe(403);
      expect(asText.status).toBe(415);
      expect(route).not.toHaveBeenCalled();
    },
  );

  it("does not check Origin or the format on GET", async () => {
    const response = await callRoute(
      route,
      buildRequest("/api/services", { headers: { origin: OTHER_SITE_ORIGIN } }),
    );

    expect(response.status).toBe(204);
    expect(route).toHaveBeenCalledOnce();
  });

  it("accepts a write without body and without Content-Type", async () => {
    const response = await callRoute(
      route,
      buildRequest("/api/auth/logout", {
        method: "POST",
        headers: { origin: APP_ORIGIN },
      }),
    );

    expect(response.status).toBe(204);
    expect(route).toHaveBeenCalledWith(expect.objectContaining({ body: null }));
  });

  it("accepts application/json with a charset parameter", async () => {
    const response = await callRoute(
      route,
      buildRequest("/api/me/vehicles", {
        method: "POST",
        headers: {
          origin: APP_ORIGIN,
          "content-type": "application/json; charset=utf-8",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(204);
  });

  it("responds 400 VALIDATION_ERROR without fields for a body that is not valid JSON", async () => {
    const response = await callRoute(
      route,
      buildRequest("/api/me/vehicles", {
        method: "POST",
        headers: { origin: APP_ORIGIN, "content-type": "application/json" },
        body: "{plate: ABC1234",
      }),
    );

    expect(response.status).toBe(400);
    const problem = await readProblem(response);
    expect(problem.code).toBe("VALIDATION_ERROR");
    expect(problem).not.toHaveProperty("fields");
    expect(route).not.toHaveBeenCalled();
  });

  it("gives the route the parsed body and the resolved path params", async () => {
    await callRoute(
      route,
      buildJsonWrite(
        "/api/me/vehicles/7f3c9a1e",
        { plate: "ABC1234" },
        "PATCH",
      ),
      { id: "7f3c9a1e" },
    );

    expect(route).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { plate: "ABC1234" },
        params: { id: "7f3c9a1e" },
      }),
    );
  });
});

describe("cache (docs/padroes/api.md)", () => {
  it.each([
    [
      "a success of the route",
      async () => respondOk({ ok: true }),
      buildRequest("/api/auth/me"),
    ],
    [
      "the Problem Details of an AppError",
      failWith(new AppError("UNAUTHENTICATED")),
      buildRequest("/api/auth/me"),
    ],
    [
      "an unexpected error",
      failWith(new Error("connection refused")),
      buildRequest("/api/auth/me"),
    ],
    [
      "a refused origin",
      async () => respondNoContent(),
      buildRequest("/api/auth/logout", {
        method: "POST",
        headers: { origin: OTHER_SITE_ORIGIN },
      }),
    ],
  ] as const)("marks %s as not cacheable", async (_case, route, request) => {
    const response = await callRoute(route, request);

    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("log (RS017, RS018)", () => {
  it("logs one info line per request with requestId, method, path without query string, status and duration", async () => {
    await callRoute(
      async () => respondOk({ data: [] }),
      buildRequest("/api/admin/clients?search=maria"),
    );

    const line = readRequestLine();
    expect(line).toEqual({
      time: expect.any(String),
      level: "info",
      requestId: expect.stringMatching(REQUEST_ID_PATTERN),
      userId: null,
      event: "request",
      method: "GET",
      path: "/api/admin/clients",
      status: 200,
      code: null,
      durationMs: expect.any(Number),
    });
    expect(JSON.stringify(line)).not.toContain("maria");
  });

  it("logs one error line with the stack and the same requestId of the 500 response", async () => {
    const response = await callRoute(
      failWith(new Error("connection refused")),
      buildRequest("/api/me/profile"),
    );

    const problem = await readProblem(response);
    const line = readRequestLine();
    expect(line.level).toBe("error");
    expect(line.requestId).toBe(problem.requestId);
    expect(line.status).toBe(500);
    expect(line.code).toBe("INTERNAL_ERROR");
    expect(line.error).toEqual({
      name: "Error",
      message: "connection refused",
      stack: expect.stringContaining("Error: connection refused"),
    });
  });

  it.each([
    "ACCOUNT_LOCKED",
    "VERSION_CONFLICT",
    "SERVICE_UNAVAILABLE",
  ] as const)("logs a warn line for %s", async (code) => {
    await callRoute(
      failWith(new AppError(code)),
      buildJsonWrite("/api/admin/settings", {}, "PUT"),
    );

    const line = readRequestLine();
    expect(line.level).toBe("warn");
    expect(line.code).toBe(code);
  });

  it("logs a warn line with the refused origin", async () => {
    await callRoute(
      async () => respondNoContent(),
      buildRequest("/api/me/vehicles", {
        method: "POST",
        headers: { origin: OTHER_SITE_ORIGIN },
      }),
    );

    const line = readRequestLine();
    expect(line.level).toBe("warn");
    expect(line.code).toBe("FORBIDDEN");
    expect(line.refusedOrigin).toBe(OTHER_SITE_ORIGIN);
  });

  it("logs other expected errors as info", async () => {
    await callRoute(
      failWith(new AppError("FORBIDDEN")),
      buildRequest("/api/admin/staff"),
    );

    const line = readRequestLine();
    expect(line.level).toBe("info");
    expect(line.code).toBe("FORBIDDEN");
    expect(line).not.toHaveProperty("refusedOrigin");
  });

  it("logs the user set by the route in the request line", async () => {
    const userId = "4e31423b-fe30-cf42-7e5a-eebc618ac6e6";
    await callRoute(async () => {
      setRequestUser(userId);
      throw new AppError("FORBIDDEN");
    }, buildRequest("/api/admin/staff"));

    expect(readRequestLine().userId).toBe(userId);
  });

  it("keeps the requestId of the response in the lines written by the route", async () => {
    const response = await callRoute(
      async () => {
        logger.info("appointment.cancelled", { appointmentId: "7f3c9a1e" });
        throw new AppError("INVALID_STATUS");
      },
      buildJsonWrite("/api/me/appointments/7f3c9a1e/cancel", {}),
    );

    const { requestId } = await readProblem(response);
    const lines = readLogLines();
    expect(lines).toHaveLength(2);
    expect(lines.every((line) => line.requestId === requestId)).toBe(true);
  });

  it("gives each request its own requestId, also in simultaneous requests", async () => {
    const secondHasLogged = Promise.withResolvers<void>();
    const first = callRoute(async () => {
      await secondHasLogged.promise;
      logger.info("probe", { label: "first" });
      throw new AppError("NOT_FOUND");
    }, buildRequest("/api/services/1"));
    const second = callRoute(async () => {
      logger.info("probe", { label: "second" });
      secondHasLogged.resolve();
      throw new AppError("NOT_FOUND");
    }, buildRequest("/api/services/2"));

    const [firstProblem, secondProblem] = await Promise.all(
      [first, second].map(async (response) => readProblem(await response)),
    );
    const probes = readLogLines().filter((line) => line.event === "probe");
    const requestIdOf = (label: string) =>
      probes.find((line) => line.label === label)?.requestId;

    expect(firstProblem.requestId).toMatch(REQUEST_ID_PATTERN);
    expect(firstProblem.requestId).not.toBe(secondProblem.requestId);
    expect(requestIdOf("first")).toBe(firstProblem.requestId);
    expect(requestIdOf("second")).toBe(secondProblem.requestId);
  });

  describe("never logs the password, token, cookie, authorization header or body of an auth route", () => {
    const PASSWORD = "Segredo@123";
    const EMAIL = "maria@email.com";
    const COOKIE_TOKEN = "cookie-session-token";
    const ACCESS_TOKEN = "bearer-access-token";
    const SENSITIVE_VALUES = [PASSWORD, EMAIL, COOKIE_TOKEN, ACCESS_TOKEN];

    function buildLogin(body: string): Request {
      return buildRequest("/api/auth/login", {
        method: "POST",
        headers: {
          origin: APP_ORIGIN,
          "content-type": "application/json",
          cookie: `sb-glow-auth-token=${COOKIE_TOKEN}`,
          authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        body,
      });
    }

    it.each([
      [
        "when the route succeeds",
        async () => respondNoContent(),
        JSON.stringify({ email: EMAIL, password: PASSWORD }),
      ],
      [
        "when the route fails with 500",
        failWith(new Error("auth service unavailable")),
        JSON.stringify({ email: EMAIL, password: PASSWORD }),
      ],
      [
        "when the body is not valid JSON",
        async () => respondNoContent(),
        `email=${EMAIL}&password=${PASSWORD}`,
      ],
    ])("%s", async (_label, route: Route, body) => {
      await callRoute(route, buildLogin(body));

      const logText = consoleLog.mock.calls.flat().join("\n");
      expect(logText).not.toBe("");
      SENSITIVE_VALUES.forEach((value) => {
        expect(logText).not.toContain(value);
      });
    });
  });
});
