"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DENIED_PARAM = "denied";

// UC08 FE03, RS008: src/proxy.ts sent the person here from a page the
// profile does not open (docs/acesso/protecao-das-paginas.md). The notice
// stays on this page until the next navigation, and the parameter leaves the
// address, so a reload does not bring it back.
export function AccessDeniedNotice() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasDeniedParam = searchParams.has(DENIED_PARAM);
  const [notice, setNotice] = useState({ pathname, isShown: hasDeniedParam });

  // Updated while rendering, as React recommends for state that follows a
  // value: a new page starts without the notice unless it brings the param.
  if (notice.pathname !== pathname || (hasDeniedParam && !notice.isShown)) {
    setNotice({ pathname, isShown: hasDeniedParam });
  }

  useEffect(() => {
    if (!hasDeniedParam) return;
    const remaining = new URLSearchParams(searchParams);
    remaining.delete(DENIED_PARAM);
    const query = remaining.toString();
    history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }, [hasDeniedParam, pathname, searchParams]);

  if (!notice.isShown) return null;
  return (
    <Alert>
      <AlertDescription>
        Você não tem permissão para acessar essa página.
      </AlertDescription>
    </Alert>
  );
}
