import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Sunken field with a 3:1 border: the shadow alone does not identify
        // it (WCAG 1.4.11, docs/padroes/design.md).
        "h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-1 text-base inset-shadow-neu-sm transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
