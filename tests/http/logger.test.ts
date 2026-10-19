import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { logger, runWithRequestContext } from "@/server/http/logger";

// docs/padroes/backend.md (Registro): one JSON line per event on standard
// output, with the requestId of the request.

let consoleLog: MockInstance<typeof console.log>;

beforeEach(() => {
  consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function readLogLines(): Record<string, unknown>[] {
  return consoleLog.mock.calls.map(([line]) => JSON.parse(String(line)));
}

describe("logger", () => {
  it("writes one JSON line with time, level, requestId and the given fields", () => {
    runWithRequestContext({ requestId: "7f3c9a1e" }, () => {
      logger.info("appointment.created", { appointmentId: "4e31423b" });
    });

    expect(readLogLines()).toEqual([
      {
        time: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        level: "info",
        requestId: "7f3c9a1e",
        event: "appointment.created",
        appointmentId: "4e31423b",
      },
    ]);
  });

  it("writes a null requestId outside a request", () => {
    logger.warn("login.locked");

    expect(readLogLines()).toEqual([
      expect.objectContaining({ level: "warn", requestId: null }),
    ]);
  });

  it("writes debug lines only in development", () => {
    vi.stubEnv("NODE_ENV", "production");
    logger.debug("hidden");
    vi.stubEnv("NODE_ENV", "development");
    logger.debug("shown");

    expect(readLogLines()).toEqual([
      expect.objectContaining({ level: "debug", event: "shown" }),
    ]);
  });
});
