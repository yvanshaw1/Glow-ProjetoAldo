"use client";

import { useCallback, useState } from "react";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";
import { toApiError, type ApiError } from "@/lib/api-client";

// A failed submit: the error and a new key on every failure, so the notice
// is mounted again and takes the focus each time.
type FormFailure = { key: number; error: ApiError };

// docs/padroes/frontend.md: `fields` goes next to each field and `detail` to
// the notice at the top of the form.
export function useFormFailure<T extends FieldValues>(
  setError: UseFormSetError<T>,
) {
  const [failure, setFailure] = useState<FormFailure | null>(null);

  const showFailure = useCallback(
    (error: unknown) => {
      const apiError = toApiError(error);
      Object.entries(apiError.fields ?? {}).forEach(([field, message]) =>
        setError(field as FieldPath<T>, { message }),
      );
      setFailure((current) => ({
        key: (current?.key ?? 0) + 1,
        error: apiError,
      }));
    },
    [setError],
  );

  const clearFailure = useCallback(() => setFailure(null), []);

  return { failure, showFailure, clearFailure };
}
