export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[45%_55%] lg:gap-10">
        <div className="aspect-square rounded-xl bg-surface-unit" />
        <div className="space-y-4">
          <div className="h-3 w-40 rounded bg-surface-unit" />
          <div className="h-7 w-3/4 rounded bg-surface-unit" />
          <div className="h-4 w-full rounded bg-surface-unit" />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded bg-surface-unit" />
            <div className="h-5 w-16 rounded bg-surface-unit" />
          </div>
          <div className="h-5 w-24 rounded bg-surface-unit" />
          <div className="h-8 w-32 rounded bg-surface-unit" />
          <div className="h-9 w-28 rounded bg-surface-unit" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 rounded-lg bg-surface-unit" />
            <div className="h-16 rounded-lg bg-surface-unit" />
            <div className="h-16 rounded-lg bg-surface-unit" />
          </div>
          <div className="h-24 rounded bg-surface-unit" />
          <div className="h-20 rounded bg-surface-unit" />
        </div>
      </div>
    </div>
  );
}
