"use client";

import { useState, useEffect, useRef } from "react";
import { ProductsAPI } from "../services/products.api";
import { InventoryAPI } from "@/features/inventory/api/inventory.api";
import { X, ClipboardList, IndianRupee, Image as ImageIcon, Upload, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    productName: "",
    originalPrice: 0,
    discountPrice: 0,
    stockItemId: "",
    mainImage: "", 
    galleryImages: [] as string[], 
    shortDescription: "",
    longDescription: "",
  });

  useEffect(() => {
    InventoryAPI.getAllStockItems().then((res) => {
      setStockItems(res.data.data.filter((i: any) => i.status === "ACTIVE"));
    });
  }, []);

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setForm(prev => ({ ...prev, mainImage: fileUrl }));
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setForm(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...filesArray] }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.productName || !form.stockItemId || form.originalPrice <= 0 || !form.mainImage) {
      alert("Please fill in Name, Stock Item, Price, and provide a Main Image.");
      return;
    }

    const shortWords = form.shortDescription.trim().split(/\s+/).length;
    if (shortWords < 2 || shortWords > 5) {
      alert("Short description must be 2-5 words.");
      return;
    }

    const longWords = form.longDescription.trim().split(/\s+/).length;
    if (longWords < 20 || longWords > 100) {
      alert(`Long description has ${longWords} words. It must be between 20-100 words.`);
      return;
    }

    setLoading(true);
    try {
      await ProductsAPI.create(form);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      {/* Global CSS for Hover effects that Inline Styles can't do */}
      <style>{`
        .gallery-item-wrapper:hover .gallery-hover-overlay {
          opacity: 1 !important;
        }
        .add-btn-hover:hover {
          background-color: #f0fdf4 !important;
          border-color: #10b981 !important;
        }
      `}</style>

      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        style={modalStyles.modal} 
        onClick={e => e.stopPropagation()}
      >
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Create New Product</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}><X size={20}/></button>
        </div>

        <div style={modalStyles.scrollArea}>
          <div style={modalStyles.form}>
            
            <div style={modalStyles.row}>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Base Stock Item *</label>
                <div style={modalStyles.inputWrapper}>
                  <ClipboardList size={16} style={modalStyles.inputIcon} />
                  <select style={modalStyles.select} value={form.stockItemId} onChange={e => setForm({...form, stockItemId: e.target.value})}>
                    <option value="">-- Select --</option>
                    {stockItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Product Name *</label>
                <input style={modalStyles.inputNoIcon} placeholder="e.g. Sugarcane Juice" value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} />
              </div>
            </div>

            <div style={modalStyles.row}>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Original Price (₹) *</label>
                <div style={modalStyles.inputWrapper}>
                  <IndianRupee size={16} style={modalStyles.inputIcon} />
                  <input type="number" style={modalStyles.input} placeholder="0" onChange={e => setForm({...form, originalPrice: +e.target.value})} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Discount Price (₹)</label>
                <div style={modalStyles.inputWrapper}>
                  <IndianRupee size={16} style={modalStyles.inputIcon} />
                  <input type="number" style={modalStyles.input} placeholder="0" onChange={e => setForm({...form, discountPrice: +e.target.value})} />
                </div>
              </div>
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Main Product Image *</label>
              <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={handleMainImageUpload} />
              
              {!form.mainImage ? (
                <div style={modalStyles.uploadBox} onClick={() => mainImageRef.current?.click()}>
                   <Upload size={24} color="#10b981" />
                   <p style={modalStyles.uploadText}>Click to upload Main Image</p>
                </div>
              ) : (
                <div style={modalStyles.mainPreviewContainer}>
                  <img src={form.mainImage} style={modalStyles.mainPreviewImg} alt="Main" />
                  <button style={modalStyles.removeMainBtn} onClick={() => setForm({...form, mainImage: ""})}>
                    <Trash2 size={16} /> Change Image
                  </button>
                </div>
              )}
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Gallery Images (Optional)</label>
              <input type="file" multiple hidden ref={galleryInputRef} accept="image/*" onChange={handleGalleryUpload} />
              
              <div style={modalStyles.galleryGrid}>
                {form.galleryImages.map((src, i) => (
                  <div key={i} className="gallery-item-wrapper" style={modalStyles.galleryItem}>
                    <img src={src} style={modalStyles.galleryImg} alt="Gallery" />
                    <div 
                      className="gallery-hover-overlay" 
                      style={modalStyles.galleryOverlay} 
                      onClick={() => removeGalleryImage(i)}
                    >
                      <Trash2 size={18} color="#fff" />
                    </div>
                  </div>
                ))}
                <div 
                  className="add-btn-hover" 
                  style={modalStyles.addGalleryBtn} 
                  onClick={() => galleryInputRef.current?.click()}
                >
                   <Plus size={24} color="#10b981" />
                </div>
              </div>
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Short Description (2-5 words)</label>
              <input style={modalStyles.inputNoIcon} placeholder="e.g. Fresh farm tender coconut" value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} />
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Long Description (20-100 words)</label>
              <textarea style={modalStyles.textarea} placeholder="Write a detailed description..." value={form.longDescription} onChange={e => setForm({...form, longDescription: e.target.value})} />
              <p style={{ fontSize: '10px', color: form.longDescription.trim().split(/\s+/).length > 100 ? 'red' : '#94a3b8', textAlign: 'right' }}>
                Word count: {form.longDescription.trim() === "" ? 0 : form.longDescription.trim().split(/\s+/).length}
              </p>
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button onClick={handleSubmit} disabled={loading} style={modalStyles.primaryBtn}>
            {loading ? "Creating..." : "Confirm & Create Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const modalStyles: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", width: "520px", maxHeight: "92vh", borderRadius: "32px", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", overflow: "hidden" },
  header: { padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  scrollArea: { padding: "24px 32px", overflowY: "auto", flex: 1 },
  footer: { padding: "20px 32px", borderTop: "1px solid #f1f5f9", backgroundColor: "#fff" },
  title: { fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: 0 },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#94a3b8" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "flex", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "14px", color: "#94a3b8" },
  input: { width: "100%", padding: "12px 14px 12px 38px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "14px", backgroundColor: "#f8fafc", outline: "none" },
  inputNoIcon: { width: "100%", padding: "12px 14px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "14px", backgroundColor: "#f8fafc", outline: "none" },
  select: { width: "100%", padding: "12px 14px 12px 38px", borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", appearance: "none", outline: "none" },
  textarea: { width: "100%", padding: "14px", borderRadius: "16px", border: "1px solid #e2e8f0", fontSize: "14px", minHeight: "110px", backgroundColor: "#f8fafc", outline: "none", resize: "none" },
  uploadBox: { border: "2px dashed #cbd5e1", borderRadius: "18px", padding: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: "pointer", backgroundColor: "#f8fafc" },
  uploadText: { fontSize: "13px", color: "#64748b", fontWeight: 500 },
  mainPreviewContainer: { position: "relative", borderRadius: "18px", overflow: "hidden", border: "1px solid #e2e8f0" },
  mainPreviewImg: { width: "100%", height: "160px", objectFit: "cover" },
  removeMainBtn: { position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(255,255,255,0.9)", border: "none", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },

  // Fixed Gallery Styles
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" },
  galleryItem: { position: "relative", aspectRatio: "1/1", borderRadius: "12px", overflow: "hidden", border: "1px solid #f1f5f9" },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover" },
  galleryOverlay: { 
    position: "absolute", 
    inset: 0, 
    backgroundColor: "rgba(239, 68, 68, 0.6)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    opacity: 0, 
    transition: "0.2s ease", 
    cursor: "pointer" 
  },
  addGalleryBtn: { 
    aspectRatio: "1/1", 
    borderRadius: "12px", 
    border: "2px dashed #cbd5e1", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    cursor: "pointer", 
    backgroundColor: "#f8fafc",
    transition: "0.2s ease"
  },

  primaryBtn: { width: "100%", background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", color: "white", border: "none", padding: "16px", borderRadius: "16px", fontWeight: 700, cursor: "pointer", fontSize: "15px", boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)" }
};