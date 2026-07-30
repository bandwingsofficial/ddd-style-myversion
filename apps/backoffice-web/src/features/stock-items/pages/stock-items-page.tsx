'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { useStockItems } from '../hooks/use-stock-items';
import StockItemsTable from '../components/stock-items-table';
import CreateStockItemModal from '../components/create-stock-item-modal';

export default function StockItemsPage() {
  const {
    stockItems,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    setPage,
    refresh,
  } = useStockItems();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Stock Items
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage stock item catalog, units, and availability.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
        >
          <div className="flex items-center justify-center rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-90">
            <Plus size={16} strokeWidth={3} />
          </div>
          Create Stock Item
        </button>
      </div>

      <StockItemsTable
        stockItems={stockItems}
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

      <CreateStockItemModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
