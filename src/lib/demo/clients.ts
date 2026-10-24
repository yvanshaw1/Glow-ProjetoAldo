import type { ClientProfile } from "@/shared/api/clients";

// Demo data of the clients module (decision 0055): Henrique Costa, of
// supabase/seed-demo.sql, whose two vehicles have different types and one of
// them is also linked to another account (RN036), and the 13 clients of the
// seed for the panel.

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

export type SeedClient = {
  // The seed's (md5 of 'glow-demo:client:<email>' as a UUID).
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // The 11 digits of the seed: '829000000' and the number of the client.
  phone: string;
  // The plates of the vehicles in the order of the seed's links; the SW4 is
  // in two accounts (RN036), and the last client has no vehicle (UC11 FE02).
  plates: readonly string[];
};

export const SEED_CLIENTS: readonly SeedClient[] = [
  {
    id: "6e3af2f0-d5f6-8ccb-6a0b-23a032adb9c7",
    firstName: "Ana",
    lastName: "Souza",
    email: "ana.souza@example.com",
    phone: "82900000001",
    plates: ["GLW1A01", "GLW4K14"],
  },
  {
    id: "54040f09-6a13-bb29-31ad-2c7e13af9e30",
    firstName: "Bruno",
    lastName: "Lima",
    email: "bruno.lima@example.com",
    phone: "82900000002",
    plates: ["GLW2B02"],
  },
  {
    id: "18d16cc3-0cb0-2238-4129-579385a400e8",
    firstName: "Carla",
    lastName: "Mendes",
    email: "carla.mendes@example.com",
    phone: "82900000003",
    plates: ["GLW3C03"],
  },
  {
    id: "497825dd-5cc8-172e-dfa5-97ef95a40991",
    firstName: "Diego",
    lastName: "Ferreira",
    email: "diego.ferreira@example.com",
    phone: "82900000004",
    plates: ["GLW4D04"],
  },
  {
    id: "9d30163b-6d1b-987b-db12-fe3e0042c86f",
    firstName: "Eduarda",
    lastName: "Santos",
    email: "eduarda.santos@example.com",
    phone: "82900000005",
    plates: ["GLW5E05"],
  },
  {
    id: "4cb1c61e-c001-1bb5-394b-6f077d2190d8",
    firstName: "Felipe",
    lastName: "Araújo",
    email: "felipe.araujo@example.com",
    phone: "82900000006",
    plates: ["GLW6F06"],
  },
  {
    id: "2a286f70-a103-d75b-4b1e-ae5fd0857331",
    firstName: "Gabriela",
    lastName: "Rocha",
    email: "gabriela.rocha@example.com",
    phone: "82900000007",
    plates: ["GLW7G07"],
  },
  {
    id: "af2402c3-cfea-a4a6-01d7-468023f806e9",
    firstName: "Henrique",
    lastName: "Costa",
    email: "henrique.costa@example.com",
    phone: "82900000008",
    plates: ["GLW8H08", "GLW5L15"],
  },
  {
    id: "dcf4adbe-5da6-0ea0-f32a-443838286984",
    firstName: "Isabela",
    lastName: "Melo",
    email: "isabela.melo@example.com",
    phone: "82900000009",
    plates: ["GLW9J09", "GLW5L15"],
  },
  {
    id: "2e3719a4-d9ac-f3e0-ceb7-8d70c629ccbc",
    firstName: "João Pedro",
    lastName: "Barros",
    email: "joao.barros@example.com",
    phone: "82900000010",
    plates: ["GLW1010"],
  },
  {
    id: "d2b39c31-3c7c-a8a9-ca46-f2171d461a35",
    firstName: "Larissa",
    lastName: "Cavalcanti",
    email: "larissa.cavalcanti@example.com",
    phone: "82900000011",
    plates: ["GLW2020"],
  },
  {
    id: "dff70c83-9281-0c27-0984-2109b7db829b",
    firstName: "Marcos",
    lastName: "Tenório",
    email: "marcos.tenorio@example.com",
    phone: "82900000012",
    plates: ["GLW3030"],
  },
  {
    id: "62b6df5e-572d-b2ad-5f69-aa600cf6dcac",
    firstName: "Natália",
    lastName: "Pires",
    email: "natalia.pires@example.com",
    phone: "82900000013",
    plates: [],
  },
];
