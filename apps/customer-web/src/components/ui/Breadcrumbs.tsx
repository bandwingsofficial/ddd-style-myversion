"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-xs text-ink-muted scrollbar-hide",
        className,
      )}
    >
      <Link
        href="/home"
        className="shrink-0 font-medium transition-colors hover:text-brand-outlet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex shrink-0 items-center gap-1"
          >
            <ChevronRight size={12} className="text-surface-border" aria-hidden />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium transition-colors hover:text-brand-outlet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "max-w-[10rem] truncate sm:max-w-xs",
                  isLast ? "font-semibold text-brand-outlet" : "font-medium",
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
