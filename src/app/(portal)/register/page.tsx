import type { Metadata } from "next";
import { AuthCard } from "@/components/portal/auth/auth-card";
import { readNextParam } from "@/components/portal/auth/next-param";
import { RegisterForm } from "@/components/portal/auth/register-form";

export const metadata: Metadata = { title: "Criar conta – Glow" };

// UC02: sign-up of a client.
export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const { next } = await searchParams;
  return (
    <AuthCard
      title="Criar conta"
      description="Cadastre-se para agendar serviços pelo portal."
    >
      <RegisterForm next={readNextParam(next)} />
    </AuthCard>
  );
}
