'use client';

import { useMemo, useState } from 'react';
import {
  ImageOff,
  Package,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RotateCcw,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { IconActionButton } from '@/components/ui/icon-action-button';
import { Select } from '@/components/ui/select';
import SmartDeleteDialogs from '@/components/ui/smart-delete-dialogs';
import { useSmartDelete } from '@/hooks/use-smart-delete';
import { Category } from '@/features/categories/types/category.types';
import { ProductsApi } from '../api/products.api';
import { Product, ProductStatus } from '../types/product.types';
import ProductsTableSkeleton from './products-table-skeleton';
import EditProductModal from './edit-product-modal';

interface Props {
  products: Product[];
  loading: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  total: number;
  search: string;
  categoryId: string;
  status: ProductStatus | '';
  activeCategories: Category[];
  categoriesLoading?: boolean;
  categoriesError?: string | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: ProductStatus | '') => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onCreateClick: () => void;
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'SOFT_DELETED', label: 'Deleted' },
];

function getStatusBadgeClass(status: ProductStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'OUT_OF_STOCK':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'ARCHIVED':
    case 'SOFT_DELETED':
      return 'border-slate-300 bg-slate-100 text-slate-600';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}

function ProductCells({
  product,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  onRestore,
  onTrendingToggle,
  showEdit = false,
  actionLoadingId,
}: {
  product: Product;
  onEdit?: (product: Product) => void;
  onDeactivate?: (product: Product) => void;
  onActivate?: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRestore?: (product: Product) => void;
  onTrendingToggle: (product: Product) => void;
  showEdit?: boolean;
  actionLoadingId?: string | null;
}) {
  const isActive = product.status === 'ACTIVE';
  const isArchived =
    product.status === 'ARCHIVED' || product.status === 'SOFT_DELETED';
  const isTrending = product.trendState?.trending || false;
  const isLoading = actionLoadingId === product.id;
  const imageUrl = product.images?.mainImageUrl;

  return (
    <>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name.value}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff size={14} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {product.name.value}
            </p>
            <p className="text-xs text-muted-foreground">
              {product.unitValue} {product.unitType}
            </p>
          </div>
        </div>
      </td>
      <td className="max-w-[140px] truncate px-4 py-3 align-middle text-muted-foreground">
        {product.categoryName || product.categoryId}
      </td>
      <td className="px-4 py-3 align-middle">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${getStatusBadgeClass(product.status)}`}
        >
          {product.status.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        <IconActionButton
          icon={
            <TrendingUp size={14} fill={isTrending ? 'currentColor' : 'none'} />
          }
          label={
            !isActive
              ? 'Trending is only available for active products'
              : isTrending
                ? 'Remove from trending'
                : 'Mark as trending'
          }
          onClick={() => onTrendingToggle(product)}
          disabled={!isActive}
          loading={isLoading}
          variant={isTrending ? 'deactivate' : 'default'}
          className={
            isTrending
              ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
              : undefined
          }
        />
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <div className="flex flex-col items-end">
          <span className="font-semibold text-foreground">
            ₹{product.price.originalPrice}
          </span>
          {product.price.discountPrice != null &&
            product.price.discountPrice > 0 && (
              <span className="text-[11px] text-muted-foreground">
                −₹{product.price.discountPrice}
              </span>
            )}
        </div>
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center justify-end gap-1">
          {showEdit && (
            <IconActionButton
              icon={<Pencil size={14} />}
              label="Edit"
              onClick={() => onEdit?.(product)}
              disabled={isLoading}
              variant="edit"
            />
          )}

          {isArchived ? (
            <IconActionButton
              icon={<RotateCcw size={14} />}
              label="Restore product"
              onClick={() => onRestore?.(product)}
              disabled={isLoading}
              loading={isLoading}
              variant="activate"
            />
          ) : isActive ? (
            <IconActionButton
              icon={<PowerOff size={14} />}
              label="Deactivate"
              onClick={() => onDeactivate?.(product)}
              disabled={isLoading}
              loading={isLoading}
              variant="deactivate"
            />
          ) : (
            <IconActionButton
              icon={<Power size={14} />}
              label="Activate"
              onClick={() => onActivate?.(product)}
              disabled={isLoading}
              loading={isLoading}
              variant="activate"
            />
          )}

          <IconActionButton
            icon={<Trash2 size={14} />}
            label="Delete"
            onClick={() => onDelete(product)}
            disabled={isLoading}
            variant="delete"
          />
        </div>
      </td>
    </>
  );
}

export default function ProductsTable({
  products,
  loading,
  error,
  page,
  totalPages,
  total,
  search,
  categoryId,
  status,
  activeCategories,
  categoriesLoading,
  categoriesError,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onPageChange,
  onRefresh,
  onCreateClick,
}: Props) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const deleteConfirm = useSmartDelete<Product>({
    deleteFn: (product, options) =>
      ProductsApi.delete(product.id, { force: options?.force }),
    successMessage: 'Product removed successfully.',
    errorMessage: 'Failed to delete product.',
    getItemLabel: (product) => product.name.value,
    onSuccess: () => {
      if (products.length === 1 && page > 1) {
        onPageChange(page - 1);
      } else {
        onRefresh();
      }
    },
  });

  const categoryFilterOptions = useMemo(
    () => [
      { value: '', label: 'All Categories' },
      ...activeCategories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    ],
    [activeCategories],
  );

  const { activeItems, inactiveItems, archivedItems } = useMemo(() => {
    const active = products.filter(
      (item) => item.status === 'ACTIVE' || item.status === 'OUT_OF_STOCK',
    );
    const inactive = products.filter((item) => item.status === 'INACTIVE');
    const archived = products.filter(
      (item) =>
        item.status === 'ARCHIVED' || item.status === 'SOFT_DELETED',
    );

    return {
      activeItems: active,
      inactiveItems: inactive,
      archivedItems: archived,
    };
  }, [products]);

  const handleStatusChange = async (
    product: Product,
    nextStatus: ProductStatus,
  ) => {
    setActionLoadingId(product.id);

    try {
      await ProductsApi.updateStatus(product.id, nextStatus);
      toast.success(
        nextStatus === 'ACTIVE'
          ? 'Product activated successfully.'
          : 'Product deactivated successfully.',
      );
      onRefresh();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        axiosError?.response?.data?.message ||
          'Failed to update product status.',
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (product: Product) => {
    setActionLoadingId(product.id);

    try {
      await ProductsApi.restore(product.id);
      toast.success('Product restored successfully.');
      onRefresh();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        axiosError?.response?.data?.message ||
          'Failed to restore product.',
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTrendingToggle = async (product: Product) => {
    if (product.status !== 'ACTIVE') {
      return;
    }

    const turnOn = !product.trendState?.trending;
    setActionLoadingId(product.id);

    try {
      await ProductsApi.markTrending(product.id, turnOn);
      toast.success(
        turnOn
          ? 'Product marked as trending.'
          : 'Product removed from trending.',
      );
      onRefresh();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        axiosError?.response?.data?.message ||
          'Failed to update trending status.',
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    await deleteConfirm.confirm();
  };

  const showInitialDeleteDialog =
    !!deleteConfirm.target &&
    !deleteConfirm.forceAnalysis &&
    !deleteConfirm.blockedAnalysis;

  if (loading) {
    return <ProductsTableSkeleton />;
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
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, slug, category, or tags"
          className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Select
            value={categoryId}
            onChange={onCategoryChange}
            options={categoryFilterOptions}
            placeholder="All Categories"
            searchable
            disabled={categoriesLoading}
            className="w-48"
            aria-label="Filter by category"
          />

          <Select
            value={status}
            onChange={(value) => onStatusChange(value as ProductStatus | '')}
            options={STATUS_FILTER_OPTIONS}
            placeholder="All Status"
            className="w-36"
            aria-label="Filter by status"
          />

          <span className="hidden whitespace-nowrap text-sm text-muted-foreground lg:inline">
            {total} product{total === 1 ? '' : 's'}
          </span>

          <button
            type="button"
            onClick={onCreateClick}
            className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
          >
            <div className="flex items-center justify-center rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-90">
              <Plus size={14} strokeWidth={3} />
            </div>
            Create Product
          </button>
        </div>
      </div>

      {categoriesError && (
        <p className="-mt-2 mb-4 text-xs text-destructive">{categoriesError}</p>
      )}

      <p className="-mt-2 mb-4 text-sm text-muted-foreground lg:hidden">
        {total} product{total === 1 ? '' : 's'}
      </p>

      {products.length === 0 ? (
        <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-border bg-card text-center shadow-sm">
          <div className="mb-3 rounded-full bg-muted p-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">No products found.</h3>
          <p className="text-sm text-muted-foreground">
            Create your first product.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Product
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Trending
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeItems.map((product) => (
                  <tr key={product.id} className="group bg-background">
                    <ProductCells
                      product={product}
                      onEdit={setEditingProduct}
                      onDeactivate={(target) =>
                        handleStatusChange(target, 'INACTIVE')
                      }
                      onDelete={deleteConfirm.open}
                      onTrendingToggle={handleTrendingToggle}
                      showEdit
                      actionLoadingId={actionLoadingId}
                    />
                  </tr>
                ))}

                {inactiveItems.map((product) => (
                  <tr key={product.id} className="group bg-muted/20">
                    <ProductCells
                      product={product}
                      onActivate={(target) =>
                        handleStatusChange(target, 'ACTIVE')
                      }
                      onDelete={deleteConfirm.open}
                      onTrendingToggle={handleTrendingToggle}
                      actionLoadingId={actionLoadingId}
                    />
                  </tr>
                ))}

                {archivedItems.map((product) => (
                  <tr key={product.id} className="group bg-slate-50/80">
                    <ProductCells
                      product={product}
                      onRestore={handleRestore}
                      onDelete={deleteConfirm.open}
                      onTrendingToggle={handleTrendingToggle}
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

      <EditProductModal
        product={editingProduct}
        activeCategories={activeCategories}
        onClose={() => setEditingProduct(null)}
        onSuccess={onRefresh}
      />

      <SmartDeleteDialogs
        entityName="Product"
        itemLabel={deleteConfirm.itemLabel}
        showInitial={showInitialDeleteDialog}
        initialDescription="Products with order history will be archived instead of deleted. Products without references are permanently removed along with their images."
        forceAnalysis={deleteConfirm.forceAnalysis}
        blockedAnalysis={deleteConfirm.blockedAnalysis}
        blockedMessage={deleteConfirm.blockedMessage}
        loading={deleteConfirm.loading}
        onCancel={deleteConfirm.close}
        onConfirm={handleDelete}
        onConfirmForce={() => void deleteConfirm.confirmForce()}
        onCloseBlocked={deleteConfirm.closeBlocked}
        onCloseForce={deleteConfirm.closeForce}
      />
    </>
  );
}
