"use client";

import dynamic from "next/dynamic";
import { useId, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  DashboardRevenueDay,
  DashboardStatusCount,
} from "@/shared/api/dashboard";
import { APPOINTMENT_STATUS_LABELS } from "@/shared/constants/appointment-statuses";
import { DASHBOARD_INDICATOR_LABELS } from "@/shared/constants/dashboard-indicators";
import { formatCurrency } from "@/shared/format/currency";
import { formatDate } from "@/shared/format/date";

// The drawing is the only part that needs Recharts, which is heavy and used
// only here: it is loaded after the page, when the first answer arrives
// (docs/padroes/frontend.md, Desempenho, RNF006). It holds the height of the
// chart while it loads, so the page does not shift (RNF006, CLS).
const CHART_PLACE = <Skeleton className="size-full rounded-xl" />;

const RevenueChart = dynamic(
  () =>
    import("@/components/admin/dashboard/dashboard-charts").then(
      (charts) => charts.RevenueChart,
    ),
  { ssr: false, loading: () => CHART_PLACE },
);
const StatusChart = dynamic(
  () =>
    import("@/components/admin/dashboard/dashboard-charts").then(
      (charts) => charts.StatusChart,
    ),
  { ssr: false, loading: () => CHART_PLACE },
);

type ChartCardProps = {
  title: string;
  emptyText: string;
  isEmpty: boolean;
  // The same data as the drawing, for the screen reader
  // (docs/padroes/design.md, Gráficos).
  table: { columns: [string, string]; rows: [string, string][] };
  children: ReactNode;
};

function ChartCard({
  title,
  emptyText,
  isEmpty,
  table,
  children,
}: ChartCardProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-4 rounded-xl bg-background p-5 shadow-neu-md"
    >
      <h2 id={titleId} className="font-semibold">
        {title}
      </h2>
      {isEmpty ? (
        <p className="py-10 text-center text-muted-foreground italic">
          {emptyText}
        </p>
      ) : (
        <>
          <div aria-hidden className="h-64 md:h-72">
            {children}
          </div>
          <table className="sr-only">
            <caption>{title}</caption>
            <thead>
              <tr>
                <th scope="col">{table.columns[0]}</th>
                <th scope="col">{table.columns[1]}</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map(([first, second]) => (
                <tr key={first}>
                  <th scope="row">{first}</th>
                  <td>{second}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

// UC09, step 3 (RF041): the revenue of each day of the period.
export function RevenueChartCard({ days }: { days: DashboardRevenueDay[] }) {
  return (
    <ChartCard
      title={DASHBOARD_INDICATOR_LABELS.revenueByDay}
      emptyText="Nenhuma receita no período."
      isEmpty={days.every(({ revenue }) => revenue === 0)}
      table={{
        columns: ["Dia", "Receita"],
        rows: days.map(({ date, revenue }) => [
          formatDate(date),
          formatCurrency(revenue),
        ]),
      }}
    >
      <RevenueChart days={days} />
    </ChartCard>
  );
}

// UC09, step 3 (RF042): the appointments of the period by status (RN017).
export function StatusChartCard({
  statuses,
}: {
  statuses: DashboardStatusCount[];
}) {
  return (
    <ChartCard
      title={DASHBOARD_INDICATOR_LABELS.appointmentsByStatus}
      emptyText="Nenhum agendamento no período."
      isEmpty={statuses.every(({ count }) => count === 0)}
      table={{
        columns: ["Status", "Agendamentos"],
        rows: statuses.map(({ status, count }) => [
          APPOINTMENT_STATUS_LABELS[status],
          String(count),
        ]),
      }}
    >
      <StatusChart statuses={statuses} />
    </ChartCard>
  );
}
