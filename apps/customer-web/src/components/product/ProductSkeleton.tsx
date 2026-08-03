"use client";

export default function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
      <div className="relative h-[170px] w-full shrink-0 animate-pulse rounded-t-2xl bg-surface-unit md:h-[200px] lg:h-[220px]" />
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
