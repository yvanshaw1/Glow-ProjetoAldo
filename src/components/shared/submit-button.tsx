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
  // The send waits for something else (RNF005): the button does not send but
  // keeps the focus and its label.
  isDisabled?: boolean;
  children: ReactNode;
};

// RNF004: while the request and the page change are on, the button shows the
// loading state of docs/padroes/design.md and keeps the focus.
export function SubmitButton({
  isLoading,
  loadingLabel,
  isDisabled = false,
  children,
  size,
  className,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size={size}
      disabled={isLoading || isDisabled}
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
