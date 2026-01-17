"use client";

import React, { useState } from "react";
import { InventoryItem } from "../types/inventory.types";
import { InventoryAPI } from "../api/inventory.api";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdjustStockModal({ item, onClose, onSuccess }: Props) {
  // Logic: User enters the amount they want to subtract from the current available balance
  const [adjustmentAmt, setAdjustmentAmt] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    // Calculation logic: Current Available - Adjustment Amount
    const newAvailable = item.availableQty.value - adjustmentAmt;

    // Validation
    if (adjustmentAmt < 0) {
      setFormError("Please enter a positive adjustment amount to deduct.");
      return;
    }

    if (newAvailable < 0) {
      setFormError(`Insufficient available stock. You only have ${item.availableQty.value} available.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      // Updating the available stock with the calculated result (e.g., 860)
      await InventoryAPI.adjustStock({ 
        stockItemId: item.stockItemId, 
        newAvailableQty: newAvailable, 
        remarks: remarks.trim() || `Deducted ${adjustmentAmt} from available stock`
      });

      setIsSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save adjustment.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        style={styles.modal} 
        onClick={e => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#3b82f6" />
            <h2 style={styles.title}>Adjust Available Stock</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20}/></button>
        </div>

        <div style={styles.body}>
          <AnimatePresence mode="wait">
            {formError && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={styles.errorBanner}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </motion.div>
            )}
            {isSuccess && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={styles.successBanner}>
                <CheckCircle size={16} />
                <span>Stock adjusted successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Box showing the live calculation */}
          <div style={styles.summaryBox}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Stock:</span>
              <span style={styles.summaryValue}>{item.totalQty.value} {item.unit}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Current Available:</span>
              <span style={styles.summaryValue}>{item.availableQty.value} {item.unit}</span>
            </div>
            <div style={{ ...styles.summaryItem, marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
              <span style={styles.summaryLabel}>Final Balance after Adjustment:</span>
              <span style={{...styles.summaryValue, color: '#3b82f6'}}>
                {item.availableQty.value - adjustmentAmt} {item.unit}
              </span>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Amount to Subtract</label>
            <input 
              type="number" 
              disabled={isSuccess || isSubmitting}
              value={adjustmentAmt} 
              style={styles.input} 
              onChange={(e) => {
                setAdjustmentAmt(+e.target.value);
                if (formError) setFormError(null);
              }} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Remarks / Reason</label>
            <textarea 
              disabled={isSuccess || isSubmitting}
              style={{...styles.input, height: '80px', resize: 'none'}} 
              placeholder="e.g. Wastage or usage" 
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)} 
            />
          </div>

          <button 
            disabled={isSuccess || isSubmitting}
            onClick={submit} 
            style={{
              ...styles.submitBtn,
              opacity: (isSuccess || isSubmitting) ? 0.7 : 1,
              cursor: (isSuccess || isSubmitting) ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Saving..." : isSuccess ? "Done!" : "Confirm Adjustment"}
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
  summaryBox: { padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: '12px', fontWeight: 600, color: '#64748b' },
  summaryValue: { fontSize: '14px', fontWeight: 700, color: '#1e293b' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#475569' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', backgroundColor: '#f8fafc' },
  submitBtn: { background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' },
  errorBanner: { display: 'flex', alignItems: 'center', gap: '8px', padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "12px", fontSize: "13px", fontWeight: 500, border: "1px solid #fee2e2" },
  successBanner: { display: 'flex', alignItems: 'center', gap: '8px', padding: "12px", backgroundColor: "#ecfdf5", color: "#10b981", borderRadius: "12px", fontSize: "13px", fontWeight: 500, border: "1px solid #d1fae5" }
};