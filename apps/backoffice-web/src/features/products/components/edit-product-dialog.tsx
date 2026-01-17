"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "../types/product.types";
import { ProductsAPI } from "../services/products.api";
import { InventoryAPI } from "@/features/inventory/api/inventory.api";
import { X, ClipboardList, IndianRupee, Save, Upload, Trash2, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({ product, onClose, onSuccess }: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [popup, setPopup] = useState<{ title: string; text: string; type: 'success' | 'error' } | null>(null);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Prefilling state: Fixed mapping to match your exact API JSON response
  const [form, setForm] = useState({
  productName: product.name?.value || "",
  originalPrice: product.price?.originalPrice || 0,
  discountPrice: product.price?.discountPrice || 0,
  stockItemId: product.stockItemId || "", // FIXED: Removed .inventory
  mainImage: product.images?.mainImage || "",
  galleryImages: product.images?.galleryImages || [], // FIXED: Changed .gallery to .galleryImages
  shortDescription: product.shortDescription || "",
  longDescription: product.longDescription || "",
});

  useEffect(() => {
    InventoryAPI.getAllStockItems().then((res) => {
      setStockItems(res.data.data.filter((i: any) => i.status === "ACTIVE"));
    });
  }, []);

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm(prev => ({ ...prev, mainImage: URL.createObjectURL(e.target.files![0]) }));
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setForm(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...filesArray] }));
    }
  };

  const handleUpdate = async () => {
    if (!form.productName || form.originalPrice <= 0 || !form.mainImage) {
      setPopup({ title: "REQUIRED FIELDS", text: "Name, Price, and Main Image are mandatory.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await ProductsAPI.update(product.id, form);
      
      // Show high-fidelity success popup
      setPopup({ 
        title: "SUCCESS", 
        text: "Thank you for your request. The product details have been updated successfully.", 
        type: "success" 
      });

      // Delay to let user see the success message
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      setPopup({ 
        title: "UPDATE FAILED", 
        text: "There was an error updating the product. Please check your connection and try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <style>{`
        .gallery-item-wrapper:hover .gallery-hover-overlay { opacity: 1 !important; }
        .add-btn-hover:hover { background-color: #f0fdf4 !important; border-color: #10b981 !important; }
      `}</style>

      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        style={modalStyles.modal} 
        onClick={e => e.stopPropagation()}
      >
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Edit Product: {product.name?.value}</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}><X size={20}/></button>
        </div>

        <div style={modalStyles.scrollArea}>
          <div style={modalStyles.form}>
            <div style={modalStyles.row}>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Base Stock Item</label>
                <div style={modalStyles.inputWrapper}>
                  <ClipboardList size={16} style={modalStyles.inputIcon} />
                  <select 
                    style={modalStyles.select} 
                    value={form.stockItemId} 
                    onChange={e => setForm({...form, stockItemId: e.target.value})}
                  >
                    <option value="">-- Select --</option>
                    {stockItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Product Name *</label>
                <input 
                  style={modalStyles.inputNoIcon} 
                  value={form.productName} 
                  onChange={e => setForm({...form, productName: e.target.value})} 
                />
              </div>
            </div>

            <div style={modalStyles.row}>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Original Price (₹) *</label>
                <div style={modalStyles.inputWrapper}>
                  <IndianRupee size={16} style={modalStyles.inputIcon} />
                  <input 
                    type="number" 
                    style={modalStyles.input} 
                    value={form.originalPrice} 
                    onChange={e => setForm({...form, originalPrice: +e.target.value})} 
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Discount Price (₹)</label>
                <div style={modalStyles.inputWrapper}>
                  <IndianRupee size={16} style={modalStyles.inputIcon} />
                  <input 
                    type="number" 
                    style={modalStyles.input} 
                    value={form.discountPrice} 
                    onChange={e => setForm({...form, discountPrice: +e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Main Product Image</label>
              <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={handleMainImageUpload} />
              <div style={modalStyles.mainPreviewContainer}>
                <img src={form.mainImage} style={modalStyles.mainPreviewImg} alt="Main" />
                <button style={modalStyles.removeMainBtn} onClick={() => mainImageRef.current?.click()}>
                   <Upload size={16} /> Change Image
                </button>
              </div>
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Gallery Images</label>
              <input type="file" multiple hidden ref={galleryInputRef} accept="image/*" onChange={handleGalleryUpload} />
              <div style={modalStyles.galleryGrid}>
                {form.galleryImages.map((src: string, i: number) => (
                  <div key={i} className="gallery-item-wrapper" style={modalStyles.galleryItem}>
                    <img src={src} style={modalStyles.galleryImg} alt="Gallery" />
                    <div 
                      className="gallery-hover-overlay" 
                      style={modalStyles.galleryOverlay} 
                      onClick={() => setForm(f => ({ ...f, galleryImages: f.galleryImages.filter((_, idx) => idx !== i) }))}
                    >
                      <Trash2 size={18} color="#fff" />
                    </div>
                  </div>
                ))}
                <div className="add-btn-hover" style={modalStyles.addGalleryBtn} onClick={() => galleryInputRef.current?.click()}>
                   <Plus size={24} color="#10b981" />
                </div>
              </div>
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Short Description</label>
              <input style={modalStyles.inputNoIcon} value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} />
            </div>

            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>Long Description</label>
              <textarea style={modalStyles.textarea} value={form.longDescription} onChange={e => setForm({...form, longDescription: e.target.value})} />
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button onClick={handleUpdate} disabled={loading} style={modalStyles.primaryBtn}>
            {loading ? "Updating..." : <><Save size={18} /> Update Product Details</>}
          </button>
        </div>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {popup && (
            <div style={popupStyles.overlay}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={popupStyles.box}>
                <div style={{ marginBottom: '24px' }}>
                  {popup.type === 'success' ? (
                    <div style={popupStyles.successIconWrapper}>
                      <CheckCircle2 size={50} color="#10b981" />
                    </div>
                  ) : <AlertCircle size={60} color="#ef4444" />}
                </div>
                <h3 style={{ ...popupStyles.title, color: popup.type === 'success' ? '#10b981' : '#ef4444' }}>{popup.title}</h3>
                <p style={popupStyles.text}>{popup.text}</p>
                <button onClick={() => setPopup(null)} style={{ ...popupStyles.btn, backgroundColor: popup.type === 'success' ? '#10b981' : '#1e293b' }}>
                  {popup.type === 'success' ? 'Continue' : 'Understood'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

const modalStyles: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", width: "520px", maxHeight: "92vh", borderRadius: "32px", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" },
  header: { padding: "24px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  scrollArea: { padding: "24px 32px", overflowY: "auto", flex: 1 },
  footer: { padding: "20px 32px", borderTop: "1px solid #f1f5f9", backgroundColor: "#fff" },
  title: { fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 },
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
  textarea: { width: "100%", padding: "14px", borderRadius: "16px", border: "1px solid #e2e8f0", fontSize: "14px", minHeight: "100px", backgroundColor: "#f8fafc", outline: "none", resize: "none" },
  mainPreviewContainer: { position: "relative", borderRadius: "18px", overflow: "hidden", border: "1px solid #e2e8f0" },
  mainPreviewImg: { width: "100%", height: "160px", objectFit: "cover" },
  removeMainBtn: { position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(255,255,255,0.9)", border: "none", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, color: "#10b981", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" },
  galleryItem: { position: "relative", aspectRatio: "1/1", borderRadius: "12px", overflow: "hidden", border: "1px solid #f1f5f9" },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover" },
  galleryOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(239, 68, 68, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.2s ease", cursor: "pointer" },
  addGalleryBtn: { aspectRatio: "1/1", borderRadius: "12px", border: "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "#f8fafc", transition: "0.2s ease" },
  primaryBtn: { width: "100%", background: "#10b981", color: "white", border: "none", padding: "16px", borderRadius: "16px", fontWeight: 700, cursor: "pointer", fontSize: "15px", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};

const popupStyles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  box: { backgroundColor: 'white', padding: '48px 40px', borderRadius: '36px', width: '90%', maxWidth: '440px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' },
  successIconWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' },
  title: { fontSize: '24px', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '0.5px' },
  text: { fontSize: '15px', color: '#64748b', margin: '0 0 32px 0', lineHeight: '1.6', fontWeight: 500 },
  btn: { width: '100%', padding: '16px', borderRadius: '16px', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }
};