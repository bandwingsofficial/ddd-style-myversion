"use client";

import { useState, useEffect, useRef } from "react";
import { ProductsAPI } from "../services/products.api";
import { InventoryAPI } from "@/features/inventory/api/inventory.api";
import { X, ClipboardList, Upload, Trash2, Plus, Tag, Layers, ChevronDown, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// CONSTANTS
const PREDEFINED_TAGS = [
  "FRESH", "ORGANIC", "NO_SUGAR", "COLD_PRESSED", 
  "NATURAL", "FARM_FRESH", "PRESERVATIVE_FREE", "VEGAN"
];

export default function CreateProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [form, setForm] = useState({
    categoryId: "",
    stockItemId: "",
    productName: "",
    originalPrice: 0,
    discountPrice: 0,
    unitValue: 1,
    unitType: "PCS",
    tags: [] as string[],
    shortDescription: "",
    longDescription: "",
    isTrending: false,
    mainImage: null as File | null,
    galleryImages: [] as File[],
    mainImagePreview: "",
    galleryPreviews: [] as string[]
  });

  // Data Fetching
  useEffect(() => {
    InventoryAPI.getAllStockItems().then((res) => {
      const items = res.data?.data || [];
      setStockItems(items.filter((i: any) => i.status === "ACTIVE"));
    });
    ProductsAPI.fetchCategories().then((res) => {
      setCategories(res || []);
    });
  }, []);

  // Handlers
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm(prev => ({ ...prev, mainImage: file, mainImagePreview: URL.createObjectURL(file) }));
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setForm(prev => ({ 
        ...prev, 
        galleryImages: [...prev.galleryImages, ...newFiles],
        galleryPreviews: [...prev.galleryPreviews, ...newPreviews]
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
      galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index)
    }));
  };

  const toggleTag = (tag: string) => {
    setForm(prev => {
      const exists = prev.tags.includes(tag);
      return exists 
        ? { ...prev, tags: prev.tags.filter(t => t !== tag) }
        : { ...prev, tags: [...prev.tags, tag] };
    });
  };

  const handleSubmit = async () => {
    if (!form.categoryId) { alert("Please select a Category."); return; }
    if (!form.stockItemId) { alert("Please select a Linked Stock Item."); return; }
    if (!form.productName) { alert("Please enter a Product Name."); return; }
    if (form.originalPrice <= 0) { alert("Original Price must be greater than 0."); return; }
    if (!form.mainImage) { alert("Please upload a Main Product Image."); return; }

    setLoading(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        stockItemId: form.stockItemId,
        productName: form.productName,
        originalPrice: form.originalPrice,
        discountPrice: form.discountPrice,
        unitValue: form.unitValue,
        unitType: form.unitType,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        isTrending: form.isTrending,
        tags: form.tags,
        mainImage: form.mainImage,
        galleryImages: form.galleryImages
      };

      const response = await ProductsAPI.create(payload);

      if (form.isTrending) {
          const newProductId = response.data?.id || response.data?.data?.id || response.id;
          if (newProductId) await ProductsAPI.markTrending(newProductId, true);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Creation failed:", error);
      alert("Failed to create product. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      {/* Global CSS for this component */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        
        .input-group:focus-within { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important; }
        
        .tag-option:hover { background-color: #f8fafc; color: #0f172a; }
        .gallery-item:hover .gallery-overlay { opacity: 1 !important; }
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
            <h2 style={modalStyles.title}>Add New Product</h2>
          </div>
          <button onClick={onClose} style={modalStyles.closeBtn}><X size={20}/></button>
        </div>

        {/* Scrollable Content */}
        <div className="custom-scroll" style={modalStyles.scrollArea}>
          <div style={modalStyles.form}>
            
            {/* Row 1: Selects */}
            <div style={modalStyles.row}>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Category <span style={{color: '#ef4444'}}>*</span></label>
                <div className="input-group" style={modalStyles.inputWrapper}>
                  <Layers size={15} style={modalStyles.inputIcon} />
                  <select style={modalStyles.select} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <ChevronDown size={14} style={{position:'absolute', right: 12, pointerEvents:'none', color:'#94a3b8'}} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Stock Link <span style={{color: '#ef4444'}}>*</span></label>
                <div className="input-group" style={modalStyles.inputWrapper}>
                  <ClipboardList size={15} style={modalStyles.inputIcon} />
                  <select style={modalStyles.select} value={form.stockItemId} onChange={e => setForm({...form, stockItemId: e.target.value})}>
                    <option value="">Select Stock Item</option>
                    {stockItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <ChevronDown size={14} style={{position:'absolute', right: 12, pointerEvents:'none', color:'#94a3b8'}} />
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label style={modalStyles.label}>Product Name <span style={{color: '#ef4444'}}>*</span></label>
              <div className="input-group" style={modalStyles.inputWrapper}>
                 <input style={modalStyles.inputClean} placeholder="e.g. Alphonso Mango" value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} />
              </div>
            </div>

            {/* Price Row */}
            <div style={modalStyles.row}>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Original Price <span style={{color: '#ef4444'}}>*</span></label>
                <div className="input-group" style={modalStyles.inputWrapper}>
                  <div style={modalStyles.currencySymbol}>₹</div>
                  <input type="number" style={modalStyles.inputCurrency} placeholder="0.00" value={form.originalPrice || ''} onChange={e => setForm({...form, originalPrice: +e.target.value})} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={modalStyles.label}>Discounted Price</label>
                <div className="input-group" style={modalStyles.inputWrapper}>
                  <div style={modalStyles.currencySymbol}>₹</div>
                  <input type="number" style={modalStyles.inputCurrency} placeholder="0.00" value={form.discountPrice || ''} onChange={e => setForm({...form, discountPrice: +e.target.value})} />
                </div>
              </div>
            </div>

            {/* Units & Tags */}
            <div style={modalStyles.row}>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                    <label style={modalStyles.label}>Unit</label>
                    <div className="input-group" style={modalStyles.inputWrapper}>
                         <input type="number" style={modalStyles.inputClean} value={form.unitValue} onChange={e => setForm({...form, unitValue: +e.target.value})} />
                    </div>
                </div>
                <div style={{ width: '85px' }}>
                    <label style={modalStyles.label}>Type</label>
                    <div className="input-group" style={modalStyles.inputWrapper}>
                        <select style={{...modalStyles.select, paddingLeft: 10}} value={form.unitType} onChange={e => setForm({...form, unitType: e.target.value})}>
                            {['PCS', 'KG', 'LTR', 'GM', 'ML'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
              </div>
              
              {/* Refined Tags Component - Now matches input style */}
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={modalStyles.label}>Tags</label>
                <div 
                  className="input-group"
                  style={modalStyles.tagsContainer} 
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                >
                  <Tag size={15} style={modalStyles.tagIcon} />
                  {form.tags.length === 0 ? (
                      <span style={{ color: '#94a3b8', fontSize: '13px', paddingLeft: 36 }}>Select tags...</span>
                  ) : (
                      <div style={modalStyles.tagScroll}>
                        {form.tags.map(tag => (
                            <span key={tag} style={modalStyles.tagPill}>
                                {tag.replace(/_/g, " ")} 
                            </span>
                        ))}
                      </div>
                  )}
                  <ChevronDown size={14} color="#94a3b8" style={{position: 'absolute', right: 12}}/>
                </div>
                
                <AnimatePresence>
                  {showTagDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      style={modalStyles.tagDropdown}
                    >
                      {PREDEFINED_TAGS.map(tag => {
                        const isSelected = form.tags.includes(tag);
                        return (
                        <div key={tag} className="tag-option" style={modalStyles.tagOption} onClick={() => toggleTag(tag)}>
                          <span style={{color: isSelected ? '#10b981' : 'inherit', fontWeight: isSelected ? 600 : 400}}>
                              {tag.replace(/_/g, " ")}
                          </span>
                          {isSelected && <Check size={14} color="#10b981" />}
                        </div>
                      )})}
                    </motion.div>
                  )}
                </AnimatePresence>
                {showTagDropdown && <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setShowTagDropdown(false)} />}
              </div>
            </div>

            {/* Images */}
            <div>
              <label style={modalStyles.label}>Main Image <span style={{color: '#ef4444'}}>*</span></label>
              <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={handleMainImageUpload} />
              {!form.mainImagePreview ? (
                <div style={modalStyles.uploadBox} onClick={() => mainImageRef.current?.click()}>
                   <div style={modalStyles.uploadIconCircle}><Upload size={20} color="#10b981" /></div>
                   <div style={{textAlign: 'center'}}>
                       <p style={{fontSize: '13px', fontWeight: 600, color: '#334155', margin: '0 0 4px 0'}}>Click to upload</p>
                       <p style={{fontSize: '11px', color: '#94a3b8', margin: 0}}>SVG, PNG, JPG (Max 800x800px)</p>
                   </div>
                </div>
              ) : (
                <div style={modalStyles.previewBox}>
                  <img src={form.mainImagePreview} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Main" />
                  <button style={modalStyles.removeBtn} onClick={() => setForm({...form, mainImage: null, mainImagePreview: ""})}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              )}
            </div>

            <div>
              <label style={modalStyles.label}>Gallery ({form.galleryImages.length})</label>
              <input type="file" multiple hidden ref={galleryInputRef} accept="image/*" onChange={handleGalleryUpload} />
              <div style={modalStyles.galleryGrid}>
                {form.galleryPreviews.map((src, i) => (
                  <div key={i} className="gallery-item" style={modalStyles.galleryItem}>
                    <img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Gallery" />
                    <div className="gallery-overlay" style={modalStyles.galleryOverlay} onClick={() => removeGalleryImage(i)}>
                      <Trash2 size={16} color="#fff" />
                    </div>
                  </div>
                ))}
                <div className="input-group" style={modalStyles.addGalleryBtn} onClick={() => galleryInputRef.current?.click()}>
                   <Plus size={20} color="#94a3b8" />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label style={modalStyles.label}>Descriptions</label>
              <div style={{display:'flex', flexDirection:'column', gap: '10px'}}>
                  <div className="input-group" style={modalStyles.inputWrapper}>
                    <input style={modalStyles.inputClean} placeholder="Short Description (e.g. Best seller)" value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} />
                  </div>
                  <div className="input-group" style={modalStyles.inputWrapper}>
                    <textarea style={modalStyles.textarea} placeholder="Detailed product information..." value={form.longDescription} onChange={e => setForm({...form, longDescription: e.target.value})} />
                  </div>
              </div>
            </div>

            {/* Trending Toggle - Styled */}
            <div style={modalStyles.toggleContainer} onClick={() => setForm({...form, isTrending: !form.isTrending})}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{...modalStyles.checkbox, backgroundColor: form.isTrending ? '#10b981' : '#e2e8f0', borderColor: form.isTrending ? '#10b981' : '#cbd5e1'}}>
                        {form.isTrending && <Check size={12} color="white" />}
                    </div>
                    <div>
                        <p style={{fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: '6px'}}>
                            Mark as Trending 
                        </p>
                        <p style={{fontSize: '11px', color: '#64748b', margin: '2px 0 0 0'}}>Product will be pinned to top of app</p>
                    </div>
                </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={modalStyles.footer}>
          <button onClick={onClose} style={modalStyles.secondaryBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={modalStyles.primaryBtn}>
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const modalStyles: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", width: "550px", maxHeight: "90vh", borderRadius: "24px", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" },
  
  // Header
  header: { padding: "20px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: 'rgba(255,255,255,0.9)' },
  title: { fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: '-0.02em' },
  subtitle: { fontSize: "13px", color: "#64748b", margin: '2px 0 0 0' },
  closeBtn: { background: "transparent", border: "1px solid #f1f5f9", borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: "pointer", color: "#64748b", transition: '0.2s' },

  // Scroll Area
  scrollArea: { padding: "24px 32px", overflowY: "auto", flex: 1, backgroundColor: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "flex", gap: "16px" },
  
  // Inputs
  label: { fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#fff", transition: "all 0.2s ease" },
  inputClean: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "none", fontSize: "14px", outline: "none", background: "transparent", color: "#0f172a" },
  inputIcon: { position: "absolute", left: "12px", color: "#94a3b8" },
  select: { width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px", border: "none", backgroundColor: "transparent", appearance: "none", outline: "none", fontSize: "14px", color: "#0f172a", cursor: 'pointer' },
  currencySymbol: { paddingLeft: "12px", color: "#94a3b8", fontSize: "14px", fontWeight: 500 },
  inputCurrency: { width: "100%", padding: "10px 12px 10px 4px", borderRadius: "10px", border: "none", fontSize: "14px", outline: "none", background: "transparent", color: "#0f172a", fontWeight: 500 },
  textarea: { width: "100%", padding: "12px", borderRadius: "10px", border: "none", fontSize: "14px", minHeight: "80px", backgroundColor: "transparent", outline: "none", resize: "none", fontFamily: 'inherit' },

  // Tags - Now styled like an input
  tagsContainer: { width: "82%", minHeight: "32px", padding: "4px 30px 4px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", position: 'relative', transition: "all 0.2s ease" },
  tagIcon: { position: "absolute", left: "12px", color: "#94a3b8" },
  tagScroll: { display: 'flex', gap: '6px', flexWrap: 'wrap', width: '100%', paddingLeft: '24px' },
  tagPill: { backgroundColor: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, border: '1px solid #e2e8f0' },
  tagDropdown: { position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: "160px", overflowY: "auto", padding: "6px" },
  tagOption: { padding: "8px 12px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "0.2s" },

  // Images
  uploadBox: { border: "1px dashed #cbd5e1", borderRadius: "12px", height: '140px', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: 'center', gap: "10px", cursor: "pointer", backgroundColor: "#f8fafc", transition: '0.2s' },
  uploadIconCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  previewBox: { position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", height: '160px' },
  removeBtn: { position: "absolute", top: "8px", right: "8px", backgroundColor: "white", border: "1px solid #e2e8f0", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  
  galleryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "8px" },
  galleryItem: { position: "relative", aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" },
  galleryOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.2s ease", cursor: "pointer" },
  addGalleryBtn: { aspectRatio: "1/1", borderRadius: "8px", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "#f8fafc", transition: "0.2s ease" },

  // Toggle
  toggleContainer: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', backgroundColor: '#f8fafc' },
  checkbox: { width: '20px', height: '20px', borderRadius: '6px', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },

  // Footer
  footer: { padding: "16px 32px", borderTop: "1px solid #f1f5f9", backgroundColor: "#fff", display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  secondaryBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: "14px" },
  primaryBtn: { padding: "10px 24px", borderRadius: "10px", background: "#10b981", color: "white", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "14px", boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }
};