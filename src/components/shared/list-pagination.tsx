"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListPaginationProps = {
  page: number;
  pageCount: number;
  firstItem: number;
  lastItem: number;
  total: number;
  onPageChange: (page: number) => void;
};

// Up to three page numbers around the current one: with the four arrows,
// they fit a 360 px screen.
const VISIBLE_PAGES = 3;
const FIRST_PAGE = 1;

// docs/padroes/componentes.md, Listagem: buttons, because changing the page
// is an action. The range comes from the items on the screen, so it is
// announced when a new page or search arrives.
export function ListPagination({
  page,
  pageCount,
  firstItem,
  lastItem,
  total,
  onPageChange,
}: ListPaginationProps) {
  const isFirstPage = page === FIRST_PAGE;
  const isLastPage = page === pageCount;

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p role="status" className="text-sm text-muted-foreground">
        {firstItem}–{lastItem} de {total}
      </p>
      {pageCount > 1 && (
        <ul className="flex items-center gap-1">
          <PageButton
            label="Primeira página"
            isDisabled={isFirstPage}
            onClick={() => onPageChange(FIRST_PAGE)}
          >
            <ChevronsLeftIcon aria-hidden />
          </PageButton>
          <PageButton
            label="Página anterior"
            isDisabled={isFirstPage}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon aria-hidden />
          </PageButton>
          {listVisiblePages(page, pageCount).map((pageNumber) => (
            <PageButton
              key={pageNumber}
              label={`Página ${pageNumber}`}
              isCurrent={pageNumber === page}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </PageButton>
          ))}
          <PageButton
            label="Próxima página"
            isDisabled={isLastPage}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon aria-hidden />
          </PageButton>
          <PageButton
            label="Última página"
            isDisabled={isLastPage}
            onClick={() => onPageChange(pageCount)}
          >
            <ChevronsRightIcon aria-hidden />
          </PageButton>
        </ul>
      )}
    </nav>
  );
}

type PageButtonProps = {
  label: string;
  isDisabled?: boolean;
  isCurrent?: boolean;
  onClick: () => void;
  children: ReactNode;
};

// The current page is pressed, with the link color and aria-current
// (docs/padroes/design.md). A disabled arrow keeps the focus.
function PageButton({
  label,
  isDisabled = false,
  isCurrent = false,
  onClick,
  children,
}: PageButtonProps) {
  return (
    <li>
      <Button
        variant="secondary"
        size="icon"
        aria-label={label}
        aria-current={isCurrent ? "page" : undefined}
        disabled={isDisabled}
        focusableWhenDisabled
        onClick={isCurrent ? undefined : onClick}
        className={cn(isCurrent && "text-link shadow-none inset-shadow-neu-md")}
      >
        {children}
      </Button>
    </li>
  );
}

function listVisiblePages(page: number, pageCount: number): number[] {
  const firstVisible = Math.max(
    FIRST_PAGE,
    Math.min(page - 1, pageCount - VISIBLE_PAGES + 1),
  );
  const lastVisible = Math.min(pageCount, firstVisible + VISIBLE_PAGES - 1);
  return Array.from(
    { length: lastVisible - firstVisible + 1 },
    (_, index) => firstVisible + index,
  );
}
