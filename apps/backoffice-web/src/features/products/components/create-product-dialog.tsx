"use client";

import { useState, useEffect, useRef } from "react";
import { ProductsAPI } from "../services/products.api";
import { InventoryAPI } from "@/features/inventory/api/inventory.api";
import { X, ClipboardList, Upload, Trash2, Plus, Tag, Layers, ChevronDown, Check, ImagePlus, DollarSign } from "lucide-react";
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
    // 1. OVERLAY
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* 2. MODAL CARD */}
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.98 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        className="w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-3xl bg-background shadow-2xl ring-1 ring-border"
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-8 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Add New Product</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the details to create a product</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={20}/>
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col gap-6">
            
            {/* ROW 1: CATEGORY & STOCK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category <span className="text-destructive">*</span></label>
                <div className="relative">
                  <Layers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select 
                    className="w-full appearance-none rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={form.categoryId} 
                    onChange={e => setForm({...form, categoryId: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Link <span className="text-destructive">*</span></label>
                <div className="relative">
                  <ClipboardList size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select 
                    className="w-full appearance-none rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={form.stockItemId} 
                    onChange={e => setForm({...form, stockItemId: e.target.value})}
                  >
                    <option value="">Select Stock Item</option>
                    {stockItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* PRODUCT NAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name <span className="text-destructive">*</span></label>
              <input 
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="e.g. Alphonso Mango" 
                value={form.productName} 
                onChange={e => setForm({...form, productName: e.target.value})} 
              />
            </div>

            {/* ROW 2: PRICES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Price <span className="text-destructive">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</div>
                  <input 
                    type="number" 
                    className="w-full rounded-xl border border-input bg-background py-3 pl-9 pr-4 text-sm font-bold outline-none transition-all placeholder:font-normal focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="0.00" 
                    value={form.originalPrice || ''} 
                    onChange={e => setForm({...form, originalPrice: +e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discount Price</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</div>
                  <input 
                    type="number" 
                    className="w-full rounded-xl border border-input bg-background py-3 pl-9 pr-4 text-sm font-bold outline-none transition-all placeholder:font-normal focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="0.00" 
                    value={form.discountPrice || ''} 
                    onChange={e => setForm({...form, discountPrice: +e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* ROW 3: UNITS & TAGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</label>
                  <input 
                    type="number" 
                    className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={form.unitValue} 
                    onChange={e => setForm({...form, unitValue: +e.target.value})} 
                  />
                </div>
                <div className="w-24 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</label>
                  <select 
                    className="w-full rounded-xl border border-input bg-background px-2 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={form.unitType} 
                    onChange={e => setForm({...form, unitType: e.target.value})}
                  >
                    {['PCS', 'KG', 'LTR', 'GM', 'ML'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* TAGS SELECTOR */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags</label>
                <div 
                  className="flex min-h-[46px] w-full cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 transition-all hover:border-primary/50"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                >
                  <Tag size={16} className="text-muted-foreground mr-1" />
                  {form.tags.length === 0 ? (
                    <span className="text-sm text-muted-foreground/60">Select tags...</span>
                  ) : (
                    form.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[11px] font-bold text-foreground uppercase tracking-wide border border-border">
                        {tag.replace(/_/g, " ")}
                      </span>
                    ))
                  )}
                  <ChevronDown size={14} className="ml-auto text-muted-foreground" />
                </div>

                {/* TAGS DROPDOWN */}
                <AnimatePresence>
                  {showTagDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowTagDropdown(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 top-[110%] z-20 max-h-48 overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-xl"
                      >
                        {PREDEFINED_TAGS.map(tag => {
                          const isSelected = form.tags.includes(tag);
                          return (
                            <div 
                              key={tag} 
                              onClick={() => toggleTag(tag)}
                              className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}
                            >
                              <span>{tag.replace(/_/g, " ")}</span>
                              {isSelected && <Check size={14} />}
                            </div>
                          )
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* IMAGES SECTION */}
            <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ImagePlus size={16} /> Media
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Image <span className="text-destructive">*</span></label>
                <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={handleMainImageUpload} />
                
                {!form.mainImagePreview ? (
                  <div 
                    onClick={() => mainImageRef.current?.click()}
                    className="flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-background transition-all hover:bg-muted hover:border-primary/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Upload size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">Click to upload main image</p>
                      <p className="text-xs text-muted-foreground">SVG, PNG, JPG (Max 800x800px)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
                    <img src={form.mainImagePreview} className="h-full w-full object-cover" alt="Main" />
                    <button 
                      onClick={() => setForm({...form, mainImage: null, mainImagePreview: ""})}
                      className="absolute right-2 top-2 flex items-center gap-1 rounded-lg border border-destructive/20 bg-background/95 px-2 py-1.5 text-xs font-bold text-destructive shadow-sm hover:bg-destructive/10"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gallery ({form.galleryImages.length})</label>
                <input type="file" multiple hidden ref={galleryInputRef} accept="image/*" onChange={handleGalleryUpload} />
                
                <div className="grid grid-cols-4 gap-3">
                  {form.galleryPreviews.map((src, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                      <img src={src} className="h-full w-full object-cover" alt="Gallery" />
                      <div 
                        onClick={() => removeGalleryImage(i)}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 size={18} className="text-white" />
                      </div>
                    </div>
                  ))}
                  <div 
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-background transition-colors hover:bg-muted hover:border-primary/50"
                  >
                    <Plus size={24} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* DESCRIPTIONS */}
            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Short Description</label>
                 <input 
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="e.g. Best seller, Seasonal favorite" 
                    value={form.shortDescription} 
                    onChange={e => setForm({...form, shortDescription: e.target.value})} 
                  />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Description</label>
                 <textarea 
                    className="min-h-[100px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="Product details, ingredients, etc..." 
                    value={form.longDescription} 
                    onChange={e => setForm({...form, longDescription: e.target.value})} 
                  />
               </div>
            </div>

            {/* TRENDING TOGGLE */}
            <div 
              onClick={() => setForm({...form, isTrending: !form.isTrending})}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/40"
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${form.isTrending ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 bg-background'}`}>
                {form.isTrending && <Check size={14} strokeWidth={3} />}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Mark as Trending</p>
                <p className="text-xs text-muted-foreground">Product will be pinned to the top of the app.</p>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-8 py-5">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="rounded-xl border border-input bg-background px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}