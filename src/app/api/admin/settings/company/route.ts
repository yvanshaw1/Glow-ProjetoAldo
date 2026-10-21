import { requirePermission } from "@/server/auth/guards";
import { handleRoute } from "@/server/http/handler";
import { respondOk } from "@/server/http/respond";
import {
  getCompanySettings,
  updateCompanySettings,
} from "@/server/services/settings";
import { companySettingsSchema } from "@/shared/validation/settings";

// UC22: staff with the settings permission (RS008, RS010).
export const GET = handleRoute(async () => {
  await requirePermission("settings");
  return respondOk(await getCompanySettings());
});

export const PUT = handleRoute(async ({ body }) => {
  await requirePermission("settings");
  const input = companySettingsSchema.parse(body);
  return respondOk(await updateCompanySettings(input));
});
