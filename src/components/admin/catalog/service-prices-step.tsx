"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { ServiceFormValues } from "@/components/admin/catalog/service-form-values";
import { FormField } from "@/components/shared/form-field";
import { MoneyInput } from "@/components/shared/money-input";
import {
  VEHICLE_SIZE_LABELS,
  VEHICLE_SIZES,
} from "@/shared/constants/vehicle-sizes";

// UC13 steps 6 and 7 (docs/catalogo/servicos-do-painel.md, RN009): the fixed
// price, or one for each size, as the pricing mode of the first step. Every
// value is greater than zero; the rule belongs to the route.

const REQUIRED_MESSAGE = "Informe um valor maior que zero.";

const SIZE_NAMES = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  extra_large: "Extra grande",
} as const;

// The checks of a price in the form with no schema yet.
export function isPositivePrice(price: number | null): true | string {
  return (price !== null && price > 0) || REQUIRED_MESSAGE;
}

export function ServicePricesStep() {
  const { control } = useFormContext<ServiceFormValues>();
  const pricingMode = useWatch<ServiceFormValues, "pricingMode">({
    name: "pricingMode",
  });
  if (pricingMode === "fixed") {
    return (
      <FormField
        control={control}
        name="fixedPrice"
        label="Valor fixo"
        description="O mesmo valor para qualquer veículo."
        rules={{ validate: isPositivePrice }}
        renderInput={(field) => <MoneyInput {...field} />}
      />
    );
  }
  return (
    <div className="grid gap-5 @md:grid-cols-2">
      {VEHICLE_SIZES.map((size) => (
        <FormField
          key={size}
          control={control}
          name={`prices.${size}`}
          label={`${SIZE_NAMES[size]} (${VEHICLE_SIZE_LABELS[size]})`}
          rules={{ validate: isPositivePrice }}
          renderInput={(field) => <MoneyInput {...field} />}
        />
      ))}
    </div>
  );
}
