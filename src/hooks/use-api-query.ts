"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, toApiError, type ApiError } from "@/lib/api-client";

// The last finished call: the request it answers (the path and the count of
// reloads) and what it brought.
type Answer<T> = {
  request: string;
  data: T | null;
  error: ApiError | null;
};

export type ApiQuery<T> = {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  reload: () => void;
};

// Reads a GET route of the API with its loading and failure states
// (docs/padroes/frontend.md). A new path, a reload or leaving the screen
// cancels the call on the way; a null path calls nothing. While a new call
// runs, the previous data stays, so a listing does not blink. Writes do not
// pass here: they are never repeated (docs/padroes/api.md).
export function useApiQuery<T>(path: string | null): ApiQuery<T> {
  const [reloadCount, setReloadCount] = useState(0);
  const [answer, setAnswer] = useState<Answer<T> | null>(null);
  const request = path === null ? null : `${reloadCount} ${path}`;

  useEffect(() => {
    if (path === null || request === null) return;
    const controller = new AbortController();
    apiRequest<T>(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) {
          setAnswer({ request, data, error: null });
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setAnswer({ request, data: null, error: toApiError(error) });
        }
      },
    );
    return () => controller.abort();
  }, [path, request]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // Loading is derived: the last answer is not the one of this request.
  const isAnswered = answer !== null && answer.request === request;
  return {
    data: request === null ? null : (answer?.data ?? null),
    error: isAnswered ? answer.error : null,
    isLoading: request !== null && !isAnswered,
    reload,
  };
}
