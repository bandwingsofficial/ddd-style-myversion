'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { Category } from '../types/category.types';
import {
  X,
  Upload,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

interface Props {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCategoryDetailsModal({
  category,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (category && isOpen) {
      setSubtitle(category.subtitle ?? '');
      setImage(null);
      setPreview(category.imageUrl ?? null);
      setRemoveImage(false);
      setError('');
    }
  }, [category, isOpen]);

  if (!isOpen || !category) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    setRemoveImage(false);

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Please choose an image under 10MB.');
      return;
    }

    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);
    setRemoveImage(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    if (subtitle.trim().length > 0 && subtitle.trim().length < 3) {
      setError('Subtitle must be at least 3 characters.');
      return;
    }

    setError('');

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('subtitle', subtitle.trim());

      if (removeImage) {
        formData.append('removeImage', 'true');
      }

      if (image) {
        formData.append('image', image);
      }

      await CategoriesApi.updateDetails(category.id, formData);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update category details', err);
      setError('Failed to update category details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Edit Category Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-5 py-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form
            id="edit-category-details-form"
            onSubmit={submit}
            className="flex flex-col gap-4"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Category Name
              </label>
              <input
                type="text"
                value={category.name}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Subtitle
              </label>
              <input
                type="text"
                placeholder="e.g. New arrivals"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Cover Image{' '}
                <span className="text-[10px] font-normal lowercase">
                  (max 10mb)
                </span>
              </label>

              <div
                className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all hover:bg-slate-50 hover:border-emerald-400/50 ${
                  preview
                    ? 'border-solid border-slate-300 p-0'
                    : 'border-slate-200 bg-slate-50/30 p-6'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />

                {preview ? (
                  <div className="group relative h-48 w-full bg-slate-100">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-md ring-1 ring-slate-200 transition-transform hover:scale-110 hover:bg-red-50 active:scale-95"
                      title="Remove Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-slate-200 p-2.5">
                      <Upload size={18} className="text-slate-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700">
                        Click to upload image
                      </p>
                      <p className="text-[10px] text-slate-400">
                        SVG, PNG, JPG or GIF
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {removeImage && (
                <p className="text-xs text-amber-600">
                  Image will be removed when you save changes.
                </p>
              )}
            </div>
          </form>
        </div>

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
            form="edit-category-details-form"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
