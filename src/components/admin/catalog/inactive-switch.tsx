"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// RF059 and UC15 FA03: the switch that shows the inactive ones in a listing.
type InactiveSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function InactiveSwitch({
  checked,
  onCheckedChange,
}: InactiveSwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id}>Exibir inativos</Label>
    </div>
  );
}
