"use client";

import { memo } from "react";
import { typography } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface ProductPriceRowProps {
  sellingPrice: number;
  mrp: number;
  hasDiscount: boolean;
  discountPercent: number;
  size?: "card" | "detail";
  className?: string;
}

function ProductPriceRowComponent({
  sellingPrice,
  mrp,
  hasDiscount,
  discountPercent,
  size = "card",
  className,
}: ProductPriceRowProps) {
  const priceClass = size === "detail" ? typography.priceLg : typography.priceCard;

  return (
    <div
      className={cn("flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5", className)}
    >
      <span className={priceClass}>₹{sellingPrice}</span>
      {hasDiscount ? (
        <>
          <span className={typography.priceStrike}>₹{mrp}</span>
          <span className={typography.discountText }><span className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-bold text-red-600">
  {discountPercent}% OFF
</span></span>
        </>
      ) : null}
    </div>
  );
}

export const ProductPriceRow = memo(ProductPriceRowComponent);
