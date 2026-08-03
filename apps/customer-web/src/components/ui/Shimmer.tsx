import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export function ShimmerText({ className }: ShimmerProps) {
  return <Shimmer className={cn("h-4 rounded-md", className)} />;
}

export function ShimmerCircle({ className }: ShimmerProps) {
  return <Shimmer className={cn("rounded-full", className)} />;
}

export function CategoryCarouselShimmer() {
  return (
    <section className="w-full bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[1440px]">
        <ShimmerText className="mx-auto mb-10 h-10 w-56" />
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex w-[140px] flex-shrink-0 flex-col items-center gap-3 sm:w-[190px]">
              <ShimmerCircle className="h-[100px] w-[100px] sm:h-[190px] sm:w-[190px]" />
              <ShimmerText className="h-5 w-24" />
              <ShimmerText className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductGridShimmer({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          <Shimmer className="h-[170px] w-full rounded-none md:h-[200px] lg:h-[220px]" />
          <div className="space-y-3 p-4">
            <ShimmerText className="h-5 w-3/4" />
            <ShimmerText className="h-4 w-1/2" />
            <div className="flex items-center justify-between pt-2">
              <ShimmerText className="h-6 w-20" />
              <Shimmer className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeaderLocationShimmer() {
  return (
    <div className="flex items-center gap-2 p-1">
      <ShimmerCircle className="h-5 w-5" />
      <div className="space-y-1.5">
        <ShimmerText className="h-2 w-14" />
        <ShimmerText className="h-4 w-28" />
      </div>
    </div>
  );
}
