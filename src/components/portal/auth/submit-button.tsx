import { LoaderCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
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
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={isLoading}
      focusableWhenDisabled
      className="w-full disabled:cursor-progress disabled:opacity-70"
    >
      {isLoading && (
        <LoaderCircleIcon aria-hidden className="animate-spin text-link" />
      )}
      {isLoading ? loadingLabel : children}
    </Button>
  );
}
