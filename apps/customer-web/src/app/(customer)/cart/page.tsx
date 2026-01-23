"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

// --- HELPER: Image URL Logic ---
const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path || path.trim() === "") return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

export default function CartPage() {
  const router = useRouter();
  
  // --- STORE HOOKS ---
  const { items, updateItem, removeItem } = useCartStore();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  
  // Local loading state to prevent spam-clicking
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // --- CALCULATIONS ---
  const { subtotal, totalDiscount, grandTotal } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const price = item.discountPrice || item.unitPrice;
        const lineTotal = price * item.quantity;
        const originalLineTotal = item.unitPrice * item.quantity;
        
        acc.subtotal += originalLineTotal;
        acc.grandTotal += lineTotal;
        acc.totalDiscount += (originalLineTotal - lineTotal);
        return acc;
      },
      { subtotal: 0, totalDiscount: 0, grandTotal: 0 }
    );
  }, [items]);

  // --- HANDLERS ---
  const handleQuantityChange = async (productId: string, currentQty: number, delta: number) => {
    if (isUpdating) return;
    const newQty = currentQty + delta;
    setIsUpdating(productId);
    try {
      if (newQty <= 0) {
        await removeItem(productId, isAuthenticated);
      } else {
        await updateItem(productId, newQty, isAuthenticated);
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setIsUpdating(productId);
    await removeItem(productId, isAuthenticated);
    setIsUpdating(null);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push("/cart/checkout");
    } else {
      router.push("/login?redirect=/cart/checkout");
    }
  };

  return (
    <div className="cart-page">
      <Header />
      
      <main className="main-content">
        <section className="container">
          <header className="page-header">
            <h1 className="title">Your Cart ({items.length})</h1>
          </header>

          {/* --- EMPTY STATE --- */}
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <ShoppingBag size={48} color="#cbd5e1" />
              </div>
              <p>Your cart is currently empty.</p>
              <Link href="/menu" className="start-shopping-btn">
                <ArrowLeft size={18} />
                Browse Menu
              </Link>
            </div>
          ) : (
            /* --- CART GRID LAYOUT --- */
            <div className="cart-layout">
              
              {/* LEFT COLUMN: ITEMS */}
              <div className="cart-items">
                {items.map((item) => {
                  const imageUrl = getImageUrl(item.productImage);
                  const isDiscounted = item.discountPrice < item.unitPrice;
                  
                  return (
                    <div key={item.productId} className="cart-item-card">
                      {/* Image */}
                      <div className="image-wrapper">
                         {imageUrl ? (
                           <img src={imageUrl} alt={item.productName} />
                         ) : (
                           <ShoppingBag className="text-gray-300" />
                         )}
                      </div>

                      {/* Details */}
                      <div className="item-details">
                        <div className="item-header">
                           <h3>{item.productName}</h3>
                           <button onClick={() => handleRemove(item.productId)} className="remove-btn">
                             <Trash2 size={18} />
                           </button>
                        </div>
                        
                        <div className="price-info">
                          Price: ₹{item.discountPrice}
                        </div>

                        <div className="item-actions">
                           {/* Quantity Control */}
                           <div className="qty-selector">
                              <button 
                                disabled={isUpdating === item.productId}
                                onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span>{isUpdating === item.productId ? "..." : item.quantity}</span>
                              <button 
                                disabled={isUpdating === item.productId}
                                onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                              >
                                <Plus size={14} strokeWidth={3} />
                              </button>
                           </div>

                           {/* Line Total */}
                           <div className="line-total">
                              {isDiscounted && <span className="old-total">₹{item.unitPrice * item.quantity}</span>}
                              <span className="current-total">₹{item.discountPrice * item.quantity}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: SUMMARY */}
              <div className="cart-summary-wrapper">
                <div className="cart-summary">
                   <h2>Order Summary</h2>
                   
                   <div className="summary-row">
                     <span>Subtotal</span>
                     <span>₹{subtotal}</span>
                   </div>
                   
                   {totalDiscount > 0 && (
                     <div className="summary-row savings">
                       <span>Savings</span>
                       <span>- ₹{totalDiscount}</span>
                     </div>
                   )}
                   
                   <div className="divider"></div>
                   
                   <div className="summary-row total">
                     <span>Total</span>
                     <span>₹{grandTotal}</span>
                   </div>

                   <button onClick={handleCheckout} className="checkout-btn">
                     Checkout
                     <ArrowRight size={20} />
                   </button>
                   
                   <p className="disclaimer">Shipping & taxes calculated at checkout</p>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .cart-page { 
          background: #ffffff; 
          min-height: 100vh; 
          display: flex;
          flex-direction: column;
        }
        
        .main-content { 
          padding-top: 110px; 
          padding-bottom: 60px; 
          flex: 1;
        }
        
        .container { 
          max-width: 1200px; /* Slightly narrower than menu for better reading focus */
          margin: 0 auto; 
          padding: 0 1.5rem; 
        }

        .page-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1rem;
        }

        .title {
          font-size: 2rem;
          font-weight: 800;
          color: #052e16;
        }

        /* --- CART LAYOUT (Grid) --- */
        .cart-layout {
          display: grid;
          grid-template-columns: 2fr 1fr; /* 2 parts items, 1 part summary */
          gap: 2.5rem;
          align-items: start;
        }

        /* --- LEFT: ITEMS LIST --- */
        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cart-item-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          background: #fff;
          transition: box-shadow 0.2s;
        }
        .cart-item-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .image-wrapper {
          width: 100px;
          height: 100px;
          background: #f8fafc;
          border-radius: 0.75rem;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .item-header h3 {
          font-weight: 700;
          color: #1e293b;
          font-size: 1.1rem;
          margin: 0;
        }
        
        .remove-btn {
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .remove-btn:hover { color: #ef4444; }

        .price-info { color: #64748b; font-size: 0.9rem; margin-top: 0.25rem;}

        .item-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 1rem;
        }

        .qty-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f0fdf4;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid rgba(22, 163, 74, 0.2);
        }
        .qty-selector button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qty-selector button:first-child { background: #fff; color: #16a34a; }
        .qty-selector button:last-child { background: #16a34a; color: #fff; }
        .qty-selector button:disabled { opacity: 0.5; cursor: not-allowed; }
        .qty-selector span { font-weight: 700; color: #1e293b; min-width: 20px; text-align: center; font-size: 0.9rem; }

        .line-total { text-align: right; }
        .old-total { display: block; text-decoration: line-through; color: #cbd5e1; font-size: 0.8rem; }
        .current-total { font-weight: 800; color: #0f172a; font-size: 1.1rem; }

        /* --- RIGHT: SUMMARY STICKY --- */
        .cart-summary-wrapper {
          position: sticky;
          top: 130px; /* Offset for fixed header */
        }
        .cart-summary {
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          background: #fff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .cart-summary h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem; color: #0f172a; }
        
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #475569; }
        .summary-row.savings { color: #16a34a; font-weight: 600; }
        .summary-row.total { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-top: 1rem; }
        
        .divider { height: 1px; background: #f1f5f9; margin: 1rem 0; }
        
        .checkout-btn {
          width: 100%;
          background: #0f172a;
          color: white;
          padding: 1rem;
          border-radius: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          margin-top: 1.5rem;
          transition: background 0.2s;
        }
        .checkout-btn:hover { background: #1e293b; }
        
        .disclaimer { font-size: 0.75rem; color: #94a3b8; text-align: center; margin-top: 1rem; }

        /* --- EMPTY STATE --- */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          color: #64748b;
        }
        .empty-icon-wrapper {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        .empty-state p { font-size: 1.25rem; margin-bottom: 2rem; font-weight: 500; }
        .start-shopping-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #16a34a;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s;
        }
        .start-shopping-btn:hover { background: #15803d; }

        /* --- RESPONSIVE --- */
        @media (max-width: 992px) {
          .cart-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .cart-summary-wrapper { position: static; }
        }

        @media (max-width: 640px) {
          .main-content { padding-top: 90px; }
          .title { font-size: 1.5rem; }
          .container { padding: 0 1rem; }
          
          .cart-item-card {
            flex-direction: column;
            gap: 1rem;
          }
          .image-wrapper { width: 100%; height: 160px; }
          .item-actions { margin-top: 1.25rem; }
        }
      `}</style>
    </div>
  );
}