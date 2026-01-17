"use client";

import { useState } from "react";
import { InventoryItem } from "../types/inventory.types";
import { InventoryAPI } from "../api/inventory.api";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle, Package } from "lucide-react";

// Local interface extension to handle the stockName we added in the hook
interface MergedItem extends InventoryItem {
  stockName?: string;
}

interface Props {
  item: MergedItem; // Using merged item to get access to stockName
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockModal({ item, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    // Prevent submitting 0 or negative
    if (quantity <= 0) return;

    setLoading(true);
    try {
      await InventoryAPI.addStock({ 
        stockItemId: item.stockItemId, 
        quantity 
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add stock", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div style={styles.overlay} onClick={onClose}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 10 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          style={styles.modal} 
          onClick={e => e.stopPropagation()}
        >
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.iconBox}><PlusCircle size={20} color="#10b981"/></div>
              <h2 style={styles.title}>Add Stock</h2>
            </div>
            <button onClick={onClose} style={styles.closeBtn}><X size={20}/></button>
          </div>

          <div style={styles.body}>
            {/* ✅ Updated to show stockName instead of stockItemId */}
            <div style={styles.itemDisplay}>
              <Package size={16} color="#64748b" />
              <p style={styles.info}>
                Item: <strong style={{ color: '#1e293b' }}>{item.stockName || item.stockItemId}</strong>
              </p>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Quantity to Add ({item.unit})</label>
              <input 
                type="number" 
                autoFocus
                value={quantity} 
                style={styles.input} 
                onChange={(e) => setQuantity(+e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="0"
                min="1"
              />
            </div>

            <button 
              onClick={submit} 
              style={{
                ...styles.submitBtn,
                opacity: (loading || quantity <= 0) ? 0.7 : 1,
                cursor: (loading || quantity <= 0) ? 'not-allowed' : 'pointer'
              }} 
              disabled={loading || quantity <= 0}
            >
              {loading ? "Processing..." : "Confirm Addition"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', width: '400px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  iconBox: { width: '36px', height: '36px', backgroundColor: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px' },
  itemDisplay: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' },
  info: { fontSize: '14px', color: '#64748b', margin: 0 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#475569' },
  input: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px', fontWeight: 600, backgroundColor: '#ffffff', transition: 'border 0.2s' },
  submitBtn: { background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s' }
};