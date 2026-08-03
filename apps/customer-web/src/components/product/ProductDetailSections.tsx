"use client";

import { memo } from "react";
import { Leaf, Sprout, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: Leaf, title: "100% Natural", subtitle: "Pure & fresh" },
  { icon: Sprout, title: "Farm Fresh", subtitle: "Daily sourced" },
  { icon: ShieldCheck, title: "No Preservatives", subtitle: "Clean ingredients" },
] as const;

interface ProductFeatureGridProps {
  className?: string;
}

function ProductFeatureGridComponent({ className }: ProductFeatureGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-3 ${className ?? ""}`}>
      {FEATURES.map(({ icon: Icon, title, subtitle }) => (
        <div
          key={title}
          className="flex items-center gap-2.5 rounded-lg border border-surface-border bg-white p-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#ECFDF5]">
            <Icon size={18} className="text-brand-outlet" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink-primary">{title}</p>
            <p className="text-[10px] text-ink-muted">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export const ProductFeatureGrid = memo(ProductFeatureGridComponent);

interface ProductLongDescriptionProps {
  description?: string;
}

function ProductLongDescriptionComponent({ description }: ProductLongDescriptionProps) {
  if (!description) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-primary">
        Description
      </h2>
      <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
    </section>
  );
}

export const ProductLongDescription = memo(ProductLongDescriptionComponent);
