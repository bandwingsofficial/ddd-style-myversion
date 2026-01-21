"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductListItem } from "@/features/products/types/product.types";
import { Plus, Minus, ImageOff, Heart } from "lucide-react";
import { useFavorites } from "@/providers/CustomerAuthProvider"; 

// --- HELPERS ---
const resolveString = (data: any): string => {
  if (!data) return "Unknown Product";
  if (typeof data === "string") return data;
  if (typeof data === "object" && data.value) return String(data.value);
  return String(data);
};

// Updated to match your JSON price structure
const resolvePrice = (product: ProductListItem) => {
  const p = product.price;
  
  // Default values
  let current = 0;
  let original = 0;

  if (p && typeof p === "object") {
    // If discountPrice exists and is different from original
    if (p.discountPrice && p.discountPrice < p.originalPrice) {
      current = p.discountPrice;
      original = p.originalPrice;
    } else {
      current = p.originalPrice;
      original = p.originalPrice;
    }
  }

  return { current: Number(current) || 0, original: Number(original) || 0 };
};

export default function ProductCard({ product }: { product: ProductListItem }) {
  const [quantity, setQuantity] = useState(0);
  const [imageError, setImageError] = useState(false);

  // --- CONNECT FAVORITES ---
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFav = isFavorite(product.id);

  // --- DATA RESOLUTION ---
  const name = resolveString(product.name);
  const slug = resolveString(product.slug);
  const { current: price, original: originalPrice } = resolvePrice(product);
  const hasDiscount = originalPrice > price;
  
  const BACKEND_URL = "http://localhost:5000";

  // Updated to access product.images.mainImage based on your JSON
  const getImageUrl = (path?: string) => {
    if (!path || path.trim() === "") return null;
    return path.startsWith("http")
      ? path
      : `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const imageUrl = getImageUrl(product.images?.mainImage);

  // --- HANDLERS ---
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(1);
  };

  const updateQuantity = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(0, prev + delta));
  };

  return (
    <div style={styles.cardWrapper}>
      <Link href={`/products/${slug}`} style={styles.productCard} className="product-card">
        
        <div style={styles.imageContainer}>
          {/* --- FAVORITE BUTTON --- */}
          <button 
            onClick={handleToggleFavorite}
            style={styles.favBtn}
            className="fav-btn"
          >
            <Heart 
              size={20} 
              fill={isFav ? "#ef4444" : "transparent"} 
              color={isFav ? "#ef4444" : "#94a3b8"}
              strokeWidth={2.5}
            />
          </button>

          {imageUrl && !imageError ? (
            <img src={imageUrl} alt={name} style={styles.productImage} onError={() => setImageError(true)} />
          ) : (
            <div style={styles.imageFallback}>
              <ImageOff size={32} />
              <span>Image not found</span>
            </div>
          )}

          {hasDiscount && (
            <div style={styles.discountBadge}>SAVE ₹{originalPrice - price}</div>
          )}
        </div>

        <div style={styles.content}>
          <div style={styles.infoGroup}>
            <h3 style={styles.productTitle}>{name}</h3>
            <div style={styles.priceRow}>
              <span style={styles.currentPrice}>₹{price}</span>
              {hasDiscount && <span style={styles.oldPrice}>₹{originalPrice}</span>}
            </div>
          </div>

          <div style={styles.actionArea}>
            {quantity === 0 ? (
              <button style={styles.addButton} onClick={handleAdd} className="add-button">
                <Plus size={18} strokeWidth={3} />
                <span>ADD</span>
              </button>
            ) : (
              <div style={styles.quantitySelector}>
                <button style={styles.qtyBtn} onClick={(e) => updateQuantity(e, -1)}>
                  <Minus size={16} strokeWidth={3} />
                </button>
                <span style={styles.qtyNumber}>{quantity}</span>
                <button style={styles.qtyBtn} onClick={(e) => updateQuantity(e, 1)}>
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>

      <style jsx>{`
        .product-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .product-card:hover { 
          border-color: #16a34a33 !important; 
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08); 
          transform: translateY(-4px); 
        }
        .fav-btn:active { transform: scale(0.9); }
        .add-button:hover { background: #16a34a !important; color: white !important; }
        @media (max-width: 640px) {
          .product-card .image-container { height: 160px !important; }
          .product-card .content { padding: 12px !important; flex-direction: column !important; align-items: stretch !important; }
          .product-card .action-area { margin-top: 8px !important; }
          .add-button, .quantity-selector { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  cardWrapper: { position: "relative" },
  productCard: { display: "block", background: "#ffffff", borderRadius: "20px", border: "1px solid #f1f5f9", overflow: "hidden", textDecoration: "none" },
  imageContainer: { position: "relative", height: "220px", overflow: "hidden", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" },
  favBtn: { position: "absolute", top: "12px", right: "12px", zIndex: 20, background: "white", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: "transform 0.2s" },
  productImage: { width: "100%", height: "100%", objectFit: "cover" },
  imageFallback: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600 },
  discountBadge: { position: "absolute", top: "12px", left: "12px", background: "#ef4444", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", zIndex: 10 },
  content: { padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "12px" },
  infoGroup: { flex: 1, minWidth: 0 },
  productTitle: { fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  priceRow: { display: "flex", alignItems: "center", gap: "6px" },
  currentPrice: { color: "#0f172a", fontWeight: 800, fontSize: "1.1rem" },
  oldPrice: { color: "#94a3b8", textDecoration: "line-through", fontSize: "0.85rem", fontWeight: 500 },
  actionArea: { display: "flex", justifyContent: "flex-end" },
  addButton: { display: "flex", alignItems: "center", gap: "6px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #16a34a", padding: "6px 14px", borderRadius: "10px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" },
  quantitySelector: { display: "flex", alignItems: "center", background: "#16a34a", color: "white", padding: "4px", borderRadius: "10px", gap: "12px", boxShadow: "0 4px 10px rgba(22, 163, 74, 0.25)" },
  qtyBtn: { background: "transparent", border: "none", color: "white", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: "6px" },
  qtyNumber: { fontWeight: 800, fontSize: "0.95rem", minWidth: "12px", textAlign: "center" },
};