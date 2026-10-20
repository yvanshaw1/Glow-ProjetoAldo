import type { Metadata } from "next";
import { AuthCard } from "@/components/portal/auth/auth-card";
import { SetPasswordForm } from "@/components/portal/auth/set-password-form";

export const metadata: Metadata = { title: "Nova senha – Glow" };

// UC03 FA03 and UC08 FA01: change of the initial password (RN023, RS004).
export default function SetPasswordPage() {
  return (
    <AuthCard
      title="Defina uma nova senha"
      description="Para continuar, troque a senha inicial que você recebeu no cadastro."
    >
      <SetPasswordForm />
    </AuthCard>
  );
}
