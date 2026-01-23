"use client";

import { useInventory } from "../hooks/use-inventory";
import InventoryRowActions from "./inventory-row-actions";
import { RefreshCw, Layers, SearchX, PackageOpen } from "lucide-react";

interface InventoryTableProps {
  searchQuery?: string;
}

export default function InventoryTable({ searchQuery = "" }: InventoryTableProps) {
  const { inventory, loading, refresh } = useInventory();

  // Filter inventory based on search query
  const filteredInventory = inventory.filter((item: any) =>
    item.stockName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.stockItemId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <RefreshCw size={32} className="mb-3 animate-spin text-primary" />
        <p className="font-medium animate-pulse">Syncing Inventory Levels...</p>
      </div>
    );
  }

  // 2. EMPTY STATE (When API returns empty array initially)
  if (!loading && inventory.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
           <div className="mb-4 rounded-full bg-muted p-4">
              <PackageOpen size={40} className="text-muted-foreground/50" />
           </div>
           <h3 className="text-lg font-bold text-foreground">No Inventory Yet</h3>
           <p className="text-sm">Initialize your first stock item to get started.</p>
        </div>
     )
  }

  // 3. TABLE RENDER
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        {/* HEADER */}
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Item</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Available</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-border">
          {filteredInventory.map((item) => {
            const isLow = item.availableQty.value < 10;
            const isActive = item.status === "ACTIVE";

            return (
              <tr 
                key={item.id} 
                className="group bg-background transition-colors hover:bg-muted/30"
              >
                {/* NAME */}
                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Layers size={14} />
                    </div>
                    <span className="font-bold text-foreground">{item.stockName}</span>
                  </div>
                </td>

                {/* UNIT */}
                <td className="px-6 py-4 align-middle">
                  <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground uppercase">
                    {item.unit}
                  </span>
                </td>

                {/* AVAILABLE */}
                <td className="px-6 py-4 align-middle">
                  <div className={`font-bold ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                    {item.availableQty.value}
                    {isLow && (
                       <span className="ml-2 inline-block h-2 w-2 rounded-full bg-destructive animate-pulse" title="Low Stock Warning" />
                    )}
                  </div>
                </td>

                {/* TOTAL */}
                <td className="px-6 py-4 align-middle">
                  <div className="font-semibold text-muted-foreground">
                    {item.totalQty.value}
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-6 py-4 align-middle">
                  <span className={`
                    inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide
                    ${isActive 
                      ? "bg-green-500/10 text-green-600" 
                      : "bg-slate-100 text-slate-500"}
                  `}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-slate-400"}`} />
                    {item.status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4 align-middle">
                   {/* We wrap the actions component to ensure it aligns right */}
                   <div className="flex justify-end">
                      <InventoryRowActions item={item} onActionComplete={refresh} />
                   </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 4. EMPTY SEARCH RESULTS */}
      {!loading && inventory.length > 0 && filteredInventory.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <SearchX size={48} className="mb-4 text-muted-foreground/30" />
          <p className="font-medium text-foreground">No items found matching "{searchQuery}"</p>
          <p className="text-sm">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}