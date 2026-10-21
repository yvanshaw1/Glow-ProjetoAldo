import { LoaderCircleIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitButtonProps = Pick<
  ComponentProps<typeof Button>,
  "size" | "className"
> & {
  isLoading: boolean;
  loadingLabel: string;
  children: ReactNode;
};

// RNF004: while the request and the page change are on, the button shows the
// loading state of docs/padroes/design.md and keeps the focus.
export function SubmitButton({
  isLoading,
  loadingLabel,
  children,
  size,
  className,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size={size}
      disabled={isLoading}
      focusableWhenDisabled
      className={cn(
        "aria-disabled:cursor-progress aria-disabled:opacity-70",
        className,
      )}
    >
      {isLoading && (
        <LoaderCircleIcon aria-hidden className="animate-spin text-link" />
      )}
      {isLoading ? loadingLabel : children}
    </Button>
  );
}
