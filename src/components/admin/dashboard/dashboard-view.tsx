"use client";

import { useCallback, useMemo, useState } from "react";
import {
  isSamePeriod,
  type Period,
} from "@/components/admin/dashboard/dashboard-period";
import {
  RevenueChartCard,
  StatusChartCard,
} from "@/components/admin/dashboard/chart-card";
import { IndicatorCards } from "@/components/admin/dashboard/indicator-cards";
import { PeriodSelector } from "@/components/admin/dashboard/period-selector";
import { TodaySchedule } from "@/components/admin/dashboard/today-schedule";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { withQuery } from "@/lib/api-client";
import type { Dashboard } from "@/shared/api/dashboard";
import { cn } from "@/lib/utils";

const DASHBOARD_PATH = "/api/admin/dashboard";
// Places held while the first answer is awaited, so the page does not shift.
const INDICATOR_PLACES = 4;
const AGENDA_PLACES = 3;

// UC09: the period, the indicators and the agenda of the day, read from
// GET /api/admin/dashboard (docs/agendamento/dashboard-do-painel.md).
export function DashboardView() {
  // Null asks for the default of the API, the current month (docs/agendamento/
  // rotas.md): the screen reads no clock for it, and the fields show the
  // period of the answer.
  const [requested, setRequested] = useState<Period | null>(null);
  const { data, error, isLoading, reload } = useApiQuery<Dashboard>(
    withQuery(DASHBOARD_PATH, requested ?? {}),
  );
  const answeredPeriod = useMemo(
    () => (data === null ? null : { from: data.from, to: data.to }),
    [data],
  );
  const applyPeriod = useCallback(
    (next: Period) =>
      setRequested((current) =>
        isSamePeriod(current ?? answeredPeriod, next) ? current : next,
      ),
    [answeredPeriod],
  );
  // UC09 FE02: the API refuses the period and says why in each field.
  const periodErrors =
    error?.code === "VALIDATION_ERROR" ? (error.fields ?? null) : null;

  return (
    <div className="flex flex-col gap-8">
      <PeriodSelector
        period={answeredPeriod}
        errors={periodErrors}
        onApply={applyPeriod}
      />
      <DashboardContent
        dashboard={data}
        failure={periodErrors ? null : error}
        isInvalidPeriod={periodErrors !== null}
        isLoading={isLoading}
        onRetry={reload}
      />
    </div>
  );
}

type DashboardContentProps = {
  dashboard: Dashboard | null;
  failure: { message: string } | null;
  isInvalidPeriod: boolean;
  isLoading: boolean;
  onRetry: () => void;
};

// RNF004: the first read holds the places of the content; a new read keeps
// the previous one, in the loading state; a failure offers to try again.
function DashboardContent({
  dashboard,
  failure,
  isInvalidPeriod,
  isLoading,
  onRetry,
}: DashboardContentProps) {
  if (isInvalidPeriod) {
    return (
      <p role="status" className="text-muted-foreground">
        Informe um período válido para ver o dashboard.
      </p>
    );
  }
  if (failure) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {failure.message}
          <Button variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (dashboard === null) return <LoadingPlaces />;
  return (
    <div
      aria-busy={isLoading}
      className={cn(
        "flex flex-col gap-8 transition-opacity",
        isLoading && "pointer-events-none opacity-70",
      )}
    >
      {/* UC09 FE01: the indicators are zero, and the screen says there is
          nothing to show. */}
      {dashboard.appointmentCount === 0 && (
        <p role="status" className="text-muted-foreground">
          Não há dados a apresentar neste período.
        </p>
      )}
      <IndicatorCards dashboard={dashboard} />
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChartCard days={dashboard.revenueByDay} />
        </div>
        <StatusChartCard statuses={dashboard.appointmentsByStatus} />
      </div>
      <TodaySchedule agenda={dashboard.agenda} />
    </div>
  );
}

function LoadingPlaces() {
  return (
    <div aria-busy className="flex flex-col gap-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: INDICATOR_PLACES }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-8 xl:grid-cols-3">
        <Skeleton className="h-84 rounded-xl md:h-92 xl:col-span-2" />
        <Skeleton className="h-84 rounded-xl md:h-92" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: AGENDA_PLACES }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl md:h-28" />
        ))}
      </div>
    </div>
  );
}
