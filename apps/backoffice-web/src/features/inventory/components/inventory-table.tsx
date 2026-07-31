'use client';

import { useState } from 'react';
import { PackageOpen, Search, X } from 'lucide-react';

import { InventoryListItem } from '../types/inventory.types';
import { getQuantityValue } from '../utils/inventory-validation';
import InventoryTableSkeleton from './inventory-table-skeleton';
import InventoryRowActions from './inventory-row-actions';

interface Props {
  items: InventoryListItem[];
  loading: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function InventoryTable({
  items,
  loading,
  error,
  page,
  totalPages,
  total,
  search,
  onSearchChange,
  onPageChange,
  onRefresh,
}: Props) {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  if (loading) {
    return <InventoryTableSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-4 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search inventory..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="text-sm text-muted-foreground lg:whitespace-nowrap">
          {total} item{total === 1 ? '' : 's'}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <PackageOpen size={32} className="text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {search ? 'No matching inventory' : 'No inventory yet'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? 'Try adjusting your search terms.'
              : 'Initialize your first stock item to get started.'}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {[
                    'Stock Item',
                    'Unit',
                    'Available',
                    'Total',
                    'Status',
                    'Actions',
                  ].map((column) => (
                    <th
                      key={column}
                      className={`px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground ${
                        column === 'Actions' ? 'text-right' : ''
                      }`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const available = getQuantityValue(item.availableQty);
                  const totalQty = getQuantityValue(item.totalQty);
                  const isLow = available < 10;
                  const isActive = item.status === 'ACTIVE';

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-muted/30 ${
                        isActive ? 'bg-background' : 'bg-muted/20'
                      }`}
                    >
                      <td className="px-4 py-3 align-middle">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {item.stockName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Current: {item.currentQuantity}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-bold uppercase text-muted-foreground">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`font-bold ${
                            isLow ? 'text-destructive' : 'text-foreground'
                          }`}
                        >
                          {available}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle font-semibold text-muted-foreground">
                        {totalQty}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                            isActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-border bg-muted text-muted-foreground'
                          }`}
                        >
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <InventoryRowActions
                          item={item}
                          disabled={actionLoadingId === item.id}
                          onActionStart={() => setActionLoadingId(item.id)}
                          onActionComplete={() => {
                            setActionLoadingId(null);
                            onRefresh();
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
