'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { useInventory } from '../hooks/use-inventory';
import InventoryTable from '../components/inventory-table';
import InitializeInventoryModal from '../components/initialize-inventory-modal';

export default function InventoryPage() {
  const {
    items,
    allItems,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    setPage,
    refresh,
  } = useInventory();

  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage central stock levels, adjustments, and transfers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
        >
          <div className="flex items-center justify-center rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-90">
            <Plus size={16} strokeWidth={3} />
          </div>
          Initialize Inventory
        </button>
      </div>

      <InventoryTable
        items={items}
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

      <InitializeInventoryModal
        open={open}
        initializedStockItemIds={allItems.map((item) => item.stockItemId)}
        onClose={() => setOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
