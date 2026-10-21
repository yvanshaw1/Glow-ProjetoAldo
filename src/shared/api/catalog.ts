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
