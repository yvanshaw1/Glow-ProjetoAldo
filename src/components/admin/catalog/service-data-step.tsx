"use client";

import { useController, useFormContext } from "react-hook-form";
import {
  ChoiceGroup,
  type Choice,
} from "@/components/admin/catalog/choice-group";
import { ServiceImageField } from "@/components/admin/catalog/service-image-field";
import { ServiceLinksField } from "@/components/admin/catalog/service-links-step";
import { isPositivePrice } from "@/components/admin/catalog/service-prices-step";
import type { ServiceFormValues } from "@/components/admin/catalog/service-form-values";
import { FormField } from "@/components/shared/form-field";
import { MoneyInput } from "@/components/shared/money-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useApiQuery } from "@/hooks/use-api-query";
import { withQuery } from "@/lib/api-client";
import type { AdminCategory } from "@/shared/api/catalog";
import type { Page } from "@/shared/api/pagination";
import { MAX_PAGE_SIZE } from "@/shared/constants/pagination";
import {
  PRICING_MODE_LABELS,
  type PricingMode,
} from "@/shared/constants/pricing-modes";

// UC13 steps 4 and 5 and FA01 (docs/catalogo/servicos-do-painel.md): the data
// of a main or complementary service, and the three fields of an additional
// one. Without a schema yet (decision 0055), each field only checks that it
// was filled, and the duration its limits (docs/catalogo/dados.md).

const REQUIRED_MESSAGE = "Preencha este campo.";
const CATEGORY_MESSAGE = "Escolha a categoria.";
const MIN_DURATION = 5;
const MAX_DURATION = 2400;
const DURATION_MESSAGE = `Informe de ${MIN_DURATION} a ${MAX_DURATION.toLocaleString("pt-BR")} minutos.`;
const CATEGORIES_PATH = "/api/admin/categories";

const PRICING_DESCRIPTIONS = {
  by_size: "Um valor para cada porte (P, M, G e GG).",
  fixed: "Um único valor, igual para qualquer veículo.",
} as const satisfies Record<PricingMode, string>;

// The order of RF061: by size first.
const PRICING_CHOICES: Choice<PricingMode>[] = (
  ["by_size", "fixed"] as const
).map((mode) => ({
  value: mode,
  label: PRICING_MODE_LABELS[mode],
  description: PRICING_DESCRIPTIONS[mode],
}));

function NameField() {
  const { control } = useFormContext<ServiceFormValues>();
  return (
    <FormField
      control={control}
      name="name"
      label="Nome"
      rules={{ validate: (name) => name.trim() !== "" || REQUIRED_MESSAGE }}
      renderInput={(field) => (
        <Input
          {...field}
          placeholder="Ex.: Lavagem completa"
          autoComplete="off"
        />
      )}
    />
  );
}

function DurationField() {
  const { control } = useFormContext<ServiceFormValues>();
  return (
    <FormField
      control={control}
      name="durationMinutes"
      label="Duração média (minutos)"
      rules={{
        validate: (minutes) =>
          (minutes !== null &&
            minutes >= MIN_DURATION &&
            minutes <= MAX_DURATION) ||
          DURATION_MESSAGE,
      }}
      renderInput={({ value, onChange, ...field }) => (
        <Input
          {...field}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value ?? ""}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            onChange(digits === "" ? null : Number(digits));
          }}
        />
      )}
    />
  );
}

// The data of the first step of a main or complementary service.
export function ServiceInfoStep({
  onGoToCategories,
}: {
  onGoToCategories: () => void;
}) {
  const { control } = useFormContext<ServiceFormValues>();
  const { field: pricing } = useController<ServiceFormValues, "pricingMode">({
    name: "pricingMode",
  });
  return (
    <div className="flex flex-col gap-5">
      <CategoryField onGoToCategories={onGoToCategories} />
      <ChoiceGroup
        legend="Forma de precificação"
        choices={PRICING_CHOICES}
        value={pricing.value}
        onChange={pricing.onChange}
        onBlur={pricing.onBlur}
        firstChoiceRef={pricing.ref}
      />
      <DurationField />
      <NameField />
      <FormField
        control={control}
        name="description"
        label="Descrição"
        rules={{
          validate: (description) =>
            description.trim() !== "" || REQUIRED_MESSAGE,
        }}
        renderInput={(field) => (
          <Textarea {...field} placeholder="Descreva o serviço" />
        )}
      />
      <ServiceImageField />
    </div>
  );
}

// The single step of an additional service: no category, description, image or
// pricing mode, and the optional link to main services.
export function AdditionalServiceStep() {
  const { control } = useFormContext<ServiceFormValues>();
  return (
    <div className="flex flex-col gap-5">
      <NameField />
      <DurationField />
      <FormField
        control={control}
        name="fixedPrice"
        label="Valor fixo"
        rules={{ validate: isPositivePrice }}
        renderInput={(field) => <MoneyInput {...field} />}
      />
      <ServiceLinksField
        linkedType="main"
        legend="Serviços principais vinculados (opcional)"
        emptyText="Nenhum serviço principal cadastrado."
      />
    </div>
  );
}

// RN007: only the active categories. With none, the service cannot be made
// (FE03).
function CategoryField({ onGoToCategories }: { onGoToCategories: () => void }) {
  const { control } = useFormContext<ServiceFormValues>();
  const query = useApiQuery<Page<AdminCategory>>(
    withQuery(CATEGORIES_PATH, { pageSize: MAX_PAGE_SIZE }),
  );
  if (query.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {query.error.message}
          <Button type="button" variant="secondary" onClick={query.reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!query.data) {
    return <Skeleton aria-busy className="h-17 w-full rounded-xl" />;
  }
  const categories = query.data.data;
  if (categories.length === 0) {
    return (
      <Alert role="status">
        <AlertDescription className="flex flex-col items-start gap-3">
          Cadastre uma categoria antes de criar este serviço.
          <Button type="button" variant="secondary" onClick={onGoToCategories}>
            Ir para as categorias
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  const items = categories.map(({ id, name }) => ({ value: id, label: name }));
  return (
    <FormField
      control={control}
      name="categoryId"
      label="Categoria"
      rules={{
        validate: (categoryId) => categoryId !== null || CATEGORY_MESSAGE,
      }}
      renderInput={({ value, onChange, ref, ...field }) => (
        <Select
          items={items}
          value={value}
          onValueChange={(next) => onChange(next)}
        >
          <SelectTrigger ref={ref} {...field} className="w-full">
            <SelectValue placeholder="Escolha a categoria" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
