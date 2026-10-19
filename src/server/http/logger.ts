import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";

// Log of docs/padroes/backend.md (Registro): one JSON line per event on
// standard output, read in the Vercel logs (decision 0029). RS018: callers
// pass only named fields, never headers, cookies, tokens, passwords or bodies.

export type LogLevel = "debug" | "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

type RequestContext = {
  requestId: string;
  // TODO(#23): add the signed-in user, set by the guards, to every line.
};

const requestContext = new AsyncLocalStorage<RequestContext>();

// Every line written while `callback` runs, even after an await, carries the
// requestId of this context.
export function runWithRequestContext<T>(
  context: RequestContext,
  callback: () => T,
): T {
  return requestContext.run(context, callback);
}

function writeLine(level: LogLevel, event: string, fields: LogFields): void {
  if (level === "debug" && process.env.NODE_ENV !== "development") {
    return;
  }
  const line = {
    time: new Date().toISOString(),
    level,
    requestId: requestContext.getStore()?.requestId ?? null,
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
