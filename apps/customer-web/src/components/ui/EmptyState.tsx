"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon,
  emoji = "📦",
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center animate-fade-in-up",
        className,
      )}
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
        {icon ?? <span aria-hidden>{emoji}</span>}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
      {(primaryAction || secondaryAction) && (
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          {primaryAction ? (
            <Button
              variant={primaryAction.variant ?? "primary"}
              fullWidth
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              variant={secondaryAction.variant ?? "outline"}
              fullWidth
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
