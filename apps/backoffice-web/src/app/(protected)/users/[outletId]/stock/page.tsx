'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Loader2, Scale, Tag, Store, AlertCircle } from 'lucide-react';import { UsersService, OutletStockRecord } from '@/features/users/users.service';
import { StockItemsApi } from '@/features/stock-items/api/stock-items.api';

export default function OutletStockPage() {
  const router = useRouter();
  const params = useParams();
  const outletId = params?.outletId as string;

  const [stock, setStock] = useState<OutletStockRecord[]>([]);
  const [itemNames, setItemNames] = useState<Record<string, string>>({});
  const [outletName, setOutletName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (outletId) {
      loadData();
    }
  }, [outletId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch Outlet Stock
      const stockPromise = UsersService.getOutletStock(outletId);
      const masterListPromise = StockItemsApi.getAll();
      const outletPromise = UsersService.getOutletById(outletId);

      const [stockItems, masterItems, outlet] = await Promise.all([
        stockPromise,
        masterListPromise,
        outletPromise,
      ]);

      const safeStock = Array.isArray(stockItems) ? stockItems : [];
      setStock(safeStock);

      const nameMap: Record<string, string> = {};
      if (Array.isArray(masterItems)) {
        masterItems.forEach((item) => {
          nameMap[item.id] = item.name;
        });
      }
      setItemNames(nameMap);

      setOutletName(outlet?.name || 'Unknown Outlet');

    } catch (err: any) {
      console.error("Data fetch error:", err);
      const errMsg = err.response?.data?.message || 'Failed to load data.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get name from ID
  const getItemName = (id: string) => {
    return itemNames[id] || id;
  };

  const getStockQuantity = (
    quantity: OutletStockRecord['quantity'] | undefined,
  ) => {
    if (typeof quantity === 'number') {
      return quantity;
    }

    return quantity?.value ?? 0;
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push('/users')}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to Directory
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {loading ? 'Loading outlet...' : outletName}
              </h1>
              <p className="text-sm text-muted-foreground">Outlet stock levels</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {loading && (
            <div className="flex h-80 flex-col items-center justify-center text-muted-foreground">
              <Loader2 size={32} className="mb-3 animate-spin text-primary" />
              <p className="text-sm">Loading stock...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-80 flex-col items-center justify-center p-8 text-center">
              <AlertCircle size={32} className="mb-3 text-destructive" />
              <p className="mb-4 font-medium text-foreground">{error}</p>
              <button
                type="button"
                onClick={loadData}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && stock.length === 0 && (
            <div className="flex h-80 flex-col items-center justify-center text-center">
              <Package size={36} className="text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No stock items found for {outletName}.
              </p>
            </div>
          )}

          {!loading && !error && stock.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Stock Name
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Unit
                    </th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stock.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {getItemName(item.stockItemId)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-bold uppercase text-muted-foreground">
                          <Tag size={12} />
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                          <Scale size={14} />
                          {getStockQuantity(item.quantity)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}