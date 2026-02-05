'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { X, Upload, Image as ImageIcon, AlertCircle, Loader2, Trash2 } from 'lucide-react';

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
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cleanup preview URL on unmount or when preview changes to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
      // Generate preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop click from triggering the file input
    setImage(null);
    setPreview(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setPreview(null);
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
    // 1. OVERLAY
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* 2. MODAL CONTAINER */}
      <div 
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
          <h2 className="text-base font-bold tracking-tight text-slate-900">Create Category</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[80vh] overflow-y-auto px-5 py-5">
          
          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form id="create-category-form" onSubmit={submit} className="flex flex-col gap-4">
            
            {/* NAME INPUT */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Hot Drinks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* SUBTITLE INPUT */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Subtitle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. New arrivals"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* SORT ORDER */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* FILE UPLOAD & PREVIEW */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Cover Image <span className="text-[10px] font-normal lowercase">(max 5mb)</span>
              </label>
              
              <div className={`
                relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed 
                transition-all hover:bg-slate-50 hover:border-emerald-400/50
                ${error && !image ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-slate-50/30'}
                ${preview ? 'p-0 border-solid border-slate-300' : 'p-6'}
              `}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  disabled={!!preview} // Disable clicking input when image is set
                />
                
                {preview ? (
                  <div className="group relative h-48 w-full bg-slate-100">
                    {/* The Image Preview */}
                    <img 
                        src={preview} 
                        alt="Preview" 
                        className="h-full w-full object-contain"
                    />
                    
                    {/* Always visible 'X' Remove button at Top-Right */}
                    <button 
                        type="button"
                        onClick={removeImage}
                        className="absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-md ring-1 ring-slate-200 transition-transform hover:scale-110 hover:bg-red-50 active:scale-95"
                        title="Remove Image"
                    >
                        <Trash2 size={16} />
                    </button>

                    {/* Optional Center Overlay on Hover */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="px-2 text-center text-xs font-medium text-white drop-shadow-md">
                            {image?.name}
                        </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-slate-200 p-2.5">
                      <Upload size={18} className="text-slate-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700">Click to upload image</p>
                      <p className="text-[10px] text-slate-400">SVG, PNG, JPG or GIF</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <button
            onClick={onClose}
            type="button"
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            form="create-category-form"
            type="submit"
            disabled={loading || !name || !subtitle}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>

      </div>
    </div>
  );
}