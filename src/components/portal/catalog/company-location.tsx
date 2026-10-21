"use client";

import { MapPinIcon, RouteIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import type { BusinessDay, PublicCompany } from "@/shared/api/settings";
import { WEEKDAY_LABELS } from "@/shared/constants/weekdays";
import { formatDirectionsLink } from "@/shared/format/address";
import { formatBusinessHours } from "@/shared/format/business-hours";

// docs/catalogo/paginas-publicas.md, Localização: the address saved on the
// panel, with the route to it, and the business hours (RN028). The footer
// reads the same route on its own: each component fetches what it shows.

const COMPANY_PATH = "/api/public/company";

// From Monday to Sunday, by the weekday of the API (Sunday is 0).
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const CARD_CLASS = "rounded-xl bg-background p-5 shadow-neu-md";

export function CompanyLocation() {
  const {
    data: company,
    error,
    reload,
  } = useApiQuery<PublicCompany>(COMPANY_PATH);

  if (error) {
    // UC01 FE02: the message and a new try in place of the data.
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
  if (!company) return <LocationPlaceholder />;

  return (
    <div className="grid items-start gap-8 md:grid-cols-2">
      {company.address !== null && (
        <div className={`${CARD_CLASS} flex flex-col items-start gap-5`}>
          <p className="flex gap-1 wrap-anywhere">
            <MapPinIcon aria-hidden className="mt-1.25 size-4 shrink-0" />
            {company.address}
          </p>
          <a
            href={formatDirectionsLink(company.address)}
            className={buttonVariants({ variant: "secondary" })}
          >
            <RouteIcon aria-hidden />
            Como chegar
          </a>
        </div>
      )}
      <BusinessHours days={company.businessHours} />
    </div>
  );
}

function BusinessHours({ days }: { days: BusinessDay[] }) {
  const weekDays = WEEK_ORDER.map((weekday) =>
    days.find((day) => day.weekday === weekday),
  ).filter((day): day is BusinessDay => day !== undefined);
  return (
    <div className={CARD_CLASS}>
      <h3 className="font-semibold">Horário de funcionamento</h3>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2">
        {weekDays.map((day) => (
          <div key={day.weekday} className="contents">
            <dt>{WEEKDAY_LABELS[day.weekday]}</dt>
            <dd className="text-muted-foreground">
              {formatBusinessHours(day)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// RNF006: the place of the two cards while the data loads, so the page does
// not move when it arrives.
function LocationPlaceholder() {
  return (
    <div aria-hidden className="grid items-start gap-8 md:grid-cols-2">
      <Skeleton className="h-34 rounded-xl" />
      <Skeleton className="h-78 rounded-xl" />
    </div>
  );
}
