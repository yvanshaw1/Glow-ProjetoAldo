"use client";

import { useId } from "react";
import { useController } from "react-hook-form";
import type { ServiceFormValues } from "@/components/admin/catalog/service-form-values";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { withQuery } from "@/lib/api-client";
import type { AdminServiceSummary } from "@/shared/api/catalog";
import type { Page } from "@/shared/api/pagination";
import { MAX_PAGE_SIZE } from "@/shared/constants/pagination";
import type { ServiceType } from "@/shared/constants/service-types";
import { formatCurrency } from "@/shared/format/currency";

// UC13 steps 8 and 9 and FA01 (docs/catalogo/servicos-do-painel.md): the
// optional link between a main service and its additionals, from either
// side. The services to link come from the listing route, up to the largest
// page; the inactive ones too, so a link already made does not vanish.

const SERVICES_PATH = "/api/admin/services";
const LOADING_PLACES = 3;

type ServiceLinksFieldProps = {
  // The type of the services offered: the additionals of a main service, or
  // the main services of an additional one.
  linkedType: Extract<ServiceType, "main" | "additional">;
  legend: string;
  emptyText: string;
};

export function ServiceLinksField({
  linkedType,
  legend,
  emptyText,
}: ServiceLinksFieldProps) {
  const { field } = useController<ServiceFormValues, "linkedIds">({
    name: "linkedIds",
  });
  const groupName = useId();
  const query = useApiQuery<Page<AdminServiceSummary>>(
    withQuery(SERVICES_PATH, {
      type: linkedType,
      includeInactive: true,
      pageSize: MAX_PAGE_SIZE,
    }),
  );

  function toggle(id: string, isChecked: boolean) {
    field.onChange(
      isChecked
        ? [...field.value, id]
        : field.value.filter((linkedId) => linkedId !== id),
    );
  }

  return (
    <FieldSet className="gap-3">
      <FieldLegend variant="label">{legend}</FieldLegend>
      {query.error ? (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-3">
            {query.error.message}
            <Button type="button" variant="secondary" onClick={query.reload}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      ) : !query.data ? (
        <div aria-busy className="flex flex-col gap-3">
          {Array.from({ length: LOADING_PLACES }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : query.data.data.length === 0 ? (
        <FieldDescription role="status">{emptyText}</FieldDescription>
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.data.map((service, index) => {
            const inputId = `${groupName}-${service.id}`;
            return (
              <li
                key={service.id}
                className="flex items-center gap-3 rounded-xl bg-background p-3 shadow-neu-sm"
              >
                <Checkbox
                  id={inputId}
                  ref={index === 0 ? field.ref : undefined}
                  checked={field.value.includes(service.id)}
                  onCheckedChange={(isChecked) => toggle(service.id, isChecked)}
                  onBlur={field.onBlur}
                />
                <Label
                  htmlFor={inputId}
                  className="flex min-w-0 flex-1 flex-wrap justify-between gap-x-3"
                >
                  <span>
                    {service.name}
                    {!service.isActive && (
                      <span className="text-muted-foreground"> (inativo)</span>
                    )}
                  </span>
                  {service.fixedPrice !== null && (
                    <span className="text-muted-foreground">
                      {formatCurrency(service.fixedPrice)}
                    </span>
                  )}
                </Label>
              </li>
            );
          })}
        </ul>
      )}
    </FieldSet>
  );
}
