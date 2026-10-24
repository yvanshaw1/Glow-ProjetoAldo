import type { FormStep } from "@/components/shared/step-form";
import type { AdminService } from "@/shared/api/catalog";
import type { PricingMode } from "@/shared/constants/pricing-modes";
import type { ServiceType } from "@/shared/constants/service-types";
import type { VehicleSize } from "@/shared/constants/vehicle-sizes";

// The file chosen and the local address of its preview.
export type ServiceImageValue = { file: File; previewUrl: string };

// The values of the form of a service (docs/catalogo/servicos-do-painel.md).
// The type is not a field: it is chosen before the form and cannot change
// (docs/catalogo/dados.md).
export type ServiceFormValues = {
  categoryId: string | null;
  pricingMode: PricingMode;
  durationMinutes: number | null;
  name: string;
  description: string;
  // The image chosen, shown only in the preview until #47 sends it.
  image: ServiceImageValue | null;
  fixedPrice: number | null;
  prices: Record<VehicleSize, number | null>;
  // The additionals of a main service, or the main services of an additional.
  linkedIds: string[];
};

const EMPTY_VALUES: ServiceFormValues = {
  categoryId: null,
  pricingMode: "by_size",
  durationMinutes: null,
  name: "",
  description: "",
  image: null,
  fixedPrice: null,
  prices: { small: null, medium: null, large: null, extra_large: null },
  linkedIds: [],
};

// A new service: the additional is always fixed (RN009).
export function getInitialValues(
  type: ServiceType,
  service?: AdminService,
): ServiceFormValues {
  if (!service) {
    return {
      ...EMPTY_VALUES,
      pricingMode: type === "additional" ? "fixed" : EMPTY_VALUES.pricingMode,
    };
  }
  return {
    categoryId: service.category?.id ?? null,
    pricingMode: service.pricingMode ?? "fixed",
    durationMinutes: service.avgDurationMinutes,
    name: service.name,
    description: service.description ?? "",
    image: null,
    fixedPrice: service.fixedPrice,
    prices: service.prices ?? EMPTY_VALUES.prices,
    linkedIds:
      service.type === "additional"
        ? service.mainServiceIds
        : service.additionalIds,
  };
}

// RF060 to RF063: the steps of each type. The additional has one only (FA01),
// and the complementary has no step of additionals (FA02).
export function getServiceSteps(
  type: ServiceType,
): FormStep<ServiceFormValues>[] {
  if (type === "additional") {
    return [
      {
        title: "Dados do serviço",
        fields: ["name", "durationMinutes", "fixedPrice", "linkedIds"],
      },
    ];
  }
  const steps: FormStep<ServiceFormValues>[] = [
    {
      title: "Informações",
      fields: [
        "categoryId",
        "pricingMode",
        "durationMinutes",
        "name",
        "description",
      ],
    },
    {
      title: "Valores",
      fields: [
        "fixedPrice",
        "prices.small",
        "prices.medium",
        "prices.large",
        "prices.extra_large",
      ],
    },
  ];
  if (type === "main") {
    steps.push({ title: "Adicionais", fields: ["linkedIds"] });
  }
  return steps;
}

// The body of POST and PATCH /api/admin/services (docs/catalogo/rotas.md).
// The image goes by its own route, in #47, and leaves as imagePath.
export function toRequestBody(type: ServiceType, values: ServiceFormValues) {
  const common = {
    name: values.name.trim(),
    avgDurationMinutes: values.durationMinutes,
  };
  if (type === "additional") {
    return {
      type,
      ...common,
      fixedPrice: values.fixedPrice,
      mainServiceIds: values.linkedIds,
    };
  }
  return {
    type,
    ...common,
    categoryId: values.categoryId,
    description: values.description.trim(),
    pricingMode: values.pricingMode,
    ...(values.pricingMode === "fixed"
      ? { fixedPrice: values.fixedPrice }
      : { prices: values.prices }),
    ...(type === "main" && { additionalIds: values.linkedIds }),
  };
}
