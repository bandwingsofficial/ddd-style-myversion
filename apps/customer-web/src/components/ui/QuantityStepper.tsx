"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: { btn: "h-8 w-8", text: "text-sm w-8" },
  md: { btn: "h-10 w-10", text: "text-base w-10" },
  lg: { btn: "h-11 w-11", text: "text-lg w-12" },
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = "md",
  className,
}: QuantityStepperProps) {
  const styles = sizeStyles[size];

  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-sm",
        disabled && "opacity-50",
        className,
      )}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        className={cn(
          "flex items-center justify-center rounded-l-xl text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 touch-target",
          styles.btn,
        )}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span
        className={cn(
          "text-center font-bold tabular-nums text-slate-900",
          styles.text,
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        className={cn(
          "flex items-center justify-center rounded-r-xl text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 touch-target",
          styles.btn,
        )}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
