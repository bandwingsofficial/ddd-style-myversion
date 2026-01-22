"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Product } from "../types/product.types";
import { ProductsAPI } from "../services/products.api";
// 1. Import APIs for fetching names
import { StockItemsAPI } from "@/features/stock-items/stockItems.api"; 
import { CategoriesApi } from "@/features/categories/api/categories.api"; 

import { Edit3, TrendingUp, Power, PowerOff, CheckCircle2, XCircle, ImageOff, Layers, Loader2, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Ensure this matches your actual backend URL exactly
const API_BASE_URL = "https://api.dev.local:4000";

interface ProductRowProps {
  index: number;
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  onAction: () => void;
  onEdit: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductRow({ index, product, isSelected, onSelect, onAction, onEdit, onViewDetails }: ProductRowProps) {
  const [isPending, setIsPending] = useState(false);
  const [popup, setPopup] = useState<{ title: string; text: string; type: 'success' | 'error' } | null>(null);
  const [imgError, setImgError] = useState(false);

  // --- STATE FOR FETCHED NAMES ---
  const [stockItemName, setStockItemName] = useState<string>("--");
  const [categoryName, setCategoryName] = useState<string>("--"); // NEW: State for Category Name
  const [loadingStock, setLoadingStock] = useState(false);
  
  const isActive = product.status === "ACTIVE";
  const isTrending = product.trendState?.trending || false;

  // --- 1. FETCH LINKED STOCK ITEM NAME ---
  useEffect(() => {
    const fetchLinkedStockItem = async () => {
      const linkedId = (product as any).stockItemId || product.stockItemId;

      if (!linkedId) {
        setStockItemName("--");
        return;
      }

      // Optimization: If backend already sent the name, use it
      if ((product as any).stockItem?.name) {
        setStockItemName((product as any).stockItem.name);
        return;
      }

      try {
        setLoadingStock(true);
        const res = await StockItemsAPI.getById(linkedId);
        // Handle response wrapper if necessary (res.data or res)
        const itemData = res || {};
        const name = itemData.name || "Unknown Item"; 
        setStockItemName(name);
      } catch (err) {
        console.error("Failed to fetch linked stock item:", err);
        setStockItemName("Error");
      } finally {
        setLoadingStock(false);
      }
    };

    fetchLinkedStockItem();
  }, [product.stockItemId]); 

  // --- 2. FETCH CATEGORY NAME (NEW) ---
  useEffect(() => {
    const fetchCategoryName = async () => {
       if (!product.categoryId) {
         setCategoryName("--");
         return;
       }

       // Optimization: If backend already sent the name attached to product
       if ((product as any).category?.name) {
          setCategoryName((product as any).category.name);
          return;
       }

       try {
          // Fetch the category details using the ID
          const res = await CategoriesApi.getById(product.categoryId);
          const catData = res || {}; 
          setCategoryName(catData.name || "Unknown");
       } catch (err) {
          console.error("Failed to fetch category:", err);
          // Fallback to showing part of the ID if fetch fails
          setCategoryName(product.categoryId.substring(0, 6) + "...");
       }
    };

    fetchCategoryName();
  }, [product.categoryId]);

  // --- IMAGE LOGIC ---
  const getImageUrl = () => {
    if (!product.images) return null;
    let path = "";
    if (typeof product.images === 'string') {
      path = product.images;
    } else {
      const imgs = product.images as any;
      path = imgs.mainImage || imgs.url || (Array.isArray(imgs) ? imgs[0] : "");
    }

    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('https')) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const imageUrl = getImageUrl();
  
  useEffect(() => { setImgError(false); }, [product.id]);

  // --- TOGGLES ---
  const handleStatusToggle = async () => {
    try {
      setIsPending(true);
      if (isActive) await ProductsAPI.disable(product.id);
      else await ProductsAPI.enable(product.id);
      onAction(); 
    } catch (err) { 
      setPopup({ title: "ERROR", text: "Failed to update status.", type: 'error' });
    } finally { setIsPending(false); }
  };

  const handleTrendingToggle = async () => {
    try {
      setIsPending(true);
      await ProductsAPI.markTrending(product.id, !isTrending);
      onAction(); 
    } catch (err) {
      setPopup({ title: "ERROR", text: "Failed to update trending status.", type: 'error' });
    } finally { setIsPending(false); }
  };

  const dynamicRowStyle = {
    ...rowStyles.tr,
    backgroundColor: isSelected ? "#f0fdf4" : (isActive ? "#ffffff" : "#f1f5f9"),
    opacity: isActive ? 1 : 0.6,
    filter: isActive ? "none" : "grayscale(100%)",
    transition: "all 0.3s ease",
  };

  return (
    <>
      <tr style={dynamicRowStyle}>
        <td style={{ ...rowStyles.td, textAlign: 'center' }}>
          <input type="checkbox" checked={isSelected} onChange={onSelect} style={{ cursor: 'pointer' }} />
        </td>
        
        {/* Product Name & Image */}
        <td style={rowStyles.td}>
          <div style={rowStyles.itemCell}>
            <div style={rowStyles.imgWrapper}>
              {imageUrl && !imgError ? (
                <img src={imageUrl} alt={product.name.value} onError={() => setImgError(true)} style={rowStyles.img} />
              ) : (
                <div style={rowStyles.placeholder}><ImageOff size={16} color="#94a3b8" /></div>
              )}
            </div>
            <div>
               <div style={rowStyles.itemName} onClick={() => onViewDetails(product)}>
                  {product.name.value}
               </div>
               <div style={{fontSize: '11px', color: '#94a3b8'}}>{product.unitValue} {product.unitType}</div>
            </div>
          </div>
        </td>
        
        {/* --- CATEGORY NAME (CORRECTED) --- */}
        <td style={rowStyles.td}>
             <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 500}}>
                <Layers size={14} />
                <span title={product.categoryId}>
                  {/* Shows fetched category name */}
                  {categoryName}
                </span>
             </div>
        </td>

        {/* --- STOCK ITEM NAME --- */}
        <td style={rowStyles.td}>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
             <ClipboardList size={14} color="#64748b" />
             <div style={rowStyles.slugText}>
                {loadingStock ? (
                  <span style={{color: '#94a3b8', fontSize: '11px'}}>Loading...</span>
                ) : (
                  stockItemName
                )}
             </div>
          </div>
        </td>
        
        {/* Status Badge */}
        <td style={rowStyles.td}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
                ...rowStyles.statusBadge, 
                backgroundColor: isActive ? "#ecfdf5" : "#e2e8f0", 
                color: isActive ? "#10b981" : "#64748b",
                border: isActive ? "1px solid #d1fae5" : "1px solid #cbd5e1"
            }}>
              <div style={{ ...rowStyles.dot, backgroundColor: isActive ? "#10b981" : "#94a3b8" }} />
              {isActive ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>
        </td>
        
        {/* Trending Toggle */}
        <td style={rowStyles.td}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
                onClick={handleTrendingToggle}
                disabled={isPending}
                title={isTrending ? "Remove from Trending" : "Mark as Trending"}
                style={{ 
                    ...rowStyles.trendingBox, 
                    color: isTrending ? "#d97706" : "#94a3b8", 
                    backgroundColor: isTrending ? "#fffbeb" : "transparent",
                    border: isTrending ? "1px solid #fcd34d" : "1px solid #e2e8f0",
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    opacity: isPending ? 0.6 : 1
                }}
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} fill={isTrending ? "#d97706" : "none"} />}
            </button>
          </div>
        </td>
        
        {/* Price */}
        <td style={rowStyles.td}>
            <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>₹{product.price.originalPrice}</span>
                {product.price.discountPrice && product.price.discountPrice > 0 && (
                     <div style={{fontSize: '10px', color: '#ef4444'}}>Save ₹{product.price.discountPrice}</div>
                )}
            </div>
        </td>
        
        {/* Actions */}
        <td style={{ ...rowStyles.td, textAlign: 'right' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
                onClick={handleStatusToggle} 
                disabled={isPending} 
                style={{ 
                    ...rowStyles.actionBtn, 
                    color: isActive ? "#ef4444" : "#10b981", 
                    backgroundColor: isActive ? "#fef2f2" : "#ecfdf5" 
                }}
            >
              {isActive ? <PowerOff size={16} /> : <Power size={16} />}
            </button>
            <button onClick={() => onEdit(product)} style={rowStyles.editBtn}><Edit3 size={18} /></button>
          </div>
        </td>
      </tr>

      {/* Popups */}
      {createPortal(
        <AnimatePresence>
          {popup && (
            <div style={popupStyles.overlay}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={popupStyles.box}>
                <div style={{ marginBottom: '20px' }}>
                  {popup.type === 'success' ? <CheckCircle2 size={60} color="#10b981" /> : <XCircle size={60} color="#ef4444" />}
                </div>
                <h3 style={{ ...popupStyles.title, color: popup.type === 'success' ? '#10b981' : '#ef4444' }}>{popup.title}</h3>
                <p style={popupStyles.text}>{popup.text}</p>
                <button onClick={() => setPopup(null)} style={popupStyles.btn}>Continue</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

const rowStyles: Record<string, React.CSSProperties> = {
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 24px", verticalAlign: "middle" },
  itemCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  imgWrapper: { width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontWeight: 600, color: '#3b82f6', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' },
  slugText: { fontSize: '13px', color: '#475569', fontWeight: 600 },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: 700 },
  dot: { width: "6px", height: "6px", borderRadius: "50%" },
  trendingBox: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", transition: "all 0.2s" },
  editBtn: { background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px' },
  actionBtn: { border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

const popupStyles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  box: { backgroundColor: 'white', padding: '40px', borderRadius: '28px', width: '90%', maxWidth: '400px', textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: 800, margin: '0 0 10px 0' },
  text: { fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' },
  btn: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer' }
};