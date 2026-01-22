"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "../types/product.types";
import { ProductsAPI } from "../services/products.api";
import { InventoryAPI } from "@/features/inventory/api/inventory.api";
import { X, ClipboardList, IndianRupee, Save, Upload, Trash2, Plus, CheckCircle2, AlertCircle, Layers, Tag, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Ensure this matches your actual backend URL for PREVIEWS ONLY
const API_BASE_URL = "https://api.dev.local:4000";

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({ product, onClose, onSuccess }: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [popup, setPopup] = useState<{ title: string; text: string; type: 'success' | 'error' } | null>(null);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Preview Resolver
  const resolveUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const [form, setForm] = useState({
    categoryId: product.categoryId || "",
    stockItemId: product.stockItemId || "",
    productName: product.name?.value || "",
    originalPrice: product.price?.originalPrice || 0,
    discountPrice: product.price?.discountPrice || 0,
    unitValue: product.unitValue || 1,
    unitType: product.unitType || "PCS",
    tags: product.tags ? product.tags.join(", ") : "",
    mainImage: product.images?.mainImage || null as string | File | null,
    galleryImages: (product.images?.galleryImages || []) as (string | File)[],
    shortDescription: product.shortDescription || "",
    longDescription: product.longDescription || "",
  });

  useEffect(() => {
    InventoryAPI.getAllStockItems().then((res) => {
      const items = res.data?.data || [];
      setStockItems(items.filter((i: any) => i.status === "ACTIVE"));
    });
    ProductsAPI.fetchCategories().then((res) => {
      setCategories(res || []);
    });
  }, []);

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm(prev => ({ ...prev, mainImage: file }));
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setForm(prev => ({ 
        ...prev, 
        galleryImages: [...prev.galleryImages, ...newFiles] 
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const mainImagePreview = typeof form.mainImage === 'string' 
    ? resolveUrl(form.mainImage) 
    : (form.mainImage ? URL.createObjectURL(form.mainImage as File) : "");

  const handleUpdate = async () => {
    if (!form.productName || form.originalPrice <= 0) {
      setPopup({ title: "REQUIRED FIELDS", text: "Name and Price are mandatory.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productName: form.productName,
        originalPrice: form.originalPrice,
        discountPrice: form.discountPrice,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        mainImage: form.mainImage as string | File,
        galleryImages: form.galleryImages
      };

      await ProductsAPI.update(product.id, payload);
      
      setPopup({ title: "SUCCESS", text: "Product updated successfully.", type: "success" });
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (error: any) {
      console.error("Update failed", error);
      let errorMsg = "There was an error updating the product.";
      if (error.response?.data?.message) {
         const msg = error.response.data.message;
         errorMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      }
      setPopup({ title: "UPDATE FAILED", text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        .gallery-item-wrapper:hover .gallery-hover-overlay { opacity: 1 !important; }
        .add-btn-hover:hover { background-color: #f0fdf4 !important; border-color: #10b981 !important; }
        .input-focus:focus-within { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important; }
      `}</style>

      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.98 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        style={modalStyles.modal} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={modalStyles.header}>
          <div>
            <h2 style={modalStyles.title}>Edit Product</h2>
            <p style={modalStyles.subtitle}>Update details for <span style={{color: '#10b981'}}>{product.name?.value}</span></p>
          </div>
          <button onClick={onClose} style={modalStyles.closeBtn}><X size={20}/></button>
        </div>

        {/* Scrollable Content */}
        <div className="custom-scroll" style={modalStyles.scrollArea}>
          <div style={modalStyles.form}>
            
            {/* Read Only Context Section - Styled as a dashboard card */}
            <div style={modalStyles.infoCard}>
                <div style={modalStyles.infoRow}>
                    <div style={modalStyles.infoItem}>
                        <label style={modalStyles.infoLabel}><Layers size={10} style={{marginRight:4}}/> Category</label>
                        <div style={modalStyles.infoValue}>
                             {categories.find(c => c.id === form.categoryId)?.name || "N/A"}
                        </div>
                    </div>
                    <div style={modalStyles.infoSeparator}></div>
                    <div style={modalStyles.infoItem}>
                        <label style={modalStyles.infoLabel}><ClipboardList size={10} style={{marginRight:4}}/> Base Item</label>
                        <div style={modalStyles.infoValue}>
                            {stockItems.find(i => i.id === form.stockItemId)?.name || "N/A"}
                        </div>
                    </div>
                    <div style={modalStyles.infoSeparator}></div>
                    <div style={modalStyles.infoItem}>
                        <label style={modalStyles.infoLabel}><Tag size={10} style={{marginRight:4}}/> Unit</label>
                        <div style={modalStyles.infoValue}>{form.unitValue} {form.unitType}</div>
                    </div>
                </div>
            </div>

            {/* Editable Fields */}
            <div>
              <label style={modalStyles.label}>Product Name</label>
              <div className="input-focus" style={modalStyles.inputWrapperClean}>
                  <input style={modalStyles.inputClean} value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} />
              </div>
            </div>

            <div style={modalStyles.row}>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Original Price (₹) <span style={{color:'#ef4444'}}>*</span></label>
                <div className="input-focus" style={modalStyles.inputWrapperClean}>
                  <IndianRupee size={16} style={modalStyles.inputIcon} />
                  <input type="number" style={modalStyles.inputWithIcon} value={form.originalPrice} onChange={e => setForm({...form, originalPrice: +e.target.value})} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Discount Price (₹)</label>
                <div className="input-focus" style={modalStyles.inputWrapperClean}>
                  <IndianRupee size={16} style={modalStyles.inputIcon} />
                  <input type="number" style={modalStyles.inputWithIcon} value={form.discountPrice} onChange={e => setForm({...form, discountPrice: +e.target.value})} />
                </div>
              </div>
            </div>

            <div style={modalStyles.sectionDivider}></div>

            <div style={modalStyles.row}>
                {/* Main Image */}
                <div style={{ width: '40%' }}>
                     <label style={modalStyles.label}>Main Image</label>
                     <div style={modalStyles.mainPreviewContainer}>
                        {mainImagePreview ? (
                            <img src={mainImagePreview} style={modalStyles.mainPreviewImg} alt="Main" />
                        ) : (
                            <div style={modalStyles.noImagePlaceholder}>No Image</div>
                        )}
                        <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={handleMainImageUpload} />
                        <button style={modalStyles.editImageBtn} onClick={() => mainImageRef.current?.click()}>
                           <Upload size={14} /> Edit
                        </button>
                     </div>
                </div>

                {/* Gallery */}
                <div style={{ flex: 1 }}>
                    <label style={modalStyles.label}>Gallery ({form.galleryImages.length})</label>
                    <input type="file" multiple hidden ref={galleryInputRef} accept="image/*" onChange={handleGalleryUpload} />
                    <div style={modalStyles.galleryGrid}>
                        {form.galleryImages.map((item, i) => {
                            const previewSrc = typeof item === 'string' ? resolveUrl(item) : URL.createObjectURL(item as File);
                            return (
                            <div key={i} className="gallery-item-wrapper" style={modalStyles.galleryItem}>
                                <img src={previewSrc} style={modalStyles.galleryImg} alt="Gallery" />
                                <div className="gallery-hover-overlay" style={modalStyles.galleryOverlay} onClick={() => removeGalleryImage(i)}>
                                <Trash2 size={16} color="#fff" />
                                </div>
                            </div>
                            );
                        })}
                        <div className="add-btn-hover" style={modalStyles.addGalleryBtn} onClick={() => galleryInputRef.current?.click()}>
                            <Plus size={20} color="#64748b" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={modalStyles.sectionDivider}></div>

            <div>
              <label style={modalStyles.label}>Short Description</label>
              <div className="input-focus" style={modalStyles.inputWrapperClean}>
                <input style={modalStyles.inputClean} placeholder="Brief highlight..." value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} />
              </div>
            </div>

            <div>
              <label style={modalStyles.label}>Long Description</label>
              <div className="input-focus" style={modalStyles.inputWrapperClean}>
                 <textarea style={modalStyles.textarea} placeholder="Detailed product information..." value={form.longDescription} onChange={e => setForm({...form, longDescription: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button onClick={onClose} style={modalStyles.secondaryBtn}>Cancel</button>
          <button onClick={handleUpdate} disabled={loading} style={modalStyles.primaryBtn}>
            {loading ? "Updating..." : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </motion.div>

      {/* Popup Notification */}
      {createPortal(
        <AnimatePresence>
          {popup && (
            <div style={popupStyles.overlay}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={popupStyles.box}>
                <div style={{ marginBottom: '20px' }}>
                  {popup.type === 'success' ? (
                    <div style={popupStyles.successIconWrapper}><CheckCircle2 size={40} color="#10b981" /></div>
                  ) : <AlertCircle size={40} color="#ef4444" />}
                </div>
                <h3 style={{ ...popupStyles.title, color: popup.type === 'success' ? '#10b981' : '#ef4444' }}>{popup.title}</h3>
                <p style={popupStyles.text}>{popup.text}</p>
                <button onClick={() => setPopup(null)} style={{ ...popupStyles.btn, backgroundColor: popup.type === 'success' ? '#10b981' : '#1e293b' }}>
                  {popup.type === 'success' ? 'Continue' : 'Close'}
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
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", width: "600px", maxHeight: "90vh", borderRadius: "24px", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px -10px rgba(0,0,0,0.3)", overflow: "hidden" },
  
  // Header
  header: { padding: "20px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: 'rgba(255,255,255,0.95)' },
  title: { fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 },
  subtitle: { fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" },
  closeBtn: { background: "#f1f5f9", border: "none", borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: "pointer", color: "#64748b", transition: '0.2s' },
  
  // Body
  scrollArea: { padding: "24px 32px", overflowY: "auto", flex: 1, backgroundColor: '#fff' },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  
  // Info Card (Read Only Group)
  infoCard: { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px" },
  infoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  infoLabel: { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'flex', alignItems: 'center', letterSpacing: '0.05em' },
  infoValue: { fontSize: '13px', fontWeight: 600, color: '#334155' },
  infoSeparator: { width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 16px' },

  // Inputs
  row: { display: "flex", gap: "16px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" },
  inputWrapperClean: { position: "relative", display: "flex", alignItems: "center", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#fff", transition: "0.2s ease" },
  inputClean: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "none", fontSize: "14px", outline: "none", background: "transparent", color: "#0f172a" },
  inputWithIcon: { width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px", border: "none", fontSize: "14px", outline: "none", background: "transparent", fontWeight: 600, color: "#0f172a" },
  inputIcon: { position: "absolute", left: "10px", color: "#94a3b8" },
  textarea: { width: "100%", padding: "12px", borderRadius: "10px", border: "none", fontSize: "14px", minHeight: "80px", outline: "none", resize: "none", background: "transparent", color: "#0f172a", fontFamily: 'inherit' },

  // Images
  sectionDivider: { height: '1px', backgroundColor: '#f1f5f9', width: '100%' },
  mainPreviewContainer: { position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", aspectRatio: '16/9', backgroundColor: '#f8fafc' },
  mainPreviewImg: { width: "100%", height: "100%", objectFit: "cover" },
  noImagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '12px' },
  editImageBtn: { position: "absolute", bottom: "8px", right: "8px", backgroundColor: "white", border: "1px solid #e2e8f0", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, color: "#0f172a", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "8px" },
  galleryItem: { position: "relative", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover" },
  galleryOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.2s ease", cursor: "pointer" },
  addGalleryBtn: { aspectRatio: "1/1", borderRadius: "8px", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "#f8fafc", transition: "0.2s ease" },

  // Footer
  footer: { padding: "16px 32px", borderTop: "1px solid #f1f5f9", backgroundColor: "#fff", display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  secondaryBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: "14px" },
  primaryBtn: { padding: "10px 24px", borderRadius: "10px", background: "#10b981", color: "white", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "14px", display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }
};

const popupStyles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  box: { backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.15)' },
  successIconWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: '20px', fontWeight: 700, margin: '12px 0 8px 0' },
  text: { fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5' },
  btn: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }
};