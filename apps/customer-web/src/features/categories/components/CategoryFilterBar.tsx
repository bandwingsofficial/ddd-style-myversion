"use client";

import { Category } from "@/features/categories/types";

interface CategoryFilterBarProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelect: (category: Category | null) => void;
  loading?: boolean;
}

export default function CategoryFilterBar({
  categories,
  activeCategoryId,
  onSelect,
  loading = false,
}: CategoryFilterBarProps) {
  if (loading && categories.length === 0) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all touch-target ${
          !activeCategoryId
            ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-700"
        }`}
      >
        All
      </button>

      {categories.map((category) => {
        const isActive = activeCategoryId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all touch-target ${
              isActive
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-700"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
