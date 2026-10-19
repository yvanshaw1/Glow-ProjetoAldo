import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import {
  logger,
  runWithRequestContext,
  setRequestUser,
} from "@/server/http/logger";

// docs/padroes/backend.md (Registro): one JSON line per event on standard
// output, with the requestId of the request and, once the guard knows it, the
// signed-in user.

const USER_ID = "4e31423b-fe30-cf42-7e5a-eebc618ac6e6";

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
        userId: null,
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

  it("writes the user set during the request in every later line, also after an await", async () => {
    await runWithRequestContext({ requestId: "7f3c9a1e" }, async () => {
      logger.info("before");
      setRequestUser(USER_ID);
      await Promise.resolve();
      logger.info("after");
    });

    expect(readLogLines()).toEqual([
      expect.objectContaining({ event: "before", userId: null }),
      expect.objectContaining({ event: "after", userId: USER_ID }),
    ]);
  });

  it("writes a null userId before the user is known and outside a request", () => {
    runWithRequestContext({ requestId: "7f3c9a1e" }, () => {
      logger.info("inside");
    });
    setRequestUser(USER_ID);
    logger.info("outside");

    expect(readLogLines()).toEqual([
      expect.objectContaining({ event: "inside", userId: null }),
      expect.objectContaining({ event: "outside", userId: null }),
    ]);
  });

  it("keeps the users of two simultaneous requests apart", async () => {
    const secondHasSetUser = Promise.withResolvers<void>();
    const first = runWithRequestContext({ requestId: "00000001" }, async () => {
      setRequestUser("first-user");
      await secondHasSetUser.promise;
      logger.info("probe");
    });
    const second = runWithRequestContext(
      { requestId: "00000002" },
      async () => {
        setRequestUser("second-user");
        secondHasSetUser.resolve();
        logger.info("probe");
      },
    );
    await Promise.all([first, second]);

    expect(readLogLines()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          requestId: "00000001",
          userId: "first-user",
        }),
        expect.objectContaining({
          requestId: "00000002",
          userId: "second-user",
        }),
      ]),
    );
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
