"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import { useController, useFormContext } from "react-hook-form";
import type { AppointmentFormValues } from "@/components/admin/appointments/appointment-form-values";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPagination } from "@/components/shared/list-pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { withQuery } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AdminClientOption } from "@/shared/api/appointments";
import type { Page } from "@/shared/api/pagination";
import { SHORT_LIST_PAGE_SIZE } from "@/shared/constants/pagination";
import { SEARCH_TERM_MAX_LENGTH } from "@/shared/validation/formats";

// UC11 step 2 (docs/agendamento/agendamentos-do-painel.md, Novo agendamento):
// the search of the client, with the options as native radio buttons, so the
// arrow keys change the choice. The route asks for the search text, so nothing
// is read before it is typed (docs/agendamento/rotas.md). Another client takes
// out the vehicle and the services, which belong to the first one (RN003,
// RN004).

const CLIENTS_PATH = "/api/admin/appointments/lookup/clients";
const REQUIRED_MESSAGE = "Escolha o cliente.";
// The search runs this long after the last key, as in a listing.
const SEARCH_DELAY_MS = 300;
const FIRST_PAGE = 1;
// Options held while the first page loads.
const LOADING_PLACES = 3;

export function BookingClientStep() {
  const { setValue } = useFormContext<AppointmentFormValues>();
  const { field, fieldState } = useController<AppointmentFormValues, "client">({
    name: "client",
    rules: { validate: (client) => client !== null || REQUIRED_MESSAGE },
  });
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(FIRST_PAGE);
  const searchId = useId();
  const groupName = useId();
  const errorId = `${groupName}-error`;

  // A new search goes back to the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(text.trim());
      setPage(FIRST_PAGE);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const query = useApiQuery<Page<AdminClientOption>>(
    search === ""
      ? null
      : withQuery(CLIENTS_PATH, {
          page,
          pageSize: SHORT_LIST_PAGE_SIZE,
          search,
        }),
  );
  const result = search === "" ? null : query.data;
  const pageCount = result
    ? Math.max(1, Math.ceil(result.total / result.pageSize))
    : 1;
  const firstItem = result ? (result.page - 1) * result.pageSize + 1 : 0;

  function choose(client: AdminClientOption) {
    if (client.id !== field.value?.id) {
      setValue("vehicle", null);
      setValue("serviceIds", []);
      setValue("additionalIds", []);
    }
    field.onChange(client);
  }

  // The search is not a submit: Enter would advance the step.
  function ignoreEnter(event: KeyboardEvent) {
    if (event.key === "Enter") event.preventDefault();
  }

  const hasOptions = result !== null && result.data.length > 0;
  return (
    <FieldSet
      aria-describedby={fieldState.error ? errorId : undefined}
      className="gap-5"
    >
      <FieldLegend>Para qual cliente é o agendamento?</FieldLegend>
      <div className="relative">
        <Label htmlFor={searchId} className="sr-only">
          Buscar cliente
        </Label>
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          // The field of the form takes the focus on an error when no option
          // is on the screen.
          ref={hasOptions ? undefined : field.ref}
          id={searchId}
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={ignoreEnter}
          onBlur={field.onBlur}
          placeholder="Nome ou e-mail"
          maxLength={SEARCH_TERM_MAX_LENGTH}
          enterKeyHint="search"
          autoComplete="off"
          className="pl-9"
        />
      </div>
      {field.value && (
        <p className="text-sm text-muted-foreground">
          Cliente escolhido: {field.value.name} · {field.value.email}
        </p>
      )}
      <ClientOptions
        hasSearch={search !== ""}
        query={query}
        result={result}
        groupName={groupName}
        chosenId={field.value?.id ?? null}
        onChoose={choose}
        onBlur={field.onBlur}
        firstOptionRef={field.ref}
      />
      {pageCount > 1 && result && (
        <ListPagination
          page={page}
          pageCount={pageCount}
          firstItem={firstItem}
          lastItem={firstItem + result.data.length - 1}
          total={result.total}
          onPageChange={setPage}
        />
      )}
      <FieldError id={errorId} errors={[fieldState.error]} />
    </FieldSet>
  );
}

type ClientOptionsProps = {
  hasSearch: boolean;
  query: ReturnType<typeof useApiQuery<Page<AdminClientOption>>>;
  result: Page<AdminClientOption> | null;
  groupName: string;
  chosenId: string | null;
  onChoose: (client: AdminClientOption) => void;
  onBlur: () => void;
  firstOptionRef: Ref<HTMLInputElement>;
};

// RNF004: the first load holds the place of the options; a new load keeps
// them, in the loading state; a failure offers to try again.
function ClientOptions({
  hasSearch,
  query,
  result,
  groupName,
  chosenId,
  onChoose,
  onBlur,
  firstOptionRef,
}: ClientOptionsProps) {
  if (!hasSearch) {
    return (
      <p className="text-muted-foreground">
        Digite o nome ou o e-mail para buscar o cliente.
      </p>
    );
  }
  if (query.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {query.error.message}
          <Button variant="secondary" onClick={query.reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!result) {
    return (
      <div aria-busy className="flex flex-col gap-3">
        {Array.from({ length: LOADING_PLACES }, (_, index) => (
          <Skeleton key={index} className="h-[4.5rem] w-full rounded-xl" />
        ))}
      </div>
    );
  }
  if (result.total === 0 && !query.isLoading) {
    return (
      <div role="status">
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Confira o que foi digitado ou cadastre o cliente em Clientes."
          action={
            <Link
              href="/admin/clients"
              className={buttonVariants({ variant: "secondary" })}
            >
              Cadastrar cliente
            </Link>
          }
        />
      </div>
    );
  }
  return (
    <ul
      aria-busy={query.isLoading}
      className={cn(
        "flex flex-col gap-3 transition-opacity",
        query.isLoading && "pointer-events-none opacity-70",
      )}
    >
      {result.data.map((client, index) => (
        <ClientOption
          key={client.id}
          client={client}
          groupName={groupName}
          isChecked={client.id === chosenId}
          onChoose={() => onChoose(client)}
          onBlur={onBlur}
          // The first option takes the focus of the field, as on an error.
          inputRef={index === 0 ? firstOptionRef : undefined}
        />
      ))}
    </ul>
  );
}

type ClientOptionProps = {
  client: AdminClientOption;
  groupName: string;
  isChecked: boolean;
  onChoose: () => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement> | undefined;
};

// A raised card, pressed in when chosen, with the mark of the radio button
// (docs/padroes/design.md); the whole card is the label.
function ClientOption({
  client,
  groupName,
  isChecked,
  onChoose,
  onBlur,
  inputRef,
}: ClientOptionProps) {
  const inputId = `${groupName}-${client.id}`;
  const detailsId = `${inputId}-details`;
  return (
    <li
      className={cn(
        "relative flex items-start gap-3 rounded-xl bg-background p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ring",
        isChecked ? "inset-shadow-neu-sm" : "shadow-neu-sm",
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="radio"
        name={groupName}
        value={client.id}
        checked={isChecked}
        onChange={onChoose}
        onBlur={onBlur}
        aria-describedby={detailsId}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background inset-shadow-neu-sm after:size-2 after:rounded-full after:bg-primary-foreground after:opacity-0 peer-checked:bg-primary peer-checked:inset-shadow-none peer-checked:after:opacity-100"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <label
          htmlFor={inputId}
          className={cn(
            "cursor-pointer font-semibold after:absolute after:inset-0 after:rounded-xl",
            isChecked && "text-link",
          )}
        >
          {client.name}
        </label>
        <p id={detailsId} className="text-sm break-words text-muted-foreground">
          {client.email}
        </p>
      </div>
    </li>
  );
}
