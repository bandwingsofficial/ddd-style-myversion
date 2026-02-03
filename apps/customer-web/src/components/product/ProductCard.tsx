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

  // 1. Get Selected Outlet from Store
  const currentOutlet = useOutletStore((state) => state.selectedOutlet);
  const isOutletSelected = !!currentOutlet; 

  // 2. Data Normalization
  const name = useMemo(() => p.name?.value || p.name || "Unknown", [p]);
  const slug = useMemo(() => p.slug?.value || p.slug || "#", [p]);

  // 3. Outlet ID Logic
  const outletId = useMemo(() => {
    if (currentOutlet?.id) return currentOutlet.id;
    if (p.outletId) return p.outletId;
    return null; 
  }, [p, currentOutlet]);

  // 4. Price Logic
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

  // 5. Image Logic
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

  // 6. Meta Data
  const unitLabel = useMemo(() => {
    if (typeof p.unit === "object" && p.unit !== null) return `${p.unit.value} ${p.unit.type}`;
    else if (p.unit) return String(p.unit);
    return "";
  }, [p.unit]);
  
  const isTrending = p.trendState?.trending || false;
  const ratingAvg = typeof p.rating === "object" ? p.rating.average : (p.rating || 0);
  const description = p.shortDescription || "";
  const tags = p.tags || [];

  // 7. Cart Logic
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
    
    if (!outletId) {
       console.error("❌ No Outlet ID found");
       return;
    }

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

  // ✅ STRICT DISABLE LOGIC: Disable if price is invalid OR No Outlet is selected
  const isAddDisabled = original <= 0 || !isOutletSelected;

  return (
    <div style={styles.cardWrapper}>
      <Link href={`/products/${slug}`} style={styles.productCard} className="product-card">
        {/* IMAGE - Reduced height to 140px in styles */}
        <div style={styles.imageContainer} className="image-container">
          <button onClick={handleToggleFavorite} style={styles.favBtn} className="fav-btn">
            <Heart size={16} fill={isFav ? "#ef4444" : "transparent"} color={isFav ? "#ef4444" : "#94a3b8"} strokeWidth={2.5} />
          </button>
          {imageUrl && !imageError ? (
            <img src={imageUrl} alt={name} style={styles.productImage} onError={() => setImageError(true)} />
          ) : (
            <div style={styles.imageFallback}><ImageOff size={24} /><span>No Image</span></div>
          )}
          <div style={styles.badgeContainer}>
            {hasDiscount && <div style={styles.discountBadge}>SAVE ₹{savings}</div>}
            {isTrending && <div style={styles.trendingBadge}><TrendingUp size={10} /> Trending</div>}
          </div>
        </div>

        {/* CONTENT */}
        <div style={styles.content} className="content">
          <div style={styles.infoGroup}>
            {tags.length > 0 && (
              <div style={styles.tagsRow}>
                {tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} style={styles.tagBadge}>{tag.replace(/_/g, ' ')}</span>
                ))}
              </div>
            )}
            
            {/* Title */}
            <h3 style={styles.productTitle} className="line-clamp-title" title={name}>{name}</h3>
            
            {/* Description - Optional, kept for structure but styling handles space */}
            {description ? (
                <p style={styles.shortDesc} className="line-clamp-desc" title={description}>{description}</p>
            ) : (
                <div style={{ height: '1.2em', marginBottom: '4px' }}></div> 
            )}

            <div style={styles.metaRow}>
              {unitLabel && <span style={styles.unitText}>{unitLabel}</span>}
              {ratingAvg > 0 && (
                <div style={styles.ratingBadge}><Star size={10} fill="#f59e0b" color="#f59e0b" /><span>{ratingAvg}</span></div>
              )}
            </div>
          </div>

          {/* BOTTOM ROW: Price Left, Button Right */}
          <div style={styles.bottomRow}>
            
            {/* PRICE */}
            <div style={styles.priceColumn}>
                <span style={styles.currentPrice}>₹{current}</span>
                {hasDiscount && <span style={styles.oldPrice}>₹{original}</span>}
            </div>

            {/* ACTION BUTTON */}
            <div style={styles.actionContainer}>
                {quantity === 0 ? (
                <button 
                    style={{
                    ...styles.addButton,
                    opacity: isAddDisabled ? 0.6 : 1,
                    cursor: isAddDisabled ? 'not-allowed' : 'pointer',
                    background: isAddDisabled ? '#f1f5f9' : '#f0fdf4',
                    borderColor: isAddDisabled ? '#cbd5e1' : '#16a34a',
                    color: isAddDisabled ? '#94a3b8' : '#16a34a'
                    }} 
                    onClick={!isAddDisabled ? handleAdd : (e) => e.preventDefault()} 
                    className="add-button"
                    disabled={isAddDisabled}
                >
                    {!isOutletSelected ? (
                        <MapPinOff size={16} strokeWidth={2} />
                    ) : (
                        <><Plus size={16} strokeWidth={3} /><span>ADD</span></>
                    )}
                </button>
                ) : (
                <div style={styles.quantitySelector} className="quantity-selector">
                    <button style={styles.qtyBtn} onClick={(e) => updateQuantity(e, -1)}><Minus size={14} strokeWidth={3} /></button>
                    <span style={styles.qtyNumber}>{quantity}</span>
                    <button style={styles.qtyBtn} onClick={(e) => updateQuantity(e, 1)}><Plus size={14} strokeWidth={3} /></button>
                </div>
                )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* STYLES */}
      <style jsx>{`
        .product-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .product-card:hover { border-color: #16a34a33 !important; box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08); transform: translateY(-4px); }
        .fav-btn:active { transform: scale(0.9); }
        .add-button:hover { 
            background: ${isAddDisabled ? '#f1f5f9' : '#16a34a'} !important; 
            color: ${isAddDisabled ? '#94a3b8' : 'white'} !important; 
        }
        
        /* Truncation Logic */
        .line-clamp-title {
            display: -webkit-box;
            -webkit-line-clamp: 1; /* Reduced to 1 line to save height */
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .line-clamp-desc {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        @media (max-width: 640px) {
          .image-container { height: 140px !important; }
          .content { padding: 10px !important; flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  cardWrapper: { position: "relative", height: "100%" },
  productCard: { 
    display: "flex", 
    flexDirection: "column",
    height: "100%", 
    background: "#ffffff", 
    borderRadius: "14px", // Slightly reduced radius
    border: "1px solid #f1f5f9", 
    overflow: "hidden", 
    textDecoration: "none" 
  },
  // REDUCED HEIGHT HERE
  imageContainer: { 
    position: "relative", 
    height: "140px", // Reduced from 170px
    flexShrink: 0, 
    overflow: "hidden", 
    background: "#f8fafc", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  favBtn: { position: "absolute", top: "6px", right: "6px", zIndex: 20, background: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.08)", transition: "transform 0.2s" },
  productImage: { width: "100%", height: "100%", objectFit: "cover" },
  imageFallback: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600 },
  badgeContainer: { position: "absolute", top: "6px", left: "6px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 10 },
  discountBadge: { background: "#ef4444", color: "white", fontSize: "0.6rem", fontWeight: 800, padding: "2px 5px", borderRadius: "4px" },
  trendingBadge: { background: "#f59e0b", color: "white", fontSize: "0.6rem", fontWeight: 800, padding: "2px 5px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px" },
  
  content: { 
    padding: "10px", // Reduced padding
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "space-between", 
    flex: 1, 
    gap: "6px" 
  },
  infoGroup: { 
    flex: 1, 
    minWidth: 0 
  },
  tagsRow: { display: "flex", gap: "4px", marginBottom: "4px", flexWrap: "wrap" },
  tagBadge: { fontSize: "0.55rem", background: "#e2e8f0", color: "#475569", padding: "1px 4px", borderRadius: "3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" },
  
  productTitle: { 
    fontSize: "0.9rem", 
    fontWeight: 700, 
    color: "#1e293b", 
    marginBottom: "2px", 
    lineHeight: "1.2" 
  },
  shortDesc: { 
    fontSize: "0.7rem", 
    color: "#64748b", 
    marginBottom: "4px", 
  },
  metaRow: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" },
  unitText: { fontSize: "0.7rem", color: "#64748b", fontWeight: 600, background: "#f8fafc", padding: "1px 5px", borderRadius: "4px", border: "1px solid #e2e8f0" },
  ratingBadge: { display: "flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "1px 3px", borderRadius: "4px" },
  
  // NEW BOTTOM ROW STYLES
  bottomRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Pushes Price left and Button right
    marginTop: "auto",
    borderTop: "1px solid #f1f5f9", // Optional: subtle separation
    paddingTop: "8px"
  },
  priceColumn: {
    display: "flex",
    flexDirection: "column", // Stack Current and Old price vertically
    justifyContent: "center",
    lineHeight: 1
  },
  currentPrice: { color: "#0f172a", fontWeight: 800, fontSize: "1rem" },
  oldPrice: { color: "#94a3b8", textDecoration: "line-through", fontSize: "0.75rem", fontWeight: 500, marginTop: "2px" },
  
  actionContainer: { display: "flex", alignItems: "center" },
  addButton: { display: "flex", alignItems: "center", gap: "4px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #16a34a", padding: "5px 10px", borderRadius: "6px", fontWeight: 800, fontSize: "0.7rem", cursor: "pointer", transition: "all 0.2s" },
  quantitySelector: { display: "flex", alignItems: "center", background: "#16a34a", color: "white", padding: "2px", borderRadius: "6px", gap: "6px", boxShadow: "0 4px 10px rgba(22, 163, 74, 0.25)" },
  qtyBtn: { background: "transparent", border: "none", color: "white", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: "4px" },
  qtyNumber: { fontWeight: 800, fontSize: "0.85rem", minWidth: "12px", textAlign: "center" },
};