'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Layers, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { StockItemsAPI } from '@/features/stock-items/stockItems.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStockItemModal({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('PIECE');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // New state for error messages

  const submit = async () => {
    if (!name.trim()) {
        setFormError("Item name is required");
        return;
    }
    
    setFormError(null);
    setIsSaving(true);
    
    try {
      await StockItemsAPI.create({ name: name.trim(), unit: unit as any });
      onSuccess();
      handleClose(); // Use internal close to reset state
    } catch (err: any) {
      // Check if it's a conflict (usually 409) or just handle the 500/general error
      if (err.response?.status === 409 || err.response?.data?.message?.includes('exists')) {
        setFormError(`"${name}" already exists in the inventory.`);
      } else {
        setFormError("An error occurred. This item might already exist.");
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setFormError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div style={styles.modalOverlay} onClick={handleClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={styles.modal} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.header}>
              <div>
                <h2 style={styles.title}>Create Stock Item</h2>
                <p style={styles.subtitle}>Add new raw materials to inventory</p>
              </div>
              <button onClick={handleClose} style={styles.closeBtn}><X size={20}/></button>
            </div>

            <div style={styles.form}>
              {/* --- ERROR BANNER --- */}
              <AnimatePresence>
                {formError && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    style={styles.errorBanner}
                  >
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Item Name *</label>
                <div style={styles.inputWrapper}>
                  <Package size={18} style={styles.inputIcon} />
                  <input 
                    style={styles.input} 
                    placeholder="e.g. Tomato Sauce" 
                    value={name} 
                    onChange={(e) => {
                        setName(e.target.value);
                        if(formError) setFormError(null); // Clear error when user types
                    }} 
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Measurement Unit *</label>
                <div style={styles.inputWrapper}>
                  <Layers size={18} style={styles.inputIcon} />
                  <select 
                    style={styles.input} 
                    value={unit} 
                    onChange={e => setUnit(e.target.value)}
                  >
                    <option value="PIECE">Piece (Pcs)</option>
                    <option value="KG">Kilogram (Kg)</option>
                    <option value="LITER">Liter (Ltr)</option>
                    <option value="PACKET">Packet</option>
                    <option value="ML">Milliliter (ml)</option>
                    <option value="GRAM">Gram (g)</option>
                  </select>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                style={styles.submitBtn} 
                onClick={submit} 
                disabled={isSaving}
              >
                {isSaving ? "Creating..." : "Create Item"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", width: "450px", borderRadius: "24px", padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  title: { fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#64748b" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  errorBanner: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: "12px", 
    backgroundColor: "#fef2f2", 
    color: "#ef4444", 
    borderRadius: "12px", 
    fontSize: "13px", 
    fontWeight: 500,
    border: "1px solid #fee2e2",
    overflow: 'hidden'
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#475569" },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '12px', color: '#94a3b8' },
  input: { width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", backgroundColor: "#f8fafc" },
  submitBtn: { background: "linear-gradient(180deg, #34d399 0%, #10b981 100%)", color: "white", border: "none", padding: "16px", borderRadius: "14px", fontWeight: 700, fontSize: "15px", cursor: "pointer", boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)", marginTop: "10px" }
};