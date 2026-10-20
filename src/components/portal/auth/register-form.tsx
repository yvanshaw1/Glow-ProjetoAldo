"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { FormAlert, useFormFailure } from "@/components/portal/auth/form-alert";
import { FormField } from "@/components/portal/auth/form-field";
import { withNext } from "@/components/portal/auth/next-param";
import { PasswordInput } from "@/components/portal/auth/password-input";
import { SubmitButton } from "@/components/portal/auth/submit-button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api-client";
import type { RegisteredClient } from "@/shared/api/auth";
import { formatPhone } from "@/shared/format/phone";
import { registerFormSchema } from "@/shared/validation/auth";

type RegisterFormValues = z.output<typeof registerFormSchema>;

const LINK_CLASS = "font-semibold text-link underline-offset-4 hover:underline";

// UC02: the visitor creates a client account (RF007).
export function RegisterForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);
  const loginHref = withNext("/login", next);

  // The confirmation is checked only here: the API gets its own fields.
  async function submit({
    firstName,
    lastName,
    email,
    phone,
    password,
  }: RegisterFormValues) {
    clearFailure();
    try {
      await apiRequest<RegisteredClient>("/api/auth/register", {
        method: "POST",
        body: { firstName, lastName, email, phone, password },
      });
      setIsLeaving(true);
      // UC02, step 6: the login tells the account was created.
      const params = new URLSearchParams({ registered: "1" });
      if (next !== null) params.set("next", next);
      router.push(`/login?${params}`);
    } catch (error) {
      showFailure(error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {failure && (
        <FormAlert key={failure.key}>
          {failure.error.message}
          {/* UC02 FE02: the e-mail in use suggests the login. */}
          {failure.error.code === "EMAIL_IN_USE" && (
            <>
              {" "}
              <Link href={loginHref} className={LINK_CLASS}>
                Entrar
              </Link>
            </>
          )}
        </FormAlert>
      )}
      <form
        noValidate
        onSubmit={handleSubmit(submit, clearFailure)}
        className="flex flex-col gap-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={control}
            name="firstName"
            label="Nome"
            renderInput={(field) => (
              <Input {...field} autoComplete="given-name" />
            )}
          />
          <FormField
            control={control}
            name="lastName"
            label="Sobrenome"
            renderInput={(field) => (
              <Input {...field} autoComplete="family-name" />
            )}
          />
        </div>
        <FormField
          control={control}
          name="email"
          label="E-mail"
          renderInput={(field) => (
            <Input
              {...field}
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
            />
          )}
        />
        <FormField
          control={control}
          name="phone"
          label="Celular"
          description="Com DDD, como (82) 99999-8888."
          renderInput={(field) => (
            <Input
              {...field}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              onChange={(event) =>
                field.onChange(formatPhone(event.target.value))
              }
            />
          )}
        />
        <FormField
          control={control}
          name="password"
          label="Senha"
          description="De 8 a 72 caracteres, com letra maiúscula, número e caractere especial."
          renderInput={(field) => (
            <PasswordInput {...field} autoComplete="new-password" />
          )}
        />
        <FormField
          control={control}
          name="passwordConfirmation"
          label="Confirmar senha"
          renderInput={(field) => (
            <PasswordInput {...field} autoComplete="new-password" />
          )}
        />
        <SubmitButton
          isLoading={formState.isSubmitting || isLeaving}
          loadingLabel="Criando conta…"
        >
          Criar conta
        </SubmitButton>
      </form>
      {/* UC02 FA01: whoever has an account goes to the login. */}
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href={loginHref} className={LINK_CLASS}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
