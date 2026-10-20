import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

// Frame of the access pages: a centered surface of the theme, the full width
// of the screen on a phone (docs/padroes/design.md).
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="px-6 py-8 md:py-14 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col gap-8 rounded-xl bg-background p-5 shadow-neu-md md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-h3 font-bold md:text-h2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
