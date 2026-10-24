"use client";

import { useState, type ReactElement } from "react";
import {
  ChoiceGroup,
  type Choice,
} from "@/components/admin/catalog/choice-group";
import { ServiceWizard } from "@/components/admin/catalog/service-wizard";
import { FormDialog } from "@/components/shared/form-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import type { AdminService } from "@/shared/api/catalog";
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPES,
  type ServiceType,
} from "@/shared/constants/service-types";

// UC13 steps 1 to 3 and UC14 steps 4 and 5 (docs/catalogo/servicos-do-painel.md):
// the window of a new service, which starts with the choice of the type, or of
// an edited one, which reads the service when it opens.

const SERVICES_PATH = "/api/admin/services";

const TYPE_DESCRIPTIONS = {
  main: "Serviço central do agendamento.",
  additional: "Oferecido junto com um serviço principal, com valor fixo.",
  complementary: "Serviço independente, sem adicionais.",
} as const satisfies Record<ServiceType, string>;

const TYPE_CHOICES: Choice<ServiceType>[] = SERVICE_TYPES.map((type) => ({
  value: type,
  label: SERVICE_TYPE_LABELS[type],
  description: TYPE_DESCRIPTIONS[type],
}));

type ServiceFormDialogProps = {
  // The button that opens the window, as the `render` of the trigger.
  trigger: ReactElement;
  // The id of the service being edited; without it, a new one.
  serviceId?: string;
  // The service was created or saved.
  onSaved: () => void;
  // FE03: the way to the categories when there is none.
  onGoToCategories: () => void;
};

export function ServiceFormDialog({
  trigger,
  serviceId,
  onSaved,
  onGoToCategories,
}: ServiceFormDialogProps) {
  return (
    <FormDialog
      trigger={trigger}
      title={serviceId ? "Editar serviço" : "Novo serviço"}
    >
      {({ close, setSubmitting }) => {
        const done = () => {
          close();
          onSaved();
        };
        const goToCategories = () => {
          close();
          onGoToCategories();
        };
        return serviceId ? (
          <EditService
            id={serviceId}
            onCancel={close}
            onDone={done}
            onGoToCategories={goToCategories}
            onSubmittingChange={setSubmitting}
          />
        ) : (
          <NewService
            onCancel={close}
            onDone={done}
            onGoToCategories={goToCategories}
            onSubmittingChange={setSubmitting}
          />
        );
      }}
    </FormDialog>
  );
}

type WizardHandlers = {
  onCancel: () => void;
  onDone: () => void;
  onGoToCategories: () => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

// UC13 step 2: the type comes first and decides the steps (RN006).
function NewService({ onCancel, ...handlers }: WizardHandlers) {
  const [chosen, setChosen] = useState<ServiceType>("main");
  const [type, setType] = useState<ServiceType | null>(null);
  if (type) {
    return (
      <ServiceWizard
        type={type}
        onCancel={onCancel}
        onConflict={() => {}}
        {...handlers}
      />
    );
  }
  return (
    <div className="@container flex flex-col gap-6">
      <ChoiceGroup
        legend="Tipo de serviço"
        choices={TYPE_CHOICES}
        value={chosen}
        onChange={setChosen}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          className="sm:ml-auto"
          onClick={() => setType(chosen)}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

// UC14 step 5: the data of the service, with its type fixed. A conflict reads
// the service again, and the form starts over with the current data (RNF011).
function EditService({
  id,
  onCancel,
  ...handlers
}: WizardHandlers & { id: string }) {
  const query = useApiQuery<AdminService>(`${SERVICES_PATH}/${id}`);
  if (query.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {query.error.message}
          <Button type="button" variant="secondary" onClick={query.reload}>
            Tentar novamente
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!query.data) {
    return (
      <div aria-busy className="flex flex-col gap-4">
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }
  return (
    <ServiceWizard
      key={query.data.updatedAt}
      type={query.data.type}
      service={query.data}
      onCancel={onCancel}
      onConflict={query.reload}
      {...handlers}
    />
  );
}
