"use client";

import { memo } from "react";
import ProductCard from "@/components/product/ProductCard";
import { ProductListItem } from "@/features/products/types/product.types";
import { typography } from "@/lib/design-tokens";

interface RelatedProductsCarouselProps {
  title?: string;
  products: ProductListItem[];
}

function RelatedProductsCarouselComponent({
  title = "Related Products",
  products,
}: RelatedProductsCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-10 border-t border-surface-border pt-8" aria-label={title}>
      <h2 className={`${typography.sectionTitle} mb-4`}>{title}</h2>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide snap-x snap-mandatory">
        {products.map((product) => (
          <div
            key={product.id}
            className="h-full w-[148px] shrink-0 snap-start sm:w-[160px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export const RelatedProductsCarousel = memo(RelatedProductsCarouselComponent);
