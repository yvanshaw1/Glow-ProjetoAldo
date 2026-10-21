"use client";

import { useId } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import type { PublicCategory } from "@/shared/api/catalog";

// docs/catalogo/paginas-publicas.md, Catálogo: the categories of the filter,
// as native radio buttons, so the arrow keys change the option. They look
// like the tabs of docs/padroes/design.md: the list pressed in, the checked
// option raised with the link color, and the focus outline on the label.

const CATEGORIES_PATH = "/api/public/categories";

const LIST_CLASS =
  "flex w-fit flex-wrap gap-1 rounded-3xl bg-background p-1 inset-shadow-neu-sm";

// The width of each pill held while the categories load.
const PLACEHOLDER_WIDTHS = ["w-18", "w-30", "w-24", "w-44"];

type CategoryOption = {
  id: string | undefined;
  name: string;
};

type CategoryFilterProps = {
  categoryId: string | undefined;
  onChange: (categoryId: string | undefined) => void;
};

export function CategoryFilter({ categoryId, onChange }: CategoryFilterProps) {
  const groupName = useId();
  const {
    data: categories,
    error,
    reload,
  } = useApiQuery<PublicCategory[]>(CATEGORIES_PATH);

  if (error) {
    // UC01 FE02: the services keep showing below the notice.
    return (
      <Alert variant="destructive" className="self-start">
        <AlertDescription className="flex flex-col items-start gap-3">
          {error.message}
          <Button variant="secondary" onClick={reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!categories) return <FilterPlaceholder />;

  const options: CategoryOption[] = [
    { id: undefined, name: "Todas" },
    ...categories,
  ];
  return (
    <fieldset>
      <legend className="sr-only">Categoria</legend>
      <div className={LIST_CLASS}>
        {options.map((option) => {
          const inputId = `${groupName}-${option.id ?? "all"}`;
          return (
            <div key={inputId} className="relative">
              <input
                id={inputId}
                type="radio"
                name={groupName}
                checked={option.id === categoryId}
                onChange={() => onChange(option.id)}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className="inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold text-muted-foreground transition-colors select-none peer-not-checked:hover:text-foreground peer-checked:bg-background peer-checked:text-link peer-checked:shadow-neu-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring"
              >
                {option.name}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

// RNF006: the pills held while the categories load, so the services do not
// move when they arrive.
function FilterPlaceholder() {
  return (
    <div aria-hidden className={LIST_CLASS}>
      {PLACEHOLDER_WIDTHS.map((width) => (
        <Skeleton key={width} className={`h-10 rounded-full ${width}`} />
      ))}
    </div>
  );
}
