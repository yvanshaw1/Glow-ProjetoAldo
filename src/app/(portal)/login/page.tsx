import type { Metadata } from "next";
import { AuthCard } from "@/components/portal/auth/auth-card";
import { LoginForm } from "@/components/portal/auth/login-form";
import { readNextParam } from "@/components/portal/auth/next-param";

export const metadata: Metadata = { title: "Entrar – Glow" };

// UC03 and UC08: one login for the portal and the panel (RN029).
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, registered } = await searchParams;
  return (
    <AuthCard title="Entrar" description="Use o e-mail e a senha da sua conta.">
      <LoginForm next={readNextParam(next)} isRegistered={registered === "1"} />
    </AuthCard>
  );
}
