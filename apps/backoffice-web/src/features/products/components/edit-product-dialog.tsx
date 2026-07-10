"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "../types/product.types";
import { ProductsAPI } from "../services/products.api";
import { InventoryAPI } from "@/features/inventory/api/inventory.api";
import { X, ClipboardList, Save, Upload, Trash2, Plus, Layers, Tag, ImagePlus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

type GalleryFormItem = {
  id?: string;
  imageUrl?: string;
  file?: File;
};

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

  const initialGallery: GalleryFormItem[] = (product.images?.galleryImages || []).map(
    (item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
    }),
  );
  const initialGalleryIds = initialGallery.map((item) => item.id!);

  const [form, setForm] = useState({
    categoryId: product.categoryId || "",
    stockItemId: product.stockItemId || "",
    productName: product.name?.value || "",
    originalPrice: product.price?.originalPrice || 0,
    discountPrice: product.price?.discountPrice || 0,
    unitValue: product.unitValue || 1,
    unitType: product.unitType || "PCS",
    tags: product.tags ? product.tags.join(", ") : "",
    mainImage: null as File | null,
    mainImageUrl: product.images?.mainImageUrl || "",
    galleryImages: initialGallery,
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
      setForm((prev) => ({ ...prev, mainImage: e.target.files![0] }));
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({ file }));
      setForm((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...newFiles],
      }));
    }
  };

  const handleGalleryReplace = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    setForm((prev) => {
      const next = [...prev.galleryImages];
      next[index] = { ...next[index], file };
      return { ...prev, galleryImages: next };
    });
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const mainImagePreview = form.mainImage
    ? URL.createObjectURL(form.mainImage)
    : form.mainImageUrl;

  const getGalleryPreview = (item: GalleryFormItem) => {
    if (item.file) {
      return URL.createObjectURL(item.file);
    }

    return item.imageUrl || "";
  };

  const handleUpdate = async () => {
    if (!form.productName || form.originalPrice <= 0) {
      setPopup({ title: "REQUIRED FIELDS", text: "Name and Price are mandatory.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await ProductsAPI.updateDetails(product.id, {
        productName: form.productName,
        originalPrice: form.originalPrice,
        discountPrice: form.discountPrice,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
      });

      if (form.mainImage) {
        await ProductsAPI.replaceMainImage(product.id, form.mainImage);
      }

      const currentExistingIds = form.galleryImages
        .filter((item) => item.id)
        .map((item) => item.id!);

      for (const id of initialGalleryIds) {
        if (!currentExistingIds.includes(id)) {
          await ProductsAPI.deleteGalleryImage(product.id, id);
        }
      }

      let hasAddsOrDeletes =
        currentExistingIds.length !== initialGalleryIds.length ||
        initialGalleryIds.some((id) => !currentExistingIds.includes(id));

      for (const item of form.galleryImages) {
        if (item.file && item.id) {
          await ProductsAPI.replaceGalleryImage(product.id, item.id, item.file);
        } else if (item.file && !item.id) {
          await ProductsAPI.addGalleryImage(product.id, item.file);
          hasAddsOrDeletes = true;
        }
      }

      const orderChanged =
        !hasAddsOrDeletes &&
        currentExistingIds.length === initialGalleryIds.length &&
        currentExistingIds.some((id, index) => id !== initialGalleryIds[index]);

      if (orderChanged) {
        await ProductsAPI.reorderGalleryImages(product.id, currentExistingIds);
      }

      setPopup({ title: "SUCCESS", text: "Product updated successfully.", type: "success" });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-3xl bg-background shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-8 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Edit Product</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update details for <span className="font-bold text-primary">{product.name?.value}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-col gap-1 border-r border-border pr-4">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Layers size={10} /> Category
                </span>
                <span className="text-sm font-semibold text-foreground truncate">
                  {categories.find((c) => c.id === form.categoryId)?.name || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-r border-border px-4">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <ClipboardList size={10} /> Base Item
                </span>
                <span className="text-sm font-semibold text-foreground truncate">
                  {stockItems.find((i) => i.id === form.stockItemId)?.name || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1 pl-4">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Tag size={10} /> Unit
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {form.unitValue} {form.unitType}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name</label>
              <input
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Price <span className="text-destructive">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</div>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-input bg-background py-3 pl-9 pr-4 text-sm font-bold outline-none transition-all placeholder:font-normal focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: +e.target.value })}
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
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: +e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border" />

            <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ImagePlus size={16} /> Media
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Image</label>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-background">
                    {mainImagePreview ? (
                      <img src={mainImagePreview} className="h-full w-full object-cover" alt="Main" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No Image</div>
                    )}
                    <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={handleMainImageUpload} />
                    <button
                      onClick={() => mainImageRef.current?.click()}
                      className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg border border-border bg-background/95 px-2 py-1.5 text-xs font-bold text-foreground shadow-sm hover:bg-muted"
                    >
                      <Upload size={12} /> Edit
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gallery ({form.galleryImages.length})</label>
                  <input type="file" multiple hidden ref={galleryInputRef} accept="image/*" onChange={handleGalleryUpload} />

                  <div className="grid grid-cols-4 gap-2">
                    {form.galleryImages.map((item, i) => {
                      const previewSrc = getGalleryPreview(item);
                      return (
                        <div key={item.id || `new-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-background">
                          <img src={previewSrc} className="h-full w-full object-cover" alt="Gallery" />
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleGalleryReplace(i, e)}
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                (e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement)?.click();
                              }}
                              className="rounded bg-white/90 p-1 text-slate-800"
                            >
                              <Upload size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(i)}
                              className="rounded bg-white/90 p-1 text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-background transition-colors hover:bg-muted hover:border-primary/50"
                    >
                      <Plus size={20} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Short Description</label>
                <input
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Brief highlight..."
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Long Description</label>
                <textarea
                  className="min-h-[100px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Detailed product information..."
                  value={form.longDescription}
                  onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-8 py-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-input bg-background px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Updating...
              </>
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {popup && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-background p-6 shadow-2xl ring-1 ring-border text-center"
              >
                <div className="mb-4 flex justify-center">
                  {popup.type === 'success' ? (
                    <div className="rounded-full bg-green-100 p-3 text-green-600">
                      <CheckCircle2 size={40} />
                    </div>
                  ) : (
                    <div className="rounded-full bg-red-100 p-3 text-red-600">
                      <AlertCircle size={40} />
                    </div>
                  )}
                </div>
                <h3 className={`text-lg font-bold ${popup.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {popup.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{popup.text}</p>
                <button
                  onClick={() => setPopup(null)}
                  className={`mt-6 w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-transform active:scale-95 ${popup.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                >
                  {popup.type === 'success' ? 'Continue' : 'Close'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
