'use client';

import { useMemo, useState } from 'react';
import {
  Boxes,
  Loader2,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { IconActionButton } from '@/components/ui/icon-action-button';
import SmartDeleteDialogs from '@/components/ui/smart-delete-dialogs';
import { useSmartDelete } from '@/hooks/use-smart-delete';
import { StockItemsApi } from '../api/stock-items.api';
import { StockItem } from '../types/stock-item.types';
import StockItemsTableSkeleton from './stock-items-table-skeleton';
import EditStockItemModal from './edit-stock-item-modal';

interface Props {
  stockItems: StockItem[];
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

function StockItemCells({
  item,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  showEdit = false,
  actionLoadingId,
}: {
  item: StockItem;
  onEdit?: (item: StockItem) => void;
  onDeactivate?: (item: StockItem) => void;
  onActivate?: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
  showEdit?: boolean;
  actionLoadingId?: string | null;
}) {
  const isActive = item.status === 'ACTIVE';
  const isLoading = actionLoadingId === item.id;

  return (
    <>
      <td className="px-6 py-4 align-middle font-semibold text-foreground">
        {item.name}
      </td>
      <td className="px-6 py-4 align-middle font-mono text-xs text-muted-foreground">
        {item.sku}
      </td>
      <td className="px-6 py-4 align-middle">
        <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-semibold text-foreground">
          {item.unit}
        </span>
      </td>
      <td className="px-6 py-4 align-middle text-muted-foreground">
        {item.currentQuantity}
      </td>
      <td className="px-6 py-4 align-middle">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </td>
      <td className="px-6 py-4 align-middle text-right">
        <div className="flex items-center justify-end gap-2">
          {showEdit && (
            <button
              onClick={() => onEdit?.(item)}
              title="Edit stock item"
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm hover:border-primary hover:text-primary"
            >
              <span className="inline-flex items-center gap-1">
                <Pencil size={14} /> Edit
              </span>
            </button>
          )}

          {isActive ? (
            <button
              onClick={() => onDeactivate?.(item)}
              disabled={isLoading}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm hover:border-amber-500 hover:text-amber-600 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1">
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <PowerOff size={14} />
                )}
                Deactivate
              </span>
            </button>
          ) : (
            <button
              onClick={() => onActivate?.(item)}
              disabled={isLoading}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1">
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Power size={14} />
                )}
                Activate
              </span>
            </button>
          )}

          <button
            onClick={() => onDelete(item)}
            disabled={isLoading}
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1">
              <Trash2 size={14} /> Delete
            </span>
          </button>
        </div>
      </td>
    </>
  );
}

export default function StockItemsTable({
  stockItems,
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
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const deleteConfirm = useSmartDelete<StockItem>({
    deleteFn: (item, options) =>
      StockItemsApi.delete(item.id, { force: options?.force }),
    successMessage: 'Stock item deleted successfully.',
    errorMessage: 'Failed to delete stock item.',
    getItemLabel: (item) => item.name,
    onSuccess: () => {
      if (stockItems.length === 1 && page > 1) {
        onPageChange(page - 1);
      } else {
        onRefresh();
      }
    },
  });

  const { activeItems, inactiveItems } = useMemo(() => {
    const active = stockItems.filter((item) => item.status === 'ACTIVE');
    const inactive = stockItems.filter((item) => item.status === 'INACTIVE');

    return {
      activeItems: active,
      inactiveItems: inactive,
    };
  }, [stockItems]);

  const handleStatusChange = async (
    item: StockItem,
    status: 'ACTIVE' | 'INACTIVE',
  ) => {
    setActionLoadingId(item.id);

    try {
      await StockItemsApi.updateStatus(item.id, status);
      toast.success(
        status === 'ACTIVE'
          ? 'Stock item activated successfully.'
          : 'Stock item deactivated successfully.',
      );
      onRefresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to update stock item status.',
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    await deleteConfirm.confirm();
  };

  if (loading) {
    return <StockItemsTableSkeleton />;
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

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by stock item name or SKU"
          className="h-12 w-full max-w-md rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <p className="text-sm text-muted-foreground">
          {total} stock item{total === 1 ? '' : 's'}
        </p>
      </div>

      {stockItems.length === 0 ? (
        <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-border bg-card text-center shadow-sm">
          <div className="mb-3 rounded-full bg-muted p-4">
            <Boxes className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">No stock items found.</h3>
          <p className="text-sm text-muted-foreground">
            Create your first stock item.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Stock Item
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Unit
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Current Quantity
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
                {activeItems.map((item) => (
                  <tr key={item.id} className="group bg-background">
                    <StockItemCells
                      item={item}
                      onEdit={setEditingItem}
                      onDeactivate={(target) =>
                        handleStatusChange(target, 'INACTIVE')
                      }
                      onDelete={deleteConfirm.open}
                      showEdit
                      actionLoadingId={actionLoadingId}
                    />
                  </tr>
                ))}

                {inactiveItems.map((item) => (
                  <tr key={item.id} className="group bg-muted/20">
                    <StockItemCells
                      item={item}
                      onActivate={(target) =>
                        handleStatusChange(target, 'ACTIVE')
                      }
                      onDelete={deleteConfirm.open}
                      actionLoadingId={actionLoadingId}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-input px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-input px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <EditStockItemModal
        stockItem={editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={onRefresh}
      />

      <SmartDeleteDialogs
        entityName="Stock Item"
        itemLabel={deleteConfirm.itemLabel}
        showInitial={
          !!deleteConfirm.target &&
          !deleteConfirm.forceAnalysis &&
          !deleteConfirm.blockedAnalysis
        }
        initialDescription="This action is permanent. Any associated uploaded files or images will also be deleted."
        forceAnalysis={deleteConfirm.forceAnalysis}
        blockedAnalysis={deleteConfirm.blockedAnalysis}
        blockedMessage={deleteConfirm.blockedMessage}
        loading={deleteConfirm.loading}
        onCancel={deleteConfirm.close}
        onConfirm={() => void deleteConfirm.confirm()}
        onConfirmForce={() => void deleteConfirm.confirmForce()}
        onCloseBlocked={deleteConfirm.closeBlocked}
        onCloseForce={deleteConfirm.closeForce}
      />
    </>
  );
}
