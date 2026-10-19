import type { ErrorCode } from "@/shared/errors/catalog";

// Body of every error response: RFC 9457 Problem Details, with the code of
// the catalog and the requestId (docs/padroes/api.md, decision 0025).
export type ProblemDetails = {
  type: "about:blank";
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: ErrorCode;
  // Message of each field; only in VALIDATION_ERROR.
  fields?: Record<string, string>;
  requestId: string;
};
