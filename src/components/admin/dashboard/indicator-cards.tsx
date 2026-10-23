import type { Dashboard } from "@/shared/api/dashboard";
import { APPOINTMENT_STATUS_LABELS } from "@/shared/constants/appointment-statuses";
import {
  DASHBOARD_INDICATOR_LABELS,
  type DashboardIndicator,
} from "@/shared/constants/dashboard-indicators";
import { formatCurrency } from "@/shared/format/currency";
import { formatPercent } from "@/shared/format/percent";

// UC09, step 2 (RF040): the four indicators, as the API gives them (RN021),
// each with a line that says what it counts. The page works out nothing.

type IndicatorCard = {
  indicator: Extract<
    DashboardIndicator,
    "revenue" | "appointmentCount" | "averageTicket" | "cancellationRate"
  >;
  support: string;
  read: (dashboard: Dashboard) => string;
};

const INDICATOR_CARDS: readonly IndicatorCard[] = [
  {
    indicator: "revenue",
    support: `Agendamentos ${APPOINTMENT_STATUS_LABELS.completed} e ${APPOINTMENT_STATUS_LABELS.rescheduled}`,
    read: ({ revenue }) => formatCurrency(revenue),
  },
  {
    indicator: "appointmentCount",
    support: "Todos os status do período",
    read: ({ appointmentCount }) => String(appointmentCount),
  },
  {
    indicator: "averageTicket",
    support: "Receita por agendamento pago",
    read: ({ averageTicket }) => formatCurrency(averageTicket),
  },
  {
    indicator: "cancellationRate",
    support: "Cancelados sobre o total do período",
    read: ({ cancellationRate }) => formatPercent(cancellationRate),
  },
];

export function IndicatorCards({ dashboard }: { dashboard: Dashboard }) {
  return (
    <section aria-labelledby="dashboard-indicators-title">
      <h2 id="dashboard-indicators-title" className="sr-only">
        Indicadores do período
      </h2>
      <dl className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {INDICATOR_CARDS.map(({ indicator, support, read }) => (
          <div
            key={indicator}
            className="flex flex-col gap-1 rounded-xl bg-background p-5 shadow-neu-md"
          >
            <dt className="text-sm font-semibold text-muted-foreground">
              {DASHBOARD_INDICATOR_LABELS[indicator]}
            </dt>
            <dd className="text-h3 font-bold">{read(dashboard)}</dd>
            <dd className="text-sm text-muted-foreground">{support}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
