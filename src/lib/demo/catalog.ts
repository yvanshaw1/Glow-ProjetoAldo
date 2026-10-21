import { demoPage } from "@/lib/demo/list";
import type { DemoRequest } from "@/lib/demo/routes";
import type { PublicCategory, PublicService } from "@/shared/api/catalog";
import type { Page } from "@/shared/api/pagination";
import { CATALOG_PAGE_SIZE } from "@/shared/constants/pagination";

// Demo data of the catalog module (decision 0055), from
// supabase/seed-demo.sql. The ids are the seed's (md5 of 'glow-demo:<key>' as
// a UUID), so the routes of #48 answer the same ones.

const CLEANING: PublicCategory = {
  id: "d3be5225-b9b0-41ef-210a-0d86a965f75d",
  name: "Higienização",
};
const WASH: PublicCategory = {
  id: "4e31423b-fe30-cf42-7e5a-eebc618ac6e6",
  name: "Lavagem",
};
const POLISH: PublicCategory = {
  id: "c3cce2b8-4899-3cc5-90a5-5b36e0a9781e",
  name: "Polimento e proteção",
};

// The active categories with an active service, by name.
const PUBLIC_CATEGORIES: PublicCategory[] = [CLEANING, WASH, POLISH];

// RN008, RN031: the active main and complementary services of active
// categories, in the order of the seed. No image until #47.
const PUBLIC_SERVICES: PublicService[] = [
  {
    id: "c64b0c68-6690-ab4c-dd8d-397aec5be871",
    name: "Lavagem simples",
    description:
      "Lavagem externa com shampoo neutro, aspiração interna e limpeza dos vidros.",
    category: WASH,
    avgDurationMinutes: 40,
  },
  {
    id: "7ce749ea-491a-fa99-6834-718d1fe5725e",
    name: "Lavagem completa",
    description:
      "Lavagem externa e interna detalhada, com limpeza de painel, portas, rodas e caixas de roda.",
    category: WASH,
    avgDurationMinutes: 90,
  },
  {
    id: "a338b84b-5bc4-06aa-b66f-025b61bd7a64",
    name: "Lavagem técnica",
    description:
      "Lavagem minuciosa com descontaminação da pintura e limpeza de frisos, emblemas e rodas.",
    category: WASH,
    avgDurationMinutes: 180,
  },
  {
    id: "7cb46ab5-32b1-f8e0-e0a7-6d9f9cf55798",
    name: "Polimento comercial",
    description:
      "Polimento em uma etapa que remove riscos leves e manchas e devolve o brilho da pintura.",
    category: POLISH,
    avgDurationMinutes: 240,
  },
  {
    id: "ff863a74-e17a-b011-5ae2-9e718d5612c3",
    name: "Polimento técnico",
    description:
      "Correção de pintura em várias etapas, para riscos e marcas mais profundos.",
    category: POLISH,
    avgDurationMinutes: 480,
  },
  {
    id: "00c3d0e7-79d0-a6b3-9b50-9598c9cadbe7",
    name: "Vitrificação de pintura",
    description:
      "Polimento seguido de proteção cerâmica, que repele água e sujeira por até três anos.",
    category: POLISH,
    avgDurationMinutes: 900,
  },
  {
    id: "06c8860d-1b78-2d75-4a2e-fede222dc8d7",
    name: "Higienização interna completa",
    description:
      "Limpeza profunda de bancos, carpetes, teto e portas, com extração e secagem.",
    category: CLEANING,
    avgDurationMinutes: 300,
  },
  {
    id: "cff70583-8ed7-ad1c-ab6a-bc266b04f31f",
    name: "Higienização do ar-condicionado",
    description:
      "Limpeza e desinfecção dos dutos e do evaporador do ar-condicionado.",
    category: CLEANING,
    avgDurationMinutes: 60,
  },
  {
    id: "d05d5475-d570-c23f-785d-9cdd9bc54bd3",
    name: "Lavagem de motor",
    description:
      "Limpeza do compartimento do motor com produtos que protegem as partes elétricas.",
    category: WASH,
    avgDurationMinutes: 40,
  },
  {
    id: "9b46a99e-80d5-d981-ed80-ea6cd378d2c5",
    name: "Revitalização de faróis",
    description:
      "Lixamento, polimento e proteção dos faróis amarelados ou opacos.",
    category: POLISH,
    avgDurationMinutes: 60,
  },
  {
    id: "fd8928ee-be2c-ebd5-176b-669e3e18f80c",
    name: "Oxi-sanitização",
    description:
      "Eliminação de odores, fungos e bactérias do interior com ozônio.",
    category: CLEANING,
    avgDurationMinutes: 40,
  },
].map((service) => ({ ...service, imageUrl: null }));

// GET /api/public/categories
export function answerPublicCategories(): PublicCategory[] {
  return PUBLIC_CATEGORIES;
}

// GET /api/public/services, with the categoryId filter.
export function answerPublicServices({
  query,
}: DemoRequest): Page<PublicService> {
  return demoPage(PUBLIC_SERVICES, query, {
    pageSize: CATALOG_PAGE_SIZE,
    filters: { categoryId: (service) => service.category.id },
  });
}
