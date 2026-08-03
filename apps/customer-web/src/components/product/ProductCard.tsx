"use client";

import React, { memo, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Minus, ImageOff, Heart, TrendingUp, MapPin } from "lucide-react";
import { useFavorites } from "@/providers/CustomerAuthProvider";
import { useCartStore } from "@/features/cart/cart.store";
import { ProductListItem } from "@/features/products/types/product.types";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { resolveProductPricing } from "@/lib/product-pricing";
import { toast } from "sonner";
import { badgeStyles, productGrid, buttonStyles } from "@/lib/design-tokens";
import { ProductPriceRow } from "@/components/product/ProductPriceRow";
import { cn } from "@/lib/utils";

function ProductCardComponent({ product }: { product: ProductListItem }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const p = product as any;

  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFav = isFavorite(product.id);
  const { items, addItem, updateItem, removeItem } = useCartStore();
  const currentOutlet = useOutletStore((state) => state.selectedOutlet);

  const name = useMemo(() => {
    const n = p.name;
    if (typeof n === "object" && n !== null) return (n as { value?: string }).value || "Unknown";
    return String(n || "Unknown");
  }, [p.name]);

  const slug = useMemo(() => {
    const s = p.slug;
    if (typeof s === "object" && s !== null) return (s as { value?: string }).value || "#";
    return String(s || "#");
  }, [p.slug]);

  const pricing = useMemo(() => resolveProductPricing(p), [p]);
  const { mrp, sellingPrice, hasDiscount, discountPercent } = pricing;
  const imageUrl = useMemo(() => p.images?.mainImageUrl || null, [p.images]);

  const unitLabel = useMemo(() => {
    if (typeof p.unit === "object" && p.unit !== null) {
      return `${p.unit.value} ${p.unit.type}`.toUpperCase();
    }
    if (p.unit) return String(p.unit).toUpperCase();
    return "";
  }, [p.unit]);

  const isTrending = p.trendState?.trending || false;
  const description = String(p.shortDescription || "");
  const tags = (p.tags as string[]) || [];
  const productId = String(p.id);

  const cartItem = useMemo(
    () => items.find((i) => String(i.productId) === productId),
    [items, productId],
  );
  const quantity = cartItem?.quantity || 0;

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isFav) {
        removeFromFavorites(p.id);
      } else {
        addToFavorites(p);
      }
    },
    [isFav, p, removeFromFavorites, addToFavorites],
  );

  const handleAdd = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!currentOutlet?.id) {
        toast.error("Please select a delivery location first.");
        return;
      }
      if (mrp <= 0) {
        toast.error("Invalid price for this product.");
        return;
      }

      await addItem({
        productId,
        outletId: currentOutlet.id,
        productName: name,
        productImage: imageUrl || "",
        quantity: 1,
        unitPrice: mrp,
        discountPrice: sellingPrice,
      });
    },
    [currentOutlet, mrp, addItem, productId, name, imageUrl, sellingPrice],
  );

  const updateQuantity = useCallback(
    async (e: React.MouseEvent, delta: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (!cartItem) return;

      const newQty = cartItem.quantity + delta;
      if (newQty <= 0) await removeItem(productId);
      else await updateItem(productId, newQty);
    },
    [cartItem, removeItem, updateItem, productId],
  );

  const isAddDisabled = mrp <= 0 || !currentOutlet?.id;

  return (
    // h-full + flex-col: card stretches to grid row height uniformly
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
      {/* flex-1: link area grows; price row stays pinned below via sibling mt-auto */}
      <Link href={`/products/${slug}`} className="flex min-h-0 flex-1 flex-col no-underline">
        {/* shrink-0 + token height: every image slot is identical */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-surface-unit",
            productGrid.imageHeight,
          )}
        >
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="absolute right-1.5 top-1.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-white/95 shadow-sm touch-target"
            aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={11}
              fill={isFav ? "#ef4444" : "transparent"}
              color={isFav ? "#ef4444" : "#9CA3AF"}
              strokeWidth={2.5}
            />
          </button>

          {!imageLoaded && imageUrl && !imageError ? (
            <div className="absolute inset-0 animate-pulse bg-surface-unit" aria-hidden />
          ) : null}

          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              className={cn(
                "h-full w-full object-cover transition-opacity duration-200",
                !imageLoaded && "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-[10px] font-medium text-ink-muted">
              <ImageOff size={18} />
              <span>No Image</span>
            </div>
          )}

          {isTrending ? (
            <span
              className="absolute bottom-1.5 left-1.5 z-10 inline-flex items-center gap-1 rounded-md bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-yellow-950"
            >
              <TrendingUp size={10} aria-hidden />
              Trending
            </span>
          ) : null}
        </div>

        {/* flex-1 flex-col: distributes vertical space; fixed min-heights prevent content-driven jumps */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 px-2 pt-2">
          {/* min-h-[2.75rem]: reserves exactly 2 lines (text-base + leading-snug) */}
          <h3
            className="line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-ink-primary"
            title={name}
          >
            {name}
          </h3>

          {/* min-h-4: always one description line slot; line-clamp preserved */}
          <p
            className="line-clamp-1 min-h-4 text-[11px] text-ink-muted"
            title={description || undefined}
          >
            {description || "\u00A0"}
          </p>

          {/* min-h-4: tag row height fixed whether 0, 1, or 2 tags */}
          <div className="flex min-h-4 flex-wrap items-start gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex h-4 items-center rounded-full bg-emerald-50 px-1.5 text-[8px] font-semibold text-emerald-900"
              >
                {tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          {/* min-h-4: unit | outlet row always same height */}
          <div className="flex min-h-4 items-center gap-1 text-[10px] font-medium text-ink-muted">
            {unitLabel ? <span className="truncate">{unitLabel}</span> : null}
            {unitLabel && currentOutlet?.name ? (
              <span className="shrink-0 text-surface-border">|</span>
            ) : null}
            {currentOutlet?.name ? (
              <span className="inline-flex min-w-0 items-center gap-0.5 font-semibold text-brand-outlet">
                <MapPin size={10} className="shrink-0" aria-hidden />
                <span className="truncate">{currentOutlet.name}</span>
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {/* shrink-0 + mt-auto: price/ADD row aligned to card bottom across the grid */}
      <div className="mt-auto flex shrink-0 items-center justify-between gap-1.5 px-2 pb-2 pt-1.5">
        <ProductPriceRow
          sellingPrice={sellingPrice}
          mrp={mrp}
          hasDiscount={hasDiscount}
          discountPercent={discountPercent}
          size="card"
          className="min-w-0 flex-1"
        />

        {quantity === 0 ? (
          <button
            type="button"
            disabled={isAddDisabled}
            onClick={handleAdd}
            className={buttonStyles.add}
            aria-label="Add to cart"
          >
            <Plus size={12} strokeWidth={3} aria-hidden />
            ADD
          </button>
        ) : (
          <div className={buttonStyles.qty} role="group" aria-label="Quantity">
            <button
              type="button"
              className={cn(buttonStyles.qtyBtn, "rounded-l-button")}
              onClick={(e) => void updateQuantity(e, -1)}
              aria-label="Decrease quantity"
            >
              <Minus size={12} strokeWidth={3} />
            </button>
            <span className="min-w-[1rem] px-0.5 text-center text-[11px] font-bold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              className={cn(buttonStyles.qtyBtn, "rounded-r-button")}
              onClick={(e) => void updateQuantity(e, 1)}
              aria-label="Increase quantity"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

const ProductCard = memo(ProductCardComponent);
export default ProductCard;
