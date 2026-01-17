"use client";

import { useState, useEffect } from "react";
import { InventoryAPI } from "../api/inventory.api";
import { X, Box, Layers, Truck, AlertCircle } from "lucide-react"; // Updated icon to Truck
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface StockItem {
  id: string;
  name: string;
  unit: string;
  status: string;
}

export default function InitializeInventoryModal({ onClose, onSuccess }: Props) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockItemId, setStockItemId] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingStocks, setFetchingStocks] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Fetch stock items and filter for only ACTIVE ones
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const res = await InventoryAPI.getAllStockItems();
        // Filter to display only stock items with "ACTIVE" status
        const activeStocks = res.data.data.filter((item: StockItem) => item.status === "ACTIVE");
        setStockItems(activeStocks);
      } catch (err) {
        setFormError("Failed to load stock items list.");
      } finally {
        setFetchingStocks(false);
      }
    };
    loadStocks();
  }, []);

  // 2. Handle Stock Selection Change
  const handleStockChange = (id: string) => {
    setStockItemId(id);
    setFormError(null);

    // Automatically find and set the unit from the selected stock item
    const selectedItem = stockItems.find((item) => item.id === id);
    if (selectedItem) {
      setUnit(selectedItem.unit);
    } else {
      setUnit("");
    }
  };

  const submit = async () => {
    if (!stockItemId) {
      setFormError("Please select a Stock Item");
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      await InventoryAPI.initialize({
        stockItemId,
        unit,
        quantity,
      });

      onSuccess(); 
      onClose();   
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to initialize inventory";
      const errorCode = err.response?.data?.code;

      if (errorCode === "INVENTORY_ALREADY_EXISTS") {
        setFormError("Inventory already initialized for this stock item.");
      } else {
        setFormError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Initialize Inventory</h2>
            <p style={styles.subtitle}>Set initial stock levels for a raw material</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20}/></button>
        </div>

        <div style={styles.form}>
          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                style={styles.errorBanner}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STOCK ITEM DROPDOWN - STYLED TO MATCH IMAGE */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Select Stock Item *</label>
            <div style={styles.inputWrapper}>
              <Truck size={18} style={styles.inputIcon} />
              <select
                value={stockItemId}
                onChange={(e) => handleStockChange(e.target.value)}
                style={styles.input}
                disabled={fetchingStocks}
              >
                <option value="">{fetchingStocks ? "Loading..." : "-- Select Item --"}</option>
                {stockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* UNIT DISPLAY (READ-ONLY) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Measurement Unit (Auto-filled)</label>
            <div style={styles.inputWrapper}>
              <Layers size={18} style={styles.inputIcon} />
              <input
                value={unit || "Select an item first"}
                readOnly
                style={{ ...styles.input, backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
              />
            </div>
          </div>

          {/* QUANTITY INPUT */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Initial Quantity *</label>
            <div style={styles.inputWrapper}>
              <Box size={18} style={styles.inputIcon} />
              <input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
                style={styles.input}
                min="0"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button 
              onClick={submit} 
              disabled={loading || fetchingStocks || !stockItemId} 
              style={loading || !stockItemId ? { ...styles.primaryBtn, opacity: 0.7, cursor: 'not-allowed' } : styles.primaryBtn}
            >
              {loading ? "Initializing..." : "Initialize Stock"}
            </button>
            <button onClick={onClose} style={styles.secondaryBtn}>
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", width: "450px", borderRadius: "24px", padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  title: { fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#64748b" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "  13px", fontWeight: 600, color: "#475569" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "12px", color: "#94a3b8", zIndex: 1 },
  input: { width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", backgroundColor: "#f8fafc", appearance: "none" },
  primaryBtn: { flex: 1, background: "linear-gradient(180deg, #34d399 0%, #10b981 100%)", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: "pointer", boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)" },
  secondaryBtn: { flex: 0.5, padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", fontWeight: 600, color: "#64748b", cursor: "pointer" },
  errorBanner: { display: "flex", alignItems: "center", gap: "8px", padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "12px", fontSize: "13px", fontWeight: 500, border: "1px solid #fee2e2" },
};