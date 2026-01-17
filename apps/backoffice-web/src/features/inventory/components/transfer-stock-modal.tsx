"use client";

import React, { useState, useEffect } from "react";
import { InventoryItem } from "../types/inventory.types";
import { InventoryAPI } from "../api/inventory.api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, AlertCircle, CheckCircle, Package } from "lucide-react";

interface Props {
  item: InventoryItem & { stockName?: string }; // Include stockName for display
  onClose: () => void;
  onSuccess: () => void;
}

interface Outlet {
  id: string;
  name: string;
  branch: string;
  status: string;
}

export default function TransferStockModal({ item, onClose, onSuccess }: Props) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [outletId, setOutletId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(true);

  // Fetch outlets on component mount
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await InventoryAPI.getAllOutlets();
        // Filter to show only ACTIVE outlets
        const activeOutlets = res.data.data.filter((o: Outlet) => o.status === "ACTIVE");
        setOutlets(activeOutlets);
      } catch (err) {
        setFormError("Failed to load destination outlets.");
      } finally {
        setIsLoadingOutlets(false);
      }
    };
    fetchOutlets();
  }, []);

  const submit = async () => {
    if (!outletId) {
      setFormError("Please select a destination outlet.");
      return;
    }
    if (quantity <= 0) {
      setFormError("Quantity must be greater than 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      
      await InventoryAPI.transferStock({ 
        stockItemId: item.stockItemId, 
        outletId: outletId, 
        quantity 
      });

      setIsSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to process transfer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        style={styles.modal} 
        onClick={e => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="#f59e0b" />
            <h2 style={styles.title}>Transfer Stock</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20}/></button>
        </div>

        <div style={styles.body}>
          {/* Display Item Name */}
          <div style={styles.itemDisplay}>
            <Package size={16} color="#64748b" />
            <span style={styles.info}>Item: <strong>{item.stockName || item.stockItemId}</strong></span>
          </div>

          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                style={styles.errorBanner}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </motion.div>
            )}

            {isSuccess && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                style={styles.successBanner}
              >
                <CheckCircle size={16} />
                <span>Stock transferred successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DROPDOWN FOR OUTLET SELECTION */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Destination Outlet *</label>
            <select 
              disabled={isSuccess || isSubmitting || isLoadingOutlets}
              style={styles.input} 
              value={outletId} 
              onChange={(e) => {
                setOutletId(e.target.value);
                if (formError) setFormError(null);
              }} 
            >
              <option value="">{isLoadingOutlets ? "Loading outlets..." : "-- Select Outlet --"}</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} {o.branch ? `(${o.branch})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Quantity to Transfer ({item.unit})</label>
            <input 
              disabled={isSuccess || isSubmitting}
              type="number" 
              style={styles.input} 
              value={quantity} 
              onChange={(e) => {
                setQuantity(+e.target.value);
                if (formError) setFormError(null);
              }} 
            />
          </div>
          
          <button 
            disabled={isSuccess || isSubmitting || isLoadingOutlets} 
            onClick={submit} 
            style={{
              ...styles.submitBtn, 
              opacity: (isSuccess || isSubmitting || !outletId) ? 0.7 : 1,
              cursor: (isSuccess || isSubmitting || !outletId) ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Processing..." : isSuccess ? "Success!" : "Process Transfer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', width: '400px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },
  body: { display: 'flex', flexDirection: 'column', gap: '20px' },
  itemDisplay: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' },
  info: { fontSize: '14px', color: '#64748b', margin: 0 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#475569' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc', width: '100%' },
  submitBtn: { background: '#f59e0b', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  errorBanner: { 
    display: 'flex', alignItems: 'center', gap: '8px', padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "12px", fontSize: "13px", fontWeight: 500, border: "1px solid #fee2e2", marginBottom: "8px"
  },
  successBanner: { 
    display: 'flex', alignItems: 'center', gap: '8px', padding: "12px", backgroundColor: "#ecfdf5", color: "#10b981", borderRadius: "12px", fontSize: "13px", fontWeight: 500, border: "1px solid #d1fae5", marginBottom: "8px"
  },
};