"use client";

import { LogOutIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

type SignOutButtonProps = {
  // "/" in the portal (UC03 FA05), "/login" in the panel (UC08 FA03).
  destination: "/" | "/login";
  className?: string;
};

export function SignOutButton({ destination, className }: SignOutButtonProps) {
  const { signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  function handleClick() {
    setIsSigningOut(true);
    void signOut(destination);
  }

  return (
    <Button
      variant="secondary"
      className={className}
      disabled={isSigningOut}
      onClick={handleClick}
    >
      <LogOutIcon aria-hidden />
      {isSigningOut ? "Saindo…" : "Sair"}
    </Button>
  );
}
