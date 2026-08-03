"use client";

import { productGrid } from "@/lib/design-tokens";

export default function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
      <div
        className={`animate-pulse bg-surface-unit ${productGrid.imageHeight}`}
      />
      <div className="space-y-2 px-2 py-2">
        <div className="h-4 w-[70%] animate-pulse rounded bg-surface-unit" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-unit" />
        <div className="h-2.5 w-[45%] animate-pulse rounded bg-surface-unit" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-16 animate-pulse rounded bg-surface-unit" />
          <div className="h-8 w-12 animate-pulse rounded-button bg-surface-unit" />
        </div>
      </div>
    </div>
  );
}
