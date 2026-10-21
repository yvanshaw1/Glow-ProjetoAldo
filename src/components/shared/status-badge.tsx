import type { VariantProps } from "class-variance-authority";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import {
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "@/shared/constants/appointment-statuses";

type StatusTone = {
  variant: VariantProps<typeof badgeVariants>["variant"];
  className?: string;
};

// docs/padroes/componentes.md, Etiqueta de status: one tone per phase, with
// the colors of the theme; the text has at least 4.5:1 in both themes.
const OPEN_TONE: StatusTone = { variant: "secondary", className: "text-link" };

const STATUS_TONES = {
  scheduled: OPEN_TONE,
  checked_in: OPEN_TONE,
  in_progress: OPEN_TONE,
  awaiting_payment: OPEN_TONE,
  completed: {
    variant: "outline",
    className: "border-transparent inset-shadow-neu-sm",
  },
  cancelled: { variant: "destructive" },
  rescheduled: {
    variant: "outline",
    className: "border-input text-muted-foreground",
  },
} as const satisfies Record<AppointmentStatus, StatusTone>;

// RN017, RNF005: the status is always written, never told by color alone.
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const tone: StatusTone = STATUS_TONES[status];
  return (
    <Badge variant={tone.variant} className={tone.className}>
      {APPOINTMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
