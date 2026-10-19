import { handleRoute } from "@/server/http/handler";
import { respondCreated } from "@/server/http/respond";
import { register } from "@/server/services/auth";
import { registerSchema } from "@/shared/validation/auth";

// UC02: public route; the session, if any, is not read nor changed.
export const POST = handleRoute(async ({ body }) => {
  const input = registerSchema.parse(body);
  return respondCreated(await register(input));
});
