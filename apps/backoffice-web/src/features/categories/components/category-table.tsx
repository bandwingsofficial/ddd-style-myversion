'use client';

import { useState } from 'react';
import { Category } from '../types/category.types';
import StatusToggle from './status-toggle';
import { Pencil, Image as ImageIcon, ImageOff } from 'lucide-react';
import RenameCategoryModal from './rename-category-modal';

// 🟢 Recommendation: Move this to a .env file later (NEXT_PUBLIC_API_URL)
const BASE_IMAGE_URL = 'https://api.dev.local:4000/'; 

interface Props {
  categories: Category[];
  loading: boolean;
  onRefresh: () => void;
}

export default function CategoryTable({ categories, loading, onRefresh }: Props) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 1. Loading State (Centered & Styled)
  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground">
        Loading data...
      </div>
    );
  }

  // 2. Empty State (Good UX)
  if (categories.length === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-border bg-card text-center shadow-sm">
        <div className="rounded-full bg-muted p-4 mb-3">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">No categories found</h3>
        <p className="text-sm text-muted-foreground">Add a new category to get started.</p>
      </div>
    );
  }

  return (
    <>
      {/* 3. TABLE CONTAINER (Card Style) */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            {/* TABLE HEADER */}
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Image</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Subtitle</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-border">
              {categories.map((cat) => {
                const isActive = (cat.status?.toString().toUpperCase() === 'ACTIVE') || (cat.isActive === true);
                const isInactive = !isActive;

                // URL Logic
                const imageSrc = cat.imagePath 
                  ? (cat.imagePath.startsWith('http') ? cat.imagePath : `${BASE_IMAGE_URL}${cat.imagePath}`)
                  : null;

                return (
                  <tr 
                    key={cat.id} 
                    className="group transition-colors hover:bg-muted/40"
                  >
                    {/* IMAGE COLUMN */}
                    <td className="px-6 py-4 align-middle">
                      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                        {imageSrc ? (
                          <>
                            <img 
                              src={imageSrc} 
                              alt={cat.name} 
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if(fallback) fallback.style.display = 'flex';
                              }}
                            />
                            {/* Fallback (Hidden by default) */}
                            <div className="absolute inset-0 hidden items-center justify-center bg-muted">
                              <ImageOff className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </td>

                    {/* NAME COLUMN */}
                    <td className="px-6 py-4 align-middle font-semibold text-foreground">
                      {cat.name}
                    </td>

                    {/* SUBTITLE COLUMN */}
                    <td className="px-6 py-4 align-middle text-muted-foreground">
                      <div className="max-w-[200px] truncate" title={cat.subtitle || ''}>
                        {cat.subtitle || '-'}
                      </div>
                    </td>

                    {/* STATUS COLUMN */}
                    <td className="px-6 py-4 align-middle">
                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border
                        ${isActive 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'bg-muted text-muted-foreground border-border'}
                      `}>
                        {isActive ? 'Active' : 'Closed'}
                      </span>
                    </td>

                    {/* ACTIONS COLUMN */}
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-3">
                        <StatusToggle category={cat} onChange={onRefresh} />
                        
                        <button 
                          disabled={isInactive}
                          onClick={() => setEditingCategory(cat)}
                          title={isInactive ? "Cannot edit inactive category" : "Rename category"}
                          className={`
                            flex h-8 w-8 items-center justify-center rounded-lg border transition-all
                            ${isInactive 
                              ? 'cursor-not-allowed border-transparent bg-muted/50 text-muted-foreground/30' 
                              : 'cursor-pointer border-input bg-background text-muted-foreground shadow-sm hover:border-primary hover:text-primary'}
                          `}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RenameCategoryModal 
        isOpen={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={onRefresh}
      />
    </>
  );
}