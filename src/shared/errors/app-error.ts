import { ERROR_CATALOG, type ErrorCode } from "@/shared/errors/catalog";

type AppErrorDetails = {
  // Message of each field, sent in `fields` (VALIDATION_ERROR).
  fields?: Record<string, string>;
  // Seconds sent in the Retry-After header (ACCOUNT_LOCKED).
  retryAfterSeconds?: number;
};

// Expected failure, thrown by the services with a code of the catalog; only
// the single handler of src/server/http turns it into a response.
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fields: Record<string, string> | null;
  readonly retryAfterSeconds: number | null;

  constructor(
    code: ErrorCode,
    { fields, retryAfterSeconds }: AppErrorDetails = {},
  ) {
    super(ERROR_CATALOG[code].message);
    this.name = "AppError";
    this.code = code;
    this.fields = fields ?? null;
    this.retryAfterSeconds = retryAfterSeconds ?? null;
  }
}
