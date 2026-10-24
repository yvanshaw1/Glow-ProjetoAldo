"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from "recharts";
import type {
  DashboardRevenueDay,
  DashboardStatusCount,
} from "@/shared/api/dashboard";
import {
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "@/shared/constants/appointment-statuses";
import { DASHBOARD_INDICATOR_LABELS } from "@/shared/constants/dashboard-indicators";
import { formatCurrency } from "@/shared/format/currency";
import { formatDate, formatDayMonth } from "@/shared/format/date";

// The drawing of the two charts of the dashboard (RF041, RF042), the only
// module that imports Recharts. It is loaded on demand by chart-card.tsx
// (docs/padroes/frontend.md, Desempenho, RNF006). Colors only from the theme
// (docs/padroes/design.md, Gráficos); the drawing is aria-hidden, and the
// same data are in the table of the card, so the accessibility layer of the
// library, which would make the drawing focusable, is off.

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };
const TOOLTIP_STYLE = {
  backgroundColor: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
};
// The width of the labels of the value axis and of the status names.
const REVENUE_AXIS_WIDTH = 84;
const STATUS_AXIS_WIDTH = 100;
const BAR_RADIUS = 4;

// The tones of StatusBadge (docs/padroes/componentes.md): the open phases in
// the highlight color, the others as their badges.
const OPEN_FILL = "var(--link)";
const STATUS_FILLS = {
  scheduled: OPEN_FILL,
  checked_in: OPEN_FILL,
  in_progress: OPEN_FILL,
  awaiting_payment: OPEN_FILL,
  completed: "var(--foreground)",
  cancelled: "var(--destructive)",
  rescheduled: "var(--muted-foreground)",
} as const satisfies Record<AppointmentStatus, string>;

// RF041: one bar per day of the period.
export function RevenueChart({ days }: { days: DashboardRevenueDay[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={days}
        accessibilityLayer={false}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDayMonth}
          interval="preserveStartEnd"
          minTickGap={24}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tickFormatter={formatCurrency}
          width={REVENUE_AXIS_WIDTH}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: "var(--accent)" }}
          labelFormatter={(date) => formatDate(String(date))}
          formatter={(value) => [
            formatCurrency(Number(value)),
            DASHBOARD_INDICATOR_LABELS.revenue,
          ]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="revenue"
          fill="var(--link)"
          radius={[BAR_RADIUS, BAR_RADIUS, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// RF042: one bar per status, with its name and its count written.
export function StatusChart({
  statuses,
}: {
  statuses: DashboardStatusCount[];
}) {
  const rows = statuses.map(({ status, count }) => ({
    label: APPOINTMENT_STATUS_LABELS[status],
    count,
    fill: STATUS_FILLS[status],
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={rows}
        layout="vertical"
        accessibilityLayer={false}
        margin={{ top: 8, right: 32, bottom: 8, left: 0 }}
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={STATUS_AXIS_WIDTH}
          interval={0}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: "var(--accent)" }}
          formatter={(value) => [
            String(value),
            DASHBOARD_INDICATOR_LABELS.appointmentCount,
          ]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="count"
          radius={[0, BAR_RADIUS, BAR_RADIUS, 0]}
          isAnimationActive={false}
          shape={(props: BarShapeProps) => (
            <Rectangle {...props} fill={rows[props.index].fill} />
          )}
        >
          <LabelList
            dataKey="count"
            position="right"
            fill="var(--foreground)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
