"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Minus, ImageOff, Heart, Star, TrendingUp } from "lucide-react"; 
import { useFavorites } from "@/providers/CustomerAuthProvider";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { ProductListItem } from "@/features/products/types/product.types";

// ✅ Import the improved helpers
import { 
  getProductImage, 
  getProductPrice, 
  getProductName, 
  getProductSlug 
} from "@/features/products/utils/product-helpers";

export default function ProductCard({ product }: { product: ProductListItem }) {
  const [imageError, setImageError] = useState(false);
  
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFav = isFavorite(product.id);
  const { items, addItem, updateItem, removeItem } = useCartStore();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  // ==========================================
  // 1. USE HELPERS (Clean & Centralized)
  // ==========================================
  
  const name = getProductName(product);
  const slug = getProductSlug(product);
  
  // Get Price Data
  const { original, current, hasDiscount } = getProductPrice(product);
  const savings = original - current;

  // Get Image URL
  const imageUrl = getProductImage(product);

  // Unit Logic
  let unitLabel = "";
  if (typeof product.unit === "object" && product.unit !== null) {
     unitLabel = `${product.unit.value} ${product.unit.type}`;
  } else if (product.unit) {
     unitLabel = String(product.unit);
  }

  // Meta Data
  const isTrending = product.trendState?.trending || false;
  const ratingAvg = typeof product.rating === "object" ? product.rating.average : (product.rating || 0);
  const description = product.shortDescription || "";
  const tags = product.tags || [];

  // ==========================================
  // 2. CART LOGIC
  // ==========================================
  const cartItem = useMemo(
    () => items.find((i) => i.productId === product.id),
    [items, product.id]
  );
  const quantity = cartItem?.quantity || 0;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isFav ? removeFromFavorites(product.id) : addToFavorites(product);
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(
      { 
        productId: product.id, 
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
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) await removeItem(product.id, isAuthenticated);
    else await updateItem(product.id, newQty, isAuthenticated);
  };

  // ==========================================
  // 3. UI RENDER
  // ==========================================
  return (
    <div style={styles.cardWrapper}>
      <Link href={`/products/${slug}`} style={styles.productCard} className="product-card">
        
        {/* IMAGE AREA */}
        <div style={styles.imageContainer} className="image-container">
          <button onClick={handleToggleFavorite} style={styles.favBtn} className="fav-btn">
            <Heart size={18} fill={isFav ? "#ef4444" : "transparent"} color={isFav ? "#ef4444" : "#94a3b8"} strokeWidth={2.5} />
          </button>

          {/* Use the calculated imageUrl directly */}
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={name} 
              style={styles.productImage} 
              onError={() => setImageError(true)} 
            />
          ) : (
            <div style={styles.imageFallback}>
              <ImageOff size={28} />
              <span>No Image</span>
            </div>
          )}

          <div style={styles.badgeContainer}>
             {hasDiscount && (
               <div style={styles.discountBadge}>SAVE ₹{savings}</div>
             )}
             {isTrending && (
               <div style={styles.trendingBadge}>
                  <TrendingUp size={12} /> Trending
               </div>
             )}
          </div>
        </div>

        {/* DETAILS AREA */}
        <div style={styles.content} className="content">
          <div style={styles.infoGroup}>
            
            {tags.length > 0 && (
              <div style={styles.tagsRow}>
                {tags.slice(0, 2).map((tag: string) => (
                   <span key={tag} style={styles.tagBadge}>
                     {tag.replace(/_/g, ' ')}
                   </span>
                ))}
              </div>
            )}

            <h3 style={styles.productTitle} title={name}>{name}</h3>
            
            {description && (
              <p style={styles.shortDesc} title={description}>{description}</p>
            )}

            <div style={styles.metaRow}>
               {unitLabel && <span style={styles.unitText}>{unitLabel}</span>}
               {ratingAvg > 0 && (
                 <div style={styles.ratingBadge}>
                   <Star size={10} fill="#f59e0b" color="#f59e0b" />
                   <span>{ratingAvg}</span>
                 </div>
               )}
            </div>

            <div style={styles.priceRow}>
              <span style={styles.currentPrice}>₹{current}</span>
              {hasDiscount && (
                <span style={styles.oldPrice}>₹{original}</span>
              )}
            </div>
          </div>

          <div style={styles.actionArea} className="action-area">
            {quantity === 0 ? (
              <button style={styles.addButton} onClick={handleAdd} className="add-button">
                <Plus size={16} strokeWidth={3} />
                <span>ADD</span>
              </button>
            ) : (
              <div style={styles.quantitySelector} className="quantity-selector">
                <button style={styles.qtyBtn} onClick={(e) => updateQuantity(e, -1)}>
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span style={styles.qtyNumber}>{quantity}</span>
                <button style={styles.qtyBtn} onClick={(e) => updateQuantity(e, 1)}>
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
      
      <style jsx>{`
        .product-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .product-card:hover { border-color: #16a34a33 !important; box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08); transform: translateY(-4px); }
        .fav-btn:active { transform: scale(0.9); }
        .add-button:hover { background: #16a34a !important; color: white !important; }
        @media (max-width: 640px) {
          .image-container { height: 150px !important; }
          .content { padding: 10px !important; flex-direction: column !important; align-items: stretch !important; }
          .action-area { margin-top: 8px !important; }
          .add-button, .quantity-selector { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}

// Keep your styles object exactly as it was at the bottom of the file
const styles: { [key: string]: React.CSSProperties } = {
  cardWrapper: { position: "relative" },
  productCard: { display: "block", background: "#ffffff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden", textDecoration: "none" },
  imageContainer: { position: "relative", height: "170px", overflow: "hidden", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" },
  favBtn: { position: "absolute", top: "8px", right: "8px", zIndex: 20, background: "white", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: "transform 0.2s" },
  productImage: { width: "100%", height: "100%", objectFit: "cover" },
  imageFallback: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600 },
  badgeContainer: { position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 10 },
  discountBadge: { background: "#ef4444", color: "white", fontSize: "0.65rem", fontWeight: 800, padding: "3px 6px", borderRadius: "4px" },
  trendingBadge: { background: "#f59e0b", color: "white", fontSize: "0.65rem", fontWeight: 800, padding: "3px 6px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px" },
  content: { padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "8px" },
  infoGroup: { flex: 1, minWidth: 0 },
  tagsRow: { display: "flex", gap: "4px", marginBottom: "6px", flexWrap: "wrap" },
  tagBadge: { fontSize: "0.6rem", background: "#e2e8f0", color: "#475569", padding: "2px 5px", borderRadius: "4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" },
  productTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "1.2" },
  shortDesc: { fontSize: "0.75rem", color: "#64748b", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  metaRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  unitText: { fontSize: "0.75rem", color: "#64748b", fontWeight: 600, background: "#f8fafc", padding: "1px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" },
  ratingBadge: { display: "flex", alignItems: "center", gap: "2px", fontSize: "0.7rem", fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "1px 4px", borderRadius: "4px" },
  priceRow: { display: "flex", alignItems: "center", gap: "8px" },
  currentPrice: { color: "#0f172a", fontWeight: 800, fontSize: "1.1rem" },
  oldPrice: { color: "#94a3b8", textDecoration: "line-through", fontSize: "0.85rem", fontWeight: 500 },
  actionArea: { display: "flex", justifyContent: "flex-end" },
  addButton: { display: "flex", alignItems: "center", gap: "4px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #16a34a", padding: "6px 12px", borderRadius: "8px", fontWeight: 800, fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" },
  quantitySelector: { display: "flex", alignItems: "center", background: "#16a34a", color: "white", padding: "3px", borderRadius: "8px", gap: "8px", boxShadow: "0 4px 10px rgba(22, 163, 74, 0.25)" },
  qtyBtn: { background: "transparent", border: "none", color: "white", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: "6px" },
  qtyNumber: { fontWeight: 800, fontSize: "0.9rem", minWidth: "12px", textAlign: "center" },
};