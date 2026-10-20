"use client";

import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UserCogIcon,
  UsersIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLink } from "@/components/shared/brand-link";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession, type SessionState } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/shared/api/auth";
import {
  PERMISSION_LABELS,
  PERMISSION_PAGES,
  type Permission,
} from "@/shared/constants/permissions";
import { PROFILE_LABELS } from "@/shared/constants/profiles";
import { ERROR_CATALOG } from "@/shared/errors/catalog";

const PERMISSION_ICONS = {
  dashboard: LayoutDashboardIcon,
  appointments: CalendarDaysIcon,
  services: WrenchIcon,
  clients: UsersIcon,
  staff: UserCogIcon,
  settings: SettingsIcon,
} as const satisfies Record<Permission, LucideIcon>;

const LOADING_ITEMS = 3;

type AdminNavProps = {
  // Closes the side menu on the phone when a page is chosen.
  onNavigate?: () => void;
};

function PageLinks({
  permissions,
  onNavigate,
}: {
  permissions: Permission[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // RN025: only the pages of the role, already in the panel order; every page
  // for the admin (RN027). Hiding a link does not block anything (RS008).
  return (
    <ul className="flex flex-col gap-2">
      {permissions.map((permission) => {
        const href = PERMISSION_PAGES[permission];
        const Icon = PERMISSION_ICONS[permission];
        const isCurrent = pathname === href;
        return (
          <li key={permission}>
            <Link
              href={href}
              aria-current={isCurrent ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start",
                isCurrent && "text-link inset-shadow-neu-sm",
              )}
            >
              <Icon aria-hidden />
              {PERMISSION_LABELS[permission]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function NavContent({
  session,
  reload,
  onNavigate,
}: {
  session: SessionState;
  reload: () => Promise<void>;
  onNavigate?: () => void;
}) {
  if (session.status === "loading") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: LOADING_ITEMS }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (session.status === "unavailable") {
    return (
      <Alert>
        <AlertDescription className="flex flex-col items-start gap-3">
          {ERROR_CATALOG.SERVICE_UNAVAILABLE.message}
          <Button variant="secondary" onClick={() => void reload()}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (session.status === "visitor") return null;
  return (
    <PageLinks permissions={session.user.permissions} onNavigate={onNavigate} />
  );
}

function UserBlock({ user }: { user: SessionUser }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl p-3 shadow-neu-sm">
      <div>
        <p className="font-semibold">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">
          {PROFILE_LABELS[user.profile]}
        </p>
      </div>
      <SignOutButton destination="/login" />
    </div>
  );
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const session = useSession();

  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <BrandLink className="self-start" />
      <nav aria-label="Painel" className="flex-1">
        <NavContent
          session={session}
          reload={session.reload}
          onNavigate={onNavigate}
        />
      </nav>
      {session.status === "authenticated" && <UserBlock user={session.user} />}
    </div>
  );
}
