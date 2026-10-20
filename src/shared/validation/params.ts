import { z } from "zod";
import { MAX_PAGE_SIZE } from "@/shared/constants/pagination";

// Parameters common to the API routes (docs/padroes/api.md, Validação).

const PAGINATION_MESSAGE = "Informe um número inteiro a partir de 1.";
// The version is never typed: it is wrong only on a screen left open.
const STALE_VERSION_MESSAGE = "Atualize a página e tente novamente.";
const FIRST_PAGE = 1;

// Any 8-4-4-4-12 hexadecimal id, as the PostgreSQL uuid type accepts: the ids
// of seed-demo.sql come from md5 and have no RFC 9562 version. An invalid id
// gets the same 404 as a missing record, decided by the route.
export const idSchema = z.guid();

const pageNumberSchema = z.coerce
  .number({ error: PAGINATION_MESSAGE })
  .int({ error: PAGINATION_MESSAGE })
  .min(1, { error: PAGINATION_MESSAGE });

// Query string values arrive as text; unknown parameters are discarded.
export function paginationSchema(defaultPageSize: number) {
  return z.object({
    page: pageNumberSchema.default(FIRST_PAGE),
    // RNF008: above the maximum, the maximum applies.
    pageSize: pageNumberSchema
      .default(defaultPageSize)
      .transform((pageSize) => Math.min(pageSize, MAX_PAGE_SIZE)),
  });
}

// RNF011: the updatedAt read with the record, sent back on every PATCH and PUT
// as the database wrote it, such as 2026-10-20T13:45:12.345678+00:00
// (docs/padroes/api.md, Concorrência).
export const updatedAtSchema = z.iso.datetime({
  offset: true,
  error: STALE_VERSION_MESSAGE,
});
