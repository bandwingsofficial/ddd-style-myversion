"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Minus, ImageOff, Heart, Star, TrendingUp, MapPinOff } from "lucide-react"; 
import { useFavorites } from "@/providers/CustomerAuthProvider";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { ProductListItem } from "@/features/products/types/product.types";
import { useOutletStore } from "@/features/outlet/outlet.store";

const BACKEND_URL = "https://api.dev.local:4000"; 

export default function ProductCard({ product }: { product: ProductListItem }) {
  const [imageError, setImageError] = useState(false);
  const p = product as any;

  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFav = isFavorite(product.id);
  const { items, addItem, updateItem, removeItem } = useCartStore();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  const currentOutlet = useOutletStore((state) => state.selectedOutlet);
  const isOutletSelected = !!currentOutlet; 

  const name = useMemo(() => p.name?.value || p.name || "Unknown", [p]);
  const slug = useMemo(() => p.slug?.value || p.slug || "#", [p]);

  const outletId = useMemo(() => {
    if (currentOutlet?.id) return currentOutlet.id;
    if (p.outletId) return p.outletId;
    return null; 
  }, [p, currentOutlet]);

  const { original, current, hasDiscount, savings } = useMemo(() => {
    const parse = (val: any) => {
      if (val === undefined || val === null) return 0;
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };
    let originalPrice = parse(p.originalPrice ?? p.price?.originalPrice ?? p.price?.value ?? p.price);
    let discountVal = parse(p.discountPrice ?? p.salePrice ?? p.price?.discountPrice ?? p.price?.salePrice);
    let currentPrice = originalPrice;
    let isDiscounted = false;
    if (discountVal > 0 && discountVal < originalPrice) {
      currentPrice = discountVal;
      isDiscounted = true;
    }
    return { original: originalPrice, current: currentPrice, hasDiscount: isDiscounted, savings: originalPrice - currentPrice };
  }, [p]);

  const imageUrl = useMemo(() => {
    if (!p) return null;
    const rawImage = p.images || p.image || p.mainImage || p.thumbnail;
    let path = "";
    if (Array.isArray(rawImage)) path = rawImage[0] || "";
    else if (typeof rawImage === "object" && rawImage !== null) path = rawImage.url || rawImage.mainImage || rawImage.value || "";
    else if (typeof rawImage === "string") path = rawImage;
    if (!path || path.trim() === "") return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BACKEND_URL}${cleanPath}`;
  }, [p]);

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
        alert("Please select a nearby outlet first.");
        return;
    }
    if (original <= 0) { alert("Invalid Price"); return; }
    if (!outletId) return;

    await addItem(
      { 
        productId: p.id,
        outletId: outletId,
        productName: name, 
        productImage: imageUrl || "", 
        quantity: 1, 
        unitPrice: original, 
        discountPrice: current 
      },
      isAuthenticated
    );
  };

  const updateQuantity = async (e: React.MouseEvent, delta: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!cartItem) return;
    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) await removeItem(p.id, isAuthenticated);
    else await updateItem(p.id, newQty, isAuthenticated);
  };

  const isAddDisabled = original <= 0 || !isOutletSelected;

  return (
    <div className="relative h-full">
      <Link 
        href={`/products/${slug}`} 
        className="group flex flex-col h-full bg-white rounded-[14px] border border-slate-100 overflow-hidden no-underline transition-all duration-300 cubic-bezier(0.4,0,0.2,1) hover:border-green-600/20 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1"
      >
        {/* IMAGE CONTAINER */}
        <div className="relative h-[140px] shrink-0 overflow-hidden bg-slate-50 flex items-center justify-center">
          <button 
            onClick={handleToggleFavorite} 
            className="absolute top-1.5 right-1.5 z-20 bg-white border-none rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-transform active:scale-90"
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
            {hasDiscount && <div className="bg-red-500 text-white text-[0.6rem] font-extrabold px-1.5 py-0.5 rounded">SAVE ₹{savings}</div>}
            {isTrending && <div className="bg-amber-500 text-white text-[0.6rem] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5"><TrendingUp size={10} /> Trending</div>}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-2.5 flex flex-col justify-between flex-1 gap-1.5">
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

          {/* BOTTOM ROW */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
            
            {/* PRICE */}
            <div className="flex flex-col justify-center leading-none">
                <span className="text-slate-900 font-extrabold text-base">₹{current}</span>
                {hasDiscount && <span className="text-slate-400 line-through text-[0.75rem] font-medium mt-0.5">₹{original}</span>}
            </div>

            {/* ACTION BUTTON */}
            <div className="flex items-center">
                {quantity === 0 ? (
                <button 
                    disabled={isAddDisabled}
                    onClick={!isAddDisabled ? handleAdd : (e) => e.preventDefault()} 
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-extrabold text-[0.7rem] transition-all border
                        ${isAddDisabled 
                            ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-60' 
                            : 'bg-green-50 text-green-600 border-green-600 hover:bg-green-600 hover:text-white pointer-events-auto'
                        }`}
                >
                    {!isOutletSelected ? (
                        <MapPinOff size={16} strokeWidth={2} />
                    ) : (
                        <><Plus size={16} strokeWidth={3} /><span>ADD</span></>
                    )}
                </button>
                ) : (
                <div className="flex items-center bg-green-600 text-white p-0.5 rounded-md gap-1.5 shadow-[0_4px_10px_rgba(22,163,74,0.25)]">
                    <button 
                        className="bg-transparent border-none text-white w-[22px] h-[22px] flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10 rounded" 
                        onClick={(e) => updateQuantity(e, -1)}
                    >
                        <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="font-extrabold text-[0.85rem] min-w-[12px] text-center">{quantity}</span>
                    <button 
                        className="bg-transparent border-none text-white w-[22px] h-[22px] flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10 rounded" 
                        onClick={(e) => updateQuantity(e, 1)}
                    >
                        <Plus size={14} strokeWidth={3} />
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