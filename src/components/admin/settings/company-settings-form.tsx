"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { useFormFailure } from "@/hooks/use-form-failure";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { CompanySettings } from "@/shared/api/settings";
import { formatCnpj } from "@/shared/format/cnpj";
import { formatPhone } from "@/shared/format/phone";
import {
  companySettingsSchema,
  type CompanySettingsFormInput,
  type CompanySettingsInput,
} from "@/shared/validation/settings";

// UC22: the company data of the Empresa tab of /admin/settings. Every field
// but the name is optional, and an empty one erases the stored value
// (docs/padroes/componentes.md, Formulários).

const COMPANY_SETTINGS_PATH = "/api/admin/settings/company";
const FIELD_COUNT = 8;

// Stored values in the fields, with the masks; null shows as an empty field.
function toFormValues(settings: CompanySettings): CompanySettingsFormInput {
  return {
    companyName: settings.companyName,
    cnpj: settings.cnpj === null ? "" : formatCnpj(settings.cnpj),
    email: settings.email ?? "",
    phone: settings.phone === null ? "" : formatPhone(settings.phone),
    address: settings.address ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    facebookUrl: settings.facebookUrl ?? "",
    whatsapp: settings.whatsapp === null ? "" : formatPhone(settings.whatsapp),
    updatedAt: settings.updatedAt,
  };
}

export function CompanySettingsForm() {
  const { data, error, reload } = useApiQuery<CompanySettings>(
    COMPANY_SETTINGS_PATH,
  );
  if (data !== null) {
    return <CompanyForm settings={data} onConflict={reload} />;
  }
  // RNF004: the place of the fields while loading; a failure offers a retry.
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {error.message}
          <Button variant="secondary" onClick={reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div aria-busy className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: FIELD_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-17 rounded-xl" />
      ))}
    </div>
  );
}

type CompanyFormProps = {
  settings: CompanySettings;
  onConflict: () => void;
};

function CompanyForm({ settings, onConflict }: CompanyFormProps) {
  const { control, handleSubmit, setError, reset, formState } = useForm({
    resolver: zodResolver(companySettingsSchema),
    mode: "onTouched",
    defaultValues: toFormValues(settings),
  });
  const { failure, showFailure, clearFailure } = useFormFailure(setError);
  const [isSaved, setIsSaved] = useState(false);

  // RNF011: after a version conflict the record is read again, and its
  // current data replaces what was typed.
  useEffect(() => {
    reset(toFormValues(settings));
  }, [settings, reset]);

  function clearNotices() {
    clearFailure();
    setIsSaved(false);
  }

  async function submit(values: CompanySettingsInput) {
    clearNotices();
    try {
      const saved = await apiRequest<CompanySettings>(COMPANY_SETTINGS_PATH, {
        method: "PUT",
        body: values,
      });
      reset(toFormValues(saved));
      setIsSaved(true);
    } catch (error) {
      showFailure(error);
      if (error instanceof ApiError && error.code === "VERSION_CONFLICT") {
        onConflict();
      }
    }
  }

  return (
    <div>
      {/* RNF004: a polite status, present before the notice appears, so the
          screen reader hears it without the focus leaving the button. */}
      <div role="status">
        {isSaved && (
          <Alert role="none" className="mb-6">
            <CircleCheckIcon aria-hidden />
            <AlertDescription>Dados da empresa salvos.</AlertDescription>
          </Alert>
        )}
      </div>
      {failure && (
        <div className="mb-6">
          <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
        </div>
      )}
      <form
        noValidate
        onSubmit={handleSubmit(submit, clearNotices)}
        onChange={() => setIsSaved(false)}
        className="flex flex-col gap-8"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <FieldGroupSet legend="Identificação">
            <FormField
              control={control}
              name="companyName"
              label="Nome da empresa"
              renderInput={(field) => <Input {...field} autoComplete="off" />}
            />
            <FormField
              control={control}
              name="cnpj"
              label="CNPJ (opcional)"
              renderInput={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  onChange={(event) =>
                    field.onChange(formatCnpj(event.target.value))
                  }
                />
              )}
            />
          </FieldGroupSet>
          <FieldGroupSet legend="Contato">
            <FormField
              control={control}
              name="email"
              label="E-mail (opcional)"
              renderInput={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="email"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              )}
            />
            <FormField
              control={control}
              name="phone"
              label="Telefone (opcional)"
              renderInput={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  onChange={(event) =>
                    field.onChange(formatPhone(event.target.value))
                  }
                />
              )}
            />
          </FieldGroupSet>
          <FieldGroupSet legend="Redes sociais">
            <FormField
              control={control}
              name="instagramUrl"
              label="Instagram (opcional)"
              description="Como https://instagram.com/glow"
              renderInput={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="url"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              )}
            />
            <FormField
              control={control}
              name="facebookUrl"
              label="Facebook (opcional)"
              description="Como https://facebook.com/glow"
              renderInput={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="url"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              )}
            />
            <FormField
              control={control}
              name="whatsapp"
              label="WhatsApp (opcional)"
              renderInput={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  onChange={(event) =>
                    field.onChange(formatPhone(event.target.value))
                  }
                />
              )}
            />
          </FieldGroupSet>
          <FieldGroupSet legend="Endereço">
            <FormField
              control={control}
              name="address"
              label="Endereço (opcional)"
              renderInput={(field) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  autoComplete="off"
                />
              )}
            />
          </FieldGroupSet>
        </div>
        <SubmitButton
          isLoading={formState.isSubmitting}
          loadingLabel="Salvando…"
          className="w-full sm:w-auto sm:self-end"
        >
          Salvar alterações
        </SubmitButton>
      </form>
    </div>
  );
}

// A group of fields, with the legend as an overline (docs/padroes/design.md).
function FieldGroupSet({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <FieldSet className="gap-5">
      <legend className="mb-1 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {legend}
      </legend>
      {children}
    </FieldSet>
  );
}
