import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";

// Log of docs/padroes/backend.md (Registro): one JSON line per event on
// standard output, read in the Vercel logs (decision 0029). RS018: callers
// pass only named fields, never headers, cookies, tokens, passwords or bodies.

export type LogLevel = "debug" | "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

type RequestContext = {
  requestId: string;
};

type RequestState = RequestContext & {
  // Signed-in user, set by the guard once the session is known.
  userId: string | null;
};

const requestContext = new AsyncLocalStorage<RequestState>();

// Every line written while `callback` runs, even after an await, carries the
// requestId of this context and, after setRequestUser, the user.
export function runWithRequestContext<T>(
  { requestId }: RequestContext,
  callback: () => T,
): T {
  return requestContext.run({ requestId, userId: null }, callback);
}

// The state of the request is changed in place: the guard runs inside the
// route, and the request line, written by the handler after the route, has to
// see the user too. Outside a request there is nothing to set.
export function setRequestUser(userId: string): void {
  const state = requestContext.getStore();
  if (state) {
    state.userId = userId;
  }
}

function writeLine(level: LogLevel, event: string, fields: LogFields): void {
  if (level === "debug" && process.env.NODE_ENV !== "development") {
    return;
  }
  const state = requestContext.getStore();
  const line = {
    time: new Date().toISOString(),
    level,
    requestId: state?.requestId ?? null,
    userId: state?.userId ?? null,
    event,
    ...fields,
  };
  console.log(JSON.stringify(line));
}

export const logger: Record<
  LogLevel,
  (event: string, fields?: LogFields) => void
> = {
  debug: (event, fields = {}) => writeLine("debug", event, fields),
  info: (event, fields = {}) => writeLine("info", event, fields),
  warn: (event, fields = {}) => writeLine("warn", event, fields),
  error: (event, fields = {}) => writeLine("error", event, fields),
};
