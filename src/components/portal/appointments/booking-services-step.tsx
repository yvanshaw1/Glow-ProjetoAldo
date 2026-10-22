"use client";

import { CheckIcon, ClipboardXIcon } from "lucide-react";
import { useEffect, useId, useRef, type Ref } from "react";
import { useController, useWatch } from "react-hook-form";
import type { BookingFormValues } from "@/components/portal/appointments/booking-wizard";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPagination } from "@/components/shared/list-pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePaginatedList,
  type PaginatedList,
} from "@/hooks/use-paginated-list";
import { cn } from "@/lib/utils";
import type {
  BookableAdditional,
  BookableService,
} from "@/shared/api/appointments";
import { CATALOG_PAGE_SIZE } from "@/shared/constants/pagination";
import { formatCurrency } from "@/shared/format/currency";
import { formatDuration } from "@/shared/format/duration";

// UC06 steps 4 to 6 (docs/agendamento/agendar-servico.md): the services to
// book with the price of the size of the chosen vehicle (RF020, RN009), as
// native check boxes. A checked main service offers its additionals (FA01,
// RN006); unchecking it takes out the ones no other checked main service
// links (FA02, L8 of the plan).

const SERVICES_PATH = "/api/me/bookable-services";
const REQUIRED_MESSAGE =
  "Escolha ao menos um serviço principal ou complementar.";

// Options held while the first page loads.
const LOADING_PLACES = 4;

type ServiceFilters = { vehicleId: string | undefined };

// The box of a native check box (docs/padroes/design.md): the 1 px border in
// --input, filled with --primary when checked, after the input it follows.
const CHECK_MARK_CLASS =
  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border border-input bg-background text-primary-foreground inset-shadow-neu-sm peer-checked:bg-primary peer-checked:inset-shadow-none peer-checked:[&>svg]:visible";

export function BookingServicesStep() {
  const vehicle = useWatch<BookingFormValues, "vehicle">({ name: "vehicle" });
  // FA03: each visit to the step reads the prices of the chosen vehicle.
  const list = usePaginatedList<BookableService, ServiceFilters>({
    path: SERVICES_PATH,
    pageSize: CATALOG_PAGE_SIZE,
    initialFilters: { vehicleId: vehicle?.id },
  });
  const { field: servicesField, fieldState } = useController<
    BookingFormValues,
    "serviceIds"
  >({
    name: "serviceIds",
    rules: {
      validate: (serviceIds) => serviceIds.length > 0 || REQUIRED_MESSAGE,
    },
  });
  const { field: additionalsField } = useController<
    BookingFormValues,
    "additionalIds"
  >({ name: "additionalIds" });
  // The services shown in this visit, by id, to know the additionals of each
  // checked main service.
  const seenServices = useRef(new Map<string, BookableService>());
  useEffect(() => {
    list.items.forEach((service) =>
      seenServices.current.set(service.id, service),
    );
  }, [list.items]);
  const groupName = useId();
  const errorId = `${groupName}-error`;

  function toggleService(service: BookableService, isChecked: boolean) {
    if (isChecked) {
      servicesField.onChange([...servicesField.value, service.id]);
      return;
    }
    const remainingIds = servicesField.value.filter((id) => id !== service.id);
    servicesField.onChange(remainingIds);
    const stillLinkedIds = new Set(
      remainingIds.flatMap(
        (id) =>
          seenServices.current
            .get(id)
            ?.additionals.map((additional) => additional.id) ?? [],
      ),
    );
    const leavingIds = new Set(
      service.additionals
        .map((additional) => additional.id)
        .filter((id) => !stillLinkedIds.has(id)),
    );
    additionalsField.onChange(
      additionalsField.value.filter((id) => !leavingIds.has(id)),
    );
  }

  function toggleAdditional(id: string, isChecked: boolean) {
    additionalsField.onChange(
      isChecked
        ? [...additionalsField.value, id]
        : additionalsField.value.filter((additionalId) => additionalId !== id),
    );
  }

  return (
    <FieldSet
      aria-describedby={fieldState.error ? errorId : undefined}
      className="gap-5"
    >
      <FieldLegend>Quais serviços você quer?</FieldLegend>
      <ServiceOptions
        list={list}
        groupName={groupName}
        checkedIds={servicesField.value}
        checkedAdditionalIds={additionalsField.value}
        onToggle={toggleService}
        onToggleAdditional={toggleAdditional}
        onBlur={servicesField.onBlur}
        firstOptionRef={servicesField.ref}
      />
      {list.pageCount > 1 && (
        <ListPagination
          page={list.page}
          pageCount={list.pageCount}
          firstItem={list.firstItem}
          lastItem={list.lastItem}
          total={list.total}
          onPageChange={list.setPage}
        />
      )}
      <FieldError id={errorId} errors={[fieldState.error]} />
    </FieldSet>
  );
}

type ServiceOptionsProps = {
  list: PaginatedList<BookableService, ServiceFilters>;
  groupName: string;
  checkedIds: string[];
  checkedAdditionalIds: string[];
  onToggle: (service: BookableService, isChecked: boolean) => void;
  onToggleAdditional: (id: string, isChecked: boolean) => void;
  onBlur: () => void;
  firstOptionRef: Ref<HTMLInputElement>;
};

// RNF004: the first load holds the place of the options; a new load keeps
// them, in the loading state; a failure offers to try again.
function ServiceOptions({
  list,
  groupName,
  checkedIds,
  checkedAdditionalIds,
  onToggle,
  onToggleAdditional,
  onBlur,
  firstOptionRef,
}: ServiceOptionsProps) {
  if (list.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {list.error.message}
          <Button variant="secondary" onClick={list.reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!list.hasLoaded) {
    return (
      <div aria-busy className="flex flex-col gap-3">
        {Array.from({ length: LOADING_PLACES }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  if (list.total === 0 && !list.isLoading) {
    return (
      <div role="status">
        <EmptyState
          icon={ClipboardXIcon}
          title="Nenhum serviço disponível"
          description="No momento, não há serviços para agendar."
        />
      </div>
    );
  }
  return (
    <ul
      aria-busy={list.isLoading}
      className={cn(
        "flex flex-col gap-3 transition-opacity",
        list.isLoading && "pointer-events-none opacity-70",
      )}
    >
      {list.items.map((service, index) => {
        const isChecked = checkedIds.includes(service.id);
        return (
          <li key={service.id} className="flex flex-col gap-3">
            <ServiceOption
              service={service}
              groupName={groupName}
              isChecked={isChecked}
              onToggle={(checked) => onToggle(service, checked)}
              onBlur={onBlur}
              // The first option takes the focus of the field, as on an error.
              inputRef={index === 0 ? firstOptionRef : undefined}
            />
            {isChecked && service.additionals.length > 0 && (
              <AdditionalOptions
                service={service}
                checkedIds={checkedAdditionalIds}
                onToggle={onToggleAdditional}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

type ServiceOptionProps = {
  service: BookableService;
  groupName: string;
  isChecked: boolean;
  onToggle: (isChecked: boolean) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement> | undefined;
};

// A raised card, pressed in when checked; the whole card is the label, and
// the price, the category, the duration and the description describe it.
function ServiceOption({
  service,
  groupName,
  isChecked,
  onToggle,
  onBlur,
  inputRef,
}: ServiceOptionProps) {
  const inputId = `${groupName}-${service.id}`;
  const priceId = `${inputId}-price`;
  const detailsId = `${inputId}-details`;
  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-xl bg-background p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ring",
        isChecked ? "inset-shadow-neu-sm" : "shadow-neu-sm",
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="checkbox"
        checked={isChecked}
        onChange={(event) => onToggle(event.target.checked)}
        onBlur={onBlur}
        aria-describedby={`${priceId} ${detailsId}`}
        className="peer sr-only"
      />
      <span aria-hidden className={CHECK_MARK_CLASS}>
        <CheckIcon className="invisible size-3.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <label
            htmlFor={inputId}
            className={cn(
              "cursor-pointer font-semibold after:absolute after:inset-0 after:rounded-xl",
              isChecked && "text-link",
            )}
          >
            {service.name}
          </label>
          <span id={priceId} className="shrink-0 font-semibold">
            {formatCurrency(service.price)}
          </span>
        </div>
        <p id={detailsId} className="text-sm text-muted-foreground">
          <span className="block">
            {service.category.name} · {formatDuration(service.durationMinutes)}
          </span>
          <span className="block">{service.description}</span>
        </p>
      </div>
    </div>
  );
}

type AdditionalOptionsProps = {
  service: BookableService;
  checkedIds: string[];
  onToggle: (id: string, isChecked: boolean) => void;
};

// FA01: the additionals of a checked main service, right below it. One
// linked to two checked main services shows under each, with the same mark.
function AdditionalOptions({
  service,
  checkedIds,
  onToggle,
}: AdditionalOptionsProps) {
  return (
    <FieldSet className="ml-4 gap-2 border-l border-border pl-4 sm:ml-8">
      <FieldLegend variant="label">Adicionais de {service.name}</FieldLegend>
      {service.additionals.map((additional) => (
        <AdditionalOption
          key={additional.id}
          additional={additional}
          isChecked={checkedIds.includes(additional.id)}
          onToggle={(isChecked) => onToggle(additional.id, isChecked)}
        />
      ))}
    </FieldSet>
  );
}

type AdditionalOptionProps = {
  additional: BookableAdditional;
  isChecked: boolean;
  onToggle: (isChecked: boolean) => void;
};

function AdditionalOption({
  additional,
  isChecked,
  onToggle,
}: AdditionalOptionProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ring">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(event) => onToggle(event.target.checked)}
        className="peer sr-only"
      />
      <span aria-hidden className={CHECK_MARK_CLASS}>
        <CheckIcon className="invisible size-3.5" />
      </span>
      <span className="flex min-w-0 flex-1 justify-between gap-3">
        <span className={cn(isChecked && "text-link")}>{additional.name}</span>
        <span className="shrink-0">+ {formatCurrency(additional.price)}</span>
      </span>
    </label>
  );
}
