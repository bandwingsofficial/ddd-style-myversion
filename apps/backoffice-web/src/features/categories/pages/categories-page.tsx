'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCategories } from '../hooks/use-categories';
import CategoryTable from '../components/category-table';
import CreateCategoryModal from '../components/create-category-modal';

export default function CategoriesPage() {
  const { categories, loading, refresh } = useCategories();
  const [open, setOpen] = useState(false);

  return (
    // 1. PAGE CONTAINER
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans">
      
      {/* 2. PAGE HEADER SECTION */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Super Admin Control Panel | Manage product categories
          </p>
        </div>

        {/* 3. ACTION BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
        >
          {/* Icon with subtle semi-transparent background */}
          <div className="flex items-center justify-center rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-90">
            <Plus size={16} strokeWidth={3} />
          </div>
          Create Category
        </button>
      </div>

      {/* 4. CONTENT SECTION */}
      {/* The CategoryTable now has its own 'Card' styling, so we place it directly here */}
      <div className="fade-in animate-in duration-500">
        <CategoryTable
          categories={categories}
          loading={loading}
          onRefresh={refresh}
        />
      </div>

      {/* 5. MODAL */}
      <CreateCategoryModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}