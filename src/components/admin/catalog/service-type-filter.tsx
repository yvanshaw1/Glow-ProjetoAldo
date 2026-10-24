"use client";

import { useId } from "react";
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPES,
  type ServiceType,
} from "@/shared/constants/service-types";

// RF058: the filter by type, in radio buttons the arrow keys move through. An
// empty value is "Todos".
type ServiceTypeFilterProps = {
  value: ServiceType | "";
  onChange: (value: ServiceType | "") => void;
};

const OPTIONS: { value: ServiceType | ""; label: string }[] = [
  { value: "", label: "Todos" },
  ...SERVICE_TYPES.map((type) => ({
    value: type,
    label: SERVICE_TYPE_LABELS[type],
  })),
];

export function ServiceTypeFilter({ value, onChange }: ServiceTypeFilterProps) {
  const groupName = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Filtrar por tipo</legend>
      <div className="flex flex-wrap gap-1 rounded-xl border border-input bg-background p-1 inset-shadow-neu-sm">
        {OPTIONS.map((option) => {
          const inputId = `${groupName}-${option.value || "all"}`;
          return (
            <div key={option.value} className="relative">
              <input
                id={inputId}
                type="radio"
                name={groupName}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className="flex h-8 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors select-none peer-not-checked:hover:text-foreground peer-checked:bg-background peer-checked:text-link peer-checked:shadow-neu-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring"
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
