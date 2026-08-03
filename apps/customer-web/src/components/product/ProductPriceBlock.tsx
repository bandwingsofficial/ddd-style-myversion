"use client";

import { memo } from "react";
import { MapPin } from "lucide-react";
import { badgeStyles } from "@/lib/design-tokens";
import { ProductPriceRow } from "@/components/product/ProductPriceRow";
import { cn } from "@/lib/utils";

interface ProductPriceBlockProps {
  currentPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  outletName?: string;
  className?: string;
}

function ProductPriceBlockComponent({
  currentPrice,
  originalPrice,
  hasDiscount,
  discountPercent,
  outletName,
  className,
}: ProductPriceBlockProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {outletName ? (
        <span className={badgeStyles.outlet}>
          <MapPin size={12} aria-hidden />
          {outletName}
        </span>
      ) : null}

      <ProductPriceRow
        sellingPrice={currentPrice}
        mrp={originalPrice}
        hasDiscount={hasDiscount}
        discountPercent={discountPercent}
        size="detail"
      />
    </div>
  );
}

export const ProductPriceBlock = memo(ProductPriceBlockComponent);
