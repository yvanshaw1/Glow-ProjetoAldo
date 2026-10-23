"use client";

import { useEffect, useId, useState } from "react";
import {
  findPresetPeriod,
  isSamePeriod,
  PERIOD_PRESETS,
  type Period,
  type PeriodPreset,
} from "@/components/admin/dashboard/dashboard-period";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatCalendarDate, formatDate } from "@/shared/format/date";

// The two dates change the period 300 ms after the last change, as the search
// of the listings: the date field gives intermediate values while the year is
// typed (docs/padroes/componentes.md, Listagem).
const PERIOD_DELAY_MS = 300;

type PeriodSelectorProps = {
  // The period of the last answer, which is the current month at the start.
  period: Period | null;
  // The messages of the fields, when the API refuses the period (UC09 FE02).
  errors: Record<string, string> | null;
  onApply: (period: Period) => void;
};

const SHORTCUT_CLASS =
  "aria-pressed:text-link aria-pressed:shadow-none aria-pressed:inset-shadow-neu-sm";

// UC09, RN035: the shortcuts and the two date fields. Nothing is disabled
// while the dashboard is read again, and the focus stays where it is
// (docs/padroes/componentes.md, RNF005).
export function PeriodSelector({
  period,
  errors,
  onApply,
}: PeriodSelectorProps) {
  const fromId = useId();
  const toId = useId();
  // Both dates as edited; empty until the first edit, when the period of the
  // last answer is shown.
  const [draft, setDraft] = useState<Partial<Period>>({});
  const from = draft.from ?? period?.from ?? "";
  const to = draft.to ?? period?.to ?? "";
  const isEdited = draft.from !== undefined;

  useEffect(() => {
    if (!isEdited || from === "" || to === "") return;
    const timer = setTimeout(() => onApply({ from, to }), PERIOD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isEdited, from, to, onApply]);

  function chooseShortcut(preset: PeriodPreset) {
    const next = findPresetPeriod(
      preset,
      formatCalendarDate(new Date().toISOString()),
    );
    setDraft(next);
    onApply(next);
  }

  // The clock is read only with a period on screen, which is after the first
  // answer: the page rendered before it has no shortcut pressed.
  const today =
    from !== "" && to !== ""
      ? formatCalendarDate(new Date().toISOString())
      : "";
  const shown = { from, to };

  return (
    <div className="rounded-xl bg-background p-5 shadow-neu-md">
      <FieldSet>
        <FieldLegend variant="label">Período</FieldLegend>
        <div className="flex flex-wrap gap-2">
          {PERIOD_PRESETS.map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              variant="secondary"
              aria-pressed={
                today !== "" && isSamePeriod(findPresetPeriod(id, today), shown)
              }
              onClick={() => chooseShortcut(id)}
              className={SHORTCUT_CLASS}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
          <DateField
            id={fromId}
            label="De"
            value={from}
            error={errors?.from}
            onChange={(value) => setDraft({ from: value, to })}
          />
          <DateField
            id={toId}
            label="Até"
            value={to}
            error={errors?.to}
            onChange={(value) => setDraft({ from, to: value })}
          />
        </div>
        {/* RNF004: the period on screen is announced when the answer arrives. */}
        <p
          role="status"
          className="min-h-[1.5em] text-sm text-muted-foreground"
        >
          {period &&
            `Período exibido: ${formatDate(period.from)} a ${formatDate(period.to)}.`}
        </p>
      </FieldSet>
    </div>
  );
}

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
};

function DateField({ id, label, value, error, onChange }: DateFieldProps) {
  const errorId = `${id}-error`;
  return (
    <Field data-invalid={error !== undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : errorId}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
