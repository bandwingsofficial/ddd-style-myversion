"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Minus, ImageOff, Heart, Star, TrendingUp, MapPin } from "lucide-react";
import { useFavorites } from "@/providers/CustomerAuthProvider";
import { useCartStore } from "@/features/cart/cart.store";
import { ProductListItem } from "@/features/products/types/product.types";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { resolveProductPricing } from "@/lib/product-pricing";
import { toast } from "sonner";

export default function ProductCard({ product }: { product: ProductListItem }) {
  const [imageError, setImageError] = useState(false);
  const p = product as any;

  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFav = isFavorite(product.id);
  const { items, addItem, updateItem, removeItem } = useCartStore();

  const currentOutlet = useOutletStore((state) => state.selectedOutlet);

  const name = useMemo(() => p.name?.value || p.name || "Unknown", [p]);
  const slug = useMemo(() => p.slug?.value || p.slug || "#", [p]);

  const outletId = currentOutlet?.id ?? null;

  const pricing = useMemo(() => resolveProductPricing(p), [p]);
  const { mrp, sellingPrice, hasDiscount, discountPercent } = pricing;

  const imageUrl = useMemo(() => p.images?.mainImageUrl || null, [p]);

  const unitLabel = useMemo(() => {
    if (typeof p.unit === "object" && p.unit !== null) return `${p.unit.value} ${p.unit.type}`;
    else if (p.unit) return String(p.unit);
    return "";
  }, [p.unit]);

  const isTrending = p.trendState?.trending || false;
  const ratingAvg = typeof p.rating === "object" ? p.rating.average : (p.rating || 0);
  const description = p.shortDescription || "";
  const tags = p.tags || [];

  const productId = String(p.id);
  const cartItem = useMemo(
    () => items.find((i) => String(i.productId) === productId),
    [items, productId],
  );
  const quantity = cartItem?.quantity || 0;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isFav ? removeFromFavorites(p.id) : addToFavorites(p);
  };

  const handleAdd = async (e: React.MouseEvent) => {
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
  };

  const updateQuantity = async (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;

    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) await removeItem(productId);
    else await updateItem(productId, newQty);
  };

  const isAddDisabled = mrp <= 0 || !currentOutlet?.id;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[14px] border border-slate-100 bg-white transition-all duration-300 cubic-bezier(0.4,0,0.2,1) hover:border-green-600/20 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      <Link
        href={`/products/${slug}`}
        className="group flex min-h-0 flex-1 flex-col no-underline"
      >
        <div className="relative flex h-[140px] shrink-0 items-center justify-center overflow-hidden bg-slate-50">
          {currentOutlet?.name && (
            <div className="absolute left-1.5 top-1.5 z-20 inline-flex max-w-[calc(100%-3rem)] items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[0.58rem] font-bold text-emerald-700 shadow-sm">
              <MapPin size={10} className="shrink-0" />
              <span className="truncate">{currentOutlet.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleFavorite}
            className="absolute right-1.5 top-1.5 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-white shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-transform active:scale-90 touch-target"
            aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={isFav ? "#ef4444" : "transparent"} color={isFav ? "#ef4444" : "#94a3b8"} strokeWidth={2.5} />
          </button>

          {imageUrl && !imageError ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImageError(true)} />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[0.7rem] font-semibold text-slate-400">
              <ImageOff size={24} />
              <span>No Image</span>
            </div>
          )}

          <div className="absolute left-1.5 bottom-1.5 z-10 flex flex-col gap-1">
            {isTrending && (
              <div className="flex items-center gap-0.5 rounded bg-amber-500 px-1.5 py-0.5 text-[0.6rem] font-extrabold text-white">
                <TrendingUp size={10} /> Trending
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <div className="min-w-0 flex-1">
            {tags.length > 0 && (
              <div className="mb-1 flex flex-wrap gap-1">
                {tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="rounded bg-slate-200 px-1 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-slate-600">{tag.replace(/_/g, " ")}</span>
                ))}
              </div>
            )}

            <h3 className="mb-0.5 line-clamp-1 text-[0.9rem] font-bold leading-[1.2] text-slate-800" title={name}>{name}</h3>

            {description ? (
              <p className="mb-1 line-clamp-1 text-[0.7rem] text-slate-500" title={description}>{description}</p>
            ) : (
              <div className="mb-1 h-[1.2em]" />
            )}

            <div className="mb-1.5 flex items-center gap-1.5">
              {unitLabel && <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[0.7rem] font-semibold text-slate-500">{unitLabel}</span>}
              {ratingAvg > 0 && (
                <div className="flex items-center gap-0.5 rounded bg-slate-100 px-1 py-0.5 text-[0.65rem] font-bold text-slate-600">
                  <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  <span>{ratingAvg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="relative z-40 mt-auto flex items-center justify-between gap-2 border-t border-slate-50 px-2.5 pb-2.5 pt-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-none">
          {hasDiscount ? (
            <>
              <span className="text-[0.75rem] font-medium text-slate-400 line-through">₹{mrp}</span>
              <span className="text-[1.25rem] font-extrabold text-slate-900">₹{sellingPrice}</span>
              <span className="inline-flex shrink-0 rounded-full bg-red-500 px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-wide text-white">
                {discountPercent}% OFF
              </span>
            </>
          ) : (
            <span className="text-[1.25rem] font-extrabold text-slate-900">₹{sellingPrice}</span>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center">
          {quantity === 0 ? (
            <button
              type="button"
              disabled={isAddDisabled}
              onClick={handleAdd}
              className={`flex h-9 min-w-[2.75rem] items-center justify-center gap-0.5 rounded-md border px-2 text-[0.65rem] font-extrabold transition-all touch-target
                ${isAddDisabled
                  ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400 opacity-60"
                  : "border-green-600 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white active:scale-95"
                }`}
              aria-label="Add to cart"
            >
              <Plus size={14} strokeWidth={3} />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex h-9 items-center gap-0.5 rounded-md bg-green-600 p-0.5 text-white shadow-[0_2px_6px_rgba(22,163,74,0.2)] md:h-10">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded border-none bg-transparent text-white transition-colors hover:bg-white/10 touch-target md:h-9 md:w-9"
                onClick={(e) => void updateQuantity(e, -1)}
                aria-label="Decrease quantity"
              >
                <Minus size={13} strokeWidth={3} />
              </button>
              <span className="min-w-[14px] text-center text-[0.8rem] font-extrabold tabular-nums">{quantity}</span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded border-none bg-transparent text-white transition-colors hover:bg-white/10 touch-target md:h-9 md:w-9"
                onClick={(e) => void updateQuantity(e, 1)}
                aria-label="Increase quantity"
              >
                <Plus size={13} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
