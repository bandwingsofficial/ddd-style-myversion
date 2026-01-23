'use client';

import { useState, useEffect } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { Category } from '../types/category.types';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenameCategoryModal({ category, isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setFeedback(null);
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !name.trim()) return;

    try {
      setLoading(true);
      await CategoriesApi.rename(category.id, name);
      
      // SUCCESS STATE
      setFeedback({ type: 'success', message: 'Category renamed successfully' });
      
      // Auto close after delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setFeedback(null); // Reset for next time
      }, 1500);

    } catch (error) {
      console.error(error);
      setFeedback({ 
        type: 'error', 
        message: 'Failed to rename. The category might be closed or removed.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    // 1. OVERLAY (Backdrop)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* 2. MODAL CARD */}
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Rename Category</h2>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-8">
          <form id="rename-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category Name
              </label>
              <input
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                disabled={loading || feedback?.type === 'success'}
                placeholder={category.name}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">
                Changing the name will update it across the entire store immediately.
              </p>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <button
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="submit" 
            form="rename-form"
            disabled={loading || !name.trim() || feedback?.type === 'success'}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* 3. FEEDBACK OVERLAY (Success/Error) */}
        {/* This sits ON TOP of the modal content if feedback exists */}
        {feedback && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-[2px] animate-in fade-in duration-200">
            
            {feedback.type === 'success' ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <CheckCircle size={48} className="text-green-600 dark:text-green-500 animate-in zoom-in duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Success!</h3>
                  <p className="text-sm text-muted-foreground">{feedback.message}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                  <AlertCircle size={48} className="text-destructive animate-in shake duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Error</h3>
                  <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                    {feedback.message}
                  </p>
                </div>
                <button 
                  onClick={() => setFeedback(null)}
                  className="mt-2 rounded-lg border border-border bg-background px-6 py-2 text-sm font-semibold shadow-sm hover:bg-muted"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}