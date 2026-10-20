import { SearchXIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

// A listing without items shows the message of the screen
// (docs/padroes/componentes.md), with a 42 px illustration icon
// (docs/padroes/design-midia.md).
export function EmptyState({
  title,
  description,
  icon: Icon = SearchXIcon,
  action,
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Icon aria-hidden className="size-[42px] text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
