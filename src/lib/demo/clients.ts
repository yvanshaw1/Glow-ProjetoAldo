import type { ClientProfile } from "@/shared/api/clients";

// Demo data of the clients module (decision 0055): Henrique Costa, of
// supabase/seed-demo.sql, whose two vehicles have different types and one of
// them is also linked to another account (RN036).

const PROFILE: ClientProfile = {
  firstName: "Henrique",
  lastName: "Costa",
  email: "henrique.costa@example.com",
  phone: "82900000008",
  updatedAt: "2026-06-23T12:00:00+00:00",
};

// GET /api/me/profile
export function answerProfile(): ClientProfile {
  return PROFILE;
}
