import { describe, expect, it } from "vitest";
import {
  canEditAppointment,
  findScheduleChangeError,
} from "@/server/rules/editing";
import type { BusinessDay } from "@/server/rules/scheduling";
import type { AppointmentActor } from "@/server/rules/status-transitions";
import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "@/shared/constants/appointment-statuses";
import { COMPANY_TIME_ZONE } from "@/shared/constants/time-zone";

// docs/agendamento/calculos.md, section 4 (RN032, RN033). The appointment is
// booked for Wednesday, 25 November 2026, at 10:00, and the change happens on
// Tuesday at 10:00, with the hours of supabase/seed.sql.

const CLOSED = {
  isOpen: false,
  opensAt: null,
  closesAt: null,
  breakStartsAt: null,
  breakEndsAt: null,
};
const WEEKDAY_HOURS = {
  isOpen: true,
  opensAt: "08:00",
  closesAt: "18:00",
  breakStartsAt: "12:00",
  breakEndsAt: "13:00",
};
const BUSINESS_HOURS: BusinessDay[] = [
  { weekday: 0, ...CLOSED },
  { weekday: 1, ...WEEKDAY_HOURS },
  { weekday: 2, ...WEEKDAY_HOURS },
  { weekday: 3, ...WEEKDAY_HOURS },
  { weekday: 4, ...WEEKDAY_HOURS },
  { weekday: 5, ...WEEKDAY_HOURS },
  {
    weekday: 6,
    isOpen: true,
    opensAt: "08:00",
    closesAt: "12:00",
    breakStartsAt: null,
    breakEndsAt: null,
  },
];

const WEDNESDAY_AT_TEN = "2026-11-25T10:00:00-03:00";
const TUESDAY_AT_NINE = "2026-11-24T09:00:00-03:00";
const NOW = new Date("2026-11-24T10:00:00-03:00");

function checkChange({
  actor,
  status,
  scheduledAt = WEDNESDAY_AT_TEN,
  newScheduledAt,
  businessHours = BUSINESS_HOURS,
}: {
  actor: AppointmentActor;
  status: AppointmentStatus;
  scheduledAt?: string;
  newScheduledAt: string;
  businessHours?: BusinessDay[];
}) {
  return findScheduleChangeError({
    actor,
    status,
    scheduledAt: new Date(scheduledAt),
    newScheduledAt: new Date(newScheduledAt),
    now: NOW,
    businessHours,
    timeZone: COMPANY_TIME_ZONE,
  });
}

describe("canEditAppointment", () => {
  it("lets the client edit a scheduled appointment (RN032)", () => {
    expect(canEditAppointment({ actor: "client", status: "scheduled" })).toBe(
      true,
    );
  });

  it.each(APPOINTMENT_STATUSES.filter((status) => status !== "scheduled"))(
    "does not let the client edit from checked in on: %s (RN032)",
    (status) => {
      expect(canEditAppointment({ actor: "client", status })).toBe(false);
    },
  );

  it.each(APPOINTMENT_STATUSES)(
    "lets the staff edit in any status: %s (RN032)",
    (status) => {
      expect(canEditAppointment({ actor: "staff", status })).toBe(true);
    },
  );
});

describe("findScheduleChangeError", () => {
  describe("client", () => {
    it("accepts a later day at an earlier time from the client (RN033)", () => {
      expect(
        checkChange({
          actor: "client",
          status: "scheduled",
          newScheduledAt: "2026-11-26T09:00:00-03:00",
        }),
      ).toBeNull();
    });

    it("rejects an earlier date from the client, even in the future (RN033)", () => {
      expect(
        checkChange({
          actor: "client",
          status: "scheduled",
          newScheduledAt: "2026-11-25T09:00:00-03:00",
        }),
      ).toBe("NOT_AFTER_SCHEDULED");
    });

    it("rejects a past date from the client for an overdue appointment (RN015, RN033)", () => {
      expect(
        checkChange({
          actor: "client",
          status: "scheduled",
          scheduledAt: "2026-11-23T10:00:00-03:00",
          newScheduledAt: TUESDAY_AT_NINE,
        }),
      ).toBe("IN_THE_PAST");
    });

    it("checks the availability of the new date (RN013, RN033)", () => {
      expect(
        checkChange({
          actor: "client",
          status: "scheduled",
          newScheduledAt: "2026-11-26T12:30:00-03:00",
        }),
      ).toBe("DURING_BREAK");
      expect(
        checkChange({
          actor: "client",
          status: "scheduled",
          newScheduledAt: "2026-11-29T10:00:00-03:00",
        }),
      ).toBe("CLOSED_DAY");
    });
  });

  describe("staff", () => {
    it("lets the staff bring a scheduled appointment forward (RN033)", () => {
      expect(
        checkChange({
          actor: "staff",
          status: "scheduled",
          newScheduledAt: "2026-11-24T14:00:00-03:00",
        }),
      ).toBeNull();
    });

    it("rejects a past date from the staff in a scheduled appointment (RN033)", () => {
      expect(
        checkChange({
          actor: "staff",
          status: "scheduled",
          newScheduledAt: TUESDAY_AT_NINE,
        }),
      ).toBe("IN_THE_PAST");
    });

    it("accepts a date up to the moment of the change after the vehicle arrives (RN033)", () => {
      expect(
        checkChange({
          actor: "staff",
          status: "checked_in",
          scheduledAt: TUESDAY_AT_NINE,
          newScheduledAt: "2026-11-24T08:30:00-03:00",
        }),
      ).toBeNull();
      expect(
        checkChange({
          actor: "staff",
          status: "checked_in",
          scheduledAt: TUESDAY_AT_NINE,
          newScheduledAt: "2026-11-24T10:00:00-03:00",
        }),
      ).toBeNull();
    });

    it.each([
      "checked_in",
      "in_progress",
      "awaiting_payment",
      "completed",
      "rescheduled",
    ] as const)(
      "rejects a date after the moment of the change from checked in on: %s (RN033)",
      (status) => {
        expect(
          checkChange({
            actor: "staff",
            status,
            scheduledAt: TUESDAY_AT_NINE,
            newScheduledAt: "2026-11-24T10:30:00-03:00",
          }),
        ).toBe("AFTER_NOW");
      },
    );

    it("keeps checking the availability after the vehicle arrives (RN033)", () => {
      expect(
        checkChange({
          actor: "staff",
          status: "in_progress",
          scheduledAt: TUESDAY_AT_NINE,
          newScheduledAt: "2026-11-24T07:30:00-03:00",
        }),
      ).toBe("OUTSIDE_BUSINESS_HOURS");
    });

    it("applies only the availability to a cancelled appointment (RN033)", () => {
      expect(
        checkChange({
          actor: "staff",
          status: "cancelled",
          newScheduledAt: "2026-11-26T09:00:00-03:00",
        }),
      ).toBeNull();
      expect(
        checkChange({
          actor: "staff",
          status: "cancelled",
          newScheduledAt: "2026-11-23T09:00:00-03:00",
        }),
      ).toBeNull();
      expect(
        checkChange({
          actor: "staff",
          status: "cancelled",
          newScheduledAt: "2026-11-29T10:00:00-03:00",
        }),
      ).toBe("CLOSED_DAY");
    });
  });

  describe("unchanged date", () => {
    it("accepts an unchanged date (RN033)", () => {
      expect(
        checkChange({
          actor: "client",
          status: "scheduled",
          newScheduledAt: WEDNESDAY_AT_TEN,
        }),
      ).toBeNull();
    });

    it("accepts an unchanged overdue date from the staff (RN033)", () => {
      const lastMonday = "2026-11-23T10:00:00-03:00";
      expect(
        checkChange({
          actor: "staff",
          status: "scheduled",
          scheduledAt: lastMonday,
          newScheduledAt: lastMonday,
        }),
      ).toBeNull();
    });

    it("accepts an unchanged date outside the current availability (RN033)", () => {
      const wednesdayClosed = BUSINESS_HOURS.map((day) =>
        day.weekday === 3 ? { ...day, ...CLOSED } : day,
      );
      expect(
        checkChange({
          actor: "client",
          status: "scheduled",
          newScheduledAt: WEDNESDAY_AT_TEN,
          businessHours: wednesdayClosed,
        }),
      ).toBeNull();
    });
  });
});
