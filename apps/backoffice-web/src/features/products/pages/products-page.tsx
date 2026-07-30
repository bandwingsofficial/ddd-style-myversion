'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { useActiveCategories } from '../hooks/use-active-categories';
import { useProducts } from '../hooks/use-products';
import ProductsTable from '../components/products-table';
import CreateProductModal from '../components/create-product-modal';

export default function ProductsPage() {
  const {
    products,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    categoryId,
    status,
    setSearch,
    setCategoryId,
    setStatus,
    setPage,
    refresh,
  } = useProducts();

  const {
    activeCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useActiveCategories();

  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Products
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage product catalog, pricing, media, and availability.
        </p>
      </div>

      <ProductsTable
        products={products}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        search={search}
        categoryId={categoryId}
        status={status}
        activeCategories={activeCategories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCategoryChange={(value) => {
          setCategoryId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onRefresh={refresh}
        onCreateClick={() => setOpen(true)}
      />

      <CreateProductModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={refresh}
        activeCategories={activeCategories}
      />
    </div>
  );
}
