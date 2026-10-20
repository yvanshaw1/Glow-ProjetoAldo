import type { ProblemDetails } from "@/shared/api/problem";
import { ERROR_CATALOG, type ErrorCode } from "@/shared/errors/catalog";

// The single HTTP client of the pages (docs/padroes/frontend.md): same origin,
// JSON and the session in the cookie. No call is ever repeated: a write may
// have happened even when its answer was lost (docs/padroes/api.md).

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
  // Only the session load sets it: GET /api/auth/me answers 401 to every
  // visitor, on the public pages too, and the visitor stays on the page.
  isSessionLoad?: boolean;
};

export type QueryParams = Record<string, string | number | boolean | undefined>;

type ApiErrorDetails = Pick<ProblemDetails, "status" | "code" | "detail"> &
  Partial<Pick<ProblemDetails, "fields" | "requestId">>;

const LOGIN_PAGE = "/login";
const PASSWORD_CHANGE_PAGE = "/set-password";
const PROBLEM_CONTENT_TYPE = "application/problem+json";

// Failed API call, as the screen shows it: `message` is the `detail` of the
// Problem Details, and `fields` has the message of each field (RNF003).
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields: Record<string, string> | null;
  readonly requestId: string | null;

  constructor({ status, code, detail, fields, requestId }: ApiErrorDetails) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields ?? null;
    this.requestId = requestId ?? null;
  }
}

export async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    signal,
    isSessionLoad = false,
  }: ApiRequestOptions = {},
): Promise<T> {
  const response = await send(path, { method, body, signal });
  if (response.ok) {
    return (response.status === 204 ? undefined : await response.json()) as T;
  }

  const error = await readError(response);
  const destination = findRedirect(error.code, isSessionLoad);
  if (destination) {
    location.assign(destination);
    // The page is changing: the call never settles, so the screen keeps its
    // loading state until the new page loads (RNF004).
    return new Promise<never>(() => {});
  }
  throw error;
}

// A failure that is not an ApiError, like an error in the screen's own code,
// shows as the internal error of the catalog.
export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError ? error : catalogError("INTERNAL_ERROR");
}

// The query of a listing: page, pageSize, the search and the filters
// (docs/padroes/api.md, Paginação). An empty search or filter is left out.
export function withQuery(path: string, params: QueryParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== "") query.set(name, String(value));
  });
  const queryText = query.toString();
  return queryText === "" ? path : `${path}?${queryText}`;
}

async function send(
  path: string,
  {
    method,
    body,
    signal,
  }: Pick<ApiRequestOptions, "method" | "body" | "signal">,
): Promise<Response> {
  const hasBody = body !== undefined;
  try {
    return await fetch(path, {
      method,
      headers: hasBody ? { "content-type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    // Cancelled by the screen itself: nothing to show.
    if (signal?.aborted) throw error;
    throw catalogError("SERVICE_UNAVAILABLE");
  }
}

async function readError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get("content-type") ?? "";
  const problem = contentType.startsWith(PROBLEM_CONTENT_TYPE)
    ? ((await response.json().catch(() => null)) as ProblemDetails | null)
    : null;
  // An answer that is not the API's own, like the error page of the platform.
  if (!problem) return catalogError("INTERNAL_ERROR", response.status);
  return new ApiError(problem);
}

function catalogError(
  code: ErrorCode,
  status: number = ERROR_CATALOG[code].status,
): ApiError {
  return new ApiError({ status, code, detail: ERROR_CATALOG[code].message });
}

// Only an expired session goes to the login, which brings the person back to
// this page (RF010); the other 401, like wrong credentials, belong to the form
// that sent them.
function findRedirect(code: ErrorCode, isSessionLoad: boolean): string | null {
  if (code === "UNAUTHENTICATED" && !isSessionLoad) {
    const currentPage = encodeURIComponent(location.pathname + location.search);
    return `${LOGIN_PAGE}?next=${currentPage}`;
  }
  if (code === "PASSWORD_CHANGE_REQUIRED") return PASSWORD_CHANGE_PAGE;
  return null;
}
