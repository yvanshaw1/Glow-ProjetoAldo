"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { AdminNav } from "@/components/admin/layout/admin-nav";
import { BrandLink } from "@/components/shared/brand-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Below 1024 px the panel navigation opens in a side menu (RNF001, wireframe
// staffPages/headerMobile/).
export function AdminTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-header items-center justify-between bg-background px-6 shadow-neu-sm lg:hidden">
      <BrandLink />
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger
          render={
            <Button variant="secondary" size="icon" aria-label="Abrir menu" />
          }
        >
          <MenuIcon aria-hidden />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle className="sr-only">Menu do painel</SheetTitle>
          <AdminNav onNavigate={() => setIsMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
