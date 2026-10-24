import type { PricingMode } from "@/shared/constants/pricing-modes";
import type { ServiceType } from "@/shared/constants/service-types";
import type { VehicleSize } from "@/shared/constants/vehicle-sizes";

// Bodies of the public routes of docs/catalogo/rotas.md (UC01). An empty
// optional field is null (docs/padroes/api.md).

// GET /api/public/categories: the categories of the catalog filter.
export type PublicCategory = {
  id: string;
  name: string;
};

// One item of the page of GET /api/public/services: an active main or
// complementary service of an active category (RN008, RN031).
export type PublicService = {
  id: string;
  name: string;
  description: string;
  // The public address of the image in the Storage (RS015).
  imageUrl: string | null;
  category: PublicCategory;
  avgDurationMinutes: number;
};

// Bodies of the panel routes of docs/catalogo/rotas.md (UC13 to UC15).
// updatedAt is the version of RNF011, treated as text.

// One item of the page of GET /api/admin/categories.
export type AdminCategory = PublicCategory & {
  description: string;
  isActive: boolean;
  updatedAt: string;
};

// One item of the page of GET /api/admin/services. The additional service
// has no category, description or pricing mode (docs/catalogo/dados.md).
export type AdminServiceSummary = {
  id: string;
  type: ServiceType;
  name: string;
  description: string | null;
  category: PublicCategory | null;
  avgDurationMinutes: number;
  pricingMode: PricingMode | null;
  fixedPrice: number | null;
  // The lowest of the prices by size, for a service priced by size.
  startingPrice: number | null;
  isActive: boolean;
  // RN031: false when the category is inactive; null without category.
  isCategoryActive: boolean | null;
  updatedAt: string;
};

// GET /api/admin/services/:id: the prices and the links of the service.
export type AdminService = AdminServiceSummary & {
  imageUrl: string | null;
  // RN009: one price for each size of a service priced by size.
  prices: Record<VehicleSize, number> | null;
  // The additional services of a main service (RN006).
  additionalIds: string[];
  // The main services of an additional service.
  mainServiceIds: string[];
};
