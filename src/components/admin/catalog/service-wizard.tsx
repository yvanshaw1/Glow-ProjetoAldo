"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ServiceLinksField } from "@/components/admin/catalog/service-links-step";
import {
  AdditionalServiceStep,
  ServiceInfoStep,
} from "@/components/admin/catalog/service-data-step";
import {
  getInitialValues,
  getServiceSteps,
  toRequestBody,
  type ServiceFormValues,
} from "@/components/admin/catalog/service-form-values";
import { ServicePricesStep } from "@/components/admin/catalog/service-prices-step";
import { FormAlert } from "@/components/shared/form-alert";
import { StepForm } from "@/components/shared/step-form";
import { useFormFailure } from "@/hooks/use-form-failure";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { AdminService } from "@/shared/api/catalog";
import type { ServiceType } from "@/shared/constants/service-types";

// UC13 and UC14 steps 4 to 7 (docs/catalogo/servicos-do-painel.md): the
// service in the steps of its type, or edited with its type fixed. One form
// for all the steps (RNF002). With the demo data the form has no validation
// schema yet (decision 0055): "Próximo" only checks that the step was filled,
// and the send shows the NOT_IMPLEMENTED of the demo.

const SERVICES_PATH = "/api/admin/services";

type ServiceWizardProps = {
  type: ServiceType;
  // The service being edited; without it, a new one.
  service?: AdminService;
  onCancel: () => void;
  // The service was created or saved.
  onDone: () => void;
  // RNF011: the service was changed by someone else; read it again.
  onConflict: () => void;
  onGoToCategories: () => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

export function ServiceWizard({
  type,
  service,
  onCancel,
  onDone,
  onConflict,
  onGoToCategories,
  onSubmittingChange,
}: ServiceWizardProps) {
  // The choice of a step checks it again, so its message leaves as soon as it
  // is made (RNF003).
  const form = useForm<ServiceFormValues>({
    defaultValues: getInitialValues(type, service),
    mode: "onChange",
  });
  const { failure, showFailure, clearFailure } = useFormFailure(form.setError);
  const steps = getServiceSteps(type);
  const { getValues } = form;

  // The preview of the image is a local address, released with the form.
  useEffect(
    () => () => {
      const image = getValues("image");
      if (image) URL.revokeObjectURL(image.previewUrl);
    },
    [getValues],
  );

  async function submit(values: ServiceFormValues) {
    clearFailure();
    onSubmittingChange(true);
    try {
      const body = toRequestBody(type, values);
      await apiRequest(
        service ? `${SERVICES_PATH}/${service.id}` : SERVICES_PATH,
        {
          method: service ? "PATCH" : "POST",
          body: service ? { ...body, updatedAt: service.updatedAt } : body,
        },
      );
      onDone();
    } catch (error) {
      showFailure(error);
      if (error instanceof ApiError && error.code === "VERSION_CONFLICT") {
        onConflict();
      }
    } finally {
      onSubmittingChange(false);
    }
  }

  return (
    <FormProvider {...form}>
      {failure && (
        <FormAlert key={failure.key}>{failure.error.message}</FormAlert>
      )}
      <StepForm
        form={form}
        steps={steps}
        onSubmit={submit}
        submitLabel="Salvar serviço"
        loadingLabel="Salvando…"
        onCancel={onCancel}
      >
        {(stepIndex) => {
          if (type === "additional") return <AdditionalServiceStep />;
          if (stepIndex === 0) {
            return <ServiceInfoStep onGoToCategories={onGoToCategories} />;
          }
          if (stepIndex === 1) return <ServicePricesStep />;
          return (
            <ServiceLinksField
              linkedType="additional"
              legend="Serviços adicionais que podem ser contratados junto (opcional)"
              emptyText="Nenhum serviço adicional cadastrado."
            />
          );
        }}
      </StepForm>
    </FormProvider>
  );
}
