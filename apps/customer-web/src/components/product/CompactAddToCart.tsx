"use client";

import { memo } from "react";
import { Plus, Minus } from "lucide-react";
import { buttonStyles } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface CompactAddToCartProps {
  quantityInCart: number;
  disabled: boolean;
  disabledLabel?: string;
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
  variant?: "card" | "detail";
  className?: string;
}

function CompactAddToCartComponent({
  quantityInCart,
  disabled,
  disabledLabel = "Unavailable",
  onAdd,
  onUpdateQty,
  variant = "card",
  className,
}: CompactAddToCartProps) {
  if (quantityInCart > 0) {
    return (
      <div
        className={cn(buttonStyles.qty, "w-fit", className)}
        role="group"
        aria-label="Quantity in cart"
      >
        <button
          type="button"
          onClick={() => onUpdateQty(-1)}
          className={cn(buttonStyles.qtyBtn, "rounded-l-button")}
          aria-label="Decrease quantity"
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <span className="min-w-[1.25rem] px-0.5 text-center text-xs font-bold tabular-nums">
          {quantityInCart}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQty(1)}
          disabled={disabled}
          className={cn(buttonStyles.qtyBtn, "rounded-r-button")}
          aria-label="Increase quantity"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className={cn(
        variant === "detail" ? buttonStyles.addDetail : buttonStyles.add,
        className,
      )}
      aria-label="Add to cart"
    >
      {variant === "card" ? (
        <>
          <Plus size={12} strokeWidth={3} aria-hidden />
          ADD
        </>
      ) : disabled ? (
        disabledLabel
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}

export const CompactAddToCart = memo(CompactAddToCartComponent);
