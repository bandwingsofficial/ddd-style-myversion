"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Minus, ImageOff, Heart, Star, TrendingUp, MapPinOff } from "lucide-react";
import { useFavorites } from "@/providers/CustomerAuthProvider";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
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
  const { isReady } = useCustomerSession();

  const currentOutlet = useOutletStore((state) => state.selectedOutlet);
  const isOutletSelected = !!currentOutlet;

  const name = useMemo(() => p.name?.value || p.name || "Unknown", [p]);
  const slug = useMemo(() => p.slug?.value || p.slug || "#", [p]);

  const outletId = useMemo(() => {
    if (currentOutlet?.id) return currentOutlet.id;
    if (p.outletId) return p.outletId;
    return null;
  }, [p, currentOutlet]);

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

  const cartItem = useMemo(() => items.find((i) => i.productId === p.id), [items, p.id]);
  const quantity = cartItem?.quantity || 0;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    isFav ? removeFromFavorites(p.id) : addToFavorites(p);
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isOutletSelected) {
      toast.error("Please select a nearby outlet first.");
      return;
    }
    if (mrp <= 0) { toast.error("Invalid price for this product."); return; }
    if (!outletId) return;

    if (!isReady) {
      toast.error("Please wait, session is loading...");
      return;
    }
    if (!outletId) return;

    await addItem({
      productId: p.id,
      outletId: outletId,
      productName: name,
      productImage: imageUrl || "",
      quantity: 1,
      unitPrice: mrp,
      discountPrice: sellingPrice,
    });
  };

  const updateQuantity = async (e: React.MouseEvent, delta: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!cartItem || !isReady) return;
    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) await removeItem(p.id);
    else await updateItem(p.id, newQty);
  };

  const isAddDisabled = mrp <= 0 || !isOutletSelected;

  return (
    <div className="relative h-full">
      <Link
        href={`/products/${slug}`}
        className="group flex flex-col h-full bg-white rounded-[14px] border border-slate-100 overflow-hidden no-underline transition-all duration-300 cubic-bezier(0.4,0,0.2,1) hover:border-green-600/20 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1"
      >
        <div className="relative h-[140px] shrink-0 overflow-hidden bg-slate-50 flex items-center justify-center">
          <button
            onClick={handleToggleFavorite}
            className="absolute top-1.5 right-1.5 z-20 bg-white border-none rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-transform active:scale-90 touch-target"
            aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={isFav ? "#ef4444" : "transparent"} color={isFav ? "#ef4444" : "#94a3b8"} strokeWidth={2.5} />
          </button>

          {imageUrl && !imageError ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImageError(true)} />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-slate-400 text-[0.7rem] font-semibold">
              <ImageOff size={24} />
              <span>No Image</span>
            </div>
          )}

          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
            {isTrending && (
              <div className="bg-amber-500 text-white text-[0.6rem] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp size={10} /> Trending
              </div>
            )}
          </div>
        </div>

        <div className="p-2.5 flex flex-col justify-between flex-1 gap-1.5 min-w-0">
          <div className="flex-1 min-w-0">
            {tags.length > 0 && (
              <div className="flex gap-1 mb-1 flex-wrap">
                {tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="text-[0.55rem] bg-slate-200 text-slate-600 px-1 py-0.5 rounded font-bold uppercase tracking-wider">{tag.replace(/_/g, ' ')}</span>
                ))}
              </div>
            )}

            <h3 className="text-[0.9rem] font-bold text-slate-800 mb-0.5 leading-[1.2] line-clamp-1" title={name}>{name}</h3>

            {description ? (
              <p className="text-[0.7rem] text-slate-500 mb-1 line-clamp-1" title={description}>{description}</p>
            ) : (
              <div className="h-[1.2em] mb-1"></div>
            )}

            <div className="flex items-center gap-1.5 mb-1.5">
              {unitLabel && <span className="text-[0.7rem] text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{unitLabel}</span>}
              {ratingAvg > 0 && (
                <div className="flex items-center gap-0.5 text-[0.65rem] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded">
                  <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  <span>{ratingAvg}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-50 min-w-0">
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
                  disabled={isAddDisabled}
                  onClick={!isAddDisabled ? handleAdd : (e) => e.preventDefault()}
                  className={`flex h-9 min-w-[2.75rem] items-center justify-center gap-0.5 rounded-md px-2 font-extrabold text-[0.65rem] transition-all border touch-target
                        ${isAddDisabled
                      ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                      : 'bg-green-50 text-green-600 border-green-600 hover:bg-green-600 hover:text-white pointer-events-auto active:scale-95'
                    }`}
                  aria-label="Add to cart"
                >
                  {!isOutletSelected ? (
                    <MapPinOff size={14} strokeWidth={2} />
                  ) : (
                    <><Plus size={14} strokeWidth={3} /><span>ADD</span></>
                  )}
                </button>
              ) : (
                <div className="flex h-9 md:h-10 items-center gap-0.5 rounded-md bg-green-600 p-0.5 text-white shadow-[0_2px_6px_rgba(22,163,74,0.2)]">
                  <button
                    className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded border-none bg-transparent text-white transition-colors hover:bg-white/10 touch-target"
                    onClick={(e) => updateQuantity(e, -1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} strokeWidth={3} />
                  </button>
                  <span className="min-w-[14px] text-center text-[0.8rem] font-extrabold tabular-nums">{quantity}</span>
                  <button
                    className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded border-none bg-transparent text-white transition-colors hover:bg-white/10 touch-target"
                    onClick={(e) => updateQuantity(e, 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
