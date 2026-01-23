"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProductListItem } from "@/features/products/types/product.types";
import { Plus, Minus, ImageOff, Heart } from "lucide-react";
import { useFavorites } from "@/providers/CustomerAuthProvider";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

// Helper to construct image URL matching your backend
const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path || path.trim() === "") return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

export default function ProductCard({ product }: { product: ProductListItem }) {
  const [imageError, setImageError] = useState(false);

  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFav = isFavorite(product.id);

  // ---- CART + AUTH ----
  const { items, addItem, updateItem, removeItem } = useCartStore();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  // Safe Accessors
  const name = product.name?.value || "Unknown Product";
  const slug = product.slug?.value || "#";
  const unit = product.unit ? `${product.unit.value} ${product.unit.type}` : null;

  // Price Logic
  const originalPrice = product.price?.originalPrice || 0;
  const discountPrice = product.price?.discountPrice;
  const hasDiscount = discountPrice !== undefined && discountPrice < originalPrice;
  const currentPrice = hasDiscount ? discountPrice : originalPrice;

  const imageUrl = getImageUrl(product.images?.mainImage);

  // ---- DERIVED QUANTITY FROM CART ----
  const cartItem = useMemo(
    () => items.find((i) => i.productId === product.id),
    [items, product.id]
  );

  const quantity = cartItem?.quantity || 0;

  // --- HANDLERS ---
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
        productImage: product.images?.mainImage,
        quantity: 1,
        unitPrice: originalPrice,
        discountPrice: currentPrice,
      },
      isAuthenticated
    );
  };

  const updateQuantity = async (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    const newQty = cartItem.quantity + delta;

    if (newQty <= 0) {
      await removeItem(product.id, isAuthenticated);
    } else {
      await updateItem(product.id, newQty, isAuthenticated);
    }
  };

  return (
    <div style={styles.cardWrapper}>
      <Link
        href={`/products/${slug}`}
        style={styles.productCard}
        className="product-card"
      >
        <div style={styles.imageContainer} className="image-container">
          <button
            onClick={handleToggleFavorite}
            style={styles.favBtn}
            className="fav-btn"
          >
            <Heart
              size={18}
              fill={isFav ? "#ef4444" : "transparent"}
              color={isFav ? "#ef4444" : "#94a3b8"}
              strokeWidth={2.5}
            />
          </button>

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

          {hasDiscount && (
            <div style={styles.discountBadge}>
              SAVE ₹{originalPrice - currentPrice}
            </div>
          )}
        </div>

        <div style={styles.content} className="content">
          <div style={styles.infoGroup}>
            <h3 style={styles.productTitle}>{name}</h3>
            {unit && <div style={styles.unitText}>{unit}</div>}

            <div style={styles.priceRow}>
              <span style={styles.currentPrice}>₹{currentPrice}</span>
              {hasDiscount && (
                <span style={styles.oldPrice}>₹{originalPrice}</span>
              )}
            </div>
          </div>

          <div style={styles.actionArea} className="action-area">
            {quantity === 0 ? (
              <button
                style={styles.addButton}
                onClick={handleAdd}
                className="add-button"
              >
                <Plus size={16} strokeWidth={3} />
                <span>ADD</span>
              </button>
            ) : (
              <div
                style={styles.quantitySelector}
                className="quantity-selector"
              >
                <button
                  style={styles.qtyBtn}
                  onClick={(e) => updateQuantity(e, -1)}
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span style={styles.qtyNumber}>{quantity}</span>
                <button
                  style={styles.qtyBtn}
                  onClick={(e) => updateQuantity(e, 1)}
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>

      <style jsx>{`
        .product-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-card:hover {
          border-color: #16a34a33 !important;
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }
        .fav-btn:active {
          transform: scale(0.9);
        }
        .add-button:hover {
          background: #16a34a !important;
          color: white !important;
        }
        @media (max-width: 640px) {
          .image-container {
            height: 150px !important;
          }
          .content {
            padding: 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .action-area {
            margin-top: 8px !important;
          }
          .add-button,
          .quantity-selector {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}

/* -------- STYLES (UNCHANGED) -------- */

const styles: { [key: string]: React.CSSProperties } = {
  cardWrapper: { position: "relative" },
  productCard: {
    display: "block",
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    textDecoration: "none",
  },
  imageContainer: {
    position: "relative",
    height: "170px",
    overflow: "hidden",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  favBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    zIndex: 20,
    background: "white",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.2s",
  },
  productImage: { width: "100%", height: "100%", objectFit: "cover" },
  imageFallback: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    color: "#94a3b8",
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  discountBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "#ef4444",
    color: "white",
    fontSize: "0.65rem",
    fontWeight: 800,
    padding: "3px 6px",
    borderRadius: "4px",
    zIndex: 10,
  },
  content: {
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "8px",
  },
  infoGroup: { flex: 1, minWidth: 0 },
  productTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  unitText: {
    fontSize: "0.75rem",
    color: "#64748b",
    fontWeight: 600,
    marginBottom: "2px",
  },
  priceRow: { display: "flex", alignItems: "center", gap: "6px" },
  currentPrice: {
    color: "#0f172a",
    fontWeight: 800,
    fontSize: "1rem",
  },
  oldPrice: {
    color: "#94a3b8",
    textDecoration: "line-through",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
  actionArea: { display: "flex", justifyContent: "flex-end" },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #16a34a",
    padding: "5px 10px",
    borderRadius: "8px",
    fontWeight: 800,
    fontSize: "0.75rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  quantitySelector: {
    display: "flex",
    alignItems: "center",
    background: "#16a34a",
    color: "white",
    padding: "3px",
    borderRadius: "8px",
    gap: "8px",
    boxShadow: "0 4px 10px rgba(22, 163, 74, 0.25)",
  },
  qtyBtn: {
    background: "transparent",
    border: "none",
    color: "white",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "6px",
  },
  qtyNumber: {
    fontWeight: 800,
    fontSize: "0.85rem",
    minWidth: "10px",
    textAlign: "center",
  },
};
