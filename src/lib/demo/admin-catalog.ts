import { notFound } from "@/lib/demo/appointments";
import { demoPage } from "@/lib/demo/list";
import type { DemoRequest } from "@/lib/demo/routes";
import type {
  AdminCategory,
  AdminService,
  AdminServiceSummary,
} from "@/shared/api/catalog";
import type { Page } from "@/shared/api/pagination";
import { ADMIN_LIST_PAGE_SIZE } from "@/shared/constants/pagination";
import type { ServiceType } from "@/shared/constants/service-types";
import type { VehicleSize } from "@/shared/constants/vehicle-sizes";

// Demo data of the panel routes of the catalog module (decision 0055), from
// supabase/seed-demo.sql: its categories, services, prices by size and links,
// without the deleted service (RN030). The ids are the seed's (md5 of
// 'glow-demo:<key>' as a UUID), so the routes of #40 and #44 answer the same
// ones. The images stay empty until #47.

const UPDATED_AT = "2026-06-23T12:00:00+00:00";
const SEARCH_LOCALE = "pt-BR";

const CATEGORIES: AdminCategory[] = [
  {
    id: "d3be5225-b9b0-41ef-210a-0d86a965f75d",
    name: "Higienização",
    description:
      "Limpeza profunda do interior: bancos, carpetes, teto e ar-condicionado.",
    isActive: true,
  },
  {
    id: "4e31423b-fe30-cf42-7e5a-eebc618ac6e6",
    name: "Lavagem",
    description:
      "Lavagens externas e internas, da manutenção semanal à limpeza detalhada.",
    isActive: true,
  },
  {
    id: "c3cce2b8-4899-3cc5-90a5-5b36e0a9781e",
    name: "Polimento e proteção",
    description:
      "Correção de pintura, polimento e proteção com cera, selante ou vitrificação.",
    isActive: true,
  },
  {
    id: "387d2a9a-db31-6e41-3d6d-574530659b24",
    name: "Película e envelopamento",
    description: "Películas de controle solar e envelopamento da carroceria.",
    isActive: false,
  },
].map((category) => ({ ...category, updatedAt: UPDATED_AT }));

const CLEANING = CATEGORIES[0];
const WASH = CATEGORIES[1];
const POLISH = CATEGORIES[2];
const FILM = CATEGORIES[3];

// The prices of P, M, G and GG.
type Prices = readonly [number, number, number, number];

type SeedService = {
  id: string;
  name: string;
  type: ServiceType;
  category: AdminCategory | null;
  description: string | null;
  minutes: number;
  // A fixed price, or the prices by size.
  price: number | Prices;
  isActive: boolean;
  // The additional services of a main one, by name.
  additionals?: string[];
};

const SERVICES: SeedService[] = [
  {
    id: "c64b0c68-6690-ab4c-dd8d-397aec5be871",
    name: "Lavagem simples",
    type: "main",
    category: WASH,
    description:
      "Lavagem externa com shampoo neutro, aspiração interna e limpeza dos vidros.",
    minutes: 40,
    price: [40, 50, 60, 70],
    isActive: true,
    additionals: ["Cera de carnaúba", "Pretinho nos pneus"],
  },
  {
    id: "7ce749ea-491a-fa99-6834-718d1fe5725e",
    name: "Lavagem completa",
    type: "main",
    category: WASH,
    description:
      "Lavagem externa e interna detalhada, com limpeza de painel, portas, rodas e caixas de roda.",
    minutes: 90,
    price: [70, 85, 100, 120],
    isActive: true,
    additionals: [
      "Cera de carnaúba",
      "Pretinho nos pneus",
      "Hidratação de couro",
      "Repelente de chuva nos vidros",
    ],
  },
  {
    id: "a338b84b-5bc4-06aa-b66f-025b61bd7a64",
    name: "Lavagem técnica",
    type: "main",
    category: WASH,
    description:
      "Lavagem minuciosa com descontaminação da pintura e limpeza de frisos, emblemas e rodas.",
    minutes: 180,
    price: [160, 190, 220, 260],
    isActive: true,
    additionals: [
      "Pretinho nos pneus",
      "Hidratação de couro",
      "Repelente de chuva nos vidros",
    ],
  },
  {
    id: "7cb46ab5-32b1-f8e0-e0a7-6d9f9cf55798",
    name: "Polimento comercial",
    type: "main",
    category: POLISH,
    description:
      "Polimento em uma etapa que remove riscos leves e manchas e devolve o brilho da pintura.",
    minutes: 240,
    price: [280, 330, 390, 450],
    isActive: true,
    additionals: ["Repelente de chuva nos vidros"],
  },
  {
    id: "ff863a74-e17a-b011-5ae2-9e718d5612c3",
    name: "Polimento técnico",
    type: "main",
    category: POLISH,
    description:
      "Correção de pintura em várias etapas, para riscos e marcas mais profundos.",
    minutes: 480,
    price: [550, 650, 750, 850],
    isActive: true,
  },
  {
    id: "00c3d0e7-79d0-a6b3-9b50-9598c9cadbe7",
    name: "Vitrificação de pintura",
    type: "main",
    category: POLISH,
    description:
      "Polimento seguido de proteção cerâmica, que repele água e sujeira por até três anos.",
    minutes: 900,
    price: [1100, 1300, 1500, 1700],
    isActive: true,
  },
  {
    id: "06c8860d-1b78-2d75-4a2e-fede222dc8d7",
    name: "Higienização interna completa",
    type: "main",
    category: CLEANING,
    description:
      "Limpeza profunda de bancos, carpetes, teto e portas, com extração e secagem.",
    minutes: 300,
    price: [280, 330, 380, 450],
    isActive: true,
    additionals: ["Hidratação de couro"],
  },
  {
    id: "3425b4b3-bebd-664f-30b5-01c780116972",
    name: "Película nos vidros",
    type: "main",
    category: FILM,
    description:
      "Aplicação de película de controle solar nos vidros laterais e traseiro.",
    minutes: 180,
    price: [300, 350, 400, 450],
    isActive: true,
  },
  {
    id: "cff70583-8ed7-ad1c-ab6a-bc266b04f31f",
    name: "Higienização do ar-condicionado",
    type: "complementary",
    category: CLEANING,
    description:
      "Limpeza e desinfecção dos dutos e do evaporador do ar-condicionado.",
    minutes: 60,
    price: 120,
    isActive: true,
  },
  {
    id: "d05d5475-d570-c23f-785d-9cdd9bc54bd3",
    name: "Lavagem de motor",
    type: "complementary",
    category: WASH,
    description:
      "Limpeza do compartimento do motor com produtos que protegem as partes elétricas.",
    minutes: 40,
    price: 80,
    isActive: true,
  },
  {
    id: "9b46a99e-80d5-d981-ed80-ea6cd378d2c5",
    name: "Revitalização de faróis",
    type: "complementary",
    category: POLISH,
    description:
      "Lixamento, polimento e proteção dos faróis amarelados ou opacos.",
    minutes: 60,
    price: 150,
    isActive: true,
  },
  {
    id: "fd8928ee-be2c-ebd5-176b-669e3e18f80c",
    name: "Oxi-sanitização",
    type: "complementary",
    category: CLEANING,
    description:
      "Eliminação de odores, fungos e bactérias do interior com ozônio.",
    minutes: 40,
    price: 100,
    isActive: true,
  },
  {
    id: "cd4e929f-bdc1-2bb1-8e1b-a7a4eb297a0c",
    name: "Cristalização de vidros",
    type: "complementary",
    category: POLISH,
    description:
      "Tratamento dos vidros que melhora a visibilidade e facilita a limpeza.",
    minutes: 40,
    price: 90,
    isActive: false,
  },
  {
    id: "ac4fa6ae-6246-3d34-9fd9-4f849625ecb6",
    name: "Cera de carnaúba",
    type: "additional",
    category: null,
    description: null,
    minutes: 20,
    price: 35,
    isActive: true,
  },
  {
    id: "c4c3b3ae-8b50-6a4f-af47-041a8f2c210e",
    name: "Pretinho nos pneus",
    type: "additional",
    category: null,
    description: null,
    minutes: 10,
    price: 10,
    isActive: true,
  },
  {
    id: "e904e83f-4d0f-e45b-3e7e-ab9fffc852cb",
    name: "Hidratação de couro",
    type: "additional",
    category: null,
    description: null,
    minutes: 40,
    price: 90,
    isActive: true,
  },
  {
    id: "4c854969-1a3a-ae32-c28a-e18ad83e465c",
    name: "Repelente de chuva nos vidros",
    type: "additional",
    category: null,
    description: null,
    minutes: 20,
    price: 50,
    isActive: true,
  },
];

const SIZES: readonly VehicleSize[] = [
  "small",
  "medium",
  "large",
  "extra_large",
];

function findServiceId(name: string): string {
  const service = SERVICES.find((candidate) => candidate.name === name);
  if (!service) throw new Error(`Unknown demo service: ${name}`);
  return service.id;
}

// RN009: the prices by size, or null for a fixed price.
function toPrices(price: SeedService["price"]): AdminService["prices"] {
  if (typeof price === "number") return null;
  return Object.fromEntries(
    SIZES.map((size, index) => [size, price[index]]),
  ) as Record<VehicleSize, number>;
}

function toSummary(seed: SeedService): AdminServiceSummary {
  const { price } = seed;
  const isFixed = typeof price === "number";
  return {
    id: seed.id,
    type: seed.type,
    name: seed.name,
    description: seed.description,
    category: seed.category && {
      id: seed.category.id,
      name: seed.category.name,
    },
    avgDurationMinutes: seed.minutes,
    // RN009: the additional service is always fixed.
    pricingMode: isFixed ? "fixed" : "by_size",
    fixedPrice: isFixed ? price : null,
    startingPrice: isFixed ? null : Math.min(...price),
    isActive: seed.isActive,
    isCategoryActive: seed.category ? seed.category.isActive : null,
    updatedAt: UPDATED_AT,
  };
}

function toService(seed: SeedService): AdminService {
  return {
    ...toSummary(seed),
    imageUrl: null,
    prices: toPrices(seed.price),
    additionalIds: (seed.additionals ?? []).map(findServiceId),
    mainServiceIds: SERVICES.filter((main) =>
      main.additionals?.includes(seed.name),
    ).map((main) => main.id),
  };
}

const SUMMARIES: AdminServiceSummary[] = SERVICES.map(toSummary);
const ADMIN_SERVICES: AdminService[] = SERVICES.map(toService);

function compareByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, SEARCH_LOCALE);
}

// The reading of includeInactive: only the text "true" shows them.
function includesInactive(query: URLSearchParams): boolean {
  return query.get("includeInactive") === "true";
}

// GET /api/admin/services (UC14): by name; the filters of the type, the
// inactive services and the search by name. A service of an inactive category
// stays on the panel (RN031).
export function answerAdminServices({
  query,
}: DemoRequest): Page<AdminServiceSummary> {
  const services = includesInactive(query)
    ? SUMMARIES
    : SUMMARIES.filter((service) => service.isActive);
  return demoPage([...services].sort(compareByName), query, {
    pageSize: ADMIN_LIST_PAGE_SIZE,
    searchIn: (service) => [service.name],
    filters: { type: (service) => service.type },
  });
}

// GET /api/admin/services/:id
export function answerAdminService({ params }: DemoRequest): AdminService {
  const service = ADMIN_SERVICES.find(({ id }) => id === params.id);
  if (!service) throw notFound();
  return service;
}

// GET /api/admin/categories (UC15): by name, the inactive ones on request.
export function answerAdminCategories({
  query,
}: DemoRequest): Page<AdminCategory> {
  const categories = includesInactive(query)
    ? CATEGORIES
    : CATEGORIES.filter((category) => category.isActive);
  return demoPage([...categories].sort(compareByName), query, {
    pageSize: ADMIN_LIST_PAGE_SIZE,
  });
}
