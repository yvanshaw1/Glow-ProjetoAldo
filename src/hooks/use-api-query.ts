"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiRequest,
  toApiError,
  type ApiError,
  type ApiRequestOptions,
} from "@/lib/api-client";

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

// Reads a route of the API with its loading and failure states
// (docs/padroes/frontend.md): a GET or, with a body, a POST that does not
// write, like the preview of the booking (docs/agendamento/rotas.md). A new
// path, a new body, a reload or leaving the screen cancels the call on the
// way; a null path calls nothing. While a new call runs, the previous data
// stays, so a listing does not blink. Writes do not pass here: they are never
// repeated (docs/padroes/api.md).
export function useApiQuery<T>(
  path: string | null,
  body?: unknown,
): ApiQuery<T> {
  const [reloadCount, setReloadCount] = useState(0);
  const [answer, setAnswer] = useState<Answer<T> | null>(null);
  // As text, so an equal body built again on each render is the same call.
  const bodyText = body === undefined ? null : JSON.stringify(body);
  const request =
    path === null ? null : `${reloadCount} ${path} ${bodyText ?? ""}`;

  useEffect(() => {
    if (path === null || request === null) return;
    const controller = new AbortController();
    const options: ApiRequestOptions =
      bodyText === null
        ? { signal: controller.signal }
        : {
            method: "POST",
            body: JSON.parse(bodyText),
            signal: controller.signal,
          };
    apiRequest<T>(path, options).then(
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
  }, [path, bodyText, request]);

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
