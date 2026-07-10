'use client';

import { useState } from 'react';
import { Category } from '../types/category.types';
import StatusToggle from './status-toggle';
import {
  Pencil,
  Image as ImageIcon,
  ImageOff,
  Settings2,
  Loader2,
} from 'lucide-react';
import RenameCategoryModal from './rename-category-modal';
import EditCategoryDetailsModal from './edit-category-details-modal';
import { CategoriesApi } from '../api/categories.api';

interface Props {
  categories: Category[];
  loading: boolean;
  error?: string | null;
  onRefresh: () => void;
  onOptimisticUpdate?: (
    categoryId: string,
    patch: Partial<Category>,
  ) => void;
}

export default function CategoryTable({
  categories,
  loading,
  error,
  onRefresh,
  onOptimisticUpdate,
}: Props) {
  const [renamingCategory, setRenamingCategory] =
    useState<Category | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);
  const [sortSavingId, setSortSavingId] = useState<string | null>(null);
  const [sortDrafts, setSortDrafts] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground">
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-center shadow-sm">
        <h3 className="font-semibold text-foreground">{error}</h3>
        <button
          onClick={onRefresh}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-border bg-card text-center shadow-sm">
        <div className="rounded-full bg-muted p-4 mb-3">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">No categories found</h3>
        <p className="text-sm text-muted-foreground">
          Add a new category to get started.
        </p>
      </div>
    );
  }

  const getSortDraft = (category: Category) =>
    sortDrafts[category.id] ?? String(category.sortOrder);

  const saveSortOrder = async (category: Category) => {
    const draft = getSortDraft(category);
    const nextSortOrder = Number.parseInt(draft, 10);

    if (Number.isNaN(nextSortOrder) || nextSortOrder < 0) {
      return;
    }

    if (nextSortOrder === category.sortOrder) {
      return;
    }

    try {
      setSortSavingId(category.id);
      onOptimisticUpdate?.(category.id, { sortOrder: nextSortOrder });
      await CategoriesApi.changeSortOrder(category.id, nextSortOrder);
      onRefresh();
    } catch (err) {
      console.error('Failed to update sort order', err);
      onRefresh();
    } finally {
      setSortSavingId(null);
    }
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Image
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Category Name
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Subtitle
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sort Order
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {categories.map((cat) => {
                const isActive = cat.status === 'ACTIVE';
                const isInactive = !isActive;

                return (
                  <tr
                    key={cat.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    <td className="px-6 py-4 align-middle">
                      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                        {cat.imageUrl ? (
                          <>
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback =
                                  e.currentTarget
                                    .nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="absolute inset-0 hidden items-center justify-center bg-muted">
                              <ImageOff className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-middle font-semibold text-foreground">
                      {cat.name}
                    </td>

                    <td className="px-6 py-4 align-middle text-muted-foreground">
                      <div
                        className="max-w-[200px] truncate"
                        title={cat.subtitle || ''}
                      >
                        {cat.subtitle || '-'}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          disabled={isInactive || sortSavingId === cat.id}
                          value={getSortDraft(cat)}
                          onChange={(e) =>
                            setSortDrafts((current) => ({
                              ...current,
                              [cat.id]: e.target.value,
                            }))
                          }
                          onBlur={() => saveSortOrder(cat)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {sortSavingId === cat.id && (
                          <Loader2
                            size={14}
                            className="animate-spin text-muted-foreground"
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          isActive
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {isActive ? 'Active' : 'Closed'}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <StatusToggle
                          category={cat}
                          onChange={onRefresh}
                          onOptimisticUpdate={onOptimisticUpdate}
                        />

                        <button
                          disabled={isInactive}
                          onClick={() => setEditingCategory(cat)}
                          title={
                            isInactive
                              ? 'Cannot edit inactive category'
                              : 'Edit subtitle and image'
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                            isInactive
                              ? 'cursor-not-allowed border-transparent bg-muted/50 text-muted-foreground/30'
                              : 'cursor-pointer border-input bg-background text-muted-foreground shadow-sm hover:border-primary hover:text-primary'
                          }`}
                        >
                          <Settings2 size={14} />
                        </button>

                        <button
                          disabled={isInactive}
                          onClick={() => setRenamingCategory(cat)}
                          title={
                            isInactive
                              ? 'Cannot rename inactive category'
                              : 'Rename category'
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                            isInactive
                              ? 'cursor-not-allowed border-transparent bg-muted/50 text-muted-foreground/30'
                              : 'cursor-pointer border-input bg-background text-muted-foreground shadow-sm hover:border-primary hover:text-primary'
                          }`}
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
        isOpen={!!renamingCategory}
        category={renamingCategory}
        onClose={() => setRenamingCategory(null)}
        onSuccess={onRefresh}
      />

      <EditCategoryDetailsModal
        isOpen={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={onRefresh}
      />
    </>
  );
}
