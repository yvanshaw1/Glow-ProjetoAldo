import { handleRoute } from "@/server/http/handler";
import { respondOk } from "@/server/http/respond";
import { getPublicCompany } from "@/server/services/settings";

// RN028: public route, read by the portal footer and home page.
export const GET = handleRoute(async () => respondOk(await getPublicCompany()));
