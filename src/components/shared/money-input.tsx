"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { formatCurrency, readCurrencyInput } from "@/shared/format/currency";

type MoneyInputProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  // In reais, as moneySchema and the API take it; null when empty.
  value: number | null | undefined;
  onChange: (value: number | null) => void;
};

// docs/padroes/componentes.md, Campo monetário (RN035): the field always
// shows the formatted value, and each typed digit enters as the last cent.
export function MoneyInput({
  value,
  onChange,
  placeholder = formatCurrency(0),
  ...props
}: MoneyInputProps) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      value={value === null || value === undefined ? "" : formatCurrency(value)}
      onChange={(event) => onChange(readCurrencyInput(event.target.value))}
    />
  );
}
