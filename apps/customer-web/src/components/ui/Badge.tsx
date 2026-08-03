import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide whitespace-nowrap",
  {
    variants: {
      variant: {
        trending: "bg-emerald-600 text-white text-[10px] px-2 py-0.5",
        discount: "bg-rose-500 text-white text-[10px] px-2 py-0.5",
        organic: "bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5",
        outlet:
          "bg-white/95 text-emerald-700 shadow-sm border border-emerald-100 text-[10px] px-2 py-1",
        new: "bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5",
        bestseller: "bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5",
        rating:
          "bg-amber-50 text-amber-700 border border-amber-100 text-xs px-2 py-0.5 normal-case tracking-normal",
        unit: "bg-slate-100 text-slate-600 text-xs px-2 py-0.5 normal-case tracking-normal font-semibold",
        open: "bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1",
        closed: "bg-red-100 text-red-700 text-[10px] px-2.5 py-1",
        outOfStock: "bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5",
        tag: "bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "tag",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
