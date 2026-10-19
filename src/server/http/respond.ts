import "server-only";
import type { Page } from "@/shared/api/pagination";

// Success responses of docs/padroes/api.md: 200, 201 and 204, and the body of
// every listing (RNF008). Errors are answered only by handler.ts.

type Pagination = { page: number; pageSize: number };

export function respondOk<T>(data: T): Response {
  return Response.json(data);
}

export function respondCreated<T>(data: T): Response {
  return Response.json(data, { status: 201 });
}

export function respondNoContent(): Response {
  return new Response(null, { status: 204 });
}

export function respondPage<T>(
  data: T[],
  { page, pageSize }: Pagination,
  total: number,
): Response {
  const body: Page<T> = { data, page, pageSize, total };
  return Response.json(body);
}
