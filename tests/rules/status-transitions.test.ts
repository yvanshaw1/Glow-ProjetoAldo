import { describe, expect, it } from "vitest";
import {
  findNextStatus,
  type AppointmentAction,
  type AppointmentActor,
} from "@/server/rules/status-transitions";

// docs/agendamento/calculos.md, section 2: each action takes an appointment
// from one status to the next, by the client or the staff (RN017 to RN020).
// null means the transition is not in the table (409 INVALID_STATUS).

const ACTIONS: AppointmentAction[] = [
  "advance",
  "complete",
  "cancel",
  "reschedule",
];
const ACTORS: AppointmentActor[] = ["client", "staff"];

describe("findNextStatus", () => {
  it("advances a scheduled appointment to checked in, by the staff (RN017)", () => {
    expect(
      findNextStatus({
        action: "advance",
        status: "scheduled",
        actor: "staff",
      }),
    ).toBe("checked_in");
  });

  it("advances a checked-in appointment to in progress (RN017)", () => {
    expect(
      findNextStatus({
        action: "advance",
        status: "checked_in",
        actor: "staff",
      }),
    ).toBe("in_progress");
  });

  it("advances an in-progress appointment to awaiting payment (RN017)", () => {
    expect(
      findNextStatus({
        action: "advance",
        status: "in_progress",
        actor: "staff",
      }),
    ).toBe("awaiting_payment");
  });

  it("does not advance an awaiting-payment appointment (RN017, RN018)", () => {
    expect(
      findNextStatus({
        action: "advance",
        status: "awaiting_payment",
        actor: "staff",
      }),
    ).toBeNull();
  });

  it("completes an awaiting-payment appointment, by the staff (RN018)", () => {
    expect(
      findNextStatus({
        action: "complete",
        status: "awaiting_payment",
        actor: "staff",
      }),
    ).toBe("completed");
  });

  it("does not complete before awaiting payment (RN018)", () => {
    expect(
      findNextStatus({
        action: "complete",
        status: "in_progress",
        actor: "staff",
      }),
    ).toBeNull();
  });

  it("lets only the staff advance and complete (RN017)", () => {
    expect(
      findNextStatus({
        action: "advance",
        status: "scheduled",
        actor: "client",
      }),
    ).toBeNull();
    expect(
      findNextStatus({
        action: "complete",
        status: "awaiting_payment",
        actor: "client",
      }),
    ).toBeNull();
  });

  it("lets the client and the staff cancel a scheduled appointment (RN019)", () => {
    for (const actor of ACTORS) {
      expect(
        findNextStatus({ action: "cancel", status: "scheduled", actor }),
      ).toBe("cancelled");
    }
  });

  it("lets only the staff cancel a checked-in appointment (RN019)", () => {
    expect(
      findNextStatus({
        action: "cancel",
        status: "checked_in",
        actor: "staff",
      }),
    ).toBe("cancelled");
    expect(
      findNextStatus({
        action: "cancel",
        status: "checked_in",
        actor: "client",
      }),
    ).toBeNull();
  });

  it.each(["in_progress", "awaiting_payment", "completed"] as const)(
    "does not cancel from in progress on: %s (RN019)",
    (status) => {
      for (const actor of ACTORS) {
        expect(findNextStatus({ action: "cancel", status, actor })).toBeNull();
      }
    },
  );

  it("reschedules a completed appointment, by the client or the staff (RN020)", () => {
    for (const actor of ACTORS) {
      expect(
        findNextStatus({ action: "reschedule", status: "completed", actor }),
      ).toBe("rescheduled");
    }
  });

  // Rescheduled is final, so an appointment is rescheduled only once (RN020).
  it.each(["cancelled", "rescheduled"] as const)(
    "allows nothing from %s (RN017, RN020)",
    (status) => {
      for (const action of ACTIONS) {
        for (const actor of ACTORS) {
          expect(findNextStatus({ action, status, actor })).toBeNull();
        }
      }
    },
  );

  it("rejects a transition outside the table (RN017)", () => {
    expect(
      findNextStatus({
        action: "advance",
        status: "completed",
        actor: "staff",
      }),
    ).toBeNull();
    expect(
      findNextStatus({
        action: "reschedule",
        status: "scheduled",
        actor: "staff",
      }),
    ).toBeNull();
  });
});
