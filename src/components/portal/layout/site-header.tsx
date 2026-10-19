"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLink } from "@/components/shared/brand-link";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession, type SessionState } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { PERMISSION_PAGES } from "@/shared/constants/permissions";

type NavLink = { href: string; label: string };

// Items of the portal header by profile (docs/padroes/frontend.md, Layouts).
const PUBLIC_LINKS: NavLink[] = [
  { href: "/", label: "Início" },
  { href: "/services", label: "Serviços" },
];

const CLIENT_LINKS: NavLink[] = [
  { href: "/booking", label: "Agendar" },
  { href: "/appointments", label: "Meus agendamentos" },
  { href: "/profile", label: "Minha conta" },
];

function findLinks(session: SessionState): NavLink[] {
  if (session.status !== "authenticated") return PUBLIC_LINKS;
  const { profile, permissions } = session.user;
  if (profile === "client") return [...PUBLIC_LINKS, ...CLIENT_LINKS];
  // Staff and admin: the first page the role allows, if any.
  const [firstPermission] = permissions;
  if (!firstPermission) return PUBLIC_LINKS;
  return [
    ...PUBLIC_LINKS,
    { href: PERMISSION_PAGES[firstPermission], label: "Painel" },
  ];
}

type NavListProps = {
  links: NavLink[];
  pathname: string;
  onNavigate?: () => void;
  className?: string;
};

function NavList({ links, pathname, onNavigate, className }: NavListProps) {
  return (
    <ul className={className}>
      {links.map(({ href, label }) => {
        const isCurrent = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={isCurrent ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                isCurrent && "text-link inset-shadow-neu-sm",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function HeaderActions({ session }: { session: SessionState }) {
  if (session.status === "loading") {
    return <Skeleton className="h-10 w-48 rounded-lg" />;
  }
  if (session.status === "authenticated") {
    return <SignOutButton destination="/" />;
  }
  return (
    <>
      <Link href="/login" className={buttonVariants({ variant: "secondary" })}>
        Entrar
      </Link>
      <Link href="/register" className={buttonVariants()}>
        Criar conta
      </Link>
    </>
  );
}

export function SiteHeader() {
  const session = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = findLinks(session);

  return (
    <header className="sticky top-0 z-40 bg-background shadow-neu-sm">
      <div className="mx-auto flex h-header max-w-page items-center justify-between gap-4 px-6 lg:px-8">
        <BrandLink />
        <nav aria-label="Principal" className="hidden md:block">
          <NavList
            links={links}
            pathname={pathname}
            className="flex items-center gap-2"
          />
        </nav>
        {/* The width is kept while the session loads, so nothing moves. */}
        <div className="hidden min-w-48 items-center justify-end gap-3 md:flex">
          <HeaderActions session={session} />
        </div>
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="secondary"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menu"
              />
            }
          >
            <MenuIcon aria-hidden />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav aria-label="Principal" className="px-4">
              <NavList
                links={links}
                pathname={pathname}
                onNavigate={() => setIsMenuOpen(false)}
                className="flex flex-col gap-2"
              />
            </nav>
            <div className="mt-auto flex flex-col gap-3 p-4">
              <HeaderActions session={session} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
