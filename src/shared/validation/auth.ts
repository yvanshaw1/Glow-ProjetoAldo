import { z } from "zod";
import { emailSchema, signInPasswordSchema } from "@/shared/validation/formats";

// Body of POST /api/auth/login (docs/acesso/rotas.md). Unknown fields are
// discarded (RS013).
export const loginSchema = z.object({
  email: emailSchema,
  password: signInPasswordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
