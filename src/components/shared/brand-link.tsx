import Link from "next/link";
import { cn } from "@/lib/utils";

// The brand as text while there is no logo in public/.
export function BrandLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("rounded-lg text-h3 font-bold text-foreground", className)}
    >
      Glow
    </Link>
  );
}
