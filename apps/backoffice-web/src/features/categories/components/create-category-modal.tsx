'use client';

import { useState, ChangeEvent } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { X, Upload, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';

export default function CreateCategoryModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sortOrder, setSortOrder] = useState('1');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File is too large. Please choose an image under 5MB.');
        return;
      }
      setImage(file);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!name.trim() || !subtitle.trim()) return;
    setError('');

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('subtitle', subtitle.trim());
      formData.append('sortOrder', sortOrder || '1');
      
      if (image) {
        formData.append('image', image);
      }

      await CategoriesApi.create(formData);
      
      // Reset & Close
      setName('');
      setSubtitle('');
      setSortOrder('1');
      setImage(null);
      setError('');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to create category", err);
      if (err.response?.status === 413) {
        setError('Image is still too large for the server. Try a smaller file.');
      } else {
        setError('Failed to create category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. OVERLAY (Backdrop Blur)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* 2. MODAL CONTAINER */}
      <div 
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Create Category</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form id="create-category-form" onSubmit={submit} className="flex flex-col gap-5">
            
            {/* NAME INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Hot Drinks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* SUBTITLE INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Subtitle <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. New arrivals"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* SORT ORDER */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* FILE UPLOAD */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cover Image <span className="text-[10px] font-normal lowercase">(max 5mb)</span>
              </label>
              
              <div className={`
                relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed 
                bg-muted/30 p-8 text-center transition-all hover:bg-muted/50 hover:border-primary/50
                ${error && !image ? 'border-destructive/50 bg-destructive/5' : 'border-border'}
              `}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                
                {image ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-3">
                      <ImageIcon size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{image.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(image.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setImage(null);
                      }}
                      className="mt-2 text-xs font-bold text-destructive hover:underline"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-muted p-3">
                      <Upload size={20} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Click to upload</p>
                      <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <button
            onClick={onClose}
            type="button"
            disabled={loading}
            className="rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            form="create-category-form"
            type="submit"
            disabled={loading || !name || !subtitle}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>

      </div>
    </div>
  );
}