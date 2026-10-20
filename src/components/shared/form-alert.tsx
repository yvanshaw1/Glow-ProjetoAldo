"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// RNF003, RNF005: the notice takes the focus when it appears, so a keyboard
// or screen reader user hears it right away.
export function FormAlert({ children }: { children: ReactNode }) {
  const alertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    alertRef.current?.focus();
  }, []);
  return (
    <Alert ref={alertRef} tabIndex={-1} variant="destructive">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
