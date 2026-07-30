'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { useCategories } from '../hooks/use-categories';
import CategoryTable from '../components/category-table';
import CreateCategoryModal from '../components/create-category-modal';

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    setPage,
    refresh,
  } = useCategories();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage category visibility, ordering, and cover images.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
        >
          <div className="flex items-center justify-center rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-90">
            <Plus size={16} strokeWidth={3} />
          </div>
          Create Category
        </button>
      </div>

      <CategoryTable
        categories={categories}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onRefresh={refresh}
      />

      <CreateCategoryModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
