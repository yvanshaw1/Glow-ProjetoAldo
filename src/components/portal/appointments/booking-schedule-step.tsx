"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useId, useState, type Ref } from "react";
import { useController, useFormContext } from "react-hook-form";
import type { BookingFormValues } from "@/components/portal/appointments/booking-wizard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import type { BusinessDay, PublicCompany } from "@/shared/api/settings";
import { WEEKDAY_SHORT_LABELS } from "@/shared/constants/weekdays";
import { listStartTimes } from "@/shared/format/business-hours";
import {
  formatCalendarDate,
  formatLongDate,
  formatMonth,
  toCompanyInstant,
} from "@/shared/format/date";

// UC06 steps 9 and 10 (docs/agendamento/agendar-servico.md, Data e horário):
// a calendar of the month and the start times of the chosen day, as native
// radio buttons, by the business hours of GET /api/public/company. A day with
// no time left is disabled; the times are every 30 minutes, out of the break
// and not past (RN013, RN015), all of them (RN016). They only guide the
// screen: the API checks the date and the time (UC06 FE03).

const COMPANY_PATH = "/api/public/company";
const DATE_MESSAGE = "Escolha a data.";
const TIME_MESSAGE = "Escolha o horário.";

// The look of the options of a group pressed in, the chosen one raised with
// the link color, as the type of the vehicle (docs/padroes/design.md).
const GROUP_CLASS =
  "grid gap-1 rounded-xl border border-input bg-background p-1 inset-shadow-neu-sm";
const OPTION_CLASS =
  "flex h-10 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-colors select-none peer-not-checked:peer-enabled:hover:text-link peer-checked:bg-background peer-checked:text-link peer-checked:shadow-neu-sm peer-disabled:cursor-not-allowed peer-disabled:font-normal peer-disabled:opacity-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ring";

export function BookingScheduleStep() {
  const {
    data: company,
    error,
    reload,
  } = useApiQuery<PublicCompany>(COMPANY_PATH);
  // The moment the step opened: the times already past are not offered.
  const [now] = useState(() => new Date().toISOString());

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          {error.message}
          <Button variant="secondary" onClick={reload}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!company) {
    return (
      <div aria-busy className="grid gap-8 @lg:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }
  return <ScheduleFields businessHours={company.businessHours} now={now} />;
}

type ScheduleFieldsProps = {
  businessHours: BusinessDay[];
  now: string;
};

function ScheduleFields({ businessHours, now }: ScheduleFieldsProps) {
  const { field: dateField, fieldState: dateState } = useController<
    BookingFormValues,
    "date"
  >({
    name: "date",
    rules: { validate: (date) => date !== null || DATE_MESSAGE },
  });
  const { field: timeField, fieldState: timeState } = useController<
    BookingFormValues,
    "time"
  >({
    name: "time",
    rules: { validate: (time) => time !== null || TIME_MESSAGE },
  });
  const { setValue } = useFormContext<BookingFormValues>();
  const today = formatCalendarDate(now);

  // RN013, RN015: the start times of the day that have not passed.
  function findTimes(date: string): string[] {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const day = businessHours.find((item) => item.weekday === weekday);
    if (!day || date < today) return [];
    return listStartTimes(day).filter(
      (time) => Date.parse(toCompanyInstant(date, time)) > Date.parse(now),
    );
  }

  // Another day takes out the time chosen for the previous one, without the
  // message of a missing time before the person picks one.
  function chooseDate(date: string) {
    if (date !== dateField.value) setValue("time", null);
    dateField.onChange(date);
  }

  return (
    <div className="grid gap-8 @lg:grid-cols-2 @lg:items-start">
      <DateField
        chosenDate={dateField.value}
        firstMonth={today.slice(0, 7)}
        hasTimes={(date) => findTimes(date).length > 0}
        onChoose={chooseDate}
        onBlur={dateField.onBlur}
        inputRef={dateField.ref}
        error={dateState.error}
      />
      <TimeField
        times={dateField.value ? findTimes(dateField.value) : null}
        chosenTime={timeField.value}
        onChoose={timeField.onChange}
        onBlur={timeField.onBlur}
        inputRef={timeField.ref}
        error={timeState.error}
      />
    </div>
  );
}

type FieldErrorState = { message?: string } | undefined;

type DateFieldProps = {
  chosenDate: string | null;
  // aaaa-mm: the month of today, the first one the calendar shows.
  firstMonth: string;
  hasTimes: (date: string) => boolean;
  onChoose: (date: string) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  error: FieldErrorState;
};

// The days of a month as radio buttons under the weekdays: the arrow keys
// pass from one open day to the next, skipping the disabled ones. No limit of
// months ahead: no rule limits how early a client books.
function DateField({
  chosenDate,
  firstMonth,
  hasTimes,
  onChoose,
  onBlur,
  inputRef,
  error,
}: DateFieldProps) {
  const groupName = useId();
  const errorId = `${groupName}-error`;
  const [month, setMonth] = useState(
    () => chosenDate?.slice(0, 7) ?? firstMonth,
  );
  const days = listMonthDays(month);
  const firstWeekday = new Date(`${days[0]}T00:00:00Z`).getUTCDay();
  const firstEnabledDay = days.find(hasTimes);

  return (
    <FieldSet aria-describedby={error ? errorId : undefined} className="gap-3">
      <FieldLegend variant="label">Data</FieldLegend>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          disabled={month <= firstMonth}
          onClick={() => setMonth(addMonths(month, -1))}
        >
          <ChevronLeftIcon aria-hidden />
          <span className="sr-only">Mês anterior</span>
        </Button>
        <p aria-live="polite" className="font-semibold first-letter:uppercase">
          {formatMonth(`${month}-01`)}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <ChevronRightIcon aria-hidden />
          <span className="sr-only">Próximo mês</span>
        </Button>
      </div>
      <div className={cn(GROUP_CLASS, "grid-cols-7")}>
        {WEEKDAY_SHORT_LABELS.map((label) => (
          <span
            key={label}
            aria-hidden
            className="flex h-8 items-center justify-center text-xs font-semibold text-muted-foreground"
          >
            {label}
          </span>
        ))}
        {days.map((date, index) => {
          const inputId = `${groupName}-${date}`;
          return (
            <div
              key={date}
              className="relative"
              style={
                index === 0 ? { gridColumnStart: firstWeekday + 1 } : undefined
              }
            >
              <input
                // The first open day takes the focus of the field, as on an
                // error.
                ref={date === firstEnabledDay ? inputRef : undefined}
                id={inputId}
                type="radio"
                name={groupName}
                value={date}
                checked={date === chosenDate}
                disabled={!hasTimes(date)}
                onChange={() => onChoose(date)}
                onBlur={onBlur}
                className="peer sr-only"
              />
              <label htmlFor={inputId} className={OPTION_CLASS}>
                <span aria-hidden>{Number(date.slice(8))}</span>
                <span className="sr-only">{formatLongDate(date)}</span>
              </label>
            </div>
          );
        })}
      </div>
      <FieldError id={errorId} errors={[error]} />
    </FieldSet>
  );
}

type TimeFieldProps = {
  // null before a day is chosen.
  times: string[] | null;
  chosenTime: string | null;
  onChoose: (time: string) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  error: FieldErrorState;
};

function TimeField({
  times,
  chosenTime,
  onChoose,
  onBlur,
  inputRef,
  error,
}: TimeFieldProps) {
  const groupName = useId();
  const errorId = `${groupName}-error`;
  return (
    <FieldSet aria-describedby={error ? errorId : undefined} className="gap-3">
      <FieldLegend variant="label">Horário</FieldLegend>
      {times === null ? (
        <p className="text-sm text-muted-foreground">
          Escolha uma data para ver os horários.
        </p>
      ) : (
        <div
          className={cn(
            GROUP_CLASS,
            "grid-cols-3 @md:grid-cols-4 @lg:grid-cols-3",
          )}
        >
          {times.map((time, index) => {
            const inputId = `${groupName}-${time}`;
            return (
              <div key={time} className="relative">
                <input
                  ref={index === 0 ? inputRef : undefined}
                  id={inputId}
                  type="radio"
                  name={groupName}
                  value={time}
                  checked={time === chosenTime}
                  onChange={() => onChoose(time)}
                  onBlur={onBlur}
                  className="peer sr-only"
                />
                <label htmlFor={inputId} className={OPTION_CLASS}>
                  {time}
                </label>
              </div>
            );
          })}
        </div>
      )}
      <FieldError id={errorId} errors={[error]} />
    </FieldSet>
  );
}

// The calendar days (aaaa-mm-dd) of a month (aaaa-mm).
function listMonthDays(month: string): string[] {
  const [year, monthNumber] = month.split("-").map(Number);
  // Day 0 of the next month is the last day of this one.
  const dayCount = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from(
    { length: dayCount },
    (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`,
  );
}

// The month (aaaa-mm) some months before or after another.
function addMonths(month: string, count: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1 + count, 1))
    .toISOString()
    .slice(0, 7);
}
