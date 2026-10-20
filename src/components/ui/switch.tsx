"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-input p-0.5 inset-shadow-neu-sm transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 aria-invalid:border-destructive data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9 data-checked:bg-primary data-unchecked:bg-background data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full shadow-neu-sm transition-transform group-data-[size=default]/switch:size-[18px] group-data-[size=sm]/switch:size-3.5 group-data-[size=default]/switch:data-checked:translate-x-5 group-data-[size=sm]/switch:data-checked:translate-x-4 data-checked:bg-primary-foreground data-unchecked:translate-x-0 data-unchecked:bg-input"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
