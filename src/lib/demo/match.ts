import type { HttpMethod } from "@/lib/api-client";
import {
  DEMO_ROUTES,
  type DemoRequest,
  type DemoRoute,
} from "@/lib/demo/routes";

// The demo answers this long after the call, so the screen shows its
// loading state, as with a real route (decision 0055).
export const DEMO_DELAY_MS = 400;

const PARAM_PREFIX = ":";

export type DemoMatch = { route: DemoRoute; request: DemoRequest };

// The entry of the demo list with the same method and path, or null, with the
// request its answer reads. Another method on a listed path is not an entry:
// it goes to the API.
export function findDemoRoute(
  method: HttpMethod,
  path: string,
  body: unknown,
): DemoMatch | null {
  const [pathname, queryText = ""] = path.split("?");
  for (const route of DEMO_ROUTES) {
    const params =
      route.method === method ? readPathParams(route.path, pathname) : null;
    if (params) {
      return {
        route,
        request: { params, query: new URLSearchParams(queryText), body },
      };
    }
  }
  return null;
}

// The wait of the demo answer. Cancelled by the screen, it rejects with the
// reason of the signal, as fetch does.
export function waitForDemo(signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    }, DEMO_DELAY_MS);
    if (signal?.aborted) cancel();
    else signal?.addEventListener("abort", cancel, { once: true });
  });
}

// Compares the path segment by segment; :name matches any segment.
function readPathParams(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  const patternSegments = pattern.split("/");
  const pathSegments = pathname.split("/");
  const isSamePath =
    patternSegments.length === pathSegments.length &&
    patternSegments.every((segment, index) =>
      segment.startsWith(PARAM_PREFIX)
        ? pathSegments[index] !== ""
        : segment === pathSegments[index],
    );
  if (!isSamePath) return null;
  return Object.fromEntries(
    patternSegments.flatMap((segment, index) =>
      segment.startsWith(PARAM_PREFIX)
        ? [[segment.slice(PARAM_PREFIX.length), pathSegments[index]]]
        : [],
    ),
  );
}
