"use client";

import { useState } from "react";
import { ProductRow } from "./product-row";
import EditProductModal from "./edit-product-dialog";
import ProductDetailModal from "./product-detail-modal";
import { Package, RefreshCw, Power, PowerOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Product } from "../types/product.types";
import { ProductsAPI } from "../services/products.api";
import { createPortal } from "react-dom";

interface TableProps {
  products: Product[];
  loading: boolean;
  refresh: () => void;
}

export function ProductsTable({ products, loading, refresh }: TableProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Custom Popup State
  const [flashMessage, setFlashMessage] = useState<{ 
    title: string; 
    text: string; 
    type: 'success' | 'warning' | 'error';
    onConfirm?: () => void;
  } | null>(null);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={32} color="#10b981" className="animate-spin" />
        <p style={{ fontWeight: 600, color: '#64748b', marginTop: '12px' }}>Syncing Catalog...</p>
      </div>
    );
  }

  const selectedProducts = products.filter(p => selectedIds.includes(p.id));
  const hasActiveSelected = selectedProducts.some(p => p.status === "ACTIVE");
  const hasInactiveSelected = selectedProducts.some(p => p.status !== "ACTIVE");
  const isMixedSelection = hasActiveSelected && hasInactiveSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? products.map((p) => p.id) : []);
  };

  const handleToggleSelect = (id: string) => {
    const targetProduct = products.find(p => p.id === id);
    if (!targetProduct) return;
    
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      const currentSelected = products.filter(p => prev.includes(p.id));
      const isTargetActive = targetProduct.status === "ACTIVE";

      if (currentSelected.length > 0) {
        const hasExistingActive = currentSelected.some(p => p.status === "ACTIVE");
        const hasExistingInactive = currentSelected.some(p => p.status !== "ACTIVE");
        if ((isTargetActive && hasExistingInactive) || (!isTargetActive && hasExistingActive)) {
          setFlashMessage({
            type: 'warning',
            title: 'Mixed Selection',
            text: 'Cannot manually mix Active/Inactive products. Please use "Select All" for bulk actions across different statuses.'
          });
          return prev;
        }
      }
      return [...prev, id];
    });
  };

  const handleBulkStatus = (action: 'enable' | 'disable') => {
    if (selectedIds.length === 0) return;
    
    setFlashMessage({
      type: 'warning',
      title: 'Confirm Bulk Action',
      text: `Are you sure you want to ${action} ${selectedIds.length} selected products?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => action === 'enable' ? ProductsAPI.enable(id) : ProductsAPI.disable(id)));
          setSelectedIds([]);
          refresh();
          setFlashMessage({
            type: 'success',
            title: 'Action Successful',
            text: `Selected products have been successfully ${action === 'enable' ? 'activated' : 'deactivated'}.`
          });
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={styles.headerIconBg}><Package size={18} color="#10b981" /></div>
          <h3 style={styles.cardTitle}>Product Overview</h3>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <>
              {(hasInactiveSelected || isMixedSelection) && (
                <button onClick={() => handleBulkStatus('enable')} style={styles.enableButton}>
                  <Power size={18} /> Enable Selected
                </button>
              )}
              {(hasActiveSelected || isMixedSelection) && (
                <button onClick={() => handleBulkStatus('disable')} style={styles.disableButton}>
                  <PowerOff size={18} /> Disable Selected
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>
                <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === products.length && products.length > 0} />
              </th>
              <th style={styles.th}>PRODUCT</th>
              <th style={styles.th}>ITEM NAME</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>STATUS</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>TRENDING</th>
              <th style={styles.th}>ORIGINAL PRICE</th>
              <th style={styles.th}>DISCOUNT PRICE</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <ProductRow 
                key={product.id} index={index} product={product} 
                isSelected={selectedIds.includes(product.id)}
                onSelect={() => handleToggleSelect(product.id)}
                onAction={refresh} onEdit={setEditingProduct} onViewDetails={setViewingProduct}
              />
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editingProduct && (
          <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSuccess={() => { refresh(); setEditingProduct(null); }} />
        )}
        {viewingProduct && (
          <ProductDetailModal productId={viewingProduct.id} onClose={() => setViewingProduct(null)} />
        )}
        {flashMessage && (
          <FlashMessage 
            {...flashMessage} 
            onClose={() => setFlashMessage(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Internal Flash Message Component ---
function FlashMessage({ title, text, type, onClose, onConfirm }: any) {
  return createPortal(
    <div style={popupStyles.overlay}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        style={popupStyles.box}
      >
        <div style={{ marginBottom: '24px' }}>
          {type === 'success' && <CheckCircle2 size={64} color="#10b981" />}
          {type === 'warning' && <AlertTriangle size={64} color="#f59e0b" />}
          {type === 'error' && <AlertTriangle size={64} color="#ef4444" />}
        </div>
        
        <h3 style={popupStyles.statusText}>{title.toUpperCase()}</h3>
        <p style={popupStyles.text}>{text}</p>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {onConfirm && (
            <button onClick={() => { onConfirm(); onClose(); }} style={{ ...popupStyles.btn, backgroundColor: '#10b981' }}>Confirm</button>
          )}
          <button onClick={onClose} style={{ ...popupStyles.btn, backgroundColor: onConfirm ? '#f1f5f9' : '#10b981', color: onConfirm ? '#64748b' : 'white' }}>
            {onConfirm ? 'Cancel' : 'Continue'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)", overflow: "hidden" },
  cardHeader: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerIconBg: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "14px 24px", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" },
  enableButton: { background: "#10b981", color: "white", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  disableButton: { background: "#ef4444", color: "white", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  loadingContainer: { padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
};

const popupStyles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  box: { backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '90%', maxWidth: '440px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  statusText: { fontSize: '24px', fontWeight: 800, color: '#10b981', margin: '0 0 16px 0', letterSpacing: '1px' },
  text: { fontSize: '15px', color: '#475569', margin: '0 0 32px 0', lineHeight: '1.6', fontWeight: 500 },
  btn: { flex: 1, padding: '16px', borderRadius: '14px', border: 'none', color: 'white', fontWeight: 700, fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }
};