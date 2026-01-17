"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Product } from "../types/product.types";
import { ProductsAPI } from "../services/products.api";
import { Edit3, TrendingUp, Power, PowerOff, CheckCircle2, XCircle, ImageOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Update this to match your actual backend URL
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

  const isActive = product.status === "ACTIVE";
  const isTrending = product.trendState?.trending;

  const getImageUrl = () => {
    if (!product.images) return null;
    
    // Get the raw path from the object or string
    let path = "";
    if (typeof product.images === 'string') {
      path = product.images;
    } else {
      const imgs = product.images as any;
      path = imgs.mainImage || imgs.url || imgs.image || (Array.isArray(imgs) ? imgs[0] : "");
    }

    if (!path) return null;

    // FIX: If the path is a temporary blob, it will never work after a refresh.
    // If the path is a relative server path (e.g. /uploads/img.jpg), prepend the API URL
    if (path.startsWith('/') && !path.startsWith('http')) {
      return `${API_BASE_URL}${path}`;
    }

    return path;
  };

  const imageUrl = getImageUrl();

  // Reset error state if product changes
  useEffect(() => { setImgError(false); }, [product.id]);

  const handleStatusToggle = async () => {
    try {
      setIsPending(true);
      if (isActive) {
        await ProductsAPI.disable(product.id);
        setPopup({ title: "DEACTIVATED", text: `"${product.name.value}" is now inactive.`, type: 'error' });
        if (isTrending) await ProductsAPI.markTrending(product.id, false);
      } else {
        await ProductsAPI.enable(product.id);
      }
      onAction();
    } catch (err) { console.error(err); } 
    finally { setIsPending(false); }
  };

  return (
    <>
      <tr style={{ ...rowStyles.tr, backgroundColor: isSelected ? "#f0fdf4" : (isActive ? "transparent" : "#f8fafc") }}>
        <td style={{ ...rowStyles.td, textAlign: 'center' }}>
          <input type="checkbox" checked={isSelected} onChange={onSelect} style={{ cursor: 'pointer' }} />
        </td>
        <td style={rowStyles.td}>
          <div style={rowStyles.itemCell}>
            <div style={rowStyles.imgWrapper}>
              {imageUrl && !imgError ? (
                <img 
                  src={imageUrl} 
                  alt="" 
                  onError={() => setImgError(true)}
                  style={{ ...rowStyles.img, filter: isActive ? "none" : "grayscale(100%)" }} 
                />
              ) : (
                <div style={rowStyles.placeholder}>
                  <ImageOff size={16} color="#94a3b8" />
                </div>
              )}
            </div>
            <div style={rowStyles.itemName} onClick={() => onViewDetails(product)}>
              {product.name.value}
            </div>
          </div>
        </td>
        <td style={rowStyles.td}><div style={rowStyles.slugText}>{product.name.value}</div></td>
        <td style={rowStyles.td}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ ...rowStyles.statusBadge, backgroundColor: isActive ? "#ecfdf5" : "#f1f5f9", color: isActive ? "#10b981" : "#64748b" }}>
              <div style={{ ...rowStyles.dot, backgroundColor: isActive ? "#10b981" : "#94a3b8" }} />
              {product.status}
            </div>
          </div>
        </td>
        <td style={rowStyles.td}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{ ...rowStyles.trendingBox, color: isTrending ? "#f59e0b" : "#94a3b8", opacity: isActive ? 1 : 0.5 }}>
              <TrendingUp size={14} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>{isTrending ? "ON" : "OFF"}</span>
            </button>
          </div>
        </td>
        <td style={rowStyles.td}><span style={rowStyles.priceText}>₹{product.price.originalPrice}</span></td>
        <td style={rowStyles.td}><span style={{ fontSize: '14px', fontWeight: 600, color: isActive ? '#10b981' : '#94a3b8' }}>₹{product.price.discountPrice ?? 0}</span></td>
        <td style={{ ...rowStyles.td, textAlign: 'right' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={handleStatusToggle} disabled={isPending} style={{ ...rowStyles.actionBtn, color: isActive ? "#ef4444" : "#10b981", backgroundColor: isActive ? "#fef2f2" : "#ecfdf5" }}>
              {isActive ? <PowerOff size={16} /> : <Power size={16} />}
            </button>
            <button onClick={() => onEdit(product)} style={rowStyles.editBtn}><Edit3 size={18} /></button>
          </div>
        </td>
      </tr>

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
  tr: { borderBottom: "1px solid #f1f5f9", transition: "all 0.3s ease" },
  td: { padding: "12px 24px", verticalAlign: "middle" },
  itemCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  imgWrapper: { width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontWeight: 600, color: '#3b82f6', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' },
  slugText: { fontSize: '12px', color: '#475569', fontWeight: 500 },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: 700 },
  dot: { width: "6px", height: "6px", borderRadius: "50%" },
  trendingBox: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" },
  priceText: { fontWeight: 700, color: '#0f172a', fontSize: '14px' },
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