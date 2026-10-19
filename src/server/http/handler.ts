import "server-only";
import { randomBytes } from "node:crypto";
import { STATUS_CODES } from "node:http";
import { inspect } from "node:util";
import { z } from "zod";
import {
  logger,
  runWithRequestContext,
  type LogLevel,
} from "@/server/http/logger";
import type { ProblemDetails } from "@/shared/api/problem";
import { AppError } from "@/shared/errors/app-error";
import { ERROR_CATALOG, type ErrorCode } from "@/shared/errors/catalog";

// Single handler of every API route (docs/padroes/backend.md, Erros): input
// protections (RS014), Problem Details for every error (RS017) and one log
// line per request (RS018).

// docs/padroes/api.md (Validação): JSON bodies up to 100 KB.
const MAX_JSON_BODY_BYTES = 100 * 1024;
// 8 hexadecimal characters, as in the example of docs/padroes/api.md.
const REQUEST_ID_BYTES = 4;
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const JSON_MEDIA_TYPE = "application/json";
// docs/padroes/backend.md (Registro): handled anomalies are logged as warn.
const WARN_CODES = new Set<ErrorCode>([
  "ACCOUNT_LOCKED",
  "VERSION_CONFLICT",
  "SERVICE_UNAVAILABLE",
]);
// docs/padroes/api.md (Desenho): any response may renew the session cookies,
// so no cache keeps one.
const CACHE_CONTROL = "no-store";

export type RouteInput<Params> = {
  request: Request;
  params: Params;
  // Parsed JSON body of a write, or null when it has none; the route
  // validates it with a schema of src/shared/validation.
  body: unknown;
};

type Route<Params> = (input: RouteInput<Params>) => Promise<Response>;
type RouteContext<Params> = { params: Promise<Params> };

type ProblemTarget = { instance: string; requestId: string };

type Outcome = {
  response: Response;
  level: LogLevel;
  code: ErrorCode | null;
  logFields?: Record<string, unknown>;
};

// Every route exports its methods through this function:
// export const POST = handleRoute(async ({ body }) => { ... });
export function handleRoute<Params>(route: Route<Params>) {
  return (
    request: Request,
    context: RouteContext<Params>,
  ): Promise<Response> => {
    const requestId = randomBytes(REQUEST_ID_BYTES).toString("hex");
    return runWithRequestContext({ requestId }, () =>
      respondAndLog({ route, request, context, requestId }),
    );
  };
}

type Call<Params> = {
  route: Route<Params>;
  request: Request;
  context: RouteContext<Params>;
  requestId: string;
};

async function respondAndLog<Params>(call: Call<Params>): Promise<Response> {
  const startedAt = performance.now();
  const { method, url } = call.request;
  const path = new URL(url).pathname;
  const { response, level, code, logFields } = await resolveOutcome(call, {
    instance: path,
    requestId: call.requestId,
  });
  logger[level]("request", {
    method,
    path,
    status: response.status,
    code,
    durationMs: Math.round(performance.now() - startedAt),
    ...logFields,
  });
  return withoutCache(response);
}

// A new Response, because the headers of the route's response may be
// read-only.
function withoutCache(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", CACHE_CONTROL);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function resolveOutcome<Params>(
  { route, request, context }: Call<Params>,
  target: ProblemTarget,
): Promise<Outcome> {
  const isWrite = WRITE_METHODS.has(request.method);
  if (isWrite && !hasSameOrigin(request.headers)) {
    return {
      response: respondProblem(new AppError("FORBIDDEN"), target),
      level: "warn",
      code: "FORBIDDEN",
      logFields: { refusedOrigin: request.headers.get("origin") },
    };
  }
  try {
    const body = isWrite ? await readJsonBody(request) : null;
    const params = await context.params;
    const response = await route({ request, params, body });
    return { response, level: "info", code: null };
  } catch (error) {
    return toErrorOutcome(error, target);
  }
}

// RS014: the host of the Origin must be the host of the request itself, as
// Next.js checks for Server Actions; Vercel sets X-Forwarded-Host. A write
// without Origin is refused: browsers send it with every write.
function hasSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (origin === null || !URL.canParse(origin)) {
    return false;
  }
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0].trim();
  const requestHosts = [forwardedHost, headers.get("host")];
  return requestHosts.includes(new URL(origin).host);
}

// docs/padroes/api.md (Validação): only a write with a body needs JSON.
async function readJsonBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > MAX_JSON_BODY_BYTES) {
    throw new AppError("PAYLOAD_TOO_LARGE");
  }
  const bytes =
    request.body === null
      ? new Uint8Array()
      : await readLimitedBytes(request.body);
  if (bytes.byteLength === 0) {
    return null;
  }
  if (!isJsonMediaType(request.headers.get("content-type"))) {
    throw new AppError("UNSUPPORTED_MEDIA_TYPE");
  }
  return parseJson(new TextDecoder().decode(bytes));
}

// The limit also holds without Content-Length: the reading stops as soon as
// the body goes over it.
async function readLimitedBytes(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (let next = await reader.read(); !next.done; next = await reader.read()) {
    size += next.value.byteLength;
    if (size > MAX_JSON_BODY_BYTES) {
      await reader.cancel();
      throw new AppError("PAYLOAD_TOO_LARGE");
    }
    chunks.push(next.value);
  }
  return Buffer.concat(chunks);
}

function isJsonMediaType(contentType: string | null): boolean {
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  return mediaType === JSON_MEDIA_TYPE;
}

// RS018: the message of a JSON syntax error quotes the body, which may hold a
// password, so it is replaced by the catalog error and never logged.
function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("VALIDATION_ERROR");
  }
}

function toErrorOutcome(error: unknown, target: ProblemTarget): Outcome {
  if (error instanceof AppError) {
    return {
      response: respondProblem(error, target),
      level: WARN_CODES.has(error.code) ? "warn" : "info",
      code: error.code,
    };
  }
  if (error instanceof z.ZodError) {
    return toErrorOutcome(toValidationError(error), target);
  }
  // RS017: the detail of an unexpected failure goes only to the log.
  return {
    response: respondProblem(new AppError("INTERNAL_ERROR"), target),
    level: "error",
    code: "INTERNAL_ERROR",
    logFields: { error: describeError(error) },
  };
}

// docs/padroes/api.md (Erros): one message per field, the first one, and a
// nested field by its dotted path; an error of the whole body has no field.
function toValidationError(error: z.ZodError): AppError {
  const fields = error.issues.reduce<Record<string, string>>(
    (messages, issue) => {
      const field = issue.path.map(String).join(".");
      return field === "" || Object.hasOwn(messages, field)
        ? messages
        : { ...messages, [field]: issue.message };
    },
    {},
  );
  return new AppError(
    "VALIDATION_ERROR",
    Object.keys(fields).length > 0 ? { fields } : {},
  );
}

type DatabaseError = { code: string; message: string };

function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof error.code === "string" &&
    typeof error.message === "string"
  );
}

// RS018: an error that is not an Error, such as the database error returned
// by supabase-js, keeps only its code and message; its details may quote the
// refused row, with data of the request body.
function describeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    };
  }
  if (isDatabaseError(error)) {
    return {
      name: null,
      code: error.code,
      message: error.message,
      stack: null,
    };
  }
  return { name: null, message: inspect(error), stack: null };
}

function respondProblem(
  error: AppError,
  { instance, requestId }: ProblemTarget,
): Response {
  const { status, message } = ERROR_CATALOG[error.code];
  const problem: ProblemDetails = {
    type: "about:blank",
    title: STATUS_CODES[status] ?? "Error",
    status,
    detail: message,
    instance,
    code: error.code,
    ...(error.fields === null ? {} : { fields: error.fields }),
    requestId,
  };
  const retryAfter: Record<string, string> =
    error.retryAfterSeconds === null
      ? {}
      : { "Retry-After": String(error.retryAfterSeconds) };
  return new Response(JSON.stringify(problem), {
    status,
    headers: { "Content-Type": "application/problem+json", ...retryAfter },
  });
}
